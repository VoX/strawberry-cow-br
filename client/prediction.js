// Client-side movement prediction with snapshot-interpolation reconciliation.
// Uses SI vault for time-based server state matching, but keeps the main
// branch's render-offset smoother for jerk-free visual corrections.
//
// Local player: predict immediately via shared/movement.js, reconcile by
// snapping logical position to server state and absorbing the visual delta
// into a render offset that decays over ERR_LINEAR_TIME.
//
// Remote players: SI.calcInterpolation() handles smooth interpolation.

import S from './state.js';
import { stepPlayerMovement } from '../shared/movement.js';
import { getTerrainHeight } from './terrain.js';
import { send } from './network.js';
import { KNIFE_SPEED_MULT, HIT_SLOW_MULT } from '../shared/constants.js';
import { SI, playerVault, createPredictionSnapshot } from './snapshot.js';

// Fixed timestep — must match server/config.js::TICK_RATE.
const TICK_HZ = 30;
const TICK_DT = 1 / TICK_HZ;

// Reconciliation thresholds
const RECONCILE_EPSILON = 1.0;  // below this, prediction matched — no correction
const SNAP_THRESHOLD = 40;      // above this, hard teleport (respawn/portal)
const ERR_DEAD_ZONE = 0.05;     // render offset below this zeroed out

// Render offset smoother — same as main branch (Source-style cl_smooth).
// Corrections are absorbed into errX/Y/Z and decayed linearly over
// ERR_LINEAR_TIME seconds. Camera reads mePredicted + renderOffset, so
// the logical position gets instant correction but the visual glides.
let errX = 0, errY = 0, errZ = 0;
let errRemainTime = 0;
const ERR_LINEAR_TIME = 0.15;    // 150ms decay

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

function foldError(dx, dy, dz) {
  const newX = errX + dx;
  const newY = errY + dy;
  const newZ = errZ + dz;
  const mag = Math.hypot(newX, newY, newZ);
  if (mag > SNAP_THRESHOLD) {
    errX = 0; errY = 0; errZ = 0; errRemainTime = 0;
    return;
  }
  if (mag < ERR_DEAD_ZONE) {
    errX = 0; errY = 0; errZ = 0; errRemainTime = 0;
    return;
  }
  errX = newX; errY = newY; errZ = newZ;
  errRemainTime = ERR_LINEAR_TIME;
}

// Terrain shim matching the server/terrain.js shape.
const terrain = {
  getGroundHeight: (x, y) => getTerrainHeight(x, y),
  WALL_HEIGHT: 70,
};

// Fixed-step accumulator.
let accumulator = 0;

// Latest WASD input vector + camera aim.
let currentInput = { dx: 0, dy: 0, walking: false, aim: 0 };
export function setCurrentInput(dx, dy, walking, aim) {
  currentInput.dx = dx;
  currentInput.dy = dy;
  currentInput.walking = walking;
  if (typeof aim === 'number') currentInput.aim = aim;
}

// Synthesized perks for prediction player.
function buildPredictedPerks(p) {
  return {
    speedMult: p && p.speedMult != null ? p.speedMult : 1,
    maxHunger: 100,
    sizeMult: p && p.sizeMult != null ? p.sizeMult : 1,
    damage: 1,
  };
}

// Initialize S.mePredicted from S.me.
export function initPrediction() {
  if (!S.me) return;
  S.mePredicted = {
    x: S.me.x, y: S.me.y, z: S.me.z, vz: S.me.vz || 0,
    dir: S.me.dir, onGround: S.me.onGround,
    stunTimer: S.me.stunTimer || 0,
    spawnProtection: S.me.spawnProt ? 1 : 0,
    foodEaten: S.me.foodEaten || 0,
    _portalCooldown: S.me._portalCooldown || 0,
    perks: S.me.perks || buildPredictedPerks(S.me),
    isBot: false,
  };
  accumulator = 0;
  _prevPredicted._set = false;
  errX = 0; errY = 0; errZ = 0; errRemainTime = 0;
  playerVault.clear();
}

