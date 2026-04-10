import * as THREE from 'three';
import S from './state.js';

let actx = null;
export function getAudioCtx() { return actx; }

function masterVol() { return typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5; }
// Music volume is a separate slider — lets players turn music down
// without muting gunshots. Every function in the menu/in-game music
// section below reads this instead of masterVol().
function musicVol() { return typeof S.musicVol !== 'undefined' ? S.musicVol : 0.5; }

export function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  // Preload all sound samples
  loadSpitSample(); loadShotgunSamples(); loadLRSamples(); loadBoltyShotSample(); loadSampleSounds();
}

// --- Positional audio ---------------------------------------------------
// All world-sourced sfx (remote gunshots, explosions, moo, rocket whistle,
// barricade impacts, shield hits) route through a PannerNode instead of
// connecting straight to actx.destination. The listener follows the camera
// via updateAudioListener() called once per render frame. HRTF + inverse
// distance model replaces the hand-rolled 1/(1 + d*0.005) falloff and
// gives real L/R directionality on headphones.
//
// Call-site contract: pass `pos = {x, y, z}` in WORLD coords (three.js).
// Server (x, y) maps to (world.x, world.z); vertical is world.y (y3d).
// Omit `pos` for HUD / local-player sfx — they stay 2D automatically.

const _audioFwd = new THREE.Vector3();
export function updateAudioListener(cam) {
  if (!actx || !actx.listener) return;
  const lis = actx.listener;
  const t = actx.currentTime;
  // Horizontal forward — keep the audio world level so looking up/down
  // doesn't rotate sources above/below into front/back. Matches every FPS.
  _audioFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
  _audioFwd.y = 0;
  if (_audioFwd.lengthSq() > 1e-4) _audioFwd.normalize(); else _audioFwd.set(0, 0, -1);
  if (lis.positionX) {
    lis.positionX.setValueAtTime(cam.position.x, t);
    lis.positionY.setValueAtTime(cam.position.y, t);
    lis.positionZ.setValueAtTime(cam.position.z, t);
    lis.forwardX.setValueAtTime(_audioFwd.x, t);
    lis.forwardY.setValueAtTime(0, t);
    lis.forwardZ.setValueAtTime(_audioFwd.z, t);
    lis.upX.setValueAtTime(0, t);
    lis.upY.setValueAtTime(1, t);
    lis.upZ.setValueAtTime(0, t);
  } else if (lis.setPosition) {
    // Safari fallback — same semantics via the deprecated setters.
    lis.setPosition(cam.position.x, cam.position.y, cam.position.z);
    lis.setOrientation(_audioFwd.x, 0, _audioFwd.z, 0, 1, 0);
  }
}

// Set a panner's position via AudioParam setters (modern) or legacy
// setPosition (Safari < 14). Exported so projectiles.js can reuse it
// for the per-frame rocket whistle update without touching AudioParams.
export function setPannerPosition(p, x, y, z) {
  if (p.positionX) {
    const t = actx.currentTime;
    p.positionX.setValueAtTime(x, t);
    p.positionY.setValueAtTime(y, t);
    p.positionZ.setValueAtTime(z, t);
  } else if (p.setPosition) {
    p.setPosition(x, y, z);
  }
}

export function createPanner(x, y, z) {
  const p = actx.createPanner();
  p.panningModel = 'HRTF';
  p.distanceModel = 'inverse';
  p.refDistance = 40;
  p.maxDistance = 2000;
  p.rolloffFactor = 0.9;
  setPannerPosition(p, x, y, z);
  p.connect(actx.destination);
  return p;
}

// Wire a source → gain chain to either a fresh 3D panner or the 2D
// destination, and (for spatial) schedule gain+panner disconnection on
// source-ended so the graph doesn't accumulate orphan nodes. Without
// this hook, every spatialized sfx would leak a PannerNode that stays
// rooted to destination until tab close.
function connectOut(source, gain, pos) {
  if (pos && actx.listener) {
    const panner = createPanner(pos.x, pos.y, pos.z);
    gain.connect(panner);
    source.onended = () => { try { gain.disconnect(); panner.disconnect(); } catch (e) {} };
  } else {
    gain.connect(actx.destination);
  }
}

export function sfx(freq, dur, type, v, pos) {
  if (!actx) return; const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.3, t + dur);
  const gain = (v || 0.1) * masterVol();
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); connectOut(o, g, pos); o.start(t); o.stop(t + dur);
}

// Gunshot punch layer — adds a sub-bass thump + high-frequency crack
// underneath a sample playback so the shot hits the chest instead of
// just tapping the ears. Called alongside each weapon sample sfx. All
// params are optional — subHi/subLo set the pitch sweep, crackHz sets
// the highpass cutoff on the noise burst, subVol/crackVol scale each
// layer independently. Duration is short (50-150 ms total).
function punchLayer(vol, pos, opts) {
  if (!actx) return;
  const o = opts || {};
  const t = actx.currentTime;
  const v = (vol || 0.1) * masterVol();
  const subDur = o.subDur || 0.14;
  // Sub-bass thump — quick pitch drop gives the "kick in the chest"
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(o.subHi || 180, t);
  sub.frequency.exponentialRampToValueAtTime(o.subLo || 45, t + subDur);
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.exponentialRampToValueAtTime(v * (o.subVol || 1.0), t + 0.005);
  sg.gain.exponentialRampToValueAtTime(0.001, t + subDur);
  sub.connect(sg); connectOut(sub, sg, pos);
  sub.start(t); sub.stop(t + subDur + 0.02);
  // Crack — exp-decayed white noise burst through a highpass filter,
  // gives the bright snap on top. Skipped if crackVol is 0.
  const crackVol = o.crackVol != null ? o.crackVol : 0.7;
  if (crackVol > 0) {
    const crackDur = o.crackDur || 0.05;
    const bs = Math.max(1, Math.floor(actx.sampleRate * crackDur));
    const b = actx.createBuffer(1, bs, actx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 10);
    const src = actx.createBufferSource(); src.buffer = b;
    const hp = actx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = o.crackHz || 2200;
    const cg = actx.createGain();
    cg.gain.setValueAtTime(v * crackVol, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + crackDur);
    src.connect(hp); hp.connect(cg); connectOut(src, cg, pos);
    src.start(t);
  }
}

