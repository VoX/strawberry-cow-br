// Client-side movement prediction. Phase 4 of the netcode rewrite.
//
// Runs `stepPlayerMovement` locally on the latest input at a fixed 30 Hz
// timestep (matching server TICK_RATE) so the player sees zero-latency
// response to WASD. The result is kept in `S.mePredicted`; the camera
// reads from there instead of `S.me` while prediction is active.
//
// Reconciliation: every `inputAck` from the server tells us the highest
// input seq the server has applied. We look up the predicted state we
// stashed at that seq. If it matches the server's reported position
// (within RECONCILE_EPSILON units), we discard the stashed entry and
// continue. If it diverges, we snap `S.mePredicted` to the server
// position and REPLAY every unacked input through stepPlayerMovement
// to land at a new "predicted now".
//
// Load-bearing invariants:
//   1. Client and server call the same stepPlayerMovement from
//      shared/movement.js with the same dt (1/TICK_RATE).
//   2. Client's world state (walls, barricades, mudPatches, portals,
//      zone) matches the server's at the same tickNum. P0.3 audit
//      confirmed all mutations have broadcasts; the client ring
//      matches via existing message handlers.
//   3. getTerrainHeight is bit-identical on both sides (P0.1 terrain
//      determinism test guards this).
//
// What is predicted:
//   - Local player position (x, y)
//   - Local player height (z, vz, onGround)
//   - Local player direction
//
// What is NOT predicted:
//   - Stats (hunger, armor, ammo, score) — ride tick + snapshot
//   - Weapon state — sticky, ships via playerSnapshot
//   - Hit detection — server-authoritative
//   - Other players — interpolated (Phase 1)

import S from './state.js';
import { stepPlayerMovement } from '../shared/movement.js';
import { getTerrainHeight } from './terrain.js';

// Fixed timestep — must match server/config.js::TICK_RATE.
const TICK_HZ = 30;
const TICK_DT = 1 / TICK_HZ;
// Divergence threshold before we snap. 1 world unit is ~1cm of visible
// drift; tighter and floating-point noise triggers spurious snaps.
const RECONCILE_EPSILON = 1.0;
// Ring cap for predicted states per input seq. 60 entries = 2 seconds at
// 30 Hz, plenty of headroom for any reasonable RTT + ack delay.
const PREDICT_RING_CAP = 60;

// Terrain shim matching the server/terrain.js shape the shared movement
// module expects. WALL_HEIGHT is a constant; getGroundHeight is deterministic
// by P0.1 guarantee.
const terrain = {
  getGroundHeight: (x, y) => getTerrainHeight(x, y),
  WALL_HEIGHT: 70,
};

// Fixed-step accumulator so prediction runs at exactly TICK_HZ regardless
// of render frame rate. One render frame may step prediction 0, 1, or 2
// times depending on elapsed wall time.
let accumulator = 0;

// Rendered-position error offset. reconcile writes to this (by subtracting
// the correction delta from the old-predicted value) and the main loop
// decays it toward zero each frame. Camera reads `mePredicted.{x,y,z} + err`.
// This is the standard game-netcode "position smoothing" approach (Source
// calls it `cl_smooth` / `cl_smoothtime`): the LOGICAL predicted state gets
// instant authoritative correction, but the VISUAL camera position glides
// to zero error over ERR_LINEAR_TIME seconds — so sub-unit drifts are
// invisible and small-to-medium corrections feel smooth.
//
// Decay model is LINEAR to match Source's default. Each time we fold in
// new error, we reset `errRemainTime` to ERR_LINEAR_TIME; every frame we
// subtract `frameDt / errRemainTime` of the CURRENT error (which lands
// at zero at exactly errRemainTime after the last fold, not an asymptote).
//
// DEAD_ZONE: sub-0.05-unit errors skip the smoother entirely — otherwise
// floating point noise feeds tiny corrections into the accumulator every
// ack and the smoother never quite stops twitching.
let errX = 0, errY = 0, errZ = 0;
let errRemainTime = 0;
const ERR_LINEAR_TIME = 0.15;     // 150 ms to land at zero after last fold
const ERR_INSTANT_SNAP = 40;      // > 40 u = real teleport, snap hard
const ERR_DEAD_ZONE = 0.05;       // drifts below this don't smooth at all
export function getRenderOffset() { return { x: errX, y: errY, z: errZ }; }
function decayRenderOffset(frameDt) {
  if (errRemainTime <= 0) { errX = 0; errY = 0; errZ = 0; return; }
  if (frameDt >= errRemainTime) {
    errX = 0; errY = 0; errZ = 0; errRemainTime = 0;
    return;
  }
  const f = frameDt / errRemainTime;
  errX -= errX * f;
  errY -= errY * f;
  errZ -= errZ * f;
  errRemainTime -= frameDt;
}

