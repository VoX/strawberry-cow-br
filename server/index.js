const { WebSocketServer } = require('ws');
const http = require('http');

const { PORT, MAP_W, MAP_H } = require('./config');
const state = require('./state');
const { broadcast, sendTo } = require('./network');
const { assignColor, getPlayerStates, serializeFood } = require('./player');
const { handlePerk } = require('./perks');
const { handleDropWeapon } = require('./weapons');
const { handleAttack, handleDash } = require('./combat');
const { checkAllReady, getLobbyPlayers, startLobby } = require('./lobby');
const { checkWinner } = require('./game');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Strawberry Cow Battle Royale Server');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const playerId = state.nextId++;
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
      state.players.set(playerId, player);
      sendTo(ws, { type: 'joined', id: playerId, color });

      if (state.gameState === 'lobby') {
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.lobbyCountdown });
      } else if (state.gameState === 'playing') {
        sendTo(ws, { type: 'spectate', players: getPlayerStates(), foods: state.foods.map(serializeFood), zone: state.zone, map: { walls: state.WALLS, mud: state.MUD_PATCHES, ponds: state.HEAL_PONDS, portals: state.PORTALS, shelters: state.SHELTERS }, weapons: state.weaponPickups.map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })), armorPickups: state.armorPickups.map(a => ({ id: a.id, x: a.x, y: a.y })) });
      }

      if (!state.lobbyTimer && state.gameState !== 'playing' && state.gameState !== 'ending') {
        startLobby();
      }
    }

    if (msg.type === 'perk') {
      handlePerk(player, msg.id);
    }

    if (msg.type === 'toggleBots') {
      state.botsEnabled = !state.botsEnabled;
      broadcast({ type: 'botsToggled', enabled: state.botsEnabled });
    }

    if (msg.type === 'dropWeapon') {
      handleDropWeapon(player);
    }

    if (msg.type === 'ready' && player && player.inLobby) {
      player.ready = true;
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.readyCountdown ? state.lobbyCountdown : -1, allReady: checkAllReady() });
    }

    if (msg.type === 'move' && player && player.alive) {
      player.dx = Math.max(-1, Math.min(1, msg.dx || 0));
      if (Math.abs(msg.dx || 0) + Math.abs(msg.dy || 0) > 0.1) player.aimAngle = Math.atan2(-(msg.dx || 0), msg.dy || 0);
      player.dy = Math.max(-1, Math.min(1, msg.dy || 0));
    }

    if (msg.type === 'attack') {
      handleAttack(player, msg);
    }

    if (msg.type === 'dash') {
      handleDash(player);
    }
  });

  ws.on('close', () => {
    if (player) {
      if (player.alive) {
        player.alive = false;
        state.aliveCount--;
        broadcast({ type: 'eliminated', playerId: player.id, name: player.name, rank: state.aliveCount + 1 });
        checkWinner();
      }
      state.players.delete(playerId);
      if (state.gameState === 'lobby') {
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.lobbyCountdown });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Strawberry Cow Battle Royale server on port ${PORT}`);
});
