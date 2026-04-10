import * as THREE from 'three';
import S from './state.js';
import { cam, ren } from './renderer.js';
import { initAudio } from './audio.js';
import { send } from './network.js';
import { getServerTime } from './snapshot.js';
import { TICK_RATE, BURST_FAMILY, JUMP_VZ } from '../shared/constants.js';

// Jump prediction: server applies vz=200 + onGround=false on receipt of
// the jump message ONLY IF player.onGround was true. Mirror that gate
// locally so the client predicts the jump immediately, before the
// inputAck would arrive — otherwise pressing Space leaves the camera
// glued to the ground for ~50-200 ms before snapping upward.
function predictJump() {
  const mp = S.mePredicted;
  if (!mp || !mp.onGround) return;
  mp.vz = JUMP_VZ;
  mp.onGround = false;
}

// Client-side fire cooldown — mirrors the server's attackCooldown so
// predicted tracers don't spawn faster than the weapon can fire.
// Reset from the server tick value each tick, decremented locally each frame.
let _localAttackCooldown = 0;
export function tickLocalCooldown(serverCooldown) { _localAttackCooldown = serverCooldown; }
export function stepLocalCooldown(dt) { if (_localAttackCooldown > 0) _localAttackCooldown -= dt; }

// Lag comp: attack messages carry serverTime so the server can rewind
// entity positions to what the shooter was seeing via SI vault.

const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let vmGroupRef = null;
export function setVmGroupRef(getter) { vmGroupRef = getter; }

// Shared Vector3 temp for input handlers — avoids allocating per action
const _inputDir = new THREE.Vector3();

export function doAttack() {
  // Knife routes to the melee path — a separate `meleeAttack` msg that
  // server/combat.js::handleMelee resolves via cone/range check. No aim
  // payload needed; server reads player.aimAngle from the move stream.
  if (S.me && S.me.weapon === 'knife') {
    send({ type: 'meleeAttack' });
    return;
  }
  _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
  send({
    type: 'attack',
    aimX: _inputDir.x, aimY: _inputDir.z, aimZ: _inputDir.y,
    fireMode: S.fireMode,
    serverTime: getServerTime(),
  });
  // Instant predicted tracer — spawn from the local muzzle so the
  // shooter sees their shot immediately without waiting for the server.
  // Gated on the LOCAL cooldown timer to prevent spawning faster than
  // the weapon's fire rate.
  if (S.me && _localAttackCooldown <= 0 && (S.me.ammo > 0 || S.me.ammo === -1)
      && (!S.me.reloading || S.me.weapon === 'shotgun')) {
    const wep = S.me.weapon || 'normal';
    const MUZZLES = {
      normal: { x: 2, y: -2.8, z: -13 }, shotgun: { x: 2, y: -0.8, z: -24 },
      burst: { x: 3.5, y: -2.6, z: -22 }, bolty: { x: 0, y: -4, z: -26 },
      cowtank: { x: 2, y: -3, z: -22 }, aug: { x: 3.5, y: -2.6, z: -22 },
      mp5k: { x: 2, y: -2.8, z: -16 }, thompson: { x: 2, y: -2.5, z: -18 },
      sks: { x: 2.5, y: -2.6, z: -22 }, akm: { x: 2.5, y: -2.6, z: -20 },
    };
    const m = MUZZLES[wep] || MUZZLES.normal;
    const muzzleDir = new THREE.Vector3(m.x, m.y, m.z).applyQuaternion(cam.quaternion);
    const speed = 700;
    S.projData.push({
      id: '_pred_' + (S._predProjCounter = (S._predProjCounter || 0) + 1),
      x: cam.position.x + muzzleDir.x,
      y: cam.position.z + muzzleDir.z,
      vx: _inputDir.x * speed, vy: _inputDir.z * speed,
      color: S.myColor || 'pink',
      bolty: wep === 'bolty', cowtank: wep === 'cowtank',
      y3d: cam.position.y + muzzleDir.y, vy3d: _inputDir.y * speed,
      _localPredicted: true,
      _spawnedAt: performance.now(),
    });
    // Set local cooldown to prevent spawning another tracer before the
    // weapon can fire again. Uses the server's attackCooldown from the
    // last tick as the base — it reflects the weapon's actual fire rate.
    _localAttackCooldown = S.me.attackCooldown > 0 ? S.me.attackCooldown : 0.15;
  }
}

export function doDash() {
  _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
  _inputDir.y = 0; _inputDir.normalize();
  send({ type: 'dash', dirX: _inputDir.x, dirY: _inputDir.z });
}

