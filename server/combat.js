const { MAP_W, MAP_H } = require('./config');
const { broadcast, sendTo } = require('./network');
const gameState = require('./game-state');
const { getTerrainHeight, getGroundHeight, WALL_HEIGHT } = require('./terrain');
const ballistics = require('./ballistics');
const weaponFire = require('./weapon-fire');
const { applyHungerDelta, applyArmorDelta, broadcastPlayerSnapshot } = require('./player');
const { MAG_SIZES, EXT_MAG_SIZES, DUAL_WIELD_FAMILY, KNIFE_MELEE_RANGE, KNIFE_MELEE_CONE_COS, KNIFE_MELEE_DAMAGE, KNIFE_MELEE_CD_MS, RESOURCE_TYPES, RESOURCE_CAP, TOOL_CUPBOARD_RADIUS, BUILDING_PIECES } = require('../shared/constants');


const BASE_EYE_HEIGHT = 35;
function eyeHeight(p) {
  const crouchMult = p.walking ? 0.45 : 1;
  return BASE_EYE_HEIGHT * (p.perks ? p.perks.sizeMult : 1) * crouchMult;
}

function handleAttack(player, msg) {
  if (!player || !player.alive || player.attackCooldown > 0.005) return;
  const weapon = player.weapon || 'normal';
  // Knife is melee-only — no projectile fire (would fall through to the
  // pistol stats below since PLAYER_STATS_BASE.knife is undefined).
  if (weapon === 'knife') return;
  if (player.reloading > 0) {
    if (weapon === 'shotgun' && player.ammo > 0) {
      clearTimeout(player.reloadTimer);
      player.reloading = 0;
    } else {
      return;
    }
  }
  const magSize = MAG_SIZES[weapon];
  if (magSize && player.ammo <= 0) {
    sendTo(player.ws, { type: 'emptyMag' });
    player.attackCooldown = 0.3;
    handleReload(player);
    return;
  }
  const { cdMult, dmgMult, hungerDiscount } = weaponFire.extractShooterModifiers(player);
  const dualWield = !!player.dualWield;

  // Resolve stats (applies hungerDiscount to the per-shot cost/gate pairs)
  const stats = weaponFire.resolvePlayerStats(weapon, hungerDiscount);
  if (player.hunger <= stats.hungerGate) return;

  // Normalize aim with cardinal-direction fallback for idle shooters
  let ax = msg.aimX || 0, ay = msg.aimY || 0, az = msg.aimZ || 0;
  const alen3d = Math.hypot(ax, ay, az);
  if (alen3d < 0.1) {
    const dirMap = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] };
    const dd = dirMap[player.dir] || [0,1];
    ax = dd[0]; ay = dd[1]; az = 0;
  } else { ax /= alen3d; ay /= alen3d; az /= alen3d; }

  const fired = weaponFire.fireWeapon(player, weapon, { ax, ay, az }, stats, {
    walkSpreadMult: player.walking ? 0.73 : 1,
    dualWield,
    fireMode: msg.fireMode === 'auto' ? 'auto' : msg.fireMode === 'semi' ? 'semi' : 'burst',
    emitMuzzleFlag: true,
    cdMult,
    dmgMult,
    eyeHeight,
    // Phase 6 lag comp: client sends `displayTick` = S.lastTickNum minus
    // interp delay ticks (= the tick they were actually rendering). Server
    // rewinds entity positions to that tick for the hit check. Clamped to
    // avoid abuse — see updateProjectiles for the bounds logic.
    fireDisplayTick: typeof msg.displayTick === 'number' ? msg.displayTick : null,
  });
  if (!fired) return;

  // Cowtank is single-use — drop back to normal weapon after firing.
  if (weapon === 'cowtank') { weaponFire.resetAfterCowtank(player); return; }

  // Weapon durability: each shot decrements. At 0, weapon breaks → knife.
  if (typeof player.durability === 'number' && !player.isBot) {
    player.durability--;
    if (player.durability <= 0) {
      cancelReload(player);
      player.weapon = 'knife';
      player.ammo = -1;
      player.durability = 0;
      broadcastPlayerSnapshot(player);
    }
  }
}

