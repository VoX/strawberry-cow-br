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
    var TICK_RATE2 = 30;
    var PLAYER_BASE_SPEED = 108;
    var PLAYER_WALK_MULT = 0.5;
    var MUD_SPEED_MULT = 0.5;
    var GRAVITY = 800;
    var BARRICADE_HEIGHT = 55;
    var PLAYER_WALL_INFLATE = 15;
    var STATEFUL_INPUT_TYPES2 = /* @__PURE__ */ new Set([
      "move",
      "attack",
      "dash",
      "jump",
      "reload",
      "dropWeapon",
      "placeBarricade",
      "perk"
    ]);
    var COLORS = ["pink", "blue", "green", "gold", "purple", "red", "orange", "cyan"];
    var FOOD_TYPES = [
      { name: "strawberry", hunger: 15, pts: 10 },
      { name: "cake", hunger: 30, pts: 25 },
      { name: "pizza", hunger: 20, pts: 15 },
      { name: "icecream", hunger: 25, pts: 20 },
      { name: "donut", hunger: 18, pts: 12 },
      { name: "cupcake", hunger: 22, pts: 18 },
      { name: "cookie", hunger: 12, pts: 8 }
    ];
    var WEAPON_TYPES = ["shotgun", "burst", "bolty", "shotgun", "burst", "bolty", "cowtank"];
    module.exports = {
      MAP_W: MAP_W2,
      MAP_H: MAP_H2,
      TICK_RATE: TICK_RATE2,
      PLAYER_BASE_SPEED,
      PLAYER_WALK_MULT,
      MUD_SPEED_MULT,
      GRAVITY,
      BARRICADE_HEIGHT,
      PLAYER_WALL_INFLATE,
      STATEFUL_INPUT_TYPES: STATEFUL_INPUT_TYPES2,
      COLORS,
      FOOD_TYPES,
      WEAPON_TYPES
    };
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
      me: null,
      // cached reference to our own player in serverPlayers — refreshed in the state handler
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
      mapFeatures: { walls: [], mud: [], ponds: [], portals: [], shelters: [], houses: [] },
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
      barricades: [],
      // { id, cx, cy, w, h, angle } — mirrored from server for client-side projectile prediction
      lastTickNum: 0,
      // monotonic server tick counter — updated from every `tick` broadcast. Consumers: phases 1/4/5/6 of the netcode plan.
      inputSeq: 0,
      // client-side monotonic counter for STATEFUL_INPUT_TYPES. Incremented in network.js::send.
      lastAckedInput: 0,
      // highest seq the server has confirmed applying — echoed via inputAck broadcast. Phase 4 reconcile baseline.
      mePredicted: null
      // Phase 4 predicted local player state (x/y/z/vz/dir/...). Camera reads from here; reconciled against S.me on every inputAck.
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
  if (state_default.musicStyle === "radio") {
    startMenuMusicRadio();
    return;
  }
  _stopRadioIfRunning();
  if (state_default.musicStyle === "custom") {
    startMenuMusicCustom();
    return;
  }
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
  if (state_default.musicStyle === "neo") {
    startMenuMusicNeo();
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
  if (_customMenuNode) {
    try {
      _customMenuNode.stop();
    } catch (e) {
    }
    _customMenuNode.disconnect();
    _customMenuNode = null;
  }
  if (_customMenuGain) {
    _customMenuGain.disconnect();
    _customMenuGain = null;
  }
}
function loadCustomBuffers() {
  if (_customLoading || _customLoaded || !actx) return;
  _customLoading = true;
  const files = { menu: "music/custom/menu.ogg", chill: "music/custom/chill.ogg", tense: "music/custom/tense.ogg", frantic: "music/custom/frantic.ogg" };
  let remaining = 4;
  const warnMissing = (url, reason) => {
    if (_customWarned) return;
    _customWarned = true;
    console.warn("[audio] custom music pack unavailable \u2014 " + url + " " + reason + ". Copy ogg files to dist/music/custom/ to enable.");
  };
  for (const [k, url] of Object.entries(files)) {
    fetch(url).then((r) => {
      if (!r.ok) {
        warnMissing(url, "HTTP " + r.status);
        throw new Error("HTTP " + r.status);
      }
      return r.arrayBuffer();
    }).then((buf) => actx.decodeAudioData(buf)).then((d) => {
      customBuffers[k] = d;
      if (--remaining === 0) {
        _customLoaded = true;
        _customLoading = false;
      }
    }).catch((err) => {
      warnMissing(url, err && err.message ? err.message : "fetch failed");
      if (--remaining === 0) {
        _customLoaded = true;
        _customLoading = false;
      }
    });
  }
}
function customMusicAvailable() {
  return fetch("music/custom/menu.ogg", { method: "HEAD" }).then((r) => r.ok).catch(() => false);
}
function startMenuMusicCustom() {
  if (!actx || menuMusicInterval || _customMenuNode) return;
  loadCustomBuffers();
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
    if (!customBuffers.menu) return;
    clearInterval(menuMusicInterval);
    menuMusicInterval = null;
    const src = actx.createBufferSource();
    src.buffer = customBuffers.menu;
    src.loop = true;
    const g = actx.createGain();
    g.gain.value = 0.35 * masterVol();
    src.connect(g);
    g.connect(actx.destination);
    src.start();
    _customMenuNode = src;
    _customMenuGain = g;
  }, 100);
}
function tickMusicCustom() {
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
  loadCustomBuffers();
  const buf = customBuffers[musicMood];
  if (!buf) return;
  const v = masterVol();
  if (_customActiveMood !== musicMood) {
    const t = actx.currentTime;
    const targetGain = (_CUSTOM_MOOD_GAIN[musicMood] || 0.35) * v;
    const newSrc = actx.createBufferSource();
    newSrc.buffer = buf;
    newSrc.loop = true;
    const newGain = actx.createGain();
    newGain.gain.setValueAtTime(0, t);
    newGain.gain.linearRampToValueAtTime(targetGain, t + 2);
    newSrc.connect(newGain);
    newGain.connect(actx.destination);
    newSrc.start();
    if (_customActiveNode) {
      const oldNode = _customActiveNode, oldGain = _customActiveGain;
      oldGain.gain.cancelScheduledValues(t);
      oldGain.gain.setValueAtTime(oldGain.gain.value, t);
      oldGain.gain.linearRampToValueAtTime(0, t + 2);
      setTimeout(() => {
        try {
          oldNode.stop();
        } catch (e) {
        }
        oldNode.disconnect();
        oldGain.disconnect();
      }, 2100);
    }
    _customActiveNode = newSrc;
    _customActiveGain = newGain;
    _customActiveMood = musicMood;
  } else if (_customActiveGain) {
    const t = actx.currentTime;
    const targetGain = (_CUSTOM_MOOD_GAIN[musicMood] || 0.35) * v;
    _customActiveGain.gain.setValueAtTime(targetGain, t);
  }
}
function resetCustomMusic() {
  if (_customActiveNode) {
    try {
      _customActiveNode.stop();
    } catch (e) {
    }
    _customActiveNode.disconnect();
    if (_customActiveGain) _customActiveGain.disconnect();
  }
  _customActiveNode = null;
  _customActiveGain = null;
  _customActiveMood = null;
}
function startMenuMusicRadio() {
  if (!_radioAudio) {
    _radioAudio = new Audio("/strawberrycow-radio/rudefm");
    _radioAudio.crossOrigin = "anonymous";
    _radioAudio.preload = "none";
  }
  _radioAudio.volume = 0.5 * masterVol();
  if (_radioAudio.paused) {
    _radioAudio.play().catch((err) => console.warn("[audio] radio play failed:", err));
  }
}
function tickMusicRadio() {
  if (!_radioAudio) {
    startMenuMusicRadio();
    return;
  }
  _radioAudio.volume = 0.5 * masterVol();
  if (_radioAudio.paused) {
    _radioAudio.play().catch(() => {
    });
  }
}
function _stopRadioIfRunning() {
  if (!_radioAudio) return;
  try {
    _radioAudio.pause();
    _radioAudio.src = "";
    _radioAudio.load();
  } catch (e) {
  }
  _radioAudio = null;
}
function setMusicPlaying(val) {
  musicPlaying = val;
}
function resetMusic() {
  nextNote = 0;
  musicMood = "chill";
  resetCustomMusic();
}
function updateMusicMood() {
  const me = state_default.me;
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
function jazz7Chord(t, vol, rootFreq, isMinor) {
  if (!actx) return;
  const intervals = isMinor ? [0, 3, 7, 10] : [0, 4, 7, 11];
  for (const semi of intervals) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine";
    o.frequency.value = rootFreq * Math.pow(2, semi / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 0.9);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + 0.95);
  }
  for (const semi of [12, 19]) {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle";
    o.frequency.value = rootFreq * Math.pow(2, semi / 12) * 1.003;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol * 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(1e-3, t + 1.4);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + 1.5);
  }
}
function spyroLead(t, vol, freq, dur) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  const lfo = actx.createOscillator(), lfoGain = actx.createGain();
  lfo.frequency.value = 5.5;
  lfoGain.gain.value = freq * 0.012;
  lfo.connect(lfoGain);
  lfoGain.connect(o.frequency);
  const lp = actx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2200;
  lp.Q.value = 1.5;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.04);
  g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  o.connect(lp);
  lp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + dur);
  lfo.start(t);
  lfo.stop(t + dur);
}
function cleanGuitar(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "square";
  o.frequency.value = freq;
  const lp = actx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1400;
  lp.Q.value = 2;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 5e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.35);
  o.connect(lp);
  lp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.4);
}
function rhythmKick(t, vol) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.07);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.14);
  o.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.14);
}
function liveSnare(t, vol) {
  if (!actx) return;
  const bs = actx.sampleRate * 0.06, buf = actx.createBuffer(1, bs, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 4);
  const n = actx.createBufferSource();
  n.buffer = buf;
  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2100;
  bp.Q.value = 1.2;
  const g = actx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.08);
  const o = actx.createOscillator(), og = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(180, t);
  o.frequency.exponentialRampToValueAtTime(90, t + 0.05);
  og.gain.setValueAtTime(vol * 0.5, t);
  og.gain.exponentialRampToValueAtTime(1e-3, t + 0.06);
  o.connect(og);
  og.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.08);
  n.connect(bp);
  bp.connect(g);
  g.connect(actx.destination);
  n.start(t);
  n.stop(t + 0.08);
}
function walkBass(t, vol, freq) {
  if (!actx) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "triangle";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 5e-3);
  g.gain.exponentialRampToValueAtTime(1e-3, t + 0.28);
  const lp = actx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 800;
  o.connect(lp);
  lp.connect(g);
  g.connect(actx.destination);
  o.start(t);
  o.stop(t + 0.3);
}
function tickMusicNeo() {
  if (!actx || !musicPlaying || state_default.state !== "playing") return;
  const t = actx.currentTime;
  const tempos = { chill: 0.19, tense: 0.16, frantic: 0.13 };
  const tempo = tempos[musicMood] || 0.19;
  if (t < nextNote - 0.03) return;
  const v = masterVol();
  _neoBeat++;
  const beatInSection = _neoBeat - _neoSectionStart;
  if (beatInSection >= 32) {
    _neoSection = (_neoSection + 1) % 4;
    _neoSectionStart = _neoBeat;
  }
  const scale = [0, 2, 3, 5, 7, 9, 10, 12, 14];
  const sections = [
    {
      // Exploration — gentle, sparse drums, wandering melody
      melody: [0, -1, -1, 4, -1, 5, -1, 7, -1, -1, 5, -1, 4, -1, 2, -1, 0, -1, 2, -1, 4, -1, 5, -1, 7, -1, 5, -1, 4, -1, -1, -1],
      bassPat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      kickPat: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      snarePat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      guitarPat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      root: 0,
      isMinor: false
    },
    {
      // Curious discovery — more layers, swelling
      melody: [4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9, 11, 9, 7, 5, 4, 2, 0, -1],
      bassPat: [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      kickPat: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0],
      snarePat: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      guitarPat: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      root: 5,
      isMinor: false
    },
    {
      // Mystery — minor, contemplative, spacious
      melody: [7, -1, -1, 5, 4, -1, -1, 7, 5, -1, -1, 4, 2, -1, -1, 0, 2, -1, -1, 4, 5, -1, -1, 7, 5, -1, 4, -1, 2, -1, 0, -1],
      bassPat: [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      kickPat: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
      snarePat: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      guitarPat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      root: -3,
      isMinor: true
    },
    {
      // Celebration — full energy, memorable hook
      melody: [7, 9, 11, 12, 11, 9, 7, 5, 4, 7, 9, 12, 14, 12, 9, 7, 7, 9, 11, 12, 11, 9, 7, 12, 14, 12, 9, 7, 5, 4, 2, 0],
      bassPat: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
      kickPat: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1],
      snarePat: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
      guitarPat: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      root: 0,
      isMinor: false
    }
  ];
  const sec = sections[_neoSection];
  const step = beatInSection % 32;
  const rootFreq = 220 * Math.pow(2, sec.root / 12);
  if (step === 0) {
    jazz7Chord(t, 0.08 * v, rootFreq * 0.5, sec.isMinor);
  }
  const noteIdx = sec.melody[step];
  if (noteIdx !== void 0 && noteIdx >= 0) {
    const scaleNote = scale[noteIdx % scale.length];
    const freq = rootFreq * Math.pow(2, scaleNote / 12);
    spyroLead(t, 0.05 * v, freq, tempo * 1.4);
  }
  if (sec.bassPat[step]) {
    const walkIdx = Math.floor(step / 4) % scale.length;
    const bassFreq = rootFreq * 0.25 * Math.pow(2, scale[walkIdx] / 12);
    walkBass(t, 0.06 * v, bassFreq);
  }
  if (sec.guitarPat[step]) {
    cleanGuitar(t, 0.04 * v, rootFreq);
    cleanGuitar(t, 0.04 * v, rootFreq * Math.pow(2, (sec.isMinor ? 3 : 4) / 12));
    cleanGuitar(t, 0.04 * v, rootFreq * Math.pow(2, 7 / 12));
  }
  if (sec.kickPat[step]) rhythmKick(t, 0.07 * v);
  if (sec.snarePat[step]) liveSnare(t, 0.05 * v);
  if (step % 2 === 1) {
    const hbs = actx.sampleRate * 0.014, hbuf = actx.createBuffer(1, hbs, actx.sampleRate), hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbs; i++) hd[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / hbs * 10);
    const hh = actx.createBufferSource();
    hh.buffer = hbuf;
    const hg = actx.createGain();
    hg.gain.setValueAtTime(0.018 * v, t);
    hg.gain.exponentialRampToValueAtTime(1e-3, t + 0.018);
    const hhf = actx.createBiquadFilter();
    hhf.type = "highpass";
    hhf.frequency.value = 7500;
    hh.connect(hhf);
    hhf.connect(hg);
    hg.connect(actx.destination);
    hh.start(t);
    hh.stop(t + 0.018);
  }
  nextNote = t + tempo;
}
function startMenuMusicNeo() {
  if (!actx || menuMusicInterval) return;
  let beat = 0;
  menuMusicInterval = setInterval(() => {
    if (state_default.state === "playing") {
      stopMenuMusic();
      return;
    }
    const t = actx.currentTime;
    const v = masterVol();
    const scale = [0, 2, 3, 5, 7, 9, 10];
    if (beat % 8 === 0) jazz7Chord(t, 0.06 * v, 110, false);
    if (beat % 2 === 0) walkBass(t, 0.04 * v, 55 * Math.pow(2, scale[Math.floor(beat / 2) % scale.length] / 12));
    if (beat % 4 === 0) rhythmKick(t, 0.04 * v);
    if (beat % 4 === 2) liveSnare(t, 0.035 * v);
    if (beat % 16 === 0) {
      const note = scale[beat / 16 % scale.length];
      spyroLead(t, 0.04 * v, 220 * Math.pow(2, note / 12), 1.5);
    }
    beat++;
  }, 220);
}
function tickMusic() {
  if (state_default.musicStyle === "radio") {
    tickMusicRadio();
    return;
  }
  _stopRadioIfRunning();
  if (state_default.musicStyle === "custom") {
    tickMusicCustom();
    return;
  }
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
  if (state_default.musicStyle === "neo") {
    tickMusicNeo();
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
var actx, _spitBuf, _spitLoaded, lrBuffers, _lrLoaded, shotgunBuffers, _shotgunLoaded, _boltyShotBuf, _boltyShotLoaded, _boltBuf, _shellBuf, _sampleSoundsLoaded, _rocketBuf, _boltyReloadBuf, _shellImpactBuf, _explosionBuf, menuMusicInterval, customBuffers, _customLoading, _customLoaded, _customWarned, _customMenuNode, _customMenuGain, _customActiveNode, _customActiveGain, _customActiveMood, _CUSTOM_MOOD_GAIN, _radioAudio, musicPlaying, nextNote, musicMood, SCALES, TEMPOS, _indBeat, _indSection, _indSectionStart, _tribalBeat, _tribalSection, _tribalSectionStart, _moneyBeat, _moneySection, _moneySectionStart, _boyBeat, _boySection, _boySectionStart, _neoBeat, _neoSection, _neoSectionStart, _classicBeat, _classicSection, _classicSectionStart;
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
    customBuffers = { menu: null, chill: null, tense: null, frantic: null };
    _customLoading = false;
    _customLoaded = false;
    _customWarned = false;
    _customMenuNode = null;
    _customMenuGain = null;
    _customActiveNode = null;
    _customActiveGain = null;
    _customActiveMood = null;
    _CUSTOM_MOOD_GAIN = { chill: 0.35, tense: 0.35, frantic: 0.35, menu: 0.35 };
    _radioAudio = null;
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
    _neoBeat = 0;
    _neoSection = 0;
    _neoSectionStart = 0;
    _classicBeat = 0;
    _classicSection = 0;
    _classicSectionStart = 0;
  }
});