// Fullscreen toggle — bound to the O key and a lobby button. The Fullscreen API
// rejects the promise if called outside a user gesture, which is fine: the keydown
// handler and button click both qualify.
export function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

// Pointer lock
// Fire mode toggle for LR-300
S.fireMode = 'burst';
let mouseDown = false, autoFireActive = false, nextFireTime = 0;
const AUTO_FIRE_INTERVAL = 72; // ms between shots — slightly over server cooldown (67ms) to avoid rejected shots

function autoFireLoop() {
  if (!autoFireActive) return;
  if (!mouseDown || S.state !== 'playing' || !S.locked) { stopAutoFire(); return; }
  const me = S.me;
  if (!me || !me.alive || (!BURST_FAMILY.has(me.weapon) && me.weapon !== 'thompson')) { stopAutoFire(); return; }
  const now = performance.now();
  if (now >= nextFireTime) {
    doAttack();
    nextFireTime = now + AUTO_FIRE_INTERVAL;
  }
  requestAnimationFrame(autoFireLoop);
}

function startAutoFire() {
  if (autoFireActive) return;
  autoFireActive = true;
  // Don't reset nextFireTime — preserve the previous interval to prevent spam-click bursts
  if (nextFireTime < performance.now()) nextFireTime = performance.now();
  autoFireLoop();
}
function stopAutoFire() {
  autoFireActive = false;
}

ren.domElement.style.cursor = 'pointer';
function cycleSpectate(dir) {
  const aliveOthers = S.serverPlayers.filter(p => p.alive && p.id !== S.myId);
  if (aliveOthers.length === 0) { S.spectateTargetId = null; return; }
  const curIdx = aliveOthers.findIndex(p => p.id === S.spectateTargetId);
  const nextIdx = curIdx < 0 ? 0 : (curIdx + dir + aliveOthers.length) % aliveOthers.length;
  S.spectateTargetId = aliveOthers[nextIdx].id;
}
ren.domElement.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  initAudio();
  if (S.state !== 'playing') return;
  const me = S.me;
  // While spectating, click cycles to the next target instead of firing
  if (!me || !me.alive) {
    if (!S.locked) { ren.domElement.requestPointerLock(); return; }
    cycleSpectate(1);
    return;
  }
  if (!S.locked) { ren.domElement.requestPointerLock(); return; }
  mouseDown = true;
  if ((BURST_FAMILY.has(me.weapon) && S.fireMode === 'auto') || me.weapon === 'thompson') {
    startAutoFire();
  } else {
    doAttack();
  }
});
ren.domElement.addEventListener('mouseup', e => { if (e.button === 0) { mouseDown = false; stopAutoFire(); } });
document.addEventListener('pointerlockchange', () => {
  S.locked = !!document.pointerLockElement;
  if (S.locked) document.getElementById('lockMsg').style.display = 'none';
  else if (S.state === 'playing' && !isMobile) setTimeout(() => { if (!S.locked && S.state === 'playing') document.getElementById('lockMsg').style.display = 'block'; }, 2000);
});
document.addEventListener('mousemove', e => {
  if (!S.locked) return;
  const sens = S.adsActive ? 0.0004 : 0.002;
  S.yaw -= e.movementX * sens; S.pitch -= e.movementY * sens;
  S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch));
});
// Right click for ADS — bolty (L96 scope) and aug (2x integrated optic).
// L96 uses the cross+circle scope overlay; the AUG uses a simpler donut
// reticle overlay (no crosshairs, no scope increments) since its 2x
// optic is closer to a red-dot than a sniper scope.
document.addEventListener('mousedown', e => {
  if (e.button === 2 && S.locked && S.state === 'playing') {
    const me = S.me;
    // Block ADS during bolt rack and reload
    if (me && me.alive && (me.weapon === 'bolty' || me.weapon === 'aug') && !S._boltRacking && !me.reloading) {
      S.adsActive = true;
      cam.fov = me.weapon === 'aug' ? 37.5 : 12.5;
      cam.updateProjectionMatrix();
      const overlayId = me.weapon === 'aug' ? 'augScopeOverlay' : 'scopeOverlay';
      document.getElementById(overlayId).style.display = 'block';
      document.getElementById('crosshair').style.display = 'none';
      const vg = vmGroupRef && vmGroupRef();
      if (vg) vg.visible = false;
    }
  }
});
document.addEventListener('mouseup', e => {
  if (e.button === 2) {
    S.adsActive = false;
    cam.fov = 75; cam.updateProjectionMatrix();
    document.getElementById('scopeOverlay').style.display = 'none';
    document.getElementById('augScopeOverlay').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    const vg = vmGroupRef && vmGroupRef();
    if (vg) vg.visible = true;
  }
});
document.addEventListener('contextmenu', e => e.preventDefault());

