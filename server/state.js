const { MAP_W, MAP_H } = require('./config');

const state = {
  nextId: 1,
  gameState: 'lobby',
  lobbyTimer: null,
  lobbyCountdown: 30,
  restartTimer: null,
  players: new Map(),
  foods: [],
  foodIdCounter: 1,
  tickInterval: null,
  aliveCount: 0,
  gameTime: 0,
  zone: { x: 0, y: 0, w: MAP_W, h: MAP_H },
  projectiles: [],
  weaponPickups: [],
  armorPickups: [],
  readyCountdown: false,
  cowstrikeActive: false,
  botsEnabled: true,
  botsFreeWill: true,
  shuffledBotNames: [],
  hostId: null,
  // Map features
  WALLS: [],
  BARRICADES: [], // player-placed wooden walls, blocks everything except L96
  barricadeIdCounter: 1,
  BARRICADE_COOLDOWN_MS: 5000,
  BOT_BARRICADE_COOLDOWN_MS: 10000, // bots get +100% longer cooldown
  MUD_PATCHES: [],
  HEAL_PONDS: [],
  PORTALS: [],
  SHELTERS: [],
};

module.exports = state;
