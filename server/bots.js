const { MAP_W, MAP_H, BOT_NAMES } = require('./config');
const { rand } = require('./utils');
const { broadcast } = require('./network');
const state = require('./state');
const { countReady } = require('./lobby');

function spawnBots() {
  if (!state.botsEnabled) return;
  const humanCount = countReady();
  const botsNeeded = Math.max(0, 8 - humanCount);
  for (let i = 0; i < botsNeeded; i++) {
    const botId = state.nextId++;
    const { assignColor } = require('./player');
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
    state.players.set(botId, bot);
  }
}

function updateBots(dt) {
  for (const [, p] of state.players) {
    if (!p.isBot || !p.alive) continue;
    p.botActionTimer -= dt;
    if (p.botActionTimer > 0) continue;
    p.botActionTimer = 0.5 + Math.random() * 0.8;

    let nearestFood = null, nearFoodDist = Infinity;
    for (const f of state.foods) {
      if (f.poisoned) continue;
      const d = Math.hypot(p.x - f.x, p.y - f.y);
      if (d < nearFoodDist) { nearFoodDist = d; nearestFood = f; }
    }

    let nearestEnemy = null, nearEnemyDist = Infinity;
    for (const [, e] of state.players) {
      if (e.id === p.id || !e.alive) continue;
      const d = Math.hypot(p.x - e.x, p.y - e.y);
      if (d < nearEnemyDist) { nearEnemyDist = d; nearestEnemy = e; }
    }

    let nearestWeapon = null, nearWeaponDist = Infinity;
    for (const w of state.weaponPickups) {
      const d = Math.hypot(p.x - w.x, p.y - w.y);
      if (d < nearWeaponDist) { nearWeaponDist = d; nearestWeapon = w; }
    }

    if (!p._lastPos) p._lastPos = { x: p.x, y: p.y, t: 0 };
    p._lastPos.t += 0.4;
    if (p._lastPos.t > 3) {
      const moved = Math.hypot(p.x - p._lastPos.x, p.y - p._lastPos.y);
      if (moved < 30) { p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) }; }
      p._lastPos = { x: p.x, y: p.y, t: 0 };
    }

    let targetX, targetY;
    const hasGun = p.weapon !== 'normal';

    if (p._wanderTarget) {
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
      if (Math.hypot(p.x - targetX, p.y - targetY) < 50) p._wanderTarget = null;
    }
    else if (nearestWeapon && nearWeaponDist < 300 && !hasGun) {
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
    else if (p.hunger < 50 && nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    }
    else if (nearestEnemy && nearEnemyDist < 500) {
      if (nearEnemyDist < 350 && p.attackCooldown <= 0 && p.hunger > 15) {
        const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
        const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
        fireBot(p, ax, ay);
      }
      const idealDist = hasGun ? 200 : 50;
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
    }
    else if (nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    }
    else {
      if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
    }

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
    const projId = state.foodIdCounter++;
    const dmg = 8 * bot.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, vx: ax * 700 * velMult, vy: ay * 700 * velMult, life: 1.5, dmg, piercing: wp.piercing };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: bot.color });
  } else if (weapon === 'shotgun' && bot.hunger > 7) {
    bot.hunger -= 7;
    bot.attackCooldown = 1.5 * cdMult;
    const volleyId = state.foodIdCounter++;
    for (let b = 0; b < 5; b++) {
      const spread = (Math.random() - 0.5) * 0.2;
      const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
      const by = ax * Math.sin(spread) + ay * Math.cos(spread);
      const projId = state.foodIdCounter++;
      const proj = { id: projId, ownerId: bot.id, x: bot.x + bx * 40, y: bot.y + by * 40, vx: bx * 600 * velMult, vy: by * 600 * velMult, life: 0.35, dmg: 5 * dmgMult, volleyId };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: bot.color, shotgun: b === 0 });
    }
  } else if (weapon === 'bolty' && bot.hunger > 12) {
    bot.hunger -= 8;
    bot.attackCooldown = 2.5 * cdMult;
    const projId = state.foodIdCounter++;
    const proj = { id: projId, ownerId: bot.id, x: bot.x + ax * 40, y: bot.y + ay * 40, vx: ax * 4200 * velMult, vy: ay * 4200 * velMult, life: 1.5, dmg: 25 * dmgMult };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: bot.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: bot.color, bolty: true });
  }
}

module.exports = { spawnBots, updateBots, fireBot };
