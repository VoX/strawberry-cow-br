const { WebSocketServer } = require('ws');
const http = require('http');
const net = require('net');

const { PORT, MAP_W, MAP_H } = require('./config');
const { STATEFUL_INPUT_TYPES } = require('../shared/constants');
const { assertEnumIntegrity } = require('../shared/messages');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { broadcast, sendTo } = require('./network');
const { assignColor, getPlayerStates, serializeFood, buildServerStatus, eliminatePlayer } = require('./player');
const { handlePerk } = require('./perks');
const { handleDropWeapon } = require('./weapons');
const { handleAttack, handleDash, handleReload, placeBarricadeForPlayer } = require('./combat');
const { checkAllReady, getLobbyPlayers, startLobby } = require('./lobby');
const { checkWinner } = require('./game');

// Fail loud on boot if the message enum has dupes/empties — cheap safety net
// against mis-edits that would silently ship a typoed message name.
assertEnumIntegrity();

// Rude FM stream proxy. The upstream is a SHOUTcast v1.x server that responds
// with "ICY 200 OK\r\n..." instead of a proper HTTP status line, which Caddy's
// strict Go HTTP transport rejects with a 502. We open a raw TCP socket,
// send a plain HTTP/1.0 request, rewrite the first line of the response to
// "HTTP/1.1 200 OK", and pipe the rest of the bytes (ICY headers + mp3 frames)
// to the client as a proper HTTP response. Caddy in front of us only sees
// well-formed HTTP and is happy.
const RUDE_HOST = '78.129.228.187', RUDE_PORT = 8042;
function proxyRudeFm(req, res) {
  const upstream = net.connect(RUDE_PORT, RUDE_HOST, () => {
    // SHOUTcast v1.x serves its HTML admin page to browser User-Agents and
    // only returns the audio stream when the UA is recognized as a media
    // player. WinampMPEG/5.0 is the canonical stream-client UA.
    upstream.write(
      'GET / HTTP/1.0\r\n' +
      'Host: ' + RUDE_HOST + ':' + RUDE_PORT + '\r\n' +
      'User-Agent: WinampMPEG/5.0\r\n' +
      'Icy-MetaData: 0\r\n\r\n'
    );
  });
  let headerBuf = Buffer.alloc(0);
  let headersSent = false;
  upstream.on('data', chunk => {
    if (headersSent) { res.write(chunk); return; }
    headerBuf = Buffer.concat([headerBuf, chunk]);
    const sep = headerBuf.indexOf('\r\n\r\n');
    if (sep === -1) return; // need more
    const body = headerBuf.slice(sep + 4);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    if (body.length) res.write(body);
    headersSent = true;
  });
  upstream.on('end', () => { try { res.end(); } catch (e) {} });
  upstream.on('error', () => { try { res.destroy(); } catch (e) {} });
  req.on('close', () => { try { upstream.destroy(); } catch (e) {} });
}

const server = http.createServer((req, res) => {
  if (req.url === '/strawberrycow-radio/rudefm') {
    return proxyRudeFm(req, res);
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Strawberry Cow Battle Royale Server');
});

const wss = new WebSocketServer({
  server,
  // Deflate was saving ~3-5× bandwidth but coalesces small frames and adds per-send latency.
  // Latency matters more than bandwidth for a 20 Hz action game — measurable inchworming at
  // the player's end traced to deflate backpressure + Nagle batching.
  perMessageDeflate: false,
  // Cap single-message payload at 16 KB. Every legit client message is tiny
  // (movement vector, attack aim, chat < 200 chars); anything larger is
  // malicious or a bug. Stops a bad actor from holding memory with megabyte
  // frames before the rate limiter even kicks in.
  maxPayload: 16 * 1024,
});

// Per-connection token bucket rate limits. Keys are message types, values are
// tokens-per-second budgets. Unknown types pass through so new message types
// don't need a code change here just to be accepted.
const RATE_LIMITS = Object.freeze({
  move: 40, attack: 30, chat: 2, placeBarricade: 5,
  toggleBots: 2, toggleBotsFreeWill: 2, toggleNight: 2,
  ready: 5, kick: 2, setName: 2, perk: 5,
  dash: 10, reload: 5, dropWeapon: 5, jump: 20,
  setUpdateRate: 1, // clients shouldn't change this more than once per second
});
// Close a socket after this many consecutive over-budget drops on any one type
// — legitimate clients never trip this, abusers will.
const RATE_VIOLATION_LIMIT = 10;

// Returns true if this message should be accepted (dispatched), false if it
// should be silently dropped. Refills the bucket for `msgType` based on elapsed
// time since the last check. Allocates one sub-bucket per (socket, msgType)
// pair on first touch.
function checkRate(ws, msgType) {
  const rate = RATE_LIMITS[msgType];
  if (rate === undefined) return true; // unknown type: pass
  if (!ws._rateBuckets) ws._rateBuckets = {};
  const now = Date.now();
  let b = ws._rateBuckets[msgType];
  if (!b) { b = ws._rateBuckets[msgType] = { tokens: rate, last: now, violations: 0 }; }
  const elapsedS = (now - b.last) / 1000;
  b.tokens = Math.min(rate, b.tokens + elapsedS * rate);
  b.last = now;
  if (b.tokens < 1) {
    b.violations++;
    if (b.violations >= RATE_VIOLATION_LIMIT) {
      console.warn('[rate] closing socket — ' + b.violations + ' consecutive ' + msgType + ' violations');
      try { ws.close(1008, 'rate'); } catch (e) { /* already closing */ }
    }
    return false;
  }
  b.tokens--;
  b.violations = 0;
  return true;
}

// WebSocket-level heartbeat — pings every 5s, terminates sockets that don't
// pong back within one interval. The TCP keepalive below catches kernel-level
// dead peers, but a mid-stack stall (frozen client tab, broken intermediary)
// looks fine to TCP while the ws is wedged. Pong-roundtrip catches that.
const HEARTBEAT_MS = 5000;
setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) { ws.terminate(); continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch (e) { /* socket may already be closing */ }
  }
}, HEARTBEAT_MS);

