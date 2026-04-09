import * as THREE from 'three';
import { scene } from './renderer.js';

// Shared-geometry/material protection. Any geometry or material registered
// here survives disposeMeshTree() — used by caches that hand out the same
// geometry/material to many meshes (cows, hats, particles). Without this,
// disposing the first mesh that references a shared geo tears it down and
// every other referencing mesh renders garbage.
//
// WeakSet so entries auto-release when the cache is GC'd (the cache holds
// the strong ref, not this set).
const _SHARED_GEOMETRIES = new WeakSet();
const _SHARED_MATERIALS = new WeakSet();
export function markSharedGeometry(geo) { _SHARED_GEOMETRIES.add(geo); return geo; }
export function markSharedMaterial(mat) { _SHARED_MATERIALS.add(mat); return mat; }

// Walk a mesh tree and dispose every geometry + material (plus any map texture
// attached via material.map — weapon labels, HP sprites, FBX textures). Safe
// for any THREE.Object3D (Mesh, Group, Sprite). Skips any geometry/material
// registered as shared via markSharedGeometry / markSharedMaterial.
//
// Material.map is still disposed unconditionally because shared materials
// don't carry per-cow textures (nameplate/HP sprites use fresh materials,
// never shared ones — see updateCows).
//
// By default, removes `obj` from the scene before traversing. Pass
// `{skipSceneRemove: true}` for callers that manage their own removal (e.g.
// removing from a parent group that isn't the main scene, or where removal
// already happened).
export function disposeMeshTree(obj, opts = {}) {
  if (!opts.skipSceneRemove) scene.remove(obj);
  obj.traverse(c => {
    if (c.geometry && !_SHARED_GEOMETRIES.has(c.geometry)) c.geometry.dispose();
    if (c.material) {
      if (c.material.map) c.material.map.dispose();
      if (!_SHARED_MATERIALS.has(c.material)) c.material.dispose();
    }
  });
}

// Shared FBX LoadingManager that redirects any internally-referenced texture
// fetch to a 1x1 transparent PNG data URL. The FBX files we ship bake
// references to `TextureMap.png` and `m16.png` which we never shipped — the
// callers always overwrite the material after load anyway, so the texture
// fetches were just noisy 404s. The redirect makes the fetches free.
const _BLANK_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=';
export const fbxLoadingManager = new THREE.LoadingManager();
fbxLoadingManager.setURLModifier((url) => {
  if (/\.(png|jpe?g|tga|bmp)(\?|$)/i.test(url)) return _BLANK_PNG;
  return url;
});
