import S from './state.js';

let actx = null;
export function getAudioCtx() { return actx; }

function masterVol() { return typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5; }

export function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  // Preload all sound samples
  loadSpitSample(); loadShotgunSamples(); loadLRSamples(); loadBoltyShotSample(); loadSampleSounds();
}

export function sfx(freq, dur, type, v) {
  if (!actx) return; const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.3, t + dur);
  const gain = (v || 0.1) * masterVol();
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
}

// Spit shot sample
let _spitBuf = null, _spitLoaded = false;
function loadSpitSample() {
  if (_spitLoaded || !actx) return;
  _spitLoaded = true;
  fetch('SpitShot.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _spitBuf = d; }).catch(() => {});
}
export function sfxShoot(vol) {
  if (!actx) return;
  loadSpitSample();
  if (_spitBuf) {
    const src = actx.createBufferSource(); src.buffer = _spitBuf;
    const g = actx.createGain(); g.gain.value = (vol || 0.08) * masterVol();
    src.connect(g); g.connect(actx.destination); src.start();
  } else {
    sfx(400, 0.12, 'square', vol || 0.08);
  }
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
export function sfxLR(vol) {
  if (!actx) return;
  loadLRSamples();
  if (lrBuffers.length > 0) {
    const buf = lrBuffers[Math.floor(Math.random() * lrBuffers.length)];
    const src = actx.createBufferSource(); src.buffer = buf;
    const g = actx.createGain(); g.gain.value = (vol || 0.1) * masterVol();
    src.connect(g); g.connect(actx.destination); src.start();
  } else {
    sfx(400, 0.12, 'square', vol || 0.08);
  }
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
export function sfxShotgun(vol) {
  if (!actx) return;
  loadShotgunSamples();
  loadSampleSounds();
  if (shotgunBuffers.length > 0) {
    const buf = shotgunBuffers[Math.floor(Math.random() * shotgunBuffers.length)];
    const src = actx.createBufferSource(); src.buffer = buf;
    const g = actx.createGain(); g.gain.value = (vol || 0.1) * masterVol();
    src.connect(g); g.connect(actx.destination); src.start();
  } else {
    sfx(300, 0.15, 'square', vol || 0.08);
  }
  // Shell ejection impact sound after the shot
  setTimeout(() => playSample(_shellImpactBuf, (vol || 0.1) * 0.8), 220);
}
// L96 shot sample
let _boltyShotBuf = null, _boltyShotLoaded = false;
function loadBoltyShotSample() {
  if (_boltyShotLoaded || !actx) return;
  _boltyShotLoaded = true;
  fetch('BoltyShot.ogg').then(r => r.arrayBuffer()).then(buf => actx.decodeAudioData(buf)).then(d => { _boltyShotBuf = d; }).catch(() => {});
}
export function sfxBolty() {
  if (!actx) return;
  loadBoltyShotSample();
  loadSampleSounds();
  if (_boltyShotBuf) {
    const src = actx.createBufferSource(); src.buffer = _boltyShotBuf;
    const g = actx.createGain(); g.gain.value = 0.1 * masterVol();
    src.connect(g); g.connect(actx.destination); src.start();
  } else {
    sfx(800, 0.25, 'sawtooth', 0.1);
  }
  // Bolt rack after shot
  setTimeout(() => {
    if (!playSample(_boltBuf, 0.08)) {
      sfx(300, 0.08, 'sawtooth', 0.07);
      setTimeout(() => sfx(500, 0.06, 'square', 0.06), 200);
    }
  }, 500);
}
export function sfxHit() { sfx(200, 0.15, 'sawtooth', 0.08); }
export function sfxEat() { sfx(800, 0.08, 'sine', 0.06); sfx(1200, 0.08, 'sine', 0.04); }
export function sfxLevelUp() {
  if (!actx) return; const t = actx.currentTime;
  const v = 0.08 * masterVol();
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = f; g.gain.setValueAtTime(v, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
    o.connect(g); g.connect(actx.destination); o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.2);
  });
}
export function sfxDeath() { sfx(400, 0.6, 'sawtooth', 0.08); }
export function sfxBump() { sfx(100, 0.1, 'sine', 0.05); }

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
export function sfxExplosion(vol) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_explosionBuf, vol || 0.15)) {
    sfx(60, 0.5, 'sine', vol || 0.15);
  }
}
export function sfxRocket(vol) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_rocketBuf, vol || 0.12)) {
    sfx(200, 0.3, 'sine', vol || 0.1);
  }
}
function playSample(buf, vol) {
  if (!actx || !buf) return false;
  const src = actx.createBufferSource(); src.buffer = buf;
  const g = actx.createGain(); g.gain.value = (vol || 0.1) * masterVol();
  src.connect(g); g.connect(actx.destination); src.start();
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
    const v = masterVol();
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
  if (S.musicStyle === 'tribal') { startMenuMusicTribal(); return; }
  if (S.musicStyle === 'industrial') { startMenuMusicIndustrial(); return; }
  if (S.musicStyle === 'money') { startMenuMusicMoney(); return; }
  if (S.musicStyle === 'boy') { startMenuMusicBoy(); return; }
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  const chords = [[0,4,7],[5,9,12],[7,11,14],[3,7,10]];
  menuMusicInterval = setInterval(() => {
    if (S.state === 'playing') { stopMenuMusic(); return; }
    const t = actx.currentTime;
    const v = masterVol();
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
    const v = masterVol();
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

export function stopMenuMusic() { if (menuMusicInterval) { clearInterval(menuMusicInterval); menuMusicInterval = null; } }

// --- Dynamic In-Game Music ---
let musicPlaying = false, nextNote = 0, musicMood = 'chill';
const SCALES = {
  chill: [0, 2, 4, 7, 9, 12, 14, 16],
  tense: [0, 2, 3, 5, 7, 8, 10, 12],
  frantic: [0, 1, 4, 5, 7, 8, 11, 12],
};
const TEMPOS = { chill: 0.28, tense: 0.2, frantic: 0.14 };

export function setMusicPlaying(val) { musicPlaying = val; }
export function resetMusic() { nextNote = 0; musicMood = 'chill'; }
export function initMusic() {}

export function updateMusicMood() {
  const me = S.serverPlayers ? S.serverPlayers.find(p => p.id === S.myId) : null;
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
  const v = masterVol();
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
  const v = masterVol();
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
  const v = masterVol();
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
    const v = masterVol();
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
  const v = masterVol();
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
    const v = masterVol();
    const scale = [0, 4, 7, 12, 14, 12, 7, 4];
    const note = scale[beat % scale.length];
    bouncePluck(t, 0.05 * v, 261.63 * Math.pow(2, note / 12), 0.3);
    if (beat % 2 === 0) fruityBass(t, 0.04 * v, 130.81);
    if (beat % 4 === 0) poppyKick(t, 0.05 * v);
    beat++;
  }, 240);
}

let _classicBeat = 0, _classicSection = 0, _classicSectionStart = 0;
export function tickMusic() {
  if (S.musicStyle === 'tribal') { tickMusicTribal(); return; }
  if (S.musicStyle === 'industrial') { tickMusicIndustrial(); return; }
  if (S.musicStyle === 'money') { tickMusicMoney(); return; }
  if (S.musicStyle === 'boy') { tickMusicBoy(); return; }
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  const tempo = TEMPOS[musicMood] || 0.28;
  if (t < nextNote - 0.05) return;
  const v = masterVol();
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
