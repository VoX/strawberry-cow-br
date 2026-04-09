import * as THREE from 'three';
import { COL } from './config.js';
import S from './state.js';
import { scene } from './renderer.js';
import { getTerrainHeight } from './terrain.js';
import { spawnParticle, PGEO_SPHERE_LO } from './particles.js';
import { disposeMeshTree, markSharedGeometry, markSharedMaterial } from './three-utils.js';
import { interpSamplePlayer } from './interp.js';

const _wispTmpPos = new THREE.Vector3();

// -----------------------------------------------------------------------------
// Cow geometry/material cache
// -----------------------------------------------------------------------------
// Every cow previously allocated ~25 BufferGeometries + 10+ materials inside
// buildCow, plus 4-13 more in the hat block. With 16 cows at round start that's
// 500+ allocations in a burst, all of which disposeMeshTree was discarding at
// the next round reset only for buildCow to re-allocate them. Pure GC churn.
//
// Now every unique geometry is built once at module load, registered with
// markSharedGeometry, and reused by the per-cow Mesh instances. Same pattern
// for fixed-color materials. Per-team body materials are memoized in
// _cowBodyMats (at most 8 entries — one per team color).
//
// Death-fade safety: the fade path in updateCows used to mutate
// `c.material.transparent`/`opacity` directly, which would corrupt shared
// materials. It now clones the material first (see the isDead branch below).
// -----------------------------------------------------------------------------

// Shared geometries — built once, cloned into meshes. Protected from
// disposeMeshTree via markSharedGeometry.
const COW_GEO = {
  torso: new THREE.BoxGeometry(14, 18, 10),
  head: new THREE.BoxGeometry(10, 10, 10),
  spotLarge: new THREE.CircleGeometry(3, 8),      // side spots
  spot25: new THREE.CircleGeometry(2.5, 8),       // top spot
  spot22: new THREE.CircleGeometry(2.2, 8),       // chest spot
  spot16: new THREE.CircleGeometry(1.6, 8),       // chest spot small
  spot24: new THREE.CircleGeometry(2.4, 8),       // rump spot
  spot18: new THREE.CircleGeometry(1.8, 8),       // rump spot small
  eye: new THREE.SphereGeometry(2, 6, 6),
  pupil: new THREE.SphereGeometry(1, 6, 6),
  brow: new THREE.BoxGeometry(3, 0.6, 0.6),
  mouth2: new THREE.TorusGeometry(2, 0.4, 6, 12, Math.PI),    // smile + frown
  mouth15: new THREE.TorusGeometry(1.5, 0.4, 6, 12, Math.PI), // sad
  cigBody: new THREE.CylinderGeometry(0.4, 0.4, 4, 4),
  cigFilter: new THREE.CylinderGeometry(0.45, 0.45, 1.5, 4),
  cigEmber: new THREE.SphereGeometry(0.5, 4, 4),
  cigEmberGlow: new THREE.SphereGeometry(1, 4, 4),
  horn: new THREE.ConeGeometry(1.5, 8, 5),
  leg: new THREE.CylinderGeometry(2.5, 2, 12, 5),
  hoof: new THREE.BoxGeometry(4, 2, 5),
  udder: new THREE.SphereGeometry(3, 6, 6),
  teat: new THREE.CylinderGeometry(0.5, 0.3, 2, 4),
  arm: new THREE.CylinderGeometry(1.5, 1.5, 12, 5),
};
for (const g of Object.values(COW_GEO)) markSharedGeometry(g);

// Fixed-color shared materials.
const COW_SPOT_MAT     = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }));
const COW_UDDER_MAT    = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xff88aa }));
const COW_HOOF_MAT     = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x444444 }));
const COW_EYE_MAT      = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0xffffff }));
const COW_PUPIL_MAT    = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0x222222 }));
const COW_MOUTH_MAT    = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0x222222 }));
const COW_CIG_BODY_MAT   = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
const COW_CIG_FILTER_MAT = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xdd8833 }));
const COW_CIG_EMBER_MAT  = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0xff4400 }));
const COW_CIG_EMBER_GLOW_MAT = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.25 }));

