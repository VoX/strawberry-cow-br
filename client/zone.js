import * as THREE from 'three';
import { MW, MH } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';

let _zoneMeshes = [];
export function updateZone() {
  const z = S.serverZone;
  _zoneMeshes.forEach(m => scene.remove(m)); _zoneMeshes = [];
  if (z.w >= MW - 10 && z.h >= MH - 10) return;
  const wallH = 160;
  const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
  const n = new THREE.Mesh(new THREE.PlaneGeometry(z.w, wallH), mat);
  n.position.set(z.x + z.w / 2, wallH / 2, z.y); scene.add(n); _zoneMeshes.push(n);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(z.w, wallH), mat);
  s.position.set(z.x + z.w / 2, wallH / 2, z.y + z.h); scene.add(s); _zoneMeshes.push(s);
  const w = new THREE.Mesh(new THREE.PlaneGeometry(z.h, wallH), mat);
  w.position.set(z.x, wallH / 2, z.y + z.h / 2); w.rotation.y = Math.PI / 2; scene.add(w); _zoneMeshes.push(w);
  const e = new THREE.Mesh(new THREE.PlaneGeometry(z.h, wallH), mat);
  e.position.set(z.x + z.w, wallH / 2, z.y + z.h / 2); e.rotation.y = Math.PI / 2; scene.add(e); _zoneMeshes.push(e);
  const gmat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
  if (z.y > 10) { const g = new THREE.Mesh(new THREE.PlaneGeometry(MW, z.y), gmat); g.rotation.x = -Math.PI / 2; g.position.set(MW / 2, 1, z.y / 2); scene.add(g); _zoneMeshes.push(g); }
  if (z.y + z.h < MH - 10) { const g = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH - z.y - z.h), gmat); g.rotation.x = -Math.PI / 2; g.position.set(MW / 2, 1, (z.y + z.h + MH) / 2); scene.add(g); _zoneMeshes.push(g); }
  if (z.x > 10) { const g = new THREE.Mesh(new THREE.PlaneGeometry(z.x, z.h), gmat); g.rotation.x = -Math.PI / 2; g.position.set(z.x / 2, 1, z.y + z.h / 2); scene.add(g); _zoneMeshes.push(g); }
  if (z.x + z.w < MW - 10) { const g = new THREE.Mesh(new THREE.PlaneGeometry(MW - z.x - z.w, z.h), gmat); g.rotation.x = -Math.PI / 2; g.position.set((z.x + z.w + MW) / 2, 1, z.y + z.h / 2); scene.add(g); _zoneMeshes.push(g); }
}
