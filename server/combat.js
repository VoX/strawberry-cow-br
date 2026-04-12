const { MAP_W, MAP_H, TICK_RATE } = require('./config');
const { broadcast, sendTo } = require('./network');
const gameState = require('./game-state');
const { getTerrainHeight, getGroundHeight, WALL_HEIGHT } = require('./terrain');
const ballistics = require('./ballistics');
const weaponFire = require('./weapon-fire');
const { applyHungerDelta, applyArmorDelta } = require('./player');
const { MAG_SIZES, EXT_MAG_SIZES, DUAL_WIELD_FAMILY, BURST_FAMILY, KNIFE_MELEE_RANGE, KNIFE_MELEE_CONE_COS, KNIFE_MELEE_DAMAGE, KNIFE_MELEE_CD_MS } = require('../shared/constants');
// Lazy-require to avoid circular dependency (game.js requires combat.js).
let _SI = null;
function getSI() { if (!_SI) _SI = require('./game').SI; return _SI; }


// Hitscan weapons — instant ray trace, no projectile entity.
// All bullet weapons except cowtank (explosive projectile).
const HITSCAN_WEAPONS = new Set([
  'normal', 'burst', 'shotgun', 'bolty', 'mp5k', 'thompson',
  'akm', 'sks', 'aug', 'python', 'm249', 'minigun',
]);

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
  // Minigun: must be spun up to fire
  if (weapon === 'minigun' && !player._minigunSpun) return;
  if (player.reloading > 0) {
    if (weapon === 'shotgun' && player.ammo > 0) {
      clearTimeout(player.reloadTimer);
      player.reloadTimer = null;
      player.reloading = 0;
    } else {
      return;
    }
  }
  const magSize = MAG_SIZES[weapon];
  if (magSize && player.ammo <= 0) {
    if (weapon === 'minigun') {
      // Minigun is disposable — discard when empty (no pickup created)
      player.weapon = 'normal';
      player.dualWield = false;
      player.ammo = MAG_SIZES.normal || 10;
      player._minigunSpinning = false;
      player._minigunSpun = false;
      player._minigunSpinTime = 0;
      return;
    }
    sendTo(player.ws, { type: 'emptyMag' });
    player.attackCooldown = 0.3;
    handleReload(player);
    return;
  }
  const { cdMult, dmgMult, hungerDiscount } = weaponFire.extractShooterModifiers(player);
  const dualWield = !!player.dualWield;

  const stats = weaponFire.resolvePlayerStats(weapon, hungerDiscount);

  // Normalize aim with cardinal-direction fallback for idle shooters
  let ax = msg.aimX || 0, ay = msg.aimY || 0, az = msg.aimZ || 0;
  const alen3d = Math.hypot(ax, ay, az);
  if (alen3d < 0.1) {
    const dirMap = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] };
    const dd = dirMap[player.dir] || [0,1];
    ax = dd[0]; ay = dd[1]; az = 0;
  } else { ax /= alen3d; ay /= alen3d; az /= alen3d; }

  if (HITSCAN_WEAPONS.has(weapon)) {
    const walkSpreadMult = player.walking ? 0.73 : 1;
    const fireServerTime = typeof msg.serverTime === 'number' ? msg.serverTime : null;
    // Use client camera position for hitscan ray origin if provided
    const camPos = (typeof msg.camX === 'number' && typeof msg.camY === 'number' && typeof msg.camZ === 'number')
      ? { x: msg.camX, y: msg.camY, z: msg.camZ } : null;
    const hsOpts = {
      dualWield, dmgMult, eyeHeight, walkSpreadMult, fireServerTime, camPos,
    };

    // Burst-family: respect fire mode (auto / semi / burst)
    if (BURST_FAMILY.has(weapon)) {
      const requestedMode = msg.fireMode === 'auto' ? 'auto' : msg.fireMode === 'semi' ? 'semi' : 'burst';
      let effectiveMode = requestedMode;
      if (effectiveMode === 'burst' && !stats.burstStepMs) effectiveMode = 'auto';
      if (effectiveMode === 'semi' && !stats.semi) effectiveMode = 'auto';

      if (effectiveMode === 'auto' && stats.auto) {
        const a = stats.auto;
        const autoCount = dualWield ? (a.dualPelletMult || 1) : 1;
        const autoOpts = { ...hsOpts, walkSpreadMult: walkSpreadMult * (dualWield ? 1.5 : 1) };
        const autoStats = { ...stats, ...a, spreadBase: a.spreadBase };
        for (let ac = 0; ac < autoCount; ac++) {
          weaponFire.fireHitscan(player, weapon, { ax, ay, az }, autoStats, autoOpts);
        }
        player.attackCooldown = a.cooldown * cdMult;
        if (MAG_SIZES[weapon]) player.ammo = Math.max(0, player.ammo - autoCount);
        return;
      }
      if (effectiveMode === 'semi' && stats.semi) {
        const s = stats.semi;
        const semiCount = dualWield ? (s.dualPelletMult || 1) : 1;
        const semiStats = { ...stats, ...s, spreadBase: s.spreadBase };
        for (let sc = 0; sc < semiCount; sc++) {
          weaponFire.fireHitscan(player, weapon, { ax, ay, az }, semiStats, hsOpts);
        }
        player.attackCooldown = s.cooldown * cdMult;
        if (MAG_SIZES[weapon]) player.ammo = Math.max(0, player.ammo - semiCount);
        return;
      }
      // Burst mode — 3 rays with delayed damage, spread per round.
      // Each scheduled shot re-samples yaw from player.aimAngle at fire time so
      // mid-burst camera rotation steers each round (matches the visible recoil
      // & sound stagger). Pitch is sticky from trigger time — move messages
      // don't carry pitch, so we'd have nothing fresh to read anyway.
      // Ammo gates scheduling, not just decrement: if the mag has fewer rounds
      // than the burst (1 or 2 left), we only schedule what we can shoot.
      const burstCount = stats.pellets || 3;
      const volleys = dualWield ? 2 : 1;
      const trigPitch = az;
      const horizMag = Math.sqrt(Math.max(0, 1 - trigPitch * trigPitch));
      const maxShots = burstCount * volleys;
      const ammoCap = MAG_SIZES[weapon] ? Math.max(0, player.ammo) : maxShots;
      const shotsToFire = Math.min(maxShots, ammoCap);
      let scheduled = 0;
      schedLoop:
      for (let b = 0; b < burstCount; b++) {
        for (let v = 0; v < volleys; v++) {
          if (scheduled >= shotsToFire) break schedLoop;
          const delay = b * stats.burstStepMs + v * 25;
          gameState.scheduleRoundTimer(() => {
            if (!player.alive || player.weapon !== weapon) return;
            // Human players: yaw = atan2(fwdX, fwdZ) — see client/index.js:108.
            // Inverse gives (aimX, aimY) = (sin(yaw), cos(yaw)).
            // Bots use the opposite sign (atan2(-ax, ay)) but bots fire via
            // fireBot, not handleAttack — this branch is human-only.
            const yaw = player.aimAngle || 0;
            const liveAx = Math.sin(yaw) * horizMag;
            const liveAy = Math.cos(yaw) * horizMag;
            weaponFire.fireHitscan(player, weapon, { ax: liveAx, ay: liveAy, az: trigPitch }, stats, hsOpts);
          }, delay);
          scheduled++;
        }
      }
      player.attackCooldown = stats.cooldown * cdMult;
      if (MAG_SIZES[weapon]) player.ammo = Math.max(0, player.ammo - shotsToFire);
      return;
    }

    // Multi-pellet weapons (shotgun) fire simultaneous rays per shot.
    // High-RPM weapons (minigun, etc) fire multiple shots per client attack
    // message since the client caps at 20 attacks/sec.
    const simultaneous = stats.volleyed ? (stats.pellets || 1) : 1;
    const shotsPerAttack = Math.max(1, Math.round(0.05 / (stats.cooldown * cdMult)));
    for (let shot = 0; shot < shotsPerAttack; shot++) {
      if (MAG_SIZES[weapon] && player.ammo <= 0) break;
      for (let i = 0; i < simultaneous; i++) {
        weaponFire.fireHitscan(player, weapon, { ax, ay, az }, stats, hsOpts);
      }
      if (MAG_SIZES[weapon]) player.ammo = Math.max(0, player.ammo - 1);
    }
    player.attackCooldown = stats.cooldown * cdMult * shotsPerAttack;
    return;
  }

  const fired = weaponFire.fireWeapon(player, weapon, { ax, ay, az }, stats, {
    walkSpreadMult: player.walking ? 0.73 : 1,
    dualWield,
    fireMode: msg.fireMode === 'auto' ? 'auto' : msg.fireMode === 'semi' ? 'semi' : 'burst',
    emitMuzzleFlag: true,
    cdMult,
    dmgMult,
    eyeHeight,
    // Lag comp: client sends serverTime (SI-synced timestamp of what they
    // were rendering). Server rewinds via SI vault for hit detection.
    fireServerTime: typeof msg.serverTime === 'number' ? msg.serverTime : null,
  });
  if (!fired) return;

  // Cowtank is single-use — drop back to normal weapon after firing.
  if (weapon === 'cowtank') weaponFire.resetAfterCowtank(player);
}