// Per-team-color body material cache. One MeshLambertMaterial per unique
// color hex — the 8 team colors resolve to 8 entries at most, reused across
// all cows of the same color. Everything (torso, head, horns, legs, arms)
// that was `whiteMat`/`hm` in the old buildCow uses this.
const _cowBodyMats = new Map();
function getCowBodyMat(colorHex) {
  let mat = _cowBodyMats.get(colorHex);
  if (!mat) {
    mat = new THREE.MeshLambertMaterial({ color: colorHex });
    markSharedMaterial(mat);
    _cowBodyMats.set(colorHex, mat);
  }
  return mat;
}

// ---- Hat templates --------------------------------------------------------
// Built once at module load, cloned per-cow via Group.clone(true). The clone
// creates fresh Mesh instances that reference the same (shared-marked)
// geometry and material as the template, so every cow of the same hat shape
// shares the GPU state cost. Hats are picked by `Math.abs(p.id || 0) % 5`.

function _buildCowboyHatTemplate() {
  const g = new THREE.Group();
  const hatBrown = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x6a3a1a }));
  const hatBand  = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x3a1a08 }));
  const brimGeo  = markSharedGeometry(new THREE.CylinderGeometry(8, 8, 0.8, 16));
  const crownGeo = markSharedGeometry(new THREE.CylinderGeometry(4, 4.5, 4, 12));
  const bandGeo  = markSharedGeometry(new THREE.CylinderGeometry(4.6, 4.6, 0.8, 12));
  const topGeo   = markSharedGeometry(new THREE.CylinderGeometry(4, 4, 0.4, 12));
  const brim  = new THREE.Mesh(brimGeo, hatBrown);  brim.position.y = 38.5; g.add(brim);
  const crown = new THREE.Mesh(crownGeo, hatBrown); crown.position.y = 41;  g.add(crown);
  const band  = new THREE.Mesh(bandGeo, hatBand);   band.position.y = 39.5; g.add(band);
  const top   = new THREE.Mesh(topGeo, hatBrown);   top.position.y = 43;    g.add(top);
  return g;
}

function _buildWizardHatTemplate() {
  const g = new THREE.Group();
  const purpleMat  = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x6a2299 }));
  const brownBand  = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x6a3a1a }));
  const yellowMat  = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xffdd00 }));
  const wizBrimGeo = markSharedGeometry(new THREE.CylinderGeometry(7, 7, 0.6, 16));
  const wizConeGeo = markSharedGeometry(new THREE.ConeGeometry(5, 14, 12));
  const wizBandGeo = markSharedGeometry(new THREE.CylinderGeometry(5.2, 5.2, 1, 12));
  const buckleGeo  = markSharedGeometry(new THREE.BoxGeometry(2, 1.5, 0.5));
  const wizBrim = new THREE.Mesh(wizBrimGeo, purpleMat); wizBrim.position.y = 38.5; g.add(wizBrim);
  const wizCone = new THREE.Mesh(wizConeGeo, purpleMat); wizCone.position.y = 46;   g.add(wizCone);
  const wizBand = new THREE.Mesh(wizBandGeo, brownBand); wizBand.position.y = 39.5; g.add(wizBand);
  const buckle  = new THREE.Mesh(buckleGeo, yellowMat);  buckle.position.set(0, 39.5, 5.3); g.add(buckle);
  return g;
}

