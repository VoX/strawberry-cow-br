// Client-side snapshot interpolation via @geckos.io/snapshot-interpolation.
// Used for REMOTE player interpolation only. Local player uses the
// seq-based ring buffer + replay system in prediction.js.
//
// Usage:
//   addSnapshot(msg.snapshot)    — called from the tick handler
//   updateInterpolation(frame)  — called once per render frame
//   getInterpolatedEntity(p)    — per-entity lookup for smooth rendering
//   getServerTime()             — for lag-compensated attack messages

import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';

// Server sends at 30 FPS. SI sets interpolation buffer to (1000/30)*3 = 100ms.
const SI = new SnapshotInterpolation(30);

// Add a server snapshot to the SI vault. Called from tick handler.
export function addSnapshot(snapshot) {
  SI.snapshot.add(snapshot);
}

// Get server time (client-synced) for lag-compensated attack messages.
export function getServerTime() {
  return SI.serverTime;
}

// Clear vault (on round restart, tab un-hide, etc.)
export function clearSnapshots() {
  SI.vault.clear();
  _interpMap = null;
}

// Cached interpolation result — computed once per frame, read by all entities.
// _interpMap is an id→entity index built from the SI result so per-entity
// lookups are O(1) instead of O(n).
let _interpMap = null;
let _interpCacheFrame = -1;

// Update the interpolation cache. Call once per frame before reading.
export function updateInterpolation(frameId) {
  if (frameId === _interpCacheFrame) return;
  _interpCacheFrame = frameId;
  const result = SI.calcInterpolation('x y z aimAngle(rad)');
  if (result && result.state) {
    _interpMap = new Map();
    for (const e of result.state) _interpMap.set(e.id, e);
  } else {
    _interpMap = null;
  }
}

// Get interpolated position for a specific entity. Returns {x, y, z, aim}
// or falls back to the entity's raw position if SI doesn't have enough data.
export function getInterpolatedEntity(p) {
  if (_interpMap) {
    const e = _interpMap.get(p.id);
    if (e) return { x: e.x, y: e.y, z: e.z || 0, aim: e.aimAngle || 0 };
  }
  return { x: p.x, y: p.y, z: p.z || 0, aim: p.aimAngle || 0 };
}
