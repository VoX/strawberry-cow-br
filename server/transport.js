// Transport facade — coordinates one or more underlying impls.
//
// W.2 design: when GAME_TRANSPORT=geckos (the default), BOTH the
// WebSocket and geckos.io transports listen at the same time. Clients
// auto-select via the W.2 client-side fallback in client/network.js —
// they try geckos first, fall back to WS if the data channel handshake
// fails. Setting GAME_TRANSPORT=ws is the emergency rollback: only the
// WebSocket impl is loaded.
//
// Interface (every impl conforms):
//   init(httpServer)               Bind to an http.Server.
//   onConnect(cb)                  cb(transportRef) on new peer.
//   onMessage(cb)                  cb(transportRef, parsedMessage) on inbound.
//   onDisconnect(cb)               cb(transportRef) on peer gone.
//   sendReliable(ref, msg)         Per-peer reliable.
//   sendUnreliable(ref, msg)       Per-peer best-effort.
//   broadcastReliable(msg)         Fan-out reliable.
//   broadcastUnreliable(msg)       Fan-out best-effort.
//   closePlayer(ref)               Force-close a peer.
//
// `ref` is opaque to game code — it stashes the value on `player.ws` and
// the broadcast/sendTo paths route through this facade which knows which
// impl owns each ref via the `_implByRef` WeakMap.

const wsImpl = require('./transports/ws');
const geckosEnabled = process.env.GAME_TRANSPORT !== 'ws';
const geckosImpl = geckosEnabled ? require('./transports/geckos') : null;

console.log('[transport] ws=enabled geckos=' + (geckosEnabled ? 'enabled' : 'disabled'));

// Both impls hand WeakMap-friendly objects (ws.WebSocket and
// ServerChannel), so GC reclaim happens when the underlying connection
// drops — no manual cleanup beyond the onDisconnect delete below.
const _implByRef = new WeakMap();

let _onConnect = null;
let _onMessage = null;
let _onDisconnect = null;

function _wireImpl(impl) {
  impl.onConnect((ref) => {
    _implByRef.set(ref, impl);
    if (_onConnect) _onConnect(ref);
  });
  impl.onMessage((ref, msg) => {
    if (_onMessage) _onMessage(ref, msg);
  });
  impl.onDisconnect((ref) => {
    if (_onDisconnect) _onDisconnect(ref);
    _implByRef.delete(ref);
  });
}

function init(httpServer) {
  wsImpl.init(httpServer);
  _wireImpl(wsImpl);
  if (geckosImpl) {
    geckosImpl.init(httpServer);
    _wireImpl(geckosImpl);
  }
}

function onConnect(cb)    { _onConnect = cb; }
function onMessage(cb)    { _onMessage = cb; }
function onDisconnect(cb) { _onDisconnect = cb; }

// Per-peer dispatch. A miss here means the ref was never registered or
// has already been disconnected. The latter is normal during the small
// window between a peer dropping and the game loop noticing — e.g. the
// per-client tick loop in server/game.js iterating a player whose channel
// just died — so the miss is a silent drop rather than a warn. Routing
// to the wrong transport on a miss would crash deep inside the wrong
// impl, so the explicit `if (i)` guard at each call site stays.
function _implFor(ref) {
  return _implByRef.get(ref);
}
function sendReliable(ref, msg)   { const i = _implFor(ref); if (i) i.sendReliable(ref, msg); }
function sendUnreliable(ref, msg) { const i = _implFor(ref); if (i) i.sendUnreliable(ref, msg); }
function closePlayer(ref)         { const i = _implFor(ref); if (i) i.closePlayer(ref); }

function broadcastReliable(msg) {
  wsImpl.broadcastReliable(msg);
  if (geckosImpl) geckosImpl.broadcastReliable(msg);
}
function broadcastUnreliable(msg) {
  wsImpl.broadcastUnreliable(msg);
  if (geckosImpl) geckosImpl.broadcastUnreliable(msg);
}

module.exports = {
  init,
  onConnect, onMessage, onDisconnect,
  sendReliable, sendUnreliable,
  broadcastReliable, broadcastUnreliable,
  closePlayer,
};
