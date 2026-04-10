// Transport-agnostic message dispatch. Both WebSocket and geckos.io
// transports call dispatchMessage(player, msg) after their own rate
// limiting + payload parsing; this module routes the typed message to
// the right game-code handler.
//
// Extracted from server/index.js during W.0 of the WebRTC migration so
// the message-handling surface is shared across transports. Every branch
// here is a verbatim move from the old inline ws.on('message') handler.

const { MAP_W, MAP_H } = require('./config');
const { STATEFUL_INPUT_TYPES, JUMP_VZ, SPEED_MULT_MIN, SPEED_MULT_MAX, CRAFTING_RECIPES, MAG_SIZES } = require('../shared/constants');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { broadcast, sendTo } = require('./network');
const { assignColor, getPlayerStates, serializeFood, eliminatePlayer, broadcastPlayerSnapshot } = require('./player');
const { handlePerk } = require('./perks');
const { handleDropWeapon } = require('./weapons');
const { handleAttack, handleMelee, handleDash, handleReload, cancelReload, placeBarricadeForPlayer } = require('./combat');
const { spawnPlayerIntoWorld, buildWorldSnapshot } = require('./game');
const gameFsm = require('./game-fsm');
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

  // Stale stateful inputs (seq <= last seen) are dropped — geckos UDP
  // can reorder. Note: lastInputSeq is now advanced by the per-tick
  // move-queue drain in game.js, NOT here, so we still gate on the
  // last RECEIVED seq tracked separately on `_lastRecvMoveSeq`.
  if (typeof msg.seq === 'number' && STATEFUL_INPUT_TYPES.has(msg.type)) {
    if (msg.seq <= (player._lastRecvMoveSeq || 0)) return;
    player._lastRecvMoveSeq = msg.seq;
  }

  if (msg.type === 'join' && !player._joined) {
    player.name = String(msg.name || 'Cow').slice(0, 12);
    player.color = assignColor();
    player._joined = true;
    gameState.addPlayer(player.id, player);
    if (lobbyState.getHostId() === null) lobbyState.setHost(player.id);
    // Ensure world is initialised (first join generates terrain + starts tick loop)
    gameFsm.ensureWorldReady();
    // Spawn into the live world immediately — no lobby, no ready-up
    spawnPlayerIntoWorld(player);
    sendTo(player.ws, {
      type: 'joined', id: player.id, color: player.color,
      botsEnabled: gameState.isBotsEnabled(), botsFreeWill: gameState.isBotsFreeWill(),
      nightMode: gameState.isNightMode(), hostId: lobbyState.getHostId(),
    });
    // Full world snapshot so the client can build terrain + entities
    sendTo(player.ws, buildWorldSnapshot());
    broadcastPlayerSnapshot(player);
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
  // --- Crafting ---
  if (msg.type === 'craft' && player._joined && player.alive && msg.recipeId) {
    const recipe = CRAFTING_RECIPES[msg.recipeId];
    if (!recipe) return;
    if (!player.resources) return;
    // Check resource costs
    for (const [res, amount] of Object.entries(recipe.cost)) {
      if ((player.resources[res] || 0) < amount) return;
    }
    // Deduct costs
    for (const [res, amount] of Object.entries(recipe.cost)) {
      player.resources[res] -= amount;
    }
    const give = recipe.give;
    if (give.weapon) {
      // Weapon craft: replace current weapon
      cancelReload(player);
      player.weapon = give.weapon;
      player.ammo = give.ammo || (MAG_SIZES[give.weapon] || 15);
      player.dualWield = false;
      broadcastPlayerSnapshot(player);
    } else if (give.ammoFor) {
      // Ammo craft: add ammo if holding the right weapon
      const matching = give.also
        ? [give.ammoFor, ...give.also]
        : [give.ammoFor];
      if (matching.includes(player.weapon)) {
        const max = (MAG_SIZES[player.weapon] || 15) * 2; // allow stockpiling up to 2x mag
        player.ammo = Math.min(max, (player.ammo || 0) + give.amount);
      }
      // If not holding the matching weapon, ammo is still consumed (no refund)
    } else if (give.heal) {
      const { applyHungerDelta } = require('./player');
      applyHungerDelta(player, give.heal);
    } else if (give.sleepingBag) {
      // Remove old sleeping bag if any
      const oldBag = gameState.getSleepingBag(player.id);
      if (oldBag) broadcast({ type: 'sleepingBagRemoved', id: oldBag.id });
      const bag = { id: gameState.nextEntityId(), x: player.x, y: player.y, ownerId: player.id };
      gameState.setSleepingBag(player.id, bag);
      broadcast({ type: 'sleepingBagPlaced', bag });
    }
    sendTo(player.ws, { type: 'crafted', recipeId: msg.recipeId });
  }
  if (msg.type === 'move' && player._joined && player.alive) {
    // Enqueue the move for the next tick's drain instead of overwriting
    // dx/dy directly. Each queue entry carries its OWN seq + input —
    // the gameTick movement loop pops one per tick and integrates
    // exactly that seq's input, then snapshots at that seq. This is
    // the load-bearing fix for walking-rubberband: the OLD direct-
    // write path silently dropped intermediate seqs whenever the
    // client sent multiple moves between two server ticks (clock
    // drift between client predict accumulator and server setInterval),
    // which produced a snapshot/ring-entry mismatch and a per-ack
    // visible snap. With the queue, every client predict step gets a
    // matching server integration step.
    if (!player._moveQueue) player._moveQueue = [];
    player._moveQueue.push({
      seq: msg.seq,
      dx: Math.max(-1, Math.min(1, msg.dx || 0)),
      dy: Math.max(-1, Math.min(1, msg.dy || 0)),
      walking: !!msg.walking,
      aim: typeof msg.aim === 'number' ? msg.aim : null,
      // Client-authoritative speed multiplier — knife / on-hit slow /
      // future loadout effects. Server simulates whatever the client says.
      speedMult: typeof msg.speedMult === 'number' ? Math.max(SPEED_MULT_MIN, Math.min(SPEED_MULT_MAX, msg.speedMult)) : 1,
    });
    // Cap depth to avoid runaway catch-up under sustained client
    // overproduction. Drop oldest on overflow — keeping the most
    // recent intent matters more than perfect history continuity.
    while (player._moveQueue.length > 6) player._moveQueue.shift();
    // Net stats: track move arrival times in a 1-second sliding window.
    if (!player._moveArrivals) player._moveArrivals = [];
    const nowMs = Date.now();
    player._moveArrivals.push(nowMs);
    while (player._moveArrivals.length > 0 && nowMs - player._moveArrivals[0] > 1000) {
      player._moveArrivals.shift();
    }
  }
  if (msg.type === 'attack') {
    handleAttack(player, msg);
  }
  if (msg.type === 'meleeAttack') {
    handleMelee(player);
  }
  if (msg.type === 'reload') {
    handleReload(player);
  }
  if (msg.type === 'dash') {
    handleDash(player);
  }
  if (msg.type === 'jump' && player._joined && player.alive && player.onGround) {
    player.vz = JUMP_VZ;
    player.onGround = false;
  }
  // Knife loadout slot — secondary weapon, always available, +20% move
  // speed while held. Pressing 2 stashes the primary on `_primaryWeapon`/
  // `_primaryAmmo`/`_primaryDualWield`; pressing 1 restores them. Picking
  // up a new weapon while holding the knife replaces _primaryWeapon
  // (handled in weapons.js).
  if (msg.type === 'switchWeapon' && player._joined && player.alive) {
    const target = msg.to === 'knife' ? 'knife' : 'primary';
    if (target === 'knife' && player.weapon !== 'knife') {
      player._primaryWeapon = player.weapon;
      player._primaryAmmo = player.ammo;
      player._primaryDualWield = !!player.dualWield;
      player.weapon = 'knife';
      player.dualWield = false;
      player.ammo = -1;
      cancelReload(player);
      broadcastPlayerSnapshot(player);
    } else if (target === 'primary' && player.weapon === 'knife' && player._primaryWeapon) {
      player.weapon = player._primaryWeapon;
      player.ammo = player._primaryAmmo != null ? player._primaryAmmo : 15;
      player.dualWield = !!player._primaryDualWield;
      broadcastPlayerSnapshot(player);
    }
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
    if (txt) broadcast({ type: 'chat', playerId: player.id, name: player.name, color: player.color, text: txt });
  }
  if (msg.type === 'moo' && player._joined && player.alive) {
    const nowMs = Date.now();
    if (nowMs >= (player.mooReadyAt || 0)) {
      player.mooReadyAt = nowMs + 1500;
      broadcast({ type: 'mooTaunt', playerId: player.id, x: player.x, y: player.y });
    }
  }
}

function handleDisconnect(player) {
  if (!player || !player._joined) return;
  cancelReload(player);
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
