import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { WPCOL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { disposeMeshTree, fbxLoadingManager } from './three-utils.js';

// PickupRenderer — owns mesh lifecycle for armor, weapon, and food pickups.
const _armorMeshes = {};
const _weaponMeshes = {};
const _foodMeshes = {};
let _armorSpawns = [];

// Reconcile a mesh-id map against the set of ids the server is still telling us
// about: anything in the map but not in `seen` gets disposed and removed.
function _reconcileMap(meshMap, seen) {
  for (const id in meshMap) {
    if (!seen.has(id)) {
      disposeMeshTree(meshMap[id]);
      delete meshMap[id];
    }
  }
}

function _buildArmorMesh(a) {
  // Potion bottle — glass body + cork + glowing liquid
  const g = new THREE.Group();
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x5588ff, transparent: true, opacity: 0.6 });
  const liquidMat = new THREE.MeshBasicMaterial({ color: 0x3366ff });
  const corkMat = new THREE.MeshLambertMaterial({ color: 0xaa8855 });
  // Bottle body — rounded cylinder
  const body = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 10, 8), glassMat);
  g.add(body);
  // Liquid inside — slightly smaller, opaque
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 7, 8), liquidMat);
  liquid.position.y = -1; g.add(liquid);
  // Bottle neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 3, 8), glassMat);
  neck.position.y = 6; g.add(neck);
  // Cork stopper — sits on top of the neck
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 2, 6), corkMat);
  cork.position.y = 7; g.add(cork);
  // Glow aura
  const glow = new THREE.Mesh(new THREE.SphereGeometry(10, 8, 8), new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.15 }));
  g.add(glow);
  g.position.set(a.x, getTerrainHeight(a.x, a.y) + 15, a.y);
  return g;
}

