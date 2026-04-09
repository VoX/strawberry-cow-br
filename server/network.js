const gameState = require('./game-state');

// Backpressure threshold — if a socket has more than 256KB queued, drop
// non-critical messages to it. In the original design `'tick'` was the
// only droppable type; Phase 7 moved the tick broadcast to a per-client
// sendTo loop in server/game.js (with its own bufferedAmount check) so
// this set is currently empty. Kept for future droppable types.
const BACKPRESSURE_BYTES = 256 * 1024;
const DROPPABLE_TYPES = new Set();

function broadcast(data) {
  const msg = JSON.stringify(data);
  const droppable = DROPPABLE_TYPES.has(data && data.type);
  for (const [, p] of gameState.getPlayers()) {
    const ws = p.ws;
    if (!ws || ws.readyState !== 1) continue;
    if (droppable && ws.bufferedAmount > BACKPRESSURE_BYTES) continue;
    ws.send(msg);
  }
}

function sendTo(ws, data) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(data));
}

module.exports = { broadcast, sendTo };
