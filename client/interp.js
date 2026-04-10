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

// Ring depth: 16 entries ≈ 533 ms at 30 Hz. Sized to absorb >5-tick UDP
// loss bursts without freezing remote cows.
export const INTERP_HIST_CAP = 16;
// Render lerps INTERP_DELAY_MS in the past so it always has bracketing
// snapshots instead of rendering the latest raw tick.
export const INTERP_DELAY_MS = 100;
// Bounded extrapolation cap when renderT outruns the newest sample.
// Beyond this we freeze — extrapolating indefinitely would walk a stalled
// cow into a wall during a long disconnect.
const INTERP_EXTRAPOLATE_MS = 300;

// Sample a player's interpolation history at (nowMs - INTERP_DELAY_MS).
// Finds the two bracketing snapshots and returns lerped {x, y, z, aim}.
// Fall-through behavior:
//   - Empty history (player just appeared)  → return current p.x/y/z/aim
//   - renderT past the newest snapshot      → bounded linear extrapolation
//                                              (cap at INTERP_EXTRAPOLATE_MS,
//                                              then freeze on newest)
//   - renderT before the oldest snapshot    → clamp to oldest
// Aim angle lerps take the shortest arc to avoid the -π/+π wraparound jump.
export function interpSamplePlayer(p, nowMs) {
  const hist = p._histBuf;
  if (!hist || hist.length === 0) {
    return { x: p.x, y: p.y, z: p.z, aim: p.aimAngle };
  }
  const renderT = nowMs - INTERP_DELAY_MS;
  const last = hist[hist.length - 1];
  if (renderT >= last.t) {
    // Past the newest sample — bounded linear extrapolation. Without
    // this, a single dropped tick at the spectator camera produces a
    // hard freeze (the original `freeze, never extrapolate` policy).
    // Extrapolating up to ~300 ms covers the realistic UDP-loss / WS-
    // backpressure window without overshooting into nonsense.
    const overshoot = renderT - last.t;
    if (overshoot < INTERP_EXTRAPOLATE_MS && hist.length >= 2) {
      const prev = hist[hist.length - 2];
      const span = last.t - prev.t;
      if (span > 0) {
        const vx = (last.x - prev.x) / span;
        const vy = (last.y - prev.y) / span;
        const vz = (last.z - prev.z) / span;
        return {
          x: last.x + vx * overshoot,
          y: last.y + vy * overshoot,
          z: last.z + vz * overshoot,
          // Aim doesn't extrapolate well (mouse-look is non-linear) —
          // freeze on the latest known orientation.
          aim: last.aim,
        };
      }
    }
    return { x: last.x, y: last.y, z: last.z, aim: last.aim };
  }
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
