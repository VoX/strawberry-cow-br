const { MAP_W, MAP_H } = require('./config');
const { rand } = require('./utils');
const state = require('./state');

const TOWER_CX = MAP_W / 2, TOWER_CY = MAP_H / 2, TOWER_CLEAR = 200;

function tooCloseToTower(x, y, w, h) {
  const cx = x + w / 2, cy = y + h / 2;
  return Math.abs(cx - TOWER_CX) < TOWER_CLEAR && Math.abs(cy - TOWER_CY) < TOWER_CLEAR;
}

function addWall(x, y, w, h) {
  if (!tooCloseToTower(x, y, w, h)) state.WALLS.push({x, y, w, h});
}

function generateMap() {
  state.WALLS = [];
  state.MUD_PATCHES = [];
  state.HEAL_PONDS = [];
  state.PORTALS = [];
  state.SHELTERS = [];
  // Random L-shaped walls in corners (with variation)
  const corners = [
    {x: rand(200,400), y: rand(200,400)},
    {x: rand(1400,1700), y: rand(200,400)},
    {x: rand(200,400), y: rand(1000,1200)},
    {x: rand(1400,1700), y: rand(1000,1200)},
  ];
  for (const c of corners) {
    const horiz = Math.random() > 0.5;
    addWall(c.x, c.y, horiz?rand(120,250):20, horiz?20:rand(120,250));
    addWall(c.x, c.y, horiz?20:rand(80,150), horiz?rand(80,150):20);
  }

  // Random center structures (1-3)
  const centerCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < centerCount; i++) {
    const cx = rand(600, 1400), cy = rand(500, 1000);
    const type = Math.random();
    if (type < 0.3) {
      addWall(cx, cy, rand(100,200), 20);
      addWall(cx, cy+rand(100,180), rand(100,200), 20);
      addWall(cx, cy, 20, rand(100,200));
    } else if (type < 0.6) {
      addWall(cx-60, cy, 120, 20);
      addWall(cx, cy-60, 20, 120);
    } else {
      addWall(cx, cy, 20, rand(150,300));
      addWall(cx+rand(80,150), cy, 20, rand(150,300));
    }
  }

  // Random scattered walls (3-6)
  const scatterCount = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < scatterCount; i++) {
    const wx = rand(150, MAP_W - 150), wy = rand(150, MAP_H - 150);
    if (Math.random() > 0.5) addWall(wx, wy, rand(60,180), 20);
    else addWall(wx, wy, 20, rand(60,180));
  }

  // Shelters — touching the outer fence on one side
  state.SHELTERS.push({ x: MAP_W / 2, y: 60, r: 60 });
  state.SHELTERS.push({ x: MAP_W / 2, y: MAP_H - 60, r: 60 });
  state.SHELTERS.push({ x: 60, y: MAP_H / 2, r: 60 });
  state.SHELTERS.push({ x: MAP_W - 60, y: MAP_H / 2, r: 60 });
}

module.exports = { generateMap };