function applyExplosion(pr, excludeId) {
  const walls = gameState.getWalls();
  const barricades = gameState.getBarricades();
  const players = gameState.getPlayers();
  // Ballistics returns pure selections — we mutate + broadcast in here.
  const sel = ballistics.computeBlastVictims(pr, players, walls, barricades, excludeId, eyeHeight);
  // Destroy barricades caught in the blast (indices are descending-order)
  for (const i of sel.barricadeIdxs) {
    const b = barricades[i];
    broadcast({ type: 'barricadeDestroyed', id: b.id });
    gameState.removeBarricadeAt(i);
  }
  // Damage map walls — each takes `hp` explosions to destroy
  for (const i of sel.wallIdxs) {
    const w = walls[i];
    w.hp = (w.hp || 1) - 1;
    if (w.hp <= 0) {
      broadcast({ type: 'wallDestroyed', id: w.id });
      gameState.removeWallAt(i);
    } else {
      broadcast({ type: 'wallDamaged', id: w.id, hp: w.hp });
    }
  }
  // Damage players in blast
  for (const v of sel.playerVictims) {
    const t = v.player;
    applyArmorDelta(t, -(t.armor || 0));
    const dmg = excludeId ? pr.dmg * 0.6 : 100;
    t.stunTimer = 0.3;
    applyHungerDelta(t, -dmg * v.falloff, pr.ownerId);
  }
  // Knockback mutates players — pure-ish helper keeps the physics with the rest
  ballistics.blastKnockback(pr, players, walls, sel.blastRadius, eyeHeight);
  broadcast({ type: 'explosion', x: pr.x, y: pr.y, radius: sel.blastRadius, blastRadius: sel.blastRadius });
}

// Phase 6 lag comp: reconstruct a Map<id, playerLike> from a history
// snapshot + the live players map so `findPlayerHit` sees rewound
// positions for the tick the client was rendering at fire time.
// Position, sizeMult, stunTimer, and spawn protection come from the
// snapshot (they may have changed since fire time). Every other field
// that post-hit code reads — perks.damageReduction, armor, ws — is
// pulled from the LIVE player so damage, shieldHit broadcast, and
// milksteal heal all apply to the current entity.
//
// sizeMult gets its own override on a shallow-cloned perks object
// because findPlayerHit reads `p.perks.sizeMult` to size the capsule.
// Without the override we'd be checking live-size hitboxes against
// rewound positions — exactly the desync lag comp is meant to prevent.
function _buildRewoundPlayers(snapshot, livePlayers) {
  const out = new Map();
  for (const entry of snapshot.positions) {
    const live = livePlayers.get(entry.id);
    if (!live || !live.alive) continue; // dead-between path: no hit
    const rewoundPerks = Object.assign({}, live.perks, { sizeMult: entry.sizeMult });
    out.set(entry.id, {
      id: entry.id,
      x: entry.x, y: entry.y, z: entry.z,
      alive: true,
      stunTimer: entry.stunTimer,
      spawnProtection: entry.spawnProtection,
      armor: entry.armor || 0,  // shield ellipsoid hit test reads this
      perks: rewoundPerks,
      _rewound: true,    // diagnostic flag
    });
  }
  return out;
}

