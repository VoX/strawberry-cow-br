const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = 20021;
const TICK_RATE = 20;
const MAP_W = 2000, MAP_H = 1500;
const COLORS = ['pink','blue','green','gold','purple'];
const FOOD_TYPES = [
  {name:'strawberry',hunger:15,pts:10},
  {name:'cake',hunger:30,pts:25},
  {name:'pizza',hunger:20,pts:15},
  {name:'icecream',hunger:25,pts:20},
  {name:'donut',hunger:18,pts:12},
  {name:'cupcake',hunger:22,pts:18},
  {name:'cookie',hunger:12,pts:8},
];

let nextId = 1;
let gameState = 'lobby';
let lobbyTimer = null;
let lobbyCountdown = 30;
let restartTimer = null;
let players = new Map();
let foods = [];
let foodIdCounter = 1;
let tickInterval = null;
let aliveCount = 0;
let gameTime = 0; // seconds since game start
let zone = { x: 0, y: 0, w: MAP_W, h: MAP_H };
let projectiles = [];
let weaponPickups = [];
let armorPickups = []; // {id, x, y, weapon:'shotgun'|'burst'|'bolty'}
const WEAPON_TYPES = ['shotgun','burst','bolty','shotgun','burst','bolty','cowtank']; // cowtank is rarer (1/7 chance)

// Map features — regenerated each game
let WALLS = [];
let MUD_PATCHES = [];
let HEAL_PONDS = [];
let PORTALS = [];
let SHELTERS = []; // {x,y,r} — protect from cowstrike

function generateMap() {
  WALLS = [];
  MUD_PATCHES = [];
  HEAL_PONDS = [];
  PORTALS = [];
  SHELTERS = [];
  // Center tower wall
  WALLS.push({x: MAP_W/2 - 60, y: MAP_H/2 - 60, w: 120, h: 120});

  // Random L-shaped walls in corners (with variation)
  const corners = [
    {x: rand(200,400), y: rand(200,400)},
    {x: rand(1400,1700), y: rand(200,400)},
    {x: rand(200,400), y: rand(1000,1200)},
    {x: rand(1400,1700), y: rand(1000,1200)},
  ];
  for (const c of corners) {
    const horiz = Math.random() > 0.5;
    WALLS.push({x:c.x, y:c.y, w: horiz?rand(120,250):20, h: horiz?20:rand(120,250)});
    WALLS.push({x:c.x, y:c.y, w: horiz?20:rand(80,150), h: horiz?rand(80,150):20});
  }

  // Random center structures (1-3)
  const centerCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < centerCount; i++) {
    const cx = rand(600, 1400), cy = rand(500, 1000);
    const type = Math.random();
    if (type < 0.3) {
      // Box
      WALLS.push({x:cx,y:cy,w:rand(100,200),h:20});
      WALLS.push({x:cx,y:cy+rand(100,180),w:rand(100,200),h:20});
      WALLS.push({x:cx,y:cy,w:20,h:rand(100,200)});
    } else if (type < 0.6) {
      // Cross
      WALLS.push({x:cx-60,y:cy,w:120,h:20});
      WALLS.push({x:cx,y:cy-60,w:20,h:120});
    } else {
      // Corridor
      WALLS.push({x:cx,y:cy,w:20,h:rand(150,300)});
      WALLS.push({x:cx+rand(80,150),y:cy,w:20,h:rand(150,300)});
    }
  }

  // Random scattered walls (3-6)
  const scatterCount = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < scatterCount; i++) {
    const wx = rand(150, MAP_W - 150), wy = rand(150, MAP_H - 150);
    if (Math.random() > 0.5) WALLS.push({x:wx, y:wy, w:rand(60,180), h:20});
    else WALLS.push({x:wx, y:wy, w:20, h:rand(60,180)});
  }

  // Mud patches (3-5)
  const mudCount = 0;
  for (let i = 0; i < mudCount; i++) {
    MUD_PATCHES.push({x:rand(200,MAP_W-200), y:rand(200,MAP_H-200), r:rand(50,100)});
  }

  // Heal ponds (1-3)
  const pondCount = 0;
  for (let i = 0; i < pondCount; i++) {
    HEAL_PONDS.push({x:rand(150,MAP_W-150), y:rand(150,MAP_H-150), r:rand(40,60)});
  }

  // Portals (1-2 pairs)
  const portalCount = 0;
  for (let i = 0; i < portalCount; i++) {
    PORTALS.push({
      id: i,
      x1: rand(200, MAP_W/2 - 100), y1: rand(200, MAP_H - 200),
      x2: rand(MAP_W/2 + 100, MAP_W - 200), y2: rand(200, MAP_H - 200),
    });
  }

  // Shelters — touching the outer fence on one side
  SHELTERS.push({ x: MAP_W / 2, y: 60, r: 60 });          // North wall - touching top fence
  SHELTERS.push({ x: MAP_W / 2, y: MAP_H - 60, r: 60 });  // South wall - touching bottom fence
  SHELTERS.push({ x: 60, y: MAP_H / 2, r: 60 });           // West wall - touching left fence
  SHELTERS.push({ x: MAP_W - 60, y: MAP_H / 2, r: 60 });   // East wall - touching right fence
}

function rand(min, max) { return min + Math.random() * (max - min); }

const BOT_NAMES = ['MooCow','BurgerBoy','SteakMate','DairyQueen','CowPoke','BeefCake','MilkMan','Cheddar'];

function spawnBots() {
  if (!botsEnabled) return;
  const humanCount = countReady();
  const botsNeeded = Math.max(0, 8 - humanCount);
  for (let i = 0; i < botsNeeded; i++) {
    const botId = nextId++;
    const bot = {
      id: botId, ws: null, name: BOT_NAMES[i % BOT_NAMES.length], color: assignColor(),
      x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200), dx: 0, dy: 0, dir: 'south',
      hunger: 100, score: 0, alive: true, inLobby: false,
      eating: false, eatTimer: 0, foodEaten: 0,
      xp: 0, level: 0, xpToNext: 50, kills: 0,
      dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
      perks: { speedMult: 1, radiusMult: 1, drainMult: 1, magnetRange: 0, regen: 0, maxHunger: 100, sizeMult: 1, damage: 1 },
      weaponPerks: { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false },
      weapon: 'normal', weaponLevel: 0, weaponTimer: 0, armor: 0,
      isBot: true, botTarget: null, botActionTimer: 2,
    };
    players.set(botId, bot);
  }
}

