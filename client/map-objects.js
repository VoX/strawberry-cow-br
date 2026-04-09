import * as THREE from 'three';
import { MW, MH } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

// Map building
let _mapMeshes = [];
export function buildMap() {
  if (S.mapBuilt) return; S.mapBuilt = true;
  _mapMeshes.forEach(m => { scene.remove(m); m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); }); _mapMeshes = [];
  function addMap(m) { scene.add(m); _mapMeshes.push(m); return m; }
  const wm = new THREE.MeshLambertMaterial({ color: 0xaa3333 });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const wallH = 70;
  (S.mapFeatures.walls || []).forEach(w => {
    const ww = Math.max(w.w, 20), wh = Math.max(w.h, 20);
    const isHoriz = ww > wh;
    const len = isHoriz ? ww : wh;
    const segSize = 20;
    const segs = Math.max(1, Math.ceil(len / segSize));
    for (let s = 0; s < segs; s++) {
      const frac = (s + 0.5) / segs;
      let sx, sz, sw, sh;
      if (isHoriz) { sx = w.x + frac * ww; sz = w.y + wh / 2; sw = ww / segs; sh = wh; }
      else { sx = w.x + ww / 2; sz = w.y + frac * wh; sw = ww; sh = wh / segs; }
      const th = getTerrainHeight(sx, sz);
      const m = new THREE.Mesh(new THREE.BoxGeometry(sw + 1, wallH, sh + 1), wm);
      m.position.set(sx, wallH / 2 + th, sz); m.castShadow = true;
      addMap(m);
      // White barn trim — horizontal stripe at 60% height
      const trim1 = new THREE.Mesh(new THREE.BoxGeometry(sw + 1.5, 3, sh + 1.5), trimMat);
      trim1.position.set(sx, wallH * 0.6 + th, sz); addMap(trim1);
      // Brown top cap
      const capMat = new THREE.MeshLambertMaterial({ color: 0x6a4422 });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(sw + 2, 5, sh + 2), capMat);
      cap.position.set(sx, wallH + 2.5 + th, sz); addMap(cap);
      // Red X crossbeams on wall face
      const xMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const faceW = isHoriz ? sw : sh;
      const diagLen = Math.hypot(faceW, wallH * 0.55);
      const diagAngle = Math.atan2(wallH * 0.55, faceW);
      const faceOffset = isHoriz ? sh / 2 + 1.5 : sw / 2 + 1.5;
      // Front face X
      const x1 = new THREE.Mesh(new THREE.BoxGeometry(diagLen, 2.5, 1), xMat);
      x1.position.set(sx, wallH * 0.3 + th, isHoriz ? sz + faceOffset : sz);
      if (isHoriz) { x1.rotation.z = diagAngle; } else { x1.position.x = sx + faceOffset; x1.position.z = sz; x1.rotation.set(0, Math.PI/2, diagAngle); }
      addMap(x1);
      const x2 = new THREE.Mesh(new THREE.BoxGeometry(diagLen, 2.5, 1), xMat);
      x2.position.set(sx, wallH * 0.3 + th, isHoriz ? sz + faceOffset : sz);
      if (isHoriz) { x2.rotation.z = -diagAngle; } else { x2.position.x = sx + faceOffset; x2.position.z = sz; x2.rotation.set(0, Math.PI/2, -diagAngle); }
      addMap(x2);
      // Back face X
      const x3 = new THREE.Mesh(new THREE.BoxGeometry(diagLen, 2.5, 1), xMat);
      x3.position.set(sx, wallH * 0.3 + th, isHoriz ? sz - faceOffset : sz);
      if (isHoriz) { x3.rotation.z = diagAngle; } else { x3.position.x = sx - faceOffset; x3.position.z = sz; x3.rotation.set(0, Math.PI/2, diagAngle); }
      addMap(x3);
      const x4 = new THREE.Mesh(new THREE.BoxGeometry(diagLen, 2.5, 1), xMat);
      x4.position.set(sx, wallH * 0.3 + th, isHoriz ? sz - faceOffset : sz);
      if (isHoriz) { x4.rotation.z = -diagAngle; } else { x4.position.x = sx - faceOffset; x4.position.z = sz; x4.rotation.set(0, Math.PI/2, -diagAngle); }
      addMap(x4);
    }
  });
  const pm = new THREE.MeshBasicMaterial({ color: 0xcc88ff, transparent: true, opacity: 0.6 });
  (S.mapFeatures.portals || []).forEach(p => {
    [[p.x1, p.y1], [p.x2, p.y2]].forEach(([px, pz]) => {
      const th = getTerrainHeight(px, pz);
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(20, 3, 8, 16), pm);
      mesh.position.set(px, th + 20, pz); mesh.rotation.x = Math.PI / 2; addMap(mesh);
    });
  });
  const barnWallMat = new THREE.MeshLambertMaterial({ color: 0xaa3333 });
  const barnRoofMat = new THREE.MeshLambertMaterial({ color: 0x6a4422 });
  const barnTrimMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  (S.mapFeatures.shelters || []).forEach(s => {
    const th = getTerrainHeight(s.x, s.y);
    const bw = s.r * 2 || 60, bd = s.r * 2 || 60, bh = 35;
    const stiltH = 100;
    const g = new THREE.Group();
    const stiltGeo = new THREE.CylinderGeometry(3, 3, stiltH, 6);
    const stiltMat = new THREE.MeshLambertMaterial({ color: 0x6a4422 });
    [[-bw / 2 + 4, -bd / 2 + 4], [bw / 2 - 4, -bd / 2 + 4], [-bw / 2 + 4, bd / 2 - 4], [bw / 2 - 4, bd / 2 - 4]].forEach(([sx2, sz2]) => {
      const stilt = new THREE.Mesh(stiltGeo, stiltMat);
      stilt.position.set(sx2, stiltH / 2, sz2); stilt.castShadow = true; g.add(stilt);
    });
    const braceGeo = new THREE.BoxGeometry(bw - 8, 3, 3);
    const brace1 = new THREE.Mesh(braceGeo, stiltMat); brace1.position.set(0, stiltH * 0.3, -bd / 2 + 4); g.add(brace1);
    const brace2 = new THREE.Mesh(braceGeo, stiltMat); brace2.position.set(0, stiltH * 0.3, bd / 2 - 4); g.add(brace2);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(bw + 4, 3, bd + 4), floorMat);
    floor.position.y = stiltH; g.add(floor);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), barnWallMat);
    walls.position.y = stiltH + bh / 2; walls.castShadow = true; g.add(walls);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.5, 3, bd + 0.5), barnTrimMat);
    trim.position.y = stiltH + bh * 0.6; g.add(trim);
    const roofW = bw + 10, roofD = bd + 6;
    const roofGeo = new THREE.BoxGeometry(roofW, 4, roofD);
    const roofL = new THREE.Mesh(roofGeo, barnRoofMat);
    roofL.position.set(-roofW * 0.2, stiltH + bh + 8, 0); roofL.rotation.z = 0.4; roofL.castShadow = true; g.add(roofL);
    const roofR = new THREE.Mesh(roofGeo, barnRoofMat);
    roofR.position.set(roofW * 0.2, stiltH + bh + 8, 0); roofR.rotation.z = -0.4; roofR.castShadow = true; g.add(roofR);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(4, 4, roofD + 2), barnRoofMat);
    ridge.position.y = stiltH + bh + 14; g.add(ridge);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x332211 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.35, bh * 0.7, 0.5), doorMat);
    door.position.set(0, stiltH + bh * 0.35, bd / 2 + 0.3); g.add(door);
    const windowMat = new THREE.MeshLambertMaterial({ color: 0xffdd88 });
    const win = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 0.5), windowMat);
    win.position.set(0, stiltH + bh * 0.85, bd / 2 + 0.3); g.add(win);
    const sc = document.createElement('canvas'); sc.width = 128; sc.height = 32;
    const sctx = sc.getContext('2d'); sctx.font = 'bold 22px Segoe UI'; sctx.textAlign = 'center';
    sctx.fillStyle = '#fff'; sctx.fillText('SHELTER', 64, 24);
    const stex2 = new THREE.CanvasTexture(sc); stex2.minFilter = THREE.LinearFilter;
    const ss = new THREE.Sprite(new THREE.SpriteMaterial({ map: stex2, transparent: true, depthTest: false }));
    ss.position.set(0, stiltH + bh + 22, 0); ss.scale.set(40, 10, 1); g.add(ss);
    g.position.set(s.x, th, s.y);
    addMap(g);
  });
}

