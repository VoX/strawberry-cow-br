const { MAP_W, MAP_H, BOT_NAMES } = require('./config');
const { rand } = require('./utils');
const { broadcast } = require('./network');
const state = require('./state');
const { countReady } = require('./lobby');
const { handleDash, handleReload, MAG_SIZES, placeBarricadeForPlayer } = require('./combat');
const { getGroundHeight } = require('./terrain');

const BOT_CHAT_LINES = [
  "get udder'd, loser",
  "that was a mooving experience",
  "got milked lol",
  "i'm lactose intolerant to your L's",
  "this ain't your pasture",
  "cud i BE any better?",
  "steaks are high, homie",
  "hoof would've thought",
  "moo-ve aside peasant",
  "i'm the gr8est of all thyme",
  "ez dubs",
  "spit gun is meta btw",
  "prepare to be grilled",
  "nobody puts baby in the corner... of this map",
  "how now brown cow",
  "you couldn't hit a barn broadside",
  "im the cream of the crop",
  "no beef?",
  "got the moo-jo working",
  "milk before cereal pls",
  "hope u brought a straw",
  "time to churn butter",
  "send it",
  "thats a nah from me dawg",
  "cowabunga it is",
  "rare steak only",
  "udderly embarrassing for you",
  "the pasture is mine",
  "bro thought he was something",
  "beef is served",
  "moooove",
  "i'll be taking that udder",
  // Rust references (cowified)
  "Do you like Pizza",
  "rat you out my udder",
  "kos, no u",
  "offline my barn bro",
  "that's my loot, naked",
  "nakeds out, suited in",
  "roof camping w/ the L9",
  "you just got countered at the moo-cade",
  "bag check the corpse",
  "farming hemp with my cud",
  "wiped ur barn, ez",
  "heli on the map, cows beware",
  "sulfur before stew, always",
  "no honor in this server, only udder",
  "got raided, lost everything except the cows",
  "the meadow is cruel",
  "metal bbq hours",
  "i dropped a satchel on your hay bale",
  "my moo-zine is fuller than yours",
  "build tower, farm udder, repeat",
];
function botMaybeChat(bot) {
  if (!bot._lastChatT) bot._lastChatT = 0;
  bot._lastChatT++;
  // Chance-based chatter, max once every ~18 action ticks
  if (bot._lastChatT < 18) return;
  if (Math.random() < 0.08) {
    const line = BOT_CHAT_LINES[Math.floor(Math.random() * BOT_CHAT_LINES.length)];
    broadcast({ type: 'chat', name: bot.name, color: bot.color, text: line });
    bot._lastChatT = 0;
  }
}

const PERSONALITIES = ['timid', 'balanced', 'aggressive'];
const PERSONALITY_STATS = {
  aggressive: { engageRange: 700, fireRange: 500, hungerThreshold: 30, fleeHp: 15 },
  balanced:   { engageRange: 500, fireRange: 350, hungerThreshold: 50, fleeHp: 40 },
  timid:      { engageRange: 300, fireRange: 200, hungerThreshold: 70, fleeHp: 50 },
};

// Liang-Barsky segment vs AABB — returns true if segment (x1,y1)->(x2,y2) crosses rect
function segmentHitsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
  if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;
  const dx = x2 - x1, dy = y2 - y1;
  let tMin = 0, tMax = 1;
  const pp = [-dx, dx, -dy, dy];
  const qq = [x1 - rx, (rx + rw) - x1, y1 - ry, (ry + rh) - y1];
  for (let i = 0; i < 4; i++) {
    if (pp[i] === 0) {
      if (qq[i] < 0) return false;
    } else {
      const tt = qq[i] / pp[i];
      if (pp[i] < 0) { if (tt > tMax) return false; if (tt > tMin) tMin = tt; }
      else { if (tt < tMin) return false; if (tt < tMax) tMax = tt; }
    }
  }
  return tMin <= tMax;
}

