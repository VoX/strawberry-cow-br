// geckos.io transport impl. Conforms to the same interface as
// server/transports/ws.js so server/index.js + server/network.js + the
// dispatch module never see the difference.
//
// Wire format: every gameplay message rides a single fixed event name
// (`msg`) with the existing `{type, ...rest}` JSON payload as the data.
// This preserves the receive-side dispatch (which keys off `msg.type`)
// without forcing a per-type `channel.on()` registration. Reliability is
// the only thing that varies per-call: reliable messages get
// `{reliable: true, interval: 150, runs: 10}` (the geckos default that
// re-sends until the receiver dedupes), unreliable messages omit the
// option and become single-shot UDP fire-and-forget.
//
// Rate limiting + heartbeat are intentionally NOT here yet. The geckos
// library has its own connection lifecycle (channel.onDisconnect with
// disconnect-state events) and built-in backpressure management
// (autoManageBuffering). For W.1 we ride the library defaults; if abuse
// becomes an issue we can port the WS rate limiter to a per-channel map
// in this file later.

const { geckos, iceServers } = require('@geckos.io/server');
const gameState = require('../game-state');

const SIGNALING_PORT = parseInt(process.env.GECKOS_PORT || '9208', 10);
const PORT_MIN = parseInt(process.env.GECKOS_PORT_MIN || '10000', 10);
const PORT_MAX = parseInt(process.env.GECKOS_PORT_MAX || '10100', 10);
// Reliability options reused on every reliable emit. The library re-sends
// the payload `runs` times spaced `interval` ms apart and the receiver
// dedupes by an internal id. Defaults match the geckos README.
const RELIABLE_OPTS = Object.freeze({ reliable: true, interval: 150, runs: 10 });
// All gameplay messages ride a single event name to keep the receive
// side simple and per-type-handler-free.
const MSG_EVENT = 'msg';
// closePlayer defers the actual channel teardown by this much so any
// pending reliable retransmit (e.g. the `kicked` message) gets a few
// runs at landing before the channel goes away. 500 ms covers ~3 retry
// rounds at the 150 ms RELIABLE_OPTS interval.
const CLOSE_FLUSH_MS = 500;

let _io = null;
let _onConnect = null;
let _onMessage = null;
let _onDisconnect = null;

function init(httpServer) {
  _io = geckos({
    iceServers,                                // public Google STUN
    portRange: { min: PORT_MIN, max: PORT_MAX },
    multiplex: true,                           // share one UDP socket across peers
    cors: { allowAuthorization: false },
  });
  // Piggyback on the existing http server. geckos uses HTTP for the
  // signaling handshake (its routes live under `/.wrtc/v2/...`) — the
  // library calls server.removeAllListeners('request') and re-dispatches
  // non-geckos paths back to the original handler, so the existing
  // routes (Rude FM proxy, root 200 OK) keep working. **This is why
  // server/index.js MUST call http.createServer FIRST and transport.init
  // SECOND** — inverting that order would orphan the radio handler.
  _io.addServer(httpServer);

  _io.onConnection(channel => {
    if (_onConnect) _onConnect(channel);
    channel.on(MSG_EVENT, data => {
      if (_onMessage) _onMessage(channel, data);
    });
    // The geckos library calls this with a connectionState string —
    // 'disconnected', 'failed', or 'closed'. All three are terminal for
    // our purposes (ICE failure, peer hung up, or explicit close). The
    // library doesn't fire intermediate states here so every invocation
    // means "this channel is dead, reap the player."
    channel.onDisconnect((state) => {
      if (_onDisconnect) _onDisconnect(channel);
    });
  });
}

function onConnect(cb)    { _onConnect = cb; }
function onMessage(cb)    { _onMessage = cb; }
function onDisconnect(cb) { _onDisconnect = cb; }

// Per-player reliable send. Library re-sends + receiver dedupes — equivalent
// to TCP delivery semantics from the application's POV, but without head-
// of-line blocking the rest of the data channel.
function sendReliable(channel, msg) {
  if (!channel) return;
  try { channel.emit(MSG_EVENT, msg, RELIABLE_OPTS); } catch (e) { /* channel closed */ }
}

// Per-player unreliable send. Single UDP packet, no retransmit. The whole
// point of the migration: the next tick supersedes a dropped one and
// nothing stalls behind it.
function sendUnreliable(channel, msg) {
  if (!channel) return;
  try { channel.emit(MSG_EVENT, msg); } catch (e) { /* channel closed */ }
}

// Server-side broadcast. geckos's `io.emit` fans out to every connected
// channel — same semantics as the WS impl's _broadcast loop.
function broadcastReliable(msg) {
  if (!_io) return;
  try { _io.emit(MSG_EVENT, msg, RELIABLE_OPTS); } catch (e) {}
}
function broadcastUnreliable(msg) {
  if (!_io) return;
  try { _io.emit(MSG_EVENT, msg); } catch (e) {}
}

// Deferred close: caller intent is "this peer is gone, but anything I
// just emit-reliable'd to them should still get a chance to land." On
// TCP/WS the kernel flushes buffered frames before close, so the WS
// impl can close immediately. Over UDP+SCTP we have to wait for the
// reliable retransmit window manually. ServerChannel.close() returns a
// Promise — swallow rejections so a teardown race never crashes the
// process via an unhandled rejection.
function closePlayer(channel) {
  if (!channel) return;
  setTimeout(() => {
    try {
      const r = channel.close();
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch (e) { /* already closing */ }
  }, CLOSE_FLUSH_MS);
}

module.exports = {
  init,
  onConnect, onMessage, onDisconnect,
  sendReliable, sendUnreliable,
  broadcastReliable, broadcastUnreliable,
  closePlayer,
};
