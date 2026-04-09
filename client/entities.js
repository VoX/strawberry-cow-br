import * as THREE from 'three';
import { COL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

export function buildCow(color, personality) {
  const c = COL[color] || 0xff88aa;
  const g = new THREE.Group();
  // Body is fully colored to the player's assigned color
  const whiteMat = new THREE.MeshLambertMaterial({ color: c });
  const spotMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // spots always white
  const udderMat = new THREE.MeshLambertMaterial({ color: 0xff88aa }); // udder always pink
  const hm = new THREE.MeshLambertMaterial({ color: c });
  // Upright torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 10), whiteMat); torso.position.set(0, 18, 0); g.add(torso);
  // Spots on torso
  const spotGeo = new THREE.CircleGeometry(3, 8);
  const s1 = new THREE.Mesh(spotGeo, spotMat); s1.position.set(-7.1, 20, 0); s1.rotation.y = -Math.PI/2; g.add(s1);
  const s2 = new THREE.Mesh(spotGeo, spotMat); s2.position.set(7.1, 16, -1); s2.rotation.y = Math.PI/2; g.add(s2);
  const s3 = new THREE.Mesh(new THREE.CircleGeometry(2.5, 8), spotMat); s3.position.set(0, 27.1, 1); s3.rotation.x = -Math.PI/2; g.add(s3);
  // Front spots (chest)
  const s4 = new THREE.Mesh(new THREE.CircleGeometry(2.2, 8), spotMat); s4.position.set(-2.5, 22, 5.1); g.add(s4);
  const s5 = new THREE.Mesh(new THREE.CircleGeometry(1.6, 8), spotMat); s5.position.set(3, 15, 5.1); g.add(s5);
  // Back spots (rump)
  const s6 = new THREE.Mesh(new THREE.CircleGeometry(2.4, 8), spotMat); s6.position.set(2, 19, -5.1); s6.rotation.y = Math.PI; g.add(s6);
  const s7 = new THREE.Mesh(new THREE.CircleGeometry(1.8, 8), spotMat); s7.position.set(-3, 24, -5.1); s7.rotation.y = Math.PI; g.add(s7);
  // Head on top
  const head = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), whiteMat); head.position.set(0, 33, 0); g.add(head);
  // Eyes
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilM = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 6), eyeM); e1.position.set(-3, 35, 5); g.add(e1);
  const e2 = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 6), eyeM); e2.position.set(3, 35, 5); g.add(e2);
  const p1 = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), pupilM); p1.position.set(-3, 35, 6.5); g.add(p1);
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), pupilM); p2.position.set(3, 35, 6.5); g.add(p2);
  // Mouth — varies by personality
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  if (personality === 'aggressive') {
    // Angry V eyebrows + frown
    const brow1 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 0.6), mouthMat); brow1.position.set(-3, 37, 5.5); brow1.rotation.z = -0.4; g.add(brow1);
    const brow2 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 0.6), mouthMat); brow2.position.set(3, 37, 5.5); brow2.rotation.z = 0.4; g.add(brow2);
    const frown = new THREE.Mesh(new THREE.TorusGeometry(2, 0.4, 6, 12, Math.PI), mouthMat);
    frown.position.set(0, 31.5, 5.5); g.add(frown); // no rotation = curves up = frown when viewed
  } else if (personality === 'timid') {
    // Sad downturned mouth + worried brows
    const brow1 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 0.6), mouthMat); brow1.position.set(-3, 37, 5.5); brow1.rotation.z = 0.3; g.add(brow1);
    const brow2 = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 0.6), mouthMat); brow2.position.set(3, 37, 5.5); brow2.rotation.z = -0.3; g.add(brow2);
    const sad = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.4, 6, 12, Math.PI), mouthMat);
    sad.position.set(0, 32, 5.5); g.add(sad);
  } else {
    // Normal smile (players + balanced bots)
    const smile = new THREE.Mesh(new THREE.TorusGeometry(2, 0.4, 6, 12, Math.PI), mouthMat);
    smile.position.set(0, 31.5, 5.5); smile.rotation.set(0, 0, Math.PI); g.add(smile);
  }
  // Cigarette — built as a group along the X axis, then positioned and rotated
  const cigGroup = new THREE.Group();
  const cigBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4, 4), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
  cigBody.rotation.z = Math.PI / 2; cigBody.position.x = 0; cigGroup.add(cigBody);
  const filter = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.5, 4), new THREE.MeshLambertMaterial({ color: 0xdd8833 }));
  filter.rotation.z = Math.PI / 2; filter.position.x = -2.75; cigGroup.add(filter);
  const ember = new THREE.Mesh(new THREE.SphereGeometry(0.5, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
  ember.position.x = 2.2; cigGroup.add(ember);
  const emberGlow = new THREE.Mesh(new THREE.SphereGeometry(1, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.25 }));
  emberGlow.position.x = 2.2; cigGroup.add(emberGlow);
  cigGroup.position.set(4, 31, 6);
  cigGroup.rotation.z = -0.2;
  g.add(cigGroup);
  g.userData.smokeOrigin = new THREE.Vector3(6.2, 30.6, 6);
  // Horns
  const h1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 8, 5), hm); h1.position.set(-4, 41, 0); h1.rotation.set(0, 0, -0.3); g.add(h1);
  const h2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 8, 5), hm); h2.position.set(4, 41, 0); h2.rotation.set(0, 0, 0.3); g.add(h2);
  // Two legs (biped)
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2, 12, 5), whiteMat); legL.position.set(-4, 3, 0); g.add(legL);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2, 12, 5), whiteMat); legR.position.set(4, 3, 0); g.add(legR);
  // Hooves
  const hoofMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
  const hoof1 = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 5), hoofMat); hoof1.position.set(-4, -1, 0); g.add(hoof1);
  const hoof2 = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 5), hoofMat); hoof2.position.set(4, -1, 0); g.add(hoof2);
  // Udder (team colored)
  const udder = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6), udderMat); udder.position.set(0, 13, 5.5); udder.scale.set(1, 0.7, 0.8); g.add(udder);
  const teat1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 2, 4), udderMat); teat1.position.set(-1.5, 13, 7); teat1.rotation.x = Math.PI / 2; g.add(teat1);
  const teat2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 2, 4), udderMat); teat2.position.set(1.5, 13, 7); teat2.rotation.x = Math.PI / 2; g.add(teat2);
  // Arms
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 12, 5), whiteMat); armL.position.set(-9, 20, 0); armL.rotation.z = 0.3; g.add(armL);
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 12, 5), whiteMat); armR.position.set(9, 20, 0); armR.rotation.z = -0.3; g.add(armR);
  g.castShadow = true;
  return g;
}

