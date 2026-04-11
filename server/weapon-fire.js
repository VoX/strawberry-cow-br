// Unified weapon-fire spine. Owns projectile spawning + broadcast for every
// weapon. combat.js::handleAttack (players) and bots.js::fireBot (bots) both
// route through this; their wrappers are thin shells that gate the shot and
// then call `fireWeapon(shooter, weapon, aim, stats, opts)`.
//
// Design:
//   - STATS tables hold the balance numbers. No hardcoded constants in the
//     spine. PLAYER_STATS_BASE stores the (minFloor, baseCost) shape so the
//     player-side hungerDiscount perk can subtract. BOT_STATS is already
//     final — bots have no hungerDiscount.
//   - `stats` passed to fireWeapon is the FINAL per-shot numbers (post-perk
//     adjustment). Callers use `resolvePlayerStats` (players) or read
//     BOT_STATS directly (bots).
//   - `opts` carries per-caller quirks: walkSpreadMult, dualWield, fireMode,
//     emitMuzzleFlag, cdMult, dmgMult, eyeHeight.
//   - Mutates `shooter._shotgunAlt` for dual-wield benelli alternation (only
//     touched when opts.dualWield is true).

const gameState = require('./game-state');
const { broadcast } = require('./network');
const { BURST_FAMILY, MAG_SIZES } = require('../shared/constants');
const ballistics = require('./ballistics');
const { getTerrainHeight, WALL_HEIGHT } = require('./terrain');

// Bullet gravity — lower than player gravity (600) because real bullets
// experience less relative drop. 150 gives ~3 unit drop at 500 range
// for the slowest weapons, noticeable at long range but not distracting.
const BULLET_GRAVITY = 150;
const MAX_HITSCAN_RANGE = 3000; // max ray length in units