// Ring of predicted states keyed by input seq. Each entry is a shallow
// copy of the fields stepPlayerMovement mutates so we can replay from any
// point after a reconcile.
const predictRing = [];

// Latest WASD input vector. Updated every render frame by the main loop
// via `setCurrentInput(...)`. Both predictStep and reconcilePrediction read
// from here so they use the same source. Crucially, reconcilePrediction
// CAN'T read from S.me.dx/dy — those fields aren't in the tick broadcast
// and would always be undefined, causing replay to step with zero input.
let currentInput = { dx: 0, dy: 0, walking: false };
export function setCurrentInput(dx, dy, walking) {
  currentInput.dx = dx;
  currentInput.dy = dy;
  currentInput.walking = walking;
}

// Synthesized perks shape for the prediction player. The server flattens
// `sizeMult` and `speedMult` onto the broadcast player object but doesn't
// ship the full `perks` container, so `S.me.perks` is undefined on the
// client. stepPlayerMovement reads `p.perks.speedMult` directly and would
// crash on undefined — this minimal object gives it the fields it needs,
// sourced from whichever flat fields the server broadcast.
function buildPredictedPerks(p) {
  return {
    speedMult: p && p.speedMult != null ? p.speedMult : 1,
    maxHunger: 100,
    sizeMult: p && p.sizeMult != null ? p.sizeMult : 1,
    damage: 1,
  };
}

// Snapshot the mutable player fields into a POD object. Used when pushing
// onto the ring and when cloning the authoritative server state for a
// reconcile replay.
function snapshotPlayer(p) {
  return {
    x: p.x, y: p.y, z: p.z, vz: p.vz,
    dir: p.dir, onGround: p.onGround,
    stunTimer: p.stunTimer || 0,
    // Derive from the server's boolean `spawnProt` field on the tick
    // payload — the actual timer value isn't broadcast, so we treat the
    // protected state as "just started". stepPlayerMovement's early-return
    // semantics only care that spawnProtection > 0.
    spawnProtection: p.spawnProt ? 1 : 0,
    foodEaten: p.foodEaten || 0,
    _portalCooldown: p._portalCooldown || 0,
    perks: p.perks || buildPredictedPerks(p),
    isBot: false,
  };
}

// Initialize S.mePredicted from S.me. Called on round start or the first
// tick where S.me becomes non-null.
export function initPrediction() {
  if (!S.me) return;
  S.mePredicted = snapshotPlayer(S.me);
  predictRing.length = 0;
  accumulator = 0;
  _prevPredicted = null;
  errX = 0; errY = 0; errZ = 0;
  // Reset the one-shot error log gate so a new round / respawn gets a
  // fresh logging budget for any stepPlayerMovement regressions.
  _predictErrorLogged = false;
}

// Rebuild the world object the shared integrator expects. Called once per
// prediction step so we always see the latest client-mirrored state.
function buildWorld() {
  return {
    walls: S.mapFeatures.walls || [],
    barricades: S.barricades || [],
    mudPatches: S.mapFeatures.mud || [],
    portals: S.mapFeatures.portals || [],
    zone: S.serverZone,
  };
}

let _predictErrorLogged = false;