export function spawnParts(pid) {
  const p = S.serverPlayers.find(pp => pp.id === pid);
  if (!p) return;
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(1.5, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true }));
    g.position.set(p.x, 10, p.y); scene.add(g);
    const vx = (Math.random() - 0.5) * 80, vy = Math.random() * 60 + 20, vz = (Math.random() - 0.5) * 80;
    setTimeout(() => scene.remove(g), 600);
    g.userData = { vx, vy, vz, life: 0.6 };
  }
}

export function updateCows(time, dt) {
  const lerpF = 1 - Math.pow(0.001, dt || 0.016);
  const lerpR = 1 - Math.pow(0.001, dt || 0.016);
  const seen = new Set();
  for (const p of S.serverPlayers) {
    if (p.id === S.myId) continue;
    seen.add(String(p.id));
    const pid = String(p.id);
    if (!S.cowMeshes[pid]) {
      const m = buildCow(p.color, p.personality); scene.add(m);
      const nc = document.createElement('canvas'); nc.width = 256; nc.height = 64;
      const nctx = nc.getContext('2d'); nctx.font = 'bold 32px Segoe UI'; nctx.textAlign = 'center';
      // Color circle
      const colHex = {pink:'#ff88aa',blue:'#88aaff',green:'#88ff88',gold:'#ffdd44',purple:'#cc88ff',red:'#ff4444',orange:'#ff8844',cyan:'#44ffdd'};
      const nameW = nctx.measureText(p.name || 'Cow').width;
      const circleX = 128 - nameW / 2 - 16;
      nctx.beginPath(); nctx.arc(circleX, 34, 10, 0, Math.PI * 2);
      nctx.fillStyle = colHex[p.color] || '#aaa'; nctx.fill();
      nctx.fillStyle = 'rgba(0,0,0,0.5)'; nctx.fillText(p.name || 'Cow', 137, 39);
      nctx.fillStyle = '#ffffff'; nctx.fillText(p.name || 'Cow', 136, 38);
      const ntex = new THREE.CanvasTexture(nc); ntex.minFilter = THREE.LinearFilter;
      const nmat = new THREE.SpriteMaterial({ map: ntex, transparent: true, depthTest: false });
      const nsprite = new THREE.Sprite(nmat); nsprite.position.set(0, 50, 0); nsprite.scale.set(40, 10, 1);
      m.add(nsprite);
      // 3D hat — pick randomly per cow
      const hatType = ['cowboy', 'wizard', 'party', 'crown', 'cap'][Math.abs(p.id || 0) % 5];
      if (hatType === 'cowboy') {
        const hatBrown = new THREE.MeshLambertMaterial({ color: 0x6a3a1a });
        const hatBand = new THREE.MeshLambertMaterial({ color: 0x3a1a08 });
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.8, 16), hatBrown);
        brim.position.y = 38.5; m.add(brim);
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.5, 4, 12), hatBrown);
        crown.position.y = 41; m.add(crown);
        const band = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.8, 12), hatBand);
        band.position.y = 39.5; m.add(band);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.4, 12), hatBrown);
        top.position.y = 43; m.add(top);
      } else if (hatType === 'wizard') {
        const purpleMat = new THREE.MeshLambertMaterial({ color: 0x6a2299 });
        const brownBand = new THREE.MeshLambertMaterial({ color: 0x6a3a1a });
        const yellowMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
        const wizBrim = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.6, 16), purpleMat);
        wizBrim.position.y = 38.5; m.add(wizBrim);
        const wizCone = new THREE.Mesh(new THREE.ConeGeometry(5, 14, 12), purpleMat);
        wizCone.position.y = 46; m.add(wizCone);
        const wizBand = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1, 12), brownBand);
        wizBand.position.y = 39.5; m.add(wizBand);
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 0.5), yellowMat);
        buckle.position.set(0, 39.5, 5.3); m.add(buckle);
      } else if (hatType === 'crown') {
        // Yellow crown with jewels
        const goldMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 3, 12), goldMat);
        base.position.y = 39; m.add(base);
        // Spikes around the crown
        const jewelColors = [0xff2222, 0x22ff22, 0x2222ff, 0xff22ff, 0xffff22];
        for (let pi = 0; pi < 6; pi++) {
          const ang = (pi / 6) * Math.PI * 2;
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.5, 6), goldMat);
          spike.position.set(Math.cos(ang) * 4.5, 42, Math.sin(ang) * 4.5);
          m.add(spike);
          // Jewel on top of each spike
          const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), new THREE.MeshLambertMaterial({ color: jewelColors[pi % jewelColors.length] }));
          jewel.position.set(Math.cos(ang) * 4.5, 44.5, Math.sin(ang) * 4.5);
          m.add(jewel);
        }
        // Center jewel on the front
        const bigJewel = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), new THREE.MeshLambertMaterial({ color: 0xff2244 }));
        bigJewel.position.set(0, 39, 5); m.add(bigJewel);
      } else if (hatType === 'cap') {
        // Baseball cap
        const capColor = new THREE.MeshLambertMaterial({ color: 0x2244aa });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), capColor);
        dome.position.y = 39; m.add(dome);
        // Visor brim sticking out front
        const visor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 5), capColor);
        visor.position.set(0, 39, 5); m.add(visor);
        // Button on top
        const btn = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 6), capColor);
        btn.position.y = 44; m.add(btn);
      } else {
        // Party hat — pointed cone with spots
        const partyMat = new THREE.MeshLambertMaterial({ color: 0xff44aa });
        const partyCone = new THREE.Mesh(new THREE.ConeGeometry(4, 12, 12), partyMat);
        partyCone.position.y = 44; m.add(partyCone);
        // Spots — small colored spheres on the cone surface
        const spotColors = [0xffdd44, 0x44ffdd, 0x44ddff, 0xddff44];
        for (let si = 0; si < 8; si++) {
          const sCol = new THREE.MeshLambertMaterial({ color: spotColors[si % spotColors.length] });
          const spot = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 6), sCol);
          const ang = (si / 8) * Math.PI * 2;
          const sy = 40 + (si % 3) * 2.5;
          const sr = 3.5 - (si % 3) * 0.7;
          spot.position.set(Math.cos(ang) * sr, sy, Math.sin(ang) * sr);
          m.add(spot);
        }
        // Pom-pom at the tip
        const pom = new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }));
        pom.position.y = 50.5; m.add(pom);
      }
      S.cowMeshes[pid] = { mesh: m };
    }
    const cowObj = S.cowMeshes[pid];
    const cm = cowObj.mesh;
    if (!cowObj.isDead) {
      // Snap to server position exactly so hitboxes match visuals
      cm.position.x = p.x;
      cm.position.z = p.y;
      cm.position.y = (p.z !== undefined ? p.z : getTerrainHeight(p.x, p.y));
      const sz = p.sizeMult || 1;
      const crouchY = p.crouching ? 0.5 : 1;
      cm.scale.set(sz, sz * crouchY, sz);
    }
    cm.visible = true;
    if (!p.alive && !cowObj.isDead) {
      cowObj.isDead = true;
      cm.rotation.z = Math.PI / 2;
      cm.position.y = (p.z !== undefined ? p.z : getTerrainHeight(p.x, p.y)) + 5;
      // Remove shield and spawn protection bubbles
      if (cowObj.shieldBubble) { cm.remove(cowObj.shieldBubble); cowObj.shieldBubble.geometry.dispose(); cowObj.shieldBubble.material.dispose(); cowObj.shieldBubble = null; }
      if (cowObj.spawnBubble) { cm.remove(cowObj.spawnBubble); cowObj.spawnBubble.geometry.dispose(); cowObj.spawnBubble.material.dispose(); cowObj.spawnBubble = null; }
      cm.traverse(c => { if (c.isMesh && c.material && !c.material.transparent) { c.material.transparent = true; c.material.opacity = 0.5; } else if (c.isMesh && c.material && c.material.transparent) { c.material.opacity *= 0.5; } });
    }
    if (p.aimAngle !== undefined) {
      let targetRot = p.aimAngle;
      let diff = targetRot - cm.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      cm.rotation.y += diff * lerpR;
    }
    // Debug hitboxes
    if (S.debugMode) {
      const eh = 35 * (p.sizeMult || 1);
      const headBase = eh * 0.75;
      if (!cowObj.debugBody) {
        const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.3 });
        cowObj.debugBody = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, headBase, 12), bodyMat);
        cm.add(cowObj.debugBody);
        const headMat = new THREE.MeshBasicMaterial({ color: 0xff4444, wireframe: true, transparent: true, opacity: 0.3 });
        cowObj.debugHead = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 20, 12), headMat);
        cm.add(cowObj.debugHead);
      }
      cowObj.debugBody.position.set(0, headBase / 2, 0);
      cowObj.debugBody.visible = true;
      cowObj.debugHead.position.set(0, headBase + 10, 0);
      cowObj.debugHead.visible = true;
    } else if (cowObj.debugBody) {
      cowObj.debugBody.visible = false;
      cowObj.debugHead.visible = false;
    }
    // Cigarette smoke wisps
    if (p.alive && !cowObj.isDead && cm.userData.smokeOrigin && Math.random() < 0.08) {
      const so = cm.userData.smokeOrigin;
      const worldPos = new THREE.Vector3(so.x, so.y, so.z);
      cm.localToWorld(worldPos);
      const wisp = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 3, 3), new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.4 }));
      wisp.position.copy(worldPos);
      scene.add(wisp);
      let wlife = 0.8 + Math.random() * 0.4;
      const wvx = (Math.random() - 0.5) * 3, wvz = (Math.random() - 0.5) * 3, wvy = 8 + Math.random() * 5;
      const wAnim = () => { wlife -= 0.016; wisp.material.opacity = Math.max(0, wlife * 0.4); wisp.position.x += wvx * 0.016; wisp.position.y += wvy * 0.016; wisp.position.z += wvz * 0.016; wisp.scale.multiplyScalar(1 + 0.016 * 2); if (wlife <= 0) { scene.remove(wisp); wisp.geometry.dispose(); wisp.material.dispose(); } else requestAnimationFrame(wAnim); };
      requestAnimationFrame(wAnim);
    }
    if (!cowObj.hpSprite) {
      const hc = document.createElement('canvas'); hc.width = 128; hc.height = 16;
      const htex = new THREE.CanvasTexture(hc); htex.minFilter = THREE.LinearFilter;
      const hmat = new THREE.SpriteMaterial({ map: htex, transparent: true, depthTest: false });
      const hs = new THREE.Sprite(hmat); hs.position.set(0, 38, 0); hs.scale.set(30, 4, 1);
      cm.add(hs);
      cowObj.hpSprite = { sprite: hs, canvas: hc, ctx: hc.getContext('2d'), tex: htex };
    }
    // Shield bubble
    const armorVal = p.armor || 0;
    if (armorVal > 0 && !cowObj.shieldBubble) {
      const shieldMat = new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const shield = new THREE.Mesh(new THREE.SphereGeometry(22, 12, 12), shieldMat);
      shield.position.set(0, 14, 0);
      cm.add(shield);
      cowObj.shieldBubble = shield;
    }
    if (cowObj.shieldBubble) {
      if (armorVal <= 0) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.geometry.dispose(); cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      } else {
        cowObj.shieldBubble.material.opacity = Math.max(0.2, armorVal / 100 * 0.6);
      }
    }

    // Spawn protection bubble (golden, separate from shield)
    if (p.spawnProt && !cowObj.spawnBubble) {
      const spMat = new THREE.MeshBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const sp = new THREE.Mesh(new THREE.SphereGeometry(25, 12, 12), spMat);
      sp.position.set(0, 14, 0);
      cm.add(sp);
      cowObj.spawnBubble = sp;
    }
    if (cowObj.spawnBubble && !p.spawnProt) {
      cm.remove(cowObj.spawnBubble);
      cowObj.spawnBubble.geometry.dispose(); cowObj.spawnBubble.material.dispose();
      cowObj.spawnBubble = null;
    }

    const hpPct = Math.max(0, (p.hunger || 0) / 100);
    const hpRounded = Math.round(hpPct * 100);
    if (cowObj.lastHp !== hpRounded) {
      cowObj.lastHp = hpRounded;
      const hctx = cowObj.hpSprite.ctx;
      hctx.clearRect(0, 0, 128, 16);
      hctx.fillStyle = 'rgba(0,0,0,0.6)'; hctx.fillRect(0, 0, 128, 16);
      hctx.fillStyle = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff4444';
      hctx.fillRect(2, 2, 124 * hpPct, 12);
      cowObj.hpSprite.tex.needsUpdate = true;
    }
  }
  for (const id in S.cowMeshes) {
    if (!seen.has(id)) {
      const obj = S.cowMeshes[id];
      scene.remove(obj.mesh);
      obj.mesh.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); } });
      if (obj.hpSprite) obj.hpSprite.tex.dispose();
      if (obj.shieldBubble) { obj.shieldBubble.geometry.dispose(); obj.shieldBubble.material.dispose(); }
      if (obj.spawnBubble) { obj.spawnBubble.geometry.dispose(); obj.spawnBubble.material.dispose(); }
      delete S.cowMeshes[id];
    }
  }
}
