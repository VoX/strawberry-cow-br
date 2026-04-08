import * as THREE from 'three';
import { MW, MH } from './config.js';
import { scene } from './renderer.js';

// STEP 1: Generate collision heightmap as the single source of truth
const GRID_W = 200, GRID_H = 150;
const heightMap = new Float32Array((GRID_W + 1) * (GRID_H + 1));
for (let row = 0; row <= GRID_H; row++) {
  for (let col = 0; col <= GRID_W; col++) {
    const wx = col * MW / GRID_W;
    const wz = row * MH / GRID_H;
    const h = Math.sin(wx * 0.004) * 20 + Math.cos(wz * 0.005) * 15 + Math.sin(wx * 0.01 + wz * 0.007) * 10 + Math.cos(wx * 0.003 - wz * 0.004) * 12;
    heightMap[row * (GRID_W + 1) + col] = h;
  }
}

// STEP 2: Height lookup reads from the collision heightmap
export function getTerrainHeight(x, z) {
  const col = Math.max(0, Math.min(GRID_W, (x / MW * GRID_W) | 0));
  const row = Math.max(0, Math.min(GRID_H, (z / MH * GRID_H) | 0));
  return heightMap[row * (GRID_W + 1) + col];
}

// STEP 3: Build visual mesh from the SAME heightmap data
const gndGeo = new THREE.PlaneGeometry(MW, MH, GRID_W, GRID_H);
const gndPos = gndGeo.attributes.position;
for (let i = 0; i < gndPos.count; i++) {
  const wx = gndPos.getX(i) + MW / 2;
  const wz = MH / 2 - gndPos.getY(i);
  const col = Math.max(0, Math.min(GRID_W, Math.round(wx / MW * GRID_W)));
  const row = Math.max(0, Math.min(GRID_H, Math.round(wz / MH * GRID_H)));
  gndPos.setZ(i, heightMap[row * (GRID_W + 1) + col]);
}
gndGeo.computeVertexNormals();
const gnd = new THREE.Mesh(gndGeo, new THREE.MeshLambertMaterial({ color: 0x4a8c3f }));
gnd.rotation.x = -Math.PI / 2; gnd.position.set(MW / 2, 0, MH / 2); gnd.receiveShadow = true; scene.add(gnd);

// Border fence — follows terrain with posts and rails
const bm = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
const postGeo = new THREE.CylinderGeometry(2, 2, 30, 5);
function buildFenceLine(points) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const th = getTerrainHeight(p.x, p.z);
    const post = new THREE.Mesh(postGeo, bm);
    post.position.set(p.x, th + 15, p.z);
    scene.add(post);
    if (i < points.length - 1) {
      const n = points[i + 1];
      const nth = getTerrainHeight(n.x, n.z);
      const mx = (p.x + n.x) / 2, mz = (p.z + n.z) / 2;
      const dist = Math.hypot(n.x - p.x, n.z - p.z);
      const mth = (th + nth) / 2;
      const angle = Math.atan2(n.x - p.x, n.z - p.z);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3, 3, dist), bm);
      rail.position.set(mx, mth + 22, mz);
      rail.rotation.y = angle;
      scene.add(rail);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(3, 3, dist), bm);
      rail2.position.set(mx, mth + 12, mz);
      rail2.rotation.y = angle;
      scene.add(rail2);
    }
  }
}
const fenceN = [], fenceS = [], fenceE = [], fenceW = [];
const fenceStep = 25;
for (let x = 0; x <= MW; x += fenceStep) { fenceN.push({ x, z: 0 }); fenceS.push({ x, z: MH }); }
for (let z = 0; z <= MH; z += fenceStep) { fenceW.push({ x: 0, z }); fenceE.push({ x: MW, z }); }
buildFenceLine(fenceN); buildFenceLine(fenceS); buildFenceLine(fenceW); buildFenceLine(fenceE);