function _buildCrownHatTemplate() {
  const g = new THREE.Group();
  const goldMat   = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xffdd00 }));
  const baseGeo   = markSharedGeometry(new THREE.CylinderGeometry(5, 5, 3, 12));
  const spikeGeo  = markSharedGeometry(new THREE.ConeGeometry(0.8, 3.5, 6));
  const jewelGeo  = markSharedGeometry(new THREE.OctahedronGeometry(0.7, 0));
  const bigJewelGeo = markSharedGeometry(new THREE.OctahedronGeometry(1.2, 0));
  // Jewel colors get one shared MeshLambertMaterial each.
  const jewelColors = [0xff2222, 0x22ff22, 0x2222ff, 0xff22ff, 0xffff22];
  const jewelMats = jewelColors.map(col => markSharedMaterial(new THREE.MeshLambertMaterial({ color: col })));
  const bigJewelMat = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xff2244 }));
  const base = new THREE.Mesh(baseGeo, goldMat); base.position.y = 39; g.add(base);
  for (let pi = 0; pi < 6; pi++) {
    const ang = (pi / 6) * Math.PI * 2;
    const spike = new THREE.Mesh(spikeGeo, goldMat);
    spike.position.set(Math.cos(ang) * 4.5, 42, Math.sin(ang) * 4.5);
    g.add(spike);
    const jewel = new THREE.Mesh(jewelGeo, jewelMats[pi % jewelMats.length]);
    jewel.position.set(Math.cos(ang) * 4.5, 44.5, Math.sin(ang) * 4.5);
    g.add(jewel);
  }
  const bigJewel = new THREE.Mesh(bigJewelGeo, bigJewelMat);
  bigJewel.position.set(0, 39, 5); g.add(bigJewel);
  return g;
}

function _buildCapHatTemplate() {
  const g = new THREE.Group();
  const capColor = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0x2244aa }));
  const domeGeo  = markSharedGeometry(new THREE.SphereGeometry(5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2));
  const visorGeo = markSharedGeometry(new THREE.BoxGeometry(8, 0.5, 5));
  const btnGeo   = markSharedGeometry(new THREE.SphereGeometry(0.6, 6, 6));
  const dome  = new THREE.Mesh(domeGeo, capColor);  dome.position.y = 39; g.add(dome);
  const visor = new THREE.Mesh(visorGeo, capColor); visor.position.set(0, 39, 5); g.add(visor);
  const btn   = new THREE.Mesh(btnGeo, capColor);   btn.position.y = 44; g.add(btn);
  return g;
}

function _buildPartyHatTemplate() {
  const g = new THREE.Group();
  const partyMat    = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xff44aa }));
  const partyConeGeo = markSharedGeometry(new THREE.ConeGeometry(4, 12, 12));
  const spotGeo     = markSharedGeometry(new THREE.SphereGeometry(0.6, 6, 6));
  const pomGeo      = markSharedGeometry(new THREE.SphereGeometry(1.2, 6, 6));
  const pomMat      = markSharedMaterial(new THREE.MeshLambertMaterial({ color: 0xffffff }));
  const spotColors  = [0xffdd44, 0x44ffdd, 0x44ddff, 0xddff44];
  const spotMats    = spotColors.map(col => markSharedMaterial(new THREE.MeshLambertMaterial({ color: col })));
  const partyCone = new THREE.Mesh(partyConeGeo, partyMat); partyCone.position.y = 44; g.add(partyCone);
  for (let si = 0; si < 8; si++) {
    const spot = new THREE.Mesh(spotGeo, spotMats[si % spotMats.length]);
    const ang = (si / 8) * Math.PI * 2;
    const sy = 40 + (si % 3) * 2.5;
    const sr = 3.5 - (si % 3) * 0.7;
    spot.position.set(Math.cos(ang) * sr, sy, Math.sin(ang) * sr);
    g.add(spot);
  }
  const pom = new THREE.Mesh(pomGeo, pomMat); pom.position.y = 50.5; g.add(pom);
  return g;
}

// One template per hat type, built once at module load. cloneHat(type)
// returns a fresh Group whose Mesh children reference the same shared geo/mats.
const _HAT_TEMPLATES = {
  cowboy: _buildCowboyHatTemplate(),
  wizard: _buildWizardHatTemplate(),
  crown:  _buildCrownHatTemplate(),
  cap:    _buildCapHatTemplate(),
  party:  _buildPartyHatTemplate(),
};
function cloneHat(type) {
  const tpl = _HAT_TEMPLATES[type] || _HAT_TEMPLATES.party;
  return tpl.clone(true);
}