function updateProjectiles(dt) {
  const projectiles = gameState.getProjectiles();
  const walls = gameState.getWalls();
  const barricades = gameState.getBarricades();
  const players = gameState.getPlayers();
  const HISTORY_TICKS = gameState.HISTORY_TICKS;
  const currentTickNum = gameState.getTickNum();
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const pr = projectiles[i];
    // Advance the "age in ticks" counter before anything else so the
    // rewind lookup computes (fireDisplayTick + ticksAlive) for the
    // snapshot that matches this frame of the projectile's flight.
    pr.ticksAlive = (pr.ticksAlive || 0) + 1;
    // Step 1: integrate motion + gravity, capture prev position
    const { prevX, prevY, prevZ } = ballistics.integrateProjectile(pr, dt);
    // Step 2: analytical pre-scan for walls/barricades along this tick's segment.
    // Skip the scan entirely for near-stationary ticks — matches original behaviour.
    const segDx = pr.x - prevX, segDy = pr.y - prevY;
    const segDist = Math.hypot(segDx, segDy);
    let blockT = 1.01;
    let hitWallObj = null;
    let hitBarricade = null;
    if (segDist > 0.5) {
      if (!pr.wallPiercing) {
        const wres = ballistics.segVsWalls(prevX, prevY, prevZ, pr.x, pr.y, pr.z, walls, getTerrainHeight, WALL_HEIGHT);
        blockT = wres.blockT;
        hitWallObj = wres.hitWall;
      }
      const bres = ballistics.segVsBarricades(prevX, prevY, prevZ, pr.x, pr.y, pr.z, barricades, blockT);
      if (bres.hitBarricade) {
        blockT = bres.blockT;
        hitBarricade = bres.hitBarricade;
        hitWallObj = null; // barricade is nearer than any wall we found
      }
    }
    // Step 3: closest player hit within blockT (sets p._wasHeadshot).
    // Phase 6 lag comp: if the client sent fireDisplayTick at spawn, look
    // up the historical snapshot at (fireDisplayTick + ticksAlive) and
    // run the hit check against THOSE positions. Clamped to avoid clients
    // forging ancient or future-tick values for abuse.
    let playersForHit = players;
    if (typeof pr.fireDisplayTick === 'number') {
      const targetTick = pr.fireDisplayTick + pr.ticksAlive;
      const minTick = Math.max(0, currentTickNum - HISTORY_TICKS);
      const clampedTick = Math.max(minTick, Math.min(currentTickNum, targetTick));
      const snap = gameState.getHistorySnapshot(clampedTick);
      if (snap) playersForHit = _buildRewoundPlayers(snap, players);
    }
    const hitPlayer = ballistics.findPlayerHit(prevX, prevY, prevZ, pr.x, pr.y, pr.z, playersForHit, pr.ownerId, blockT, eyeHeight);
    if (hitPlayer) {
      // findPlayerHit may return a rewound "lite" player from the lag-comp
      // snapshot. Mutations (damage, armor, volley hit tracking, stun) must
      // apply to the LIVE player, not the rewound copy — otherwise damage
      // would vanish when the lite object goes out of scope. Preserve
      // `_wasHeadshot` and `_shieldOnly` since they were set on whichever
      // object went through findPlayerHit (rewound or live).
      const headshot = !!hitPlayer._wasHeadshot;
      const shieldOnly = !!hitPlayer._shieldOnly;
      const p = hitPlayer._rewound ? players.get(hitPlayer.id) : hitPlayer;
      if (!p || !p.alive) { gameState.removeProjectileAt(i); continue; }
        let dmg = pr.dmg;
        if (headshot) dmg *= (pr.volleyId ? 1.2 : 1.8);
        if (pr.volleyId) {
          if (!p._volleyHits) p._volleyHits = {};
          p._volleyHits[pr.volleyId] = (p._volleyHits[pr.volleyId] || 0) + 1;
          const hits = p._volleyHits[pr.volleyId];
          dmg = pr.dmg * (1 + (hits - 1) * 0.5);
        }
        let armor = 1;
        if (p.perks && p.perks.damageReduction) armor *= (1 - p.perks.damageReduction);
        let actualDmg = dmg * armor;
        if (shieldOnly) {
          // Bullet clipped the egg-shaped shield bubble but missed the
          // body capsule. Damage stays on the shield, no hunger hit, no
          // stun, no overflow. Shield breaks at zero like normal.
          const absorbed = Math.min(p.armor, actualDmg);
          applyArmorDelta(p, -absorbed);
          broadcast({ type: 'shieldHit', playerId: p.id, x: p.x, y: p.y });
          broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: p.id, ownerId: pr.ownerId, dmg: Math.round(absorbed), headshot: false });
          gameState.removeProjectileAt(i); continue;
        }
        if (pr.explosive && p.armor > 0) {
          // Explosive fully strips the shield; helper emits the break visual.
          applyArmorDelta(p, -(p.armor || 0));
        } else if (p.armor > 0) {
          // Regular absorption: armor soaks actualDmg up to its current value;
          // overflow bleeds to hunger. shieldHit visual stays inline (helper
          // only owns the shieldBreak crossing).
          const absorbed = Math.min(p.armor, actualDmg);
          actualDmg -= absorbed;
          applyArmorDelta(p, -absorbed);
          broadcast({ type: 'shieldHit', playerId: p.id, x: p.x, y: p.y });
        }
        // Slowdown is client-authoritative: server doesn't enforce it.
        // The client receives projectileHit, starts a local slowdown
        // timer, and includes the resulting input.speedMult in every
        // subsequent move message. Server's move queue forwards that
        // mult to stepPlayerMovement so both sides simulate the same
        // speed. No stunTimer on hit, no pendingStun, no rubberband.
        applyHungerDelta(p, -actualDmg, pr.ownerId);
        if (pr.explosive) applyExplosion(pr, p.id);
        // Milksteal: heal owner 1% on hit
        const owner = gameState.getPlayer(pr.ownerId);
        if (owner && owner.milksteal && owner.alive) {
          applyHungerDelta(owner, 0.5);
        }
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: p.id, ownerId: pr.ownerId, dmg: Math.round(dmg), headshot });
        gameState.removeProjectileAt(i); continue;
    }
    // Terrain collision
    if (pr.z < getTerrainHeight(pr.x, pr.y)) {
      if (pr.explosive) applyExplosion(pr, null);
      // Bisect along the prev→cur segment to find where the bullet path
      // actually crossed the curved terrain surface; pr.x/pr.y is the
      // over-shoot position one tick past the crossing.
      let lo = 0, hi = 1;
      for (let iter = 0; iter < 6; iter++) {
        const tMid = (lo + hi) / 2;
        const xMid = prevX + segDx * tMid;
        const yMid = prevY + segDy * tMid;
        const zMid = prevZ + (pr.z - prevZ) * tMid;
        if (zMid > getTerrainHeight(xMid, yMid)) lo = tMid;
        else hi = tMid;
      }
      const tImpact = (lo + hi) / 2;
      const groundX = prevX + segDx * tImpact;
      const groundY = prevY + segDy * tImpact;
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: groundX, y: groundY, z: getTerrainHeight(groundX, groundY) });
      gameState.removeProjectileAt(i); continue;
    }
    // Bounds / lifetime — silent despawn. The map "edge" isn't a real
    // surface (it's just the X/Y AABB of the playable area), so flagging
    // these as wall hits would litter the boundary with bullet holes
    // floating in mid-air. Send a projectileHit WITHOUT `wall: true` so
    // the client disposes the mesh but doesn't spawn a decal. Explosive
    // projectiles still detonate at the bounds (rocket fired into the
    // sky should still go off when it expires).
    if (pr.life <= 0 || pr.x < 0 || pr.x > MAP_W || pr.y < 0 || pr.y > MAP_H) {
      if (pr.explosive) applyExplosion(pr, null);
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId });
      gameState.removeProjectileAt(i); continue;
    }
    // Use the analytical pre-scan result — no second stepped scan needed
    if (hitWallObj && pr.wallPiercing) {
      let impactX = prevX + segDx * blockT;
      let impactY = prevY + segDy * blockT;
      const impactZ = prevZ + (pr.z - prevZ) * blockT;
      // segVsWalls inflates the AABB by PROJECTILE_RADIUS for collision;
      // clamp back to the un-inflated surface so the decal sits flush.
      const wxR = hitWallObj.x + Math.max(hitWallObj.w, 20);
      const wyB = hitWallObj.y + Math.max(hitWallObj.h, 20);
      impactX = Math.max(hitWallObj.x, Math.min(wxR, impactX));
      impactY = Math.max(hitWallObj.y, Math.min(wyB, impactY));
      broadcast({ type: 'wallImpact', x: impactX, y: impactY, z: impactZ, wallId: hitWallObj.id });
      pr._wallHits = (pr._wallHits || 0) + 1;
      if (pr._wallHits >= 2) {
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: impactX, y: impactY, z: impactZ, wallId: hitWallObj.id });
        gameState.removeProjectileAt(i); continue;
      }
    } else if (hitWallObj || hitBarricade) {
      let impactX = prevX + segDx * blockT;
      let impactY = prevY + segDy * blockT;
      const impactZ = prevZ + (pr.z - prevZ) * blockT;
      if (hitWallObj) {
        // Same un-inflate clamp as the wallpierce path. Barricades use a
        // tight OBB so they don't need clamping.
        const wxR = hitWallObj.x + Math.max(hitWallObj.w, 20);
        const wyB = hitWallObj.y + Math.max(hitWallObj.h, 20);
        impactX = Math.max(hitWallObj.x, Math.min(wxR, impactX));
        impactY = Math.max(hitWallObj.y, Math.min(wyB, impactY));
      }
      if (hitBarricade) {
        const dmgDealt = Math.round(pr.dmg);
        hitBarricade.hp -= dmgDealt;
        broadcast({ type: 'barricadeHit', id: hitBarricade.id, dmg: dmgDealt, x: hitBarricade.cx, y: hitBarricade.cy });
        if (hitBarricade.hp <= 0) {
          gameState.removeBarricade(hitBarricade.id);
          broadcast({ type: 'barricadeDestroyed', id: hitBarricade.id });
        }
      }
      if (pr.explosive) applyExplosion(pr, null);
      const surfaceTag = hitWallObj ? { wallId: hitWallObj.id } : { barricadeId: hitBarricade.id };
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: impactX, y: impactY, z: impactZ, ...surfaceTag });
      gameState.removeProjectileAt(i); continue;
    }
  }
}

