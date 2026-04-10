// Client-side snapshot interpolation via @geckos.io/snapshot-interpolation.
// Replaces the custom interp.js ring buffer and the seq-based inputAck
// reconciliation with time-based interpolation (remote players) and
// gradual drift correction (local player).
//
// Usage:
//   addSnapshot(msg.snapshot)  — called from the tick handler
//   getInterpolated()         — called from the render loop, returns
//                                interpolated remote entities
//   getServerTime()           — for lag-compensated attack messages

import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import { Vault } from '@geckos.io/snapshot-interpolation';

// Server sends at 30 FPS. SI sets interpolation buffer to (1000/30)*3 = 100ms.
const SI = new SnapshotInterpolation(30);

// Separate vault for local player predictions — stores timestamped
// predicted positions so reconciliation can compare against server
// snapshots at the matching time.
const playerVault = new Vault();

// Export for use in prediction.js reconciliation
export { SI, playerVault };

// Add a server snapshot to the SI vault. Called from tick handler.
export function addSnapshot(snapshot) {
  SI.snapshot.add(snapshot);
}

// Get interpolated state for all entities. Called from render loop.
// Returns { state: [...entities], percentage, older, newer } or undefined
// if not enough snapshots have arrived yet.
export function getInterpolated() {
  return SI.calcInterpolation('x y z aimAngle(rad)');
}

// Get server time (client-synced) for lag-compensated attack messages.
export function getServerTime() {
  return SI.serverTime;
}

// Create a prediction snapshot for the local player.
export function createPredictionSnapshot(id, x, y, z) {
  const snap = SI.snapshot.create([{ id, x, y, z }]);
  playerVault.add(snap);
}

// Get the latest server snapshot from the vault.
export function getLatestServerSnapshot() {
  return SI.vault.get();
}

// Get the predicted snapshot closest to a given server time.
export function getPredictionAtTime(time) {
  return playerVault.get(time, true);
}

// Clear both vaults (on round restart, tab un-hide, etc.)
export function clearSnapshots() {
  SI.vault.clear();
  playerVault.clear();
  _interpCache = null;
}

// Cached interpolation result — computed once per frame, read by all entities.
let _interpCache = null;
let _interpCacheFrame = -1;

// Update the interpolation cache. Call once per frame before reading.
export function updateInterpolation(frameId) {
  if (frameId === _interpCacheFrame) return; // already computed this frame
  _interpCacheFrame = frameId;
  _interpCache = SI.calcInterpolation('x y z aimAngle(rad)');
}

// Get interpolated position for a specific entity. Returns {x, y, z, aim}
// or falls back to the entity's raw position if SI doesn't have enough data.
export function getInterpolatedEntity(p) {
  if (_interpCache && _interpCache.state) {
    for (let i = 0; i < _interpCache.state.length; i++) {
      const e = _interpCache.state[i];
      if (e.id === p.id) {
        return { x: e.x, y: e.y, z: e.z || 0, aim: e.aimAngle || 0 };
      }
    }
  }
  // Fallback — no interpolation data yet.
  return { x: p.x, y: p.y, z: p.z || 0, aim: p.aimAngle || 0 };
}