function _buildWeaponPickupModel(type) {
  const g = new THREE.Group();
  const dark = new THREE.MeshLambertMaterial({ color: 0x444444 });
  const metal = new THREE.MeshLambertMaterial({ color: 0x999999 });
  const olive = new THREE.MeshLambertMaterial({ color: 0x556B2F });
  const black = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const wood = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
  if (type === 'shotgun') {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 14, 6), dark);
    barrel.rotation.z = Math.PI / 2; g.add(barrel);
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 1.5), black);
    body.position.x = -2; g.add(body);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 1.2), wood);
    stock.position.x = -6; g.add(stock);
  } else if (type === 'burst') {
    // Load M16 FBX model, fallback to procedural
    const loader = new FBXLoader(fbxLoadingManager);
    loader.load('models/M16_ps1.fbx', fbx => {
      fbx.scale.set(0.05, 0.05, 0.05);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      const grayMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
      fbx.traverse(c => { if (c.isMesh) c.material = grayMat; });
      g.add(fbx);
    }, undefined, () => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 6), dark);
      barrel.rotation.z = Math.PI / 2; g.add(barrel);
      const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 1.5), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
      body.position.x = -1; g.add(body);
    });
  } else if (type === 'bolty') {
    // Load Sniper FBX model, fallback to procedural
    const loader = new FBXLoader(fbxLoadingManager);
    loader.load('models/Sniper.fbx', fbx => {
      fbx.scale.set(0.0175, 0.0175, 0.0175);
      fbx.rotation.set(Math.PI, Math.PI, Math.PI);
      fbx.traverse(c => {
        if (c.isMesh) c.material = new THREE.MeshBasicMaterial({ color: 0x2a3a2a });
      });
      g.add(fbx);
    }, undefined, () => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 16, 6), new THREE.MeshLambertMaterial({ color: 0x2a3a2a }));
      barrel.rotation.z = Math.PI / 2; g.add(barrel);
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4, 6), dark);
      scope.rotation.z = Math.PI / 2; scope.position.set(-1, 1.5, 0); g.add(scope);
    });
  } else if (type === 'cowtank') {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 12, 8), olive);
    tube.rotation.z = Math.PI / 2; g.add(tube);
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 0.4), metal);
    sight.position.set(5, 2, 0); g.add(sight);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0xffdd00 }));
    band.rotation.z = Math.PI / 2; band.position.x = -2; g.add(band);
  } else if (type === 'aug') {
    // Steyr AUG silhouette — bullpup layout (mag behind trigger), integrated
    // 1.5x optic, forward grip, olive plastic body. The +X axis is the
    // barrel direction (matching the other procedural pickup builders).
    const augBody = new THREE.MeshLambertMaterial({ color: 0x4a6038 });
    const augBlk  = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const augMet  = new THREE.MeshLambertMaterial({ color: 0x777777 });
    // Rear stock + receiver — chunky bullpup body
    const stock = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 1.6), augBody);
    stock.position.set(-3, 0, 0); g.add(stock);
    // Front handguard — slimmer, ahead of the trigger
    const fore = new THREE.Mesh(new THREE.BoxGeometry(4, 1.6, 1.4), augBody);
    fore.position.set(2.5, -0.2, 0); g.add(fore);
    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 6, 6), augBlk);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(5.5, 0.1, 0); g.add(barrel);
    // Integrated optic — scope tube on top of receiver, with a ring at each end
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 4.2, 8), augBlk);
    scope.rotation.z = Math.PI / 2; scope.position.set(-1.4, 1.55, 0); g.add(scope);
    const ringA = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 8), augMet);
    ringA.rotation.z = Math.PI / 2; ringA.position.set(0.5, 1.55, 0); g.add(ringA);
    const ringB = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 8), augMet);
    ringB.rotation.z = Math.PI / 2; ringB.position.set(-3.3, 1.55, 0); g.add(ringB);
    // Forward vertical grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.9), augBlk);
    grip.position.set(2.2, -1.6, 0); g.add(grip);
    // Trigger guard — small underslung loop just behind the forward grip
    const trig = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.6), augMet);
    trig.position.set(0.6, -1.5, 0); g.add(trig);
  } else if (type === 'mp5k') {
    // MP5K pickup — compact stockless SMG
    const recv = new THREE.Mesh(new THREE.BoxGeometry(5, 1.8, 1.6), black);
    g.add(recv);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 6), dark);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(4, 0.2, 0); g.add(barrel);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3, 1.2), black);
    mag.position.set(-0.5, -2, 0); mag.rotation.z = 0.1; g.add(mag);
    const fgrip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, 0.7), dark);
    fgrip.position.set(1.5, -1.3, 0); g.add(fgrip);
  } else if (type === 'akm') {
    // AKM pickup — distinctive curved mag, wooden stock
    const recv = new THREE.Mesh(new THREE.BoxGeometry(7, 1.8, 1.4), dark);
    g.add(recv);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5, 6), dark);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(6, 0.2, 0); g.add(barrel);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(4, 1.3, 1.0), wood);
    stock.position.set(-5.5, -0.2, 0); stock.rotation.z = 0.06; g.add(stock);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.5, 1.3), dark);
    mag.position.set(-1, -2.5, 0); mag.rotation.z = 0.15; g.add(mag);
    const gasT = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4, 6), metal);
    gasT.rotation.z = Math.PI / 2; gasT.position.set(3, 1.0, 0); g.add(gasT);
  } else if (type === 'sks') {
    // SKS pickup — long wooden rifle
    const recv = new THREE.Mesh(new THREE.BoxGeometry(7, 1.8, 1.4), dark);
    g.add(recv);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 6, 6), dark);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(6, 0.2, 0); g.add(barrel);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 1.0), wood);
    stock.position.set(-6, -0.2, 0); stock.rotation.z = 0.08; g.add(stock);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2, 1.2), dark);
    mag.position.set(-1, -1.8, 0); g.add(mag);
  } else if (type === 'thompson') {
    // Thompson pickup — classic SMG with wooden stock
    const recv = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 1.6), dark);
    g.add(recv);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4, 6), dark);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(5, 0.2, 0); g.add(barrel);
    const comp = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8), metal);
    comp.rotation.z = Math.PI / 2; comp.position.set(4, 0.2, 0); g.add(comp);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(4, 1.4, 1.0), wood);
    stock.position.set(-5, -0.3, 0); stock.rotation.z = 0.1; g.add(stock);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.5, 1.3), dark);
    mag.position.set(-1, -2.5, 0); g.add(mag);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2, 1.0), wood);
    grip.position.set(0.5, -1.8, 0); g.add(grip);
  } else if (type === 'python') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 1.0), dark);
    g.add(frame);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.0, 8), metal);
    cyl.rotation.z = Math.PI / 2; cyl.position.set(-0.5, 0, 0); g.add(cyl);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3, 6), dark);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(3, 0.2, 0); g.add(barrel);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 0.9), wood);
    grip.position.set(-1.5, -1.2, 0); grip.rotation.z = 0.15; g.add(grip);
  } else if (type === 'm249') {
    const recv = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 1.6), olive);
    g.add(recv);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 6), dark);
    barrel.rotation.z = Math.PI / 2; barrel.position.set(7, 0.2, 0); g.add(barrel);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.0), olive);
    stock.position.set(-5.5, -0.3, 0); g.add(stock);
    const ammoBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 1.5), olive);
    ammoBox.position.set(-0.5, -2, 0); g.add(ammoBox);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 2), dark);
    handle.position.set(0, 1.5, 0); g.add(handle);
  } else if (type === 'minigun') {
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 3, 8), dark);
    housing.rotation.z = Math.PI / 2; housing.position.set(-2, 0, 0); g.add(housing);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 4), dark);
      tube.rotation.z = Math.PI / 2;
      tube.position.set(2, Math.sin(angle) * 0.6, Math.cos(angle) * 0.6);
      g.add(tube);
    }
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.4, 8), metal);
    clamp.rotation.z = Math.PI / 2; clamp.position.set(4.5, 0, 0); g.add(clamp);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.8), black);
    grip.position.set(-1, -1.8, 0); g.add(grip);
  }
  return g;
}