// Spit shot sample
let _spitBuf = null, _spitLoaded = false;
function loadSpitSample() {
  if (_spitLoaded || !actx) return;
  _spitLoaded = true;
  fetch('SpitShot.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _spitBuf = d; }).catch(() => {});
}
export function sfxShoot(vol, pos) {
  if (!actx) return;
  loadSpitSample();
  if (_spitBuf) {
    const src = actx.createBufferSource(); src.buffer = _spitBuf;
    const g = actx.createGain(); g.gain.value = (vol || 0.1) * masterVol();
    src.connect(g); connectOut(src, g, pos); src.start();
  } else {
    sfx(400, 0.12, 'square', vol || 0.1, pos);
  }
  // Pistol punch — small crack, minimal bass (it's a pistol, not a cannon)
  punchLayer((vol || 0.1) * 0.6, pos, { subHi: 160, subLo: 60, subDur: 0.08, subVol: 0.5, crackHz: 2800, crackVol: 0.5, crackDur: 0.035 });
}

// LR-300 shot samples
const lrBuffers = [];
let _lrLoaded = false;
function loadLRSamples() {
  if (_lrLoaded || !actx) return;
  _lrLoaded = true;
  ['LRA.ogg','LRB.ogg','LRC.ogg','LRD.ogg'].forEach(file => {
    fetch(file).then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(decoded => lrBuffers.push(decoded)).catch(() => {});
  });
}
export function sfxLR(vol, pos) {
  if (!actx) return;
  loadLRSamples();
  if (lrBuffers.length > 0) {
    const buf = lrBuffers[Math.floor(Math.random() * lrBuffers.length)];
    const src = actx.createBufferSource(); src.buffer = buf;
    const g = actx.createGain(); g.gain.value = (vol || 0.13) * masterVol();
    src.connect(g); connectOut(src, g, pos); src.start();
  } else {
    sfx(400, 0.12, 'square', vol || 0.1, pos);
  }
  // Rifle punch — medium crack + mid bass thump
  punchLayer((vol || 0.13) * 0.85, pos, { subHi: 200, subLo: 50, subDur: 0.11, subVol: 0.9, crackHz: 2400, crackVol: 0.75, crackDur: 0.05 });
}

// Benelli shotgun samples
const shotgunBuffers = [];
let _shotgunLoaded = false;
function loadShotgunSamples() {
  if (_shotgunLoaded || !actx) return;
  _shotgunLoaded = true;
  ['ShotA.ogg','ShotB.ogg','ShotC.ogg'].forEach(file => {
    fetch(file).then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(decoded => shotgunBuffers.push(decoded)).catch(() => {});
  });
}
export function sfxShotgun(vol, pos) {
  if (!actx) return;
  loadShotgunSamples();
  loadSampleSounds();
  if (shotgunBuffers.length > 0) {
    const buf = shotgunBuffers[Math.floor(Math.random() * shotgunBuffers.length)];
    const src = actx.createBufferSource(); src.buffer = buf;
    const g = actx.createGain(); g.gain.value = (vol || 0.14) * masterVol();
    src.connect(g); connectOut(src, g, pos); src.start();
  } else {
    sfx(300, 0.15, 'square', vol || 0.1, pos);
  }
  // Shotgun punch — big low-end thump + wide crack (the whole point of a shotgun)
  punchLayer((vol || 0.14) * 1.3, pos, { subHi: 220, subLo: 35, subDur: 0.22, subVol: 1.4, crackHz: 1600, crackVol: 1.0, crackDur: 0.08 });
  // Shell ejection impact sound after the shot
  setTimeout(() => playSample(_shellImpactBuf, (vol || 0.1) * 0.8, pos), 220);
}
// L96 shot sample
let _boltyShotBuf = null, _boltyShotLoaded = false;
function loadBoltyShotSample() {
  if (_boltyShotLoaded || !actx) return;
  _boltyShotLoaded = true;
  fetch('BoltyShot.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _boltyShotBuf = d; }).catch(() => {});
}
export function sfxBolty(vol, pos) {
  if (!actx) return;
  loadBoltyShotSample();
  loadSampleSounds();
  if (_boltyShotBuf) {
    const src = actx.createBufferSource(); src.buffer = _boltyShotBuf;
    const g = actx.createGain(); g.gain.value = (vol || 0.13) * masterVol();
    src.connect(g); connectOut(src, g, pos); src.start();
  } else {
    sfx(800, 0.25, 'sawtooth', vol || 0.1, pos);
  }
  // L96 punch — sharp high slap + deep sustained bass (sniper feel)
  punchLayer((vol || 0.13) * 1.1, pos, { subHi: 160, subLo: 38, subDur: 0.28, subVol: 1.1, crackHz: 3200, crackVol: 0.9, crackDur: 0.045 });
  // Bolt rack after shot
  setTimeout(() => {
    if (!playSample(_boltBuf, 0.08, pos)) {
      sfx(300, 0.08, 'sawtooth', 0.07, pos);
      setTimeout(() => sfx(500, 0.06, 'square', 0.06, pos), 200);
    }
  }, 500);
}
export function sfxHit() {
  // Punchy "ow" hit on the LOCAL player taking damage. Layered impact
  // (low thump for body, mid bite for sting) so it cuts through gunfire
  // and the player feels the hit. Roughly 3× louder than the old
  // single-osc sawtooth that nobody noticed.
  if (!actx) return;
  const t = actx.currentTime;
  const v = masterVol();
  // Body thump — fast pitch drop on a sine
  const o1 = actx.createOscillator(), g1 = actx.createGain();
  o1.type = 'sine';
  o1.frequency.setValueAtTime(380, t);
  o1.frequency.exponentialRampToValueAtTime(60, t + 0.18);
  g1.gain.setValueAtTime(0.0001, t);
  g1.gain.exponentialRampToValueAtTime(0.32 * v, t + 0.005);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o1.connect(g1); g1.connect(actx.destination);
  o1.start(t); o1.stop(t + 0.24);
  // Bite — short sawtooth burst on top
  const o2 = actx.createOscillator(), g2 = actx.createGain();
  o2.type = 'sawtooth';
  o2.frequency.setValueAtTime(220, t);
  o2.frequency.exponentialRampToValueAtTime(120, t + 0.1);
  g2.gain.setValueAtTime(0.0001, t);
  g2.gain.exponentialRampToValueAtTime(0.22 * v, t + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  o2.connect(g2); g2.connect(actx.destination);
  o2.start(t); o2.stop(t + 0.16);
}
export function sfxEat() { sfx(800, 0.08, 'sine', 0.06); sfx(1200, 0.08, 'sine', 0.04); }
export function sfxLevelUp() {
  if (!actx) return; const t = actx.currentTime;
  const v = 0.32 * masterVol();
  // Triumphant fanfare — fast ascending arpeggio (C5 → C6) followed by a
  // sustained C-major chord. Each note rides a triangle+square layer for
  // a fuller, more "exciting" tone than the original sine arp. Roughly
  // 4× the volume of the old version, with a final swell that decays
  // over ~700 ms instead of 200 ms.
  const arp = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  const noteDur = 0.09;
  arp.forEach((f, i) => {
    const start = t + i * noteDur;
    const oTri = actx.createOscillator();
    const oSq = actx.createOscillator();
    const g = actx.createGain();
    oTri.type = 'triangle'; oSq.type = 'square';
    oTri.frequency.value = f;
    oSq.frequency.value = f;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(v, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, start + noteDur + 0.06);
    oTri.connect(g); oSq.connect(g); g.connect(actx.destination);
    oTri.start(start); oSq.start(start);
    oTri.stop(start + noteDur + 0.08); oSq.stop(start + noteDur + 0.08);
  });
  // Final chord — C major triad held for ~0.6 s after the arp lands.
  const chordStart = t + arp.length * noteDur;
  [523.25, 659.25, 783.99].forEach(f => {
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, chordStart);
    g.gain.exponentialRampToValueAtTime(v * 0.6, chordStart + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.7);
    o.connect(g); g.connect(actx.destination);
    o.start(chordStart); o.stop(chordStart + 0.75);
  });
  // Bright shimmer — high octave on top of the chord for sparkle.
  const sh = actx.createOscillator();
  const shg = actx.createGain();
  sh.type = 'sine';
  sh.frequency.value = 2093; // C7
  shg.gain.setValueAtTime(0.0001, chordStart);
  shg.gain.exponentialRampToValueAtTime(v * 0.4, chordStart + 0.02);
  shg.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);
  sh.connect(shg); shg.connect(actx.destination);
  sh.start(chordStart); sh.stop(chordStart + 0.65);
}
export function sfxDeath() { sfx(400, 0.6, 'sawtooth', 0.08); }
export function sfxBump() { sfx(100, 0.1, 'sine', 0.05); }

// Knife swing whoosh — short filtered-noise sweep, pos-aware.
export function sfxMeleeSwing(pos) {
  if (!actx) return;
  const t = actx.currentTime;
  const v = 0.12 * masterVol();
  const dur = 0.14;
  const bs = Math.max(1, Math.floor(actx.sampleRate * dur));
  const b = actx.createBuffer(1, bs, actx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 3);
  const src = actx.createBufferSource(); src.buffer = b;
  const bp = actx.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 1.8;
  bp.frequency.setValueAtTime(3200, t);
  bp.frequency.exponentialRampToValueAtTime(700, t + dur);
  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(bp); bp.connect(g); connectOut(src, g, pos);
  src.start(t);
}

// Knife hit impact — meaty thud + mid-range slap.
export function sfxMeleeHit(pos) {
  if (!actx) return;
  const t = actx.currentTime;
  const v = 0.18 * masterVol();
  // Body thump
  const o = actx.createOscillator(), og = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(320, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.15);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(v, t + 0.005);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  o.connect(og); connectOut(o, og, pos);
  o.start(t); o.stop(t + 0.2);
  // Mid slap layered on top via punchLayer for a wet crack
  punchLayer(0.16, pos, { subHi: 160, subLo: 55, subDur: 0.1, subVol: 0.7, crackHz: 1600, crackVol: 0.9, crackDur: 0.06 });
}

// Cow moo taunt — synth-based, multi-variant. Real moos are deep, rich,
// with vibrato and a formant sweep as the mouth opens on the "oooh" and
// closes on the "mmm". We layer three square oscillators (fundamental +
// slightly detuned for chorus + sub-octave for body) through a lowpass
// filter that sweeps open→closed, with a vibrato LFO modulating pitch
// and a breath-noise layer for mouth/nose texture. A set of profiles
// randomizes pitch, duration, and vibrato so no two moos sound the same.
const MOO_PROFILES = [
  // {name,   base, dur,  vibHz, vibCents, filtLo, filtHi, detune}
  { name: 'normal', base: 115, dur: 0.85, vibHz: 4.5, vibCents: 18, filtLo: 500, filtHi: 1300, detune: 6 },
  { name: 'deep',   base:  88, dur: 1.05, vibHz: 3.8, vibCents: 22, filtLo: 360, filtHi: 1000, detune: 8 },
  { name: 'short',  base: 125, dur: 0.55, vibHz: 5.5, vibCents: 12, filtLo: 580, filtHi: 1500, detune: 5 },
  { name: 'long',   base: 105, dur: 1.25, vibHz: 4.0, vibCents: 20, filtLo: 450, filtHi: 1150, detune: 7 },
  { name: 'angry',  base: 100, dur: 0.90, vibHz: 6.5, vibCents: 28, filtLo: 420, filtHi: 1250, detune: 10 },
];
export function sfxMoo(vol, pos) {
  if (!actx) return;
  const t = actx.currentTime;
  const v = (vol || 0.22) * masterVol();
  // Pick a random profile, then jitter each parameter slightly so every
  // moo within a profile still sounds unique.
  const p = MOO_PROFILES[Math.floor(Math.random() * MOO_PROFILES.length)];
  const base = p.base * (0.94 + Math.random() * 0.12);
  const dur = p.dur * (0.9 + Math.random() * 0.2);
  const openT = dur * 0.22;   // when the vowel fully opens
  const closeT = dur * 0.78;  // when the mouth starts closing
  const detune = p.detune;
  // Vibrato LFO — a low-freq sine driving a gain node that writes into
  // each osc's detune parameter. cents of vibrato = vibCents.
  const lfo = actx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.setValueAtTime(p.vibHz, t);
  const lfoGain = actx.createGain();
  lfoGain.gain.setValueAtTime(p.vibCents, t);
  lfo.connect(lfoGain);
  // Three oscillators: fundamental + detuned sibling (chorus) + sub octave.
  const mkOsc = (freq, type, detuneBias) => {
    const osc = actx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.setValueAtTime(detuneBias, t);
    lfoGain.connect(osc.detune);
    return osc;
  };
  const o1 = mkOsc(base, 'square', 0);
  const o2 = mkOsc(base, 'square', detune);
  const o3 = mkOsc(base * 0.5, 'triangle', -detune);
  // Lowpass formant filter — starts closed ("mmm"), opens to filtHi
  // ("oooh"), closes back to low on release. Gives the mouth-shape feel.
  const f = actx.createBiquadFilter();
  f.type = 'lowpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(p.filtLo, t);
  f.frequency.linearRampToValueAtTime(p.filtHi, t + openT);
  f.frequency.setValueAtTime(p.filtHi, t + closeT);
  f.frequency.linearRampToValueAtTime(p.filtLo * 0.85, t + dur);
  // Breath noise — soft, lowpassed white noise, gated by a separate
  // envelope. Adds the throaty texture a pure synth lacks.
  const noiseBufSize = Math.floor(actx.sampleRate * dur);
  const nb = actx.createBuffer(1, noiseBufSize, actx.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < noiseBufSize; i++) nd[i] = (Math.random() * 2 - 1) * 0.6;
  const nsrc = actx.createBufferSource(); nsrc.buffer = nb;
  const nf = actx.createBiquadFilter();
  nf.type = 'lowpass'; nf.frequency.setValueAtTime(700, t); nf.Q.value = 0.8;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(v * 0.18, t + 0.06);
  ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
  nsrc.connect(nf); nf.connect(ng);
  // Main envelope — slow nasal attack, full vowel hold, long release.
  const g = actx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v * 0.55, t + 0.07);
  g.gain.exponentialRampToValueAtTime(v, t + openT);
  g.gain.setValueAtTime(v, t + closeT);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o1.connect(f); o2.connect(f); o3.connect(f);
  f.connect(g);
  ng.connect(g);
  connectOut(o1, g, pos);
  const stopT = t + dur + 0.05;
  lfo.start(t); lfo.stop(stopT);
  o1.start(t); o1.stop(stopT);
  o2.start(t); o2.stop(stopT);
  o3.start(t); o3.stop(stopT);
  nsrc.start(t); nsrc.stop(stopT);
}

