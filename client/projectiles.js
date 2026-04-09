import * as THREE from 'three';
import { MW, MH, COL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { getAudioCtx } from './audio.js';

// Smoke trail particles for cowtank
const smokeParticles = [];
// Looping rocket sounds keyed by projectile id
const rocketSounds = {};

export function clearRocketSounds() {
  for (const id in rocketSounds) {
    try { rocketSounds[id].osc.stop(); rocketSounds[id].osc.disconnect(); rocketSounds[id].gain.disconnect(); } catch(e) {}
    delete rocketSounds[id];
  }
}

export function clearSmokeParticles() {
  for (const sp of smokeParticles) { scene.remove(sp.mesh); sp.mesh.geometry.dispose(); sp.mesh.material.dispose(); }
  smokeParticles.length = 0;
}

export function updateProjectiles(dt) {
  for (const p of S.projData) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.vy3d !== undefined) { p.y3d += p.vy3d * dt; if (p.y3d < 1) p.y3d = 1; }
    if (!S.projMeshes[p.id]) {
      const sz = p.cowtank ? 2 : p.bolty ? 1.5 : 0.75;
      const col = p.cowtank ? 0xff6600 : 0xffffff;
      const m = new THREE.Mesh(new THREE.SphereGeometry(sz, 6, 6), new THREE.MeshBasicMaterial({ color: col }));
      const glow = new THREE.Mesh(new THREE.SphereGeometry(sz * 2, 6, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3 }));
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
    // Smoke trail for cowtank
    if (p.cowtank && S.projMeshes[p.id] && Math.random() < 0.6) {
      if (smokeParticles.length >= 50) {
        const old = smokeParticles.shift();
        scene.remove(old.mesh); old.mesh.geometry.dispose(); old.mesh.material.dispose();
      }
      const sm = new THREE.Mesh(
        new THREE.SphereGeometry(2 + Math.random() * 3, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 })
      );
      const pos = S.projMeshes[p.id].position;
      sm.position.set(pos.x + (Math.random() - 0.5) * 4, pos.y + (Math.random() - 0.5) * 4, pos.z + (Math.random() - 0.5) * 4);
      scene.add(sm);
      smokeParticles.push({ mesh: sm, life: 0.6 });
    }
    // Projectiles ignore terrain — just clamp y3d so they don't go underground visually
    const terrH = getTerrainHeight(p.x, p.y);
    if (p.y3d < terrH + 1) p.y3d = terrH + 1;
    // Client-side barricade collision prediction (L96/bolty passes through)
    if (!p.bolty && p.y3d < terrH + 56) {
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
    S.projMeshes[p.id].position.set(p.x, p.y3d, p.y);
  }
  S.projData = S.projData.filter(p => {
    if (p.y3d === -999 || p.x < -100 || p.x > MW + 100 || p.y < -100 || p.y > MH + 100) {
      if (S.projMeshes[p.id]) { const pm = S.projMeshes[p.id]; scene.remove(pm); pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); delete S.projMeshes[p.id]; }
      if (rocketSounds[p.id]) { try { rocketSounds[p.id].osc.stop(); } catch(e){} delete rocketSounds[p.id]; }
      return false;
    } return true;
  });
  // Clean up rocket sounds for projectiles removed elsewhere (e.g. projectileHit)
  for (const id in rocketSounds) {
    if (!S.projMeshes[id]) { try { rocketSounds[id].osc.stop(); } catch(e){} delete rocketSounds[id]; }
  }
  // Update smoke particles
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    const sp = smokeParticles[i];
    sp.life -= dt;
    sp.mesh.material.opacity = Math.max(0, sp.life);
    sp.mesh.scale.multiplyScalar(1 + dt * 2);
    sp.mesh.position.y += dt * 10;
    if (sp.life <= 0) {
      scene.remove(sp.mesh); sp.mesh.geometry.dispose(); sp.mesh.material.dispose();
      smokeParticles.splice(i, 1);
    }
  }
}