// --- Player base stats ----------------------------------------------------
// Every cost/gate has the shape (minFloor, base) so `Math.max(minFloor, base - hungerDiscount)`
// produces the effective per-shot number. Matches the original combat.js
// expressions exactly.
const PLAYER_STATS_BASE = {
  normal: {
    hungerGate: [1, 3], hungerCost: [1, 2],
    cooldown: 0.15, dmg: 9, speed: 2588, spreadBase: 0.0286, pellets: 1, spawnOffset: 40,
  },
  burst: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    // Burst-cycle cooldown (time between 3-round bursts, not between rounds
    // inside a burst — that's the 92 ms delay hardcoded in the burst loop).
    // 92 ms intra-burst = ~650 RPM, which is +30% over the auto rate by design.
    cooldown: 0.8, dmg: 14, speed: 7286, spreadBase: 0, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    burstStepMs: 58,
    auto: { hungerCost: [1, 2], cooldown: 0.075, dmg: 8.7, speed: 6624, spreadBase: 0.022, pellets: 1, dualPelletMult: 2 },
    semi: { hungerCost: [1, 2], cooldown: 0.24, dmg: 14, speed: 7286, spreadBase: 0, pellets: 1, dualPelletMult: 2 },
  },
  shotgun: {
    hungerGate: [3, 10], hungerCost: [3, 9],
    cooldown: 0.9, cooldownDualMult: 0.55 / 0.9, // dual benelli halves cooldown; matches original 0.55
    dmg: 4, speed: 2760, spreadBase: 0.157, pellets: 10, spawnOffset: 40,
    volleyed: true, broadcastTag: 'shotgun', vzSpreadBase: 0.2,
  },
  bolty: {
    hungerGate: [3, 8], hungerCost: [3, 7],
    cooldown: 2.5, dmg: 50, speed: 33600, spreadBase: 0, pellets: 1, spawnOffset: 40,
    wallPiercing: true, broadcastTag: 'bolty',
  },
  cowtank: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 1.0, dmg: 38, speed: 2070, spreadBase: 0, pellets: 1, spawnOffset: 40,
    explosive: true, blastRadius: 180, broadcastTag: 'cowtank',
  },
  // MP5K — stockless SMG. 2/3 LR damage, 2x LR spread, 600 RPM auto.
  // Burst mode mirrors the LR burst-vs-auto ratio (2x dmg per pellet,
  // 3-round burst with 92ms step). Faster cycle than LR in all modes.
  mp5k: {
    hungerGate: [2, 5], hungerCost: [1, 3],
    cooldown: 0.6, dmg: 9, speed: 2848, spreadBase: 0.022, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    burstStepMs: 52, defaultMode: 'auto',
    auto: { hungerCost: [1, 2], cooldown: 0.067, dmg: 6, speed: 2588, spreadBase: 0.044, pellets: 1, dualPelletMult: 2 },
  },
  // Thompson — 700 RPM full auto. Classic SMG.
  thompson: {
    hungerGate: [2, 5], hungerCost: [1, 3],
    cooldown: 0.086, dmg: 5.3, speed: 2622, spreadBase: 0.0506, pellets: 1, spawnOffset: 40,
    autoOnly: true,
  },
  // AKM — assault rifle. Semi + full auto, no burst. Higher damage than
  // M16 family, more spread and recoil. 450 RPM. 30 round mag.
  akm: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 0.3, dmg: 13, speed: 4934, spreadBase: 0, pellets: 1, spawnOffset: 40,
    auto: { hungerCost: [1, 3], cooldown: 0.1, dmg: 9.8, speed: 4934, spreadBase: 0.03, pellets: 1, dualPelletMult: 1 },
    semi: { hungerCost: [1, 3], cooldown: 0.22, dmg: 13, speed: 4934, spreadBase: 0.008, pellets: 1, dualPelletMult: 1 },
    defaultMode: 'auto',
  },
  // SKS — semi-auto marksman rifle. Higher damage + velocity than AUG,
  // lower spread. 340 RPM. Random per-shot recoil (no pattern).
  sks: {
    hungerGate: [2, 6], hungerCost: [1, 4],
    cooldown: 0.176, dmg: 16, speed: 6762, spreadBase: 0.015, pellets: 1, spawnOffset: 40,
    semiOnly: true,
  },
  // AUG — bullpup rifle with integrated 2x optic. Solo only (the
  // weapons.js dual-wield gate doesn't include 'aug'). Auto = 450 RPM
  // (slower than the M16's 500), burst = +30% cycle rate vs auto. Same
  // per-shot damage as the M16 family but tighter spread because of
  // the optic; client multiplies hipfire spread/recoil by 1.5x when
  // not scoped.
  // Python — .357 Magnum revolver. 6 rounds, 400 RPM semi-auto.
  // Damage between AK (13) and L96 (50). High vertical recoil. Dual-wieldable.
  python: {
    hungerGate: [2, 6], hungerCost: [1, 4],
    cooldown: 0.15, dmg: 30, speed: 11040, spreadBase: 0.015, pellets: 1, spawnOffset: 40,
    semiOnly: true,
  },
  // M249 SAW — belt-fed LMG. 100 rounds, 600 RPM full auto.
  // 50% move speed penalty. 5.56 NATO damage. MP5K spread.
  m249: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 0.071, dmg: 9.9, speed: 6624, spreadBase: 0.044, pellets: 1, spawnOffset: 40,
    autoOnly: true,
  },
  // Minigun — 300 rounds, 600 RPM full auto. 30% move speed.
  // Minigun: 1200 RPM single pellet hitscan. No server cost per shot.
  minigun: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 0.02, dmg: 1.8, speed: 6624, spreadBase: 0.088, pellets: 1, spawnOffset: 40,
    autoOnly: true, volleyed: true, vzSpreadBase: 0.08, life: 1.0,
  },
  aug: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 0.615, dmg: 14, speed: 9816, spreadBase: 0, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    burstStepMs: 68,
    auto: { hungerCost: [1, 2], cooldown: 0.088, dmg: 9.3, speed: 8924, spreadBase: 0.022, pellets: 1, dualPelletMult: 1 },
    semi: { hungerCost: [1, 2], cooldown: 0.266, dmg: 14, speed: 9816, spreadBase: 0, pellets: 1, dualPelletMult: 1 },
  },
};