// Steer around walls: if the line from (px,py) to target crosses any wall,
// return the best corner to route around. Otherwise return null (direct path is clear).
function routeAroundWalls(px, py, tx, ty) {
  const LOOKAHEAD = 220; // only steer around walls within this range along the path
  const pad = 28;
  // Clip target to lookahead distance for the obstacle check — walls past 220u don't matter yet
  const dTot = Math.hypot(tx - px, ty - py);
  let cx = tx, cy = ty;
  if (dTot > LOOKAHEAD) {
    const f = LOOKAHEAD / dTot;
    cx = px + (tx - px) * f;
    cy = py + (ty - py) * f;
  }
  let blockingWall = null;
  for (const w of state.WALLS) {
    // Pre-filter: skip walls whose bbox is far from the segment midpoint
    const midX = (px + cx) / 2, midY = (py + cy) / 2;
    const wcx = w.x + w.w / 2, wcy = w.y + w.h / 2;
    if (Math.hypot(midX - wcx, midY - wcy) > LOOKAHEAD + Math.max(w.w, w.h)) continue;
    if (segmentHitsRect(px, py, cx, cy, w.x - pad, w.y - pad, w.w + pad * 2, w.h + pad * 2)) {
      blockingWall = w; break;
    }
  }
  if (!blockingWall) return null;
  // Pick the corner minimizing total path length: dist(p->corner) + dist(corner->target)
  const w = blockingWall;
  const corners = [
    { x: w.x - pad, y: w.y - pad },
    { x: w.x + w.w + pad, y: w.y - pad },
    { x: w.x - pad, y: w.y + w.h + pad },
    { x: w.x + w.w + pad, y: w.y + w.h + pad },
  ];
  let best = corners[0], bestCost = Infinity;
  for (const c of corners) {
    const cost = Math.hypot(px - c.x, py - c.y) + Math.hypot(c.x - tx, c.y - ty);
    if (cost < bestCost) { bestCost = cost; best = c; }
  }
  return best;
}

function spawnBots() {
  if (!state.botsEnabled) return;
  const humanCount = countReady();
  const botsNeeded = Math.max(0, 8 - humanCount);
  // Collect human names to avoid duplicates
  const humanNames = new Set();
  for (const [, p] of state.players) { if (!p.isBot && p.name) humanNames.add(p.name.toLowerCase()); }
  const availNames = (state.shuffledBotNames.length ? state.shuffledBotNames : BOT_NAMES).filter(n => !humanNames.has(n.toLowerCase()));
  for (let i = 0; i < botsNeeded; i++) {
    const botId = state.nextId++;
    const { assignColor } = require('./player');
    const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const bot = {
      id: botId, ws: null, name: availNames[i % availNames.length] || ('Bot' + botId), color: assignColor(),
      x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200), z: 0, vz: 0, onGround: true, dx: 0, dy: 0, dir: 'south',
      hunger: 100, score: 0, alive: true, inLobby: false,
      eating: false, eatTimer: 0, foodEaten: 0,
      xp: 0, level: 0, xpToNext: 50, kills: 0,
      dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
      perks: { speedMult: 1, radiusMult: 1, drainMult: 1, magnetRange: 0, regen: 0, maxHunger: 100, sizeMult: 1, damage: 1 },
      weaponPerks: { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false },
      weapon: 'normal', weaponLevel: 0, weaponTimer: 0, ammo: 15, reloading: 0, armor: 10 + Math.floor(Math.random() * 40),
      isBot: true, botTarget: null, botActionTimer: 2, spawnProtection: 1,
      personality,
    };
    state.players.set(botId, bot);
  }
}

