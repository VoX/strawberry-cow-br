// Transport-agnostic message dispatch. Both WebSocket and geckos.io
// transports call dispatchMessage(player, msg) after their own rate
// limiting + payload parsing; this module routes the typed message to
// the right game-code handler.
//
// Extracted from server/index.js during W.0 of the WebRTC migration so
// the message-handling surface is shared across transports. Every branch
// here is a verbatim move from the old inline ws.on('message') handler.

const { MAP_W, MAP_H } = require('./config');
const { STATEFUL_INPUT_TYPES } = require('../shared/constants');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { broadcast, sendTo } = require('./network');
const { assignColor, getPlayerStates, serializeFood, eliminatePlayer } = require('./player');
const { handlePerk } = require('./perks');
const { handleDropWeapon } = require('./weapons');
const { handleAttack, handleDash, handleReload, placeBarricadeForPlayer } = require('./combat');
const { checkAllReady, getLobbyPlayers, startLobby } = require('./lobby');
const { checkWinner } = require('./game');
const transport = require('./transport');

// Create a fresh player object. Called from the transport's onConnect
// callback once a new peer joins — before any join message arrives the
// player is a stub with just the transport ref.
function createPlayer(transportRef) {
  const id = gameState.nextPlayerId();
  // The player exists in the WeakMap from this moment, but isn't added to
  // gameState until the `join` message arrives. Nothing iterates gameState
  // expecting the WeakMap and it to be in sync.
  return {
    id,
    // Field name `ws` is historical — every consumer (combat.js, game.js,
    // network.js, ws transport _broadcast) reads `p.ws`. Holds whatever
    // opaque ref the transport handed us; for ws it's a WebSocket, for
    // geckos it'll be a ServerChannel.
    ws: transportRef,
    name: null, color: null,
    x: MAP_W / 2, y: MAP_H / 2, z: 0, vz: 0, onGround: true, dx: 0, dy: 0, dir: 'south',
    hunger: 100, score: 0, alive: false, inLobby: true,
    eating: false, eatTimer: 0, foodEaten: 0,
    kills: 0, dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
    perks: { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1 },
    weaponPerks: { cooldown: 1, hungerDiscount: 0, damageMult: 1 },
    weapon: 'normal', weaponTimer: 0, ammo: 15, reloading: 0, armor: 0,
    lastInputSeq: 0,
    updateRate: 30,
    _joined: false,
  };
}

