import * as THREE from 'three';
import { MW, MH } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { spawnParticle, PGEO_BOX } from './particles.js';
import { disposeMeshTree, markSharedGeometry, markSharedMaterial } from './three-utils.js';

// Map building
let _mapMeshes = [];
// Walls are consolidated into 4 InstancedMeshes (body, trim, cap, x-beams) — weathering stains
// stay as individual CircleGeometry meshes (different geometry, small count).
let _wallBodyIM = null, _wallTrimIM = null, _wallCapIM = null, _wallXBeamIM = null;
const _wallSlotsById = {}; // wallId → { body, trim, cap, xBeams: [idx...], stains: [mesh...], center: {x,z}, minX, maxX, minZ, maxZ }
const _HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0); // send an instance off to nowhere
// House wall→decoration tracking. Populated during buildMap() so
// destroyWall() can tear down windows/door/roof when walls fall.
const _houseWallMap = {};   // wallId → { houseIdx, side }
const _houseParts = {};     // houseIdx → { group, sideDecor: { N: [mesh..], .. }, roof: [mesh..], wallIds: Set, destroyedWallIds: Set }
const _tmpWallMat4 = new THREE.Matrix4();
const _tmpWallPos = new THREE.Vector3();
const _tmpWallQuat = new THREE.Quaternion();
const _tmpWallScale = new THREE.Vector3();
const _tmpWallEuler = new THREE.Euler();