// client/renderer.js
import * as THREE from "three";
function setNightMode(enabled) {
  skyMat.uniforms.uNight.value = enabled ? 1 : 0;
  if (enabled) {
    ambient.color.setHex(2241450);
    ambient.intensity = 0.18;
    sun.color.setHex(10070749);
    sun.intensity = 0.22;
    hemi.color.setHex(657968);
    hemi.groundColor.setHex(328976);
    hemi.intensity = 0.15;
  } else {
    ambient.color.setHex(16777215);
    ambient.intensity = 0.6;
    sun.color.setHex(16777215);
    sun.intensity = 0.8;
    hemi.color.setHex(8900331);
    hemi.groundColor.setHex(4500036);
    hemi.intensity = 0.3;
  }
  cloudPlanes.forEach((c) => {
    c.material.opacity = enabled ? 0.15 : 0.7;
  });
}
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
var scene, cam, ren, ambient, sun, hemi, skyGeo, skyMat, sky, cloudPlanes, vmScene, vmCam;
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
    ambient = new THREE.AmbientLight(16777215, 0.6);
    scene.add(ambient);
    sun = new THREE.DirectionalLight(16777215, 0.8);
    sun.position.set(500, 400, 300);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 800;
    sun.shadow.camera.left = -400;
    sun.shadow.camera.right = 400;
    sun.shadow.camera.top = 400;
    sun.shadow.camera.bottom = -400;
    scene.add(sun);
    scene.add(sun.target);
    hemi = new THREE.HemisphereLight(8900331, 4500036, 0.3);
    scene.add(hemi);
    skyGeo = new THREE.SphereGeometry(5e3, 32, 32);
    skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fog: false,
      uniforms: { uNight: { value: 0 } },
      vertexShader: `varying vec3 vWorldPos;void main(){vWorldPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 vWorldPos;uniform float uNight;void main(){
    float h=normalize(vWorldPos).y;
    // Day palette
    vec3 dayTop=vec3(0.3,0.5,0.9);
    vec3 dayMid=vec3(0.6,0.8,1.0);
    vec3 dayHorizon=vec3(1.0,0.85,0.7);
    vec3 dayBottom=vec3(0.4,0.7,0.3);
    // Night palette \u2014 deep blue/purple with a subtle moonlit haze near horizon
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

// shared/terrain-math.js
var require_terrain_math = __commonJS({
  "shared/terrain-math.js"(exports, module) {
    var GRID_W2 = 200;
    var GRID_H2 = 150;
    function generateHeightMap2(seed, heightMap2, mapW, mapH) {
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
      for (let row = 0; row <= GRID_H2; row++) {
        for (let col = 0; col <= GRID_W2; col++) {
          const wx = col * mapW / GRID_W2;
          const wz = row * mapH / GRID_H2;
          const h = Math.sin(wx * s1) * a1 + Math.cos(wz * s2) * a2 + Math.sin(wx * s3 + wz * s4) * a3 + Math.cos(wx * s5 - wz * s6) * a4;
          heightMap2[row * (GRID_W2 + 1) + col] = h;
        }
      }
    }
    function sampleHeight2(heightMap2, mapW, mapH, x, y) {
      const gx = Math.max(0, Math.min(GRID_W2, x / mapW * GRID_W2));
      const gy = Math.max(0, Math.min(GRID_H2, y / mapH * GRID_H2));
      const col = Math.floor(gx), row = Math.floor(gy);
      const fx = gx - col, fy = gy - row;
      const c1 = Math.min(col + 1, GRID_W2), r1 = Math.min(row + 1, GRID_H2);
      const h00 = heightMap2[row * (GRID_W2 + 1) + col];
      const h10 = heightMap2[row * (GRID_W2 + 1) + c1];
      const h01 = heightMap2[r1 * (GRID_W2 + 1) + col];
      const h11 = heightMap2[r1 * (GRID_W2 + 1) + c1];
      return h00 * (1 - fx) * (1 - fy) + h10 * fx * (1 - fy) + h01 * (1 - fx) * fy + h11 * fx * fy;
    }
    module.exports = { GRID_W: GRID_W2, GRID_H: GRID_H2, generateHeightMap: generateHeightMap2, sampleHeight: sampleHeight2 };
  }
});

// client/terrain.js
import * as THREE2 from "three";
function getTerrainHeight(x, z) {
  return (0, import_terrain_math.sampleHeight)(heightMap, MW, MH, x, z);
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
  [fencePostMesh, fenceRailMesh].forEach((m) => {
    if (m) {
      scene.remove(m);
      m.geometry.dispose();
    }
  });
  fencePostMesh = fenceRailMesh = null;
  gndMesh = mtMesh = snowMesh = waterMesh = null;
}
function buildTerrainMeshes() {
  const gndSegsX = import_terrain_math.GRID_W, gndSegsY = import_terrain_math.GRID_H;
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
  const railGeo = new THREE2.BoxGeometry(3, 3, 1);
  const fenceStep = 25;
  const postSlots = [];
  const railSlots = [];
  for (let x = 0; x <= MW; x += fenceStep) {
    postSlots.push([x, 0]);
    postSlots.push([x, MH]);
    if (x < MW) {
      railSlots.push([x, 0, x + fenceStep, 0]);
      railSlots.push([x, MH, x + fenceStep, MH]);
    }
  }
  for (let z = 0; z <= MH; z += fenceStep) {
    postSlots.push([0, z]);
    postSlots.push([MW, z]);
    if (z < MH) {
      railSlots.push([0, z, 0, z + fenceStep]);
      railSlots.push([MW, z, MW, z + fenceStep]);
    }
  }
  fencePostMesh = new THREE2.InstancedMesh(postGeo, bm, postSlots.length);
  const postMat4 = new THREE2.Matrix4();
  const postPos = new THREE2.Vector3();
  for (let i = 0; i < postSlots.length; i++) {
    const [x, z] = postSlots[i];
    postPos.set(x, getTerrainHeight(x, z) + 15, z);
    postMat4.makeTranslation(postPos.x, postPos.y, postPos.z);
    fencePostMesh.setMatrixAt(i, postMat4);
  }
  fencePostMesh.instanceMatrix.needsUpdate = true;
  scene.add(fencePostMesh);
  fenceRailMesh = new THREE2.InstancedMesh(railGeo, bm, railSlots.length * 2);
  const railMat4 = new THREE2.Matrix4();
  const railPos = new THREE2.Vector3();
  const railQuat = new THREE2.Quaternion();
  const railScale = new THREE2.Vector3();
  const _railYAxis = new THREE2.Vector3(0, 1, 0);
  let railIdx = 0;
  for (const [x1, z1, x2, z2] of railSlots) {
    const th1 = getTerrainHeight(x1, z1), th2 = getTerrainHeight(x2, z2);
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, mth = (th1 + th2) / 2;
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);
    railQuat.setFromAxisAngle(_railYAxis, angle);
    railScale.set(1, 1, dist);
    for (const rh of [22, 12]) {
      railPos.set(mx, mth + rh, mz);
      railMat4.compose(railPos, railQuat, railScale);
      fenceRailMesh.setMatrixAt(railIdx++, railMat4);
    }
  }
  fenceRailMesh.instanceMatrix.needsUpdate = true;
  scene.add(fenceRailMesh);
}
function rebuildTerrain(seed) {
  clearTerrainMeshes();
  (0, import_terrain_math.generateHeightMap)(seed, heightMap, MW, MH);
  buildTerrainMeshes();
}
var import_terrain_math, heightMap, gndPad, extW, extH, grassMat, mtMat, snowMat, gndMesh, mtMesh, snowMesh, waterMesh, fencePostMesh, fenceRailMesh;
var init_terrain = __esm({
  "client/terrain.js"() {
    init_config();
    init_renderer();
    import_terrain_math = __toESM(require_terrain_math());
    heightMap = new Float32Array((import_terrain_math.GRID_W + 1) * (import_terrain_math.GRID_H + 1));
    (0, import_terrain_math.generateHeightMap)(0, heightMap, MW, MH);
    gndPad = 800;
    extW = MW + gndPad * 2;
    extH = MH + gndPad * 2;
    grassMat = new THREE2.MeshLambertMaterial({ color: 3831856 });
    mtMat = new THREE2.MeshLambertMaterial({ color: 8947848 });
    snowMat = new THREE2.MeshLambertMaterial({ color: 15658751 });
    gndMesh = null;
    mtMesh = null;
    snowMesh = null;
    waterMesh = null;
    fencePostMesh = null;
    fenceRailMesh = null;
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
  if (!state_default.ws || state_default.ws.readyState !== 1) return;
  if (m && import_constants2.STATEFUL_INPUT_TYPES.has(m.type)) {
    m.seq = ++state_default.inputSeq;
  }
  state_default.ws.send(JSON.stringify(m));
}
var import_constants2, msgHandler;
var init_network = __esm({
  "client/network.js"() {
    init_state();
    import_constants2 = __toESM(require_constants());
    msgHandler = null;
  }
});

// client/interp.js
function interpSamplePlayer(p, nowMs) {
  const hist = p._histBuf;
  if (!hist || hist.length === 0) {
    return { x: p.x, y: p.y, z: p.z, aim: p.aimAngle };
  }
  const renderT = nowMs - INTERP_DELAY_MS;
  const last = hist[hist.length - 1];
  if (renderT >= last.t) return { x: last.x, y: last.y, z: last.z, aim: last.aim };
  if (renderT <= hist[0].t) return { x: hist[0].x, y: hist[0].y, z: hist[0].z, aim: hist[0].aim };
  for (let i = 0; i < hist.length - 1; i++) {
    const a = hist[i], b = hist[i + 1];
    if (a.t <= renderT && b.t >= renderT) {
      const span = b.t - a.t;
      const f = span > 0 ? (renderT - a.t) / span : 0;
      let da = b.aim - a.aim;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      return {
        x: a.x + (b.x - a.x) * f,
        y: a.y + (b.y - a.y) * f,
        z: a.z + (b.z - a.z) * f,
        aim: a.aim + da * f
      };
    }
  }
  return { x: last.x, y: last.y, z: last.z, aim: last.aim };
}
var INTERP_HIST_CAP, INTERP_DELAY_MS;
var init_interp = __esm({
  "client/interp.js"() {
    INTERP_HIST_CAP = 8;
    INTERP_DELAY_MS = 100;
  }
});

// client/input.js
import * as THREE3 from "three";
function setVmGroupRef(getter) {
  vmGroupRef = getter;
}
function doAttack() {
  _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
  send({
    type: "attack",
    aimX: _inputDir.x,
    aimY: _inputDir.z,
    aimZ: _inputDir.y,
    fireMode: state_default.fireMode,
    // displayTick: the server tick the interp buffer is currently showing.
    // Server uses this to rewind entity positions for hit detection.
    displayTick: Math.max(0, state_default.lastTickNum - INTERP_DELAY_TICKS)
  });
}
function doDash() {
  _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
  _inputDir.y = 0;
  _inputDir.normalize();
  send({ type: "dash", dirX: _inputDir.x, dirY: _inputDir.z });
}
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {
    });
  } else {
    document.documentElement.requestFullscreen().catch(() => {
    });
  }
}
function autoFireLoop() {
  if (!autoFireActive) return;
  if (!mouseDown || state_default.state !== "playing" || !state_default.locked) {
    stopAutoFire();
    return;
  }
  const me = state_default.me;
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
var import_constants3, INTERP_DELAY_TICKS, isMobile, vmGroupRef, _inputDir, mouseDown, autoFireActive, nextFireTime, AUTO_FIRE_INTERVAL, chatInput, chatInputWrap;
var init_input = __esm({
  "client/input.js"() {
    init_state();
    init_renderer();
    init_audio();
    init_network();
    init_interp();
    import_constants3 = __toESM(require_constants());
    INTERP_DELAY_TICKS = Math.round(INTERP_DELAY_MS * import_constants3.TICK_RATE / 1e3);
    isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    vmGroupRef = null;
    _inputDir = new THREE3.Vector3();
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
      const me = state_default.me;
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
        const me = state_default.me;
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
      const _mobFwd = new THREE3.Vector3();
      const _mobRight = new THREE3.Vector3();
      setInterval(() => {
        if (state_default.state === "playing" && Math.abs(tdx) + Math.abs(tdy) > 0.1) {
          _mobFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
          _mobFwd.y = 0;
          if (_mobFwd.length() > 0.01) _mobFwd.normalize();
          _mobRight.set(-_mobFwd.z, 0, _mobFwd.x);
          const mx = _mobFwd.x * -tdy + _mobRight.x * tdx;
          const mz = _mobFwd.z * -tdy + _mobRight.z * tdx;
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
      const meK = state_default.me;
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
      if (e.code === "KeyO") {
        toggleFullscreen();
      }
      if (e.code === "KeyR" && state_default.state === "playing") send({ type: "reload" });
      if (e.code === "KeyX" && state_default.state === "playing") {
        state_default.fireMode = state_default.fireMode === "burst" ? "auto" : state_default.fireMode === "auto" ? "semi" : "burst";
        state_default.killfeed.unshift({ txt: "M16A2: " + state_default.fireMode.toUpperCase() + " mode", t: 2 });
      }
      if (e.code === "KeyC" && state_default.state === "playing") {
        const meC = state_default.me;
        if (meC && meC.alive) state_default.crouching = !state_default.crouching;
      }
      if (e.code === "KeyB" && state_default.state === "playing") {
        const me = state_default.me;
        if (me && me.alive && performance.now() >= state_default.barricadeReadyAt) {
          _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
          _inputDir.y = 0;
          if (_inputDir.length() > 0.01) _inputDir.normalize();
          send({ type: "placeBarricade", aimX: _inputDir.x, aimY: _inputDir.z });
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
function commitLobbyName() {
  if (!state_default.myId || state_default.state !== "lobby") return;
  const n = document.getElementById("nameIn").value.trim();
  if (!n) return;
  try {
    localStorage.setItem("cowName3d", n);
  } catch (e) {
  }
  send({ type: "setName", name: n });
}
function showPerkMenu() {
  state_default.perkMenuOpen = true;
  const me = state_default.me;
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
var fullscreenBtn, _nightCheckEl, COW_NAMES, _nameIdx, randomBtn;
var init_ui = __esm({
  "client/ui.js"() {
    init_state();
    init_config();
    init_network();
    init_audio();
    init_renderer();
    init_input();
    fullscreenBtn = document.getElementById("fullscreenBtn");
    if (fullscreenBtn) fullscreenBtn.addEventListener("click", toggleFullscreen);
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
    customMusicAvailable().then((ok) => {
      if (ok) return;
      const opt = document.querySelector('#musicSelect option[value="custom"]');
      if (opt) opt.remove();
      if (state_default.musicStyle === "custom") {
        state_default.musicStyle = "classic";
        document.getElementById("musicSelect").value = "classic";
        try {
          localStorage.setItem("cowMusic3d", "classic");
        } catch (ex) {
        }
      }
    });
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
    _nightCheckEl = document.getElementById("nightCheck");
    if (_nightCheckEl) _nightCheckEl.addEventListener("change", (e) => {
      if (state_default.hostId && state_default.myId === state_default.hostId) {
        send({ type: "toggleNight" });
      } else {
        e.target.checked = !e.target.checked;
      }
    });
    document.getElementById("botsCheck").addEventListener("change", (e) => {
      if (state_default.hostId && state_default.myId === state_default.hostId) send({ type: "toggleBots" });
      else e.target.checked = !e.target.checked;
    });
    document.getElementById("botsFreeWillCheck").addEventListener("change", (e) => {
      if (state_default.hostId && state_default.myId === state_default.hostId) send({ type: "toggleBotsFreeWill" });
      else e.target.checked = !e.target.checked;
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
        commitLobbyName();
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
      document.getElementById("joinBtn").style.display = "none";
    });
    document.getElementById("nameIn").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (!state_default.myId) document.getElementById("joinBtn").click();
        else {
          commitLobbyName();
          e.target.blur();
        }
      }
    });
    document.getElementById("nameIn").addEventListener("blur", commitLobbyName);
    window.pickPerk = function(id) {
      send({ type: "perk", id });
      state_default.pendingLevelUps--;
      state_default.perkMenuOpen = false;
      document.getElementById("perkMenu").style.display = "none";
      if (state_default.pendingLevelUps > 0) setTimeout(showPerkMenu, 300);
    };
  }
});

// client/three-utils.js
import * as THREE4 from "three";
function markSharedGeometry(geo) {
  _SHARED_GEOMETRIES.add(geo);
  return geo;
}
function markSharedMaterial(mat) {
  _SHARED_MATERIALS.add(mat);
  return mat;
}
function disposeMeshTree(obj, opts = {}) {
  if (!opts.skipSceneRemove) scene.remove(obj);
  obj.traverse((c) => {
    if (c.geometry && !_SHARED_GEOMETRIES.has(c.geometry)) c.geometry.dispose();
    if (c.material) {
      if (c.material.map) c.material.map.dispose();
      if (!_SHARED_MATERIALS.has(c.material)) c.material.dispose();
    }
  });
}
var _SHARED_GEOMETRIES, _SHARED_MATERIALS, _BLANK_PNG, fbxLoadingManager;
var init_three_utils = __esm({
  "client/three-utils.js"() {
    init_renderer();
    _SHARED_GEOMETRIES = /* @__PURE__ */ new WeakSet();
    _SHARED_MATERIALS = /* @__PURE__ */ new WeakSet();
    _BLANK_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=";
    fbxLoadingManager = new THREE4.LoadingManager();
    fbxLoadingManager.setURLModifier((url) => {
      if (/\.(png|jpe?g|tga|bmp)(\?|$)/i.test(url)) return _BLANK_PNG;
      return url;
    });
  }
});

// client/particles.js
import * as THREE5 from "three";
function releaseEntry(entry) {
  scene.remove(entry.mesh);
  if (_freePool.length >= MAX_FREE_POOL) {
    entry.mat.dispose();
    return;
  }
  _freePool.push(entry);
}
function borrowEntry() {
  const entry = _freePool.pop();
  if (entry) return entry;
  const mat = new THREE5.MeshBasicMaterial({ transparent: true });
  const mesh = new THREE5.Mesh(PGEO_SPHERE_LO, mat);
  return { mesh, mat };
}
function spawnParticle(opts) {
  if (_active.length >= MAX_ACTIVE_PARTICLES) {
    const old = _active.shift();
    releaseEntry(old.entry);
  }
  const entry = borrowEntry();
  entry.mesh.geometry = opts.geo || PGEO_SPHERE_LO;
  entry.mat.color.setHex(opts.color != null ? opts.color : 16777215);
  entry.mat.opacity = opts.peakOpacity != null ? opts.peakOpacity : 1;
  entry.mat.side = opts.side || THREE5.FrontSide;
  entry.mesh.position.set(opts.x, opts.y, opts.z);
  entry.mesh.scale.set(opts.sx || 1, opts.sy || opts.sx || 1, opts.sz || opts.sx || 1);
  entry.mesh.rotation.set(opts.rotX || 0, opts.rotY || 0, opts.rotZ || 0);
  scene.add(entry.mesh);
  _active.push({
    entry,
    life: opts.life,
    lifeMax: opts.life,
    vx: opts.vx || 0,
    vy: opts.vy || 0,
    vz: opts.vz || 0,
    gy: opts.gy || 0,
    growth: opts.growth || 0,
    peakOpacity: opts.peakOpacity != null ? opts.peakOpacity : 1,
    rotVx: opts.rotVx || 0,
    rotVz: opts.rotVz || 0
  });
}
function updateParticles(dt) {
  for (let i = _active.length - 1; i >= 0; i--) {
    const p = _active[i];
    p.life -= dt;
    if (p.life <= 0) {
      releaseEntry(p.entry);
      _active.splice(i, 1);
      continue;
    }
    const m = p.entry.mesh;
    m.position.x += p.vx * dt;
    m.position.y += p.vy * dt;
    m.position.z += p.vz * dt;
    if (p.gy) p.vy -= p.gy * dt;
    if (p.growth) {
      const g = 1 + p.growth * dt;
      m.scale.x *= g;
      m.scale.y *= g;
      m.scale.z *= g;
    }
    if (p.rotVx) m.rotation.x += p.rotVx * dt;
    if (p.rotVz) m.rotation.z += p.rotVz * dt;
    p.entry.mat.opacity = Math.max(0, p.peakOpacity * (p.life / p.lifeMax));
  }
}
function clearParticles() {
  for (const p of _active) releaseEntry(p.entry);
  _active.length = 0;
  while (_freePool.length > MAX_FREE_POOL) _freePool.pop().mat.dispose();
}
var PGEO_SPHERE_LO, PGEO_SPHERE_MED, PGEO_BOX, PGEO_TORUS, MAX_FREE_POOL, MAX_ACTIVE_PARTICLES, _freePool, _active;
var init_particles = __esm({
  "client/particles.js"() {
    init_renderer();
    init_three_utils();
    PGEO_SPHERE_LO = markSharedGeometry(new THREE5.SphereGeometry(1, 4, 4));
    PGEO_SPHERE_MED = markSharedGeometry(new THREE5.SphereGeometry(1, 6, 6));
    PGEO_BOX = markSharedGeometry(new THREE5.BoxGeometry(1, 1, 1));
    PGEO_TORUS = markSharedGeometry(new THREE5.TorusGeometry(1, 0.1, 4, 16));
    MAX_FREE_POOL = 600;
    MAX_ACTIVE_PARTICLES = 600;
    _freePool = [];
    _active = [];
  }
});

// client/entities.js
import * as THREE6 from "three";
function getCowBodyMat(colorHex) {
  let mat = _cowBodyMats.get(colorHex);
  if (!mat) {
    mat = new THREE6.MeshLambertMaterial({ color: colorHex });
    markSharedMaterial(mat);
    _cowBodyMats.set(colorHex, mat);
  }
  return mat;
}
function _buildCowboyHatTemplate() {
  const g = new THREE6.Group();
  const hatBrown = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 6961690 }));
  const hatBand = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 3807752 }));
  const brimGeo = markSharedGeometry(new THREE6.CylinderGeometry(8, 8, 0.8, 16));
  const crownGeo = markSharedGeometry(new THREE6.CylinderGeometry(4, 4.5, 4, 12));
  const bandGeo = markSharedGeometry(new THREE6.CylinderGeometry(4.6, 4.6, 0.8, 12));
  const topGeo = markSharedGeometry(new THREE6.CylinderGeometry(4, 4, 0.4, 12));
  const brim = new THREE6.Mesh(brimGeo, hatBrown);
  brim.position.y = 38.5;
  g.add(brim);
  const crown = new THREE6.Mesh(crownGeo, hatBrown);
  crown.position.y = 41;
  g.add(crown);
  const band = new THREE6.Mesh(bandGeo, hatBand);
  band.position.y = 39.5;
  g.add(band);
  const top = new THREE6.Mesh(topGeo, hatBrown);
  top.position.y = 43;
  g.add(top);
  return g;
}
function _buildWizardHatTemplate() {
  const g = new THREE6.Group();
  const purpleMat = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 6955673 }));
  const brownBand = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 6961690 }));
  const yellowMat = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16768256 }));
  const wizBrimGeo = markSharedGeometry(new THREE6.CylinderGeometry(7, 7, 0.6, 16));
  const wizConeGeo = markSharedGeometry(new THREE6.ConeGeometry(5, 14, 12));
  const wizBandGeo = markSharedGeometry(new THREE6.CylinderGeometry(5.2, 5.2, 1, 12));
  const buckleGeo = markSharedGeometry(new THREE6.BoxGeometry(2, 1.5, 0.5));
  const wizBrim = new THREE6.Mesh(wizBrimGeo, purpleMat);
  wizBrim.position.y = 38.5;
  g.add(wizBrim);
  const wizCone = new THREE6.Mesh(wizConeGeo, purpleMat);
  wizCone.position.y = 46;
  g.add(wizCone);
  const wizBand = new THREE6.Mesh(wizBandGeo, brownBand);
  wizBand.position.y = 39.5;
  g.add(wizBand);
  const buckle = new THREE6.Mesh(buckleGeo, yellowMat);
  buckle.position.set(0, 39.5, 5.3);
  g.add(buckle);
  return g;
}
function _buildCrownHatTemplate() {
  const g = new THREE6.Group();
  const goldMat = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16768256 }));
  const baseGeo = markSharedGeometry(new THREE6.CylinderGeometry(5, 5, 3, 12));
  const spikeGeo = markSharedGeometry(new THREE6.ConeGeometry(0.8, 3.5, 6));
  const jewelGeo = markSharedGeometry(new THREE6.OctahedronGeometry(0.7, 0));
  const bigJewelGeo = markSharedGeometry(new THREE6.OctahedronGeometry(1.2, 0));
  const jewelColors = [16720418, 2293538, 2237183, 16720639, 16776994];
  const jewelMats = jewelColors.map((col) => markSharedMaterial(new THREE6.MeshLambertMaterial({ color: col })));
  const bigJewelMat = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16720452 }));
  const base = new THREE6.Mesh(baseGeo, goldMat);
  base.position.y = 39;
  g.add(base);
  for (let pi = 0; pi < 6; pi++) {
    const ang = pi / 6 * Math.PI * 2;
    const spike = new THREE6.Mesh(spikeGeo, goldMat);
    spike.position.set(Math.cos(ang) * 4.5, 42, Math.sin(ang) * 4.5);
    g.add(spike);
    const jewel = new THREE6.Mesh(jewelGeo, jewelMats[pi % jewelMats.length]);
    jewel.position.set(Math.cos(ang) * 4.5, 44.5, Math.sin(ang) * 4.5);
    g.add(jewel);
  }
  const bigJewel = new THREE6.Mesh(bigJewelGeo, bigJewelMat);
  bigJewel.position.set(0, 39, 5);
  g.add(bigJewel);
  return g;
}
function _buildCapHatTemplate() {
  const g = new THREE6.Group();
  const capColor = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 2245802 }));
  const domeGeo = markSharedGeometry(new THREE6.SphereGeometry(5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2));
  const visorGeo = markSharedGeometry(new THREE6.BoxGeometry(8, 0.5, 5));
  const btnGeo = markSharedGeometry(new THREE6.SphereGeometry(0.6, 6, 6));
  const dome = new THREE6.Mesh(domeGeo, capColor);
  dome.position.y = 39;
  g.add(dome);
  const visor = new THREE6.Mesh(visorGeo, capColor);
  visor.position.set(0, 39, 5);
  g.add(visor);
  const btn = new THREE6.Mesh(btnGeo, capColor);
  btn.position.y = 44;
  g.add(btn);
  return g;
}
function _buildPartyHatTemplate() {
  const g = new THREE6.Group();
  const partyMat = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16729258 }));
  const partyConeGeo = markSharedGeometry(new THREE6.ConeGeometry(4, 12, 12));
  const spotGeo = markSharedGeometry(new THREE6.SphereGeometry(0.6, 6, 6));
  const pomGeo = markSharedGeometry(new THREE6.SphereGeometry(1.2, 6, 6));
  const pomMat = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16777215 }));
  const spotColors = [16768324, 4521949, 4513279, 14548804];
  const spotMats = spotColors.map((col) => markSharedMaterial(new THREE6.MeshLambertMaterial({ color: col })));
  const partyCone = new THREE6.Mesh(partyConeGeo, partyMat);
  partyCone.position.y = 44;
  g.add(partyCone);
  for (let si = 0; si < 8; si++) {
    const spot = new THREE6.Mesh(spotGeo, spotMats[si % spotMats.length]);
    const ang = si / 8 * Math.PI * 2;
    const sy = 40 + si % 3 * 2.5;
    const sr = 3.5 - si % 3 * 0.7;
    spot.position.set(Math.cos(ang) * sr, sy, Math.sin(ang) * sr);
    g.add(spot);
  }
  const pom = new THREE6.Mesh(pomGeo, pomMat);
  pom.position.y = 50.5;
  g.add(pom);
  return g;
}
function cloneHat(type) {
  const tpl = _HAT_TEMPLATES[type] || _HAT_TEMPLATES.party;
  return tpl.clone(true);
}
function buildCow(color, personality) {
  const c = COL[color] || 16746666;
  const bodyMat = getCowBodyMat(c);
  const g = new THREE6.Group();
  const torso = new THREE6.Mesh(COW_GEO.torso, bodyMat);
  torso.position.set(0, 18, 0);
  torso.castShadow = true;
  g.add(torso);
  const s1 = new THREE6.Mesh(COW_GEO.spotLarge, COW_SPOT_MAT);
  s1.position.set(-7.1, 20, 0);
  s1.rotation.y = -Math.PI / 2;
  g.add(s1);
  const s2 = new THREE6.Mesh(COW_GEO.spotLarge, COW_SPOT_MAT);
  s2.position.set(7.1, 16, -1);
  s2.rotation.y = Math.PI / 2;
  g.add(s2);
  const s3 = new THREE6.Mesh(COW_GEO.spot25, COW_SPOT_MAT);
  s3.position.set(0, 27.1, 1);
  s3.rotation.x = -Math.PI / 2;
  g.add(s3);
  const s4 = new THREE6.Mesh(COW_GEO.spot22, COW_SPOT_MAT);
  s4.position.set(-2.5, 22, 5.1);
  g.add(s4);
  const s5 = new THREE6.Mesh(COW_GEO.spot16, COW_SPOT_MAT);
  s5.position.set(3, 15, 5.1);
  g.add(s5);
  const s6 = new THREE6.Mesh(COW_GEO.spot24, COW_SPOT_MAT);
  s6.position.set(2, 19, -5.1);
  s6.rotation.y = Math.PI;
  g.add(s6);
  const s7 = new THREE6.Mesh(COW_GEO.spot18, COW_SPOT_MAT);
  s7.position.set(-3, 24, -5.1);
  s7.rotation.y = Math.PI;
  g.add(s7);
  const head = new THREE6.Mesh(COW_GEO.head, bodyMat);
  head.position.set(0, 33, 0);
  head.castShadow = true;
  g.add(head);
  const e1 = new THREE6.Mesh(COW_GEO.eye, COW_EYE_MAT);
  e1.position.set(-3, 35, 5);
  g.add(e1);
  const e2 = new THREE6.Mesh(COW_GEO.eye, COW_EYE_MAT);
  e2.position.set(3, 35, 5);
  g.add(e2);
  const p1 = new THREE6.Mesh(COW_GEO.pupil, COW_PUPIL_MAT);
  p1.position.set(-3, 35, 6.5);
  g.add(p1);
  const p2 = new THREE6.Mesh(COW_GEO.pupil, COW_PUPIL_MAT);
  p2.position.set(3, 35, 6.5);
  g.add(p2);
  if (personality === "aggressive") {
    const brow1 = new THREE6.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow1.position.set(-3, 37, 5.5);
    brow1.rotation.z = -0.4;
    g.add(brow1);
    const brow2 = new THREE6.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow2.position.set(3, 37, 5.5);
    brow2.rotation.z = 0.4;
    g.add(brow2);
    const frown = new THREE6.Mesh(COW_GEO.mouth2, COW_MOUTH_MAT);
    frown.position.set(0, 31.5, 5.5);
    g.add(frown);
  } else if (personality === "timid") {
    const brow1 = new THREE6.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow1.position.set(-3, 37, 5.5);
    brow1.rotation.z = 0.3;
    g.add(brow1);
    const brow2 = new THREE6.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow2.position.set(3, 37, 5.5);
    brow2.rotation.z = -0.3;
    g.add(brow2);
    const sad = new THREE6.Mesh(COW_GEO.mouth15, COW_MOUTH_MAT);
    sad.position.set(0, 32, 5.5);
    g.add(sad);
  } else {
    const smile = new THREE6.Mesh(COW_GEO.mouth2, COW_MOUTH_MAT);
    smile.position.set(0, 31.5, 5.5);
    smile.rotation.set(0, 0, Math.PI);
    g.add(smile);
  }
  const cigGroup = new THREE6.Group();
  const cigBody = new THREE6.Mesh(COW_GEO.cigBody, COW_CIG_BODY_MAT);
  cigBody.rotation.z = Math.PI / 2;
  cigBody.position.x = 0;
  cigGroup.add(cigBody);
  const filter = new THREE6.Mesh(COW_GEO.cigFilter, COW_CIG_FILTER_MAT);
  filter.rotation.z = Math.PI / 2;
  filter.position.x = -2.75;
  cigGroup.add(filter);
  const ember = new THREE6.Mesh(COW_GEO.cigEmber, COW_CIG_EMBER_MAT);
  ember.position.x = 2.2;
  cigGroup.add(ember);
  const emberGlow = new THREE6.Mesh(COW_GEO.cigEmberGlow, COW_CIG_EMBER_GLOW_MAT);
  emberGlow.position.x = 2.2;
  cigGroup.add(emberGlow);
  cigGroup.position.set(4, 31, 6);
  cigGroup.rotation.z = -0.2;
  g.add(cigGroup);
  g.userData.smokeOrigin = new THREE6.Vector3(6.2, 30.6, 6);
  const h1 = new THREE6.Mesh(COW_GEO.horn, bodyMat);
  h1.position.set(-4, 41, 0);
  h1.rotation.set(0, 0, -0.3);
  g.add(h1);
  const h2 = new THREE6.Mesh(COW_GEO.horn, bodyMat);
  h2.position.set(4, 41, 0);
  h2.rotation.set(0, 0, 0.3);
  g.add(h2);
  const legL = new THREE6.Mesh(COW_GEO.leg, bodyMat);
  legL.position.set(-4, 3, 0);
  g.add(legL);
  const legR = new THREE6.Mesh(COW_GEO.leg, bodyMat);
  legR.position.set(4, 3, 0);
  g.add(legR);
  const hoof1 = new THREE6.Mesh(COW_GEO.hoof, COW_HOOF_MAT);
  hoof1.position.set(-4, -1, 0);
  g.add(hoof1);
  const hoof2 = new THREE6.Mesh(COW_GEO.hoof, COW_HOOF_MAT);
  hoof2.position.set(4, -1, 0);
  g.add(hoof2);
  const udder = new THREE6.Mesh(COW_GEO.udder, COW_UDDER_MAT);
  udder.position.set(0, 13, 5.5);
  udder.scale.set(1, 0.7, 0.8);
  g.add(udder);
  const teat1 = new THREE6.Mesh(COW_GEO.teat, COW_UDDER_MAT);
  teat1.position.set(-1.5, 13, 7);
  teat1.rotation.x = Math.PI / 2;
  g.add(teat1);
  const teat2 = new THREE6.Mesh(COW_GEO.teat, COW_UDDER_MAT);
  teat2.position.set(1.5, 13, 7);
  teat2.rotation.x = Math.PI / 2;
  g.add(teat2);
  const armL = new THREE6.Mesh(COW_GEO.arm, bodyMat);
  armL.position.set(-9, 20, 0);
  armL.rotation.z = 0.3;
  g.add(armL);
  const armR = new THREE6.Mesh(COW_GEO.arm, bodyMat);
  armR.position.set(9, 20, 0);
  armR.rotation.z = -0.3;
  g.add(armR);
  return g;
}
function spawnParts(pid) {
  const p = state_default.serverPlayers.find((pp) => pp.id === pid);
  if (!p) return;
  if (!_eatGeo) _eatGeo = markSharedGeometry(new THREE6.SphereGeometry(1.5, 4, 4));
  for (let i = 0; i < 5; i++) {
    const mat = new THREE6.MeshBasicMaterial({ color: 16729156, transparent: true });
    const g = new THREE6.Mesh(_eatGeo, mat);
    g.position.set(p.x, 10, p.y);
    scene.add(g);
    setTimeout(() => {
      scene.remove(g);
      mat.dispose();
    }, 600);
  }
}
function updateCows(time, dt) {
  const seen = /* @__PURE__ */ new Set();
  const nowMs = performance.now();
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
      const ntex = new THREE6.CanvasTexture(nc);
      ntex.minFilter = THREE6.LinearFilter;
      const nmat = new THREE6.SpriteMaterial({ map: ntex, transparent: true, depthTest: false });
      const nsprite = new THREE6.Sprite(nmat);
      nsprite.position.set(0, 50, 0);
      nsprite.scale.set(40, 10, 1);
      m.add(nsprite);
      const hatType = ["cowboy", "wizard", "party", "crown", "cap"][Math.abs(p.id || 0) % 5];
      m.add(cloneHat(hatType));
      state_default.cowMeshes[pid] = { mesh: m };
    }
    const cowObj = state_default.cowMeshes[pid];
    const cm = cowObj.mesh;
    const smooth = interpSamplePlayer(p, nowMs);
    if (!cowObj.isDead) {
      cm.position.x = smooth.x;
      cm.position.z = smooth.y;
      cm.position.y = smooth.z !== void 0 ? smooth.z : getTerrainHeight(smooth.x, smooth.y);
      const sz = p.sizeMult || 1;
      const crouchY = p.crouching ? 0.5 : 1;
      cm.scale.set(sz, sz * crouchY, sz);
    }
    cm.visible = true;
    if (!p.alive && !cowObj.isDead) {
      cowObj.isDead = true;
      cm.rotation.z = Math.PI / 2;
      cm.position.y = (smooth.z !== void 0 ? smooth.z : getTerrainHeight(smooth.x, smooth.y)) + 5;
      if (cowObj.shieldBubble) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      }
      if (cowObj.spawnBubble) {
        cm.remove(cowObj.spawnBubble);
        cowObj.spawnBubble.material.dispose();
        cowObj.spawnBubble = null;
      }
      cm.traverse((c) => {
        if (!c.isMesh || !c.material) return;
        const fresh = c.material.clone();
        if (!fresh.transparent) {
          fresh.transparent = true;
          fresh.opacity = 0.5;
        } else {
          fresh.opacity *= 0.5;
        }
        c.material = fresh;
      });
    }
    if (smooth.aim !== void 0) {
      cm.rotation.y = smooth.aim;
    }
    if (state_default.debugMode && p.alive) {
      const eh = 35 * (p.sizeMult || 1);
      const headBase = eh * 0.75;
      if (!cowObj.debugBody) {
        cowObj.debugBody = new THREE6.Mesh(DEBUG_BODY_GEO, DEBUG_BODY_MAT);
        cm.add(cowObj.debugBody);
        cowObj.debugHead = new THREE6.Mesh(DEBUG_HEAD_GEO, DEBUG_HEAD_MAT);
        cm.add(cowObj.debugHead);
        const muzzleY = 35;
        const arrowShaft = new THREE6.Mesh(DEBUG_ARROW_SHAFT_GEO, DEBUG_ARROW_MAT);
        arrowShaft.rotation.x = Math.PI / 2;
        arrowShaft.position.set(0, muzzleY, 15);
        const arrowHead = new THREE6.Mesh(DEBUG_ARROW_HEAD_GEO, DEBUG_ARROW_MAT);
        arrowHead.rotation.x = Math.PI / 2;
        arrowHead.position.set(0, muzzleY, 32);
        const arrowGroup = new THREE6.Group();
        arrowGroup.add(arrowShaft);
        arrowGroup.add(arrowHead);
        cm.add(arrowGroup);
        cowObj.debugArrow = arrowGroup;
      }
      cowObj.debugBody.position.set(0, headBase / 2, 0);
      cowObj.debugBody.scale.y = headBase;
      cowObj.debugBody.visible = true;
      cowObj.debugHead.position.set(0, headBase + 10, 0);
      cowObj.debugHead.visible = true;
      if (cowObj.debugArrow) cowObj.debugArrow.visible = true;
    } else if (cowObj.debugBody) {
      cowObj.debugBody.visible = false;
      cowObj.debugHead.visible = false;
      if (cowObj.debugArrow) cowObj.debugArrow.visible = false;
    }
    if (p.alive && !cowObj.isDead && cm.userData.smokeOrigin && Math.random() < 0.02) {
      const so = cm.userData.smokeOrigin;
      _wispTmpPos.set(so.x, so.y, so.z);
      cm.localToWorld(_wispTmpPos);
      spawnParticle({
        geo: PGEO_SPHERE_LO,
        color: 13421772,
        x: _wispTmpPos.x,
        y: _wispTmpPos.y,
        z: _wispTmpPos.z,
        sx: 0.6,
        life: 0.8 + Math.random() * 0.4,
        peakOpacity: 0.4,
        vx: (Math.random() - 0.5) * 3,
        vy: 8 + Math.random() * 5,
        vz: (Math.random() - 0.5) * 3,
        growth: 2
      });
    }
    if (!cowObj.hpSprite) {
      const hc = document.createElement("canvas");
      hc.width = 128;
      hc.height = 16;
      const htex = new THREE6.CanvasTexture(hc);
      htex.minFilter = THREE6.LinearFilter;
      const hmat = new THREE6.SpriteMaterial({ map: htex, transparent: true, depthTest: false });
      const hs = new THREE6.Sprite(hmat);
      hs.position.set(0, 48, 0);
      hs.scale.set(30, 4, 1);
      cm.add(hs);
      cowObj.hpSprite = { sprite: hs, canvas: hc, ctx: hc.getContext("2d"), tex: htex };
    }
    const armorVal = p.armor || 0;
    if (p.alive && armorVal > 0 && !cowObj.shieldBubble) {
      const shieldMat = new THREE6.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.55, side: THREE6.DoubleSide });
      const shield = new THREE6.Mesh(SHIELD_BUBBLE_GEO, shieldMat);
      shield.position.set(0, 14, 0);
      cm.add(shield);
      cowObj.shieldBubble = shield;
    }
    if (cowObj.shieldBubble) {
      if (!p.alive || armorVal <= 0) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      } else {
        cowObj.shieldBubble.material.opacity = Math.max(0.2, armorVal / 100 * 0.6);
      }
    }
    if (p.spawnProt && !cowObj.spawnBubble) {
      const spMat = new THREE6.MeshBasicMaterial({ color: 16772676, transparent: true, opacity: 0.2, side: THREE6.DoubleSide });
      const sp = new THREE6.Mesh(SPAWN_BUBBLE_GEO, spMat);
      sp.position.set(0, 14, 0);
      cm.add(sp);
      cowObj.spawnBubble = sp;
    }
    if (cowObj.spawnBubble && !p.spawnProt) {
      cm.remove(cowObj.spawnBubble);
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
      disposeMeshTree(obj.mesh);
      if (obj.hpSprite) obj.hpSprite.tex.dispose();
      if (obj.shieldBubble) obj.shieldBubble.material.dispose();
      if (obj.spawnBubble) obj.spawnBubble.material.dispose();
      delete state_default.cowMeshes[id];
    }
  }
}
var _wispTmpPos, COW_GEO, COW_SPOT_MAT, COW_UDDER_MAT, COW_HOOF_MAT, COW_EYE_MAT, COW_PUPIL_MAT, COW_MOUTH_MAT, COW_CIG_BODY_MAT, COW_CIG_FILTER_MAT, COW_CIG_EMBER_MAT, COW_CIG_EMBER_GLOW_MAT, _cowBodyMats, _HAT_TEMPLATES, SHIELD_BUBBLE_GEO, SPAWN_BUBBLE_GEO, DEBUG_BODY_GEO, DEBUG_HEAD_GEO, DEBUG_ARROW_SHAFT_GEO, DEBUG_ARROW_HEAD_GEO, DEBUG_BODY_MAT, DEBUG_HEAD_MAT, DEBUG_ARROW_MAT, _eatGeo;
var init_entities = __esm({
  "client/entities.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    init_particles();
    init_three_utils();
    init_interp();
    _wispTmpPos = new THREE6.Vector3();
    COW_GEO = {
      torso: new THREE6.BoxGeometry(14, 18, 10),
      head: new THREE6.BoxGeometry(10, 10, 10),
      spotLarge: new THREE6.CircleGeometry(3, 8),
      // side spots
      spot25: new THREE6.CircleGeometry(2.5, 8),
      // top spot
      spot22: new THREE6.CircleGeometry(2.2, 8),
      // chest spot
      spot16: new THREE6.CircleGeometry(1.6, 8),
      // chest spot small
      spot24: new THREE6.CircleGeometry(2.4, 8),
      // rump spot
      spot18: new THREE6.CircleGeometry(1.8, 8),
      // rump spot small
      eye: new THREE6.SphereGeometry(2, 6, 6),
      pupil: new THREE6.SphereGeometry(1, 6, 6),
      brow: new THREE6.BoxGeometry(3, 0.6, 0.6),
      mouth2: new THREE6.TorusGeometry(2, 0.4, 6, 12, Math.PI),
      // smile + frown
      mouth15: new THREE6.TorusGeometry(1.5, 0.4, 6, 12, Math.PI),
      // sad
      cigBody: new THREE6.CylinderGeometry(0.4, 0.4, 4, 4),
      cigFilter: new THREE6.CylinderGeometry(0.45, 0.45, 1.5, 4),
      cigEmber: new THREE6.SphereGeometry(0.5, 4, 4),
      cigEmberGlow: new THREE6.SphereGeometry(1, 4, 4),
      horn: new THREE6.ConeGeometry(1.5, 8, 5),
      leg: new THREE6.CylinderGeometry(2.5, 2, 12, 5),
      hoof: new THREE6.BoxGeometry(4, 2, 5),
      udder: new THREE6.SphereGeometry(3, 6, 6),
      teat: new THREE6.CylinderGeometry(0.5, 0.3, 2, 4),
      arm: new THREE6.CylinderGeometry(1.5, 1.5, 12, 5)
    };
    for (const g of Object.values(COW_GEO)) markSharedGeometry(g);
    COW_SPOT_MAT = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16777215 }));
    COW_UDDER_MAT = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 16746666 }));
    COW_HOOF_MAT = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 4473924 }));
    COW_EYE_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 16777215 }));
    COW_PUPIL_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 2236962 }));
    COW_MOUTH_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 2236962 }));
    COW_CIG_BODY_MAT = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 15658734 }));
    COW_CIG_FILTER_MAT = markSharedMaterial(new THREE6.MeshLambertMaterial({ color: 14518323 }));
    COW_CIG_EMBER_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 16729088 }));
    COW_CIG_EMBER_GLOW_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 16737792, transparent: true, opacity: 0.25 }));
    _cowBodyMats = /* @__PURE__ */ new Map();
    _HAT_TEMPLATES = {
      cowboy: _buildCowboyHatTemplate(),
      wizard: _buildWizardHatTemplate(),
      crown: _buildCrownHatTemplate(),
      cap: _buildCapHatTemplate(),
      party: _buildPartyHatTemplate()
    };
    SHIELD_BUBBLE_GEO = markSharedGeometry(new THREE6.SphereGeometry(24, 12, 12));
    SPAWN_BUBBLE_GEO = markSharedGeometry(new THREE6.SphereGeometry(25, 12, 12));
    DEBUG_BODY_GEO = markSharedGeometry(new THREE6.CylinderGeometry(18, 18, 1, 12));
    DEBUG_HEAD_GEO = markSharedGeometry(new THREE6.CylinderGeometry(12, 12, 20, 12));
    DEBUG_ARROW_SHAFT_GEO = markSharedGeometry(new THREE6.CylinderGeometry(0.8, 0.8, 30, 6));
    DEBUG_ARROW_HEAD_GEO = markSharedGeometry(new THREE6.ConeGeometry(2.5, 5, 6));
    DEBUG_BODY_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 65280, wireframe: true, transparent: true, opacity: 0.3 }));
    DEBUG_HEAD_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 16729156, wireframe: true, transparent: true, opacity: 0.3 }));
    DEBUG_ARROW_MAT = markSharedMaterial(new THREE6.MeshBasicMaterial({ color: 16768256, wireframe: true, transparent: true, opacity: 0.7 }));
    _eatGeo = null;
  }
});

// client/map-objects.js
import * as THREE7 from "three";
function destroyWall(id) {
  const slot = _wallSlotsById[id];
  if (!slot) return;
  const { center, minX, maxX, minZ, maxZ, stains } = slot;
  const spreadX = Math.max(20, maxX - minX + 30);
  const spreadZ = Math.max(20, maxZ - minZ + 30);
  const th = getTerrainHeight(center.x, center.z);
  for (let i = 0; i < 18; i++) {
    const useTrim = Math.random() < 0.25;
    const size = 2 + Math.random() * 4;
    spawnParticle({
      geo: PGEO_BOX,
      color: useTrim ? 13156520 : 8006182,
      x: center.x + (Math.random() - 0.5) * spreadX,
      y: th + size * 0.2 + Math.random() * 2,
      z: center.z + (Math.random() - 0.5) * spreadZ,
      sx: size,
      sy: size * 0.4,
      sz: size * 0.7,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      life: 5
    });
  }
  if (_wallBodyIM) {
    for (const i of slot.body) _wallBodyIM.setMatrixAt(i, _HIDDEN);
    _wallBodyIM.instanceMatrix.needsUpdate = true;
  }
  if (_wallTrimIM) {
    for (const i of slot.trim) _wallTrimIM.setMatrixAt(i, _HIDDEN);
    _wallTrimIM.instanceMatrix.needsUpdate = true;
  }
  if (_wallCapIM) {
    for (const i of slot.cap) _wallCapIM.setMatrixAt(i, _HIDDEN);
    _wallCapIM.instanceMatrix.needsUpdate = true;
  }
  if (_wallXBeamIM) {
    for (const i of slot.xBeams) _wallXBeamIM.setMatrixAt(i, _HIDDEN);
    _wallXBeamIM.instanceMatrix.needsUpdate = true;
  }
  stains.forEach((m) => {
    scene.remove(m);
    if (m.geometry) m.geometry.dispose();
    if (m.material) m.material.dispose();
    const idx = _mapMeshes.indexOf(m);
    if (idx >= 0) _mapMeshes.splice(idx, 1);
  });
  delete _wallSlotsById[id];
}
function buildMap() {
  if (state_default.mapBuilt) return;
  state_default.mapBuilt = true;
  _mapMeshes.forEach((m) => disposeMeshTree(m));
  _mapMeshes = [];
  [_wallBodyIM, _wallTrimIM, _wallCapIM, _wallXBeamIM].forEach((im) => {
    if (im) {
      scene.remove(im);
      im.geometry.dispose();
    }
  });
  _wallBodyIM = _wallTrimIM = _wallCapIM = _wallXBeamIM = null;
  for (const id in _wallSlotsById) delete _wallSlotsById[id];
  function addMap(m) {
    scene.add(m);
    _mapMeshes.push(m);
    return m;
  }
  const wm = new THREE7.MeshLambertMaterial({ color: 8006182 });
  const trimMat = new THREE7.MeshLambertMaterial({ color: 13156520 });
  const capMat = new THREE7.MeshLambertMaterial({ color: 4861978 });
  const xMat = new THREE7.MeshLambertMaterial({ color: 13156520 });
  const weatherMat = new THREE7.MeshLambertMaterial({ color: 3807764, transparent: true, opacity: 0.55 });
  const wallH = 70;
  const bodyXforms = [];
  const trimXforms = [];
  const capXforms = [];
  const xBeamXforms = [];
  const stainMeshesByWall = {};
  (state_default.mapFeatures.walls || []).forEach((w) => {
    const wid = w.id;
    const ww = Math.max(w.w, 20), wh = Math.max(w.h, 20);
    const isHoriz = ww > wh;
    const len = isHoriz ? ww : wh;
    const segSize = 20;
    const segs = Math.max(1, Math.ceil(len / segSize));
    if (wid !== void 0) {
      _wallSlotsById[wid] = {
        body: [],
        trim: [],
        cap: [],
        xBeams: [],
        stains: [],
        center: { x: w.x + ww / 2, z: w.y + wh / 2 },
        minX: w.x,
        maxX: w.x + ww,
        minZ: w.y,
        maxZ: w.y + wh
      };
      stainMeshesByWall[wid] = _wallSlotsById[wid].stains;
    }
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
      bodyXforms.push({ sx, sy: wallH / 2 + th, sz, sw: sw + 1, sh: wallH, sd: sh + 1, wallId: wid });
      trimXforms.push({ sx, sy: wallH * 0.6 + th, sz, sw: sw + 1.5, sh: 3, sd: sh + 1.5, wallId: wid });
      capXforms.push({ sx, sy: wallH + 2.5 + th, sz, sw: sw + 2, sh: 5, sd: sh + 2, wallId: wid });
      for (let sc = 0; sc < 3; sc++) {
        const stain = new THREE7.Mesh(new THREE7.CircleGeometry(2 + Math.random() * 3, 6), weatherMat);
        const faceSign = Math.random() > 0.5 ? 1 : -1;
        const stainY = wallH * (0.15 + Math.random() * 0.7) + th;
        if (isHoriz) {
          stain.position.set(sx + (Math.random() - 0.5) * sw, stainY, sz + faceSign * (sh / 2 + 1.6));
          if (faceSign < 0) stain.rotation.y = Math.PI;
        } else {
          stain.position.set(sx + faceSign * (sw / 2 + 1.6), stainY, sz + (Math.random() - 0.5) * sh);
          stain.rotation.y = faceSign > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
        scene.add(stain);
        _mapMeshes.push(stain);
        if (wid !== void 0) stainMeshesByWall[wid].push(stain);
      }
      const faceW = isHoriz ? sw : sh;
      const diagLen = Math.hypot(faceW, wallH * 0.55);
      const diagAngle = Math.atan2(wallH * 0.55, faceW);
      const faceOffset = isHoriz ? sh / 2 + 1.5 : sw / 2 + 1.5;
      const beamY = wallH * 0.3 + th;
      const beams = [
        { px: isHoriz ? sx : sx + faceOffset, pz: isHoriz ? sz + faceOffset : sz, ang: diagAngle, isHoriz },
        { px: isHoriz ? sx : sx + faceOffset, pz: isHoriz ? sz + faceOffset : sz, ang: -diagAngle, isHoriz },
        { px: isHoriz ? sx : sx - faceOffset, pz: isHoriz ? sz - faceOffset : sz, ang: diagAngle, isHoriz },
        { px: isHoriz ? sx : sx - faceOffset, pz: isHoriz ? sz - faceOffset : sz, ang: -diagAngle, isHoriz }
      ];
      for (const b of beams) {
        xBeamXforms.push({ px: b.px, py: beamY, pz: b.pz, len: diagLen, ang: b.ang, isHoriz: b.isHoriz, wallId: wid });
      }
    }
  });
  const unitBox = new THREE7.BoxGeometry(1, 1, 1);
  const unitBeam = new THREE7.BoxGeometry(1, 2.5, 1);
  function buildBoxIM(xforms, geo, mat, slotKey) {
    if (xforms.length === 0) return null;
    const im = new THREE7.InstancedMesh(geo, mat, xforms.length);
    for (let i = 0; i < xforms.length; i++) {
      const x = xforms[i];
      _tmpWallPos.set(x.sx, x.sy, x.sz);
      _tmpWallQuat.identity();
      _tmpWallScale.set(x.sw, x.sh, x.sd);
      _tmpWallMat4.compose(_tmpWallPos, _tmpWallQuat, _tmpWallScale);
      im.setMatrixAt(i, _tmpWallMat4);
      if (x.wallId !== void 0) _wallSlotsById[x.wallId][slotKey].push(i);
    }
    im.instanceMatrix.needsUpdate = true;
    scene.add(im);
    return im;
  }
  _wallBodyIM = buildBoxIM(bodyXforms, unitBox, wm, "body");
  if (_wallBodyIM) _wallBodyIM.castShadow = true;
  _wallTrimIM = buildBoxIM(trimXforms, unitBox, trimMat, "trim");
  _wallCapIM = buildBoxIM(capXforms, unitBox, capMat, "cap");
  if (xBeamXforms.length > 0) {
    _wallXBeamIM = new THREE7.InstancedMesh(unitBeam, xMat, xBeamXforms.length);
    for (let i = 0; i < xBeamXforms.length; i++) {
      const x = xBeamXforms[i];
      _tmpWallPos.set(x.px, x.py, x.pz);
      _tmpWallEuler.set(0, x.isHoriz ? 0 : Math.PI / 2, x.ang, "XYZ");
      _tmpWallQuat.setFromEuler(_tmpWallEuler);
      _tmpWallScale.set(x.len, 1, 1);
      _tmpWallMat4.compose(_tmpWallPos, _tmpWallQuat, _tmpWallScale);
      _wallXBeamIM.setMatrixAt(i, _tmpWallMat4);
      if (x.wallId !== void 0) _wallSlotsById[x.wallId].xBeams.push(i);
    }
    _wallXBeamIM.instanceMatrix.needsUpdate = true;
    scene.add(_wallXBeamIM);
  }
  const pm = new THREE7.MeshBasicMaterial({ color: 13404415, transparent: true, opacity: 0.6 });
  (state_default.mapFeatures.portals || []).forEach((p) => {
    [[p.x1, p.y1], [p.x2, p.y2]].forEach(([px, pz]) => {
      const th = getTerrainHeight(px, pz);
      const mesh = new THREE7.Mesh(new THREE7.TorusGeometry(20, 3, 8, 16), pm);
      mesh.position.set(px, th + 20, pz);
      mesh.rotation.x = Math.PI / 2;
      addMap(mesh);
    });
  });
  const barnWallMat = new THREE7.MeshLambertMaterial({ color: 8006182 });
  const barnRoofMat = new THREE7.MeshLambertMaterial({ color: 4861978 });
  const barnTrimMat = new THREE7.MeshLambertMaterial({ color: 13156520 });
  (state_default.mapFeatures.shelters || []).forEach((s) => {
    const th = getTerrainHeight(s.x, s.y);
    const bw = s.r * 2 || 60, bd = s.r * 2 || 60, bh = 35;
    const stiltH = 100;
    const g = new THREE7.Group();
    const stiltGeo = new THREE7.CylinderGeometry(3, 3, stiltH, 6);
    const stiltMat = new THREE7.MeshLambertMaterial({ color: 6964258 });
    [[-bw / 2 + 4, -bd / 2 + 4], [bw / 2 - 4, -bd / 2 + 4], [-bw / 2 + 4, bd / 2 - 4], [bw / 2 - 4, bd / 2 - 4]].forEach(([sx2, sz2]) => {
      const stilt = new THREE7.Mesh(stiltGeo, stiltMat);
      stilt.position.set(sx2, stiltH / 2, sz2);
      stilt.castShadow = true;
      g.add(stilt);
    });
    const braceGeo = new THREE7.BoxGeometry(bw - 8, 3, 3);
    const brace1 = new THREE7.Mesh(braceGeo, stiltMat);
    brace1.position.set(0, stiltH * 0.3, -bd / 2 + 4);
    g.add(brace1);
    const brace2 = new THREE7.Mesh(braceGeo, stiltMat);
    brace2.position.set(0, stiltH * 0.3, bd / 2 - 4);
    g.add(brace2);
    const floorMat = new THREE7.MeshLambertMaterial({ color: 9136404 });
    const floor = new THREE7.Mesh(new THREE7.BoxGeometry(bw + 4, 3, bd + 4), floorMat);
    floor.position.y = stiltH;
    g.add(floor);
    const walls = new THREE7.Mesh(new THREE7.BoxGeometry(bw, bh, bd), barnWallMat);
    walls.position.y = stiltH + bh / 2;
    walls.castShadow = true;
    g.add(walls);
    const trim = new THREE7.Mesh(new THREE7.BoxGeometry(bw + 0.5, 3, bd + 0.5), barnTrimMat);
    trim.position.y = stiltH + bh * 0.6;
    g.add(trim);
    const roofW = bw + 10, roofD = bd + 6;
    const roofGeo = new THREE7.BoxGeometry(roofW, 4, roofD);
    const roofL = new THREE7.Mesh(roofGeo, barnRoofMat);
    roofL.position.set(-roofW * 0.2, stiltH + bh + 8, 0);
    roofL.rotation.z = 0.4;
    roofL.castShadow = true;
    g.add(roofL);
    const roofR = new THREE7.Mesh(roofGeo, barnRoofMat);
    roofR.position.set(roofW * 0.2, stiltH + bh + 8, 0);
    roofR.rotation.z = -0.4;
    roofR.castShadow = true;
    g.add(roofR);
    const ridge = new THREE7.Mesh(new THREE7.BoxGeometry(4, 4, roofD + 2), barnRoofMat);
    ridge.position.y = stiltH + bh + 14;
    g.add(ridge);
    const doorMat = new THREE7.MeshLambertMaterial({ color: 3351057 });
    const door = new THREE7.Mesh(new THREE7.BoxGeometry(bw * 0.35, bh * 0.7, 0.5), doorMat);
    door.position.set(0, stiltH + bh * 0.35, bd / 2 + 0.3);
    g.add(door);
    const windowMat = new THREE7.MeshLambertMaterial({ color: 16768392 });
    const win = new THREE7.Mesh(new THREE7.BoxGeometry(8, 8, 0.5), windowMat);
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
    const stex2 = new THREE7.CanvasTexture(sc);
    stex2.minFilter = THREE7.LinearFilter;
    const ss = new THREE7.Sprite(new THREE7.SpriteMaterial({ map: stex2, transparent: true, depthTest: false }));
    ss.position.set(0, stiltH + bh + 22, 0);
    ss.scale.set(40, 10, 1);
    g.add(ss);
    g.position.set(s.x, th, s.y);
    addMap(g);
  });
  (state_default.mapFeatures.houses || []).forEach((h) => {
    const th = getTerrainHeight(h.cx, h.cy);
    const wallH2 = 70;
    const houseGroup = new THREE7.Group();
    const roofMat = new THREE7.MeshLambertMaterial({ color: 4861978 });
    const frameMat = new THREE7.MeshLambertMaterial({ color: 3809306 });
    const glassMat = new THREE7.MeshLambertMaterial({ color: 8965375, transparent: true, opacity: 0.55 });
    const doorMat = new THREE7.MeshLambertMaterial({ color: 5912608 });
    const isLongX = h.w >= h.d;
    const longLen = isLongX ? h.w : h.d;
    const shortLen = isLongX ? h.d : h.w;
    const eaveOverhang = 10;
    const roofSlabW = shortLen / 2 + eaveOverhang;
    const roofSlabD = longLen + eaveOverhang * 2;
    const roofGeo = new THREE7.BoxGeometry(roofSlabW, 3, roofSlabD);
    const roofLift = 20;
    const slopeA = Math.atan2(roofLift, shortLen / 2);
    const roofL = new THREE7.Mesh(roofGeo, roofMat);
    const roofR = new THREE7.Mesh(roofGeo, roofMat);
    roofL.castShadow = true;
    roofR.castShadow = true;
    const slabCenterOffset = shortLen / 4 * Math.cos(slopeA);
    const slabHeight = wallH2 + roofLift / 2;
    if (isLongX) {
      roofL.rotation.x = slopeA;
      roofR.rotation.x = -slopeA;
      roofL.position.set(0, slabHeight, -slabCenterOffset);
      roofR.position.set(0, slabHeight, slabCenterOffset);
    } else {
      roofL.rotation.z = -slopeA;
      roofR.rotation.z = slopeA;
      roofL.position.set(-slabCenterOffset, slabHeight, 0);
      roofR.position.set(slabCenterOffset, slabHeight, 0);
    }
    houseGroup.add(roofL);
    houseGroup.add(roofR);
    const ridgeGeo = isLongX ? new THREE7.BoxGeometry(4, 4, longLen + eaveOverhang * 2) : new THREE7.BoxGeometry(longLen + eaveOverhang * 2, 4, 4);
    const ridge = new THREE7.Mesh(ridgeGeo, roofMat);
    ridge.position.y = wallH2 + roofLift;
    houseGroup.add(ridge);
    const T = 20;
    const doorW = 60, doorH = 50;
    const doorPlacement = (() => {
      if (h.doorSide === "N") return [0, -h.d / 2 + T / 2, 0];
      if (h.doorSide === "S") return [0, h.d / 2 - T / 2, Math.PI];
      if (h.doorSide === "W") return [-h.w / 2 + T / 2, 0, Math.PI / 2];
      return [h.w / 2 - T / 2, 0, -Math.PI / 2];
    })();
    const [dLocalX, dLocalZ, dFacingY] = doorPlacement;
    const frame = new THREE7.Mesh(new THREE7.BoxGeometry(doorW + 6, doorH + 6, T + 2), frameMat);
    frame.position.set(dLocalX, doorH / 2, dLocalZ);
    frame.rotation.y = dFacingY;
    houseGroup.add(frame);
    const door = new THREE7.Mesh(new THREE7.BoxGeometry(doorW, doorH, 2), doorMat);
    const ajar = 0.3;
    door.position.set(dLocalX, doorH / 2, dLocalZ);
    door.rotation.y = dFacingY + ajar;
    houseGroup.add(door);
    const winW = 28, winH = 22, winY = wallH2 * 0.55;
    const winSides = ["N", "S", "E", "W"].filter((s) => s !== h.doorSide);
    for (const side of winSides) {
      let lx, lz, rot;
      if (side === "N") {
        lx = 0;
        lz = -h.d / 2;
        rot = 0;
      } else if (side === "S") {
        lx = 0;
        lz = h.d / 2;
        rot = Math.PI;
      } else if (side === "W") {
        lx = -h.w / 2;
        lz = 0;
        rot = Math.PI / 2;
      } else {
        lx = h.w / 2;
        lz = 0;
        rot = -Math.PI / 2;
      }
      const winFrame = new THREE7.Mesh(new THREE7.BoxGeometry(winW + 4, winH + 4, T + 1), frameMat);
      winFrame.position.set(lx, winY, lz);
      winFrame.rotation.y = rot;
      houseGroup.add(winFrame);
      const glass = new THREE7.Mesh(new THREE7.BoxGeometry(winW, winH, T + 2), glassMat);
      glass.position.set(lx, winY, lz);
      glass.rotation.y = rot;
      houseGroup.add(glass);
    }
    houseGroup.position.set(h.cx, th, h.cy);
    addMap(houseGroup);
  });
}
function _buildBarricadeTemplate() {
  const W = 52, H_DEPTH = 8, H2 = 55;
  const g = new THREE7.Group();
  const plankMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 7030048 }));
  const darkPlank = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 4861717 }));
  const weatherStain = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 2759176, transparent: true, opacity: 0.6 }));
  const metalMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 5920096 }));
  const rivetMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 2762284 }));
  const rustMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 5909008, transparent: true, opacity: 0.7 }));
  const body = new THREE7.Mesh(markSharedGeometry(new THREE7.BoxGeometry(W, H2, H_DEPTH)), plankMat);
  body.position.set(0, H2 / 2, 0);
  body.castShadow = true;
  g.add(body);
  const stripeGeo = markSharedGeometry(new THREE7.BoxGeometry(W + 0.2, 1.5, H_DEPTH + 0.2));
  for (let i = 1; i < 4; i++) {
    const stripe = new THREE7.Mesh(stripeGeo, darkPlank);
    stripe.position.set(0, H2 / 4 * i, 0);
    g.add(stripe);
  }
  const plateInset = 4;
  const plateGeo = markSharedGeometry(new THREE7.BoxGeometry(W - plateInset * 2, H2 - plateInset * 2, 0.8));
  const rivetGeo = markSharedGeometry(new THREE7.SphereGeometry(0.7, 5, 5));
  const rustGeo = markSharedGeometry(new THREE7.CircleGeometry(1, 6));
  for (const side of [1, -1]) {
    const plate = new THREE7.Mesh(plateGeo, metalMat);
    plate.position.set(0, H2 / 2, side * (H_DEPTH / 2 + 0.3));
    g.add(plate);
    for (let rp = 0; rp < 3; rp++) {
      const rust = new THREE7.Mesh(rustGeo, rustMat);
      const r = 1.5 + Math.random() * 2;
      rust.scale.set(r, r, 1);
      rust.position.set((Math.random() - 0.5) * (W - plateInset * 2 - 4), plateInset + 3 + Math.random() * (H2 - plateInset * 2 - 6), side * (H_DEPTH / 2 + 0.85));
      if (side < 0) rust.rotation.y = Math.PI;
      g.add(rust);
    }
    const rivetCols = 5, rivetRows = 3;
    for (let rc = 0; rc < rivetCols; rc++) {
      for (let rr = 0; rr < rivetRows; rr++) {
        const rivet = new THREE7.Mesh(rivetGeo, rivetMat);
        const rx = -W / 2 + plateInset + 3 + rc * (W - plateInset * 2 - 6) / (rivetCols - 1);
        const ry = plateInset + 3 + rr * (H2 - plateInset * 2 - 6) / (rivetRows - 1);
        rivet.position.set(rx, ry, side * (H_DEPTH / 2 + 0.9));
        g.add(rivet);
      }
    }
  }
  const streakGeo = markSharedGeometry(new THREE7.BoxGeometry(0.5, H2 - 8, 0.3));
  for (let ws = 0; ws < 2; ws++) {
    const streak = new THREE7.Mesh(streakGeo, weatherStain);
    streak.position.set(-W / 2 + 4 + ws * (W - 8), H2 / 2, H_DEPTH / 2 + 0.1);
    g.add(streak);
  }
  const beamLen = Math.hypot(W, H2) * 0.95;
  const beam1 = new THREE7.Mesh(markSharedGeometry(new THREE7.BoxGeometry(beamLen, 3, 0.6)), darkPlank);
  beam1.position.set(0, H2 / 2, 0);
  beam1.rotation.z = Math.atan2(H2, W);
  g.add(beam1);
  return g;
}
function addBarricade(b) {
  if (_barricadeMeshes[b.id]) return;
  const th = getTerrainHeight(b.cx, b.cy);
  state_default.barricades.push({
    id: b.id,
    cx: b.cx,
    cy: b.cy,
    w: b.w,
    h: b.h,
    angle: b.angle,
    _cosA: Math.cos(b.angle),
    _sinA: Math.sin(b.angle),
    _terrainH: th
  });
  const g = _BARRICADE_TEMPLATE.clone(true);
  g.position.set(b.cx, th, b.cy);
  g.rotation.y = -b.angle - Math.PI / 2;
  scene.add(g);
  _barricadeMeshes[b.id] = g;
}
function removeBarricade(id) {
  const m = _barricadeMeshes[id];
  if (!m) return;
  const bData = state_default.barricades.find((b) => b.id === id);
  if (bData) {
    const th = getTerrainHeight(bData.cx, bData.cy);
    for (let i = 0; i < 10; i++) {
      const isMetal = i < 4;
      const size = 1 + Math.random() * 2;
      spawnParticle({
        geo: PGEO_BOX,
        color: isMetal ? 5920096 : 7030048,
        x: bData.cx + (Math.random() - 0.5) * 20,
        y: th + size * 0.2 + Math.random() * 3 + 6,
        z: bData.cy + (Math.random() - 0.5) * 20,
        sx: size,
        sy: size * 0.3,
        sz: size * 0.7,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        life: 4 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 8,
        vy: 3 + Math.random() * 4,
        vz: (Math.random() - 0.5) * 8,
        gy: 80,
        rotVx: 1.5,
        rotVz: 1.2
      });
    }
  }
  disposeMeshTree(m);
  delete _barricadeMeshes[id];
  state_default.barricades = state_default.barricades.filter((b) => b.id !== id);
}
function clearBarricades() {
  for (const id in _barricadeMeshes) {
    disposeMeshTree(_barricadeMeshes[id]);
    delete _barricadeMeshes[id];
  }
  state_default.barricades = [];
}
function buildTowerIfNeeded() {
  if (towerMesh) return;
  const g = new THREE7.Group();
  const th = getTerrainHeight(towerX, towerZ);
  const poleMat = new THREE7.MeshLambertMaterial({ color: 8947848 });
  const pole = new THREE7.Mesh(new THREE7.CylinderGeometry(1.5, 2, 80, 6), poleMat);
  pole.position.y = 40;
  g.add(pole);
  const cap = new THREE7.Mesh(new THREE7.SphereGeometry(3, 6, 6), new THREE7.MeshLambertMaterial({ color: 16768324 }));
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
  const ftex = new THREE7.CanvasTexture(fc);
  const flag = new THREE7.Mesh(new THREE7.PlaneGeometry(30, 18), new THREE7.MeshBasicMaterial({ map: ftex, side: THREE7.DoubleSide }));
  flag.position.set(16, 70, 0);
  g.add(flag);
  g.position.set(towerX, th, towerZ);
  scene.add(g);
  towerMesh = g;
}
var _mapMeshes, _wallBodyIM, _wallTrimIM, _wallCapIM, _wallXBeamIM, _wallSlotsById, _HIDDEN, _tmpWallMat4, _tmpWallPos, _tmpWallQuat, _tmpWallScale, _tmpWallEuler, _barricadeMeshes, _BARRICADE_TEMPLATE, towerX, towerZ, towerMesh;
var init_map_objects = __esm({
  "client/map-objects.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    init_particles();
    init_three_utils();
    _mapMeshes = [];
    _wallBodyIM = null;
    _wallTrimIM = null;
    _wallCapIM = null;
    _wallXBeamIM = null;
    _wallSlotsById = {};
    _HIDDEN = new THREE7.Matrix4().makeScale(0, 0, 0);
    _tmpWallMat4 = new THREE7.Matrix4();
    _tmpWallPos = new THREE7.Vector3();
    _tmpWallQuat = new THREE7.Quaternion();
    _tmpWallScale = new THREE7.Vector3();
    _tmpWallEuler = new THREE7.Euler();
    _barricadeMeshes = {};
    _BARRICADE_TEMPLATE = _buildBarricadeTemplate();
    towerX = MW / 2;
    towerZ = MH / 2;
    towerMesh = null;
  }
});

// client/weapons-view.js
import * as THREE8 from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
function getVmGroup() {
  return vmGroup;
}
function buildHoof() {
  const g = new THREE8.Group();
  const furMat = new THREE8.MeshBasicMaterial({ color: 16777215 });
  const hoofMat = new THREE8.MeshBasicMaterial({ color: 2759184 });
  const shadowMat = new THREE8.MeshBasicMaterial({ color: 8947848 });
  const hoof = new THREE8.Mesh(new THREE8.BoxGeometry(2.2, 1.3, 2), hoofMat);
  hoof.position.set(0, 0, 0);
  g.add(hoof);
  const split = new THREE8.Mesh(new THREE8.BoxGeometry(0.25, 1.35, 2.1), shadowMat);
  g.add(split);
  const arm = new THREE8.Mesh(new THREE8.CylinderGeometry(1, 1.3, 8, 7), furMat);
  arm.position.set(0, -4, 0);
  g.add(arm);
  const armEdge = new THREE8.Mesh(new THREE8.CylinderGeometry(1.05, 1.35, 8, 7), shadowMat);
  armEdge.position.set(0.2, -4, 0.3);
  armEdge.scale.set(0.5, 1, 0.5);
  g.add(armEdge);
  return g;
}
function buildViewmodel(type, dual) {
  if (vmGroup) {
    vmScene.remove(vmGroup);
  }
  vmGroup = new THREE8.Group();
  vmDual = !!dual;
  const dark = new THREE8.MeshBasicMaterial({ color: 4473924 });
  const metal = new THREE8.MeshBasicMaterial({ color: 10066329 });
  const wood = new THREE8.MeshBasicMaterial({ color: 9132587 });
  const olive = new THREE8.MeshBasicMaterial({ color: 5597999 });
  const black = new THREE8.MeshBasicMaterial({ color: 2236962 });
  if (type === "normal") {
    const slide = new THREE8.Mesh(new THREE8.BoxGeometry(1.8, 1.5, 6), dark);
    slide.position.set(0, 0, -3);
    vmGroup.add(slide);
    const barrel = new THREE8.Mesh(new THREE8.CylinderGeometry(0.35, 0.35, 3, 6), metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.2, -6.5);
    vmGroup.add(barrel);
    const grip = new THREE8.Mesh(new THREE8.BoxGeometry(1.5, 3.5, 1.8), dark);
    grip.rotation.x = 0.2;
    grip.position.set(0, -2.5, -1);
    vmGroup.add(grip);
    const mag = new THREE8.Mesh(new THREE8.BoxGeometry(1, 2.5, 1.2), new THREE8.MeshBasicMaterial({ color: 3355443 }));
    mag.position.set(0, -3.5, -1);
    vmGroup.add(mag);
    const trigger = new THREE8.Mesh(new THREE8.BoxGeometry(0.3, 1, 0.8), metal);
    trigger.position.set(0, -1.2, -1.5);
    vmGroup.add(trigger);
    const sight = new THREE8.Mesh(new THREE8.BoxGeometry(0.4, 0.5, 0.4), metal);
    sight.position.set(0, 1, -5);
    vmGroup.add(sight);
  } else if (type === "shotgun") {
    const buildBenelli = (parent, xOff) => {
      const barrel = new THREE8.Mesh(new THREE8.CylinderGeometry(0.7, 0.7, 18, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(xOff, 0.3, -10);
      parent.add(barrel);
      const tubeMag = new THREE8.Mesh(new THREE8.CylinderGeometry(0.6, 0.6, 14, 8), dark);
      tubeMag.rotation.x = Math.PI / 2;
      tubeMag.position.set(xOff, -0.7, -8);
      parent.add(tubeMag);
      const receiver = new THREE8.Mesh(new THREE8.BoxGeometry(2.2, 2.5, 5), black);
      receiver.position.set(xOff, -0.3, -2);
      parent.add(receiver);
      const forend = new THREE8.Mesh(new THREE8.BoxGeometry(2, 1.8, 5), dark);
      forend.position.set(xOff, -0.5, -6);
      parent.add(forend);
      const grip = new THREE8.Mesh(new THREE8.BoxGeometry(1.5, 3.5, 1.5), black);
      grip.rotation.x = 0.3;
      grip.position.set(xOff, -2.5, 0);
      parent.add(grip);
      const stock = new THREE8.Mesh(new THREE8.CylinderGeometry(0.5, 0.5, 6, 6), metal);
      stock.rotation.x = Math.PI / 2;
      stock.position.set(xOff, -0.3, 3.5);
      parent.add(stock);
      const buttpad = new THREE8.Mesh(new THREE8.BoxGeometry(2, 2.5, 0.8), dark);
      buttpad.position.set(xOff, -0.3, 6.5);
      parent.add(buttpad);
      return [barrel, tubeMag, receiver, forend, grip, stock, buttpad];
    };
    buildBenelli(vmGroup, 0);
    const secondGroup = new THREE8.Group();
    buildBenelli(secondGroup, -12);
    secondGroup.visible = vmDual;
    vmGroup.add(secondGroup);
    vmGroup.userData.benelliSecond = secondGroup;
    const hoof = buildHoof();
    hoof.position.set(-0.5, -0.8, -9);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "pump";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "burst") {
    const loader = new FBXLoader(fbxLoadingManager);
    loader.load("models/M16_ps1.fbx", (fbx) => {
      fbx.scale.set(0.08, 0.08, 0.08);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      fbx.position.set(1.5, -8, -7);
      const grayMat = new THREE8.MeshBasicMaterial({ color: 1710618 });
      fbx.traverse((c) => {
        if (c.isMesh) c.material = grayMat;
      });
      vmGroup.add(fbx);
      const fbx2 = fbx.clone(true);
      fbx2.position.set(-10.5, -8, -7);
      fbx2.visible = vmDual;
      vmGroup.add(fbx2);
      vmGroup.userData.m16Second = fbx2;
    }, void 0, () => {
      const barrel = new THREE8.Mesh(new THREE8.CylinderGeometry(0.4, 0.4, 14, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.2, -8);
      vmGroup.add(barrel);
      const body = new THREE8.Mesh(new THREE8.BoxGeometry(2, 2, 8), dark);
      body.position.set(0, -0.2, -3);
      vmGroup.add(body);
    });
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -10);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "bolty") {
    const loader2 = new FBXLoader(fbxLoadingManager);
    loader2.load("models/Sniper.fbx", (fbx) => {
      fbx.scale.set(0.06, 0.06, 0.06);
      fbx.rotation.set(Math.PI, Math.PI, Math.PI);
      fbx.position.set(6, -8, -7);
      fbx.traverse((c) => {
        if (c.isMesh) {
          c.material = new THREE8.ShaderMaterial({
            vertexShader: "varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
            fragmentShader: "varying vec3 vPos;void main(){float t=clamp((vPos.y+20.0)/40.0,0.0,1.0);vec3 col=mix(vec3(0.2,0.27,0.12),vec3(0.15,0.2,0.08),t);gl_FragColor=vec4(col,1.0);}"
          });
        }
      });
      vmGroup.add(fbx);
    }, void 0, () => {
      const barrel = new THREE8.Mesh(new THREE8.CylinderGeometry(0.5, 0.5, 22, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0, -12);
      vmGroup.add(barrel);
      const stock = new THREE8.Mesh(new THREE8.BoxGeometry(2, 2, 12), wood);
      stock.position.set(0, -0.5, 0);
      vmGroup.add(stock);
    });
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -14);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "cowtank") {
    const outerTube = new THREE8.Mesh(new THREE8.CylinderGeometry(2.2, 2.2, 16, 10), olive);
    outerTube.rotation.x = Math.PI / 2;
    outerTube.position.set(0, 0, -8);
    vmGroup.add(outerTube);
    const innerTube = new THREE8.Mesh(new THREE8.CylinderGeometry(1.8, 1.8, 8, 10), new THREE8.MeshBasicMaterial({ color: 3820074 }));
    innerTube.rotation.x = Math.PI / 2;
    innerTube.position.set(0, 0, -14);
    vmGroup.add(innerTube);
    const fSight = new THREE8.Mesh(new THREE8.BoxGeometry(0.5, 2, 0.5), metal);
    fSight.position.set(0, 2.8, -16);
    vmGroup.add(fSight);
    const rSight = new THREE8.Mesh(new THREE8.BoxGeometry(0.5, 1.5, 0.5), metal);
    rSight.position.set(0, 2.5, -1);
    vmGroup.add(rSight);
    const trigGuard = new THREE8.Mesh(new THREE8.BoxGeometry(1.5, 3, 2), dark);
    trigGuard.position.set(0, -2.5, -3);
    vmGroup.add(trigGuard);
    const band1 = new THREE8.Mesh(new THREE8.CylinderGeometry(2.4, 2.4, 0.5, 10), new THREE8.MeshBasicMaterial({ color: 16768256 }));
    band1.rotation.x = Math.PI / 2;
    band1.position.set(0, 0, -4);
    vmGroup.add(band1);
    const hoof = buildHoof();
    hoof.position.set(-0.8, -0.5, -12);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "none";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  }
  vmGroup.position.set(2, -3, -5);
  vmGroup.rotation.set(0, 0.05, 0);
  vmScene.add(vmGroup);
  vmType = type;
}
function updateViewmodel() {
  const me = state_default.me;
  const wep = me && me.alive ? me.weapon || "normal" : "normal";
  const meDual = !!(me && me.dualWield);
  if (wep !== vmType && performance.now() >= _pistolDelayUntil) {
    if (vmType === "cowtank" && vmGroup && !_throwAway) {
      _throwAway = { group: vmGroup, startT: performance.now() / 1e3 };
      vmGroup = null;
      vmType = null;
      _pistolDelayUntil = performance.now() + 1200 + 1e3;
    } else {
      buildViewmodel(wep, meDual);
    }
  }
  if (performance.now() >= _pistolDelayUntil && wep !== vmType && !_throwAway) {
    buildViewmodel(wep, meDual);
  }
  if (wep === vmType && meDual !== vmDual && !_throwAway) {
    vmDual = meDual;
    if (vmGroup && vmGroup.userData.m16Second) vmGroup.userData.m16Second.visible = meDual;
    if (vmGroup && vmGroup.userData.benelliSecond) vmGroup.userData.benelliSecond.visible = meDual;
  }
  if (_throwAway) {
    const tAway = performance.now() / 1e3 - _throwAway.startT;
    const g = _throwAway.group;
    const dur = 1.2;
    if (tAway < dur) {
      const frac = tAway / dur;
      g.position.x = 2 + frac * 30;
      g.position.y = -3 - frac * frac * 20;
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
    const moving = me && me.alive && (state_default.keys["KeyW"] || state_default.keys["KeyS"] || state_default.keys["KeyA"] || state_default.keys["KeyD"]);
    const t = performance.now() / 1e3;
    vmGroup.position.y = -4 + (moving ? Math.sin(t * 8) * 0.5 : 0);
    vmGroup.position.x = 4 + (moving ? Math.cos(t * 6) * 0.3 : 0);
    const hoof = vmGroup.userData.hoof;
    if (hoof && hoof.userData.restPos && hoof.userData.restRot) {
      const rest = hoof.userData.restPos;
      const restR = hoof.userData.restRot;
      if (me && me.reloading && hoof.userData.reloadStyle !== "none") {
        if (hoof.userData.reloadStyle === "magswap") {
          const phase = t * 1.1 % 1;
          const down = phase < 0.4 ? phase / 0.4 : phase < 0.6 ? 1 : 1 - (phase - 0.6) / 0.4;
          hoof.position.x = rest.x - 1 - down * 2;
          hoof.position.y = rest.y - down * 5;
          hoof.position.z = rest.z + 3;
          hoof.rotation.z = restR.z - down * 0.5;
          hoof.rotation.x = restR.x + down * 0.8;
        } else {
          const phase = t * 2 % 1;
          const slide = Math.sin(phase * Math.PI * 2);
          hoof.position.x = rest.x;
          hoof.position.y = rest.y - 0.5;
          hoof.position.z = rest.z + slide * 2.5;
          hoof.rotation.z = restR.z;
          hoof.rotation.x = restR.x;
        }
      } else {
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
var vmGroup, vmType, vmDual, _throwAway, _pistolDelayUntil;
var init_weapons_view = __esm({
  "client/weapons-view.js"() {
    init_state();
    init_renderer();
    init_three_utils();
    vmGroup = null;
    vmType = null;
    vmDual = false;
    _throwAway = null;
    _pistolDelayUntil = 0;
  }
});

// client/pickups.js
import * as THREE9 from "three";
import { FBXLoader as FBXLoader2 } from "three/addons/loaders/FBXLoader.js";
function _reconcileMap(meshMap, seen) {
  for (const id in meshMap) {
    if (!seen.has(id)) {
      disposeMeshTree(meshMap[id]);
      delete meshMap[id];
    }
  }
}
function _buildArmorMesh(a) {
  const m = new THREE9.Mesh(new THREE9.OctahedronGeometry(8, 0), new THREE9.MeshBasicMaterial({ color: 5605631 }));
  const glow = new THREE9.Mesh(new THREE9.OctahedronGeometry(12, 0), new THREE9.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.2 }));
  m.add(glow);
  m.position.set(a.x, getTerrainHeight(a.x, a.y) + 15, a.y);
  return m;
}
function _buildWeaponPickupModel(type) {
  const g = new THREE9.Group();
  const dark = new THREE9.MeshLambertMaterial({ color: 4473924 });
  const metal = new THREE9.MeshLambertMaterial({ color: 10066329 });
  const olive = new THREE9.MeshLambertMaterial({ color: 5597999 });
  const black = new THREE9.MeshLambertMaterial({ color: 2236962 });
  const wood = new THREE9.MeshLambertMaterial({ color: 9132587 });
  if (type === "shotgun") {
    const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.5, 0.5, 14, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    g.add(barrel);
    const body = new THREE9.Mesh(new THREE9.BoxGeometry(4, 2, 1.5), black);
    body.position.x = -2;
    g.add(body);
    const stock = new THREE9.Mesh(new THREE9.BoxGeometry(4, 1.5, 1.2), wood);
    stock.position.x = -6;
    g.add(stock);
  } else if (type === "burst") {
    const loader = new FBXLoader2(fbxLoadingManager);
    loader.load("models/M16_ps1.fbx", (fbx) => {
      fbx.scale.set(0.05, 0.05, 0.05);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      const grayMat = new THREE9.MeshBasicMaterial({ color: 1710618 });
      fbx.traverse((c) => {
        if (c.isMesh) c.material = grayMat;
      });
      g.add(fbx);
    }, void 0, () => {
      const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.3, 0.3, 10, 6), dark);
      barrel.rotation.z = Math.PI / 2;
      g.add(barrel);
      const body = new THREE9.Mesh(new THREE9.BoxGeometry(6, 2, 1.5), new THREE9.MeshLambertMaterial({ color: 1710618 }));
      body.position.x = -1;
      g.add(body);
    });
  } else if (type === "bolty") {
    const loader = new FBXLoader2(fbxLoadingManager);
    loader.load("models/Sniper.fbx", (fbx) => {
      fbx.scale.set(0.0175, 0.0175, 0.0175);
      fbx.rotation.set(Math.PI, Math.PI, Math.PI);
      fbx.traverse((c) => {
        if (c.isMesh) c.material = new THREE9.MeshBasicMaterial({ color: 2767402 });
      });
      g.add(fbx);
    }, void 0, () => {
      const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.4, 0.4, 16, 6), new THREE9.MeshLambertMaterial({ color: 2767402 }));
      barrel.rotation.z = Math.PI / 2;
      g.add(barrel);
      const scope = new THREE9.Mesh(new THREE9.CylinderGeometry(0.8, 0.8, 4, 6), dark);
      scope.rotation.z = Math.PI / 2;
      scope.position.set(-1, 1.5, 0);
      g.add(scope);
    });
  } else if (type === "cowtank") {
    const tube = new THREE9.Mesh(new THREE9.CylinderGeometry(1.5, 1.5, 12, 8), olive);
    tube.rotation.z = Math.PI / 2;
    g.add(tube);
    const sight = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 1.5, 0.4), metal);
    sight.position.set(5, 2, 0);
    g.add(sight);
    const band = new THREE9.Mesh(new THREE9.CylinderGeometry(1.7, 1.7, 0.5, 8), new THREE9.MeshLambertMaterial({ color: 16768256 }));
    band.rotation.z = Math.PI / 2;
    band.position.x = -2;
    g.add(band);
  }
  return g;
}
function _buildWeaponPickupGroup(w) {
  const g = new THREE9.Group();
  const model = _buildWeaponPickupModel(w.weapon);
  model.scale.set(1.5, 1.5, 1.5);
  model.position.y = 15;
  g.add(model);
  const glow = new THREE9.Mesh(new THREE9.SphereGeometry(12, 8, 8), new THREE9.MeshBasicMaterial({ color: WPCOL[w.weapon] || 16755200, transparent: true, opacity: 0.15 }));
  glow.position.y = 15;
  g.add(glow);
  const lc = document.createElement("canvas");
  lc.width = 128;
  lc.height = 32;
  const lctx = lc.getContext("2d");
  lctx.font = "bold 20px Segoe UI";
  lctx.textAlign = "center";
  lctx.fillStyle = "#fff";
  lctx.fillText(_WP_LABELS[w.weapon] || w.weapon.toUpperCase(), 64, 22);
  const ltex = new THREE9.CanvasTexture(lc);
  ltex.minFilter = THREE9.LinearFilter;
  const ls = new THREE9.Sprite(new THREE9.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
  ls.position.set(0, 28, 0);
  ls.scale.set(30, 8, 1);
  g.add(ls);
  g.position.set(w.x, getTerrainHeight(w.x, w.y), w.y);
  return g;
}
function _buildFoodModel(type, golden) {
  const g = new THREE9.Group();
  if (golden) {
    const star = new THREE9.Mesh(new THREE9.OctahedronGeometry(6, 0), new THREE9.MeshLambertMaterial({ color: 16768256 }));
    const glow = new THREE9.Mesh(new THREE9.SphereGeometry(9, 6, 6), new THREE9.MeshBasicMaterial({ color: 16768256, transparent: true, opacity: 0.2 }));
    g.add(star);
    g.add(glow);
  } else if (type === "strawberry") {
    const body = new THREE9.Mesh(new THREE9.ConeGeometry(3.5, 7, 6), new THREE9.MeshLambertMaterial({ color: 16720452 }));
    body.rotation.x = Math.PI;
    body.position.y = 3.5;
    g.add(body);
    const leaf = new THREE9.Mesh(new THREE9.ConeGeometry(4, 2, 4), new THREE9.MeshLambertMaterial({ color: 2271778 }));
    leaf.position.y = 7.5;
    g.add(leaf);
  } else if (type === "cake") {
    const base = new THREE9.Mesh(new THREE9.CylinderGeometry(4, 4, 5, 8), new THREE9.MeshLambertMaterial({ color: 16764040 }));
    base.position.y = 2.5;
    g.add(base);
    const frosting = new THREE9.Mesh(new THREE9.CylinderGeometry(4.2, 4.2, 1.5, 8), new THREE9.MeshLambertMaterial({ color: 16746666 }));
    frosting.position.y = 5.5;
    g.add(frosting);
    const cherry = new THREE9.Mesh(new THREE9.SphereGeometry(1, 6, 6), new THREE9.MeshLambertMaterial({ color: 16711680 }));
    cherry.position.y = 7;
    g.add(cherry);
  } else if (type === "pizza") {
    const slice = new THREE9.Mesh(new THREE9.ConeGeometry(5, 1.5, 3), new THREE9.MeshLambertMaterial({ color: 16763972 }));
    slice.rotation.x = Math.PI / 2;
    slice.position.y = 3;
    g.add(slice);
    const pep1 = new THREE9.Mesh(new THREE9.CylinderGeometry(1, 1, 0.5, 6), new THREE9.MeshLambertMaterial({ color: 13378048 }));
    pep1.position.set(0, 3.8, -1);
    g.add(pep1);
    const pep2 = new THREE9.Mesh(new THREE9.CylinderGeometry(0.8, 0.8, 0.5, 6), new THREE9.MeshLambertMaterial({ color: 13378048 }));
    pep2.position.set(1.5, 3.8, 1);
    g.add(pep2);
  } else if (type === "icecream") {
    const cone = new THREE9.Mesh(new THREE9.ConeGeometry(3, 6, 6), new THREE9.MeshLambertMaterial({ color: 14527061 }));
    cone.rotation.x = Math.PI;
    cone.position.y = 3;
    g.add(cone);
    const scoop = new THREE9.Mesh(new THREE9.SphereGeometry(3.5, 6, 6), new THREE9.MeshLambertMaterial({ color: 16772829 }));
    scoop.position.y = 6.5;
    g.add(scoop);
    const scoop2 = new THREE9.Mesh(new THREE9.SphereGeometry(3, 6, 6), new THREE9.MeshLambertMaterial({ color: 16746666 }));
    scoop2.position.y = 9.5;
    g.add(scoop2);
  } else if (type === "donut") {
    const ring = new THREE9.Mesh(new THREE9.TorusGeometry(3, 1.5, 6, 12), new THREE9.MeshLambertMaterial({ color: 14527078 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4;
    g.add(ring);
    const glaze = new THREE9.Mesh(new THREE9.TorusGeometry(3, 1.6, 6, 12), new THREE9.MeshLambertMaterial({ color: 16737962 }));
    glaze.rotation.x = Math.PI / 2;
    glaze.position.y = 4.5;
    glaze.scale.set(1, 1, 0.3);
    g.add(glaze);
  } else if (type === "cupcake") {
    const wrapper = new THREE9.Mesh(new THREE9.CylinderGeometry(3, 2.5, 4, 8), new THREE9.MeshLambertMaterial({ color: 16755268 }));
    wrapper.position.y = 2;
    g.add(wrapper);
    const swirl = new THREE9.Mesh(new THREE9.ConeGeometry(3.5, 5, 8), new THREE9.MeshLambertMaterial({ color: 16746700 }));
    swirl.position.y = 6.5;
    g.add(swirl);
  } else if (type === "cookie") {
    const disk = new THREE9.Mesh(new THREE9.CylinderGeometry(3.5, 3.5, 1.5, 8), new THREE9.MeshLambertMaterial({ color: 13404211 }));
    disk.position.y = 3;
    g.add(disk);
    for (let i = 0; i < 4; i++) {
      const chip = new THREE9.Mesh(new THREE9.SphereGeometry(0.6, 4, 4), new THREE9.MeshLambertMaterial({ color: 4465152 }));
      chip.position.set(Math.cos(i * 1.6) * 2, 4, Math.sin(i * 1.6) * 2);
      g.add(chip);
    }
  } else {
    const m = new THREE9.Mesh(new THREE9.SphereGeometry(4, 6, 6), new THREE9.MeshLambertMaterial({ color: 16724821 }));
    m.position.y = 4;
    g.add(m);
  }
  return g;
}
function updatePickups(time) {
  const seenArmor = /* @__PURE__ */ new Set();
  for (const a of _armorSpawns) {
    const aid = String(a.id);
    seenArmor.add(aid);
    if (!_armorMeshes[aid]) {
      const m = _buildArmorMesh(a);
      scene.add(m);
      _armorMeshes[aid] = m;
    }
    _armorMeshes[aid].rotation.y = time * 2;
    _armorMeshes[aid].position.y = getTerrainHeight(a.x, a.y) + 15 + Math.sin(time * 3) * 3;
  }
  _reconcileMap(_armorMeshes, seenArmor);
  const seenWp = /* @__PURE__ */ new Set();
  for (const w of state_default.clientWeapons) {
    const wid = String(w.id);
    seenWp.add(wid);
    if (!_weaponMeshes[wid]) {
      const g = _buildWeaponPickupGroup(w);
      scene.add(g);
      _weaponMeshes[wid] = g;
    }
    _weaponMeshes[wid].children[0].rotation.y = time * 2;
    _weaponMeshes[wid].children[0].position.y = 15 + Math.sin(time * 3 + w.x) * 3;
  }
  _reconcileMap(_weaponMeshes, seenWp);
  const seenFood = /* @__PURE__ */ new Set();
  for (const f of state_default.serverFoods) {
    const fid = String(f.id);
    seenFood.add(fid);
    if (!_foodMeshes[fid]) {
      const m = _buildFoodModel(f.type, f.golden);
      m.scale.set(2, 2, 2);
      m.position.set(f.x, getTerrainHeight(f.x, f.y) + 12, f.y);
      scene.add(m);
      _foodMeshes[fid] = m;
    }
    const fm = _foodMeshes[fid];
    fm.position.y = getTerrainHeight(f.x, f.y) + 12 + Math.sin(time * 2 + f.x * 0.01) * 3;
    fm.rotation.y = time * 1.5;
  }
  _reconcileMap(_foodMeshes, seenFood);
}
function setArmorSpawns(list) {
  _armorSpawns = list || [];
}
function onArmorSpawn(a) {
  _armorSpawns.push({ id: a.id, x: a.x, y: a.y });
}
function onArmorPickup(pickupId) {
  if (_armorMeshes[pickupId]) {
    disposeMeshTree(_armorMeshes[pickupId]);
    delete _armorMeshes[pickupId];
  }
  _armorSpawns = _armorSpawns.filter((a) => a.id !== pickupId);
}
function clearPickups() {
  for (const id in _foodMeshes) {
    disposeMeshTree(_foodMeshes[id]);
    delete _foodMeshes[id];
  }
  for (const id in _weaponMeshes) {
    disposeMeshTree(_weaponMeshes[id]);
    delete _weaponMeshes[id];
  }
  for (const id in _armorMeshes) {
    disposeMeshTree(_armorMeshes[id]);
    delete _armorMeshes[id];
  }
  _armorSpawns = [];
}
var _armorMeshes, _weaponMeshes, _foodMeshes, _armorSpawns, _WP_LABELS;
var init_pickups = __esm({
  "client/pickups.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    init_three_utils();
    _armorMeshes = {};
    _weaponMeshes = {};
    _foodMeshes = {};
    _armorSpawns = [];
    _WP_LABELS = { shotgun: "BENELLI", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW" };
  }
});

// client/projectiles.js
import * as THREE10 from "three";
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
function updateProjectiles(dt) {
  for (const p of state_default.projData) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.vy3d !== void 0) {
      p.y3d += p.vy3d * dt;
    }
    if (!state_default.projMeshes[p.id]) {
      const sz = p.cowtank ? 2 : p.bolty ? 1.5 : 0.75;
      const col = p.cowtank ? 16737792 : 16768392;
      const length = sz * 4;
      const radius = sz * 0.8;
      const coneH = length * 0.4, casingH = length * 0.6;
      const m = new THREE10.Group();
      const casingMat = new THREE10.MeshBasicMaterial({ color: 11171652 });
      const casing = new THREE10.Mesh(new THREE10.CylinderGeometry(radius, radius, casingH, 8), casingMat);
      casing.rotation.x = Math.PI / 2;
      casing.position.z = -(casingH / 2 - length * 0.1);
      m.add(casing);
      const tipMat = new THREE10.MeshBasicMaterial({ color: col });
      const tip = new THREE10.Mesh(new THREE10.ConeGeometry(radius, coneH, 8), tipMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.z = length / 2 - coneH / 2;
      m.add(tip);
      const glow = new THREE10.Mesh(new THREE10.CylinderGeometry(radius * 2.4, radius * 0.6, length * 1.5, 6), new THREE10.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 }));
      glow.rotation.x = Math.PI / 2;
      glow.position.z = -length * 0.6;
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
      const pos = state_default.projMeshes[p.id].position;
      const s = 2 + Math.random() * 3;
      spawnParticle({
        geo: PGEO_SPHERE_LO,
        color: 8947848,
        x: pos.x + (Math.random() - 0.5) * 4,
        y: pos.y + (Math.random() - 0.5) * 4,
        z: pos.z + (Math.random() - 0.5) * 4,
        sx: s,
        vy: 10,
        growth: 2,
        life: 0.6,
        peakOpacity: 0.5
      });
    }
    if (p.bolty && state_default.projMeshes[p.id]) {
      const pos = state_default.projMeshes[p.id].position;
      const last = p._lastTrailPos;
      if (last) {
        const steps = 4;
        for (let i = 1; i <= steps; i++) {
          const f = i / steps;
          spawnParticle({
            geo: PGEO_SPHERE_LO,
            color: 16777164,
            x: last.x + (pos.x - last.x) * f,
            y: last.y + (pos.y - last.y) * f,
            z: last.z + (pos.z - last.z) * f,
            sx: 0.9,
            life: 1,
            peakOpacity: 0.9
          });
        }
      }
      p._lastTrailPos = { x: pos.x, y: pos.y, z: pos.z };
    }
    const terrH = getTerrainHeight(p.x, p.y);
    const WATER_Y = -30;
    if (p.y3d <= WATER_Y && !p._splashed && terrH < WATER_Y) {
      p._splashed = true;
      spawnParticle({
        geo: PGEO_TORUS,
        color: 16777215,
        x: p.x,
        y: WATER_Y + 0.3,
        z: p.y,
        sx: 1.5,
        sy: 1.5,
        sz: 1.5,
        rotX: Math.PI / 2,
        life: 0.6,
        peakOpacity: 1,
        growth: 5,
        side: THREE10.DoubleSide
      });
    }
    if (p.y3d < terrH + 56) {
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
    const mesh = state_default.projMeshes[p.id];
    mesh.position.set(p.x, p.y3d, p.y);
    const vWorldZ = p.vy;
    const aheadX = p.x + p.vx * 0.05;
    const aheadY = p.y3d + (p.vy3d || 0) * 0.05;
    const aheadZ = p.y + vWorldZ * 0.05;
    mesh.lookAt(aheadX, aheadY, aheadZ);
  }
  for (let i = state_default.projData.length - 1; i >= 0; i--) {
    const p = state_default.projData[i];
    if (p.y3d === -999 || p.x < -100 || p.x > MW + 100 || p.y < -100 || p.y > MH + 100) {
      if (state_default.projMeshes[p.id]) {
        disposeMeshTree(state_default.projMeshes[p.id]);
        delete state_default.projMeshes[p.id];
      }
      if (rocketSounds[p.id]) {
        try {
          rocketSounds[p.id].osc.stop();
        } catch (e) {
        }
        delete rocketSounds[p.id];
      }
      state_default.projData.splice(i, 1);
    }
  }
  for (const id in rocketSounds) {
    if (!state_default.projMeshes[id]) {
      try {
        rocketSounds[id].osc.stop();
      } catch (e) {
      }
      delete rocketSounds[id];
    }
  }
}
var rocketSounds;
var init_projectiles = __esm({
  "client/projectiles.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    init_audio();
    init_particles();
    init_three_utils();
    rocketSounds = {};
  }
});

// client/zone.js
import * as THREE11 from "three";
function updateZone() {
  const z = state_default.serverZone;
  _zoneMeshes.forEach((m) => scene.remove(m));
  _zoneMeshes = [];
  if (z.w >= MW - 10 && z.h >= MH - 10) return;
  const wallH = 220;
  const wallBottom = -60;
  const mat = new THREE11.MeshBasicMaterial({ color: 16711680, transparent: true, opacity: 0.15, side: THREE11.DoubleSide });
  const n = new THREE11.Mesh(new THREE11.PlaneGeometry(z.w, wallH), mat);
  n.position.set(z.x + z.w / 2, wallBottom + wallH / 2, z.y);
  scene.add(n);
  _zoneMeshes.push(n);
  const s = new THREE11.Mesh(new THREE11.PlaneGeometry(z.w, wallH), mat);
  s.position.set(z.x + z.w / 2, wallBottom + wallH / 2, z.y + z.h);
  scene.add(s);
  _zoneMeshes.push(s);
  const w = new THREE11.Mesh(new THREE11.PlaneGeometry(z.h, wallH), mat);
  w.position.set(z.x, wallBottom + wallH / 2, z.y + z.h / 2);
  w.rotation.y = Math.PI / 2;
  scene.add(w);
  _zoneMeshes.push(w);
  const e = new THREE11.Mesh(new THREE11.PlaneGeometry(z.h, wallH), mat);
  e.position.set(z.x + z.w, wallBottom + wallH / 2, z.y + z.h / 2);
  e.rotation.y = Math.PI / 2;
  scene.add(e);
  _zoneMeshes.push(e);
  const gmat = new THREE11.MeshBasicMaterial({ color: 16711680, transparent: true, opacity: 0.1, side: THREE11.DoubleSide });
  if (z.y > 10) {
    const g = new THREE11.Mesh(new THREE11.PlaneGeometry(MW, z.y), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(MW / 2, 1, z.y / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
  if (z.y + z.h < MH - 10) {
    const g = new THREE11.Mesh(new THREE11.PlaneGeometry(MW, MH - z.y - z.h), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(MW / 2, 1, (z.y + z.h + MH) / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
  if (z.x > 10) {
    const g = new THREE11.Mesh(new THREE11.PlaneGeometry(z.x, z.h), gmat);
    g.rotation.x = -Math.PI / 2;
    g.position.set(z.x / 2, 1, z.y + z.h / 2);
    scene.add(g);
    _zoneMeshes.push(g);
  }
  if (z.x + z.w < MW - 10) {
    const g = new THREE11.Mesh(new THREE11.PlaneGeometry(MW - z.x - z.w, z.h), gmat);
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
function initHudRefs() {
  H = {
    fpsCounter: document.getElementById("fpsCounter"),
    weapon: document.getElementById("weapon"),
    hunger: document.getElementById("hunger"),
    hungerFill: document.getElementById("hungerFill"),
    hungerTxt: document.getElementById("hungerTxt"),
    xpBar: document.getElementById("xpBar"),
    xpFill: document.getElementById("xpFill"),
    xpTxt: document.getElementById("xpTxt"),
    dashBar: document.getElementById("dashBar"),
    dashFill: document.getElementById("dashFill"),
    atkBar: document.getElementById("atkBar"),
    atkFill: document.getElementById("atkFill"),
    armorBar: document.getElementById("armorBar"),
    armorFill: document.getElementById("armorFill"),
    armorTxt: document.getElementById("armorTxt"),
    crosshair: document.getElementById("crosshair"),
    chN: document.getElementById("chN"),
    chS: document.getElementById("chS"),
    chE: document.getElementById("chE"),
    chW: document.getElementById("chW"),
    barricadeBar: document.getElementById("barricadeBar"),
    barricadeFill: document.getElementById("barricadeFill"),
    barricadeLabel: document.getElementById("barricadeLabel"),
    score: document.getElementById("score"),
    spectateMsg: document.getElementById("spectateMsg"),
    playerCount: document.getElementById("playerCount"),
    killfeed: document.getElementById("killfeed"),
    chatLog: document.getElementById("chatLog"),
    minimap: document.getElementById("minimap"),
    lowHealthOverlay: document.getElementById("lowHealthOverlay"),
    spawnProtOverlay: document.getElementById("spawnProtOverlay")
  };
}
function updateHud(me, time, dt) {
  if (!H) initHudRefs();
  state_default.fpsFrames++;
  const fpsNow = performance.now();
  if (fpsNow - state_default.fpsLast >= 1e3) {
    state_default.fpsDisplay = state_default.fpsFrames;
    state_default.fpsFrames = 0;
    state_default.fpsLast = fpsNow;
  }
  H.fpsCounter.textContent = state_default.fpsDisplay + "fps | " + Math.round(state_default.pingVal) + "ms";
  const aliveHud = me && me.alive;
  const aliveDisp = aliveHud ? "" : "none";
  if (state_default._aliveDisp !== aliveDisp) {
    state_default._aliveDisp = aliveDisp;
    H.weapon.style.display = aliveDisp;
    H.hunger.style.display = aliveDisp;
    H.xpBar.style.display = aliveDisp;
    H.dashBar.style.display = aliveDisp;
    H.atkBar.style.display = aliveDisp;
    H.crosshair.style.display = aliveDisp;
    H.barricadeBar.style.display = aliveDisp;
    H.barricadeLabel.style.display = aliveDisp;
  }
  if (!me) return;
  const hPct = Math.max(0, me.hunger / 100);
  H.hungerFill.style.width = hPct * 100 + "%";
  H.hungerFill.style.background = hPct > 0.5 ? "#ffffff" : hPct > 0.25 ? "#dddddd" : "#ff4444";
  H.hungerTxt.textContent = "MILK " + Math.ceil(me.hunger) + "%";
  const wep = me.weapon || "normal";
  const wepNames = { shotgun: "Benelli", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW", normal: "M92 Pistol" };
  let ammoTxt = "";
  let reloadBlock = "";
  if (wep === "cowtank") {
    ammoTxt = " 1/1";
  } else if (me.ammo >= 0) {
    const BASE_MAG = { normal: 15, burst: 20, shotgun: 6, bolty: 5 };
    const EXT_MAG = { normal: 19, burst: 25, shotgun: 8, bolty: 7 };
    const hasExt = (me.extMagMult || 1) > 1;
    const baseMag = (hasExt ? EXT_MAG[wep] : BASE_MAG[wep]) || 0;
    const dualMult = me.dualWield && (wep === "burst" || wep === "shotgun") ? 2 : 1;
    const maxMag = baseMag * dualMult;
    ammoTxt = " " + me.ammo + "/" + maxMag;
    if (me.reloading) {
      if (!state_default._reloadStart) {
        state_default._reloadStart = performance.now();
        const RELOAD_MS = { burst: 2e3, bolty: 2500, normal: 2e3 };
        const reloadMult = me.dualWield ? 2 : 1;
        if (wep === "shotgun") state_default._reloadDuration = Math.max(750, (maxMag - me.ammo) * 750);
        else state_default._reloadDuration = (RELOAD_MS[wep] || 2e3) * reloadMult;
      }
      const elapsed = performance.now() - state_default._reloadStart;
      const pct = Math.min(100, elapsed / state_default._reloadDuration * 100);
      reloadBlock = '<div style="color:#ffaa44;font-size:0.35em;margin-bottom:4px;line-height:1">RELOADING...</div><div style="width:260px;height:10px;background:rgba(0,0,0,0.6);border-radius:3px;margin:0 0 8px auto"><div style="height:100%;border-radius:3px;background:#ffaa44;width:' + pct + '%"></div></div>';
    } else {
      state_default._reloadStart = null;
      state_default._reloadDuration = null;
    }
  }
  let fireModeBlock = "";
  if (wep === "burst") {
    const modeLabel = state_default.fireMode === "auto" ? "AUTO" : state_default.fireMode === "semi" ? "SEMI" : "BURST";
    fireModeBlock = "<div>" + modeLabel + "</div>";
  }
  const dualTag = me.dualWield ? " \xD72" : "";
  const weaponSig = wep + "|" + ammoTxt + "|" + dualTag + "|" + fireModeBlock + "|" + reloadBlock;
  if (state_default._weaponSig !== weaponSig) {
    state_default._weaponSig = weaponSig;
    H.weapon.innerHTML = reloadBlock + fireModeBlock + (wepNames[wep] || wep) + dualTag + ammoTxt;
  }
  const armorVal = me.armor || 0;
  H.armorBar.style.display = aliveHud && armorVal > 0 ? "block" : "none";
  H.armorFill.style.width = Math.min(100, armorVal) + "%";
  H.armorTxt.textContent = "SHIELD " + Math.ceil(armorVal);
  const xpPct = me.xpToNext > 0 ? Math.max(0, Math.min(100, (me.xp || 0) / (me.xpToNext || 50) * 100)) : 0;
  H.xpFill.style.width = xpPct + "%";
  H.xpTxt.textContent = "LV" + (me.level || 0) + " " + Math.floor(me.xp || 0) + "/" + (me.xpToNext || 50) + " XP";
  H.lowHealthOverlay.style.display = me.hunger < 30 ? "block" : "none";
  H.lowHealthOverlay.style.opacity = me.hunger < 30 ? Math.min(1, (30 - me.hunger) / 30 * (0.5 + Math.sin(time * 4) * 0.2)) : "0";
  if (H.spawnProtOverlay) {
    H.spawnProtOverlay.style.display = me.spawnProt ? "block" : "none";
    if (me.spawnProt) H.spawnProtOverlay.style.opacity = 0.3 + Math.sin(time * 6) * 0.1;
  }
  const dashMax = 3 * (me.dashCdMult || 1);
  const dashPct = me.dashCooldown > 0 ? Math.min(100, me.dashCooldown / dashMax * 100) : 0;
  H.dashFill.style.width = 100 - dashPct + "%";
  H.dashFill.style.background = dashPct > 0 ? "#225588" : "#44aaff";
  const nowMs = performance.now();
  const remaining = Math.max(0, state_default.barricadeReadyAt - nowMs);
  const barrPct = remaining > 0 ? 100 - Math.min(100, remaining / 5e3 * 100) : 100;
  H.barricadeFill.style.width = barrPct + "%";
  H.barricadeFill.style.background = remaining > 0 ? "#663322" : "#aa6633";
  if (me.attackCooldown > (state_default._atkCdMax || 0)) state_default._atkCdMax = me.attackCooldown;
  if (me.attackCooldown <= 0) state_default._atkCdMax = 0;
  const atkMax = state_default._atkCdMax || 1;
  const atkPct = me.attackCooldown > 0 ? Math.min(100, me.attackCooldown / atkMax * 100) : 0;
  H.atkFill.style.width = 100 - atkPct + "%";
  H.atkFill.style.background = atkPct > 0 ? "#882222" : "#ff6644";
  if (H.chN && aliveHud) {
    const baseSpread = { normal: 8, shotgun: 42, bolty: 5, cowtank: 10, burst: state_default.fireMode === "auto" ? 18 : 8 }[wep] || 8;
    const crouchMult = state_default.crouching ? 0.35 : 1;
    const movingMult = state_default.keys["KeyW"] || state_default.keys["KeyS"] || state_default.keys["KeyA"] || state_default.keys["KeyD"] ? 2.2 : 1;
    const reloadMult = me.reloading ? 2.6 : 1;
    const spread = Math.round(baseSpread * crouchMult * movingMult * reloadMult);
    H.chN.style.marginTop = -spread - 8 + "px";
    H.chS.style.marginTop = spread + "px";
    H.chE.style.marginLeft = spread + "px";
    H.chW.style.marginLeft = -spread - 8 + "px";
  }
  H.score.textContent = me && me.alive ? "Score: " + (me.score || 0) + " | Kills: " + (me.kills || 0) + " | Lv" + (me.level || 0) : "Waiting for next round...";
  const specEl = H.spectateMsg;
  if (me && me.alive) {
    if (specEl.style.display !== "none") specEl.style.display = "none";
  } else {
    if (specEl.style.display !== "block") specEl.style.display = "block";
    const target = state_default.serverPlayers.find((p) => p.id === state_default.spectateTargetId);
    const signature = (state_default.killerName || "") + "|" + (target ? target.name : "");
    if (state_default._specSignature !== signature) {
      state_default._specSignature = signature;
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
  }
  let _aliveCount = 0;
  for (let i = 0; i < state_default.serverPlayers.length; i++) if (state_default.serverPlayers[i].alive) _aliveCount++;
  const pcSig = _aliveCount + "/" + state_default.serverPlayers.length;
  if (state_default._pcSig !== pcSig) {
    state_default._pcSig = pcSig;
    H.playerCount.textContent = "\u{1F404} " + pcSig;
  }
  for (let i = state_default.killfeed.length - 1; i >= 0; i--) {
    state_default.killfeed[i].t -= dt;
    if (state_default.killfeed[i].t <= 0) state_default.killfeed.splice(i, 1);
  }
  if (!state_default._hudTick) state_default._hudTick = 0;
  state_default._hudTick += dt;
  if (state_default._hudTick >= 0.1) {
    state_default._hudTick = 0;
    H.killfeed.innerHTML = state_default.killfeed.map((k) => '<div style="margin-bottom:3px;opacity:' + Math.min(1, k.t) + '">' + k.txt + "</div>").join("");
    state_default.chatLog.forEach((c) => c.t -= dt * 1);
    const chatEl = H.chatLog;
    if (chatEl) {
      const colHex = { pink: "#ff88aa", blue: "#88aaff", green: "#88ff88", gold: "#ffdd44", purple: "#cc88ff", red: "#ff4444", orange: "#ff8844", cyan: "#44ffdd" };
      const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      chatEl.innerHTML = state_default.chatLog.map((c) => {
        const col = colHex[c.color] || "#ff88aa";
        const opacity = Math.min(1, c.t / 3);
        return '<div style="margin-bottom:2px;opacity:' + opacity + '"><span style="color:' + col + ';font-weight:bold">' + escapeHtml(c.name) + ":</span> " + escapeHtml(c.text) + "</div>";
      }).join("");
    }
  }
  state_default.chatLog = state_default.chatLog.filter((c) => c.t > 0);
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
      let iwLine = "";
      if (state_default._iwStats) {
        const fmtRing = (buf, count) => {
          if (!buf || count === 0) return "n/a";
          let min = Infinity, max = -Infinity, sum = 0;
          for (let i = 0; i < count; i++) {
            const v = buf[i];
            if (v < min) min = v;
            if (v > max) max = v;
            sum += v;
          }
          return min.toFixed(0) + "/" + (sum / count).toFixed(0) + "/" + max.toFixed(0);
        };
        const iw = state_default._iwStats;
        iwLine = "\nSTATE gap ms: " + fmtRing(iw.gaps, iw.gapsCount) + "\nPOS delta: " + fmtRing(iw.deltas, iw.deltasCount) + "\nFRAME gap ms: " + fmtRing(iw.frameGaps, iw.frameGapsCount) + "\nJANK frames (>50ms): " + iw.frameJank;
      }
      dbg.textContent = "POS: " + me.x.toFixed(0) + ", " + me.y.toFixed(0) + ", " + (me.z || 0).toFixed(1) + "\nAIM: yaw=" + yawDeg + " pitch=" + pitchDeg + "\nWEP: " + (me.weapon || "normal") + " ammo=" + (me.ammo >= 0 ? me.ammo : "\u221E") + (state_default.fireMode ? " [" + state_default.fireMode + "]" : "") + "\nFPS: " + state_default.fpsDisplay + " PING: " + Math.round(state_default.pingVal) + "ms\nPLAYERS: " + _aliveCount + "/" + state_default.serverPlayers.length + "\nPROJ: " + state_default.projData.length + iwLine;
    }
  }
  if (state_default._hudTick === 0) {
    const mc = H.minimap, mctx = mc.getContext("2d");
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
}
var H;
var init_hud = __esm({
  "client/hud.js"() {
    init_config();
    init_state();
    H = null;
  }
});

// shared/messages.js
var require_messages = __commonJS({
  "shared/messages.js"(exports, module) {
    var S2C2 = Object.freeze({
      serverStatus: "serverStatus",
      joined: "joined",
      lobby: "lobby",
      spectate: "spectate",
      start: "start",
      tick: "tick",
      inputAck: "inputAck",
      playerSnapshot: "playerSnapshot",
      food: "food",
      eat: "eat",
      projectile: "projectile",
      projectileHit: "projectileHit",
      wallImpact: "wallImpact",
      explosion: "explosion",
      eliminated: "eliminated",
      chat: "chat",
      barricadePlaced: "barricadePlaced",
      barricadeDestroyed: "barricadeDestroyed",
      barricadeHit: "barricadeHit",
      wallDestroyed: "wallDestroyed",
      wallDamaged: "wallDamaged",
      kill: "kill",
      winner: "winner",
      restart: "restart",
      levelup: "levelup",
      cowstrikeWarning: "cowstrikeWarning",
      cowstrike: "cowstrike",
      botsToggled: "botsToggled",
      botsFreeWillToggled: "botsFreeWillToggled",
      nightToggled: "nightToggled",
      dash: "dash",
      weaponPickup: "weaponPickup",
      weaponSpawn: "weaponSpawn",
      weaponDespawn: "weaponDespawn",
      weaponDrop: "weaponDrop",
      reloaded: "reloaded",
      shellLoaded: "shellLoaded",
      emptyMag: "emptyMag",
      armorPickup: "armorPickup",
      armorSpawn: "armorSpawn",
      shieldHit: "shieldHit",
      shieldBreak: "shieldBreak",
      newHost: "newHost",
      kicked: "kicked"
    });
    var C2S = Object.freeze({
      join: "join",
      setName: "setName",
      ready: "ready",
      kick: "kick",
      toggleBots: "toggleBots",
      toggleBotsFreeWill: "toggleBotsFreeWill",
      toggleNight: "toggleNight",
      perk: "perk",
      move: "move",
      attack: "attack",
      reload: "reload",
      dash: "dash",
      jump: "jump",
      placeBarricade: "placeBarricade",
      chat: "chat",
      dropWeapon: "dropWeapon",
      setUpdateRate: "setUpdateRate"
    });
    var MSG = Object.freeze({ ...S2C2, ...C2S });
    function assertEnumIntegrity() {
      const seen = /* @__PURE__ */ new Set();
      for (const [k, v] of Object.entries(MSG)) {
        if (!v || typeof v !== "string") throw new Error(`MSG.${k} is not a non-empty string: ${JSON.stringify(v)}`);
        if (seen.has(v)) throw new Error(`MSG has duplicate value "${v}"`);
        seen.add(v);
      }
    }
    module.exports = { MSG, S2C: S2C2, C2S, assertEnumIntegrity };
  }
});

// shared/collision.js
var require_collision = __commonJS({
  "shared/collision.js"(exports, module) {
    var { PLAYER_WALL_INFLATE } = require_constants();
    function pushOutOfWalls(p, walls, zGate) {
      for (const w of walls) {
        const left = w.x - PLAYER_WALL_INFLATE, right = w.x + w.w + PLAYER_WALL_INFLATE;
        const top = w.y - PLAYER_WALL_INFLATE, bot = w.y + w.h + PLAYER_WALL_INFLATE;
        if (p.x > left && p.x < right && p.y > top && p.y < bot) {
          if (zGate && !zGate(p, w)) continue;
          const escL = p.x - left, escR = right - p.x;
          const escT = p.y - top, escB = bot - p.y;
          const minEsc = Math.min(escL, escR, escT, escB);
          if (minEsc === escL) p.x = left;
          else if (minEsc === escR) p.x = right;
          else if (minEsc === escT) p.y = top;
          else p.y = bot;
        }
      }
    }
    module.exports = { pushOutOfWalls };
  }
});

// shared/movement.js
var require_movement = __commonJS({
  "shared/movement.js"(exports, module) {
    var {
      PLAYER_BASE_SPEED,
      PLAYER_WALK_MULT,
      MUD_SPEED_MULT,
      GRAVITY,
      BARRICADE_HEIGHT,
      PLAYER_WALL_INFLATE
    } = require_constants();
    var { pushOutOfWalls } = require_collision();
    function stepPlayerMovement2(p, dt, world, input, terrain2) {
      if (p.stunTimer > 0) p.stunTimer -= dt;
      if (p.spawnProtection > 0) {
        p.spawnProtection -= dt;
        return;
      }
      const ix = input.dx, iy = input.dy;
      if (Math.abs(ix) + Math.abs(iy) > 0.01 && p.stunTimer <= 0) {
        const len = Math.hypot(ix, iy);
        const nx = ix / len, ny = iy / len;
        const sizeSlowdown = 1 - Math.min(0.3, p.foodEaten * 0.01);
        let mudSlow = 1;
        for (const m of world.mudPatches) {
          if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) {
            mudSlow = MUD_SPEED_MULT;
            break;
          }
        }
        const walkMult = input.walking ? PLAYER_WALK_MULT : 1;
        const speed = PLAYER_BASE_SPEED * sizeSlowdown * p.perks.speedMult * mudSlow * walkMult;
        p.x += nx * speed * dt;
        p.y += ny * speed * dt;
        if (Math.abs(nx) > Math.abs(ny)) p.dir = nx > 0 ? "east" : "west";
        else p.dir = ny > 0 ? "south" : "north";
        if (p.isBot) p.aimAngle = Math.atan2(-nx, ny);
      }
      const WALL_HEIGHT = terrain2.WALL_HEIGHT;
      pushOutOfWalls(
        p,
        world.walls,
        (pp, w) => pp.z < terrain2.getGroundHeight(w.x + w.w / 2, w.y + w.h / 2) + WALL_HEIGHT
      );
      for (const b of world.barricades) {
        const bTop = b._terrainH + BARRICADE_HEIGHT;
        if (p.z >= bTop) continue;
        const dxB = p.x - b.cx, dyB = p.y - b.cy;
        const lx = b._cosA * dxB + b._sinA * dyB;
        const ly = -b._sinA * dxB + b._cosA * dyB;
        const halfThin = b.h / 2 + PLAYER_WALL_INFLATE;
        const halfWide = b.w / 2 + PLAYER_WALL_INFLATE;
        if (Math.abs(lx) < halfThin && Math.abs(ly) < halfWide) {
          const overThin = halfThin - Math.abs(lx);
          const overWide = halfWide - Math.abs(ly);
          let newLx = lx, newLy = ly;
          if (overThin < overWide) newLx = lx >= 0 ? halfThin : -halfThin;
          else newLy = ly >= 0 ? halfWide : -halfWide;
          p.x = b.cx + b._cosA * newLx - b._sinA * newLy;
          p.y = b.cy + b._sinA * newLx + b._cosA * newLy;
        }
      }
      const groundH = terrain2.getGroundHeight(p.x, p.y);
      if (p.vz === void 0) {
        p.z = groundH;
        p.vz = 0;
      }
      p.vz -= GRAVITY * dt;
      p.z += p.vz * dt;
      if (p.z <= groundH) {
        p.z = groundH;
        p.vz = 0;
        p.onGround = true;
      } else {
        p.onGround = false;
      }
      if (!p._portalCooldown || p._portalCooldown <= 0) {
        for (const portal of world.portals) {
          if (Math.hypot(p.x - portal.x1, p.y - portal.y1) < 35) {
            p.x = portal.x2;
            p.y = portal.y2;
            p._portalCooldown = 2;
            break;
          }
          if (Math.hypot(p.x - portal.x2, p.y - portal.y2) < 35) {
            p.x = portal.x1;
            p.y = portal.y1;
            p._portalCooldown = 2;
            break;
          }
        }
      }
      if (p._portalCooldown > 0) p._portalCooldown -= dt;
      const zone = world.zone;
      p.x = Math.max(zone.x + 20, Math.min(zone.x + zone.w - 20, p.x));
      p.y = Math.max(zone.y + 20, Math.min(zone.y + zone.h - 20, p.y));
    }
    module.exports = { stepPlayerMovement: stepPlayerMovement2 };
  }
});

// client/prediction.js
function getRenderOffset() {
  return { x: errX, y: errY, z: errZ };
}
function decayRenderOffset(frameDt) {
  if (errRemainTime <= 0) {
    errX = 0;
    errY = 0;
    errZ = 0;
    return;
  }
  if (frameDt >= errRemainTime) {
    errX = 0;
    errY = 0;
    errZ = 0;
    errRemainTime = 0;
    return;
  }
  const f = frameDt / errRemainTime;
  errX -= errX * f;
  errY -= errY * f;
  errZ -= errZ * f;
  errRemainTime -= frameDt;
}
function setCurrentInput(dx, dy, walking) {
  currentInput.dx = dx;
  currentInput.dy = dy;
  currentInput.walking = walking;
}
function buildPredictedPerks(p) {
  return {
    speedMult: p && p.speedMult != null ? p.speedMult : 1,
    maxHunger: 100,
    sizeMult: p && p.sizeMult != null ? p.sizeMult : 1,
    damage: 1
  };
}
function snapshotPlayer(p) {
  return {
    x: p.x,
    y: p.y,
    z: p.z,
    vz: p.vz,
    dir: p.dir,
    onGround: p.onGround,
    stunTimer: p.stunTimer || 0,
    // Derive from the server's boolean `spawnProt` field on the tick
    // payload — the actual timer value isn't broadcast, so we treat the
    // protected state as "just started". stepPlayerMovement's early-return
    // semantics only care that spawnProtection > 0.
    spawnProtection: p.spawnProt ? 1 : 0,
    foodEaten: p.foodEaten || 0,
    _portalCooldown: p._portalCooldown || 0,
    perks: p.perks || buildPredictedPerks(p),
    isBot: false
  };
}
function initPrediction() {
  if (!state_default.me) return;
  state_default.mePredicted = snapshotPlayer(state_default.me);
  predictRing.length = 0;
  accumulator = 0;
  _prevPredicted = null;
  errX = 0;
  errY = 0;
  errZ = 0;
  _predictErrorLogged = false;
}
function buildWorld() {
  return {
    walls: state_default.mapFeatures.walls || [],
    barricades: state_default.barricades || [],
    mudPatches: state_default.mapFeatures.mud || [],
    portals: state_default.mapFeatures.portals || [],
    zone: state_default.serverZone
  };
}
function getRenderedPredicted() {
  if (!state_default.mePredicted) return null;
  const f = Math.max(0, Math.min(1, accumulator / TICK_DT));
  if (!_prevPredicted) return { x: state_default.mePredicted.x, y: state_default.mePredicted.y, z: state_default.mePredicted.z };
  return {
    x: _prevPredicted.x + (state_default.mePredicted.x - _prevPredicted.x) * f,
    y: _prevPredicted.y + (state_default.mePredicted.y - _prevPredicted.y) * f,
    z: _prevPredicted.z + (state_default.mePredicted.z - _prevPredicted.z) * f
  };
}
function predictStep(frameDt) {
  if (!state_default.mePredicted || !state_default.me) return;
  accumulator += frameDt;
  if (accumulator > 0.25) accumulator = 0.25;
  const world = buildWorld();
  while (accumulator >= TICK_DT) {
    accumulator -= TICK_DT;
    _prevPredicted = { x: state_default.mePredicted.x, y: state_default.mePredicted.y, z: state_default.mePredicted.z };
    const seqAtStep = state_default.inputSeq;
    const stepInput = { dx: currentInput.dx, dy: currentInput.dy, walking: !!currentInput.walking };
    try {
      (0, import_movement.stepPlayerMovement)(state_default.mePredicted, TICK_DT, world, stepInput, terrain);
    } catch (e) {
      if (!_predictErrorLogged) {
        _predictErrorLogged = true;
        console.error("[prediction] stepPlayerMovement threw:", e);
      }
      accumulator = 0;
      return;
    }
    predictRing.push({ seq: seqAtStep, state: snapshotPlayer(state_default.mePredicted), input: stepInput });
    if (predictRing.length > PREDICT_RING_CAP) predictRing.shift();
  }
  decayRenderOffset(frameDt);
}
function reconcilePrediction(ackedState) {
  if (!state_default.mePredicted || !state_default.me || state_default.lastAckedInput <= 0) return false;
  if (!ackedState) return false;
  while (predictRing.length > 0 && predictRing[0].seq < state_default.lastAckedInput) {
    predictRing.shift();
  }
  let ackedIdx = -1;
  for (let i = predictRing.length - 1; i >= 0; i--) {
    if (predictRing[i].seq === state_default.lastAckedInput) {
      ackedIdx = i;
      break;
    }
  }
  const serverX = ackedState.x, serverY = ackedState.y, serverZ = ackedState.z;
  const serverVz = ackedState.vz || 0;
  const serverOnGround = !!ackedState.onGround;
  if (ackedIdx < 0) {
    const preX2 = state_default.mePredicted.x, preY2 = state_default.mePredicted.y, preZ2 = state_default.mePredicted.z;
    state_default.mePredicted.x = serverX;
    state_default.mePredicted.y = serverY;
    state_default.mePredicted.z = serverZ;
    state_default.mePredicted.vz = serverVz;
    state_default.mePredicted.onGround = serverOnGround;
    foldError(preX2 - serverX, preY2 - serverY, preZ2 - serverZ);
    return false;
  }
  const acked = predictRing[ackedIdx];
  const dx = acked.state.x - serverX;
  const dy = acked.state.y - serverY;
  const dz = (acked.state.z || 0) - (serverZ || 0);
  const drift = Math.hypot(dx, dy, dz);
  if (drift <= RECONCILE_EPSILON) {
    predictRing.splice(0, ackedIdx + 1);
    return false;
  }
  const preX = state_default.mePredicted.x, preY = state_default.mePredicted.y, preZ = state_default.mePredicted.z;
  state_default.mePredicted.x = serverX;
  state_default.mePredicted.y = serverY;
  state_default.mePredicted.z = serverZ;
  state_default.mePredicted.vz = serverVz;
  state_default.mePredicted.onGround = serverOnGround;
  predictRing.splice(0, ackedIdx + 1);
  const world = buildWorld();
  for (const e of predictRing) {
    (0, import_movement.stepPlayerMovement)(state_default.mePredicted, TICK_DT, world, e.input || currentInput, terrain);
    e.state = snapshotPlayer(state_default.mePredicted);
  }
  foldError(preX - state_default.mePredicted.x, preY - state_default.mePredicted.y, preZ - state_default.mePredicted.z);
  return true;
}
function foldError(dx, dy, dz) {
  const newX = errX + dx;
  const newY = errY + dy;
  const newZ = errZ + dz;
  const mag = Math.hypot(newX, newY, newZ);
  if (mag > ERR_INSTANT_SNAP) {
    errX = 0;
    errY = 0;
    errZ = 0;
    errRemainTime = 0;
    return;
  }
  if (mag < ERR_DEAD_ZONE) {
    errX = 0;
    errY = 0;
    errZ = 0;
    errRemainTime = 0;
    return;
  }
  errX = newX;
  errY = newY;
  errZ = newZ;
  errRemainTime = ERR_LINEAR_TIME;
}
var import_movement, TICK_HZ, TICK_DT, RECONCILE_EPSILON, PREDICT_RING_CAP, terrain, accumulator, errX, errY, errZ, errRemainTime, ERR_LINEAR_TIME, ERR_INSTANT_SNAP, ERR_DEAD_ZONE, predictRing, currentInput, _predictErrorLogged, _prevPredicted;
var init_prediction = __esm({
  "client/prediction.js"() {
    init_state();
    import_movement = __toESM(require_movement());
    init_terrain();
    TICK_HZ = 30;
    TICK_DT = 1 / TICK_HZ;
    RECONCILE_EPSILON = 1;
    PREDICT_RING_CAP = 60;
    terrain = {
      getGroundHeight: (x, y) => getTerrainHeight(x, y),
      WALL_HEIGHT: 70
    };
    accumulator = 0;
    errX = 0;
    errY = 0;
    errZ = 0;
    errRemainTime = 0;
    ERR_LINEAR_TIME = 0.15;
    ERR_INSTANT_SNAP = 40;
    ERR_DEAD_ZONE = 0.05;
    predictRing = [];
    currentInput = { dx: 0, dy: 0, walking: false };
    _predictErrorLogged = false;
    _prevPredicted = null;
  }
});

// client/message-handlers.js
import * as THREE12 from "three";
function getHitFlash() {
  return _hitFlash || (_hitFlash = document.getElementById("hitFlash"));
}
function flashHit(opacity, duration, bg) {
  const el = getHitFlash();
  if (!el) return;
  if (bg) el.style.background = bg;
  el.style.opacity = String(opacity);
  setTimeout(() => {
    el.style.opacity = "0";
    if (bg) el.style.background = "rgba(255,0,0,0.3)";
  }, duration);
}
function addKillFeed(txt, t) {
  state_default.killfeed.unshift({ txt, t });
  if (state_default.killfeed.length > 5) state_default.killfeed.pop();
}
function updateHostControls() {
  const hc = document.getElementById("hostControls");
  if (!hc) return;
  const inLobby = state_default.state === "lobby" && state_default.hostId && state_default.myId === state_default.hostId;
  hc.style.display = inLobby ? "block" : "none";
}
var import_messages, _tmpDir, _hitFlash, handlers;
var init_message_handlers = __esm({
  "client/message-handlers.js"() {
    init_state();
    init_audio();
    init_renderer();
    init_terrain();
    init_network();
    init_ui();
    init_entities();
    init_map_objects();
    init_projectiles();
    init_particles();
    init_pickups();
    init_three_utils();
    import_messages = __toESM(require_messages());
    init_interp();
    init_prediction();
    _tmpDir = new THREE12.Vector3();
    _hitFlash = null;
    handlers = {
      serverStatus(msg) {
        const el = document.getElementById("gameStatus");
        if (el) {
          if (msg.gameState === "playing") {
            el.textContent = "\u{1F3AF} Match in progress \u2014 " + msg.alive + "/" + msg.total + " cows remaining";
            el.style.color = "#ffaa44";
          } else if (msg.gameState === "lobby") {
            el.textContent = "\u{1F550} Waiting for players in lobby";
            el.style.color = "#88ff88";
          } else if (msg.gameState === "ending") {
            el.textContent = "\u{1F3C1} Match ending...";
            el.style.color = "#cc88ff";
          } else {
            el.textContent = "";
          }
        }
      },
      joined(msg) {
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
        document.getElementById("nightCheck").checked = !!msg.nightMode;
        setNightMode(!!msg.nightMode);
        updateHostControls();
        initAudio();
        startMenuMusic();
      },
      nightToggled(msg) {
        document.getElementById("nightCheck").checked = msg.enabled;
        setNightMode(msg.enabled);
      },
      newHost(msg) {
        state_default.hostId = msg.hostId;
        updateHostControls();
      },
      kicked(msg) {
        document.getElementById("joinScreen").style.display = "flex";
        document.getElementById("joinScreen").querySelector("h2").textContent = "You were kicked from the lobby";
        if (state_default.ws) try {
          state_default.ws.close();
        } catch (e) {
        }
      },
      lobby(msg) {
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
      },
      spectate(msg) {
        if (msg.terrainSeed !== void 0) rebuildTerrain(msg.terrainSeed);
        state_default.state = "playing";
        updateHostControls();
        state_default.inputSeq = 0;
        state_default.lastAckedInput = 0;
        document.getElementById("joinScreen").style.display = "none";
        document.getElementById("hud").style.display = "block";
        state_default.serverPlayers = msg.players;
        state_default.me = state_default.serverPlayers.find((p) => p.id === state_default.myId) || null;
        state_default.serverFoods = (msg.foods || []).map((f) => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
        if (msg.zone) state_default.serverZone = msg.zone;
        if (msg.map) {
          state_default.mapFeatures = msg.map;
          state_default.mapBuilt = false;
        }
        if (msg.weapons) state_default.clientWeapons = msg.weapons;
        clearPickups();
        if (msg.armorPickups) setArmorSpawns(msg.armorPickups);
        clearBarricades();
        if (msg.barricades) msg.barricades.forEach((b) => addBarricade(b));
      },
      start(msg) {
        if (msg.terrainSeed !== void 0) rebuildTerrain(msg.terrainSeed);
        state_default.state = "playing";
        updateHostControls();
        state_default.inputSeq = 0;
        state_default.lastAckedInput = 0;
        document.getElementById("joinScreen").style.display = "none";
        document.getElementById("hud").style.display = "block";
        state_default.serverPlayers = msg.players;
        state_default.me = state_default.serverPlayers.find((p) => p.id === state_default.myId) || null;
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
        setMusicPlaying(true);
        state_default.spectateTargetId = null;
        state_default.killerId = null;
        state_default.killerName = null;
        state_default.barricadeReadyAt = 0;
        clearBarricades();
        if (msg.barricades) msg.barricades.forEach((b) => addBarricade(b));
        clearPickups();
        setArmorSpawns(msg.armorPickups || []);
        document.getElementById("winScreen").style.display = "none";
        for (const id in state_default.cowMeshes) {
          scene.remove(state_default.cowMeshes[id].mesh);
        }
        state_default.cowMeshes = {};
        for (const id in state_default.projMeshes) {
          disposeMeshTree(state_default.projMeshes[id]);
        }
        state_default.projMeshes = {};
        state_default.projData = [];
        clearRocketSounds();
        clearParticles();
      },
      // 30 Hz broadcast of mutable player fields only. Sticky fields
      // (name/color/weapon/perks/xpToNext/sizeMult/recoilMult/extMagMult) arrive
      // via 'start'/'spectate' (wholesale replace) or 'playerSnapshot' (per-player
      // upsert). This handler merges tick fields into the existing serverPlayers
      // array in-place — no wholesale replace, so sticky fields survive.
      //
      // Race: if a tick arrives for a player we haven't seen a snapshot for yet
      // (rare — a join mid-round would hit 'spectate' first, but a late player
      // join could race), we skip that entry. The next snapshot or spectate sync
      // will fill it in.
      tick(msg) {
        if (typeof msg.tickNum === "number") state_default.lastTickNum = msg.tickNum;
        if (state_default._iwStats === void 0) {
          state_default._iwStats = {
            lastStateTs: 0,
            lastMeX: 0,
            lastMeY: 0,
            gaps: new Float32Array(120),
            gapsIdx: 0,
            gapsCount: 0,
            deltas: new Float32Array(120),
            deltasIdx: 0,
            deltasCount: 0,
            frameGaps: new Float32Array(120),
            frameGapsIdx: 0,
            frameGapsCount: 0,
            frameJank: 0
          };
        }
        const iw = state_default._iwStats;
        const iwNow = performance.now();
        if (iw.lastStateTs > 0) {
          iw.gaps[iw.gapsIdx] = iwNow - iw.lastStateTs;
          iw.gapsIdx = (iw.gapsIdx + 1) % 120;
          if (iw.gapsCount < 120) iw.gapsCount++;
        }
        iw.lastStateTs = iwNow;
        const seen = /* @__PURE__ */ new Set();
        for (const t of msg.players) {
          seen.add(t.id);
          const existing = state_default.serverPlayers.find((sp) => sp.id === t.id);
          if (!existing) continue;
          if (existing.id === state_default.myId) {
            Object.assign(existing, t);
          } else {
            Object.assign(existing, t);
            if (!existing._histBuf) existing._histBuf = [];
            existing._histBuf.push({
              t: iwNow,
              x: t.x,
              y: t.y,
              z: t.z,
              aim: t.aimAngle
            });
            if (existing._histBuf.length > INTERP_HIST_CAP) existing._histBuf.shift();
          }
        }
        for (let i = state_default.serverPlayers.length - 1; i >= 0; i--) {
          if (!seen.has(state_default.serverPlayers[i].id)) state_default.serverPlayers.splice(i, 1);
        }
        state_default.me = state_default.serverPlayers.find((p) => p.id === state_default.myId) || null;
        if (state_default.me) {
          const dx = state_default.me.x - iw.lastMeX, dy = state_default.me.y - iw.lastMeY;
          iw.deltas[iw.deltasIdx] = Math.sqrt(dx * dx + dy * dy);
          iw.deltasIdx = (iw.deltasIdx + 1) % 120;
          if (iw.deltasCount < 120) iw.deltasCount++;
          iw.lastMeX = state_default.me.x;
          iw.lastMeY = state_default.me.y;
        }
        if (msg.zone) state_default.serverZone = msg.zone;
        if (state_default.pingLast > 0) {
          const pd = performance.now() - state_default.pingLast;
          if (pd < 2e3) state_default.pingVal = state_default.pingVal * 0.7 + pd * 0.3;
          state_default.pingLast = 0;
        }
      },
      // Low-rate (~6 Hz) echo of the server's highest-applied input seq for
      // THIS client PLUS the server's authoritative position at this tick.
      // Phase 4 CSP reconcile compares predicted-at-seq against the embedded
      // position (not S.me, which would be a later tick and race).
      inputAck(msg) {
        if (typeof msg.seq !== "number" || msg.seq <= state_default.lastAckedInput) return;
        if (typeof msg.x !== "number" || typeof msg.y !== "number" || typeof msg.z !== "number") return;
        state_default.lastAckedInput = msg.seq;
        reconcilePrediction({
          x: msg.x,
          y: msg.y,
          z: msg.z,
          vz: msg.vz || 0,
          onGround: !!msg.onGround
        });
      },
      // Upsert a single player's full sticky+mutable shape. Emitted by the server
      // when a sticky field changes (weapon pickup, perk, level up, dual-wield
      // toggle). If the player is already in serverPlayers, merge; otherwise
      // append — covers the mid-round join path where a tick can arrive before
      // the spectate sync lands.
      playerSnapshot(msg) {
        const snap = msg.player;
        if (!snap || snap.id == null) return;
        const existing = state_default.serverPlayers.find((sp) => sp.id === snap.id);
        if (existing) Object.assign(existing, snap);
        else state_default.serverPlayers.push(snap);
        if (snap.id === state_default.myId) state_default.me = state_default.serverPlayers.find((p) => p.id === state_default.myId) || null;
      },
      food(msg) {
        const f = msg.food || msg;
        state_default.serverFoods.push({ id: f.id, x: f.x, y: f.y, type: f.type || f.typeName });
      },
      eat(msg) {
        state_default.serverFoods = state_default.serverFoods.filter((f) => f.id !== msg.foodId);
        spawnParts(msg.playerId);
        if (msg.playerId === state_default.myId) sfxEat();
      },
      projectile(msg) {
        let vy3d = msg.vz || 0, spawnH = msg.z || 15 + getTerrainHeight(msg.x, msg.y);
        let spawnX = msg.x, spawnZ = msg.y;
        if (msg.ownerId === state_default.myId) {
          const myWep = state_default.me ? state_default.me.weapon : "normal";
          const MUZZLES = {
            normal: { x: 2, y: -2.8, z: -13 },
            shotgun: { x: 2, y: -0.8, z: -24 },
            burst: { x: 3.5, y: -2.6, z: -22 },
            bolty: { x: 0, y: -4, z: -26 },
            cowtank: { x: 2, y: -3, z: -22 }
          };
          let m = MUZZLES[myWep] || MUZZLES.normal;
          if (myWep === "burst" && state_default.me && state_default.me.dualWield && msg.muzzle === 1) {
            m = { x: m.x - 9, y: m.y, z: m.z };
          }
          if (myWep === "shotgun" && state_default.me && state_default.me.dualWield && msg.muzzle === 1) {
            m = { x: m.x - 9, y: m.y, z: m.z };
          }
          if (myWep === "bolty" && !state_default.adsActive) {
            m = { x: 3, y: -3.5, z: -26 };
          }
          _tmpDir.set(m.x, m.y, m.z).applyQuaternion(cam.quaternion);
          spawnX = cam.position.x + _tmpDir.x;
          spawnH = cam.position.y + _tmpDir.y;
          spawnZ = cam.position.z + _tmpDir.z;
        }
        if (msg.shotgun !== void 0) {
          vy3d += (Math.random() - 0.5) * 150;
        }
        state_default.projData.push({ id: msg.id, x: spawnX, y: spawnZ, vx: msg.vx, vy: msg.vy, color: msg.color || "pink", bolty: msg.bolty, cowtank: msg.cowtank, y3d: spawnH, vy3d, _lastTrailPos: msg.bolty ? { x: spawnX, y: spawnH, z: spawnZ } : void 0 });
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
          const myWep = state_default.me ? state_default.me.weapon : "normal";
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
          if (pattern && state_default.me) {
            const now = performance.now();
            if (now - state_default.recoilTimer > 500) state_default.recoilIndex = 0;
            state_default.recoilTimer = now;
            const r = pattern[state_default.recoilIndex % pattern.length];
            const burstMod = wep === "burst" && state_default.fireMode === "burst" ? 0.65 : 1;
            const tacticowMod = state_default.me.recoilMult || 1;
            const walkingMod = state_default.crouching ? 0.73 : 1;
            const dualMod = state_default.me.dualWield ? wep === "shotgun" ? 1.1 : 1.3 : 1;
            const recoilMult = burstMod * tacticowMod * walkingMod * dualMod;
            state_default.pitch += r.p * recoilMult;
            state_default.yaw += r.y * recoilMult;
            state_default.pitch = Math.max(-1.2, Math.min(1.2, state_default.pitch));
            state_default.recoilIndex++;
          }
        }
      },
      wallImpact(msg) {
        const th = getTerrainHeight(msg.x, msg.y);
        for (let i = 0; i < 5; i++) {
          spawnParticle({
            geo: PGEO_SPHERE_LO,
            color: 16768324,
            x: msg.x + (Math.random() - 0.5) * 8,
            y: (msg.z || th + 30) + (Math.random() - 0.5) * 8,
            z: msg.y + (Math.random() - 0.5) * 8,
            sx: 0.8,
            life: 0.4,
            peakOpacity: 1,
            vx: (Math.random() - 0.5) * 40,
            vy: (Math.random() - 0.5) * 40,
            vz: (Math.random() - 0.5) * 40
          });
        }
      },
      projectileHit(msg) {
        state_default.projData = state_default.projData.filter((p) => p.id !== msg.projectileId);
        if (state_default.projMeshes[msg.projectileId]) {
          disposeMeshTree(state_default.projMeshes[msg.projectileId]);
          delete state_default.projMeshes[msg.projectileId];
        }
        if (msg.targetId === state_default.myId) {
          sfxHit();
          flashHit(0.5, 150);
        }
        if (msg.targetId && msg.ownerId === state_default.myId && msg.targetId !== state_default.myId) {
          sfx(600, 0.06, "square", 0.07);
          const hm = document.getElementById("hitMarker");
          if (hm) {
            hm.classList.toggle("head", !!msg.headshot);
            hm.classList.add("show");
            if (msg.headshot) {
              sfx(1200, 0.15, "sine", 0.08);
              sfx(1800, 0.1, "sine", 0.06);
            }
            clearTimeout(window._hitMarkerTimer);
            window._hitMarkerTimer = setTimeout(() => {
              hm.classList.remove("show");
            }, msg.headshot ? 260 : 160);
          }
        }
        if (msg.targetId && !msg.wall) {
          const target = state_default.serverPlayers.find((p) => p.id === msg.targetId);
          if (target) {
            const smooth = target.id === state_default.myId ? { x: target.x, y: target.y, z: target.z } : interpSamplePlayer(target, performance.now());
            const tz = smooth.z !== void 0 ? smooth.z : getTerrainHeight(smooth.x, smooth.y);
            const impactY = msg.headshot ? tz + 36 : tz + 20;
            const count = msg.headshot ? 18 : 8;
            const baseScale = msg.headshot ? 2.6 : 1.9;
            const spd = msg.headshot ? 70 : 40;
            for (let i = 0; i < count; i++) {
              const sc = baseScale * (0.6 + Math.random() * 0.8);
              spawnParticle({
                geo: PGEO_SPHERE_LO,
                color: 13374741,
                x: smooth.x,
                y: impactY,
                z: smooth.y,
                sx: sc,
                life: 0.9,
                peakOpacity: 1,
                vx: (Math.random() - 0.5) * spd,
                vy: (Math.random() * 0.6 + 0.4) * spd,
                vz: (Math.random() - 0.5) * spd,
                gy: 80
              });
            }
          }
        }
        if (msg.targetId && msg.dmg) {
          const target = state_default.serverPlayers.find((p) => p.id === msg.targetId);
          if (target) {
            const dmg = msg.dmg;
            const hasShield = target.armor > 0;
            const color = msg.headshot ? "#ff2222" : hasShield ? "#44aaff" : dmg >= 25 ? "#ff4444" : dmg >= 10 ? "#ffaa44" : "#ffffff";
            const prefix = hasShield ? "\u{1F6E1}\uFE0F " : "";
            const label = prefix + dmg;
            const nc = document.createElement("canvas");
            nc.width = 160;
            nc.height = 48;
            const ctx = nc.getContext("2d");
            ctx.font = "bold " + (dmg >= 25 ? 36 : dmg >= 10 ? 28 : 22) + "px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillText(label, 81, 35);
            ctx.fillStyle = color;
            ctx.fillText(label, 80, 34);
            const tex = new THREE12.CanvasTexture(nc);
            tex.minFilter = THREE12.LinearFilter;
            const mat = new THREE12.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
            const sprite = new THREE12.Sprite(mat);
            const tz = target.z !== void 0 ? target.z : getTerrainHeight(target.x, target.y);
            sprite.position.set(target.x + (Math.random() - 0.5) * 20, tz + 40 + Math.random() * 10, target.y + (Math.random() - 0.5) * 20);
            sprite.scale.set(96, 28, 1);
            scene.add(sprite);
            let life = 1.5;
            const vy = 8 + Math.random() * 6;
            const vx = (Math.random() - 0.5) * 15;
            const vz = (Math.random() - 0.5) * 15;
            let dnDisposed = false;
            const dnCleanup = () => {
              if (dnDisposed) return;
              dnDisposed = true;
              scene.remove(sprite);
              tex.dispose();
              mat.dispose();
            };
            const anim = () => {
              if (dnDisposed) return;
              life -= 0.012;
              mat.opacity = Math.max(0, life);
              sprite.position.y += vy * 0.016;
              sprite.position.x += vx * 0.016;
              sprite.position.z += vz * 0.016;
              if (life <= 0) dnCleanup();
              else requestAnimationFrame(anim);
            };
            requestAnimationFrame(anim);
            setTimeout(dnCleanup, 2e3);
          }
        }
      },
      explosion(msg) {
        const ex = msg.x, ey = msg.y, er = msg.radius || 120;
        const th = getTerrainHeight(ex, ey);
        spawnParticle({
          geo: PGEO_SPHERE_MED,
          color: 16737792,
          x: ex,
          y: th + 10,
          z: ey,
          sx: er * 0.3,
          life: 0.5,
          peakOpacity: 0.6,
          growth: 3
        });
        for (let sc = 0; sc < 16; sc++) {
          const smokeSize = 12 + Math.random() * 16;
          spawnParticle({
            geo: PGEO_SPHERE_MED,
            color: 2763306,
            x: ex + (Math.random() - 0.5) * er * 0.5,
            y: th + 10 + Math.random() * 25,
            z: ey + (Math.random() - 0.5) * er * 0.5,
            sx: smokeSize,
            life: 6 + Math.random() * 1.5,
            peakOpacity: 0.85,
            vx: (Math.random() - 0.5) * 8,
            vy: 5 + Math.random() * 4,
            vz: (Math.random() - 0.5) * 8,
            growth: 0.7
          });
        }
        spawnParticle({
          geo: PGEO_TORUS,
          color: 16755200,
          x: ex,
          y: th + 5,
          z: ey,
          sx: er * 0.15,
          sy: er * 0.15,
          sz: er * 0.15,
          rotX: Math.PI / 2,
          life: 0.4,
          peakOpacity: 0.4,
          growth: 5,
          side: THREE12.DoubleSide
        });
        for (let i = 0; i < 20; i++) {
          spawnParticle({
            geo: PGEO_SPHERE_LO,
            color: Math.random() > 0.3 ? 16729088 : 16768256,
            x: ex,
            y: th + 8,
            z: ey,
            sx: 1.5 + Math.random() * 2,
            life: 0.6 + Math.random() * 0.4,
            peakOpacity: 1,
            vx: (Math.random() - 0.5) * 150,
            vy: 40 + Math.random() * 80,
            vz: (Math.random() - 0.5) * 150,
            gy: 240,
            growth: -1.8
          });
        }
        sfxExplosion(0.15);
      },
      eliminated(msg) {
        addKillFeed(msg.name + " eliminated (#" + (msg.rank || "?") + ")", 5);
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
      },
      chat(msg) {
        state_default.chatLog.push({ name: msg.name, color: msg.color, text: msg.text, t: 10 });
        if (state_default.chatLog.length > 6) state_default.chatLog.shift();
      },
      barricadePlaced(msg) {
        addBarricade({ id: msg.id, cx: msg.cx, cy: msg.cy, w: msg.w, h: msg.h, angle: msg.angle });
        if (msg.ownerId === state_default.myId) {
          state_default.barricadeReadyAt = performance.now() + 5e3;
          sfx(200, 0.08, "square", 0.08);
          sfx(150, 0.12, "triangle", 0.06);
        }
      },
      barricadeDestroyed(msg) {
        removeBarricade(msg.id);
        sfx(300, 0.08, "square", 0.05);
        sfx(150, 0.15, "sawtooth", 0.04);
      },
      barricadeHit(msg) {
        const label = "\u{1FAB5} " + msg.dmg;
        const nc = document.createElement("canvas");
        nc.width = 160;
        nc.height = 48;
        const ctx = nc.getContext("2d");
        ctx.font = "bold 26px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillText(label, 81, 35);
        ctx.fillStyle = "#8b5a2b";
        ctx.fillText(label, 80, 34);
        const tex = new THREE12.CanvasTexture(nc);
        tex.minFilter = THREE12.LinearFilter;
        const mat = new THREE12.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE12.Sprite(mat);
        const th = getTerrainHeight(msg.x, msg.y);
        sprite.position.set(msg.x + (Math.random() - 0.5) * 12, th + 40 + Math.random() * 8, msg.y + (Math.random() - 0.5) * 12);
        sprite.scale.set(96, 28, 1);
        scene.add(sprite);
        let life = 1.3;
        const vy = 8 + Math.random() * 4;
        const vxr = (Math.random() - 0.5) * 10;
        const vzr = (Math.random() - 0.5) * 10;
        let bnDisposed = false;
        const bnCleanup = () => {
          if (bnDisposed) return;
          bnDisposed = true;
          scene.remove(sprite);
          tex.dispose();
          mat.dispose();
        };
        const banim = () => {
          if (bnDisposed) return;
          life -= 0.012;
          mat.opacity = Math.max(0, life);
          sprite.position.y += vy * 0.016;
          sprite.position.x += vxr * 0.016;
          sprite.position.z += vzr * 0.016;
          if (life <= 0) bnCleanup();
          else requestAnimationFrame(banim);
        };
        requestAnimationFrame(banim);
        setTimeout(bnCleanup, 1800);
      },
      wallDestroyed(msg) {
        destroyWall(msg.id);
        if (state_default.mapFeatures && state_default.mapFeatures.walls) {
          state_default.mapFeatures.walls = state_default.mapFeatures.walls.filter((w) => w.id !== msg.id);
        }
      },
      // Cowtank rockets partially damage walls; each hit reduces hp by 1, destroy at 0.
      // The server broadcasts wallDamaged for the partial case (destruction has its own msg).
      // Today we just update the tracked hp so any future damage visual can read it — the
      // wall InstancedMesh is static per round and doesn't currently render hp deltas.
      wallDamaged(msg) {
        if (state_default.mapFeatures && state_default.mapFeatures.walls) {
          const w = state_default.mapFeatures.walls.find((w2) => w2.id === msg.id);
          if (w) w.hp = msg.hp;
        }
      },
      kill(msg) {
        addKillFeed("\u{1F480} " + (msg.killerName || "?") + " \u2192 " + (msg.victimName || "?"), 5);
        if (state_default.killfeed.length > 5) state_default.killfeed.pop();
        if (msg.victimId === state_default.myId) {
          state_default.killerId = msg.killerId;
          state_default.killerName = msg.killerName;
          state_default.spectateTargetId = msg.killerId;
        }
      },
      winner(msg) {
        addKillFeed("\u{1F451} " + (msg.name || "?") + " WINS!", 10);
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
      },
      restart(msg) {
        if (msg.countdown > 0) return;
        if (!state_default.debugMode) {
          try {
            localStorage.setItem("cowName3d", document.getElementById("nameIn").value || "");
          } catch (e) {
          }
          setTimeout(() => {
            location.reload();
          }, 300);
        }
        state_default.state = "lobby";
        updateHostControls();
        document.getElementById("joinScreen").style.display = "flex";
        document.getElementById("joinScreen").querySelector("h2").textContent = "Waiting for cows...";
        document.getElementById("hud").style.display = "none";
        document.getElementById("winScreen").style.display = "none";
        for (const id in state_default.cowMeshes) {
          const obj = state_default.cowMeshes[id];
          disposeMeshTree(obj.mesh);
          if (obj.hpSprite) obj.hpSprite.tex.dispose();
          if (obj.shieldBubble) obj.shieldBubble.material.dispose();
          if (obj.spawnBubble) obj.spawnBubble.material.dispose();
        }
        state_default.cowMeshes = {};
        for (const id in state_default.projMeshes) disposeMeshTree(state_default.projMeshes[id]);
        state_default.projMeshes = {};
        state_default.projData = [];
        clearPickups();
        clearRocketSounds();
        clearParticles();
        state_default.serverPlayers = [];
        state_default.me = null;
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
      },
      levelup(msg) {
        if (!state_default.me || !state_default.me.alive) return;
        sfxLevelUp();
        state_default.pendingLevelUps = (state_default.pendingLevelUps || 0) + 1;
        if (!state_default.perkMenuOpen) showPerkMenu();
      },
      cowstrikeWarning(msg) {
        addKillFeed("\u{1F6A8} " + (msg.name || "?") + " CALLED COWSTRIKE! TAKE COVER!", 6);
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
      },
      cowstrike(msg) {
        addKillFeed("\u{1F4A5} COWSTRIKE WAVE " + ((msg.wave || 0) + 1) + "!", 4);
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
          flashHit(0.6, 500, "rgba(255,100,0,0.5)");
        }
        for (let i = 0; i < 50; i++) {
          const rx = cam.position.x + (Math.random() - 0.5) * 800;
          const rz = cam.position.z + (Math.random() - 0.5) * 800;
          const startY = 300 + Math.random() * 200;
          const groundH = getTerrainHeight(rx, rz);
          const fallDist = startY - (groundH + 5);
          const fallSpeed = 360 + Math.random() * 600;
          const fallTime = fallDist / fallSpeed;
          const delayMs = Math.random() * 800;
          setTimeout(() => {
            spawnParticle({
              geo: PGEO_SPHERE_MED,
              color: Math.random() > 0.3 ? 16729088 : 16755200,
              x: rx,
              y: startY,
              z: rz,
              sx: 2 + Math.random() * 4,
              life: fallTime,
              peakOpacity: 1,
              vy: -fallSpeed
            });
          }, delayMs);
          setTimeout(() => {
            spawnParticle({
              geo: PGEO_SPHERE_MED,
              color: 16737792,
              x: rx,
              y: groundH + 8,
              z: rz,
              sx: 12,
              life: 0.8,
              peakOpacity: 1,
              growth: 3
            });
            spawnParticle({
              geo: PGEO_TORUS,
              color: 16755200,
              x: rx,
              y: groundH + 3,
              z: rz,
              sx: 5,
              sy: 5,
              sz: 5,
              rotX: Math.PI / 2,
              life: 0.6,
              peakOpacity: 1,
              growth: 6,
              side: THREE12.DoubleSide
            });
            for (let j = 0; j < 12; j++) {
              const col = Math.random() > 0.3 ? 16729088 : Math.random() > 0.5 ? 16768256 : 16746496;
              spawnParticle({
                geo: PGEO_SPHERE_LO,
                color: col,
                x: rx,
                y: groundH + 5,
                z: rz,
                sx: 1.5 + Math.random() * 3,
                life: 0.7 + Math.random() * 0.3,
                peakOpacity: 1,
                vx: (Math.random() - 0.5) * 120,
                vy: 40 + Math.random() * 80,
                vz: (Math.random() - 0.5) * 120,
                gy: 180,
                growth: -2.5
              });
            }
          }, delayMs + fallTime * 1e3);
        }
        const shakeBaseX = cam.position.x, shakeBaseZ = cam.position.z;
        const shakeStart = performance.now();
        const shakeDur = 600;
        const shake = () => {
          const frac = Math.min(1, (performance.now() - shakeStart) / shakeDur);
          cam.position.x = shakeBaseX + (Math.random() - 0.5) * 3 * (1 - frac);
          cam.position.z = shakeBaseZ + (Math.random() - 0.5) * 3 * (1 - frac);
          if (frac < 1) requestAnimationFrame(shake);
        };
        shake();
      },
      botsToggled(msg) {
        document.getElementById("botsCheck").checked = msg.enabled;
        addKillFeed("Bots " + (msg.enabled ? "enabled" : "disabled"), 3);
      },
      botsFreeWillToggled(msg) {
        document.getElementById("botsFreeWillCheck").checked = msg.enabled;
        addKillFeed("Bot free will " + (msg.enabled ? "granted" : "revoked"), 3);
      },
      dash(msg) {
        const dasher = state_default.serverPlayers.find((p) => p.id === msg.playerId);
        if (dasher) {
          const smooth = dasher.id === state_default.myId ? { x: dasher.x, y: dasher.y } : interpSamplePlayer(dasher, performance.now());
          const th = getTerrainHeight(smooth.x, smooth.y);
          for (let i = 0; i < 15; i++) {
            const sz = 3 + Math.random() * 4;
            spawnParticle({
              geo: PGEO_SPHERE_LO,
              color: 13421772,
              x: smooth.x + (Math.random() - 0.5) * 20,
              y: th + 5 + Math.random() * 15,
              z: smooth.y + (Math.random() - 0.5) * 20,
              sx: sz,
              life: 0.8 + Math.random() * 0.4,
              peakOpacity: 0.6,
              vy: 30,
              growth: 1.8
            });
          }
        }
        sfx(300, 0.15, "sine", 0.08);
      },
      weaponPickup(msg) {
        state_default.clientWeapons = state_default.clientWeapons.filter((w) => w.id !== msg.pickupId);
        const _wn = { shotgun: "Benelli", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW" };
        const wpName = _wn[msg.weapon] || msg.weapon || "weapon";
        if (msg.playerId === state_default.myId) {
          addKillFeed("Picked up " + wpName + "!", 3);
          if (msg.weapon === "burst") state_default.fireMode = "auto";
        } else addKillFeed((msg.name || "?") + " picked up " + wpName, 3);
      },
      weaponSpawn(msg) {
        state_default.clientWeapons.push({ id: msg.id, x: msg.x, y: msg.y, weapon: msg.weapon });
      },
      weaponDespawn(msg) {
        state_default.clientWeapons = state_default.clientWeapons.filter((w) => w.id !== msg.id);
      },
      weaponDrop(msg) {
        if (msg.playerId === state_default.myId) addKillFeed("Dropped weapon", 3);
        else addKillFeed((msg.name || "?") + " dropped their weapon", 3);
      },
      reloaded(msg) {
        if (msg.playerId !== state_default.myId) return;
        addKillFeed("Reloaded!", 1.5);
        if (msg.weapon === "burst") sfxReloadLR();
        else if (msg.weapon === "bolty") sfxReloadBolty();
        else if (msg.weapon === "shotgun") sfxShellLoad();
      },
      shellLoaded(msg) {
        if (msg.playerId === state_default.myId) sfxShellLoad();
      },
      emptyMag(msg) {
        sfxEmptyMag();
      },
      armorPickup(msg) {
        onArmorPickup(msg.pickupId);
        if (msg.playerId === state_default.myId) addKillFeed("Picked up shield (+25)", 3);
      },
      armorSpawn(msg) {
        onArmorSpawn({ id: msg.id, x: msg.x, y: msg.y });
      },
      shieldHit(msg) {
        const th = getTerrainHeight(msg.x, msg.y);
        for (let i = 0; i < 8; i++) {
          spawnParticle({
            geo: PGEO_SPHERE_LO,
            color: 5605631,
            x: msg.x + (Math.random() - 0.5) * 30,
            y: th + 10 + Math.random() * 20,
            z: msg.y + (Math.random() - 0.5) * 30,
            sx: 1 + Math.random() * 2,
            life: 0.3 + Math.random() * 0.2,
            peakOpacity: 0.7,
            growth: -2.5
          });
        }
        sfx(800, 0.1, "sine", 0.05);
      },
      shieldBreak(msg) {
        const th = getTerrainHeight(msg.x, msg.y);
        spawnParticle({
          geo: PGEO_TORUS,
          color: 5605631,
          x: msg.x,
          y: th + 14,
          z: msg.y,
          sx: 5,
          sy: 5,
          sz: 5,
          rotX: Math.PI / 2,
          life: 0.4,
          peakOpacity: 0.5,
          growth: 7,
          side: THREE12.DoubleSide
        });
        for (let i = 0; i < 15; i++) {
          spawnParticle({
            geo: PGEO_BOX,
            color: 8961023,
            x: msg.x,
            y: th + 14,
            z: msg.y,
            sx: 1,
            sy: 2,
            sz: 0.5,
            life: 0.6 + Math.random() * 0.3,
            peakOpacity: 0.8,
            vx: (Math.random() - 0.5) * 120,
            vy: 30 + Math.random() * 60,
            vz: (Math.random() - 0.5) * 120,
            gy: 180,
            rotVx: 12,
            rotVz: 9
          });
        }
        sfx(400, 0.15, "triangle", 0.1);
        sfx(200, 0.2, "sine", 0.08);
      }
    };
    (function assertHandlerCoverage() {
      const missing = [];
      for (const type of Object.values(import_messages.S2C)) {
        if (typeof handlers[type] !== "function") missing.push(type);
      }
      if (missing.length) {
        console.error("[message-handlers] missing handlers for:", missing.join(", "));
      }
    })();
  }
});

// client/index.js
import * as THREE13 from "three";
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
    init_entities();
    init_map_objects();
    init_weapons_view();
    init_pickups();
    init_projectiles();
    init_zone();
    init_hud();
    init_particles();
    init_message_handlers();
    init_interp();
    init_prediction();
    setVmGroupRef(getVmGroup);
    var _tmpFwd = new THREE13.Vector3();
    var _tmpRight = new THREE13.Vector3();
    var _tmpDir2 = new THREE13.Vector3();
    var _tmpEuler = new THREE13.Euler(0, 0, 0, "YXZ");
    var last = performance.now();
    function loop(ts) {
      requestAnimationFrame(loop);
      const rawFrameGap = ts - last;
      const dt = Math.min(rawFrameGap / 1e3, 0.1);
      last = ts;
      const time = ts / 1e3;
      if (state_default._iwStats) {
        const iw = state_default._iwStats;
        iw.frameGaps[iw.frameGapsIdx] = rawFrameGap;
        iw.frameGapsIdx = (iw.frameGapsIdx + 1) % 120;
        if (iw.frameGapsCount < 120) iw.frameGapsCount++;
        if (rawFrameGap > 50) iw.frameJank++;
      }
      const me = state_default.me;
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
          const smooth = interpSamplePlayer(target, performance.now());
          const targetH = getTerrainHeight(smooth.x, smooth.y) + (smooth.z || 0) + 18;
          const orbitDist = 90;
          const cosP = Math.cos(state_default.pitch), sinP = Math.sin(state_default.pitch);
          const sinY = Math.sin(state_default.yaw), cosY = Math.cos(state_default.yaw);
          cam.position.x = smooth.x - sinY * cosP * orbitDist;
          cam.position.z = smooth.y - cosY * cosP * orbitDist * -1;
          cam.position.y = targetH + sinP * orbitDist + 25;
          cam.lookAt(smooth.x, targetH, smooth.y);
        }
      }
      let curMx = 0, curMz = 0, curLen = 0;
      const curWalking = !!state_default.crouching;
      if (me && me.alive) {
        _tmpFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
        _tmpFwd.y = 0;
        if (_tmpFwd.length() > 0.01) _tmpFwd.normalize();
        else _tmpFwd.set(0, 0, -1);
        _tmpRight.set(-_tmpFwd.z, 0, _tmpFwd.x);
        if (state_default.keys["KeyW"] || state_default.keys["ArrowUp"]) {
          curMx += _tmpFwd.x;
          curMz += _tmpFwd.z;
        }
        if (state_default.keys["KeyS"] || state_default.keys["ArrowDown"]) {
          curMx -= _tmpFwd.x;
          curMz -= _tmpFwd.z;
        }
        if (state_default.keys["KeyA"] || state_default.keys["ArrowLeft"]) {
          curMx -= _tmpRight.x;
          curMz -= _tmpRight.z;
        }
        if (state_default.keys["KeyD"] || state_default.keys["ArrowRight"]) {
          curMx += _tmpRight.x;
          curMz += _tmpRight.z;
        }
        curLen = Math.hypot(curMx, curMz);
        if (curLen > 0) {
          curMx /= curLen;
          curMz /= curLen;
        }
      }
      if (me && me.alive && now - state_default.lastMoveMsg > 50) {
        state_default.lastMoveMsg = now;
        if (curLen > 0) {
          send({ type: "move", dx: curMx, dy: curMz, walking: curWalking });
          state_default.pingLast = performance.now();
        } else send({ type: "move", dx: 0, dy: 0, walking: curWalking });
      }
      if (me && me.alive) {
        setCurrentInput(curMx, curMz, curWalking);
        if (!state_default.mePredicted) initPrediction();
        predictStep(dt);
      } else {
        state_default.mePredicted = null;
      }
      if (me && me.alive) {
        const rp = state_default.mePredicted ? getRenderedPredicted() : null;
        const err = rp ? getRenderOffset() : null;
        if (rp) {
          cam.position.x = rp.x + err.x;
          cam.position.z = rp.y + err.y;
        } else {
          const camLerp = 1 - Math.pow(1e-4, dt);
          cam.position.x += (me.x - cam.position.x) * camLerp;
          cam.position.z += (me.y - cam.position.z) * camLerp;
        }
        const crouchMult = state_default.crouching ? 0.45 : 1;
        const dynCH = CH * (me.sizeMult || 1) * crouchMult;
        const localTerrainH = getTerrainHeight(cam.position.x, cam.position.z);
        const predZ = rp ? rp.z + err.z : me.z;
        const targetZ = Math.max(localTerrainH, predZ || 0);
        const camLerpY = 1 - Math.pow(1e-4, dt);
        cam.position.y += (dynCH + targetZ - cam.position.y) * camLerpY;
      }
      if (!spectatingTarget) {
        _tmpEuler.set(state_default.pitch, state_default.yaw, 0, "YXZ");
        cam.quaternion.setFromEuler(_tmpEuler);
      }
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
            spawnParticle({
              geo: PGEO_SPHERE_LO,
              color: 4491468,
              x: me.x + (Math.random() - 0.5) * 10,
              y: WATER_LEVEL + Math.random() * 5,
              z: me.y + (Math.random() - 0.5) * 10,
              sx: 0.8,
              vy: 10 + Math.random() * 15,
              life: 0.6,
              peakOpacity: 0.6
            });
          }
          if (Math.random() < 0.015) {
            spawnParticle({
              geo: PGEO_TORUS,
              color: 16777215,
              side: THREE13.DoubleSide,
              x: me.x + (Math.random() - 0.5) * 6,
              y: WATER_LEVEL + 0.5,
              z: me.y + (Math.random() - 0.5) * 6,
              sx: 18,
              sy: 18,
              sz: 1,
              rotX: Math.PI / 2,
              growth: 0.4,
              life: 1.8,
              peakOpacity: 1
            });
          }
        }
      }
      updatePickups(time);
      updateCows(time, dt);
      updateProjectiles(dt);
      updateParticles(dt);
      if (!state_default._laserDot) {
        state_default._laserDot = new THREE13.Mesh(new THREE13.SphereGeometry(1, 6, 6), new THREE13.MeshBasicMaterial({ color: 16711680 }));
        state_default._laserDot.visible = false;
        scene.add(state_default._laserDot);
      }
      if (state_default.adsActive && me && me.alive && me.weapon === "bolty") {
        _tmpDir2.set(0, 0, -1).applyQuaternion(cam.quaternion);
        const dotDist = 500;
        state_default._laserDot.position.set(cam.position.x + _tmpDir2.x * dotDist, cam.position.y + _tmpDir2.y * dotDist, cam.position.z + _tmpDir2.z * dotDist);
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
    setMessageHandler((msg) => {
      const h = handlers[msg.type];
      if (h) h(msg);
    });
    connect();
    requestAnimationFrame(loop);
  }
});
export default require_index();
//# sourceMappingURL=bundle.js.map
