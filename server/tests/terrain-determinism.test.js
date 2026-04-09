// Terrain determinism regression test.
//
// Protects the invariant that server and client call the same terrain math
// with the same inputs and get bit-identical outputs. This is the foundation
// for client-side movement prediction (Phase 4 of docs/netcode-prediction-plan.md)
// — if server and client disagreed on getGroundHeight(x, y) by even 0.01 units,
// the local sim would diverge from the server and the player would rubber
// band every frame they were on the ground.
//
// The test seeds the shared terrain-math module with a fixed seed, samples a
// grid of positions, and asserts the sampled heights match a frozen fixture.
// If the sampled values drift, either the math was changed intentionally
// (regen the fixture) or there's a regression.

const assert = require('assert');
const { GRID_W, GRID_H, generateHeightMap, sampleHeight } = require('../../shared/terrain-math');
const { MAP_W, MAP_H } = require('../../shared/constants');

const SEED = 42;
const buf = new Float32Array((GRID_W + 1) * (GRID_H + 1));
generateHeightMap(SEED, buf, MAP_W, MAP_H);

// Sanity: buffer is populated (not all zeros).
let allZero = true;
for (let i = 0; i < buf.length; i++) {
  if (buf[i] !== 0) { allZero = false; break; }
}
assert.strictEqual(allZero, false, 'generated heightmap is all zeros');

// Sample 25 grid-aligned positions. Grid-aligned means fx = fy = 0 in the
// bilinear interpolation, so the sample equals a single cell of the buffer
// exactly (no float drift from interpolation).
const xs = [0, 100, 500, 999, 1500, MAP_W - 1];
const ys = [0, 100, 500, 999, 1499, MAP_H - 1];
const samples = [];
for (const x of xs) for (const y of ys) {
  samples.push({ x, y, h: sampleHeight(buf, MAP_W, MAP_H, x, y) });
}

// Basic invariants every sample must satisfy.
for (const s of samples) {
  assert(Number.isFinite(s.h), `terrain height at (${s.x}, ${s.y}) is not finite: ${s.h}`);
  assert(Math.abs(s.h) < 100, `terrain height at (${s.x}, ${s.y}) outside sanity range: ${s.h}`);
}

// Frozen fixture — if the terrain math changes, regenerate this block and
// document the reason in the commit message. Diffs here catch silent drift.
// Values captured from seed 42, MAP_W=2000, MAP_H=1500 with the current
// sum-of-4-sinusoids formula.
const FIXTURE = {
  // Grid-aligned samples — exercise the direct-lookup branch of bilinear.
  '0,0': 10.06252670288086,
  '0,100': 10.927787780761719,
  '500,500': 4.678067684173584,
  '1500,0': 23.774354934692383,
  '1000,750': -12.132000923156738,
  '1999,1499': -9.200368595123287,
  // Non-grid-aligned samples — exercise the actual bilinear interpolation
  // math (fx != 0 && fy != 0). Protects against drift in the lerp weights.
  '123.5,456.5': 11.528117597103119,
  '777.3,222.7': -14.23580310611725,
  '1234.56,789.01': 3.402794600515358,
};
for (const [key, expected] of Object.entries(FIXTURE)) {
  const [x, y] = key.split(',').map(Number);
  const actual = sampleHeight(buf, MAP_W, MAP_H, x, y);
  // Strict equality — if the formula changes even by 1 ULP, this fails.
  if (actual !== expected) {
    console.error(`[terrain-determinism] FIXTURE DRIFT at (${x}, ${y})`);
    console.error(`  expected: ${expected}`);
    console.error(`  actual:   ${actual}`);
    console.error(`  delta:    ${actual - expected}`);
    process.exit(1);
  }
}

// Second pass: verify the server's getTerrainHeight wrapper matches the
// shared module directly. This catches any drift introduced by the server
// wrapper (e.g. if server/terrain.js stopped calling sampleHeight).
const serverTerrain = require('../terrain');
serverTerrain.generateTerrain(SEED);
for (const s of samples) {
  const viaServer = serverTerrain.getTerrainHeight(s.x, s.y);
  assert.strictEqual(
    viaServer, s.h,
    `server/terrain.getTerrainHeight diverges from shared at (${s.x}, ${s.y}): server=${viaServer} shared=${s.h}`
  );
}

console.log(`terrain-determinism: ${samples.length} samples, ${Object.keys(FIXTURE).length} fixture points, all stable`);