// Build a small wooden barricade mesh — planks with visible wood grain
const _barricadeMeshes = {};
export function addBarricade(b) {
  if (_barricadeMeshes[b.id]) return;
  S.barricades.push({ id: b.id, cx: b.cx, cy: b.cy, w: b.w, h: b.h, angle: b.angle });
  const g = new THREE.Group();
  const th = getTerrainHeight(b.cx, b.cy);
  const plankMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
  const darkPlank = new THREE.MeshLambertMaterial({ color: 0x6a4020 });
  const H = 55;
  // Build in local coords (centered at origin, long axis along X) then rotate/position the group
  const body = new THREE.Mesh(new THREE.BoxGeometry(b.w, H, b.h), plankMat);
  body.position.set(0, H/2, 0); body.castShadow = true;
  g.add(body);
  for (let i = 1; i < 4; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(b.w + 0.2, 1.5, b.h + 0.2), darkPlank);
    stripe.position.set(0, (H / 4) * i, 0);
    g.add(stripe);
  }
  // Cross-beam along the long face (diagonal brace)
  const beamLen = Math.hypot(b.w, H) * 0.95;
  const beam1 = new THREE.Mesh(new THREE.BoxGeometry(beamLen, 3, 0.6), darkPlank);
  beam1.position.set(0, H/2, b.h/2 + 0.5);
  beam1.rotation.z = Math.atan2(H, b.w);
  g.add(beam1);
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(beamLen, 3, 0.6), darkPlank);
  beam2.position.set(0, H/2, b.h/2 + 0.5);
  beam2.rotation.z = -Math.atan2(H, b.w);
  g.add(beam2);
  // Position and rotate the whole group.
  // Server angle is the aim direction (radians in XY world). In three.js the wall's long axis (X local)
  // should be perpendicular to aim. Rotate around Y by (-angle - PI/2) because three.js uses left-handed Y-up
  // and our server coord is (x, y) but three.js uses (x, z) for the ground plane.
  g.position.set(b.cx, th, b.cy);
  g.rotation.y = -b.angle - Math.PI / 2;
  scene.add(g);
  _barricadeMeshes[b.id] = g;
}
export function removeBarricade(id) {
  const m = _barricadeMeshes[id];
  if (!m) return;
  scene.remove(m);
  m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
  delete _barricadeMeshes[id];
  S.barricades = S.barricades.filter(b => b.id !== id);
}
export function clearBarricades() {
  for (const id in _barricadeMeshes) {
    const m = _barricadeMeshes[id];
    scene.remove(m);
    m.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); });
    delete _barricadeMeshes[id];
  }
  S.barricades = [];
}

