import * as THREE from 'three';
import { MW, MH } from './config.js';
import { scene } from './renderer.js';

const GRID_W = 200, GRID_H = 150;
const heightMap = new Float32Array((GRID_W + 1) * (GRID_H + 1));

function generateHeightMap(seed) {
  const s1 = Math.sin(seed * 1.1) * 0.002 + 0.004;
  const s2 = Math.cos(seed * 2.3) * 0.002 + 0.005;
  const s3 = Math.sin(seed * 3.7) * 0.004 + 0.01;
  const s4 = Math.cos(seed * 4.1) * 0.003 + 0.007;
  const s5 = Math.sin(seed * 5.3) * 0.001 + 0.003;
  const s6 = Math.cos(seed * 6.7) * 0.002 + 0.004;
  const a1 = 15 + Math.sin(seed * 7.1) * 8;
  const a2 = 12 + Math.cos(seed * 8.3) * 6;
  const a3 = 8 + Math.sin(seed * 9.7) * 5;
  const a4 = 10 + Math.cos(seed * 10.1) * 6;
  for (let row = 0; row <= GRID_H; row++) {
    for (let col = 0; col <= GRID_W; col++) {
      const wx = col * MW / GRID_W;
      const wz = row * MH / GRID_H;
      const h = Math.sin(wx * s1) * a1 + Math.cos(wz * s2) * a2 + Math.sin(wx * s3 + wz * s4) * a3 + Math.cos(wx * s5 - wz * s6) * a4;
      heightMap[row * (GRID_W + 1) + col] = h;
    }
  }
}

// Initial generation
generateHeightMap(0);

export function getTerrainHeight(x, z) {
  const gx = Math.max(0, Math.min(GRID_W, x / MW * GRID_W));
  const gy = Math.max(0, Math.min(GRID_H, z / MH * GRID_H));
  const col = Math.floor(gx), row = Math.floor(gy);
  const fx = gx - col, fy = gy - row;
  const c1 = Math.min(col + 1, GRID_W), r1 = Math.min(row + 1, GRID_H);
  const h00 = heightMap[row * (GRID_W + 1) + col];
  const h10 = heightMap[row * (GRID_W + 1) + c1];
  const h01 = heightMap[r1 * (GRID_W + 1) + col];
  const h11 = heightMap[r1 * (GRID_W + 1) + c1];
  return h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy;
}

// Shared geometry refs for rebuilding
const gndPad = 800;
const extW = MW + gndPad * 2, extH = MH + gndPad * 2;
const grassMat = new THREE.MeshLambertMaterial({ color: 0x4a9b3a });
const mtMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
const snowMat = new THREE.MeshLambertMaterial({ color: 0xeeeeff });

let gndMesh = null, mtMesh = null, snowMesh = null, waterMesh = null;
let fenceMeshes = [];

function clearTerrainMeshes() {
  [gndMesh, waterMesh].forEach(m => { if (m) { scene.remove(m); m.geometry.dispose(); if (m.material) m.material.dispose(); } });
  [mtMesh, snowMesh].forEach(m => { if (m) { scene.remove(m); m.geometry.dispose(); } });
  fenceMeshes.forEach(m => { scene.remove(m); if (m.geometry) m.geometry.dispose(); });
  fenceMeshes = [];
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

  // Fence
  const bm = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const postGeo = new THREE.CylinderGeometry(2, 2, 30, 5);
  const fenceStep = 25;
  function addFencePost(x, z) {
    const th = getTerrainHeight(x, z);
    const post = new THREE.Mesh(postGeo, bm);
    post.position.set(x, th + 15, z);
    scene.add(post); fenceMeshes.push(post);
  }
  function addFenceRail(x1, z1, x2, z2) {
    const th1 = getTerrainHeight(x1, z1), th2 = getTerrainHeight(x2, z2);
    const mx = (x1+x2)/2, mz = (z1+z2)/2, mth = (th1+th2)/2;
    const dist = Math.hypot(x2-x1, z2-z1);
    const angle = Math.atan2(x2-x1, z2-z1);
    for (const rh of [22, 12]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3, 3, dist), bm);
      rail.position.set(mx, mth + rh, mz); rail.rotation.y = angle;
      scene.add(rail); fenceMeshes.push(rail);
    }
  }
  for (let x = 0; x <= MW; x += fenceStep) {
    addFencePost(x, 0); addFencePost(x, MH);
    if (x < MW) { addFenceRail(x, 0, x+fenceStep, 0); addFenceRail(x, MH, x+fenceStep, MH); }
  }
  for (let z = 0; z <= MH; z += fenceStep) {
    addFencePost(0, z); addFencePost(MW, z);
    if (z < MH) { addFenceRail(0, z, 0, z+fenceStep); addFenceRail(MW, z, MW, z+fenceStep); }
  }
}

// Build initial terrain
buildTerrainMeshes();

export function rebuildTerrain(seed) {
  clearTerrainMeshes();
  generateHeightMap(seed);
  buildTerrainMeshes();
}