// Shared bubble/debug geometries. Previously allocated inline in updateCows,
// so every (cow, armor-pickup) pair built a fresh 156-vert SphereGeometry.
// Marked shared so disposeMeshTree on cow teardown leaves the singletons alive.
const SHIELD_BUBBLE_GEO = markSharedGeometry(new THREE.SphereGeometry(24, 12, 12));
const SPAWN_BUBBLE_GEO  = markSharedGeometry(new THREE.SphereGeometry(25, 12, 12));
// Debug hitbox primitives — one per cow when debug mode is on, shared so that
// toggling debug off and on again doesn't leak the old geometries.
const DEBUG_BODY_GEO  = markSharedGeometry(new THREE.CylinderGeometry(18, 18, 1, 12)); // scaled per-cow in Y
const DEBUG_HEAD_GEO  = markSharedGeometry(new THREE.CylinderGeometry(12, 12, 20, 12));
const DEBUG_ARROW_SHAFT_GEO = markSharedGeometry(new THREE.CylinderGeometry(0.8, 0.8, 30, 6));
const DEBUG_ARROW_HEAD_GEO  = markSharedGeometry(new THREE.ConeGeometry(2.5, 5, 6));
const DEBUG_BODY_MAT  = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.3 }));
const DEBUG_HEAD_MAT  = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0xff4444, wireframe: true, transparent: true, opacity: 0.3 }));
const DEBUG_ARROW_MAT = markSharedMaterial(new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true, transparent: true, opacity: 0.7 }));

