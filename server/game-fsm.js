// Survival-mode game state — always "playing". No lobby countdown, no
// round endings, no restart timers. The world initialises once on first
// player join and runs continuously until the process stops.

const lobbyState = require('./lobby-state');

let _initWorld = null;
let _worldReady = false;

function registerInitWorld(fn) {
  if (_initWorld) throw new Error('game-fsm: initWorld already registered');
  _initWorld = fn;
}

// Called by dispatch.js on the very first player join. Generates terrain,
// map features, initial food/weapons, and starts the tick loop.
function ensureWorldReady() {
  if (_worldReady) return;
  if (!_initWorld) throw new Error('game-fsm: initWorld hook not registered');
  _worldReady = true;
  lobbyState.transitionToPlaying();
  _initWorld();
}

function isWorldReady() { return _worldReady; }

module.exports = { registerInitWorld, ensureWorldReady, isWorldReady };