export function destroyWall(id) {
  const slot = _wallSlotsById[id];
  if (!slot) return;
  const { center, minX, maxX, minZ, maxZ, stains } = slot;
  const spreadX = Math.max(20, (maxX - minX) + 30);
  const spreadZ = Math.max(20, (maxZ - minZ) + 30);
  const th = getTerrainHeight(center.x, center.z);
  // Scatter wood plank fragments on the ground where the wall stood — pooled particles
  for (let i = 0; i < 18; i++) {
    const useTrim = Math.random() < 0.25;
    const size = 2 + Math.random() * 4;
    spawnParticle({
      geo: PGEO_BOX, color: useTrim ? 0xc8c0a8 : 0x7a2a26,
      x: center.x + (Math.random() - 0.5) * spreadX,
      y: th + size * 0.2 + Math.random() * 2,
      z: center.z + (Math.random() - 0.5) * spreadZ,
      sx: size, sy: size * 0.4, sz: size * 0.7,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      life: 5,
    });
  }
  // Hide the instanced wall pieces by setting their matrices to zero-scale
  if (_wallBodyIM) { for (const i of slot.body) _wallBodyIM.setMatrixAt(i, _HIDDEN); _wallBodyIM.instanceMatrix.needsUpdate = true; }
  if (_wallTrimIM) { for (const i of slot.trim) _wallTrimIM.setMatrixAt(i, _HIDDEN); _wallTrimIM.instanceMatrix.needsUpdate = true; }
  if (_wallCapIM) { for (const i of slot.cap) _wallCapIM.setMatrixAt(i, _HIDDEN); _wallCapIM.instanceMatrix.needsUpdate = true; }
  if (_wallXBeamIM) { for (const i of slot.xBeams) _wallXBeamIM.setMatrixAt(i, _HIDDEN); _wallXBeamIM.instanceMatrix.needsUpdate = true; }
  // Remove stain meshes (CircleGeometry, still individual)
  stains.forEach(m => {
    scene.remove(m);
    if (m.geometry) m.geometry.dispose();
    if (m.material) m.material.dispose();
    const idx = _mapMeshes.indexOf(m);
    if (idx >= 0) _mapMeshes.splice(idx, 1);
  });
  delete _wallSlotsById[id];
}
export function buildMap() {
  if (S.mapBuilt) return; S.mapBuilt = true;
  _mapMeshes.forEach(m => disposeMeshTree(m)); _mapMeshes = [];
  // Dispose any previous-round wall InstancedMeshes
  [_wallBodyIM, _wallTrimIM, _wallCapIM, _wallXBeamIM].forEach(im => { if (im) { scene.remove(im); im.geometry.dispose(); } });
  _wallBodyIM = _wallTrimIM = _wallCapIM = _wallXBeamIM = null;
  for (const id in _wallSlotsById) delete _wallSlotsById[id];
  for (const id in _houseWallMap) delete _houseWallMap[id];
  for (const idx in _houseParts) delete _houseParts[idx];
  // Register wall→house associations from server-tagged wall data so
  // we can tear down windows/door/roof when house walls are destroyed.
  (S.mapFeatures.walls || []).forEach(w => {
    if (w.houseIdx != null) {
      _houseWallMap[w.id] = { houseIdx: w.houseIdx, side: w.houseSide };
      if (!_houseParts[w.houseIdx]) _houseParts[w.houseIdx] = { group: null, sideDecor: {}, roof: [], wallIds: new Set(), destroyedWallIds: new Set() };
      _houseParts[w.houseIdx].wallIds.add(w.id);
    }
  });
  function addMap(m) { scene.add(m); _mapMeshes.push(m); return m; }
  const wm = new THREE.MeshLambertMaterial({ color: 0x7a2a26 });
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xc8c0a8 });
  const capMat = new THREE.MeshLambertMaterial({ color: 0x4a301a });
  const xMat = new THREE.MeshLambertMaterial({ color: 0xc8c0a8 });
  const weatherMat = new THREE.MeshLambertMaterial({ color: 0x3a1a14, transparent: true, opacity: 0.55 });
  const wallH = 70;

  // Pass 1: collect per-segment transform data so we can size InstancedMeshes exactly
  const bodyXforms = [];   // { sw, sh, wallH, sx, sy, sz, wallId }
  const trimXforms = [];
  const capXforms = [];
  const xBeamXforms = [];  // { len, sx, sy, sz, isHoriz, angle, wallId }
  const stainMeshesByWall = {}; // wallId → [stain mesh]

  (S.mapFeatures.walls || []).forEach(w => {
    const wid = w.id;
    const ww = Math.max(w.w, 20), wh = Math.max(w.h, 20);
    const isHoriz = ww > wh;
    const len = isHoriz ? ww : wh;
    const segSize = 20;
    const segs = Math.max(1, Math.ceil(len / segSize));
    if (wid !== undefined) {
      _wallSlotsById[wid] = {
        body: [], trim: [], cap: [], xBeams: [], stains: [],
        center: { x: w.x + ww / 2, z: w.y + wh / 2 },
        minX: w.x, maxX: w.x + ww, minZ: w.y, maxZ: w.y + wh,
      };
      stainMeshesByWall[wid] = _wallSlotsById[wid].stains;
    }
    for (let s = 0; s < segs; s++) {
      const frac = (s + 0.5) / segs;
      let sx, sz, sw, sh;
      if (isHoriz) { sx = w.x + frac * ww; sz = w.y + wh / 2; sw = ww / segs; sh = wh; }
      else { sx = w.x + ww / 2; sz = w.y + frac * wh; sw = ww; sh = wh / segs; }
      const th = getTerrainHeight(sx, sz);
      // Body (cream-brown box, per-segment scale)
      bodyXforms.push({ sx, sy: wallH / 2 + th, sz, sw: sw + 1, sh: wallH, sd: sh + 1, wallId: wid });
      // Trim stripe at 60% height
      trimXforms.push({ sx, sy: wallH * 0.6 + th, sz, sw: sw + 1.5, sh: 3, sd: sh + 1.5, wallId: wid });
      // Brown top cap
      capXforms.push({ sx, sy: wallH + 2.5 + th, sz, sw: sw + 2, sh: 5, sd: sh + 2, wallId: wid });

      // Weathering stains — still individual CircleGeometry meshes (small count, different geometry)
      for (let sc = 0; sc < 3; sc++) {
        const stain = new THREE.Mesh(new THREE.CircleGeometry(2 + Math.random() * 3, 6), weatherMat);
        const faceSign = Math.random() > 0.5 ? 1 : -1;
        const stainY = wallH * (0.15 + Math.random() * 0.7) + th;
        if (isHoriz) { stain.position.set(sx + (Math.random() - 0.5) * sw, stainY, sz + faceSign * (sh / 2 + 1.6)); if (faceSign < 0) stain.rotation.y = Math.PI; }
        else { stain.position.set(sx + faceSign * (sw / 2 + 1.6), stainY, sz + (Math.random() - 0.5) * sh); stain.rotation.y = faceSign > 0 ? Math.PI / 2 : -Math.PI / 2; }
        scene.add(stain);
        _mapMeshes.push(stain);
        if (wid !== undefined) stainMeshesByWall[wid].push(stain);
      }

      // Red X crossbeams on wall face — 4 diagonal beams per segment
      const faceW = isHoriz ? sw : sh;
      const diagLen = Math.hypot(faceW, wallH * 0.55);
      const diagAngle = Math.atan2(wallH * 0.55, faceW);
      const faceOffset = isHoriz ? sh / 2 + 1.5 : sw / 2 + 1.5;
      // Each beam needs: position, horiz/vert orientation, diagAngle sign
      const beamY = wallH * 0.3 + th;
      const beams = [
        { px: isHoriz ? sx : sx + faceOffset, pz: isHoriz ? sz + faceOffset : sz, ang: diagAngle, isHoriz },
        { px: isHoriz ? sx : sx + faceOffset, pz: isHoriz ? sz + faceOffset : sz, ang: -diagAngle, isHoriz },
        { px: isHoriz ? sx : sx - faceOffset, pz: isHoriz ? sz - faceOffset : sz, ang: diagAngle, isHoriz },
        { px: isHoriz ? sx : sx - faceOffset, pz: isHoriz ? sz - faceOffset : sz, ang: -diagAngle, isHoriz },
      ];
      for (const b of beams) {
        xBeamXforms.push({ px: b.px, py: beamY, pz: b.pz, len: diagLen, ang: b.ang, isHoriz: b.isHoriz, wallId: wid });
      }
    }
  });

  // Pass 2: allocate InstancedMeshes and fill matrices. Body/trim/cap share a unit box
  // since they only differ in world-space scale; X-beams use a unit beam (fixed Y=2.5).
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitBeam = new THREE.BoxGeometry(1, 2.5, 1);

  // Fills a scaled axis-aligned box InstancedMesh from {sx,sy,sz,sw,sh,sd,wallId} transforms
  // and records per-wall instance indices under slotKey on _wallSlotsById.
  function buildBoxIM(xforms, geo, mat, slotKey) {
    if (xforms.length === 0) return null;
    const im = new THREE.InstancedMesh(geo, mat, xforms.length);
    for (let i = 0; i < xforms.length; i++) {
      const x = xforms[i];
      _tmpWallPos.set(x.sx, x.sy, x.sz);
      _tmpWallQuat.identity();
      _tmpWallScale.set(x.sw, x.sh, x.sd);
      _tmpWallMat4.compose(_tmpWallPos, _tmpWallQuat, _tmpWallScale);
      im.setMatrixAt(i, _tmpWallMat4);
      if (x.wallId !== undefined) _wallSlotsById[x.wallId][slotKey].push(i);
    }
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
    return im;
  }

  _wallBodyIM = buildBoxIM(bodyXforms, unitBox, wm, 'body');
  if (_wallBodyIM) _wallBodyIM.castShadow = true;
  _wallTrimIM = buildBoxIM(trimXforms, unitBox, trimMat, 'trim');
  _wallCapIM = buildBoxIM(capXforms, unitBox, capMat, 'cap');

  // X-beams need per-instance rotation (diagonal angle + horiz/vert face orientation) so
  // they use their own loop rather than buildBoxIM.
  if (xBeamXforms.length > 0) {
    _wallXBeamIM = new THREE.InstancedMesh(unitBeam, xMat, xBeamXforms.length);
    for (let i = 0; i < xBeamXforms.length; i++) {
      const x = xBeamXforms[i];
      _tmpWallPos.set(x.px, x.py, x.pz);
      _tmpWallEuler.set(0, x.isHoriz ? 0 : Math.PI / 2, x.ang, 'XYZ');
      _tmpWallQuat.setFromEuler(_tmpWallEuler);
      _tmpWallScale.set(x.len, 1, 1);
      _tmpWallMat4.compose(_tmpWallPos, _tmpWallQuat, _tmpWallScale);
      _wallXBeamIM.setMatrixAt(i, _tmpWallMat4);
      if (x.wallId !== undefined) _wallSlotsById[x.wallId].xBeams.push(i);
    }
    _wallXBeamIM.instanceMatrix.needsUpdate = true;
    scene.add(_wallXBeamIM);
  }
  const pm = new THREE.MeshBasicMaterial({ color: 0xcc88ff, transparent: true, opacity: 0.6 });
  (S.mapFeatures.portals || []).forEach(p => {
    [[p.x1, p.y1], [p.x2, p.y2]].forEach(([px, pz]) => {
      const th = getTerrainHeight(px, pz);
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(20, 3, 8, 16), pm);
      mesh.position.set(px, th + 20, pz); mesh.rotation.x = Math.PI / 2; addMap(mesh);
    });
  });
  const barnWallMat = new THREE.MeshLambertMaterial({ color: 0x7a2a26 });
  const barnRoofMat = new THREE.MeshLambertMaterial({ color: 0x4a301a });
  const barnTrimMat = new THREE.MeshLambertMaterial({ color: 0xc8c0a8 });
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

  // Houses — the 4 wall sides are already in S.mapFeatures.walls (placed by server) so
  // collision "just works" via the existing wall system. Here we only draw the roof,
  // window frames, and door frame that make the structure read as a house.
  (S.mapFeatures.houses || []).forEach((h, hIdx) => {
    const th = getTerrainHeight(h.cx, h.cy);
    const wallH = 70;
    const houseGroup = new THREE.Group();
    const hp = _houseParts[hIdx];
    if (hp) hp.group = houseGroup;
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x4a301a });
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x3a201a });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.55 });
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x5a3820 });

    // Gabled roof: two sloped slabs + a ridge beam along the long axis
    const isLongX = h.w >= h.d;
    const longLen = isLongX ? h.w : h.d;
    const shortLen = isLongX ? h.d : h.w;
    const eaveOverhang = 10;
    const roofSlabW = shortLen / 2 + eaveOverhang;
    const roofSlabD = longLen + eaveOverhang * 2;
    const roofGeo = new THREE.BoxGeometry(roofSlabW, 3, roofSlabD);
    const roofLift = 20; // how much higher than wall top the ridge sits
    const slopeA = Math.atan2(roofLift, shortLen / 2);
    const roofL = new THREE.Mesh(roofGeo, roofMat);
    const roofR = new THREE.Mesh(roofGeo, roofMat);
    roofL.castShadow = true; roofR.castShadow = true;
    // Slabs meet at the ridge; lift them so their inner edge meets at top
    const slabCenterOffset = (shortLen / 4) * Math.cos(slopeA);
    const slabHeight = wallH + roofLift / 2;
    if (isLongX) {
      roofL.rotation.x = slopeA;
      roofR.rotation.x = -slopeA;
      roofL.position.set(0, slabHeight, -slabCenterOffset);
      roofR.position.set(0, slabHeight, slabCenterOffset);
    } else {
      roofL.rotation.z = -slopeA;
      roofR.rotation.z = slopeA;
      roofL.position.set(-slabCenterOffset, slabHeight, 0);
      roofR.position.set(slabCenterOffset, slabHeight, 0);
    }
    houseGroup.add(roofL); houseGroup.add(roofR);
    if (hp) hp.roof.push(roofL, roofR);
    // Ridge beam
    const ridgeGeo = isLongX
      ? new THREE.BoxGeometry(4, 4, longLen + eaveOverhang * 2)
      : new THREE.BoxGeometry(longLen + eaveOverhang * 2, 4, 4);
    const ridge = new THREE.Mesh(ridgeGeo, roofMat);
    ridge.position.y = wallH + roofLift; houseGroup.add(ridge);
    if (hp) hp.roof.push(ridge);

    // Door frame + door (set into the door-side wall gap)
    const T = 20; // matches server wall thickness
    const doorW = 60, doorH = 50;
    // Returns [localX, localZ, facingY] of the door center on the given side
    const doorPlacement = (() => {
      if (h.doorSide === 'N') return [0, -h.d / 2 + T / 2, 0];
      if (h.doorSide === 'S') return [0, h.d / 2 - T / 2, Math.PI];
      if (h.doorSide === 'W') return [-h.w / 2 + T / 2, 0, Math.PI / 2];
      return [h.w / 2 - T / 2, 0, -Math.PI / 2]; // 'E'
    })();
    const [dLocalX, dLocalZ, dFacingY] = doorPlacement;
    // Frame = a dark box slightly wider/taller than the opening, recessed into the gap
    const frame = new THREE.Mesh(new THREE.BoxGeometry(doorW + 6, doorH + 6, T + 2), frameMat);
    frame.position.set(dLocalX, doorH / 2, dLocalZ);
    frame.rotation.y = dFacingY;
    houseGroup.add(frame);
    // Door itself — standing slightly ajar so it's obviously an entrance
    const door = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 2), doorMat);
    const ajar = 0.3; // radians, ~17°
    door.position.set(dLocalX, doorH / 2, dLocalZ);
    door.rotation.y = dFacingY + ajar;
    houseGroup.add(door);
    if (hp) hp.sideDecor[h.doorSide] = [frame, door];

    // Window frames + glass on the non-door walls — 1 window per side, centered
    const winW = 28, winH = 22, winY = wallH * 0.55;
    const winSides = ['N', 'S', 'E', 'W'].filter(s => s !== h.doorSide);
    for (const side of winSides) {
      let lx, lz, rot;
      if (side === 'N') { lx = 0; lz = -h.d / 2; rot = 0; }
      else if (side === 'S') { lx = 0; lz = h.d / 2; rot = Math.PI; }
      else if (side === 'W') { lx = -h.w / 2; lz = 0; rot = Math.PI / 2; }
      else { lx = h.w / 2; lz = 0; rot = -Math.PI / 2; }
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(winW + 4, winH + 4, T + 1), frameMat);
      winFrame.position.set(lx, winY, lz); winFrame.rotation.y = rot;
      houseGroup.add(winFrame);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, T + 2), glassMat);
      glass.position.set(lx, winY, lz); glass.rotation.y = rot;
      houseGroup.add(glass);
      if (hp) hp.sideDecor[side] = [winFrame, glass];
    }

    houseGroup.position.set(h.cx, th, h.cy);
    addMap(houseGroup);
  });
}

