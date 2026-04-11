// Client-side bullet hole decals — flat textured planes projected onto
// surfaces. Ground hits face up; wall hits face the wall's nearest face.

import * as THREE from 'three';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import S from './state.js';

const HOLE_LIFE = 30;
const MAX_HOLES = 200;
const HOLE_SIZE = 3.5;

const _geo = new THREE.PlaneGeometry(HOLE_SIZE, HOLE_SIZE);

const _loader = new THREE.TextureLoader();
const _textures = [];
let _texturesLoaded = false;
function loadTextures() {
  if (_texturesLoaded) return;
  _texturesLoaded = true;
  for (const file of ['bullethole1.png', 'bullethole2.png']) {
    const tex = _loader.load(file);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.NearestFilter;
    _textures.push(tex);
  }
}

const _holes = [];

// Find which face of a wall AABB the impact point is closest to.
// Returns a three.js Euler that orients the decal to face outward from that face.
function getWallFaceRotation(gameX, gameY, gameZ) {
  const walls = S.mapFeatures.walls || [];
  let bestDist = Infinity, bestRot = null;

  for (const w of walls) {
    // Wall AABB in game coords: x, y, w (width along X), h (height along Y)
    const cx = w.x + w.w / 2, cy = w.y + w.h / 2;
    // Distance to each face
    const dLeft = Math.abs(gameX - w.x);
    const dRight = Math.abs(gameX - (w.x + w.w));
    const dTop = Math.abs(gameY - w.y);
    const dBottom = Math.abs(gameY - (w.y + w.h));

    // Only consider walls within reasonable range
    if (gameX < w.x - 10 || gameX > w.x + w.w + 10) continue;
    if (gameY < w.y - 10 || gameY > w.y + w.h + 10) continue;

    const minD = Math.min(dLeft, dRight, dTop, dBottom);
    if (minD < bestDist) {
      bestDist = minD;
      if (minD === dLeft || minD === dRight) {
        // East/West face — plane faces along X axis
        bestRot = new THREE.Euler(0, Math.PI / 2, Math.random() * Math.PI * 2);
      } else {
        // North/South face — plane faces along Z (game Y) axis
        bestRot = new THREE.Euler(Math.PI / 2, 0, Math.random() * Math.PI * 2);
      }
    }
  }

  // Also check barricades
  for (const b of S.barricades) {
    const dx = gameX - b.cx, dy = gameY - b.cy;
    const dist = Math.hypot(dx, dy);
    if (dist < bestDist && dist < 30) {
      bestDist = dist;
      // Barricade face normal is perpendicular to its angle
      const angle = b.angle || 0;
      bestRot = new THREE.Euler(0, angle + Math.PI / 2, Math.random() * Math.PI * 2);
    }
  }

  return bestRot;
}

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
    alphaTest: 0.1, // discard near-black pixels from the background
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
    color: 0x222222, // darken the texture for a more subtle look
  });

  const mesh = new THREE.Mesh(_geo, mat);
  const threeX = gameX, threeZ = gameY, threeY = gameZ;
  mesh.position.set(threeX, threeY, threeZ);

  const terrH = getTerrainHeight(gameX, gameY);
  const isGround = Math.abs(gameZ - terrH) < 3;

  if (isGround) {
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = Math.random() * Math.PI * 2;
    mesh.position.y = terrH + 0.1;
  } else {
    // Wall/barricade hit — find the surface face and orient the decal
    const rot = getWallFaceRotation(gameX, gameY, gameZ);
    if (rot) {
      mesh.rotation.copy(rot);
    }
    // Nudge slightly away from the wall to prevent z-fighting
    mesh.position.y = threeY;
  }

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