// --- Bot stats ------------------------------------------------------------
// Final values (no hungerDiscount). Kept separate so bot nerfs can diverge
// from player numbers at will.
const BOT_STATS = {
  normal:  { hungerGate: 10, hungerCost: 3, cooldown: 0.3, dmg: 9,  speed: 2588, spreadBase: 0, pellets: 1, spawnOffset: 40 },
  burst:   {
    hungerGate: 4, hungerCost: 5, cooldown: 0.8, dmg: 14, speed: 7286, spreadBase: 0, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    auto: { hungerCost: 1, cooldown: 0.1, dmg: 14, speed: 6624, spreadBase: 0.035, pellets: 1 },
  },
  shotgun: { hungerGate: 7, hungerCost: 7, cooldown: 1.0, dmg: 4, speed: 2760, spreadBase: 0.2, pellets: 10, spawnOffset: 40, volleyed: true, broadcastTag: 'shotgun', vzSpreadBase: 0.2 },
  bolty:   { hungerGate: 12, hungerCost: 8, cooldown: 2.5, dmg: 50, speed: 33600, spreadBase: 0, pellets: 1, spawnOffset: 40, broadcastTag: 'bolty' },
  cowtank: { hungerGate: 6, hungerCost: 5, cooldown: 1.0, dmg: 38, speed: 4140, spreadBase: 0, pellets: 1, spawnOffset: 40, explosive: true, blastRadius: 180, broadcastTag: 'cowtank' },
  thompson: { hungerGate: 4, hungerCost: 3, cooldown: 0.13, dmg: 8, speed: 2622, spreadBase: 0.0506, pellets: 1, spawnOffset: 40 },
  akm: {
    hungerGate: 5, hungerCost: 4, cooldown: 0.3, dmg: 13, speed: 4934, spreadBase: 0, pellets: 1, spawnOffset: 40,
    auto: { hungerCost: 2, cooldown: 0.133, dmg: 13, speed: 4934, spreadBase: 0.04, pellets: 1 },
  },
  sks: { hungerGate: 5, hungerCost: 4, cooldown: 0.176, dmg: 3.9, speed: 4900, spreadBase: 0.015, pellets: 1, spawnOffset: 40 },
  mp5k: {
    hungerGate: 4, hungerCost: 3, cooldown: 0.6, dmg: 4, speed: 2600, spreadBase: 0.022, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    auto: { hungerCost: 1, cooldown: 0.1, dmg: 2, speed: 2600, spreadBase: 0.055, pellets: 1 },
  },
  python: { hungerGate: 5, hungerCost: 4, cooldown: 0.15, dmg: 25, speed: 11040, spreadBase: 0.015, pellets: 1, spawnOffset: 40 },
  m249: { hungerGate: 5, hungerCost: 5, cooldown: 0.1, dmg: 12, speed: 6624, spreadBase: 0.044, pellets: 1, spawnOffset: 40 },
  minigun: { hungerGate: 5, hungerCost: 5, cooldown: 0.1, dmg: 3.5, speed: 6624, spreadBase: 0.088, pellets: 2, spawnOffset: 40, volleyed: true, vzSpreadBase: 0.08, life: 1.0 },
};

// Extract cooldown / damage / hungerDiscount multipliers from a shooter's
// weaponPerks. Both player and bot wrappers apply the same defaults + floor.
const _DEFAULT_WP = { cooldown: 1, hungerDiscount: 0, damageMult: 1 };
function extractShooterModifiers(shooter) {
  const wp = shooter.weaponPerks || _DEFAULT_WP;
  return {
    cdMult: Math.max(0.3, wp.cooldown),
    dmgMult: wp.damageMult,
    hungerDiscount: wp.hungerDiscount,
  };
}