export function sfxEmptyMag() { sfx(1500, 0.03, 'square', 0.06); }

export function sfxReloadLR() {
  if (!actx) return; const t = actx.currentTime;
  // Magazine out click
  sfx(800, 0.05, 'square', 0.06);
  // Magazine in click after delay
  setTimeout(() => sfx(1200, 0.05, 'square', 0.08), 300);
  // Charging handle
  setTimeout(() => { sfx(400, 0.08, 'sawtooth', 0.06); sfx(600, 0.06, 'square', 0.04); }, 500);
}

// Sample-based bolt action and shell load sounds
let _boltBuf = null, _shellBuf = null, _sampleSoundsLoaded = false;
let _rocketBuf = null, _boltyReloadBuf = null, _shellImpactBuf = null, _explosionBuf = null;
function loadSampleSounds() {
  if (_sampleSoundsLoaded || !actx) return;
  _sampleSoundsLoaded = true;
  fetch('BoltAction.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _boltBuf = d; }).catch(() => {});
  fetch('ShellLoad.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _shellBuf = d; }).catch(() => {});
  fetch('CowtankFire.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _rocketBuf = d; }).catch(() => {});
  fetch('BoltyReload.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _boltyReloadBuf = d; }).catch(() => {});
  fetch('ShellImpact.wav').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _shellImpactBuf = d; }).catch(() => {});
  fetch('Explosion.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _explosionBuf = d; }).catch(() => {});
}
export function sfxExplosion(vol, pos) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_explosionBuf, vol || 0.18, pos)) {
    sfx(60, 0.5, 'sine', vol || 0.18, pos);
  }
  // Huge sub thump layered under the sample — makes the ground shake
  // regardless of how punchy the Explosion.ogg sample is on its own.
  punchLayer((vol || 0.18) * 1.6, pos, { subHi: 140, subLo: 28, subDur: 0.45, subVol: 1.5, crackHz: 1200, crackVol: 0.6, crackDur: 0.1 });
}
export function sfxRocket(vol, pos) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_rocketBuf, vol || 0.14, pos)) {
    sfx(200, 0.3, 'sine', vol || 0.1, pos);
  }
  // Launch kick — short thump under the whoosh so it feels like something
  // actually left the tube.
  punchLayer((vol || 0.14) * 1.0, pos, { subHi: 180, subLo: 40, subDur: 0.18, subVol: 1.0, crackHz: 1800, crackVol: 0.6, crackDur: 0.06 });
}
function playSample(buf, vol, pos) {
  if (!actx || !buf) return false;
  const src = actx.createBufferSource(); src.buffer = buf;
  const g = actx.createGain(); g.gain.value = (vol || 0.1) * masterVol();
  src.connect(g); connectOut(src, g, pos); src.start();
  return true;
}

export function sfxReloadBolty() {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_boltyReloadBuf, 0.1)) {
    if (!playSample(_boltBuf, 0.1)) {
      sfx(300, 0.1, 'sawtooth', 0.08);
      setTimeout(() => sfx(500, 0.08, 'sawtooth', 0.06), 400);
    }
  }
}

export function sfxShellLoad() {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_shellBuf, 0.1)) {
    sfx(900, 0.04, 'square', 0.07);
    setTimeout(() => sfx(600, 0.03, 'square', 0.05), 50);
  }
}

// --- Menu / Lobby Music ---
let menuMusicInterval = null;
function startMenuMusicTribal() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = musicVol();
    // Slow tribal beat
    const lowPat = [1,0,0,0, 1,0,1,0];
    const midPat = [0,0,1,0, 0,1,0,0];
    const highPat = [0,1,0,1, 0,0,0,1];
    const step = beat % 8;
    if (lowPat[step]) tribalDjembe(t, 0.2 * v, 70);
    if (midPat[step]) tribalDjembe(t, 0.15 * v, 130);
    if (highPat[step]) tribalDjembe(t, 0.1 * v, 220);
    if (step % 2 === 0) tribalShaker(t, 0.05 * v);
    if (step === 0) {
      const drum = actx.createOscillator(), dg = actx.createGain();
      drum.type = 'sine'; drum.frequency.setValueAtTime(55, t); drum.frequency.exponentialRampToValueAtTime(30, t + 0.5);
      dg.gain.setValueAtTime(0, t); dg.gain.linearRampToValueAtTime(0.18 * v, t + 0.01);
      dg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      drum.connect(dg); dg.connect(actx.destination); drum.start(t); drum.stop(t + 0.7);
    }
    beat++;
  }, 280);
}

export function startMenuMusic() {
  // Radio is checked first so _stopRadioIfRunning (below) doesn't nuke the
  // stream before we had a chance to resume it.
  if (S.musicStyle === 'radio') { startMenuMusicRadio(); return; }
  _stopRadioIfRunning(); // any non-radio style: tear down the live stream
  if (S.musicStyle === 'custom') { startMenuMusicCustom(); return; }
  if (S.musicStyle === 'tribal') { startMenuMusicTribal(); return; }
  if (S.musicStyle === 'industrial') { startMenuMusicIndustrial(); return; }
  if (S.musicStyle === 'money') { startMenuMusicMoney(); return; }
  if (S.musicStyle === 'boy') { startMenuMusicBoy(); return; }
  if (S.musicStyle === 'neo') { startMenuMusicNeo(); return; }
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  const chords = [[0,4,7],[5,9,12],[7,11,14],[3,7,10]];
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = musicVol();
    const chord = chords[beat % chords.length];
    // Pad
    chord.forEach(n => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 130.81 * Math.pow(2, n / 12);
      const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600 + Math.sin(beat * 0.5) * 200;
      g.gain.setValueAtTime(0.03 * v, t); g.gain.setValueAtTime(0.03 * v, t + 0.35); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      o.connect(f); f.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.45);
    });
    // Kick drum
    const ko = actx.createOscillator(), kg = actx.createGain();
    ko.type = 'sine'; ko.frequency.setValueAtTime(150, t); ko.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    kg.gain.setValueAtTime(0.06 * v, t); kg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    ko.connect(kg); kg.connect(actx.destination); ko.start(t); ko.stop(t + 0.15);
    // Hi-hat on off-beats
    if (beat % 2 === 1) {
      const bs = actx.sampleRate * 0.02, b = actx.createBuffer(1, bs, actx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * 0.5 * Math.exp(-i / bs * 8);
      const n = actx.createBufferSource(); n.buffer = b; const ng = actx.createGain();
      ng.gain.setValueAtTime(0.03 * v, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      const hf = actx.createBiquadFilter(); hf.type = 'highpass'; hf.frequency.value = 5000;
      n.connect(hf); hf.connect(ng); ng.connect(actx.destination); n.start(t); n.stop(t + 0.03);
    }
    // Rising melody every 4 beats
    if (beat % 4 === 0) {
      const mn = [0, 3, 7, 12, 15, 12, 7, 3];
      const note = mn[Math.floor(beat / 4) % mn.length];
      const mo = actx.createOscillator(), mg = actx.createGain();
      mo.type = 'square'; mo.frequency.value = 261.63 * Math.pow(2, note / 12);
      mg.gain.setValueAtTime(0.03 * v, t); mg.gain.setValueAtTime(0.03 * v, t + 0.3); mg.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      mo.connect(mg); mg.connect(actx.destination); mo.start(t); mo.stop(t + 0.4);
    }
    beat++;
  }, 250);
}
function startMenuMusicIndustrial() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  const minorChords = [[0,3,7],[5,8,12],[3,7,10],[7,10,14]];
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = musicVol();
    const chord = minorChords[beat % minorChords.length];
    // Dark pad — filtered sawtooth, lower register
    chord.forEach(n => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 65.41 * Math.pow(2, n / 12);
      const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400 + Math.sin(beat * 0.3) * 150;
      g.gain.setValueAtTime(0.025 * v, t); g.gain.setValueAtTime(0.025 * v, t + 0.4); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(f); f.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.5);
    });
    // Sub bass
    const sub = actx.createOscillator(), sg = actx.createGain();
    sub.type = 'sine'; sub.frequency.value = 55 + Math.sin(beat * 0.2) * 10;
    sg.gain.setValueAtTime(0.04 * v, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sub.connect(sg); sg.connect(actx.destination); sub.start(t); sub.stop(t + 0.45);
    // Kick — slower, heavier
    if (beat % 2 === 0) {
      const ko = actx.createOscillator(), kg = actx.createGain();
      ko.type = 'sine'; ko.frequency.setValueAtTime(120, t); ko.frequency.exponentialRampToValueAtTime(30, t + 0.12);
      kg.gain.setValueAtTime(0.07 * v, t); kg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      ko.connect(kg); kg.connect(actx.destination); ko.start(t); ko.stop(t + 0.18);
    }
    // Snare on offbeats
    if (beat % 4 === 2) {
      const bs = actx.sampleRate * 0.03, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 4);
      const sn = actx.createBufferSource(); sn.buffer = buf;
      const sng = actx.createGain(); sng.gain.setValueAtTime(0.04 * v, t); sng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      sn.connect(sng); sng.connect(actx.destination); sn.start(t); sn.stop(t + 0.05);
    }
    // Hi-hat
    if (beat % 2 === 1) {
      const hbs = actx.sampleRate * 0.01, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
      for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.2 * Math.exp(-i / hbs * 12);
      const hh = actx.createBufferSource(); hh.buffer = hbuf;
      const hg = actx.createGain(); hg.gain.setValueAtTime(0.025 * v, t); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
      const hhf = actx.createBiquadFilter(); hhf.type = 'highpass'; hhf.frequency.value = 8000;
      hh.connect(hhf); hhf.connect(hg); hg.connect(actx.destination); hh.start(t); hh.stop(t + 0.015);
    }
    // Eerie melody every 8 beats
    if (beat % 8 === 0) {
      const mn = [0, 3, 7, 10, 12, 10, 7, 3];
      const note = mn[Math.floor(beat / 8) % mn.length];
      const mo = actx.createOscillator(), mg = actx.createGain();
      mo.type = 'sine'; mo.frequency.value = 130.81 * Math.pow(2, note / 12);
      mo.frequency.linearRampToValueAtTime(130.81 * Math.pow(2, (note + 0.5) / 12), t + 0.6);
      mg.gain.setValueAtTime(0.02 * v, t); mg.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      mo.connect(mg); mg.connect(actx.destination); mo.start(t); mo.stop(t + 0.6);
    }
    beat++;
  }, 300);
}