function handleDash(player) {
  if (!player || !player.alive || player.dashCooldown > 0) return;
  const len = Math.hypot(player.dx, player.dy);
  if (len > 0.1) {
    const nx = player.dx / len, ny = player.dy / len;
    const dashSteps = 12;
    for (let step = 0; step < dashSteps; step++) {
      player.x += nx * 10; player.y += ny * 10;
      let blocked = false;
      for (const w of gameState.getWalls()) {
        if (player.x > w.x - 15 && player.x < w.x + w.w + 15 && player.y > w.y - 15 && player.y < w.y + w.h + 15) {
          blocked = true; break;
        }
      }
      if (!blocked) {
        for (const b of gameState.getBarricades()) {
          const dxB = player.x - b.cx, dyB = player.y - b.cy;
          const cosA = b._cosA, sinA = b._sinA;
          const lx = cosA * dxB + sinA * dyB;
          const ly = -sinA * dxB + cosA * dyB;
          if (Math.abs(lx) < b.h / 2 + 15 && Math.abs(ly) < b.w / 2 + 15) { blocked = true; break; }
        }
      }
      if (blocked) { player.x -= nx * 10; player.y -= ny * 10; break; }
    }
    const zone = gameState.getZone();
    player.x = Math.max(zone.x + 20, Math.min(zone.x + zone.w - 20, player.x));
    player.y = Math.max(zone.y + 20, Math.min(zone.y + zone.h - 20, player.y));
    player.z = getGroundHeight(player.x, player.y);
    player.vz = 0;
    player.dashCooldown = 3 * (player.dashCdMult || 1);
    broadcast({ type: 'dash', playerId: player.id });
  }
}

