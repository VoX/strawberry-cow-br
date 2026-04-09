const { MAP_W, MAP_H } = require('./config');
const { GRID_W, GRID_H, generateHeightMap, sampleHeight } = require('../shared/terrain-math');

const heightMap = new Float32Array((GRID_W + 1) * (GRID_H + 1));
let currentSeed = 0;

function generateTerrain(seed) {
  currentSeed = seed;
  generateHeightMap(seed, heightMap, MAP_W, MAP_H);
}

// Generate initial terrain with a random seed
generateTerrain(Math.random() * 10000);

function getSeed() { return currentSeed; }

function getTerrainHeight(x, y) {
  return sampleHeight(heightMap, MAP_W, MAP_H, x, y);
}

const WALL_HEIGHT = 70;

function getGroundHeight(x, y) {
  return getTerrainHeight(x, y);
}

module.exports = { getTerrainHeight, getGroundHeight, generateTerrain, getSeed, WALL_HEIGHT };
