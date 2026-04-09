const { broadcast } = require('./network');
const state = require('./state');
const { BOT_NAMES } = require('./config');

function shuffleBotNames() {
  const arr = [...BOT_NAMES];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  // 0.1% chance to sneak monnor into the roster
  if (Math.random() < 0.001) arr[0] = 'monnor';
  state.shuffledBotNames = arr;
}

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
  let humanCount = 0;
  for (const [, p] of state.players) {
    if (p.inLobby || p.alive) {
      arr.push({ id: p.id, name: p.name, color: p.color, ready: !!p.ready, isBot: !!p.isBot });
      if (!p.isBot) humanCount++;
    }
  }
  if (state.gameState === 'lobby' && state.botsEnabled) {
    const { COLORS } = require('./config');
    const humanNames = new Set();
    const usedColors = new Set();
    for (const [, p] of state.players) { if (!p.isBot && p.name) humanNames.add(p.name.toLowerCase()); if (p.color) usedColors.add(p.color); }
    const names = (state.shuffledBotNames.length ? state.shuffledBotNames : BOT_NAMES).filter(n => !humanNames.has(n.toLowerCase()));
    const availColors = COLORS.filter(c => !usedColors.has(c));
    const botsNeeded = Math.max(0, 8 - humanCount);
    for (let i = 0; i < botsNeeded; i++) {
      const botColor = availColors[i % availColors.length] || COLORS[i % COLORS.length];
      arr.push({ id: -1 - i, name: names[i % names.length] || ('Bot' + (i+1)), color: botColor, ready: true, isBot: true });
    }
  }
  return arr;
}

function countReadyHumans() {
  let ready = 0;
  for (const [, p] of state.players) { if (p.inLobby && !p.isBot && p.ready) ready++; }
  return ready;
}

function lobbyTick() {
  const anyReady = countReadyHumans() > 0;
  const allReady = checkAllReady();

  if (state.readyCountdown) {
    if (!anyReady) {
      // No one ready anymore — cancel countdown
      state.readyCountdown = false;
      state.lobbyCountdown = 20;
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: -1, allReady: false });
      return;
    }
    if (allReady && state.lobbyCountdown > 4) {
      state.lobbyCountdown = 4;
    }
    state.lobbyCountdown--;
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.lobbyCountdown, allReady });
    if (state.lobbyCountdown <= 0) {
      clearInterval(state.lobbyTimer); state.lobbyTimer = null;
      const { startGame } = require('./game');
      startGame();
    }
  } else {
    if (anyReady) {
      state.readyCountdown = true;
      state.lobbyCountdown = 20;
    }
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: state.readyCountdown ? state.lobbyCountdown : -1, allReady: false });
  }
}

function startLobby() {
  state.gameState = 'lobby';
  state.readyCountdown = false;
  shuffleBotNames();
  state.lobbyCountdown = 5;
  for (const [, p] of state.players) p.ready = false;
  if (state.lobbyTimer) clearInterval(state.lobbyTimer);
  state.lobbyTimer = setInterval(lobbyTick, 1000);
}

module.exports = { checkAllReady, countReady, getLobbyPlayers, startLobby };
