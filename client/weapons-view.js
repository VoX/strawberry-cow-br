import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import S from './state.js';
import { vmScene } from './renderer.js';
import { disposeMeshTree, fbxLoadingManager } from './three-utils.js';

let vmGroup = null, vmType = null, vmDual = false;

export function getVmGroup() { return vmGroup; }

// Left cow arm + hoof that grips the weapon forend — built in local coords so the root
// can be placed at the forend attach point, with the arm extending back toward bottom-left of camera.
function buildHoof() {
  const g = new THREE.Group();
  const furMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const hoofMat = new THREE.MeshBasicMaterial({ color: 0x2a1a10 });
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
  // Hoof at origin (attach point — sits on the weapon forend)
  const hoof = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 2.0), hoofMat);
  hoof.position.set(0, 0, 0);
  g.add(hoof);
  // Toe split
  const split = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.35, 2.1), shadowMat);
  g.add(split);
  // Forearm — extends back-down-left from the hoof toward the camera's bottom-left
  // Local axis: the arm points in -X, +Y positive (up) and angled via rotations set by caller
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 8, 7), furMat);
  arm.position.set(0, -4, 0); // extends downward 8 units in local space
  g.add(arm);
  // Dark edge on the arm for visibility
  const armEdge = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.35, 8, 7), shadowMat);
  armEdge.position.set(0.2, -4, 0.3);
  armEdge.scale.set(0.5, 1, 0.5);
  g.add(armEdge);
  return g;
}

