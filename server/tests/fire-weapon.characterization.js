#!/usr/bin/env node
// Characterization tests for fireWeapon (handleAttack in combat.js, fireBot in
// bots.js). Snapshot-based — first run writes fixtures, subsequent runs diff.
//
// Purpose: LOCK IN current behaviour bit-for-bit so upcoming unification work
// can be validated as a no-op. These tests intentionally do NOT assert
// anything about correctness — any drift from the captured behaviour is a
// failure, even if the "new" output is obviously better.
//
// Running:   node server/tests/fire-weapon.characterization.js
// Rewriting: node server/tests/fire-weapon.characterization.js --write
//
// Non-determinism handled:
//   - Math.random      → seeded Mulberry32 (seed=42)
//   - setTimeout       → patched to run the callback synchronously, so the
//                        burst-fire broadcasts land in deterministic order
//                        during test capture (preserves the ORDER relative to
//                        projectile creation; the original code emits them over
//                        80ms which is fine for production and irrelevant for
//                        a synchronous characterization capture)
//   - broadcast/gameState/terrain → fake modules injected via require.cache
//
// Non-determinism NOT fully handled (flagged in report):
//   - Date.now()       → placeBarricadeForPlayer uses it, but not in fireWeapon
//   - performance.now  → not used in fireWeapon
//   - Map iteration    → JavaScript Map preserves insertion order, so this is
//                        actually deterministic as long as we insert players in
//                        the same order each run

const fs = require('fs');
const path = require('path');
const { patchRandom, restoreRandom } = require('./seeded-rng');

// --- STEP 1: Install fakes BEFORE loading combat / bots -------------------
const fakes = require('./fire-weapon-fakes').install();

// --- STEP 2: Patch setTimeout to run sync (burst fire uses it for broadcast) ---
// We record the delays so fixtures can capture them, but execute callbacks
// immediately so the broadcast list is fully populated by the time we snapshot.
const _origSetTimeout = global.setTimeout;
const _origClearTimeout = global.clearTimeout;
let _pendingTimers = [];
global.setTimeout = function (fn, delay) {
  // Don't execute reload timers (they run far in the future and would mutate
  // ammo mid-test). Only flush timers whose delay is < 500ms — covers burst
  // broadcast delays (80ms * 3 = 240ms max) but skips full reloads (2000ms+).
  if (typeof delay === 'number' && delay < 500) {
    fn();
    return { _fake: true };
  }
  // Keep it pending but don't actually schedule — test cases never advance
  // real time, so this is effectively a no-op stash.
  const handle = { _fake: true, fn, delay };
  _pendingTimers.push(handle);
  return handle;
};
global.clearTimeout = function (handle) {
  if (handle && handle._fake) return;
  return _origClearTimeout.call(this, handle);
};

// --- STEP 3: Load the code under test ------------------------------------
// Must happen AFTER fakes are installed so they pick up the fakes.
const combat = require('../combat');
const bots = require('../bots');

// bots.js keeps fireBot private — we reach it indirectly by driving updateBots
// with a stubbed bot-ai intent that fires once in a fixed direction. The
// stub is installed via fakes.state.decideBotTurnOverride (wrappedBotAi
// trampolines through it at call time, so we can change the override between
// test cases even though bots.js destructures decideBotTurn at import time).

// --- Output paths ----------------------------------------------------------
const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'fire-weapon');
const WRITE_MODE = process.argv.includes('--write');

// --- Snapshot helpers -----------------------------------------------------
// Produce a stable JSON representation. Keys sorted recursively so diffs are
// noise-free. Numbers rounded to 6 decimals to kill double-precision jitter.
function stableStringify(obj) {
  return JSON.stringify(sortKeys(obj), null, 2);
}
function sortKeys(v) {
  if (v === null || typeof v !== 'object') {
    if (typeof v === 'number' && !Number.isInteger(v)) return Math.round(v * 1e6) / 1e6;
    return v;
  }
  if (Array.isArray(v)) return v.map(sortKeys);
  const out = {};
  for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
  return out;
}

// --- Shooter factories ----------------------------------------------------
// Baseline stats are intentionally simple + fixed so snapshots don't drift
// when unrelated config constants change.
function makePlayer(overrides = {}) {
  return {
    id: 100, name: 'TestPlayer', color: 0xffffff, isBot: false,
    x: 1000, y: 1000, z: 0, vz: 0,
    dx: 0, dy: 0, dir: 'south', aimAngle: 0,
    alive: true, hunger: 100, ammo: 50, reloading: 0,
    attackCooldown: 0, stunTimer: 0, spawnProtection: 0,
    walking: false, dualWield: false,
    weapon: 'normal', weaponTimer: 0, armor: 0,
    perks: { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1, damageReduction: 0 },
    weaponPerks: { cooldown: 1, hungerDiscount: 0, damageMult: 1 },
    ws: null,
    ...overrides,
  };
}

function makeBot(weapon, personality) {
  return {
    ...makePlayer({ id: 200, isBot: true, weapon, ammo: 50, personality }),
    botTarget: null, botActionTimer: 0,
    kills: 0, score: 0, xp: 0, level: 0, xpToNext: 50,
    foodEaten: 0, eating: false, eatTimer: 0,
    dashCooldown: 0, lastAttacker: null,
  };
}

// Captures the player's mutations so we can diff them against the initial state.
function mutationDiff(before, after) {
  const diff = {};
  for (const k of Object.keys(after).sort()) {
    const b = before[k], a = after[k];
    if (typeof a === 'object' && a !== null) continue;
    if (b !== a) diff[k] = a;
  }
  return diff;
}