export function stopMenuMusic() {
  if (menuMusicInterval) { clearInterval(menuMusicInterval); menuMusicInterval = null; }
  // Custom menu music is a looping BufferSource, not an interval — stop it
  // here so the existing menu→game transition path (ui.js: stop+start on style
  // change, index.js: stop when state becomes 'playing') cleans up properly.
  if (_customMenuNode) {
    try { _customMenuNode.stop(); } catch (e) {}
    _customMenuNode.disconnect();
    _customMenuNode = null;
  }
  if (_customMenuGain) { _customMenuGain.disconnect(); _customMenuGain = null; }
}

// --- Custom sample-based music pack ---
// Every other music style in this file is procedural WebAudio oscillator work.
// The custom pack is different: 4 prerecorded .ogg files (menu + 3 combat
// moods) loaded once from /music/custom/<slot>.ogg, played as looping
// BufferSources, crossfaded on mood transition. Lazy-loaded the first time
// the user picks this style so the audio doesn't download unless used.
// Files are gitignored — drop ogg files into dist/music/custom/ on each host
// to enable this style. Missing files degrade to silence, not crash.
const customBuffers = { menu: null, chill: null, tense: null, frantic: null };
let _customLoading = false, _customLoaded = false, _customWarned = false;
function loadCustomBuffers() {
  if (_customLoading || _customLoaded || !actx) return;
  _customLoading = true;
  const files = { menu: 'music/custom/menu.ogg', chill: 'music/custom/chill.ogg', tense: 'music/custom/tense.ogg', frantic: 'music/custom/frantic.ogg' };
  let remaining = 4;
  const warnMissing = (url, reason) => {
    if (_customWarned) return;
    _customWarned = true;
    console.warn('[audio] custom music pack unavailable — ' + url + ' ' + reason + '. Copy ogg files to dist/music/custom/ to enable.');
  };
  for (const [k, url] of Object.entries(files)) {
    fetch(url).then(r => {
      if (!r.ok) { warnMissing(url, 'HTTP ' + r.status); throw new Error('HTTP ' + r.status); }
      return r.arrayBuffer();
    }).then(buf => actx.decodeAudioData(buf)).then(d => {
      customBuffers[k] = d;
      if (--remaining === 0) { _customLoaded = true; _customLoading = false; }
    }).catch((err) => {
      warnMissing(url, err && err.message ? err.message : 'fetch failed');
      if (--remaining === 0) { _customLoaded = true; _customLoading = false; }
    });
  }
}

// Lightweight HEAD probe for the UI to gate the custom dropdown option.
// Resolves true if menu.ogg exists, false otherwise. Used at startup by
// ui.js to hide the option when the files aren't present on the deploy.
export function customMusicAvailable() {
  return fetch('music/custom/menu.ogg', { method: 'HEAD' }).then(r => r.ok).catch(() => false);
}

// Menu music: one looping BufferSource on its own gain node so masterVol can
// be applied at start and stopMenuMusic can disconnect cleanly.
let _customMenuNode = null, _customMenuGain = null;
function startMenuMusicCustom() {
  if (!actx || menuMusicInterval || _customMenuNode) return;
  loadCustomBuffers();
  // Use an interval to wait-and-retry until the menu buffer finishes decoding.
  // Reuses menuMusicInterval so stopMenuMusic's clearInterval tears it down if
  // the user switches styles mid-load.
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    if (!customBuffers.menu) return;
    // Buffer ready — swap the wait-interval out for the real BufferSource.
    clearInterval(menuMusicInterval); menuMusicInterval = null;
    const src = actx.createBufferSource(); src.buffer = customBuffers.menu; src.loop = true;
    const g = actx.createGain(); g.gain.value = 0.35 * musicVol();
    src.connect(g); g.connect(actx.destination); src.start();
    _customMenuNode = src; _customMenuGain = g;
  }, 100);
}

// In-game music: hold one active BufferSource + GainNode per mood transition.
// On mood change, start the new buffer with gain ramping 0 → target over 2s and
// fade the old one target → 0 over 2s, then stop the old node. Gain is updated
// every tick from musicVol() so volume slider changes respond live.
let _customActiveNode = null, _customActiveGain = null, _customActiveMood = null;
const _CUSTOM_MOOD_GAIN = { chill: 0.35, tense: 0.35, frantic: 0.35, menu: 0.35 };
function tickMusicCustom() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  loadCustomBuffers();
  const buf = customBuffers[musicMood];
  if (!buf) return; // still decoding
  const v = musicVol();
  if (_customActiveMood !== musicMood) {
    // Mood changed (or first tick): spin up the new node with a 2s fade-in and
    // fade the outgoing node out in parallel, then stop it.
    const t = actx.currentTime;
    const targetGain = (_CUSTOM_MOOD_GAIN[musicMood] || 0.35) * v;
    const newSrc = actx.createBufferSource(); newSrc.buffer = buf; newSrc.loop = true;
    const newGain = actx.createGain();
    newGain.gain.setValueAtTime(0, t);
    newGain.gain.linearRampToValueAtTime(targetGain, t + 2);
    newSrc.connect(newGain); newGain.connect(actx.destination); newSrc.start();
    if (_customActiveNode) {
      const oldNode = _customActiveNode, oldGain = _customActiveGain;
      oldGain.gain.cancelScheduledValues(t);
      oldGain.gain.setValueAtTime(oldGain.gain.value, t);
      oldGain.gain.linearRampToValueAtTime(0, t + 2);
      setTimeout(() => { try { oldNode.stop(); } catch (e) {} oldNode.disconnect(); oldGain.disconnect(); }, 2100);
    }
    _customActiveNode = newSrc; _customActiveGain = newGain; _customActiveMood = musicMood;
  } else if (_customActiveGain) {
    // Same mood — keep the active gain in sync with the volume slider. Only
    // touch it if the crossfade ramp has already completed, otherwise we'd
    // stomp the linearRampToValueAtTime.
    const t = actx.currentTime;
    const targetGain = (_CUSTOM_MOOD_GAIN[musicMood] || 0.35) * v;
    _customActiveGain.gain.setValueAtTime(targetGain, t);
  }
}
// Reset custom music state when the game ends so the next round starts clean.
// Called from resetMusic() below.
function resetCustomMusic() {
  if (_customActiveNode) {
    try { _customActiveNode.stop(); } catch (e) {}
    _customActiveNode.disconnect();
    if (_customActiveGain) _customActiveGain.disconnect();
  }
  _customActiveNode = null; _customActiveGain = null; _customActiveMood = null;
}

// --- Radio streaming ---
// Continuous live stream via an HTMLAudioElement. Unlike every other music
// style in this file (all procedural WebAudio synth or decoded buffers), this
// is a live stream proxied through /strawberrycow-radio/rudefm. Server-side
// proxy in server/index.js handles the ICY → HTTP rewrite from the SHOUTcast
// origin so Caddy's strict Go HTTP transport doesn't 502.
//
// Semantics differ from other styles: radio plays CONTINUOUSLY regardless of
// lobby/game state transitions. Only a style change away from radio stops
// it — via _stopRadioIfRunning() called at the top of startMenuMusic() and
// tickMusic() for non-radio branches. stopMenuMusic/resetMusic deliberately
// do NOT touch the radio so it keeps streaming across round transitions.
let _radioAudio = null;
function startMenuMusicRadio() {
  if (!_radioAudio) {
    _radioAudio = new Audio('/strawberrycow-radio/rudefm');
    _radioAudio.crossOrigin = 'anonymous';
    _radioAudio.preload = 'none';
  }
  _radioAudio.volume = 0.5 * musicVol();
  if (_radioAudio.paused) {
    _radioAudio.play().catch(err => console.warn('[audio] radio play failed:', err));
  }
}
function tickMusicRadio() {
  if (!_radioAudio) { startMenuMusicRadio(); return; }
  _radioAudio.volume = 0.5 * musicVol();
  if (_radioAudio.paused) {
    _radioAudio.play().catch(() => {});
  }
}
function _stopRadioIfRunning() {
  if (!_radioAudio) return;
  try { _radioAudio.pause(); _radioAudio.src = ''; _radioAudio.load(); } catch (e) {}
  _radioAudio = null;
}

// --- Dynamic In-Game Music ---
let musicPlaying = false, nextNote = 0, musicMood = 'chill';
const SCALES = {
  chill: [0, 2, 4, 7, 9, 12, 14, 16],
  tense: [0, 2, 3, 5, 7, 8, 10, 12],
  frantic: [0, 1, 4, 5, 7, 8, 11, 12],
};
const TEMPOS = { chill: 0.28, tense: 0.2, frantic: 0.14 };

export function setMusicPlaying(val) { musicPlaying = val; }
export function resetMusic() { nextNote = 0; musicMood = 'chill'; resetCustomMusic(); }

export function updateMusicMood() {
  const me = S.me;
  const alive = S.serverPlayers ? S.serverPlayers.filter(p => p.alive).length : 8;
  if (!me || !me.alive) { musicMood = 'chill'; return; }
  if (me.hunger < 20 || alive <= 2) musicMood = 'frantic';
  else if (me.hunger < 45 || alive <= 3) musicMood = 'tense';
  else musicMood = 'chill';
}

