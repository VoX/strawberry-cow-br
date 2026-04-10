import * as THREE from 'three';
import { MW, MH, CH } from './config.js';

// Three.js scene setup
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 1, 6100);
cam.position.set(MW / 2, CH, MH / 2);
export const ren = new THREE.WebGLRenderer({ antialias: true });
ren.setSize(innerWidth, innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio, 2));
ren.shadowMap.enabled = true;
ren.domElement.id = 'gameCanvas';
document.body.appendChild(ren.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
export const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(500, 400, 300); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 10; sun.shadow.camera.far = 800;
sun.shadow.camera.left = -400; sun.shadow.camera.right = 400;
sun.shadow.camera.top = 400; sun.shadow.camera.bottom = -400;
scene.add(sun);
scene.add(sun.target);
const hemi = new THREE.HemisphereLight(0x87CEEB, 0x44aa44, 0.3);
scene.add(hemi);

// Procedural gradient skybox — day or night depending on uniform
const skyGeo = new THREE.SphereGeometry(5000, 32, 32);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, fog: false,
  uniforms: { uNight: { value: 0 } },
  vertexShader: `varying vec3 vWorldPos;void main(){vWorldPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `varying vec3 vWorldPos;uniform float uNight;void main(){
    float h=normalize(vWorldPos).y;
    // Day palette
    vec3 dayTop=vec3(0.3,0.5,0.9);
    vec3 dayMid=vec3(0.6,0.8,1.0);
    vec3 dayHorizon=vec3(1.0,0.85,0.7);
    vec3 dayBottom=vec3(0.4,0.7,0.3);
    // Night palette — deep blue/purple with a subtle moonlit haze near horizon
    vec3 nightTop=vec3(0.02,0.02,0.08);
    vec3 nightMid=vec3(0.05,0.06,0.18);
    vec3 nightHorizon=vec3(0.15,0.12,0.25);
    vec3 nightBottom=vec3(0.04,0.05,0.1);
    vec3 top=mix(dayTop,nightTop,uNight);
    vec3 mid=mix(dayMid,nightMid,uNight);
    vec3 horizon=mix(dayHorizon,nightHorizon,uNight);
    vec3 bottom=mix(dayBottom,nightBottom,uNight);
    vec3 col;
    if(h>0.3)col=mix(mid,top,(h-0.3)/0.7);
    else if(h>0.0)col=mix(horizon,mid,h/0.3);
    else col=mix(bottom,horizon,(h+0.3)/0.3);
    // Stars in the night sky
    if(uNight>0.5 && h>0.0){
      float star=fract(sin(dot(floor(vWorldPos.xz*0.05),vec2(12.9898,78.233)))*43758.5453);
      if(star>0.995){
        float twinkle=0.5+0.5*sin(vWorldPos.x*0.01+vWorldPos.z*0.015);
        col+=vec3(0.9,0.9,1.0)*(star-0.995)*200.0*twinkle;
      }
    }
    float c=sin(vWorldPos.x*0.003+vWorldPos.z*0.002)*0.5+0.5;
    c*=smoothstep(0.05,0.3,h)*smoothstep(0.6,0.3,h);
    col=mix(col,vec3(1.0,1.0,1.0)*(1.0-uNight*0.7),c*0.2);
    gl_FragColor=vec4(col,1.0);
  }`
});
export const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// Night mode toggle — updates lights, sky shader, and cloud opacity
export function setNightMode(enabled) {
  setDayNightFactor(enabled ? 1 : 0);
}

// Smooth day/night cycle — factor is 0 (full day) to 1 (full night).
// Called per-frame from the tick handler based on server gameTime.
export function setDayNightFactor(f) {
  const n = Math.max(0, Math.min(1, f));
  skyMat.uniforms.uNight.value = n;
  // Lerp lighting between day and night values
  ambient.intensity = 0.6 - n * 0.42;
  sun.intensity = 0.8 - n * 0.58;
  hemi.intensity = 0.3 - n * 0.15;
  if (n > 0.5) {
    ambient.color.setHex(0x2233aa);
    sun.color.setHex(0x99aadd);
    hemi.color.setHex(0x0a0a30);
    hemi.groundColor.setHex(0x050510);
  } else {
    ambient.color.setHex(0xffffff);
    sun.color.setHex(0xffffff);
    hemi.color.setHex(0x87CEEB);
    hemi.groundColor.setHex(0x44aa44);
  }
  cloudPlanes.forEach(c => { c.material.opacity = 0.7 - n * 0.55; });
}

// Cloud planes with procedural texture
function makeCloudTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 20; i++) {
    const x = 64 + Math.random() * 128, y = 64 + Math.random() * 128;
    const r = 30 + Math.random() * 60;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return new THREE.CanvasTexture(c);
}
export const cloudPlanes = [];
for (let i = 0; i < 12; i++) {
  const tex = makeCloudTexture();
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.7, side: THREE.DoubleSide, fog: false, depthWrite: false });
  const sz = 400 + Math.random() * 400;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz * 0.4), mat);
  mesh.position.set(Math.random() * MW, 300 + Math.random() * 200, Math.random() * MH);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = Math.random() * Math.PI;
  mesh.userData = { speed: 2 + Math.random() * 4, origX: mesh.position.x };
  scene.add(mesh);
  cloudPlanes.push(mesh);
}

// Viewmodel scene (first-person weapon rendered on top)
export const vmScene = new THREE.Scene();
vmScene.add(new THREE.AmbientLight(0xffffff, 1));
export const vmCam = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
vmCam.position.set(0, 0, 0);

addEventListener('resize', () => {
  cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
  vmCam.aspect = innerWidth / innerHeight; vmCam.updateProjectionMatrix();
  ren.setSize(innerWidth, innerHeight);
});
