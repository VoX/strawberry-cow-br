// LobbyState — owns lobby and state-machine concerns.
// Singleton; import as `const lobbyState = require('./lobby-state')`.
class LobbyState {
  constructor() {
    this._phase = 'lobby'; // 'lobby' | 'playing' | 'ending'
    this._lobbyTimer = null;
    this._lobbyCountdown = 30;
    this._readyCountdown = false;
    this._hostId = null;
    this._shuffledBotNames = [];
  }

  // --- gameState machine ---------------------------------------------------
  isInLobby() { return this._phase === 'lobby'; }
  isPlaying() { return this._phase === 'playing'; }
  isEnding()  { return this._phase === 'ending'; }
  getPhase()  { return this._phase; }

  transitionToLobby()   { this._phase = 'lobby'; }
  transitionToPlaying() { this._phase = 'playing'; }
  transitionToEnding()  { this._phase = 'ending'; }

  // --- lobby countdown -----------------------------------------------------
  getLobbyCountdown() { return this._lobbyCountdown; }
  setLobbyCountdown(n) { this._lobbyCountdown = n; }
  decLobbyCountdown() { return --this._lobbyCountdown; }

  isReadyCountdownActive() { return !!this._readyCountdown; }
  startReadyCountdown(seconds = 20) { this._readyCountdown = true; this._lobbyCountdown = seconds; }
  cancelReadyCountdown(resetSeconds = 20) { this._readyCountdown = false; this._lobbyCountdown = resetSeconds; }

  getLobbyTimer() { return this._lobbyTimer; }
  setLobbyTimer(t) { this._lobbyTimer = t; }
  clearLobbyTimer() {
    if (this._lobbyTimer) clearInterval(this._lobbyTimer);
    this._lobbyTimer = null;
  }

  // --- host tracking -------------------------------------------------------
  getHostId() { return this._hostId; }
  setHost(playerId) { this._hostId = playerId; }
  clearHost() { this._hostId = null; }
  isHost(playerId) { return this._hostId !== null && this._hostId === playerId; }

  // --- bot name roster (shuffled per-round) --------------------------------
  getShuffledBotNames() { return this._shuffledBotNames; }
  setShuffledBotNames(names) { this._shuffledBotNames = names; }
}

module.exports = new LobbyState();