// Build a small wooden barricade mesh — planks with visible wood grain
const _barricadeMeshes = {};

// Frozen barricade template. Every barricade on the server is hardcoded to
// 52×8 (see server/combat.js: `const W = 52, H = 8`), so we build one Group
// at module load and clone(true) per spawn. Every geometry and material is
// shared-set protected so disposeMeshTree() on a clone tears down only the
// per-barricade Mesh nodes and leaves the shared resources alive for the
// next spawn.
//
// The 6 rust patches and 2 weathering streaks use random positions/radii
// that get baked into the template exactly once — every barricade will
// look identical across a round, which is fine because they never appear
// side by side in a way that makes the repetition noticeable.
function _buildBarricadeTemplate() {
  const W = 52, H_DEPTH = 8, H = 55;
  const g = new THREE.Group();
  const plankMat = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x6b4520 }));
  const darkPlank = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x4a2f15 }));
  const weatherStain = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x2a1a08, transparent: true, opacity: 0.6 }));
  const metalMat = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x5a5560 }));
  const rivetMat = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x2a262c }));
  const rustMat = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x5a2a10, transparent: true, opacity: 0.7 }));
  // Build in local coords (centered at origin, long axis along X). Callers
  // position+rotate the cloned Group.
  const body = new THREE.Mesh(markSharedGeometry(new THREE.BoxGeometry(W, H, H_DEPTH)), plankMat);
  body.position.set(0, H / 2, 0); body.castShadow = true;
  g.add(body);
  const stripeGeo = markSharedGeometry(new THREE.BoxGeometry(W + 0.2, 1.5, H_DEPTH + 0.2));
  for (let i = 1; i < 4; i++) {
    const stripe = new THREE.Mesh(stripeGeo, darkPlank);
    stripe.position.set(0, (H / 4) * i, 0);
    g.add(stripe);
  }
  // Metal armor plating on both wide faces — the lore-justified bullet blocker
  const plateInset = 4;
  const plateGeo = markSharedGeometry(new THREE.BoxGeometry(W - plateInset * 2, H - plateInset * 2, 0.8));
  const rivetGeo = markSharedGeometry(new THREE.SphereGeometry(0.7, 5, 5));
  // One unit circle shared across all 6 rust patches — random per-patch radius
  // lives in mesh.scale instead of distinct geometries.
  const rustGeo = markSharedGeometry(new THREE.CircleGeometry(1, 6));
  for (const side of [1, -1]) {
    const plate = new THREE.Mesh(plateGeo, metalMat);
    plate.position.set(0, H / 2, side * (H_DEPTH / 2 + 0.3));
    g.add(plate);
    // Rust patches — random radius baked into mesh.scale
    for (let rp = 0; rp < 3; rp++) {
      const rust = new THREE.Mesh(rustGeo, rustMat);
      const r = 1.5 + Math.random() * 2;
      rust.scale.set(r, r, 1);
      rust.position.set((Math.random() - 0.5) * (W - plateInset * 2 - 4), plateInset + 3 + Math.random() * (H - plateInset * 2 - 6), side * (H_DEPTH / 2 + 0.85));
      if (side < 0) rust.rotation.y = Math.PI;
      g.add(rust);
    }
    // Rivets in a grid pattern — all share one sphere geo
    const rivetCols = 5, rivetRows = 3;
    for (let rc = 0; rc < rivetCols; rc++) {
      for (let rr = 0; rr < rivetRows; rr++) {
        const rivet = new THREE.Mesh(rivetGeo, rivetMat);
        const rx = -W / 2 + plateInset + 3 + (rc * (W - plateInset * 2 - 6) / (rivetCols - 1));
        const ry = plateInset + 3 + (rr * (H - plateInset * 2 - 6) / (rivetRows - 1));
        rivet.position.set(rx, ry, side * (H_DEPTH / 2 + 0.9));
        g.add(rivet);
      }
    }
  }
  // Weathering dark streaks on the wood edges
  const streakGeo = markSharedGeometry(new THREE.BoxGeometry(0.5, H - 8, 0.3));
  for (let ws = 0; ws < 2; ws++) {
    const streak = new THREE.Mesh(streakGeo, weatherStain);
    streak.position.set(-W / 2 + 4 + ws * (W - 8), H / 2, H_DEPTH / 2 + 0.1);
    g.add(streak);
  }
  // Cross-beam along the wood-visible edges (not the plated face)
  const beamLen = Math.hypot(W, H) * 0.95;
  const beam1 = new THREE.Mesh(markSharedGeometry(new THREE.BoxGeometry(beamLen, 3, 0.6)), darkPlank);
  beam1.position.set(0, H / 2, 0);
  beam1.rotation.z = Math.atan2(H, W);
  g.add(beam1);
  return g;
}
const _BARRICADE_TEMPLATE = _buildBarricadeTemplate();