const _WP_LABELS = { shotgun: 'XM1014', burst: 'M16A2', bolty: 'L96', cowtank: 'M72 LAW', aug: 'AUG', mp5k: 'MP5SD', thompson: 'THOMPSON', sks: 'SKS', akm: 'AK', python: 'PYTHON', m249: 'M249', minigun: 'MINIGUN' };

function _buildWeaponPickupGroup(w) {
  const g = new THREE.Group();
  const model = _buildWeaponPickupModel(w.weapon);
  model.scale.set(1.5, 1.5, 1.5);
  model.position.y = 15; g.add(model);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(12, 8, 8), new THREE.MeshBasicMaterial({ color: WPCOL[w.weapon] || 0xffaa00, transparent: true, opacity: 0.15 }));
  glow.position.y = 15; g.add(glow);
  const lc = document.createElement('canvas'); lc.width = 128; lc.height = 32;
  const lctx = lc.getContext('2d'); lctx.font = 'bold 20px Segoe UI'; lctx.textAlign = 'center';
  lctx.fillStyle = '#fff'; lctx.fillText(_WP_LABELS[w.weapon] || w.weapon.toUpperCase(), 64, 22);
  const ltex = new THREE.CanvasTexture(lc); ltex.minFilter = THREE.LinearFilter;
  const ls = new THREE.Sprite(new THREE.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
  ls.position.set(0, 28, 0); ls.scale.set(30, 8, 1); g.add(ls);
  g.position.set(w.x, getTerrainHeight(w.x, w.y), w.y);
  return g;
}

