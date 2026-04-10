// Pure ballistic math — no imports of network / game-state / player / lobby.
// Every function takes the world it operates on as arguments so it's trivially
// testable with fake arrays. The hot loop in combat.js calls these in order:
//   1. integrateProjectile — advances pr and returns the prev position
//   2. segVsWalls           — earliest wall hit along the tick segment
//   3. segVsBarricades      — earliest barricade hit, bounded by existing blockT
//   4. findPlayerHit        — closest player hit, rejected past blockT
// All four are allocation-free in the hot path (no array/object literals per call
// beyond the single return object, which V8 elides under inlining).

// BARRICADE_HEIGHT and PLAYER_WALL_INFLATE live in shared/constants.js so the
// client-side prediction loop (CSP) can import the same values.
const { BARRICADE_HEIGHT, PLAYER_WALL_INFLATE } = require('../shared/constants');
// pushOutOfWalls was lifted to shared/collision.js so the client
// prediction loop can call the exact same implementation. Re-exported below
// so existing callers (blastKnockback, game.js, etc.) keep working without
// a find-replace.
const { pushOutOfWalls } = require('../shared/collision');

// Shared constants — kept here so the file is self-contained. Exposed via module
// exports so combat.js / bots.js can reuse the same values instead of hardcoding them.
const PROJECTILE_RADIUS = 5;    // AABB inflate amount for wall collisions (halved)
const WALL_MIN_SIZE = 20;       // walls thinner than this still collide at 20 units wide
const PLAYER_BODY_RADIUS = 14;  // capsule body radius
const PLAYER_HEAD_RADIUS = 10;  // capsule head radius
const PLAYER_HEAD_SPAN = 20;    // head extends HEAD_SPAN above the head base
// Shield bubble — egg-shaped ellipsoid mirroring the visual in
// client/entities.js (sphere r=24 scaled (0.95, 1.55, 0.95) with the
// 1.55 on the vertical axis, centered at +26 above the ground). Used
// as a SECOND hitbox for armored players: bullets that miss the body
// capsule but clip the bubble damage the shield without reaching the
// player's hunger.
const SHIELD_RADIUS_HORIZ = 24 * 0.95;
const SHIELD_RADIUS_VERT  = 24 * 1.55;
const SHIELD_OFFSET_Z     = 26;
const BULLET_GRAVITY = 50;      // tiny drop for bullets
const EXPLOSIVE_GRAVITY = 400;  // full gravity for cowtank rockets
const DEFAULT_BLAST_RADIUS = 120;

// Advance a projectile one tick and return the previous position.
// On the first tick the projectile uses the shooter origin as prev so walls/
// barricades right in front of the muzzle still block it.
function integrateProjectile(pr, dt) {
  let prevX, prevY, prevZ;
  if (pr._firstTick) {
    prevX = pr._firstTick[0]; prevY = pr._firstTick[1]; prevZ = pr._firstTick[2];
    delete pr._firstTick;
  } else {
    prevX = pr.x; prevY = pr.y; prevZ = pr.z;
  }
  pr.x += pr.vx * dt;
  pr.y += pr.vy * dt;
  pr.z += pr.vz * dt;
  pr.life -= dt;
  // Cowtank has full gravity; bullets have a tiny drop so they don't fly forever flat.
  if (pr.explosive) pr.vz -= EXPLOSIVE_GRAVITY * dt;
  else pr.vz -= BULLET_GRAVITY * dt;
  return { prevX, prevY, prevZ };
}

