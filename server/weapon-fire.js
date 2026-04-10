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
const { applyHungerDelta } = require('./player');
const { BURST_FAMILY } = require('../shared/constants');

// Shared mag sizes — re-exported so combat.js reload logic can reference them.
const MAG_SIZES = { normal: 15, burst: 20, shotgun: 6, bolty: 5, aug: 30 };

// --- Player base stats ----------------------------------------------------
// Every cost/gate has the shape (minFloor, base) so `Math.max(minFloor, base - hungerDiscount)`
// produces the effective per-shot number. Matches the original combat.js
// expressions exactly.
const PLAYER_STATS_BASE = {
  normal: {
    hungerGate: [1, 3], hungerCost: [1, 2],
    cooldown: 0.6, dmg: 8, speed: 1400, spreadBase: 0.0286, pellets: 1, spawnOffset: 40,
  },
  burst: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    // Burst-cycle cooldown (time between 3-round bursts, not between rounds
    // inside a burst — that's the 92 ms delay hardcoded in the burst loop).
    // 92 ms intra-burst = ~650 RPM, which is +30% over the auto rate by design.
    cooldown: 0.8, dmg: 6, speed: 1760, spreadBase: 0, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    burstStepMs: 92, // intra-burst delay — 650 RPM
    // Auto variant — used when fireMode === 'auto'. 0.12 s cooldown = ~500 RPM.
    auto: { hungerCost: [1, 2], cooldown: 0.12, dmg: 3, speed: 1600, spreadBase: 0.022, pellets: 1, dualPelletMult: 2 },
    // Semi-auto variant — 1 shot per trigger pull, half the cooldown of
    // full-auto so the sustained fire ceiling is ~250 RPM. Same per-shot
    // damage and milk drain as auto so the mode is purely a "controlled
    // pacing" choice, not a damage trade. Zero spread, deliberate shots.
    semi: { hungerCost: [1, 2], cooldown: 0.24, dmg: 3, speed: 1760, spreadBase: 0, pellets: 1, dualPelletMult: 2 },
  },
  shotgun: {
    hungerGate: [3, 10], hungerCost: [3, 9],
    cooldown: 0.9, cooldownDualMult: 0.55 / 0.9, // dual benelli halves cooldown; matches original 0.55
    dmg: 5, speed: 1200, spreadBase: 0.157, pellets: 5, spawnOffset: 40,
    volleyed: true, broadcastTag: 'shotgun', vzSpreadBase: 0.2,
  },
  bolty: {
    hungerGate: [3, 8], hungerCost: [3, 7],
    cooldown: 2.5, dmg: 28, speed: 16800, spreadBase: 0, pellets: 1, spawnOffset: 40,
    wallPiercing: true, broadcastTag: 'bolty',
  },
  cowtank: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 1.0, dmg: 38, speed: 2000, spreadBase: 0, pellets: 1, spawnOffset: 40,
    explosive: true, blastRadius: 180, broadcastTag: 'cowtank',
  },
  // AUG — bullpup rifle with integrated 2x optic. Solo only (the
  // weapons.js dual-wield gate doesn't include 'aug'). Auto = 450 RPM
  // (slower than the M16's 500), burst = +30% cycle rate vs auto. Same
  // per-shot damage as the M16 family but tighter spread because of
  // the optic; client multiplies hipfire spread/recoil by 1.5x when
  // not scoped.
  aug: {
    hungerGate: [2, 6], hungerCost: [2, 5],
    cooldown: 0.615, dmg: 6, speed: 2024, spreadBase: 0, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    burstStepMs: 92,
    auto: { hungerCost: [1, 2], cooldown: 0.133, dmg: 3, speed: 1840, spreadBase: 0.022, pellets: 1, dualPelletMult: 1 },
    semi: { hungerCost: [1, 2], cooldown: 0.266, dmg: 3, speed: 2024, spreadBase: 0, pellets: 1, dualPelletMult: 1 },
  },
};

