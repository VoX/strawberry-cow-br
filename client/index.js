import * as THREE from 'three';
import { MW, MH, CH } from './config.js';
import S from './state.js';
import { initAudio, sfx, sfxShoot, sfxBolty, sfxHit, sfxEat, sfxLevelUp, sfxDeath, sfxBump, tickMusic, setMusicPlaying, resetMusic, getAudioCtx } from './audio.js';
import { scene, cam, ren, sun, sky, cloudPlanes, vmScene, vmCam } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { setVmGroupRef } from './input.js';
import { connect, send, setMessageHandler } from './network.js';
import './ui.js';
import { showPerkMenu } from './ui.js';
import { spawnParts, updateCows } from './entities.js';
import { buildMap, buildTowerIfNeeded, getTowerHeight } from './map-objects.js';
import { getVmGroup, updateViewmodel } from './weapons-view.js';
import { updatePickups } from './pickups.js';
import { updateProjectiles } from './projectiles.js';
import { updateZone } from './zone.js';
import { updateHud } from './hud.js';

// Wire up viewmodel group ref for input.js ADS toggle
setVmGroupRef(getVmGroup);

function handleMsg(msg) {
  if (msg.type === 'joined') {
    S.myId = msg.id; S.myColor = msg.color; S.state = 'lobby';
    document.getElementById('joinScreen').querySelector('h2').textContent = 'Waiting for players...';
  }
  if (msg.type === 'lobby') {
    const cd = msg.countdown > 0 ? (' (' + msg.countdown + 's)') : '';
    const readyTxt = msg.allReady ? 'All ready! Starting' + cd : 'Waiting for players to ready up';
    const pList = msg.players.map(p => '<span style="color:' + (p.ready ? '#88ff88' : '#ff8888') + '">' + (p.name || '?') + (p.ready ? ' \u2714' : ' ...') + '</span>').join(' ');
    document.getElementById('joinScreen').querySelector('h2').innerHTML = readyTxt + '<br><span style="font-size:12px">' + pList + '</span>';
    if (!document.getElementById('readyBtn')) {
      const rb = document.createElement('button'); rb.id = 'readyBtn'; rb.textContent = 'READY';
      rb.style.cssText = 'padding:8px 30px;font-size:18px;border:none;border-radius:8px;background:#44ff44;color:#000;cursor:pointer;font-weight:bold;margin-top:10px';
      rb.onclick = () => { send({ type: 'ready' }); rb.textContent = 'READY \u2714'; rb.style.background = '#88ff88'; };
      document.getElementById('joinScreen').appendChild(rb);
    }
  }
  if (msg.type === 'spectate') {
    S.state = 'playing';
    document.getElementById('joinScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    document.getElementById('lockMsg').style.display = 'block';
    S.serverPlayers = msg.players;
    S.serverFoods = (msg.foods || []).map(f => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
    if (msg.zone) S.serverZone = msg.zone;
    if (msg.map) { S.mapFeatures = msg.map; S.mapBuilt = false; }
    if (msg.weapons) S.clientWeapons = msg.weapons;
    if (msg.armorPickups) window._armorPickupData = msg.armorPickups;
  }
  if (msg.type === 'start') {
    S.state = 'playing';
    document.getElementById('joinScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    document.getElementById('lockMsg').style.display = 'block';
    setTimeout(() => { document.getElementById('lockMsg').style.display = 'none'; }, 5000);
    S.serverPlayers = msg.players;
    S.serverFoods = (msg.foods || []).map(f => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
    if (msg.zone) S.serverZone = msg.zone;
    if (msg.map) { S.mapFeatures = msg.map; S.mapBuilt = false; }
    if (msg.weapons) S.clientWeapons = msg.weapons;
    S.killfeed = []; setMusicPlaying(true); resetMusic();
    window._armorPickupData = msg.armorPickups || [];
    document.getElementById('winScreen').style.display = 'none';
    for (const id in S.cowMeshes) { scene.remove(S.cowMeshes[id].mesh); } S.cowMeshes = {};
    if (window._foodMeshes) { for (const id in window._foodMeshes) { scene.remove(window._foodMeshes[id]); } window._foodMeshes = {}; }
    if (window._wpMeshes) { for (const id in window._wpMeshes) { scene.remove(window._wpMeshes[id]); } window._wpMeshes = {}; }
    for (const id in S.projMeshes) { const pm = S.projMeshes[id]; scene.remove(pm); pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); } S.projMeshes = {}; S.projData = [];
  }
  if (msg.type === 'state') {
    S.serverPlayers = msg.players;
    if (msg.zone) S.serverZone = msg.zone;
    if (S.pingLast > 0) { const pd = performance.now() - S.pingLast; if (pd < 2000) S.pingVal = S.pingVal * 0.7 + pd * 0.3; S.pingLast = 0; }
  }
  if (msg.type === 'food') {
    const f = msg.food || msg;
    S.serverFoods.push({ id: f.id, x: f.x, y: f.y, type: f.type || f.typeName });
  }
  if (msg.type === 'eat') {
    S.serverFoods = S.serverFoods.filter(f => f.id !== msg.foodId);
    spawnParts(msg.playerId);
    if (msg.playerId === S.myId) sfxEat();
  }
  if (msg.type === 'projectile') {
    const projSpeed = Math.hypot(msg.vx, msg.vy);
    let vy3d = 0, spawnH = 15 + getTerrainHeight(msg.x, msg.y);
    if (msg.ownerId === S.myId) {
      const dir3 = new THREE.Vector3(0, 0, -1); dir3.applyQuaternion(cam.quaternion);
      vy3d = dir3.y * projSpeed;
      spawnH = cam.position.y;
    }
    if (msg.shotgun !== undefined) { vy3d += (Math.random() - 0.5) * 150; }
    S.projData.push({ id: msg.id, x: msg.x, y: msg.y, vx: msg.vx, vy: msg.vy, color: msg.color || 'pink', bolty: msg.bolty, cowtank: msg.cowtank, y3d: spawnH, vy3d });
    if (msg.ownerId === S.myId) { msg.bolty ? sfxBolty() : sfxShoot(); }
  }
  if (msg.type === 'projectileHit') {
    S.projData = S.projData.filter(p => p.id !== msg.projectileId);
    if (S.projMeshes[msg.projectileId]) { const pm = S.projMeshes[msg.projectileId]; scene.remove(pm); pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); delete S.projMeshes[msg.projectileId]; }
    if (msg.targetId === S.myId) { sfxHit(); document.getElementById('hitFlash').style.opacity = '0.5'; setTimeout(() => document.getElementById('hitFlash').style.opacity = '0', 150); }
  }
  if (msg.type === 'eliminated') {
    S.killfeed.unshift({ txt: msg.name + ' eliminated (#' + (msg.rank || '?') + ')', t: 5 });
    if (S.killfeed.length > 5) S.killfeed.pop();
    if (msg.playerId === S.myId) sfxDeath();
  }
  if (msg.type === 'winner') {
    S.killfeed.unshift({ txt: '\u{1F451} ' + (msg.name || '?') + ' WINS!', t: 10 }); setMusicPlaying(false);
    const ws2 = document.getElementById('winScreen');
    ws2.style.display = 'flex';
    document.getElementById('winName').textContent = (msg.name || '?') + ' WINS!';
    document.getElementById('winStats').textContent = 'Score: ' + (msg.score || 0) + ' | Kills: ' + (msg.kills || 0);
    document.getElementById('winRestart').textContent = 'Next round starting soon...';
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const v = 0.08 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
      const chords = [[82.4, 164.8], [98, 196], [110, 220], [82.4, 164.8], [110, 220], [130.8, 261.6], [164.8, 329.6]];
      chords.forEach((notes, i) => {
        notes.forEach(freq => {
          const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
          const dist = getAudioCtx().createWaveShaper();
          const curve = new Float32Array(256); for (let j = 0; j < 256; j++) { const x = j * 2 / 256 - 1; curve[j] = Math.tanh(x * 3); }
          dist.curve = curve;
          o.type = 'sawtooth'; o.frequency.value = freq;
          g.gain.setValueAtTime(v, t + i * 0.2); g.gain.setValueAtTime(v, t + i * 0.2 + 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.19);
          o.connect(dist); dist.connect(g); g.connect(getAudioCtx().destination);
          o.start(t + i * 0.2); o.stop(t + i * 0.2 + 0.2);
        });
        const k = getAudioCtx().createOscillator(), kg = getAudioCtx().createGain();
        k.type = 'sine'; k.frequency.setValueAtTime(150, t + i * 0.2); k.frequency.exponentialRampToValueAtTime(30, t + i * 0.2 + 0.1);
        kg.gain.setValueAtTime(v * 1.5, t + i * 0.2); kg.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.12);
        k.connect(kg); kg.connect(getAudioCtx().destination); k.start(t + i * 0.2); k.stop(t + i * 0.2 + 0.12);
      });
      const finalT = t + chords.length * 0.2;
      [164.8, 220, 329.6].forEach(freq => {
        const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
        const dist = getAudioCtx().createWaveShaper();
        const curve = new Float32Array(256); for (let j = 0; j < 256; j++) { const x = j * 2 / 256 - 1; curve[j] = Math.tanh(x * 4); }
        dist.curve = curve;
        o.type = 'sawtooth'; o.frequency.value = freq;
        g.gain.setValueAtTime(v * 1.2, finalT); g.gain.exponentialRampToValueAtTime(0.001, finalT + 1.5);
        o.connect(dist); dist.connect(g); g.connect(getAudioCtx().destination);
        o.start(finalT); o.stop(finalT + 1.5);
      });
    }
  }
  if (msg.type === 'restart' && msg.countdown <= 0) {
    S.state = 'lobby';
    document.getElementById('joinScreen').style.display = 'flex';
    document.getElementById('joinScreen').querySelector('h2').textContent = 'Waiting for players...';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('winScreen').style.display = 'none';
    S.mapBuilt = false;
    const oldRb = document.getElementById('readyBtn'); if (oldRb) oldRb.remove();
  }
  if (msg.type === 'levelup') {
    sfxLevelUp();
    S.pendingLevelUps = (S.pendingLevelUps || 0) + 1;
    if (!S.perkMenuOpen) showPerkMenu();
  }
  if (msg.type === 'cowstrikeWarning') {
    S.killfeed.unshift({ txt: '\u{1F6A8} ' + (msg.name || '?') + ' CALLED COWSTRIKE! TAKE COVER!', t: 6 });
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t);
      o.frequency.linearRampToValueAtTime(900, t + 0.75); o.frequency.linearRampToValueAtTime(300, t + 1.5);
      o.frequency.linearRampToValueAtTime(900, t + 2.25); o.frequency.linearRampToValueAtTime(300, t + 3);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.2);
      g.gain.setValueAtTime(0.1, t + 2.5); g.gain.linearRampToValueAtTime(0, t + 3);
      o.connect(g); g.connect(getAudioCtx().destination); o.start(t); o.stop(t + 3);
    }
  }
  if (msg.type === 'cowstrike') {
    S.killfeed.unshift({ txt: '\u{1F4A5} COWSTRIKE WAVE ' + (((msg.wave || 0) + 1)) + '!', t: 4 });
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const bs = getAudioCtx().sampleRate * 0.3, b = getAudioCtx().createBuffer(1, bs, getAudioCtx().sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 3);
      const n = getAudioCtx().createBufferSource(); n.buffer = b; const ng = getAudioCtx().createGain();
      ng.gain.setValueAtTime(0.15, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      n.connect(ng); ng.connect(getAudioCtx().destination); n.start(t); n.stop(t + 0.4);
      sfx(60, 0.4, 'sine', 0.12);
    }
    document.getElementById('hitFlash').style.background = 'rgba(255,100,0,0.5)';
    document.getElementById('hitFlash').style.opacity = '0.6';
    setTimeout(() => { document.getElementById('hitFlash').style.opacity = '0'; document.getElementById('hitFlash').style.background = 'rgba(255,0,0,0.3)'; }, 500);
    for (let i = 0; i < 50; i++) {
      const rx = cam.position.x + (Math.random() - 0.5) * 800;
      const rz = cam.position.z + (Math.random() - 0.5) * 800;
      const startY = 300 + Math.random() * 200;
      const fireMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.3 ? 0xff4400 : 0xffaa00 });
      const m = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 4, 6, 6), fireMat);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.3 });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 6, 6, 6), glowMat);
      m.add(glow);
      m.position.set(rx, startY, rz); scene.add(m);
      const trailParts = [];
      const delay = Math.random() * 800;
      const fallSpeed = 6 + Math.random() * 10;
      let fallLife = 5;
      const fall = () => {
        fallLife -= 0.016;
        if (fallLife <= 0) { scene.remove(m); m.geometry.dispose(); fireMat.dispose(); glow.geometry.dispose(); glowMat.dispose(); trailParts.forEach(t => { scene.remove(t.mesh); t.mesh.geometry.dispose(); t.mesh.material.dispose(); }); return; }
        m.position.y -= fallSpeed;
        if (Math.random() < 0.4) {
          const tp = new THREE.Mesh(new THREE.SphereGeometry(1.5, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true }));
          tp.position.copy(m.position); tp.position.x += (Math.random() - 0.5) * 4; tp.position.z += (Math.random() - 0.5) * 4;
          scene.add(tp); trailParts.push({ mesh: tp, life: 0.4 });
        }
        for (let ti = trailParts.length - 1; ti >= 0; ti--) { const t = trailParts[ti]; t.life -= 0.02; t.mesh.material.opacity = Math.max(0, t.life); t.mesh.scale.multiplyScalar(0.95); if (t.life <= 0) { scene.remove(t.mesh); t.mesh.geometry.dispose(); t.mesh.material.dispose(); trailParts.splice(ti, 1); } }
        const groundH = getTerrainHeight(rx, rz);
        if (m.position.y <= groundH + 5) {
          scene.remove(m); m.geometry.dispose(); fireMat.dispose(); glow.geometry.dispose(); glowMat.dispose();
          const fb = new THREE.Mesh(new THREE.SphereGeometry(12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true }));
          fb.position.set(rx, groundH + 8, rz); scene.add(fb);
          let fblife = 0.8;
          const fbAnim = () => { fblife -= 0.025; fb.material.opacity = fblife; fb.scale.multiplyScalar(1.04); fb.material.color.setHex(fblife > 0.4 ? 0xff4400 : 0xff8800); if (fblife <= 0) { scene.remove(fb); fb.geometry.dispose(); fb.material.dispose(); } else requestAnimationFrame(fbAnim); };
          requestAnimationFrame(fbAnim);
          setTimeout(() => { try { scene.remove(fb); fb.geometry.dispose(); fb.material.dispose(); } catch (e) {} }, 3000);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 2, 6, 16), new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true }));
          ring.position.set(rx, groundH + 3, rz); ring.rotation.x = Math.PI / 2; scene.add(ring);
          let rlife = 0.6;
          const rAnim = () => { rlife -= 0.02; ring.material.opacity = rlife; ring.scale.multiplyScalar(1.08); if (rlife <= 0) { scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); } else requestAnimationFrame(rAnim); };
          requestAnimationFrame(rAnim);
          setTimeout(() => { try { scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); } catch (e) {} }, 3000);
          for (let j = 0; j < 12; j++) {
            const col = Math.random() > 0.3 ? 0xff4400 : (Math.random() > 0.5 ? 0xffdd00 : 0xff8800);
            const ep = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 3, 4, 4), new THREE.MeshBasicMaterial({ color: col, transparent: true }));
            const evx = (Math.random() - 0.5) * 120, evz = (Math.random() - 0.5) * 120; let evy = 40 + Math.random() * 80;
            ep.position.set(rx, groundH + 5, rz); scene.add(ep);
            let elife = 0.7 + Math.random() * 0.3;
            const explode = () => { elife -= 0.025; ep.material.opacity = Math.max(0, elife); ep.position.x += evx * 0.016; ep.position.y += evy * 0.016; ep.position.z += evz * 0.016; evy -= 3; ep.scale.multiplyScalar(0.96); if (elife <= 0) { scene.remove(ep); ep.geometry.dispose(); ep.material.dispose(); } else requestAnimationFrame(explode); };
            requestAnimationFrame(explode);
            setTimeout(() => { try { scene.remove(ep); ep.geometry.dispose(); ep.material.dispose(); } catch (e) {} }, 3000);
          }
          trailParts.forEach(t => { scene.remove(t.mesh); t.mesh.geometry.dispose(); t.mesh.material.dispose(); });
        } else requestAnimationFrame(fall);
      };
      setTimeout(fall, delay);
    }
    const shakeBaseX = cam.position.x, shakeBaseZ = cam.position.z;
    let shakeT = 0;
    const shake = () => { shakeT += 0.03; cam.position.x = shakeBaseX + (Math.random() - 0.5) * 3 * (1 - shakeT); cam.position.z = shakeBaseZ + (Math.random() - 0.5) * 3 * (1 - shakeT); if (shakeT < 1) requestAnimationFrame(shake); else { cam.position.x = shakeBaseX; cam.position.z = shakeBaseZ; } };
    shake();
  }
  if (msg.type === 'botsToggled') {
    document.getElementById('botsCheck').checked = msg.enabled;
    S.killfeed.unshift({ txt: 'Bots ' + (msg.enabled ? 'enabled' : 'disabled'), t: 3 });
  }
  if (msg.type === 'dash') {
    const dasher = S.serverPlayers.find(p => p.id === msg.playerId);
    if (dasher) {
      for (let i = 0; i < 15; i++) {
        const sm = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 4, 5, 5), new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 }));
        const th = getTerrainHeight(dasher.x, dasher.y);
        sm.position.set(dasher.x + (Math.random() - 0.5) * 20, th + 5 + Math.random() * 15, dasher.y + (Math.random() - 0.5) * 20);
        scene.add(sm);
        let life = 0.8 + Math.random() * 0.4;
        const anim = () => { life -= 0.02; sm.material.opacity = life * 0.5; sm.scale.multiplyScalar(1.03); sm.position.y += 0.5; if (life <= 0) { scene.remove(sm); sm.geometry.dispose(); sm.material.dispose(); } else requestAnimationFrame(anim); };
        requestAnimationFrame(anim);
        setTimeout(() => { try { scene.remove(sm); sm.geometry.dispose(); sm.material.dispose(); } catch (e) {} }, 3000);
      }
    }
    sfx(300, 0.15, 'sine', 0.08);
  }
  if (msg.type === 'bump') {
    if (msg.a === S.myId || msg.b === S.myId) { sfxBump(); document.getElementById('hitFlash').style.opacity = '0.2'; setTimeout(() => document.getElementById('hitFlash').style.opacity = '0', 100); }
  }
  if (msg.type === 'weaponPickup') {
    S.clientWeapons = S.clientWeapons.filter(w => w.id !== msg.pickupId);
    const _wn = { shotgun: 'Benelli', burst: 'LR-300', bolty: 'L96', cowtank: 'LAW' };
    const wpName = _wn[msg.weapon] || msg.weapon || 'weapon';
    if (msg.playerId === S.myId) S.killfeed.unshift({ txt: 'Picked up ' + wpName + '!', t: 3 });
    else S.killfeed.unshift({ txt: (msg.name || '?') + ' picked up ' + wpName, t: 3 });
  }
  if (msg.type === 'weaponSpawn') { S.clientWeapons.push({ id: msg.id, x: msg.x, y: msg.y, weapon: msg.weapon }); }
  if (msg.type === 'weaponDrop') {
    if (msg.playerId === S.myId) S.killfeed.unshift({ txt: 'Dropped weapon', t: 3 });
    else S.killfeed.unshift({ txt: (msg.name || '?') + ' dropped their weapon', t: 3 });
  }
  if (msg.type === 'armorPickup') {
    if (window._armorMeshes && window._armorMeshes[msg.pickupId]) { scene.remove(window._armorMeshes[msg.pickupId]); delete window._armorMeshes[msg.pickupId]; }
    if (window._armorPickupData) window._armorPickupData = window._armorPickupData.filter(a => a.id !== msg.pickupId);
    if (msg.playerId === S.myId) S.killfeed.unshift({ txt: 'Picked up armor (+25)', t: 3 });
  }
  if (msg.type === 'armorSpawn') {
    if (!window._armorPickupData) window._armorPickupData = [];
    window._armorPickupData.push({ id: msg.id, x: msg.x, y: msg.y });
  }
}

