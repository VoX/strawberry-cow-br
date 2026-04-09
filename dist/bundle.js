var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// shared/constants.js
var require_constants = __commonJS({
  "shared/constants.js"(exports, module) {
    var MAP_W2 = 2e3;
    var MAP_H2 = 1500;
    var COLORS2 = ["pink", "blue", "green", "gold", "purple", "red", "orange", "cyan"];
    var FOOD_TYPES2 = [
      { name: "strawberry", hunger: 15, pts: 10 },
      { name: "cake", hunger: 30, pts: 25 },
      { name: "pizza", hunger: 20, pts: 15 },
      { name: "icecream", hunger: 25, pts: 20 },
      { name: "donut", hunger: 18, pts: 12 },
      { name: "cupcake", hunger: 22, pts: 18 },
      { name: "cookie", hunger: 12, pts: 8 }
    ];
    var WEAPON_TYPES2 = ["shotgun", "burst", "bolty", "shotgun", "burst", "bolty", "cowtank"];
    module.exports = { MAP_W: MAP_W2, MAP_H: MAP_H2, COLORS: COLORS2, FOOD_TYPES: FOOD_TYPES2, WEAPON_TYPES: WEAPON_TYPES2 };
  }
});

// client/config.js
var import_constants, MW, MH, CH, COL, WPCOL, PERKS;
var init_config = __esm({
  "client/config.js"() {
    import_constants = __toESM(require_constants());
    MW = import_constants.MAP_W;
    MH = import_constants.MAP_H;
    CH = 35;
    COL = { pink: 16746666, blue: 8956671, green: 8978312, gold: 16768324, purple: 13404415, red: 16729156, orange: 16746564, cyan: 4521949 };
    WPCOL = { shotgun: 16729156, burst: 4500223, bolty: 16755200, cowtank: 4521796 };
    PERKS = [
      { id: "speed", name: "Swift Hooves", desc: "+15% speed" },
      { id: "extrahunger", name: "Big Udders", desc: "+40 max milk" },
      { id: "xpboost", name: "Quick Learner", desc: "+50% XP" },
      { id: "fastfire", name: "Trigger Job", desc: "-25% cooldown" },
      { id: "cheapshot", name: "Eco Mag", desc: "-33% shot milk cost" },
      { id: "bigbore", name: "Hollow Points", desc: "+20% damage" },
      { id: "kevlar", name: "Hide of Steel", desc: "-15% damage taken" },
      { id: "dashcd", name: "Quick Hoof", desc: "-40% dash cooldown" },
      { id: "tiny", name: "Tiny Mode", desc: "smaller + faster" },
      { id: "cowstrike", name: "Cowstrike", desc: "bomb the map" },
      { id: "extmag", name: "Extended Mag", desc: "+25% magazine capacity" },
      { id: "tacticow", name: "Tacti-Cow Gloves", desc: "-30% recoil" },
      { id: "milksteal", name: "Milksteal", desc: "+0.5 dmg, heal 0.5% on hit" }
    ];
  }
});

// client/state.js
var S, state_default;
var init_state = __esm({
  "client/state.js"() {
    init_config();
    S = {
      ws: null,
      myId: null,
      myColor: "pink",
      state: "join",
      serverPlayers: [],
      serverFoods: [],
      yaw: 0,
      pitch: 0,
      locked: false,
      keys: {},
      lastMoveMsg: 0,
      adsActive: false,
      fpsFrames: 0,
      fpsLast: performance.now(),
      fpsDisplay: 0,
      pingVal: 0,
      pingLast: 0,
      killfeed: [],
      projData: [],
      projMeshes: {},
      cowMeshes: {},
      mapBuilt: false,
      serverZone: { x: 0, y: 0, w: MW, h: MH },
      mapFeatures: { walls: [], mud: [], ponds: [], portals: [], shelters: [] },
      clientWeapons: [],
      pendingLevelUps: 0,
      perkMenuOpen: false,
      masterVol: 0.5,
      recoilIndex: 0,
      recoilTimer: 0,
      debugMode: false,
      musicStyle: "classic",
      hostId: null,
      spectateTargetId: null,
      killerId: null,
      killerName: null,
      barricadeReadyAt: 0,
      // performance.now() timestamp when next barricade can be placed
      crouching: false,
      // C toggles walk/crouch mode (50% speed, reduced spread/recoil, lower camera)
      chatLog: [],
      // { name, color, text, t (lifetime remaining in seconds) }
      chatOpen: false,
      barricades: []
      // { id, cx, cy, w, h, angle } — mirrored from server for client-side projectile prediction
    };
    state_default = S;
  }
});

// client/audio.js
function getAudioCtx() {
  return actx;
}
function masterVol() {
  return typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5;
}
function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  loadSpitSample();
  loadShotgunSamples();
  loadLRSamples();
  loadBoltyShotSample();
  loadSampleSounds();
}
function sfx(freq, dur, type, v) {
  if (!actx) return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type || "sine";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.3, t + dur);
  const gain = (v || 0.1) * masterVol();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + dur);
}
function loadSpitSample() {
  if (_spitLoaded || !actx) return;
  _spitLoaded = true;
  fetch("SpitShot.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _spitBuf = d;
  }).catch(() => {
  });
}
function sfxShoot(vol) {
  if (!actx) return;
  loadSpitSample();
  if (_spitBuf) {
    const src = actx.createBufferSource();
    src.buffer = _spitBuf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.08) * masterVol();
    src.connect(g);
    g.connect(actx.destination);
    src.start();
  } else {
    sfx(400, 0.12, "square", vol || 0.08);
  }
}
function loadLRSamples() {
  if (_lrLoaded || !actx) return;
  _lrLoaded = true;
  ["LRA.ogg", "LRB.ogg", "LRC.ogg", "LRD.ogg"].forEach((file) => {
    fetch(file).then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((decoded) => lrBuffers.push(decoded)).catch(() => {
    });
  });
}
function sfxLR(vol) {
  if (!actx) return;
  loadLRSamples();
  if (lrBuffers.length > 0) {
    const buf = lrBuffers[Math.floor(Math.random() * lrBuffers.length)];
    const src = actx.createBufferSource();
    src.buffer = buf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.1) * masterVol();
    src.connect(g);
    g.connect(actx.destination);
    src.start();
  } else {
    sfx(400, 0.12, "square", vol || 0.08);
  }
}
function loadShotgunSamples() {
  if (_shotgunLoaded || !actx) return;
  _shotgunLoaded = true;
  ["ShotA.ogg", "ShotB.ogg", "ShotC.ogg"].forEach((file) => {
    fetch(file).then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((decoded) => shotgunBuffers.push(decoded)).catch(() => {
    });
  });
}
function sfxShotgun(vol) {
  if (!actx) return;
  loadShotgunSamples();
  loadSampleSounds();
  if (shotgunBuffers.length > 0) {
    const buf = shotgunBuffers[Math.floor(Math.random() * shotgunBuffers.length)];
    const src = actx.createBufferSource();
    src.buffer = buf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.1) * masterVol();
    src.connect(g);
    g.connect(actx.destination);
    src.start();
  } else {
    sfx(300, 0.15, "square", vol || 0.08);
  }
  setTimeout(() => playSample(_shellImpactBuf, (vol || 0.1) * 0.8), 220);
}
function loadBoltyShotSample() {
  if (_boltyShotLoaded || !actx) return;
  _boltyShotLoaded = true;
  fetch("BoltyShot.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _boltyShotBuf = d;
  }).catch(() => {
  });
}
function sfxBolty() {
  if (!actx) return;
  loadBoltyShotSample();
  loadSampleSounds();
  if (_boltyShotBuf) {
    const src = actx.createBufferSource();
    src.buffer = _boltyShotBuf;
    const g = actx.createGain();
    g.gain.value = 0.1 * masterVol();
    src.connect(g);
    g.connect(actx.destination);
    src.start();
  } else {
    sfx(800, 0.25, "sawtooth", 0.1);
  }
  setTimeout(() => {
    if (!playSample(_boltBuf, 0.08)) {
      sfx(300, 0.08, "sawtooth", 0.07);
      setTimeout(() => sfx(500, 0.06, "square", 0.06), 200);
    }
  }, 500);
}
function sfxHit() {
  sfx(200, 0.15, "sawtooth", 0.08);
}
function sfxEat() {
  sfx(800, 0.08, "sine", 0.06);
  sfx(1200, 0.08, "sine", 0.04);
}
function sfxLevelUp() {
  if (!actx) return;
  const t = actx.currentTime;
  const v = 0.08 * masterVol();
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(v, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(1e-3, t + i * 0.08 + 0.2);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t + i * 0.08);
    o.stop(t + i * 0.08 + 0.2);
  });
}
function sfxDeath() {
  sfx(400, 0.6, "sawtooth", 0.08);
}
function sfxBump() {
  sfx(100, 0.1, "sine", 0.05);
}
function sfxEmptyMag() {
  sfx(1500, 0.03, "square", 0.06);
}
function sfxReloadLR() {
  if (!actx) return;
  const t = actx.currentTime;
  sfx(800, 0.05, "square", 0.06);
  setTimeout(() => sfx(1200, 0.05, "square", 0.08), 300);
  setTimeout(() => {
    sfx(400, 0.08, "sawtooth", 0.06);
    sfx(600, 0.06, "square", 0.04);
  }, 500);
}
function loadSampleSounds() {
  if (_sampleSoundsLoaded || !actx) return;
  _sampleSoundsLoaded = true;
  fetch("BoltAction.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _boltBuf = d;
  }).catch(() => {
  });
  fetch("ShellLoad.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _shellBuf = d;
  }).catch(() => {
  });
  fetch("CowtankFire.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _rocketBuf = d;
  }).catch(() => {
  });
  fetch("BoltyReload.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _boltyReloadBuf = d;
  }).catch(() => {
  });
  fetch("ShellImpact.wav").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _shellImpactBuf = d;
  }).catch(() => {
  });
  fetch("Explosion.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _explosionBuf = d;
  }).catch(() => {
  });
}
function sfxExplosion(vol) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_explosionBuf, vol || 0.15)) {
    sfx(60, 0.5, "sine", vol || 0.15);
  }
}
function sfxRocket(vol) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_rocketBuf, vol || 0.12)) {
    sfx(200, 0.3, "sine", vol || 0.1);
  }
}
function playSample(buf, vol) {
  if (!actx || !buf) return false;
  const src = actx.createBufferSource();
  src.buffer = buf;
  const g = actx.createGain();
  g.gain.value = (vol || 0.1) * masterVol();
  src.connect(g);
  g.connect(actx.destination);
  src.start();
  return true;
}
function sfxReloadBolty() {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_boltyReloadBuf, 0.1)) {
    if (!playSample(_boltBuf, 0.1)) {
      sfx(300, 0.1, "sawtooth", 0.08);
      setTimeout(() => sfx(500, 0.08, "sawtooth", 0.06), 400);
    }
  }
}
function sfxShellLoad() {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_shellBuf, 0.1)) {
    sfx(900, 0.04, "square", 0.07);
    setTimeout(() => sfx(600, 0.03, "square", 0.05), 50);
  }
}
function startMenuMusicTribal() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
    const t = actx.currentTime;
    const v = masterVol();
    const lowPat = [1, 0, 0, 0, 1, 0, 1, 0];
    const midPat = [0, 0, 1, 0, 0, 1, 0, 0];
    const highPat = [0, 1, 0, 1, 0, 0, 0, 1];
    const step = beat % 8;
    if (lowPat[step]) tribalDjembe(t, 0.2 * v, 70);
    if (midPat[step]) tribalDjembe(t, 0.15 * v, 130);
    if (highPat[step]) tribalDjembe(t, 0.1 * v, 220);
    if (step % 2 === 0) tribalShaker(t, 0.05 * v);
    if (step === 0) {
      const drum = actx.createOscillator(), dg = actx.createGain();
      drum.type = "sine";
      drum.frequency.setValueAtTime(55, t);
      drum.frequency.exponentialRampToValueAtTime(30, t + 0.5);
      dg.gain.setValueAtTime(0, t);
      dg.gain.linearRampToValueAtTime(0.18 * v, t + 0.01);
      dg.gain.exponentialRampToValueAtTime(1e-3, t + 0.7);
      drum.connect(dg);
      dg.connect(actx.destination);
      drum.start(t);
      drum.stop(t + 0.7);
    }
    beat++;
  }, 280);
}
function startMenuMusic() {
  if (state_default.musicStyle === "tribal") {
    startMenuMusicTribal();
    return;
  }
  if (state_default.musicStyle === "industrial") {
    startMenuMusicIndustrial();
    return;
  }
  if (state_default.musicStyle === "money") {
    startMenuMusicMoney();
    return;
  }
  if (state_default.musicStyle === "boy") {
    startMenuMusicBoy();
    return;
  }
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  const chords = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [3, 7, 10]];
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
    const t = actx.currentTime;
    const v = masterVol();
    const chord = chords[beat % chords.length];
    chord.forEach((n) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sawtooth";
      o.frequency.value = 130.81 * Math.pow(2, n / 12);
      const f = actx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 600 + Math.sin(beat * 0.5) * 200;
      g.gain.setValueAtTime(0.03 * v, t);
      g.gain.setValueAtTime(0.03 * v, t + 0.35);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.45);
      o.connect(f);
      f.connect(g);
      g.connect(actx.destination);
      o.start(t);
      o.stop(t + 0.45);
    });
    const ko = actx.createOscillator(), kg = actx.createGain();
    ko.type = "sine";
    ko.frequency.setValueAtTime(150, t);
    ko.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    kg.gain.setValueAtTime(0.06 * v, t);
    kg.gain.exponentialRampToValueAtTime(1e-3, t + 0.15);
    ko.connect(kg);
    kg.connect(actx.destination);
    ko.start(t);
    ko.stop(t + 0.15);
    if (beat % 2 === 1) {
      const bs = actx.sampleRate * 0.02, b = actx.createBuffer(1, bs, actx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * 0.5 * Math.exp(-i / bs * 8);
      const n = actx.createBufferSource();
      n.buffer = b;
      const ng = actx.createGain();
      ng.gain.setValueAtTime(0.03 * v, t);
      ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.03);
      const hf = actx.createBiquadFilter();
      hf.type = "highpass";
      hf.frequency.value = 5e3;
      n.connect(hf);
      hf.connect(ng);
      ng.connect(actx.destination);
      n.start(t);
      n.stop(t + 0.03);
    }
    if (beat % 4 === 0) {
      const mn = [0, 3, 7, 12, 15, 12, 7, 3];
      const note = mn[Math.floor(beat / 4) % mn.length];
      const mo = actx.createOscillator(), mg = actx.createGain();
      mo.type = "square";
      mo.frequency.value = 261.63 * Math.pow(2, note / 12);
      mg.gain.setValueAtTime(0.03 * v, t);
      mg.gain.setValueAtTime(0.03 * v, t + 0.3);
      mg.gain.exponentialRampToValueAtTime(1e-3, t + 0.4);
      mo.connect(mg);
      mg.connect(actx.destination);
      mo.start(t);
      mo.stop(t + 0.4);
    }
    beat++;
  }, 250);
}
function startMenuMusicIndustrial() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  const minorChords = [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]];
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
    const t = actx.currentTime;
    const v = masterVol();
    const chord = minorChords[beat % minorChords.length];
    chord.forEach((n) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sawtooth";
      o.frequency.value = 65.41 * Math.pow(2, n / 12);
      const f = actx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 400 + Math.sin(beat * 0.3) * 150;
      g.gain.setValueAtTime(0.025 * v, t);
      g.gain.setValueAtTime(0.025 * v, t + 0.4);
      g.gain.exponentialRampToValueAtTime(1e-3, t + 0.5);
      o.connect(f);
      f.connect(g);
      g.connect(actx.destination);
      o.start(t);
      o.stop(t + 0.5);
    });
    const sub = actx.createOscillator(), sg = actx.createGain();
    sub.type = "sine";
    sub.frequency.value = 55 + Math.sin(beat * 0.2) * 10;
    sg.gain.setValueAtTime(0.04 * v, t);
    sg.gain.exponentialRampToValueAtTime(1e-3, t + 0.45);
    sub.connect(sg);
    sg.connect(actx.destination);
    sub.start(t);
    sub.stop(t + 0.45);
    if (beat % 2 === 0) {
      const ko = actx.createOscillator(), kg = actx.createGain();
      ko.type = "sine";
      ko.frequency.setValueAtTime(120, t);
      ko.frequency.exponentialRampToValueAtTime(30, t + 0.12);
      kg.gain.setValueAtTime(0.07 * v, t);
      kg.gain.exponentialRampToValueAtTime(1e-3, t + 0.18);
      ko.connect(kg);
      kg.connect(actx.destination);
      ko.start(t);
      ko.stop(t + 0.18);
    }
    if (beat % 4 === 2) {
      const bs = actx.sampleRate * 0.03, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 4);
      const sn = actx.createBufferSource();
      sn.buffer = buf;
      const sng = actx.createGain();
      sng.gain.setValueAtTime(0.04 * v, t);
      sng.gain.exponentialRampToValueAtTime(1e-3, t + 0.05);
      sn.connect(sng);
      sng.connect(actx.destination);
      sn.start(t);
      sn.stop(t + 0.05);
    }
    if (beat % 2 === 1) {
      const hbs = actx.sampleRate * 0.01, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
      for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.2 * Math.exp(-i / hbs * 12);
      const hh = actx.createBufferSource();
      hh.buffer = hbuf;
      const hg = actx.createGain();
      hg.gain.setValueAtTime(0.025 * v, t);
      hg.gain.exponentialRampToValueAtTime(1e-3, t + 0.015);
      const hhf = actx.createBiquadFilter();
      hhf.type = "highpass";
      hhf.frequency.value = 8e3;
      hh.connect(hhf);
      hhf.connect(hg);
      hg.connect(actx.destination);
      hh.start(t);
      hh.stop(t + 0.015);
    }
    if (beat % 8 === 0) {
      const mn = [0, 3, 7, 10, 12, 10, 7, 3];
      const note = mn[Math.floor(beat / 8) % mn.length];
      const mo = actx.createOscillator(), mg = actx.createGain();
      mo.type = "sine";
      mo.frequency.value = 130.81 * Math.pow(2, note / 12);
      mo.frequency.linearRampToValueAtTime(130.81 * Math.pow(2, (note + 0.5) / 12), t + 0.6);
      mg.gain.setValueAtTime(0.02 * v, t);
      mg.gain.exponentialRampToValueAtTime(1e-3, t + 0.6);
      mo.connect(mg);
      mg.connect(actx.destination);
      mo.start(t);
      mo.stop(t + 0.6);
    }
    beat++;
  }, 300);
}
function stopMenuMusic() {
  if (menuMusicInterval) {
    clearInterval(menuMusicInterval);
    menuMusicInterval = null;
  }
}
function setMusicPlaying(val) {
  musicPlaying = val;
}
function resetMusic() {
  nextNote = 0;
  musicMood = "chill";
}
function initMusic() {
}
function updateMusicMood() {
  const me = state_default.serverPlayers ? state_default.serverPlayers.find((p) => p.id === state_default.myId) : null;
  const alive = state_default.serverPlayers ? state_default.serverPlayers.filter((p) => p.alive).length : 8;
  if (!me || !me.alive) {
    musicMood = "chill";
    return;
  }
  if (me.hunger < 20 || alive <= 2) musicMood = "frantic";
  else if (me.hunger < 45 || alive <= 3) musicMood = "tense";
  else musicMood = "chill";
}
function tickMusicIndustrial() {
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
  const t = actx.currentTime;
  const tempos = { chill: 0.176, tense: 0.11, frantic: 0.088 };
  const tempo = tempos[musicMood] || 0.176;
  if (t < nextNote - 0.03) return;
  const v = masterVol();
  _indBeat++;
  const beatInSection = _indBeat - _indSectionStart;
  if (beatInSection >= 32) {
    _indSection = (_indSection + 1) % 4;
    _indSectionStart = _indBeat;
  }
  const scales = {
    chill: [0, 3, 5, 7, 10, 12, 15],
    tense: [0, 1, 3, 5, 6, 8, 10, 12],
    frantic: [0, 1, 3, 4, 6, 7, 9, 10, 12, 13]
  };
  const scale = scales[musicMood] || scales.chill;
  const baseFreq = musicMood === "frantic" ? 55 : musicMood === "tense" ? 65 : 82;
  const sections = [
    {
      // Sparse intro — heavy kick, minimal snare
      kick: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
      hat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      lead: false,
      leadDensity: 0,
      rootShift: 0
    },
    {
      // Amen break ramp-up
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      snare: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      hat: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
      lead: true,
      leadDensity: 4,
      rootShift: -2
    },
    {
      // Breakdown — sparse, atmospheric, lead carries
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      hat: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
      lead: true,
      leadDensity: 2,
      rootShift: 5
    },
    {
      // Climax — chaotic breakcore
      kick: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      snare: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
      hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      lead: true,
      leadDensity: 1,
      rootShift: -5
    }
  ];
  const sec = sections[_indSection];
  const step = beatInSection % 32;
  const sectionBaseFreq = baseFreq * Math.pow(2, sec.rootShift / 12);
  if (step === 0) {
    industrialDrone(t, 0.18 * v, sectionBaseFreq, tempo * 32);
  }
  if (step % 4 === 0) {
    const note = scale[Math.floor(Math.random() * 3)];
    const freq = sectionBaseFreq * Math.pow(2, note / 12);
    const bass = actx.createOscillator(), bg = actx.createGain();
    bass.type = "sine";
    bass.frequency.value = freq;
    const bFilter = actx.createBiquadFilter();
    bFilter.type = "lowpass";
    bFilter.frequency.value = 120;
    bg.gain.setValueAtTime(0.06 * v, t);
    bg.gain.exponentialRampToValueAtTime(1e-3, t + tempo * 3.5);
    bass.connect(bFilter);
    bFilter.connect(bg);
    bg.connect(actx.destination);
    bass.start(t);
    bass.stop(t + tempo * 4);
  }
  if (sec.kick[step]) {
    const ko = actx.createOscillator(), kg = actx.createGain();
    ko.type = "sine";
    ko.frequency.setValueAtTime(150, t);
    ko.frequency.exponentialRampToValueAtTime(35, t + 0.08);
    kg.gain.setValueAtTime(0.07 * v, t);
    kg.gain.exponentialRampToValueAtTime(1e-3, t + 0.12);
    ko.connect(kg);
    kg.connect(actx.destination);
    ko.start(t);
    ko.stop(t + 0.12);
  }
  if (sec.snare[step]) {
    const bs = actx.sampleRate * 0.04, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 5);
    const sn = actx.createBufferSource();
    sn.buffer = buf;
    const sg = actx.createGain();
    sg.gain.setValueAtTime(0.05 * v, t);
    sg.gain.exponentialRampToValueAtTime(1e-3, t + 0.06);
    const sf = actx.createBiquadFilter();
    sf.type = "bandpass";
    sf.frequency.value = 3e3;
    sf.Q.value = 1;
    sn.connect(sf);
    sf.connect(sg);
    sg.connect(actx.destination);
    sn.start(t);
    sn.stop(t + 0.06);
  }
  if (sec.hat[step] || musicMood === "frantic" && step % 2 === 0) {
    const hbs = actx.sampleRate * 0.015, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / hbs * 10);
    const hh = actx.createBufferSource();
    hh.buffer = hbuf;
    const hg = actx.createGain();
    hg.gain.setValueAtTime((musicMood === "frantic" ? 0.04 : 0.025) * v, t);
    hg.gain.exponentialRampToValueAtTime(1e-3, t + 0.02);
    const hhf = actx.createBiquadFilter();
    hhf.type = "highpass";
    hhf.frequency.value = 7e3;
    hh.connect(hhf);
    hhf.connect(hg);
    hg.connect(actx.destination);
    hh.start(t);
    hh.stop(t + 0.02);
  }
  if (sec.lead && step % sec.leadDensity === 0) {
    const note = scale[3 + Math.floor(Math.random() * (scale.length - 3))];
    const freq = sectionBaseFreq * 2 * Math.pow(2, note / 12);
    const lead = actx.createOscillator(), lg = actx.createGain();
    lead.type = "sawtooth";
    lead.frequency.value = freq;
    const dist = actx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = i * 2 / 256 - 1;
      curve[i] = Math.tanh(x * 4);
    }
    dist.curve = curve;
    lg.gain.setValueAtTime(0.025 * v, t);
    lg.gain.exponentialRampToValueAtTime(1e-3, t + tempo * 1.5);
    lead.connect(dist);
    dist.connect(lg);
    lg.connect(actx.destination);
    lead.start(t);
    lead.stop(t + tempo * 2);
  }
  nextNote = t + tempo;
}
function tribalDjembe(t, vol, pitch) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(pitch * 2, t);
  o.frequency.exponentialRampToValueAtTime(pitch, t + 0.015);
  o.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + 0.2);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 5e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.35);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.4);
  const bs = actx.sampleRate * 0.06, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 8);
  const ns = actx.createBufferSource();
  ns.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(vol * 0.4, t);
  ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.05);
  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = pitch * 4;
  bp.Q.value = 1.5;
  ns.connect(bp);
  bp.connect(ng);
  ng.connect(actx.destination);
  ns.start(t);
  ns.stop(t + 0.06);
}
function tribalShaker(t, vol) {
  if (!actx) return;
  const bs = actx.sampleRate * 0.08, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bs);
  const ns = actx.createBufferSource();
  ns.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(vol, t + 0.01);
  ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.08);
  const hp = actx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4e3;
  ns.connect(hp);
  hp.connect(ng);
  ng.connect(actx.destination);
  ns.start(t);
  ns.stop(t + 0.08);
}
function deepDrum(t, vol, basePitch) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(basePitch * 1.8, t);
  o.frequency.exponentialRampToValueAtTime(basePitch, t + 0.05);
  o.frequency.exponentialRampToValueAtTime(basePitch * 0.6, t + 0.7);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 8e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.9);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 1);
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = "sine";
  sub.frequency.value = basePitch * 0.5;
  sg.gain.setValueAtTime(vol * 0.6, t);
  sg.gain.exponentialRampToValueAtTime(1e-3, t + 1.2);
  sub.connect(sg);
  sg.connect(actx.destination);
  sub.start(t);
  sub.stop(t + 1.2);
  const bs = actx.sampleRate * 0.08, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 5);
  const ns = actx.createBufferSource();
  ns.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(vol * 0.5, t);
  ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.08);
  const lp = actx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 800;
  ns.connect(lp);
  lp.connect(ng);
  ng.connect(actx.destination);
  ns.start(t);
  ns.stop(t + 0.08);
}
function bonePercussion(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.06);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.07);
  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 400;
  bp.Q.value = 8;
  o.connect(bp);
  bp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.08);
}
function caveDrone(t, vol, freq, dur) {
  if (!actx) return;
  for (const detune of [0, 7, -1.05]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sawtooth";
    o.frequency.value = freq * Math.pow(2, detune / 12);
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 300;
    lp.Q.value = 2;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.2);
    g.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  }
}
function classicPad(t, vol, baseFreq, dur, isMinor) {
  if (!actx) return;
  const intervals = isMinor ? [0, 3, 7, 12] : [0, 4, 7, 12];
  for (const semi of intervals) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    o.frequency.value = baseFreq * Math.pow(2, semi / 12);
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1400;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.28, t + dur * 0.25);
    g.gain.linearRampToValueAtTime(vol * 0.28, t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  }
  for (const semi of [12, 19]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle";
    o.frequency.value = baseFreq * Math.pow(2, semi / 12) * 1.005;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.06, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(vol * 0.06, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  }
}
function industrialDrone(t, vol, baseFreq, dur) {
  if (!actx) return;
  for (const detune of [0, 3, 6.04]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sawtooth";
    o.frequency.value = baseFreq * Math.pow(2, detune / 12);
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 4;
    lp.frequency.setValueAtTime(180, t);
    lp.frequency.linearRampToValueAtTime(1100, t + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(220, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.32, t + dur * 0.2);
    g.gain.linearRampToValueAtTime(vol * 0.32, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  }
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = "sine";
  sub.frequency.value = baseFreq * 0.5;
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.15);
  sg.gain.linearRampToValueAtTime(vol * 0.4, t + dur * 0.85);
  sg.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  sub.connect(sg);
  sg.connect(actx.destination);
  sub.start(t);
  sub.stop(t + dur);
}
function tickMusicTribal() {
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
  const t = actx.currentTime;
  const tempos = { chill: 0.32, tense: 0.24, frantic: 0.18 };
  const tempo = tempos[musicMood] || 0.32;
  if (t < nextNote - 0.03) return;
  const v = masterVol();
  _tribalBeat++;
  const beatInSection = _tribalBeat - _tribalSectionStart;
  if (beatInSection >= 32) {
    _tribalSection = (_tribalSection + 1) % 4;
    _tribalSectionStart = _tribalBeat;
  }
  const sections = [
    {
      // Slow ritual buildup
      lowDrum: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1],
      midDrum: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      highDrum: [0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      bones: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
    },
    {
      // Intense war drums
      lowDrum: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
      midDrum: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      highDrum: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
      bones: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1]
    },
    {
      // Rhythmic pulse with drone
      lowDrum: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      midDrum: [0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
      highDrum: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
      bones: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
    },
    {
      // Polyrhythmic chaos
      lowDrum: [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
      midDrum: [0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
      highDrum: [1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0],
      bones: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1]
    }
  ];
  const sec = sections[_tribalSection];
  const step = beatInSection % 32;
  if (sec.lowDrum[step]) deepDrum(t, 0.25 * v, musicMood === "frantic" ? 50 : 42);
  if (sec.midDrum[step]) tribalDjembe(t, 0.15 * v, musicMood === "frantic" ? 130 : 110);
  if (sec.highDrum[step]) tribalDjembe(t, 0.1 * v, 200);
  if (sec.bones[step]) bonePercussion(t, 0.08 * v);
  if (step === 0) {
    const droneFreqs = [55, 41.2, 49, 36.7];
    caveDrone(t, 0.12 * v, droneFreqs[_tribalSection], tempo * 32);
  }
  if (musicMood !== "chill" && step % 2 === 1) tribalShaker(t, 0.04 * v);
  nextNote = t + tempo;
}
function jazzBass(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.98, t + 0.18);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 8e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.22);
  const lp = actx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1200;
  o.connect(lp);
  lp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.24);
}
function pianoStab(t, vol, rootFreq, isMinor) {
  if (!actx) return;
  const intervals = isMinor ? [0, 3, 7] : [0, 4, 7];
  for (const semi of intervals) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle";
    o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 5e-3);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.35);
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    o.connect(lp);
    lp.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + 0.4);
  }
  const bs = actx.sampleRate * 0.012, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 6);
  const n = actx.createBufferSource();
  n.buffer = buf;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(vol * 0.5, t);
  ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.012);
  const hp = actx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2e3;
  n.connect(hp);
  hp.connect(ng);
  ng.connect(actx.destination);
  n.start(t);
  n.stop(t + 0.012);
}
function saxLead(t, vol, freq, dur) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sawtooth";
  const lfo = actx.createOscillator(), lfoGain = actx.createGain();
  lfo.frequency.value = 5;
  lfoGain.gain.value = freq * 0.015;
  lfo.connect(lfoGain);
  lfoGain.connect(o.frequency);
  o.frequency.value = freq;
  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq * 2.5;
  bp.Q.value = 3;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.04);
  g.gain.linearRampToValueAtTime(vol, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  o.connect(bp);
  bp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + dur);
  lfo.start(t);
  lfo.stop(t + dur);
}
function cashRegister(t, vol) {
  if (!actx) return;
  [2200, 1760].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.08);
    g.gain.linearRampToValueAtTime(vol, t + i * 0.08 + 2e-3);
    g.gain.exponentialRampToValueAtTime(1e-3, t + i * 0.08 + 0.3);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t + i * 0.08);
    o.stop(t + i * 0.08 + 0.32);
  });
}
function brassHit(t, vol, rootFreq) {
  if (!actx) return;
  for (const semi of [0, 4, 7, 12]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sawtooth";
    o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(600, t);
    lp.frequency.linearRampToValueAtTime(3200, t + 0.05);
    lp.frequency.linearRampToValueAtTime(1e3, t + 0.3);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.35);
    o.connect(lp);
    lp.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + 0.4);
  }
}
function jazzKick(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.15);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.15);
}
function brushSnare(t, vol) {
  if (!actx) return;
  const bs = actx.sampleRate * 0.08, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 2.5);
  const n = actx.createBufferSource();
  n.buffer = buf;
  const g = actx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.08);
  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 0.8;
  n.connect(bp);
  bp.connect(g);
  g.connect(actx.destination);
  n.start(t);
  n.stop(t + 0.08);
}
function tickMusicMoney() {
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
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
  const walkingScales = {
    chill: [0, 2, 3, 5, 7, 9, 10, 12],
    tense: [0, 2, 3, 5, 7, 8, 10, 12],
    frantic: [0, 1, 3, 5, 7, 8, 10, 11, 12]
  };
  const scale = walkingScales[musicMood] || walkingScales.chill;
  const sections = [
    {
      // Opening bell — sparse, piano intro, walking bass
      root: 0,
      isMinor: false,
      bassPat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      pianoPat: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      kickPat: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      snarePat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      hatPat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      saxFreq: 0,
      brassPat: null
    },
    {
      // Trading floor — full groove, sax hooks
      root: 5,
      isMinor: false,
      bassPat: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0],
      pianoPat: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      kickPat: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
      snarePat: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      hatPat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      saxFreq: 3,
      brassPat: null
    },
    {
      // Market dip — minor, tense, filter sweeps, sparse
      root: -2,
      isMinor: true,
      bassPat: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
      pianoPat: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
      kickPat: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      snarePat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hatPat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      saxFreq: 7,
      brassPat: null
    },
    {
      // Rally — full energy, ascending leads, brass stabs
      root: 0,
      isMinor: false,
      bassPat: [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
      pianoPat: [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
      kickPat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      snarePat: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      hatPat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      saxFreq: 5,
      brassPat: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]
    }
  ];
  const sec = sections[_moneySection];
  const step = beatInSection % 32;
  const baseBass = 110 * Math.pow(2, sec.root / 12);
  const basePiano = 220 * Math.pow(2, sec.root / 12);
  if (step === 0) {
    classicPad(t, 0.1 * v, basePiano, tempo * 32, sec.isMinor);
    cashRegister(t + 0.05, 0.12 * v);
  }
  if (sec.bassPat[step]) {
    const walkIdx = Math.floor(step / 4) % scale.length;
    jazzBass(t, 0.11 * v, baseBass * Math.pow(2, scale[walkIdx] / 12));
  }
  if (sec.pianoPat[step]) pianoStab(t, 0.08 * v, basePiano, sec.isMinor);
  if (sec.kickPat[step]) jazzKick(t, 0.08 * v);
  if (sec.snarePat[step]) brushSnare(t, 0.06 * v);
  if (sec.hatPat[step]) {
    const hbs = actx.sampleRate * 0.018, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / hbs * 9);
    const hh = actx.createBufferSource();
    hh.buffer = hbuf;
    const hg = actx.createGain();
    hg.gain.setValueAtTime(0.02 * v, t);
    hg.gain.exponentialRampToValueAtTime(1e-3, t + 0.02);
    const hhf = actx.createBiquadFilter();
    hhf.type = "highpass";
    hhf.frequency.value = 7500;
    hh.connect(hhf);
    hhf.connect(hg);
    hg.connect(actx.destination);
    hh.start(t);
    hh.stop(t + 0.02);
  }
  if (step % 8 === 0 && sec.saxFreq) {
    const note = scale[(sec.saxFreq + Math.floor(step / 8)) % scale.length];
    saxLead(t, 0.055 * v, basePiano * 2 * Math.pow(2, note / 12), tempo * 6);
  }
  if (sec.brassPat && sec.brassPat[step]) brassHit(t, 0.08 * v, basePiano);
  nextNote = t + tempo;
}
function startMenuMusicMoney() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
    const t = actx.currentTime;
    const v = masterVol();
    const scale = [0, 2, 3, 5, 7, 9, 10, 12];
    if (beat % 2 === 0) {
      jazzBass(t, 0.08 * v, 110 * Math.pow(2, scale[Math.floor(beat / 2) % scale.length] / 12));
    }
    if (beat % 4 === 0) pianoStab(t, 0.05 * v, 220, false);
    if (beat % 4 === 0) jazzKick(t, 0.05 * v);
    if (beat % 4 === 2) brushSnare(t, 0.04 * v);
    if (beat % 16 === 0) saxLead(t, 0.04 * v, 440 * Math.pow(2, scale[beat / 16 % scale.length] / 12), 1);
    beat++;
  }, 200);
}
function bouncePluck(t, vol, freq, dur) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(freq * 1.02, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 3e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  const lp = actx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200;
  o.connect(lp);
  lp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + dur);
}
function fruityBass(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 5e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.25);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.28);
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = "sine";
  sub.frequency.value = freq * 0.5;
  sg.gain.setValueAtTime(vol * 0.7, t);
  sg.gain.exponentialRampToValueAtTime(1e-3, t + 0.2);
  sub.connect(sg);
  sg.connect(actx.destination);
  sub.start(t);
  sub.stop(t + 0.22);
}
function fruityPad(t, vol, rootFreq, dur) {
  if (!actx) return;
  for (const semi of [0, 4, 7, 12]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    const lfo = actx.createOscillator(), lfoGain = actx.createGain();
    lfo.frequency.value = 4 + Math.random();
    lfoGain.gain.value = rootFreq * 6e-3;
    lfo.connect(lfoGain);
    lfoGain.connect(o.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.3, t + dur * 0.25);
    g.gain.linearRampToValueAtTime(vol * 0.3, t + dur * 0.75);
    g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
    lfo.start(t);
    lfo.stop(t + dur);
  }
}
function poppyKick(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.08);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.14);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.14);
}
function tickMusicBoy() {
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
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
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const sections = [
    {
      // Intro — bouncy arpeggios
      melody: [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 14, 12, 7, 4, 2, 0, 0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 14, 12, 7, 4, 2, 0],
      bassPat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      kickPat: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      root: 0
    },
    {
      // Verse — melodic hop
      melody: [4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 12, 9, 7, 4, 2, 0],
      bassPat: [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      kickPat: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      root: 5
    },
    {
      // Bridge — playful rests, tricky
      melody: [7, -1, 9, -1, 7, 4, 9, -1, 12, -1, 9, 7, 4, -1, 2, -1, 7, -1, 9, -1, 12, 14, 9, -1, 7, -1, 4, 7, 9, -1, 7, -1],
      bassPat: [1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
      kickPat: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      root: -2
    },
    {
      // Chorus — full bounce, fast arps
      melody: [12, 9, 7, 12, 14, 12, 9, 7, 12, 14, 16, 14, 12, 9, 7, 4, 12, 9, 7, 12, 14, 16, 14, 12, 9, 12, 7, 4, 2, 4, 0, -1],
      bassPat: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
      kickPat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      root: 0
    }
  ];
  const sec = sections[_boySection];
  const step = beatInSection % 32;
  const rootFreq = 261.63 * Math.pow(2, sec.root / 12);
  if (step === 0) {
    fruityPad(t, 0.1 * v, rootFreq * 0.5, tempo * 32);
  }
  const noteIdx = sec.melody[step];
  if (noteIdx !== void 0 && noteIdx >= 0) {
    bouncePluck(t, 0.07 * v, rootFreq * Math.pow(2, noteIdx / 12), tempo * 1.2);
  }
  if (sec.bassPat[step]) {
    fruityBass(t, 0.06 * v, rootFreq * 0.5);
  }
  if (sec.kickPat[step]) poppyKick(t, 0.08 * v);
  if (step % 2 === 1) {
    const bs = actx.sampleRate * 0.02, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * 0.4 * (1 - i / bs);
    const n = actx.createBufferSource();
    n.buffer = buf;
    const g = actx.createGain();
    g.gain.setValueAtTime(0.03 * v, t);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.02);
    const hp = actx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 5e3;
    n.connect(hp);
    hp.connect(g);
    g.connect(actx.destination);
    n.start(t);
    n.stop(t + 0.02);
  }
  if (step === 16) bouncePluck(t, 0.05 * v, rootFreq * 4, tempo * 1.5);
  nextNote = t + tempo;
}
function startMenuMusicBoy() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
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
function tickMusic() {
  if (state_default.musicStyle === "tribal") {
    tickMusicTribal();
    return;
  }
  if (state_default.musicStyle === "industrial") {
    tickMusicIndustrial();
    return;
  }
  if (state_default.musicStyle === "money") {
    tickMusicMoney();
    return;
  }
  if (state_default.musicStyle === "boy") {
    tickMusicBoy();
    return;
  }
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
  const t = actx.currentTime;
  const tempo = TEMPOS[musicMood] || 0.28;
  if (t < nextNote - 0.05) return;
  const v = masterVol();
  _classicBeat++;
  const beatInSection = _classicBeat - _classicSectionStart;
  if (beatInSection >= 32) {
    _classicSection = (_classicSection + 1) % 4;
    _classicSectionStart = _classicBeat;
  }
  const scale = SCALES[musicMood] || SCALES.chill;
  const baseFreq = musicMood === "frantic" ? 220 : musicMood === "tense" ? 247 : 261.63;
  const sections = [
    {
      // Verse — gentle ascent
      melody: [0, -1, 2, -1, 4, -1, 2, 0, -1, -1, 4, -1, 5, -1, 4, 2, 0, -1, 2, 4, 5, -1, 4, -1, 2, -1, 0, -1, -1, -1, -1, -1],
      bass: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      rootShift: 0,
      padMinor: false
    },
    {
      // Chorus — soaring melody
      melody: [4, -1, 5, 7, 5, -1, 4, -1, 2, -1, 4, -1, 5, -1, 7, -1, 4, -1, 5, 7, 5, 7, 4, -1, 2, -1, 0, -1, -1, -1, -1, -1],
      bass: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      rootShift: 5,
      padMinor: false
    },
    {
      // Bridge — minor, contemplative
      melody: [4, -1, -1, 2, 4, -1, -1, 5, 4, -1, -1, 2, 0, -1, -1, -1, 2, -1, -1, 4, 5, -1, 4, -1, 2, -1, 0, -1, -1, -1, -1, -1],
      bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      rootShift: -3,
      padMinor: true
    },
    {
      // Climax — full energy, octave jumps
      melody: [7, 5, 4, 5, 7, -1, 7, 5, 4, -1, 5, 7, 4, -1, 7, -1, 7, 5, 4, 5, 7, -1, 4, 7, 5, 4, 2, 4, 0, -1, -1, -1],
      bass: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      rootShift: 0,
      padMinor: false
    }
  ];
  const sec = sections[_classicSection];
  const step = beatInSection % 32;
  const sectionBaseFreq = baseFreq * Math.pow(2, sec.rootShift / 12);
  if (step === 0) {
    classicPad(t, 0.09 * v, sectionBaseFreq * 0.5, tempo * 32, sec.padMinor);
  }
  const noteIdx = sec.melody[step];
  if (noteIdx >= 0) {
    const scaleNote = scale[noteIdx % scale.length];
    const freq = sectionBaseFreq * Math.pow(2, scaleNote / 12);
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = musicMood === "frantic" ? "sawtooth" : "triangle";
    o.frequency.value = freq;
    const mv = (musicMood === "frantic" ? 0.04 : 0.03) * v;
    g.gain.setValueAtTime(mv, t);
    g.gain.setValueAtTime(mv, t + tempo * 0.6);
    g.gain.exponentialRampToValueAtTime(1e-3, t + tempo * 0.95);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + tempo);
  }
  if (sec.bass[step]) {
    const rootNote = scale[0];
    const bassFreq = sectionBaseFreq * Math.pow(2, rootNote / 12) / 2;
    const b = actx.createOscillator(), bg2 = actx.createGain();
    b.type = "sine";
    b.frequency.value = bassFreq;
    bg2.gain.setValueAtTime(0.04 * v, t);
    bg2.gain.exponentialRampToValueAtTime(1e-3, t + tempo * 1.6);
    b.connect(bg2);
    bg2.connect(actx.destination);
    b.start(t);
    b.stop(t + tempo * 2);
  }
  if (musicMood === "frantic" && Math.random() < 0.4) {
    const bs2 = actx.sampleRate * 0.03, buf = actx.createBuffer(1, bs2, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < bs2; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
    const ns = actx.createBufferSource();
    ns.buffer = buf;
    const ng = actx.createGain();
    ng.gain.setValueAtTime(0.03 * v, t);
    ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.04);
    ns.connect(ng);
    ng.connect(actx.destination);
    ns.start(t);
    ns.stop(t + 0.04);
  }
  nextNote = t + tempo;
}
var actx, _spitBuf, _spitLoaded, lrBuffers, _lrLoaded, shotgunBuffers, _shotgunLoaded, _boltyShotBuf, _boltyShotLoaded, _boltBuf, _shellBuf, _sampleSoundsLoaded, _rocketBuf, _boltyReloadBuf, _shellImpactBuf, _explosionBuf, menuMusicInterval, musicPlaying, nextNote, musicMood, SCALES, TEMPOS, _indBeat, _indSection, _indSectionStart, _tribalBeat, _tribalSection, _tribalSectionStart, _moneyBeat, _moneySection, _moneySectionStart, _boyBeat, _boySection, _boySectionStart, _classicBeat, _classicSection, _classicSectionStart;
var init_audio = __esm({
  "client/audio.js"() {
    init_state();
    actx = null;
    _spitBuf = null;
    _spitLoaded = false;
    lrBuffers = [];
    _lrLoaded = false;
    shotgunBuffers = [];
    _shotgunLoaded = false;
    _boltyShotBuf = null;
    _boltyShotLoaded = false;
    _boltBuf = null;
    _shellBuf = null;
    _sampleSoundsLoaded = false;
    _rocketBuf = null;
    _boltyReloadBuf = null;
    _shellImpactBuf = null;
    _explosionBuf = null;
    menuMusicInterval = null;
    musicPlaying = false;
    nextNote = 0;
    musicMood = "chill";
    SCALES = {
      chill: [0, 2, 4, 7, 9, 12, 14, 16],
      tense: [0, 2, 3, 5, 7, 8, 10, 12],
      frantic: [0, 1, 4, 5, 7, 8, 11, 12]
    };
    TEMPOS = { chill: 0.28, tense: 0.2, frantic: 0.14 };
    _indBeat = 0;
    _indSection = 0;
    _indSectionStart = 0;
    _tribalBeat = 0;
    _tribalSection = 0;
    _tribalSectionStart = 0;
    _moneyBeat = 0;
    _moneySection = 0;
    _moneySectionStart = 0;
    _boyBeat = 0;
    _boySection = 0;
    _boySectionStart = 0;
    _classicBeat = 0;
    _classicSection = 0;
    _classicSectionStart = 0;
  }
});

