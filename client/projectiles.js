import * as THREE from 'three';
import { MW, MH, COL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { getAudioCtx } from './audio.js';
import { spawnParticle, PGEO_SPHERE_LO, PGEO_TORUS } from './particles.js';
import { disposeMeshTree } from './three-utils.js';

// Looping rocket sounds keyed by projectile id
const rocketSounds = {};

export function clearRocketSounds() {
  for (const id in rocketSounds) {
    try { rocketSounds[id].osc.stop(); rocketSounds[id].osc.disconnect(); rocketSounds[id].gain.disconnect(); } catch(e) {}
    delete rocketSounds[id];
  }
}

export function updateProjectiles(dt) {
  for (const p of S.projData) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.vy3d !== undefined) { p.y3d += p.vy3d * dt; }
    if (!S.projMeshes[p.id]) {
      // Bullet-shaped visual — tip points along local -Z so three.js's default
      // lookAt (which orients -Z toward target) points the nose at the velocity vector.
      const sz = p.cowtank ? 2 : p.bolty ? 1.5 : 0.75;
      const col = p.cowtank ? 0xff6600 : 0xffdd88;
      const length = sz * 4;
      const radius = sz * 0.8;
      const coneH = length * 0.4, casingH = length * 0.6;
      const m = new THREE.Group();
      // Object3D.lookAt() orients local +Z toward the target. Build with nose at local +Z.
      // Brass casing at the rear half (local -Z)
      const casingMat = new THREE.MeshBasicMaterial({ color: 0xaa7744 });
      const casing = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, casingH, 8), casingMat);
      casing.rotation.x = Math.PI / 2; // cylinder along Z
      casing.position.z = -(casingH / 2 - length * 0.1);
      m.add(casing);
      // Nose cone — apex at local +Z (front of bullet)
      const tipMat = new THREE.MeshBasicMaterial({ color: col });
      const tip = new THREE.Mesh(new THREE.ConeGeometry(radius, coneH, 8), tipMat);
      tip.rotation.x = Math.PI / 2; // +Y apex → +Z
      tip.position.z = length / 2 - coneH / 2; // cone center so apex sits at +length/2
      m.add(tip);
      // Glow trail behind the bullet (local -Z)
      const glow = new THREE.Mesh(new THREE.CylinderGeometry(radius * 2.4, radius * 0.6, length * 1.5, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 }));
      glow.rotation.x = Math.PI / 2;
      glow.position.z = -length * 0.6;
      m.add(glow);
      scene.add(m); S.projMeshes[p.id] = m;
      // Start rocket whistle sound for cowtank
      if (p.cowtank && getAudioCtx() && Object.keys(rocketSounds).length < 3) {
        const actx = getAudioCtx();
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(600, actx.currentTime);
        o.frequency.linearRampToValueAtTime(900, actx.currentTime + 2);
        const v = 0.04 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
        g.gain.setValueAtTime(v, actx.currentTime);
        o.connect(g); g.connect(actx.destination); o.start();
        rocketSounds[p.id] = { osc: o, gain: g };
      }
    }
    // Smoke trail for cowtank — uses the shared particle pool
    if (p.cowtank && S.projMeshes[p.id] && Math.random() < 0.6) {
      const pos = S.projMeshes[p.id].position;
      const s = 2 + Math.random() * 3;
      spawnParticle({
        geo: PGEO_SPHERE_LO, color: 0x888888,
        x: pos.x + (Math.random() - 0.5) * 4,
        y: pos.y + (Math.random() - 0.5) * 4,
        z: pos.z + (Math.random() - 0.5) * 4,
        sx: s,
        vy: 10,
        growth: 2,
        life: 0.6, peakOpacity: 0.5,
      });
    }
    // Bolty tracer trail — interpolates particles along the bullet's per-frame
    // path so the trail is dense even at 16800 u/s where a naive per-frame
    // spawn leaves 280-unit gaps. Particles linger 1s per spec.
    if (p.bolty && S.projMeshes[p.id]) {
      const pos = S.projMeshes[p.id].position;
      const last = p._lastTrailPos;
      if (last) {
        const steps = 4;
        for (let i = 1; i <= steps; i++) {
          const f = i / steps;
          spawnParticle({
            geo: PGEO_SPHERE_LO, color: 0xffffcc,
            x: last.x + (pos.x - last.x) * f,
            y: last.y + (pos.y - last.y) * f,
            z: last.z + (pos.z - last.z) * f,
            sx: 0.9,
            life: 1.0, peakOpacity: 0.9,
          });
        }
      }
      p._lastTrailPos = { x: pos.x, y: pos.y, z: pos.z };
    }
    // Projectiles ignore terrain and water — no visual clamping. Server is authoritative for hits.
    const terrH = getTerrainHeight(p.x, p.y);
    // Water ripple — tiny torus ring when a bullet crosses the water surface (pooled)
    const WATER_Y = -30;
    if (p.y3d <= WATER_Y && !p._splashed && terrH < WATER_Y) {
      p._splashed = true;
      spawnParticle({
        geo: PGEO_TORUS, color: 0xffffff,
        x: p.x, y: WATER_Y + 0.3, z: p.y,
        sx: 1.5, sy: 1.5, sz: 1.5,
        rotX: Math.PI / 2,
        life: 0.6, peakOpacity: 1, growth: 5, side: THREE.DoubleSide,
      });
    }
    // Client-side barricade collision prediction (blocks everything incl. L96)
    if (p.y3d < terrH + 56) {
      for (const b of S.barricades) {
        const dxB = p.x - b.cx, dyB = p.y - b.cy;
        const cosA = Math.cos(b.angle), sinA = Math.sin(b.angle);
        const lx = cosA * dxB + sinA * dyB;
        const ly = -sinA * dxB + cosA * dyB;
        if (Math.abs(lx) < b.h / 2 && Math.abs(ly) < b.w / 2) {
          p.y3d = -999; // flag for cleanup below
          break;
        }
      }
    }
    const mesh = S.projMeshes[p.id];
    mesh.position.set(p.x, p.y3d, p.y);
    // Aim the bullet along its velocity vector (world: x=server x, y=y3d, z=server y)
    const vWorldZ = p.vy; // server y-velocity maps to world z
    const aheadX = p.x + p.vx * 0.05;
    const aheadY = p.y3d + (p.vy3d || 0) * 0.05;
    const aheadZ = p.y + vWorldZ * 0.05;
    mesh.lookAt(aheadX, aheadY, aheadZ);
  }
  // In-place removal — avoids allocating a new filtered array every frame
  for (let i = S.projData.length - 1; i >= 0; i--) {
    const p = S.projData[i];
    if (p.y3d === -999 || p.x < -100 || p.x > MW + 100 || p.y < -100 || p.y > MH + 100) {
      if (S.projMeshes[p.id]) { disposeMeshTree(S.projMeshes[p.id]); delete S.projMeshes[p.id]; }
      if (rocketSounds[p.id]) { try { rocketSounds[p.id].osc.stop(); } catch(e){} delete rocketSounds[p.id]; }
      S.projData.splice(i, 1);
    }
  }
  // Clean up rocket sounds for projectiles removed elsewhere (e.g. projectileHit)
  for (const id in rocketSounds) {
    if (!S.projMeshes[id]) { try { rocketSounds[id].osc.stop(); } catch(e){} delete rocketSounds[id]; }
  }
}