// Game loop
let last = performance.now();
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min((ts - last) / 1000, 0.1); last = ts;
  const time = ts / 1000;

  const me = S.serverPlayers.find(p => p.id === S.myId);
  updateHud(me, time, dt);

  if (S.state !== 'playing') { ren.render(scene, cam); return; }
  tickMusic();

  const now = Date.now();
  // Free camera spectate mode
  if ((!me || !me.alive) && S.state === 'playing') {
    const fwd = new THREE.Vector3(0, 0, -1); fwd.applyQuaternion(cam.quaternion);
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const spd = 300 * dt;
    if (S.keys['KeyW'] || S.keys['ArrowUp']) { cam.position.x += fwd.x * spd; cam.position.z += fwd.z * spd; }
    if (S.keys['KeyS'] || S.keys['ArrowDown']) { cam.position.x -= fwd.x * spd; cam.position.z -= fwd.z * spd; }
    if (S.keys['KeyA'] || S.keys['ArrowLeft']) { cam.position.x -= right.x * spd; cam.position.z -= right.z * spd; }
    if (S.keys['KeyD'] || S.keys['ArrowRight']) { cam.position.x += right.x * spd; cam.position.z += right.z * spd; }
    if (S.keys['Space']) { cam.position.y += spd; }
    if (S.keys['ShiftLeft'] || S.keys['ShiftRight']) { cam.position.y -= spd; }
  }

  if (me && me.alive && now - S.lastMoveMsg > 50) {
    S.lastMoveMsg = now;
    const fwd = new THREE.Vector3(0, 0, -1);
    fwd.applyQuaternion(cam.quaternion);
    fwd.y = 0; if (fwd.length() > 0.01) fwd.normalize(); else fwd.set(0, 0, -1);
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    let mx = 0, mz = 0;
    if (S.keys['KeyW'] || S.keys['ArrowUp']) { mx += fwd.x; mz += fwd.z; }
    if (S.keys['KeyS'] || S.keys['ArrowDown']) { mx -= fwd.x; mz -= fwd.z; }
    if (S.keys['KeyA'] || S.keys['ArrowLeft']) { mx -= right.x; mz -= right.z; }
    if (S.keys['KeyD'] || S.keys['ArrowRight']) { mx += right.x; mz += right.z; }
    const len = Math.hypot(mx, mz);
    if (len > 0) { send({ type: 'move', dx: mx / len, dy: mz / len }); S.pingLast = performance.now(); }
    else send({ type: 'move', dx: 0, dy: 0 });
  }

  // Jump
  S.jumpH += S.jumpVel * dt; S.jumpVel -= 350 * dt; if (S.jumpH < 0) { S.jumpH = 0; S.jumpVel = 0; }

  // Camera follows player
  if (me && me.alive) {
    cam.position.x += (me.x - cam.position.x) * 0.15;
    cam.position.z += (me.y - cam.position.z) * 0.15;
  }
  if (me && me.alive) {
    const terrainH = getTerrainHeight(me.x, me.y);
    const towerBoost = getTowerHeight(me.x, me.y);
    cam.position.y += (CH + S.jumpH + terrainH + towerBoost - cam.position.y) * 0.2;
  }
  cam.quaternion.setFromEuler(new THREE.Euler(S.pitch, S.yaw, 0, 'YXZ'));
  sun.position.set(cam.position.x + 300, 400, cam.position.z + 200);
  sun.target.position.set(cam.position.x, 0, cam.position.z);
  sun.target.updateMatrixWorld();

  buildMap();
  buildTowerIfNeeded();
  updateZone();
  updateViewmodel();
  sky.position.copy(cam.position);
  cloudPlanes.forEach(c => { c.position.x = c.userData.origX + Math.sin(time * 0.05 * c.userData.speed) * 200; });

  updatePickups(time);
  updateCows(time);
  updateProjectiles(dt);

  ren.render(scene, cam);
  const vmGroup = getVmGroup();
  if (vmGroup && S.state === 'playing') {
    ren.autoClear = false;
    ren.clearDepth();
    ren.render(vmScene, vmCam);
    ren.autoClear = true;
  }
}

setMessageHandler(handleMsg);
connect();
requestAnimationFrame(loop);
