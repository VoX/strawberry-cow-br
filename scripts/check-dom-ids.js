#!/usr/bin/env node
// Verify every `document.getElementById('X')` in client/*.js resolves to an
// `id="X"` in dist/index.html. Catches the class of bug where HTML and JS
// drift (e.g. a handler references #nightCheck but the HTML doesn't ship it
// anymore — ui.js then throws at module init and the whole bundle fails to
// load, which is exactly how we bricked production earlier today).
//
// Runs as part of `npm run build:client` via `pre` script chaining.
// Exit 0 on success, exit 1 on mismatch (prints the missing ids).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'dist/index.html');
const CLIENT_DIR = path.join(ROOT, 'client');

// Ids that the HTML doesn't need to ship, because the JS either creates them
// at runtime via createElement or accesses them with a null guard. Adding an
// id here is an EXPLICIT acknowledgement that every getElementById call for
// it is safe; a new raw `getElementById('foo').addEventListener(...)` should
// fail the check loudly.
const DYNAMIC_IDS = new Set([
  'debugOverlay',   // hud.js creates on first debug toggle
  'readyBtn',       // message-handlers lobby handler creates via appendChild
  'disconnectMsg',  // network.js creates on first ws close
  'hitMarker',      // null-guarded feedback overlay (silently absent if missing)
  'hostControls',   // null-guarded host-only panel
  'gameStatus',     // null-guarded lobby status line
]);

function collectIdsFromHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set();
  const re = /\bid="([a-zA-Z0-9_-]+)"/g;
  let m;
  while ((m = re.exec(html))) ids.add(m[1]);
  return ids;
}

function walkClientJs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkClientJs(p));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(p);
  }
  return out;
}

function collectGetElementByIdCalls(jsFiles) {
  // Map of id → [{file, line}] for every call site.
  const calls = new Map();
  const re = /getElementById\(\s*['"]([a-zA-Z0-9_-]+)['"]\s*\)/g;
  for (const file of jsFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      let m;
      const local = new RegExp(re.source, 'g');
      while ((m = local.exec(lines[i]))) {
        const id = m[1];
        if (!calls.has(id)) calls.set(id, []);
        calls.get(id).push({ file: path.relative(ROOT, file), line: i + 1 });
      }
    }
  }
  return calls;
}

function main() {
  if (!fs.existsSync(HTML)) {
    console.error(`[check-dom-ids] ${HTML} not found`);
    process.exit(1);
  }
  const htmlIds = collectIdsFromHtml(HTML);
  const jsFiles = walkClientJs(CLIENT_DIR);
  const calls = collectGetElementByIdCalls(jsFiles);

  const missing = [];
  for (const [id, sites] of calls) {
    if (htmlIds.has(id) || DYNAMIC_IDS.has(id)) continue;
    missing.push({ id, sites });
  }

  if (missing.length === 0) {
    console.log(`[check-dom-ids] ok — ${calls.size} distinct ids referenced, all resolve against dist/index.html`);
    process.exit(0);
  }

  console.error(`[check-dom-ids] FAIL — ${missing.length} dom id(s) referenced in JS but missing from dist/index.html:`);
  for (const { id, sites } of missing) {
    console.error(`  #${id}`);
    for (const s of sites) console.error(`    at ${s.file}:${s.line}`);
  }
  console.error('');
  console.error('Fix: add the element to dist/index.html, or add the id to DYNAMIC_IDS');
  console.error('in scripts/check-dom-ids.js if it is legitimately created at runtime.');
  process.exit(1);
}

main();
