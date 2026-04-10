// Resource node rendering — simple three.js geometry per node type.
// Lifecycle: spawnNode() on world load + respawn messages,
// removeNode() on depleted messages.
import * as THREE from 'three';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

const _meshes = {}; // nodeId → THREE.Group

function createNodeMesh(type) {
  const g = new THREE.Group();
  switch (type) {
    case 'grass': {
      const geo = new THREE.CylinderGeometry(8, 10, 18, 6);
      const mat = new THREE.MeshLambertMaterial({ color: 0x44aa22 });
      const m = new THREE.Mesh(geo, mat); m.position.y = 9;
      g.add(m);
      break;
    }
    case 'tree': {
      const trunkGeo = new THREE.CylinderGeometry(4, 5, 45, 6);
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat); trunk.position.y = 22;
      g.add(trunk);
      const canopyGeo = new THREE.SphereGeometry(20, 8, 6);
      const canopyMat = new THREE.MeshLambertMaterial({ color: 0x227711 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat); canopy.position.y = 50;
      g.add(canopy);
      break;
    }
    case 'rock': {
      const geo = new THREE.DodecahedronGeometry(10, 0);
      const mat = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const m = new THREE.Mesh(geo, mat); m.position.y = 7;
      g.add(m);
      break;
    }
    case 'scrap': {
      const bodyGeo = new THREE.BoxGeometry(10, 7, 12);
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x554433 });
      const body = new THREE.Mesh(bodyGeo, bodyMat); body.position.y = 3.5;
      g.add(body);
      const accentGeo = new THREE.BoxGeometry(4, 4, 4);
      const accentMat = new THREE.MeshLambertMaterial({ color: 0xcc7722 });
      const accent = new THREE.Mesh(accentGeo, accentMat); accent.position.set(3, 8, 2);
      g.add(accent);
      break;
    }
  }
  return g;
}

export function spawnNode(node) {
  if (_meshes[node.id]) return;
  const m = createNodeMesh(node.type);
  const th = getTerrainHeight(node.x, node.y);
  m.position.set(node.x, th, node.y);
  scene.add(m);
  _meshes[node.id] = m;
}

export function removeNode(id) {
  const m = _meshes[id];
  if (!m) return;
  scene.remove(m);
  m.traverse(c => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
  });
  delete _meshes[id];
}

export function clearNodes() {
  for (const id of Object.keys(_meshes)) removeNode(id);
}

// --- Sleeping bags ---
const _bagMeshes = {}; // bagId → THREE.Mesh
const _bagGeo = new THREE.BoxGeometry(18, 3, 30);
const _bagMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });

export function spawnSleepingBag(bag) {
  if (_bagMeshes[bag.id]) return;
  const m = new THREE.Mesh(_bagGeo, _bagMat);
  const th = getTerrainHeight(bag.x, bag.y);
  m.position.set(bag.x, th + 1.5, bag.y);
  scene.add(m);
  _bagMeshes[bag.id] = m;
}

export function removeSleepingBag(id) {
  const m = _bagMeshes[id];
  if (!m) return;
  scene.remove(m);
  delete _bagMeshes[id];
}

export function clearSleepingBags() {
  for (const id of Object.keys(_bagMeshes)) removeSleepingBag(id);
}