function updateBots(dt) {
  for (const [, p] of players) {
    if (!p.isBot || !p.alive) continue;
    p.botActionTimer -= dt;
    if (p.botActionTimer > 0) continue;
    p.botActionTimer = 0.5 + Math.random() * 0.8; // rethink every 0.3-0.8s

    // Find nearest food
    let nearestFood = null, nearFoodDist = Infinity;
    for (const f of foods) {
      if (f.poisoned) continue;
      const d = Math.hypot(p.x - f.x, p.y - f.y);
      if (d < nearFoodDist) { nearFoodDist = d; nearestFood = f; }
    }

    // Find nearest enemy
    let nearestEnemy = null, nearEnemyDist = Infinity;
    for (const [, e] of players) {
      if (e.id === p.id || !e.alive) continue;
      const d = Math.hypot(p.x - e.x, p.y - e.y);
      if (d < nearEnemyDist) { nearEnemyDist = d; nearestEnemy = e; }
    }

    // Find nearest weapon pickup
    let nearestWeapon = null, nearWeaponDist = Infinity;
    for (const w of weaponPickups) {
      const d = Math.hypot(p.x - w.x, p.y - w.y);
      if (d < nearWeaponDist) { nearWeaponDist = d; nearestWeapon = w; }
    }

    // Stuck detection — if barely moved, pick a new wander point
    if (!p._lastPos) p._lastPos = { x: p.x, y: p.y, t: 0 };
    p._lastPos.t += 0.4;
    if (p._lastPos.t > 3) {
      const moved = Math.hypot(p.x - p._lastPos.x, p.y - p._lastPos.y);
      if (moved < 30) { p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) }; }
      p._lastPos = { x: p.x, y: p.y, t: 0 };
    }

    let targetX, targetY;
    const hasGun = p.weapon !== 'normal';

    // Forced wander if stuck
    if (p._wanderTarget) {
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
      if (Math.hypot(p.x - targetX, p.y - targetY) < 50) p._wanderTarget = null;
    }
    // Weapon pickup if unarmed and nearby
    else if (nearestWeapon && nearWeaponDist < 300 && !hasGun) {
      targetX = nearestWeapon.x; targetY = nearestWeapon.y;
    }
    // COWSTRIKE: run to nearest shelter
    else if (cowstrikeActive && SHELTERS.length > 0) {
      let nearShelter = null, nearShDist = Infinity;
      for (const sh of SHELTERS) {
        const d = Math.hypot(p.x - sh.x, p.y - sh.y);
        if (d < nearShDist) { nearShDist = d; nearShelter = sh; }
      }
      if (nearShelter) { targetX = nearShelter.x; targetY = nearShelter.y; }
    }
    // Hungry? eat
    else if (p.hunger < 50 && nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    }
    // Combat: keep distance and shoot
    else if (nearestEnemy && nearEnemyDist < 500) {
      // Shoot if in range
      if (nearEnemyDist < 350 && p.attackCooldown <= 0 && p.hunger > 15) {
        const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
        const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
        fireBot(p, ax, ay);
      }
      // Kite: stay at ~200px distance if armed, close in if not
      const idealDist = hasGun ? 200 : 50;
      if (nearEnemyDist < idealDist - 30) {
        // Back away
        targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
      } else if (nearEnemyDist > idealDist + 50) {
        targetX = nearestEnemy.x; targetY = nearestEnemy.y;
      } else {
        // Strafe sideways
        const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
        const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
        const dir = (p.id % 2 === 0) ? 1 : -1;
        targetX = p.x + perpX * 80 * dir; targetY = p.y + perpY * 80 * dir;
      }
    }
    // Eat food
    else if (nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    }
    // Explore
    else {
      if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
    }

    // Move toward target
    const dx = targetX - p.x, dy = targetY - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 10) { p.dx = dx / dist; p.dy = dy / dist; }
    else { p.dx = 0; p.dy = 0; }
  }
}

function fireBot(bot, ax, ay) {
  const weapon = bot.weapon || 'normal';
  const wp = bot.weaponPerks || { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false };
  const cdMult = Math.max(0.3, wp.cooldown);
  const dmgMult = wp.damageMult;
  const velMult = wp.velocity;

  if (weapon === 'normal' && bot.hunger > 10) {
    bot.hunger -= 3;
    bot.attackCooldown = 1.0 * cdMult;
    const projId = foodIdCounter++;
    const dmg = 8 * bot.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, vx: ax * 700 * velMult, vy: ay * 700 * velMult, life: 1.5, dmg, piercing: wp.piercing };
    projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: bot.color });
  } else if (weapon === 'shotgun' && bot.hunger > 7) {
    bot.hunger -= 7;
    bot.attackCooldown = 1.5 * cdMult;
    const volleyId = foodIdCounter++;
    for (let b = 0; b < 5; b++) {
      const spread = (Math.random() - 0.5) * 0.2;
      const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
      const by = ax * Math.sin(spread) + ay * Math.cos(spread);
      const projId = foodIdCounter++;
      const proj = { id: projId, ownerId: bot.id, x: bot.x + bx * 40, y: bot.y + by * 40, vx: bx * 600 * velMult, vy: by * 600 * velMult, life: 0.35, dmg: 5 * dmgMult, volleyId };
      projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: bot.color, shotgun: b === 0 });
    }
  } else if (weapon === 'bolty' && bot.hunger > 12) {
    bot.hunger -= 8;
    bot.attackCooldown = 2.5 * cdMult;
    const projId = foodIdCounter++;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, vx: ax * 4200 * velMult, vy: ay * 4200 * velMult, life: 1.5, dmg: 25 * dmgMult };
    projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: bot.color, bolty: true });
  }
}

