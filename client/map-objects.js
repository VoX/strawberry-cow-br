import * as THREE from 'three';
import { MW, MH } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

// Map building
let _mapMeshes = [];
export function buildMap() {
  if (S.mapBuilt) return; S.mapBuilt = true;
  _mapMeshes.forEach(m => scene.remove(m)); _mapMeshes = [];
  function addMap(m) { scene.add(m); _mapMeshes.push(m); return m; }
  const wm = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
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

// Center tower
const towerX = MW / 2, towerZ = MH / 2;
const towerH = 200, towerSize = 60;
let towerMesh = null;

export function buildTowerIfNeeded() {
  if (towerMesh) return;
  towerMesh = buildTower();
}

function buildTower() {
  const g = new THREE.Group();
  const th = getTerrainHeight(towerX, towerZ);
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const stoneD = new THREE.MeshLambertMaterial({ color: 0x777777 });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x884422 });
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
  const baseW = towerSize * 2, baseH = towerH;
  const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseW), stoneMat);
  base.position.y = baseH / 2; base.castShadow = true; g.add(base);
  for (let y = 0; y < baseH; y += 40) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(baseW + 2, 3, baseW + 2), stoneD);
    band.position.y = y; g.add(band);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 4; const side = Math.floor(a); const frac = a - side;
    let cx = 0, cz = 0; const hw = towerSize;
    if (side === 0) { cx = -hw + frac * baseW; cz = -hw; }
    else if (side === 1) { cx = hw; cz = -hw + frac * baseW; }
    else if (side === 2) { cx = hw - frac * baseW; cz = hw; }
    else { cx = -hw; cz = hw - frac * baseW; }
    const cren = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 8), stoneMat);
    cren.position.set(cx, baseH + 5, cz); g.add(cren);
  }
  const platSize = baseW + 40;
  const plat = new THREE.Mesh(new THREE.BoxGeometry(platSize, 4, platSize), woodMat);
  plat.position.y = baseH + 12; g.add(plat);
  const pillarH = 50; const pillarOff = platSize / 2 - 8;
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dx, dz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, pillarH, 6), stoneMat);
    pillar.position.set(dx * pillarOff, baseH + 12 + pillarH / 2, dz * pillarOff); g.add(pillar);
  });
  const roofH = 40;
  const roofGeo = new THREE.ConeGeometry(platSize * 0.7, roofH, 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = baseH + 12 + pillarH + roofH / 2;
  roof.rotation.y = Math.PI / 4; g.add(roof);
  [baseH + 16, baseH + 22].forEach(rh => {
    let r;
    r = new THREE.Mesh(new THREE.BoxGeometry(platSize, 2, 3), metalMat); r.position.set(0, rh, -platSize / 2); g.add(r);
    r = new THREE.Mesh(new THREE.BoxGeometry(platSize, 2, 3), metalMat); r.position.set(0, rh, platSize / 2); g.add(r);
    r = new THREE.Mesh(new THREE.BoxGeometry(3, 2, platSize), metalMat); r.position.set(-platSize / 2, rh, 0); g.add(r);
    r = new THREE.Mesh(new THREE.BoxGeometry(3, 2, platSize), metalMat); r.position.set(platSize / 2, rh, 0); g.add(r);
  });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * 4; const side = Math.floor(a) % 4; const frac = a - Math.floor(a);
    let px = 0, pz = 0; const hw = platSize / 2;
    if (side === 0) { px = -hw + frac * platSize; pz = -hw; }
    else if (side === 1) { px = hw; pz = -hw + frac * platSize; }
    else if (side === 2) { px = hw - frac * platSize; pz = hw; }
    else { px = -hw; pz = hw - frac * platSize; }
    const post = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 14, 4), metalMat);
    post.position.set(px, baseH + 19, pz); g.add(post);
  }
  const rampW = 15, rampLevels = 8;
  const rampMat2 = new THREE.MeshLambertMaterial({ color: 0x7a6a5a });
  for (let i = 0; i < rampLevels; i++) {
    const h = (i / rampLevels) * baseH; const side = i % 4;
    const hw = towerSize + rampW / 2 + 2;
    let rx = 0, rz = 0, rw, rd;
    if (side === 0) { rx = 0; rz = -hw; rw = baseW; rd = rampW; }
    else if (side === 1) { rx = hw; rz = 0; rw = rampW; rd = baseW; }
    else if (side === 2) { rx = 0; rz = hw; rw = baseW; rd = rampW; }
    else { rx = -hw; rz = 0; rw = rampW; rd = baseW; }
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(rw, 3, rd), rampMat2);
    ramp.position.set(rx, h + 5, rz); g.add(ramp);
    const railGeoH = new THREE.BoxGeometry(rw + 2, 8, 2);
    const railGeoV = new THREE.BoxGeometry(2, 8, rd + 2);
    const railOut = new THREE.Mesh((side === 1 || side === 3) ? railGeoV : railGeoH, metalMat);
    if (side === 1 || side === 3) { railGeoH.dispose(); } else { railGeoV.dispose(); }
    const railOff = side === 0 ? -hw - rampW / 2 : side === 2 ? hw + rampW / 2 : side === 1 ? hw + rampW / 2 : -hw - rampW / 2;
    if (side === 0 || side === 2) railOut.position.set(0, h + 10, railOff);
    else railOut.position.set(railOff, h + 10, 0);
    g.add(railOut);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 20, 4), metalMat);
  pole.position.set(0, baseH + 12 + pillarH + roofH + 10, 0); g.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), new THREE.MeshBasicMaterial({ color: 0xff4444, side: THREE.DoubleSide }));
  flag.position.set(10, baseH + 12 + pillarH + roofH + 16, 0); g.add(flag);
  g.position.set(towerX, th, towerZ);
  scene.add(g);
  return g;
}

export function getTowerHeight(x, z) {
  const dx = x - towerX, dz = z - towerZ;
  const dist = Math.max(Math.abs(dx), Math.abs(dz));
  const rampInner = towerSize, rampOuter = towerSize + 17;
  if (dist >= rampInner && dist <= rampOuter) {
    const angle = Math.atan2(dz, dx);
    const norm = ((angle + Math.PI) / (Math.PI * 2)) % 1;
    return towerH * norm;
  }
  if (dist <= rampOuter + 20 && dist >= 0) {
    const adx = Math.abs(dx), adz = Math.abs(dz);
    if (adx <= towerSize + 20 && adz <= towerSize + 20 && dist > rampOuter) {
      return towerH + 12;
    }
  }
  return 0;
}
