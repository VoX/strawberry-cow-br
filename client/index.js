import * as THREE from 'three';
import { MW, MH, CH } from './config.js';
import S from './state.js';
import { initAudio, sfx, sfxShoot, sfxBolty, sfxShotgun, sfxRocket, sfxLR, sfxExplosion, sfxHit, sfxEat, sfxLevelUp, sfxDeath, sfxBump, sfxEmptyMag, sfxReloadLR, sfxReloadBolty, sfxShellLoad, tickMusic, setMusicPlaying, resetMusic, getAudioCtx, startMenuMusic, stopMenuMusic, initMusic, updateMusicMood } from './audio.js';
import { scene, cam, ren, sun, sky, cloudPlanes, vmScene, vmCam } from './renderer.js';
import { getTerrainHeight, rebuildTerrain } from './terrain.js';
import { setVmGroupRef } from './input.js';
import { connect, send, setMessageHandler } from './network.js';
import './ui.js';
import { showPerkMenu } from './ui.js';
import { spawnParts, updateCows } from './entities.js';
import { buildMap, buildTowerIfNeeded, addBarricade, removeBarricade, clearBarricades } from './map-objects.js';
import { getVmGroup, updateViewmodel } from './weapons-view.js';
import { updatePickups } from './pickups.js';
import { updateProjectiles, clearRocketSounds, clearSmokeParticles } from './projectiles.js';
import { updateZone } from './zone.js';
import { updateHud } from './hud.js';

// Wire up viewmodel group ref for input.js ADS toggle
setVmGroupRef(getVmGroup);

// Pool for explosion debris particles
const debrisPool = [];

