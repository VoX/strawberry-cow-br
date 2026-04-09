// GameStateMachine — owns the lobby ↔ game ↔ ending round transitions.
//
// Late-binding (hook) pattern to break the require cycle:
//   - lobby.js used to `require('./game')` lazily for startGame
//   - game.js used to `require('./lobby')` lazily for startLobby
// Both files now `require('./game-fsm')` statically and register their
// transition handlers at module init time. This module has no imports from
// either side, so there is no cycle.

const { broadcast } = require('./network');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { buildServerStatus } = require('./player');

let _startGame = null;
let _startLobby = null;

// Single-bind: re-registration is treated as a bug. A second register call
// would usually mean two copies of game.js loaded (hot reload, test harness
// mishap) and silently clobbering the first breaks the state machine.
function registerStartGame(fn) {
  if (_startGame) throw new Error('game-fsm: startGame already registered');
  _startGame = fn;
}
function registerStartLobby(fn) {
  if (_startLobby) throw new Error('game-fsm: startLobby already registered');
  _startLobby = fn;
}

// Called by lobby.js when the ready countdown hits 0.
function startGameFromLobby() {
  if (!_startGame) throw new Error('game-fsm: startGame hook not registered');
  _startGame();
}

// Called by game.js when a winner has been determined (or everyone died).
// Owns the 10s restart countdown broadcast and the final lobby transition.
function endRound(winner) {
  // Validate BOTH hooks up front. If the lobby hook is missing, we must not
  // broadcast the winner — the server would be stuck in 'ending' forever.
  if (!_startLobby) throw new Error('game-fsm: startLobby hook not registered');
  lobbyState.transitionToEnding();
  gameState.clearTickInterval();
  broadcast({
    type: 'winner',
    playerId: winner ? winner.id : null,
    name: winner ? winner.name : 'Nobody',
    kills: winner ? winner.kills : 0,
    score: winner ? winner.score : 0,
  });
  broadcast(buildServerStatus());
  let countdown = 10;
  gameState.setRestartTimer(setInterval(() => {
    countdown--;
    broadcast({ type: 'restart', countdown });
    broadcast(buildServerStatus());
    if (countdown <= 0) {
      gameState.clearRestartTimer();
      for (const [id, p] of gameState.getPlayers()) {
        if (p.isBot) { gameState.removePlayer(id); }
        else { p.inLobby = true; p.alive = false; }
      }
      _startLobby();
    }
  }, 1000));
}

module.exports = { registerStartGame, registerStartLobby, startGameFromLobby, endRound };
