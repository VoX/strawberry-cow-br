import * as THREE from 'three';
import { MW, MH, COL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

export function updateProjectiles(dt) {
  for (const p of S.projData) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.vy3d !== undefined) { p.y3d += p.vy3d * dt; if (!p.bolty) p.vy3d -= 20 * dt; if (p.y3d < 1) p.y3d = 1; }
    if (!S.projMeshes[p.id]) {
      const sz = p.cowtank ? 4 : p.bolty ? 3 : 1.5;
      const c = COL[p.color] || 0xffff00;
      const m = new THREE.Mesh(new THREE.SphereGeometry(sz, 6, 6), new THREE.MeshBasicMaterial({ color: c }));
      const glow = new THREE.Mesh(new THREE.SphereGeometry(sz * 2, 6, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3 }));
      m.add(glow);
      scene.add(m); S.projMeshes[p.id] = m;
    }
    const terrH = getTerrainHeight(p.x, p.y);
    if (p.y3d < terrH + 1) {
      if (S.projMeshes[p.id]) { const pm = S.projMeshes[p.id]; scene.remove(pm); pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); delete S.projMeshes[p.id]; }
      p.y3d = -999;
    } else {
      S.projMeshes[p.id].position.set(p.x, p.y3d, p.y);
    }
  }
  S.projData = S.projData.filter(p => {
    if (p.y3d === -999 || p.x < -100 || p.x > MW + 100 || p.y < -100 || p.y > MH + 100) {
      if (S.projMeshes[p.id]) { const pm = S.projMeshes[p.id]; scene.remove(pm); pm.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); delete S.projMeshes[p.id]; }
      return false;
    } return true;
  });
}
