# Networking Improvement Proposals

For VoX review. These are changes to the netcode that would improve bandwidth, latency perception, and correctness. None are urgent — the current system works — but each would be a measurable win.

## 1. Jump through move queue (priority: high)

**Problem:** Jump is processed in `dispatch.js` immediately on message receipt, not through the per-player move queue. The client predicts the jump at its current tick, but the server applies it at a potentially different tick. This creates a Z-axis drift of ~7.7 units per tick timing mismatch (JUMP_VZ=230 / 30 ticks), which always exceeds the reconciliation epsilon.

**Current workaround:** The reconciliation skips Z from the drift check when the server reports the player is airborne. This prevents rubber-banding but means Z-axis errors during jumps are never corrected.

**Proposed fix:** Enqueue jump as a special move-queue entry (`{ type: 'jump' }`) alongside the existing `{ seq, dx, dy, ... }` entries. The gameTick drain loop processes it in sequence with movement, so the server applies the jump at the same cadence as the client's prediction. Remove the airborne Z-skip from reconciliation.

**Risk:** Medium. Touches the core CSP pipeline. Needs careful testing of the queue drain order.

## 2. Delta compression on tick broadcast (priority: medium)

**Problem:** Every 30 Hz tick sends the full state of every player (x, y, z, dir, hunger, score, alive, eating, foodEaten, level, xp, armor, kills, stunTimer, aimAngle, dashCooldown, attackCooldown, spawnProt, ammo, reloading, crouching) — ~20 fields per player. With 16 players that's 320 field writes per tick, most of which haven't changed.

**Proposed fix:** Track previous tick state per player. Only send fields that changed since the last tick. Client merges deltas into its existing player objects (already does this via Object.assign). First tick after join sends full state; subsequent ticks send only diffs.

**Expected savings:** 60-80% bandwidth reduction on tick broadcasts. Most ticks only change x, y, z, aimAngle (4 fields vs 20).

**Risk:** Low. The client already handles partial updates via the tick merge loop. Need a server-side `_prevTick` cache per player.

## 3. inputAck rate increase (priority: medium)

**Problem:** inputAck is sent every 5th tick (6 Hz). With the new faster TTK (7-12 shots to kill), a player can die in under 1 second. If they're mid-fight and an ack is delayed, the reconciliation window grows to 5 ticks (~167ms) of unconfirmed prediction, which feels sluggish on hit feedback.

**Proposed fix:** Send inputAck every 2nd tick (15 Hz) or every tick (30 Hz). The ack payload is small (~80 bytes: seq, x, y, z, vz, onGround, stunTimer, spawnProt, moveArrivedPct).

**Tradeoff:** 2.5-5x more ack messages. At 80 bytes × 30 Hz × 16 players = 38 KB/s additional upstream. Acceptable.

**Risk:** Low. Client already handles acks at any rate.

## 4. Targeted broadcasts for single-client events (priority: low)

**Problem:** Several messages are broadcast to all players but only one client uses them: `reloaded` (already fixed), `shellLoaded` (already fixed), `emptyMag`, some kill notifications. Each unnecessary broadcast is 16× wasted bandwidth.

**Approach:** Audit remaining `broadcast()` calls. Replace with `sendTo(player.ws, ...)` where the client handler early-returns for `msg.playerId !== S.myId`.

**Already done:** `reloaded`, `shellLoaded` switched to `sendTo` in the simplify pass.

**Remaining candidates:** `emptyMag`, `levelup`, weapon-specific state changes.

## 5. WebRTC data channel validation (priority: low)

**Problem:** All new weapons (Thompson, SKS, AK, MP5K) were added and tested over WebSocket. The geckos.io WebRTC data channel path hasn't been specifically tested with the new weapon stats, fire mode switching, or the auto/semi/burst guard logic.

**Proposed fix:** Manual test session with WebRTC transport forced (disable WS fallback) to verify all new weapons fire correctly, fire mode cycling works, and projectile spawn/hit messages arrive intact over the unreliable channel.

**Risk:** If there's a bug it's likely a message size issue (new weapon stats are larger) or an ordering issue with the fire mode guard.