// client/renderer.js
import * as THREE from "three";
function makeCloudTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 20; i++) {
    const x = 64 + Math.random() * 128, y = 64 + Math.random() * 128;
    const r = 30 + Math.random() * 60;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(255,255,255,0.6)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.2)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return new THREE.CanvasTexture(c);
}
var scene, cam, ren, sun, skyGeo, skyMat, sky, cloudPlanes, vmScene, vmCam;
var init_renderer = __esm({
  "client/renderer.js"() {
    init_config();
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 1, 6100);
    cam.position.set(MW / 2, CH, MH / 2);
    ren = new THREE.WebGLRenderer({ antialias: true });
    ren.setSize(innerWidth, innerHeight);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.shadowMap.enabled = true;
    ren.domElement.id = "gameCanvas";
    document.body.appendChild(ren.domElement);
    scene.add(new THREE.AmbientLight(16777215, 0.6));
    sun = new THREE.DirectionalLight(16777215, 0.8);
    sun.position.set(500, 400, 300);
    sun.castShadow = true;
    sun.shadow.mapSize.set(256, 256);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 800;
    sun.shadow.camera.left = -400;
    sun.shadow.camera.right = 400;
    sun.shadow.camera.top = 400;
    sun.shadow.camera.bottom = -400;
    scene.add(sun);
    scene.add(sun.target);
    scene.add(new THREE.HemisphereLight(8900331, 4500036, 0.3));
    skyGeo = new THREE.SphereGeometry(5e3, 32, 32);
    skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fog: false,
      uniforms: {},
      vertexShader: `varying vec3 vWorldPos;void main(){vWorldPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 vWorldPos;void main(){
    float h=normalize(vWorldPos).y;
    vec3 top=vec3(0.3,0.5,0.9);
    vec3 mid=vec3(0.6,0.8,1.0);
    vec3 horizon=vec3(1.0,0.85,0.7);
    vec3 bottom=vec3(0.4,0.7,0.3);
    vec3 col;
    if(h>0.3)col=mix(mid,top,(h-0.3)/0.7);
    else if(h>0.0)col=mix(horizon,mid,h/0.3);
    else col=mix(bottom,horizon,(h+0.3)/0.3);
    float c=sin(vWorldPos.x*0.003+vWorldPos.z*0.002)*0.5+0.5;
    c*=smoothstep(0.05,0.3,h)*smoothstep(0.6,0.3,h);
    col=mix(col,vec3(1.0,1.0,1.0),c*0.2);
    gl_FragColor=vec4(col,1.0);
  }`
    });
    sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
    cloudPlanes = [];
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
    vmScene = new THREE.Scene();
    vmScene.add(new THREE.AmbientLight(16777215, 1));
    vmCam = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
    vmCam.position.set(0, 0, 0);
    addEventListener("resize", () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      vmCam.aspect = innerWidth / innerHeight;
      vmCam.updateProjectionMatrix();
      ren.setSize(innerWidth, innerHeight);
    });
  }
});

