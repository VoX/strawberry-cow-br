// WebSocket transport impl — wraps the `ws` library behind the common
// interface defined in server/transport.js. This used to be inline in
// server/index.js; the extraction is W.0 of the WebRTC migration plan
// (see docs/webrtc-migration-plan.md) — a geckos.io sibling will drop
// into server/transports/geckos.js without touching any other file.

const { WebSocketServer } = require('ws');
const { encodeMsg, decodeMsg } = require('../codec');

// Per-impl peer set. Pre-W.2 the broadcast loop iterated
// gameState.getPlayers() and skipped non-WS refs by checking
// `ws.readyState !== 1` — which "worked" only because geckos channels
// happen to lack a numeric readyState. That was accidental correctness;
// any future geckos lib change exposing readyState would silently start
// double-delivering. Owning the peer set here means each transport's
// broadcast only walks its own connections.
const _peers = new Set();

// Per-connection token bucket rate limits. Keys are message types, values
// are tokens-per-second budgets. Unknown types pass through so new message
// types don't need a code change here just to be accepted.
const RATE_LIMITS = Object.freeze({
  move: 40, attack: 30, chat: 2, placeBarricade: 5,
  toggleBots: 2, toggleBotsFreeWill: 2, toggleNight: 2,
  ready: 5, kick: 2, setName: 2, perk: 5,
  dash: 10, reload: 5, dropWeapon: 5, switchWeapon: 5, jump: 20,
  setUpdateRate: 1,
});
// Close a socket after this many consecutive over-budget drops on any
// one type — legitimate clients never trip this, abusers will.
const RATE_VIOLATION_LIMIT = 10;

function checkRate(ws, msgType) {
  const rate = RATE_LIMITS[msgType];
  if (rate === undefined) return true;
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

// Backpressure threshold for unreliable sends. Matches the old
// server/network.js::BACKPRESSURE_BYTES value so the per-client tick
// loop behaves identically.
const BACKPRESSURE_BYTES = 256 * 1024;
const HEARTBEAT_MS = 5000;

let _wss = null;
let _onConnect = null;
let _onMessage = null;
let _onDisconnect = null;

function init(httpServer) {
  _wss = new WebSocketServer({
    server: httpServer,
    // Deflate was saving bandwidth but coalesces small frames and adds
    // per-send latency. Latency matters more than bandwidth for a 30 Hz
    // action game; inchworming at the player end traced to deflate
    // backpressure + Nagle batching.
    perMessageDeflate: false,
    // Cap single-message payload at 16 KB. Every legit client message is
    // tiny; anything larger is malicious or a bug.
    maxPayload: 16 * 1024,
  });

  // WebSocket-level heartbeat — pings every 5 s, terminates sockets that
  // don't pong back within one interval. TCP keepalive catches kernel-
  // level dead peers, but a mid-stack stall (frozen client tab, broken
  // intermediary) looks fine to TCP while the ws is wedged.
  setInterval(() => {
    for (const ws of _wss.clients) {
      if (ws.isAlive === false) { ws.terminate(); continue; }
      ws.isAlive = false;
      try { ws.ping(); } catch (e) { /* socket may already be closing */ }
    }
  }, HEARTBEAT_MS);

  _wss.on('connection', (ws) => {
    // Disable Nagle — each send flushes immediately.
    if (ws._socket && ws._socket.setNoDelay) ws._socket.setNoDelay(true);
    // Kernel keepalive so dead connections are detected quickly.
    if (ws._socket && ws._socket.setKeepAlive) ws._socket.setKeepAlive(true, 10000);
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    _peers.add(ws);
    if (_onConnect) _onConnect(ws);

    ws.on('message', (raw) => {
      let msg;
      try { msg = decodeMsg(raw); } catch { return; }
      if (msg && msg.type && !checkRate(ws, msg.type)) return;
      if (_onMessage) _onMessage(ws, msg);
    });

    ws.on('close', () => {
      _peers.delete(ws);
      if (_onDisconnect) _onDisconnect(ws);
    });
  });
}

function onConnect(cb)    { _onConnect = cb; }
function onMessage(cb)    { _onMessage = cb; }
function onDisconnect(cb) { _onDisconnect = cb; }

// Reliable send — over TCP/WS this is just a direct send. The geckos
// sibling will tag the payload with `{reliable: true, interval, runs}`.
function sendReliable(ws, msg) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(encodeMsg(msg));
}

function sendUnreliable(ws, msg) {
  if (!ws || ws.readyState !== 1) return;
  if (ws.bufferedAmount > BACKPRESSURE_BYTES) return;
  ws.send(encodeMsg(msg));
}

function _broadcast(msg, droppable) {
  const buf = encodeMsg(msg);
  for (const ws of _peers) {
    if (ws.readyState !== 1) continue;
    if (droppable && ws.bufferedAmount > BACKPRESSURE_BYTES) continue;
    ws.send(buf);
  }
}
function broadcastReliable(msg)   { _broadcast(msg, false); }
function broadcastUnreliable(msg) { _broadcast(msg, true); }

function closePlayer(ws, code) {
  if (!ws) return;
  try { ws.close(code || 1000, 'close'); } catch (e) { /* already closing */ }
}

module.exports = {
  init,
  onConnect, onMessage, onDisconnect,
  sendReliable, sendUnreliable,
  broadcastReliable, broadcastUnreliable,
  closePlayer,
};