export function buildCow(color, personality) {
  const c = COL[color] || 0xff88aa;
  const bodyMat = getCowBodyMat(c);
  const g = new THREE.Group();
  // Upright torso — only the torso and head cast shadows. Everything else
  // (limbs, horns, eyes, spots, hat pieces, udder, cigarette) is visually too
  // small to matter but costs shadow-map draws each frame.
  const torso = new THREE.Mesh(COW_GEO.torso, bodyMat); torso.position.set(0, 18, 0); torso.castShadow = true; g.add(torso);
  // Spots on torso
  const s1 = new THREE.Mesh(COW_GEO.spotLarge, COW_SPOT_MAT); s1.position.set(-7.1, 20, 0); s1.rotation.y = -Math.PI/2; g.add(s1);
  const s2 = new THREE.Mesh(COW_GEO.spotLarge, COW_SPOT_MAT); s2.position.set(7.1, 16, -1); s2.rotation.y = Math.PI/2; g.add(s2);
  const s3 = new THREE.Mesh(COW_GEO.spot25, COW_SPOT_MAT); s3.position.set(0, 27.1, 1); s3.rotation.x = -Math.PI/2; g.add(s3);
  // Front spots (chest)
  const s4 = new THREE.Mesh(COW_GEO.spot22, COW_SPOT_MAT); s4.position.set(-2.5, 22, 5.1); g.add(s4);
  const s5 = new THREE.Mesh(COW_GEO.spot16, COW_SPOT_MAT); s5.position.set(3, 15, 5.1); g.add(s5);
  // Back spots (rump)
  const s6 = new THREE.Mesh(COW_GEO.spot24, COW_SPOT_MAT); s6.position.set(2, 19, -5.1); s6.rotation.y = Math.PI; g.add(s6);
  const s7 = new THREE.Mesh(COW_GEO.spot18, COW_SPOT_MAT); s7.position.set(-3, 24, -5.1); s7.rotation.y = Math.PI; g.add(s7);
  // Head on top
  const head = new THREE.Mesh(COW_GEO.head, bodyMat); head.position.set(0, 33, 0); head.castShadow = true; g.add(head);
  // Eyes
  const e1 = new THREE.Mesh(COW_GEO.eye, COW_EYE_MAT); e1.position.set(-3, 35, 5); g.add(e1);
  const e2 = new THREE.Mesh(COW_GEO.eye, COW_EYE_MAT); e2.position.set(3, 35, 5); g.add(e2);
  const p1 = new THREE.Mesh(COW_GEO.pupil, COW_PUPIL_MAT); p1.position.set(-3, 35, 6.5); g.add(p1);
  const p2 = new THREE.Mesh(COW_GEO.pupil, COW_PUPIL_MAT); p2.position.set(3, 35, 6.5); g.add(p2);
  // Mouth — varies by personality
  if (personality === 'aggressive') {
    // Angry V eyebrows + frown
    const brow1 = new THREE.Mesh(COW_GEO.brow, COW_MOUTH_MAT); brow1.position.set(-3, 37, 5.5); brow1.rotation.z = -0.4; g.add(brow1);
    const brow2 = new THREE.Mesh(COW_GEO.brow, COW_MOUTH_MAT); brow2.position.set(3, 37, 5.5); brow2.rotation.z = 0.4; g.add(brow2);
    const frown = new THREE.Mesh(COW_GEO.mouth2, COW_MOUTH_MAT);
    frown.position.set(0, 31.5, 5.5); g.add(frown); // no rotation = curves up = frown when viewed
  } else if (personality === 'timid') {
    // Sad downturned mouth + worried brows
    const brow1 = new THREE.Mesh(COW_GEO.brow, COW_MOUTH_MAT); brow1.position.set(-3, 37, 5.5); brow1.rotation.z = 0.3; g.add(brow1);
    const brow2 = new THREE.Mesh(COW_GEO.brow, COW_MOUTH_MAT); brow2.position.set(3, 37, 5.5); brow2.rotation.z = -0.3; g.add(brow2);
    const sad = new THREE.Mesh(COW_GEO.mouth15, COW_MOUTH_MAT);
    sad.position.set(0, 32, 5.5); g.add(sad);
  } else {
    // Normal smile (players + balanced bots)
    const smile = new THREE.Mesh(COW_GEO.mouth2, COW_MOUTH_MAT);
    smile.position.set(0, 31.5, 5.5); smile.rotation.set(0, 0, Math.PI); g.add(smile);
  }
  // Cigarette — built as a group along the X axis, then positioned and rotated
  const cigGroup = new THREE.Group();
  const cigBody = new THREE.Mesh(COW_GEO.cigBody, COW_CIG_BODY_MAT);
  cigBody.rotation.z = Math.PI / 2; cigBody.position.x = 0; cigGroup.add(cigBody);
  const filter = new THREE.Mesh(COW_GEO.cigFilter, COW_CIG_FILTER_MAT);
  filter.rotation.z = Math.PI / 2; filter.position.x = -2.75; cigGroup.add(filter);
  const ember = new THREE.Mesh(COW_GEO.cigEmber, COW_CIG_EMBER_MAT);
  ember.position.x = 2.2; cigGroup.add(ember);
  const emberGlow = new THREE.Mesh(COW_GEO.cigEmberGlow, COW_CIG_EMBER_GLOW_MAT);
  emberGlow.position.x = 2.2; cigGroup.add(emberGlow);
  cigGroup.position.set(4, 31, 6);
  cigGroup.rotation.z = -0.2;
  g.add(cigGroup);
  g.userData.smokeOrigin = new THREE.Vector3(6.2, 30.6, 6);
  // Horns (team-colored via bodyMat)
  const h1 = new THREE.Mesh(COW_GEO.horn, bodyMat); h1.position.set(-4, 41, 0); h1.rotation.set(0, 0, -0.3); g.add(h1);
  const h2 = new THREE.Mesh(COW_GEO.horn, bodyMat); h2.position.set(4, 41, 0); h2.rotation.set(0, 0, 0.3); g.add(h2);
  // Two legs (biped)
  const legL = new THREE.Mesh(COW_GEO.leg, bodyMat); legL.position.set(-4, 3, 0); g.add(legL);
  const legR = new THREE.Mesh(COW_GEO.leg, bodyMat); legR.position.set(4, 3, 0); g.add(legR);
  // Hooves
  const hoof1 = new THREE.Mesh(COW_GEO.hoof, COW_HOOF_MAT); hoof1.position.set(-4, -1, 0); g.add(hoof1);
  const hoof2 = new THREE.Mesh(COW_GEO.hoof, COW_HOOF_MAT); hoof2.position.set(4, -1, 0); g.add(hoof2);
  // Udder
  const udder = new THREE.Mesh(COW_GEO.udder, COW_UDDER_MAT); udder.position.set(0, 13, 5.5); udder.scale.set(1, 0.7, 0.8); g.add(udder);
  const teat1 = new THREE.Mesh(COW_GEO.teat, COW_UDDER_MAT); teat1.position.set(-1.5, 13, 7); teat1.rotation.x = Math.PI / 2; g.add(teat1);
  const teat2 = new THREE.Mesh(COW_GEO.teat, COW_UDDER_MAT); teat2.position.set(1.5, 13, 7); teat2.rotation.x = Math.PI / 2; g.add(teat2);
  // Arms (team-colored)
  const armL = new THREE.Mesh(COW_GEO.arm, bodyMat); armL.position.set(-9, 20, 0); armL.rotation.z = 0.3; g.add(armL);
  const armR = new THREE.Mesh(COW_GEO.arm, bodyMat); armR.position.set(9, 20, 0); armR.rotation.z = -0.3; g.add(armR);
  return g;
}

