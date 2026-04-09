import * as THREE from 'three';
import { MW, MH } from './config.js';
import { scene } from './renderer.js';
// Shared terrain math lives in shared/terrain-math.js so client and server
// are bit-identical by construction. Required for CSP (Phase 4) where the
// client simulates movement locally and needs the same getGroundHeight
// output the server uses for collision + z-clamping.
import { GRID_W, GRID_H, generateHeightMap, sampleHeight } from '../shared/terrain-math.js';

const heightMap = new Float32Array((GRID_W + 1) * (GRID_H + 1));

// Initial generation (seed 0 — overwritten by rebuildTerrain on start/spectate)
generateHeightMap(0, heightMap, MW, MH);

export function getTerrainHeight(x, z) {
  return sampleHeight(heightMap, MW, MH, x, z);
}

// Shared geometry refs for rebuilding
const gndPad = 800;
const extW = MW + gndPad * 2, extH = MH + gndPad * 2;
const grassMat = new THREE.MeshLambertMaterial({ color: 0x3a7830 });
const mtMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
const snowMat = new THREE.MeshLambertMaterial({ color: 0xeeeeff });

let gndMesh = null, mtMesh = null, snowMesh = null, waterMesh = null;
// Fence is consolidated into 2 InstancedMeshes — posts and rails — instead of ~240 individual meshes
let fencePostMesh = null, fenceRailMesh = null;

function clearTerrainMeshes() {
  [gndMesh, waterMesh].forEach(m => { if (m) { scene.remove(m); m.geometry.dispose(); if (m.material) m.material.dispose(); } });
  [mtMesh, snowMesh].forEach(m => { if (m) { scene.remove(m); m.geometry.dispose(); } });
  [fencePostMesh, fenceRailMesh].forEach(m => { if (m) { scene.remove(m); m.geometry.dispose(); } });
  fencePostMesh = fenceRailMesh = null;
  gndMesh = mtMesh = snowMesh = waterMesh = null;
}

