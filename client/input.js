import * as THREE from 'three';
import S from './state.js';
import { cam, ren } from './renderer.js';
import { initAudio } from './audio.js';
import { send } from './network.js';

let vmGroupRef = null;
export function setVmGroupRef(getter) { vmGroupRef = getter; }

export function doAttack() {
  const dir = new THREE.Vector3(0, 0, -1); dir.applyQuaternion(cam.quaternion);
  const flatDir = new THREE.Vector2(dir.x, dir.z).normalize();
  send({ type: 'attack', aimX: flatDir.x, aimY: flatDir.y });
}

export function doDash() {
  const dir = new THREE.Vector3(0, 0, -1); dir.applyQuaternion(cam.quaternion); dir.y = 0; dir.normalize();
  send({ type: 'dash', dirX: dir.x, dirY: dir.z });
}

// Pointer lock
ren.domElement.style.cursor = 'pointer';
ren.domElement.addEventListener('click', () => {
  initAudio();
  if (S.state !== 'playing') return;
  if (!S.locked) { ren.domElement.requestPointerLock(); return; }
  doAttack();
});
document.addEventListener('pointerlockchange', () => {
  S.locked = !!document.pointerLockElement;
  if (S.locked) document.getElementById('lockMsg').style.display = 'none';
  else if (S.state === 'playing') setTimeout(() => { if (!S.locked && S.state === 'playing') document.getElementById('lockMsg').style.display = 'block'; }, 2000);
});
document.addEventListener('mousemove', e => {
  if (!S.locked) return;
  const sens = S.adsActive ? 0.0004 : 0.002;
  S.yaw -= e.movementX * sens; S.pitch -= e.movementY * sens;
  S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch));
});
// Right click for ADS (bolty only)
document.addEventListener('mousedown', e => {
  if (e.button === 2 && S.locked && S.state === 'playing') {
    const me = S.serverPlayers.find(p => p.id === S.myId);
    if (me && me.alive && me.weapon === 'bolty') {
      S.adsActive = true;
      cam.fov = 12.5; cam.updateProjectionMatrix();
      document.getElementById('scopeOverlay').style.display = 'block';
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
    document.getElementById('crosshair').style.display = 'block';
    const vg = vmGroupRef && vmGroupRef();
    if (vg) vg.visible = true;
  }
});
document.addEventListener('contextmenu', e => e.preventDefault());

// Mobile touch controls
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isMobile) {
  document.getElementById('touchDpad').style.display = 'block';
  document.getElementById('touchShoot').style.display = 'block';
  document.getElementById('touchDash').style.display = 'block';
  document.getElementById('lockMsg').style.display = 'none';
  const dp = document.getElementById('touchDpad'), dpCtx = dp.getContext('2d');
  let tdx = 0, tdy = 0;
  function drawDp(nx, ny) { dpCtx.clearRect(0, 0, 130, 130); dpCtx.fillStyle = 'rgba(0,0,0,0.3)'; dpCtx.beginPath(); dpCtx.arc(65, 65, 60, 0, Math.PI * 2); dpCtx.fill(); dpCtx.fillStyle = 'rgba(255,255,255,0.5)'; dpCtx.beginPath(); dpCtx.arc(65 + nx * 22, 65 + ny * 22, 20, 0, Math.PI * 2); dpCtx.fill(); }
  drawDp(0, 0);
  function handleDp(e) { e.preventDefault(); const t = e.touches[0]; if (!t) { tdx = tdy = 0; drawDp(0, 0); return; } const r = dp.getBoundingClientRect(); const dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2); const d = Math.hypot(dx, dy); if (d < 10) { tdx = tdy = 0; drawDp(0, 0); return; } tdx = dx / d; tdy = dy / d; drawDp(tdx, tdy); }
  dp.addEventListener('touchstart', handleDp, { passive: false });
  dp.addEventListener('touchmove', handleDp, { passive: false });
  dp.addEventListener('touchend', e => { e.preventDefault(); tdx = tdy = 0; drawDp(0, 0); }, { passive: false });
  setInterval(() => { if (S.state === 'playing' && (Math.abs(tdx) + Math.abs(tdy)) > 0.1) {
    const fwd = new THREE.Vector3(0, 0, -1); fwd.applyQuaternion(cam.quaternion); fwd.y = 0; if (fwd.length() > 0.01) fwd.normalize();
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const mx = fwd.x * (-tdy) + right.x * tdx;
    const mz = fwd.z * (-tdy) + right.z * tdx;
    const len = Math.hypot(mx, mz);
    if (len > 0) { send({ type: 'move', dx: mx / len, dy: mz / len }); S.pingLast = performance.now(); }
  } else if (S.state === 'playing') { send({ type: 'move', dx: 0, dy: 0 }); } }, 50);
  let lastTouchX = 0, lastTouchY = 0;
  document.addEventListener('touchstart', e => { if (e.target === dp || e.target.id === 'touchShoot' || e.target.id === 'touchDash') return; const t = e.touches[e.touches.length - 1]; lastTouchX = t.clientX; lastTouchY = t.clientY; }, { passive: true });
  document.addEventListener('touchmove', e => { if (e.target === dp) return; const t = e.touches[e.touches.length - 1]; const dx = t.clientX - lastTouchX, dy = t.clientY - lastTouchY; S.yaw -= dx * 0.004; S.pitch -= dy * 0.004; S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch)); lastTouchX = t.clientX; lastTouchY = t.clientY; }, { passive: true });
  document.getElementById('touchShoot').addEventListener('touchstart', e => { e.preventDefault(); doAttack(); }, { passive: false });
  document.getElementById('touchDash').addEventListener('touchstart', e => { e.preventDefault(); doDash(); }, { passive: false });
}

// Keyboard
addEventListener('keydown', e => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  S.keys[e.code] = true;
  if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && S.state === 'playing') doDash();
  if (e.code === 'Space') { e.preventDefault(); if (S.jumpH < 1) S.jumpVel = 120; }
  if (e.code === 'KeyQ' && S.state === 'playing') send({ type: 'dropWeapon' });
  if (S.perkMenuOpen && window._perkChoices) {
    if (e.code === 'Digit1' && window._perkChoices[0]) window.pickPerk(window._perkChoices[0].id);
    if (e.code === 'Digit2' && window._perkChoices[1]) window.pickPerk(window._perkChoices[1].id);
    if (e.code === 'Digit3' && window._perkChoices[2]) window.pickPerk(window._perkChoices[2].id);
  }
});
addEventListener('keyup', e => { S.keys[e.code] = false; });