let _indBeat = 0, _indSection = 0, _indSectionStart = 0;
function tickMusicIndustrial() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  // DnB tempo: ~170bpm = 0.088s per 16th note
  const tempos = { chill: 0.176, tense: 0.11, frantic: 0.088 };
  const tempo = tempos[musicMood] || 0.176;
  if (t < nextNote - 0.03) return;
  const v = musicVol();
  _indBeat++;

  // Section progression — every 32 beats switch the pattern
  const beatInSection = _indBeat - _indSectionStart;
  if (beatInSection >= 32) {
    _indSection = (_indSection + 1) % 4;
    _indSectionStart = _indBeat;
  }

  const scales = {
    chill: [0, 3, 5, 7, 10, 12, 15],
    tense: [0, 1, 3, 5, 6, 8, 10, 12],
    frantic: [0, 1, 3, 4, 6, 7, 9, 10, 12, 13],
  };
  const scale = scales[musicMood] || scales.chill;
  const baseFreq = musicMood === 'frantic' ? 55 : musicMood === 'tense' ? 65 : 82;

  // 4 sections that loop — each has unique kick/snare/hihat/lead patterns (32-step)
  const sections = [
    { // Sparse intro — heavy kick, minimal snare
      kick:  [1,0,0,0, 1,0,0,1, 0,0,1,0, 0,0,0,1, 1,0,0,0, 1,0,0,1, 0,0,1,0, 1,0,0,0],
      snare: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,1, 0,0,1,0],
      hat:   [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
      lead:  false, leadDensity: 0,
      rootShift: 0,
    },
    { // Amen break ramp-up
      kick:  [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1, 1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1],
      snare: [0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
      hat:   [1,1,0,1, 1,0,1,1, 0,1,1,0, 1,1,0,1, 1,1,0,1, 1,0,1,1, 0,1,1,0, 1,1,0,1],
      lead:  true, leadDensity: 4,
      rootShift: -2,
    },
    { // Breakdown — sparse, atmospheric, lead carries
      kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
      snare: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0],
      hat:   [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1],
      lead:  true, leadDensity: 2,
      rootShift: 5,
    },
    { // Climax — chaotic breakcore
      kick:  [1,0,1,1, 0,1,0,1, 1,0,0,1, 1,0,1,0, 1,0,1,1, 0,1,0,1, 1,0,1,0, 1,1,0,1],
      snare: [0,1,0,0, 1,0,0,1, 0,0,1,0, 0,1,1,0, 0,1,0,0, 1,0,0,1, 0,1,0,1, 0,0,1,0],
      hat:   [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      lead:  true, leadDensity: 1,
      rootShift: -5,
    },
  ];
  const sec = sections[_indSection];
  const step = beatInSection % 32;
  const sectionBaseFreq = baseFreq * Math.pow(2, sec.rootShift / 12);

  // Atmospheric drone swells in at section start — the "background ambience"
  if (step === 0) {
    industrialDrone(t, 0.18 * v, sectionBaseFreq, tempo * 32);
  }

  // Heavy sub bass on every 4th beat
  if (step % 4 === 0) {
    const note = scale[Math.floor(Math.random() * 3)];
    const freq = sectionBaseFreq * Math.pow(2, note / 12);
    const bass = actx.createOscillator(), bg = actx.createGain();
    bass.type = 'sine'; bass.frequency.value = freq;
    const bFilter = actx.createBiquadFilter(); bFilter.type = 'lowpass'; bFilter.frequency.value = 120;
    bg.gain.setValueAtTime(0.06 * v, t); bg.gain.exponentialRampToValueAtTime(0.001, t + tempo * 3.5);
    bass.connect(bFilter); bFilter.connect(bg); bg.connect(actx.destination);
    bass.start(t); bass.stop(t + tempo * 4);
  }

  // Section-driven kick
  if (sec.kick[step]) {
    const ko = actx.createOscillator(), kg = actx.createGain();
    ko.type = 'sine'; ko.frequency.setValueAtTime(150, t); ko.frequency.exponentialRampToValueAtTime(35, t + 0.08);
    kg.gain.setValueAtTime(0.07 * v, t); kg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    ko.connect(kg); kg.connect(actx.destination); ko.start(t); ko.stop(t + 0.12);
  }

  // Section-driven snare
  if (sec.snare[step]) {
    const bs = actx.sampleRate * 0.04, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 5);
    const sn = actx.createBufferSource(); sn.buffer = buf;
    const sg = actx.createGain(); sg.gain.setValueAtTime(0.05 * v, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    const sf = actx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 3000; sf.Q.value = 1;
    sn.connect(sf); sf.connect(sg); sg.connect(actx.destination); sn.start(t); sn.stop(t + 0.06);
  }

  // Section-driven hi-hats (frantic mood doubles them up)
  if (sec.hat[step] || (musicMood === 'frantic' && step % 2 === 0)) {
    const hbs = actx.sampleRate * 0.015, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / hbs * 10);
    const hh = actx.createBufferSource(); hh.buffer = hbuf;
    const hg = actx.createGain(); hg.gain.setValueAtTime((musicMood === 'frantic' ? 0.04 : 0.025) * v, t); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    const hhf = actx.createBiquadFilter(); hhf.type = 'highpass'; hhf.frequency.value = 7000;
    hh.connect(hhf); hhf.connect(hg); hg.connect(actx.destination); hh.start(t); hh.stop(t + 0.02);
  }

  // Distorted lead stabs — section controls density
  if (sec.lead && step % sec.leadDensity === 0) {
    const note = scale[3 + Math.floor(Math.random() * (scale.length - 3))];
    const freq = sectionBaseFreq * 2 * Math.pow(2, note / 12);
    const lead = actx.createOscillator(), lg = actx.createGain();
    lead.type = 'sawtooth'; lead.frequency.value = freq;
    const dist = actx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = i * 2 / 256 - 1; curve[i] = Math.tanh(x * 4); }
    dist.curve = curve;
    lg.gain.setValueAtTime(0.025 * v, t); lg.gain.exponentialRampToValueAtTime(0.001, t + tempo * 1.5);
    lead.connect(dist); dist.connect(lg); lg.connect(actx.destination);
    lead.start(t); lead.stop(t + tempo * 2);
  }

  nextNote = t + tempo;
}

// Realistic drum synthesis helpers
function tribalDjembe(t, vol, pitch) {
  if (!actx) return;
  // Body — pitched sine with quick decay (membrane vibration)
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(pitch * 2, t);
  o.frequency.exponentialRampToValueAtTime(pitch, t + 0.015);
  o.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + 0.2);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.4);
  // Attack noise (skin slap)
  const bs = actx.sampleRate * 0.06, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 8);
  const ns = actx.createBufferSource(); ns.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(vol * 0.4, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = pitch * 4; bp.Q.value = 1.5;
  ns.connect(bp); bp.connect(ng); ng.connect(actx.destination);
  ns.start(t); ns.stop(t + 0.06);
}
function tribalShaker(t, vol) {
  if (!actx) return;
  const bs = actx.sampleRate * 0.08, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs);
  const ns = actx.createBufferSource(); ns.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(vol, t + 0.01);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
  ns.connect(hp); hp.connect(ng); ng.connect(actx.destination);
  ns.start(t); ns.stop(t + 0.08);
}

function deepDrum(t, vol, basePitch) {
  if (!actx) return;
  // Big resonant body — much lower than djembe
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(basePitch * 1.8, t);
  o.frequency.exponentialRampToValueAtTime(basePitch, t + 0.05);
  o.frequency.exponentialRampToValueAtTime(basePitch * 0.6, t + 0.7);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 1);
  // Sub layer
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = 'sine'; sub.frequency.value = basePitch * 0.5;
  sg.gain.setValueAtTime(vol * 0.6, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  sub.connect(sg); sg.connect(actx.destination); sub.start(t); sub.stop(t + 1.2);
  // Attack
  const bs = actx.sampleRate * 0.08, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 5);
  const ns = actx.createBufferSource(); ns.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(vol * 0.5, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
  ns.connect(lp); lp.connect(ng); ng.connect(actx.destination);
  ns.start(t); ns.stop(t + 0.08);
}
function bonePercussion(t, vol) {
  if (!actx) return;
  // Hollow knock — bones clattering
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.06);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 8;
  o.connect(bp); bp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.08);
}
function caveDrone(t, vol, freq, dur) {
  if (!actx) return;
  // Eerie sustained drone — minor chord with detuning for evil vibe
  for (const detune of [0, 7, -1.05]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sawtooth'; o.frequency.value = freq * Math.pow(2, detune / 12);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; lp.Q.value = 2;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.2);
    g.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
  }
}

// Warm orchestral pad for classic track — major or minor chord stack
function classicPad(t, vol, baseFreq, dur, isMinor) {
  if (!actx) return;
  const intervals = isMinor ? [0, 3, 7, 12] : [0, 4, 7, 12];
  for (const semi of intervals) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = baseFreq * Math.pow(2, semi / 12);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.28, t + dur * 0.25);
    g.gain.linearRampToValueAtTime(vol * 0.28, t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
  }
  // Detuned shimmer layer for warmth
  for (const semi of [12, 19]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = baseFreq * Math.pow(2, semi / 12) * 1.005;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.06, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(vol * 0.06, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
  }
}

// Dark filtered drone for industrial track — diminished chord with sweeping filter
function industrialDrone(t, vol, baseFreq, dur) {
  if (!actx) return;
  // Root, minor third, tritone — dissonant, dread-inducing
  for (const detune of [0, 3, 6.04]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sawtooth'; o.frequency.value = baseFreq * Math.pow(2, detune / 12);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
    lp.frequency.setValueAtTime(180, t);
    lp.frequency.linearRampToValueAtTime(1100, t + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(220, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.32, t + dur * 0.2);
    g.gain.linearRampToValueAtTime(vol * 0.32, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
  }
  // Sub-bass pulse underneath
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = 'sine'; sub.frequency.value = baseFreq * 0.5;
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.15);
  sg.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.85);
  sg.gain.exponentialRampToValueAtTime(0.001, t + dur);
  sub.connect(sg); sg.connect(actx.destination); sub.start(t); sub.stop(t + dur);
}

