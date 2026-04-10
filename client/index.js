import * as THREE from 'three';
import { CH } from './config.js';
import S from './state.js';
import { sfx, tickMusic, updateMusicMood, updateAudioListener, tickAmbient } from './audio.js';
import { scene, cam, ren, sun, sky, cloudPlanes, vmScene, vmCam } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { setVmGroupRef } from './input.js';
import { connect, send, setMessageHandler } from './network.js';
import './ui.js';
import { updateCows } from './entities.js';
import { buildMap, buildTowerIfNeeded } from './map-objects.js';
import { getVmGroup, updateViewmodel } from './weapons-view.js';
import { updatePickups } from './pickups.js';
import { updateProjectiles } from './projectiles.js';
import { updateZone } from './zone.js';
import { updateHud } from './hud.js';
import { updateParticles, spawnParticle, PGEO_SPHERE_LO, PGEO_TORUS } from './particles.js';
import { updateBulletHoles } from './bullet-holes.js';
import { handlers } from './message-handlers.js';
import { interpSamplePlayer } from './interp.js';
import { predictStep, initPrediction, setCurrentInput, getRenderedPredicted, getRenderOffset } from './prediction.js';

// Wire up viewmodel group ref for input.js ADS toggle
setVmGroupRef(getVmGroup);

// Reusable math temps — avoid per-frame allocations in the render loop
const _tmpFwd = new THREE.Vector3();
const _tmpRight = new THREE.Vector3();
const _tmpDir = new THREE.Vector3();
const _tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');

