const { broadcast } = require('./network');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { BOT_NAMES } = require('./config');
const gameFsm = require('./game-fsm');

function shuffleBotNames() {
  const arr = [...BOT_NAMES];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
  // 0.1% chance to sneak monnor into the roster
  if (Math.random() < 0.001) arr[0] = 'monnor';
  lobbyState.setShuffledBotNames(arr);
}

function checkAllReady() {
  let humans = 0, readyHumans = 0;
  for (const [, p] of gameState.getPlayers()) {
    if (p.inLobby && !p.isBot) { humans++; if (p.ready) readyHumans++; }
  }
  return humans > 0 && readyHumans >= humans;
}

function getLobbyPlayers() {
  const arr = [];
  let humanCount = 0;
  for (const [, p] of gameState.getPlayers()) {
    if (p.inLobby || p.alive) {
      arr.push({ id: p.id, name: p.name, color: p.color, ready: !!p.ready, isBot: !!p.isBot });
      if (!p.isBot) humanCount++;
    }
  }
  if (lobbyState.isInLobby() && gameState.isBotsEnabled()) {
    const { COLORS } = require('./config');
    const humanNames = new Set();
    const usedColors = new Set();
    for (const [, p] of gameState.getPlayers()) { if (!p.isBot && p.name) humanNames.add(p.name.toLowerCase()); if (p.color) usedColors.add(p.color); }
    const shuffled = lobbyState.getShuffledBotNames();
    const names = (shuffled.length ? shuffled : BOT_NAMES).filter(n => !humanNames.has(n.toLowerCase()));
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
  for (const [, p] of gameState.getPlayers()) { if (p.inLobby && !p.isBot && p.ready) ready++; }
  return ready;
}

function lobbyTick() {
  const anyReady = countReadyHumans() > 0;
  const allReady = checkAllReady();

  if (lobbyState.isReadyCountdownActive()) {
    if (!anyReady) {
      // No one ready anymore — cancel countdown
      lobbyState.cancelReadyCountdown(20);
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: -1, allReady: false });
      return;
    }
    if (allReady && lobbyState.getLobbyCountdown() > 4) {
      lobbyState.setLobbyCountdown(4);
    }
    const remaining = lobbyState.decLobbyCountdown();
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: remaining, allReady });
    if (remaining <= 0) {
      lobbyState.clearLobbyTimer();
      gameFsm.startGameFromLobby();
    }
  } else {
    if (anyReady) {
      lobbyState.startReadyCountdown(20);
    }
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.isReadyCountdownActive() ? lobbyState.getLobbyCountdown() : -1, allReady: false });
  }
}

function startLobby() {
  lobbyState.transitionToLobby();
  lobbyState.cancelReadyCountdown(5);
  shuffleBotNames();
  for (const [, p] of gameState.getPlayers()) p.ready = false;
  lobbyState.clearLobbyTimer();
  lobbyState.setLobbyTimer(setInterval(lobbyTick, 1000));
}

gameFsm.registerStartLobby(startLobby);

module.exports = { checkAllReady, getLobbyPlayers, startLobby };
