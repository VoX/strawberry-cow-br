// Deterministic terrain heightmap math — single source of truth for client and server.
// Both sides import from this module so CSP can trust that
// `getGroundHeight(x, y)` is bit-identical regardless of which side runs it.
//
// Any edit to generateHeightMap or sampleHeight here ships to both sides in
// lockstep via a single import. The regression test in
// server/tests/terrain-determinism.test.js pins a specific seed and asserts
// stable outputs so silent drift is impossible.

const GRID_W = 200, GRID_H = 150;

// Fill a Float32Array of size (GRID_W+1)*(GRID_H+1) with seeded heights.
// Formula is sum-of-4-sinusoids at seed-derived frequencies and amplitudes.
// Caller owns the buffer so we can reuse one allocation per process.
function generateHeightMap(seed, heightMap, mapW, mapH) {
  const s1 = Math.sin(seed * 1.1) * 0.002 + 0.004;
  const s2 = Math.cos(seed * 2.3) * 0.002 + 0.005;
  const s3 = Math.sin(seed * 3.7) * 0.004 + 0.01;
  const s4 = Math.cos(seed * 4.1) * 0.003 + 0.007;
  const s5 = Math.sin(seed * 5.3) * 0.001 + 0.003;
  const s6 = Math.cos(seed * 6.7) * 0.002 + 0.004;
  const a1 = 15 + Math.sin(seed * 7.1) * 8;
  const a2 = 12 + Math.cos(seed * 8.3) * 6;
  const a3 = 8 + Math.sin(seed * 9.7) * 5;
  const a4 = 10 + Math.cos(seed * 10.1) * 6;
  for (let row = 0; row <= GRID_H; row++) {
    for (let col = 0; col <= GRID_W; col++) {
      const wx = col * mapW / GRID_W;
      const wz = row * mapH / GRID_H;
      const h = Math.sin(wx * s1) * a1
              + Math.cos(wz * s2) * a2
              + Math.sin(wx * s3 + wz * s4) * a3
              + Math.cos(wx * s5 - wz * s6) * a4;
      heightMap[row * (GRID_W + 1) + col] = h;
    }
  }
}

// Bilinear sample from a heightmap built by generateHeightMap.
function sampleHeight(heightMap, mapW, mapH, x, y) {
  const gx = Math.max(0, Math.min(GRID_W, x / mapW * GRID_W));
  const gy = Math.max(0, Math.min(GRID_H, y / mapH * GRID_H));
  const col = Math.floor(gx), row = Math.floor(gy);
  const fx = gx - col, fy = gy - row;
  const c1 = Math.min(col + 1, GRID_W), r1 = Math.min(row + 1, GRID_H);
  const h00 = heightMap[row * (GRID_W + 1) + col];
  const h10 = heightMap[row * (GRID_W + 1) + c1];
  const h01 = heightMap[r1 * (GRID_W + 1) + col];
  const h11 = heightMap[r1 * (GRID_W + 1) + c1];
  return h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy;
}

module.exports = { GRID_W, GRID_H, generateHeightMap, sampleHeight };
