import * as THREE from 'three';
import { CH } from './config.js';
import S from './state.js';
import { sfx, tickMusic, updateMusicMood, updateAudioListener } from './audio.js';
import { scene, cam, ren, sun, sky, cloudPlanes, vmScene, vmCam } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { setVmGroupRef, stepLocalCooldown } from './input.js';
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
import { getInterpolatedEntity, updateInterpolation, clearSnapshots } from './snapshot.js';
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
let frameCount = 0;
function loop(ts) {
  frameCount++;
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
  updateMusicMood(); tickMusic();
  // Update SI interpolation cache once per frame — all entity lookups read from this.
  updateInterpolation(frameCount);

  const now = Date.now();
  // Killcam / spectator: follow a tracked target. Defaults to killer on death; cyclable via click/arrows.
  let spectatingTarget = false;
  if ((!me || !me.alive) && S.state === 'playing') {
    // Find spectate target without allocating a filtered array per frame
    let target = null, firstAlive = null;
    for (const p of S.serverPlayers) {
      if (!p.alive || p.id === S.myId) continue;
      if (!firstAlive) firstAlive = p;
      if (p.id === S.spectateTargetId) { target = p; break; }
    }
    if (!target && firstAlive) { target = firstAlive; S.spectateTargetId = target.id; }
    if (target) {
      spectatingTarget = true;
      // Sample SI interpolation so the killcam frames the cow where it
      // actually renders, not where it jumped to on the latest raw tick.
      const smooth = getInterpolatedEntity(target);
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

  // Advance client-side prediction at a fixed 30 Hz timestep.
  // setCurrentInput publishes the current WASD vector to prediction.js
  // — predictStep reads it both for the move emit AND the local
  // integration so the server and client never see different inputs
  // for the same seq.
  if (me && me.alive) {
    setCurrentInput(curMx, curMz, curWalking, curAim);
    if (!S.mePredicted) initPrediction();
    predictStep(dt);
    stepLocalCooldown(dt);
    // Repeat jump while space is held — re-trigger when landing
    if (S._spaceHeld && S.mePredicted && S.mePredicted.onGround) {
      send({ type: 'jump' });
      S.mePredicted.vz = 230; S.mePredicted.onGround = false;
    }
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
  // updateZone(); // Zone walls disabled
  updateViewmodel();

  // (L96 laser dot is handled below near the end of the render loop)
  sky.position.copy(cam.position);
  cloudPlanes.forEach(c => { c.position.x = c.userData.origX + Math.sin(time * 0.05 * c.userData.speed) * 200; });

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

  // L96 laser dot — sphere at the terrain hit point, uses the same
  // ray march as the laser line above. Replaces the old fixed-distance dot.
  if (!S._laserDot) {
    S._laserDot = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    S._laserDot.visible = false;
    scene.add(S._laserDot);
  }
  if (me && me.alive && (me.weapon === 'bolty' || me.weapon === 'aug')) {
    const fwd2 = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    let dotX = cam.position.x + fwd2.x * 2000;
    let dotY = cam.position.y + fwd2.y * 2000;
    let dotZ = cam.position.z + fwd2.z * 2000;
    let hitDist = 2000;
    // Ray march: check terrain, walls, barricades, and cows (5-unit steps)
    for (let d = 5; d < 2000; d += 5) {
      const rx = cam.position.x + fwd2.x * d;
      const ry = cam.position.y + fwd2.y * d;
      const rz = cam.position.z + fwd2.z * d;
      // Terrain
      const th = getTerrainHeight(rx, rz);
      if (ry < th) { dotX = rx; dotY = th; dotZ = rz; hitDist = d; break; }
      // Walls (AABB test, server x/y → world x/z)
      let wallHit = false;
      if (S.mapFeatures && S.mapFeatures.walls) {
        for (const w of S.mapFeatures.walls) {
          if (rx > w.x && rx < w.x + w.w && rz > w.y && rz < w.y + w.h && ry < th + 70) {
            dotX = rx; dotY = ry; dotZ = rz; hitDist = d; wallHit = true; break;
          }
        }
      }
      if (wallHit) break;
      // Barricades (rough AABB, close enough for a laser dot)
      let bHit = false;
      for (const b of S.barricades) {
        const dx = rx - b.cx, dz = rz - b.cy;
        if (Math.abs(dx) < b.w / 2 + 5 && Math.abs(dz) < b.h / 2 + 5 && ry < th + 56) {
          dotX = rx; dotY = ry; dotZ = rz; hitDist = d; bHit = true; break;
        }
      }
      if (bHit) break;
      // Players (cylinder test, radius ~16)
      let cowHit = false;
      for (const p of S.serverPlayers) {
        if (p.id === S.myId || !p.alive) continue;
        const pth = getTerrainHeight(p.x, p.y);
        if (ry > pth && ry < pth + 50 && Math.hypot(rx - p.x, rz - p.y) < 16) {
          dotX = rx; dotY = ry; dotZ = rz; hitDist = d; cowHit = true; break;
        }
      }
      if (cowHit) break;
    }
    S._laserDot.position.set(dotX, dotY + 0.5, dotZ);
    // Further = smaller so it looks like a consistent dot on the surface
    const s = Math.max(0.34, 1.23 - hitDist / 1500);
    S._laserDot.scale.set(s, s, s);
    S._laserDot.visible = true;
  } else if (S._laserDot) {
    S._laserDot.visible = false;
  }

  // Remote player laser dots — 10 Hz throttled, skip if > 500 units away.
  if (!S._remoteLaserDots) S._remoteLaserDots = {};
  if (!S._remoteLaserT) S._remoteLaserT = 0;
  S._remoteLaserT += dt;
  if (S._remoteLaserT >= 0.1) {
    S._remoteLaserT = 0;
    const laserWeapons = new Set(['bolty', 'aug']);
    const seenDots = new Set();
    for (const p of S.serverPlayers) {
      if (p.id === S.myId || !p.alive || !laserWeapons.has(p.weapon)) continue;
      const distToCam = Math.hypot(p.x - cam.position.x, p.y - cam.position.z);
      if (distToCam > 500) continue;
      seenDots.add(p.id);
      if (!S._remoteLaserDots[p.id]) {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        dot.visible = false;
        scene.add(dot);
        S._remoteLaserDots[p.id] = dot;
      }
      const dot = S._remoteLaserDots[p.id];
      const ax = Math.sin(p.aimAngle || 0);
      const az = Math.cos(p.aimAngle || 0);
      const pth = getTerrainHeight(p.x, p.y);
      const py = pth + 35;
      let dHit = 2000, hx = p.x + ax * 2000, hy = py, hz = p.y + az * 2000;
      for (let d = 10; d < 2000; d += 10) {
        const rx = p.x + ax * d, rz = p.y + az * d;
        const th = getTerrainHeight(rx, rz);
        if (py < th) { hx = rx; hy = th; hz = rz; dHit = d; break; }
      }
      dot.position.set(hx, hy + 0.5, hz);
      const ds = Math.max(0.4, 1.45 - dHit / 1500);
      dot.scale.set(ds, ds, ds);
      dot.visible = true;
    }
    for (const id of Object.keys(S._remoteLaserDots)) {
      if (!seenDots.has(Number(id))) {
        S._remoteLaserDots[id].visible = false;
        scene.remove(S._remoteLaserDots[id]);
        S._remoteLaserDots[id].geometry.dispose();
        S._remoteLaserDots[id].material.dispose();
        delete S._remoteLaserDots[id];
      }
    }
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
// On tab return, clear SI vaults to prevent interpolation from frozen data.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  clearSnapshots();
  last = performance.now();
});

connect();
requestAnimationFrame(loop);
