import * as THREE from 'three';
import { scene } from './renderer.js';
import { markSharedGeometry } from './three-utils.js';

// Shared geometries — reused across all particle spawns. Scale is applied per-instance
// via the Mesh's .scale, so these are all unit-sized. Marked shared so eviction
// (releaseEntry) / disposeMeshTree callers can't dispose the one global copy.
export const PGEO_SPHERE_LO = markSharedGeometry(new THREE.SphereGeometry(1, 4, 4)); // cheap sphere for debris/sparks
export const PGEO_SPHERE_MED = markSharedGeometry(new THREE.SphereGeometry(1, 6, 6)); // medium for fireballs/explosions
export const PGEO_BOX = markSharedGeometry(new THREE.BoxGeometry(1, 1, 1)); // shards, debris chunks
export const PGEO_TORUS = markSharedGeometry(new THREE.TorusGeometry(1, 0.1, 4, 16)); // rings — scale dictates actual radius

// Pool of reusable { mesh, mat } entries. Free entries live in _freePool; in-flight
// particles live in _active. Pool has a hard cap so a single huge spawn burst (cowstrike:
// ~650 particles) doesn't leave hundreds of idle materials in memory forever.
// MAX_ACTIVE_PARTICLES caps the *live* side too — evicts the oldest particle when
// a new spawn would exceed it, so sustained cowstrike fire can't stall the frame
// budget or starve the free pool.
const MAX_FREE_POOL = 600;
const MAX_ACTIVE_PARTICLES = 600;
const _freePool = [];
const _active = [];

function releaseEntry(entry) {
  scene.remove(entry.mesh);
  if (_freePool.length >= MAX_FREE_POOL) {
    entry.mat.dispose();
    return;
  }
  _freePool.push(entry);
}

function borrowEntry() {
  const entry = _freePool.pop();
  if (entry) return entry;
  const mat = new THREE.MeshBasicMaterial({ transparent: true });
  const mesh = new THREE.Mesh(PGEO_SPHERE_LO, mat);
  return { mesh, mat };
}

/**
 * Spawn a pooled particle. Options:
 *   geo: one of the PGEO_* constants (default PGEO_SPHERE_LO)
 *   color: hex number
 *   x, y, z: world position
 *   sx, sy, sz: scale (default 1)
 *   life: lifetime in seconds
 *   peakOpacity: max opacity (fades to 0 linearly over life, default 1)
 *   vx, vy, vz: linear velocity (units/sec)
 *   gy: gravity (subtracted from vy per second)
 *   growth: per-second uniform scale multiplier delta (e.g. 2 = doubles per sec)
 *   rotX, rotY, rotZ: initial rotation
 *   rotVx, rotVz: angular velocity (rad/sec)
 *   side: THREE.DoubleSide if needed (for torus/ring)
 */
export function spawnParticle(opts) {
  // Evict the oldest active particle when at cap, freeing its pool slot for
  // the new entry. FIFO eviction — no priority/age weighting, the only
  // guarantee is bounded memory + frame budget.
  if (_active.length >= MAX_ACTIVE_PARTICLES) {
    const old = _active.shift();
    releaseEntry(old.entry);
  }
  const entry = borrowEntry();
  entry.mesh.geometry = opts.geo || PGEO_SPHERE_LO;
  entry.mat.color.setHex(opts.color != null ? opts.color : 0xffffff);
  entry.mat.opacity = opts.peakOpacity != null ? opts.peakOpacity : 1;
  entry.mat.side = opts.side || THREE.FrontSide;
  entry.mesh.position.set(opts.x, opts.y, opts.z);
  entry.mesh.scale.set(opts.sx || 1, opts.sy || opts.sx || 1, opts.sz || opts.sx || 1);
  entry.mesh.rotation.set(opts.rotX || 0, opts.rotY || 0, opts.rotZ || 0);
  scene.add(entry.mesh);
  _active.push({
    entry,
    life: opts.life,
    lifeMax: opts.life,
    vx: opts.vx || 0, vy: opts.vy || 0, vz: opts.vz || 0,
    gy: opts.gy || 0,
    growth: opts.growth || 0,
    peakOpacity: opts.peakOpacity != null ? opts.peakOpacity : 1,
    rotVx: opts.rotVx || 0,
    rotVz: opts.rotVz || 0,
  });
}

export function updateParticles(dt) {
  for (let i = _active.length - 1; i >= 0; i--) {
    const p = _active[i];
    p.life -= dt;
    if (p.life <= 0) {
      releaseEntry(p.entry);
      _active.splice(i, 1);
      continue;
    }
    const m = p.entry.mesh;
    m.position.x += p.vx * dt;
    m.position.y += p.vy * dt;
    m.position.z += p.vz * dt;
    if (p.gy) p.vy -= p.gy * dt;
    if (p.growth) { const g = 1 + p.growth * dt; m.scale.x *= g; m.scale.y *= g; m.scale.z *= g; }
    if (p.rotVx) m.rotation.x += p.rotVx * dt;
    if (p.rotVz) m.rotation.z += p.rotVz * dt;
    p.entry.mat.opacity = Math.max(0, p.peakOpacity * (p.life / p.lifeMax));
  }
}

// Nuke all active particles and shrink the idle pool back to its cap (called at round transition)
export function clearParticles() {
  for (const p of _active) releaseEntry(p.entry);
  _active.length = 0;
  while (_freePool.length > MAX_FREE_POOL) _freePool.pop().mat.dispose();
}