// Earliest wall hit along segment (prev → cur) as a parametric t in [0,1].
// Liang-Barsky slab test against axis-aligned wall AABBs (expanded by 10 for
// projectile half-thickness). Walls have finite height (WALL_HEIGHT above
// terrain) so we also do a vertical-plane check at the hit point.
// Returns { blockT, hitWall } where blockT is >1 when nothing is hit.
function segVsWalls(prevX, prevY, prevZ, curX, curY, curZ, walls, getTerrainHeight, wallHeight) {
  let blockT = 1.01;
  let hitWall = null;
  const segDx = curX - prevX, segDy = curY - prevY;
  for (const w of walls) {
    // Cache the effective width/height on the wall the first time we see it.
    // Walls are static after placement so this is a one-time cost per wall per round.
    if (w._collW === undefined) {
      w._collW = Math.max(w.w, WALL_MIN_SIZE);
      w._collH = Math.max(w.h, WALL_MIN_SIZE);
    }
    const wx1 = w.x - PROJECTILE_RADIUS, wy1 = w.y - PROJECTILE_RADIUS;
    const wx2 = w.x + w._collW + PROJECTILE_RADIUS, wy2 = w.y + w._collH + PROJECTILE_RADIUS;
    let tmin = 0, tmax = 1;
    if (segDx !== 0) {
      const tx1 = (wx1 - prevX) / segDx;
      const tx2 = (wx2 - prevX) / segDx;
      const lo = tx1 < tx2 ? tx1 : tx2;
      const hi = tx1 < tx2 ? tx2 : tx1;
      if (lo > tmin) tmin = lo;
      if (hi < tmax) tmax = hi;
    } else if (prevX < wx1 || prevX > wx2) continue;
    if (segDy !== 0) {
      const ty1 = (wy1 - prevY) / segDy;
      const ty2 = (wy2 - prevY) / segDy;
      const lo = ty1 < ty2 ? ty1 : ty2;
      const hi = ty1 < ty2 ? ty2 : ty1;
      if (lo > tmin) tmin = lo;
      if (hi < tmax) tmax = hi;
    } else if (prevY < wy1 || prevY > wy2) continue;
    if (tmin <= tmax && tmin < blockT) {
      // Vertical check — walls have wallHeight above terrain at the hit point
      const midX = prevX + segDx * tmin, midY = prevY + segDy * tmin;
      const wallTopZ = getTerrainHeight(midX, midY) + wallHeight;
      const hitZ = prevZ + (curZ - prevZ) * tmin;
      if (hitZ < wallTopZ) { blockT = tmin; hitWall = w; }
    }
  }
  return { blockT, hitWall };
}

// Earliest barricade hit along segment, bounded by an existing blockT (so walls
// already nearer win). OBB slab test done in barricade-local frame using cached
// _cosA / _sinA and _terrainH. Returns { blockT, hitBarricade }.
function segVsBarricades(prevX, prevY, prevZ, curX, curY, curZ, barricades, startBlockT) {
  let blockT = startBlockT;
  let hitBarricade = null;
  for (const b of barricades) {
    const dx0 = prevX - b.cx, dy0 = prevY - b.cy;
    const dx1 = curX - b.cx, dy1 = curY - b.cy;
    const lx0 = b._cosA * dx0 + b._sinA * dy0;
    const ly0 = -b._sinA * dx0 + b._cosA * dy0;
    const lx1 = b._cosA * dx1 + b._sinA * dy1;
    const ly1 = -b._sinA * dx1 + b._cosA * dy1;
    const ldx = lx1 - lx0, ldy = ly1 - ly0;
    const halfThin = b.h / 2, halfWide = b.w / 2;
    let tmin = 0, tmax = 1;
    if (ldx !== 0) {
      const tx1 = (-halfThin - lx0) / ldx;
      const tx2 = (halfThin - lx0) / ldx;
      const lo = tx1 < tx2 ? tx1 : tx2;
      const hi = tx1 < tx2 ? tx2 : tx1;
      if (lo > tmin) tmin = lo;
      if (hi < tmax) tmax = hi;
    } else if (Math.abs(lx0) > halfThin) continue;
    if (ldy !== 0) {
      const ty1 = (-halfWide - ly0) / ldy;
      const ty2 = (halfWide - ly0) / ldy;
      const lo = ty1 < ty2 ? ty1 : ty2;
      const hi = ty1 < ty2 ? ty2 : ty1;
      if (lo > tmin) tmin = lo;
      if (hi < tmax) tmax = hi;
    } else if (Math.abs(ly0) > halfWide) continue;
    if (tmin <= tmax && tmin < blockT) {
      // Vertical check against barricade top (cached terrain + BARRICADE_HEIGHT)
      const hitZ = prevZ + (curZ - prevZ) * tmin;
      if (hitZ <= b._terrainH + BARRICADE_HEIGHT) { blockT = tmin; hitBarricade = b; }
    }
  }
  return { blockT, hitBarricade };
}