// client/terrain.js
import * as THREE2 from "three";
function generateHeightMap(seed) {
  const s1 = Math.sin(seed * 1.1) * 2e-3 + 4e-3;
  const s2 = Math.cos(seed * 2.3) * 2e-3 + 5e-3;
  const s3 = Math.sin(seed * 3.7) * 4e-3 + 0.01;
  const s4 = Math.cos(seed * 4.1) * 3e-3 + 7e-3;
  const s5 = Math.sin(seed * 5.3) * 1e-3 + 3e-3;
  const s6 = Math.cos(seed * 6.7) * 2e-3 + 4e-3;
  const a1 = 15 + Math.sin(seed * 7.1) * 8;
  const a2 = 12 + Math.cos(seed * 8.3) * 6;
  const a3 = 8 + Math.sin(seed * 9.7) * 5;
  const a4 = 10 + Math.cos(seed * 10.1) * 6;
  for (let row = 0; row <= GRID_H; row++) {
    for (let col = 0; col <= GRID_W; col++) {
      const wx = col * MW / GRID_W;
      const wz = row * MH / GRID_H;
      const h = Math.sin(wx * s1) * a1 + Math.cos(wz * s2) * a2 + Math.sin(wx * s3 + wz * s4) * a3 + Math.cos(wx * s5 - wz * s6) * a4;
      heightMap[row * (GRID_W + 1) + col] = h;
    }
  }
}
function getTerrainHeight(x, z) {
  const gx = Math.max(0, Math.min(GRID_W, x / MW * GRID_W));
  const gy = Math.max(0, Math.min(GRID_H, z / MH * GRID_H));
  const col = Math.floor(gx), row = Math.floor(gy);
  const fx = gx - col, fy = gy - row;
  const c1 = Math.min(col + 1, GRID_W), r1 = Math.min(row + 1, GRID_H);
  const h00 = heightMap[row * (GRID_W + 1) + col];
  const h10 = heightMap[row * (GRID_W + 1) + c1];
  const h01 = heightMap[r1 * (GRID_W + 1) + col];
  const h11 = heightMap[r1 * (GRID_W + 1) + c1];
  return h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy;
}
function clearTerrainMeshes() {
  [gndMesh, waterMesh].forEach((m) => {
    if (m) {
      scene.remove(m);
      m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
  });
  [mtMesh, snowMesh].forEach((m) => {
    if (m) {
      scene.remove(m);
      m.geometry.dispose();
    }
  });
  fenceMeshes.forEach((m) => {
    scene.remove(m);
    if (m.geometry) m.geometry.dispose();
  });
  fenceMeshes = [];
  gndMesh = mtMesh = snowMesh = waterMesh = null;
}
function buildTerrainMeshes() {
  const gndSegsX = GRID_W, gndSegsY = GRID_H;
  const gndGeo = new THREE2.PlaneGeometry(extW, extH, gndSegsX, gndSegsY);
  const gndPos = gndGeo.attributes.position;
  for (let i = 0; i < gndPos.count; i++) {
    const wx = gndPos.getX(i) + extW / 2 - gndPad;
    const wz = extH / 2 - gndPos.getY(i) - gndPad;
    const cx = Math.max(0, Math.min(MW, wx)), cz = Math.max(0, Math.min(MH, wz));
    gndPos.setZ(i, getTerrainHeight(cx, cz));
  }
  gndGeo.computeVertexNormals();
  gndMesh = new THREE2.Mesh(gndGeo, grassMat);
  gndMesh.rotation.x = -Math.PI / 2;
  gndMesh.position.set(MW / 2, 0, MH / 2);
  gndMesh.receiveShadow = true;
  scene.add(gndMesh);
  const mtGeo = new THREE2.PlaneGeometry(extW, extH, 30, 30);
  const mtPos = mtGeo.attributes.position;
  for (let i = 0; i < mtPos.count; i++) {
    const lx = mtPos.getX(i) + extW / 2, ly = mtPos.getY(i) + extH / 2;
    const wx = lx - gndPad, wz = ly - gndPad;
    const outsideX = wx < 0 ? -wx : wx > MW ? wx - MW : 0;
    const outsideZ = wz < 0 ? -wz : wz > MH ? wz - MH : 0;
    const outsideDist = Math.max(outsideX, outsideZ);
    if (outsideDist <= 0) {
      mtPos.setZ(i, getTerrainHeight(Math.max(0, Math.min(MW, wx)), Math.max(0, Math.min(MH, wz))));
    } else {
      const d = outsideDist / gndPad;
      const edgeH = getTerrainHeight(Math.max(0, Math.min(MW, wx)), Math.max(0, Math.min(MH, wz)));
      const baseH = d * d * 600 + d * 120;
      const noise = Math.sin(wx * 8e-3) * 50 + Math.cos(wz * 0.01) * 40 + Math.sin(wx * 0.02 + wz * 0.015) * 30;
      mtPos.setZ(i, edgeH + baseH + noise * d);
    }
  }
  mtGeo.computeVertexNormals();
  mtMesh = new THREE2.Mesh(mtGeo, mtMat);
  mtMesh.rotation.x = -Math.PI / 2;
  mtMesh.position.set(MW / 2, -80, MH / 2);
  scene.add(mtMesh);
  const sGeo = mtGeo.clone();
  const sPos = sGeo.attributes.position;
  for (let i = 0; i < sPos.count; i++) {
    const h = mtPos.getZ(i);
    sPos.setZ(i, h > 485 ? h + 3 : -9999);
  }
  sGeo.computeVertexNormals();
  snowMesh = new THREE2.Mesh(sGeo, snowMat);
  snowMesh.rotation.x = -Math.PI / 2;
  snowMesh.position.set(MW / 2, -79, MH / 2);
  scene.add(snowMesh);
  const wGeo = new THREE2.PlaneGeometry(extW, extH);
  waterMesh = new THREE2.Mesh(wGeo, new THREE2.MeshBasicMaterial({ color: 2254506, transparent: true, opacity: 0.6, side: THREE2.DoubleSide }));
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(MW / 2, -30, MH / 2);
  scene.add(waterMesh);
  const bm = new THREE2.MeshLambertMaterial({ color: 15658734 });
  const postGeo = new THREE2.CylinderGeometry(2, 2, 30, 5);
  const fenceStep = 25;
  function addFencePost(x, z) {
    const th = getTerrainHeight(x, z);
    const post = new THREE2.Mesh(postGeo, bm);
    post.position.set(x, th + 15, z);
    scene.add(post);
    fenceMeshes.push(post);
  }
  function addFenceRail(x1, z1, x2, z2) {
    const th1 = getTerrainHeight(x1, z1), th2 = getTerrainHeight(x2, z2);
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, mth = (th1 + th2) / 2;
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);
    for (const rh of [22, 12]) {
      const rail = new THREE2.Mesh(new THREE2.BoxGeometry(3, 3, dist), bm);
      rail.position.set(mx, mth + rh, mz);
      rail.rotation.y = angle;
      scene.add(rail);
      fenceMeshes.push(rail);
    }
  }
  for (let x = 0; x <= MW; x += fenceStep) {
    addFencePost(x, 0);
    addFencePost(x, MH);
    if (x < MW) {
      addFenceRail(x, 0, x + fenceStep, 0);
      addFenceRail(x, MH, x + fenceStep, MH);
    }
  }
  for (let z = 0; z <= MH; z += fenceStep) {
    addFencePost(0, z);
    addFencePost(MW, z);
    if (z < MH) {
      addFenceRail(0, z, 0, z + fenceStep);
      addFenceRail(MW, z, MW, z + fenceStep);
    }
  }
}
function rebuildTerrain(seed) {
  clearTerrainMeshes();
  generateHeightMap(seed);
  buildTerrainMeshes();
}
var GRID_W, GRID_H, heightMap, gndPad, extW, extH, grassMat, mtMat, snowMat, gndMesh, mtMesh, snowMesh, waterMesh, fenceMeshes;
var init_terrain = __esm({
  "client/terrain.js"() {
    init_config();
    init_renderer();
    GRID_W = 200;
    GRID_H = 150;
    heightMap = new Float32Array((GRID_W + 1) * (GRID_H + 1));
    generateHeightMap(0);
    gndPad = 800;
    extW = MW + gndPad * 2;
    extH = MH + gndPad * 2;
    grassMat = new THREE2.MeshLambertMaterial({ color: 4889402 });
    mtMat = new THREE2.MeshLambertMaterial({ color: 8947848 });
    snowMat = new THREE2.MeshLambertMaterial({ color: 15658751 });
    gndMesh = null;
    mtMesh = null;
    snowMesh = null;
    waterMesh = null;
    fenceMeshes = [];
    buildTerrainMeshes();
  }
});

// client/network.js
function setMessageHandler(fn) {
  msgHandler = fn;
}
function connect() {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  state_default.ws = new WebSocket(proto + "://" + location.host + "/strawberrycow-fps-ws/");
  state_default.ws.onopen = () => {
    console.log("connected");
    const ss = document.getElementById("serverStatus");
    if (ss) {
      ss.textContent = "\u2705 meadow online";
      ss.style.color = "#88ff88";
    }
    const dc = document.getElementById("disconnectMsg");
    if (dc) dc.style.display = "none";
  };
  state_default.ws.onmessage = (e) => {
    if (msgHandler) msgHandler(JSON.parse(e.data));
  };
  state_default.ws.onclose = () => {
    const ss = document.getElementById("serverStatus");
    if (ss) {
      ss.textContent = "\u274C meadow offline";
      ss.style.color = "#ff6666";
    }
    let dc = document.getElementById("disconnectMsg");
    if (state_default.state === "join" || state_default.state === "lobby") {
      if (dc) dc.style.display = "none";
      setTimeout(connect, 2e3);
      return;
    }
    if (!dc) {
      dc = document.createElement("div");
      dc.id = "disconnectMsg";
      dc.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;background:rgba(0,0,0,0.8);padding:30px 50px;border-radius:12px;border:2px solid #ff4444;text-align:center;font-family:Segoe UI,sans-serif";
      dc.innerHTML = '<div style="color:#ff4444;font-size:24px;font-weight:bold;margin-bottom:8px">DISCONNECTED</div><div style="color:#aaa;font-size:14px">Reconnecting to meadow...</div>';
      document.body.appendChild(dc);
    }
    dc.style.display = "block";
    setTimeout(connect, 2e3);
  };
  state_default.ws.onerror = () => {
    const ss = document.getElementById("serverStatus");
    if (ss) {
      ss.textContent = "\u274C meadow offline";
      ss.style.color = "#ff6666";
    }
  };
}
function send(m) {
  if (state_default.ws && state_default.ws.readyState === 1) state_default.ws.send(JSON.stringify(m));
}
var msgHandler;
var init_network = __esm({
  "client/network.js"() {
    init_state();
    msgHandler = null;
  }
});

// client/input.js
import * as THREE3 from "three";
function setVmGroupRef(getter) {
  vmGroupRef = getter;
}
function doAttack() {
  const dir = new THREE3.Vector3(0, 0, -1);
  dir.applyQuaternion(cam.quaternion);
  send({ type: "attack", aimX: dir.x, aimY: dir.z, aimZ: dir.y, fireMode: state_default.fireMode });
}
function doDash() {
  const dir = new THREE3.Vector3(0, 0, -1);
  dir.applyQuaternion(cam.quaternion);
  dir.y = 0;
  dir.normalize();
  send({ type: "dash", dirX: dir.x, dirY: dir.z });
}
function autoFireLoop() {
  if (!autoFireActive) return;
  if (!mouseDown || state_default.state !== "playing" || !state_default.locked) {
    stopAutoFire();
    return;
  }
  const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
  if (!me || !me.alive || me.weapon !== "burst") {
    stopAutoFire();
    return;
  }
  const now = performance.now();
  if (now >= nextFireTime) {
    doAttack();
    nextFireTime = now + AUTO_FIRE_INTERVAL;
  }
  requestAnimationFrame(autoFireLoop);
}
function startAutoFire() {
  if (autoFireActive) return;
  autoFireActive = true;
  if (nextFireTime < performance.now()) nextFireTime = performance.now();
  autoFireLoop();
}
function stopAutoFire() {
  autoFireActive = false;
}
function cycleSpectate(dir) {
  const aliveOthers = state_default.serverPlayers.filter((p) => p.alive && p.id !== state_default.myId);
  if (aliveOthers.length === 0) {
    state_default.spectateTargetId = null;
    return;
  }
  const curIdx = aliveOthers.findIndex((p) => p.id === state_default.spectateTargetId);
  const nextIdx = curIdx < 0 ? 0 : (curIdx + dir + aliveOthers.length) % aliveOthers.length;
  state_default.spectateTargetId = aliveOthers[nextIdx].id;
}
function openChat() {
  if (!chatInputWrap) return;
  state_default.chatOpen = true;
  chatInputWrap.style.display = "block";
  chatInput.value = "";
  chatInput.focus();
  if (document.pointerLockElement) document.exitPointerLock();
}
function closeChat(doSend) {
  if (!chatInputWrap) return;
  const txt = (chatInput.value || "").trim();
  if (doSend && txt) send({ type: "chat", text: txt });
  state_default.chatOpen = false;
  chatInputWrap.style.display = "none";
  chatInput.blur();
}
var isMobile, vmGroupRef, mouseDown, autoFireActive, nextFireTime, AUTO_FIRE_INTERVAL, chatInput, chatInputWrap;
var init_input = __esm({
  "client/input.js"() {
    init_state();
    init_renderer();
    init_audio();
    init_network();
    isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    vmGroupRef = null;
    state_default.fireMode = "burst";
    mouseDown = false;
    autoFireActive = false;
    nextFireTime = 0;
    AUTO_FIRE_INTERVAL = 72;
    ren.domElement.style.cursor = "pointer";
    ren.domElement.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      initAudio();
      if (state_default.state !== "playing") return;
      const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
      if (!me || !me.alive) {
        if (!state_default.locked) {
          ren.domElement.requestPointerLock();
          return;
        }
        cycleSpectate(1);
        return;
      }
      if (!state_default.locked) {
        ren.domElement.requestPointerLock();
        return;
      }
      mouseDown = true;
      if (me.weapon === "burst" && state_default.fireMode === "auto") {
        startAutoFire();
      } else {
        doAttack();
      }
    });
    ren.domElement.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        mouseDown = false;
        stopAutoFire();
      }
    });
    document.addEventListener("pointerlockchange", () => {
      state_default.locked = !!document.pointerLockElement;
      if (state_default.locked) document.getElementById("lockMsg").style.display = "none";
      else if (state_default.state === "playing" && !isMobile) setTimeout(() => {
        if (!state_default.locked && state_default.state === "playing") document.getElementById("lockMsg").style.display = "block";
      }, 2e3);
    });
    document.addEventListener("mousemove", (e) => {
      if (!state_default.locked) return;
      const sens = state_default.adsActive ? 4e-4 : 2e-3;
      state_default.yaw -= e.movementX * sens;
      state_default.pitch -= e.movementY * sens;
      state_default.pitch = Math.max(-1.2, Math.min(1.2, state_default.pitch));
    });
    document.addEventListener("mousedown", (e) => {
      if (e.button === 2 && state_default.locked && state_default.state === "playing") {
        const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
        if (me && me.alive && me.weapon === "bolty") {
          state_default.adsActive = true;
          cam.fov = 12.5;
          cam.updateProjectionMatrix();
          document.getElementById("scopeOverlay").style.display = "block";
          document.getElementById("crosshair").style.display = "none";
          const vg = vmGroupRef && vmGroupRef();
          if (vg) vg.visible = false;
        }
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        state_default.adsActive = false;
        cam.fov = 75;
        cam.updateProjectionMatrix();
        document.getElementById("scopeOverlay").style.display = "none";
        document.getElementById("crosshair").style.display = "block";
        const vg = vmGroupRef && vmGroupRef();
        if (vg) vg.visible = true;
      }
    });
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    if (isMobile) {
      let drawDp = function(nx, ny) {
        dpCtx.clearRect(0, 0, 130, 130);
        dpCtx.fillStyle = "rgba(0,0,0,0.3)";
        dpCtx.beginPath();
        dpCtx.arc(65, 65, 60, 0, Math.PI * 2);
        dpCtx.fill();
        dpCtx.fillStyle = "rgba(255,255,255,0.5)";
        dpCtx.beginPath();
        dpCtx.arc(65 + nx * 22, 65 + ny * 22, 20, 0, Math.PI * 2);
        dpCtx.fill();
      }, handleDp = function(e) {
        e.preventDefault();
        const t = e.touches[0];
        if (!t) {
          tdx = tdy = 0;
          drawDp(0, 0);
          return;
        }
        const r = dp.getBoundingClientRect();
        const dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        if (d < 10) {
          tdx = tdy = 0;
          drawDp(0, 0);
          return;
        }
        tdx = dx / d;
        tdy = dy / d;
        drawDp(tdx, tdy);
      };
      document.getElementById("touchDpad").style.display = "block";
      document.getElementById("touchShoot").style.display = "block";
      document.getElementById("touchDash").style.display = "block";
      document.getElementById("lockMsg").style.display = "none";
      const dp = document.getElementById("touchDpad"), dpCtx = dp.getContext("2d");
      let tdx = 0, tdy = 0;
      drawDp(0, 0);
      dp.addEventListener("touchstart", handleDp, { passive: false });
      dp.addEventListener("touchmove", handleDp, { passive: false });
      dp.addEventListener("touchend", (e) => {
        e.preventDefault();
        tdx = tdy = 0;
        drawDp(0, 0);
      }, { passive: false });
      setInterval(() => {
        if (state_default.state === "playing" && Math.abs(tdx) + Math.abs(tdy) > 0.1) {
          const fwd = new THREE3.Vector3(0, 0, -1);
          fwd.applyQuaternion(cam.quaternion);
          fwd.y = 0;
          if (fwd.length() > 0.01) fwd.normalize();
          const right = new THREE3.Vector3(-fwd.z, 0, fwd.x);
          const mx = fwd.x * -tdy + right.x * tdx;
          const mz = fwd.z * -tdy + right.z * tdx;
          const len = Math.hypot(mx, mz);
          if (len > 0) {
            send({ type: "move", dx: mx / len, dy: mz / len });
            state_default.pingLast = performance.now();
          }
        } else if (state_default.state === "playing") {
          send({ type: "move", dx: 0, dy: 0 });
        }
      }, 50);
      const isTouchControl = (el) => el === dp || el.id === "touchShoot" || el.id === "touchDash";
      const lookTouches = {};
      document.addEventListener("touchstart", (e) => {
        for (const t of e.changedTouches) {
          if (isTouchControl(t.target)) continue;
          lookTouches[t.identifier] = { x: t.clientX, y: t.clientY };
        }
      }, { passive: true });
      document.addEventListener("touchmove", (e) => {
        for (const t of e.changedTouches) {
          const prev = lookTouches[t.identifier];
          if (!prev) continue;
          const dx = t.clientX - prev.x, dy = t.clientY - prev.y;
          state_default.yaw -= dx * 4e-3;
          state_default.pitch -= dy * 4e-3;
          state_default.pitch = Math.max(-1.2, Math.min(1.2, state_default.pitch));
          prev.x = t.clientX;
          prev.y = t.clientY;
        }
      }, { passive: true });
      document.addEventListener("touchend", (e) => {
        for (const t of e.changedTouches) delete lookTouches[t.identifier];
      }, { passive: true });
      document.addEventListener("touchcancel", (e) => {
        for (const t of e.changedTouches) delete lookTouches[t.identifier];
      }, { passive: true });
      document.getElementById("touchShoot").addEventListener("touchstart", (e) => {
        e.preventDefault();
        doAttack();
      }, { passive: false });
      document.getElementById("touchDash").addEventListener("touchstart", (e) => {
        e.preventDefault();
        doDash();
      }, { passive: false });
    }
    chatInput = document.getElementById("chatInput");
    chatInputWrap = document.getElementById("chatInputWrap");
    if (chatInput) {
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          closeChat(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeChat(false);
        }
        e.stopPropagation();
      });
    }
    addEventListener("keydown", (e) => {
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;
      state_default.keys[e.code] = true;
      if (e.code === "KeyT" && state_default.state === "playing" && !state_default.chatOpen) {
        e.preventDefault();
        openChat();
        return;
      }
      const meK = state_default.serverPlayers.find((p) => p.id === state_default.myId);
      if (state_default.state === "playing" && (!meK || !meK.alive)) {
        if (e.code === "ArrowRight" || e.code === "KeyD") {
          cycleSpectate(1);
          return;
        }
        if (e.code === "ArrowLeft" || e.code === "KeyA") {
          cycleSpectate(-1);
          return;
        }
      }
      if ((e.code === "ShiftLeft" || e.code === "ShiftRight") && state_default.state === "playing") doDash();
      if (e.code === "Space") {
        e.preventDefault();
        send({ type: "jump" });
      }
      if (e.code === "KeyQ" && state_default.state === "playing") send({ type: "dropWeapon" });
      if (e.code === "KeyP") {
        state_default.debugMode = !state_default.debugMode;
      }
      if (e.code === "KeyR" && state_default.state === "playing") send({ type: "reload" });
      if (e.code === "KeyX" && state_default.state === "playing") {
        state_default.fireMode = state_default.fireMode === "burst" ? "auto" : "burst";
        state_default.killfeed.unshift({ txt: "M16A2: " + state_default.fireMode.toUpperCase() + " mode", t: 2 });
      }
      if (e.code === "KeyC" && state_default.state === "playing") {
        const meC = state_default.serverPlayers.find((p) => p.id === state_default.myId);
        if (meC && meC.alive) state_default.crouching = !state_default.crouching;
      }
      if (e.code === "KeyB" && state_default.state === "playing") {
        const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
        if (me && me.alive && performance.now() >= state_default.barricadeReadyAt) {
          const dir = new THREE3.Vector3(0, 0, -1);
          dir.applyQuaternion(cam.quaternion);
          dir.y = 0;
          if (dir.length() > 0.01) dir.normalize();
          send({ type: "placeBarricade", aimX: dir.x, aimY: dir.z });
        }
      }
      if (state_default.perkMenuOpen && window._perkChoices) {
        if (e.code === "Digit1" && window._perkChoices[0]) window.pickPerk(window._perkChoices[0].id);
        if (e.code === "Digit2" && window._perkChoices[1]) window.pickPerk(window._perkChoices[1].id);
        if (e.code === "Digit3" && window._perkChoices[2]) window.pickPerk(window._perkChoices[2].id);
      }
    });
    addEventListener("keyup", (e) => {
      state_default.keys[e.code] = false;
    });
  }
});

// client/ui.js
function showPerkMenu() {
  state_default.perkMenuOpen = true;
  const me = state_default.serverPlayers ? state_default.serverPlayers.find((p) => p.id === state_default.myId) : null;
  const choices = [];
  const pool = [...PERKS].filter((p) => {
    if (p.id === "cowstrike" && Math.random() >= 0.15) return false;
    if (p.id === "extmag" && me && me.extMagMult > 1) return false;
    if (p.id === "tacticow" && me && me.recoilMult < 1) return false;
    return true;
  });
  for (let i = 0; i < 3 && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(idx, 1)[0]);
  }
  const el = document.getElementById("perkMenu");
  el.innerHTML = '<div style="color:#ffee55;font-size:13px;font-weight:bold;margin-right:8px;align-self:center">LEVEL UP!</div>' + choices.map((p, i) => '<div class="perkCard" data-perk="' + p.id + '"><div style="color:#888;font-size:11px">[' + (i + 1) + ']</div><div style="color:#ff88aa;font-size:15px;font-weight:bold;margin:3px 0">' + p.name + '</div><div style="color:#aaa;font-size:11px">' + p.desc + "</div></div>").join("");
  el.style.display = "flex";
  el.querySelectorAll(".perkCard").forEach((card) => {
    card.addEventListener("click", () => {
      window.pickPerk(card.dataset.perk);
    });
  });
  window._perkChoices = choices;
}
var COW_NAMES, _nameIdx, randomBtn;
var init_ui = __esm({
  "client/ui.js"() {
    init_state();
    init_config();
    init_network();
    init_audio();
    try {
      const sn = localStorage.getItem("cowName3d");
      if (sn) document.getElementById("nameIn").value = sn;
    } catch (e) {
    }
    try {
      const sv = localStorage.getItem("cowVol3d");
      if (sv) {
        document.getElementById("volSlider").value = sv;
        document.getElementById("volLbl").textContent = sv + "%";
      }
    } catch (e) {
    }
    state_default.masterVol = parseFloat(document.getElementById("volSlider").value) / 100;
    try {
      const sm = localStorage.getItem("cowMusic3d");
      if (sm) {
        state_default.musicStyle = sm;
        document.getElementById("musicSelect").value = sm;
      }
    } catch (e) {
    }
    document.getElementById("musicSelect").addEventListener("change", (e) => {
      state_default.musicStyle = e.target.value;
      try {
        localStorage.setItem("cowMusic3d", e.target.value);
      } catch (ex) {
      }
      if (state_default.state !== "playing") {
        stopMenuMusic();
        startMenuMusic();
      }
    });
    document.getElementById("botsCheck").addEventListener("change", (e) => {
      send({ type: "toggleBots" });
    });
    document.getElementById("botsFreeWillCheck").addEventListener("change", (e) => {
      send({ type: "toggleBotsFreeWill" });
    });
    document.getElementById("volSlider").addEventListener("input", (e) => {
      state_default.masterVol = e.target.value / 100;
      document.getElementById("volLbl").textContent = e.target.value + "%";
      try {
        localStorage.setItem("cowVol3d", e.target.value);
      } catch (ex) {
      }
    });
    COW_NAMES = ["MooCow", "BurgerBoy", "SteakMate", "DairyQueen", "CowPoke", "BeefCake", "MilkMan", "Cheddar", "UdderChaos", "MooLander", "CowntDracula", "SirLoin", "AngusYoung", "T-Bone", "Bovinity", "Cowculator", "MooDonna", "Heifernator", "PrimeMooVer", "Bullseye", "CreamPuff", "Grazey", "Moosician", "Barnaby", "Wagyu", "Bessie"];
    _nameIdx = Math.floor(Math.random() * COW_NAMES.length);
    try {
      const sn = localStorage.getItem("cowName3d");
      if (!sn) document.getElementById("nameIn").value = COW_NAMES[_nameIdx];
    } catch (e) {
    }
    randomBtn = document.getElementById("randomNameBtn");
    if (randomBtn) {
      randomBtn.addEventListener("click", () => {
        _nameIdx = (_nameIdx + 1) % COW_NAMES.length;
        document.getElementById("nameIn").value = COW_NAMES[_nameIdx];
      });
    }
    document.getElementById("joinBtn").addEventListener("click", () => {
      const n = document.getElementById("nameIn").value.trim() || COW_NAMES[Math.floor(Math.random() * COW_NAMES.length)];
      document.getElementById("nameIn").value = n;
      try {
        localStorage.setItem("cowName3d", n);
      } catch (e) {
      }
      send({ type: "join", name: n });
    });
    document.getElementById("nameIn").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("joinBtn").click();
    });
    window.pickPerk = function(id) {
      send({ type: "perk", id });
      state_default.pendingLevelUps--;
      state_default.perkMenuOpen = false;
      document.getElementById("perkMenu").style.display = "none";
      if (state_default.pendingLevelUps > 0) setTimeout(showPerkMenu, 300);
    };
  }
});

