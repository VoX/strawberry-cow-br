// Movement integrator characterization test.
//
// Exercises shared/movement.js::stepPlayerMovement with seeded world state
// and frozen input frames. Asserts final player position/velocity/direction
// match a pinned fixture. Any drift here means the integrator behavior
// changed — either intentionally (regen the fixture in the commit) or as
// a regression (root cause and fix).
//
// This is the load-bearing regression guard for Phase 4 CSP: if the server
// and client call this function on the same inputs and get different
// answers, prediction will rubber band. The test pins the output once so
// later changes (the extraction alone, or the eventual client-side call
// during CSP) can be verified against it.

const assert = require('assert');
const { stepPlayerMovement } = require('../../shared/movement');
const { pushOutOfWalls } = require('../ballistics');

// Flat terrain at z=0 so height physics is deterministic without needing
// the real seeded heightmap. (The heightmap has its own regression test in
// terrain-determinism.test.js.)
const terrain = {
  getGroundHeight: () => 0,
  WALL_HEIGHT: 70,
};

function makePlayer(overrides = {}) {
  return Object.assign({
    id: 1, isBot: false, alive: true,
    x: 1000, y: 750, z: 0, vz: 0, onGround: true,
    dx: 0, dy: 0, walking: false,
    stunTimer: 0, spawnProtection: 0,
    foodEaten: 0,
    dir: 'south',
    perks: { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1 },
  }, overrides);
}

function makeWorld(overrides = {}) {
  return Object.assign({
    walls: [],
    barricades: [],
    mudPatches: [],
    portals: [],
    zone: { x: 0, y: 0, w: 2000, h: 1500 },
  }, overrides);
}

const DT = 1 / 30;
let pass = 0, fail = 0;

function runCase(name, fn) {
  try {
    fn();
    pass++;
    console.log('  pass  ' + name);
  } catch (e) {
    fail++;
    console.error('  FAIL  ' + name);
    console.error('        ' + (e.message || e));
  }
}

// ---- Case 1: idle ---------------------------------------------------------
// Stationary player with no input should not move. z settles on ground.
runCase('idle player stays put', () => {
  const p = makePlayer();
  const w = makeWorld();
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(p.x, 1000);
  assert.strictEqual(p.y, 750);
  assert.strictEqual(p.z, 0);
  assert.strictEqual(p.onGround, true);
});

// ---- Case 2: forward movement ---------------------------------------------
// One tick at 108 u/s * 1/30 s = 3.6 u in +y.
runCase('forward movement delta', () => {
  const p = makePlayer();
  const w = makeWorld();
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 1, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(Math.abs(p.y - 753.6) < 0.001, true, `y=${p.y}`);
  assert.strictEqual(p.dir, 'south');
});

// ---- Case 3: walking is 50% speed -----------------------------------------
runCase('walking halves movement', () => {
  const p = makePlayer();
  const w = makeWorld();
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 1, walking: true }, terrain, pushOutOfWalls);
  assert.strictEqual(Math.abs(p.y - 751.8) < 0.001, true, `y=${p.y}`);
});