// When a house wall is destroyed, tear down the corresponding side's
// decorations (window or door). When ALL walls of the house are gone,
// tear down the roof too.
export function onHouseWallDestroyed(wallId) {
  const ref = _houseWallMap[wallId];
  if (!ref) return;
  const hp = _houseParts[ref.houseIdx];
  if (!hp || !hp.group) return;
  hp.destroyedWallIds.add(wallId);
  // Remove side decorations (window or door on this wall's side)
  const decor = hp.sideDecor[ref.side];
  if (decor) {
    for (const m of decor) {
      hp.group.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
    delete hp.sideDecor[ref.side];
  }
  // Check if ALL wall segments of this house are gone → remove roof
  if (hp.destroyedWallIds.size >= hp.wallIds.size && hp.roof.length > 0) {
    for (const m of hp.roof) {
      hp.group.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
    hp.roof.length = 0;
  }
}

export function addBarricade(b) {
  if (_barricadeMeshes[b.id]) return;
  const th = getTerrainHeight(b.cx, b.cy);
  // Precompute OBB rotation + terrain cache — shared/movement.js reads these
  // directly when doing client-side prediction (Phase 4). Without them the
  // client walks through every barricade and rubber bands on every reconcile.
  // Matches server/combat.js::placeBarricadeForPlayer.
  S.barricades.push({
    id: b.id, cx: b.cx, cy: b.cy, w: b.w, h: b.h, angle: b.angle,
    _cosA: Math.cos(b.angle), _sinA: Math.sin(b.angle), _terrainH: th,
  });
  // clone(true) makes fresh Mesh nodes that share the template's geos/mats.
  // The WeakSet protection in disposeMeshTree keeps the shared resources
  // alive when removeBarricade tears down this clone.
  const g = _BARRICADE_TEMPLATE.clone(true);
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
  // Spawn wood + metal debris — pooled particles with gravity
  const bData = S.barricades.find(b => b.id === id);
  if (bData) {
    const th = getTerrainHeight(bData.cx, bData.cy);
    for (let i = 0; i < 10; i++) {
      const isMetal = i < 4;
      const size = 1 + Math.random() * 2;
      spawnParticle({
        geo: PGEO_BOX, color: isMetal ? 0x5a5560 : 0x6b4520,
        x: bData.cx + (Math.random() - 0.5) * 20,
        y: th + size * 0.2 + Math.random() * 3 + 6,
        z: bData.cy + (Math.random() - 0.5) * 20,
        sx: size, sy: size * 0.3, sz: size * 0.7,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        life: 4 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 8,
        vy: 3 + Math.random() * 4,
        vz: (Math.random() - 0.5) * 8,
        gy: 80,
        rotVx: 1.5, rotVz: 1.2,
      });
    }
  }
  disposeMeshTree(m);
  delete _barricadeMeshes[id];
  S.barricades = S.barricades.filter(b => b.id !== id);
}
export function clearBarricades() {
  for (const id in _barricadeMeshes) {
    disposeMeshTree(_barricadeMeshes[id]);
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

