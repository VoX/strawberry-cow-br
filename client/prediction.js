// Client-side movement prediction with snapshot-interpolation reconciliation.
// Replaces the old Bernier ring-buffer + replay approach with:
//   - Immediate local input application (prediction via shared/movement.js)
//   - Time-stamped prediction vault (via SI's Vault class)
//   - Gradual drift correction from server snapshots (no replay)
//
// The local player is EXCLUDED from SI.calcInterpolation() — remote players
// use that for smooth rendering. The local player predicts immediately and
// reconciles against the server snapshot at the closest matching time.

import S from './state.js';
import { stepPlayerMovement } from '../shared/movement.js';
import { getTerrainHeight } from './terrain.js';
import { send } from './network.js';
import { KNIFE_SPEED_MULT, HIT_SLOW_MULT } from '../shared/constants.js';
import { SI, playerVault, createPredictionSnapshot } from './snapshot.js';

// Fixed timestep — must match server/config.js::TICK_RATE.
const TICK_HZ = 30;
const TICK_DT = 1 / TICK_HZ;

// Hard-snap threshold — above this, teleport instantly (respawn/portal).
const SNAP_THRESHOLD = 40;

// Correction speed — how fast we correct drift per frame.
// Lower = faster correction. 60 = aggressive (moving), 180 = gentle (still).
const CORRECTION_MOVING = 60;
const CORRECTION_STILL = 180;

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

// Render offset — kept for API compatibility but no longer used for
// error accumulation. The gradual correction approach applies directly
// to mePredicted instead of through a separate error channel.
export function getRenderOffset() { return { x: 0, y: 0, z: 0 }; }

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
    // Send move to server (still uses seq for ordering on server side).
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
  // Gradual server reconciliation every frame.
  reconcile();
}

// Time-based server reconciliation. Compares the latest server snapshot's
// position for our player against our predicted position at the same time.
// Gradually corrects drift instead of snapping + replaying.
function reconcile() {
  if (!S.mePredicted || !S.myId) return;

  const serverSnapshot = SI.vault.get();
  if (!serverSnapshot || !serverSnapshot.state) return;

  // Find our entity in the server snapshot.
  const serverState = serverSnapshot.state;
  let serverMe = null;
  for (let i = 0; i < serverState.length; i++) {
    if (serverState[i].id === S.myId) { serverMe = serverState[i]; break; }
  }
  if (!serverMe) return;

  // Find our predicted state closest to the server snapshot's time.
  const predicted = playerVault.get(serverSnapshot.time, true);
  if (!predicted || !predicted.state) return;

  let predMe = null;
  for (let i = 0; i < predicted.state.length; i++) {
    if (predicted.state[i].id === S.myId) { predMe = predicted.state[i]; break; }
  }
  if (!predMe) return;

  // Calculate drift.
  const offsetX = predMe.x - serverMe.x;
  const offsetY = predMe.y - serverMe.y;
  const offsetZ = (predMe.z || 0) - (serverMe.z || 0);
  const drift = Math.hypot(offsetX, offsetY, offsetZ);

  // Net stats tracking.
  const ns = S.netStats;
  const nowMs = performance.now();
  ns.reconcileSnapsWindow.push({ t: nowMs, drift, snapped: drift > SNAP_THRESHOLD });
  while (ns.reconcileSnapsWindow.length > 0 && nowMs - ns.reconcileSnapsWindow[0].t > 1000) {
    ns.reconcileSnapsWindow.shift();
  }

  // Hard snap for teleport/respawn.
  if (drift > SNAP_THRESHOLD) {
    S.mePredicted.x = serverMe.x;
    S.mePredicted.y = serverMe.y;
    S.mePredicted.z = serverMe.z;
    return;
  }

  // Skip tiny drifts.
  if (drift < 0.05) return;

  // Gradual correction — faster when moving, slower when still.
  const isMoving = Math.abs(currentInput.dx) > 0.01 || Math.abs(currentInput.dy) > 0.01;
  const correction = isMoving ? CORRECTION_MOVING : CORRECTION_STILL;

  S.mePredicted.x -= offsetX / correction;
  S.mePredicted.y -= offsetY / correction;
  S.mePredicted.z -= offsetZ / correction;
}

// No longer used — kept as no-op for any call sites that haven't been updated.
export function reconcilePrediction() { return false; }