// Shared geo for eat-particle bursts — one geometry reused across all bursts
let _eatGeo = null;
export function spawnParts(pid) {
  const p = S.serverPlayers.find(pp => pp.id === pid);
  if (!p) return;
  if (!_eatGeo) _eatGeo = markSharedGeometry(new THREE.SphereGeometry(1.5, 4, 4));
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true });
    const g = new THREE.Mesh(_eatGeo, mat);
    g.position.set(p.x, 10, p.y); scene.add(g);
    setTimeout(() => { scene.remove(g); mat.dispose(); }, 600);
  }
}

export function updateCows(time, dt) {
  const seen = new Set();
  // Display time for the interpolation sampler. Cached once per frame so every
  // remote player samples the same render point.
  const nowMs = performance.now();
  for (const p of S.serverPlayers) {
    if (p.id === S.myId) continue;
    seen.add(String(p.id));
    const pid = String(p.id);
    if (!S.cowMeshes[pid]) {
      const m = buildCow(p.color, p.personality); scene.add(m);
      const nc = document.createElement('canvas'); nc.width = 256; nc.height = 64;
      const nctx = nc.getContext('2d'); nctx.font = 'bold 32px Segoe UI'; nctx.textAlign = 'center';
      // Color circle
      const colHex = {pink:'#ff88aa',blue:'#88aaff',green:'#88ff88',gold:'#ffdd44',purple:'#cc88ff',red:'#ff4444',orange:'#ff8844',cyan:'#44ffdd'};
      const nameW = nctx.measureText(p.name || 'Cow').width;
      const circleX = 128 - nameW / 2 - 16;
      nctx.beginPath(); nctx.arc(circleX, 34, 10, 0, Math.PI * 2);
      nctx.fillStyle = colHex[p.color] || '#aaa'; nctx.fill();
      nctx.fillStyle = 'rgba(0,0,0,0.5)'; nctx.fillText(p.name || 'Cow', 137, 39);
      nctx.fillStyle = '#ffffff'; nctx.fillText(p.name || 'Cow', 136, 38);
      const ntex = new THREE.CanvasTexture(nc); ntex.minFilter = THREE.LinearFilter;
      const nmat = new THREE.SpriteMaterial({ map: ntex, transparent: true, depthTest: false });
      const nsprite = new THREE.Sprite(nmat); nsprite.position.set(0, 50, 0); nsprite.scale.set(40, 10, 1);
      m.add(nsprite);
      // 3D hat — pick stably from player id, clone the shared template
      const hatType = ['cowboy', 'wizard', 'party', 'crown', 'cap'][Math.abs(p.id || 0) % 5];
      m.add(cloneHat(hatType));
      S.cowMeshes[pid] = { mesh: m };
    }
    const cowObj = S.cowMeshes[pid];
    const cm = cowObj.mesh;
    // Phase 1: sample the interpolation ring at (now - INTERP_DELAY_MS) for
    // smooth remote motion. Falls back to the raw tick position for players
    // that just appeared or whose history is empty.
    const smooth = interpSamplePlayer(p, nowMs);
    if (!cowObj.isDead) {
      cm.position.x = smooth.x;
      cm.position.z = smooth.y;
      cm.position.y = (smooth.z !== undefined ? smooth.z : getTerrainHeight(smooth.x, smooth.y));
      const sz = p.sizeMult || 1;
      const crouchY = p.crouching ? 0.5 : 1;
      cm.scale.set(sz, sz * crouchY, sz);
    }
    cm.visible = true;
    if (!p.alive && !cowObj.isDead) {
      cowObj.isDead = true;
      cm.rotation.z = Math.PI / 2;
      cm.position.y = (smooth.z !== undefined ? smooth.z : getTerrainHeight(smooth.x, smooth.y)) + 5;
      // Remove shield and spawn protection bubbles. Geos are shared singletons — only the per-instance material gets disposed.
      if (cowObj.shieldBubble) { cm.remove(cowObj.shieldBubble); cowObj.shieldBubble.material.dispose(); cowObj.shieldBubble = null; }
      if (cowObj.spawnBubble) { cm.remove(cowObj.spawnBubble); cowObj.spawnBubble.material.dispose(); cowObj.spawnBubble = null; }
      // Clone each mesh's material before fading. The body/spot/hat materials
      // are now shared across every cow; mutating them in-place would fade
      // every living cow too. clone() gives us a fresh per-mesh material that
      // we own — disposeMeshTree will free these clones via the normal path
      // (they aren't in the shared-material set).
      cm.traverse(c => {
        if (!c.isMesh || !c.material) return;
        const fresh = c.material.clone();
        if (!fresh.transparent) { fresh.transparent = true; fresh.opacity = 0.5; }
        else { fresh.opacity *= 0.5; }
        c.material = fresh;
      });
    }
    if (smooth.aim !== undefined) {
      // Snap directly to the interpolated aim — the sampler already handles
      // the -π/+π shortest-arc wraparound so we don't need the per-frame
      // smoothing lerp here anymore (it was covering for the 30 Hz step).
      cm.rotation.y = smooth.aim;
    }
    // Debug hitboxes — only shown for alive cows. Body height comes from scale.y
    // on a unit-tall shared cylinder, so the geometry is one singleton across
    // all cows regardless of sizeMult.
    if (S.debugMode && p.alive) {
      const eh = 35 * (p.sizeMult || 1);
      const headBase = eh * 0.75;
      if (!cowObj.debugBody) {
        cowObj.debugBody = new THREE.Mesh(DEBUG_BODY_GEO, DEBUG_BODY_MAT);
        cm.add(cowObj.debugBody);
        cowObj.debugHead = new THREE.Mesh(DEBUG_HEAD_GEO, DEBUG_HEAD_MAT);
        cm.add(cowObj.debugHead);
        const muzzleY = 35; // matches server eyeHeight() base (BASE_EYE_HEIGHT)
        const arrowShaft = new THREE.Mesh(DEBUG_ARROW_SHAFT_GEO, DEBUG_ARROW_MAT);
        arrowShaft.rotation.x = Math.PI / 2;
        arrowShaft.position.set(0, muzzleY, 15); // points along +Z (forward in local cow space)
        const arrowHead = new THREE.Mesh(DEBUG_ARROW_HEAD_GEO, DEBUG_ARROW_MAT);
        arrowHead.rotation.x = Math.PI / 2;
        arrowHead.position.set(0, muzzleY, 32);
        const arrowGroup = new THREE.Group();
        arrowGroup.add(arrowShaft); arrowGroup.add(arrowHead);
        cm.add(arrowGroup);
        cowObj.debugArrow = arrowGroup;
      }
      cowObj.debugBody.position.set(0, headBase / 2, 0);
      cowObj.debugBody.scale.y = headBase;
      cowObj.debugBody.visible = true;
      cowObj.debugHead.position.set(0, headBase + 10, 0);
      cowObj.debugHead.visible = true;
      if (cowObj.debugArrow) cowObj.debugArrow.visible = true;
    } else if (cowObj.debugBody) {
      cowObj.debugBody.visible = false;
      cowObj.debugHead.visible = false;
      if (cowObj.debugArrow) cowObj.debugArrow.visible = false;
    }
    // Cigarette smoke wisps — pooled particles, no per-wisp RAF
    if (p.alive && !cowObj.isDead && cm.userData.smokeOrigin && Math.random() < 0.02) {
      const so = cm.userData.smokeOrigin;
      _wispTmpPos.set(so.x, so.y, so.z);
      cm.localToWorld(_wispTmpPos);
      spawnParticle({
        geo: PGEO_SPHERE_LO, color: 0xcccccc,
        x: _wispTmpPos.x, y: _wispTmpPos.y, z: _wispTmpPos.z,
        sx: 0.6,
        life: 0.8 + Math.random() * 0.4,
        peakOpacity: 0.4,
        vx: (Math.random() - 0.5) * 3,
        vy: 8 + Math.random() * 5,
        vz: (Math.random() - 0.5) * 3,
        growth: 2,
      });
    }
    if (!cowObj.hpSprite) {
      const hc = document.createElement('canvas'); hc.width = 128; hc.height = 16;
      const htex = new THREE.CanvasTexture(hc); htex.minFilter = THREE.LinearFilter;
      const hmat = new THREE.SpriteMaterial({ map: htex, transparent: true, depthTest: false });
      const hs = new THREE.Sprite(hmat); hs.position.set(0, 48, 0); hs.scale.set(30, 4, 1);
      cm.add(hs);
      cowObj.hpSprite = { sprite: hs, canvas: hc, ctx: hc.getContext('2d'), tex: htex };
    }
    // Shield bubble — only for alive cows. Geometry is shared; material is
    // per-instance because opacity is driven by armor percent. Only the
    // material gets disposed on teardown.
    const armorVal = p.armor || 0;
    if (p.alive && armorVal > 0 && !cowObj.shieldBubble) {
      const shieldMat = new THREE.MeshBasicMaterial({ color: 0x5588ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const shield = new THREE.Mesh(SHIELD_BUBBLE_GEO, shieldMat);
      shield.position.set(0, 14, 0);
      cm.add(shield);
      cowObj.shieldBubble = shield;
    }
    if (cowObj.shieldBubble) {
      if (!p.alive || armorVal <= 0) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      } else {
        cowObj.shieldBubble.material.opacity = Math.max(0.2, armorVal / 100 * 0.6);
      }
    }

    // Spawn protection bubble (golden, separate from shield). Shared geo, per-instance mat.
    if (p.spawnProt && !cowObj.spawnBubble) {
      const spMat = new THREE.MeshBasicMaterial({ color: 0xffee44, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const sp = new THREE.Mesh(SPAWN_BUBBLE_GEO, spMat);
      sp.position.set(0, 14, 0);
      cm.add(sp);
      cowObj.spawnBubble = sp;
    }
    if (cowObj.spawnBubble && !p.spawnProt) {
      cm.remove(cowObj.spawnBubble);
      cowObj.spawnBubble.material.dispose();
      cowObj.spawnBubble = null;
    }

    const hpPct = Math.max(0, (p.hunger || 0) / 100);
    const hpRounded = Math.round(hpPct * 100);
    if (cowObj.lastHp !== hpRounded) {
      cowObj.lastHp = hpRounded;
      const hctx = cowObj.hpSprite.ctx;
      hctx.clearRect(0, 0, 128, 16);
      hctx.fillStyle = 'rgba(0,0,0,0.6)'; hctx.fillRect(0, 0, 128, 16);
      hctx.fillStyle = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff4444';
      hctx.fillRect(2, 2, 124 * hpPct, 12);
      cowObj.hpSprite.tex.needsUpdate = true;
    }
  }
  for (const id in S.cowMeshes) {
    if (!seen.has(id)) {
      const obj = S.cowMeshes[id];
      disposeMeshTree(obj.mesh);
      if (obj.hpSprite) obj.hpSprite.tex.dispose();
      if (obj.shieldBubble) obj.shieldBubble.material.dispose();
      if (obj.spawnBubble) obj.spawnBubble.material.dispose();
      delete S.cowMeshes[id];
    }
  }
}
