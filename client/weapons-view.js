import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import S from './state.js';
import { vmScene } from './renderer.js';

let vmGroup = null, vmType = 'normal';

export function getVmGroup() { return vmGroup; }

export function buildViewmodel(type) {
  if (vmGroup) { vmScene.remove(vmGroup); }
  vmGroup = new THREE.Group();
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
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 18, 8), dark);
    barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.3, -10); vmGroup.add(barrel);
    const tubeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 14, 8), dark);
    tubeMag.rotation.x = Math.PI / 2; tubeMag.position.set(0, -0.7, -8); vmGroup.add(tubeMag);
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 5), black);
    receiver.position.set(0, -0.3, -2); vmGroup.add(receiver);
    const forend = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 5), dark);
    forend.position.set(0, -0.5, -6); vmGroup.add(forend);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), black);
    grip.rotation.x = 0.3; grip.position.set(0, -2.5, 0); vmGroup.add(grip);
    const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 6), metal);
    stock.rotation.x = Math.PI / 2; stock.position.set(0, -0.3, 3.5); vmGroup.add(stock);
    const buttpad = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.8), dark);
    buttpad.position.set(0, -0.3, 6.5); vmGroup.add(buttpad);
  } else if (type === 'burst') {
    const loader = new FBXLoader();
    loader.load('models/M16_ps1.fbx', fbx => {
      fbx.scale.set(0.08, 0.08, 0.08);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      fbx.position.set(0, -8, -7);
      const grayMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
      fbx.traverse(c => { if (c.isMesh) c.material = grayMat; });
      vmGroup.add(fbx);
    }, undefined, () => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 14, 8), dark);
      barrel.rotation.x = Math.PI / 2; barrel.position.set(0, 0.2, -8); vmGroup.add(barrel);
      const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 8), dark);
      body.position.set(0, -0.2, -3); vmGroup.add(body);
    });
  } else if (type === 'bolty') {
    const loader2 = new FBXLoader();
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
  }
  vmGroup.position.set(2, -3, -5);
  vmGroup.rotation.set(0, 0.05, 0);
  vmScene.add(vmGroup);
  vmType = type;
}

export function updateViewmodel() {
  const me = S.serverPlayers.find(p => p.id === S.myId);
  const wep = me && me.alive ? me.weapon || 'normal' : 'normal';
  if (wep !== vmType) buildViewmodel(wep);
  if (vmGroup) {
    const moving = me && me.alive && (S.keys['KeyW'] || S.keys['KeyS'] || S.keys['KeyA'] || S.keys['KeyD']);
    const t = performance.now() / 1000;
    vmGroup.position.y = -4 + (moving ? Math.sin(t * 8) * 0.5 : 0);
    vmGroup.position.x = 4 + (moving ? Math.cos(t * 6) * 0.3 : 0);
  }
}