let _tribalBeat = 0, _tribalSection = 0, _tribalSectionStart = 0;
function tickMusicTribal() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  const tempos = { chill: 0.32, tense: 0.24, frantic: 0.18 };
  const tempo = tempos[musicMood] || 0.32;
  if (t < nextNote - 0.03) return;
  const v = musicVol();
  _tribalBeat++;

  // Section progression — every 32 beats switch the pattern
  const beatInSection = _tribalBeat - _tribalSectionStart;
  if (beatInSection >= 32) {
    _tribalSection = (_tribalSection + 1) % 4;
    _tribalSectionStart = _tribalBeat;
  }

  // 4 different sections that loop
  const sections = [
    { // Slow ritual buildup
      lowDrum:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,1],
      midDrum:  [0,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0],
      highDrum: [0,0,1,0, 0,0,0,1, 0,1,0,0, 0,0,0,0, 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,1,0],
      bones:    [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    },
    { // Intense war drums
      lowDrum:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,1,0,1],
      midDrum:  [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,0,1],
      highDrum: [0,1,0,0, 1,0,0,1, 0,1,1,0, 0,1,0,0, 0,1,0,0, 1,0,0,1, 0,1,1,0, 1,0,0,0],
      bones:    [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,1, 1,0,0,0, 0,1,0,0, 1,0,0,0, 0,1,0,1],
    },
    { // Rhythmic pulse with drone
      lowDrum:  [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,1,0, 1,0,0,1],
      midDrum:  [0,1,0,0, 1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,1, 0,0,1,0],
      highDrum: [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,1, 0,0,1,0, 0,1,0,0, 0,0,0,1, 0,1,0,0],
      bones:    [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,1, 0,0,0,1],
    },
    { // Polyrhythmic chaos
      lowDrum:  [1,0,0,1, 1,0,1,0, 0,1,0,1, 1,0,1,0, 1,0,0,1, 1,0,1,0, 0,1,0,1, 1,1,0,1],
      midDrum:  [0,1,1,0, 0,1,0,1, 1,0,1,0, 0,1,0,1, 0,1,1,0, 0,1,0,1, 1,0,1,0, 0,1,1,0],
      highDrum: [1,0,0,1, 0,0,1,1, 0,1,1,0, 1,0,0,1, 0,1,0,0, 1,0,1,1, 1,0,0,1, 0,1,1,0],
      bones:    [1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,1,1],
    },
  ];
  const sec = sections[_tribalSection];
  const step = beatInSection % 32;

  if (sec.lowDrum[step]) deepDrum(t, 0.25 * v, musicMood === 'frantic' ? 50 : 42);
  if (sec.midDrum[step]) tribalDjembe(t, 0.15 * v, musicMood === 'frantic' ? 130 : 110);
  if (sec.highDrum[step]) tribalDjembe(t, 0.1 * v, 200);
  if (sec.bones[step]) bonePercussion(t, 0.08 * v);

  // Eerie cave drone every section start
  if (step === 0) {
    const droneFreqs = [55, 41.2, 49, 36.7]; // A, E, G, D — minor key
    caveDrone(t, 0.12 * v, droneFreqs[_tribalSection], tempo * 32);
  }

  // Shaker on tense/frantic
  if (musicMood !== 'chill' && step % 2 === 1) tribalShaker(t, 0.04 * v);

  nextNote = t + tempo;
}

// ---- Money (Wall Street) helpers ----
function jazzBass(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 0.18);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
  o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.24);
}
function pianoStab(t, vol, rootFreq, isMinor) {
  if (!actx) return;
  const intervals = isMinor ? [0, 3, 7] : [0, 4, 7];
  for (const semi of intervals) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.4);
  }
  // Hammer click
  const bs = actx.sampleRate * 0.012, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 6);
  const n = actx.createBufferSource(); n.buffer = buf;
  const ng = actx.createGain(); ng.gain.setValueAtTime(vol * 0.5, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
  const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
  n.connect(hp); hp.connect(ng); ng.connect(actx.destination); n.start(t); n.stop(t + 0.012);
}
function saxLead(t, vol, freq, dur) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sawtooth';
  // Vibrato
  const lfo = actx.createOscillator(), lfoGain = actx.createGain();
  lfo.frequency.value = 5; lfoGain.gain.value = freq * 0.015;
  lfo.connect(lfoGain); lfoGain.connect(o.frequency);
  o.frequency.value = freq;
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq * 2.5; bp.Q.value = 3;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.04);
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(bp); bp.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + dur);
  lfo.start(t); lfo.stop(t + dur);
}
function cashRegister(t, vol) {
  if (!actx) return;
  // Ding ding — two bells
  [2200, 1760].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.08);
    g.gain.linearRampToValueAtTime(vol, t + i * 0.08 + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
    o.connect(g); g.connect(actx.destination); o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.32);
  });
}
function brassHit(t, vol, rootFreq) {
  if (!actx) return;
  for (const semi of [0, 4, 7, 12]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sawtooth'; o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(600, t);
    lp.frequency.linearRampToValueAtTime(3200, t + 0.05);
    lp.frequency.linearRampToValueAtTime(1000, t + 0.3);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.4);
  }
}
function jazzKick(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.15);
}
function brushSnare(t, vol) {
  if (!actx) return;
  const bs = actx.sampleRate * 0.08, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 2.5);
  const n = actx.createBufferSource(); n.buffer = buf;
  const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.8;
  n.connect(bp); bp.connect(g); g.connect(actx.destination); n.start(t); n.stop(t + 0.08);
}

let _moneyBeat = 0, _moneySection = 0, _moneySectionStart = 0;
function tickMusicMoney() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  const tempos = { chill: 0.15, tense: 0.13, frantic: 0.11 };
  const tempo = tempos[musicMood] || 0.15;
  if (t < nextNote - 0.03) return;
  const v = musicVol();
  _moneyBeat++;

  const beatInSection = _moneyBeat - _moneySectionStart;
  if (beatInSection >= 32) {
    _moneySection = (_moneySection + 1) % 4;
    _moneySectionStart = _moneyBeat;
  }

  // Dorian/jazz scale semitone offsets from the root
  const walkingScales = {
    chill:   [0, 2, 3, 5, 7, 9, 10, 12],
    tense:   [0, 2, 3, 5, 7, 8, 10, 12],
    frantic: [0, 1, 3, 5, 7, 8, 10, 11, 12],
  };
  const scale = walkingScales[musicMood] || walkingScales.chill;

  // Four sections with increasingly energetic patterns
  const sections = [
    { // Opening bell — sparse, piano intro, walking bass
      root: 0, isMinor: false,
      bassPat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      pianoPat:  [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      kickPat:   [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,1, 1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,1],
      snarePat:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0],
      hatPat:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      saxFreq: 0, brassPat: null,
    },
    { // Trading floor — full groove, sax hooks
      root: 5, isMinor: false,
      bassPat:   [1,0,1,1, 1,0,1,0, 1,1,0,1, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,1,0,1, 1,0,1,0],
      pianoPat:  [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0],
      kickPat:   [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0, 0,0,1,0],
      snarePat:  [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
      hatPat:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      saxFreq: 3, brassPat: null,
    },
    { // Market dip — minor, tense, filter sweeps, sparse
      root: -2, isMinor: true,
      bassPat:   [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0],
      pianoPat:  [1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
      kickPat:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0],
      snarePat:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
      hatPat:    [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      saxFreq: 7, brassPat: null,
    },
    { // Rally — full energy, ascending leads, brass stabs
      root: 0, isMinor: false,
      bassPat:   [1,1,0,1, 1,0,1,1, 1,0,1,1, 1,1,0,1, 1,1,0,1, 1,0,1,1, 1,0,1,1, 1,1,0,1],
      pianoPat:  [1,0,1,0, 1,0,1,0, 0,1,0,1, 0,1,0,1, 1,0,1,0, 1,0,1,0, 0,1,0,1, 0,1,0,1],
      kickPat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
      snarePat:  [0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0, 0,1,0,0, 1,0,0,1, 0,0,1,0],
      hatPat:    [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      saxFreq: 5, brassPat: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,1],
    },
  ];
  const sec = sections[_moneySection];
  const step = beatInSection % 32;
  // A=110Hz walking bass register; "root" shift gives chord movement per section
  const baseBass = 110 * Math.pow(2, sec.root / 12);
  const basePiano = 220 * Math.pow(2, sec.root / 12);

  // Section transition: warm pad + cash register ding
  if (step === 0) {
    classicPad(t, 0.1 * v, basePiano, tempo * 32, sec.isMinor);
    cashRegister(t + 0.05, 0.12 * v);
  }

  // Walking bass — traverses scale across the bar
  if (sec.bassPat[step]) {
    const walkIdx = Math.floor((step / 4)) % scale.length;
    jazzBass(t, 0.11 * v, baseBass * Math.pow(2, scale[walkIdx] / 12));
  }
  // Piano chord stabs
  if (sec.pianoPat[step]) pianoStab(t, 0.08 * v, basePiano, sec.isMinor);
  // Kick + snare + hat
  if (sec.kickPat[step]) jazzKick(t, 0.08 * v);
  if (sec.snarePat[step]) brushSnare(t, 0.06 * v);
  if (sec.hatPat[step]) {
    const hbs = actx.sampleRate * 0.018, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / hbs * 9);
    const hh = actx.createBufferSource(); hh.buffer = hbuf;
    const hg = actx.createGain(); hg.gain.setValueAtTime(0.02 * v, t); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    const hhf = actx.createBiquadFilter(); hhf.type = 'highpass'; hhf.frequency.value = 7500;
    hh.connect(hhf); hhf.connect(hg); hg.connect(actx.destination); hh.start(t); hh.stop(t + 0.02);
  }
  // Sax hook every 8 beats
  if (step % 8 === 0 && sec.saxFreq) {
    const note = scale[(sec.saxFreq + Math.floor(step / 8)) % scale.length];
    saxLead(t, 0.055 * v, basePiano * 2 * Math.pow(2, note / 12), tempo * 6);
  }
  // Brass stabs
  if (sec.brassPat && sec.brassPat[step]) brassHit(t, 0.08 * v, basePiano);

  nextNote = t + tempo;
}
function startMenuMusicMoney() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = musicVol();
    const scale = [0, 2, 3, 5, 7, 9, 10, 12];
    // Walking bass pulse
    if (beat % 2 === 0) {
      jazzBass(t, 0.08 * v, 110 * Math.pow(2, scale[Math.floor(beat / 2) % scale.length] / 12));
    }
    // Piano on beat 0
    if (beat % 4 === 0) pianoStab(t, 0.05 * v, 220, false);
    // Kick on 1, snare on 3
    if (beat % 4 === 0) jazzKick(t, 0.05 * v);
    if (beat % 4 === 2) brushSnare(t, 0.04 * v);
    // Sax lick every 16 beats
    if (beat % 16 === 0) saxLead(t, 0.04 * v, 440 * Math.pow(2, scale[(beat / 16) % scale.length] / 12), 1.0);
    beat++;
  }, 200);
}

