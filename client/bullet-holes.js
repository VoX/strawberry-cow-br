// Client-side bullet hole decals. Spawned by the wallImpact + projectileHit
// (wall:true) handlers in client/message-handlers.js when a projectile lands
// on a wall, barricade, terrain, or world bound. Each hole is a tiny dark
// sphere that sits at the impact point for 30 seconds, fading out the last
// few seconds of life.
//
// Pool design: separate from the particle pool in client/particles.js because
// holes have a 60× longer lifetime (30 s vs ~0.5 s) and would otherwise
// starve the particle pool's 600-entry cap during sustained combat. Hard
// MAX_HOLES cap with FIFO eviction so a 30-player full-auto rave can't
// unbounded-grow the scene graph.
//
// Material is per-hole (not shared) so individual fade-out doesn't bleed
// across siblings. Geometry IS shared — one tiny sphere geo for every hole.

import * as THREE from 'three';
import { scene } from './renderer.js';
import { markSharedGeometry } from './three-utils.js';

const HOLE_LIFE = 30;     // seconds before the hole disappears
const HOLE_FADE = 4;      // seconds spent fading at the end of life
const MAX_HOLES = 200;    // FIFO cap
const HOLE_RADIUS = 2.5;  // sphere radius — needs to poke noticeably out
                          // of whatever surface it's half-buried in
const HOLE_PEAK_OPACITY = 1.0;

// Shared low-poly sphere — small enough that 200 of them is trivial.
const _geo = markSharedGeometry(new THREE.SphereGeometry(HOLE_RADIUS, 6, 4));

// { mesh, mat, life, surfaceKey } for every active hole. surfaceKey ties
// the hole to a wall or barricade so the wall/barricade-destroyed handlers
// can remove decals when the surface they're sitting on vanishes.
const _holes = [];

export function spawnBulletHole(gameX, gameY, gameZ, surfaceKey) {
  if (typeof gameX !== 'number' || typeof gameY !== 'number' || typeof gameZ !== 'number') return;
  if (_holes.length >= MAX_HOLES) {
    const old = _holes.shift();
    scene.remove(old.mesh);
    old.mat.dispose();
  }
  const mat = new THREE.MeshBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: HOLE_PEAK_OPACITY,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(_geo, mat);
  // Game coords (x, y, z=up) → three coords (x, y=up, z).
  mesh.position.set(gameX, gameZ, gameY);
  scene.add(mesh);
  _holes.push({ mesh, mat, life: HOLE_LIFE, surfaceKey: surfaceKey || null });
}

// Drop every hole tied to a given surface key. Called from the
// wallDestroyed / barricadeDestroyed handlers — without this, decals
// keep floating in mid-air after the surface they were on vanishes.
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
      continue;
    }
    if (h.life < HOLE_FADE) {
      h.mat.opacity = (h.life / HOLE_FADE) * HOLE_PEAK_OPACITY;
    }
  }
}

// Round-reset hook — drop every active hole when a new round starts so the
// scene doesn't carry impacts across rounds. Called from the start handler.
export function clearBulletHoles() {
  for (const h of _holes) {
    scene.remove(h.mesh);
    h.mat.dispose();
  }
  _holes.length = 0;
}