// Module-level scratch objects — zero allocations on hot path.
const _world = { walls: null, barricades: null, mudPatches: null, portals: null, zone: null };
function refreshWorld() {
  _world.walls = S.mapFeatures.walls || [];
  _world.barricades = S.barricades || [];
  _world.mudPatches = S.mapFeatures.mud || [];
  _world.portals = S.mapFeatures.portals || [];
  _world.zone = S.serverZone;
  return _world;
}
const _stepInput = { dx: 0, dy: 0, walking: false, speedMult: 1 };

let _predictErrorLogged = false;

// Sub-tick interpolation for smooth camera at 60+ fps.
const _prevPredicted = { x: 0, y: 0, z: 0, _set: false };
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

// Client-authoritative speed effects.
function computeLocalSpeedMult() {
  const mp = S.mePredicted;
  let mult = 1;
  if (mp && mp.weapon === 'knife') mult *= KNIFE_SPEED_MULT;
  if (S.localHitSlowEndsAt > performance.now()) mult *= HIT_SLOW_MULT;
  return mult;
}

export function predictStep(frameDt) {
  if (!S.mePredicted || !S.me) return;
  accumulator += frameDt;
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
    _stepInput.speedMult = computeLocalSpeedMult();
    send({ type: 'move', dx: _stepInput.dx, dy: _stepInput.dy, walking: _stepInput.walking, aim: currentInput.aim, speedMult: _stepInput.speedMult });
    if (S.pingLast === 0) S.pingLast = performance.now();
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
    // Store predicted position in the vault for time-based reconciliation.
    createPredictionSnapshot(S.myId, S.mePredicted.x, S.mePredicted.y, S.mePredicted.z);
  }
  decayRenderOffset(frameDt);
  reconcile();
}

// Time-based server reconciliation using SI vault.
// Snap logical position to server state when drift exceeds epsilon,
// then fold the visual delta into the render offset smoother.
function reconcile() {
  if (!S.mePredicted || !S.myId) return;

  const serverSnapshot = SI.vault.get();
  if (!serverSnapshot || !serverSnapshot.state) return;

  // Find our entity in the server snapshot.
  let serverMe = null;
  for (let i = 0; i < serverSnapshot.state.length; i++) {
    if (serverSnapshot.state[i].id === S.myId) { serverMe = serverSnapshot.state[i]; break; }
  }
  if (!serverMe) return;

  // Find our predicted state closest to the server snapshot's time.
  const clientTime = serverSnapshot.time + (SI.timeOffset || 0);
  const predicted = playerVault.get(clientTime, true);
  if (!predicted || !predicted.state) return;

  let predMe = null;
  for (let i = 0; i < predicted.state.length; i++) {
    if (predicted.state[i].id === S.myId) { predMe = predicted.state[i]; break; }
  }
  if (!predMe) return;

  // Calculate drift between predicted and server at the same time.
  const dx = predMe.x - serverMe.x;
  const dy = predMe.y - serverMe.y;
  const dz = (predMe.z || 0) - (serverMe.z || 0);
  const drift = Math.hypot(dx, dy, dz);

  // Net stats.
  const ns = S.netStats;
  const nowMs = performance.now();
  ns.reconcileSnapsWindow.push({ t: nowMs, drift, snapped: drift > RECONCILE_EPSILON });
  while (ns.reconcileSnapsWindow.length > 0 && nowMs - ns.reconcileSnapsWindow[0].t > 1000) {
    ns.reconcileSnapsWindow.shift();
  }

  if (drift <= RECONCILE_EPSILON) return; // prediction matched

  // Capture pre-correction position for the render smoother.
  const preX = S.mePredicted.x;
  const preY = S.mePredicted.y;
  const preZ = S.mePredicted.z;

  // Snap logical position to server state.
  S.mePredicted.x = serverMe.x;
  S.mePredicted.y = serverMe.y;
  S.mePredicted.z = serverMe.z;

  // Fold the visual delta into the render offset smoother.
  // Camera sees (mePredicted + renderOffset), so offsetting by
  // (pre - post) keeps the camera in place visually while the
  // logical position jumps. The offset decays over 150ms.
  foldError(preX - S.mePredicted.x, preY - S.mePredicted.y, preZ - S.mePredicted.z);
}

// No longer used — kept as no-op for any call sites that haven't been updated.
export function reconcilePrediction() { return false; }