// ---- BoyMusic (Fruity/Bouncy) helpers ----
function bouncePluck(t, vol, freq, dur) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'square'; o.frequency.setValueAtTime(freq * 1.02, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
}
function fruityBass(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.28);
  // Sub
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = 'sine'; sub.frequency.value = freq * 0.5;
  sg.gain.setValueAtTime(vol * 0.7, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  sub.connect(sg); sg.connect(actx.destination); sub.start(t); sub.stop(t + 0.22);
}
function fruityPad(t, vol, rootFreq, dur) {
  if (!actx) return;
  for (const semi of [0, 4, 7, 12]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    const lfo = actx.createOscillator(), lfoGain = actx.createGain();
    lfo.frequency.value = 4 + Math.random(); lfoGain.gain.value = rootFreq * 0.006;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.3, t + dur * 0.25);
    g.gain.linearRampToValueAtTime(vol * 0.3, t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
    lfo.start(t); lfo.stop(t + dur);
  }
}
function poppyKick(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.08);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.14);
}

let _boyBeat = 0, _boySection = 0, _boySectionStart = 0;
function tickMusicBoy() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  const tempos = { chill: 0.16, tense: 0.13, frantic: 0.1 };
  const tempo = tempos[musicMood] || 0.16;
  if (t < nextNote - 0.03) return;
  const v = musicVol();
  _boyBeat++;

  const beatInSection = _boyBeat - _boySectionStart;
  if (beatInSection >= 32) {
    _boySection = (_boySection + 1) % 4;
    _boySectionStart = _boyBeat;
  }

  // Major pentatonic + chromatic passing notes — bouncy happy scale
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];

  const sections = [
    { // Intro — bouncy arpeggios
      melody: [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 14, 12, 7, 4, 2, 0, 0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 14, 12, 7, 4, 2, 0],
      bassPat:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      kickPat:[1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      root: 0,
    },
    { // Verse — melodic hop
      melody: [4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 12, 9, 7, 4, 2, 0],
      bassPat:[1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0],
      kickPat:[1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
      root: 5,
    },
    { // Bridge — playful rests, tricky
      melody: [7, -1, 9, -1, 7, 4, 9, -1, 12, -1, 9, 7, 4, -1, 2, -1, 7, -1, 9, -1, 12, 14, 9, -1, 7, -1, 4, 7, 9, -1, 7, -1],
      bassPat:[1,0,0,1, 1,0,0,1, 0,1,0,0, 1,0,0,1, 1,0,0,1, 1,0,0,1, 0,1,0,0, 1,0,0,1],
      kickPat:[1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,1, 1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,1],
      root: -2,
    },
    { // Chorus — full bounce, fast arps
      melody: [12, 9, 7, 12, 14, 12, 9, 7, 12, 14, 16, 14, 12, 9, 7, 4, 12, 9, 7, 12, 14, 16, 14, 12, 9, 12, 7, 4, 2, 4, 0, -1],
      bassPat:[1,0,1,1, 1,0,1,0, 1,1,0,1, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,1,0,1, 1,0,1,1],
      kickPat:[1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
      root: 0,
    },
  ];
  const sec = sections[_boySection];
  const step = beatInSection % 32;
  const rootFreq = 261.63 * Math.pow(2, sec.root / 12);

  // Section transition — fruity pad swell
  if (step === 0) {
    fruityPad(t, 0.1 * v, rootFreq * 0.5, tempo * 32);
  }

  // Melody
  const noteIdx = sec.melody[step];
  if (noteIdx !== undefined && noteIdx >= 0) {
    bouncePluck(t, 0.07 * v, rootFreq * Math.pow(2, noteIdx / 12), tempo * 1.2);
  }
  // Bass
  if (sec.bassPat[step]) {
    fruityBass(t, 0.06 * v, rootFreq * 0.5);
  }
  // Kick
  if (sec.kickPat[step]) poppyKick(t, 0.08 * v);
  // Shaker on off-beats
  if (step % 2 === 1) {
    const bs = actx.sampleRate * 0.02, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * 0.4 * (1 - i / bs);
    const n = actx.createBufferSource(); n.buffer = buf;
    const g = actx.createGain(); g.gain.setValueAtTime(0.03 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
    n.connect(hp); hp.connect(g); g.connect(actx.destination); n.start(t); n.stop(t + 0.02);
  }
  // Harmony pluck an octave up on beat 16 of section
  if (step === 16) bouncePluck(t, 0.05 * v, rootFreq * 4, tempo * 1.5);

  nextNote = t + tempo;
}
function startMenuMusicBoy() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = musicVol();
    const scale = [0, 4, 7, 12, 14, 12, 7, 4];
    const note = scale[beat % scale.length];
    bouncePluck(t, 0.05 * v, 261.63 * Math.pow(2, note / 12), 0.3);
    if (beat % 2 === 0) fruityBass(t, 0.04 * v, 130.81);
    if (beat % 4 === 0) poppyKick(t, 0.05 * v);
    beat++;
  }, 240);
}

// ---- Neo Gospel (Spyro-inspired) helpers ----
function jazz7Chord(t, vol, rootFreq, isMinor) {
  if (!actx) return;
  // Root, 3rd, 5th, 7th — stacked Rhodes-ish electric piano
  const intervals = isMinor ? [0, 3, 7, 10] : [0, 4, 7, 11];
  for (const semi of intervals) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.95);
  }
  // Chime layer — bell-like harmonics on top
  for (const semi of [12, 19]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'triangle'; o.frequency.value = rootFreq * Math.pow(2, semi / 12) * 1.003;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 1.5);
  }
}
function spyroLead(t, vol, freq, dur) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle'; o.frequency.value = freq;
  // Subtle vibrato — the dreamy quality
  const lfo = actx.createOscillator(), lfoGain = actx.createGain();
  lfo.frequency.value = 5.5; lfoGain.gain.value = freq * 0.012;
  lfo.connect(lfoGain); lfoGain.connect(o.frequency);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 1.5;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.04);
  g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(lp); lp.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + dur);
  lfo.start(t); lfo.stop(t + dur);
}
function cleanGuitar(t, vol, freq) {
  if (!actx) return;
  // Square through lowpass for a clean electric guitar chord stab
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'square'; o.frequency.value = freq;
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 2;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(lp); lp.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + 0.4);
}
function rhythmKick(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.07);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.14);
}
function liveSnare(t, vol) {
  if (!actx) return;
  const bs = actx.sampleRate * 0.06, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 4);
  const n = actx.createBufferSource(); n.buffer = buf;
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2100; bp.Q.value = 1.2;
  const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  // Tonal body
  const o = actx.createOscillator(), og = actx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.05);
  og.gain.setValueAtTime(vol * 0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.connect(og); og.connect(actx.destination); o.start(t); o.stop(t + 0.08);
  n.connect(bp); bp.connect(g); g.connect(actx.destination); n.start(t); n.stop(t + 0.08);
}
function walkBass(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
  o.connect(lp); lp.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.3);
}