function handleMsg(msg) {
  if (msg.type === 'joined') {
    S.myId = msg.id; S.myColor = msg.color; S.state = 'lobby';
    S.hostId = msg.hostId;
    window.kickPlayer = (id) => { send({ type: 'kick', targetId: id }); };
    document.getElementById('joinScreen').querySelector('h2').textContent = 'Waiting for cows...';
    document.getElementById('botsCheck').checked = msg.botsEnabled;
    document.getElementById('botsFreeWillCheck').checked = msg.botsFreeWill;
    initAudio(); startMenuMusic();
  }
  if (msg.type === 'newHost') {
    S.hostId = msg.hostId;
  }
  if (msg.type === 'kicked') {
    document.getElementById('joinScreen').style.display = 'flex';
    document.getElementById('joinScreen').querySelector('h2').textContent = 'You were kicked from the lobby';
    if (S.ws) try { S.ws.close(); } catch(e) {}
  }
  if (msg.type === 'lobby') {
    const cd = msg.countdown > 0 ? (' (' + msg.countdown + 's)') : '';
    const readyTxt = msg.allReady ? 'All ready! Starting' + cd : 'Waiting for cows to ready up';
    if (!S._botRevealTime) S._botRevealTime = Date.now() + 3000;
    const botsRevealed = Date.now() > S._botRevealTime;
    const colMap = {pink:'#ff88aa',blue:'#88aaff',green:'#88ff88',gold:'#ffdd44',purple:'#cc88ff',red:'#ff4444',orange:'#ff8844',cyan:'#44ffdd'};
    const isHost = S.hostId === S.myId;
    const pList = msg.players.map(p => {
      if (p.isBot && !botsRevealed) return '<div style="color:#ff8888;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#555;margin-right:6px;vertical-align:middle"></span><span style="display:inline-block;width:120px;text-align:left">Connecting<span style="display:inline-block;width:18px;text-align:left">' + '.'.repeat(1 + Math.floor(Date.now() / 500) % 3) + '</span></span> ⏳</div>';
      const dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (colMap[p.color] || '#aaa') + ';margin-right:6px;vertical-align:middle"></span>';
      const crown = (p.id === S.hostId && !p.isBot) ? ' 👑' : '';
      const canKick = isHost && !p.isBot && p.id !== S.myId;
      const kickBtn = canKick ? ' <span onclick="window.kickPlayer(' + p.id + ')" style="cursor:pointer;color:#ff4444;float:right;font-weight:bold" title="Kick">✕</span>' : '';
      return '<div style="color:' + (p.ready ? '#88ff88' : '#ff8888') + ';padding:2px 0">' + dot + (p.name || '?') + crown + (p.isBot ? ' 🤖' : (p.ready ? ' \u2714' : ' ...')) + kickBtn + '</div>';
    }).join('');
    document.getElementById('joinScreen').querySelector('h2').innerHTML = readyTxt + '<div style="margin-top:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(204,136,255,0.3);border-radius:8px;padding:8px 16px;font-size:13px;max-height:200px;overflow-y:auto;width:260px;text-align:left">' + pList + '</div>';
    if (!document.getElementById('readyBtn')) {
      const rb = document.createElement('button'); rb.id = 'readyBtn'; rb.textContent = 'READY TO GRAZE';
      rb.style.cssText = 'padding:8px 30px;font-size:18px;border:none;border-radius:8px;background:#44ff44;color:#000;cursor:pointer;font-weight:bold;margin-top:10px;width:220px';
      rb.onclick = () => { send({ type: 'ready' }); };
      document.getElementById('joinScreen').appendChild(rb);
    }
    const me2 = msg.players.find(p => p.name && S.myId && p.id === S.myId) || msg.players.find(p => p.ready !== undefined);
    const rb2 = document.getElementById('readyBtn');
    if (rb2 && S.myId) {
      const myLobby = msg.players.find(p => p.id === S.myId);
      if (myLobby) {
        if (myLobby.ready) { rb2.textContent = 'UNREADY \u2714'; rb2.style.background = '#88ff88'; }
        else { rb2.textContent = 'READY TO GRAZE'; rb2.style.background = '#44ff44'; }
      }
    }
  }
  if (msg.type === 'spectate') {
    if (msg.terrainSeed !== undefined) rebuildTerrain(msg.terrainSeed);
    S.state = 'playing';
    document.getElementById('joinScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    S.serverPlayers = msg.players;
    S.serverFoods = (msg.foods || []).map(f => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
    if (msg.zone) S.serverZone = msg.zone;
    if (msg.map) { S.mapFeatures = msg.map; S.mapBuilt = false; }
    if (msg.weapons) S.clientWeapons = msg.weapons;
    if (msg.armorPickups) window._armorPickupData = msg.armorPickups;
    clearBarricades();
    if (msg.barricades) msg.barricades.forEach(b => addBarricade(b));
  }
  if (msg.type === 'start') {
    if (msg.terrainSeed !== undefined) rebuildTerrain(msg.terrainSeed);
    S.state = 'playing';
    document.getElementById('joinScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    S.serverPlayers = msg.players;
    S.serverFoods = (msg.foods || []).map(f => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
    if (msg.zone) S.serverZone = msg.zone;
    if (msg.map) { S.mapFeatures = msg.map; S.mapBuilt = false; }
    if (msg.weapons) S.clientWeapons = msg.weapons;
    S.killfeed = []; stopMenuMusic(); resetMusic(); initMusic(); setMusicPlaying(true);
    S.spectateTargetId = null; S.killerId = null; S.killerName = null;
    S.barricadeReadyAt = 0;
    clearBarricades();
    if (msg.barricades) msg.barricades.forEach(b => addBarricade(b));
    window._armorPickupData = msg.armorPickups || [];
    document.getElementById('winScreen').style.display = 'none';
    for (const id in S.cowMeshes) { scene.remove(S.cowMeshes[id].mesh); } S.cowMeshes = {};
    if (window._foodMeshes) { for (const id in window._foodMeshes) { const m = window._foodMeshes[id]; scene.remove(m); m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); } window._foodMeshes = {}; }
    if (window._wpMeshes) { for (const id in window._wpMeshes) { const g = window._wpMeshes[id]; scene.remove(g); g.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); } }); } window._wpMeshes = {}; }
    if (window._armorMeshes) { for (const id in window._armorMeshes) { const m = window._armorMeshes[id]; scene.remove(m); m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); } window._armorMeshes = {}; }
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
    let vy3d = msg.vz || 0, spawnH = msg.z || (15 + getTerrainHeight(msg.x, msg.y));
    let spawnX = msg.x, spawnZ = msg.y;
    if (msg.ownerId === S.myId) {
      spawnH = cam.position.y;
      spawnX = cam.position.x;
      spawnZ = cam.position.z;
    }
    if (msg.shotgun !== undefined) { vy3d += (Math.random() - 0.5) * 150; }
    S.projData.push({ id: msg.id, x: spawnX, y: spawnZ, vx: msg.vx, vy: msg.vy, color: msg.color || 'pink', bolty: msg.bolty, cowtank: msg.cowtank, y3d: spawnH, vy3d });
    if (msg.ownerId !== S.myId) {
      // Distance-based weapon sound for other players
      const dist = Math.hypot(msg.x - cam.position.x, msg.y - cam.position.z);
      const distVol = Math.max(0.01, 1 / (1 + dist * 0.005));
      if (msg.bolty) sfx(800, 0.25, 'sawtooth', 0.1 * distVol);
      else if (msg.cowtank) sfxRocket(0.12 * distVol);
      else if (msg.shotgun !== undefined) sfxShotgun(0.1 * distVol);
      else if (msg.burst !== undefined) sfxLR(0.1 * distVol);
      else sfx(400, 0.12, 'square', 0.08 * distVol);
    }
    if (msg.ownerId === S.myId) {
      const me = S.serverPlayers.find(p => p.id === S.myId);
      const myWep = me ? me.weapon : 'normal';
      // Skip extra shotgun pellets (only first pellet plays sound), but play each burst round
      if (msg.shotgun === false) { /* skip extra pellets */ }
      else if (myWep === 'bolty' || msg.bolty) sfxBolty();
      else if (myWep === 'cowtank' || msg.cowtank) sfxRocket(0.12);
      else if (msg.shotgun === true) sfxShotgun(0.1);
      else if (myWep === 'shotgun') sfxShotgun(0.1);
      else if (myWep === 'burst' || msg.burst !== undefined) sfxLR(0.1);
      else sfxShoot();
      // Apply recoil
      const wep = myWep;
      const recoilPatterns = {
        burst: [ // LR-300: snake pattern upward
          { p: 0.012, y: 0.003 }, { p: 0.014, y: 0.006 }, { p: 0.011, y: 0.004 },
          { p: 0.013, y: -0.003 }, { p: 0.015, y: -0.006 }, { p: 0.012, y: -0.004 },
          { p: 0.010, y: 0.005 }, { p: 0.014, y: 0.007 }, { p: 0.012, y: 0.003 },
          { p: 0.013, y: -0.005 }, { p: 0.016, y: -0.007 }, { p: 0.011, y: -0.003 },
          { p: 0.010, y: 0.004 }, { p: 0.013, y: 0.006 }, { p: 0.012, y: 0.002 },
          { p: 0.014, y: -0.004 }, { p: 0.015, y: -0.006 }, { p: 0.011, y: -0.002 },
          { p: 0.010, y: 0.005 }, { p: 0.013, y: 0.007 }, { p: 0.012, y: 0.003 },
          { p: 0.014, y: -0.005 }, { p: 0.016, y: -0.007 }, { p: 0.011, y: -0.003 },
          { p: 0.010, y: 0.004 }, { p: 0.013, y: 0.006 }, { p: 0.012, y: 0.002 },
          { p: 0.014, y: -0.004 }, { p: 0.015, y: -0.005 }, { p: 0.011, y: -0.002 },
        ],
        shotgun: [ // Benelli: strong kick up
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
        ],
        bolty: [ // L96: big single kick
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
        ],
        cowtank: [ // M72 LAW: massive kick
          { p: 0.15, y: (Math.random()-0.5)*0.03 },
        ],
        normal: [ // Spit: small kick
          { p: 0.008, y: (Math.random()-0.5)*0.004 },
        ],
      };
      const pattern = recoilPatterns[wep];
      if (pattern) {
        const now = performance.now();
        if (now - S.recoilTimer > 500) S.recoilIndex = 0;
        S.recoilTimer = now;
        const r = pattern[S.recoilIndex % pattern.length];
        const burstMod = (wep === 'burst' && S.fireMode === 'burst') ? 0.5 : 1;
        const tacticowMod = me.recoilMult || 1;
        const walkingMod = S.crouching ? 0.73 : 1;
        const recoilMult = burstMod * tacticowMod * walkingMod;
        S.pitch += r.p * recoilMult;
        S.yaw += r.y * recoilMult;
        S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch));
        S.recoilIndex++;
      }
    }
  }
  if (msg.type === 'wallImpact') {
    // L96 wall penetration spark
    const th = getTerrainHeight(msg.x, msg.y);
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.8, 3, 3), new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true }));
      sp.position.set(msg.x + (Math.random()-0.5)*8, (msg.z || th + 30) + (Math.random()-0.5)*8, msg.y + (Math.random()-0.5)*8);
      scene.add(sp);
      let sl = 0.4;
      const svx = (Math.random()-0.5)*40, svy = (Math.random()-0.5)*40, svz = (Math.random()-0.5)*40;
      const sAnim = () => { sl -= 0.03; sp.material.opacity = sl; sp.position.x += svx*0.016; sp.position.y += svy*0.016; sp.position.z += svz*0.016; if (sl <= 0) { scene.remove(sp); sp.geometry.dispose(); sp.material.dispose(); } else requestAnimationFrame(sAnim); };
      requestAnimationFrame(sAnim);
    }
  }
  if (msg.type === 'projectileHit') {
    S.projData = S.projData.filter(p => p.id !== msg.projectileId);
    if (S.projMeshes[msg.projectileId]) { const pm = S.projMeshes[msg.projectileId]; scene.remove(pm); pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); delete S.projMeshes[msg.projectileId]; }
    if (msg.targetId === S.myId) { sfxHit(); document.getElementById('hitFlash').style.opacity = '0.5'; setTimeout(() => document.getElementById('hitFlash').style.opacity = '0', 150); }
    // Hitmarker for attacker
    if (msg.targetId && msg.ownerId === S.myId && msg.targetId !== S.myId) {
      sfx(600, 0.06, 'square', 0.07);
      const ch = document.getElementById('crosshair');
      if (ch) {
        ch.style.width = '12px'; ch.style.height = '12px';
        ch.style.background = 'transparent';
        ch.style.boxShadow = 'none';
        ch.style.border = '2px solid #ffffff';
        ch.style.borderRadius = '0';
        setTimeout(() => { ch.style.width = '4px'; ch.style.height = '4px'; ch.style.background = '#ff88aa'; ch.style.boxShadow = '0 0 6px #ff88aa'; ch.style.border = 'none'; ch.style.borderRadius = '50%'; }, 150);
      }
    }
    // Headshot indicator for attacker — red hitmarker
    if (msg.headshot && msg.ownerId === S.myId) {
      sfx(1200, 0.15, 'sine', 0.08); sfx(1800, 0.1, 'sine', 0.06);
      const ch = document.getElementById('crosshair');
      if (ch) {
        ch.style.width = '20px'; ch.style.height = '20px';
        ch.style.background = 'transparent';
        ch.style.boxShadow = 'none';
        ch.style.border = '3px solid #ff2222';
        ch.style.borderRadius = '0';
        setTimeout(() => { ch.style.width = '4px'; ch.style.height = '4px'; ch.style.background = '#ff88aa'; ch.style.boxShadow = '0 0 6px #ff88aa'; ch.style.border = 'none'; ch.style.borderRadius = '50%'; }, 250);
      }
    }
    // Floating damage number
    if (msg.targetId && msg.dmg) {
      const target = S.serverPlayers.find(p => p.id === msg.targetId);
      if (target) {
        const dmg = msg.dmg;
        const hasShield = target.armor > 0;
        const color = msg.headshot ? '#ff2222' : hasShield ? '#44aaff' : dmg >= 25 ? '#ff4444' : dmg >= 10 ? '#ffaa44' : '#ffffff';
        const nc = document.createElement('canvas'); nc.width = 128; nc.height = 48;
        const ctx = nc.getContext('2d');
        ctx.font = 'bold ' + (dmg >= 25 ? 36 : dmg >= 10 ? 28 : 22) + 'px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(dmg, 65, 35);
        ctx.fillStyle = color; ctx.fillText(dmg, 64, 34);
        const tex = new THREE.CanvasTexture(nc); tex.minFilter = THREE.LinearFilter;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        const tz = target.z !== undefined ? target.z : getTerrainHeight(target.x, target.y);
        sprite.position.set(target.x + (Math.random()-0.5)*20, tz + 40 + Math.random()*10, target.y + (Math.random()-0.5)*20);
        sprite.scale.set(80, 32, 1);
        scene.add(sprite);
        let life = 1.5;
        const vy = 8 + Math.random() * 6;
        const vx = (Math.random() - 0.5) * 15;
        const vz = (Math.random() - 0.5) * 15;
        const anim = () => { life -= 0.012; mat.opacity = Math.max(0, life); sprite.position.y += vy * 0.016; sprite.position.x += vx * 0.016; sprite.position.z += vz * 0.016; if (life <= 0) { scene.remove(sprite); tex.dispose(); mat.dispose(); } else requestAnimationFrame(anim); };
        requestAnimationFrame(anim);
        setTimeout(() => { try { scene.remove(sprite); tex.dispose(); mat.dispose(); } catch(e){} }, 2000);
      }
    }
  }
  if (msg.type === 'explosion') {
    const ex = msg.x, ey = msg.y, er = msg.radius || 120;
    const th = getTerrainHeight(ex, ey);
    // Explosion sphere
    const expMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.6 });
    const exp = new THREE.Mesh(new THREE.SphereGeometry(er * 0.3, 12, 12), expMat);
    exp.position.set(ex, th + 10, ey); scene.add(exp);
    let expLife = 0.5;
    const expAnim = () => { expLife -= 0.02; expMat.opacity = expLife * 0.6; exp.scale.multiplyScalar(1.06); if (expLife <= 0) { scene.remove(exp); exp.geometry.dispose(); expMat.dispose(); } else requestAnimationFrame(expAnim); };
    requestAnimationFrame(expAnim);
    setTimeout(() => { try { scene.remove(exp); exp.geometry.dispose(); expMat.dispose(); } catch(e){} }, 2000);
    // Shockwave ring
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(er * 0.15, 3, 6, 24), ringMat);
    ring.position.set(ex, th + 5, ey); ring.rotation.x = Math.PI / 2; scene.add(ring);
    let ringLife = 0.4;
    const ringAnim = () => { ringLife -= 0.02; ringMat.opacity = ringLife; ring.scale.multiplyScalar(1.1); if (ringLife <= 0) { scene.remove(ring); ring.geometry.dispose(); ringMat.dispose(); } else requestAnimationFrame(ringAnim); };
    requestAnimationFrame(ringAnim);
    setTimeout(() => { try { scene.remove(ring); ring.geometry.dispose(); ringMat.dispose(); } catch(e){} }, 2000);
    // Debris particles (pooled)
    for (let i = 0; i < 20; i++) {
      let dp;
      if (debrisPool.length > 0) {
        dp = debrisPool.pop();
        dp.material.color.setHex(Math.random() > 0.3 ? 0xff4400 : 0xffdd00);
        dp.material.opacity = 1;
        dp.scale.set(1, 1, 1);
        dp.visible = true;
      } else {
        const col = Math.random() > 0.3 ? 0xff4400 : 0xffdd00;
        dp = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 2, 4, 4), new THREE.MeshBasicMaterial({ color: col, transparent: true }));
      }
      const dvx = (Math.random() - 0.5) * 150, dvz = (Math.random() - 0.5) * 150;
      let dvy = 40 + Math.random() * 80;
      dp.position.set(ex, th + 8, ey); scene.add(dp);
      let dlife = 0.6 + Math.random() * 0.4;
      const debrisAnim = () => { dlife -= 0.02; dp.material.opacity = Math.max(0, dlife); dp.position.x += dvx * 0.016; dp.position.y += dvy * 0.016; dp.position.z += dvz * 0.016; dvy -= 4; dp.scale.multiplyScalar(0.97); if (dlife <= 0) { scene.remove(dp); dp.visible = false; if (debrisPool.length > 100) { dp.geometry.dispose(); dp.material.dispose(); } else { debrisPool.push(dp); } } else requestAnimationFrame(debrisAnim); };
      requestAnimationFrame(debrisAnim);
    }
    // Explosion sound
    sfxExplosion(0.15);
  }
  if (msg.type === 'eliminated') {
    S.killfeed.unshift({ txt: msg.name + ' eliminated (#' + (msg.rank || '?') + ')', t: 5 });
    if (S.killfeed.length > 5) S.killfeed.pop();
    if (msg.playerId === S.myId) {
      sfxDeath();
      // Hide perk menu on death
      S.perkMenuOpen = false;
      S.pendingLevelUps = 0;
      const pm = document.getElementById('perkMenu'); if (pm) pm.style.display = 'none';
      // If we have a tracked killer, lock spectate to them. Otherwise pick any alive player.
      if (S.killerId) S.spectateTargetId = S.killerId;
      else {
        const firstAlive = S.serverPlayers.find(p => p.alive && p.id !== S.myId);
        if (firstAlive) S.spectateTargetId = firstAlive.id;
      }
    }
  }
  if (msg.type === 'chat') {
    S.chatLog.push({ name: msg.name, color: msg.color, text: msg.text, t: 10 });
    if (S.chatLog.length > 6) S.chatLog.shift();
  }
  if (msg.type === 'barricadePlaced') {
    addBarricade({ id: msg.id, cx: msg.cx, cy: msg.cy, w: msg.w, h: msg.h, angle: msg.angle });
    if (msg.ownerId === S.myId) {
      S.barricadeReadyAt = performance.now() + 5000;
      sfx(200, 0.08, 'square', 0.08); sfx(150, 0.12, 'triangle', 0.06);
    }
  }
  if (msg.type === 'barricadeDestroyed') {
    removeBarricade(msg.id);
    sfx(300, 0.08, 'square', 0.05); sfx(150, 0.15, 'sawtooth', 0.04);
  }
  if (msg.type === 'kill') {
    S.killfeed.unshift({ txt: '\u{1F480} ' + (msg.killerName || '?') + ' \u2192 ' + (msg.victimName || '?'), t: 5 });
    if (S.killfeed.length > 5) S.killfeed.pop();
    if (msg.victimId === S.myId) {
      S.killerId = msg.killerId;
      S.killerName = msg.killerName;
      S.spectateTargetId = msg.killerId;
    }
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
    document.getElementById('joinScreen').querySelector('h2').textContent = 'Waiting for cows...';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('winScreen').style.display = 'none';
    // Flush all game state
    for (const id in S.cowMeshes) {
      const obj = S.cowMeshes[id];
      scene.remove(obj.mesh);
      obj.mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); } });
      if (obj.hpSprite) obj.hpSprite.tex.dispose();
      if (obj.shieldBubble) { obj.shieldBubble.geometry.dispose(); obj.shieldBubble.material.dispose(); }
      if (obj.spawnBubble) { obj.spawnBubble.geometry.dispose(); obj.spawnBubble.material.dispose(); }
    }
    S.cowMeshes = {};
    for (const id in S.projMeshes) {
      const pm = S.projMeshes[id];
      scene.remove(pm);
      pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    }
    S.projMeshes = {};
    S.projData = [];
    if (window._foodMeshes) { for (const id in window._foodMeshes) { const m = window._foodMeshes[id]; scene.remove(m); m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); } window._foodMeshes = {}; }
    if (window._wpMeshes) { for (const id in window._wpMeshes) { const g = window._wpMeshes[id]; scene.remove(g); g.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); } }); } window._wpMeshes = {}; }
    if (window._armorMeshes) { for (const id in window._armorMeshes) { const m = window._armorMeshes[id]; scene.remove(m); m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); } window._armorMeshes = {}; }
    clearRocketSounds();
    clearSmokeParticles();
    S.serverPlayers = [];
    S.serverFoods = [];
    S.clientWeapons = [];
    S.killfeed = [];
    S.mapBuilt = false;
    S.pendingLevelUps = 0;
    S.perkMenuOpen = false;
    S.spectateTargetId = null; S.killerId = null; S.killerName = null;
    S.barricadeReadyAt = 0;
    clearBarricades();
    S._botRevealTime = null;
    document.getElementById('perkMenu').style.display = 'none';
    const oldRb = document.getElementById('readyBtn'); if (oldRb) oldRb.remove();
    startMenuMusic();
  }
  if (msg.type === 'levelup') {
    // Skip if spectating (not alive)
    const meCheck = S.serverPlayers.find(p => p.id === S.myId);
    if (!meCheck || !meCheck.alive) return;
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
      const cv = 0.06 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(cv, t + 0.2);
      g.gain.setValueAtTime(cv, t + 2.5); g.gain.linearRampToValueAtTime(0, t + 3);
      o.connect(g); g.connect(getAudioCtx().destination); o.start(t); o.stop(t + 3);
    }
  }
  if (msg.type === 'cowstrike') {
    S.killfeed.unshift({ txt: '\u{1F4A5} COWSTRIKE WAVE ' + (((msg.wave || 0) + 1)) + '!', t: 4 });
    const amAffected = msg.affectedIds && msg.affectedIds.indexOf(S.myId) >= 0;
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const bs = getAudioCtx().sampleRate * 0.3, b = getAudioCtx().createBuffer(1, bs, getAudioCtx().sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 3);
      const n = getAudioCtx().createBufferSource(); n.buffer = b; const ng = getAudioCtx().createGain();
      const sv = 0.08 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
      ng.gain.setValueAtTime(sv, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      n.connect(ng); ng.connect(getAudioCtx().destination); n.start(t); n.stop(t + 0.4);
      sfx(60, 0.4, 'sine', 0.08);
    }
    if (amAffected) {
      document.getElementById('hitFlash').style.background = 'rgba(255,100,0,0.5)';
      document.getElementById('hitFlash').style.opacity = '0.6';
      setTimeout(() => { document.getElementById('hitFlash').style.opacity = '0'; document.getElementById('hitFlash').style.background = 'rgba(255,0,0,0.3)'; }, 500);
    }
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
  if (msg.type === 'botsFreeWillToggled') {
    document.getElementById('botsFreeWillCheck').checked = msg.enabled;
    S.killfeed.unshift({ txt: 'Bot free will ' + (msg.enabled ? 'granted' : 'revoked'), t: 3 });
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
    const _wn = { shotgun: 'Benelli', burst: 'M16A2', bolty: 'L96', cowtank: 'M72 LAW' };
    const wpName = _wn[msg.weapon] || msg.weapon || 'weapon';
    if (msg.playerId === S.myId) S.killfeed.unshift({ txt: 'Picked up ' + wpName + '!', t: 3 });
    else S.killfeed.unshift({ txt: (msg.name || '?') + ' picked up ' + wpName, t: 3 });
  }
  if (msg.type === 'weaponSpawn') { S.clientWeapons.push({ id: msg.id, x: msg.x, y: msg.y, weapon: msg.weapon }); }
  if (msg.type === 'weaponDrop') {
    if (msg.playerId === S.myId) S.killfeed.unshift({ txt: 'Dropped weapon', t: 3 });
    else S.killfeed.unshift({ txt: (msg.name || '?') + ' dropped their weapon', t: 3 });
  }
  if (msg.type === 'reloaded' && msg.playerId === S.myId) {
    S.killfeed.unshift({ txt: 'Reloaded!', t: 1.5 });
    if (msg.weapon === 'burst') sfxReloadLR();
    else if (msg.weapon === 'bolty') sfxReloadBolty();
    else if (msg.weapon === 'shotgun') sfxShellLoad();
  }
  if (msg.type === 'shellLoaded' && msg.playerId === S.myId) {
    sfxShellLoad();
  }
  if (msg.type === 'emptyMag') {
    sfxEmptyMag();
  }
  if (msg.type === 'armorPickup') {
    if (window._armorMeshes && window._armorMeshes[msg.pickupId]) { scene.remove(window._armorMeshes[msg.pickupId]); delete window._armorMeshes[msg.pickupId]; }
    if (window._armorPickupData) window._armorPickupData = window._armorPickupData.filter(a => a.id !== msg.pickupId);
    if (msg.playerId === S.myId) S.killfeed.unshift({ txt: 'Picked up shield (+25)', t: 3 });
  }
  if (msg.type === 'armorSpawn') {
    if (!window._armorPickupData) window._armorPickupData = [];
    window._armorPickupData.push({ id: msg.id, x: msg.x, y: msg.y });
  }
  if (msg.type === 'shieldHit') {
    const th = getTerrainHeight(msg.x, msg.y);
    // Blue flash particles
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(1 + Math.random() * 2, 4, 4), new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.7 }));
      sp.position.set(msg.x + (Math.random() - 0.5) * 30, th + 10 + Math.random() * 20, msg.y + (Math.random() - 0.5) * 30);
      scene.add(sp);
      let life = 0.3 + Math.random() * 0.2;
      const anim = () => { life -= 0.02; sp.material.opacity = life * 2; sp.scale.multiplyScalar(0.95); if (life <= 0) { scene.remove(sp); sp.geometry.dispose(); sp.material.dispose(); } else requestAnimationFrame(anim); };
      requestAnimationFrame(anim);
      setTimeout(() => { try { scene.remove(sp); sp.geometry.dispose(); sp.material.dispose(); } catch(e){} }, 1500);
    }
    sfx(800, 0.1, 'sine', 0.05);
  }
  if (msg.type === 'shieldBreak') {
    const th = getTerrainHeight(msg.x, msg.y);
    // Shield break explosion — expanding blue ring + particles
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 1.5, 6, 20), ringMat);
    ring.position.set(msg.x, th + 14, msg.y); ring.rotation.x = Math.PI / 2; scene.add(ring);
    let ringLife = 0.4;
    const ringAnim = () => { ringLife -= 0.015; ringMat.opacity = ringLife; ring.scale.multiplyScalar(1.12); if (ringLife <= 0) { scene.remove(ring); ring.geometry.dispose(); ringMat.dispose(); } else requestAnimationFrame(ringAnim); };
    requestAnimationFrame(ringAnim);
    setTimeout(() => { try { scene.remove(ring); ring.geometry.dispose(); ringMat.dispose(); } catch(e){} }, 2000);
    // Blue shard particles
    for (let i = 0; i < 15; i++) {
      const shard = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.5), new THREE.MeshBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0.8 }));
      shard.position.set(msg.x, th + 14, msg.y); scene.add(shard);
      const vx = (Math.random() - 0.5) * 120, vz = (Math.random() - 0.5) * 120; let vy = 30 + Math.random() * 60;
      let life = 0.6 + Math.random() * 0.3;
      const shardAnim = () => { life -= 0.02; shard.material.opacity = Math.max(0, life); shard.position.x += vx * 0.016; shard.position.y += vy * 0.016; shard.position.z += vz * 0.016; vy -= 3; shard.rotation.x += 0.2; shard.rotation.z += 0.15; if (life <= 0) { scene.remove(shard); shard.geometry.dispose(); shard.material.dispose(); } else requestAnimationFrame(shardAnim); };
      requestAnimationFrame(shardAnim);
      setTimeout(() => { try { scene.remove(shard); shard.geometry.dispose(); shard.material.dispose(); } catch(e){} }, 3000);
    }
    sfx(400, 0.15, 'triangle', 0.1); sfx(200, 0.2, 'sine', 0.08);
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
  updateMusicMood(); tickMusic();

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
      const targetH = getTerrainHeight(target.x, target.y) + (target.z || 0) + 18;
      // Orbit using yaw/pitch — player looks around with mouse, camera stays anchored to target
      const orbitDist = 90;
      const cosP = Math.cos(S.pitch), sinP = Math.sin(S.pitch);
      const sinY = Math.sin(S.yaw), cosY = Math.cos(S.yaw);
      cam.position.x = target.x - sinY * cosP * orbitDist;
      cam.position.z = target.y - cosY * cosP * orbitDist * -1;
      cam.position.y = targetH + sinP * orbitDist + 25;
      cam.lookAt(target.x, targetH, target.y);
    }
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
    const walking = !!(S.crouching);
    if (len > 0) { send({ type: 'move', dx: mx / len, dy: mz / len, walking }); S.pingLast = performance.now(); }
    else send({ type: 'move', dx: 0, dy: 0, walking });
  }

  // Jump (server-driven, no local physics)

  // Camera follows server position smoothly
  if (me && me.alive) {
    const camLerp = 1 - Math.pow(0.0001, dt);
    cam.position.x += (me.x - cam.position.x) * camLerp;
    cam.position.z += (me.y - cam.position.z) * camLerp;
  }
  if (me && me.alive) {
    const crouchMult = S.crouching ? 0.45 : 1;
    const dynCH = CH * (me.sizeMult || 1) * crouchMult;
    // Use client-side terrain height at camera position for smooth Y
    const localTerrainH = getTerrainHeight(cam.position.x, cam.position.z);
    const serverZ = me.z || 0;
    const targetZ = Math.max(localTerrainH, serverZ);
    const camLerpY = 1 - Math.pow(0.0001, dt);
    cam.position.y += (dynCH + targetZ - cam.position.y) * camLerpY;
  }
  if (!spectatingTarget) cam.quaternion.setFromEuler(new THREE.Euler(S.pitch, S.yaw, 0, 'YXZ'));
  sun.position.set(cam.position.x + 300, 400, cam.position.z + 200);
  sun.target.position.set(cam.position.x, 0, cam.position.z);
  sun.target.updateMatrixWorld();

  buildMap();
  buildTowerIfNeeded();
  updateZone();
  updateViewmodel();
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
      // Splash particles
      if (isMoving && Math.random() < 0.3) {
        const sp = new THREE.Mesh(new THREE.SphereGeometry(0.8, 4, 4), new THREE.MeshBasicMaterial({ color: 0x4488cc, transparent: true, opacity: 0.6 }));
        sp.position.set(me.x + (Math.random()-0.5)*10, WATER_LEVEL + Math.random()*5, me.y + (Math.random()-0.5)*10);
        scene.add(sp);
        let sl = 0.5; const svy = 10 + Math.random()*15;
        const sAnim = () => { sl -= 0.03; sp.material.opacity = sl; sp.position.y += svy * 0.016; if (sl <= 0) { scene.remove(sp); sp.geometry.dispose(); sp.material.dispose(); } else requestAnimationFrame(sAnim); };
        requestAnimationFrame(sAnim);
      }
      // Wake ring
      if (Math.random() < 0.015) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(18, 0.3, 4, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
        ring.position.set(me.x + (Math.random()-0.5)*6, WATER_LEVEL + 0.5, me.y + (Math.random()-0.5)*6);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        let rScale = 1;
        const rAnim = () => { rScale += 0.016 * 0.15; ring.scale.set(rScale, rScale, 1); if (rScale > 4) { scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); } else requestAnimationFrame(rAnim); };
        requestAnimationFrame(rAnim);
      }
    }
  }

  updatePickups(time);
  updateCows(time, dt);
  updateProjectiles(dt);

  // Laser dot for L96 ADS — projects a fixed distance along aim direction
  if (!S._laserDot) {
    S._laserDot = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    S._laserDot.visible = false;
    scene.add(S._laserDot);
  }
  if (S.adsActive && me && me.alive && me.weapon === 'bolty') {
    const dir = new THREE.Vector3(0, 0, -1); dir.applyQuaternion(cam.quaternion);
    const dotDist = 500;
    S._laserDot.position.set(cam.position.x + dir.x * dotDist, cam.position.y + dir.y * dotDist, cam.position.z + dir.z * dotDist);
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

setMessageHandler(handleMsg);
connect();
requestAnimationFrame(loop);
