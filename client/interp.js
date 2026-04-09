// Entity interpolation buffer — Phase 1 of the netcode prediction plan.
// Remote players' positions are pushed onto a short ring on every tick
// (see message-handlers.js::tick). The renderer (entities.js::updateCows)
// samples the ring at (now - INTERP_DELAY_MS) via interpSamplePlayer() and
// lerps between the two snapshots that bracket that display time. This
// trades a fixed 100 ms of display latency on remote motion for perfectly
// smooth interpolation instead of the 30 Hz step-jitter we had before.
//
// This file is its own module so it can be imported by both the tick
// handler (which writes the ring) and the renderer (which reads it)
// without introducing a circular dependency between message-handlers.js
// and entities.js.

// Ring depth — 8 entries ≈ 267 ms at 30 Hz, enough to still have
// bracketing snapshots after a dropped tick or two.
export const INTERP_HIST_CAP = 8;
// Display offset from "now" — the renderer looks INTERP_DELAY_MS into the
// past so it can lerp between two received snapshots instead of rendering
// the latest raw tick.
export const INTERP_DELAY_MS = 100;

// Sample a player's interpolation history at (nowMs - INTERP_DELAY_MS).
// Finds the two bracketing snapshots and returns lerped {x, y, z, aim}.
// Fall-through behavior:
//   - Empty history (player just appeared)  → return current p.x/y/z/aim
//   - renderT past the newest snapshot      → freeze on newest (never extrapolate)
//   - renderT before the oldest snapshot    → clamp to oldest
// Aim angle lerps take the shortest arc to avoid the -π/+π wraparound jump.
export function interpSamplePlayer(p, nowMs) {
  const hist = p._histBuf;
  if (!hist || hist.length === 0) {
    return { x: p.x, y: p.y, z: p.z, aim: p.aimAngle };
  }
  const renderT = nowMs - INTERP_DELAY_MS;
  const last = hist[hist.length - 1];
  if (renderT >= last.t) return { x: last.x, y: last.y, z: last.z, aim: last.aim };
  if (renderT <= hist[0].t) return { x: hist[0].x, y: hist[0].y, z: hist[0].z, aim: hist[0].aim };
  for (let i = 0; i < hist.length - 1; i++) {
    const a = hist[i], b = hist[i + 1];
    if (a.t <= renderT && b.t >= renderT) {
      const span = b.t - a.t;
      const f = span > 0 ? (renderT - a.t) / span : 0;
      let da = b.aim - a.aim;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      return {
        x: a.x + (b.x - a.x) * f,
        y: a.y + (b.y - a.y) * f,
        z: a.z + (b.z - a.z) * f,
        aim: a.aim + da * f,
      };
    }
  }
  return { x: last.x, y: last.y, z: last.z, aim: last.aim };
}
