// Pure player movement integrator. Extracted from server/game.js::gameTick
// so the client-side prediction loop can call the exact same function on
// the exact same inputs and produce bit-identical outputs — which is the
// load-bearing invariant for CSP reconciliation. See client/prediction.js
// for the full netcode-strategy reference; this file's only job is to
// behave identically when called from either side.
//
// Responsibilities:
//   - stun timer decrement
//   - spawn-protection early return (caller handles the skip)
//   - movement delta (speed/walk/mud/size/perk applied to p.dx/p.dy input)
//   - direction cardinal update
//   - bot aim auto-orient
//   - wall collision push-out (via ballistics.pushOutOfWalls, z-gated)
//   - barricade OBB push-out (inline — uses cached _cosA/_sinA/_terrainH)
//   - height physics (vz, gravity, ground clamp)
//   - portal teleportation + cooldown
//   - zone clamp
//
// NOT included (stays in gameTick, server-only):
//   - hunger ticks (zone damage, heal ponds, drain)
//   - cooldown ticks (dashCooldown, attackCooldown, pickupCooldown)
//   - eat timer + food collision
//   - level-up / XP
//
// The caller owns everything in `world` and `terrain`. The server passes
// real gameState collections; the client (in Phase 4) will pass its
// mirrored local copies. Both sides must agree on the contents.
//
// All mutations happen in place on `p`. Return value is unused — kept
// void for parity with the pre-extraction inline code.
//
// Spawn protection: stepPlayerMovement decrements `p.spawnProtection` and
// returns early if it was > 0 at call time. The server's gameTick snapshots
// `wasSpawnProtected` BEFORE calling, then skips the rest of its per-player
// work if true — this preserves the exact behavior of the old inline
// `if (p.spawnProtection > 0) { p.spawnProtection -= dt; continue; }` even
// on the edge frame where protection drops to zero mid-call.

const {
  PLAYER_BASE_SPEED, PLAYER_WALK_MULT, MUD_SPEED_MULT, GRAVITY,
  BARRICADE_HEIGHT, PLAYER_WALL_INFLATE,
} = require('./constants');
const { pushOutOfWalls } = require('./collision');

// `world`: { walls, barricades, mudPatches, portals, zone }
// `input`: { dx, dy, walking } — usually just the player's own dx/dy/walking
//          but split out so CSP can pass a specific input frame without
//          mutating the player object first.
// `terrain`: { getGroundHeight, WALL_HEIGHT } — server/terrain and
//          client/terrain both satisfy this shape.
function stepPlayerMovement(p, dt, world, input, terrain) {
  // Caller is expected to check p.alive before calling. stepPlayerMovement
  // itself doesn't skip dead players — that decision depends on caller
  // context (server game loop skips, client prediction might handle death
  // frames differently).

  if (p.stunTimer > 0) p.stunTimer -= dt;

  // Spawn protection — caller handles the skip AFTER reading the return.
  // We signal it by decrementing and returning early. The server's gameTick
  // uses `continue` to skip the rest of the per-player block; callers that
  // do more work after movement should check `p.spawnProtection > 0` before
  // calling stepPlayerMovement or check for the early-return flag.
  if (p.spawnProtection > 0) {
    p.spawnProtection -= dt;
    return;
  }

  // Movement delta.
  const ix = input.dx, iy = input.dy;
  if (Math.abs(ix) + Math.abs(iy) > 0.01 && p.stunTimer <= 0) {
    const len = Math.hypot(ix, iy);
    const nx = ix / len, ny = iy / len;
    const sizeSlowdown = 1 - Math.min(0.3, p.foodEaten * 0.01);
    let mudSlow = 1;
    for (const m of world.mudPatches) {
      if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) { mudSlow = MUD_SPEED_MULT; break; }
    }
    const walkMult = input.walking ? PLAYER_WALK_MULT : 1;
    const speed = PLAYER_BASE_SPEED * sizeSlowdown * p.perks.speedMult * mudSlow * walkMult;
    p.x += nx * speed * dt;
    p.y += ny * speed * dt;
    if (Math.abs(nx) > Math.abs(ny)) p.dir = nx > 0 ? 'east' : 'west';
    else p.dir = ny > 0 ? 'south' : 'north';
    if (p.isBot) p.aimAngle = Math.atan2(-nx, ny);
  }

  // Wall collision — same z-gate as the inline path: a jumping player skims
  // over walls instead of being slammed sideways.
  const WALL_HEIGHT = terrain.WALL_HEIGHT;
  pushOutOfWalls(p, world.walls, (pp, w) =>
    pp.z < terrain.getGroundHeight(w.x + w.w / 2, w.y + w.h / 2) + WALL_HEIGHT
  );

  // Barricade OBB push-out. Inline because the math is tiny and uses the
  // cached _cosA/_sinA/_terrainH the server computes at placement time.
  for (const b of world.barricades) {
    const bTop = b._terrainH + BARRICADE_HEIGHT;
    if (p.z >= bTop) continue;
    const dxB = p.x - b.cx, dyB = p.y - b.cy;
    const lx = b._cosA * dxB + b._sinA * dyB;
    const ly = -b._sinA * dxB + b._cosA * dyB;
    const halfThin = b.h / 2 + PLAYER_WALL_INFLATE;
    const halfWide = b.w / 2 + PLAYER_WALL_INFLATE;
    if (Math.abs(lx) < halfThin && Math.abs(ly) < halfWide) {
      const overThin = halfThin - Math.abs(lx);
      const overWide = halfWide - Math.abs(ly);
      let newLx = lx, newLy = ly;
      if (overThin < overWide) newLx = lx >= 0 ? halfThin : -halfThin;
      else newLy = ly >= 0 ? halfWide : -halfWide;
      p.x = b.cx + b._cosA * newLx - b._sinA * newLy;
      p.y = b.cy + b._sinA * newLx + b._cosA * newLy;
    }
  }

  // Height physics.
  const groundH = terrain.getGroundHeight(p.x, p.y);
  if (p.vz === undefined) { p.z = groundH; p.vz = 0; }
  p.vz -= GRAVITY * dt;
  p.z += p.vz * dt;
  if (p.z <= groundH) { p.z = groundH; p.vz = 0; p.onGround = true; }
  else { p.onGround = false; }

  // Portal teleportation + cooldown.
  if (!p._portalCooldown || p._portalCooldown <= 0) {
    for (const portal of world.portals) {
      if (Math.hypot(p.x - portal.x1, p.y - portal.y1) < 35) {
        p.x = portal.x2; p.y = portal.y2; p._portalCooldown = 2;
        break;
      }
      if (Math.hypot(p.x - portal.x2, p.y - portal.y2) < 35) {
        p.x = portal.x1; p.y = portal.y1; p._portalCooldown = 2;
        break;
      }
    }
  }
  if (p._portalCooldown > 0) p._portalCooldown -= dt;

  // Zone clamp.
  const zone = world.zone;
  p.x = Math.max(zone.x + 20, Math.min(zone.x + zone.w - 20, p.x));
  p.y = Math.max(zone.y + 20, Math.min(zone.y + zone.h - 20, p.y));
}

module.exports = { stepPlayerMovement };
