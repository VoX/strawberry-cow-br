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

// Unreliable types: tick (30Hz state) + temp entities (cosmetic visuals).
// If a packet is lost, game state is unaffected — next tick supersedes
// state, and missing a visual effect is acceptable.
// projectileHit is NOT here — it controls client-side projectile mesh
// lifecycle (removal). Dropping it leaves ghost projectiles flying forever.
const UNRELIABLE_TYPES = new Set([
  'tick',
  // Temp entities — fire-and-forget visuals/audio:
  // projectile stays reliable — the shooter needs to see their own tracer.
  // A full hitscan conversion (Phase 4) would add client-side tracer
  // prediction and make this unreliable, but that's a bigger change.
  'wallImpact', 'explosion',
  'meleeSwing', 'meleeHit', 'shieldHit',
  'mooTaunt', 'cowstrikeWarning', 'cowstrike',
]);

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