function updateBots(dt) {
  if (!state.botsFreeWill) return;
  for (const [, p] of state.players) {
    if (!p.isBot || !p.alive) continue;
    p.botActionTimer -= dt;
    if (p.botActionTimer > 0) continue;
    p.botActionTimer = 0.5 + Math.random() * 0.8;
    botMaybeChat(p);

    const personality = p.personality || 'balanced';
    const hasGun = p.weapon !== 'normal';

    let nearestFood = null, nearFoodDist = Infinity;
    for (const f of state.foods) {
      if (f.poisoned) continue;
      const d = Math.hypot(p.x - f.x, p.y - f.y);
      if (d < nearFoodDist) { nearFoodDist = d; nearestFood = f; }
    }

    let nearestEnemy = null, nearEnemyDist = Infinity;
    for (const [, e] of state.players) {
      if (e.id === p.id || !e.alive) continue;
      const d = Math.hypot(p.x - e.x, p.y - e.y, p.z - e.z);
      if (d < nearEnemyDist) { nearEnemyDist = d; nearestEnemy = e; }
    }

    let nearestWeapon = null, nearWeaponDist = Infinity;
    for (const w of state.weaponPickups) {
      const d = Math.hypot(p.x - w.x, p.y - w.y);
      if (d < nearWeaponDist) { nearWeaponDist = d; nearestWeapon = w; }
    }

    if (!p._lastPos) p._lastPos = { x: p.x, y: p.y, t: 0, stuckCount: 0 };
    p._lastPos.t += 0.4;
    if (p._lastPos.t > 1) {
      const moved = Math.hypot(p.x - p._lastPos.x, p.y - p._lastPos.y);
      if (moved < 15) {
        p._lastPos.stuckCount = (p._lastPos.stuckCount || 0) + 1;
        // Try perpendicular movement to escape wall
        if (p._lastPos.stuckCount === 1 && p.dx !== 0) {
          p._stuckSidestep = { x: p.x + (-p.dy) * 60, y: p.y + p.dx * 60, t: 1.5 };
        } else if (p._lastPos.stuckCount >= 2) {
          p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
          p._lastPos.stuckCount = 0;
        }
      } else {
        p._lastPos.stuckCount = 0;
      }
      p._lastPos = { x: p.x, y: p.y, t: 0, stuckCount: p._lastPos.stuckCount };
    }
    if (p._stuckSidestep) {
      p._stuckSidestep.t -= 0.4;
      if (p._stuckSidestep.t <= 0) p._stuckSidestep = null;
    }

    const stats = PERSONALITY_STATS[personality] || PERSONALITY_STATS.balanced;
    const { engageRange, fireRange, hungerThreshold, fleeHp } = stats;

    let targetX, targetY;

    if (p._stuckSidestep) {
      targetX = p._stuckSidestep.x; targetY = p._stuckSidestep.y;
    }
    else if (p._wanderTarget) {
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
      if (Math.hypot(p.x - targetX, p.y - targetY) < 50) p._wanderTarget = null;
    }
    else if (nearestWeapon && nearWeaponDist < 400 && !hasGun) {
      // Everyone grabs weapons
      targetX = nearestWeapon.x; targetY = nearestWeapon.y;
    }
    else if (state.cowstrikeActive && state.SHELTERS.length > 0) {
      let nearShelter = null, nearShDist = Infinity;
      for (const sh of state.SHELTERS) {
        const d = Math.hypot(p.x - sh.x, p.y - sh.y);
        if (d < nearShDist) { nearShDist = d; nearShelter = sh; }
      }
      if (nearShelter) { targetX = nearShelter.x; targetY = nearShelter.y; }
    }
    else if (personality === 'aggressive' && nearestEnemy && nearEnemyDist < engageRange) {
      // Aggressive: always seek combat, even without a gun
      if (nearEnemyDist < fireRange && p.attackCooldown <= 0 && p.hunger > 15) {
        const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
        const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
        fireBot(p, ax, ay, nearestEnemy);
      }
      // Only retreat if very low hp
      if (p.hunger < fleeHp && nearestFood) {
        targetX = nearestFood.x; targetY = nearestFood.y;
      } else {
        const idealDist = hasGun ? 180 : 40;
        if (nearEnemyDist < idealDist - 20) {
          // Aggressive without gun: don't flee, strafe instead
          const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
          const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
          const dir = (p.id % 2 === 0) ? 1 : -1;
          targetX = p.x + perpX * 60 * dir; targetY = p.y + perpY * 60 * dir;
        } else if (nearEnemyDist > idealDist + 50) {
          targetX = nearestEnemy.x; targetY = nearestEnemy.y;
        } else {
          const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
          const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
          const dir = (p.id % 2 === 0) ? 1 : -1;
          targetX = p.x + perpX * 80 * dir; targetY = p.y + perpY * 80 * dir;
        }
      }
    }
    else if (personality === 'timid') {
      // Timid: prioritize food, flee from enemies
      if (p.hunger < hungerThreshold && nearestFood) {
        targetX = nearestFood.x; targetY = nearestFood.y;
      } else if (nearestEnemy && nearEnemyDist < engageRange) {
        if (hasGun && nearEnemyDist < fireRange && p.attackCooldown <= 0 && p.hunger > 20) {
          // Only shoot if they have a gun and enemy is close
          const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
          const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
          fireBot(p, ax, ay, nearestEnemy);
          // Shoot and back away
          targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
        } else {
          // Run away
          targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
        }
      } else if (nearestFood) {
        targetX = nearestFood.x; targetY = nearestFood.y;
      } else {
        if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
        targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
      }
    }
    else {
      // Balanced: original behavior — fight with gun, flee without, eat when hungry
      const underAttack = p.hunger < fleeHp && p.lastAttacker && nearestEnemy && nearEnemyDist < 400;
      if (p.hunger < hungerThreshold && nearestFood && !underAttack) {
        targetX = nearestFood.x; targetY = nearestFood.y;
      } else if (nearestEnemy && nearEnemyDist < engageRange) {
        if (hasGun) {
          if (nearEnemyDist < fireRange && p.attackCooldown <= 0 && p.hunger > 15) {
            const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
            const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
            fireBot(p, ax, ay, nearestEnemy);
          }
          const idealDist = 200;
          if (nearEnemyDist < idealDist - 30) {
            targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
          } else if (nearEnemyDist > idealDist + 50) {
            targetX = nearestEnemy.x; targetY = nearestEnemy.y;
          } else {
            const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
            const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
            const dir = (p.id % 2 === 0) ? 1 : -1;
            targetX = p.x + perpX * 80 * dir; targetY = p.y + perpY * 80 * dir;
          }
        } else {
          // No gun — spit if close, but don't flee
          if (nearEnemyDist < 150 && p.attackCooldown <= 0 && p.hunger > 15) {
            const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
            const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
            fireBot(p, ax, ay, nearestEnemy);
          }
          // Strafe around enemy rather than fleeing
          const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
          const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
          const dir = (p.id % 2 === 0) ? 1 : -1;
          targetX = p.x + perpX * 60 * dir; targetY = p.y + perpY * 60 * dir;
        }
      } else if (nearestFood) {
        targetX = nearestFood.x; targetY = nearestFood.y;
      } else {
        if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
        targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
      }
    }

    // Wall-aware steering: if a wall blocks the direct path, route via best corner.
    // Skip when already sidestepping (stuck escape has priority).
    if (targetX !== undefined && targetY !== undefined && !p._stuckSidestep) {
      const detour = routeAroundWalls(p.x, p.y, targetX, targetY);
      if (detour) { targetX = detour.x; targetY = detour.y; }
    }

    const dx = targetX - p.x, dy = targetY - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 10) { p.dx = dx / dist; p.dy = dy / dist; p.aimAngle = Math.atan2(-p.dx, p.dy); }
    else { p.dx = 0; p.dy = 0; }

    // Dash when in danger: low hp + enemy close, or being attacked at close range
    if (p.dashCooldown <= 0 && nearestEnemy && nearEnemyDist < 200 && (p.hunger < 30 || p.stunTimer > 0)) {
      if (nearEnemyDist > 1) {
        p.dx = -(nearestEnemy.x - p.x) / nearEnemyDist;
        p.dy = -(nearestEnemy.y - p.y) / nearEnemyDist;
      }
      handleDash(p);
      p.dashCooldown = p.dashCooldown * 4;
    }

    // Place a barricade when cornered by a ranged enemy
    if (nearestEnemy && nearEnemyDist > 120 && nearEnemyDist < 500 && (p.hunger < 60 || p.stunTimer > 0)) {
      const nowMs = Date.now();
      if (!p.barricadeReadyAt || nowMs >= p.barricadeReadyAt) {
        // Aim barricade between bot and enemy — drop cover in the line of fire
        const ax = (nearestEnemy.x - p.x) / nearEnemyDist;
        const ay = (nearestEnemy.y - p.y) / nearEnemyDist;
        placeBarricadeForPlayer(p, ax, ay);
      }
    }
  }
}