function spawnFood(poisoned) {
  const m = 80;
  const type = FOOD_TYPES[Math.random() * FOOD_TYPES.length | 0];
  const food = {
    id: foodIdCounter++,
    x: rand(zone.x + m, zone.x + zone.w - m),
    y: rand(zone.y + m, zone.y + zone.h - m),
    type, poisoned: !!poisoned,
    golden: false,
  };
  foods.push(food);
  return food;
}

function spawnGoldenFood() {
  const food = {
    id: foodIdCounter++,
    x: rand(zone.x + 80, zone.x + zone.w - 80),
    y: rand(zone.y + 80, zone.y + zone.h - 80),
    type: { name: 'golden', hunger: 40, pts: 50 },
    poisoned: false, golden: true,
  };
  foods.push(food);
  return food;
}

function spawnWeaponPickup() {
  const w = {
    id: foodIdCounter++,
    x: rand(zone.x + 100, zone.x + zone.w - 100),
    y: rand(zone.y + 100, zone.y + zone.h - 100),
    weapon: WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)],
  };
  weaponPickups.push(w);
  return w;
}

function spawnInitialFood() {
  foods = [];
  weaponPickups = [];
  for (let i = 0; i < 35; i++) spawnFood(false);
  // Spawn 2-3 initial weapon pickups
  for (let i = 0; i < 3; i++) spawnWeaponPickup();
  // Armor pickups
  armorPickups = [];
  for (let i = 0; i < 2; i++) { armorPickups.push({ id: foodIdCounter++, x: rand(200, MAP_W-200), y: rand(200, MAP_H-200) }); }
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const [, p] of players) {
    if (p.ws && p.ws.readyState === 1) p.ws.send(msg);
  }
}

function sendTo(ws, data) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(data));
}

function assignColor() {
  const used = new Set();
  for (const [, p] of players) used.add(p.color);
  for (const c of COLORS) { if (!used.has(c)) return c; }
  return COLORS[Math.random() * COLORS.length | 0];
}

let readyCountdown = false;
let cowstrikeActive = false;
let botsEnabled = true;

function checkAllReady() {
  let humans = 0, readyHumans = 0;
  for (const [, p] of players) {
    if (p.inLobby && !p.isBot) { humans++; if (p.ready) readyHumans++; }
  }
  return humans > 0 && readyHumans >= humans;
}

function lobbyTick() {
  if (readyCountdown) {
    lobbyCountdown--;
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyCountdown, allReady: true });
    if (lobbyCountdown <= 0) {
      clearInterval(lobbyTimer); lobbyTimer = null;
      startGame();
    }
  } else {
    // Check if all humans are ready
    if (checkAllReady()) {
      readyCountdown = true;
      lobbyCountdown = 5;
    }
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: readyCountdown ? lobbyCountdown : -1, allReady: false });
  }
}

function startLobby() {
  gameState = 'lobby';
  readyCountdown = false;
  lobbyCountdown = 5;
  for (const [, p] of players) p.ready = false;
  if (lobbyTimer) clearInterval(lobbyTimer);
  lobbyTimer = setInterval(lobbyTick, 1000);
}

function countReady() {
  let c = 0;
  for (const [, p] of players) if (p.inLobby) c++;
  return c;
}

function getLobbyPlayers() {
  const arr = [];
  for (const [, p] of players) {
    if (p.inLobby || p.alive) arr.push({ id: p.id, name: p.name, color: p.color, ready: !!p.ready });
  }
  return arr;
}

function startGame() {
  gameState = 'playing';
  gameTime = 0;
  zone = { x: 0, y: 0, w: MAP_W, h: MAP_H };
  generateMap();
  spawnInitialFood();
  spawnBots();

  let i = 0;
  const spawnPoints = [];
  const cx = MAP_W / 2, cy = MAP_H / 2, radius = 400;
  const count = countReady();
  for (let j = 0; j < count; j++) {
    const angle = (j / count) * Math.PI * 2;
    spawnPoints.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }

  for (const [, p] of players) {
    if (p.inLobby) {
      const sp = spawnPoints[i % spawnPoints.length];
      Object.assign(p, {
        x: sp.x, y: sp.y, hunger: 100, score: 0, alive: true,
        inLobby: false, dir: 'south', eating: false, eatTimer: 0,
        foodEaten: 0, xp: 0, level: 0, xpToNext: 50, kills: 0,
        dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
        perks: { speedMult: 1, radiusMult: 1, drainMult: 1, magnetRange: 0, regen: 0, maxHunger: 100, sizeMult: 1, damage: 1 },
        weaponPerks: { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false },
        weapon: 'normal', weaponLevel: 0, weaponTimer: 0,
      });
      i++;
    }
  }

  // Count ALL alive players including bots
  aliveCount = 0;
  for (const [, p] of players) { if (p.alive) aliveCount++; }
  broadcast({
    type: 'start',
    players: getPlayerStates(),
    foods: foods.map(serializeFood),
    zone,
    map: { walls: WALLS, mud: MUD_PATCHES, ponds: HEAL_PONDS, portals: PORTALS, shelters: SHELTERS },
    armorPickups: armorPickups.map(a => ({ id: a.id, x: a.x, y: a.y })),
    weapons: weaponPickups.map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })),
  });

  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(gameTick, 1000 / TICK_RATE);
}

function serializeFood(f) {
  return { id: f.id, x: f.x, y: f.y, type: f.type.name, poisoned: f.poisoned, golden: f.golden };
}

function getPlayerStates() {
  const arr = [];
  for (const [, p] of players) {
    if (p.alive || (!p.inLobby && gameState === 'playing')) {
      arr.push({
        id: p.id, name: p.name, color: p.color, x: p.x, y: p.y, dir: p.dir,
        hunger: p.hunger, score: p.score, alive: p.alive, eating: p.eating,
        foodEaten: p.foodEaten, level: p.level || 0, xp: p.xp || 0,
        xpToNext: p.xpToNext || 50, sizeMult: p.perks ? p.perks.sizeMult : 1, armor: p.armor || 0,
        kills: p.kills || 0, stunTimer: p.stunTimer || 0, weapon: p.weapon || 'normal', aimAngle: p.aimAngle || 0, weaponLevel: p.weaponLevel || 0,
        dashCooldown: p.dashCooldown || 0, attackCooldown: p.attackCooldown || 0,
      });
    }
  }
  return arr;
}