// Previous-tick predicted state. Used together with the fractional
// accumulator remainder to interpolate the camera-visible position
// between whole-tick prediction steps — so at 60 fps we don't see
// the player "hopping" once per 2 frames (the tick rate). The logical
// S.mePredicted still advances only on whole steps (for ring / reconcile
// correctness); the renderer reads a lerp between prev and current.
let _prevPredicted = null;
export function getRenderedPredicted() {
  if (!S.mePredicted) return null;
  // Fraction of the current fixed step that wall time has advanced into.
  // 0 right after a step ran, ~1 right before the next step will run.
  const f = Math.max(0, Math.min(1, accumulator / TICK_DT));
  if (!_prevPredicted) return { x: S.mePredicted.x, y: S.mePredicted.y, z: S.mePredicted.z };
  return {
    x: _prevPredicted.x + (S.mePredicted.x - _prevPredicted.x) * f,
    y: _prevPredicted.y + (S.mePredicted.y - _prevPredicted.y) * f,
    z: _prevPredicted.z + (S.mePredicted.z - _prevPredicted.z) * f,
  };
}

// Advance prediction by `frameDt` seconds. Reads the live input vector
// from the module-level `currentInput` (set by the render loop each frame
// via setCurrentInput). Called from the main render loop once per frame.
// Runs 0 or more fixed-timestep iterations.
export function predictStep(frameDt) {
  if (!S.mePredicted || !S.me) return;
  accumulator += frameDt;
  // Cap the catch-up to prevent spiraling if the tab was backgrounded
  // and accumulator built up seconds of pending work.
  if (accumulator > 0.25) accumulator = 0.25;
  const world = buildWorld();
  while (accumulator >= TICK_DT) {
    accumulator -= TICK_DT;
    // Snapshot the "before" state for render-time interpolation. Camera
    // reads a lerp between _prevPredicted and S.mePredicted using the
    // remaining accumulator as the fraction.
    _prevPredicted = { x: S.mePredicted.x, y: S.mePredicted.y, z: S.mePredicted.z };
    const seqAtStep = S.inputSeq;
    // Snapshot the input BEFORE stepPlayerMovement. Reconcile replay reads
    // this per-seq stored input from the ring — Bernier's paper is explicit
    // that replay must re-simulate with the exact cmds each slot was
    // originally computed with, not whatever input is live at replay time.
    const stepInput = { dx: currentInput.dx, dy: currentInput.dy, walking: !!currentInput.walking };
    // Guard the shared integrator call so a regression in stepPlayerMovement
    // (or in the synthesized world/perks shape above) doesn't propagate
    // out, kill the rest of the render loop, and leave camera/render
    // frozen. Logs once per session so the first occurrence is visible
    // in devtools without spamming the console.
    try {
      stepPlayerMovement(S.mePredicted, TICK_DT, world, stepInput, terrain);
    } catch (e) {
      if (!_predictErrorLogged) {
        _predictErrorLogged = true;
        console.error('[prediction] stepPlayerMovement threw:', e);
      }
      accumulator = 0;
      return;
    }
    predictRing.push({ seq: seqAtStep, state: snapshotPlayer(S.mePredicted), input: stepInput });
    if (predictRing.length > PREDICT_RING_CAP) predictRing.shift();
  }
  // Decay the render error offset every frame so reconcile corrections
  // glide to zero over ERR_HALFLIFE * ln(2) ≈ 0.5 s instead of snapping.
  decayRenderOffset(frameDt);
}