function fireBot(bot, ax, ay, target) {
  bot.aimAngle = Math.atan2(-ax, ay);
  const weapon = bot.weapon || 'normal';
  const magSize = MAG_SIZES[weapon];
  if (magSize && bot.ammo <= 0) { handleReload(bot); return; }
  if (bot.reloading > 0) return;
  const wp = bot.weaponPerks || { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false };
  const cdMult = Math.max(0.3, wp.cooldown);
  const dmgMult = wp.damageMult;
  const velMult = wp.velocity;
  const botEye = 35 * (bot.perks ? bot.perks.sizeMult : 1);
  const botZ = bot.z + botEye;
  const targetMid = target && target.perks ? 35 * target.perks.sizeMult / 2 : 17;
  const targetZ = target ? (target.z + targetMid) : botZ;
  const targetDist2d = target ? Math.hypot(target.x - bot.x, target.y - bot.y) : 1;
  const aimZ = targetDist2d > 1 ? (targetZ - botZ) / targetDist2d : 0;

  if (weapon === 'normal' && bot.hunger > 10) {
    bot.hunger -= 3;
    bot.attackCooldown = 1.0 * cdMult;
    const projId = state.foodIdCounter++;
    const dmg = 8 * bot.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, z: botZ, vx: ax * 1400 * velMult, vy: ay * 1400 * velMult, vz: aimZ * 1400 * velMult, life: 999, dmg, piercing: wp.piercing };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: bot.color });
  } else if (weapon === 'burst' && bot.hunger > 4) {
    const isAggro = bot.personality === 'aggressive';
    if (isAggro) {
      // Full auto — single shot, fast cooldown
      bot.hunger -= 1;
      bot.attackCooldown = 0.1 * cdMult;
      const projId = state.foodIdCounter++;
      const dmg = 3 * bot.perks.damage * dmgMult;
      const spread = 0.035;
      const sax = ax + (Math.random()-0.5)*spread*2, say = ay + (Math.random()-0.5)*spread*2, saz = aimZ + (Math.random()-0.5)*spread*2;
      const proj = { id: projId, ownerId: bot.id, x: bot.x + sax * 40, y: bot.y + say * 40, z: botZ, vx: sax * 1600 * velMult, vy: say * 1600 * velMult, vz: saz * 1600 * velMult, life: 999, dmg, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: bot.color });
      if (magSize) bot.ammo--;
    } else {
      // Burst — 3 shots
      bot.hunger -= 5;
      bot.attackCooldown = 0.8 * cdMult;
      for (let b = 0; b < 3; b++) {
        const projId = state.foodIdCounter++;
        const dmg = 6 * bot.perks.damage * dmgMult;
        const offset = b * 15;
        const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * (40 + offset), y: bot.y + ay * (40 + offset), z: botZ, vx: ax * 1600 * velMult, vy: ay * 1600 * velMult, vz: aimZ * 1600 * velMult, life: 999, dmg, piercing: wp.piercing };
        state.projectiles.push(proj);
        const bb = b;
        setTimeout(() => {
          broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: bot.color, burst: bb === 0 });
        }, bb * 80);
      }
      if (magSize) bot.ammo = Math.max(0, bot.ammo - 3);
    }
  } else if (weapon === 'shotgun' && bot.hunger > 7) {
    bot.hunger -= 7;
    bot.attackCooldown = 1.0 * cdMult;
    const volleyId = state.foodIdCounter++;
    for (let b = 0; b < 5; b++) {
      const spread = (Math.random() - 0.5) * 0.2;
      const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
      const by = ax * Math.sin(spread) + ay * Math.cos(spread);
      const projId = state.foodIdCounter++;
      const proj = { id: projId, ownerId: bot.id, x: bot.x + bx * 40, y: bot.y + by * 40, z: botZ, vx: bx * 1200 * velMult, vy: by * 1200 * velMult, vz: (aimZ + (Math.random()-0.5)*0.2) * 1200 * velMult, life: 999, dmg: 5 * bot.perks.damage * dmgMult, volleyId, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: bot.color, shotgun: b === 0 });
    }
    if (magSize) bot.ammo--;
  } else if (weapon === 'bolty' && bot.hunger > 12) {
    bot.hunger -= 8;
    bot.attackCooldown = 2.5 * cdMult;
    const projId = state.foodIdCounter++;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, z: botZ, vx: ax * 16800 * velMult, vy: ay * 16800 * velMult, vz: aimZ * 16800 * velMult, life: 999, dmg: 28 * bot.perks.damage * dmgMult, piercing: wp.piercing, wallPiercing: true };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: bot.color, bolty: true });
    if (magSize) bot.ammo--;
  } else if (weapon === 'cowtank' && bot.hunger > 6) {
    bot.hunger -= 5;
    bot.attackCooldown = 1.0 * cdMult;
    const projId = state.foodIdCounter++;
    const dmg = 38 * bot.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, z: botZ, vx: ax * 2000 * velMult, vy: ay * 2000 * velMult, vz: aimZ * 2000 * velMult, life: 999, dmg, explosive: true, blastRadius: 180 };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: bot.color, cowtank: true });
    bot.weapon = 'normal'; bot.weaponLevel = 0;
    bot.ammo = 15; bot.reloading = 0;
    broadcast({ type: 'weaponDrop', playerId: bot.id, name: bot.name });
  }
}

module.exports = { spawnBots, updateBots, fireBot };