function eliminatePlayer(p, reason) {
  if (!p.alive) return;
  p.alive = false;
  aliveCount--;
  // Credit kill to last attacker
  if (p.lastAttacker && reason === 'hunger') {
    const attacker = players.get(p.lastAttacker);
    if (attacker && attacker.alive) {
      attacker.kills = (attacker.kills || 0) + 1;
      attacker.score += 50;
      attacker.hunger = Math.min(attacker.perks.maxHunger, attacker.hunger + 25);
      // XP bonus on kill — roughly 3 levels worth
      const killXp = (attacker.xpToNext || 50) * 2;
      attacker.xp = (attacker.xp || 0) + killXp;
      while (attacker.xp >= attacker.xpToNext) {
        attacker.xp = Math.max(0, attacker.xp - attacker.xpToNext);
        attacker.level++;
        attacker.xpToNext = Math.floor(50 + attacker.level * 25 + attacker.level * attacker.level * 5);
        sendTo(attacker.ws, { type: 'levelup', level: attacker.level });
      }
      broadcast({ type: 'kill', killerId: attacker.id, killerName: attacker.name, victimId: p.id, victimName: p.name });
    }
  }
  broadcast({ type: 'eliminated', playerId: p.id, name: p.name, rank: aliveCount + 1 });
}