const towerX = MW / 2, towerZ = MH / 2;
let towerMesh = null;

export function buildTowerIfNeeded() {
  if (towerMesh) return;
  const g = new THREE.Group();
  const th = getTerrainHeight(towerX, towerZ);
  // Flagpole
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 80, 6), poleMat);
  pole.position.y = 40; g.add(pole);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffdd44 }));
  cap.position.y = 82; g.add(cap);
  // Flag with cow pattern
  const fc = document.createElement('canvas'); fc.width = 128; fc.height = 64;
  const fctx = fc.getContext('2d');
  fctx.fillStyle = '#ffffff'; fctx.fillRect(0, 0, 128, 64);
  fctx.fillStyle = '#ff88aa';
  fctx.beginPath(); fctx.arc(40, 25, 15, 0, Math.PI * 2); fctx.fill();
  fctx.beginPath(); fctx.arc(85, 35, 12, 0, Math.PI * 2); fctx.fill();
  fctx.beginPath(); fctx.arc(55, 48, 10, 0, Math.PI * 2); fctx.fill();
  const ftex = new THREE.CanvasTexture(fc);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({ map: ftex, side: THREE.DoubleSide }));
  flag.position.set(16, 70, 0); g.add(flag);
  g.position.set(towerX, th, towerZ);
  scene.add(g);
  towerMesh = g;
}

