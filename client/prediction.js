// =============================================================================
// NETCODE STRATEGY — central reference, read this first.
// =============================================================================
//
// This file is the heart of the client-side prediction (CSP) loop. The whole
// netcode strategy spans server/game.js (tick + inputAck), shared/movement.js
// (the integrator), client/network.js (transport routing), client/index.js
// (render loop wiring), and the message handlers in client/message-handlers.js
// — but the load-bearing invariants live HERE. Touch the rest of the netcode
// without re-reading this comment at your own risk.
//
// ## High-level architecture
//
// Authoritative server, Source/Counter-Strike-style. Three pieces:
//
//   1. CLIENT-SIDE PREDICTION (CSP) for the local player. The client runs
//      the exact same movement integrator the server runs, on the exact same
//      input the server will see, so WASD feels instant — no waiting for the
//      round-trip to the server before the camera moves.
//
//   2. ENTITY INTERPOLATION for remote players (client/interp.js + the tick
//      handler in client/message-handlers.js). Remote positions ride a 100 ms
//      delay buffer so they always lerp between two known snapshots instead
//      of stepping once per arriving tick. Trades 100 ms of display lag on
//      remote motion for perfectly smooth motion.
//
//   3. SERVER-SIDE LAG COMPENSATION for hit detection (server/combat.js +
//      gameState position history ring). The shooter's `attack` carries
//      `displayTick` (the tick the interp buffer was rendering at fire time);
//      the server rewinds entity positions to that tick before doing the
//      hitscan. "What you see is what you can hit" — independent of latency.
//
// ## Why this combo
//
// Standard FPS netcode (Half-Life/Source/CS lineage). It's the only known
// architecture that gives you (a) zero local input latency, (b) smooth
// remote motion under packet loss, AND (c) fair hit detection across
// arbitrary RTTs simultaneously. Anything simpler trades off one of those.
//
// ## CSP loop in detail (the part that's easy to get wrong)
//
// The accumulator: predictStep() runs at the render frame rate but advances
// the simulation in fixed 1/TICK_RATE chunks. One animation frame may step
// prediction 0, 1, or 2 times depending on elapsed wall time. This matters
// because the server simulates at exactly TICK_RATE — variable client
// stepping would diverge.
//
// Send/predict are LOCKSTEP. predictStep() emits exactly one `move` message
// per fixed step, immediately before integrating, with the same input that
// the integration uses. So:
//
//   one predict step = one move message = one unique seq
//
// This 1:1 mapping is THE load-bearing invariant for reconciliation. If you
// throttle sends to a different cadence than the predict step (which is
// what we used to do, with a 50 ms wall-clock throttle), predict steps in
// the gap between sends inherit the OLD seq while integrating LIVE input —
// the server gets a different input than the client's ring entry was tagged
// with, drift accumulates, every reconcile snaps. Don't break this.
//
// ## Why move is the only seq-bearing input
//
// `STATEFUL_INPUT_TYPES` in shared/constants.js is `{move}` only. Attack,
// jump, dash, reload, etc. all skip the seq stamp. Reason: every type that
// increments `S.inputSeq` MUST correspond 1:1 with a predict step, because
// the predict step right after the increment captures the new seq as its
// own tag. If shooting bumped the seq, the next predict step would be
// tagged seq+2 instead of seq+1, and the server (which integrates one tick
// per move, not per shot) would have NO matching snapshot. Drift on every
// shot — that was the strafe-fire stutter bug.
//
// ## Reconciliation
//
// Every ~167 ms (every 5 server ticks) the server sends an `inputAck`
// containing the snapshot it captured when `lastInputSeq` last advanced —
// {seq, x, y, z, vz, onGround, stunTimer, spawnProt}. Client looks up the
// FIRST ring entry tagged with that seq (NOT the last — see below) and
// compares positions:
//
//   - If drift ≤ RECONCILE_EPSILON (1 unit): accept, drop the ring entry,
//     keep predicting forward.
//   - If drift > RECONCILE_EPSILON: snap S.mePredicted to the server
//     position, drop the ring entry plus everything older, REPLAY every
//     remaining ring entry through stepPlayerMovement using each entry's
//     STORED input. Bernier's paper is explicit that replay must use the
//     original cmd, not whatever input is live at replay time, otherwise
//     mid-turn frames re-run as if the player were turning the whole time.
//
// FIRST entry, not LAST: server's snapshot is captured the first tick that
// integrates each new lastInputSeq — i.e. "one integration step into seq=N".
// Client's first ring entry with seq=N is "one predict step into seq=N".
// These two are symmetric. Pairing against the LAST seq=N entry would
// compare an N-steps-deep prediction against a 1-tick-deep snapshot and
// snap on every ack.
//
// ## Render-time error smoothing
//
// Even when reconcile snaps the LOGICAL state (S.mePredicted) to the
// server, the camera shouldn't teleport — that's visible jerk. We fold
// the (pre-snap → post-replay) delta into a render-only error accumulator
// (errX/Y/Z) which decays linearly to zero over ERR_LINEAR_TIME (150 ms).
// The camera reads (mePredicted + err), so the LOGICAL state is correct
// immediately while the VISUAL position glides toward it. Source calls
// this `cl_smooth` / `cl_smoothtime`.
//
// Two cutoffs sit on top of the smoother:
//   - ERR_DEAD_ZONE (0.05 u): sub-dead-zone deltas are dropped entirely
//     (floating-point noise would otherwise feed micro-corrections every ack
//     and the smoother would never settle).
//   - ERR_INSTANT_SNAP (40 u): deltas this large are real teleports
//     (respawn, portal, explosion knockback), not corrections — bypass the
//     smoother and let the camera follow the snap.
//
// ## Server-only state synced to mePredicted
//
// Some fields gate stepPlayerMovement but are server-authoritative — the
// client has no way to predict them. These are mirrored from the tick
// broadcast onto S.mePredicted in the message-handlers tick path AND
// shipped on the inputAck snapshot for cases where the ack arrives between
// ticks:
//
//   - stunTimer (set by combat hits, poisoned food, cowstrike). Skips the
//     movement integration entirely.
//   - spawnProtection. Same.
//
// Without this sync the client would charge forward through a stun and
// snap back hard when reconcile finally landed. That was the "rubberband
// when hit" bug.
//
// ## Server-only mutations the client CAN'T predict (deliberate)
//
//   - Explosion knockback (server applies a position delta directly). The
//     client has no way to know the explosion will hit until the broadcast
//     arrives. Reconcile catches it; for close hits the delta is past
//     ERR_INSTANT_SNAP so the camera hard-snaps. Arguably correct for
//     "you got blown up".
//   - Dash (server teleports up to 120 u in <1 ms). Predicting it would
//     require mirroring the dashCdMult perk and re-running the wall/
//     barricade collision loop locally. Left as a delayed teleport.
//
// ## Transport
//
// The 30 Hz `tick` (S2C) and `move` (C2S) ride the unreliable channel
// (geckos.io WebRTC data channel by default; falls back to WebSocket).
// Everything else is reliable. Reason: TCP head-of-line blocking on a
// dropped packet stalls the entire stream — the player sees a freeze-then-
// catchup. Unreliable UDP for the high-frequency hot path means a dropped
// tick is just gone, the next tick supersedes it within 33 ms, and CSP
// handles the gap naturally. See server/transports/*.js + docs/webrtc-
// migration-plan.md for the transport details.
//
// ## Files involved
//
//   - shared/movement.js  — the integrator both sides call
//   - shared/constants.js — TICK_RATE, STATEFUL_INPUT_TYPES, physics consts
//   - server/game.js      — gameTick(), inputAck snapshot capture
//   - server/dispatch.js  — input message handlers, stale-seq drop
//   - server/combat.js    — applies stunTimer / vz on hit (server-only)
//   - client/prediction.js (this file) — predictStep, reconcile, smoother
//   - client/message-handlers.js — tick handler syncs stunTimer/spawnProt;
//     inputAck handler routes the snapshot into reconcile
//   - client/index.js     — render loop wiring
//   - client/interp.js    — entity interpolation buffer for remote players
//
// =============================================================================

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
// Runs 0 or more fixed-timestep iterations. Each iteration sends a move
// message to the server and advances local prediction in lockstep — so
// every ring entry has its own unique seq and the server processes
// exactly one move per tick. This is what eliminates the "tether"
// rubberband: send and predict cadences MUST match or the client drifts
// ahead of the server within each throttle window.
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
    // Snapshot the input BEFORE stepPlayerMovement. Reconcile replay reads
    // this per-seq stored input from the ring — Bernier's paper is explicit
    // that replay must re-simulate with the exact cmds each slot was
    // originally computed with, not whatever input is live at replay time.
    const stepInput = { dx: currentInput.dx, dy: currentInput.dy, walking: !!currentInput.walking };
    // Send the move with this exact input. send() increments S.inputSeq
    // so the seq we capture immediately after is the one the server will
    // see for this step's input. One move per step → server processes one
    // input per tick → client predicts one step per input → no asymmetry.
    send({ type: 'move', dx: stepInput.dx, dy: stepInput.dy, walking: stepInput.walking });
    if (S.pingLast === 0) S.pingLast = performance.now();
    const seqAtStep = S.inputSeq;
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