// ---- Case 4: stun blocks movement -----------------------------------------
// A stunned player decrements stunTimer but shouldn't translate.
runCase('stun blocks movement delta', () => {
  const p = makePlayer({ stunTimer: 1.0 });
  const w = makeWorld();
  stepPlayerMovement(p, DT, w, { dx: 1, dy: 0, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(p.x, 1000);
  assert.strictEqual(p.y, 750);
  assert(p.stunTimer < 1.0, 'stunTimer did not decrement');
});

// ---- Case 5: spawn protection early-returns -------------------------------
runCase('spawn protection decrements and skips', () => {
  const p = makePlayer({ spawnProtection: 1.5, x: 0, y: 0 });
  const w = makeWorld();
  stepPlayerMovement(p, DT, w, { dx: 1, dy: 1, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(p.x, 0);
  assert.strictEqual(p.y, 0);
  assert(p.spawnProtection < 1.5, 'spawnProtection did not decrement');
});

// ---- Case 6: mud slows to 50% ---------------------------------------------
runCase('mud patch applies slowdown', () => {
  const p = makePlayer({ x: 1000, y: 750 });
  const w = makeWorld({ mudPatches: [{ x: 1000, y: 750, r: 100 }] });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 1, walking: false }, terrain, pushOutOfWalls);
  // 108 * 0.5 * 1/30 = 1.8
  assert.strictEqual(Math.abs(p.y - 751.8) < 0.001, true, `y=${p.y}`);
});

// ---- Case 7: portal teleport ----------------------------------------------
runCase('portal teleports to paired endpoint', () => {
  const p = makePlayer({ x: 100, y: 100 });
  const w = makeWorld({
    portals: [{ x1: 100, y1: 100, x2: 1800, y2: 1400 }],
  });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(p.x, 1800);
  assert.strictEqual(p.y, 1400);
  // Portal sets cooldown to 2 then the same tick decrements by dt → 2 - 1/30.
  assert(Math.abs(p._portalCooldown - (2 - DT)) < 1e-9, `cooldown=${p._portalCooldown}`);
});

// ---- Case 8: portal cooldown blocks re-teleport ---------------------------
runCase('portal cooldown prevents immediate retrigger', () => {
  const p = makePlayer({ x: 100, y: 100, _portalCooldown: 1.5 });
  const w = makeWorld({
    portals: [{ x1: 100, y1: 100, x2: 1800, y2: 1400 }],
  });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  // Did not teleport
  assert.strictEqual(p.x, 100);
  assert.strictEqual(p.y, 100);
  // Cooldown decremented
  assert(p._portalCooldown < 1.5, 'portal cooldown did not decrement');
});

// ---- Case 9: zone clamp ---------------------------------------------------
runCase('zone clamp keeps player inside boundary', () => {
  const p = makePlayer({ x: -50, y: -50 });
  const w = makeWorld({ zone: { x: 0, y: 0, w: 2000, h: 1500 } });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(p.x, 20);
  assert.strictEqual(p.y, 20);
});

// ---- Case 10: wall push-out -----------------------------------------------
runCase('wall collision pushes player out', () => {
  const p = makePlayer({ x: 1000, y: 750 });
  // Wall inflates by 15 on each side, so a 40-wide wall at (985, 735) covers
  // x:[970, 1040], y:[720, 790] after inflation. Player at (1000, 750) is
  // inside. Nearest edge is 30 units to the right → p.x = 1040.
  const w = makeWorld({
    walls: [{ id: 1, x: 985, y: 735, w: 40, h: 40, hp: 1 }],
  });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  // Expect push-out to one of the four edges (whichever has minimum escape).
  const insideX = p.x > 985 - 15 && p.x < 985 + 40 + 15;
  const insideY = p.y > 735 - 15 && p.y < 735 + 40 + 15;
  assert(!(insideX && insideY), `player still inside wall: (${p.x}, ${p.y})`);
});

// ---- Case 11: gravity + ground clamp --------------------------------------
runCase('airborne player falls and lands', () => {
  const p = makePlayer({ z: 100, vz: 0 });
  const w = makeWorld();
  // 100 ticks of gravity should eventually land.
  for (let i = 0; i < 100; i++) {
    stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  }
  assert.strictEqual(p.z, 0);
  assert.strictEqual(p.vz, 0);
  assert.strictEqual(p.onGround, true);
});

// ---- Case 12: bot aim auto-orient -----------------------------------------
runCase('bot aim updates from movement direction', () => {
  const p = makePlayer({ isBot: true });
  const w = makeWorld();
  stepPlayerMovement(p, DT, w, { dx: 1, dy: 0, walking: false }, terrain, pushOutOfWalls);
  // For (dx=1, dy=0), nx=1, ny=0 → atan2(-1, 0) = -π/2.
  assert.strictEqual(Math.abs(p.aimAngle + Math.PI / 2) < 0.001, true, `aimAngle=${p.aimAngle}`);
});

// ---- Case 13: barricade OBB push-out (axis-aligned) -----------------------
// Barricade at (1000, 750) with angle=0: local x is the "thin" axis (half=
// b.h/2+15=19), local y is the "wide" axis (half=b.w/2+15=41). Player starts
// exactly at center so both lx and ly are 0. Shallowest escape is along thin
// → newLx=±19 → world p.x ends up ±19 from center.
runCase('barricade OBB push-out axis-aligned', () => {
  const p = makePlayer({ x: 1000, y: 750, z: 0 });
  const barricade = {
    id: 1, cx: 1000, cy: 750, w: 52, h: 8, angle: 0,
    _cosA: 1, _sinA: 0, _terrainH: 0,
  };
  const w = makeWorld({ barricades: [barricade] });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  assert.strictEqual(Math.abs(p.x - 1000), 19, `x push=${p.x - 1000}`);
  assert.strictEqual(p.y, 750, 'y should not have moved');
});

// ---- Case 14: barricade ignored when player is above top ------------------
runCase('barricade push-out skipped when p.z > bTop', () => {
  const p = makePlayer({ x: 1000, y: 750, z: 100 }); // way above bTop = 0 + 55
  const barricade = {
    id: 1, cx: 1000, cy: 750, w: 52, h: 8, angle: 0,
    _cosA: 1, _sinA: 0, _terrainH: 0,
  };
  const w = makeWorld({ barricades: [barricade] });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  // No push-out — player stays exactly where they were.
  assert.strictEqual(p.x, 1000);
  assert.strictEqual(p.y, 750);
});

// ---- Case 15: jumping upward rises and falls back -------------------------
runCase('jumping player rises then lands', () => {
  const p = makePlayer({ z: 0, vz: 200 }); // kicking off with +vz
  const w = makeWorld();
  let peakZ = 0;
  for (let i = 0; i < 60; i++) {
    stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
    if (p.z > peakZ) peakZ = p.z;
  }
  assert(peakZ > 0, `player did not rise: peakZ=${peakZ}`);
  assert.strictEqual(p.z, 0, 'player did not return to ground');
  assert.strictEqual(p.vz, 0);
});

// ---- Case 16: wall z-gate lets a jumping player skim over ------------------
// Player airborne well above the wall top — z-gate should skip push-out.
runCase('airborne player skips wall collision', () => {
  const p = makePlayer({ x: 1000, y: 750, z: 100, vz: 0 });
  const wallCenter = { x: 985, y: 735, w: 40, h: 40, id: 1 };
  // With terrain.getGroundHeight returning 0 and WALL_HEIGHT=70, wall top is 70.
  // p.z=100 is above that — should NOT be pushed.
  const w = makeWorld({ walls: [wallCenter] });
  stepPlayerMovement(p, DT, w, { dx: 0, dy: 0, walking: false }, terrain, pushOutOfWalls);
  // Gravity pulls z down but x/y should not move.
  assert.strictEqual(p.x, 1000, `x moved: ${p.x}`);
  assert.strictEqual(p.y, 750, `y moved: ${p.y}`);
});

// ---- Done -----------------------------------------------------------------
console.log(`\nmovement.characterization: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