function dispatchMessage(player, msg) {
  if (!msg || !msg.type) return;
  // Pre-join gate: only `join` is allowed before the join handshake.
  // The old inline `if (msg.type === 'join' && !player)` check made this
  // a hard wall because `player` was literally null pre-join. Now the
  // player object exists from the moment the transport accepts the peer,
  // so we have to enforce the wall explicitly. Without this gate any
  // future handler that drops its internal `player.alive` check would
  // silently let an un-joined peer mutate game state.
  if (!player._joined && msg.type !== 'join') return;

  // Monotonic-clamped seq tracker for CSP reconcile. Only stateful inputs
  // get tracked; the gate above already blocks pre-join messages so any
  // message reaching this line belongs to a joined player. STALE inputs
  // (seq < lastInputSeq) are dropped entirely — geckos.io's unreliable
  // channel can deliver `move` messages out of order, and applying a
  // stale move would overwrite the freshest dx/dy with stale values
  // until the next move arrives. The drop is silent: the next live move
  // arrives within ~50 ms and supersedes whatever was lost.
  if (typeof msg.seq === 'number' && STATEFUL_INPUT_TYPES.has(msg.type)) {
    if (msg.seq <= (player.lastInputSeq || 0)) return;
    player.lastInputSeq = msg.seq;
  }

  if (msg.type === 'setName' && player._joined && player.inLobby) {
    const name = String(msg.name || '').slice(0, 12).trim();
    if (name) {
      player.name = name;
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.isReadyCountdownActive() ? lobbyState.getLobbyCountdown() : -1, allReady: checkAllReady() });
    }
  }

  if (msg.type === 'join' && !player._joined) {
    player.name = String(msg.name || 'Cow').slice(0, 12);
    player.color = assignColor();
    player._joined = true;
    gameState.addPlayer(player.id, player);
    if (lobbyState.getHostId() === null) lobbyState.setHost(player.id);
    sendTo(player.ws, {
      type: 'joined', id: player.id, color: player.color,
      botsEnabled: gameState.isBotsEnabled(), botsFreeWill: gameState.isBotsFreeWill(),
      nightMode: gameState.isNightMode(), hostId: lobbyState.getHostId(),
    });
    if (lobbyState.isInLobby()) {
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.getLobbyCountdown() });
    } else if (lobbyState.isPlaying()) {
      const { getSeed } = require('./terrain');
      sendTo(player.ws, {
        type: 'spectate',
        terrainSeed: getSeed(),
        players: getPlayerStates(),
        foods: gameState.getFoods().map(serializeFood),
        zone: gameState.getZone(),
        map: {
          walls: gameState.getWalls(), mud: gameState.getMudPatches(),
          ponds: gameState.getHealPonds(), portals: gameState.getPortals(),
          shelters: gameState.getShelters(), houses: gameState.getHouses(),
        },
        barricades: gameState.getBarricades(),
        weapons: gameState.getWeaponPickups().map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })),
        armorPickups: gameState.getArmorPickups().map(a => ({ id: a.id, x: a.x, y: a.y })),
      });
    }
    if (!lobbyState.getLobbyTimer() && !lobbyState.isPlaying() && !lobbyState.isEnding()) {
      startLobby();
    }
    return;
  }

  if (msg.type === 'perk') {
    handlePerk(player, msg.id);
  }
  if (msg.type === 'toggleBots' && player._joined && lobbyState.isHost(player.id)) {
    broadcast({ type: 'botsToggled', enabled: gameState.toggleBotsEnabled() });
  }
  if (msg.type === 'toggleBotsFreeWill' && player._joined && lobbyState.isHost(player.id)) {
    broadcast({ type: 'botsFreeWillToggled', enabled: gameState.toggleBotsFreeWill() });
  }
  if (msg.type === 'toggleNight' && player._joined && lobbyState.isHost(player.id)) {
    broadcast({ type: 'nightToggled', enabled: gameState.toggleNightMode() });
  }
  if (msg.type === 'dropWeapon') {
    handleDropWeapon(player);
  }
  if (msg.type === 'ready' && player._joined && player.inLobby) {
    player.ready = !player.ready;
    let anyReady = false;
    for (const [, pp] of gameState.getPlayers()) { if (pp.inLobby && !pp.isBot && pp.ready) { anyReady = true; break; } }
    if (anyReady && !lobbyState.isReadyCountdownActive()) {
      lobbyState.startReadyCountdown(20);
    } else if (!anyReady && lobbyState.isReadyCountdownActive()) {
      lobbyState.cancelReadyCountdown(20);
    }
    if (lobbyState.isReadyCountdownActive() && checkAllReady() && lobbyState.getLobbyCountdown() > 4) {
      lobbyState.setLobbyCountdown(4);
    }
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.isReadyCountdownActive() ? lobbyState.getLobbyCountdown() : -1, allReady: checkAllReady() });
  }
  if (msg.type === 'kick' && player._joined && lobbyState.isHost(player.id) && lobbyState.isInLobby()) {
    const target = gameState.getPlayer(msg.targetId);
    if (target && !target.isBot && target.id !== lobbyState.getHostId()) {
      sendTo(target.ws, { type: 'kicked' });
      // Drop the joined flag so the pre-join gate blocks any messages
      // the kicked client sends during the geckos close-flush window
      // (closePlayer defers the actual channel teardown to give the
      // reliable retransmit of `kicked` time to land).
      target._joined = false;
      transport.closePlayer(target.ws);
      gameState.removePlayer(msg.targetId);
      broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.isReadyCountdownActive() ? lobbyState.getLobbyCountdown() : -1, allReady: checkAllReady() });
    }
  }
  if (msg.type === 'move' && player._joined && player.alive) {
    player.dx = Math.max(-1, Math.min(1, msg.dx || 0));
    if (Math.abs(msg.dx || 0) + Math.abs(msg.dy || 0) > 0.1) player.aimAngle = Math.atan2(-(msg.dx || 0), msg.dy || 0);
    player.dy = Math.max(-1, Math.min(1, msg.dy || 0));
    player.walking = !!msg.walking;
  }
  if (msg.type === 'attack') {
    handleAttack(player, msg);
  }
  if (msg.type === 'reload') {
    handleReload(player);
  }
  if (msg.type === 'dash') {
    handleDash(player);
  }
  if (msg.type === 'jump' && player._joined && player.alive && player.onGround) {
    player.vz = 200;
    player.onGround = false;
  }
  if (msg.type === 'placeBarricade' && player._joined && player.alive) {
    placeBarricadeForPlayer(player, msg.aimX || 0, msg.aimY || 0);
  }
  if (msg.type === 'setUpdateRate' && player._joined) {
    const r = Number(msg.rate);
    if (Number.isFinite(r)) player.updateRate = Math.max(5, Math.min(30, Math.round(r)));
  }
  if (msg.type === 'chat' && player._joined) {
    const txt = String(msg.text || '').slice(0, 120).trim();
    if (txt) broadcast({ type: 'chat', name: player.name, color: player.color, text: txt });
  }
}

function handleDisconnect(player) {
  if (!player || !player._joined) return;
  if (player.reloadTimer) { clearTimeout(player.reloadTimer); player.reloadTimer = null; }
  const projs = gameState.getProjectiles();
  for (let i = projs.length - 1; i >= 0; i--) {
    if (projs[i].ownerId === player.id) gameState.removeProjectileAt(i);
  }
  if (player.alive) {
    eliminatePlayer(player, 'disconnect');
    checkWinner();
  }
  gameState.removePlayer(player.id);
  if (lobbyState.getHostId() === player.id) {
    lobbyState.clearHost();
    for (const [id, p] of gameState.getPlayers()) { if (!p.isBot) { lobbyState.setHost(id); break; } }
    const newHostId = lobbyState.getHostId();
    for (const [, p] of gameState.getPlayers()) {
      if (!p.isBot && p.ws) sendTo(p.ws, { type: 'newHost', hostId: newHostId });
    }
  }
  if (lobbyState.isInLobby()) {
    broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.getLobbyCountdown() });
  }
}

module.exports = { createPlayer, dispatchMessage, handleDisconnect };
