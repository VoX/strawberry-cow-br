// Client-side bullet hole decals — canvas-generated dark circle sprites
// projected as flat planes onto terrain and walls.

import * as THREE from 'three';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import S from './state.js';

const HOLE_LIFE = 30;
const MAX_HOLES = 200;
const HOLE_SIZE = 3;

const _geo = new THREE.PlaneGeometry(HOLE_SIZE, HOLE_SIZE);

// Programmatically generate bullet hole texture — dark circle with cracks.
// Canvas guarantees true transparency, no external asset needed.
let _tex = null;
function getTexture() {
  if (_tex) return _tex;
  const sz = 64;
  const c = document.createElement('canvas');
  c.width = sz; c.height = sz;
  const ctx = c.getContext('2d');
  // Radial gradient — dark center fading to transparent
  const g = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2);
  g.addColorStop(0, 'rgba(15,15,15,0.95)');
  g.addColorStop(0.3, 'rgba(25,25,25,0.85)');
  g.addColorStop(0.6, 'rgba(40,40,40,0.5)');
  g.addColorStop(0.85, 'rgba(50,50,50,0.15)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  // Add some random crack lines
  ctx.strokeStyle = 'rgba(20,20,20,0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const len = 8 + Math.random() * 16;
    ctx.beginPath();
    ctx.moveTo(sz/2, sz/2);
    ctx.lineTo(sz/2 + Math.cos(angle) * len, sz/2 + Math.sin(angle) * len);
    ctx.stroke();
  }
  _tex = new THREE.CanvasTexture(c);
  _tex.minFilter = THREE.LinearFilter;
  return _tex;
}

const _holes = [];

export function spawnBulletHole(gameX, gameY, gameZ, surfaceKey) {
  if (typeof gameX !== 'number' || typeof gameY !== 'number' || typeof gameZ !== 'number') return;
  if (_holes.length >= MAX_HOLES) {
    const old = _holes.shift();
    scene.remove(old.mesh);
    old.mat.dispose();
  }

  const mat = new THREE.MeshBasicMaterial({
    map: getTexture(),
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(_geo, mat);

  // Three.js coords: (gameX, gameZ, gameY)
  mesh.position.set(gameX, gameZ, gameY);

  const terrH = getTerrainHeight(gameX, gameY);
  const isGround = Math.abs(gameZ - terrH) < 3;

  if (isGround) {
    // Ground — plane faces +Y (up). PlaneGeometry default faces +Z,
    // so rotate -90° around X to face up.
    mesh.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
    mesh.position.y = terrH + 0.1;
  } else {
    // Wall/barricade — find nearest wall face normal.
    // Walls are axis-aligned boxes in game coords (x, y horizontal).
    // In three.js: wall X-faces → plane faces ±X, wall Y-faces → plane faces ±Z.
    let oriented = false;
    const walls = S.mapFeatures.walls || [];
    for (const w of walls) {
      if (gameX < w.x - 5 || gameX > w.x + w.w + 5) continue;
      if (gameY < w.y - 5 || gameY > w.y + w.h + 5) continue;

      const dLeft = Math.abs(gameX - w.x);
      const dRight = Math.abs(gameX - (w.x + w.w));
      const dFront = Math.abs(gameY - w.y);
      const dBack = Math.abs(gameY - (w.y + w.h));
      const minD = Math.min(dLeft, dRight, dFront, dBack);

      if (minD > 5) continue;

      if (minD === dLeft) {
        // Hit left face — normal points -X in game = -X in three.js
        mesh.rotation.set(0, -Math.PI / 2, Math.random() * Math.PI * 2);
        mesh.position.x = w.x - 0.1;
      } else if (minD === dRight) {
        mesh.rotation.set(0, Math.PI / 2, Math.random() * Math.PI * 2);
        mesh.position.x = w.x + w.w + 0.1;
      } else if (minD === dFront) {
        // Hit front face — normal points -Y in game = -Z in three.js
        mesh.rotation.set(0, 0, Math.random() * Math.PI * 2);
        mesh.position.z = w.y - 0.1;
      } else {
        mesh.rotation.set(0, Math.PI, Math.random() * Math.PI * 2);
        mesh.position.z = w.y + w.h + 0.1;
      }
      oriented = true;
      break;
    }

    if (!oriented) {
      // Barricade or unknown surface — face toward camera
      const cam = scene.getObjectByProperty('isCamera', true);
      if (cam) mesh.lookAt(cam.position);
      mesh.rotation.z = Math.random() * Math.PI * 2;
    }
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