function getMaxAmmo(player, weapon) {
  const base = MAG_SIZES[weapon];
  if (!base) return 0;
  const extBase = player._hasExtMag ? (EXT_MAG_SIZES[weapon] || base) : base;
  const dualMult = (player.dualWield && DUAL_WIELD_FAMILY.has(weapon)) ? 2 : 1;
  return extBase * dualMult;
}

function handleReload(player) {
  if (!player || !player.alive || player.reloading > 0) return;
  const weapon = player.weapon || 'normal';
  const maxAmmo = getMaxAmmo(player, weapon);
  if (!maxAmmo || player.ammo >= maxAmmo) return;
  player.reloading = 1;

  const dualMult = player.dualWield ? 2 : 1;
  if (weapon === 'shotgun') {
    // Shell by shell reload — benelli keeps the same per-shell speed when dual-wielding
    const shellMs = 750;
    const loadShell = () => {
      if (!player.alive || player.weapon !== 'shotgun' || player.ammo >= getMaxAmmo(player, 'shotgun')) {
        player.reloading = 0;
        sendTo(player.ws, { type: 'reloaded', playerId: player.id, weapon: 'shotgun' });
        return;
      }
      player.ammo++;
      sendTo(player.ws, { type: 'shellLoaded', playerId: player.id, ammo: player.ammo });
      if (player.ammo < getMaxAmmo(player, 'shotgun')) {
        player.reloadTimer = gameState.scheduleRoundTimer(loadShell, shellMs);
      } else {
        player.reloading = 0;
        sendTo(player.ws, { type: 'reloaded', playerId: player.id, weapon: 'shotgun' });
      }
    };
    player.reloadTimer = gameState.scheduleRoundTimer(loadShell, shellMs);
  } else {
    // Full mag reload for other weapons — 2x time when dual-wielding
    const reloadTime = (weapon === 'bolty' ? 2500 : 2000) * dualMult;
    player.reloadTimer = gameState.scheduleRoundTimer(() => {
      player.ammo = getMaxAmmo(player, player.weapon);
      player.reloading = 0;
      sendTo(player.ws, { type: 'reloaded', playerId: player.id, weapon });
    }, reloadTime);
  }
}