function gameTick() {
  if (gameState !== 'playing') return;
  const dt = 1 / TICK_RATE;
  gameTime += dt;

  // Shrinking zone after 60 seconds
  if (gameTime > 60) {
    const shrinkRate = 15 * dt; // pixels per second per side
    zone.x += shrinkRate / 2;
    zone.y += shrinkRate / 2;
    zone.w = Math.max(400, zone.w - shrinkRate);
    zone.h = Math.max(300, zone.h - shrinkRate);
  }

  const deadThisTick = [];

  for (const [, p] of players) {
    if (!p.alive) continue;

    // Stun timer
    if (p.stunTimer > 0) { p.stunTimer -= dt; }

    // Movement (blocked while stunned)
    if (Math.abs(p.dx) + Math.abs(p.dy) > 0.01 && p.stunTimer <= 0) {
      const len = Math.hypot(p.dx, p.dy);
      const nx = p.dx / len, ny = p.dy / len;
      const sizeSlowdown = 1 - Math.min(0.3, p.foodEaten * 0.01);
      let mudSlow = 1;
      for (const m of MUD_PATCHES) { if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) { mudSlow = 0.5; break; } }
      const speed = 180 * sizeSlowdown * p.perks.speedMult * mudSlow;
      p.x += nx * speed * dt;
      p.y += ny * speed * dt;
      if (Math.abs(nx) > Math.abs(ny)) p.dir = nx > 0 ? 'east' : 'west';
      else p.dir = ny > 0 ? 'south' : 'north';
    }

    // Wall collision
    for (const w of WALLS) {
      if (p.x > w.x - 15 && p.x < w.x + w.w + 15 && p.y > w.y - 15 && p.y < w.y + w.h + 15) {
        // Push out of wall — find shortest escape
        const escL = p.x - (w.x - 15), escR = (w.x + w.w + 15) - p.x;
        const escT = p.y - (w.y - 15), escB = (w.y + w.h + 15) - p.y;
        const minEsc = Math.min(escL, escR, escT, escB);
        if (minEsc === escL) p.x = w.x - 15;
        else if (minEsc === escR) p.x = w.x + w.w + 15;
        else if (minEsc === escT) p.y = w.y - 15;
        else p.y = w.y + w.h + 15;
      }
    }

    // Portal teleportation
    if (!p._portalCooldown || p._portalCooldown <= 0) {
      for (const portal of PORTALS) {
        if (Math.hypot(p.x - portal.x1, p.y - portal.y1) < 35) {
          p.x = portal.x2; p.y = portal.y2; p._portalCooldown = 2;
          broadcast({ type: 'teleport', playerId: p.id, x: portal.x2, y: portal.y2 });
          break;
        }
        if (Math.hypot(p.x - portal.x2, p.y - portal.y2) < 35) {
          p.x = portal.x1; p.y = portal.y1; p._portalCooldown = 2;
          broadcast({ type: 'teleport', playerId: p.id, x: portal.x1, y: portal.y1 });
          break;
        }
      }
    }
    if (p._portalCooldown > 0) p._portalCooldown -= dt;

    // Mud slow
    let inMud = false;
    for (const m of MUD_PATCHES) {
      if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) { inMud = true; break; }
    }
    if (inMud) { p.x -= (p.x - (p.x - (p.dx || 0) * 0.3 * dt)); } // handled via speed below

    // Heal ponds
    for (const h of HEAL_PONDS) {
      if (Math.hypot(p.x - h.x, p.y - h.y) < h.r) {
        p.hunger = Math.min(p.perks.maxHunger, p.hunger + 3 * dt);
      }
    }

    // Clamp to zone
    p.x = Math.max(zone.x + 20, Math.min(zone.x + zone.w - 20, p.x));
    p.y = Math.max(zone.y + 20, Math.min(zone.y + zone.h - 20, p.y));

    // Zone damage
    if (p.x <= zone.x + 5 || p.x >= zone.x + zone.w - 5 || p.y <= zone.y + 5 || p.y >= zone.y + zone.h - 5) {
      p.hunger -= 8 * dt;
    }

    // Hunger drain
    const drainRate = 2 * p.perks.drainMult;
    p.hunger -= drainRate * dt;
    if (p.perks.regen > 0) {
      p.hunger = Math.min(p.perks.maxHunger, p.hunger + p.perks.regen * dt);
    }

    // Cooldowns
    if (p.dashCooldown > 0) p.dashCooldown -= dt; if (p.pickupCooldown > 0) p.pickupCooldown -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    // Cowtank timer
    if (p.weaponTimer > 0) {
      p.weaponTimer -= dt;
      if (p.weaponTimer <= 0 && p.weapon === 'cowtank') {
        p.weapon = 'normal'; p.weaponLevel = 0;
        sendTo(p.ws, { type: 'weaponExpired' });
      }
    }

    if (p.hunger <= 0) {
      p.hunger = 0;
      deadThisTick.push(p);
      continue;
    }

    // Eat timer
    if (p.eating) { p.eatTimer -= dt; if (p.eatTimer <= 0) p.eating = false; }

    // Magnet
    if (p.perks.magnetRange > 0) {
      for (const f of foods) {
        const fdx = p.x - f.x, fdy = p.y - f.y, fdist = Math.hypot(fdx, fdy);
        if (fdist < p.perks.magnetRange && fdist > 5) {
          f.x += fdx * 250 * dt / fdist;
          f.y += fdy * 250 * dt / fdist;
        }
      }
    }

    // Food collision
    const collectRadius = (35 + Math.min(20, p.foodEaten * 0.5)) * p.perks.radiusMult;
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      if (Math.hypot(p.x - f.x, p.y - f.y) < collectRadius) {
        if (f.poisoned) {
          // Poison food: drains hunger and stuns
          p.hunger -= 20;
          p.stunTimer = 1.5;
          broadcast({ type: 'poison', playerId: p.id });
        } else {
          p.hunger = Math.min(p.perks.maxHunger, p.hunger + f.type.hunger);
          p.score += f.type.pts + (f.golden ? 30 : 0);
          if (f.golden) {
            // Golden food: temporary combat buff
            p.perks.damage = Math.min(3, p.perks.damage + 0.5);
            broadcast({ type: 'powerup', playerId: p.id, name: p.name });
          }
        }
        p.foodEaten++;
        p.xp = (p.xp || 0) + Math.floor(8 + Math.random() * 12);
        if (p.xp >= p.xpToNext) {
          p.xp = Math.max(0, p.xp - p.xpToNext);
          p.level++;
          p.xpToNext = Math.floor(50 + p.level * 25 + p.level * p.level * 5);
          sendTo(p.ws, { type: 'levelup', level: p.level });
        }
        p.eating = true;
        p.eatTimer = 0.5;
        broadcast({ type: 'eat', playerId: p.id, foodId: f.id, foodType: f.type.name, golden: f.golden, poisoned: f.poisoned });
        foods.splice(i, 1);
      }
    }
  }

  // Weapon pickup collision
  for (const [, p] of players) {
    if (!p.alive) continue;
    for (let i = weaponPickups.length - 1; i >= 0; i--) {
      const w = weaponPickups[i];
      if (Math.hypot(p.x - w.x, p.y - w.y) < 45) {
        // Can't pick up a different weapon if you already have one (must drop first with Q)
        // Exception: same weapon (upgrade) and cowtank (always pickable)
        if ((p.pickupCooldown || 0) > 0 || (p.weapon !== 'normal' && p.weapon !== w.weapon && w.weapon !== 'cowtank')) continue;
        if (w.weapon === 'cowtank') {
          p.weapon = 'cowtank';
          p.weaponLevel = 0;
          p.weaponTimer = 15;
        } else if (p.weapon === w.weapon) {
          p.weaponLevel = Math.min(3, (p.weaponLevel || 0) + 1);
        } else {
          p.weapon = w.weapon;
          p.weaponLevel = 0;
          p.weaponTimer = 0;
        }
        broadcast({ type: 'weaponPickup', playerId: p.id, name: p.name, weapon: p.weapon, level: p.weaponLevel, pickupId: w.id });
        weaponPickups.splice(i, 1);
      }
    }
  }

  // Armor pickup collision
  for (const [, p] of players) {
    if (!p.alive) continue;
    for (let i = armorPickups.length - 1; i >= 0; i--) {
      const a = armorPickups[i];
      if (Math.hypot(p.x - a.x, p.y - a.y) < 45) {
        p.armor = Math.min(p.maxArmor || 50, (p.armor || 0) + 25);
        broadcast({ type: 'armorPickup', playerId: p.id, name: p.name, pickupId: a.id });
        armorPickups.splice(i, 1);
      }
    }
  }
  // Respawn armor pickups
  if (Math.random() < 0.004 && armorPickups.length < 2) {
    const a = { id: foodIdCounter++, x: rand(200, MAP_W-200), y: rand(200, MAP_H-200) };
    armorPickups.push(a);
    broadcast({ type: 'armorSpawn', id: a.id, x: a.x, y: a.y });
  }

  // Periodically spawn new weapon pickups (every ~15 seconds, max 4 on map)
  if (Math.random() < 0.008 && weaponPickups.length < 6) {
    const w = spawnWeaponPickup();
    broadcast({ type: 'weaponSpawn', id: w.id, x: w.x, y: w.y, weapon: w.weapon });
  }

  // Process deaths (deferred to avoid issues during iteration)
  for (const p of deadThisTick) {
    eliminatePlayer(p, 'hunger');
  }
  if (deadThisTick.length > 0) checkWinner();

  // Update AI bots
  updateBots(dt);

  // Cow-to-cow PVP: rebalanced bump combat
  const alivePlayers = [];
  for (const [, p] of players) { if (p.alive) alivePlayers.push(p); }
  for (let i = 0; i < alivePlayers.length; i++) {
    for (let j = i + 1; j < alivePlayers.length; j++) {
      const a = alivePlayers[i], b = alivePlayers[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 65) {
        const aSpeed = Math.hypot(a.dx, a.dy);
        const bSpeed = Math.hypot(b.dx, b.dy);
        // Base damage scaled by size difference (capped so small cows still have a chance)
        const sizeDiffA = Math.min(1.3, Math.max(0.5, 1 + (a.foodEaten - b.foodEaten) * 0.03));
        const sizeDiffB = Math.min(1.3, Math.max(0.5, 1 + (b.foodEaten - a.foodEaten) * 0.03));
        const baseDmg = 6 * dt;
        // Charge bonus only when actively moving toward the other cow
        const aCharge = aSpeed > 0.5 ? 1.3 : 0.7;
        const bCharge = bSpeed > 0.5 ? 1.3 : 0.7;
        const aArmor = (a.weapon === 'cowtank') ? 0.5 : 1;
        const bArmor = (b.weapon === 'cowtank') ? 0.5 : 1;
        b.hunger -= baseDmg * sizeDiffA * aCharge * a.perks.damage * bArmor;
        a.hunger -= baseDmg * sizeDiffB * bCharge * b.perks.damage * aArmor;
        a.lastAttacker = b.id;
        b.lastAttacker = a.id;
        // Push apart strongly
        if (dist > 1) {
          const nx = (b.x - a.x) / dist, ny = (b.y - a.y) / dist;
          const push = 150 * dt;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
        broadcast({ type: 'bump', a: a.id, b: b.id });
      }
    }
  }

  // Projectile updates
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const pr = projectiles[i];
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    if (pr.life <= 0 || pr.x < 0 || pr.x > MAP_W || pr.y < 0 || pr.y > MAP_H) {
      projectiles.splice(i, 1); continue;
    }
    // Wall collision — step along projectile path to catch fast ones
    let hitWall = false;
    const speed = Math.hypot(pr.vx, pr.vy);
    const steps = Math.max(1, Math.ceil(speed * dt / 15)); // check every 15px
    const stepX = pr.vx * dt / steps, stepY = pr.vy * dt / steps;
    let checkX = pr.x - pr.vx * dt, checkY = pr.y - pr.vy * dt;
    for (let s = 0; s <= steps && !hitWall; s++) {
      for (const w of WALLS) {
        // Ensure wall has minimum size and pad generously
        const wx1 = w.x - 10, wy1 = w.y - 10;
        const wx2 = w.x + Math.max(w.w, 20) + 10, wy2 = w.y + Math.max(w.h, 20) + 10;
        if (checkX > wx1 && checkX < wx2 && checkY > wy1 && checkY < wy2) { hitWall = true; break; }
      }
      checkX += stepX; checkY += stepY;
    }
    if (hitWall && !pr.piercing) {
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: checkX, y: checkY });
      projectiles.splice(i, 1); continue;
    }
    // Hit detection against players
    for (const [, p] of players) {
      if (!p.alive || p.id === pr.ownerId) continue;
      if (Math.hypot(p.x - pr.x, p.y - pr.y) < 40) {
        let dmg = pr.dmg;
        // Shotgun volley bonus: exponential damage for consecutive pellet hits
        if (pr.volleyId) {
          if (!p._volleyHits) p._volleyHits = {};
          p._volleyHits[pr.volleyId] = (p._volleyHits[pr.volleyId] || 0) + 1;
          const hits = p._volleyHits[pr.volleyId];
          dmg = pr.dmg * (1 + (hits - 1) * 0.5); // 1x, 1.5x, 2x, 2.5x, 3x
        }
        // Cowtank armor: 50% damage reduction
        let armor = (p.weapon === 'cowtank') ? 0.5 : 1;
        if (p.perks && p.perks.damageReduction) armor *= (1 - p.perks.damageReduction);
        // Armor absorbs damage first
        let actualDmg = dmg * armor;
        if (p.armor > 0) { const absorbed = Math.min(p.armor, actualDmg); p.armor -= absorbed; actualDmg -= absorbed; }
        p.hunger -= actualDmg;
        p.stunTimer = (p.weapon === 'cowtank') ? 0.2 : 0.5;
        p.lastAttacker = pr.ownerId;
        if (p.weapon === 'cowtank') broadcast({ type: 'armorHit', playerId: p.id, x: p.x, y: p.y });
        // Explosive AOE
        if (pr.explosive) {
          const blastRadius = 120;
          for (const [, t] of players) {
            if (!t.alive || t.id === pr.ownerId || t.id === p.id) continue;
            const bdist = Math.hypot(t.x - pr.x, t.y - pr.y);
            if (bdist < blastRadius) {
              const falloff = 1 - bdist / blastRadius;
              t.hunger -= dmg * 0.6 * falloff;
              t.stunTimer = 0.3;
              t.lastAttacker = pr.ownerId;
            }
          }
          broadcast({ type: 'explosion', x: pr.x, y: pr.y, radius: blastRadius });
        }
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: p.id, ownerId: pr.ownerId, dmg: Math.round(dmg) });
        if (pr.piercing) {
          pr.piercing = false; // used up the pierce
          pr.dmg *= 0.6; // reduced damage after piercing
        } else {
          projectiles.splice(i, 1);
        }
        break;
      }
    }
  }

  // Spawn food
  const spawnChance = Math.max(1, aliveCount) * 0.15 * dt;
  if (Math.random() < spawnChance) {
    // 10% chance poison, 5% chance golden
    const roll = Math.random();
    let f;
    if (roll < 0.05) { f = spawnGoldenFood(); }
    else if (roll < 0.15) { f = spawnFood(true); }
    else { f = spawnFood(false); }
    broadcast({ type: 'food', food: serializeFood(f) });
  }

  // Clean up volley hit trackers
  for (const [, p] of players) { if (p._volleyHits) p._volleyHits = {}; }

  // Broadcast state + zone
  broadcast({ type: 'state', players: getPlayerStates(), foodCount: foods.length, zone, gameTime: Math.floor(gameTime) });
}