function applyExplosion(pr, excludeId) {
  const walls = gameState.getWalls();
  const barricades = gameState.getBarricades();
  const players = gameState.getPlayers();
  // Ballistics returns pure selections — we mutate + broadcast in here.
  const sel = ballistics.computeBlastVictims(pr, players, walls, barricades, excludeId, eyeHeight);
  // Destroy barricades caught in the blast (indices are descending-order)
  for (const i of sel.barricadeIdxs) {
    gameState.removeBarricadeAt(i);
  }
  // Damage map walls — each takes `hp` explosions to destroy.
  // State changes ride the tick payload (walls/barricades arrays).
  for (const i of sel.wallIdxs) {
    const w = walls[i];
    w.hp = (w.hp || 1) - 1;
    if (w.hp <= 0) gameState.removeWallAt(i);
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

// Lag comp: reconstruct a Map<id, playerLike> from an SI interpolated
// snapshot + the live players map so `findPlayerHit` sees rewound
// positions for the time the client was rendering at fire time.
// Position and sizeMult come from the rewound state. Everything else
// (perks, armor, ws) comes from the LIVE player so damage/broadcasts
// apply to the current entity.
function _buildRewoundPlayers(interpState, livePlayers) {
  const out = new Map();
  for (const entry of interpState) {
    const live = livePlayers.get(entry.id);
    if (!live || !live.alive) continue;
    const rewoundPerks = Object.assign({}, live.perks, {
      sizeMult: entry.sizeMult || (live.perks && live.perks.sizeMult) || 1,
    });
    out.set(entry.id, {
      id: entry.id,
      x: entry.x, y: entry.y, z: entry.z || 0,
      alive: true,
      stunTimer: entry.stunTimer || 0,
      spawnProtection: entry.spawnProt ? 1 : 0,
      armor: entry.armor || 0,
      perks: rewoundPerks,
      _rewound: true,
    });
  }
  return out;
}

function updateProjectiles(dt) {
  const projectiles = gameState.getProjectiles();
  const walls = gameState.getWalls();
  const barricades = gameState.getBarricades();
  const players = gameState.getPlayers();
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const pr = projectiles[i];
    // Advance the "age in ticks" counter before anything else so the
    // rewind lookup computes (fireServerTime + ticksAlive * tickDuration)
    // for the snapshot that matches this frame of the projectile's flight.
    pr.ticksAlive = (pr.ticksAlive || 0) + 1;
    // Step 1: integrate motion + gravity, capture prev position
    const { prevX, prevY, prevZ } = ballistics.integrateProjectile(pr, dt);
    // Step 2: analytical pre-scan for walls/barricades along this tick's segment.
    // Skip the scan entirely for near-stationary ticks — matches original behaviour.
    // Cache the pre-clamp segment so the wall-piercing impact math can use
    // the original direction even after we clamp pr.x/pr.y to just past the
    // first wall.
    const origEndX = pr.x, origEndY = pr.y, origEndZ = pr.z;
    let segDx = pr.x - prevX, segDy = pr.y - prevY;
    const segDist = Math.hypot(segDx, segDy);
    let blockT = 1.01;
    let hitWallObj = null;
    let hitBarricade = null;
    let pierceWall = null;
    let pierceWallT = 0;
    if (segDist > 0.5) {
      const wres = ballistics.segVsWalls(prevX, prevY, prevZ, pr.x, pr.y, pr.z, walls, getTerrainHeight, WALL_HEIGHT);
      if (pr.wallPiercing) {
        // Piercing projectiles (L9) don't use wall blockT to limit the
        // player/barricade scan — the bullet keeps going past the wall.
        // We DO clamp the projectile to just past the wall so the next
        // tick's segment starts after wall 1, which lets wall 2 (if any)
        // be detected next tick instead of being skipped over by a single
        // long-distance step. Without this clamp, fast bullets crossing
        // two walls in one tick only registered the first.
        if (wres.hitWall) {
          pierceWall = wres.hitWall;
          pierceWallT = wres.blockT;
          const eps = 0.001;
          const clampT = Math.min(1, wres.blockT + eps);
          pr.x = prevX + segDx * clampT;
          pr.y = prevY + segDy * clampT;
          pr.z = prevZ + (pr.z - prevZ) * clampT;
          segDx = pr.x - prevX; segDy = pr.y - prevY;
        }
      } else {
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
    // Lag comp: if the client sent serverTime at fire, compute the
    // rewind time accounting for projectile age, then use SI vault
    // to interpolate entity positions at that time.
    let playersForHit = players;
    if (typeof pr.fireServerTime === 'number') {
      const siVault = getSI().vault;
      // Advance the rewind time by ticksAlive × tick duration so each
      // tick of the projectile's flight checks the right historical frame.
      const rewindTime = pr.fireServerTime + (pr.ticksAlive * (1000 / TICK_RATE));
      const snapPair = siVault.get(rewindTime);
      if (snapPair && snapPair.older && snapPair.newer) {
        const interp = getSI().interpolate(snapPair.older, snapPair.newer, rewindTime, 'x y z');
        if (interp && interp.state) playersForHit = _buildRewoundPlayers(interp.state, players);
      }
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
    if (pierceWall) {
      // pierceWallT was captured against the ORIGINAL (pre-clamp) segment,
      // so reconstruct the impact from the cached origEnd* coords.
      let impactX = prevX + (origEndX - prevX) * pierceWallT;
      let impactY = prevY + (origEndY - prevY) * pierceWallT;
      const impactZ = prevZ + (origEndZ - prevZ) * pierceWallT;
      const wxR = pierceWall.x + Math.max(pierceWall.w, 20);
      const wyB = pierceWall.y + Math.max(pierceWall.h, 20);
      impactX = Math.max(pierceWall.x, Math.min(wxR, impactX));
      impactY = Math.max(pierceWall.y, Math.min(wyB, impactY));
      broadcast({ type: 'wallImpact', x: impactX, y: impactY, z: impactZ, wallId: pierceWall.id, ownerId: pr.ownerId });
      pr._wallHits = (pr._wallHits || 0) + 1;
      if (pr._wallHits >= 2) {
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: impactX, y: impactY, z: impactZ, wallId: pierceWall.id });
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
        // HP change rides the tick payload. Client detects HP drop / removal.
        if (hitBarricade.hp <= 0) {
          gameState.removeBarricade(hitBarricade.id);
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
    player._justDashed = true;  // event flag, rides the next tick
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
  if (weapon === 'minigun') return; // minigun can't reload — disposable
  const maxAmmo = getMaxAmmo(player, weapon);
  if (!maxAmmo || player.ammo >= maxAmmo) return;
  player.reloading = 1;

  const dualMult = player.dualWield ? 2 : 1;
  if (weapon === 'shotgun') {
    // Shell by shell reload — benelli keeps the same per-shell speed when dual-wielding
    const shellMs = 750;
    const loadShell = () => {
      // !player.reloading defends against an outside path (volley fire-
      // interrupt, weapon swap, etc.) that zeroed reloading without
      // actually clearing this in-flight timer — without the gate, the
      // dangling callback would resurrect the reload by incrementing ammo.
      if (!player.alive || !player.reloading || player.weapon !== 'shotgun' || player.ammo >= getMaxAmmo(player, 'shotgun')) {
        player.reloading = 0;
        player.reloadTimer = null;
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
    const RELOAD_MS = { normal: 2000, burst: 3000, mp5k: 3000, thompson: 3000, sks: 2500, akm: 3000, aug: 3500, bolty: 2500 };
    const reloadTime = (RELOAD_MS[weapon] || 2000) * dualMult;
    player.reloadTimer = gameState.scheduleRoundTimer(() => {
      player.ammo = getMaxAmmo(player, player.weapon);
      player.reloading = 0;
      sendTo(player.ws, { type: 'reloaded', playerId: player.id, weapon });
    }, reloadTime);
  }
}

function placeBarricadeForPlayer(player, aimX, aimY) {
  if (!player || !player.alive) return false;
  const nowMs = Date.now();
  if (player.barricadeReadyAt && nowMs < player.barricadeReadyAt) return false;
  let ax = aimX || 0, ay = aimY || 0;
  const alen = Math.hypot(ax, ay);
  if (alen < 0.01) {
    const d = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] }[player.dir] || [0,1];
    ax = d[0]; ay = d[1];
  } else { ax /= alen; ay /= alen; }
  const cx = player.x + ax * 45;
  const cy = player.y + ay * 45;
  const angle = Math.atan2(ay, ax);
  const W = 52, H = 8;
  const bid = gameState.nextBarricadeId();
  // Cache cos/sin and terrain height — barricades are static so this never changes
  gameState.addBarricade({
    id: bid, cx, cy, w: W, h: H, angle,
    _cosA: Math.cos(angle), _sinA: Math.sin(angle),
    _terrainH: getTerrainHeight(cx, cy),
    ownerId: player.id, placedAt: nowMs, hp: 50,
  });
  const cdMs = player.isBot ? gameState.BOT_BARRICADE_COOLDOWN_MS : gameState.BARRICADE_COOLDOWN_MS;
  player.barricadeReadyAt = nowMs + cdMs;
  // No broadcast — barricade appears in the next tick's barricadeState array.
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

  broadcast({ type: 'meleeSwing', playerId: player.id, x: player.x, y: player.y });
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

module.exports = { handleAttack, handleMelee, updateProjectiles, handleDash, handleReload, cancelReload, getMaxAmmo, placeBarricadeForPlayer, eyeHeight, _buildRewoundPlayers };
