#!/usr/bin/env node
// Build script: bundles client JS via esbuild then copies public/ assets
// into dist/ so Caddy serves a single directory with everything the
// browser needs. Supports --watch for development (re-bundles on change,
// assets are copied once at startup).
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const watch = process.argv.includes('--watch');

// Recursively copy src dir into dest, creating dirs as needed.
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// Copy public/ assets into dist/ (idempotent — overwrites existing)
function copyAssets() {
  copyDir(PUBLIC, DIST);
  console.log('[build] assets copied to dist/');
}

// DOM-id pre-check (same as the old prebuild:client script)
try {
  require('./check-dom-ids.js');
} catch (e) {
  console.error('[build] DOM-id check failed:', e.message);
  process.exit(1);
}

const buildOpts = {
  entryPoints: [path.join(ROOT, 'client/index.js')],
  bundle: true,
  outfile: path.join(DIST, 'bundle.js'),
  format: 'esm',
  external: ['three', 'three/*'],
  sourcemap: 'linked',
};

async function main() {
  // Always copy assets first so dist/ has the HTML before the bundle lands
  copyAssets();

  if (watch) {
    const ctx = await esbuild.context(buildOpts);
    await ctx.watch();
    console.log('[build] watching for changes...');
  } else {
    await esbuild.build(buildOpts);
    const stat = fs.statSync(path.join(DIST, 'bundle.js'));
    console.log(`[build] bundle.js ${(stat.size / 1024).toFixed(1)}kb`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