// client/entities.js
import * as THREE4 from "three";
function buildCow(color, personality) {
  const c = COL[color] || 16746666;
  const g = new THREE4.Group();
  const whiteMat = new THREE4.MeshLambertMaterial({ color: c });
  const spotMat = new THREE4.MeshLambertMaterial({ color: 16777215 });
  const udderMat = new THREE4.MeshLambertMaterial({ color: 16746666 });
  const hm = new THREE4.MeshLambertMaterial({ color: c });
  const torso = new THREE4.Mesh(new THREE4.BoxGeometry(14, 18, 10), whiteMat);
  torso.position.set(0, 18, 0);
  g.add(torso);
  const spotGeo = new THREE4.CircleGeometry(3, 8);
  const s1 = new THREE4.Mesh(spotGeo, spotMat);
  s1.position.set(-7.1, 20, 0);
  s1.rotation.y = -Math.PI / 2;
  g.add(s1);
  const s2 = new THREE4.Mesh(spotGeo, spotMat);
  s2.position.set(7.1, 16, -1);
  s2.rotation.y = Math.PI / 2;
  g.add(s2);
  const s3 = new THREE4.Mesh(new THREE4.CircleGeometry(2.5, 8), spotMat);
  s3.position.set(0, 27.1, 1);
  s3.rotation.x = -Math.PI / 2;
  g.add(s3);
  const s4 = new THREE4.Mesh(new THREE4.CircleGeometry(2.2, 8), spotMat);
  s4.position.set(-2.5, 22, 5.1);
  g.add(s4);
  const s5 = new THREE4.Mesh(new THREE4.CircleGeometry(1.6, 8), spotMat);
  s5.position.set(3, 15, 5.1);
  g.add(s5);
  const s6 = new THREE4.Mesh(new THREE4.CircleGeometry(2.4, 8), spotMat);
  s6.position.set(2, 19, -5.1);
  s6.rotation.y = Math.PI;
  g.add(s6);
  const s7 = new THREE4.Mesh(new THREE4.CircleGeometry(1.8, 8), spotMat);
  s7.position.set(-3, 24, -5.1);
  s7.rotation.y = Math.PI;
  g.add(s7);
  const head = new THREE4.Mesh(new THREE4.BoxGeometry(10, 10, 10), whiteMat);
  head.position.set(0, 33, 0);
  g.add(head);
  const eyeM = new THREE4.MeshBasicMaterial({ color: 16777215 });
  const pupilM = new THREE4.MeshBasicMaterial({ color: 2236962 });
  const e1 = new THREE4.Mesh(new THREE4.SphereGeometry(2, 6, 6), eyeM);
  e1.position.set(-3, 35, 5);
  g.add(e1);
  const e2 = new THREE4.Mesh(new THREE4.SphereGeometry(2, 6, 6), eyeM);
  e2.position.set(3, 35, 5);
  g.add(e2);
  const p1 = new THREE4.Mesh(new THREE4.SphereGeometry(1, 6, 6), pupilM);
  p1.position.set(-3, 35, 6.5);
  g.add(p1);
  const p2 = new THREE4.Mesh(new THREE4.SphereGeometry(1, 6, 6), pupilM);
  p2.position.set(3, 35, 6.5);
  g.add(p2);
  const mouthMat = new THREE4.MeshBasicMaterial({ color: 2236962 });
  if (personality === "aggressive") {
    const brow1 = new THREE4.Mesh(new THREE4.BoxGeometry(3, 0.6, 0.6), mouthMat);
    brow1.position.set(-3, 37, 5.5);
    brow1.rotation.z = -0.4;
    g.add(brow1);
    const brow2 = new THREE4.Mesh(new THREE4.BoxGeometry(3, 0.6, 0.6), mouthMat);
    brow2.position.set(3, 37, 5.5);
    brow2.rotation.z = 0.4;
    g.add(brow2);
    const frown = new THREE4.Mesh(new THREE4.TorusGeometry(2, 0.4, 6, 12, Math.PI), mouthMat);
    frown.position.set(0, 31.5, 5.5);
    g.add(frown);
  } else if (personality === "timid") {
    const brow1 = new THREE4.Mesh(new THREE4.BoxGeometry(3, 0.6, 0.6), mouthMat);
    brow1.position.set(-3, 37, 5.5);
    brow1.rotation.z = 0.3;
    g.add(brow1);
    const brow2 = new THREE4.Mesh(new THREE4.BoxGeometry(3, 0.6, 0.6), mouthMat);
    brow2.position.set(3, 37, 5.5);
    brow2.rotation.z = -0.3;
    g.add(brow2);
    const sad = new THREE4.Mesh(new THREE4.TorusGeometry(1.5, 0.4, 6, 12, Math.PI), mouthMat);
    sad.position.set(0, 32, 5.5);
    g.add(sad);
  } else {
    const smile = new THREE4.Mesh(new THREE4.TorusGeometry(2, 0.4, 6, 12, Math.PI), mouthMat);
    smile.position.set(0, 31.5, 5.5);
    smile.rotation.set(0, 0, Math.PI);
    g.add(smile);
  }
  const cigGroup = new THREE4.Group();
  const cigBody = new THREE4.Mesh(new THREE4.CylinderGeometry(0.4, 0.4, 4, 4), new THREE4.MeshLambertMaterial({ color: 15658734 }));
  cigBody.rotation.z = Math.PI / 2;
  cigBody.position.x = 0;
  cigGroup.add(cigBody);
  const filter = new THREE4.Mesh(new THREE4.CylinderGeometry(0.45, 0.45, 1.5, 4), new THREE4.MeshLambertMaterial({ color: 14518323 }));
  filter.rotation.z = Math.PI / 2;
  filter.position.x = -2.75;
  cigGroup.add(filter);
  const ember = new THREE4.Mesh(new THREE4.SphereGeometry(0.5, 4, 4), new THREE4.MeshBasicMaterial({ color: 16729088 }));
  ember.position.x = 2.2;
  cigGroup.add(ember);
  const emberGlow = new THREE4.Mesh(new THREE4.SphereGeometry(1, 4, 4), new THREE4.MeshBasicMaterial({ color: 16737792, transparent: true, opacity: 0.25 }));
  emberGlow.position.x = 2.2;
  cigGroup.add(emberGlow);
  cigGroup.position.set(4, 31, 6);
  cigGroup.rotation.z = -0.2;
  g.add(cigGroup);
  g.userData.smokeOrigin = new THREE4.Vector3(6.2, 30.6, 6);
  const h1 = new THREE4.Mesh(new THREE4.ConeGeometry(1.5, 8, 5), hm);
  h1.position.set(-4, 41, 0);
  h1.rotation.set(0, 0, -0.3);
  g.add(h1);
  const h2 = new THREE4.Mesh(new THREE4.ConeGeometry(1.5, 8, 5), hm);
  h2.position.set(4, 41, 0);
  h2.rotation.set(0, 0, 0.3);
  g.add(h2);
  const legL = new THREE4.Mesh(new THREE4.CylinderGeometry(2.5, 2, 12, 5), whiteMat);
  legL.position.set(-4, 3, 0);
  g.add(legL);
  const legR = new THREE4.Mesh(new THREE4.CylinderGeometry(2.5, 2, 12, 5), whiteMat);
  legR.position.set(4, 3, 0);
  g.add(legR);
  const hoofMat = new THREE4.MeshLambertMaterial({ color: 4473924 });
  const hoof1 = new THREE4.Mesh(new THREE4.BoxGeometry(4, 2, 5), hoofMat);
  hoof1.position.set(-4, -1, 0);
  g.add(hoof1);
  const hoof2 = new THREE4.Mesh(new THREE4.BoxGeometry(4, 2, 5), hoofMat);
  hoof2.position.set(4, -1, 0);
  g.add(hoof2);
  const udder = new THREE4.Mesh(new THREE4.SphereGeometry(3, 6, 6), udderMat);
  udder.position.set(0, 13, 5.5);
  udder.scale.set(1, 0.7, 0.8);
  g.add(udder);
  const teat1 = new THREE4.Mesh(new THREE4.CylinderGeometry(0.5, 0.3, 2, 4), udderMat);
  teat1.position.set(-1.5, 13, 7);
  teat1.rotation.x = Math.PI / 2;
  g.add(teat1);
  const teat2 = new THREE4.Mesh(new THREE4.CylinderGeometry(0.5, 0.3, 2, 4), udderMat);
  teat2.position.set(1.5, 13, 7);
  teat2.rotation.x = Math.PI / 2;
  g.add(teat2);
  const armL = new THREE4.Mesh(new THREE4.CylinderGeometry(1.5, 1.5, 12, 5), whiteMat);
  armL.position.set(-9, 20, 0);
  armL.rotation.z = 0.3;
  g.add(armL);
  const armR = new THREE4.Mesh(new THREE4.CylinderGeometry(1.5, 1.5, 12, 5), whiteMat);
  armR.position.set(9, 20, 0);
  armR.rotation.z = -0.3;
  g.add(armR);
  g.castShadow = true;
  return g;
}
function spawnParts(pid) {
  const p = state_default.serverPlayers.find((pp) => pp.id === pid);
  if (!p) return;
  for (let i = 0; i < 5; i++) {
    const g = new THREE4.Mesh(new THREE4.SphereGeometry(1.5, 4, 4), new THREE4.MeshBasicMaterial({ color: 16729156, transparent: true }));
    g.position.set(p.x, 10, p.y);
    scene.add(g);
    const vx = (Math.random() - 0.5) * 80, vy = Math.random() * 60 + 20, vz = (Math.random() - 0.5) * 80;
    setTimeout(() => scene.remove(g), 600);
    g.userData = { vx, vy, vz, life: 0.6 };
  }
}
function updateCows(time, dt) {
  const lerpF = 1 - Math.pow(1e-3, dt || 0.016);
  const lerpR = 1 - Math.pow(1e-3, dt || 0.016);
  const seen = /* @__PURE__ */ new Set();
  for (const p of state_default.serverPlayers) {
    if (p.id === state_default.myId) continue;
    seen.add(String(p.id));
    const pid = String(p.id);
    if (!state_default.cowMeshes[pid]) {
      const m = buildCow(p.color, p.personality);
      scene.add(m);
      const nc = document.createElement("canvas");
      nc.width = 256;
      nc.height = 64;
      const nctx = nc.getContext("2d");
      nctx.font = "bold 32px Segoe UI";
      nctx.textAlign = "center";
      const colHex = { pink: "#ff88aa", blue: "#88aaff", green: "#88ff88", gold: "#ffdd44", purple: "#cc88ff", red: "#ff4444", orange: "#ff8844", cyan: "#44ffdd" };
      const nameW = nctx.measureText(p.name || "Cow").width;
      const circleX = 128 - nameW / 2 - 16;
      nctx.beginPath();
      nctx.arc(circleX, 34, 10, 0, Math.PI * 2);
      nctx.fillStyle = colHex[p.color] || "#aaa";
      nctx.fill();
      nctx.fillStyle = "rgba(0,0,0,0.5)";
      nctx.fillText(p.name || "Cow", 137, 39);
      nctx.fillStyle = "#ffffff";
      nctx.fillText(p.name || "Cow", 136, 38);
      const ntex = new THREE4.CanvasTexture(nc);
      ntex.minFilter = THREE4.LinearFilter;
      const nmat = new THREE4.SpriteMaterial({ map: ntex, transparent: true, depthTest: false });
      const nsprite = new THREE4.Sprite(nmat);
      nsprite.position.set(0, 50, 0);
      nsprite.scale.set(40, 10, 1);
      m.add(nsprite);
      const hatType = ["cowboy", "wizard", "party", "crown", "cap"][Math.abs(p.id || 0) % 5];
      if (hatType === "cowboy") {
        const hatBrown = new THREE4.MeshLambertMaterial({ color: 6961690 });
        const hatBand = new THREE4.MeshLambertMaterial({ color: 3807752 });
        const brim = new THREE4.Mesh(new THREE4.CylinderGeometry(8, 8, 0.8, 16), hatBrown);
        brim.position.y = 38.5;
        m.add(brim);
        const crown = new THREE4.Mesh(new THREE4.CylinderGeometry(4, 4.5, 4, 12), hatBrown);
        crown.position.y = 41;
        m.add(crown);
        const band = new THREE4.Mesh(new THREE4.CylinderGeometry(4.6, 4.6, 0.8, 12), hatBand);
        band.position.y = 39.5;
        m.add(band);
        const top = new THREE4.Mesh(new THREE4.CylinderGeometry(4, 4, 0.4, 12), hatBrown);
        top.position.y = 43;
        m.add(top);
      } else if (hatType === "wizard") {
        const purpleMat = new THREE4.MeshLambertMaterial({ color: 6955673 });
        const brownBand = new THREE4.MeshLambertMaterial({ color: 6961690 });
        const yellowMat = new THREE4.MeshLambertMaterial({ color: 16768256 });
        const wizBrim = new THREE4.Mesh(new THREE4.CylinderGeometry(7, 7, 0.6, 16), purpleMat);
        wizBrim.position.y = 38.5;
        m.add(wizBrim);
        const wizCone = new THREE4.Mesh(new THREE4.ConeGeometry(5, 14, 12), purpleMat);
        wizCone.position.y = 46;
        m.add(wizCone);
        const wizBand = new THREE4.Mesh(new THREE4.CylinderGeometry(5.2, 5.2, 1, 12), brownBand);
        wizBand.position.y = 39.5;
        m.add(wizBand);
        const buckle = new THREE4.Mesh(new THREE4.BoxGeometry(2, 1.5, 0.5), yellowMat);
        buckle.position.set(0, 39.5, 5.3);
        m.add(buckle);
      } else if (hatType === "crown") {
        const goldMat = new THREE4.MeshLambertMaterial({ color: 16768256 });
        const base = new THREE4.Mesh(new THREE4.CylinderGeometry(5, 5, 3, 12), goldMat);
        base.position.y = 39;
        m.add(base);
        const jewelColors = [16720418, 2293538, 2237183, 16720639, 16776994];
        for (let pi = 0; pi < 6; pi++) {
          const ang = pi / 6 * Math.PI * 2;
          const spike = new THREE4.Mesh(new THREE4.ConeGeometry(0.8, 3.5, 6), goldMat);
          spike.position.set(Math.cos(ang) * 4.5, 42, Math.sin(ang) * 4.5);
          m.add(spike);
          const jewel = new THREE4.Mesh(new THREE4.OctahedronGeometry(0.7, 0), new THREE4.MeshLambertMaterial({ color: jewelColors[pi % jewelColors.length] }));
          jewel.position.set(Math.cos(ang) * 4.5, 44.5, Math.sin(ang) * 4.5);
          m.add(jewel);
        }
        const bigJewel = new THREE4.Mesh(new THREE4.OctahedronGeometry(1.2, 0), new THREE4.MeshLambertMaterial({ color: 16720452 }));
        bigJewel.position.set(0, 39, 5);
        m.add(bigJewel);
      } else if (hatType === "cap") {
        const capColor = new THREE4.MeshLambertMaterial({ color: 2245802 });
        const dome = new THREE4.Mesh(new THREE4.SphereGeometry(5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), capColor);
        dome.position.y = 39;
        m.add(dome);
        const visor = new THREE4.Mesh(new THREE4.BoxGeometry(8, 0.5, 5), capColor);
        visor.position.set(0, 39, 5);
        m.add(visor);
        const btn = new THREE4.Mesh(new THREE4.SphereGeometry(0.6, 6, 6), capColor);
        btn.position.y = 44;
        m.add(btn);
      } else {
        const partyMat = new THREE4.MeshLambertMaterial({ color: 16729258 });
        const partyCone = new THREE4.Mesh(new THREE4.ConeGeometry(4, 12, 12), partyMat);
        partyCone.position.y = 44;
        m.add(partyCone);
        const spotColors = [16768324, 4521949, 4513279, 14548804];
        for (let si = 0; si < 8; si++) {
          const sCol = new THREE4.MeshLambertMaterial({ color: spotColors[si % spotColors.length] });
          const spot = new THREE4.Mesh(new THREE4.SphereGeometry(0.6, 6, 6), sCol);
          const ang = si / 8 * Math.PI * 2;
          const sy = 40 + si % 3 * 2.5;
          const sr = 3.5 - si % 3 * 0.7;
          spot.position.set(Math.cos(ang) * sr, sy, Math.sin(ang) * sr);
          m.add(spot);
        }
        const pom = new THREE4.Mesh(new THREE4.SphereGeometry(1.2, 6, 6), new THREE4.MeshLambertMaterial({ color: 16777215 }));
        pom.position.y = 50.5;
        m.add(pom);
      }
      state_default.cowMeshes[pid] = { mesh: m };
    }
    const cowObj = state_default.cowMeshes[pid];
    const cm = cowObj.mesh;
    if (!cowObj.isDead) {
      cm.position.x = p.x;
      cm.position.z = p.y;
      cm.position.y = p.z !== void 0 ? p.z : getTerrainHeight(p.x, p.y);
      const sz = p.sizeMult || 1;
      const crouchY = p.crouching ? 0.5 : 1;
      cm.scale.set(sz, sz * crouchY, sz);
    }
    cm.visible = true;
    if (!p.alive && !cowObj.isDead) {
      cowObj.isDead = true;
      cm.rotation.z = Math.PI / 2;
      cm.position.y = (p.z !== void 0 ? p.z : getTerrainHeight(p.x, p.y)) + 5;
      if (cowObj.shieldBubble) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.geometry.dispose();
        cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      }
      if (cowObj.spawnBubble) {
        cm.remove(cowObj.spawnBubble);
        cowObj.spawnBubble.geometry.dispose();
        cowObj.spawnBubble.material.dispose();
        cowObj.spawnBubble = null;
      }
      cm.traverse((c) => {
        if (c.isMesh && c.material && !c.material.transparent) {
          c.material.transparent = true;
          c.material.opacity = 0.5;
        } else if (c.isMesh && c.material && c.material.transparent) {
          c.material.opacity *= 0.5;
        }
      });
    }
    if (p.aimAngle !== void 0) {
      let targetRot = p.aimAngle;
      let diff = targetRot - cm.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      cm.rotation.y += diff * lerpR;
    }
    if (state_default.debugMode) {
      const eh = 35 * (p.sizeMult || 1);
      const headBase = eh * 0.75;
      if (!cowObj.debugBody) {
        const bodyMat = new THREE4.MeshBasicMaterial({ color: 65280, wireframe: true, transparent: true, opacity: 0.3 });
        cowObj.debugBody = new THREE4.Mesh(new THREE4.CylinderGeometry(18, 18, headBase, 12), bodyMat);
        cm.add(cowObj.debugBody);
        const headMat = new THREE4.MeshBasicMaterial({ color: 16729156, wireframe: true, transparent: true, opacity: 0.3 });
        cowObj.debugHead = new THREE4.Mesh(new THREE4.CylinderGeometry(12, 12, 20, 12), headMat);
        cm.add(cowObj.debugHead);
      }
      cowObj.debugBody.position.set(0, headBase / 2, 0);
      cowObj.debugBody.visible = true;
      cowObj.debugHead.position.set(0, headBase + 10, 0);
      cowObj.debugHead.visible = true;
    } else if (cowObj.debugBody) {
      cowObj.debugBody.visible = false;
      cowObj.debugHead.visible = false;
    }
    if (p.alive && !cowObj.isDead && cm.userData.smokeOrigin && Math.random() < 0.08) {
      const so = cm.userData.smokeOrigin;
      const worldPos = new THREE4.Vector3(so.x, so.y, so.z);
      cm.localToWorld(worldPos);
      const wisp = new THREE4.Mesh(new THREE4.SphereGeometry(0.5 + Math.random() * 0.5, 3, 3), new THREE4.MeshBasicMaterial({ color: 13421772, transparent: true, opacity: 0.4 }));
      wisp.position.copy(worldPos);
      scene.add(wisp);
      let wlife = 0.8 + Math.random() * 0.4;
      const wvx = (Math.random() - 0.5) * 3, wvz = (Math.random() - 0.5) * 3, wvy = 8 + Math.random() * 5;
      const wAnim = () => {
        wlife -= 0.016;
        wisp.material.opacity = Math.max(0, wlife * 0.4);
        wisp.position.x += wvx * 0.016;
        wisp.position.y += wvy * 0.016;
        wisp.position.z += wvz * 0.016;
        wisp.scale.multiplyScalar(1 + 0.016 * 2);
        if (wlife <= 0) {
          scene.remove(wisp);
          wisp.geometry.dispose();
          wisp.material.dispose();
        } else requestAnimationFrame(wAnim);
      };
      requestAnimationFrame(wAnim);
    }
    if (!cowObj.hpSprite) {
      const hc = document.createElement("canvas");
      hc.width = 128;
      hc.height = 16;
      const htex = new THREE4.CanvasTexture(hc);
      htex.minFilter = THREE4.LinearFilter;
      const hmat = new THREE4.SpriteMaterial({ map: htex, transparent: true, depthTest: false });
      const hs = new THREE4.Sprite(hmat);
      hs.position.set(0, 38, 0);
      hs.scale.set(30, 4, 1);
      cm.add(hs);
      cowObj.hpSprite = { sprite: hs, canvas: hc, ctx: hc.getContext("2d"), tex: htex };
    }
    const armorVal = p.armor || 0;
    if (armorVal > 0 && !cowObj.shieldBubble) {
      const shieldMat = new THREE4.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.55, side: THREE4.DoubleSide });
      const shield = new THREE4.Mesh(new THREE4.SphereGeometry(22, 12, 12), shieldMat);
      shield.position.set(0, 14, 0);
      cm.add(shield);
      cowObj.shieldBubble = shield;
    }
    if (cowObj.shieldBubble) {
      if (armorVal <= 0) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.geometry.dispose();
        cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      } else {
        cowObj.shieldBubble.material.opacity = Math.max(0.2, armorVal / 100 * 0.6);
      }
    }
    if (p.spawnProt && !cowObj.spawnBubble) {
      const spMat = new THREE4.MeshBasicMaterial({ color: 16772676, transparent: true, opacity: 0.2, side: THREE4.DoubleSide });
      const sp = new THREE4.Mesh(new THREE4.SphereGeometry(25, 12, 12), spMat);
      sp.position.set(0, 14, 0);
      cm.add(sp);
      cowObj.spawnBubble = sp;
    }
    if (cowObj.spawnBubble && !p.spawnProt) {
      cm.remove(cowObj.spawnBubble);
      cowObj.spawnBubble.geometry.dispose();
      cowObj.spawnBubble.material.dispose();
      cowObj.spawnBubble = null;
    }
    const hpPct = Math.max(0, (p.hunger || 0) / 100);
    const hpRounded = Math.round(hpPct * 100);
    if (cowObj.lastHp !== hpRounded) {
      cowObj.lastHp = hpRounded;
      const hctx = cowObj.hpSprite.ctx;
      hctx.clearRect(0, 0, 128, 16);
      hctx.fillStyle = "rgba(0,0,0,0.6)";
      hctx.fillRect(0, 0, 128, 16);
      hctx.fillStyle = hpPct > 0.5 ? "#44ff44" : hpPct > 0.25 ? "#ffaa00" : "#ff4444";
      hctx.fillRect(2, 2, 124 * hpPct, 12);
      cowObj.hpSprite.tex.needsUpdate = true;
    }
  }
  for (const id in state_default.cowMeshes) {
    if (!seen.has(id)) {
      const obj = state_default.cowMeshes[id];
      scene.remove(obj.mesh);
      obj.mesh.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          if (c.material.map) c.material.map.dispose();
          c.material.dispose();
        }
      });
      if (obj.hpSprite) obj.hpSprite.tex.dispose();
      if (obj.shieldBubble) {
        obj.shieldBubble.geometry.dispose();
        obj.shieldBubble.material.dispose();
      }
      if (obj.spawnBubble) {
        obj.spawnBubble.geometry.dispose();
        obj.spawnBubble.material.dispose();
      }
      delete state_default.cowMeshes[id];
    }
  }
}
var init_entities = __esm({
  "client/entities.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
  }
});

