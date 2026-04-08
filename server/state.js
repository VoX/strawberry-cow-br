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
  // Map features
  WALLS: [],
  MUD_PATCHES: [],
  HEAL_PONDS: [],
  PORTALS: [],
  SHELTERS: [],
};

module.exports = state;
