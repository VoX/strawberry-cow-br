import * as THREE from 'three';
import { WPCOL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';

export function updatePickups(time) {
  // Armor pickups (blue shields)
  if (!window._armorMeshes) window._armorMeshes = {};
  if (!window._armorPickupData) window._armorPickupData = [];
  const seenArmor = new Set();
  for (const a of window._armorPickupData) {
    const aid = String(a.id); seenArmor.add(aid);
    if (!window._armorMeshes[aid]) {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(8, 0), new THREE.MeshBasicMaterial({ color: 0x5588ff }));
      const glow = new THREE.Mesh(new THREE.OctahedronGeometry(12, 0), new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.2 }));
      m.add(glow); m.position.set(a.x, getTerrainHeight(a.x, a.y) + 15, a.y);
      scene.add(m); window._armorMeshes[aid] = m;
    }
    window._armorMeshes[aid].rotation.y = time * 2;
    window._armorMeshes[aid].position.y = getTerrainHeight(a.x, a.y) + 15 + Math.sin(time * 3) * 3;
  }
  for (const id in window._armorMeshes) { if (!seenArmor.has(id)) { scene.remove(window._armorMeshes[id]); delete window._armorMeshes[id]; } }

  // Weapon pickups
  if (!window._wpMeshes) window._wpMeshes = {};
  const seenWp = new Set();
  for (const w of S.clientWeapons) {
    const wid = String(w.id); seenWp.add(wid);
    if (!window._wpMeshes[wid]) {
      const g = new THREE.Group();
      const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: WPCOL[w.weapon] || 0xffaa00 }));
      cube.position.y = 15; g.add(cube);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(12, 8, 8), new THREE.MeshBasicMaterial({ color: WPCOL[w.weapon] || 0xffaa00, transparent: true, opacity: 0.2 }));
      glow.position.y = 15; g.add(glow);
      const lc = document.createElement('canvas'); lc.width = 128; lc.height = 32;
      const lctx = lc.getContext('2d'); lctx.font = 'bold 20px Segoe UI'; lctx.textAlign = 'center';
      const _wpLabels = { shotgun: 'BENELLI', burst: 'LR-300', bolty: 'L96', cowtank: 'LAW' };
      lctx.fillStyle = '#fff'; lctx.fillText(_wpLabels[w.weapon] || w.weapon.toUpperCase(), 64, 22);
      const ltex = new THREE.CanvasTexture(lc); ltex.minFilter = THREE.LinearFilter;
      const ls = new THREE.Sprite(new THREE.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
      ls.position.set(0, 28, 0); ls.scale.set(30, 8, 1); g.add(ls);
      g.position.set(w.x, getTerrainHeight(w.x, w.y), w.y);
      scene.add(g); window._wpMeshes[wid] = g;
    }
    window._wpMeshes[wid].children[0].rotation.y = time * 2;
    window._wpMeshes[wid].children[0].position.y = 15 + Math.sin(time * 3 + w.x) * 3;
    window._wpMeshes[wid].children[1].position.y = 15;
  }
  for (const id in window._wpMeshes) { if (!seenWp.has(id)) { scene.remove(window._wpMeshes[id]); delete window._wpMeshes[id]; } }

  // Food
  if (!window._foodMeshes) window._foodMeshes = {};
  if (!window._foodGeo) {
    window._foodGeo = new THREE.SphereGeometry(4, 6, 6);
    window._foodGeoGold = new THREE.SphereGeometry(6, 6, 6);
    window._foodMatNormal = new THREE.MeshLambertMaterial({ color: 0xff3355 });
    window._foodMatPoison = new THREE.MeshLambertMaterial({ color: 0xaa00ff });
    window._foodMatGold = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
  }
  const seenFood = new Set();
  for (const f of S.serverFoods) {
    const fid = String(f.id);
    seenFood.add(fid);
    if (!window._foodMeshes[fid]) {
      const geo = f.golden ? window._foodGeoGold : window._foodGeo;
      const mat = f.poisoned ? window._foodMatPoison : f.golden ? window._foodMatGold : window._foodMatNormal;
      const m = new THREE.Mesh(geo, mat);
      m.position.set(f.x, 6, f.y);
      scene.add(m);
      window._foodMeshes[fid] = m;
    }
    window._foodMeshes[fid].position.y = 5 + Math.sin(time * 2 + f.x * 0.01) * 3 + getTerrainHeight(f.x, f.y);
  }
  for (const id in window._foodMeshes) {
    if (!seenFood.has(id)) { scene.remove(window._foodMeshes[id]); delete window._foodMeshes[id]; }
  }
}
