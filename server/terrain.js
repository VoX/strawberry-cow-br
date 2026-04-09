const { MAP_W, MAP_H } = require('./config');

const GRID_W = 200, GRID_H = 150;
const heightMap = new Float32Array((GRID_W + 1) * (GRID_H + 1));
let currentSeed = 0;

function generateTerrain(seed) {
  currentSeed = seed;
  // Seeded parameters derived from seed
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
      const wx = col * MAP_W / GRID_W;
      const wz = row * MAP_H / GRID_H;
      const h = Math.sin(wx * s1) * a1 + Math.cos(wz * s2) * a2 + Math.sin(wx * s3 + wz * s4) * a3 + Math.cos(wx * s5 - wz * s6) * a4;
      heightMap[row * (GRID_W + 1) + col] = h;
    }
  }
}

// Generate initial terrain with a random seed
generateTerrain(Math.random() * 10000);

function getSeed() { return currentSeed; }

function getTerrainHeight(x, y) {
  const gx = Math.max(0, Math.min(GRID_W, x / MAP_W * GRID_W));
  const gy = Math.max(0, Math.min(GRID_H, y / MAP_H * GRID_H));
  const col = Math.floor(gx), row = Math.floor(gy);
  const fx = gx - col, fy = gy - row;
  const c1 = Math.min(col + 1, GRID_W), r1 = Math.min(row + 1, GRID_H);
  const h00 = heightMap[row * (GRID_W + 1) + col];
  const h10 = heightMap[row * (GRID_W + 1) + c1];
  const h01 = heightMap[r1 * (GRID_W + 1) + col];
  const h11 = heightMap[r1 * (GRID_W + 1) + c1];
  return h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy;
}

const WALL_HEIGHT = 70;
const TOWER_HEIGHT = 200;

function getStructureHeight() {
  return 0;
}

function getGroundHeight(x, y) {
  return getTerrainHeight(x, y) + getStructureHeight(x, y);
}

module.exports = { getTerrainHeight, getStructureHeight, getGroundHeight, generateTerrain, getSeed, WALL_HEIGHT, TOWER_HEIGHT };
