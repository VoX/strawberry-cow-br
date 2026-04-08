const { MAP_W, MAP_H } = require('./config');
const { rand } = require('./utils');
const state = require('./state');

function generateMap() {
  state.WALLS = [];
  state.MUD_PATCHES = [];
  state.HEAL_PONDS = [];
  state.PORTALS = [];
  state.SHELTERS = [];
  // Center tower wall
  state.WALLS.push({x: MAP_W/2 - 60, y: MAP_H/2 - 60, w: 120, h: 120});

  // Random L-shaped walls in corners (with variation)
  const corners = [
    {x: rand(200,400), y: rand(200,400)},
    {x: rand(1400,1700), y: rand(200,400)},
    {x: rand(200,400), y: rand(1000,1200)},
    {x: rand(1400,1700), y: rand(1000,1200)},
  ];
  for (const c of corners) {
    const horiz = Math.random() > 0.5;
    state.WALLS.push({x:c.x, y:c.y, w: horiz?rand(120,250):20, h: horiz?20:rand(120,250)});
    state.WALLS.push({x:c.x, y:c.y, w: horiz?20:rand(80,150), h: horiz?rand(80,150):20});
  }

  // Random center structures (1-3)
  const centerCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < centerCount; i++) {
    const cx = rand(600, 1400), cy = rand(500, 1000);
    const type = Math.random();
    if (type < 0.3) {
      state.WALLS.push({x:cx,y:cy,w:rand(100,200),h:20});
      state.WALLS.push({x:cx,y:cy+rand(100,180),w:rand(100,200),h:20});
      state.WALLS.push({x:cx,y:cy,w:20,h:rand(100,200)});
    } else if (type < 0.6) {
      state.WALLS.push({x:cx-60,y:cy,w:120,h:20});
      state.WALLS.push({x:cx,y:cy-60,w:20,h:120});
    } else {
      state.WALLS.push({x:cx,y:cy,w:20,h:rand(150,300)});
      state.WALLS.push({x:cx+rand(80,150),y:cy,w:20,h:rand(150,300)});
    }
  }

  // Random scattered walls (3-6)
  const scatterCount = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < scatterCount; i++) {
    const wx = rand(150, MAP_W - 150), wy = rand(150, MAP_H - 150);
    if (Math.random() > 0.5) state.WALLS.push({x:wx, y:wy, w:rand(60,180), h:20});
    else state.WALLS.push({x:wx, y:wy, w:20, h:rand(60,180)});
  }

  // Mud patches (3-5)
  const mudCount = 0;
  for (let i = 0; i < mudCount; i++) {
    state.MUD_PATCHES.push({x:rand(200,MAP_W-200), y:rand(200,MAP_H-200), r:rand(50,100)});
  }

  // Heal ponds (1-3)
  const pondCount = 0;
  for (let i = 0; i < pondCount; i++) {
    state.HEAL_PONDS.push({x:rand(150,MAP_W-150), y:rand(150,MAP_H-150), r:rand(40,60)});
  }

  // Portals (1-2 pairs)
  const portalCount = 0;
  for (let i = 0; i < portalCount; i++) {
    state.PORTALS.push({
      id: i,
      x1: rand(200, MAP_W/2 - 100), y1: rand(200, MAP_H - 200),
      x2: rand(MAP_W/2 + 100, MAP_W - 200), y2: rand(200, MAP_H - 200),
    });
  }

  // Shelters — touching the outer fence on one side
  state.SHELTERS.push({ x: MAP_W / 2, y: 60, r: 60 });
  state.SHELTERS.push({ x: MAP_W / 2, y: MAP_H - 60, r: 60 });
  state.SHELTERS.push({ x: 60, y: MAP_H / 2, r: 60 });
  state.SHELTERS.push({ x: MAP_W - 60, y: MAP_H / 2, r: 60 });
}

module.exports = { generateMap };