wss.on('connection', (ws) => {
  // Disable Nagle's algorithm — TCP will no longer coalesce small writes into 40-200ms batches.
  // Each ws.send() flushes immediately, which is what a realtime game actually wants.
  if (ws._socket && ws._socket.setNoDelay) ws._socket.setNoDelay(true);
  // Keepalive on the TCP socket itself so dead connections are detected by the kernel quickly.
  if (ws._socket && ws._socket.setKeepAlive) ws._socket.setKeepAlive(true, 10000);
  // Mark alive on connect and on every pong — see HEARTBEAT_MS loop above.
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  const playerId = gameState.nextPlayerId();
  let player = null;
  // Send initial server status so pre-join clients know what's going on
  sendTo(ws, buildServerStatus());

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    // Drop messages that blow past the per-type budget. Silent drop — legit
    // clients never trip these; checkRate logs + closes on repeated abuse.
    if (msg && msg.type && !checkRate(ws, msg.type)) return;

    // Track the highest seq the client has sent for a stateful input.
    // Monotonic clamp — out-of-order messages don't regress the counter,
    // which matters if the server ever processes messages out of order
    // (not today, but cheap insurance). The eventual consumer is `inputAck`
    // broadcast out of server/game.js::gameTick.
    //
    // Invariant: `STATEFUL_INPUT_TYPES` only contains message types that
    // require a joined player (move/attack/dash/jump/reload/dropWeapon/
    // placeBarricade/perk). If a future stateful type is ever accepted
    // pre-join, it won't get seq-tracked — revisit this guard.
    if (player && typeof msg.seq === 'number' && STATEFUL_INPUT_TYPES.has(msg.type)) {
      if (msg.seq > (player.lastInputSeq || 0)) player.lastInputSeq = msg.seq;
    }

    if (msg.type === 'setName' && player && player.inLobby) {
      const name = String(msg.name || '').slice(0, 12).trim();
      if (name) {
        player.name = name;
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.isReadyCountdownActive() ? lobbyState.getLobbyCountdown() : -1, allReady: checkAllReady() });
      }
    }

    if (msg.type === 'join' && !player) {
      const name = String(msg.name || 'Cow').slice(0, 12);
      const color = assignColor();
      player = {
        id: playerId, ws, name, color,
        x: MAP_W / 2, y: MAP_H / 2, z: 0, vz: 0, onGround: true, dx: 0, dy: 0, dir: 'south',
        hunger: 100, score: 0, alive: false, inLobby: true,
        eating: false, eatTimer: 0, foodEaten: 0,
        kills: 0, dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
        perks: { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1 },
        weaponPerks: { cooldown: 1, hungerDiscount: 0, damageMult: 1 },
        weapon: 'normal', weaponTimer: 0, ammo: 15, reloading: 0, armor: 0,
        lastInputSeq: 0, // Phase 2 input sequencing baseline
        updateRate: 30,  // Phase 7: client-tunable tick broadcast rate
      };
      gameState.addPlayer(playerId, player);
      // Assign host if no current host
      if (lobbyState.getHostId() === null) lobbyState.setHost(playerId);
      sendTo(ws, { type: 'joined', id: playerId, color, botsEnabled: gameState.isBotsEnabled(), botsFreeWill: gameState.isBotsFreeWill(), nightMode: gameState.isNightMode(), hostId: lobbyState.getHostId() });

      if (lobbyState.isInLobby()) {
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.getLobbyCountdown() });
      } else if (lobbyState.isPlaying()) {
        const { getSeed } = require('./terrain');
        sendTo(ws, { type: 'spectate', terrainSeed: getSeed(), players: getPlayerStates(), foods: gameState.getFoods().map(serializeFood), zone: gameState.getZone(), map: { walls: gameState.getWalls(), mud: gameState.getMudPatches(), ponds: gameState.getHealPonds(), portals: gameState.getPortals(), shelters: gameState.getShelters(), houses: gameState.getHouses() }, barricades: gameState.getBarricades(), weapons: gameState.getWeaponPickups().map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })), armorPickups: gameState.getArmorPickups().map(a => ({ id: a.id, x: a.x, y: a.y })) });
      }

      if (!lobbyState.getLobbyTimer() && !lobbyState.isPlaying() && !lobbyState.isEnding()) {
        startLobby();
      }
    }

    if (msg.type === 'perk') {
      handlePerk(player, msg.id);
    }

    if (msg.type === 'toggleBots' && player && lobbyState.isHost(player.id)) {
      const enabled = gameState.toggleBotsEnabled();
      broadcast({ type: 'botsToggled', enabled });
    }

    if (msg.type === 'toggleBotsFreeWill' && player && lobbyState.isHost(player.id)) {
      const enabled = gameState.toggleBotsFreeWill();
      broadcast({ type: 'botsFreeWillToggled', enabled });
    }

    if (msg.type === 'toggleNight' && player && lobbyState.isHost(player.id)) {
      const enabled = gameState.toggleNightMode();
      broadcast({ type: 'nightToggled', enabled });
    }

    if (msg.type === 'dropWeapon') {
      handleDropWeapon(player);
    }

    if (msg.type === 'ready' && player && player.inLobby) {
      player.ready = !player.ready;
      // Immediately start/cancel countdown on ready change
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

    if (msg.type === 'kick' && player && lobbyState.isHost(player.id) && lobbyState.isInLobby()) {
      const target = gameState.getPlayer(msg.targetId);
      if (target && !target.isBot && target.id !== lobbyState.getHostId()) {
        sendTo(target.ws, { type: 'kicked' });
        if (target.ws) try { target.ws.close(); } catch(e) {}
        gameState.removePlayer(msg.targetId);
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.isReadyCountdownActive() ? lobbyState.getLobbyCountdown() : -1, allReady: checkAllReady() });
      }
    }

    if (msg.type === 'move' && player && player.alive) {
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

    if (msg.type === 'jump' && player && player.alive && player.onGround) {
      player.vz = 200;
      player.onGround = false;
    }

    if (msg.type === 'placeBarricade' && player && player.alive) {
      placeBarricadeForPlayer(player, msg.aimX || 0, msg.aimY || 0);
    }

    if (msg.type === 'setUpdateRate' && player) {
      // Phase 7: clients tune their per-tick broadcast rate. Clamped to
      // [5, 30] so we don't enable DoS-by-asking-for-60Hz or silently
      // stop sending altogether. Server ticks at TICK_RATE; the rate
      // decoupling gates sendTo on (tickNum % (TICK_RATE / updateRate)).
      const r = Number(msg.rate);
      if (Number.isFinite(r)) player.updateRate = Math.max(5, Math.min(30, Math.round(r)));
    }

    if (msg.type === 'chat' && player) {
      const txt = String(msg.text || '').slice(0, 120).trim();
      if (txt) {
        broadcast({ type: 'chat', name: player.name, color: player.color, text: txt });
      }
    }
  });

  ws.on('close', () => {
    if (player) {
      // Cancel any pending reload timeout so it doesn't fire on a ghost player.
      if (player.reloadTimer) { clearTimeout(player.reloadTimer); player.reloadTimer = null; }
      // Reap any still-flying projectiles owned by the departing player so
      // their impacts don't credit a disconnected ghost.
      const projs = gameState.getProjectiles();
      for (let i = projs.length - 1; i >= 0; i--) {
        if (projs[i].ownerId === playerId) gameState.removeProjectileAt(i);
      }
      if (player.alive) {
        // Route disconnect through the standard elimination path. eliminatePlayer
        // skips kill-credit (that's gated on reason === 'hunger'), drops any
        // held weapon as a pickup, and broadcasts both eliminated + serverStatus.
        // Prior code did an inline alive=false + eliminated broadcast which
        // leaked the player's weapon into the void on disconnect.
        eliminatePlayer(player, 'disconnect');
        checkWinner();
      }
      gameState.removePlayer(playerId);
      // Reassign host if this was the host
      if (lobbyState.getHostId() === playerId) {
        lobbyState.clearHost();
        for (const [id, p] of gameState.getPlayers()) { if (!p.isBot) { lobbyState.setHost(id); break; } }
        // Tell remaining players about the new host
        const newHostId = lobbyState.getHostId();
        for (const [, p] of gameState.getPlayers()) { if (!p.isBot && p.ws) sendTo(p.ws, { type: 'newHost', hostId: newHostId }); }
      }
      if (lobbyState.isInLobby()) {
        broadcast({ type: 'lobby', players: getLobbyPlayers(), countdown: lobbyState.getLobbyCountdown() });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Strawberry Cow Battle Royale server on port ${PORT}`);
});