// Reconcile the predicted ring against the server-authoritative state at
// S.lastAckedInput. `ackedState` is the server's position AT the acked
// tick (shipped inline on the inputAck message to avoid the S.me-is-a-
// later-tick race). Returns true if a snap+replay happened.
//
// Smoothing: instead of hard-snapping the camera, we fold the correction
// delta into the `errX/Y/Z` accumulator which the renderer adds to the
// predicted position and decays toward zero over ~500 ms. Big deltas
// (teleport/respawn) still snap hard via the ERR_INSTANT_SNAP cutoff.
export function reconcilePrediction(ackedState) {
  if (!S.mePredicted || !S.me || S.lastAckedInput <= 0) return false;
  if (!ackedState) return false;
  // Drop ring entries older than the ack — they're confirmed.
  while (predictRing.length > 0 && predictRing[0].seq < S.lastAckedInput) {
    predictRing.shift();
  }
  // Find the LAST entry matching the acked seq (multiple prediction steps
  // can push the same seq when predictStep runs faster than send()).
  let ackedIdx = -1;
  for (let i = predictRing.length - 1; i >= 0; i--) {
    if (predictRing[i].seq === S.lastAckedInput) { ackedIdx = i; break; }
  }
  const serverX = ackedState.x, serverY = ackedState.y, serverZ = ackedState.z;
  const serverVz = ackedState.vz || 0;
  const serverOnGround = !!ackedState.onGround;
  if (ackedIdx < 0) {
    // No matching entry — ring was drained or seq gap. Soft-snap via the
    // error accumulator so even this edge case doesn't flash the camera.
    const preX = S.mePredicted.x, preY = S.mePredicted.y, preZ = S.mePredicted.z;
    S.mePredicted.x = serverX; S.mePredicted.y = serverY; S.mePredicted.z = serverZ;
    // Jump state is broadcast now — restore it so post-ack replay uses the
    // right vz (fixes the "rubberband while jumping" symptom).
    S.mePredicted.vz = serverVz;
    S.mePredicted.onGround = serverOnGround;
    foldError(preX - serverX, preY - serverY, preZ - serverZ);
    return false;
  }
  const acked = predictRing[ackedIdx];
  const dx = acked.state.x - serverX;
  const dy = acked.state.y - serverY;
  const dz = (acked.state.z || 0) - (serverZ || 0);
  const drift = Math.hypot(dx, dy, dz);
  if (drift <= RECONCILE_EPSILON) {
    // Prediction matched. Drop the acked entry and everything before.
    predictRing.splice(0, ackedIdx + 1);
    return false;
  }
  // Divergent. Capture the pre-snap position for the smoothing offset.
  const preX = S.mePredicted.x, preY = S.mePredicted.y, preZ = S.mePredicted.z;
  // Snap LOGICAL state to the server — this is authoritative, the replay
  // depends on starting from it. Vertical fields restored from the ack so
  // a jumping player keeps their real trajectory across the correction.
  S.mePredicted.x = serverX;
  S.mePredicted.y = serverY;
  S.mePredicted.z = serverZ;
  S.mePredicted.vz = serverVz;
  S.mePredicted.onGround = serverOnGround;
  // Drop acked+older ring entries.
  predictRing.splice(0, ackedIdx + 1);
  // Replay remaining ring entries against the new baseline using each
  // entry's STORED input (captured at the time that step originally ran).
  // This matches Bernier's original design — re-simulating with live
  // current input would re-run mid-turn frames as if the player were
  // turning the whole time, producing visible yanks on every reconcile.
  const world = buildWorld();
  for (const e of predictRing) {
    stepPlayerMovement(S.mePredicted, TICK_DT, world, e.input || currentInput, terrain);
    e.state = snapshotPlayer(S.mePredicted);
  }
  // After replay completes, fold the (pre-snap → post-replay) delta into
  // the render error so the CAMERA stays where it was and glides to the
  // new position. If the replay lands us right back where we were (held
  // key, consistent motion), the camera never moves visibly.
  foldError(preX - S.mePredicted.x, preY - S.mePredicted.y, preZ - S.mePredicted.z);
  return true;
}

// Add a correction delta into the render error accumulator. Large deltas
// bypass the accumulator and trigger a hard snap (teleport/respawn) by
// clearing the offset so the camera jumps instantly. Sub-dead-zone deltas
// are dropped entirely — no need to smooth errors the player can't see.
function foldError(dx, dy, dz) {
  const newX = errX + dx;
  const newY = errY + dy;
  const newZ = errZ + dz;
  const mag = Math.hypot(newX, newY, newZ);
  if (mag > ERR_INSTANT_SNAP) {
    errX = 0; errY = 0; errZ = 0; errRemainTime = 0;
    return;
  }
  if (mag < ERR_DEAD_ZONE) {
    errX = 0; errY = 0; errZ = 0; errRemainTime = 0;
    return;
  }
  errX = newX; errY = newY; errZ = newZ;
  // Reset the linear decay clock on every fold so the most-recent
  // correction completes within ERR_LINEAR_TIME from now, not from the
  // last correction.
  errRemainTime = ERR_LINEAR_TIME;
}

