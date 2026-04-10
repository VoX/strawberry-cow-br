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
// Projectiles now ride the tick state — projectileHit is cosmetic only
// (damage numbers, blood, bullet holes). Missing one = no hit visual,
// but damage shows in player state changes.
const UNRELIABLE_TYPES = new Set([
  'tick',
  // Temp entities — fire-and-forget visuals/audio:
  'projectileHit', 'wallImpact', 'explosion',
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
