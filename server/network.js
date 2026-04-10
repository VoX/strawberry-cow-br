// Server-side broadcast/sendTo facade.
//
// Pre-W.0 this owned the fan-out + backpressure logic directly against the
// ws library. W.0 moved that to `server/transports/ws.js` behind the
// transport interface so a geckos.io sibling can slot in without touching
// this file. Game code still calls `broadcast()` / `sendTo()` verbatim.
//
// Reliability routing: messages whose `type` appears in `UNRELIABLE_TYPES`
// go through the transport's `*Unreliable` methods. On WebSocket that's
// identical to reliable except for the backpressure drop; on geckos.io
// it's true fire-and-forget UDP, which is the whole point of the migration.

const transport = require('./transport');

// The `tick` S2C message is the only fan-out broadcast that should ride
// the unreliable channel — 30 Hz mutable state, next tick supersedes it,
// and dropping one is invisible to the client merge/interpolation logic.
// Every other type is sticky or one-shot and must deliver.
//
// Note: Phase 7's per-client tick loop in server/game.js::gameTick already
// bypasses broadcast() and calls transport.sendUnreliable directly on each
// player so it can apply the per-client stride gate. This set is here
// for future droppable types and for any tick emit that IS routed through
// broadcast() (none today, but keeping the check is cheap).
const UNRELIABLE_TYPES = new Set(['tick']);

function broadcast(data) {
  const droppable = UNRELIABLE_TYPES.has(data && data.type);
  if (droppable) transport.broadcastUnreliable(data);
  else transport.broadcastReliable(data);
}

function sendTo(ref, data) {
  if (!ref) return;
  const droppable = UNRELIABLE_TYPES.has(data && data.type);
  if (droppable) transport.sendUnreliable(ref, data);
  else transport.sendReliable(ref, data);
}

module.exports = { broadcast, sendTo };
