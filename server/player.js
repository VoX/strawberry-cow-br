const { COLORS } = require('./config');
const { broadcast, sendTo } = require('./network');
const state = require('./state');

function assignColor() {
  const used = new Set();
  for (const [, p] of state.players) used.add(p.color);
  for (const c of COLORS) { if (!used.has(c)) return c; }
  return COLORS[Math.random() * COLORS.length | 0];
}

function getPlayerStates() {
  const arr = [];
  for (const [, p] of state.players) {
    if (p.alive || (!p.inLobby && state.gameState === 'playing')) {
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
  state.aliveCount--;
  if (p.lastAttacker && reason === 'hunger') {
    const attacker = state.players.get(p.lastAttacker);
    if (attacker && attacker.alive) {
      attacker.kills = (attacker.kills || 0) + 1;
      attacker.score += 50;
      attacker.hunger = Math.min(attacker.perks.maxHunger, attacker.hunger + 25);
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
  broadcast({ type: 'eliminated', playerId: p.id, name: p.name, rank: state.aliveCount + 1 });
}

function serializeFood(f) {
  return { id: f.id, x: f.x, y: f.y, type: f.type.name, poisoned: f.poisoned, golden: f.golden };
}

module.exports = { assignColor, getPlayerStates, eliminatePlayer, serializeFood };