let _neoBeat = 0, _neoSection = 0, _neoSectionStart = 0;
function tickMusicNeo() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  const tempos = { chill: 0.19, tense: 0.16, frantic: 0.13 };
  const tempo = tempos[musicMood] || 0.19;
  if (t < nextNote - 0.03) return;
  const v = musicVol();
  _neoBeat++;

  const beatInSection = _neoBeat - _neoSectionStart;
  if (beatInSection >= 32) {
    _neoSection = (_neoSection + 1) % 4;
    _neoSectionStart = _neoBeat;
  }

  // Dorian scale — the "magical jazzy exploration" mode
  const scale = [0, 2, 3, 5, 7, 9, 10, 12, 14];

  const sections = [
    { // Exploration — gentle, sparse drums, wandering melody
      melody: [0, -1, -1, 4, -1, 5, -1, 7, -1, -1, 5, -1, 4, -1, 2, -1, 0, -1, 2, -1, 4, -1, 5, -1, 7, -1, 5, -1, 4, -1, -1, -1],
      bassPat:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      kickPat:[1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0],
      snarePat:[0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0],
      guitarPat:[0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      root: 0, isMinor: false,
    },
    { // Curious discovery — more layers, swelling
      melody: [4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9, 11, 9, 7, 5, 4, 2, 0, -1],
      bassPat:[1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,0, 0,0,1,0],
      kickPat:[1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,1,0],
      snarePat:[0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
      guitarPat:[0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
      root: 5, isMinor: false,
    },
    { // Mystery — minor, contemplative, spacious
      melody: [7, -1, -1, 5, 4, -1, -1, 7, 5, -1, -1, 4, 2, -1, -1, 0, 2, -1, -1, 4, 5, -1, -1, 7, 5, -1, 4, -1, 2, -1, 0, -1],
      bassPat:[1,0,0,0, 0,0,0,1, 1,0,0,0, 0,0,0,1, 1,0,0,0, 0,0,0,1, 1,0,0,0, 0,0,0,1],
      kickPat:[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0],
      snarePat:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
      guitarPat:[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      root: -3, isMinor: true,
    },
    { // Celebration — full energy, memorable hook
      melody: [7, 9, 11, 12, 11, 9, 7, 5, 4, 7, 9, 12, 14, 12, 9, 7, 7, 9, 11, 12, 11, 9, 7, 12, 14, 12, 9, 7, 5, 4, 2, 0],
      bassPat:[1,0,1,1, 1,0,1,0, 1,1,0,1, 1,0,1,0, 1,0,1,1, 1,0,1,0, 1,1,0,1, 1,0,1,1],
      kickPat:[1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,1, 1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,1],
      snarePat:[0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0],
      guitarPat:[1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      root: 0, isMinor: false,
    },
  ];
  const sec = sections[_neoSection];
  const step = beatInSection % 32;
  const rootFreq = 220 * Math.pow(2, sec.root / 12);

  // Section transition: full jazz 7 chord swell
  if (step === 0) {
    jazz7Chord(t, 0.08 * v, rootFreq * 0.5, sec.isMinor);
  }

  // Melody — triangle lead with vibrato
  const noteIdx = sec.melody[step];
  if (noteIdx !== undefined && noteIdx >= 0) {
    const scaleNote = scale[noteIdx % scale.length];
    const freq = rootFreq * Math.pow(2, scaleNote / 12);
    spyroLead(t, 0.05 * v, freq, tempo * 1.4);
  }

  // Walking bass
  if (sec.bassPat[step]) {
    const walkIdx = Math.floor(step / 4) % scale.length;
    const bassFreq = rootFreq * 0.25 * Math.pow(2, scale[walkIdx] / 12);
    walkBass(t, 0.06 * v, bassFreq);
  }

  // Guitar chord stabs
  if (sec.guitarPat[step]) {
    cleanGuitar(t, 0.04 * v, rootFreq);
    cleanGuitar(t, 0.04 * v, rootFreq * Math.pow(2, (sec.isMinor ? 3 : 4) / 12));
    cleanGuitar(t, 0.04 * v, rootFreq * Math.pow(2, 7 / 12));
  }

  // Kick + snare
  if (sec.kickPat[step]) rhythmKick(t, 0.07 * v);
  if (sec.snarePat[step]) liveSnare(t, 0.05 * v);

  // Hi-hat on off-beats (eighth-note shuffle)
  if (step % 2 === 1) {
    const hbs = actx.sampleRate * 0.014, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / hbs * 10);
    const hh = actx.createBufferSource(); hh.buffer = hbuf;
    const hg = actx.createGain(); hg.gain.setValueAtTime(0.018 * v, t); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    const hhf = actx.createBiquadFilter(); hhf.type = 'highpass'; hhf.frequency.value = 7500;
    hh.connect(hhf); hhf.connect(hg); hg.connect(actx.destination); hh.start(t); hh.stop(t + 0.018);
  }

  nextNote = t + tempo;
}
function startMenuMusicNeo() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = musicVol();
    const scale = [0, 2, 3, 5, 7, 9, 10];
    if (beat % 8 === 0) jazz7Chord(t, 0.06 * v, 110, false);
    if (beat % 2 === 0) walkBass(t, 0.04 * v, 55 * Math.pow(2, scale[Math.floor(beat / 2) % scale.length] / 12));
    if (beat % 4 === 0) rhythmKick(t, 0.04 * v);
    if (beat % 4 === 2) liveSnare(t, 0.035 * v);
    if (beat % 16 === 0) {
      const note = scale[(beat / 16) % scale.length];
      spyroLead(t, 0.04 * v, 220 * Math.pow(2, note / 12), 1.5);
    }
    beat++;
  }, 220);
}

let _classicBeat = 0, _classicSection = 0, _classicSectionStart = 0;
export function tickMusic() {
  if (S.musicStyle === 'radio') { tickMusicRadio(); return; }
  _stopRadioIfRunning(); // defensive: stop radio if the style changed mid-game
  if (S.musicStyle === 'custom') { tickMusicCustom(); return; }
  if (S.musicStyle === 'tribal') { tickMusicTribal(); return; }
  if (S.musicStyle === 'industrial') { tickMusicIndustrial(); return; }
  if (S.musicStyle === 'money') { tickMusicMoney(); return; }
  if (S.musicStyle === 'boy') { tickMusicBoy(); return; }
  if (S.musicStyle === 'neo') { tickMusicNeo(); return; }
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  const tempo = TEMPOS[musicMood] || 0.28;
  if (t < nextNote - 0.05) return;
  const v = musicVol();
  _classicBeat++;

  // Section progression — every 32 beats switch the pattern
  const beatInSection = _classicBeat - _classicSectionStart;
  if (beatInSection >= 32) {
    _classicSection = (_classicSection + 1) % 4;
    _classicSectionStart = _classicBeat;
  }

  const scale = SCALES[musicMood] || SCALES.chill;
  const baseFreq = musicMood === 'frantic' ? 220 : musicMood === 'tense' ? 247 : 261.63;

  // 4 sections — each has melodic phrasing, bass pattern, harmonic root, pad chord
  // Melody values are scale-degree indices (-1 = rest)
  const sections = [
    { // Verse — gentle ascent
      melody: [0,-1, 2,-1, 4,-1, 2, 0, -1,-1, 4,-1, 5,-1, 4, 2, 0,-1, 2, 4, 5,-1, 4,-1, 2,-1, 0,-1, -1,-1,-1,-1],
      bass:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      rootShift: 0, padMinor: false,
    },
    { // Chorus — soaring melody
      melody: [4,-1, 5, 7, 5,-1, 4,-1, 2,-1, 4,-1, 5,-1, 7,-1, 4,-1, 5, 7, 5, 7, 4,-1, 2,-1, 0,-1, -1,-1,-1,-1],
      bass:   [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
      rootShift: 5, padMinor: false,
    },
    { // Bridge — minor, contemplative
      melody: [4,-1,-1, 2, 4,-1,-1, 5, 4,-1,-1, 2, 0,-1,-1,-1, 2,-1,-1, 4, 5,-1, 4,-1, 2,-1, 0,-1, -1,-1,-1,-1],
      bass:   [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      rootShift: -3, padMinor: true,
    },
    { // Climax — full energy, octave jumps
      melody: [7, 5, 4, 5, 7,-1, 7, 5, 4,-1, 5, 7, 4,-1, 7,-1, 7, 5, 4, 5, 7,-1, 4, 7, 5, 4, 2, 4, 0,-1,-1,-1],
      bass:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1],
      rootShift: 0, padMinor: false,
    },
  ];
  const sec = sections[_classicSection];
  const step = beatInSection % 32;
  const sectionBaseFreq = baseFreq * Math.pow(2, sec.rootShift / 12);

  // Warm pad ambience swells in at section start — the "background ambience"
  if (step === 0) {
    classicPad(t, 0.09 * v, sectionBaseFreq * 0.5, tempo * 32, sec.padMinor);
  }

  // Melody — pattern-driven, with mood-based randomization for non-rest steps
  const noteIdx = sec.melody[step];
  if (noteIdx >= 0) {
    const scaleNote = scale[noteIdx % scale.length];
    const freq = sectionBaseFreq * Math.pow(2, scaleNote / 12);
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = musicMood === 'frantic' ? 'sawtooth' : 'triangle';
    o.frequency.value = freq;
    const mv = (musicMood === 'frantic' ? 0.04 : 0.03) * v;
    g.gain.setValueAtTime(mv, t); g.gain.setValueAtTime(mv, t + tempo * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + tempo * 0.95);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + tempo);
  }

  // Bass — section-driven pattern
  if (sec.bass[step]) {
    const rootNote = scale[0];
    const bassFreq = sectionBaseFreq * Math.pow(2, rootNote / 12) / 2;
    const b = actx.createOscillator(), bg2 = actx.createGain();
    b.type = 'sine'; b.frequency.value = bassFreq;
    bg2.gain.setValueAtTime(0.04 * v, t); bg2.gain.exponentialRampToValueAtTime(0.001, t + tempo * 1.6);
    b.connect(bg2); bg2.connect(actx.destination); b.start(t); b.stop(t + tempo * 2);
  }

  // Percussion on frantic — sparkle layer
  if (musicMood === 'frantic' && Math.random() < 0.4) {
    const bs2 = actx.sampleRate * 0.03, buf = actx.createBuffer(1, bs2, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < bs2; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
    const ns = actx.createBufferSource(); ns.buffer = buf;
    const ng = actx.createGain(); ng.gain.setValueAtTime(0.03 * v, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    ns.connect(ng); ng.connect(actx.destination); ns.start(t); ns.stop(t + 0.04);
  }
  nextNote = t + tempo;
}

// --- Ambient nature sounds ---
// Subtle wind + bird chirps. Wind is a continuous filtered noise node.
// Birds chirp randomly during daytime. Volume on music slider.
let _windNode = null, _windGain = null;
let _lastBirdT = 0;
export function tickAmbient(gameTime) {
  if (!actx) return;
  const v = musicVol() * 0.3; // ambient is quiet relative to music
  // Wind — one-shot init, volume updates every call
  if (!_windNode) {
    const bufSize = actx.sampleRate * 2;
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    _windNode = actx.createBufferSource();
    _windNode.buffer = buf; _windNode.loop = true;
    const lp = actx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 400; lp.Q.value = 0.5;
    _windGain = actx.createGain();
    _windGain.gain.value = v;
    _windNode.connect(lp); lp.connect(_windGain); _windGain.connect(actx.destination);
    _windNode.start();
  }
  if (_windGain) _windGain.gain.value = v;
  // Bird chirps — daytime only (gameTime % 1200 < 600), random ~every 3-8s
  const cycleT = (gameTime || 0) % 1200;
  const isDay = cycleT < 600;
  const now = actx.currentTime;
  if (isDay && now - _lastBirdT > 3 + Math.random() * 5) {
    _lastBirdT = now;
    const freq = 2000 + Math.random() * 2000;
    const dur = 0.05 + Math.random() * 0.08;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(freq * (0.8 + Math.random() * 0.4), now + dur);
    g.gain.setValueAtTime(v * 0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(now); o.stop(now + dur + 0.01);
    // Sometimes double-chirp
    if (Math.random() < 0.4) {
      const o2 = actx.createOscillator(), g2 = actx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(freq * 1.2, now + dur + 0.05);
      o2.frequency.exponentialRampToValueAtTime(freq * 1.1, now + dur + 0.05 + dur);
      g2.gain.setValueAtTime(v * 0.4, now + dur + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, now + dur * 2 + 0.05);
      o2.connect(g2); g2.connect(actx.destination);
      o2.start(now + dur + 0.05); o2.stop(now + dur * 2 + 0.08);
    }
  }
}