function _buildFoodModel(type, golden) {
  const g = new THREE.Group();
  if (golden) {
    // Golden star
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(6, 0), new THREE.MeshLambertMaterial({ color: 0xffdd00 }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(9, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.2 }));
    g.add(star); g.add(glow);
  } else if (type === 'strawberry') {
    const body = new THREE.Mesh(new THREE.ConeGeometry(3.5, 7, 6), new THREE.MeshLambertMaterial({ color: 0xff2244 }));
    body.rotation.x = Math.PI; body.position.y = 3.5; g.add(body);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(4, 2, 4), new THREE.MeshLambertMaterial({ color: 0x22aa22 }));
    leaf.position.y = 7.5; g.add(leaf);
  } else if (type === 'cake') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 5, 8), new THREE.MeshLambertMaterial({ color: 0xffcc88 }));
    base.position.y = 2.5; g.add(base);
    const frosting = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 1.5, 8), new THREE.MeshLambertMaterial({ color: 0xff88aa }));
    frosting.position.y = 5.5; g.add(frosting);
    const cherry = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 6), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    cherry.position.y = 7; g.add(cherry);
  } else if (type === 'pizza') {
    const slice = new THREE.Mesh(new THREE.ConeGeometry(5, 1.5, 3), new THREE.MeshLambertMaterial({ color: 0xffcc44 }));
    slice.rotation.x = Math.PI / 2; slice.position.y = 3; g.add(slice);
    const pep1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0xcc2200 }));
    pep1.position.set(0, 3.8, -1); g.add(pep1);
    const pep2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0xcc2200 }));
    pep2.position.set(1.5, 3.8, 1); g.add(pep2);
  } else if (type === 'icecream') {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3, 6, 6), new THREE.MeshLambertMaterial({ color: 0xddaa55 }));
    cone.rotation.x = Math.PI; cone.position.y = 3; g.add(cone);
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(3.5, 6, 6), new THREE.MeshLambertMaterial({ color: 0xffeedd }));
    scoop.position.y = 6.5; g.add(scoop);
    const scoop2 = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6), new THREE.MeshLambertMaterial({ color: 0xff88aa }));
    scoop2.position.y = 9.5; g.add(scoop2);
  } else if (type === 'donut') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 1.5, 6, 12), new THREE.MeshLambertMaterial({ color: 0xddaa66 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 4; g.add(ring);
    const glaze = new THREE.Mesh(new THREE.TorusGeometry(3, 1.6, 6, 12), new THREE.MeshLambertMaterial({ color: 0xff66aa }));
    glaze.rotation.x = Math.PI / 2; glaze.position.y = 4.5; glaze.scale.set(1, 1, 0.3); g.add(glaze);
  } else if (type === 'cupcake') {
    const wrapper = new THREE.Mesh(new THREE.CylinderGeometry(3, 2.5, 4, 8), new THREE.MeshLambertMaterial({ color: 0xffaa44 }));
    wrapper.position.y = 2; g.add(wrapper);
    const swirl = new THREE.Mesh(new THREE.ConeGeometry(3.5, 5, 8), new THREE.MeshLambertMaterial({ color: 0xff88cc }));
    swirl.position.y = 6.5; g.add(swirl);
  } else if (type === 'cookie') {
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 1.5, 8), new THREE.MeshLambertMaterial({ color: 0xcc8833 }));
    disk.position.y = 3; g.add(disk);
    for (let i = 0; i < 4; i++) {
      const chip = new THREE.Mesh(new THREE.SphereGeometry(0.6, 4, 4), new THREE.MeshLambertMaterial({ color: 0x442200 }));
      chip.position.set(Math.cos(i * 1.6) * 2, 4, Math.sin(i * 1.6) * 2); g.add(chip);
    }
  } else {
    // Fallback sphere
    const m = new THREE.Mesh(new THREE.SphereGeometry(4, 6, 6), new THREE.MeshLambertMaterial({ color: 0xff3355 }));
    m.position.y = 4; g.add(m);
  }
  return g;
}