// Produce a per-shot stats object for a player by applying hungerDiscount to
// every [min,base] cost pair. Caller does this once per fire. Every fire-mode
// variant (auto/semi) MUST be flattened the same way — leaving a [min,base]
// tuple in `s.hungerCost` would let the fire path do `-array` which JS
// coerces to NaN, hunger goes NaN, and the player becomes unkillable. (This
// is exactly the M16-semi infinite-health bug we shipped once already.)
function resolvePlayerStats(weapon, hungerDiscount = 0) {
  const base = PLAYER_STATS_BASE[weapon] || PLAYER_STATS_BASE.normal;
  const resolved = { ...base };
  resolved.hungerGate = Math.max(base.hungerGate[0], base.hungerGate[1] - hungerDiscount);
  resolved.hungerCost = Math.max(base.hungerCost[0], base.hungerCost[1] - hungerDiscount);
  if (base.auto) {
    resolved.auto = {
      ...base.auto,
      hungerCost: Math.max(base.auto.hungerCost[0], base.auto.hungerCost[1] - hungerDiscount),
    };
  }
  if (base.semi) {
    resolved.semi = {
      ...base.semi,
      hungerCost: Math.max(base.semi.hungerCost[0], base.semi.hungerCost[1] - hungerDiscount),
    };
  }
  return resolved;
}

// Spawn one projectile + broadcast. Centralized so new fields only need to be
// added in one place. `extras.fireServerTime` is the SI-synced server time
// the client was rendering at fire time — null for bots and server-originated
// shots, which makes updateProjectiles skip the rewind lookup (live positions).
function _spawnProjectile(shooter, posX, posY, posZ, dirX, dirY, dirZ, speed, dmg, extras, broadcastExtras, delayMs) {
  const projId = gameState.nextEntityId();
  const proj = {
    id: projId,
    ownerId: shooter.id,
    x: posX, y: posY, z: posZ,
    vx: dirX * speed, vy: dirY * speed, vz: dirZ * speed,
    life: 3,
    dmg,
    fireServerTime: extras && extras.fireServerTime != null ? extras.fireServerTime : null,
    ticksAlive: 0,
    ...extras,
  };
  // _firstTick lets updateProjectiles handle point-blank walls correctly.
  proj._firstTick = [shooter.x, shooter.y, posZ];
  gameState.addProjectile(proj);

  const bc = {
    type: 'projectile',
    id: projId,
    ownerId: shooter.id,
    x: proj.x, y: proj.y, z: proj.z,
    vx: proj.vx, vy: proj.vy, vz: proj.vz,
    color: shooter.color,
    ...broadcastExtras,
  };
  if (delayMs) gameState.scheduleRoundTimer(() => broadcast(bc), delayMs);
  else broadcast(bc);
}