// client/map-objects.js
import * as THREE5 from "three";
function buildMap() {
  if (state_default.mapBuilt) return;
  state_default.mapBuilt = true;
  _mapMeshes.forEach((m) => {
    scene.remove(m);
    m.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
  });
  _mapMeshes = [];
  function addMap(m) {
    scene.add(m);
    _mapMeshes.push(m);
    return m;
  }
  const wm = new THREE5.MeshLambertMaterial({ color: 11154227 });
  const trimMat = new THREE5.MeshLambertMaterial({ color: 16777215 });
  const wallH = 70;
  (state_default.mapFeatures.walls || []).forEach((w) => {
    const ww = Math.max(w.w, 20), wh = Math.max(w.h, 20);
    const isHoriz = ww > wh;
    const len = isHoriz ? ww : wh;
    const segSize = 20;
    const segs = Math.max(1, Math.ceil(len / segSize));
    for (let s = 0; s < segs; s++) {
      const frac = (s + 0.5) / segs;
      let sx, sz, sw, sh;
      if (isHoriz) {
        sx = w.x + frac * ww;
        sz = w.y + wh / 2;
        sw = ww / segs;
        sh = wh;
      } else {
        sx = w.x + ww / 2;
        sz = w.y + frac * wh;
        sw = ww;
        sh = wh / segs;
      }
      const th = getTerrainHeight(sx, sz);
      const m = new THREE5.Mesh(new THREE5.BoxGeometry(sw + 1, wallH, sh + 1), wm);
      m.position.set(sx, wallH / 2 + th, sz);
      m.castShadow = true;
      addMap(m);
      const trim1 = new THREE5.Mesh(new THREE5.BoxGeometry(sw + 1.5, 3, sh + 1.5), trimMat);
      trim1.position.set(sx, wallH * 0.6 + th, sz);
      addMap(trim1);
      const capMat = new THREE5.MeshLambertMaterial({ color: 6964258 });
      const cap = new THREE5.Mesh(new THREE5.BoxGeometry(sw + 2, 5, sh + 2), capMat);
      cap.position.set(sx, wallH + 2.5 + th, sz);
      addMap(cap);
      const xMat = new THREE5.MeshLambertMaterial({ color: 16777215 });
      const faceW = isHoriz ? sw : sh;
      const diagLen = Math.hypot(faceW, wallH * 0.55);
      const diagAngle = Math.atan2(wallH * 0.55, faceW);
      const faceOffset = isHoriz ? sh / 2 + 1.5 : sw / 2 + 1.5;
      const x1 = new THREE5.Mesh(new THREE5.BoxGeometry(diagLen, 2.5, 1), xMat);
      x1.position.set(sx, wallH * 0.3 + th, isHoriz ? sz + faceOffset : sz);
      if (isHoriz) {
        x1.rotation.z = diagAngle;
      } else {
        x1.position.x = sx + faceOffset;
        x1.position.z = sz;
        x1.rotation.set(0, Math.PI / 2, diagAngle);
      }
      addMap(x1);
      const x2 = new THREE5.Mesh(new THREE5.BoxGeometry(diagLen, 2.5, 1), xMat);
      x2.position.set(sx, wallH * 0.3 + th, isHoriz ? sz + faceOffset : sz);
      if (isHoriz) {
        x2.rotation.z = -diagAngle;
      } else {
        x2.position.x = sx + faceOffset;
        x2.position.z = sz;
        x2.rotation.set(0, Math.PI / 2, -diagAngle);
      }
      addMap(x2);
      const x3 = new THREE5.Mesh(new THREE5.BoxGeometry(diagLen, 2.5, 1), xMat);
      x3.position.set(sx, wallH * 0.3 + th, isHoriz ? sz - faceOffset : sz);
      if (isHoriz) {
        x3.rotation.z = diagAngle;
      } else {
        x3.position.x = sx - faceOffset;
        x3.position.z = sz;
        x3.rotation.set(0, Math.PI / 2, diagAngle);
      }
      addMap(x3);
      const x4 = new THREE5.Mesh(new THREE5.BoxGeometry(diagLen, 2.5, 1), xMat);
      x4.position.set(sx, wallH * 0.3 + th, isHoriz ? sz - faceOffset : sz);
      if (isHoriz) {
        x4.rotation.z = -diagAngle;
      } else {
        x4.position.x = sx - faceOffset;
        x4.position.z = sz;
        x4.rotation.set(0, Math.PI / 2, -diagAngle);
      }
      addMap(x4);
    }
  });
  const pm = new THREE5.MeshBasicMaterial({ color: 13404415, transparent: true, opacity: 0.6 });
  (state_default.mapFeatures.portals || []).forEach((p) => {
    [[p.x1, p.y1], [p.x2, p.y2]].forEach(([px, pz]) => {
      const th = getTerrainHeight(px, pz);
      const mesh = new THREE5.Mesh(new THREE5.TorusGeometry(20, 3, 8, 16), pm);
      mesh.position.set(px, th + 20, pz);
      mesh.rotation.x = Math.PI / 2;
      addMap(mesh);
    });
  });
  const barnWallMat = new THREE5.MeshLambertMaterial({ color: 11154227 });
  const barnRoofMat = new THREE5.MeshLambertMaterial({ color: 6964258 });
  const barnTrimMat = new THREE5.MeshLambertMaterial({ color: 16777215 });
  (state_default.mapFeatures.shelters || []).forEach((s) => {
    const th = getTerrainHeight(s.x, s.y);
    const bw = s.r * 2 || 60, bd = s.r * 2 || 60, bh = 35;
    const stiltH = 100;
    const g = new THREE5.Group();
    const stiltGeo = new THREE5.CylinderGeometry(3, 3, stiltH, 6);
    const stiltMat = new THREE5.MeshLambertMaterial({ color: 6964258 });
    [[-bw / 2 + 4, -bd / 2 + 4], [bw / 2 - 4, -bd / 2 + 4], [-bw / 2 + 4, bd / 2 - 4], [bw / 2 - 4, bd / 2 - 4]].forEach(([sx2, sz2]) => {
      const stilt = new THREE5.Mesh(stiltGeo, stiltMat);
      stilt.position.set(sx2, stiltH / 2, sz2);
      stilt.castShadow = true;
      g.add(stilt);
    });
    const braceGeo = new THREE5.BoxGeometry(bw - 8, 3, 3);
    const brace1 = new THREE5.Mesh(braceGeo, stiltMat);
    brace1.position.set(0, stiltH * 0.3, -bd / 2 + 4);
    g.add(brace1);
    const brace2 = new THREE5.Mesh(braceGeo, stiltMat);
    brace2.position.set(0, stiltH * 0.3, bd / 2 - 4);
    g.add(brace2);
    const floorMat = new THREE5.MeshLambertMaterial({ color: 9136404 });
    const floor = new THREE5.Mesh(new THREE5.BoxGeometry(bw + 4, 3, bd + 4), floorMat);
    floor.position.y = stiltH;
    g.add(floor);
    const walls = new THREE5.Mesh(new THREE5.BoxGeometry(bw, bh, bd), barnWallMat);
    walls.position.y = stiltH + bh / 2;
    walls.castShadow = true;
    g.add(walls);
    const trim = new THREE5.Mesh(new THREE5.BoxGeometry(bw + 0.5, 3, bd + 0.5), barnTrimMat);
    trim.position.y = stiltH + bh * 0.6;
    g.add(trim);
    const roofW = bw + 10, roofD = bd + 6;
    const roofGeo = new THREE5.BoxGeometry(roofW, 4, roofD);
    const roofL = new THREE5.Mesh(roofGeo, barnRoofMat);
    roofL.position.set(-roofW * 0.2, stiltH + bh + 8, 0);
    roofL.rotation.z = 0.4;
    roofL.castShadow = true;
    g.add(roofL);
    const roofR = new THREE5.Mesh(roofGeo, barnRoofMat);
    roofR.position.set(roofW * 0.2, stiltH + bh + 8, 0);
    roofR.rotation.z = -0.4;
    roofR.castShadow = true;
    g.add(roofR);
    const ridge = new THREE5.Mesh(new THREE5.BoxGeometry(4, 4, roofD + 2), barnRoofMat);
    ridge.position.y = stiltH + bh + 14;
    g.add(ridge);
    const doorMat = new THREE5.MeshLambertMaterial({ color: 3351057 });
    const door = new THREE5.Mesh(new THREE5.BoxGeometry(bw * 0.35, bh * 0.7, 0.5), doorMat);
    door.position.set(0, stiltH + bh * 0.35, bd / 2 + 0.3);
    g.add(door);
    const windowMat = new THREE5.MeshLambertMaterial({ color: 16768392 });
    const win = new THREE5.Mesh(new THREE5.BoxGeometry(8, 8, 0.5), windowMat);
    win.position.set(0, stiltH + bh * 0.85, bd / 2 + 0.3);
    g.add(win);
    const sc = document.createElement("canvas");
    sc.width = 128;
    sc.height = 32;
    const sctx = sc.getContext("2d");
    sctx.font = "bold 22px Segoe UI";
    sctx.textAlign = "center";
    sctx.fillStyle = "#fff";
    sctx.fillText("SHELTER", 64, 24);
    const stex2 = new THREE5.CanvasTexture(sc);
    stex2.minFilter = THREE5.LinearFilter;
    const ss = new THREE5.Sprite(new THREE5.SpriteMaterial({ map: stex2, transparent: true, depthTest: false }));
    ss.position.set(0, stiltH + bh + 22, 0);
    ss.scale.set(40, 10, 1);
    g.add(ss);
    g.position.set(s.x, th, s.y);
    addMap(g);
  });
}
function addBarricade(b) {
  if (_barricadeMeshes[b.id]) return;
  state_default.barricades.push({ id: b.id, cx: b.cx, cy: b.cy, w: b.w, h: b.h, angle: b.angle });
  const g = new THREE5.Group();
  const th = getTerrainHeight(b.cx, b.cy);
  const plankMat = new THREE5.MeshLambertMaterial({ color: 9132587 });
  const darkPlank = new THREE5.MeshLambertMaterial({ color: 6963232 });
  const H = 55;
  const body = new THREE5.Mesh(new THREE5.BoxGeometry(b.w, H, b.h), plankMat);
  body.position.set(0, H / 2, 0);
  body.castShadow = true;
  g.add(body);
  for (let i = 1; i < 4; i++) {
    const stripe = new THREE5.Mesh(new THREE5.BoxGeometry(b.w + 0.2, 1.5, b.h + 0.2), darkPlank);
    stripe.position.set(0, H / 4 * i, 0);
    g.add(stripe);
  }
  const beamLen = Math.hypot(b.w, H) * 0.95;
  const beam1 = new THREE5.Mesh(new THREE5.BoxGeometry(beamLen, 3, 0.6), darkPlank);
  beam1.position.set(0, H / 2, b.h / 2 + 0.5);
  beam1.rotation.z = Math.atan2(H, b.w);
  g.add(beam1);
  const beam2 = new THREE5.Mesh(new THREE5.BoxGeometry(beamLen, 3, 0.6), darkPlank);
  beam2.position.set(0, H / 2, b.h / 2 + 0.5);
  beam2.rotation.z = -Math.atan2(H, b.w);
  g.add(beam2);
  g.position.set(b.cx, th, b.cy);
  g.rotation.y = -b.angle - Math.PI / 2;
  scene.add(g);
  _barricadeMeshes[b.id] = g;
}
function removeBarricade(id) {
  const m = _barricadeMeshes[id];
  if (!m) return;
  scene.remove(m);
  m.traverse((c) => {
    if (c.geometry) c.geometry.dispose();
    if (c.material) c.material.dispose();
  });
  delete _barricadeMeshes[id];
  state_default.barricades = state_default.barricades.filter((b) => b.id !== id);
}
function clearBarricades() {
  for (const id in _barricadeMeshes) {
    const m = _barricadeMeshes[id];
    scene.remove(m);
    m.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
    delete _barricadeMeshes[id];
  }
  state_default.barricades = [];
}
function buildTowerIfNeeded() {
  if (towerMesh) return;
  const g = new THREE5.Group();
  const th = getTerrainHeight(towerX, towerZ);
  const poleMat = new THREE5.MeshLambertMaterial({ color: 8947848 });
  const pole = new THREE5.Mesh(new THREE5.CylinderGeometry(1.5, 2, 80, 6), poleMat);
  pole.position.y = 40;
  g.add(pole);
  const cap = new THREE5.Mesh(new THREE5.SphereGeometry(3, 6, 6), new THREE5.MeshLambertMaterial({ color: 16768324 }));
  cap.position.y = 82;
  g.add(cap);
  const fc = document.createElement("canvas");
  fc.width = 128;
  fc.height = 64;
  const fctx = fc.getContext("2d");
  fctx.fillStyle = "#ffffff";
  fctx.fillRect(0, 0, 128, 64);
  fctx.fillStyle = "#ff88aa";
  fctx.beginPath();
  fctx.arc(40, 25, 15, 0, Math.PI * 2);
  fctx.fill();
  fctx.beginPath();
  fctx.arc(85, 35, 12, 0, Math.PI * 2);
  fctx.fill();
  fctx.beginPath();
  fctx.arc(55, 48, 10, 0, Math.PI * 2);
  fctx.fill();
  const ftex = new THREE5.CanvasTexture(fc);
  const flag = new THREE5.Mesh(new THREE5.PlaneGeometry(30, 18), new THREE5.MeshBasicMaterial({ map: ftex, side: THREE5.DoubleSide }));
  flag.position.set(16, 70, 0);
  g.add(flag);
  g.position.set(towerX, th, towerZ);
  scene.add(g);
  towerMesh = g;
}
var _mapMeshes, _barricadeMeshes, towerX, towerZ, towerMesh;
var init_map_objects = __esm({
  "client/map-objects.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    _mapMeshes = [];
    _barricadeMeshes = {};
    towerX = MW / 2;
    towerZ = MH / 2;
    towerMesh = null;
  }
});

// client/weapons-view.js
import * as THREE6 from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
function getVmGroup() {
  return vmGroup;
}
function buildViewmodel(type) {
  if (vmGroup) {
    vmScene.remove(vmGroup);
  }
  vmGroup = new THREE6.Group();
  const dark = new THREE6.MeshBasicMaterial({ color: 4473924 });
  const metal = new THREE6.MeshBasicMaterial({ color: 10066329 });
  const wood = new THREE6.MeshBasicMaterial({ color: 9132587 });
  const olive = new THREE6.MeshBasicMaterial({ color: 5597999 });
  const black = new THREE6.MeshBasicMaterial({ color: 2236962 });
  if (type === "normal") {
    const slide = new THREE6.Mesh(new THREE6.BoxGeometry(1.8, 1.5, 6), dark);
    slide.position.set(0, 0, -3);
    vmGroup.add(slide);
    const barrel = new THREE6.Mesh(new THREE6.CylinderGeometry(0.35, 0.35, 3, 6), metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.2, -6.5);
    vmGroup.add(barrel);
    const grip = new THREE6.Mesh(new THREE6.BoxGeometry(1.5, 3.5, 1.8), dark);
    grip.rotation.x = 0.2;
    grip.position.set(0, -2.5, -1);
    vmGroup.add(grip);
    const mag = new THREE6.Mesh(new THREE6.BoxGeometry(1, 2.5, 1.2), new THREE6.MeshBasicMaterial({ color: 3355443 }));
    mag.position.set(0, -3.5, -1);
    vmGroup.add(mag);
    const trigger = new THREE6.Mesh(new THREE6.BoxGeometry(0.3, 1, 0.8), metal);
    trigger.position.set(0, -1.2, -1.5);
    vmGroup.add(trigger);
    const sight = new THREE6.Mesh(new THREE6.BoxGeometry(0.4, 0.5, 0.4), metal);
    sight.position.set(0, 1, -5);
    vmGroup.add(sight);
  } else if (type === "shotgun") {
    const barrel = new THREE6.Mesh(new THREE6.CylinderGeometry(0.7, 0.7, 18, 8), dark);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.3, -10);
    vmGroup.add(barrel);
    const tubeMag = new THREE6.Mesh(new THREE6.CylinderGeometry(0.6, 0.6, 14, 8), dark);
    tubeMag.rotation.x = Math.PI / 2;
    tubeMag.position.set(0, -0.7, -8);
    vmGroup.add(tubeMag);
    const receiver = new THREE6.Mesh(new THREE6.BoxGeometry(2.2, 2.5, 5), black);
    receiver.position.set(0, -0.3, -2);
    vmGroup.add(receiver);
    const forend = new THREE6.Mesh(new THREE6.BoxGeometry(2, 1.8, 5), dark);
    forend.position.set(0, -0.5, -6);
    vmGroup.add(forend);
    const grip = new THREE6.Mesh(new THREE6.BoxGeometry(1.5, 3.5, 1.5), black);
    grip.rotation.x = 0.3;
    grip.position.set(0, -2.5, 0);
    vmGroup.add(grip);
    const stock = new THREE6.Mesh(new THREE6.CylinderGeometry(0.5, 0.5, 6, 6), metal);
    stock.rotation.x = Math.PI / 2;
    stock.position.set(0, -0.3, 3.5);
    vmGroup.add(stock);
    const buttpad = new THREE6.Mesh(new THREE6.BoxGeometry(2, 2.5, 0.8), dark);
    buttpad.position.set(0, -0.3, 6.5);
    vmGroup.add(buttpad);
  } else if (type === "burst") {
    const loader = new FBXLoader();
    loader.load("models/M16_ps1.fbx", (fbx) => {
      fbx.scale.set(0.08, 0.08, 0.08);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      fbx.position.set(0, -8, -7);
      const grayMat = new THREE6.MeshBasicMaterial({ color: 1710618 });
      fbx.traverse((c) => {
        if (c.isMesh) c.material = grayMat;
      });
      vmGroup.add(fbx);
    }, void 0, () => {
      const barrel = new THREE6.Mesh(new THREE6.CylinderGeometry(0.4, 0.4, 14, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.2, -8);
      vmGroup.add(barrel);
      const body = new THREE6.Mesh(new THREE6.BoxGeometry(2, 2, 8), dark);
      body.position.set(0, -0.2, -3);
      vmGroup.add(body);
    });
  } else if (type === "bolty") {
    const loader2 = new FBXLoader();
    loader2.load("models/Sniper.fbx", (fbx) => {
      fbx.scale.set(0.06, 0.06, 0.06);
      fbx.rotation.set(Math.PI, Math.PI, Math.PI);
      fbx.position.set(6, -8, -7);
      fbx.traverse((c) => {
        if (c.isMesh) {
          c.material = new THREE6.ShaderMaterial({
            vertexShader: "varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
            fragmentShader: "varying vec3 vPos;void main(){float t=clamp((vPos.y+20.0)/40.0,0.0,1.0);vec3 col=mix(vec3(0.2,0.27,0.12),vec3(0.15,0.2,0.08),t);gl_FragColor=vec4(col,1.0);}"
          });
        }
      });
      vmGroup.add(fbx);
    }, void 0, () => {
      const barrel = new THREE6.Mesh(new THREE6.CylinderGeometry(0.5, 0.5, 22, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0, -12);
      vmGroup.add(barrel);
      const stock = new THREE6.Mesh(new THREE6.BoxGeometry(2, 2, 12), wood);
      stock.position.set(0, -0.5, 0);
      vmGroup.add(stock);
    });
  } else if (type === "cowtank") {
    const outerTube = new THREE6.Mesh(new THREE6.CylinderGeometry(2.2, 2.2, 16, 10), olive);
    outerTube.rotation.x = Math.PI / 2;
    outerTube.position.set(0, 0, -8);
    vmGroup.add(outerTube);
    const innerTube = new THREE6.Mesh(new THREE6.CylinderGeometry(1.8, 1.8, 8, 10), new THREE6.MeshBasicMaterial({ color: 3820074 }));
    innerTube.rotation.x = Math.PI / 2;
    innerTube.position.set(0, 0, -14);
    vmGroup.add(innerTube);
    const fSight = new THREE6.Mesh(new THREE6.BoxGeometry(0.5, 2, 0.5), metal);
    fSight.position.set(0, 2.8, -16);
    vmGroup.add(fSight);
    const rSight = new THREE6.Mesh(new THREE6.BoxGeometry(0.5, 1.5, 0.5), metal);
    rSight.position.set(0, 2.5, -1);
    vmGroup.add(rSight);
    const trigGuard = new THREE6.Mesh(new THREE6.BoxGeometry(1.5, 3, 2), dark);
    trigGuard.position.set(0, -2.5, -3);
    vmGroup.add(trigGuard);
    const band1 = new THREE6.Mesh(new THREE6.CylinderGeometry(2.4, 2.4, 0.5, 10), new THREE6.MeshBasicMaterial({ color: 16768256 }));
    band1.rotation.x = Math.PI / 2;
    band1.position.set(0, 0, -4);
    vmGroup.add(band1);
  }
  vmGroup.position.set(2, -3, -5);
  vmGroup.rotation.set(0, 0.05, 0);
  vmScene.add(vmGroup);
  vmType = type;
}
function updateViewmodel() {
  const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
  const wep = me && me.alive ? me.weapon || "normal" : "normal";
  if (wep !== vmType) buildViewmodel(wep);
  if (vmGroup) {
    const moving = me && me.alive && (state_default.keys["KeyW"] || state_default.keys["KeyS"] || state_default.keys["KeyA"] || state_default.keys["KeyD"]);
    const t = performance.now() / 1e3;
    vmGroup.position.y = -4 + (moving ? Math.sin(t * 8) * 0.5 : 0);
    vmGroup.position.x = 4 + (moving ? Math.cos(t * 6) * 0.3 : 0);
  }
}
var vmGroup, vmType;
var init_weapons_view = __esm({
  "client/weapons-view.js"() {
    init_state();
    init_renderer();
    vmGroup = null;
    vmType = "normal";
  }
});

// client/pickups.js
import * as THREE7 from "three";
import { FBXLoader as FBXLoader2 } from "three/addons/loaders/FBXLoader.js";
function updatePickups(time) {
  if (!window._armorMeshes) window._armorMeshes = {};
  if (!window._armorPickupData) window._armorPickupData = [];
  const seenArmor = /* @__PURE__ */ new Set();
  for (const a of window._armorPickupData) {
    const aid = String(a.id);
    seenArmor.add(aid);
    if (!window._armorMeshes[aid]) {
      const m = new THREE7.Mesh(new THREE7.OctahedronGeometry(8, 0), new THREE7.MeshBasicMaterial({ color: 5605631 }));
      const glow = new THREE7.Mesh(new THREE7.OctahedronGeometry(12, 0), new THREE7.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.2 }));
      m.add(glow);
      m.position.set(a.x, getTerrainHeight(a.x, a.y) + 15, a.y);
      scene.add(m);
      window._armorMeshes[aid] = m;
    }
    window._armorMeshes[aid].rotation.y = time * 2;
    window._armorMeshes[aid].position.y = getTerrainHeight(a.x, a.y) + 15 + Math.sin(time * 3) * 3;
  }
  for (const id in window._armorMeshes) {
    if (!seenArmor.has(id)) {
      const m = window._armorMeshes[id];
      scene.remove(m);
      m.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      delete window._armorMeshes[id];
    }
  }
  if (!window._wpMeshes) window._wpMeshes = {};
  function buildWeaponPickupModel(type) {
    const g = new THREE7.Group();
    const dark = new THREE7.MeshLambertMaterial({ color: 4473924 });
    const metal = new THREE7.MeshLambertMaterial({ color: 10066329 });
    const olive = new THREE7.MeshLambertMaterial({ color: 5597999 });
    const black = new THREE7.MeshLambertMaterial({ color: 2236962 });
    const wood = new THREE7.MeshLambertMaterial({ color: 9132587 });
    if (type === "shotgun") {
      const barrel = new THREE7.Mesh(new THREE7.CylinderGeometry(0.5, 0.5, 14, 6), dark);
      barrel.rotation.z = Math.PI / 2;
      g.add(barrel);
      const body = new THREE7.Mesh(new THREE7.BoxGeometry(4, 2, 1.5), black);
      body.position.x = -2;
      g.add(body);
      const stock = new THREE7.Mesh(new THREE7.BoxGeometry(4, 1.5, 1.2), wood);
      stock.position.x = -6;
      g.add(stock);
    } else if (type === "burst") {
      const loader = new FBXLoader2();
      loader.load("models/M16_ps1.fbx", (fbx) => {
        fbx.scale.set(0.05, 0.05, 0.05);
        fbx.rotation.set(0, -Math.PI / 2, 0);
        const grayMat = new THREE7.MeshBasicMaterial({ color: 1710618 });
        fbx.traverse((c) => {
          if (c.isMesh) c.material = grayMat;
        });
        g.add(fbx);
      }, void 0, () => {
        const barrel = new THREE7.Mesh(new THREE7.CylinderGeometry(0.3, 0.3, 10, 6), dark);
        barrel.rotation.z = Math.PI / 2;
        g.add(barrel);
        const body = new THREE7.Mesh(new THREE7.BoxGeometry(6, 2, 1.5), new THREE7.MeshLambertMaterial({ color: 1710618 }));
        body.position.x = -1;
        g.add(body);
      });
    } else if (type === "bolty") {
      const loader = new FBXLoader2();
      loader.load("models/Sniper.fbx", (fbx) => {
        fbx.scale.set(0.0175, 0.0175, 0.0175);
        fbx.rotation.set(Math.PI, Math.PI, Math.PI);
        fbx.traverse((c) => {
          if (c.isMesh) c.material = new THREE7.MeshBasicMaterial({ color: 2767402 });
        });
        g.add(fbx);
      }, void 0, () => {
        const barrel = new THREE7.Mesh(new THREE7.CylinderGeometry(0.4, 0.4, 16, 6), new THREE7.MeshLambertMaterial({ color: 2767402 }));
        barrel.rotation.z = Math.PI / 2;
        g.add(barrel);
        const scope = new THREE7.Mesh(new THREE7.CylinderGeometry(0.8, 0.8, 4, 6), dark);
        scope.rotation.z = Math.PI / 2;
        scope.position.set(-1, 1.5, 0);
        g.add(scope);
      });
    } else if (type === "cowtank") {
      const tube = new THREE7.Mesh(new THREE7.CylinderGeometry(1.5, 1.5, 12, 8), olive);
      tube.rotation.z = Math.PI / 2;
      g.add(tube);
      const sight = new THREE7.Mesh(new THREE7.BoxGeometry(0.4, 1.5, 0.4), metal);
      sight.position.set(5, 2, 0);
      g.add(sight);
      const band = new THREE7.Mesh(new THREE7.CylinderGeometry(1.7, 1.7, 0.5, 8), new THREE7.MeshLambertMaterial({ color: 16768256 }));
      band.rotation.z = Math.PI / 2;
      band.position.x = -2;
      g.add(band);
    }
    return g;
  }
  const seenWp = /* @__PURE__ */ new Set();
  for (const w of state_default.clientWeapons) {
    const wid = String(w.id);
    seenWp.add(wid);
    if (!window._wpMeshes[wid]) {
      const g = new THREE7.Group();
      const model = buildWeaponPickupModel(w.weapon);
      model.scale.set(1.5, 1.5, 1.5);
      model.position.y = 15;
      g.add(model);
      const glow = new THREE7.Mesh(new THREE7.SphereGeometry(12, 8, 8), new THREE7.MeshBasicMaterial({ color: WPCOL[w.weapon] || 16755200, transparent: true, opacity: 0.15 }));
      glow.position.y = 15;
      g.add(glow);
      const lc = document.createElement("canvas");
      lc.width = 128;
      lc.height = 32;
      const lctx = lc.getContext("2d");
      lctx.font = "bold 20px Segoe UI";
      lctx.textAlign = "center";
      const _wpLabels = { shotgun: "BENELLI", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW" };
      lctx.fillStyle = "#fff";
      lctx.fillText(_wpLabels[w.weapon] || w.weapon.toUpperCase(), 64, 22);
      const ltex = new THREE7.CanvasTexture(lc);
      ltex.minFilter = THREE7.LinearFilter;
      const ls = new THREE7.Sprite(new THREE7.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
      ls.position.set(0, 28, 0);
      ls.scale.set(30, 8, 1);
      g.add(ls);
      g.position.set(w.x, getTerrainHeight(w.x, w.y), w.y);
      scene.add(g);
      window._wpMeshes[wid] = g;
    }
    window._wpMeshes[wid].children[0].rotation.y = time * 2;
    window._wpMeshes[wid].children[0].position.y = 15 + Math.sin(time * 3 + w.x) * 3;
  }
  for (const id in window._wpMeshes) {
    if (!seenWp.has(id)) {
      const g = window._wpMeshes[id];
      scene.remove(g);
      g.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          if (c.material.map) c.material.map.dispose();
          c.material.dispose();
        }
      });
      delete window._wpMeshes[id];
    }
  }
  if (!window._foodMeshes) window._foodMeshes = {};
  function buildFoodModel(type, golden) {
    const g = new THREE7.Group();
    if (golden) {
      const star = new THREE7.Mesh(new THREE7.OctahedronGeometry(6, 0), new THREE7.MeshLambertMaterial({ color: 16768256 }));
      const glow = new THREE7.Mesh(new THREE7.SphereGeometry(9, 6, 6), new THREE7.MeshBasicMaterial({ color: 16768256, transparent: true, opacity: 0.2 }));
      g.add(star);
      g.add(glow);
    } else if (type === "strawberry") {
      const body = new THREE7.Mesh(new THREE7.ConeGeometry(3.5, 7, 6), new THREE7.MeshLambertMaterial({ color: 16720452 }));
      body.rotation.x = Math.PI;
      body.position.y = 3.5;
      g.add(body);
      const leaf = new THREE7.Mesh(new THREE7.ConeGeometry(4, 2, 4), new THREE7.MeshLambertMaterial({ color: 2271778 }));
      leaf.position.y = 7.5;
      g.add(leaf);
    } else if (type === "cake") {
      const base = new THREE7.Mesh(new THREE7.CylinderGeometry(4, 4, 5, 8), new THREE7.MeshLambertMaterial({ color: 16764040 }));
      base.position.y = 2.5;
      g.add(base);
      const frosting = new THREE7.Mesh(new THREE7.CylinderGeometry(4.2, 4.2, 1.5, 8), new THREE7.MeshLambertMaterial({ color: 16746666 }));
      frosting.position.y = 5.5;
      g.add(frosting);
      const cherry = new THREE7.Mesh(new THREE7.SphereGeometry(1, 6, 6), new THREE7.MeshLambertMaterial({ color: 16711680 }));
      cherry.position.y = 7;
      g.add(cherry);
    } else if (type === "pizza") {
      const slice = new THREE7.Mesh(new THREE7.ConeGeometry(5, 1.5, 3), new THREE7.MeshLambertMaterial({ color: 16763972 }));
      slice.rotation.x = Math.PI / 2;
      slice.position.y = 3;
      g.add(slice);
      const pep1 = new THREE7.Mesh(new THREE7.CylinderGeometry(1, 1, 0.5, 6), new THREE7.MeshLambertMaterial({ color: 13378048 }));
      pep1.position.set(0, 3.8, -1);
      g.add(pep1);
      const pep2 = new THREE7.Mesh(new THREE7.CylinderGeometry(0.8, 0.8, 0.5, 6), new THREE7.MeshLambertMaterial({ color: 13378048 }));
      pep2.position.set(1.5, 3.8, 1);
      g.add(pep2);
    } else if (type === "icecream") {
      const cone = new THREE7.Mesh(new THREE7.ConeGeometry(3, 6, 6), new THREE7.MeshLambertMaterial({ color: 14527061 }));
      cone.rotation.x = Math.PI;
      cone.position.y = 3;
      g.add(cone);
      const scoop = new THREE7.Mesh(new THREE7.SphereGeometry(3.5, 6, 6), new THREE7.MeshLambertMaterial({ color: 16772829 }));
      scoop.position.y = 6.5;
      g.add(scoop);
      const scoop2 = new THREE7.Mesh(new THREE7.SphereGeometry(3, 6, 6), new THREE7.MeshLambertMaterial({ color: 16746666 }));
      scoop2.position.y = 9.5;
      g.add(scoop2);
    } else if (type === "donut") {
      const ring = new THREE7.Mesh(new THREE7.TorusGeometry(3, 1.5, 6, 12), new THREE7.MeshLambertMaterial({ color: 14527078 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 4;
      g.add(ring);
      const glaze = new THREE7.Mesh(new THREE7.TorusGeometry(3, 1.6, 6, 12), new THREE7.MeshLambertMaterial({ color: 16737962 }));
      glaze.rotation.x = Math.PI / 2;
      glaze.position.y = 4.5;
      glaze.scale.set(1, 1, 0.3);
      g.add(glaze);
    } else if (type === "cupcake") {
      const wrapper = new THREE7.Mesh(new THREE7.CylinderGeometry(3, 2.5, 4, 8), new THREE7.MeshLambertMaterial({ color: 16755268 }));
      wrapper.position.y = 2;
      g.add(wrapper);
      const swirl = new THREE7.Mesh(new THREE7.ConeGeometry(3.5, 5, 8), new THREE7.MeshLambertMaterial({ color: 16746700 }));
      swirl.position.y = 6.5;
      g.add(swirl);
    } else if (type === "cookie") {
      const disk = new THREE7.Mesh(new THREE7.CylinderGeometry(3.5, 3.5, 1.5, 8), new THREE7.MeshLambertMaterial({ color: 13404211 }));
      disk.position.y = 3;
      g.add(disk);
      for (let i = 0; i < 4; i++) {
        const chip = new THREE7.Mesh(new THREE7.SphereGeometry(0.6, 4, 4), new THREE7.MeshLambertMaterial({ color: 4465152 }));
        chip.position.set(Math.cos(i * 1.6) * 2, 4, Math.sin(i * 1.6) * 2);
        g.add(chip);
      }
    } else {
      const m = new THREE7.Mesh(new THREE7.SphereGeometry(4, 6, 6), new THREE7.MeshLambertMaterial({ color: 16724821 }));
      m.position.y = 4;
      g.add(m);
    }
    return g;
  }
  const seenFood = /* @__PURE__ */ new Set();
  for (const f of state_default.serverFoods) {
    const fid = String(f.id);
    seenFood.add(fid);
    if (!window._foodMeshes[fid]) {
      const m = buildFoodModel(f.type, f.golden);
      m.scale.set(2, 2, 2);
      m.position.set(f.x, getTerrainHeight(f.x, f.y) + 12, f.y);
      scene.add(m);
      window._foodMeshes[fid] = m;
    }
    const fm = window._foodMeshes[fid];
    fm.position.y = getTerrainHeight(f.x, f.y) + 12 + Math.sin(time * 2 + f.x * 0.01) * 3;
    fm.rotation.y = time * 1.5;
  }
  for (const id in window._foodMeshes) {
    if (!seenFood.has(id)) {
      const m = window._foodMeshes[id];
      scene.remove(m);
      m.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      delete window._foodMeshes[id];
    }
  }
}
var init_pickups = __esm({
  "client/pickups.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
  }
});

// client/projectiles.js
import * as THREE8 from "three";
function clearRocketSounds() {
  for (const id in rocketSounds) {
    try {
      rocketSounds[id].osc.stop();
      rocketSounds[id].osc.disconnect();
      rocketSounds[id].gain.disconnect();
    } catch (e) {
    }
    delete rocketSounds[id];
  }
}
function clearSmokeParticles() {
  for (const sp of smokeParticles) {
    scene.remove(sp.mesh);
    sp.mesh.geometry.dispose();
    sp.mesh.material.dispose();
  }
  smokeParticles.length = 0;
}
function updateProjectiles(dt) {
  for (const p of state_default.projData) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.vy3d !== void 0) {
      p.y3d += p.vy3d * dt;
      if (p.y3d < 1) p.y3d = 1;
    }
    if (!state_default.projMeshes[p.id]) {
      const sz = p.cowtank ? 2 : p.bolty ? 1.5 : 0.75;
      const col = p.cowtank ? 16737792 : 16777215;
      const m = new THREE8.Mesh(new THREE8.SphereGeometry(sz, 6, 6), new THREE8.MeshBasicMaterial({ color: col }));
      const glow = new THREE8.Mesh(new THREE8.SphereGeometry(sz * 2, 6, 6), new THREE8.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3 }));
      m.add(glow);
      scene.add(m);
      state_default.projMeshes[p.id] = m;
      if (p.cowtank && getAudioCtx() && Object.keys(rocketSounds).length < 3) {
        const actx2 = getAudioCtx();
        const o = actx2.createOscillator(), g = actx2.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(600, actx2.currentTime);
        o.frequency.linearRampToValueAtTime(900, actx2.currentTime + 2);
        const v = 0.04 * (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5);
        g.gain.setValueAtTime(v, actx2.currentTime);
        o.connect(g);
        g.connect(actx2.destination);
        o.start();
        rocketSounds[p.id] = { osc: o, gain: g };
      }
    }
    if (p.cowtank && state_default.projMeshes[p.id] && Math.random() < 0.6) {
      if (smokeParticles.length >= 50) {
        const old = smokeParticles.shift();
        scene.remove(old.mesh);
        old.mesh.geometry.dispose();
        old.mesh.material.dispose();
      }
      const sm = new THREE8.Mesh(
        new THREE8.SphereGeometry(2 + Math.random() * 3, 4, 4),
        new THREE8.MeshBasicMaterial({ color: 8947848, transparent: true, opacity: 0.5 })
      );
      const pos = state_default.projMeshes[p.id].position;
      sm.position.set(pos.x + (Math.random() - 0.5) * 4, pos.y + (Math.random() - 0.5) * 4, pos.z + (Math.random() - 0.5) * 4);
      scene.add(sm);
      smokeParticles.push({ mesh: sm, life: 0.6 });
    }
    const terrH = getTerrainHeight(p.x, p.y);
    if (p.y3d < terrH + 1) p.y3d = terrH + 1;
    if (!p.bolty && p.y3d < terrH + 56) {
      for (const b of state_default.barricades) {
        const dxB = p.x - b.cx, dyB = p.y - b.cy;
        const cosA = Math.cos(b.angle), sinA = Math.sin(b.angle);
        const lx = cosA * dxB + sinA * dyB;
        const ly = -sinA * dxB + cosA * dyB;
        if (Math.abs(lx) < b.h / 2 && Math.abs(ly) < b.w / 2) {
          p.y3d = -999;
          break;
        }
      }
    }
    state_default.projMeshes[p.id].position.set(p.x, p.y3d, p.y);
  }
  state_default.projData = state_default.projData.filter((p) => {
    if (p.y3d === -999 || p.x < -100 || p.x > MW + 100 || p.y < -100 || p.y > MH + 100) {
      if (state_default.projMeshes[p.id]) {
        const pm = state_default.projMeshes[p.id];
        scene.remove(pm);
        pm.traverse((c) => {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
        delete state_default.projMeshes[p.id];
      }
      if (rocketSounds[p.id]) {
        try {
          rocketSounds[p.id].osc.stop();
        } catch (e) {
        }
        delete rocketSounds[p.id];
      }
      return false;
    }
    return true;
  });
  for (const id in rocketSounds) {
    if (!state_default.projMeshes[id]) {
      try {
        rocketSounds[id].osc.stop();
      } catch (e) {
      }
      delete rocketSounds[id];
    }
  }
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    const sp = smokeParticles[i];
    sp.life -= dt;
    sp.mesh.material.opacity = Math.max(0, sp.life);
    sp.mesh.scale.multiplyScalar(1 + dt * 2);
    sp.mesh.position.y += dt * 10;
    if (sp.life <= 0) {
      scene.remove(sp.mesh);
      sp.mesh.geometry.dispose();
      sp.mesh.material.dispose();
      smokeParticles.splice(i, 1);
    }
  }
}
var smokeParticles, rocketSounds;
var init_projectiles = __esm({
  "client/projectiles.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    init_audio();
    smokeParticles = [];
    rocketSounds = {};
  }
});

