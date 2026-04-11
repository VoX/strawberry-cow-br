// Client-side bullet hole decals — flat textured planes projected onto
// terrain and walls. Uses PlaneGeometry oriented to the surface normal
// with polygonOffset to prevent z-fighting.
//
// Two bullet hole texture variants are loaded at init and randomly
// picked per hole. Each hole gets a random Z-rotation for variety.

import * as THREE from 'three';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

const HOLE_LIFE = 30;     // seconds before the hole disappears
const MAX_HOLES = 200;    // FIFO cap
const HOLE_SIZE = 3.5;    // world units — diameter of the decal

// Shared geometry — one plane for all decals.
const _geo = new THREE.PlaneGeometry(HOLE_SIZE, HOLE_SIZE);

// Load bullet hole textures
const _loader = new THREE.TextureLoader();
const _textures = [];
let _texturesLoaded = false;
function loadTextures() {
  if (_texturesLoaded) return;
  _texturesLoaded = true;
  for (const file of ['bullethole1.png', 'bullethole2.png']) {
    const tex = _loader.load(file);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.NearestFilter; // pixel art crisp
    _textures.push(tex);
  }
}

const _holes = [];

export function spawnBulletHole(gameX, gameY, gameZ, surfaceKey) {
  loadTextures();
  if (typeof gameX !== 'number' || typeof gameY !== 'number' || typeof gameZ !== 'number') return;
  if (_textures.length === 0) return;
  if (_holes.length >= MAX_HOLES) {
    const old = _holes.shift();
    scene.remove(old.mesh);
    old.mat.dispose();
  }

  const tex = _textures[Math.random() * _textures.length | 0];
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(_geo, mat);

  // Position in three.js coords (x, y=up, z)
  const threeX = gameX, threeZ = gameY, threeY = gameZ;
  mesh.position.set(threeX, threeY, threeZ);

  // Orient the decal to face the surface.
  // Determine if this is a ground hit or wall hit by checking if gameZ
  // is near the terrain height at this position.
  const terrH = getTerrainHeight(gameX, gameY);
  const isGround = Math.abs(gameZ - terrH) < 3;

  if (isGround) {
    // Ground decal — face up (default PlaneGeometry faces +Z in local space,
    // rotate to face +Y which is up in three.js)
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = terrH + 0.1; // slight offset above terrain
  } else {
    // Wall decal — determine which wall face was hit by checking nearby
    // wall geometry. For now, use a heuristic: leave the plane facing
    // the camera (sprite-like behavior for walls). Not perfect but
    // better than a sphere.
    // TODO: compute actual wall normal from wall AABB
  }

  // Random rotation around the surface normal for variety
  mesh.rotation.z = Math.random() * Math.PI * 2;

  scene.add(mesh);
  _holes.push({ mesh, mat, life: HOLE_LIFE, surfaceKey: surfaceKey || null });
}

export function removeBulletHolesBySurfaceKey(surfaceKey) {
  if (!surfaceKey) return;
  for (let i = _holes.length - 1; i >= 0; i--) {
    if (_holes[i].surfaceKey === surfaceKey) {
      scene.remove(_holes[i].mesh);
      _holes[i].mat.dispose();
      _holes.splice(i, 1);
    }
  }
}

export function updateBulletHoles(dt) {
  for (let i = _holes.length - 1; i >= 0; i--) {
    const h = _holes[i];
    h.life -= dt;
    if (h.life <= 0) {
      scene.remove(h.mesh);
      h.mat.dispose();
      _holes.splice(i, 1);
    }
  }
}

export function clearBulletHoles() {
  for (const h of _holes) {
    scene.remove(h.mesh);
    h.mat.dispose();
  }
  _holes.length = 0;
}