// Mobile touch controls
if (isMobile) {
  document.getElementById('touchDpad').style.display = 'block';
  document.getElementById('touchShoot').style.display = 'block';
  document.getElementById('touchDash').style.display = 'block';
  const _mobileEls = ['touchReload', 'touchFireMode', 'touchADS', 'touchDebug', 'touchDrop'];
  _mobileEls.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'block'; });
  document.getElementById('lockMsg').style.display = 'none';
  const dp = document.getElementById('touchDpad'), dpCtx = dp.getContext('2d');
  let tdx = 0, tdy = 0;
  function drawDp(nx, ny) { dpCtx.clearRect(0, 0, 130, 130); dpCtx.fillStyle = 'rgba(0,0,0,0.3)'; dpCtx.beginPath(); dpCtx.arc(65, 65, 60, 0, Math.PI * 2); dpCtx.fill(); dpCtx.fillStyle = 'rgba(255,255,255,0.5)'; dpCtx.beginPath(); dpCtx.arc(65 + nx * 22, 65 + ny * 22, 20, 0, Math.PI * 2); dpCtx.fill(); }
  drawDp(0, 0);
  function handleDp(e) { e.preventDefault(); const t = e.touches[0]; if (!t) { tdx = tdy = 0; drawDp(0, 0); return; } const r = dp.getBoundingClientRect(); const dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy); if (d < 10) { tdx = tdy = 0; drawDp(0, 0); return; } tdx = dx / d; tdy = dy / d; drawDp(tdx, tdy); }
  dp.addEventListener('touchstart', handleDp, { passive: false });
  dp.addEventListener('touchmove', handleDp, { passive: false });
  dp.addEventListener('touchend', e => { e.preventDefault(); tdx = tdy = 0; drawDp(0, 0); }, { passive: false });
  const _mobFwd = new THREE.Vector3();
  const _mobRight = new THREE.Vector3();
  setInterval(() => { if (S.state === 'playing' && (Math.abs(tdx) + Math.abs(tdy)) > 0.1) {
    _mobFwd.set(0, 0, -1).applyQuaternion(cam.quaternion); _mobFwd.y = 0; if (_mobFwd.length() > 0.01) _mobFwd.normalize();
    _mobRight.set(-_mobFwd.z, 0, _mobFwd.x);
    const mx = _mobFwd.x * (-tdy) + _mobRight.x * tdx;
    const mz = _mobFwd.z * (-tdy) + _mobRight.z * tdx;
    const len = Math.hypot(mx, mz);
    if (len > 0) { send({ type: 'move', dx: mx / len, dy: mz / len }); S.pingLast = performance.now(); }
  } else if (S.state === 'playing') { send({ type: 'move', dx: 0, dy: 0 }); } }, 50);
  const isTouchControl = (el) => el === dp || el.id === 'touchShoot' || el.id === 'touchDash';
  // Track camera look touches by identifier for proper multitouch
  const lookTouches = {};
  document.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) {
      if (isTouchControl(t.target)) continue;
      lookTouches[t.identifier] = { x: t.clientX, y: t.clientY };
    }
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      const prev = lookTouches[t.identifier];
      if (!prev) continue;
      const dx = t.clientX - prev.x, dy = t.clientY - prev.y;
      S.yaw -= dx * 0.004; S.pitch -= dy * 0.004;
      S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch));
      prev.x = t.clientX; prev.y = t.clientY;
    }
  }, { passive: true });
  document.addEventListener('touchend', e => { for (const t of e.changedTouches) delete lookTouches[t.identifier]; }, { passive: true });
  document.addEventListener('touchcancel', e => { for (const t of e.changedTouches) delete lookTouches[t.identifier]; }, { passive: true });
  // Touch fire: single tap fires once, hold fires auto (same RAF loop as mouse)
  let _touchFiring = false;
  function touchAutoLoop() {
    if (!_touchFiring) return;
    const me = S.me;
    if (!me || !me.alive) { _touchFiring = false; return; }
    const now = performance.now();
    if (now >= nextFireTime) {
      doAttack();
      nextFireTime = now + AUTO_FIRE_INTERVAL;
    }
    requestAnimationFrame(touchAutoLoop);
  }
  const shootBtn = document.getElementById('touchShoot');
  shootBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    doAttack();
    _touchFiring = true;
    if (nextFireTime < performance.now()) nextFireTime = performance.now() + AUTO_FIRE_INTERVAL;
    touchAutoLoop();
  }, { passive: false });
  shootBtn.addEventListener('touchend', e => { _touchFiring = false; }, { passive: true });
  shootBtn.addEventListener('touchcancel', e => { _touchFiring = false; }, { passive: true });
  document.getElementById('touchDash').addEventListener('touchstart', e => { e.preventDefault(); doDash(); }, { passive: false });
  const touchReload = document.getElementById('touchReload');
  if (touchReload) touchReload.addEventListener('touchstart', e => {
    e.preventDefault();
    send({ type: 'reload' });
    if (S.adsActive) {
      S.adsActive = false;
      cam.fov = 75; cam.updateProjectionMatrix();
      document.getElementById('scopeOverlay').style.display = 'none';
      document.getElementById('augScopeOverlay').style.display = 'none';
      document.getElementById('crosshair').style.display = 'block';
      const vg = vmGroupRef && vmGroupRef();
      if (vg) vg.visible = true;
    }
  }, { passive: false });
  const touchFireMode = document.getElementById('touchFireMode');
  if (touchFireMode) touchFireMode.addEventListener('touchstart', e => {
    e.preventDefault();
    const myWep = S.me ? S.me.weapon : '';
    if (myWep === 'mp5k') S.fireMode = S.fireMode === 'auto' ? 'burst' : 'auto';
    else S.fireMode = S.fireMode === 'burst' ? 'auto' : S.fireMode === 'auto' ? 'semi' : 'burst';
  }, { passive: false });
  const touchADS = document.getElementById('touchADS');
  if (touchADS) {
    touchADS.addEventListener('touchstart', e => {
      e.preventDefault();
      const me = S.me;
      if (!me || !me.alive) return;
      if (S._boltRacking || me.reloading) return;
      if (S.adsActive) {
        // Un-ADS
        S.adsActive = false;
        cam.fov = 75; cam.updateProjectionMatrix();
        document.getElementById('scopeOverlay').style.display = 'none';
        document.getElementById('augScopeOverlay').style.display = 'none';
        document.getElementById('crosshair').style.display = 'block';
        const vg = vmGroupRef && vmGroupRef();
        if (vg) vg.visible = true;
      } else if (me.weapon === 'bolty' || me.weapon === 'aug') {
        // ADS
        S.adsActive = true;
        cam.fov = me.weapon === 'aug' ? 37.5 : 12.5;
        cam.updateProjectionMatrix();
        const overlayId = me.weapon === 'aug' ? 'augScopeOverlay' : 'scopeOverlay';
        document.getElementById(overlayId).style.display = 'block';
        document.getElementById('crosshair').style.display = 'none';
        const vg = vmGroupRef && vmGroupRef();
        if (vg) vg.visible = false;
      }
    }, { passive: false });
  }
  const touchDrop = document.getElementById('touchDrop');
  if (touchDrop) touchDrop.addEventListener('touchstart', e => { e.preventDefault(); send({ type: 'dropWeapon' }); }, { passive: false });
  const touchDebug = document.getElementById('touchDebug');
  if (touchDebug) touchDebug.addEventListener('touchstart', e => { e.preventDefault(); S.debugMode = !S.debugMode; }, { passive: false });
}