// --- Hitscan fire -----------------------------------------------------------
// Instant ray trace with analytical bullet drop. Damage delayed by travel time.
// No projectile entity created. Broadcasts unreliable tracer for visuals.
function fireHitscan(shooter, weapon, aim, stats, opts = {}) {
  const { dualWield = false, dmgMult = 1, eyeHeight, fireServerTime = null, walkSpreadMult = 1, camPos = null } = opts;
  const perkDmgMult = (shooter.perks && shooter.perks.damage) || 1;
  // Use client camera position if provided (matches what the player sees).
  // Falls back to cow head position for bots and legacy clients.
  const eyeZ = camPos ? camPos.z : (shooter.z + (eyeHeight ? eyeHeight(shooter) : 0));
  let ax = aim.ax, ay = aim.ay, az = aim.az;

  // Apply spread
  if (stats.spreadBase > 0) {
    const spread = stats.spreadBase * walkSpreadMult * (dualWield ? 1.5 : 1);
    ax += (Math.random() - 0.5) * spread * 2;
    ay += (Math.random() - 0.5) * spread * 2;
    az += (Math.random() - 0.5) * (stats.vzSpreadBase || spread) * 2;
  }
  const alen = Math.hypot(ax, ay, az);
  if (alen > 0.01) { ax /= alen; ay /= alen; az /= alen; }

  // Ray endpoints — use camera position if available
  const fromX = camPos ? camPos.x : shooter.x;
  const fromY = camPos ? camPos.y : shooter.y;
  const fromZ = eyeZ;
  const range = MAX_HITSCAN_RANGE;
  // True 3D ray — direction × range, then apply gravity drop
  const toX = fromX + ax * range;
  const toY = fromY + ay * range;
  const maxTravelTime = range / stats.speed;
  const maxDrop = 0.5 * BULLET_GRAVITY * maxTravelTime * maxTravelTime;
  const toZ = fromZ + az * range - maxDrop;

  // Lag compensation — rewind players for hit check
  const players = gameState.getPlayers();
  let playersForHit = players;
  if (fireServerTime != null) {
    let _SI = null;
    try { _SI = require('./game').SI; } catch (e) {}
    if (_SI) {
      const siVault = _SI.vault;
      const snapPair = siVault.get(fireServerTime);
      if (snapPair && snapPair.older && snapPair.newer) {
        const interp = _SI.interpolate(snapPair.older, snapPair.newer, fireServerTime, 'x y z');
        if (interp && interp.state) {
          const { _buildRewoundPlayers } = require('./combat');
          if (_buildRewoundPlayers) playersForHit = _buildRewoundPlayers(interp.state, players);
        }
      }
    }
  }

  // Check walls/barricades along the ray
  const walls = gameState.getWalls();
  const barricades = gameState.getBarricades();
  let blockT = 1.01;
  if (!stats.wallPiercing) {
    const wres = ballistics.segVsWalls(fromX, fromY, fromZ, toX, toY, toZ, walls, getTerrainHeight, WALL_HEIGHT);
    blockT = wres.blockT;
  }
  const bres = ballistics.segVsBarricades(fromX, fromY, fromZ, toX, toY, toZ, barricades, blockT);
  let hitBarricade = null;
  if (bres.hitBarricade && bres.hitBarricade.hp > 0) {
    blockT = bres.blockT;
    hitBarricade = bres.hitBarricade;
    // Apply damage to barricade
    hitBarricade.hp -= Math.round(stats.dmg * perkDmgMult * dmgMult);
    if (hitBarricade.hp <= 0) gameState.removeBarricade(hitBarricade.id);
  }

  // Check player hit
  const hitPlayer = ballistics.findPlayerHit(fromX, fromY, fromZ, toX, toY, toZ, playersForHit, shooter.id, blockT, eyeHeight || (() => 40));

  // Compute impact point
  let impactX, impactY, impactZ;
  let hitTargetId = null;
  let headshot = false;
  const dmg = stats.dmg * perkDmgMult * dmgMult;

  if (hitPlayer) {
    const p = hitPlayer._rewound ? players.get(hitPlayer.id) : hitPlayer;
    if (p && p.alive) {
      hitTargetId = p.id;
      headshot = !!hitPlayer._wasHeadshot;
      impactX = p.x; impactY = p.y; impactZ = p.z + 20;
      const dist = Math.hypot(p.x - fromX, p.y - fromY);
      const travelTime = dist / stats.speed;

      // Delayed damage
      const finalDmg = headshot ? dmg * 1.8 : dmg;
      const { applyHungerDelta, applyArmorDelta } = require('./player');
      gameState.scheduleRoundTimer(() => {
        const target = gameState.getPlayer(hitTargetId);
        if (!target || !target.alive) return;
        if (target.armor > 0) {
          applyArmorDelta(target, -finalDmg * 0.5);
          const remaining = finalDmg * 0.5;
          applyHungerDelta(target, -remaining, shooter.id);
        } else {
          applyHungerDelta(target, -finalDmg, shooter.id);
        }
        target.lastAttacker = shooter.id;
        target.stunTimer = Math.max(target.stunTimer || 0, 0.1);
      }, travelTime * 1000);
    }
  }

  if (!impactX) {
    // Hit wall/terrain/max range. Check terrain intersection by stepping
    // along the ray and finding where Z drops below terrain height.
    const t = Math.min(blockT, 1);
    impactX = fromX + (toX - fromX) * t;
    impactY = fromY + (toY - fromY) * t;
    impactZ = fromZ + (toZ - fromZ) * t;
    // Terrain collision — bisect to find where the ray crosses the ground
    const steps = 8;
    for (let s = 1; s <= steps; s++) {
      const st = (s / steps) * t;
      const sx = fromX + (toX - fromX) * st;
      const sy = fromY + (toY - fromY) * st;
      const sz = fromZ + (toZ - fromZ) * st;
      const th = getTerrainHeight(sx, sy);
      if (sz < th) {
        impactX = sx; impactY = sy; impactZ = th;
        break;
      }
    }
  }

  const dist = Math.hypot(impactX - fromX, impactY - fromY);
  const travelTime = dist / stats.speed;

  // Broadcast unreliable tracer
  broadcast({
    type: 'tracer',
    fromX, fromY, fromZ,
    toX: impactX, toY: impactY, toZ: impactZ,
    weapon, ownerId: shooter.id, color: shooter.color,
    travelTime,
    hit: hitTargetId, headshot,
  });

  return true;
}