function placeBarricadeForPlayer(player, aimX, aimY, pieceType) {
  if (!player || !player.alive) return false;
  const nowMs = Date.now();
  if (player.barricadeReadyAt && nowMs < player.barricadeReadyAt) return false;
  // Look up piece dimensions + cost from the shared config
  const piece = BUILDING_PIECES[pieceType] || BUILDING_PIECES.plank;
  let ax = aimX || 0, ay = aimY || 0;
  const alen = Math.hypot(ax, ay);
  if (alen < 0.01) {
    const d = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] }[player.dir] || [0,1];
    ax = d[0]; ay = d[1];
  } else { ax /= alen; ay /= alen; }
  const cx = player.x + ax * 50;
  const cy = player.y + ay * 50;
  const angle = Math.atan2(ay, ax);
  const W = piece.w, H = piece.h;
  if (!player.isBot) {
    if (!player.resources || (player.resources.wood || 0) < piece.cost) return false;
    for (const tc of gameState.getToolCupboards()) {
      if (tc.ownerId !== player.id && Math.hypot(cx - tc.x, cy - tc.y) < TOOL_CUPBOARD_RADIUS) {
        return false;
      }
    }
    player.resources.wood -= piece.cost;
  }
  const bid = gameState.nextBarricadeId();
  gameState.addBarricade({
    id: bid, cx, cy, w: W, h: H, angle,
    _cosA: Math.cos(angle), _sinA: Math.sin(angle),
    _terrainH: getTerrainHeight(cx, cy),
    ownerId: player.id, placedAt: nowMs, hp: player.isBot ? 50 : piece.hp,
    permanent: !player.isBot, pieceType: pieceType || 'plank',
  });
  const cdMs = player.isBot ? gameState.BOT_BARRICADE_COOLDOWN_MS : gameState.BARRICADE_COOLDOWN_MS;
  player.barricadeReadyAt = nowMs + cdMs;
  broadcast({ type: 'barricadePlaced', id: bid, cx, cy, w: W, h: H, angle, ownerId: player.id });
  return true;
}