// Drop fields that are irrelevant to behaviour snapshots (timers, ws refs).
// `life` is a TTL countdown, not a per-fire behaviour — ignored so TTL tuning
// doesn't force a snapshot regeneration.
const IGNORED_PROJ_FIELDS = new Set(['_firstTick', 'life', 'fireServerTime', 'ticksAlive']);
function cleanProjectile(p) {
  const out = {};
  for (const k of Object.keys(p).sort()) {
    if (IGNORED_PROJ_FIELDS.has(k)) continue;
    out[k] = p[k];
  }
  return out;
}

// --- Test harness ---------------------------------------------------------
const results = { passed: 0, failed: 0, written: 0 };

function runCase(name, fn) {
  fakes.reset();
  _pendingTimers = [];
  patchRandom(42);

  const beforePlayer = fn.shooterFactory();
  const player = JSON.parse(JSON.stringify(beforePlayer));
  fakes.fakePlayers.set(player.id, player);

  try {
    fn.run(player);
  } catch (e) {
    restoreRandom();
    console.error(`[FAIL] ${name}: threw ${e.message}`);
    results.failed++;
    return;
  }
  restoreRandom();

  const snapshot = {
    broadcasts: fakes.state.broadcasts.map(b => sortKeys(b)),
    projectiles: fakes.state.projectiles.map(p => sortKeys(cleanProjectile(p))),
    mutations: mutationDiff(beforePlayer, player),
  };
  const json = stableStringify(snapshot);
  const fixturePath = path.join(FIXTURE_DIR, `${name}.json`);

  if (WRITE_MODE || !fs.existsSync(fixturePath)) {
    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, json + '\n');
    results.written++;
    console.log(`[WRITE] ${name}`);
    return;
  }

  const expected = fs.readFileSync(fixturePath, 'utf8').trimEnd();
  if (expected === json) {
    results.passed++;
    // Quiet success
  } else {
    results.failed++;
    console.error(`[FAIL] ${name}: snapshot mismatch`);
    const expLines = expected.split('\n');
    const gotLines = json.split('\n');
    const max = Math.max(expLines.length, gotLines.length);
    let shown = 0;
    for (let i = 0; i < max && shown < 10; i++) {
      if (expLines[i] !== gotLines[i]) {
        console.error(`  line ${i}: expected ${JSON.stringify(expLines[i])}`);
        console.error(`  line ${i}:   actual ${JSON.stringify(gotLines[i])}`);
        shown++;
      }
    }
  }
}

// --- Test matrix -----------------------------------------------------------
const WEAPONS = ['normal', 'burst', 'shotgun', 'bolty', 'cowtank'];
const PERSONALITIES = ['aggressive', 'balanced', 'timid'];

function attackMsg(overrides = {}) {
  // Fire due east, slight upward aim.
  return { aimX: 1, aimY: 0, aimZ: 0.05, ...overrides };
}

// --- handleAttack matrix ---------------------------------------------------
for (const weapon of WEAPONS) {
  for (const walking of [false, true]) {
    const name = `handleAttack_${weapon}_walk${walking ? 1 : 0}`;
    runCase(name, {
      shooterFactory: () => makePlayer({ weapon, walking }),
      run: (p) => combat.handleAttack(p, attackMsg()),
    });
  }
}

// --- Dual-wield variants (only burst + shotgun support it) ----------------
for (const weapon of ['burst', 'shotgun']) {
  for (const walking of [false, true]) {
    const name = `handleAttack_${weapon}_dual_walk${walking ? 1 : 0}`;
    runCase(name, {
      shooterFactory: () => makePlayer({ weapon, walking, dualWield: true }),
      run: (p) => combat.handleAttack(p, attackMsg()),
    });
  }
}

// --- burst fire modes -----------------------------------------------------
runCase('handleAttack_burst_auto', {
  shooterFactory: () => makePlayer({ weapon: 'burst' }),
  run: (p) => combat.handleAttack(p, attackMsg({ fireMode: 'auto' })),
});
runCase('handleAttack_burst_auto_dual', {
  shooterFactory: () => makePlayer({ weapon: 'burst', dualWield: true }),
  run: (p) => combat.handleAttack(p, attackMsg({ fireMode: 'auto' })),
});

// --- fireBot matrix (invoked via updateBots with a stubbed bot-ai intent) --
// We stub decideBotTurn to return an intent that fires once at a stationary
// target and does nothing else. updateBots calls fireBot(p, ax, ay, target)
// for each intent.fires entry. Target has to satisfy eyeHeight() access.
const fakeTarget = makePlayer({ id: 999, x: 2000, y: 1000 });

for (const weapon of WEAPONS) {
  for (const personality of PERSONALITIES) {
    const name = `fireBot_${weapon}_${personality}`;
    runCase(name, {
      shooterFactory: () => makeBot(weapon, personality),
      run: (p) => {
        fakes.fakePlayers.set(fakeTarget.id, { ...fakeTarget });
        fakes.state.decideBotTurnOverride = () => ({
          dx: 0, dy: 0, aimAngle: 0,
          fires: [{ ax: 1, ay: 0, target: fakeTarget }],
          dash: null, barricade: null,
        });
        // updateBots only processes bots whose actionTimer has expired. Our
        // factory sets botActionTimer=0, so it runs on the first tick.
        bots.updateBots(0.05);
        fakes.state.decideBotTurnOverride = null;
      },
    });
  }
}

// --- Report ---------------------------------------------------------------
console.log(`\n${results.passed} passed, ${results.failed} failed, ${results.written} written`);
if (results.failed > 0) process.exit(1);