// Per-frame sync: reconciles scene graph with server state (S.clientWeapons, S.serverFoods, _armorSpawns).
export function updatePickups(time) {
  // Armor
  const seenArmor = new Set();
  for (const a of _armorSpawns) {
    const aid = String(a.id); seenArmor.add(aid);
    if (!_armorMeshes[aid]) {
      const m = _buildArmorMesh(a);
      scene.add(m);
      _armorMeshes[aid] = m;
    }
    _armorMeshes[aid].rotation.y = time * 2;
    _armorMeshes[aid].position.y = getTerrainHeight(a.x, a.y) + 15 + Math.sin(time * 3) * 3;
  }
  _reconcileMap(_armorMeshes, seenArmor);

  // Weapons. Constant 0.33s blink cycle in the last 4 s of life;
  // visible fraction shrinks 0.85 → 0.10 over the warning so urgency
  // ramps without strobe-light feel.
  const seenWp = new Set();
  const nowMs = Date.now();
  const WEAPON_LIFETIME = 15000;
  const WEAPON_BLINK_START = WEAPON_LIFETIME - 4000;
  const BLINK_CYCLE = 0.33; // seconds per full visible+invisible cycle
  for (const w of S.clientWeapons) {
    const wid = String(w.id); seenWp.add(wid);
    if (!_weaponMeshes[wid]) {
      const g = _buildWeaponPickupGroup(w);
      scene.add(g);
      _weaponMeshes[wid] = g;
    }
    const g = _weaponMeshes[wid];
    g.children[0].rotation.y = time * 2;
    g.children[0].position.y = 15 + Math.sin(time * 3 + w.x) * 3;
    const age = w.spawnTime ? nowMs - w.spawnTime : 0;
    if (age > WEAPON_BLINK_START) {
      const warningElapsed = age - WEAPON_BLINK_START;
      // visibleFrac: 0.85 at warning start → 0.10 at despawn
      const t01 = Math.min(1, warningElapsed / 4000);
      const visibleFrac = 0.85 - t01 * 0.75;
      const cyclePos = (time % BLINK_CYCLE) / BLINK_CYCLE;
      const v = cyclePos < visibleFrac;
      if (g.visible !== v) g.visible = v;
    } else if (!g.visible) {
      g.visible = true;
    }
  }
  _reconcileMap(_weaponMeshes, seenWp);

  // Food
  const seenFood = new Set();
  for (const f of S.serverFoods) {
    const fid = String(f.id); seenFood.add(fid);
    if (!_foodMeshes[fid]) {
      const m = _buildFoodModel(f.type, f.golden);
      m.scale.set(2, 2, 2);
      m.position.set(f.x, getTerrainHeight(f.x, f.y) + 12, f.y);
      scene.add(m);
      _foodMeshes[fid] = m;
    }
    const fm = _foodMeshes[fid];
    fm.position.y = getTerrainHeight(f.x, f.y) + 12 + Math.sin(time * 2 + f.x * 0.01) * 3;
    fm.rotation.y = time * 1.5;
  }
  _reconcileMap(_foodMeshes, seenFood);
}

// Handler-facing: mutate armor spawn list + mesh map.
export function setArmorSpawns(list) {
  _armorSpawns = list || [];
}

export function onArmorSpawn(a) {
  _armorSpawns.push({ id: a.id, x: a.x, y: a.y });
}

export function onArmorPickup(pickupId) {
  if (_armorMeshes[pickupId]) {
    disposeMeshTree(_armorMeshes[pickupId]);
    delete _armorMeshes[pickupId];
  }
  _armorSpawns = _armorSpawns.filter(a => a.id !== pickupId);
}

// Round reset: bulk-dispose all pickup meshes and clear spawn list.
export function clearPickups() {
  for (const id in _foodMeshes) { disposeMeshTree(_foodMeshes[id]); delete _foodMeshes[id]; }
  for (const id in _weaponMeshes) { disposeMeshTree(_weaponMeshes[id]); delete _weaponMeshes[id]; }
  for (const id in _armorMeshes) { disposeMeshTree(_armorMeshes[id]); delete _armorMeshes[id]; }
  _armorSpawns = [];
}