export function buildViewmodel(type, dual) {
  if (vmGroup) { vmScene.remove(vmGroup); }
  vmGroup = new THREE.Group();
  vmDual = !!dual;
  const dark = new THREE.MeshBasicMaterial({ color: 0x444444 });
  const metal = new THREE.MeshBasicMaterial({ color: 0x999999 });
  const wood = new THREE.MeshBasicMaterial({ color: 0x8B5A2B });
  const olive = new THREE.MeshBasicMaterial({ color: 0x556B2F });
  const black = new THREE.MeshBasicMaterial({ color: 0x222222 });
  if (type === 'normal') {
    // Pistol viewmodel
    const slide = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 6), dark);
    slide.position.set(0, 0, -3); vmGroup.add(slide);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 3, 6), metal);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.2, -6.5); vmGroup.add(barrel);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.8), dark);
    grip.rotation.x = 0.2; grip.position.set(0, -2.5, -1); vmGroup.add(grip);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1.2), new THREE.MeshBasicMaterial({ color: 0x333333 }));
    mag.position.set(0, -3.5, -1); vmGroup.add(mag);
    const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.8), metal);
    trigger.position.set(0, -1.2, -1.5); vmGroup.add(trigger);
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), metal);
    sight.position.set(0, 1, -5); vmGroup.add(sight);
  } else if (type === 'shotgun') {
    // Helper to build a full benelli body at the given offset parent (vmGroup or duplicate group)
    const buildBenelli = (parent, xOff) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 18, 8), dark);
      barrel.rotation.x = Math.PI / 2; barrel.position.set(xOff, 0.3, -10); parent.add(barrel);
      const tubeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 14, 8), dark);
      tubeMag.rotation.x = Math.PI / 2; tubeMag.position.set(xOff, -0.7, -8); parent.add(tubeMag);
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 5), black);
      receiver.position.set(xOff, -0.3, -2); parent.add(receiver);
      const forend = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 5), dark);
      forend.position.set(xOff, -0.5, -6); parent.add(forend);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), black);
      grip.rotation.x = 0.3; grip.position.set(xOff, -2.5, 0); parent.add(grip);
      const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 6), metal);
      stock.rotation.x = Math.PI / 2; stock.position.set(xOff, -0.3, 3.5); parent.add(stock);
      const buttpad = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.8), dark);
      buttpad.position.set(xOff, -0.3, 6.5); parent.add(buttpad);
      return [barrel, tubeMag, receiver, forend, grip, stock, buttpad];
    };
    buildBenelli(vmGroup, 0);
    // Duplicate benelli to the left, only visible when dual-wielding
    const secondGroup = new THREE.Group();
    buildBenelli(secondGroup, -12);
    secondGroup.visible = vmDual;
    vmGroup.add(secondGroup);
    vmGroup.userData.benelliSecond = secondGroup;
    const hoof = buildHoof();
    hoof.position.set(-0.5, -0.8, -9);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'pump';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'burst') {
    const loader = new FBXLoader(fbxLoadingManager);
    loader.load('models/M16_ps1.fbx', fbx => {
      fbx.scale.set(0.08, 0.08, 0.08);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      fbx.position.set(1.5, -8, -7);
      const grayMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
      fbx.traverse(c => { if (c.isMesh) c.material = grayMat; });
      vmGroup.add(fbx);
      // Duplicate M16 — offset to the left of the primary, only visible when dual-wielding
      const fbx2 = fbx.clone(true);
      fbx2.position.set(-10.5, -8, -7);
      fbx2.visible = vmDual;
      vmGroup.add(fbx2);
      vmGroup.userData.m16Second = fbx2;
    }, undefined, () => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 14, 8), dark);
      barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.2, -8); vmGroup.add(barrel);
      const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 8), dark);
      body.position.set(0, -0.2, -3); vmGroup.add(body);
    });
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -10);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'bolty') {
    const loader2 = new FBXLoader(fbxLoadingManager);
    loader2.load('models/Sniper.fbx', fbx => {
      fbx.scale.set(0.06, 0.06, 0.06);
      fbx.rotation.set(Math.PI, Math.PI, Math.PI);
      fbx.position.set(6, -8, -7);
      fbx.traverse(c => {
        if (c.isMesh) {
          c.material = new THREE.ShaderMaterial({
            vertexShader: 'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
            fragmentShader: 'varying vec3 vPos;void main(){float t=clamp((vPos.y+20.0)/40.0,0.0,1.0);vec3 col=mix(vec3(0.2,0.27,0.12),vec3(0.15,0.2,0.08),t);gl_FragColor=vec4(col,1.0);}'
          });
        }
      });
      vmGroup.add(fbx);
    }, undefined, () => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 22, 8), dark);
      barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0, -12); vmGroup.add(barrel);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 12), wood);
      stock.position.set(0, -0.5, 0); vmGroup.add(stock);
    });
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -14);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'knife') {
    // Combat knife — short steel blade with a wrapped handle. Held
    // out in front, slightly angled. No reload, no fire mode.
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const handleMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const guardMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
    // Blade — flat tapered prism
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 7), bladeMat);
    blade.position.set(0, 0, -10); vmGroup.add(blade);
    // Tip cone
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2, 4), bladeMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.set(0, 0, -14.5); vmGroup.add(tip);
    // Crossguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.8), guardMat);
    guard.position.set(0, 0, -6); vmGroup.add(guard);
    // Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 4, 6), handleMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0, -0.2, -3.5); vmGroup.add(handle);
    // Pommel
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 4), guardMat);
    pommel.position.set(0, -0.2, -1); vmGroup.add(pommel);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -1.0, -4);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'none';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'aug') {
    // Steyr AUG viewmodel — bullpup body, integrated optic, forward grip.
    // Single-wield only (the dual-wield gate in server/weapons.js excludes
    // 'aug') so there's no duplicate-mesh branch here.
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x4a6038 });
    // Receiver / stock — long box that runs from the buttpad up to past
    // the trigger. Bullpup means the magazine is BEHIND the trigger, so
    // the silhouette is short and chunky compared to the M16.
    const stock = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 12), bodyMat);
    stock.position.set(0, -0.1, -1); vmGroup.add(stock);
    // Front handguard — slimmer, ahead of the trigger
    const fore = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 5), bodyMat);
    fore.position.set(0, -0.4, -8); vmGroup.add(fore);
    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 6, 6), black);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.1, -13); vmGroup.add(barrel);
    // Integrated 1.5x optic — scope tube on top of receiver
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 5, 8), black);
    scope.rotation.x = Math.PI / 2; scope.position.set(0, 1.55, -3); vmGroup.add(scope);
    const ringA = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 8), metal);
    ringA.rotation.x = Math.PI / 2; ringA.position.set(0, 1.55, -1); vmGroup.add(ringA);
    const ringB = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 8), metal);
    ringB.rotation.x = Math.PI / 2; ringB.position.set(0, 1.55, -5); vmGroup.add(ringB);
    // Forward vertical grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.9), black);
    grip.position.set(0, -1.9, -8); vmGroup.add(grip);
    // Trigger guard — small underslung loop
    const trig = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 0.7), metal);
    trig.position.set(0, -1.6, -5); vmGroup.add(trig);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -10);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'akm') {
    // AKM viewmodel — iconic curved magazine, wooden furniture, milled receiver.
    const woodMat = new THREE.MeshBasicMaterial({ color: 0x6B3A1F });
    const steelMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
    // Receiver — milled steel
    const recv = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 10), steelMat);
    recv.position.set(0, 0, -3); vmGroup.add(recv);
    // Gas tube above barrel
    const gas = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 6), steelMat);
    gas.rotation.x = Math.PI / 2; gas.position.set(0, 1.0, -8); vmGroup.add(gas);
    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 6), steelMat);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.3, -11); vmGroup.add(barrel);
    // Muzzle brake
    const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 1.5, 6), steelMat);
    muzzle.rotation.x = Math.PI / 2; muzzle.position.set(0, 0.3, -14.5); vmGroup.add(muzzle);
    // Wooden stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 7), woodMat);
    stock.position.set(0, -0.4, 4); stock.rotation.x = 0.06; vmGroup.add(stock);
    // Wooden handguard
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 4.5), woodMat);
    handguard.position.set(0, -0.3, -6.5); vmGroup.add(handguard);
    // Pistol grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.5, 1.2), woodMat);
    grip.position.set(0, -2.2, -1); vmGroup.add(grip);
    // Curved magazine — the AK signature
    const mag = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.0, 1.6), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
    mag.position.set(0, -3.2, -2.5); mag.rotation.x = 0.2; vmGroup.add(mag);
    // Front sight
    const fSight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.25), metal);
    fSight.position.set(0, 1.8, -10); vmGroup.add(fSight);
    // Rear sight
    const rSight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), metal);
    rSight.position.set(0, 1.5, -0.5); vmGroup.add(rSight);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -9);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'sks') {
    // SKS viewmodel — long wooden-stocked semi-auto rifle with
    // fixed 10-round internal magazine and blade bayonet.
    const woodMat = new THREE.MeshBasicMaterial({ color: 0x7a4a28 });
    const steelMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    // Receiver
    const recv = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 10), steelMat);
    recv.position.set(0, 0, -3); vmGroup.add(recv);
    // Long barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 8, 6), steelMat);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.3, -12); vmGroup.add(barrel);
    // Wooden stock — long
    const stock = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 8), woodMat);
    stock.position.set(0, -0.3, 4); stock.rotation.x = 0.08; vmGroup.add(stock);
    // Wooden handguard
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 5), woodMat);
    handguard.position.set(0, -0.5, -7); vmGroup.add(handguard);
    // Magazine
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.5, 1.4), steelMat);
    mag.position.set(0, -2.2, -2); mag.rotation.x = 0.1; vmGroup.add(mag);
    // Front sight
    const fSight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 0.25), metal);
    fSight.position.set(0, 1.5, -10); vmGroup.add(fSight);
    // Rear sight
    const rSight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4), metal);
    rSight.position.set(0, 1.5, -0.5); vmGroup.add(rSight);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -9);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'thompson') {
    // Thompson SMG — boxy receiver, wooden furniture, vertical foregrip,
    // distinctive compensator cuts on the barrel.
    const woodMat = new THREE.MeshBasicMaterial({ color: 0x8B5A2B });
    const steelMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
    // Receiver
    const recv = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 9), steelMat);
    recv.position.set(0, 0, -3); vmGroup.add(recv);
    // Barrel with compensator slots
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 6), steelMat);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.3, -10); vmGroup.add(barrel);
    const comp = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2, 8), steelMat);
    comp.rotation.x = Math.PI / 2; comp.position.set(0, 0.3, -8.5); vmGroup.add(comp);
    // Wooden stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 6), woodMat);
    stock.position.set(0, -0.5, 3.5); stock.rotation.x = 0.1; vmGroup.add(stock);
    // Pistol grip
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 1.2), woodMat);
    grip.position.set(0, -2.2, -1); vmGroup.add(grip);
    // Vertical foregrip
    const fgrip = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 0.8), woodMat);
    fgrip.position.set(0, -2.0, -5.5); vmGroup.add(fgrip);
    // Magazine — straight box mag
    const mag = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.0, 1.6), steelMat);
    mag.position.set(0, -3.0, -2.5); vmGroup.add(mag);
    // Rear sight
    const rSight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), metal);
    rSight.position.set(0, 1.6, -0.5); vmGroup.add(rSight);
    // Front sight
    const fSight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), metal);
    fSight.position.set(0, 1.6, -7); vmGroup.add(fSight);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -7);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'mp5k') {
    // MP5K viewmodel — compact stockless SMG. Parts in a sub-group so
    // dual-wield can clone the whole gun to the left side.
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
    const gunGroup = new THREE.Group();
    const recv = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 7), bodyMat);
    recv.position.set(0, 0, -3); gunGroup.add(recv);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 4, 6), black);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.3, -8.5); gunGroup.add(barrel);
    const fSight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), metal);
    fSight.position.set(0, 1.5, -7); gunGroup.add(fSight);
    const rSight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), metal);
    rSight.position.set(0, 1.4, -0.5); gunGroup.add(rSight);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.5, 1.4), new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
    mag.position.set(0, -2.5, -2.5); mag.rotation.x = 0.15; gunGroup.add(mag);
    const trig = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.6), metal);
    trig.position.set(0, -1.3, -4.5); gunGroup.add(trig);
    const fg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.5, 0.8), bodyMat);
    fg.position.set(0, -1.5, -5.5); gunGroup.add(fg);
    gunGroup.position.set(2, 0, 0);
    vmGroup.add(gunGroup);
    // Dual-wield: cloned MP5K offset to the left
    const gunLeft = gunGroup.clone(true);
    gunLeft.position.set(-6, 0, 0);
    gunLeft.visible = vmDual;
    vmGroup.add(gunLeft);
    vmGroup.userData.mp5kSecond = gunLeft;
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -7);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'magswap';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'cowtank') {
    const outerTube = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 16, 10), olive);
    outerTube.rotation.x = Math.PI / 2; outerTube.position.set(0, 0, -8); vmGroup.add(outerTube);
    const innerTube = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 8, 10), new THREE.MeshBasicMaterial({ color: 0x3a4a2a }));
    innerTube.rotation.x = Math.PI / 2; innerTube.position.set(0, 0, -14); vmGroup.add(innerTube);
    const fSight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2, 0.5), metal);
    fSight.position.set(0, 2.8, -16); vmGroup.add(fSight);
    const rSight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), metal);
    rSight.position.set(0, 2.5, -1); vmGroup.add(rSight);
    const trigGuard = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 2), dark);
    trigGuard.position.set(0, -2.5, -3); vmGroup.add(trigGuard);
    const band1 = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 10), new THREE.MeshBasicMaterial({ color: 0xffdd00 }));
    band1.rotation.x = Math.PI / 2; band1.position.set(0, 0, -4); vmGroup.add(band1);
    const hoof = buildHoof();
    hoof.position.set(-0.8, -0.5, -12);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'none'; // M72 LAW is single-use, no reload
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === 'python') {
    // Python revolver — dual-wieldable, uses sub-group for clone
    const gunGroup = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 5), dark);
    frame.position.set(0, -0.3, -1); gunGroup.add(frame);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2, 8), metal);
    cyl.rotation.x = Math.PI / 2; cyl.position.set(0, -0.2, -2); gunGroup.add(cyl);
    const brl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 6), dark);
    brl.rotation.x = Math.PI / 2; brl.position.set(0, 0.2, -6.5); gunGroup.add(brl);
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 5), metal);
    rib.position.set(0, 0.7, -5.5); gunGroup.add(rib);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 2), new THREE.MeshBasicMaterial({ color: 0x6B3A1F }));
    grip.position.set(0, -3, 1.5); grip.rotation.x = -0.2; gunGroup.add(grip);
    const hmr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.5), metal);
    hmr.position.set(0, 1, 1.5); gunGroup.add(hmr);
    gunGroup.position.set(2, 0, 0);
    vmGroup.add(gunGroup);
    // Dual-wield: cloned Python offset left
    const gunLeft = gunGroup.clone(true);
    gunLeft.position.set(-6, 0, 0);
    gunLeft.visible = vmDual;
    vmGroup.add(gunLeft);
    vmGroup.userData.mp5kSecond = gunLeft; // reuse the same dual-wield toggle
  } else if (type === 'm249') {
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x556B2F });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 12), bodyMat);
    body.position.set(0, 0, -4); vmGroup.add(body);
    const brl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8, 6), dark);
    brl.rotation.x = Math.PI / 2; brl.position.set(0, 0.3, -12); vmGroup.add(brl);
    const ammoBox = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 3), bodyMat);
    ammoBox.position.set(0, -3, -3); vmGroup.add(ammoBox);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 3), dark);
    handle.position.set(0, 1.8, -4); vmGroup.add(handle);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 4), bodyMat);
    stock.position.set(0, -0.5, 4); vmGroup.add(stock);
  } else if (type === 'minigun') {
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 5, 8), dark);
    housing.rotation.x = Math.PI / 2; housing.position.set(0, -0.5, 0); vmGroup.add(housing);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 14, 4), dark);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(Math.cos(angle) * 1.1, -0.5 + Math.sin(angle) * 1.1, -9);
      vmGroup.add(tube);
    }
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.6, 8), metal);
    clamp.rotation.x = Math.PI / 2; clamp.position.set(0, -0.5, -12); vmGroup.add(clamp);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 16, 6), metal);
    core.rotation.x = Math.PI / 2; core.position.set(0, -0.5, -8); vmGroup.add(core);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -5);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = 'cylinder';
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  }
  vmGroup.position.set(2, -3, -5);
  vmGroup.rotation.set(0, 0.05, 0);
  vmScene.add(vmGroup);
  vmType = type;
}