// --- Bot stats ------------------------------------------------------------
// Final values (no hungerDiscount). Kept separate so bot nerfs can diverge
// from player numbers at will.
const BOT_STATS = {
  normal:  { hungerGate: 10, hungerCost: 3, cooldown: 1.0, dmg: 8,  speed: 1400, spreadBase: 0, pellets: 1, spawnOffset: 40 },
  burst:   {
    hungerGate: 4, hungerCost: 5, cooldown: 0.8, dmg: 6, speed: 1600, spreadBase: 0, pellets: 3, spawnOffset: 40, burstOffsetStep: 15,
    auto: { hungerCost: 1, cooldown: 0.1, dmg: 3, speed: 1600, spreadBase: 0.035, pellets: 1 },
  },
  shotgun: { hungerGate: 7, hungerCost: 7, cooldown: 1.0, dmg: 5, speed: 1200, spreadBase: 0.2, pellets: 5, spawnOffset: 40, volleyed: true, broadcastTag: 'shotgun', vzSpreadBase: 0.2 },
  bolty:   { hungerGate: 12, hungerCost: 8, cooldown: 2.5, dmg: 28, speed: 16800, spreadBase: 0, pellets: 1, spawnOffset: 40, wallPiercing: true, broadcastTag: 'bolty' },
  cowtank: { hungerGate: 6, hungerCost: 5, cooldown: 1.0, dmg: 38, speed: 2000, spreadBase: 0, pellets: 1, spawnOffset: 40, explosive: true, blastRadius: 180, broadcastTag: 'cowtank' },
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
// added in one place. `extras.fireDisplayTick` is the client's render tick
// at fire time for lag comp — null for bots and server-originated shots,
// which makes updateProjectiles skip the rewind lookup (live positions).
function _spawnProjectile(shooter, posX, posY, posZ, dirX, dirY, dirZ, speed, dmg, extras, broadcastExtras, delayMs) {
  const projId = gameState.nextEntityId();
  const proj = {
    id: projId,
    ownerId: shooter.id,
    x: posX, y: posY, z: posZ,
    vx: dirX * speed, vy: dirY * speed, vz: dirZ * speed,
    life: 3,
    dmg,
    fireDisplayTick: extras && extras.fireDisplayTick != null ? extras.fireDisplayTick : null,
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
    fireDisplayTick = null, // Phase 6: client-provided render tick for lag comp
  } = opts;
  // Baseline extras shape — one object per fireWeapon call, shared across
  // all _spawnProjectile calls from this trigger pull. Individual paths
  // merge their own keys on top via `{...fdtExtras, volleyId}` etc.
  const fdtExtras = fireDisplayTick != null ? { fireDisplayTick } : null;

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
        fdtExtras ? { volleyId, fireDisplayTick } : { volleyId },
        broadcastExtras,
        0,
      );
    }
    const cd = dualWield && stats.cooldownDualMult !== undefined ? stats.cooldown * stats.cooldownDualMult : stats.cooldown;
    applyHungerDelta(shooter, -stats.hungerCost * (dualWield ? 0.5 : 1));
    shooter.attackCooldown = cd * cdMult;
    if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - 1);
    return true;
  }

  // --- Burst-family weapons (M16A2, AUG): same fire pipeline, per-weapon
  // stats picked up via PLAYER_STATS_BASE/BOT_STATS. ---
  if (BURST_FAMILY.has(weapon)) {
    // Full-auto: continuous fire, 500 RPM (0.12s cooldown). Dual wield
    // doubles the projectiles per trigger tick via dualPelletMult.
    if (fireMode === 'auto' && stats.auto) {
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
      applyHungerDelta(shooter, -a.hungerCost * (dualWield ? 0.5 : 1));
      shooter.attackCooldown = a.cooldown * cdMult;
      if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - autoCount);
      return true;
    }
    // Semi-auto: one projectile per trigger pull (dual wield doubles via
    // dualPelletMult), zero spread, same cooldown ceiling as auto so trigger
    // mashing can't exceed the sustained rate. Higher per-shot damage to
    // reward deliberate pacing.
    if (fireMode === 'semi' && stats.semi) {
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
      applyHungerDelta(shooter, -s.hungerCost * (dualWield ? 0.5 : 1));
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
    applyHungerDelta(shooter, -stats.hungerCost * (dualWield ? 0.5 : 1));
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
  if (fireDisplayTick != null) extras.fireDisplayTick = fireDisplayTick;
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
  applyHungerDelta(shooter, -stats.hungerCost);
  shooter.attackCooldown = stats.cooldown * cdMult;
  if (MAG_SIZES[weapon]) shooter.ammo = Math.max(0, shooter.ammo - 1);
  return true;
}

// PLAYER_STATS_BASE is intentionally NOT exported — external callers go through
// resolvePlayerStats so the hungerDiscount perk is always applied consistently.
module.exports = { fireWeapon, resolvePlayerStats, extractShooterModifiers, BOT_STATS, MAG_SIZES };
