const { MAP_W, MAP_H } = require('./config');
const { rand } = require('./utils');
const gameState = require('./game-state');

const TOWER_CX = MAP_W / 2, TOWER_CY = MAP_H / 2, TOWER_CLEAR = 200;

function tooCloseToTower(x, y, w, h) {
  const cx = x + w / 2, cy = y + h / 2;
  return Math.abs(cx - TOWER_CX) < TOWER_CLEAR && Math.abs(cy - TOWER_CY) < TOWER_CLEAR;
}

function addWall(x, y, w, h, extra) {
  if (!tooCloseToTower(x, y, w, h)) {
    const wall = { id: gameState.nextBarricadeId(), x, y, w, h, hp: 1 };
    if (extra) Object.assign(wall, extra);
    gameState.addWall(wall);
  }
}

// House: a rectangular footprint with 4 wall sides and a door gap in one side.
// cx/cy is the house CENTER; w/d are the outer dimensions; doorSide ∈ 'N'|'S'|'E'|'W'.
// Wall thickness is fixed at 20 (matching other walls). Door gap is 60 units wide.
function addHouse(cx, cy, w, d, doorSide) {
  const T = 20;         // wall thickness
  const DOOR_W = 60;    // door opening width
  const halfW = w / 2, halfD = d / 2;
  const left = cx - halfW, right = cx + halfW;
  const top = cy - halfD, bot = cy + halfD;
  const houseIdx = gameState.getHouses().length;
  // Tag each wall with houseIdx + houseSide so the client can tear down
  // windows/door/roof when the corresponding wall segments are destroyed.
  const addSideNS = (y, side) => {
    const tag = { houseIdx, houseSide: side };
    if (doorSide === side) {
      const gapStart = cx - DOOR_W / 2;
      const gapEnd = cx + DOOR_W / 2;
      const leftLen = gapStart - left;
      const rightLen = right - gapEnd;
      if (leftLen > 0) addWall(left, y, leftLen, T, tag);
      if (rightLen > 0) addWall(gapEnd, y, rightLen, T, tag);
    } else {
      addWall(left, y, w, T, tag);
    }
  };
  const addSideEW = (x, side) => {
    const tag = { houseIdx, houseSide: side };
    if (doorSide === side) {
      const gapStart = cy - DOOR_W / 2;
      const gapEnd = cy + DOOR_W / 2;
      const topLen = gapStart - (top + T);
      const botLen = (bot - T) - gapEnd;
      if (topLen > 0) addWall(x, top + T, T, topLen, tag);
      if (botLen > 0) addWall(x, gapEnd, T, botLen, tag);
    } else {
      addWall(x, top + T, T, d - 2 * T, tag);
    }
  };
  addSideNS(top, 'N');
  addSideNS(bot - T, 'S');
  addSideEW(left, 'W');
  addSideEW(right - T, 'E');
  gameState.addHouse({ cx, cy, w, d, doorSide });
}

function generateMap() {
  // (gameState.resetRound() already cleared these collections before we were called.)

  // One house roughly off-center, door facing south so the player can walk in from open ground.
  // Size is modest so it fits between the scattered walls but is big enough to be a shelter.
  const houseCx = rand(500, MAP_W - 500);
  const houseCy = rand(400, MAP_H - 400);
  const doorSides = ['N', 'S', 'E', 'W'];
  addHouse(houseCx, houseCy, 180, 160, doorSides[Math.floor(Math.random() * 4)]);
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
  gameState.addShelter({ x: MAP_W / 2, y: 60, r: 60 });
  gameState.addShelter({ x: MAP_W / 2, y: MAP_H - 60, r: 60 });
  gameState.addShelter({ x: 60, y: MAP_H / 2, r: 60 });
  gameState.addShelter({ x: MAP_W - 60, y: MAP_H / 2, r: 60 });

  // --- Survival landmarks ---
  // The Barn — large central structure, main gathering hub
  addHouse(MAP_W / 2, MAP_H / 2, 240, 200, 'S');

  // Milking Station — east side, scrap-heavy area
  addHouse(MAP_W - 350, MAP_H / 2, 160, 140, 'W');

  // Hay Fields outpost — west side, food-rich area
  addHouse(350, MAP_H / 2, 140, 120, 'E');

  // Quarry shelter — south, near stone/metal resources
  addHouse(MAP_W / 2, MAP_H - 250, 160, 140, 'N');
}

module.exports = { generateMap };
