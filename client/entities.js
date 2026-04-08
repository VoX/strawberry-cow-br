import * as THREE from 'three';
import { COL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

export function buildCow(color) {
  const c = COL[color] || 0xff88aa;
  const g = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: c });
  const body = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 26), mat); body.position.set(0, 14, 0); g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), mat); head.position.set(0, 20, 16); g.add(head);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilM = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 6), eyeM); e1.position.set(-3, 22, 21); g.add(e1);
  const e2 = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 6), eyeM); e2.position.set(3, 22, 21); g.add(e2);
  const p1 = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), pupilM); p1.position.set(-3, 22, 22.5); g.add(p1);
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), pupilM); p2.position.set(3, 22, 22.5); g.add(p2);
  const smileMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.4, 6, 12, Math.PI), smileMat);
  smile.position.set(0, 18.5, 21.5); smile.rotation.set(0, 0, Math.PI); g.add(smile);
  const hm = new THREE.MeshLambertMaterial({ color: 0xffdd88 });
  const h1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 8, 5), hm); h1.position.set(-4, 28, 16); h1.rotation.set(0, 0, -0.3); g.add(h1);
  const h2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 8, 5), hm); h2.position.set(4, 28, 16); h2.rotation.set(0, 0, 0.3); g.add(h2);
  [[-6, -9], [6, -9], [-6, 9], [6, 9]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 9, 5), mat); leg.position.set(x, 4.5, z); g.add(leg);
  });
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

export function updateCows(time) {
  const seen = new Set();
  for (const p of S.serverPlayers) {
    if (p.id === S.myId) continue;
    seen.add(String(p.id));
    const pid = String(p.id);
    if (!S.cowMeshes[pid]) {
      const m = buildCow(p.color); scene.add(m);
      const nc = document.createElement('canvas'); nc.width = 256; nc.height = 64;
      const nctx = nc.getContext('2d'); nctx.font = 'bold 32px Segoe UI'; nctx.textAlign = 'center';
      nctx.fillStyle = 'rgba(0,0,0,0.5)'; nctx.fillText(p.name || 'Cow', 129, 39);
      nctx.fillStyle = '#ffffff'; nctx.fillText(p.name || 'Cow', 128, 38);
      const ntex = new THREE.CanvasTexture(nc); ntex.minFilter = THREE.LinearFilter;
      const nmat = new THREE.SpriteMaterial({ map: ntex, transparent: true, depthTest: false });
      const nsprite = new THREE.Sprite(nmat); nsprite.position.set(0, 44, 0); nsprite.scale.set(40, 10, 1);
      m.add(nsprite);
      S.cowMeshes[pid] = { mesh: m };
    }
    const cowObj = S.cowMeshes[pid];
    const cm = cowObj.mesh;
    cm.position.x += (p.x - cm.position.x) * 0.15;
    cm.position.z += (p.y - cm.position.z) * 0.15;
    const cowTargetY = (p.alive ? Math.sin(time * 6) * 1.5 : 0) + getTerrainHeight(p.x, p.y);
    cm.position.y += (cowTargetY - cm.position.y) * 0.2;
    const sz = p.sizeMult || 1;
    cm.scale.set(sz, sz, sz);
    cm.visible = p.alive;
    if (p.aimAngle !== undefined) {
      let targetRot = p.aimAngle;
      let diff = targetRot - cm.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
      cm.rotation.y += diff * 0.15;
    }
    if (!cowObj.hpSprite) {
      const hc = document.createElement('canvas'); hc.width = 128; hc.height = 16;
      const htex = new THREE.CanvasTexture(hc); htex.minFilter = THREE.LinearFilter;
      const hmat = new THREE.SpriteMaterial({ map: htex, transparent: true, depthTest: false });
      const hs = new THREE.Sprite(hmat); hs.position.set(0, 38, 0); hs.scale.set(30, 4, 1);
      cm.add(hs);
      cowObj.hpSprite = { sprite: hs, canvas: hc, ctx: hc.getContext('2d'), tex: htex };
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
      delete S.cowMeshes[id];
    }
  }
}