// Main entry point. `stats` is the resolved (post-perk) per-shot numbers.
// Returns false if the projectile cap blocked the shot — in that case no
// state mutation happens (hunger/cooldown/ammo unchanged).
function fireWeapon(shooter, weapon, aim, stats, opts = {}) {
  // 200-projectile cap — formerly player-only. Now enforced for everyone.
  if (gameState.getProjectiles().length >= 200) return false;

  const {
    walkSpreadMult = 1,
    dualWield = false,
    fireMode = 'burst',
    emitMuzzleFlag = false,
    cdMult = 1,
    dmgMult = 1,
    eyeHeight,
    fireServerTime = null, // client-provided SI server time for lag comp
  } = opts;
  // Baseline extras shape — one object per fireWeapon call, shared across
  // all _spawnProjectile calls from this trigger pull. Individual paths
  // merge their own keys on top via `{...fdtExtras, volleyId}` etc.
  const fdtExtras = fireServerTime != null ? { fireServerTime } : null;

  const perkDmgMult = (shooter.perks && shooter.perks.damage) || 1;
  const eyeZ = shooter.z + (eyeHeight ? eyeHeight(shooter) : 0);
  const ax = aim.ax, ay = aim.ay, az = aim.az;

  // --- Shotgun: volleyed pellets, cone spread, dual-wield muzzle alternation ---
  if (stats.volleyed) {
    const volleyId = gameState.nextEntityId();
    // Hoist stats reads out of the 5-pellet loop.
    const { pellets, spreadBase, speed, spawnOffset, dmg: baseDmg, broadcastTag } = stats;
    const vzBase = stats.vzSpreadBase || 0;
    const pelletDmg = baseDmg * perkDmgMult * dmgMult;
    let muzzleSide = 0;
    if (dualWield) {
      shooter._shotgunAlt = !shooter._shotgunAlt;
      muzzleSide = shooter._shotgunAlt ? 1 : 0;
    }
    for (let b = 0; b < pellets; b++) {
      const spread = (Math.random() - 0.5) * spreadBase * walkSpreadMult;
      const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
      const by = ax * Math.sin(spread) + ay * Math.cos(spread);
      const spreadVz = az + (Math.random() - 0.5) * vzBase * walkSpreadMult;
      const broadcastExtras = { [broadcastTag]: b === 0 };
      if (emitMuzzleFlag) broadcastExtras.muzzle = muzzleSide;
      _spawnProjectile(
        shooter,
        shooter.x + bx * spawnOffset, shooter.y + by * spawnOffset, eyeZ,
        bx, by, spreadVz,
        speed, pelletDmg,
        fdtExtras ? { volleyId, fireServerTime, ...(stats.life != null ? { life: stats.life } : {}) } : { volleyId, ...(stats.life != null ? { life: stats.life } : {}) },
        broadcastExtras,
        0,
      );
    }
    const cd = dualWield && stats.cooldownDualMult !== undefined ? stats.cooldown * stats.cooldownDualMult : stats.cooldown;

    shooter.attackCooldown = cd * cdMult;
    if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - 1);
    return true;
  }

  // --- Burst-family weapons (M16A2, AUG): same fire pipeline, per-weapon
  // stats picked up via PLAYER_STATS_BASE/BOT_STATS. ---
  if (BURST_FAMILY.has(weapon)) {
    // Guard: if the weapon doesn't support the requested fireMode, fall
    // back to auto (prevents AKM/Thompson from entering burst path).
    let effectiveMode = fireMode;
    if (effectiveMode === 'burst' && !stats.burstStepMs) effectiveMode = 'auto';
    if (effectiveMode === 'semi' && !stats.semi) effectiveMode = 'auto';
    if (effectiveMode === 'auto' && stats.auto) {
      const a = stats.auto;
      const autoCount = dualWield ? (a.dualPelletMult || 1) : 1;
      const spread = a.spreadBase * walkSpreadMult * (dualWield ? 1.5 : 1);
      for (let ac = 0; ac < autoCount; ac++) {
        const sax = ax + (Math.random() - 0.5) * spread * 2;
        const say = ay + (Math.random() - 0.5) * spread * 2;
        const saz = az + (Math.random() - 0.5) * spread * 2;
        const dmg = a.dmg * perkDmgMult * dmgMult;
        const broadcastExtras = {};
        if (emitMuzzleFlag) broadcastExtras.muzzle = ac;
        _spawnProjectile(
          shooter,
          shooter.x + sax * stats.spawnOffset, shooter.y + say * stats.spawnOffset, eyeZ,
          sax, say, saz,
          a.speed, dmg,
          fdtExtras || {},
          broadcastExtras,
          0,
        );
      }
      shooter.attackCooldown = a.cooldown * cdMult;
      if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - autoCount);
      return true;
    }
    // Semi-auto: one projectile per trigger pull (dual wield doubles via
    // dualPelletMult), zero spread, same cooldown ceiling as auto so trigger
    // mashing can't exceed the sustained rate. Higher per-shot damage to
    // reward deliberate pacing.
    if (effectiveMode === 'semi' && stats.semi) {
      const s = stats.semi;
      const semiCount = dualWield ? (s.dualPelletMult || 1) : 1;
      for (let sc = 0; sc < semiCount; sc++) {
        const dmg = s.dmg * perkDmgMult * dmgMult;
        const broadcastExtras = {};
        if (emitMuzzleFlag) broadcastExtras.muzzle = sc;
        _spawnProjectile(
          shooter,
          shooter.x + ax * stats.spawnOffset, shooter.y + ay * stats.spawnOffset, eyeZ,
          ax, ay, az,
          s.speed, dmg,
          fdtExtras || {},
          broadcastExtras,
          0,
        );
      }
      shooter.attackCooldown = s.cooldown * cdMult;
      if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - semiCount);
      return true;
    }
    // Burst mode — 3 rounds at 650 RPM (92 ms between rounds), possibly two
    // parallel volleys when dual-wielding. Standing burst gets a small
    // spread cone (not quite perfect) to reward crouching; crouching burst
    // is zero-spread (pinpoint).
    const volleys = dualWield ? 2 : 1;
    // Hoist stats reads out of the 3×(1|2) nested loop.
    const { pellets: burstCount, burstOffsetStep, spawnOffset: burstSpawnOffset, speed: burstSpeed, dmg: burstBaseDmg, burstStepMs } = stats;
    const burstDmg = burstBaseDmg * perkDmgMult * dmgMult;
    // Standing adds ~0.008 rad (~0.5°) of cone; crouching (shooter.walking)
    // is zero. walkSpreadMult (0.73 when walking) is already folded in.
    const standingSpread = shooter.walking ? 0 : 0.008 * walkSpreadMult;
    for (let b = 0; b < burstCount; b++) {
      for (let v = 0; v < volleys; v++) {
        const offset = b * burstOffsetStep;
        // Dual-wield: perpendicular spawn offset separates the two barrels in
        // world space so third-person observers see two distinct streams, not
        // one merged line. Tuned to roughly match the viewmodel barrel spacing.
        const perpJitter = volleys > 1 ? ((v === 0 ? -1 : 1) * 10) : 0;
        const px = shooter.x + ax * (burstSpawnOffset + offset) + (-ay) * perpJitter;
        const py = shooter.y + ay * (burstSpawnOffset + offset) + ax * perpJitter;
        const volleyDelay = v * 25; // dual-wield volley offset so shot sounds don't overlap
        const delay = b * burstStepMs + volleyDelay;
        // Apply per-round standing spread (each round jitters independently,
        // so a standing 3-round burst lands in a small pattern not a laser).
        const sax = ax + (Math.random() - 0.5) * standingSpread * 2;
        const say = ay + (Math.random() - 0.5) * standingSpread * 2;
        const saz = az + (Math.random() - 0.5) * standingSpread * 2;
        const broadcastExtras = { burst: b === 0 && v === 0 };
        if (emitMuzzleFlag) broadcastExtras.muzzle = v;
        _spawnProjectile(
          shooter,
          px, py, eyeZ,
          sax, say, saz,
          burstSpeed, burstDmg,
          fdtExtras || {},
          broadcastExtras,
          delay,
        );
      }
    }

    shooter.attackCooldown = stats.cooldown * cdMult;
    if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - burstCount * volleys);
    return true;
  }

  // --- Generic: single projectile (normal pistol, bolty, cowtank) ---
  let sax = ax, say = ay, saz = az;
  if (stats.spreadBase > 0) {
    const pspread = stats.spreadBase * walkSpreadMult;
    sax = ax + (Math.random() - 0.5) * pspread * 2;
    say = ay + (Math.random() - 0.5) * pspread * 2;
    saz = az + (Math.random() - 0.5) * pspread * 2;
  }
  const dmg = stats.dmg * perkDmgMult * dmgMult;
  const extras = {};
  if (stats.explosive) { extras.explosive = true; extras.blastRadius = stats.blastRadius; }
  if (stats.wallPiercing) extras.wallPiercing = true;
  if (fireServerTime != null) extras.fireServerTime = fireServerTime;
  const broadcastExtras = {};
  if (stats.broadcastTag) broadcastExtras[stats.broadcastTag] = true;
  _spawnProjectile(
    shooter,
    shooter.x + sax * stats.spawnOffset, shooter.y + say * stats.spawnOffset, eyeZ,
    sax, say, saz,
    stats.speed, dmg,
    extras,
    broadcastExtras,
    0,
  );
  shooter.attackCooldown = stats.cooldown * cdMult;
  if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - 1);
  return true;
}

// PLAYER_STATS_BASE is intentionally NOT exported — external callers go through
// resolvePlayerStats so the hungerDiscount perk is always applied consistently.
// Single-shot disposables (cowtank) revert to normal pistol + refund the
// pistol mag after firing. Used by both player and bot fire paths so the
// client viewmodel/HUD swap stays consistent across shooter types.
function resetAfterCowtank(shooter) {
  shooter.weapon = 'normal';
  shooter.dualWield = false;
  shooter.ammo = Math.ceil(15 * (shooter.extMagMult || 1));
  shooter.reloading = 0;
  // No broadcast — weapon change rides next tick's player state.
}

module.exports = { fireWeapon, fireHitscan, resolvePlayerStats, extractShooterModifiers, BOT_STATS, resetAfterCowtank };