// client/zone.js
import * as THREE9 from "three";
function updateZone() {
  const z = state_default.serverZone;
  _zoneMeshes.forEach((m) => scene.remove(m));
  _zoneMeshes = [];
  if (z.w >= MW - 10 && z.h >= MH - 10) return;
  const wallH = 220;
  const wallBottom = -60;
  const mat = new THREE9.MeshBasicMaterial({ color: 16711680, transparent: true, opacity: 0.15, side: THREE9.DoubleSide });
  const n = new THREE9.Mesh(new THREE9.PlaneGeometry(z.w, wallH), mat);
  n.position.set(z.x + z.w / 2, wallBottom + wallH / 2, z.y);
  scene.add(n);
  _zoneMeshes.push(n);
  const s = new THREE9.Mesh(new THREE9.PlaneGeometry(z.w, wallH), mat);
  s.position.set(z.x + z.w / 2, wallBottom + wallH / 2, z.y + z.h);
  scene.add(s);
  _zoneMeshes.push(s);
  const w = new THREE9.Mesh(new THREE9.PlaneGeometry(z.h, wallH), mat);
  w.position.set(z.x, wallBottom + wallH / 2, z.y + z.h / 2);
  w.rotation.y = Math.PI / 2;
  scene.add(w);
  _zoneMeshes.push(w);
  const e = new THREE9.Mesh(new THREE9.PlaneGeometry(z.h, wallH), mat);
  e.position.set(z.x + z.w, wallBottom + wallH / 2, z.y + z.h / 2);
  e.rotation.y = Math.PI / 2;
  scene.add(e);
  _zoneMeshes.push(e);
  const gmat = new THREE9.MeshBasicMaterial({ color: 16711680, transparent: true, opacity: 0.1, side: THREE9.DoubleSide });
  if (z.y > 10) {
    const g = new THREE9.Mesh(new THREE9.PlaneGeometry(MW, z.y), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(MW / 2, 1, z.y / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
  if (z.y + z.h < MH - 10) {
    const g = new THREE9.Mesh(new THREE9.PlaneGeometry(MW, MH - z.y - z.h), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(MW / 2, 1, (z.y + z.h + MH) / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
  if (z.x > 10) {
    const g = new THREE9.Mesh(new THREE9.PlaneGeometry(z.x, z.h), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(z.x / 2, 1, z.y + z.h / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
  if (z.x + z.w < MW - 10) {
    const g = new THREE9.Mesh(new THREE9.PlaneGeometry(MW - z.x - z.w, z.h), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set((z.x + z.w + MW) / 2, 1, z.y + z.h / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
}
var _zoneMeshes;
var init_zone = __esm({
  "client/zone.js"() {
    init_config();
    init_state();
    init_renderer();
    _zoneMeshes = [];
  }
});

// client/hud.js
function updateHud(me, time, dt) {
  state_default.fpsFrames++;
  const fpsNow = performance.now();
  if (fpsNow - state_default.fpsLast >= 1e3) {
    state_default.fpsDisplay = state_default.fpsFrames;
    state_default.fpsFrames = 0;
    state_default.fpsLast = fpsNow;
  }
  document.getElementById("fpsCounter").textContent = state_default.fpsDisplay + "fps | " + Math.round(state_default.pingVal) + "ms";
  const aliveHud = me && me.alive;
  const aliveDisp = aliveHud ? "" : "none";
  ["weapon", "hunger", "xpBar", "dashBar", "atkBar", "crosshair", "barricadeBar", "barricadeLabel"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = aliveDisp;
  });
  if (!me) return;
  const hPct = Math.max(0, me.hunger / 100);
  document.getElementById("hungerFill").style.width = hPct * 100 + "%";
  document.getElementById("hungerFill").style.background = hPct > 0.5 ? "#ffffff" : hPct > 0.25 ? "#dddddd" : "#ff4444";
  document.getElementById("hungerTxt").textContent = "MILK " + Math.ceil(me.hunger) + "%";
  const wep = me.weapon || "normal";
  const wepNames = { shotgun: "Benelli", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW", normal: "Spit" };
  let ammoTxt = "";
  let reloadBlock = "";
  if (me.ammo >= 0) {
    const baseMag = { normal: 15, burst: 30, shotgun: 6, bolty: 5 }[wep] || 0;
    const maxMag = Math.ceil(baseMag * (me.extMagMult || 1));
    ammoTxt = " " + me.ammo + "/" + maxMag;
    if (me.reloading) {
      if (!state_default._reloadStart) {
        state_default._reloadStart = performance.now();
        const RELOAD_MS = { burst: 2e3, bolty: 2500, normal: 2e3 };
        if (wep === "shotgun") state_default._reloadDuration = Math.max(750, (maxMag - me.ammo) * 750);
        else state_default._reloadDuration = RELOAD_MS[wep] || 2e3;
      }
      const elapsed = performance.now() - state_default._reloadStart;
      const pct = Math.min(100, elapsed / state_default._reloadDuration * 100);
      reloadBlock = '<div style="color:#ffaa44;font-size:0.35em;margin-bottom:4px;line-height:1">RELOADING...</div><div style="width:260px;height:10px;background:rgba(0,0,0,0.6);border-radius:3px;margin:0 0 8px auto"><div style="height:100%;border-radius:3px;background:#ffaa44;width:' + pct + '%"></div></div>';
    } else {
      state_default._reloadStart = null;
      state_default._reloadDuration = null;
    }
  }
  document.getElementById("weapon").innerHTML = reloadBlock + (wepNames[wep] || wep) + (me.weaponLevel > 0 ? " Lv" + (me.weaponLevel + 1) : "") + ammoTxt;
  const armorVal = me.armor || 0;
  document.getElementById("armorBar").style.display = aliveHud && armorVal > 0 ? "block" : "none";
  document.getElementById("armorFill").style.width = Math.min(100, armorVal) + "%";
  document.getElementById("armorTxt").textContent = "SHIELD " + Math.ceil(armorVal);
  const xpPct = me.xpToNext > 0 ? Math.max(0, Math.min(100, (me.xp || 0) / (me.xpToNext || 50) * 100)) : 0;
  document.getElementById("xpFill").style.width = xpPct + "%";
  document.getElementById("xpTxt").textContent = "LV" + (me.level || 0) + " " + Math.floor(me.xp || 0) + "/" + (me.xpToNext || 50) + " XP";
  document.getElementById("lowHealthOverlay").style.display = me.hunger < 30 ? "block" : "none";
  document.getElementById("lowHealthOverlay").style.opacity = me.hunger < 30 ? Math.min(1, (30 - me.hunger) / 30 * (0.5 + Math.sin(time * 4) * 0.2)) : "0";
  const spawnEl = document.getElementById("spawnProtOverlay");
  if (spawnEl) {
    spawnEl.style.display = me.spawnProt ? "block" : "none";
    if (me.spawnProt) spawnEl.style.opacity = 0.3 + Math.sin(time * 6) * 0.1;
  }
  const dashFill = document.getElementById("dashFill");
  if (dashFill) {
    const dashMax = 3 * (me.dashCdMult || 1);
    const dashPct = me.dashCooldown > 0 ? Math.min(100, me.dashCooldown / dashMax * 100) : 0;
    dashFill.style.width = 100 - dashPct + "%";
    dashFill.style.background = dashPct > 0 ? "#225588" : "#44aaff";
  }
  const barrFill = document.getElementById("barricadeFill");
  if (barrFill) {
    const nowMs = performance.now();
    const remaining = Math.max(0, state_default.barricadeReadyAt - nowMs);
    const pct = remaining > 0 ? 100 - Math.min(100, remaining / 5e3 * 100) : 100;
    barrFill.style.width = pct + "%";
    barrFill.style.background = remaining > 0 ? "#663322" : "#aa6633";
  }
  const atkFill = document.getElementById("atkFill");
  if (atkFill) {
    if (me.attackCooldown > (state_default._atkCdMax || 0)) state_default._atkCdMax = me.attackCooldown;
    if (me.attackCooldown <= 0) state_default._atkCdMax = 0;
    const atkMax = state_default._atkCdMax || 1;
    const atkPct = me.attackCooldown > 0 ? Math.min(100, me.attackCooldown / atkMax * 100) : 0;
    atkFill.style.width = 100 - atkPct + "%";
    atkFill.style.background = atkPct > 0 ? "#882222" : "#ff6644";
  }
  const chN = document.getElementById("chN"), chS = document.getElementById("chS"), chE = document.getElementById("chE"), chW = document.getElementById("chW");
  if (chN && aliveHud) {
    const baseSpread = { normal: 4, shotgun: 22, bolty: 2, cowtank: 5, burst: state_default.fireMode === "auto" ? 9 : 4 }[wep] || 4;
    const crouchMult = state_default.crouching ? 0.73 : 1;
    const movingMult = state_default.keys["KeyW"] || state_default.keys["KeyS"] || state_default.keys["KeyA"] || state_default.keys["KeyD"] ? 1.35 : 1;
    const reloadMult = me.reloading ? 1.5 : 1;
    const spread = Math.round(baseSpread * crouchMult * movingMult * reloadMult);
    chN.style.marginTop = -spread - 6 + "px";
    chS.style.marginTop = spread + "px";
    chE.style.marginLeft = spread + "px";
    chW.style.marginLeft = -spread - 6 + "px";
  }
  document.getElementById("score").textContent = me && me.alive ? "Score: " + (me.score || 0) + " | Kills: " + (me.kills || 0) + " | Lv" + (me.level || 0) : "Waiting for next round...";
  const specEl = document.getElementById("spectateMsg");
  if (me && me.alive) {
    specEl.style.display = "none";
  } else {
    specEl.style.display = "block";
    const target = state_default.serverPlayers.find((p) => p.id === state_default.spectateTargetId);
    let html = "";
    if (state_default.killerName) html += '<div style="color:#ff4444;font-size:22px;font-weight:bold;margin-bottom:6px">\u{1F480} KILLED BY ' + state_default.killerName.toUpperCase() + "</div>";
    if (target) {
      html += '<div style="color:#ffdd44;font-size:20px;font-weight:bold">\u{1F441} SPECTATING: ' + target.name + "</div>";
      html += '<div style="font-size:12px;color:#aaccff;margin-top:4px">click / \u2190 \u2192 to switch target</div>';
    } else {
      html += "<div>SPECTATING - waiting for next round</div>";
    }
    specEl.innerHTML = html;
  }
  document.getElementById("playerCount").textContent = "\u{1F404} " + state_default.serverPlayers.filter((p) => p.alive).length + "/" + state_default.serverPlayers.length;
  state_default.killfeed.forEach((k) => k.t -= dt);
  state_default.killfeed = state_default.killfeed.filter((k) => k.t > 0);
  document.getElementById("killfeed").innerHTML = state_default.killfeed.map((k) => '<div style="margin-bottom:3px;opacity:' + Math.min(1, k.t) + '">' + k.txt + "</div>").join("");
  state_default.chatLog.forEach((c) => c.t -= dt);
  state_default.chatLog = state_default.chatLog.filter((c) => c.t > 0);
  const chatEl = document.getElementById("chatLog");
  if (chatEl) {
    const colHex = { pink: "#ff88aa", blue: "#88aaff", green: "#88ff88", gold: "#ffdd44", purple: "#cc88ff", red: "#ff4444", orange: "#ff8844", cyan: "#44ffdd" };
    const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    chatEl.innerHTML = state_default.chatLog.map((c) => {
      const col = colHex[c.color] || "#ff88aa";
      const opacity = Math.min(1, c.t / 3);
      return '<div style="margin-bottom:2px;opacity:' + opacity + '"><span style="color:' + col + ';font-weight:bold">' + escapeHtml(c.name) + ":</span> " + escapeHtml(c.text) + "</div>";
    }).join("");
  }
  let dbg = document.getElementById("debugOverlay");
  if (!dbg && state_default.debugMode) {
    dbg = document.createElement("div");
    dbg.id = "debugOverlay";
    dbg.style.cssText = "position:absolute;top:40px;left:10px;font-size:11px;color:#44ff44;text-shadow:1px 1px #000;font-family:monospace;white-space:pre;z-index:20;pointer-events:none";
    document.getElementById("hud").appendChild(dbg);
  }
  if (dbg) {
    dbg.style.display = state_default.debugMode ? "block" : "none";
    if (state_default.debugMode && me) {
      const yawDeg = (state_default.yaw * 180 / Math.PI % 360).toFixed(1);
      const pitchDeg = (state_default.pitch * 180 / Math.PI).toFixed(1);
      dbg.textContent = "POS: " + me.x.toFixed(0) + ", " + me.y.toFixed(0) + ", " + (me.z || 0).toFixed(1) + "\nAIM: yaw=" + yawDeg + " pitch=" + pitchDeg + "\nWEP: " + (me.weapon || "normal") + " ammo=" + (me.ammo >= 0 ? me.ammo : "\u221E") + (state_default.fireMode ? " [" + state_default.fireMode + "]" : "") + "\nFPS: " + state_default.fpsDisplay + " PING: " + Math.round(state_default.pingVal) + "ms\nPLAYERS: " + state_default.serverPlayers.filter((p) => p.alive).length + "/" + state_default.serverPlayers.length + "\nPROJ: " + state_default.projData.length;
    }
  }
  const mc = document.getElementById("minimap"), mctx = mc.getContext("2d");
  mctx.clearRect(0, 0, 120, 90);
  mctx.fillStyle = "rgba(0,0,0,0.6)";
  mctx.fillRect(0, 0, 120, 90);
  const sx = 120 / MW, sy = 90 / MH;
  for (const p of state_default.serverPlayers) {
    mctx.fillStyle = p.id === state_default.myId ? "#ffdd44" : p.alive ? "#ff88aa" : "#555";
    mctx.fillRect(p.x * sx - 1, p.y * sy - 1, 3, 3);
  }
  mctx.fillStyle = "rgba(255,255,100,0.4)";
  for (const f of state_default.serverFoods) {
    mctx.fillRect(f.x * sx, f.y * sy, 1, 1);
  }
}
var init_hud = __esm({
  "client/hud.js"() {
    init_config();
    init_state();
  }
});

// client/index.js
import * as THREE10 from "three";
var require_index = __commonJS({
  "client/index.js"() {
    init_config();
    init_state();
    init_audio();
    init_renderer();
    init_terrain();
    init_input();
    init_network();
    init_ui();
    init_ui();
    init_entities();
    init_map_objects();
    init_weapons_view();
    init_pickups();
    init_projectiles();
    init_zone();
    init_hud();
    setVmGroupRef(getVmGroup);
    var debrisPool = [];
    function handleMsg(msg) {
      if (msg.type === "joined") {
        state_default.myId = msg.id;
        state_default.myColor = msg.color;
        state_default.state = "lobby";
        state_default.hostId = msg.hostId;
        window.kickPlayer = (id) => {
          send({ type: "kick", targetId: id });
        };
        document.getElementById("joinScreen").querySelector("h2").textContent = "Waiting for cows...";
        document.getElementById("botsCheck").checked = msg.botsEnabled;
        document.getElementById("botsFreeWillCheck").checked = msg.botsFreeWill;
        initAudio();
        startMenuMusic();
      }
      if (msg.type === "newHost") {
        state_default.hostId = msg.hostId;
      }
      if (msg.type === "kicked") {
        document.getElementById("joinScreen").style.display = "flex";
        document.getElementById("joinScreen").querySelector("h2").textContent = "You were kicked from the lobby";
        if (state_default.ws) try {
          state_default.ws.close();
        } catch (e) {
        }
      }
      if (msg.type === "lobby") {
        const cd = msg.countdown > 0 ? " (" + msg.countdown + "s)" : "";
        const readyTxt = msg.allReady ? "All ready! Starting" + cd : "Waiting for cows to ready up";
        if (!state_default._botRevealTime) state_default._botRevealTime = Date.now() + 3e3;
        const botsRevealed = Date.now() > state_default._botRevealTime;
        const colMap = { pink: "#ff88aa", blue: "#88aaff", green: "#88ff88", gold: "#ffdd44", purple: "#cc88ff", red: "#ff4444", orange: "#ff8844", cyan: "#44ffdd" };
        const isHost = state_default.hostId === state_default.myId;
        const pList = msg.players.map((p) => {
          if (p.isBot && !botsRevealed) return '<div style="color:#ff8888;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#555;margin-right:6px;vertical-align:middle"></span><span style="display:inline-block;width:120px;text-align:left">Connecting<span style="display:inline-block;width:18px;text-align:left">' + ".".repeat(1 + Math.floor(Date.now() / 500) % 3) + "</span></span> \u23F3</div>";
          const dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (colMap[p.color] || "#aaa") + ';margin-right:6px;vertical-align:middle"></span>';
          const crown = p.id === state_default.hostId && !p.isBot ? " \u{1F451}" : "";
          const canKick = isHost && !p.isBot && p.id !== state_default.myId;
          const kickBtn = canKick ? ' <span onclick="window.kickPlayer(' + p.id + ')" style="cursor:pointer;color:#ff4444;float:right;font-weight:bold" title="Kick">\u2715</span>' : "";
          return '<div style="color:' + (p.ready ? "#88ff88" : "#ff8888") + ';padding:2px 0">' + dot + (p.name || "?") + crown + (p.isBot ? " \u{1F916}" : p.ready ? " \u2714" : " ...") + kickBtn + "</div>";
        }).join("");
        document.getElementById("joinScreen").querySelector("h2").innerHTML = readyTxt + '<div style="margin-top:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(204,136,255,0.3);border-radius:8px;padding:8px 16px;font-size:13px;max-height:200px;overflow-y:auto;width:260px;text-align:left">' + pList + "</div>";
        if (!document.getElementById("readyBtn")) {
          const rb = document.createElement("button");
          rb.id = "readyBtn";
          rb.textContent = "READY TO GRAZE";
          rb.style.cssText = "padding:8px 30px;font-size:18px;border:none;border-radius:8px;background:#44ff44;color:#000;cursor:pointer;font-weight:bold;margin-top:10px;width:220px";
          rb.onclick = () => {
            send({ type: "ready" });
          };
          document.getElementById("joinScreen").appendChild(rb);
        }
        const me2 = msg.players.find((p) => p.name && state_default.myId && p.id === state_default.myId) || msg.players.find((p) => p.ready !== void 0);
        const rb2 = document.getElementById("readyBtn");
        if (rb2 && state_default.myId) {
          const myLobby = msg.players.find((p) => p.id === state_default.myId);
          if (myLobby) {
            if (myLobby.ready) {
              rb2.textContent = "UNREADY \u2714";
              rb2.style.background = "#88ff88";
            } else {
              rb2.textContent = "READY TO GRAZE";
              rb2.style.background = "#44ff44";
            }
          }
        }
      }
      if (msg.type === "spectate") {
        if (msg.terrainSeed !== void 0) rebuildTerrain(msg.terrainSeed);
        state_default.state = "playing";
        document.getElementById("joinScreen").style.display = "none";
        document.getElementById("hud").style.display = "block";
        state_default.serverPlayers = msg.players;
        state_default.serverFoods = (msg.foods || []).map((f) => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
        if (msg.zone) state_default.serverZone = msg.zone;
        if (msg.map) {
          state_default.mapFeatures = msg.map;
          state_default.mapBuilt = false;
        }
        if (msg.weapons) state_default.clientWeapons = msg.weapons;
        if (msg.armorPickups) window._armorPickupData = msg.armorPickups;
        clearBarricades();
        if (msg.barricades) msg.barricades.forEach((b) => addBarricade(b));
      }
      if (msg.type === "start") {
        if (msg.terrainSeed !== void 0) rebuildTerrain(msg.terrainSeed);
        state_default.state = "playing";
        document.getElementById("joinScreen").style.display = "none";
        document.getElementById("hud").style.display = "block";
        state_default.serverPlayers = msg.players;
        state_default.serverFoods = (msg.foods || []).map((f) => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
        if (msg.zone) state_default.serverZone = msg.zone;
        if (msg.map) {
          state_default.mapFeatures = msg.map;
          state_default.mapBuilt = false;
        }
        if (msg.weapons) state_default.clientWeapons = msg.weapons;
        state_default.killfeed = [];
        stopMenuMusic();
        resetMusic();
        initMusic();
        setMusicPlaying(true);
        state_default.spectateTargetId = null;
        state_default.killerId = null;
        state_default.killerName = null;
        state_default.barricadeReadyAt = 0;
        clearBarricades();
        if (msg.barricades) msg.barricades.forEach((b) => addBarricade(b));
        window._armorPickupData = msg.armorPickups || [];
        document.getElementById("winScreen").style.display = "none";
        for (const id in state_default.cowMeshes) {
          scene.remove(state_default.cowMeshes[id].mesh);
        }
        state_default.cowMeshes = {};
        if (window._foodMeshes) {
          for (const id in window._foodMeshes) {
            const m = window._foodMeshes[id];
            scene.remove(m);
            m.traverse((c) => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) c.material.dispose();
            });
          }
          window._foodMeshes = {};
        }
        if (window._wpMeshes) {
          for (const id in window._wpMeshes) {
            const g = window._wpMeshes[id];
            scene.remove(g);
            g.traverse((c) => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) {
                if (c.material.map) c.material.map.dispose();
                c.material.dispose();
              }
            });
          }
          window._wpMeshes = {};
        }
        if (window._armorMeshes) {
          for (const id in window._armorMeshes) {
            const m = window._armorMeshes[id];
            scene.remove(m);
            m.traverse((c) => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) c.material.dispose();
            });
          }
          window._armorMeshes = {};
        }
        for (const id in state_default.projMeshes) {
          const pm = state_default.projMeshes[id];
          scene.remove(pm);
          pm.traverse((c) => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
          });
        }
        state_default.projMeshes = {};
        state_default.projData = [];
      }
      if (msg.type === "state") {
        state_default.serverPlayers = msg.players;
        if (msg.zone) state_default.serverZone = msg.zone;
        if (state_default.pingLast > 0) {
          const pd = performance.now() - state_default.pingLast;
          if (pd < 2e3) state_default.pingVal = state_default.pingVal * 0.7 + pd * 0.3;
          state_default.pingLast = 0;
        }
      }
      if (msg.type === "food") {
        const f = msg.food || msg;
        state_default.serverFoods.push({ id: f.id, x: f.x, y: f.y, type: f.type || f.typeName });
      }
      if (msg.type === "eat") {
        state_default.serverFoods = state_default.serverFoods.filter((f) => f.id !== msg.foodId);
        spawnParts(msg.playerId);
        if (msg.playerId === state_default.myId) sfxEat();
      }
      if (msg.type === "projectile") {
        let vy3d = msg.vz || 0, spawnH = msg.z || 15 + getTerrainHeight(msg.x, msg.y);
        let spawnX = msg.x, spawnZ = msg.y;
        if (msg.ownerId === state_default.myId) {
          spawnH = cam.position.y;
          spawnX = cam.position.x;
          spawnZ = cam.position.z;
        }
        if (msg.shotgun !== void 0) {
          vy3d += (Math.random() - 0.5) * 150;
        }
        state_default.projData.push({ id: msg.id, x: spawnX, y: spawnZ, vx: msg.vx, vy: msg.vy, color: msg.color || "pink", bolty: msg.bolty, cowtank: msg.cowtank, y3d: spawnH, vy3d });
        if (msg.ownerId !== state_default.myId) {
          const dist = Math.hypot(msg.x - cam.position.x, msg.y - cam.position.z);
          const distVol = Math.max(0.01, 1 / (1 + dist * 5e-3));
          if (msg.bolty) sfx(800, 0.25, "sawtooth", 0.1 * distVol);
          else if (msg.cowtank) sfxRocket(0.12 * distVol);
          else if (msg.shotgun !== void 0) sfxShotgun(0.1 * distVol);
          else if (msg.burst !== void 0) sfxLR(0.1 * distVol);
          else sfx(400, 0.12, "square", 0.08 * distVol);
        }
        if (msg.ownerId === state_default.myId) {
          const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
          const myWep = me ? me.weapon : "normal";
          if (msg.shotgun === false) {
          } else if (myWep === "bolty" || msg.bolty) sfxBolty();
          else if (myWep === "cowtank" || msg.cowtank) sfxRocket(0.12);
          else if (msg.shotgun === true) sfxShotgun(0.1);
          else if (myWep === "shotgun") sfxShotgun(0.1);
          else if (myWep === "burst" || msg.burst !== void 0) sfxLR(0.1);
          else sfxShoot();
          const wep = myWep;
          const recoilPatterns = {
            burst: [
              // LR-300: snake pattern upward
              { p: 0.012, y: 3e-3 },
              { p: 0.014, y: 6e-3 },
              { p: 0.011, y: 4e-3 },
              { p: 0.013, y: -3e-3 },
              { p: 0.015, y: -6e-3 },
              { p: 0.012, y: -4e-3 },
              { p: 0.01, y: 5e-3 },
              { p: 0.014, y: 7e-3 },
              { p: 0.012, y: 3e-3 },
              { p: 0.013, y: -5e-3 },
              { p: 0.016, y: -7e-3 },
              { p: 0.011, y: -3e-3 },
              { p: 0.01, y: 4e-3 },
              { p: 0.013, y: 6e-3 },
              { p: 0.012, y: 2e-3 },
              { p: 0.014, y: -4e-3 },
              { p: 0.015, y: -6e-3 },
              { p: 0.011, y: -2e-3 },
              { p: 0.01, y: 5e-3 },
              { p: 0.013, y: 7e-3 },
              { p: 0.012, y: 3e-3 },
              { p: 0.014, y: -5e-3 },
              { p: 0.016, y: -7e-3 },
              { p: 0.011, y: -3e-3 },
              { p: 0.01, y: 4e-3 },
              { p: 0.013, y: 6e-3 },
              { p: 0.012, y: 2e-3 },
              { p: 0.014, y: -4e-3 },
              { p: 0.015, y: -5e-3 },
              { p: 0.011, y: -2e-3 }
            ],
            shotgun: [
              // Benelli: strong kick up
              { p: 0.06, y: (Math.random() - 0.5) * 0.02 },
              { p: 0.06, y: (Math.random() - 0.5) * 0.02 },
              { p: 0.06, y: (Math.random() - 0.5) * 0.02 },
              { p: 0.06, y: (Math.random() - 0.5) * 0.02 },
              { p: 0.06, y: (Math.random() - 0.5) * 0.02 },
              { p: 0.06, y: (Math.random() - 0.5) * 0.02 }
            ],
            bolty: [
              // L96: big single kick
              { p: 0.05, y: 5e-3 },
              { p: 0.05, y: 5e-3 },
              { p: 0.05, y: 5e-3 },
              { p: 0.05, y: 5e-3 },
              { p: 0.05, y: 5e-3 }
            ],
            cowtank: [
              // M72 LAW: massive kick
              { p: 0.15, y: (Math.random() - 0.5) * 0.03 }
            ],
            normal: [
              // Spit: small kick
              { p: 8e-3, y: (Math.random() - 0.5) * 4e-3 }
            ]
          };
          const pattern = recoilPatterns[wep];
          if (pattern) {
            const now = performance.now();
            if (now - state_default.recoilTimer > 500) state_default.recoilIndex = 0;
            state_default.recoilTimer = now;
            const r = pattern[state_default.recoilIndex % pattern.length];
            const burstMod = wep === "burst" && state_default.fireMode === "burst" ? 0.5 : 1;
            const tacticowMod = me.recoilMult || 1;
            const walkingMod = state_default.crouching ? 0.73 : 1;
            const recoilMult = burstMod * tacticowMod * walkingMod;
            state_default.pitch += r.p * recoilMult;
            state_default.yaw += r.y * recoilMult;
            state_default.pitch = Math.max(-1.2, Math.min(1.2, state_default.pitch));
            state_default.recoilIndex++;
          }
        }
      }
      if (msg.type === "wallImpact") {
        const th = getTerrainHeight(msg.x, msg.y);
        for (let i = 0; i < 5; i++) {
          const sp = new THREE10.Mesh(new THREE10.SphereGeometry(0.8, 3, 3), new THREE10.MeshBasicMaterial({ color: 16768324, transparent: true }));
          sp.position.set(msg.x + (Math.random() - 0.5) * 8, (msg.z || th + 30) + (Math.random() - 0.5) * 8, msg.y + (Math.random() - 0.5) * 8);
          scene.add(sp);
          let sl = 0.4;
          const svx = (Math.random() - 0.5) * 40, svy = (Math.random() - 0.5) * 40, svz = (Math.random() - 0.5) * 40;
          const sAnim = () => {
            sl -= 0.03;
            sp.material.opacity = sl;
            sp.position.x += svx * 0.016;
            sp.position.y += svy * 0.016;
            sp.position.z += svz * 0.016;
            if (sl <= 0) {
              scene.remove(sp);
              sp.geometry.dispose();
              sp.material.dispose();
            } else requestAnimationFrame(sAnim);
          };
          requestAnimationFrame(sAnim);
        }
      }
      if (msg.type === "projectileHit") {
        state_default.projData = state_default.projData.filter((p) => p.id !== msg.projectileId);
        if (state_default.projMeshes[msg.projectileId]) {
          const pm = state_default.projMeshes[msg.projectileId];
          scene.remove(pm);
          pm.traverse((c) => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
          });
          delete state_default.projMeshes[msg.projectileId];
        }
        if (msg.targetId === state_default.myId) {
          sfxHit();
          document.getElementById("hitFlash").style.opacity = "0.5";
          setTimeout(() => document.getElementById("hitFlash").style.opacity = "0", 150);
        }
        if (msg.targetId && msg.ownerId === state_default.myId && msg.targetId !== state_default.myId) {
          sfx(600, 0.06, "square", 0.07);
          const ch = document.getElementById("crosshair");
          if (ch) {
            ch.style.width = "12px";
            ch.style.height = "12px";
            ch.style.background = "transparent";
            ch.style.boxShadow = "none";
            ch.style.border = "2px solid #ffffff";
            ch.style.borderRadius = "0";
            setTimeout(() => {
              ch.style.width = "4px";
              ch.style.height = "4px";
              ch.style.background = "#ff88aa";
              ch.style.boxShadow = "0 0 6px #ff88aa";
              ch.style.border = "none";
              ch.style.borderRadius = "50%";
            }, 150);
          }
        }
        if (msg.headshot && msg.ownerId === state_default.myId) {
          sfx(1200, 0.15, "sine", 0.08);
          sfx(1800, 0.1, "sine", 0.06);
          const ch = document.getElementById("crosshair");
          if (ch) {
            ch.style.width = "20px";
            ch.style.height = "20px";
            ch.style.background = "transparent";
            ch.style.boxShadow = "none";
            ch.style.border = "3px solid #ff2222";
            ch.style.borderRadius = "0";
            setTimeout(() => {
              ch.style.width = "4px";
              ch.style.height = "4px";
              ch.style.background = "#ff88aa";
              ch.style.boxShadow = "0 0 6px #ff88aa";
              ch.style.border = "none";
              ch.style.borderRadius = "50%";
            }, 250);
          }
        }
        if (msg.targetId && msg.dmg) {
          const target = state_default.serverPlayers.find((p) => p.id === msg.targetId);
          if (target) {
            const dmg = msg.dmg;
            const hasShield = target.armor > 0;
            const color = msg.headshot ? "#ff2222" : hasShield ? "#44aaff" : dmg >= 25 ? "#ff4444" : dmg >= 10 ? "#ffaa44" : "#ffffff";
            const nc = document.createElement("canvas");
            nc.width = 128;
            nc.height = 48;
            const ctx = nc.getContext("2d");
            ctx.font = "bold " + (dmg >= 25 ? 36 : dmg >= 10 ? 28 : 22) + "px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillText(dmg, 65, 35);
            ctx.fillStyle = color;
            ctx.fillText(dmg, 64, 34);
            const tex = new THREE10.CanvasTexture(nc);
            tex.minFilter = THREE10.LinearFilter;
            const mat = new THREE10.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
            const sprite = new THREE10.Sprite(mat);
            const tz = target.z !== void 0 ? target.z : getTerrainHeight(target.x, target.y);
            sprite.position.set(target.x + (Math.random() - 0.5) * 20, tz + 40 + Math.random() * 10, target.y + (Math.random() - 0.5) * 20);
            sprite.scale.set(80, 32, 1);
            scene.add(sprite);
            let life = 1.5;
            const vy = 8 + Math.random() * 6;
            const vx = (Math.random() - 0.5) * 15;
            const vz = (Math.random() - 0.5) * 15;
            const anim = () => {
              life -= 0.012;
              mat.opacity = Math.max(0, life);
              sprite.position.y += vy * 0.016;
              sprite.position.x += vx * 0.016;
              sprite.position.z += vz * 0.016;
              if (life <= 0) {
                scene.remove(sprite);
                tex.dispose();
                mat.dispose();
              } else requestAnimationFrame(anim);
            };
            requestAnimationFrame(anim);
            setTimeout(() => {
              try {
                scene.remove(sprite);
                tex.dispose();
                mat.dispose();
              } catch (e) {
              }
            }, 2e3);
          }
        }
      }
      if (msg.type === "explosion") {
        const ex = msg.x, ey = msg.y, er = msg.radius || 120;
        const th = getTerrainHeight(ex, ey);
        const expMat = new THREE10.MeshBasicMaterial({ color: 16737792, transparent: true, opacity: 0.6 });
        const exp = new THREE10.Mesh(new THREE10.SphereGeometry(er * 0.3, 12, 12), expMat);
        exp.position.set(ex, th + 10, ey);
        scene.add(exp);
        let expLife = 0.5;
        const expAnim = () => {
          expLife -= 0.02;
          expMat.opacity = expLife * 0.6;
          exp.scale.multiplyScalar(1.06);
          if (expLife <= 0) {
            scene.remove(exp);
            exp.geometry.dispose();
            expMat.dispose();
          } else requestAnimationFrame(expAnim);
        };
        requestAnimationFrame(expAnim);
        setTimeout(() => {
          try {
            scene.remove(exp);
            exp.geometry.dispose();
            expMat.dispose();
          } catch (e) {
          }
        }, 2e3);
        const ringMat = new THREE10.MeshBasicMaterial({ color: 16755200, transparent: true, opacity: 0.4, side: THREE10.DoubleSide });
        const ring = new THREE10.Mesh(new THREE10.TorusGeometry(er * 0.15, 3, 6, 24), ringMat);
        ring.position.set(ex, th + 5, ey);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        let ringLife = 0.4;
        const ringAnim = () => {
          ringLife -= 0.02;
          ringMat.opacity = ringLife;
          ring.scale.multiplyScalar(1.1);
          if (ringLife <= 0) {
            scene.remove(ring);
            ring.geometry.dispose();
            ringMat.dispose();
          } else requestAnimationFrame(ringAnim);
        };
        requestAnimationFrame(ringAnim);
        setTimeout(() => {
          try {
            scene.remove(ring);
            ring.geometry.dispose();
            ringMat.dispose();
          } catch (e) {
          }
        }, 2e3);
        for (let i = 0; i < 20; i++) {
          let dp;
          if (debrisPool.length > 0) {
            dp = debrisPool.pop();
            dp.material.color.setHex(Math.random() > 0.3 ? 16729088 : 16768256);
            dp.material.opacity = 1;
            dp.scale.set(1, 1, 1);
            dp.visible = true;
          } else {
            const col = Math.random() > 0.3 ? 16729088 : 16768256;
            dp = new THREE10.Mesh(new THREE10.SphereGeometry(1.5 + Math.random() * 2, 4, 4), new THREE10.MeshBasicMaterial({ color: col, transparent: true }));
          }
          const dvx = (Math.random() - 0.5) * 150, dvz = (Math.random() - 0.5) * 150;
          let dvy = 40 + Math.random() * 80;
          dp.position.set(ex, th + 8, ey);
          scene.add(dp);
          let dlife = 0.6 + Math.random() * 0.4;
          const debrisAnim = () => {
            dlife -= 0.02;
            dp.material.opacity = Math.max(0, dlife);
            dp.position.x += dvx * 0.016;
            dp.position.y += dvy * 0.016;
            dp.position.z += dvz * 0.016;
            dvy -= 4;
            dp.scale.multiplyScalar(0.97);
            if (dlife <= 0) {
              scene.remove(dp);
              dp.visible = false;
              if (debrisPool.length > 100) {
                dp.geometry.dispose();
                dp.material.dispose();
              } else {
                debrisPool.push(dp);
              }
            } else requestAnimationFrame(debrisAnim);
          };
          requestAnimationFrame(debrisAnim);
        }
        sfxExplosion(0.15);
      }
      if (msg.type === "eliminated") {
        state_default.killfeed.unshift({ txt: msg.name + " eliminated (#" + (msg.rank || "?") + ")", t: 5 });
        if (state_default.killfeed.length > 5) state_default.killfeed.pop();
        if (msg.playerId === state_default.myId) {
          sfxDeath();
          state_default.perkMenuOpen = false;
          state_default.pendingLevelUps = 0;
          const pm = document.getElementById("perkMenu");
          if (pm) pm.style.display = "none";
          if (state_default.killerId) state_default.spectateTargetId = state_default.killerId;
          else {
            const firstAlive = state_default.serverPlayers.find((p) => p.alive && p.id !== state_default.myId);
            if (firstAlive) state_default.spectateTargetId = firstAlive.id;
          }
        }
      }
      if (msg.type === "chat") {
        state_default.chatLog.push({ name: msg.name, color: msg.color, text: msg.text, t: 10 });
        if (state_default.chatLog.length > 6) state_default.chatLog.shift();
      }
      if (msg.type === "barricadePlaced") {
        addBarricade({ id: msg.id, cx: msg.cx, cy: msg.cy, w: msg.w, h: msg.h, angle: msg.angle });
        if (msg.ownerId === state_default.myId) {
          state_default.barricadeReadyAt = performance.now() + 5e3;
          sfx(200, 0.08, "square", 0.08);
          sfx(150, 0.12, "triangle", 0.06);
        }
      }
      if (msg.type === "barricadeDestroyed") {
        removeBarricade(msg.id);
        sfx(300, 0.08, "square", 0.05);
        sfx(150, 0.15, "sawtooth", 0.04);
      }
      if (msg.type === "kill") {
        state_default.killfeed.unshift({ txt: "\u{1F480} " + (msg.killerName || "?") + " \u2192 " + (msg.victimName || "?"), t: 5 });
        if (state_default.killfeed.length > 5) state_default.killfeed.pop();
        if (msg.victimId === state_default.myId) {
          state_default.killerId = msg.killerId;
          state_default.killerName = msg.killerName;
          state_default.spectateTargetId = msg.killerId;
        }
      }
      if (msg.type === "winner") {
        state_default.killfeed.unshift({ txt: "\u{1F451} " + (msg.name || "?") + " WINS!", t: 10 });
        setMusicPlaying(false);
        const ws2 = document.getElementById("winScreen");
        ws2.style.display = "flex";
        document.getElementById("winName").textContent = (msg.name || "?") + " WINS!";
        document.getElementById("winStats").textContent = "Score: " + (msg.score || 0) + " | Kills: " + (msg.kills || 0);
        document.getElementById("winRestart").textContent = "Next round starting soon...";
        if (getAudioCtx()) {
          const t = getAudioCtx().currentTime;
          const v = 0.08 * (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5);
          const chords = [[82.4, 164.8], [98, 196], [110, 220], [82.4, 164.8], [110, 220], [130.8, 261.6], [164.8, 329.6]];
          chords.forEach((notes, i) => {
            notes.forEach((freq) => {
              const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
              const dist = getAudioCtx().createWaveShaper();
              const curve = new Float32Array(256);
              for (let j = 0; j < 256; j++) {
                const x = j * 2 / 256 - 1;
                curve[j] = Math.tanh(x * 3);
              }
              dist.curve = curve;
              o.type = "sawtooth";
              o.frequency.value = freq;
              g.gain.setValueAtTime(v, t + i * 0.2);
              g.gain.setValueAtTime(v, t + i * 0.2 + 0.15);
              g.gain.exponentialRampToValueAtTime(1e-3, t + i * 0.2 + 0.19);
              o.connect(dist);
              dist.connect(g);
              g.connect(getAudioCtx().destination);
              o.start(t + i * 0.2);
              o.stop(t + i * 0.2 + 0.2);
            });
            const k = getAudioCtx().createOscillator(), kg = getAudioCtx().createGain();
            k.type = "sine";
            k.frequency.setValueAtTime(150, t + i * 0.2);
            k.frequency.exponentialRampToValueAtTime(30, t + i * 0.2 + 0.1);
            kg.gain.setValueAtTime(v * 1.5, t + i * 0.2);
            kg.gain.exponentialRampToValueAtTime(1e-3, t + i * 0.2 + 0.12);
            k.connect(kg);
            kg.connect(getAudioCtx().destination);
            k.start(t + i * 0.2);
            k.stop(t + i * 0.2 + 0.12);
          });
          const finalT = t + chords.length * 0.2;
          [164.8, 220, 329.6].forEach((freq) => {
            const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
            const dist = getAudioCtx().createWaveShaper();
            const curve = new Float32Array(256);
            for (let j = 0; j < 256; j++) {
              const x = j * 2 / 256 - 1;
              curve[j] = Math.tanh(x * 4);
            }
            dist.curve = curve;
            o.type = "sawtooth";
            o.frequency.value = freq;
            g.gain.setValueAtTime(v * 1.2, finalT);
            g.gain.exponentialRampToValueAtTime(1e-3, finalT + 1.5);
            o.connect(dist);
            dist.connect(g);
            g.connect(getAudioCtx().destination);
            o.start(finalT);
            o.stop(finalT + 1.5);
          });
        }
      }
      if (msg.type === "restart" && msg.countdown <= 0) {
        state_default.state = "lobby";
        document.getElementById("joinScreen").style.display = "flex";
        document.getElementById("joinScreen").querySelector("h2").textContent = "Waiting for cows...";
        document.getElementById("hud").style.display = "none";
        document.getElementById("winScreen").style.display = "none";
        for (const id in state_default.cowMeshes) {
          const obj = state_default.cowMeshes[id];
          scene.remove(obj.mesh);
          obj.mesh.traverse((c) => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) {
              if (c.material.map) c.material.map.dispose();
              c.material.dispose();
            }
          });
          if (obj.hpSprite) obj.hpSprite.tex.dispose();
          if (obj.shieldBubble) {
            obj.shieldBubble.geometry.dispose();
            obj.shieldBubble.material.dispose();
          }
          if (obj.spawnBubble) {
            obj.spawnBubble.geometry.dispose();
            obj.spawnBubble.material.dispose();
          }
        }
        state_default.cowMeshes = {};
        for (const id in state_default.projMeshes) {
          const pm = state_default.projMeshes[id];
          scene.remove(pm);
          pm.traverse((c) => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
          });
        }
        state_default.projMeshes = {};
        state_default.projData = [];
        if (window._foodMeshes) {
          for (const id in window._foodMeshes) {
            const m = window._foodMeshes[id];
            scene.remove(m);
            m.traverse((c) => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) c.material.dispose();
            });
          }
          window._foodMeshes = {};
        }
        if (window._wpMeshes) {
          for (const id in window._wpMeshes) {
            const g = window._wpMeshes[id];
            scene.remove(g);
            g.traverse((c) => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) {
                if (c.material.map) c.material.map.dispose();
                c.material.dispose();
              }
            });
          }
          window._wpMeshes = {};
        }
        if (window._armorMeshes) {
          for (const id in window._armorMeshes) {
            const m = window._armorMeshes[id];
            scene.remove(m);
            m.traverse((c) => {
              if (c.geometry) c.geometry.dispose();
              if (c.material) c.material.dispose();
            });
          }
          window._armorMeshes = {};
        }
        clearRocketSounds();
        clearSmokeParticles();
        state_default.serverPlayers = [];
        state_default.serverFoods = [];
        state_default.clientWeapons = [];
        state_default.killfeed = [];
        state_default.mapBuilt = false;
        state_default.pendingLevelUps = 0;
        state_default.perkMenuOpen = false;
        state_default.spectateTargetId = null;
        state_default.killerId = null;
        state_default.killerName = null;
        state_default.barricadeReadyAt = 0;
        clearBarricades();
        state_default._botRevealTime = null;
        document.getElementById("perkMenu").style.display = "none";
        const oldRb = document.getElementById("readyBtn");
        if (oldRb) oldRb.remove();
        startMenuMusic();
      }
      if (msg.type === "levelup") {
        const meCheck = state_default.serverPlayers.find((p) => p.id === state_default.myId);
        if (!meCheck || !meCheck.alive) return;
        sfxLevelUp();
        state_default.pendingLevelUps = (state_default.pendingLevelUps || 0) + 1;
        if (!state_default.perkMenuOpen) showPerkMenu();
      }
      if (msg.type === "cowstrikeWarning") {
        state_default.killfeed.unshift({ txt: "\u{1F6A8} " + (msg.name || "?") + " CALLED COWSTRIKE! TAKE COVER!", t: 6 });
        if (getAudioCtx()) {
          const t = getAudioCtx().currentTime;
          const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
          o.type = "sawtooth";
          o.frequency.setValueAtTime(300, t);
          o.frequency.linearRampToValueAtTime(900, t + 0.75);
          o.frequency.linearRampToValueAtTime(300, t + 1.5);
          o.frequency.linearRampToValueAtTime(900, t + 2.25);
          o.frequency.linearRampToValueAtTime(300, t + 3);
          const cv = 0.06 * (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(cv, t + 0.2);
          g.gain.setValueAtTime(cv, t + 2.5);
          g.gain.linearRampToValueAtTime(0, t + 3);
          o.connect(g);
          g.connect(getAudioCtx().destination);
          o.start(t);
          o.stop(t + 3);
        }
      }
      if (msg.type === "cowstrike") {
        state_default.killfeed.unshift({ txt: "\u{1F4A5} COWSTRIKE WAVE " + ((msg.wave || 0) + 1) + "!", t: 4 });
        const amAffected = msg.affectedIds && msg.affectedIds.indexOf(state_default.myId) >= 0;
        if (getAudioCtx()) {
          const t = getAudioCtx().currentTime;
          const bs = getAudioCtx().sampleRate * 0.3, b = getAudioCtx().createBuffer(1, bs, getAudioCtx().sampleRate), d = b.getChannelData(0);
          for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 3);
          const n = getAudioCtx().createBufferSource();
          n.buffer = b;
          const ng = getAudioCtx().createGain();
          const sv = 0.08 * (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5);
          ng.gain.setValueAtTime(sv, t);
          ng.gain.exponentialRampToValueAtTime(1e-3, t + 0.4);
          n.connect(ng);
          ng.connect(getAudioCtx().destination);
          n.start(t);
          n.stop(t + 0.4);
          sfx(60, 0.4, "sine", 0.08);
        }
        if (amAffected) {
          document.getElementById("hitFlash").style.background = "rgba(255,100,0,0.5)";
          document.getElementById("hitFlash").style.opacity = "0.6";
          setTimeout(() => {
            document.getElementById("hitFlash").style.opacity = "0";
            document.getElementById("hitFlash").style.background = "rgba(255,0,0,0.3)";
          }, 500);
        }
        for (let i = 0; i < 50; i++) {
          const rx = cam.position.x + (Math.random() - 0.5) * 800;
          const rz = cam.position.z + (Math.random() - 0.5) * 800;
          const startY = 300 + Math.random() * 200;
          const fireMat = new THREE10.MeshBasicMaterial({ color: Math.random() > 0.3 ? 16729088 : 16755200 });
          const m = new THREE10.Mesh(new THREE10.SphereGeometry(2 + Math.random() * 4, 6, 6), fireMat);
          const glowMat = new THREE10.MeshBasicMaterial({ color: 16737792, transparent: true, opacity: 0.3 });
          const glow = new THREE10.Mesh(new THREE10.SphereGeometry(8 + Math.random() * 6, 6, 6), glowMat);
          m.add(glow);
          m.position.set(rx, startY, rz);
          scene.add(m);
          const trailParts = [];
          const delay = Math.random() * 800;
          const fallSpeed = 6 + Math.random() * 10;
          let fallLife = 5;
          const fall = () => {
            fallLife -= 0.016;
            if (fallLife <= 0) {
              scene.remove(m);
              m.geometry.dispose();
              fireMat.dispose();
              glow.geometry.dispose();
              glowMat.dispose();
              trailParts.forEach((t) => {
                scene.remove(t.mesh);
                t.mesh.geometry.dispose();
                t.mesh.material.dispose();
              });
              return;
            }
            m.position.y -= fallSpeed;
            if (Math.random() < 0.4) {
              const tp = new THREE10.Mesh(new THREE10.SphereGeometry(1.5, 4, 4), new THREE10.MeshBasicMaterial({ color: 16746496, transparent: true }));
              tp.position.copy(m.position);
              tp.position.x += (Math.random() - 0.5) * 4;
              tp.position.z += (Math.random() - 0.5) * 4;
              scene.add(tp);
              trailParts.push({ mesh: tp, life: 0.4 });
            }
            for (let ti = trailParts.length - 1; ti >= 0; ti--) {
              const t = trailParts[ti];
              t.life -= 0.02;
              t.mesh.material.opacity = Math.max(0, t.life);
              t.mesh.scale.multiplyScalar(0.95);
              if (t.life <= 0) {
                scene.remove(t.mesh);
                t.mesh.geometry.dispose();
                t.mesh.material.dispose();
                trailParts.splice(ti, 1);
              }
            }
            const groundH = getTerrainHeight(rx, rz);
            if (m.position.y <= groundH + 5) {
              scene.remove(m);
              m.geometry.dispose();
              fireMat.dispose();
              glow.geometry.dispose();
              glowMat.dispose();
              const fb = new THREE10.Mesh(new THREE10.SphereGeometry(12, 8, 8), new THREE10.MeshBasicMaterial({ color: 16737792, transparent: true }));
              fb.position.set(rx, groundH + 8, rz);
              scene.add(fb);
              let fblife = 0.8;
              const fbAnim = () => {
                fblife -= 0.025;
                fb.material.opacity = fblife;
                fb.scale.multiplyScalar(1.04);
                fb.material.color.setHex(fblife > 0.4 ? 16729088 : 16746496);
                if (fblife <= 0) {
                  scene.remove(fb);
                  fb.geometry.dispose();
                  fb.material.dispose();
                } else requestAnimationFrame(fbAnim);
              };
              requestAnimationFrame(fbAnim);
              setTimeout(() => {
                try {
                  scene.remove(fb);
                  fb.geometry.dispose();
                  fb.material.dispose();
                } catch (e) {
                }
              }, 3e3);
              const ring = new THREE10.Mesh(new THREE10.TorusGeometry(5, 2, 6, 16), new THREE10.MeshBasicMaterial({ color: 16755200, transparent: true }));
              ring.position.set(rx, groundH + 3, rz);
              ring.rotation.x = Math.PI / 2;
              scene.add(ring);
              let rlife = 0.6;
              const rAnim = () => {
                rlife -= 0.02;
                ring.material.opacity = rlife;
                ring.scale.multiplyScalar(1.08);
                if (rlife <= 0) {
                  scene.remove(ring);
                  ring.geometry.dispose();
                  ring.material.dispose();
                } else requestAnimationFrame(rAnim);
              };
              requestAnimationFrame(rAnim);
              setTimeout(() => {
                try {
                  scene.remove(ring);
                  ring.geometry.dispose();
                  ring.material.dispose();
                } catch (e) {
                }
              }, 3e3);
              for (let j = 0; j < 12; j++) {
                const col = Math.random() > 0.3 ? 16729088 : Math.random() > 0.5 ? 16768256 : 16746496;
                const ep = new THREE10.Mesh(new THREE10.SphereGeometry(1.5 + Math.random() * 3, 4, 4), new THREE10.MeshBasicMaterial({ color: col, transparent: true }));
                const evx = (Math.random() - 0.5) * 120, evz = (Math.random() - 0.5) * 120;
                let evy = 40 + Math.random() * 80;
                ep.position.set(rx, groundH + 5, rz);
                scene.add(ep);
                let elife = 0.7 + Math.random() * 0.3;
                const explode = () => {
                  elife -= 0.025;
                  ep.material.opacity = Math.max(0, elife);
                  ep.position.x += evx * 0.016;
                  ep.position.y += evy * 0.016;
                  ep.position.z += evz * 0.016;
                  evy -= 3;
                  ep.scale.multiplyScalar(0.96);
                  if (elife <= 0) {
                    scene.remove(ep);
                    ep.geometry.dispose();
                    ep.material.dispose();
                  } else requestAnimationFrame(explode);
                };
                requestAnimationFrame(explode);
                setTimeout(() => {
                  try {
                    scene.remove(ep);
                    ep.geometry.dispose();
                    ep.material.dispose();
                  } catch (e) {
                  }
                }, 3e3);
              }
              trailParts.forEach((t) => {
                scene.remove(t.mesh);
                t.mesh.geometry.dispose();
                t.mesh.material.dispose();
              });
            } else requestAnimationFrame(fall);
          };
          setTimeout(fall, delay);
        }
        const shakeBaseX = cam.position.x, shakeBaseZ = cam.position.z;
        let shakeT = 0;
        const shake = () => {
          shakeT += 0.03;
          cam.position.x = shakeBaseX + (Math.random() - 0.5) * 3 * (1 - shakeT);
          cam.position.z = shakeBaseZ + (Math.random() - 0.5) * 3 * (1 - shakeT);
          if (shakeT < 1) requestAnimationFrame(shake);
          else {
            cam.position.x = shakeBaseX;
            cam.position.z = shakeBaseZ;
          }
        };
        shake();
      }
      if (msg.type === "botsToggled") {
        document.getElementById("botsCheck").checked = msg.enabled;
        state_default.killfeed.unshift({ txt: "Bots " + (msg.enabled ? "enabled" : "disabled"), t: 3 });
      }
      if (msg.type === "botsFreeWillToggled") {
        document.getElementById("botsFreeWillCheck").checked = msg.enabled;
        state_default.killfeed.unshift({ txt: "Bot free will " + (msg.enabled ? "granted" : "revoked"), t: 3 });
      }
      if (msg.type === "dash") {
        const dasher = state_default.serverPlayers.find((p) => p.id === msg.playerId);
        if (dasher) {
          for (let i = 0; i < 15; i++) {
            const sm = new THREE10.Mesh(new THREE10.SphereGeometry(3 + Math.random() * 4, 5, 5), new THREE10.MeshBasicMaterial({ color: 13421772, transparent: true, opacity: 0.6 }));
            const th = getTerrainHeight(dasher.x, dasher.y);
            sm.position.set(dasher.x + (Math.random() - 0.5) * 20, th + 5 + Math.random() * 15, dasher.y + (Math.random() - 0.5) * 20);
            scene.add(sm);
            let life = 0.8 + Math.random() * 0.4;
            const anim = () => {
              life -= 0.02;
              sm.material.opacity = life * 0.5;
              sm.scale.multiplyScalar(1.03);
              sm.position.y += 0.5;
              if (life <= 0) {
                scene.remove(sm);
                sm.geometry.dispose();
                sm.material.dispose();
              } else requestAnimationFrame(anim);
            };
            requestAnimationFrame(anim);
            setTimeout(() => {
              try {
                scene.remove(sm);
                sm.geometry.dispose();
                sm.material.dispose();
              } catch (e) {
              }
            }, 3e3);
          }
        }
        sfx(300, 0.15, "sine", 0.08);
      }
      if (msg.type === "bump") {
        if (msg.a === state_default.myId || msg.b === state_default.myId) {
          sfxBump();
          document.getElementById("hitFlash").style.opacity = "0.2";
          setTimeout(() => document.getElementById("hitFlash").style.opacity = "0", 100);
        }
      }
      if (msg.type === "weaponPickup") {
        state_default.clientWeapons = state_default.clientWeapons.filter((w) => w.id !== msg.pickupId);
        const _wn = { shotgun: "Benelli", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW" };
        const wpName = _wn[msg.weapon] || msg.weapon || "weapon";
        if (msg.playerId === state_default.myId) state_default.killfeed.unshift({ txt: "Picked up " + wpName + "!", t: 3 });
        else state_default.killfeed.unshift({ txt: (msg.name || "?") + " picked up " + wpName, t: 3 });
      }
      if (msg.type === "weaponSpawn") {
        state_default.clientWeapons.push({ id: msg.id, x: msg.x, y: msg.y, weapon: msg.weapon });
      }
      if (msg.type === "weaponDrop") {
        if (msg.playerId === state_default.myId) state_default.killfeed.unshift({ txt: "Dropped weapon", t: 3 });
        else state_default.killfeed.unshift({ txt: (msg.name || "?") + " dropped their weapon", t: 3 });
      }
      if (msg.type === "reloaded" && msg.playerId === state_default.myId) {
        state_default.killfeed.unshift({ txt: "Reloaded!", t: 1.5 });
        if (msg.weapon === "burst") sfxReloadLR();
        else if (msg.weapon === "bolty") sfxReloadBolty();
        else if (msg.weapon === "shotgun") sfxShellLoad();
      }
      if (msg.type === "shellLoaded" && msg.playerId === state_default.myId) {
        sfxShellLoad();
      }
      if (msg.type === "emptyMag") {
        sfxEmptyMag();
      }
      if (msg.type === "armorPickup") {
        if (window._armorMeshes && window._armorMeshes[msg.pickupId]) {
          scene.remove(window._armorMeshes[msg.pickupId]);
          delete window._armorMeshes[msg.pickupId];
        }
        if (window._armorPickupData) window._armorPickupData = window._armorPickupData.filter((a) => a.id !== msg.pickupId);
        if (msg.playerId === state_default.myId) state_default.killfeed.unshift({ txt: "Picked up shield (+25)", t: 3 });
      }
      if (msg.type === "armorSpawn") {
        if (!window._armorPickupData) window._armorPickupData = [];
        window._armorPickupData.push({ id: msg.id, x: msg.x, y: msg.y });
      }
      if (msg.type === "shieldHit") {
        const th = getTerrainHeight(msg.x, msg.y);
        for (let i = 0; i < 8; i++) {
          const sp = new THREE10.Mesh(new THREE10.SphereGeometry(1 + Math.random() * 2, 4, 4), new THREE10.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.7 }));
          sp.position.set(msg.x + (Math.random() - 0.5) * 30, th + 10 + Math.random() * 20, msg.y + (Math.random() - 0.5) * 30);
          scene.add(sp);
          let life = 0.3 + Math.random() * 0.2;
          const anim = () => {
            life -= 0.02;
            sp.material.opacity = life * 2;
            sp.scale.multiplyScalar(0.95);
            if (life <= 0) {
              scene.remove(sp);
              sp.geometry.dispose();
              sp.material.dispose();
            } else requestAnimationFrame(anim);
          };
          requestAnimationFrame(anim);
          setTimeout(() => {
            try {
              scene.remove(sp);
              sp.geometry.dispose();
              sp.material.dispose();
            } catch (e) {
            }
          }, 1500);
        }
        sfx(800, 0.1, "sine", 0.05);
      }
      if (msg.type === "shieldBreak") {
        const th = getTerrainHeight(msg.x, msg.y);
        const ringMat = new THREE10.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.5, side: THREE10.DoubleSide });
        const ring = new THREE10.Mesh(new THREE10.TorusGeometry(5, 1.5, 6, 20), ringMat);
        ring.position.set(msg.x, th + 14, msg.y);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
        let ringLife = 0.4;
        const ringAnim = () => {
          ringLife -= 0.015;
          ringMat.opacity = ringLife;
          ring.scale.multiplyScalar(1.12);
          if (ringLife <= 0) {
            scene.remove(ring);
            ring.geometry.dispose();
            ringMat.dispose();
          } else requestAnimationFrame(ringAnim);
        };
        requestAnimationFrame(ringAnim);
        setTimeout(() => {
          try {
            scene.remove(ring);
            ring.geometry.dispose();
            ringMat.dispose();
          } catch (e) {
          }
        }, 2e3);
        for (let i = 0; i < 15; i++) {
          const shard = new THREE10.Mesh(new THREE10.BoxGeometry(1, 2, 0.5), new THREE10.MeshBasicMaterial({ color: 8961023, transparent: true, opacity: 0.8 }));
          shard.position.set(msg.x, th + 14, msg.y);
          scene.add(shard);
          const vx = (Math.random() - 0.5) * 120, vz = (Math.random() - 0.5) * 120;
          let vy = 30 + Math.random() * 60;
          let life = 0.6 + Math.random() * 0.3;
          const shardAnim = () => {
            life -= 0.02;
            shard.material.opacity = Math.max(0, life);
            shard.position.x += vx * 0.016;
            shard.position.y += vy * 0.016;
            shard.position.z += vz * 0.016;
            vy -= 3;
            shard.rotation.x += 0.2;
            shard.rotation.z += 0.15;
            if (life <= 0) {
              scene.remove(shard);
              shard.geometry.dispose();
              shard.material.dispose();
            } else requestAnimationFrame(shardAnim);
          };
          requestAnimationFrame(shardAnim);
          setTimeout(() => {
            try {
              scene.remove(shard);
              shard.geometry.dispose();
              shard.material.dispose();
            } catch (e) {
            }
          }, 3e3);
        }
        sfx(400, 0.15, "triangle", 0.1);
        sfx(200, 0.2, "sine", 0.08);
      }
    }
    var last = performance.now();
    function loop(ts) {
      requestAnimationFrame(loop);
      const dt = Math.min((ts - last) / 1e3, 0.1);
      last = ts;
      const time = ts / 1e3;
      const me = state_default.serverPlayers.find((p) => p.id === state_default.myId);
      updateHud(me, time, dt);
      if (state_default.state !== "playing") {
        ren.render(scene, cam);
        return;
      }
      updateMusicMood();
      tickMusic();
      const now = Date.now();
      let spectatingTarget = false;
      if ((!me || !me.alive) && state_default.state === "playing") {
        const aliveOthers = state_default.serverPlayers.filter((p) => p.alive && p.id !== state_default.myId);
        let target = aliveOthers.find((p) => p.id === state_default.spectateTargetId);
        if (!target && aliveOthers.length > 0) {
          target = aliveOthers[0];
          state_default.spectateTargetId = target.id;
        }
        if (target) {
          spectatingTarget = true;
          const targetH = getTerrainHeight(target.x, target.y) + (target.z || 0) + 18;
          const orbitDist = 90;
          const cosP = Math.cos(state_default.pitch), sinP = Math.sin(state_default.pitch);
          const sinY = Math.sin(state_default.yaw), cosY = Math.cos(state_default.yaw);
          cam.position.x = target.x - sinY * cosP * orbitDist;
          cam.position.z = target.y - cosY * cosP * orbitDist * -1;
          cam.position.y = targetH + sinP * orbitDist + 25;
          cam.lookAt(target.x, targetH, target.y);
        }
      }
      if (me && me.alive && now - state_default.lastMoveMsg > 50) {
        state_default.lastMoveMsg = now;
        const fwd = new THREE10.Vector3(0, 0, -1);
        fwd.applyQuaternion(cam.quaternion);
        fwd.y = 0;
        if (fwd.length() > 0.01) fwd.normalize();
        else fwd.set(0, 0, -1);
        const right = new THREE10.Vector3(-fwd.z, 0, fwd.x);
        let mx = 0, mz = 0;
        if (state_default.keys["KeyW"] || state_default.keys["ArrowUp"]) {
          mx += fwd.x;
          mz += fwd.z;
        }
        if (state_default.keys["KeyS"] || state_default.keys["ArrowDown"]) {
          mx -= fwd.x;
          mz -= fwd.z;
        }
        if (state_default.keys["KeyA"] || state_default.keys["ArrowLeft"]) {
          mx -= right.x;
          mz -= right.z;
        }
        if (state_default.keys["KeyD"] || state_default.keys["ArrowRight"]) {
          mx += right.x;
          mz += right.z;
        }
        const len = Math.hypot(mx, mz);
        const walking = !!state_default.crouching;
        if (len > 0) {
          send({ type: "move", dx: mx / len, dy: mz / len, walking });
          state_default.pingLast = performance.now();
        } else send({ type: "move", dx: 0, dy: 0, walking });
      }
      if (me && me.alive) {
        const camLerp = 1 - Math.pow(1e-4, dt);
        cam.position.x += (me.x - cam.position.x) * camLerp;
        cam.position.z += (me.y - cam.position.z) * camLerp;
      }
      if (me && me.alive) {
        const crouchMult = state_default.crouching ? 0.45 : 1;
        const dynCH = CH * (me.sizeMult || 1) * crouchMult;
        const localTerrainH = getTerrainHeight(cam.position.x, cam.position.z);
        const serverZ = me.z || 0;
        const targetZ = Math.max(localTerrainH, serverZ);
        const camLerpY = 1 - Math.pow(1e-4, dt);
        cam.position.y += (dynCH + targetZ - cam.position.y) * camLerpY;
      }
      if (!spectatingTarget) cam.quaternion.setFromEuler(new THREE10.Euler(state_default.pitch, state_default.yaw, 0, "YXZ"));
      sun.position.set(cam.position.x + 300, 400, cam.position.z + 200);
      sun.target.position.set(cam.position.x, 0, cam.position.z);
      sun.target.updateMatrixWorld();
      buildMap();
      buildTowerIfNeeded();
      updateZone();
      updateViewmodel();
      sky.position.copy(cam.position);
      cloudPlanes.forEach((c) => {
        c.position.x = c.userData.origX + Math.sin(time * 0.05 * c.userData.speed) * 200;
      });
      const WATER_LEVEL = -30;
      if (me && me.alive) {
        const terrH = getTerrainHeight(me.x, me.y);
        const inWater = terrH < WATER_LEVEL;
        if (inWater) {
          const isMoving = state_default.keys["KeyW"] || state_default.keys["KeyS"] || state_default.keys["KeyA"] || state_default.keys["KeyD"];
          if (!state_default._waterSoundTimer) state_default._waterSoundTimer = 0;
          state_default._waterSoundTimer -= dt;
          if (isMoving && state_default._waterSoundTimer <= 0) {
            sfx(150 + Math.random() * 100, 0.08, "sine", 0.03);
            sfx(300 + Math.random() * 200, 0.05, "sine", 0.02);
            state_default._waterSoundTimer = 0.3 + Math.random() * 0.2;
          }
          if (isMoving && Math.random() < 0.3) {
            const sp = new THREE10.Mesh(new THREE10.SphereGeometry(0.8, 4, 4), new THREE10.MeshBasicMaterial({ color: 4491468, transparent: true, opacity: 0.6 }));
            sp.position.set(me.x + (Math.random() - 0.5) * 10, WATER_LEVEL + Math.random() * 5, me.y + (Math.random() - 0.5) * 10);
            scene.add(sp);
            let sl = 0.5;
            const svy = 10 + Math.random() * 15;
            const sAnim = () => {
              sl -= 0.03;
              sp.material.opacity = sl;
              sp.position.y += svy * 0.016;
              if (sl <= 0) {
                scene.remove(sp);
                sp.geometry.dispose();
                sp.material.dispose();
              } else requestAnimationFrame(sAnim);
            };
            requestAnimationFrame(sAnim);
          }
          if (Math.random() < 0.015) {
            const ring = new THREE10.Mesh(new THREE10.TorusGeometry(18, 0.3, 4, 16), new THREE10.MeshBasicMaterial({ color: 16777215, side: THREE10.DoubleSide }));
            ring.position.set(me.x + (Math.random() - 0.5) * 6, WATER_LEVEL + 0.5, me.y + (Math.random() - 0.5) * 6);
            ring.rotation.x = Math.PI / 2;
            scene.add(ring);
            let rScale = 1;
            const rAnim = () => {
              rScale += 0.016 * 0.15;
              ring.scale.set(rScale, rScale, 1);
              if (rScale > 4) {
                scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
              } else requestAnimationFrame(rAnim);
            };
            requestAnimationFrame(rAnim);
          }
        }
      }
      updatePickups(time);
      updateCows(time, dt);
      updateProjectiles(dt);
      if (!state_default._laserDot) {
        state_default._laserDot = new THREE10.Mesh(new THREE10.SphereGeometry(1, 6, 6), new THREE10.MeshBasicMaterial({ color: 16711680 }));
        state_default._laserDot.visible = false;
        scene.add(state_default._laserDot);
      }
      if (state_default.adsActive && me && me.alive && me.weapon === "bolty") {
        const dir = new THREE10.Vector3(0, 0, -1);
        dir.applyQuaternion(cam.quaternion);
        const dotDist = 500;
        state_default._laserDot.position.set(cam.position.x + dir.x * dotDist, cam.position.y + dir.y * dotDist, cam.position.z + dir.z * dotDist);
        state_default._laserDot.visible = true;
        const s = dotDist / 200;
        state_default._laserDot.scale.set(s, s, s);
      } else if (state_default._laserDot) {
        state_default._laserDot.visible = false;
      }
      ren.render(scene, cam);
      const vmGroup2 = getVmGroup();
      if (vmGroup2 && state_default.state === "playing" && me && me.alive) {
        ren.autoClear = false;
        ren.clearDepth();
        ren.render(vmScene, vmCam);
        ren.autoClear = true;
      }
    }
    setMessageHandler(handleMsg);
    connect();
    requestAnimationFrame(loop);
  }
});
export default require_index();
