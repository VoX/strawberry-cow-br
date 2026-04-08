const { broadcast } = require('./network');
const state = require('./state');

function checkAllReady() {
  let humans = 0, readyHumans = 0;
  for (const [, p] of state.players) {
    if (p.inLobby && !p.isBot) { humans++; if (p.ready) readyHumans++; }
  }
  return humans > 0 && readyHumans >= humans;
}

function countReady() {
  let c = 0;
  for (const [, p] of state.players) if (p.inLobby) c++;
  return c;
}

function getLobbyPlayers() {
  const arr = [];
  for (const [, p] of state.players) {
    if (p.inLobby || p.alive) arr.push({ id: p.id, name: p.name, color: p.color, ready: !!p.ready });
  }
  return arr;
}

function lobbyTick() {
  if (state.readyCountdown) {
    state.lobbyCountdown--;
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.lobbyCountdown, allReady: true });
    if (state.lobbyCountdown <= 0) {
      clearInterval(state.lobbyTimer); state.lobbyTimer = null;
      const { startGame } = require('./game');
      startGame();
    }
  } else {
    if (checkAllReady()) {
      state.readyCountdown = true;
      state.lobbyCountdown = 5;
    }
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.readyCountdown ? state.lobbyCountdown : -1, allReady: false });
  }
}

function startLobby() {
  state.gameState = 'lobby';
  state.readyCountdown = false;
  state.lobbyCountdown = 5;
  for (const [, p] of state.players) p.ready = false;
  if (state.lobbyTimer) clearInterval(state.lobbyTimer);
  state.lobbyTimer = setInterval(lobbyTick, 1000);
}

module.exports = { checkAllReady, countReady, getLobbyPlayers, startLobby };