// Knife melee attack — short-range cone in front of the attacker. Picks
// the closest player inside the cone, routes damage through the normal
// shield/armor/hunger pipeline, broadcasts a swing (always) and a hit
// (only on connect). Bots never call this path — human knife-holders only.
function handleMelee(player) {
  if (!player || !player._joined || !player.alive) return;
  if (player.weapon !== 'knife') return;
  const nowMs = Date.now();
  if (player.meleeReadyAt && nowMs < player.meleeReadyAt) return;
  player.meleeReadyAt = nowMs + KNIFE_MELEE_CD_MS;

  // Aim vector on the server (x, y) plane. Client derives aimAngle from
  // `atan2(fwd.x, fwd.z)` against world (x, z), which maps directly to
  // server (x, y) here — so forward = (sin a, cos a).
  const aim = player.aimAngle || 0;
  const fx = Math.sin(aim);
  const fy = Math.cos(aim);
  const rangeSq = KNIFE_MELEE_RANGE * KNIFE_MELEE_RANGE;

  // --- Resource node gathering (checked before player targets) ---
  const nodeRange = KNIFE_MELEE_RANGE + 20; // nodes are slightly larger
  const nodeRangeSq = nodeRange * nodeRange;
  let hitNode = null, hitNodeDistSq = Infinity;
  for (const node of gameState.getResourceNodes()) {
    if (node.respawnAt) continue; // depleted
    const dx = node.x - player.x, dy = node.y - player.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > nodeRangeSq || distSq < 1) continue;
    const dist = Math.sqrt(distSq);
    const dot = (dx * fx + dy * fy) / dist;
    if (dot < KNIFE_MELEE_CONE_COS) continue;
    if (distSq < hitNodeDistSq) { hitNode = node; hitNodeDistSq = distSq; }
  }

  broadcast({ type: 'meleeSwing', playerId: player.id, x: player.x, y: player.y });

  if (hitNode) {
    const cfg = RESOURCE_TYPES[hitNode.type];
    hitNode.hp -= KNIFE_MELEE_DAMAGE;
    // Grant resources to the gatherer
    if (player.resources) {
      const resKey = cfg.resource;
      player.resources[resKey] = Math.min(RESOURCE_CAP, (player.resources[resKey] || 0) + cfg.yield);
    }
    if (hitNode.hp <= 0) {
      hitNode.hp = 0;
      hitNode.respawnAt = Date.now() + cfg.respawnMs;
      broadcast({ type: 'resourceNodeDepleted', id: hitNode.id });
    }
    broadcast({
      type: 'resourceHit', nodeId: hitNode.id, playerId: player.id,
      hp: hitNode.hp, yield: cfg.yield, resourceType: cfg.resource,
    });
    return; // node hit — don't also check players
  }

  // --- Player melee target ---
  let hit = null, hitDistSq = Infinity;
  for (const [, p] of gameState.getPlayers()) {
    if (p.id === player.id || !p.alive || !p._joined) continue;
    const dx = p.x - player.x, dy = p.y - player.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > rangeSq || distSq < 1) continue;
    const dist = Math.sqrt(distSq);
    const dot = (dx * fx + dy * fy) / dist;
    if (dot < KNIFE_MELEE_CONE_COS) continue;
    if (distSq < hitDistSq) { hit = p; hitDistSq = distSq; }
  }

  if (!hit) return;

  let dmg = KNIFE_MELEE_DAMAGE;
  if (hit.perks && hit.perks.damageReduction) dmg *= (1 - hit.perks.damageReduction);
  if (hit.armor > 0) {
    const absorbed = Math.min(hit.armor, dmg);
    dmg -= absorbed;
    applyArmorDelta(hit, -absorbed);
    broadcast({ type: 'shieldHit', playerId: hit.id, x: hit.x, y: hit.y });
  }
  if (dmg > 0) applyHungerDelta(hit, -dmg, player.id);
  broadcast({ type: 'meleeHit', attackerId: player.id, targetId: hit.id, x: hit.x, y: hit.y, dmg: Math.round(KNIFE_MELEE_DAMAGE) });
}

function cancelReload(player) {
  player.reloading = 0;
  if (player.reloadTimer) { clearTimeout(player.reloadTimer); player.reloadTimer = null; }
}

module.exports = { handleAttack, handleMelee, updateProjectiles, handleDash, handleReload, cancelReload, getMaxAmmo, placeBarricadeForPlayer, eyeHeight };