// Closest player hit along the tick segment, or null. Uses a two-cylinder capsule
// hitbox per player (body r=18 + head r=12 on top). Hits at t >= blockT are
// rejected because the projectile was already stopped by a wall/barricade.
// This function sets p._wasHeadshot on the returned player as a side-effect
// (free with current code; caller immediately consumes it).
function findPlayerHit(prevX, prevY, prevZ, curX, curY, curZ, players, ownerId, blockT, eyeHeightFn) {
  const dx = curX - prevX, dy = curY - prevY, dz = curZ - prevZ;
  let hitPlayer = null;
  let hitT = Infinity;
  for (const [, p] of players) {
    if (!p.alive || p.id === ownerId || p.spawnProtection > 0) continue;
    p._shieldOnly = false; // reset per-player so stale state doesn't leak
    const eh = eyeHeightFn(p);
    const headBase = p.z + eh * 0.75;
    // Tiny-cow perk shrinks the visual mesh by sizeMult; shrink the
    // hit cylinders + head span the same way so the hitbox tracks the
    // model. eyeHeightFn already includes sizeMult.
    const sm = (p.perks && p.perks.sizeMult) || 1;
    const headSpan = PLAYER_HEAD_SPAN * sm;
    let bodyHit = false;
    // Body cylinder first, then head
    for (let hbIdx = 0; hbIdx < 2; hbIdx++) {
      const r = (hbIdx === 0 ? PLAYER_BODY_RADIUS : PLAYER_HEAD_RADIUS) * sm;
      const zMin = hbIdx === 0 ? p.z - 3 : headBase;
      const zMax = hbIdx === 0 ? headBase : headBase + headSpan;
      const head = hbIdx === 1;
      const ox = prevX - p.x, oy = prevY - p.y;
      const a = dx * dx + dy * dy;
      const bq = 2 * (ox * dx + oy * dy);
      const c = ox * ox + oy * oy - r * r;
      const disc = bq * bq - 4 * a * c;
      if (disc < 0) continue;
      const sqrtDisc = Math.sqrt(disc);
      for (let sign = -1; sign <= 1; sign += 2) {
        const t = (-bq + sign * sqrtDisc) / (2 * a);
        if (t < 0 || t > 1) continue;
        if (t >= blockT) continue;
        const iz = prevZ + dz * t;
        if (iz >= zMin && iz <= zMax && t < hitT) {
          hitT = t;
          hitPlayer = p;
          p._wasHeadshot = head;
          bodyHit = true;
        }
      }
    }
    // Shield bubble — only tested for armored players, only matters if
    // the body wasn't already hit (a body hit naturally absorbs through
    // armor in combat.js). Solves the case where a bullet clips the
    // visual bubble but misses the cow's tighter body capsule. Scales
    // with sizeMult so tiny cows have a tiny shield.
    if (!bodyHit && (p.armor || 0) > 0) {
      const cz = p.z + SHIELD_OFFSET_Z * sm;
      const sxz = SHIELD_RADIUS_HORIZ * sm;
      const sy = SHIELD_RADIUS_VERT * sm;
      const ox = (prevX - p.x) / sxz;
      const oy = (prevY - p.y) / sxz;
      const oz = (prevZ - cz)  / sy;
      const mx = dx / sxz;
      const my = dy / sxz;
      const mz = dz / sy;
      const A = mx*mx + my*my + mz*mz;
      const B = 2 * (ox*mx + oy*my + oz*mz);
      const C = ox*ox + oy*oy + oz*oz - 1;
      const disc = B*B - 4*A*C;
      if (disc >= 0 && A > 0) {
        const sqrtDisc = Math.sqrt(disc);
        // Earliest valid t (entry) within [0, 1) and earlier than any prior hit.
        const t1 = (-B - sqrtDisc) / (2 * A);
        const t2 = (-B + sqrtDisc) / (2 * A);
        let t = -1;
        if (t1 >= 0 && t1 < 1 && t1 < blockT) t = t1;
        else if (t2 >= 0 && t2 < 1 && t2 < blockT) t = t2;
        if (t >= 0 && t < hitT) {
          hitT = t;
          hitPlayer = p;
          p._wasHeadshot = false;
          p._shieldOnly = true;
        }
      }
    }
  }
  return hitPlayer;
}

