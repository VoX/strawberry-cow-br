import S from './state.js';

let actx = null;
export function getAudioCtx() { return actx; }

export function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
}

export function sfx(freq, dur, type, vol) {
  if (!actx) return; const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.3, t + dur);
  const v = (vol || 0.1) * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
}

export function sfxShoot() { sfx(400, 0.12, 'square', 0.1); }
export function sfxBolty() { sfx(800, 0.25, 'sawtooth', 0.15); }
export function sfxHit() { sfx(200, 0.15, 'sawtooth', 0.12); }
export function sfxEat() { sfx(800, 0.08, 'sine', 0.08); sfx(1200, 0.08, 'sine', 0.06); }
export function sfxLevelUp() {
  if (!actx) return; const t = actx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = f; g.gain.setValueAtTime(0.1, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
    o.connect(g); g.connect(actx.destination); o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.2);
  });
}
export function sfxDeath() { sfx(400, 0.6, 'sawtooth', 0.12); }
export function sfxBump() { sfx(100, 0.1, 'sine', 0.08); }

// In-game music — Old MacDonald melody
let musicPlaying = false, nextNoteTime = 0;
const oldMac = [
  7, 7, 7, 4, 5, 5, 4, -1, 2, 2, 0, 0, 7, -1, -1, -1,
  7, 7, 7, 4, 5, 5, 4, -1, 2, 2, 0, 0, 7, -1, -1, -1,
  4, 4, 7, 7, 9, 9, 7, -1, 4, 4, 2, 2, 0, -1, -1, -1,
  7, 7, 7, 4, 5, 5, 4, -1, 2, 2, 0, 0, 7, -1, -1, -1,
];
const noteDur = 0.22;
let noteIdx = 0;

export function setMusicPlaying(val) { musicPlaying = val; }
export function resetMusic() { noteIdx = 0; }

export function tickMusic() {
  if (!actx || !musicPlaying || S.state !== 'playing') return;
  const t = actx.currentTime;
  if (t < nextNoteTime - 0.05) return;
  const note = oldMac[noteIdx % oldMac.length];
  noteIdx++;
  nextNoteTime = t + noteDur;
  if (note < 0) return; // rest
  const freq = 261.63 * Math.pow(2, note / 12);
  // Melody
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle'; o.frequency.value = freq;
  const v = 0.04 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
  g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + noteDur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.95);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + noteDur);
  // Bass
  const b = actx.createOscillator(), bg = actx.createGain();
  b.type = 'sine'; b.frequency.value = freq / 2;
  bg.gain.setValueAtTime(v * 0.6, t); bg.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 0.8);
  b.connect(bg); bg.connect(actx.destination); b.start(t); b.stop(t + noteDur);
}