function buildTerrainMeshes() {
  // Ground plane — extended to mountain edges
  const gndSegsX = GRID_W, gndSegsY = GRID_H;
  const gndGeo = new THREE.PlaneGeometry(extW, extH, gndSegsX, gndSegsY);
  const gndPos = gndGeo.attributes.position;
  for (let i = 0; i < gndPos.count; i++) {
    const wx = gndPos.getX(i) + extW / 2 - gndPad;
    const wz = extH / 2 - gndPos.getY(i) - gndPad;
    const cx = Math.max(0, Math.min(MW, wx)), cz = Math.max(0, Math.min(MH, wz));
    gndPos.setZ(i, getTerrainHeight(cx, cz));
  }
  gndGeo.computeVertexNormals();
  gndMesh = new THREE.Mesh(gndGeo, grassMat);
  gndMesh.rotation.x = -Math.PI / 2; gndMesh.position.set(MW / 2, 0, MH / 2); gndMesh.receiveShadow = true;
  scene.add(gndMesh);

  // Mountains
  const mtGeo = new THREE.PlaneGeometry(extW, extH, 30, 30);
  const mtPos = mtGeo.attributes.position;
  for (let i = 0; i < mtPos.count; i++) {
    const lx = mtPos.getX(i) + extW / 2, ly = mtPos.getY(i) + extH / 2;
    const wx = lx - gndPad, wz = ly - gndPad;
    const outsideX = wx < 0 ? -wx : wx > MW ? wx - MW : 0;
    const outsideZ = wz < 0 ? -wz : wz > MH ? wz - MH : 0;
    const outsideDist = Math.max(outsideX, outsideZ);
    if (outsideDist <= 0) {
      mtPos.setZ(i, getTerrainHeight(Math.max(0, Math.min(MW, wx)), Math.max(0, Math.min(MH, wz))));
    } else {
      const d = outsideDist / gndPad;
      const edgeH = getTerrainHeight(Math.max(0, Math.min(MW, wx)), Math.max(0, Math.min(MH, wz)));
      const baseH = d * d * 600 + d * 120;
      const noise = Math.sin(wx * 0.008) * 50 + Math.cos(wz * 0.01) * 40 + Math.sin(wx * 0.02 + wz * 0.015) * 30;
      mtPos.setZ(i, edgeH + baseH + noise * d);
    }
  }
  mtGeo.computeVertexNormals();
  mtMesh = new THREE.Mesh(mtGeo, mtMat);
  mtMesh.rotation.x = -Math.PI / 2; mtMesh.position.set(MW / 2, -80, MH / 2);
  scene.add(mtMesh);

  // Snow caps
  const sGeo = mtGeo.clone();
  const sPos = sGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const h = mtPos.getZ(i);
    sPos.setZ(i, h > 485 ? h + 3 : -9999);
  }
  sGeo.computeVertexNormals();
  snowMesh = new THREE.Mesh(sGeo, snowMat);
  snowMesh.rotation.x = -Math.PI / 2; snowMesh.position.set(MW / 2, -79, MH / 2);
  scene.add(snowMesh);

  // Water
  const wGeo = new THREE.PlaneGeometry(extW, extH);
  waterMesh = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0x2266aa, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  waterMesh.rotation.x = -Math.PI / 2; waterMesh.position.set(MW / 2, -30, MH / 2);
  scene.add(waterMesh);

  // Fence — consolidated into 2 InstancedMeshes (posts + rails) instead of ~240 individual meshes
  const bm = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const postGeo = new THREE.CylinderGeometry(2, 2, 30, 5);
  // Unit rail geometry (length 1 on Z) — each instance scales Z to its actual length
  const railGeo = new THREE.BoxGeometry(3, 3, 1);
  const fenceStep = 25;

  // Pre-count posts and rails so we can allocate exact-size InstancedMeshes
  const postSlots = [];
  const railSlots = [];
  for (let x = 0; x <= MW; x += fenceStep) {
    postSlots.push([x, 0]); postSlots.push([x, MH]);
    if (x < MW) { railSlots.push([x, 0, x + fenceStep, 0]); railSlots.push([x, MH, x + fenceStep, MH]); }
  }
  for (let z = 0; z <= MH; z += fenceStep) {
    postSlots.push([0, z]); postSlots.push([MW, z]);
    if (z < MH) { railSlots.push([0, z, 0, z + fenceStep]); railSlots.push([MW, z, MW, z + fenceStep]); }
  }

  fencePostMesh = new THREE.InstancedMesh(postGeo, bm, postSlots.length);
  const postMat4 = new THREE.Matrix4();
  const postPos = new THREE.Vector3();
  for (let i = 0; i < postSlots.length; i++) {
    const [x, z] = postSlots[i];
    postPos.set(x, getTerrainHeight(x, z) + 15, z);
    postMat4.makeTranslation(postPos.x, postPos.y, postPos.z);
    fencePostMesh.setMatrixAt(i, postMat4);
  }
  fencePostMesh.instanceMatrix.needsUpdate = true;
  scene.add(fencePostMesh);

  // Rails: 2 per segment (high + low), so instance count is railSlots.length * 2
  fenceRailMesh = new THREE.InstancedMesh(railGeo, bm, railSlots.length * 2);
  const railMat4 = new THREE.Matrix4();
  const railPos = new THREE.Vector3();
  const railQuat = new THREE.Quaternion();
  const railScale = new THREE.Vector3();
  const _railYAxis = new THREE.Vector3(0, 1, 0);
  let railIdx = 0;
  for (const [x1, z1, x2, z2] of railSlots) {
    const th1 = getTerrainHeight(x1, z1), th2 = getTerrainHeight(x2, z2);
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, mth = (th1 + th2) / 2;
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);
    railQuat.setFromAxisAngle(_railYAxis, angle);
    railScale.set(1, 1, dist);
    for (const rh of [22, 12]) {
      railPos.set(mx, mth + rh, mz);
      railMat4.compose(railPos, railQuat, railScale);
      fenceRailMesh.setMatrixAt(railIdx++, railMat4);
    }
  }
  fenceRailMesh.instanceMatrix.needsUpdate = true;
  scene.add(fenceRailMesh);
}

// Build initial terrain
buildTerrainMeshes();

export function rebuildTerrain(seed) {
  clearTerrainMeshes();
  generateHeightMap(seed, heightMap, MW, MH);
  buildTerrainMeshes();
}