function checkWinner() {
  // End when 1 player left OR all humans dead
  const aliveHumans = [...players.values()].filter(p => p.alive && !p.isBot).length;
  const shouldEnd = aliveCount <= 1 || aliveHumans === 0;
  if (shouldEnd && gameState === 'playing') {
    let winner = null;
    for (const [, p] of players) {
      if (p.alive) { winner = p; break; }
    }
    gameState = 'ending';
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
    broadcast({ type: 'winner', playerId: winner ? winner.id : null, name: winner ? winner.name : 'Nobody', kills: winner ? winner.kills : 0, score: winner ? winner.score : 0 });
    let countdown = 10;
    restartTimer = setInterval(() => {
      countdown--;
      broadcast({ type: 'restart', countdown });
      if (countdown <= 0) {
        clearInterval(restartTimer);
        restartTimer = null;
        // Remove bots, put humans back in lobby
        for (const [id, p] of players) {
          if (p.isBot) { players.delete(id); }
          else { p.inLobby = true; p.alive = false; }
        }
        startLobby();
      }
    }, 1000);
  }
}

// HTTP + WS server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Strawberry Cow Battle Royale Server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const playerId = nextId++;
  let player = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'join' && !player) {
      const name = String(msg.name || 'Cow').slice(0, 12);
      const color = assignColor();
      player = {
        id: playerId, ws, name, color,
        x: MAP_W / 2, y: MAP_H / 2, dx: 0, dy: 0, dir: 'south',
        hunger: 100, score: 0, alive: false, inLobby: true,
        eating: false, eatTimer: 0, foodEaten: 0,
        kills: 0, dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
        perks: { speedMult: 1, radiusMult: 1, drainMult: 1, magnetRange: 0, regen: 0, maxHunger: 100, sizeMult: 1, damage: 1 },
        weaponPerks: { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false },
        weapon: 'normal', weaponLevel: 0, weaponTimer: 0, armor: 0,
      };
      players.set(playerId, player);
      sendTo(ws, { type: 'joined', id: playerId, color });

      if (gameState === 'lobby') {
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyCountdown });
      } else if (gameState === 'playing') {
        sendTo(ws, { type: 'spectate', players: getPlayerStates(), foods: foods.map(serializeFood), zone, map: { walls: WALLS, mud: MUD_PATCHES, ponds: HEAL_PONDS, portals: PORTALS, shelters: SHELTERS }, weapons: weaponPickups.map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })), armorPickups: armorPickups.map(a => ({ id: a.id, x: a.x, y: a.y })) });
      }

      if (!lobbyTimer && gameState !== 'playing' && gameState !== 'ending') {
        startLobby();
      }
    }

    if (msg.type === 'perk' && player && player.alive && player.perks) {
      const perks = player.perks;
      const id = msg.id;
      if (id === 'speed') perks.speedMult += 0.3;
      else if (id === 'magnet') perks.magnetRange += 200;
      else if (id === 'extrahunger') perks.maxHunger += 25;
      else if (id === 'drain') perks.drainMult *= 0.7;
      else if (id === 'radius') perks.radiusMult += 0.3;
      else if (id === 'regen') perks.regen += 0.5;
      else if (id === 'feast') player.hunger = perks.maxHunger;
      else if (id === 'tiny') { perks.speedMult += 0.25; perks.sizeMult *= 0.75; }
      else if (id === 'damage') perks.damage += 0.5;
      else if (id === 'velocity') { if (player.weaponPerks) player.weaponPerks.velocity += 0.4; }
      else if (id === 'fastfire') { if (player.weaponPerks) player.weaponPerks.cooldown *= 0.75; }
      else if (id === 'cheapshot') { if (player.weaponPerks) player.weaponPerks.hungerDiscountPct = (player.weaponPerks.hungerDiscountPct || 0) + 0.33; }
      else if (id === 'extraproj') { if (player.weaponPerks) player.weaponPerks.extraProj += 1; }
      else if (id === 'bigbore') { if (player.weaponPerks) player.weaponPerks.damageMult += 0.2; }
      else if (id === 'piercing') { if (player.weaponPerks) player.weaponPerks.piercing = true; }
      else if (id === 'burstmod') { if (player.weaponPerks) player.weaponPerks.burstMod = true; }
      else if (id === 'dashcd') { player.dashCdMult = (player.dashCdMult || 1) * 0.6; }
      else if (id === 'dashdist') { player.dashDistMult = (player.dashDistMult || 1) * 1.5; }
      else if (id === 'kevlar') { player.maxArmor = (player.maxArmor || 50) + 25; }
      else if (id === 'shotgun') { /* weapon handled client-side */ }
      else if (id === 'burst') { /* weapon handled client-side */ }
      else if (id === 'bolty') { /* weapon handled client-side */ }
      else if (id === 'cowstrike') {
        // 3 second warning then nuke everyone else
        cowstrikeActive = true; broadcast({ type: 'cowstrikeWarning', playerId: player.id, name: player.name });
        setTimeout(() => { cowstrikeActive = false; }, 9000);
        // 3 waves of damage over 5 seconds
        [5000, 6500, 8000].forEach((delay, wave) => {
          setTimeout(() => {
            if (gameState !== 'playing') return;
            for (const [, target] of players) {
              if (target.alive && target.id !== player.id) {
                // Check if under a shelter
                let sheltered = false;
                for (const sh of SHELTERS) {
                  if (Math.hypot(target.x - sh.x, target.y - sh.y) < sh.r) { sheltered = true; break; }
                }
                if (sheltered) continue; // safe!
                target.hunger -= 15;
                target.stunTimer = 1.5;
                target.lastAttacker = player.id;
              }
            }
            broadcast({ type: 'cowstrike', playerId: player.id, name: player.name, wave });
          }, delay);
        });
      }
    }

    if (msg.type === 'toggleBots') {
      botsEnabled = !botsEnabled;
      broadcast({ type: 'botsToggled', enabled: botsEnabled });
    }

    if (msg.type === 'dropWeapon' && player && player.alive && player.weapon !== 'normal') {
      // Drop current weapon as a pickup
      weaponPickups.push({ id: foodIdCounter++, x: player.x + 20, y: player.y, weapon: player.weapon });
      broadcast({ type: 'weaponSpawn', id: weaponPickups[weaponPickups.length-1].id, x: player.x + 20, y: player.y, weapon: player.weapon });
      player.weapon = 'normal'; player.pickupCooldown = 2;
      player.weaponLevel = 0;
      broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
    }

    if (msg.type === 'ready' && player && player.inLobby) {
      player.ready = true;
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: readyCountdown ? lobbyCountdown : -1, allReady: checkAllReady() });
    }

    if (msg.type === 'move' && player && player.alive) {
      player.dx = Math.max(-1, Math.min(1, msg.dx || 0)); if(Math.abs(msg.dx||0)+Math.abs(msg.dy||0)>0.1) player.aimAngle = Math.atan2(-(msg.dx||0), msg.dy||0);
      player.dy = Math.max(-1, Math.min(1, msg.dy || 0));
    }

    if (msg.type === 'attack' && player && player.alive && player.attackCooldown <= 0) {
      const weapon = player.weapon || 'normal';
      const wLvl = player.weaponLevel || 0;
      const wp = player.weaponPerks || { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false };
      const cdMult = Math.max(0.3, (1 - wLvl * 0.1) * wp.cooldown);
      const dmgMult = (1 + wLvl * 0.15) * wp.damageMult;
      const hungerDiscount = wLvl + wp.hungerDiscount;
      const velMult = wp.velocity;
      const extraProj = wp.extraProj;
      const burstMod = wp.burstMod;
      let ax = msg.aimX || 0, ay = msg.aimY || 0;
      const alen = Math.hypot(ax, ay);
      if (alen < 0.1) {
        const dirMap = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] };
        const dd = dirMap[player.dir] || [0,1];
        ax = dd[0]; ay = dd[1];
      } else { ax /= alen; ay /= alen; }

      if (weapon === 'shotgun' && player.hunger > Math.max(2, 7 - hungerDiscount)) {
        player.hunger -= Math.max(2, 6 - hungerDiscount);
        player.attackCooldown = 1.5 * cdMult;
        const volleyId = foodIdCounter++;
        for (let b = 0; b < 5; b++) {
          const spread = (Math.random() - 0.5) * 0.2;
          const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
          const by = ax * Math.sin(spread) + ay * Math.cos(spread);
          const projId = foodIdCounter++;
          const dmg = 5 * player.perks.damage * dmgMult;
          const proj = { id: projId, ownerId: player.id, x: player.x + bx * 40, y: player.y + by * 40, vx: bx * 600 * velMult, vy: by * 600 * velMult, life: 0.35, dmg, volleyId, piercing: wp.piercing };
          projectiles.push(proj);
          broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, shotgun: b === 0 });
        }
      } else if (weapon === 'burst' && player.hunger > Math.max(2, 6 - hungerDiscount)) {
        const burstCount = burstMod ? 5 : 3;
        player.hunger -= Math.max(2, 5 - hungerDiscount);
        player.attackCooldown = 1.2 * cdMult;
        for (let b = 0; b < burstCount; b++) {
          const projId = foodIdCounter++;
          const dmg = 6 * player.perks.damage * dmgMult;
          const offset = b * 15; // stagger start position
          const proj = { id: projId, ownerId: player.id, x: player.x + ax * (40 + offset), y: player.y + ay * (40 + offset), vx: ax * 800 * velMult, vy: ay * 800 * velMult, life: 1.5, dmg, piercing: wp.piercing };
          projectiles.push(proj);
          broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, burst: b === 0 });
        }
      } else if (weapon === 'bolty' && player.hunger > Math.max(3, 8 - hungerDiscount)) {
        player.hunger -= Math.max(3, 7 - hungerDiscount);
        player.attackCooldown = 2.5 * cdMult;
        const projId = foodIdCounter++;
        const dmg = 25 * player.perks.damage * dmgMult;
        const proj = { id: projId, ownerId: player.id, x: player.x + ax * 40, y: player.y + ay * 40, vx: ax * 4200 * velMult, vy: ay * 4200 * velMult, life: 1.5, dmg, piercing: wp.piercing };
        projectiles.push(proj);
        broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, bolty: true });
      } else if (weapon === 'cowtank' && player.hunger > Math.max(2, 6 - hungerDiscount)) {
        // Cowtank: explosive shell, high velocity, AOE damage
        player.hunger -= Math.max(2, 5 - hungerDiscount);
        player.attackCooldown = 1.0 * cdMult;
        const projId = foodIdCounter++;
        const dmg = 25 * player.perks.damage * dmgMult;
        const proj = { id: projId, ownerId: player.id, x: player.x + ax * 40, y: player.y + ay * 40, vx: ax * 1000 * velMult, vy: ay * 1000 * velMult, life: 1.2, dmg, explosive: true };
        projectiles.push(proj);
        broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, cowtank: true });
      } else if (weapon === 'normal' && player.hunger > Math.max(1, 3 - hungerDiscount)) {
        player.hunger -= Math.max(1, 2 - hungerDiscount);
        player.attackCooldown = 1.0 * cdMult;
        const shotCount = burstMod ? 3 : 1;
        for (let b = 0; b < shotCount; b++) {
          const projId = foodIdCounter++;
          const dmg = 8 * player.perks.damage * dmgMult;
          const offset = b * 12;
          const proj = { id: projId, ownerId: player.id, x: player.x + ax * (40 + offset), y: player.y + ay * (40 + offset), vx: ax * 700 * velMult, vy: ay * 700 * velMult, life: 1.5, dmg, piercing: wp.piercing };
          projectiles.push(proj);
          broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, burst: b === 0 && shotCount > 1 });
        }
      }
    }

    if (msg.type === 'dash' && player && player.alive && player.dashCooldown <= 0) {
      const len = Math.hypot(player.dx, player.dy);
      if (len > 0.1) {
        // Step dash in small increments to avoid clipping through walls
        const nx = player.dx / len, ny = player.dy / len;
        const dashSteps = Math.round(12 * (player.dashDistMult || 1));
        for (let step = 0; step < dashSteps; step++) {
          player.x += nx * 10; player.y += ny * 10;
          // Wall check each step
          for (const w of WALLS) {
            if (player.x > w.x - 15 && player.x < w.x + w.w + 15 && player.y > w.y - 15 && player.y < w.y + w.h + 15) {
              player.x -= nx * 10; player.y -= ny * 10; step = 99; break;
            }
          }
        }
        player.x = Math.max(zone.x + 20, Math.min(zone.x + zone.w - 20, player.x));
        player.y = Math.max(zone.y + 20, Math.min(zone.y + zone.h - 20, player.y));
        player.dashCooldown = 3 * (player.dashCdMult || 1);
        broadcast({ type: 'dash', playerId: player.id });
      }
    }
  });

  ws.on('close', () => {
    if (player) {
      if (player.alive) {
        player.alive = false;
        aliveCount--;
        broadcast({ type: 'eliminated', playerId: player.id, name: player.name, rank: aliveCount + 1 });
        checkWinner();
      }
      players.delete(playerId);
      if (gameState === 'lobby') {
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyCountdown });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Strawberry Cow Battle Royale server on port ${PORT}`);
});