// Game loop
let last = performance.now();
function loop(ts) {
  requestAnimationFrame(loop);
  const rawFrameGap = ts - last;
  const dt = Math.min(rawFrameGap / 1000, 0.1); last = ts;
  const time = ts / 1000;

  // Inchworm diagnostic: ring buffer of raw frame intervals + long-frame (>50ms) count.
  // The buffer itself is allocated lazily on the first 'state' message in message-handlers.js.
  if (S._iwStats) {
    const iw = S._iwStats;
    iw.frameGaps[iw.frameGapsIdx] = rawFrameGap;
    iw.frameGapsIdx = (iw.frameGapsIdx + 1) % 120;
    if (iw.frameGapsCount < 120) iw.frameGapsCount++;
    if (rawFrameGap > 50) iw.frameJank++;
  }

  const me = S.me;
  updateHud(me, time, dt);

  if (S.state !== 'playing') { ren.render(scene, cam); return; }
  updateMusicMood(); tickMusic(); tickAmbient(S.lastTickNum / 30);

  const now = Date.now();
  // Killcam / spectator: follow a tracked target. Defaults to killer on death; cyclable via click/arrows.
  let spectatingTarget = false;
  if ((!me || !me.alive) && S.state === 'playing') {
    const aliveOthers = S.serverPlayers.filter(p => p.alive && p.id !== S.myId);
    let target = aliveOthers.find(p => p.id === S.spectateTargetId);
    if (!target && aliveOthers.length > 0) {
      target = aliveOthers[0];
      S.spectateTargetId = target.id;
    }
    if (target) {
      spectatingTarget = true;
      // Sample the interpolation ring so the killcam frames the cow where it
      // actually renders, not where it jumped to on the latest raw tick.
      // Without this the orbit visibly stutters 100 ms ahead of the cow mesh.
      const smooth = interpSamplePlayer(target, performance.now());
      const targetH = getTerrainHeight(smooth.x, smooth.y) + (smooth.z || 0) + 18;
      // Orbit using yaw/pitch — player looks around with mouse, camera stays anchored to target
      const orbitDist = 90;
      const cosP = Math.cos(S.pitch), sinP = Math.sin(S.pitch);
      const sinY = Math.sin(S.yaw), cosY = Math.cos(S.yaw);
      cam.position.x = smooth.x - sinY * cosP * orbitDist;
      cam.position.z = smooth.y - cosY * cosP * orbitDist * -1;
      cam.position.y = targetH + sinP * orbitDist + 25;
      cam.lookAt(smooth.x, targetH, smooth.y);
    }
  }

  // Build the current input vector from the WASD key state. predictStep
  // reads it via setCurrentInput and emits the matching `move` message
  // to the server in lockstep with each fixed-timestep iteration — so
  // there's no separate throttled-send path here, send/predict cadences
  // are inherently synchronized at TICK_RATE.
  let curMx = 0, curMz = 0;
  let curAim = 0;
  const curWalking = !!(S.crouching);
  if (me && me.alive) {
    _tmpFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
    _tmpFwd.y = 0; if (_tmpFwd.length() > 0.01) _tmpFwd.normalize(); else _tmpFwd.set(0, 0, -1);
    _tmpRight.set(-_tmpFwd.z, 0, _tmpFwd.x);
    // Camera-forward aim. The cow's default front (rotation.y=0) is the
    // local +Z direction; three.js Y-rotation is left-handed (positive Y
    // rotation takes +Z → +X), so the angle that rotates +Z to point at
    // (cam_fwd.x, cam_fwd.z) is `atan2(cam_fwd.x, cam_fwd.z)`. The bot
    // formula in shared/movement.js uses `atan2(-nx, ny)` which is the
    // OPPOSITE sign — that's a long-standing bot bug, but humans get
    // the correct sign here so they face where they look.
    curAim = Math.atan2(_tmpFwd.x, _tmpFwd.z);
    if (S.keys['KeyW'] || S.keys['ArrowUp']) { curMx += _tmpFwd.x; curMz += _tmpFwd.z; }
    if (S.keys['KeyS'] || S.keys['ArrowDown']) { curMx -= _tmpFwd.x; curMz -= _tmpFwd.z; }
    if (S.keys['KeyA'] || S.keys['ArrowLeft']) { curMx -= _tmpRight.x; curMz -= _tmpRight.z; }
    if (S.keys['KeyD'] || S.keys['ArrowRight']) { curMx += _tmpRight.x; curMz += _tmpRight.z; }
    const curLen = Math.hypot(curMx, curMz);
    if (curLen > 0) { curMx /= curLen; curMz /= curLen; }
  }

  // Phase 4: advance client-side prediction at a fixed 30 Hz timestep.
  // setCurrentInput publishes the current WASD vector to prediction.js
  // — predictStep reads it both for the move emit AND the local
  // integration so the server and client never see different inputs
  // for the same seq.
  if (me && me.alive) {
    setCurrentInput(curMx, curMz, curWalking, curAim);
    if (!S.mePredicted) initPrediction();
    predictStep(dt);
  } else {
    // Drop any stale prediction state so the next spawn re-initializes.
    S.mePredicted = null;
  }

  // Camera reads the RENDERED predicted position: interpolation between
  // _prevPredicted and S.mePredicted based on the accumulator fraction.
  // At 60 fps with 30 Hz prediction this hides the fixed-step cadence.
  // `err` is the render-time smoothing offset from reconcile corrections.
  // Hoisted once per frame and shared with the Y-axis block below.
  if (me && me.alive) {
    const rp = S.mePredicted ? getRenderedPredicted() : null;
    const err = rp ? getRenderOffset() : null;
    if (rp) {
      cam.position.x = rp.x + err.x;
      cam.position.z = rp.y + err.y;
    } else {
      const camLerp = 1 - Math.pow(0.0001, dt);
      cam.position.x += (me.x - cam.position.x) * camLerp;
      cam.position.z += (me.y - cam.position.z) * camLerp;
    }
    const crouchMult = S.crouching ? 0.45 : 1;
    const dynCH = CH * (me.sizeMult || 1) * crouchMult;
    const localTerrainH = getTerrainHeight(cam.position.x, cam.position.z);
    const predZ = rp ? rp.z + err.z : me.z;
    const targetZ = Math.max(localTerrainH, predZ || 0);
    const camLerpY = 1 - Math.pow(0.0001, dt);
    cam.position.y += (dynCH + targetZ - cam.position.y) * camLerpY;
  }
  if (!spectatingTarget) { _tmpEuler.set(S.pitch, S.yaw, 0, 'YXZ'); cam.quaternion.setFromEuler(_tmpEuler); }
  updateAudioListener(cam);
  sun.position.set(cam.position.x + 300, 400, cam.position.z + 200);
  sun.target.position.set(cam.position.x, 0, cam.position.z);
  sun.target.updateMatrixWorld();

  buildMap();
  buildTowerIfNeeded();
  updateZone();
  updateViewmodel();
  sky.position.copy(cam.position);
  cloudPlanes.forEach(c => { c.position.x = c.userData.origX + Math.sin(time * 0.05 * c.userData.speed) * 200; });

  // Footstep sounds for nearby remote players — spatialized via PannerNode.
  // Throttled to ~3 Hz per player to avoid audio spam.
  if (!S._footstepTimers) S._footstepTimers = {};
  for (const p of S.serverPlayers) {
    if (p.id === S.myId || !p.alive) continue;
    const dx = p.x - cam.position.x, dz = p.y - cam.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 300) continue; // too far to hear
    // Check if player moved since last check
    const key = String(p.id);
    const prev = S._footstepTimers[key];
    const now = time;
    if (prev && now - prev.t < 0.3) continue;
    const moved = prev ? Math.hypot(p.x - prev.x, p.y - prev.y) > 3 : false;
    S._footstepTimers[key] = { t: now, x: p.x, y: p.y };
    if (moved) {
      const th = getTerrainHeight(p.x, p.y);
      const vol = p.crouching ? 0.02 : 0.04;
      sfx(80 + Math.random() * 40, 0.06, 'sine', vol, { x: p.x, y: th + 5, z: p.y });
    }
  }

  // Water effects — splash particles and wake rings when below water level
  const WATER_LEVEL = -30;
  if (me && me.alive) {
    const terrH = getTerrainHeight(me.x, me.y);
    const inWater = terrH < WATER_LEVEL;
    if (inWater) {
      const isMoving = S.keys['KeyW'] || S.keys['KeyS'] || S.keys['KeyA'] || S.keys['KeyD'];
      // Splash sound
      if (!S._waterSoundTimer) S._waterSoundTimer = 0;
      S._waterSoundTimer -= dt;
      if (isMoving && S._waterSoundTimer <= 0) {
        sfx(150 + Math.random() * 100, 0.08, 'sine', 0.03);
        sfx(300 + Math.random() * 200, 0.05, 'sine', 0.02);
        S._waterSoundTimer = 0.3 + Math.random() * 0.2;
      }
      // Splash particles — pooled. Rises briefly and fades.
      if (isMoving && Math.random() < 0.3) {
        spawnParticle({
          geo: PGEO_SPHERE_LO, color: 0x4488cc,
          x: me.x + (Math.random() - 0.5) * 10,
          y: WATER_LEVEL + Math.random() * 5,
          z: me.y + (Math.random() - 0.5) * 10,
          sx: 0.8,
          vy: 10 + Math.random() * 15,
          life: 0.6, peakOpacity: 0.6,
        });
      }
      // Wake ring — pooled torus growing outward. PGEO_TORUS is unit-radius;
      // scale it up to ~18 and grow over life. DoubleSide so the ring is
      // visible from above the water plane.
      if (Math.random() < 0.015) {
        spawnParticle({
          geo: PGEO_TORUS, color: 0xffffff, side: THREE.DoubleSide,
          x: me.x + (Math.random() - 0.5) * 6,
          y: WATER_LEVEL + 0.5,
          z: me.y + (Math.random() - 0.5) * 6,
          sx: 18, sy: 18, sz: 1,
          rotX: Math.PI / 2,
          growth: 0.4,
          life: 1.8, peakOpacity: 1,
        });
      }
    }
  }

  updatePickups(time);
  updateCows(time, dt);
  updateProjectiles(dt);
  updateParticles(dt);
  updateBulletHoles(dt);

  // Laser dot for L96 ADS — projects a fixed distance along aim direction
  if (!S._laserDot) {
    S._laserDot = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    S._laserDot.visible = false;
    scene.add(S._laserDot);
  }
  if (S.adsActive && me && me.alive && me.weapon === 'bolty') {
    _tmpDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
    const dotDist = 500;
    S._laserDot.position.set(cam.position.x + _tmpDir.x * dotDist, cam.position.y + _tmpDir.y * dotDist, cam.position.z + _tmpDir.z * dotDist);
    S._laserDot.visible = true;
    // Scale dot based on distance so it looks consistent
    const s = dotDist / 200;
    S._laserDot.scale.set(s, s, s);
  } else if (S._laserDot) {
    S._laserDot.visible = false;
  }

  ren.render(scene, cam);
  const vmGroup = getVmGroup();
  if (vmGroup && S.state === 'playing' && me && me.alive) {
    ren.autoClear = false;
    ren.clearDepth();
    ren.render(vmScene, vmCam);
    ren.autoClear = true;
  }
}

setMessageHandler(msg => {
  const h = handlers[msg.type];
  if (h) h(msg);
});

// When the tab regains focus, clear stale interpolation buffers and the
// CSP frame timing so the first frame after un-throttling doesn't try to
// lerp between samples that are seconds old. Browsers throttle RAF +
// network event handlers when a tab is hidden, so on tab return the
// histBuf is frozen at pre-tab-out state and renderT (now-100ms) is way
// past the latest sample — interpSamplePlayer would freeze remote cows
// until fresh ticks arrive. Dropping the buffers forces a clean
// repopulate from the next few ticks.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  for (const p of S.serverPlayers) {
    if (p._histBuf) p._histBuf.length = 0;
  }
  // Reset the render-loop frame clock so dt isn't a multi-second value
  // on the first un-throttled frame.
  last = performance.now();
});

connect();
requestAnimationFrame(loop);