// Chat input
const chatInput = document.getElementById('chatInput');
const chatInputWrap = document.getElementById('chatInputWrap');
function openChat() {
  if (!chatInputWrap) return;
  S.chatOpen = true;
  chatInputWrap.style.display = 'block';
  chatInput.value = '';
  chatInput.focus();
  if (document.pointerLockElement) document.exitPointerLock();
}
function closeChat(doSend) {
  if (!chatInputWrap) return;
  const txt = (chatInput.value || '').trim();
  if (doSend && txt) send({ type: 'chat', text: txt });
  S.chatOpen = false;
  chatInputWrap.style.display = 'none';
  chatInput.blur();
}
if (chatInput) {
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); closeChat(true); }
    else if (e.key === 'Escape') { e.preventDefault(); closeChat(false); }
    e.stopPropagation();
  });
}

// Keyboard
addEventListener('keydown', e => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  S.keys[e.code] = true;
  if (e.code === 'KeyT' && S.state === 'playing' && !S.chatOpen) {
    e.preventDefault(); openChat(); return;
  }
  // Spectate cycle while dead
  const meK = S.me;
  if (S.state === 'playing' && (!meK || !meK.alive)) {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { cycleSpectate(1); return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { cycleSpectate(-1); return; }
  }
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && S.state === 'playing') doDash();
  if (e.code === 'Space') { e.preventDefault(); S._spaceHeld = true; send({ type: 'jump' }); predictJump(); }
  if (e.code === 'KeyQ' && S.state === 'playing') send({ type: 'dropWeapon' });
  if (e.code === 'KeyV' && !e.repeat && S.state === 'playing' && S.me && S.me.alive) send({ type: 'moo' });
  // F toggles between the held primary and the knife. Number keys are
  // reserved for the perk-pick menu. Locally optimistic: flip
  // S.mePredicted.weapon immediately so the predict-step speedMult
  // picks up the bonus before the server's snapshot lands.
  if (e.code === 'KeyF' && S.state === 'playing' && S.mePredicted) {
    if (S.mePredicted.weapon === 'knife') {
      S.mePredicted.weapon = S.localPrimaryWeapon || (S.me && S.me.weapon !== 'knife' ? S.me.weapon : 'normal');
      send({ type: 'switchWeapon', to: 'primary' });
    } else {
      S.localPrimaryWeapon = S.mePredicted.weapon;
      S.mePredicted.weapon = 'knife';
      send({ type: 'switchWeapon', to: 'knife' });
    }
  }
  if (e.code === 'KeyP') { S.debugMode = !S.debugMode; }
  if (e.code === 'KeyO') { toggleFullscreen(); }
  if (e.code === 'KeyR' && S.state === 'playing') {
    send({ type: 'reload' });
    // Full un-ADS on reload — restore FOV, overlays, viewmodel
    if (S.adsActive) {
      S.adsActive = false;
      cam.fov = 75; cam.updateProjectionMatrix();
      document.getElementById('scopeOverlay').style.display = 'none';
      document.getElementById('augScopeOverlay').style.display = 'none';
      document.getElementById('crosshair').style.display = 'block';
      const vg = vmGroupRef && vmGroupRef();
      if (vg) vg.visible = true;
    }
  }
  if (e.code === 'KeyX' && S.state === 'playing') {
    const myWep = S.me ? S.me.weapon : '';
    if (myWep === 'mp5k') {
      S.fireMode = S.fireMode === 'auto' ? 'burst' : 'auto';
    } else if (myWep === 'akm') {
      // AKM: toggle auto ↔ semi only (no burst)
      S.fireMode = S.fireMode === 'auto' ? 'semi' : 'auto';
    } else {
      // LR/AUG: cycle burst → auto → semi → burst
      S.fireMode = S.fireMode === 'burst' ? 'auto'
                 : S.fireMode === 'auto'  ? 'semi'
                 : 'burst';
    }
    const wepLabel = { mp5k: 'MP5K', aug: 'AUG', akm: 'AK' }[myWep] || 'M16A2';
    S.chatLog.push({ name: '', color: '', text: wepLabel + ': ' + S.fireMode.toUpperCase() + ' mode', t: 2, system: true });
    if (S.chatLog.length > 10) S.chatLog.shift();
  }
  if (e.code === 'KeyC' && S.state === 'playing') {
    const meC = S.me;
    if (meC && meC.alive) S.crouching = !S.crouching;
  }
  if (e.code === 'KeyB' && S.state === 'playing') {
    const me = S.me;
    if (me && me.alive && performance.now() >= S.barricadeReadyAt) {
      _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
      _inputDir.y = 0;
      if (_inputDir.length() > 0.01) _inputDir.normalize();
      send({ type: 'placeBarricade', aimX: _inputDir.x, aimY: _inputDir.z });
    }
  }
  if (S.perkMenuOpen && window._perkChoices) {
    if (e.code === 'Digit1' && window._perkChoices[0]) window.pickPerk(window._perkChoices[0].id);
    if (e.code === 'Digit2' && window._perkChoices[1]) window.pickPerk(window._perkChoices[1].id);
    if (e.code === 'Digit3' && window._perkChoices[2]) window.pickPerk(window._perkChoices[2].id);
  }
});
addEventListener('keyup', e => {
  S.keys[e.code] = false;
  if (e.code === 'Space') S._spaceHeld = false;
});