// Select victims of an explosion without mutating them. Caller applies damage
// and broadcasts. Returns three arrays:
//   victims    — players inside blastRadius (excluding shooter and excludeId)
//   barricades — indices of barricades to destroy (iterate array descending)
//   walls      — indices of walls to damage (caller decrements hp)
// Knockback is handled by blastKnockback below because it mutates player.x/y/vz
// and still depends on walls for escape-push, keeping it here preserves the
// original semantics with zero behaviour change.
function computeBlastVictims(pr, players, walls, barricades, excludeId, eyeHeightFn) {
  const blastRadius = pr.blastRadius || DEFAULT_BLAST_RADIUS;
  const blastRadiusSq = blastRadius * blastRadius;
  const victimIdxs = [];
  for (let i = barricades.length - 1; i >= 0; i--) {
    const b = barricades[i];
    const bdx = b.cx - pr.x, bdy = b.cy - pr.y;
    if (bdx * bdx + bdy * bdy < blastRadiusSq) victimIdxs.push(i);
  }
  const wallIdxs = [];
  for (let i = walls.length - 1; i >= 0; i--) {
    const w = walls[i];
    const wcx = w.x + w.w / 2, wcy = w.y + w.h / 2;
    const wdx = wcx - pr.x, wdy = wcy - pr.y;
    // Walls are bigger than points so the check includes half the wall's larger axis
    const thresh = blastRadius + (w.w > w.h ? w.w : w.h) / 2;
    if (wdx * wdx + wdy * wdy < thresh * thresh) wallIdxs.push(i);
  }
  const playerVictims = [];
  for (const [, t] of players) {
    if (!t.alive || t.id === pr.ownerId || t.id === excludeId) continue;
    const pdx = t.x - pr.x, pdy = t.y - pr.y, pdz = (t.z + eyeHeightFn(t) / 2) - pr.z;
    const distSq = pdx * pdx + pdy * pdy + pdz * pdz;
    if (distSq < blastRadiusSq) {
      const bdist = Math.sqrt(distSq); // only sqrt once, for the falloff value
      playerVictims.push({ player: t, falloff: 1 - bdist / blastRadius });
    }
  }
  return { blastRadius, barricadeIdxs: victimIdxs, wallIdxs, playerVictims };
}

// Apply blast knockback to every live player (including the shooter). Mutates
// player.x/y/vz and pushes out of walls. No broadcasts — caller emits the
// 'explosion' message. Kept here so combat.js stays clean of physics details.
function blastKnockback(pr, players, walls, blastRadius, eyeHeightFn) {
  const blastRadiusSq = blastRadius * blastRadius;
  for (const [, t] of players) {
    if (!t.alive) continue;
    const dx = t.x - pr.x, dy = t.y - pr.y, dz = (t.z + eyeHeightFn(t) / 2) - pr.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq < blastRadiusSq && distSq > 1) {
      const bdist = Math.sqrt(distSq);
      const falloff = 1 - bdist / blastRadius;
      const pushForce = 300 * falloff;
      const nx = dx / bdist, ny = dy / bdist, nz = dz / bdist;
      t.x += nx * pushForce; t.y += ny * pushForce;
      t.vz = (t.vz || 0) + nz * pushForce + 80 * falloff;
      // Push out of any wall we knocked them into
      pushOutOfWalls(t, walls);
    }
  }
}

module.exports = {
  integrateProjectile,
  segVsWalls,
  segVsBarricades,
  findPlayerHit,
  computeBlastVictims,
  blastKnockback,
  pushOutOfWalls,
};
