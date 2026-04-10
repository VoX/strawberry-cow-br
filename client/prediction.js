// Client-side movement prediction (CSP). Source/CS-style: client runs the
// shared integrator on the same input the server will see; reconcile
// against periodic inputAck snapshots; render-time smoothing eats small
// drift. Three load-bearing invariants:
//
//   1. predict and send are LOCKSTEP. predictStep emits one `move` per
//      fixed step right before integrating, so each ring entry has a
//      unique seq matching exactly one server-side tick. Throttling
//      sends to a different cadence breaks this and causes inchworm.
//   2. STATEFUL_INPUT_TYPES = {move} only. Bumping the seq for
//      attack/jump/etc. would inject gaps the server can't match.
//   3. Reconcile pairs the FIRST ring entry with the acked seq against
//      the server snapshot (which is captured the first tick after
//      lastInputSeq advances). Pairing against the LAST entry would
//      compare an N-steps-deep prediction against a 1-tick-deep server
//      state and snap on every ack.
//
// stunTimer + spawnProtection are server-only and synced via the tick
// handler + inputAck snapshot — without that sync the client charges
// through stuns. Explosion knockback and dash are deliberately not
// predicted (no anticipatory data).
//
// See docs/netcode-prediction-plan.md for the full design rationale.

import S from './state.js';
import { stepPlayerMovement } from '../shared/movement.js';
import { getTerrainHeight } from './terrain.js';
import { send } from './network.js';

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

// Latest WASD input vector + camera aim. Updated every render frame by
// the main loop via `setCurrentInput(...)`. Both predictStep and
// reconcilePrediction read from here so they use the same source.
// Crucially, reconcilePrediction CAN'T read from S.me.dx/dy — those
// fields aren't in the tick broadcast and would always be undefined,
// causing replay to step with zero input.
//
// `aim` is the camera-forward yaw in the same convention as the bot
// `atan2(-nx, ny)` formula in shared/movement.js — the server uses it
// to set player.aimAngle so the cow's facing matches where the human
// is looking, not where they're moving (those diverge during strafing).
let currentInput = { dx: 0, dy: 0, walking: false, aim: 0 };
export function setCurrentInput(dx, dy, walking, aim) {
  currentInput.dx = dx;
  currentInput.dy = dy;
  currentInput.walking = walking;
  if (typeof aim === 'number') currentInput.aim = aim;
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
  _prevPredicted._set = false;
  errX = 0; errY = 0; errZ = 0;
  _predictErrorLogged = false;
}

// Module-level scratch objects so the 30 Hz predict loop doesn't allocate
// new world/input/prev objects every step. Field-by-field reuse: zero
// short-lived allocations on the hot path.
const _world = { walls: null, barricades: null, mudPatches: null, portals: null, zone: null };
function refreshWorld() {
  _world.walls = S.mapFeatures.walls || [];
  _world.barricades = S.barricades || [];
  _world.mudPatches = S.mapFeatures.mud || [];
  _world.portals = S.mapFeatures.portals || [];
  _world.zone = S.serverZone;
  return _world;
}
const _stepInput = { dx: 0, dy: 0, walking: false };

let _predictErrorLogged = false;

// Previous-tick predicted state used by getRenderedPredicted() to lerp
// the camera between whole-tick prediction steps so 60 fps render
// doesn't show the 30 Hz step cadence. Reused in place each tick.
const _prevPredicted = { x: 0, y: 0, z: 0, _set: false };
// Reusable output object for getRenderedPredicted — caller reads .x/.y/.z
// once per frame and discards, so a shared module-level object is safe.
const _renderedOut = { x: 0, y: 0, z: 0 };
export function getRenderedPredicted() {
  if (!S.mePredicted) return null;
  const f = Math.max(0, Math.min(1, accumulator / TICK_DT));
  if (!_prevPredicted._set) {
    _renderedOut.x = S.mePredicted.x;
    _renderedOut.y = S.mePredicted.y;
    _renderedOut.z = S.mePredicted.z;
    return _renderedOut;
  }
  _renderedOut.x = _prevPredicted.x + (S.mePredicted.x - _prevPredicted.x) * f;
  _renderedOut.y = _prevPredicted.y + (S.mePredicted.y - _prevPredicted.y) * f;
  _renderedOut.z = _prevPredicted.z + (S.mePredicted.z - _prevPredicted.z) * f;
  return _renderedOut;
}

export function predictStep(frameDt) {
  if (!S.mePredicted || !S.me) return;
  accumulator += frameDt;
  // Cap catch-up so a backgrounded tab doesn't spiral seconds of pending work.
  if (accumulator > 0.25) accumulator = 0.25;
  const world = refreshWorld();
  while (accumulator >= TICK_DT) {
    accumulator -= TICK_DT;
    _prevPredicted.x = S.mePredicted.x;
    _prevPredicted.y = S.mePredicted.y;
    _prevPredicted.z = S.mePredicted.z;
    _prevPredicted._set = true;
    _stepInput.dx = currentInput.dx;
    _stepInput.dy = currentInput.dy;
    _stepInput.walking = !!currentInput.walking;
    // send() increments S.inputSeq, so the seq we capture immediately
    // after is the one the server will see for this step's input.
    send({ type: 'move', dx: _stepInput.dx, dy: _stepInput.dy, walking: _stepInput.walking, aim: currentInput.aim });
    if (S.pingLast === 0) S.pingLast = performance.now();
    const seqAtStep = S.inputSeq;
    // Guard so an integrator regression doesn't kill the render loop.
    try {
      stepPlayerMovement(S.mePredicted, TICK_DT, world, _stepInput, terrain);
    } catch (e) {
      if (!_predictErrorLogged) {
        _predictErrorLogged = true;
        console.error('[prediction] stepPlayerMovement threw:', e);
      }
      accumulator = 0;
      return;
    }
    // Ring entry needs its own input copy — replay reads it later and
    // _stepInput will have been overwritten by then.
    predictRing.push({ seq: seqAtStep, state: snapshotPlayer(S.mePredicted), input: { dx: _stepInput.dx, dy: _stepInput.dy, walking: _stepInput.walking } });
    if (predictRing.length > PREDICT_RING_CAP) predictRing.shift();
  }
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
  // Find the FIRST entry matching the acked seq. The server's snapshot
  // is captured the FIRST tick that integrates each new lastInputSeq, so
  // we pair against the FIRST predict step that ran with that seq tag —
  // both sides represent "one integration step into the new input." Using
  // the LAST matching entry would compare an N-steps-deep prediction
  // against a 1-tick-deep server snapshot and snap on every ack.
  let ackedIdx = -1;
  for (let i = 0; i < predictRing.length; i++) {
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
  // entry's STORED input — Bernier's design. Replaying with live input
  // would re-run mid-turn frames as if the player turned the whole time.
  const world = refreshWorld();
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