let _throwAway = null; // { group, startT } — plays the LAW toss animation
let _pistolDelayUntil = 0; // performance.now() timestamp; don't show next viewmodel until this time
export function updateViewmodel() {
  const me = S.me;
  const wep = me && me.alive ? me.weapon || 'normal' : 'normal';
  const meDual = !!(me && me.dualWield);
  // If weapon changed away from cowtank, play toss-to-right animation and
  // delay the new viewmodel (pistol) by 1s after the toss completes.
  if (wep !== vmType && performance.now() >= _pistolDelayUntil) {
    if (vmType === 'cowtank' && vmGroup && !_throwAway) {
      _throwAway = { group: vmGroup, startT: performance.now() / 1000 };
      vmGroup = null;
      vmType = null; // temporarily unset so we don't re-enter this branch each frame
      _pistolDelayUntil = performance.now() + 1200 + 1000; // toss dur + 1s empty hand
    } else {
      buildViewmodel(wep, meDual);
    }
  }
  // Once the delay has passed and we still need to build the intended viewmodel, do it now
  if (performance.now() >= _pistolDelayUntil && wep !== vmType && !_throwAway) {
    buildViewmodel(wep, meDual);
  }
  // Dual-wield state changed for the same weapon → update visibility of duplicate
  if (wep === vmType && meDual !== vmDual && !_throwAway) {
    vmDual = meDual;
    if (vmGroup && vmGroup.userData.m16Second) vmGroup.userData.m16Second.visible = meDual;
    if (vmGroup && vmGroup.userData.benelliSecond) vmGroup.userData.benelliSecond.visible = meDual;
    if (vmGroup && vmGroup.userData.mp5kSecond) vmGroup.userData.mp5kSecond.visible = meDual;
  }
  // Animate the thrown LAW — tumble to the right and down over 1.2s
  if (_throwAway) {
    const tAway = performance.now() / 1000 - _throwAway.startT;
    const g = _throwAway.group;
    const dur = 1.2;
    if (tAway < dur) {
      const frac = tAway / dur;
      g.position.x = 2 + frac * 30; // slide right
      g.position.y = -3 - frac * frac * 20; // gravity arc down
      g.position.z = -5 + frac * 4;
      g.rotation.z = -frac * 6;
      g.rotation.x = -frac * 3;
    } else {
      vmScene.remove(g);
      disposeMeshTree(g, { skipSceneRemove: true });
      _throwAway = null;
    }
  }
  if (vmGroup) {
    const moving = me && me.alive && (S.keys['KeyW'] || S.keys['KeyS'] || S.keys['KeyA'] || S.keys['KeyD']);
    const t = performance.now() / 1000;
    vmGroup.position.y = -4 + (moving ? Math.sin(t * 8) * 0.5 : 0);
    vmGroup.position.x = 4 + (moving ? Math.cos(t * 6) * 0.3 : 0);
    // L96 bolt rack animation — tilt the gun right + rotate during rack
    if (S._boltRacking && vmType === 'bolty') {
      vmGroup.rotation.z = -0.3;
      vmGroup.position.x += 2;
      vmGroup.position.y -= 1;
    } else if (vmType === 'bolty') {
      vmGroup.rotation.z *= 0.8; // smooth return
    }
    // Hoof reload animation — style varies per weapon
    const hoof = vmGroup.userData.hoof;
    if (hoof && hoof.userData.restPos && hoof.userData.restRot) {
      const rest = hoof.userData.restPos;
      const restR = hoof.userData.restRot;
      if (me && me.reloading && hoof.userData.reloadStyle !== 'none') {
        if (hoof.userData.reloadStyle === 'magswap') {
          // Mag swap — arm drops sharply down to receiver, holds briefly, rises back up
          const phase = (t * 1.1) % 1;
          const down = phase < 0.4 ? phase / 0.4 : phase < 0.6 ? 1 : 1 - (phase - 0.6) / 0.4;
          hoof.position.x = rest.x - 1 - down * 2;
          hoof.position.y = rest.y - down * 5;
          hoof.position.z = rest.z + 3; // move back to receiver
          hoof.rotation.z = restR.z - down * 0.5;
          hoof.rotation.x = restR.x + down * 0.8;
        } else {
          // Pump / shell-load — back-and-forth sliding motion along barrel
          const phase = (t * 2.0) % 1;
          const slide = Math.sin(phase * Math.PI * 2);
          hoof.position.x = rest.x;
          hoof.position.y = rest.y - 0.5;
          hoof.position.z = rest.z + slide * 2.5;
          hoof.rotation.z = restR.z;
          hoof.rotation.x = restR.x;
        }
      } else {
        // Smoothly return to rest
        hoof.position.x += (rest.x - hoof.position.x) * 0.25;
        hoof.position.y += (rest.y - hoof.position.y) * 0.25;
        hoof.position.z += (rest.z - hoof.position.z) * 0.25;
        hoof.rotation.x += (restR.x - hoof.rotation.x) * 0.25;
        hoof.rotation.y += (restR.y - hoof.rotation.y) * 0.25;
        hoof.rotation.z += (restR.z - hoof.rotation.z) * 0.25;
      }
    }
  }
}
