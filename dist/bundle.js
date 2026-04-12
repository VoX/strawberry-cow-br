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
    var TICK_RATE2 = 40;
    var PLAYER_BASE_SPEED = 108;
    var PLAYER_WALK_MULT = 0.5;
    var GRAVITY = 800;
    var BARRICADE_HEIGHT = 55;
    var PLAYER_WALL_INFLATE = 8;
    var JUMP_VZ = 230;
    var KNIFE_SPEED_MULT2 = 1.2;
    var HIT_SLOW_MULT2 = 0.5;
    var HIT_SLOW_DURATION_MS2 = 500;
    var SPEED_MULT_MIN = 0;
    var SPEED_MULT_MAX = 2;
    var KNIFE_MELEE_RANGE = 62;
    var KNIFE_MELEE_CONE_COS = 0.707;
    var KNIFE_MELEE_DAMAGE = 55;
    var KNIFE_MELEE_CD_MS = 500;
    var BURST_FAMILY4 = /* @__PURE__ */ new Set(["burst", "aug", "mp5k", "akm"]);
    var DUAL_WIELD_FAMILY2 = /* @__PURE__ */ new Set(["normal", "python"]);
    var MAG_SIZES2 = { normal: 10, burst: 20, shotgun: 6, bolty: 5, aug: 30, mp5k: 30, thompson: 20, sks: 10, akm: 30, python: 6, minigun: 300, m249: 100 };
    var EXT_MAG_SIZES2 = { normal: 13, burst: 25, shotgun: 8, bolty: 7, aug: 38, mp5k: 38, thompson: 25, sks: 13, akm: 38, python: 8, minigun: 400, m249: 150 };
    var HEAVY_WEAPON_SPEED = { minigun: 0.5, m249: 0.75 };
    var MINIGUN_SPUN_SPEED_MULT = 0.2;
    var MINIGUN_SLOW_DELAY_S = 0.2;
    var STATEFUL_INPUT_TYPES2 = /* @__PURE__ */ new Set([
      "move"
    ]);
    var WEAPON_CALIBER = {
      normal: { caliber: "9x19mm", barrelMm: 108 },
      // SIG P250 Compact
      mp5k: { caliber: "9x19mm", barrelMm: 115 },
      // HK MP5K
      thompson: { caliber: ".45 ACP", barrelMm: 267 },
      // M1A1 Thompson
      burst: { caliber: "5.56x45mm", barrelMm: 508 },
      // M16A2
      aug: { caliber: "5.56x45mm", barrelMm: 508 },
      // Steyr AUG A1
      sks: { caliber: "7.62x39mm", barrelMm: 520 },
      // SKS
      akm: { caliber: "7.62x39mm", barrelMm: 415 },
      // AKM
      bolty: { caliber: "7.62x51mm", barrelMm: 660 },
      // AI Arctic Warfare (L96)
      shotgun: { caliber: "12ga", barrelMm: 660 },
      // XM1014 (Benelli M4)
      cowtank: { caliber: "66mm HEAT", barrelMm: 670 },
      // M72 LAW
      python: { caliber: ".357 Mag", barrelMm: 152 },
      // Colt Python 6"
      minigun: { caliber: "5.56x45mm", barrelMm: 559 },
      // M134 Minigun
      m249: { caliber: "5.56x45mm", barrelMm: 465 }
      // FN M249 SAW
    };
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
    var WEAPON_TYPES = ["shotgun", "burst", "bolty", "shotgun", "burst", "bolty", "cowtank", "aug", "mp5k", "thompson", "sks", "akm", "python", "m249", "minigun"];
    module.exports = {
      MAP_W: MAP_W2,
      MAP_H: MAP_H2,
      TICK_RATE: TICK_RATE2,
      PLAYER_BASE_SPEED,
      PLAYER_WALK_MULT,
      GRAVITY,
      BARRICADE_HEIGHT,
      PLAYER_WALL_INFLATE,
      JUMP_VZ,
      KNIFE_SPEED_MULT: KNIFE_SPEED_MULT2,
      HIT_SLOW_MULT: HIT_SLOW_MULT2,
      HIT_SLOW_DURATION_MS: HIT_SLOW_DURATION_MS2,
      SPEED_MULT_MIN,
      SPEED_MULT_MAX,
      KNIFE_MELEE_RANGE,
      KNIFE_MELEE_CONE_COS,
      KNIFE_MELEE_DAMAGE,
      KNIFE_MELEE_CD_MS,
      STATEFUL_INPUT_TYPES: STATEFUL_INPUT_TYPES2,
      BURST_FAMILY: BURST_FAMILY4,
      DUAL_WIELD_FAMILY: DUAL_WIELD_FAMILY2,
      MAG_SIZES: MAG_SIZES2,
      EXT_MAG_SIZES: EXT_MAG_SIZES2,
      HEAVY_WEAPON_SPEED,
      MINIGUN_SPUN_SPEED_MULT,
      MINIGUN_SLOW_DELAY_S,
      WEAPON_CALIBER,
      COLORS,
      FOOD_TYPES,
      WEAPON_TYPES
    };
  }
});

// client/config.js
var import_constants, MW, MH, CH, COL, COL_HEX, WPCOL, PERKS;
var init_config = __esm({
  "client/config.js"() {
    import_constants = __toESM(require_constants());
    MW = import_constants.MAP_W;
    MH = import_constants.MAP_H;
    CH = 35;
    COL = { pink: 16746666, blue: 8956671, green: 8978312, gold: 16768324, purple: 13404415, red: 16729156, orange: 16746564, cyan: 4521949 };
    COL_HEX = { pink: "#ff88aa", blue: "#88aaff", green: "#88ff88", gold: "#ffdd44", purple: "#cc88ff", red: "#ff4444", orange: "#ff8844", cyan: "#44ffdd" };
    WPCOL = { shotgun: 16729156, burst: 4500223, bolty: 16755200, cowtank: 4521796, aug: 11158783, mp5k: 4513245, thompson: 13404228, sks: 14527078, akm: 11167283 };
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
      // Set when the L96 fires while ADS'd. Blocks the manual un-ADS paths
      // (right-click release, touch ADS toggle) until forceUnADS() clears it
      // — which happens automatically 100ms after the bolty tracer arrives,
      // or on reload / empty mag. So the player can't half-ADS / quick-tap
      // the scope to peek + bail; once the bolt cracks, you ride it out.
      adsLocked: false,
      fpsFrames: 0,
      fpsLast: performance.now(),
      fpsDisplay: 0,
      pingVal: 0,
      pingLast: 0,
      projData: [],
      projMeshes: {},
      cowMeshes: {},
      mapBuilt: false,
      serverZone: { x: 0, y: 0, w: MW, h: MH },
      mapFeatures: { walls: [], shelters: [], houses: [] },
      clientWeapons: [],
      pendingLevelUps: 0,
      perkMenuOpen: false,
      masterVol: 0.5,
      musicVol: 0.5,
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
      cameraMode: "first",
      // 'first' or 'third' — H toggles. Third = over-the-shoulder, hides viewmodel and renders local cow.
      chatLog: [],
      // { name, color, text, t (lifetime remaining in seconds) }
      chatOpen: false,
      barricades: [],
      // { id, cx, cy, w, h, angle } — mirrored from server for client-side projectile prediction
      lastTickNum: 0,
      // monotonic server tick counter — updated from every `tick` broadcast.
      inputSeq: 0,
      // client-side monotonic counter for STATEFUL_INPUT_TYPES. Incremented in network.js::send.
      lastAckedInput: 0,
      // highest seq the server has confirmed applying — echoed via inputAck broadcast.
      lastRecvSnapSeq: -1,
      // last snapshot seq received — piggybacked on moves for delta ack
      mePredicted: null,
      // predicted local player state — camera reads from here, reconciled against server on inputAck.
      localHitSlowEndsAt: 0,
      // performance.now() ms — local on-hit slowdown timer (client-authoritative)
      localPrimaryWeapon: null,
      // last-held primary stashed when switching to knife
      _hudTick: 0,
      // 10 Hz throttle accumulator for HUD chat/minimap
      _reloadStart: null,
      // performance.now() when current reload began
      _reloadDuration: null,
      // expected reload duration in ms
      // Network monitoring (debug-mode only). Sliding 1-second windows.
      netStats: {
        tickArrivals: [],
        // performance.now() of each tick recv
        tickGaps: [],
        // ms between consecutive ticks (sliding 1s)
        lastTickRecvT: 0,
        expectedNextTickNum: 0,
        tickGapCount: 0,
        // total skipped tick numbers in window
        tickRcvCount: 0,
        // total ticks received in window
        reconcileSnapsWindow: []
        // [{t, drift}] sliding 1s
      }
    };
    state_default = S;
  }
});

// client/audio.js
import * as THREE from "three";
function getAudioCtx() {
  return actx;
}
function masterVol() {
  return typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5;
}
function musicVol() {
  return typeof state_default.musicVol !== "undefined" ? state_default.musicVol : 0.5;
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
function updateAudioListener(cam2) {
  if (!actx || !actx.listener) return;
  const lis = actx.listener;
  const t = actx.currentTime;
  _audioFwd.set(0, 0, -1).applyQuaternion(cam2.quaternion);
  _audioFwd.y = 0;
  if (_audioFwd.lengthSq() > 1e-4) _audioFwd.normalize();
  else _audioFwd.set(0, 0, -1);
  if (lis.positionX) {
    lis.positionX.setValueAtTime(cam2.position.x, t);
    lis.positionY.setValueAtTime(cam2.position.y, t);
    lis.positionZ.setValueAtTime(cam2.position.z, t);
    lis.forwardX.setValueAtTime(_audioFwd.x, t);
    lis.forwardY.setValueAtTime(0, t);
    lis.forwardZ.setValueAtTime(_audioFwd.z, t);
    lis.upX.setValueAtTime(0, t);
    lis.upY.setValueAtTime(1, t);
    lis.upZ.setValueAtTime(0, t);
  } else if (lis.setPosition) {
    lis.setPosition(cam2.position.x, cam2.position.y, cam2.position.z);
    lis.setOrientation(_audioFwd.x, 0, _audioFwd.z, 0, 1, 0);
  }
}
function setPannerPosition(p, x, y, z) {
  if (p.positionX) {
    const t = actx.currentTime;
    p.positionX.setValueAtTime(x, t);
    p.positionY.setValueAtTime(y, t);
    p.positionZ.setValueAtTime(z, t);
  } else if (p.setPosition) {
    p.setPosition(x, y, z);
  }
}
function createPanner(x, y, z) {
  const p = actx.createPanner();
  p.panningModel = "HRTF";
  p.distanceModel = "inverse";
  p.refDistance = 40;
  p.maxDistance = 2e3;
  p.rolloffFactor = 0.9;
  setPannerPosition(p, x, y, z);
  p.connect(actx.destination);
  return p;
}
function connectOut(source, gain, pos) {
  if (pos && actx.listener) {
    const panner = createPanner(pos.x, pos.y, pos.z);
    gain.connect(panner);
    source.onended = () => {
      try {
        gain.disconnect();
        panner.disconnect();
      } catch (e) {
      }
    };
  } else {
    gain.connect(actx.destination);
  }
}
function sfx(freq, dur, type, v, pos) {
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
  connectOut(o, g, pos);
  o.start(t);
  o.stop(t + dur);
}
function punchLayer(vol, pos, opts) {
  if (!actx) return;
  const o = opts || {};
  const t = actx.currentTime;
  const v = (vol || 0.1) * masterVol();
  const subDur = o.subDur || 0.14;
  const sub = actx.createOscillator(), sg = actx.createGain();
  sub.type = "sine";
  sub.frequency.setValueAtTime(o.subHi || 180, t);
  sub.frequency.exponentialRampToValueAtTime(o.subLo || 45, t + subDur);
  sg.gain.setValueAtTime(1e-4, t);
  sg.gain.exponentialRampToValueAtTime(v * (o.subVol || 1), t + 5e-3);
  sg.gain.exponentialRampToValueAtTime(1e-3, t + subDur);
  sub.connect(sg);
  connectOut(sub, sg, pos);
  sub.start(t);
  sub.stop(t + subDur + 0.02);
  const crackVol = o.crackVol != null ? o.crackVol : 0.7;
  if (crackVol > 0) {
    const crackDur = o.crackDur || 0.05;
    const bs = Math.max(1, Math.floor(actx.sampleRate * crackDur));
    const b = actx.createBuffer(1, bs, actx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 10);
    const src = actx.createBufferSource();
    src.buffer = b;
    const hp = actx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = o.crackHz || 2200;
    const cg = actx.createGain();
    cg.gain.setValueAtTime(v * crackVol, t);
    cg.gain.exponentialRampToValueAtTime(1e-3, t + crackDur);
    src.connect(hp);
    hp.connect(cg);
    connectOut(src, cg, pos);
    src.start(t);
  }
}
function loadSpitSample() {
  if (_spitLoaded || !actx) return;
  _spitLoaded = true;
  fetch("SpitShot.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _spitBuf = d;
  }).catch(() => {
  });
}
function sfxShoot(vol, pos) {
  if (!actx) return;
  loadSpitSample();
  if (_spitBuf) {
    const src = actx.createBufferSource();
    src.buffer = _spitBuf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.1) * masterVol();
    src.connect(g);
    connectOut(src, g, pos);
    src.start();
  } else {
    sfx(400, 0.12, "square", vol || 0.1, pos);
  }
  punchLayer((vol || 0.1) * 0.6, pos, { subHi: 160, subLo: 60, subDur: 0.08, subVol: 0.5, crackHz: 2800, crackVol: 0.5, crackDur: 0.035 });
}
function loadLRSamples() {
  if (_lrLoaded || !actx) return;
  _lrLoaded = true;
  ["LRA.ogg", "LRB.ogg", "LRC.ogg", "LRD.ogg"].forEach((file) => {
    fetch(file).then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((decoded) => lrBuffers.push(decoded)).catch(() => {
    });
  });
}
function sfxLR(vol, pos) {
  if (!actx) return;
  loadLRSamples();
  if (lrBuffers.length > 0) {
    const buf = lrBuffers[Math.floor(Math.random() * lrBuffers.length)];
    const src = actx.createBufferSource();
    src.buffer = buf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.13) * masterVol();
    src.connect(g);
    connectOut(src, g, pos);
    src.start();
  } else {
    sfx(400, 0.12, "square", vol || 0.1, pos);
  }
  punchLayer((vol || 0.13) * 0.85, pos, { subHi: 200, subLo: 50, subDur: 0.11, subVol: 0.9, crackHz: 2400, crackVol: 0.75, crackDur: 0.05 });
}
function loadShotgunSamples() {
  if (_shotgunLoaded || !actx) return;
  _shotgunLoaded = true;
  ["ShotA.ogg", "ShotB.ogg", "ShotC.ogg"].forEach((file) => {
    fetch(file).then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((decoded) => shotgunBuffers.push(decoded)).catch(() => {
    });
  });
}
function sfxShotgun(vol, pos) {
  if (!actx) return;
  loadShotgunSamples();
  loadSampleSounds();
  if (shotgunBuffers.length > 0) {
    const buf = shotgunBuffers[Math.floor(Math.random() * shotgunBuffers.length)];
    const src = actx.createBufferSource();
    src.buffer = buf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.14) * masterVol();
    src.connect(g);
    connectOut(src, g, pos);
    src.start();
  } else {
    sfx(300, 0.15, "square", vol || 0.1, pos);
  }
  punchLayer((vol || 0.14) * 1.3, pos, { subHi: 220, subLo: 35, subDur: 0.22, subVol: 1.4, crackHz: 1600, crackVol: 1, crackDur: 0.08 });
  setTimeout(() => playSample(_shellImpactBuf, (vol || 0.1) * 0.8, pos), 220);
}
function loadBoltyShotSample() {
  if (_boltyShotLoaded || !actx) return;
  _boltyShotLoaded = true;
  fetch("BoltyShot.ogg").then((r) => r.arrayBuffer()).then((buf) => actx.decodeAudioData(buf)).then((d) => {
    _boltyShotBuf = d;
  }).catch(() => {
  });
}
function sfxBolty(vol, pos) {
  if (!actx) return;
  loadBoltyShotSample();
  loadSampleSounds();
  if (_boltyShotBuf) {
    const src = actx.createBufferSource();
    src.buffer = _boltyShotBuf;
    const g = actx.createGain();
    g.gain.value = (vol || 0.13) * masterVol();
    src.connect(g);
    connectOut(src, g, pos);
    src.start();
  } else {
    sfx(800, 0.25, "sawtooth", vol || 0.1, pos);
  }
  punchLayer((vol || 0.13) * 1.1, pos, { subHi: 160, subLo: 38, subDur: 0.28, subVol: 1.1, crackHz: 3200, crackVol: 0.9, crackDur: 0.045 });
  setTimeout(() => {
    if (!playSample(_boltBuf, 0.08, pos)) {
      sfx(300, 0.08, "sawtooth", 0.07, pos);
      setTimeout(() => sfx(500, 0.06, "square", 0.06, pos), 200);
    }
  }, 500);
}
function sfxHit() {
  if (!actx) return;
  const t = actx.currentTime;
  const v = masterVol();
  const o1 = actx.createOscillator(), g1 = actx.createGain();
  o1.type = "sine";
  o1.frequency.setValueAtTime(380, t);
  o1.frequency.exponentialRampToValueAtTime(60, t + 0.18);
  g1.gain.setValueAtTime(1e-4, t);
  g1.gain.exponentialRampToValueAtTime(0.32 * v, t + 5e-3);
  g1.gain.exponentialRampToValueAtTime(1e-3, t + 0.22);
  o1.connect(g1);
  g1.connect(actx.destination);
  o1.start(t);
  o1.stop(t + 0.24);
  const o2 = actx.createOscillator(), g2 = actx.createGain();
  o2.type = "sawtooth";
  o2.frequency.setValueAtTime(220, t);
  o2.frequency.exponentialRampToValueAtTime(120, t + 0.1);
  g2.gain.setValueAtTime(1e-4, t);
  g2.gain.exponentialRampToValueAtTime(0.22 * v, t + 5e-3);
  g2.gain.exponentialRampToValueAtTime(1e-3, t + 0.14);
  o2.connect(g2);
  g2.connect(actx.destination);
  o2.start(t);
  o2.stop(t + 0.16);
}
function sfxLevelUp() {
  if (!actx) return;
  const t = actx.currentTime;
  const v = 0.32 * masterVol();
  const arp = [523.25, 659.25, 783.99, 1046.5];
  const noteDur = 0.09;
  arp.forEach((f, i) => {
    const start = t + i * noteDur;
    const oTri = actx.createOscillator();
    const oSq = actx.createOscillator();
    const g = actx.createGain();
    oTri.type = "triangle";
    oSq.type = "square";
    oTri.frequency.value = f;
    oSq.frequency.value = f;
    g.gain.setValueAtTime(1e-4, start);
    g.gain.exponentialRampToValueAtTime(v, start + 0.01);
    g.gain.exponentialRampToValueAtTime(1e-3, start + noteDur + 0.06);
    oTri.connect(g);
    oSq.connect(g);
    g.connect(actx.destination);
    oTri.start(start);
    oSq.start(start);
    oTri.stop(start + noteDur + 0.08);
    oSq.stop(start + noteDur + 0.08);
  });
  const chordStart = t + arp.length * noteDur;
  [523.25, 659.25, 783.99].forEach((f) => {
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = "sawtooth";
    o.frequency.value = f;
    g.gain.setValueAtTime(1e-4, chordStart);
    g.gain.exponentialRampToValueAtTime(v * 0.6, chordStart + 0.02);
    g.gain.exponentialRampToValueAtTime(1e-3, chordStart + 0.7);
    o.connect(g);
    g.connect(actx.destination);
    o.start(chordStart);
    o.stop(chordStart + 0.75);
  });
  const sh = actx.createOscillator();
  const shg = actx.createGain();
  sh.type = "sine";
  sh.frequency.value = 2093;
  shg.gain.setValueAtTime(1e-4, chordStart);
  shg.gain.exponentialRampToValueAtTime(v * 0.4, chordStart + 0.02);
  shg.gain.exponentialRampToValueAtTime(1e-3, chordStart + 0.6);
  sh.connect(shg);
  shg.connect(actx.destination);
  sh.start(chordStart);
  sh.stop(chordStart + 0.65);
}
function sfxDeath() {
  sfx(400, 0.6, "sawtooth", 0.08);
}
function sfxMeleeSwing(pos) {
  if (!actx) return;
  const t = actx.currentTime;
  const v = 0.12 * masterVol();
  const dur = 0.14;
  const bs = Math.max(1, Math.floor(actx.sampleRate * dur));
  const b = actx.createBuffer(1, bs, actx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 3);
  const src = actx.createBufferSource();
  src.buffer = b;
  const bp = actx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.8;
  bp.frequency.setValueAtTime(3200, t);
  bp.frequency.exponentialRampToValueAtTime(700, t + dur);
  const g = actx.createGain();
  g.gain.setValueAtTime(1e-4, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.02);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  src.connect(bp);
  bp.connect(g);
  connectOut(src, g, pos);
  src.start(t);
}
function sfxMeleeHit(pos) {
  if (!actx) return;
  const t = actx.currentTime;
  const v = 0.18 * masterVol();
  const o = actx.createOscillator(), og = actx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(320, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.15);
  og.gain.setValueAtTime(1e-4, t);
  og.gain.exponentialRampToValueAtTime(v, t + 5e-3);
  og.gain.exponentialRampToValueAtTime(1e-3, t + 0.18);
  o.connect(og);
  connectOut(o, og, pos);
  o.start(t);
  o.stop(t + 0.2);
  punchLayer(0.16, pos, { subHi: 160, subLo: 55, subDur: 0.1, subVol: 0.7, crackHz: 1600, crackVol: 0.9, crackDur: 0.06 });
}
function sfxMoo(vol, pos) {
  if (!actx) return;
  const t = actx.currentTime;
  const v = (vol || 0.22) * masterVol();
  const p = MOO_PROFILES[Math.floor(Math.random() * MOO_PROFILES.length)];
  const base = p.base * (0.94 + Math.random() * 0.12);
  const dur = p.dur * (0.9 + Math.random() * 0.2);
  const openT = dur * 0.22;
  const closeT = dur * 0.78;
  const detune = p.detune;
  const lfo = actx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(p.vibHz, t);
  const lfoGain = actx.createGain();
  lfoGain.gain.setValueAtTime(p.vibCents, t);
  lfo.connect(lfoGain);
  const mkOsc = (freq, type, detuneBias) => {
    const osc = actx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.setValueAtTime(detuneBias, t);
    lfoGain.connect(osc.detune);
    return osc;
  };
  const o1 = mkOsc(base, "square", 0);
  const o2 = mkOsc(base, "square", detune);
  const o3 = mkOsc(base * 0.5, "triangle", -detune);
  const f = actx.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(p.filtLo, t);
  f.frequency.linearRampToValueAtTime(p.filtHi, t + openT);
  f.frequency.setValueAtTime(p.filtHi, t + closeT);
  f.frequency.linearRampToValueAtTime(p.filtLo * 0.85, t + dur);
  const noiseBufSize = Math.floor(actx.sampleRate * dur);
  const nb = actx.createBuffer(1, noiseBufSize, actx.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < noiseBufSize; i++) nd[i] = (Math.random() * 2 - 1) * 0.6;
  const nsrc = actx.createBufferSource();
  nsrc.buffer = nb;
  const nf = actx.createBiquadFilter();
  nf.type = "lowpass";
  nf.frequency.setValueAtTime(700, t);
  nf.Q.value = 0.8;
  const ng = actx.createGain();
  ng.gain.setValueAtTime(1e-4, t);
  ng.gain.exponentialRampToValueAtTime(v * 0.18, t + 0.06);
  ng.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  nsrc.connect(nf);
  nf.connect(ng);
  const g = actx.createGain();
  g.gain.setValueAtTime(1e-4, t);
  g.gain.exponentialRampToValueAtTime(v * 0.55, t + 0.07);
  g.gain.exponentialRampToValueAtTime(v, t + openT);
  g.gain.setValueAtTime(v, t + closeT);
  g.gain.exponentialRampToValueAtTime(1e-3, t + dur);
  o1.connect(f);
  o2.connect(f);
  o3.connect(f);
  f.connect(g);
  ng.connect(g);
  connectOut(o1, g, pos);
  const stopT = t + dur + 0.05;
  lfo.start(t);
  lfo.stop(stopT);
  o1.start(t);
  o1.stop(stopT);
  o2.start(t);
  o2.stop(stopT);
  o3.start(t);
  o3.stop(stopT);
  nsrc.start(t);
  nsrc.stop(stopT);
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
function sfxExplosion(vol, pos) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_explosionBuf, vol || 0.18, pos)) {
    sfx(60, 0.5, "sine", vol || 0.18, pos);
  }
  punchLayer((vol || 0.18) * 1.6, pos, { subHi: 140, subLo: 28, subDur: 0.45, subVol: 1.5, crackHz: 1200, crackVol: 0.6, crackDur: 0.1 });
}
function sfxRocket(vol, pos) {
  if (!actx) return;
  loadSampleSounds();
  if (!playSample(_rocketBuf, vol || 0.14, pos)) {
    sfx(200, 0.3, "sine", vol || 0.1, pos);
  }
  punchLayer((vol || 0.14) * 1, pos, { subHi: 180, subLo: 40, subDur: 0.18, subVol: 1, crackHz: 1800, crackVol: 0.6, crackDur: 0.06 });
}
function playSample(buf, vol, pos) {
  if (!actx || !buf) return false;
  const src = actx.createBufferSource();
  src.buffer = buf;
  const g = actx.createGain();
  g.gain.value = (vol || 0.1) * masterVol();
  src.connect(g);
  connectOut(src, g, pos);
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
    const v = musicVol();
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
    const v = musicVol();
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
    const v = musicVol();
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
    g.gain.value = 0.35 * musicVol();
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
  const v = musicVol();
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
  _radioAudio.volume = 0.5 * musicVol();
  if (_radioAudio.paused) {
    _radioAudio.play().catch((err) => console.warn("[audio] radio play failed:", err));
  }
}
function tickMusicRadio() {
  if (!_radioAudio) {
    startMenuMusicRadio();
    return;
  }
  _radioAudio.volume = 0.5 * musicVol();
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
  const v = musicVol();
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
  const v = musicVol();
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
  const v = musicVol();
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
    const v = musicVol();
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
  const v = musicVol();
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
    const v = musicVol();
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
  const v = musicVol();
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
    const v = musicVol();
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
  const v = musicVol();
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
var actx, _audioFwd, _spitBuf, _spitLoaded, lrBuffers, _lrLoaded, shotgunBuffers, _shotgunLoaded, _boltyShotBuf, _boltyShotLoaded, MOO_PROFILES, _boltBuf, _shellBuf, _sampleSoundsLoaded, _rocketBuf, _boltyReloadBuf, _shellImpactBuf, _explosionBuf, menuMusicInterval, customBuffers, _customLoading, _customLoaded, _customWarned, _customMenuNode, _customMenuGain, _customActiveNode, _customActiveGain, _customActiveMood, _CUSTOM_MOOD_GAIN, _radioAudio, musicPlaying, nextNote, musicMood, SCALES, TEMPOS, _indBeat, _indSection, _indSectionStart, _tribalBeat, _tribalSection, _tribalSectionStart, _moneyBeat, _moneySection, _moneySectionStart, _boyBeat, _boySection, _boySectionStart, _neoBeat, _neoSection, _neoSectionStart, _classicBeat, _classicSection, _classicSectionStart;
var init_audio = __esm({
  "client/audio.js"() {
    init_state();
    actx = null;
    _audioFwd = new THREE.Vector3();
    _spitBuf = null;
    _spitLoaded = false;
    lrBuffers = [];
    _lrLoaded = false;
    shotgunBuffers = [];
    _shotgunLoaded = false;
    _boltyShotBuf = null;
    _boltyShotLoaded = false;
    MOO_PROFILES = [
      // {name,   base, dur,  vibHz, vibCents, filtLo, filtHi, detune}
      { name: "normal", base: 115, dur: 0.85, vibHz: 4.5, vibCents: 18, filtLo: 500, filtHi: 1300, detune: 6 },
      { name: "deep", base: 88, dur: 1.05, vibHz: 3.8, vibCents: 22, filtLo: 360, filtHi: 1e3, detune: 8 },
      { name: "short", base: 125, dur: 0.55, vibHz: 5.5, vibCents: 12, filtLo: 580, filtHi: 1500, detune: 5 },
      { name: "long", base: 105, dur: 1.25, vibHz: 4, vibCents: 20, filtLo: 450, filtHi: 1150, detune: 7 },
      { name: "angry", base: 100, dur: 0.9, vibHz: 6.5, vibCents: 28, filtLo: 420, filtHi: 1250, detune: 10 }
    ];
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
import * as THREE2 from "three";
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
  return new THREE2.CanvasTexture(c);
}
function _tip(color, x, y, z) {
  const m = new THREE2.Mesh(_tipGeo, new THREE2.MeshBasicMaterial({ color, depthTest: false }));
  m.position.set(x, y, z);
  m.renderOrder = 999;
  return m;
}
var scene, cam, ren, ambient, sun, hemi, skyGeo, skyMat, sky, cloudPlanes, vmScene, vmCam, vmDebugGroup, vmAxes, vmGrid, _tipGeo;
var init_renderer = __esm({
  "client/renderer.js"() {
    init_config();
    scene = new THREE2.Scene();
    cam = new THREE2.PerspectiveCamera(75, innerWidth / innerHeight, 1, 6100);
    cam.position.set(MW / 2, CH, MH / 2);
    ren = new THREE2.WebGLRenderer({ antialias: true });
    ren.setSize(innerWidth, innerHeight);
    ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ren.shadowMap.enabled = true;
    ren.domElement.id = "gameCanvas";
    document.body.appendChild(ren.domElement);
    ambient = new THREE2.AmbientLight(16777215, 0.6);
    scene.add(ambient);
    sun = new THREE2.DirectionalLight(16777215, 0.8);
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
    hemi = new THREE2.HemisphereLight(8900331, 4500036, 0.3);
    scene.add(hemi);
    skyGeo = new THREE2.SphereGeometry(5e3, 32, 32);
    skyMat = new THREE2.ShaderMaterial({
      side: THREE2.BackSide,
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
    sky = new THREE2.Mesh(skyGeo, skyMat);
    scene.add(sky);
    cloudPlanes = [];
    for (let i = 0; i < 12; i++) {
      const tex = makeCloudTexture();
      const mat = new THREE2.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.7, side: THREE2.DoubleSide, fog: false, depthWrite: false });
      const sz = 400 + Math.random() * 400;
      const mesh = new THREE2.Mesh(new THREE2.PlaneGeometry(sz, sz * 0.4), mat);
      mesh.position.set(Math.random() * MW, 300 + Math.random() * 200, Math.random() * MH);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.userData = { speed: 2 + Math.random() * 4, origX: mesh.position.x };
      scene.add(mesh);
      cloudPlanes.push(mesh);
    }
    vmScene = new THREE2.Scene();
    vmScene.add(new THREE2.AmbientLight(16777215, 1));
    vmCam = new THREE2.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
    vmCam.position.set(0, 0, 0);
    vmDebugGroup = new THREE2.Group();
    vmDebugGroup.visible = false;
    vmAxes = new THREE2.AxesHelper(20);
    vmAxes.material.depthTest = false;
    vmAxes.material.depthWrite = false;
    vmAxes.renderOrder = 999;
    vmDebugGroup.add(vmAxes);
    vmGrid = new THREE2.GridHelper(40, 40, 8947848, 4473924);
    vmGrid.position.y = -10;
    vmGrid.material.depthTest = false;
    vmGrid.material.depthWrite = false;
    vmGrid.renderOrder = 998;
    vmDebugGroup.add(vmGrid);
    _tipGeo = new THREE2.BoxGeometry(1.2, 1.2, 1.2);
    vmDebugGroup.add(_tip(16711680, 20, 0, 0));
    vmDebugGroup.add(_tip(65280, 0, 20, 0));
    vmDebugGroup.add(_tip(255, 0, 0, 20));
    vmScene.add(vmDebugGroup);
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
import * as THREE3 from "three";
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
  const gndGeo = new THREE3.PlaneGeometry(extW, extH, gndSegsX, gndSegsY);
  const gndPos = gndGeo.attributes.position;
  for (let i = 0; i < gndPos.count; i++) {
    const wx = gndPos.getX(i) + extW / 2 - gndPad;
    const wz = extH / 2 - gndPos.getY(i) - gndPad;
    const cx = Math.max(0, Math.min(MW, wx)), cz = Math.max(0, Math.min(MH, wz));
    gndPos.setZ(i, getTerrainHeight(cx, cz));
  }
  gndGeo.computeVertexNormals();
  gndMesh = new THREE3.Mesh(gndGeo, grassMat);
  gndMesh.rotation.x = -Math.PI / 2;
  gndMesh.position.set(MW / 2, 0, MH / 2);
  gndMesh.receiveShadow = true;
  scene.add(gndMesh);
  const mtGeo = new THREE3.PlaneGeometry(extW, extH, 30, 30);
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
  mtMesh = new THREE3.Mesh(mtGeo, mtMat);
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
  snowMesh = new THREE3.Mesh(sGeo, snowMat);
  snowMesh.rotation.x = -Math.PI / 2;
  snowMesh.position.set(MW / 2, -79, MH / 2);
  scene.add(snowMesh);
  const wGeo = new THREE3.PlaneGeometry(extW, extH);
  waterMesh = new THREE3.Mesh(wGeo, new THREE3.MeshBasicMaterial({ color: 2254506, transparent: true, opacity: 0.6, side: THREE3.DoubleSide }));
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(MW / 2, -30, MH / 2);
  scene.add(waterMesh);
  const bm = new THREE3.MeshLambertMaterial({ color: 15658734 });
  const postGeo = new THREE3.CylinderGeometry(2, 2, 30, 5);
  const railGeo = new THREE3.BoxGeometry(3, 3, 1);
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
  fencePostMesh = new THREE3.InstancedMesh(postGeo, bm, postSlots.length);
  const postMat4 = new THREE3.Matrix4();
  const postPos = new THREE3.Vector3();
  for (let i = 0; i < postSlots.length; i++) {
    const [x, z] = postSlots[i];
    postPos.set(x, getTerrainHeight(x, z) + 15, z);
    postMat4.makeTranslation(postPos.x, postPos.y, postPos.z);
    fencePostMesh.setMatrixAt(i, postMat4);
  }
  fencePostMesh.instanceMatrix.needsUpdate = true;
  scene.add(fencePostMesh);
  fenceRailMesh = new THREE3.InstancedMesh(railGeo, bm, railSlots.length * 2);
  const railMat4 = new THREE3.Matrix4();
  const railPos = new THREE3.Vector3();
  const railQuat = new THREE3.Quaternion();
  const railScale = new THREE3.Vector3();
  const _railYAxis = new THREE3.Vector3(0, 1, 0);
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
    grassMat = new THREE3.MeshLambertMaterial({ color: 3831856 });
    mtMat = new THREE3.MeshLambertMaterial({ color: 8947848 });
    snowMat = new THREE3.MeshLambertMaterial({ color: 15658751 });
    gndMesh = null;
    mtMesh = null;
    snowMesh = null;
    waterMesh = null;
    fencePostMesh = null;
    fenceRailMesh = null;
    buildTerrainMeshes();
  }
});

// node_modules/@msgpack/msgpack/dist.esm/utils/utf8.mjs
function utf8Count(str) {
  const strLength = str.length;
  let byteLength = 0;
  let pos = 0;
  while (pos < strLength) {
    let value = str.charCodeAt(pos++);
    if ((value & 4294967168) === 0) {
      byteLength++;
      continue;
    } else if ((value & 4294965248) === 0) {
      byteLength += 2;
    } else {
      if (value >= 55296 && value <= 56319) {
        if (pos < strLength) {
          const extra = str.charCodeAt(pos);
          if ((extra & 64512) === 56320) {
            ++pos;
            value = ((value & 1023) << 10) + (extra & 1023) + 65536;
          }
        }
      }
      if ((value & 4294901760) === 0) {
        byteLength += 3;
      } else {
        byteLength += 4;
      }
    }
  }
  return byteLength;
}
function utf8EncodeJs(str, output, outputOffset) {
  const strLength = str.length;
  let offset = outputOffset;
  let pos = 0;
  while (pos < strLength) {
    let value = str.charCodeAt(pos++);
    if ((value & 4294967168) === 0) {
      output[offset++] = value;
      continue;
    } else if ((value & 4294965248) === 0) {
      output[offset++] = value >> 6 & 31 | 192;
    } else {
      if (value >= 55296 && value <= 56319) {
        if (pos < strLength) {
          const extra = str.charCodeAt(pos);
          if ((extra & 64512) === 56320) {
            ++pos;
            value = ((value & 1023) << 10) + (extra & 1023) + 65536;
          }
        }
      }
      if ((value & 4294901760) === 0) {
        output[offset++] = value >> 12 & 15 | 224;
        output[offset++] = value >> 6 & 63 | 128;
      } else {
        output[offset++] = value >> 18 & 7 | 240;
        output[offset++] = value >> 12 & 63 | 128;
        output[offset++] = value >> 6 & 63 | 128;
      }
    }
    output[offset++] = value & 63 | 128;
  }
}
function utf8EncodeTE(str, output, outputOffset) {
  sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
}
function utf8Encode(str, output, outputOffset) {
  if (str.length > TEXT_ENCODER_THRESHOLD) {
    utf8EncodeTE(str, output, outputOffset);
  } else {
    utf8EncodeJs(str, output, outputOffset);
  }
}
function utf8DecodeJs(bytes, inputOffset, byteLength) {
  let offset = inputOffset;
  const end = offset + byteLength;
  const units = [];
  let result = "";
  while (offset < end) {
    const byte1 = bytes[offset++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = bytes[offset++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = bytes[offset++] & 63;
      const byte3 = bytes[offset++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = bytes[offset++] & 63;
      const byte3 = bytes[offset++] & 63;
      const byte4 = bytes[offset++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= CHUNK_SIZE) {
      result += String.fromCharCode(...units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += String.fromCharCode(...units);
  }
  return result;
}
function utf8DecodeTD(bytes, inputOffset, byteLength) {
  const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
  return sharedTextDecoder.decode(stringBytes);
}
function utf8Decode(bytes, inputOffset, byteLength) {
  if (byteLength > TEXT_DECODER_THRESHOLD) {
    return utf8DecodeTD(bytes, inputOffset, byteLength);
  } else {
    return utf8DecodeJs(bytes, inputOffset, byteLength);
  }
}
var sharedTextEncoder, TEXT_ENCODER_THRESHOLD, CHUNK_SIZE, sharedTextDecoder, TEXT_DECODER_THRESHOLD;
var init_utf8 = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/utils/utf8.mjs"() {
    sharedTextEncoder = new TextEncoder();
    TEXT_ENCODER_THRESHOLD = 50;
    CHUNK_SIZE = 4096;
    sharedTextDecoder = new TextDecoder();
    TEXT_DECODER_THRESHOLD = 200;
  }
});

// node_modules/@msgpack/msgpack/dist.esm/ExtData.mjs
var ExtData;
var init_ExtData = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/ExtData.mjs"() {
    ExtData = class {
      type;
      data;
      constructor(type, data) {
        this.type = type;
        this.data = data;
      }
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/DecodeError.mjs
var DecodeError;
var init_DecodeError = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/DecodeError.mjs"() {
    DecodeError = class _DecodeError extends Error {
      constructor(message) {
        super(message);
        const proto = Object.create(_DecodeError.prototype);
        Object.setPrototypeOf(this, proto);
        Object.defineProperty(this, "name", {
          configurable: true,
          enumerable: false,
          value: _DecodeError.name
        });
      }
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/utils/int.mjs
function setUint64(view, offset, value) {
  const high = value / 4294967296;
  const low = value;
  view.setUint32(offset, high);
  view.setUint32(offset + 4, low);
}
function setInt64(view, offset, value) {
  const high = Math.floor(value / 4294967296);
  const low = value;
  view.setUint32(offset, high);
  view.setUint32(offset + 4, low);
}
function getInt64(view, offset) {
  const high = view.getInt32(offset);
  const low = view.getUint32(offset + 4);
  return high * 4294967296 + low;
}
function getUint64(view, offset) {
  const high = view.getUint32(offset);
  const low = view.getUint32(offset + 4);
  return high * 4294967296 + low;
}
var UINT32_MAX;
var init_int = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/utils/int.mjs"() {
    UINT32_MAX = 4294967295;
  }
});

// node_modules/@msgpack/msgpack/dist.esm/timestamp.mjs
function encodeTimeSpecToTimestamp({ sec, nsec }) {
  if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
    if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
      const rv = new Uint8Array(4);
      const view = new DataView(rv.buffer);
      view.setUint32(0, sec);
      return rv;
    } else {
      const secHigh = sec / 4294967296;
      const secLow = sec & 4294967295;
      const rv = new Uint8Array(8);
      const view = new DataView(rv.buffer);
      view.setUint32(0, nsec << 2 | secHigh & 3);
      view.setUint32(4, secLow);
      return rv;
    }
  } else {
    const rv = new Uint8Array(12);
    const view = new DataView(rv.buffer);
    view.setUint32(0, nsec);
    setInt64(view, 4, sec);
    return rv;
  }
}
function encodeDateToTimeSpec(date) {
  const msec = date.getTime();
  const sec = Math.floor(msec / 1e3);
  const nsec = (msec - sec * 1e3) * 1e6;
  const nsecInSec = Math.floor(nsec / 1e9);
  return {
    sec: sec + nsecInSec,
    nsec: nsec - nsecInSec * 1e9
  };
}
function encodeTimestampExtension(object) {
  if (object instanceof Date) {
    const timeSpec = encodeDateToTimeSpec(object);
    return encodeTimeSpecToTimestamp(timeSpec);
  } else {
    return null;
  }
}
function decodeTimestampToTimeSpec(data) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (data.byteLength) {
    case 4: {
      const sec = view.getUint32(0);
      const nsec = 0;
      return { sec, nsec };
    }
    case 8: {
      const nsec30AndSecHigh2 = view.getUint32(0);
      const secLow32 = view.getUint32(4);
      const sec = (nsec30AndSecHigh2 & 3) * 4294967296 + secLow32;
      const nsec = nsec30AndSecHigh2 >>> 2;
      return { sec, nsec };
    }
    case 12: {
      const sec = getInt64(view, 4);
      const nsec = view.getUint32(0);
      return { sec, nsec };
    }
    default:
      throw new DecodeError(`Unrecognized data size for timestamp (expected 4, 8, or 12): ${data.length}`);
  }
}
function decodeTimestampExtension(data) {
  const timeSpec = decodeTimestampToTimeSpec(data);
  return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
}
var EXT_TIMESTAMP, TIMESTAMP32_MAX_SEC, TIMESTAMP64_MAX_SEC, timestampExtension;
var init_timestamp = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/timestamp.mjs"() {
    init_DecodeError();
    init_int();
    EXT_TIMESTAMP = -1;
    TIMESTAMP32_MAX_SEC = 4294967296 - 1;
    TIMESTAMP64_MAX_SEC = 17179869184 - 1;
    timestampExtension = {
      type: EXT_TIMESTAMP,
      encode: encodeTimestampExtension,
      decode: decodeTimestampExtension
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/ExtensionCodec.mjs
var ExtensionCodec;
var init_ExtensionCodec = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/ExtensionCodec.mjs"() {
    init_ExtData();
    init_timestamp();
    ExtensionCodec = class _ExtensionCodec {
      static defaultCodec = new _ExtensionCodec();
      // ensures ExtensionCodecType<X> matches ExtensionCodec<X>
      // this will make type errors a lot more clear
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __brand;
      // built-in extensions
      builtInEncoders = [];
      builtInDecoders = [];
      // custom extensions
      encoders = [];
      decoders = [];
      constructor() {
        this.register(timestampExtension);
      }
      register({ type, encode: encode2, decode: decode2 }) {
        if (type >= 0) {
          this.encoders[type] = encode2;
          this.decoders[type] = decode2;
        } else {
          const index = -1 - type;
          this.builtInEncoders[index] = encode2;
          this.builtInDecoders[index] = decode2;
        }
      }
      tryToEncode(object, context) {
        for (let i = 0; i < this.builtInEncoders.length; i++) {
          const encodeExt = this.builtInEncoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type = -1 - i;
              return new ExtData(type, data);
            }
          }
        }
        for (let i = 0; i < this.encoders.length; i++) {
          const encodeExt = this.encoders[i];
          if (encodeExt != null) {
            const data = encodeExt(object, context);
            if (data != null) {
              const type = i;
              return new ExtData(type, data);
            }
          }
        }
        if (object instanceof ExtData) {
          return object;
        }
        return null;
      }
      decode(data, type, context) {
        const decodeExt = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
        if (decodeExt) {
          return decodeExt(data, type, context);
        } else {
          return new ExtData(type, data);
        }
      }
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/utils/typedArrays.mjs
function isArrayBufferLike(buffer) {
  return buffer instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer;
}
function ensureUint8Array(buffer) {
  if (buffer instanceof Uint8Array) {
    return buffer;
  } else if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (isArrayBufferLike(buffer)) {
    return new Uint8Array(buffer);
  } else {
    return Uint8Array.from(buffer);
  }
}
var init_typedArrays = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/utils/typedArrays.mjs"() {
  }
});

// node_modules/@msgpack/msgpack/dist.esm/Encoder.mjs
var DEFAULT_MAX_DEPTH, DEFAULT_INITIAL_BUFFER_SIZE, Encoder;
var init_Encoder = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/Encoder.mjs"() {
    init_utf8();
    init_ExtensionCodec();
    init_int();
    init_typedArrays();
    DEFAULT_MAX_DEPTH = 100;
    DEFAULT_INITIAL_BUFFER_SIZE = 2048;
    Encoder = class _Encoder {
      extensionCodec;
      context;
      useBigInt64;
      maxDepth;
      initialBufferSize;
      sortKeys;
      forceFloat32;
      ignoreUndefined;
      forceIntegerToFloat;
      pos;
      view;
      bytes;
      entered = false;
      constructor(options) {
        this.extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
        this.context = options?.context;
        this.useBigInt64 = options?.useBigInt64 ?? false;
        this.maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
        this.initialBufferSize = options?.initialBufferSize ?? DEFAULT_INITIAL_BUFFER_SIZE;
        this.sortKeys = options?.sortKeys ?? false;
        this.forceFloat32 = options?.forceFloat32 ?? false;
        this.ignoreUndefined = options?.ignoreUndefined ?? false;
        this.forceIntegerToFloat = options?.forceIntegerToFloat ?? false;
        this.pos = 0;
        this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
        this.bytes = new Uint8Array(this.view.buffer);
      }
      clone() {
        return new _Encoder({
          extensionCodec: this.extensionCodec,
          context: this.context,
          useBigInt64: this.useBigInt64,
          maxDepth: this.maxDepth,
          initialBufferSize: this.initialBufferSize,
          sortKeys: this.sortKeys,
          forceFloat32: this.forceFloat32,
          ignoreUndefined: this.ignoreUndefined,
          forceIntegerToFloat: this.forceIntegerToFloat
        });
      }
      reinitializeState() {
        this.pos = 0;
      }
      /**
       * This is almost equivalent to {@link Encoder#encode}, but it returns an reference of the encoder's internal buffer and thus much faster than {@link Encoder#encode}.
       *
       * @returns Encodes the object and returns a shared reference the encoder's internal buffer.
       */
      encodeSharedRef(object) {
        if (this.entered) {
          const instance = this.clone();
          return instance.encodeSharedRef(object);
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.doEncode(object, 1);
          return this.bytes.subarray(0, this.pos);
        } finally {
          this.entered = false;
        }
      }
      /**
       * @returns Encodes the object and returns a copy of the encoder's internal buffer.
       */
      encode(object) {
        if (this.entered) {
          const instance = this.clone();
          return instance.encode(object);
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.doEncode(object, 1);
          return this.bytes.slice(0, this.pos);
        } finally {
          this.entered = false;
        }
      }
      doEncode(object, depth) {
        if (depth > this.maxDepth) {
          throw new Error(`Too deep objects in depth ${depth}`);
        }
        if (object == null) {
          this.encodeNil();
        } else if (typeof object === "boolean") {
          this.encodeBoolean(object);
        } else if (typeof object === "number") {
          if (!this.forceIntegerToFloat) {
            this.encodeNumber(object);
          } else {
            this.encodeNumberAsFloat(object);
          }
        } else if (typeof object === "string") {
          this.encodeString(object);
        } else if (this.useBigInt64 && typeof object === "bigint") {
          this.encodeBigInt64(object);
        } else {
          this.encodeObject(object, depth);
        }
      }
      ensureBufferSizeToWrite(sizeToWrite) {
        const requiredSize = this.pos + sizeToWrite;
        if (this.view.byteLength < requiredSize) {
          this.resizeBuffer(requiredSize * 2);
        }
      }
      resizeBuffer(newSize) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this.bytes);
        this.view = newView;
        this.bytes = newBytes;
      }
      encodeNil() {
        this.writeU8(192);
      }
      encodeBoolean(object) {
        if (object === false) {
          this.writeU8(194);
        } else {
          this.writeU8(195);
        }
      }
      encodeNumber(object) {
        if (!this.forceIntegerToFloat && Number.isSafeInteger(object)) {
          if (object >= 0) {
            if (object < 128) {
              this.writeU8(object);
            } else if (object < 256) {
              this.writeU8(204);
              this.writeU8(object);
            } else if (object < 65536) {
              this.writeU8(205);
              this.writeU16(object);
            } else if (object < 4294967296) {
              this.writeU8(206);
              this.writeU32(object);
            } else if (!this.useBigInt64) {
              this.writeU8(207);
              this.writeU64(object);
            } else {
              this.encodeNumberAsFloat(object);
            }
          } else {
            if (object >= -32) {
              this.writeU8(224 | object + 32);
            } else if (object >= -128) {
              this.writeU8(208);
              this.writeI8(object);
            } else if (object >= -32768) {
              this.writeU8(209);
              this.writeI16(object);
            } else if (object >= -2147483648) {
              this.writeU8(210);
              this.writeI32(object);
            } else if (!this.useBigInt64) {
              this.writeU8(211);
              this.writeI64(object);
            } else {
              this.encodeNumberAsFloat(object);
            }
          }
        } else {
          this.encodeNumberAsFloat(object);
        }
      }
      encodeNumberAsFloat(object) {
        if (this.forceFloat32) {
          this.writeU8(202);
          this.writeF32(object);
        } else {
          this.writeU8(203);
          this.writeF64(object);
        }
      }
      encodeBigInt64(object) {
        if (object >= BigInt(0)) {
          this.writeU8(207);
          this.writeBigUint64(object);
        } else {
          this.writeU8(211);
          this.writeBigInt64(object);
        }
      }
      writeStringHeader(byteLength) {
        if (byteLength < 32) {
          this.writeU8(160 + byteLength);
        } else if (byteLength < 256) {
          this.writeU8(217);
          this.writeU8(byteLength);
        } else if (byteLength < 65536) {
          this.writeU8(218);
          this.writeU16(byteLength);
        } else if (byteLength < 4294967296) {
          this.writeU8(219);
          this.writeU32(byteLength);
        } else {
          throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
      }
      encodeString(object) {
        const maxHeaderSize = 1 + 4;
        const byteLength = utf8Count(object);
        this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
        this.writeStringHeader(byteLength);
        utf8Encode(object, this.bytes, this.pos);
        this.pos += byteLength;
      }
      encodeObject(object, depth) {
        const ext = this.extensionCodec.tryToEncode(object, this.context);
        if (ext != null) {
          this.encodeExtension(ext);
        } else if (Array.isArray(object)) {
          this.encodeArray(object, depth);
        } else if (ArrayBuffer.isView(object)) {
          this.encodeBinary(object);
        } else if (typeof object === "object") {
          this.encodeMap(object, depth);
        } else {
          throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
        }
      }
      encodeBinary(object) {
        const size = object.byteLength;
        if (size < 256) {
          this.writeU8(196);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(197);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(198);
          this.writeU32(size);
        } else {
          throw new Error(`Too large binary: ${size}`);
        }
        const bytes = ensureUint8Array(object);
        this.writeU8a(bytes);
      }
      encodeArray(object, depth) {
        const size = object.length;
        if (size < 16) {
          this.writeU8(144 + size);
        } else if (size < 65536) {
          this.writeU8(220);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(221);
          this.writeU32(size);
        } else {
          throw new Error(`Too large array: ${size}`);
        }
        for (const item of object) {
          this.doEncode(item, depth + 1);
        }
      }
      countWithoutUndefined(object, keys) {
        let count = 0;
        for (const key of keys) {
          if (object[key] !== void 0) {
            count++;
          }
        }
        return count;
      }
      encodeMap(object, depth) {
        const keys = Object.keys(object);
        if (this.sortKeys) {
          keys.sort();
        }
        const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
        if (size < 16) {
          this.writeU8(128 + size);
        } else if (size < 65536) {
          this.writeU8(222);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(223);
          this.writeU32(size);
        } else {
          throw new Error(`Too large map object: ${size}`);
        }
        for (const key of keys) {
          const value = object[key];
          if (!(this.ignoreUndefined && value === void 0)) {
            this.encodeString(key);
            this.doEncode(value, depth + 1);
          }
        }
      }
      encodeExtension(ext) {
        if (typeof ext.data === "function") {
          const data = ext.data(this.pos + 6);
          const size2 = data.length;
          if (size2 >= 4294967296) {
            throw new Error(`Too large extension object: ${size2}`);
          }
          this.writeU8(201);
          this.writeU32(size2);
          this.writeI8(ext.type);
          this.writeU8a(data);
          return;
        }
        const size = ext.data.length;
        if (size === 1) {
          this.writeU8(212);
        } else if (size === 2) {
          this.writeU8(213);
        } else if (size === 4) {
          this.writeU8(214);
        } else if (size === 8) {
          this.writeU8(215);
        } else if (size === 16) {
          this.writeU8(216);
        } else if (size < 256) {
          this.writeU8(199);
          this.writeU8(size);
        } else if (size < 65536) {
          this.writeU8(200);
          this.writeU16(size);
        } else if (size < 4294967296) {
          this.writeU8(201);
          this.writeU32(size);
        } else {
          throw new Error(`Too large extension object: ${size}`);
        }
        this.writeI8(ext.type);
        this.writeU8a(ext.data);
      }
      writeU8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setUint8(this.pos, value);
        this.pos++;
      }
      writeU8a(values) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this.bytes.set(values, this.pos);
        this.pos += size;
      }
      writeI8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setInt8(this.pos, value);
        this.pos++;
      }
      writeU16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setUint16(this.pos, value);
        this.pos += 2;
      }
      writeI16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setInt16(this.pos, value);
        this.pos += 2;
      }
      writeU32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setUint32(this.pos, value);
        this.pos += 4;
      }
      writeI32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setInt32(this.pos, value);
        this.pos += 4;
      }
      writeF32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setFloat32(this.pos, value);
        this.pos += 4;
      }
      writeF64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setFloat64(this.pos, value);
        this.pos += 8;
      }
      writeU64(value) {
        this.ensureBufferSizeToWrite(8);
        setUint64(this.view, this.pos, value);
        this.pos += 8;
      }
      writeI64(value) {
        this.ensureBufferSizeToWrite(8);
        setInt64(this.view, this.pos, value);
        this.pos += 8;
      }
      writeBigUint64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setBigUint64(this.pos, value);
        this.pos += 8;
      }
      writeBigInt64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setBigInt64(this.pos, value);
        this.pos += 8;
      }
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/encode.mjs
function encode(value, options) {
  const encoder = new Encoder(options);
  return encoder.encodeSharedRef(value);
}
var init_encode = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/encode.mjs"() {
    init_Encoder();
  }
});

// node_modules/@msgpack/msgpack/dist.esm/utils/prettyByte.mjs
function prettyByte(byte) {
  return `${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(2, "0")}`;
}
var init_prettyByte = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/utils/prettyByte.mjs"() {
  }
});

// node_modules/@msgpack/msgpack/dist.esm/CachedKeyDecoder.mjs
var DEFAULT_MAX_KEY_LENGTH, DEFAULT_MAX_LENGTH_PER_KEY, CachedKeyDecoder;
var init_CachedKeyDecoder = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/CachedKeyDecoder.mjs"() {
    init_utf8();
    DEFAULT_MAX_KEY_LENGTH = 16;
    DEFAULT_MAX_LENGTH_PER_KEY = 16;
    CachedKeyDecoder = class {
      hit = 0;
      miss = 0;
      caches;
      maxKeyLength;
      maxLengthPerKey;
      constructor(maxKeyLength = DEFAULT_MAX_KEY_LENGTH, maxLengthPerKey = DEFAULT_MAX_LENGTH_PER_KEY) {
        this.maxKeyLength = maxKeyLength;
        this.maxLengthPerKey = maxLengthPerKey;
        this.caches = [];
        for (let i = 0; i < this.maxKeyLength; i++) {
          this.caches.push([]);
        }
      }
      canBeCached(byteLength) {
        return byteLength > 0 && byteLength <= this.maxKeyLength;
      }
      find(bytes, inputOffset, byteLength) {
        const records = this.caches[byteLength - 1];
        FIND_CHUNK: for (const record of records) {
          const recordBytes = record.bytes;
          for (let j = 0; j < byteLength; j++) {
            if (recordBytes[j] !== bytes[inputOffset + j]) {
              continue FIND_CHUNK;
            }
          }
          return record.str;
        }
        return null;
      }
      store(bytes, value) {
        const records = this.caches[bytes.length - 1];
        const record = { bytes, str: value };
        if (records.length >= this.maxLengthPerKey) {
          records[Math.random() * records.length | 0] = record;
        } else {
          records.push(record);
        }
      }
      decode(bytes, inputOffset, byteLength) {
        const cachedValue = this.find(bytes, inputOffset, byteLength);
        if (cachedValue != null) {
          this.hit++;
          return cachedValue;
        }
        this.miss++;
        const str = utf8DecodeJs(bytes, inputOffset, byteLength);
        const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
        this.store(slicedCopyOfBytes, str);
        return str;
      }
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/Decoder.mjs
var STATE_ARRAY, STATE_MAP_KEY, STATE_MAP_VALUE, mapKeyConverter, StackPool, HEAD_BYTE_REQUIRED, EMPTY_VIEW, EMPTY_BYTES, MORE_DATA, sharedCachedKeyDecoder, Decoder;
var init_Decoder = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/Decoder.mjs"() {
    init_prettyByte();
    init_ExtensionCodec();
    init_int();
    init_utf8();
    init_typedArrays();
    init_CachedKeyDecoder();
    init_DecodeError();
    STATE_ARRAY = "array";
    STATE_MAP_KEY = "map_key";
    STATE_MAP_VALUE = "map_value";
    mapKeyConverter = (key) => {
      if (typeof key === "string" || typeof key === "number") {
        return key;
      }
      throw new DecodeError("The type of key must be string or number but " + typeof key);
    };
    StackPool = class {
      stack = [];
      stackHeadPosition = -1;
      get length() {
        return this.stackHeadPosition + 1;
      }
      top() {
        return this.stack[this.stackHeadPosition];
      }
      pushArrayState(size) {
        const state = this.getUninitializedStateFromPool();
        state.type = STATE_ARRAY;
        state.position = 0;
        state.size = size;
        state.array = new Array(size);
      }
      pushMapState(size) {
        const state = this.getUninitializedStateFromPool();
        state.type = STATE_MAP_KEY;
        state.readCount = 0;
        state.size = size;
        state.map = {};
      }
      getUninitializedStateFromPool() {
        this.stackHeadPosition++;
        if (this.stackHeadPosition === this.stack.length) {
          const partialState = {
            type: void 0,
            size: 0,
            array: void 0,
            position: 0,
            readCount: 0,
            map: void 0,
            key: null
          };
          this.stack.push(partialState);
        }
        return this.stack[this.stackHeadPosition];
      }
      release(state) {
        const topStackState = this.stack[this.stackHeadPosition];
        if (topStackState !== state) {
          throw new Error("Invalid stack state. Released state is not on top of the stack.");
        }
        if (state.type === STATE_ARRAY) {
          const partialState = state;
          partialState.size = 0;
          partialState.array = void 0;
          partialState.position = 0;
          partialState.type = void 0;
        }
        if (state.type === STATE_MAP_KEY || state.type === STATE_MAP_VALUE) {
          const partialState = state;
          partialState.size = 0;
          partialState.map = void 0;
          partialState.readCount = 0;
          partialState.type = void 0;
        }
        this.stackHeadPosition--;
      }
      reset() {
        this.stack.length = 0;
        this.stackHeadPosition = -1;
      }
    };
    HEAD_BYTE_REQUIRED = -1;
    EMPTY_VIEW = new DataView(new ArrayBuffer(0));
    EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
    try {
      EMPTY_VIEW.getInt8(0);
    } catch (e) {
      if (!(e instanceof RangeError)) {
        throw new Error("This module is not supported in the current JavaScript engine because DataView does not throw RangeError on out-of-bounds access");
      }
    }
    MORE_DATA = new RangeError("Insufficient data");
    sharedCachedKeyDecoder = new CachedKeyDecoder();
    Decoder = class _Decoder {
      extensionCodec;
      context;
      useBigInt64;
      rawStrings;
      maxStrLength;
      maxBinLength;
      maxArrayLength;
      maxMapLength;
      maxExtLength;
      keyDecoder;
      mapKeyConverter;
      totalPos = 0;
      pos = 0;
      view = EMPTY_VIEW;
      bytes = EMPTY_BYTES;
      headByte = HEAD_BYTE_REQUIRED;
      stack = new StackPool();
      entered = false;
      constructor(options) {
        this.extensionCodec = options?.extensionCodec ?? ExtensionCodec.defaultCodec;
        this.context = options?.context;
        this.useBigInt64 = options?.useBigInt64 ?? false;
        this.rawStrings = options?.rawStrings ?? false;
        this.maxStrLength = options?.maxStrLength ?? UINT32_MAX;
        this.maxBinLength = options?.maxBinLength ?? UINT32_MAX;
        this.maxArrayLength = options?.maxArrayLength ?? UINT32_MAX;
        this.maxMapLength = options?.maxMapLength ?? UINT32_MAX;
        this.maxExtLength = options?.maxExtLength ?? UINT32_MAX;
        this.keyDecoder = options?.keyDecoder !== void 0 ? options.keyDecoder : sharedCachedKeyDecoder;
        this.mapKeyConverter = options?.mapKeyConverter ?? mapKeyConverter;
      }
      clone() {
        return new _Decoder({
          extensionCodec: this.extensionCodec,
          context: this.context,
          useBigInt64: this.useBigInt64,
          rawStrings: this.rawStrings,
          maxStrLength: this.maxStrLength,
          maxBinLength: this.maxBinLength,
          maxArrayLength: this.maxArrayLength,
          maxMapLength: this.maxMapLength,
          maxExtLength: this.maxExtLength,
          keyDecoder: this.keyDecoder
        });
      }
      reinitializeState() {
        this.totalPos = 0;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack.reset();
      }
      setBuffer(buffer) {
        const bytes = ensureUint8Array(buffer);
        this.bytes = bytes;
        this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        this.pos = 0;
      }
      appendBuffer(buffer) {
        if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining(1)) {
          this.setBuffer(buffer);
        } else {
          const remainingData = this.bytes.subarray(this.pos);
          const newData = ensureUint8Array(buffer);
          const newBuffer = new Uint8Array(remainingData.length + newData.length);
          newBuffer.set(remainingData);
          newBuffer.set(newData, remainingData.length);
          this.setBuffer(newBuffer);
        }
      }
      hasRemaining(size) {
        return this.view.byteLength - this.pos >= size;
      }
      createExtraByteError(posToShow) {
        const { view, pos } = this;
        return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
      }
      /**
       * @throws {@link DecodeError}
       * @throws {@link RangeError}
       */
      decode(buffer) {
        if (this.entered) {
          const instance = this.clone();
          return instance.decode(buffer);
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.setBuffer(buffer);
          const object = this.doDecodeSync();
          if (this.hasRemaining(1)) {
            throw this.createExtraByteError(this.pos);
          }
          return object;
        } finally {
          this.entered = false;
        }
      }
      *decodeMulti(buffer) {
        if (this.entered) {
          const instance = this.clone();
          yield* instance.decodeMulti(buffer);
          return;
        }
        try {
          this.entered = true;
          this.reinitializeState();
          this.setBuffer(buffer);
          while (this.hasRemaining(1)) {
            yield this.doDecodeSync();
          }
        } finally {
          this.entered = false;
        }
      }
      async decodeAsync(stream) {
        if (this.entered) {
          const instance = this.clone();
          return instance.decodeAsync(stream);
        }
        try {
          this.entered = true;
          let decoded = false;
          let object;
          for await (const buffer of stream) {
            if (decoded) {
              this.entered = false;
              throw this.createExtraByteError(this.totalPos);
            }
            this.appendBuffer(buffer);
            try {
              object = this.doDecodeSync();
              decoded = true;
            } catch (e) {
              if (!(e instanceof RangeError)) {
                throw e;
              }
            }
            this.totalPos += this.pos;
          }
          if (decoded) {
            if (this.hasRemaining(1)) {
              throw this.createExtraByteError(this.totalPos);
            }
            return object;
          }
          const { headByte, pos, totalPos } = this;
          throw new RangeError(`Insufficient data in parsing ${prettyByte(headByte)} at ${totalPos} (${pos} in the current buffer)`);
        } finally {
          this.entered = false;
        }
      }
      decodeArrayStream(stream) {
        return this.decodeMultiAsync(stream, true);
      }
      decodeStream(stream) {
        return this.decodeMultiAsync(stream, false);
      }
      async *decodeMultiAsync(stream, isArray) {
        if (this.entered) {
          const instance = this.clone();
          yield* instance.decodeMultiAsync(stream, isArray);
          return;
        }
        try {
          this.entered = true;
          let isArrayHeaderRequired = isArray;
          let arrayItemsLeft = -1;
          for await (const buffer of stream) {
            if (isArray && arrayItemsLeft === 0) {
              throw this.createExtraByteError(this.totalPos);
            }
            this.appendBuffer(buffer);
            if (isArrayHeaderRequired) {
              arrayItemsLeft = this.readArraySize();
              isArrayHeaderRequired = false;
              this.complete();
            }
            try {
              while (true) {
                yield this.doDecodeSync();
                if (--arrayItemsLeft === 0) {
                  break;
                }
              }
            } catch (e) {
              if (!(e instanceof RangeError)) {
                throw e;
              }
            }
            this.totalPos += this.pos;
          }
        } finally {
          this.entered = false;
        }
      }
      doDecodeSync() {
        DECODE: while (true) {
          const headByte = this.readHeadByte();
          let object;
          if (headByte >= 224) {
            object = headByte - 256;
          } else if (headByte < 192) {
            if (headByte < 128) {
              object = headByte;
            } else if (headByte < 144) {
              const size = headByte - 128;
              if (size !== 0) {
                this.pushMapState(size);
                this.complete();
                continue DECODE;
              } else {
                object = {};
              }
            } else if (headByte < 160) {
              const size = headByte - 144;
              if (size !== 0) {
                this.pushArrayState(size);
                this.complete();
                continue DECODE;
              } else {
                object = [];
              }
            } else {
              const byteLength = headByte - 160;
              object = this.decodeString(byteLength, 0);
            }
          } else if (headByte === 192) {
            object = null;
          } else if (headByte === 194) {
            object = false;
          } else if (headByte === 195) {
            object = true;
          } else if (headByte === 202) {
            object = this.readF32();
          } else if (headByte === 203) {
            object = this.readF64();
          } else if (headByte === 204) {
            object = this.readU8();
          } else if (headByte === 205) {
            object = this.readU16();
          } else if (headByte === 206) {
            object = this.readU32();
          } else if (headByte === 207) {
            if (this.useBigInt64) {
              object = this.readU64AsBigInt();
            } else {
              object = this.readU64();
            }
          } else if (headByte === 208) {
            object = this.readI8();
          } else if (headByte === 209) {
            object = this.readI16();
          } else if (headByte === 210) {
            object = this.readI32();
          } else if (headByte === 211) {
            if (this.useBigInt64) {
              object = this.readI64AsBigInt();
            } else {
              object = this.readI64();
            }
          } else if (headByte === 217) {
            const byteLength = this.lookU8();
            object = this.decodeString(byteLength, 1);
          } else if (headByte === 218) {
            const byteLength = this.lookU16();
            object = this.decodeString(byteLength, 2);
          } else if (headByte === 219) {
            const byteLength = this.lookU32();
            object = this.decodeString(byteLength, 4);
          } else if (headByte === 220) {
            const size = this.readU16();
            if (size !== 0) {
              this.pushArrayState(size);
              this.complete();
              continue DECODE;
            } else {
              object = [];
            }
          } else if (headByte === 221) {
            const size = this.readU32();
            if (size !== 0) {
              this.pushArrayState(size);
              this.complete();
              continue DECODE;
            } else {
              object = [];
            }
          } else if (headByte === 222) {
            const size = this.readU16();
            if (size !== 0) {
              this.pushMapState(size);
              this.complete();
              continue DECODE;
            } else {
              object = {};
            }
          } else if (headByte === 223) {
            const size = this.readU32();
            if (size !== 0) {
              this.pushMapState(size);
              this.complete();
              continue DECODE;
            } else {
              object = {};
            }
          } else if (headByte === 196) {
            const size = this.lookU8();
            object = this.decodeBinary(size, 1);
          } else if (headByte === 197) {
            const size = this.lookU16();
            object = this.decodeBinary(size, 2);
          } else if (headByte === 198) {
            const size = this.lookU32();
            object = this.decodeBinary(size, 4);
          } else if (headByte === 212) {
            object = this.decodeExtension(1, 0);
          } else if (headByte === 213) {
            object = this.decodeExtension(2, 0);
          } else if (headByte === 214) {
            object = this.decodeExtension(4, 0);
          } else if (headByte === 215) {
            object = this.decodeExtension(8, 0);
          } else if (headByte === 216) {
            object = this.decodeExtension(16, 0);
          } else if (headByte === 199) {
            const size = this.lookU8();
            object = this.decodeExtension(size, 1);
          } else if (headByte === 200) {
            const size = this.lookU16();
            object = this.decodeExtension(size, 2);
          } else if (headByte === 201) {
            const size = this.lookU32();
            object = this.decodeExtension(size, 4);
          } else {
            throw new DecodeError(`Unrecognized type byte: ${prettyByte(headByte)}`);
          }
          this.complete();
          const stack = this.stack;
          while (stack.length > 0) {
            const state = stack.top();
            if (state.type === STATE_ARRAY) {
              state.array[state.position] = object;
              state.position++;
              if (state.position === state.size) {
                object = state.array;
                stack.release(state);
              } else {
                continue DECODE;
              }
            } else if (state.type === STATE_MAP_KEY) {
              if (object === "__proto__") {
                throw new DecodeError("The key __proto__ is not allowed");
              }
              state.key = this.mapKeyConverter(object);
              state.type = STATE_MAP_VALUE;
              continue DECODE;
            } else {
              state.map[state.key] = object;
              state.readCount++;
              if (state.readCount === state.size) {
                object = state.map;
                stack.release(state);
              } else {
                state.key = null;
                state.type = STATE_MAP_KEY;
                continue DECODE;
              }
            }
          }
          return object;
        }
      }
      readHeadByte() {
        if (this.headByte === HEAD_BYTE_REQUIRED) {
          this.headByte = this.readU8();
        }
        return this.headByte;
      }
      complete() {
        this.headByte = HEAD_BYTE_REQUIRED;
      }
      readArraySize() {
        const headByte = this.readHeadByte();
        switch (headByte) {
          case 220:
            return this.readU16();
          case 221:
            return this.readU32();
          default: {
            if (headByte < 160) {
              return headByte - 144;
            } else {
              throw new DecodeError(`Unrecognized array type byte: ${prettyByte(headByte)}`);
            }
          }
        }
      }
      pushMapState(size) {
        if (size > this.maxMapLength) {
          throw new DecodeError(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
        }
        this.stack.pushMapState(size);
      }
      pushArrayState(size) {
        if (size > this.maxArrayLength) {
          throw new DecodeError(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
        }
        this.stack.pushArrayState(size);
      }
      decodeString(byteLength, headerOffset) {
        if (!this.rawStrings || this.stateIsMapKey()) {
          return this.decodeUtf8String(byteLength, headerOffset);
        }
        return this.decodeBinary(byteLength, headerOffset);
      }
      /**
       * @throws {@link RangeError}
       */
      decodeUtf8String(byteLength, headerOffset) {
        if (byteLength > this.maxStrLength) {
          throw new DecodeError(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
        }
        if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
          throw MORE_DATA;
        }
        const offset = this.pos + headerOffset;
        let object;
        if (this.stateIsMapKey() && this.keyDecoder?.canBeCached(byteLength)) {
          object = this.keyDecoder.decode(this.bytes, offset, byteLength);
        } else {
          object = utf8Decode(this.bytes, offset, byteLength);
        }
        this.pos += headerOffset + byteLength;
        return object;
      }
      stateIsMapKey() {
        if (this.stack.length > 0) {
          const state = this.stack.top();
          return state.type === STATE_MAP_KEY;
        }
        return false;
      }
      /**
       * @throws {@link RangeError}
       */
      decodeBinary(byteLength, headOffset) {
        if (byteLength > this.maxBinLength) {
          throw new DecodeError(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
        }
        if (!this.hasRemaining(byteLength + headOffset)) {
          throw MORE_DATA;
        }
        const offset = this.pos + headOffset;
        const object = this.bytes.subarray(offset, offset + byteLength);
        this.pos += headOffset + byteLength;
        return object;
      }
      decodeExtension(size, headOffset) {
        if (size > this.maxExtLength) {
          throw new DecodeError(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
        }
        const extType = this.view.getInt8(this.pos + headOffset);
        const data = this.decodeBinary(
          size,
          headOffset + 1
          /* extType */
        );
        return this.extensionCodec.decode(data, extType, this.context);
      }
      lookU8() {
        return this.view.getUint8(this.pos);
      }
      lookU16() {
        return this.view.getUint16(this.pos);
      }
      lookU32() {
        return this.view.getUint32(this.pos);
      }
      readU8() {
        const value = this.view.getUint8(this.pos);
        this.pos++;
        return value;
      }
      readI8() {
        const value = this.view.getInt8(this.pos);
        this.pos++;
        return value;
      }
      readU16() {
        const value = this.view.getUint16(this.pos);
        this.pos += 2;
        return value;
      }
      readI16() {
        const value = this.view.getInt16(this.pos);
        this.pos += 2;
        return value;
      }
      readU32() {
        const value = this.view.getUint32(this.pos);
        this.pos += 4;
        return value;
      }
      readI32() {
        const value = this.view.getInt32(this.pos);
        this.pos += 4;
        return value;
      }
      readU64() {
        const value = getUint64(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readI64() {
        const value = getInt64(this.view, this.pos);
        this.pos += 8;
        return value;
      }
      readU64AsBigInt() {
        const value = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return value;
      }
      readI64AsBigInt() {
        const value = this.view.getBigInt64(this.pos);
        this.pos += 8;
        return value;
      }
      readF32() {
        const value = this.view.getFloat32(this.pos);
        this.pos += 4;
        return value;
      }
      readF64() {
        const value = this.view.getFloat64(this.pos);
        this.pos += 8;
        return value;
      }
    };
  }
});

// node_modules/@msgpack/msgpack/dist.esm/decode.mjs
function decode(buffer, options) {
  const decoder = new Decoder(options);
  return decoder.decode(buffer);
}
var init_decode = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/decode.mjs"() {
    init_Decoder();
  }
});

// node_modules/@msgpack/msgpack/dist.esm/index.mjs
var init_dist = __esm({
  "node_modules/@msgpack/msgpack/dist.esm/index.mjs"() {
    init_encode();
    init_decode();
  }
});

// client/transports/ws.js
function connect(opts) {
  _onMessage = opts && opts.onMessage;
  _onOpen = opts && opts.onOpen;
  _onClose = opts && opts.onClose;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  _ws = new WebSocket(proto + "://" + location.host + "/strawberrycow-fps-ws/");
  _ws.binaryType = "arraybuffer";
  _ws.onopen = () => {
    if (_onOpen) _onOpen();
  };
  _ws.onmessage = (e) => {
    if (!_onMessage) return;
    try {
      const msg = e.data instanceof ArrayBuffer ? decode(new Uint8Array(e.data)) : JSON.parse(e.data);
      _onMessage(msg);
    } catch (err) {
    }
  };
  _ws.onclose = () => {
    if (_onClose) _onClose();
  };
  _ws.onerror = () => {
  };
}
function sendReliable(msg) {
  if (!_ws || _ws.readyState !== 1) return;
  _ws.send(encode(msg));
}
function sendUnreliable(msg) {
  sendReliable(msg);
}
function close() {
  if (_ws) {
    try {
      _ws.close();
    } catch (e) {
    }
  }
  _ws = null;
}
var _ws, _onMessage, _onOpen, _onClose, ws_default;
var init_ws = __esm({
  "client/transports/ws.js"() {
    init_dist();
    _ws = null;
    _onMessage = null;
    _onOpen = null;
    _onClose = null;
    ws_default = {
      connect,
      sendReliable,
      sendUnreliable,
      close
    };
  }
});

// node_modules/@yandeu/events/lib/version.js
var VERSION;
var init_version = __esm({
  "node_modules/@yandeu/events/lib/version.js"() {
    VERSION = "0.0.7";
  }
});

// node_modules/@yandeu/events/lib/index.js
var EE, addListener, clearEvent, Events;
var init_lib = __esm({
  "node_modules/@yandeu/events/lib/index.js"() {
    init_version();
    EE = class {
      fn;
      context;
      once;
      constructor(fn, context, once = false) {
        this.fn = fn;
        this.context = context;
        this.once = once;
      }
    };
    addListener = (emitter, event, fn, context, once) => {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      const listener = new EE(fn, context || emitter, once);
      if (!emitter._events.has(event))
        emitter._events.set(event, listener), emitter._eventsCount++;
      else if (!emitter._events.get(event).fn)
        emitter._events.get(event).push(listener);
      else
        emitter._events.set(event, [emitter._events.get(event), listener]);
      return emitter;
    };
    clearEvent = (emitter, event) => {
      if (--emitter._eventsCount === 0)
        emitter._events = /* @__PURE__ */ new Map();
      else
        emitter._events.delete(event);
    };
    Events = class {
      static get VERSION() {
        return VERSION;
      }
      _events = /* @__PURE__ */ new Map();
      _eventsCount = 0;
      eventNames() {
        return Array.from(this._events.keys());
      }
      listeners(event) {
        const handlers2 = this._events.get(event);
        if (!handlers2)
          return [];
        if (handlers2.fn)
          return [handlers2.fn];
        for (var i = 0, l = handlers2.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers2[i].fn;
        }
        return ee;
      }
      listenerCount(event) {
        const listeners = this._events.get(event);
        if (!listeners)
          return 0;
        if (listeners.fn)
          return 1;
        return listeners.length;
      }
      emit(event, ...args) {
        if (!this._events.has(event))
          return false;
        const listeners = this._events.get(event);
        let i;
        if (listeners.fn) {
          if (listeners.once)
            this.removeListener(event, listeners.fn, void 0, true);
          return listeners.fn.call(listeners.context, ...args), true;
        } else {
          const length = listeners.length;
          for (i = 0; i < length; i++) {
            if (listeners[i].once)
              this.removeListener(event, listeners[i].fn, void 0, true);
            listeners[i].fn.call(listeners[i].context, ...args);
          }
        }
        return true;
      }
      on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      }
      once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      }
      removeListener(event, fn, context, once) {
        if (!this._events.has(event))
          return this;
        if (!fn) {
          clearEvent(this, event);
          return this;
        }
        const listeners = this._events.get(event);
        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, event);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }
          if (events.length)
            this._events.set(event, events.length === 1 ? events[0] : events);
          else
            clearEvent(this, event);
        }
        return this;
      }
      removeAllListeners(event) {
        if (event) {
          if (this._events.delete(event))
            clearEvent(this, event);
        } else {
          this._events = /* @__PURE__ */ new Map();
          this._eventsCount = 0;
        }
        return this;
      }
      // alias
      get off() {
        return this.removeListener;
      }
      // alias
      get addListener() {
        return this.on;
      }
    };
  }
});

// node_modules/@geckos.io/common/lib/bridge.js
var Bridge, bridge;
var init_bridge = __esm({
  "node_modules/@geckos.io/common/lib/bridge.js"() {
    init_lib();
    Bridge = class {
      constructor() {
        this.eventEmitter = new Events();
      }
      emit(eventName, data, connection = {}) {
        this.eventEmitter.emit(eventName, data, connection);
      }
      on(eventName, cb) {
        return this.eventEmitter.on(eventName, (data, options) => {
          cb(data, options);
        });
      }
      removeAllListeners() {
        this.eventEmitter.removeAllListeners();
      }
    };
    bridge = new Bridge();
  }
});

// node_modules/@geckos.io/common/lib/constants.js
var EVENTS, ERRORS;
var init_constants = __esm({
  "node_modules/@geckos.io/common/lib/constants.js"() {
    EVENTS = {
      CONNECT: "connect",
      CONNECTION: "connection",
      DATA_CHANNEL_IS_OPEN: "dataChannelIsOpen",
      DISCONNECT: "disconnect",
      DISCONNECTED: "disconnected",
      DROP: "dropped",
      ERROR: "error",
      RAW_MESSAGE: "rawMessage",
      RECEIVED_FROM_DATA_CHANNEL: "receiveFromDataChannel",
      SEND_OVER_DATA_CHANNEL: "sendOverDataChannel"
    };
    ERRORS = {
      BROWSER_NOT_SUPPORTED: "BROWSER_NOT_SUPPORTED",
      COULD_NOT_PARSE_MESSAGE: "COULD_NOT_PARSE_MESSAGE",
      DROPPED_FROM_BUFFERING: "DROPPED_FROM_BUFFERING",
      MAX_MESSAGE_SIZE_EXCEEDED: "MAX_MESSAGE_SIZE_EXCEEDED"
    };
  }
});

// node_modules/@geckos.io/common/lib/types.js
var ArrayBufferView;
var init_types = __esm({
  "node_modules/@geckos.io/common/lib/types.js"() {
    ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor;
  }
});

// node_modules/@geckos.io/common/lib/helpers.js
var tick, isStringMessage, isBufferMessage, isJSONMessage;
var init_helpers = __esm({
  "node_modules/@geckos.io/common/lib/helpers.js"() {
    init_types();
    tick = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
    isStringMessage = (data) => {
      return typeof data === "string";
    };
    isBufferMessage = (data) => {
      return data instanceof ArrayBuffer || data instanceof ArrayBufferView;
    };
    isJSONMessage = (data) => {
      try {
        if (typeof data !== "string")
          return false;
        if (!isNaN(parseInt(data)))
          return false;
        JSON.parse(data);
        return true;
      } catch (error) {
        return false;
      }
    };
  }
});

// node_modules/@geckos.io/common/lib/parseMessage.js
var ParseMessage;
var init_parseMessage = __esm({
  "node_modules/@geckos.io/common/lib/parseMessage.js"() {
    init_constants();
    init_helpers();
    ParseMessage = (ev) => {
      let { data } = ev;
      if (!data)
        data = ev;
      const isBuffer = isBufferMessage(data);
      const isJson = isJSONMessage(data);
      const isString = isStringMessage(data);
      if (isJson) {
        const object = JSON.parse(data);
        const key = Object.keys(object)[0];
        const value = object[key];
        return { key, data: value };
      }
      if (isBuffer) {
        return { key: EVENTS.RAW_MESSAGE, data };
      }
      if (isString) {
        return { key: EVENTS.RAW_MESSAGE, data };
      }
      return { key: "error", data: new Error(ERRORS.COULD_NOT_PARSE_MESSAGE) };
    };
  }
});

// node_modules/@geckos.io/common/lib/sendMessage.js
var SendMessage;
var init_sendMessage = __esm({
  "node_modules/@geckos.io/common/lib/sendMessage.js"() {
    init_helpers();
    init_constants();
    SendMessage = (dataChannel, maxMessageSize, eventName, data = null) => {
      var _a;
      const send2 = (data2, isBuffer) => {
        var _a2;
        const bytes = (_a2 = data2.byteLength) !== null && _a2 !== void 0 ? _a2 : data2.length * 2;
        if (typeof maxMessageSize === "number" && bytes > maxMessageSize) {
          throw new Error(`maxMessageSize of ${maxMessageSize} exceeded`);
        } else {
          Promise.resolve().then(() => {
            if (dataChannel.send)
              dataChannel.send(data2);
            else {
              if (!isBuffer)
                dataChannel.sendMessage(data2);
              else
                dataChannel.sendMessageBinary(Buffer.from(data2));
            }
          }).catch((error) => {
            console.log("error", error);
          });
        }
      };
      if (!dataChannel)
        return;
      if (dataChannel.readyState === "open" || ((_a = dataChannel.isOpen) === null || _a === void 0 ? void 0 : _a.call(dataChannel))) {
        try {
          if (eventName === EVENTS.RAW_MESSAGE && data !== null && (isStringMessage(data) || isBufferMessage(data))) {
            send2(data, isBufferMessage(data));
          } else {
            send2(JSON.stringify({ [eventName]: data }), false);
          }
        } catch (error) {
          console.error("Error in sendMessage.ts: ", error.message);
          return error;
        }
      }
    };
  }
});

// node_modules/@geckos.io/client/lib/wrtc/connectionsManager.js
var ConnectionsManagerClient;
var init_connectionsManager = __esm({
  "node_modules/@geckos.io/client/lib/wrtc/connectionsManager.js"() {
    init_bridge();
    init_parseMessage();
    init_sendMessage();
    ConnectionsManagerClient = class {
      emit(eventName, data = null) {
        SendMessage(this.dataChannel, this.maxMessageSize, eventName, data);
      }
      constructor(url, authorization, label, rtcConfiguration) {
        this.url = url;
        this.authorization = authorization;
        this.label = label;
        this.rtcConfiguration = rtcConfiguration;
        this.bridge = new Bridge();
        this.onDataChannel = (ev) => {
          const { channel } = ev;
          if (channel.label !== this.label)
            return;
          this.dataChannel = channel;
          this.dataChannel.binaryType = "arraybuffer";
          this.dataChannel.onmessage = (ev2) => {
            const { key, data } = ParseMessage(ev2);
            this.bridge.emit(key, data);
          };
        };
      }
      // fetch additional candidates
      async fetchAdditionalCandidates(host, id) {
        var _a;
        if (((_a = this.dataChannel) === null || _a === void 0 ? void 0 : _a.readyState) === "closed")
          return;
        const res = await fetch(`${host}/connections/${id}/additional-candidates`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const candidates = await res.json();
          candidates.forEach((c) => {
            this.localPeerConnection.addIceCandidate(c);
          });
        }
      }
      async connect() {
        const host = `${this.url}/.wrtc/v2`;
        let headers = { "Content-Type": "application/json" };
        if (this.authorization)
          headers = { ...headers, ["Authorization"]: this.authorization };
        let userData = {};
        try {
          const res = await fetch(`${host}/connections`, {
            method: "POST",
            headers
          });
          if (res.status >= 300) {
            throw {
              name: "Error",
              message: `Connection failed with status code ${res.status}.`,
              status: res.status,
              statusText: res.statusText
            };
          }
          const json = await res.json();
          userData = json.userData;
          this.remotePeerConnection = json;
        } catch (error) {
          console.error(error.message);
          return { error };
        }
        const { id, localDescription } = this.remotePeerConnection;
        const configuration = {
          // @ts-ignore
          sdpSemantics: "unified-plan",
          ...this.rtcConfiguration
        };
        const RTCPc = RTCPeerConnection || webkitRTCPeerConnection;
        this.localPeerConnection = new RTCPc(configuration);
        const showBackOffIntervals = (attempts = 10, initial = 50, factor = 1.8, jitter = 20) => Array(attempts).fill(0).map((_, index) => parseInt((initial * factor ** index).toString()) + parseInt((Math.random() * jitter).toString()));
        showBackOffIntervals().forEach((ms) => {
          setTimeout(() => {
            this.fetchAdditionalCandidates(host, id).catch(() => {
            });
          }, ms);
        });
        try {
          await this.localPeerConnection.setRemoteDescription(localDescription);
          this.localPeerConnection.addEventListener("datachannel", this.onDataChannel, { once: true });
          const originalAnswer = await this.localPeerConnection.createAnswer();
          const updatedAnswer = new RTCSessionDescription({
            type: "answer",
            sdp: originalAnswer.sdp
          });
          await this.localPeerConnection.setLocalDescription(updatedAnswer);
          try {
            await fetch(`${host}/connections/${id}/remote-description`, {
              method: "POST",
              body: JSON.stringify(this.localPeerConnection.localDescription),
              headers: {
                "Content-Type": "application/json"
              }
            });
          } catch (error) {
            console.error(error.message);
            return { error };
          }
          const waitForDataChannel = () => {
            return new Promise((resolve) => {
              this.localPeerConnection.addEventListener("datachannel", () => {
                resolve();
              }, { once: true });
            });
          };
          if (!this.dataChannel)
            await waitForDataChannel();
          return {
            userData,
            localPeerConnection: this.localPeerConnection,
            dataChannel: this.dataChannel,
            id
          };
        } catch (error) {
          console.error(error.message);
          this.localPeerConnection.close();
          return { error };
        }
      }
    };
  }
});

// node_modules/@geckos.io/client/lib/wrtc/peerConnection.js
var PeerConnection;
var init_peerConnection = __esm({
  "node_modules/@geckos.io/client/lib/wrtc/peerConnection.js"() {
    init_constants();
    PeerConnection = class {
      async connect(connectionsManager) {
        const webRTCPcSupported = RTCPeerConnection || webkitRTCPeerConnection;
        if (webRTCPcSupported) {
          const { localPeerConnection, dataChannel, id, userData, error } = await connectionsManager.connect();
          if (error)
            return { error };
          if (!localPeerConnection || !dataChannel || !id || !userData)
            return { error: new Error('Something went wrong in "await connectionsManager.connect()"') };
          this.localPeerConnection = localPeerConnection;
          this.dataChannel = dataChannel;
          this.id = id;
          return { userData };
        } else {
          const error = new Error(ERRORS.BROWSER_NOT_SUPPORTED);
          console.error(error.message);
          return { error };
        }
      }
    };
  }
});

// node_modules/@geckos.io/common/lib/makeRandomId.js
var makeRandomId;
var init_makeRandomId = __esm({
  "node_modules/@geckos.io/common/lib/makeRandomId.js"() {
    makeRandomId = (length = 24) => {
      const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let id = "";
      for (let i = 0; i < length; i++) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return id;
    };
  }
});

// node_modules/@geckos.io/common/lib/runInterval.js
var runInterval;
var init_runInterval = __esm({
  "node_modules/@geckos.io/common/lib/runInterval.js"() {
    runInterval = (interval = 200, runs = 1, cb) => {
      let counter = 0;
      if (typeof cb !== "function") {
        console.error("You have to define your callback function!");
        return;
      }
      const i = setInterval(() => {
        cb();
        counter++;
        if (counter === runs - 1) {
          clearInterval(i);
        }
      }, interval);
      cb();
    };
  }
});

// node_modules/@geckos.io/common/lib/reliableMessage.js
var makeReliable;
var init_reliableMessage = __esm({
  "node_modules/@geckos.io/common/lib/reliableMessage.js"() {
    init_makeRandomId();
    init_runInterval();
    makeReliable = (options, cb) => {
      const { interval = 150, runs = 10 } = options;
      const id = makeRandomId(24);
      runInterval(interval, runs, () => {
        cb(id);
      });
    };
  }
});

// node_modules/@geckos.io/client/lib/geckos/channel.js
var ClientChannel, geckosClient, channel_default;
var init_channel = __esm({
  "node_modules/@geckos.io/client/lib/geckos/channel.js"() {
    init_connectionsManager();
    init_constants();
    init_peerConnection();
    init_reliableMessage();
    ClientChannel = class {
      constructor(url, authorization, port, label, rtcConfiguration) {
        this.userData = {};
        this.receivedReliableMessages = [];
        this.url = port ? `${url}:${port}` : url;
        this.connectionsManager = new ConnectionsManagerClient(this.url, authorization, label, rtcConfiguration);
        this.bridge = this.connectionsManager.bridge;
        this.bridge.on(EVENTS.DISCONNECTED, () => this.bridge.removeAllListeners());
      }
      onconnectionstatechange() {
        const lpc = this.peerConnection.localPeerConnection;
        lpc.onconnectionstatechange = () => {
          if (lpc.connectionState === "disconnected" || lpc.connectionState === "closed")
            this.bridge.emit(EVENTS.DISCONNECTED);
        };
      }
      /** Get the channel's id. */
      get id() {
        return this.peerConnection.id;
      }
      /** Close the WebRTC connection */
      close() {
        this.peerConnection.localPeerConnection.close();
        this.bridge.emit(EVENTS.DISCONNECTED);
        try {
          const host = `${this.url}/.wrtc/v2`;
          fetch(`${host}/connections/${this.id}/close`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });
        } catch (error) {
          console.error(error.message);
        }
      }
      /** Emit a message to the server. */
      emit(eventName, data = null, options) {
        if (options && options.reliable) {
          makeReliable(options, (id) => this.connectionsManager.emit(eventName, {
            MESSAGE: data,
            RELIABLE: 1,
            ID: id
          }));
        } else {
          this.connectionsManager.emit(eventName, data);
        }
      }
      /** Emit a raw message to the server */
      get raw() {
        return {
          /**
           * Emit a raw message.
           * @param rawMessage The raw message. Can be of type 'USVString | ArrayBuffer | ArrayBufferView'
           */
          emit: (rawMessage) => this.emit(EVENTS.RAW_MESSAGE, rawMessage)
        };
      }
      /**
       * Listen for a raw message from the server.
       * @param callback The event callback.
       */
      onRaw(callback) {
        this.bridge.on(EVENTS.RAW_MESSAGE, (rawMessage) => {
          const cb = (rawMessage2) => callback(rawMessage2);
          cb(rawMessage);
        });
      }
      /**
       * Listen for the connect event.
       * @param callback The event callback.
       */
      async onConnect(callback) {
        var _a;
        this.peerConnection = new PeerConnection();
        const response = await this.peerConnection.connect(this.connectionsManager);
        if (response.error)
          callback(response.error);
        else {
          if (response.userData)
            this.userData = response.userData;
          this.maxMessageSize = this.connectionsManager.maxMessageSize = (_a = this.peerConnection.localPeerConnection.sctp) === null || _a === void 0 ? void 0 : _a.maxMessageSize;
          this.onconnectionstatechange();
          callback();
        }
      }
      /**
       * Listen for the disconnect event.
       * @param callback The event callback.
       */
      onDisconnect(callback) {
        this.bridge.on(EVENTS.DISCONNECTED, callback);
      }
      /**
       * Listen for a message from the server.
       * @param eventName The event name.
       * @param callback The event callback.
       */
      on(eventName, callback) {
        this.bridge.on(eventName, (data) => {
          const isReliableMessage = data && data.RELIABLE === 1 && data.ID !== "undefined";
          const expireTime = 15e3;
          const deleteExpiredReliableMessages = () => {
            const currentTime = (/* @__PURE__ */ new Date()).getTime();
            this.receivedReliableMessages.forEach((msg, index, object) => {
              if (msg.expire <= currentTime) {
                object.splice(index, 1);
              }
            });
          };
          if (isReliableMessage) {
            deleteExpiredReliableMessages();
            if (this.receivedReliableMessages.filter((obj) => obj.id === data.ID).length === 0) {
              this.receivedReliableMessages.push({
                id: data.ID,
                timestamp: /* @__PURE__ */ new Date(),
                expire: (/* @__PURE__ */ new Date()).getTime() + expireTime
              });
              callback(data.MESSAGE);
            } else {
            }
          } else {
            callback(data);
          }
        });
      }
    };
    geckosClient = (options = {}) => {
      const { authorization = void 0, iceServers = [], iceTransportPolicy = "all", label = "geckos.io", port = 9208, url = `${location.protocol}//${location.hostname}` } = options;
      return new ClientChannel(url, authorization, port, label, { iceServers, iceTransportPolicy });
    };
    channel_default = geckosClient;
  }
});

// node_modules/@geckos.io/client/lib/index.js
var lib_default;
var init_lib2 = __esm({
  "node_modules/@geckos.io/client/lib/index.js"() {
    init_channel();
    lib_default = channel_default;
  }
});

// client/transports/geckos.js
function connect2(opts) {
  _onMessage2 = opts && opts.onMessage;
  _onOpen2 = opts && opts.onOpen;
  _onClose2 = opts && opts.onClose;
  _closed = false;
  _channel = lib_default({
    url: location.protocol + "//" + location.host,
    // Default geckos signaling port is 9208 but we proxy through Caddy on
    // 443 by virtue of the URL routing — leave port unset so the library
    // uses the standard URL.
    port: null
  });
  const fireClose = (reason) => {
    if (_closed) return;
    _closed = true;
    if (_connectTimer) {
      clearTimeout(_connectTimer);
      _connectTimer = null;
    }
    if (_channel) {
      try {
        _channel.close();
      } catch (e) {
      }
      _channel = null;
    }
    if (reason) console.warn("[transport:geckos] " + reason);
    if (_onClose2) _onClose2();
  };
  _connectTimer = setTimeout(
    () => fireClose("connect timeout after " + CONNECT_TIMEOUT_MS + " ms"),
    CONNECT_TIMEOUT_MS
  );
  _channel.onConnect((err) => {
    if (_connectTimer) {
      clearTimeout(_connectTimer);
      _connectTimer = null;
    }
    if (err) {
      fireClose("onConnect error: " + (err && err.message));
      return;
    }
    if (_onOpen2) _onOpen2();
  });
  _channel.on(MSG_EVENT, (data) => {
    if (!_onMessage2) return;
    try {
      _onMessage2(data);
    } catch (err) {
    }
  });
  _channel.onRaw((data) => {
    if (!_onMessage2) return;
    try {
      const buf = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
      _onMessage2(decode(buf));
    } catch (err) {
    }
  });
  _channel.onDisconnect(() => fireClose(null));
}
function sendReliable2(msg) {
  if (!_channel) return;
  try {
    _channel.emit(MSG_EVENT, msg, RELIABLE_OPTS);
  } catch (e) {
  }
}
function sendUnreliable2(msg) {
  if (!_channel) return;
  try {
    _channel.emit(MSG_EVENT, msg);
  } catch (e) {
  }
}
function close2() {
  _closed = true;
  if (_connectTimer) {
    clearTimeout(_connectTimer);
    _connectTimer = null;
  }
  if (_channel) {
    try {
      _channel.close();
    } catch (e) {
    }
  }
  _channel = null;
}
var RELIABLE_OPTS, MSG_EVENT, CONNECT_TIMEOUT_MS, _channel, _onMessage2, _onOpen2, _onClose2, _connectTimer, _closed, geckos_default;
var init_geckos = __esm({
  "client/transports/geckos.js"() {
    init_lib2();
    init_dist();
    RELIABLE_OPTS = Object.freeze({ reliable: true, interval: 150, runs: 10 });
    MSG_EVENT = "msg";
    CONNECT_TIMEOUT_MS = 5e3;
    _channel = null;
    _onMessage2 = null;
    _onOpen2 = null;
    _onClose2 = null;
    _connectTimer = null;
    _closed = false;
    geckos_default = {
      connect: connect2,
      sendReliable: sendReliable2,
      sendUnreliable: sendUnreliable2,
      close: close2
    };
  }
});

// client/transport.js
var _params, _override, transportKind, userPickedTransport;
var init_transport = __esm({
  "client/transport.js"() {
    init_ws();
    init_geckos();
    _params = new URLSearchParams(location.search);
    _override = _params.get("transport");
    transportKind = _override === "ws" ? "ws" : "geckos";
    userPickedTransport = _params.has("transport");
    console.log("[transport] initial pick:", transportKind);
  }
});

// client/network.js
function setMessageHandler(fn) {
  msgHandler = fn;
}
function getTransportKind() {
  return _activeKind;
}
function _showStatus(text, color) {
  const ss = document.getElementById("serverStatus");
  if (ss) {
    ss.textContent = text;
    ss.style.color = color;
  }
}
function _showDisconnectOverlay() {
  let dc = document.getElementById("disconnectMsg");
  if (!dc) {
    dc = document.createElement("div");
    dc.id = "disconnectMsg";
    dc.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;background:rgba(0,0,0,0.8);padding:30px 50px;border-radius:12px;border:2px solid #ff4444;text-align:center;font-family:Segoe UI,sans-serif";
    dc.innerHTML = '<div style="color:#ff4444;font-size:24px;font-weight:bold;margin-bottom:8px">DISCONNECTED</div><div style="color:#aaa;font-size:14px">Reconnecting to meadow...</div>';
    document.body.appendChild(dc);
  }
  dc.style.display = "block";
}
function _hideDisconnectOverlay() {
  const dc = document.getElementById("disconnectMsg");
  if (dc) dc.style.display = "none";
}
function _scheduleReconnect() {
  if (_reconnectTimer) return;
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    connect3();
  }, RECONNECT_DELAY_MS);
}
function connect3() {
  if (_reconnectTimer) {
    clearTimeout(_reconnectTimer);
    _reconnectTimer = null;
  }
  _receivedSinceConnect = false;
  _active.connect({
    onOpen: () => {
      console.log("[transport] open via", _activeKind);
      _showStatus("\u2705 meadow online", "#88ff88");
      _hideDisconnectOverlay();
    },
    onMessage: (msg) => {
      _receivedSinceConnect = true;
      if (msgHandler) msgHandler(msg);
    },
    onClose: () => {
      if (_activeKind === "geckos" && !_receivedSinceConnect && !userPickedTransport) {
        console.warn("[transport] geckos failed to deliver any message \u2014 falling back to ws");
        _active = ws_default;
        _activeKind = "ws";
        _showStatus("\u26A0 falling back to ws", "#ffaa44");
        connect3();
        return;
      }
      _showStatus("\u274C meadow offline", "#ff6666");
      if (state_default.state === "join" || state_default.state === "lobby") _hideDisconnectOverlay();
      else _showDisconnectOverlay();
      _scheduleReconnect();
    }
  });
}
function closeActive() {
  try {
    _active.close();
  } catch (e) {
  }
}
function send(m) {
  if (!m) return;
  if (import_constants6.STATEFUL_INPUT_TYPES.has(m.type)) {
    m.seq = ++state_default.inputSeq;
    if (state_default.lastRecvSnapSeq >= 0) m.ackSnap = state_default.lastRecvSnapSeq;
  }
  if (UNRELIABLE_TYPES.has(m.type)) _active.sendUnreliable(m);
  else _active.sendReliable(m);
}
var import_constants6, UNRELIABLE_TYPES, RECONNECT_DELAY_MS, _active, _activeKind, _receivedSinceConnect, _reconnectTimer, msgHandler;
var init_network = __esm({
  "client/network.js"() {
    init_state();
    import_constants6 = __toESM(require_constants());
    init_transport();
    UNRELIABLE_TYPES = /* @__PURE__ */ new Set(["move"]);
    RECONNECT_DELAY_MS = 2e3;
    _active = transportKind === "geckos" ? geckos_default : ws_default;
    _activeKind = transportKind;
    _receivedSinceConnect = false;
    _reconnectTimer = null;
    msgHandler = null;
  }
});

// node_modules/@geckos.io/snapshot-interpolation/lib/vault.js
var require_vault = __commonJS({
  "node_modules/@geckos.io/snapshot-interpolation/lib/vault.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vault = void 0;
    var Vault = class {
      constructor() {
        this._vault = [];
        this._vaultSize = 120;
      }
      /** Get a Snapshot by its ID. */
      getById(id) {
        var _a;
        return (_a = this._vault.filter((snapshot) => snapshot.id === id)) === null || _a === void 0 ? void 0 : _a[0];
      }
      /** Clear this Vault */
      clear() {
        this._vault = [];
      }
      get(time, closest) {
        var _a;
        const sorted = this._vault.sort((a, b) => b.time - a.time);
        if (typeof time === "undefined")
          return sorted[0];
        for (let i = 0; i < sorted.length; i++) {
          const snap = sorted[i];
          if (snap.time <= time) {
            const snaps = { older: sorted[i], newer: sorted[i - 1] };
            if (closest) {
              const older = Math.abs(time - snaps.older.time);
              const newer = Math.abs(time - ((_a = snaps.newer) === null || _a === void 0 ? void 0 : _a.time));
              if (isNaN(newer))
                return snaps.older;
              else if (newer <= older)
                return snaps.older;
              else
                return snaps.newer;
            }
            return snaps;
          }
        }
        return;
      }
      /** Add a snapshot to the vault. */
      add(snapshot) {
        if (this._vault.length > this._vaultSize - 1) {
          this._vault.sort((a, b) => a.time - b.time).shift();
        }
        this._vault.push(snapshot);
      }
      /** Get the current capacity (size) of the vault. */
      get size() {
        return this._vault.length;
      }
      /** Set the max capacity (size) of the vault. */
      setMaxSize(size) {
        this._vaultSize = size;
      }
      /** Get the max capacity (size) of the vault. */
      getMaxSize() {
        return this._vaultSize;
      }
    };
    exports.Vault = Vault;
  }
});

// node_modules/@geckos.io/snapshot-interpolation/lib/lerp.js
var require_lerp = __commonJS({
  "node_modules/@geckos.io/snapshot-interpolation/lib/lerp.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.radianLerp = exports.degreeLerp = exports.lerp = void 0;
    var PI = 3.14159265359;
    var PI_TIMES_TWO = 6.28318530718;
    var lerp = (start, end, t) => {
      return start + (end - start) * t;
    };
    exports.lerp = lerp;
    var degreeLerp = (start, end, t) => {
      let result;
      let diff = end - start;
      if (diff < -180) {
        end += 360;
        result = (0, exports.lerp)(start, end, t);
        if (result >= 360) {
          result -= 360;
        }
      } else if (diff > 180) {
        end -= 360;
        result = (0, exports.lerp)(start, end, t);
        if (result < 0) {
          result += 360;
        }
      } else {
        result = (0, exports.lerp)(start, end, t);
      }
      return result;
    };
    exports.degreeLerp = degreeLerp;
    var radianLerp = (start, end, t) => {
      let result;
      let diff = end - start;
      if (diff < -PI) {
        end += PI_TIMES_TWO;
        result = (0, exports.lerp)(start, end, t);
        if (result >= PI_TIMES_TWO) {
          result -= PI_TIMES_TWO;
        }
      } else if (diff > PI) {
        end -= PI_TIMES_TWO;
        result = (0, exports.lerp)(start, end, t);
        if (result < 0) {
          result += PI_TIMES_TWO;
        }
      } else {
        result = (0, exports.lerp)(start, end, t);
      }
      return result;
    };
    exports.radianLerp = radianLerp;
  }
});

// node_modules/@geckos.io/snapshot-interpolation/lib/slerp.js
var require_slerp = __commonJS({
  "node_modules/@geckos.io/snapshot-interpolation/lib/slerp.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.quatSlerp = void 0;
    var quatSlerp = (qa, qb, t) => {
      if (t === 0)
        return qa;
      if (t === 1)
        return qb;
      let x0 = qa.x;
      let y0 = qa.y;
      let z0 = qa.z;
      let w0 = qa.w;
      const x1 = qb.x;
      const y1 = qb.y;
      const z1 = qb.z;
      const w1 = qb.w;
      if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
        let s = 1 - t;
        const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
        const dir = cos >= 0 ? 1 : -1;
        const sqrSin = 1 - cos * cos;
        if (sqrSin > 1e-3) {
          const sin = Math.sqrt(sqrSin);
          const len = Math.atan2(sin, cos * dir);
          s = Math.sin(s * len) / sin;
          t = Math.sin(t * len) / sin;
        }
        const tDir = t * dir;
        x0 = x0 * s + x1 * tDir;
        y0 = y0 * s + y1 * tDir;
        z0 = z0 * s + z1 * tDir;
        w0 = w0 * s + w1 * tDir;
        if (s === 1 - t) {
          const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
          x0 *= f;
          y0 *= f;
          z0 *= f;
          w0 *= f;
        }
      }
      return { x: x0, y: y0, z: z0, w: w0 };
    };
    exports.quatSlerp = quatSlerp;
  }
});

// node_modules/@geckos.io/snapshot-interpolation/lib/snapshot-interpolation.js
var require_snapshot_interpolation = __commonJS({
  "node_modules/@geckos.io/snapshot-interpolation/lib/snapshot-interpolation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnapshotInterpolation = void 0;
    var vault_1 = require_vault();
    var lerp_1 = require_lerp();
    var slerp_1 = require_slerp();
    var SnapshotInterpolation2 = class _SnapshotInterpolation {
      constructor(serverFPS, config = {}) {
        this.vault = new vault_1.Vault();
        this._interpolationBuffer = 100;
        this._timeOffset = -1;
        this.serverTime = 0;
        if (serverFPS)
          this._interpolationBuffer = 1e3 / serverFPS * 3;
        this.config = { autoCorrectTimeOffset: true, ...config };
      }
      get interpolationBuffer() {
        return {
          /** Get the Interpolation Buffer time in milliseconds. */
          get: () => this._interpolationBuffer,
          /** Set the Interpolation Buffer time in milliseconds. */
          set: (milliseconds) => {
            this._interpolationBuffer = milliseconds;
          }
        };
      }
      /** Get the current time in milliseconds. */
      static Now() {
        return Date.now();
      }
      /**
       * Get the time offset between client and server (inclusive latency).
       * If the client and server time are in sync, timeOffset will be the latency.
       */
      get timeOffset() {
        return this._timeOffset;
      }
      /** Create a new ID */
      static NewId() {
        return Math.random().toString(36).substr(2, 6);
      }
      get snapshot() {
        return {
          /** Create the snapshot on the server. */
          create: (state) => _SnapshotInterpolation.CreateSnapshot(state),
          /** Add the snapshot you received from the server to automatically calculate the interpolation with calcInterpolation() */
          add: (snapshot) => this.addSnapshot(snapshot)
        };
      }
      /** Create a new Snapshot */
      static CreateSnapshot(state) {
        const check = (state2) => {
          if (!Array.isArray(state2))
            throw new Error("You have to pass an Array to createSnapshot()");
          const withoutID = state2.filter((e) => typeof e.id !== "string" && typeof e.id !== "number");
          if (withoutID.length > 0)
            throw new Error("Each Entity needs to have a id");
        };
        if (Array.isArray(state)) {
          check(state);
        } else {
          Object.keys(state).forEach((key) => {
            check(state[key]);
          });
        }
        return {
          id: _SnapshotInterpolation.NewId(),
          time: _SnapshotInterpolation.Now(),
          state
        };
      }
      addSnapshot(snapshot) {
        var _a;
        const timeNow = _SnapshotInterpolation.Now();
        const timeSnapshot = snapshot.time;
        if (this._timeOffset === -1) {
          this._timeOffset = timeNow - timeSnapshot;
        }
        if (((_a = this.config) === null || _a === void 0 ? void 0 : _a.autoCorrectTimeOffset) === true) {
          const timeOffset = timeNow - timeSnapshot;
          const timeDifference = Math.abs(this._timeOffset - timeOffset);
          if (timeDifference > 50)
            this._timeOffset = timeOffset;
        }
        this.vault.add(snapshot);
      }
      /** Interpolate between two snapshots give the percentage or time. */
      interpolate(snapshotA, snapshotB, timeOrPercentage, parameters, deep = "") {
        return this._interpolate(snapshotA, snapshotB, timeOrPercentage, parameters, deep);
      }
      _interpolate(snapshotA, snapshotB, timeOrPercentage, parameters, deep) {
        const sorted = [snapshotA, snapshotB].sort((a, b) => b.time - a.time);
        const params = parameters.trim().replace(/\W+/, " ").split(" ");
        const newer = sorted[0];
        const older = sorted[1];
        const t0 = newer.time;
        const t1 = older.time;
        const tn = timeOrPercentage;
        const zeroPercent = tn - t1;
        const hundredPercent = t0 - t1;
        const pPercent = timeOrPercentage <= 1 ? timeOrPercentage : zeroPercent / hundredPercent;
        this.serverTime = (0, lerp_1.lerp)(t1, t0, pPercent);
        const lerpFnc = (method, start, end, t) => {
          if (typeof start === "undefined" || typeof end === "undefined")
            return;
          if (typeof start === "string" || typeof end === "string")
            throw new Error(`Can't interpolate string!`);
          if (typeof start === "number" && typeof end === "number") {
            if (method === "linear")
              return (0, lerp_1.lerp)(start, end, t);
            else if (method === "deg")
              return (0, lerp_1.degreeLerp)(start, end, t);
            else if (method === "rad")
              return (0, lerp_1.radianLerp)(start, end, t);
          }
          if (typeof start === "object" && typeof end === "object") {
            if (method === "quat")
              return (0, slerp_1.quatSlerp)(start, end, t);
          }
          throw new Error(`No lerp method "${method}" found!`);
        };
        if (!Array.isArray(newer.state) && deep === "")
          throw new Error('You forgot to add the "deep" parameter.');
        if (Array.isArray(newer.state) && deep !== "")
          throw new Error('No "deep" needed it state is an array.');
        const newerState = Array.isArray(newer.state) ? newer.state : newer.state[deep];
        const olderState = Array.isArray(older.state) ? older.state : older.state[deep];
        let tmpSnapshot = JSON.parse(JSON.stringify({ ...newer, state: newerState }));
        newerState.forEach((e, i) => {
          const id = e.id;
          const other = olderState.find((e2) => e2.id === id);
          if (!other)
            return;
          params.forEach((p) => {
            const match = p.match(/\w\(([\w]+)\)/);
            const lerpMethod = match ? match === null || match === void 0 ? void 0 : match[1] : "linear";
            if (match)
              p = match === null || match === void 0 ? void 0 : match[0].replace(/\([\S]+$/gm, "");
            const p0 = e === null || e === void 0 ? void 0 : e[p];
            const p1 = other === null || other === void 0 ? void 0 : other[p];
            const pn = lerpFnc(lerpMethod, p1, p0, pPercent);
            if (Array.isArray(tmpSnapshot.state))
              tmpSnapshot.state[i][p] = pn;
          });
        });
        const interpolatedSnapshot = {
          state: tmpSnapshot.state,
          percentage: pPercent,
          newer: newer.id,
          older: older.id
        };
        return interpolatedSnapshot;
      }
      /** Get the calculated interpolation on the client. */
      calcInterpolation(parameters, deep = "") {
        const serverTime = _SnapshotInterpolation.Now() - this._timeOffset - this._interpolationBuffer;
        const shots = this.vault.get(serverTime);
        if (!shots)
          return;
        const { older, newer } = shots;
        if (!older || !newer)
          return;
        return this._interpolate(newer, older, serverTime, parameters, deep);
      }
    };
    exports.SnapshotInterpolation = SnapshotInterpolation2;
  }
});

// node_modules/@geckos.io/snapshot-interpolation/lib/types.js
var require_types = __commonJS({
  "node_modules/@geckos.io/snapshot-interpolation/lib/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@geckos.io/snapshot-interpolation/lib/index.js
var require_lib = __commonJS({
  "node_modules/@geckos.io/snapshot-interpolation/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Types = exports.Vault = exports.SnapshotInterpolation = void 0;
    var snapshot_interpolation_1 = require_snapshot_interpolation();
    Object.defineProperty(exports, "SnapshotInterpolation", { enumerable: true, get: function() {
      return snapshot_interpolation_1.SnapshotInterpolation;
    } });
    var vault_1 = require_vault();
    Object.defineProperty(exports, "Vault", { enumerable: true, get: function() {
      return vault_1.Vault;
    } });
    exports.Types = __importStar(require_types());
  }
});

// client/snapshot.js
function addSnapshot(snapshot) {
  SI.snapshot.add(snapshot);
}
function getServerTime() {
  return SI.serverTime;
}
function clearSnapshots() {
  SI.vault.clear();
  _interpMap = null;
}
function updateInterpolation(frameId) {
  if (frameId === _interpCacheFrame) return;
  _interpCacheFrame = frameId;
  const result = SI.calcInterpolation("x y z aimAngle(rad)");
  if (result && result.state) {
    _interpMap = /* @__PURE__ */ new Map();
    for (const e of result.state) _interpMap.set(e.id, e);
  } else {
    _interpMap = null;
  }
}
function getInterpolatedEntity(p) {
  if (_interpMap) {
    const e = _interpMap.get(p.id);
    if (e) return { x: e.x, y: e.y, z: e.z || 0, aim: e.aimAngle || 0 };
  }
  return { x: p.x, y: p.y, z: p.z || 0, aim: p.aimAngle || 0 };
}
var import_snapshot_interpolation, SI, _interpMap, _interpCacheFrame;
var init_snapshot = __esm({
  "client/snapshot.js"() {
    import_snapshot_interpolation = __toESM(require_lib());
    SI = new import_snapshot_interpolation.SnapshotInterpolation(40);
    _interpMap = null;
    _interpCacheFrame = -1;
  }
});

// client/input.js
import * as THREE4 from "three";
function setVmGroupRef(getter) {
  vmGroupRef = getter;
}
function doAttack() {
  if (state_default.me && state_default.me.weapon === "knife") {
    send({ type: "meleeAttack" });
    return;
  }
  _inputDir.set(0, 0, -1).applyQuaternion(cam.quaternion);
  send({
    type: "attack",
    aimX: _inputDir.x,
    aimY: _inputDir.z,
    aimZ: _inputDir.y,
    fireMode: state_default.fireMode,
    serverTime: getServerTime(),
    // Camera position for hitscan ray origin — matches what the player sees
    camX: cam.position.x,
    camY: cam.position.z,
    camZ: cam.position.y
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
function clampFireMode(wep) {
  const supported = FIRE_MODES[wep];
  if (supported && !supported.includes(state_default.fireMode)) {
    state_default.fireMode = supported[0];
    stopAutoFire();
  }
}
function getAutoFireInterval() {
  return 50;
}
function autoFireLoop() {
  if (!autoFireActive) return;
  if (!mouseDown || state_default.state !== "playing" || !state_default.locked) {
    stopAutoFire();
    return;
  }
  const me = state_default.me;
  const AUTO_WEAPONS_SET = /* @__PURE__ */ new Set(["thompson", "m249", "minigun"]);
  if (!me || !me.alive || !import_constants7.BURST_FAMILY.has(me.weapon) && !AUTO_WEAPONS_SET.has(me.weapon)) {
    stopAutoFire();
    return;
  }
  const now = performance.now();
  if (now >= nextFireTime) {
    doAttack();
    nextFireTime = now + getAutoFireInterval();
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
var import_constants7, isMobile, vmGroupRef, _inputDir, FIRE_MODES, mouseDown, autoFireActive, nextFireTime, chatInput, chatInputWrap;
var init_input = __esm({
  "client/input.js"() {
    init_state();
    init_renderer();
    init_audio();
    init_network();
    init_snapshot();
    import_constants7 = __toESM(require_constants());
    isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    vmGroupRef = null;
    _inputDir = new THREE4.Vector3();
    FIRE_MODES = {
      burst: ["auto", "burst", "semi"],
      aug: ["auto", "burst", "semi"],
      mp5k: ["auto", "burst"],
      akm: ["auto", "semi"],
      thompson: ["auto"]
    };
    state_default.fireMode = "auto";
    mouseDown = false;
    autoFireActive = false;
    nextFireTime = 0;
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
      const AUTO_WEAPONS = /* @__PURE__ */ new Set(["thompson", "m249", "minigun"]);
      if (import_constants7.BURST_FAMILY.has(me.weapon) && state_default.fireMode === "auto" || AUTO_WEAPONS.has(me.weapon)) {
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
        if (me && me.alive && me.weapon === "minigun") {
          send({ type: "minigunSpin", spinning: true });
          return;
        }
        if (me && me.alive && (me.weapon === "bolty" || me.weapon === "aug") && !state_default._boltRacking && !me.reloading) {
          state_default.adsActive = true;
          cam.fov = me.weapon === "aug" ? 37.5 : 12.5;
          cam.updateProjectionMatrix();
          const overlayId = me.weapon === "aug" ? "augScopeOverlay" : "scopeOverlay";
          document.getElementById(overlayId).style.display = "block";
          document.getElementById("crosshair").style.display = "none";
          const vg = vmGroupRef && vmGroupRef();
          if (vg) vg.visible = false;
        }
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        const me = state_default.me;
        if (me && me.alive && me.weapon === "minigun") {
          send({ type: "minigunSpin", spinning: false });
        }
        if (state_default.adsLocked) return;
        state_default.adsActive = false;
        cam.fov = 75;
        cam.updateProjectionMatrix();
        document.getElementById("scopeOverlay").style.display = "none";
        document.getElementById("augScopeOverlay").style.display = "none";
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
      }, touchAutoLoop = function() {
        if (!_touchFiring) return;
        const me = state_default.me;
        if (!me || !me.alive) {
          _touchFiring = false;
          return;
        }
        const now = performance.now();
        if (now >= nextFireTime) {
          doAttack();
          nextFireTime = now + getAutoFireInterval();
        }
        requestAnimationFrame(touchAutoLoop);
      };
      document.getElementById("touchDpad").style.display = "block";
      document.getElementById("touchShoot").style.display = "block";
      document.getElementById("touchDash").style.display = "block";
      const _mobileEls = ["touchReload", "touchFireMode", "touchADS", "touchDebug", "touchDrop"];
      _mobileEls.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "block";
      });
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
      const _mobFwd = new THREE4.Vector3();
      const _mobRight = new THREE4.Vector3();
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
      let _touchFiring = false;
      const shootBtn = document.getElementById("touchShoot");
      shootBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        doAttack();
        _touchFiring = true;
        if (nextFireTime < performance.now()) nextFireTime = performance.now() + getAutoFireInterval();
        touchAutoLoop();
      }, { passive: false });
      shootBtn.addEventListener("touchend", (e) => {
        _touchFiring = false;
      }, { passive: true });
      shootBtn.addEventListener("touchcancel", (e) => {
        _touchFiring = false;
      }, { passive: true });
      document.getElementById("touchDash").addEventListener("touchstart", (e) => {
        e.preventDefault();
        doDash();
      }, { passive: false });
      const touchReload = document.getElementById("touchReload");
      if (touchReload) touchReload.addEventListener("touchstart", (e) => {
        e.preventDefault();
        send({ type: "reload" });
        if (state_default.adsActive) {
          state_default.adsActive = false;
          state_default.adsLocked = false;
          cam.fov = 75;
          cam.updateProjectionMatrix();
          document.getElementById("scopeOverlay").style.display = "none";
          document.getElementById("augScopeOverlay").style.display = "none";
          document.getElementById("crosshair").style.display = "block";
          const vg = vmGroupRef && vmGroupRef();
          if (vg) vg.visible = true;
        }
      }, { passive: false });
      const touchFireMode = document.getElementById("touchFireMode");
      if (touchFireMode) touchFireMode.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const myWep = state_default.me ? state_default.me.weapon : "";
        const supported = FIRE_MODES[myWep];
        if (supported && supported.length > 1) {
          clampFireMode(myWep);
          const idx = supported.indexOf(state_default.fireMode);
          state_default.fireMode = supported[(idx + 1) % supported.length];
          stopAutoFire();
        }
      }, { passive: false });
      const touchADS = document.getElementById("touchADS");
      if (touchADS) {
        touchADS.addEventListener("touchstart", (e) => {
          e.preventDefault();
          const me = state_default.me;
          if (!me || !me.alive) return;
          if (state_default._boltRacking || me.reloading) return;
          if (state_default.adsActive) {
            if (state_default.adsLocked) return;
            state_default.adsActive = false;
            cam.fov = 75;
            cam.updateProjectionMatrix();
            document.getElementById("scopeOverlay").style.display = "none";
            document.getElementById("augScopeOverlay").style.display = "none";
            document.getElementById("crosshair").style.display = "block";
            const vg = vmGroupRef && vmGroupRef();
            if (vg) vg.visible = true;
          } else if (me.weapon === "bolty" || me.weapon === "aug") {
            state_default.adsActive = true;
            cam.fov = me.weapon === "aug" ? 37.5 : 12.5;
            cam.updateProjectionMatrix();
            const overlayId = me.weapon === "aug" ? "augScopeOverlay" : "scopeOverlay";
            document.getElementById(overlayId).style.display = "block";
            document.getElementById("crosshair").style.display = "none";
            const vg = vmGroupRef && vmGroupRef();
            if (vg) vg.visible = false;
          }
        }, { passive: false });
      }
      const touchDrop = document.getElementById("touchDrop");
      if (touchDrop) touchDrop.addEventListener("touchstart", (e) => {
        e.preventDefault();
        send({ type: "dropWeapon" });
      }, { passive: false });
      const touchDebug = document.getElementById("touchDebug");
      if (touchDebug) touchDebug.addEventListener("touchstart", (e) => {
        e.preventDefault();
        state_default.debugMode = !state_default.debugMode;
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
      if (e.code === "KeyQ" && state_default.state === "playing") send({ type: "dropWeapon" });
      if (e.code === "KeyV" && !e.repeat && state_default.state === "playing" && state_default.me && state_default.me.alive) send({ type: "moo" });
      if (e.code === "KeyF" && state_default.state === "playing" && state_default.mePredicted) {
        if (state_default.mePredicted.weapon === "knife") {
          state_default.mePredicted.weapon = state_default.localPrimaryWeapon || (state_default.me && state_default.me.weapon !== "knife" ? state_default.me.weapon : "normal");
          send({ type: "switchWeapon", to: "primary" });
        } else {
          state_default.localPrimaryWeapon = state_default.mePredicted.weapon;
          state_default.mePredicted.weapon = "knife";
          send({ type: "switchWeapon", to: "knife" });
        }
      }
      if (e.code === "KeyP") {
        state_default.debugMode = !state_default.debugMode;
      }
      if (e.code === "KeyH" && state_default.state === "playing") {
        state_default.cameraMode = state_default.cameraMode === "third" ? "first" : "third";
      }
      if (e.code === "KeyO") {
        toggleFullscreen();
      }
      if (e.code === "KeyR" && state_default.state === "playing") {
        send({ type: "reload" });
        if (state_default.adsActive) {
          state_default.adsActive = false;
          state_default.adsLocked = false;
          cam.fov = 75;
          cam.updateProjectionMatrix();
          document.getElementById("scopeOverlay").style.display = "none";
          document.getElementById("augScopeOverlay").style.display = "none";
          document.getElementById("crosshair").style.display = "block";
          const vg = vmGroupRef && vmGroupRef();
          if (vg) vg.visible = true;
        }
      }
      if (e.code === "KeyX" && state_default.state === "playing") {
        const myWep = state_default.me ? state_default.me.weapon : "";
        const supported = FIRE_MODES[myWep];
        if (supported && supported.length > 1) {
          clampFireMode(myWep);
          const idx = supported.indexOf(state_default.fireMode);
          state_default.fireMode = supported[(idx + 1) % supported.length];
          stopAutoFire();
          const wepLabel = { mp5k: "MP5K", aug: "AUG", akm: "AK" }[myWep] || "M16A2";
          state_default.chatLog.push({ name: "", color: "", text: wepLabel + ": " + state_default.fireMode.toUpperCase() + " mode", t: 2, system: true });
          if (state_default.chatLog.length > 10) state_default.chatLog.shift();
        }
      }
      if (e.code === "KeyC" && !e.repeat && state_default.state === "playing") {
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
var fullscreenBtn, _nightCheckEl, COW_NAMES, _nameIdx, randomBtn, debugBtn;
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
      const smv = localStorage.getItem("cowMusicVol3d");
      if (smv) {
        document.getElementById("musicVolSlider").value = smv;
        document.getElementById("musicVolLbl").textContent = smv + "%";
      }
    } catch (e) {
    }
    state_default.musicVol = parseFloat(document.getElementById("musicVolSlider").value) / 100;
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
    document.getElementById("musicVolSlider").addEventListener("input", (e) => {
      state_default.musicVol = e.target.value / 100;
      document.getElementById("musicVolLbl").textContent = e.target.value + "%";
      try {
        localStorage.setItem("cowMusicVol3d", e.target.value);
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
      if (!state_default.myId) {
        const n = document.getElementById("nameIn").value.trim() || COW_NAMES[Math.floor(Math.random() * COW_NAMES.length)];
        document.getElementById("nameIn").value = n;
        try {
          localStorage.setItem("cowName3d", n);
        } catch (e) {
        }
        send({ type: "join", name: n });
        return;
      }
      send({ type: "ready" });
    });
    debugBtn = document.getElementById("debugBtn");
    if (debugBtn) debugBtn.addEventListener("click", () => {
      if (state_default.myId) return;
      const n = document.getElementById("nameIn").value.trim() || COW_NAMES[Math.floor(Math.random() * COW_NAMES.length)];
      document.getElementById("nameIn").value = n;
      try {
        localStorage.setItem("cowName3d", n);
      } catch (e) {
      }
      send({ type: "debugJoin", name: n });
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
import * as THREE5 from "three";
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
    fbxLoadingManager = new THREE5.LoadingManager();
    fbxLoadingManager.setURLModifier((url) => {
      if (/\.(png|jpe?g|tga|bmp)(\?|$)/i.test(url)) return _BLANK_PNG;
      return url;
    });
  }
});

// client/particles.js
import * as THREE6 from "three";
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
  const mat = new THREE6.MeshBasicMaterial({ transparent: true });
  const mesh = new THREE6.Mesh(PGEO_SPHERE_LO, mat);
  return { mesh, mat };
}
function spawnParticle(opts) {
  if (_active2.length >= MAX_ACTIVE_PARTICLES) {
    const old = _active2.shift();
    releaseEntry(old.entry);
  }
  const entry = borrowEntry();
  entry.mesh.geometry = opts.geo || PGEO_SPHERE_LO;
  entry.mat.color.setHex(opts.color != null ? opts.color : 16777215);
  entry.mat.opacity = opts.peakOpacity != null ? opts.peakOpacity : 1;
  entry.mat.side = opts.side || THREE6.FrontSide;
  entry.mesh.position.set(opts.x, opts.y, opts.z);
  entry.mesh.scale.set(opts.sx || 1, opts.sy || opts.sx || 1, opts.sz || opts.sx || 1);
  entry.mesh.rotation.set(opts.rotX || 0, opts.rotY || 0, opts.rotZ || 0);
  scene.add(entry.mesh);
  _active2.push({
    entry,
    life: opts.life,
    lifeMax: opts.life,
    vx: opts.vx || 0,
    vy: opts.vy || 0,
    vz: opts.vz || 0,
    gy: opts.gy || 0,
    growth: opts.growth || 0,
    peakOpacity: opts.peakOpacity != null ? opts.peakOpacity : 1,
    noFade: !!opts.noFade,
    rotVx: opts.rotVx || 0,
    rotVz: opts.rotVz || 0
  });
}
function updateParticles(dt) {
  for (let i = _active2.length - 1; i >= 0; i--) {
    const p = _active2[i];
    p.life -= dt;
    if (p.life <= 0) {
      releaseEntry(p.entry);
      _active2.splice(i, 1);
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
    if (!p.noFade) p.entry.mat.opacity = Math.max(0, p.peakOpacity * (p.life / p.lifeMax));
  }
}
function clearParticles() {
  for (const p of _active2) releaseEntry(p.entry);
  _active2.length = 0;
  while (_freePool.length > MAX_FREE_POOL) _freePool.pop().mat.dispose();
}
var PGEO_SPHERE_LO, PGEO_SPHERE_MED, PGEO_BOX, PGEO_TORUS, MAX_FREE_POOL, MAX_ACTIVE_PARTICLES, _freePool, _active2;
var init_particles = __esm({
  "client/particles.js"() {
    init_renderer();
    init_three_utils();
    PGEO_SPHERE_LO = markSharedGeometry(new THREE6.SphereGeometry(1, 4, 4));
    PGEO_SPHERE_MED = markSharedGeometry(new THREE6.SphereGeometry(1, 6, 6));
    PGEO_BOX = markSharedGeometry(new THREE6.BoxGeometry(1, 1, 1));
    PGEO_TORUS = markSharedGeometry(new THREE6.TorusGeometry(1, 0.1, 4, 16));
    MAX_FREE_POOL = 600;
    MAX_ACTIVE_PARTICLES = 600;
    _freePool = [];
    _active2 = [];
  }
});

// client/entities.js
import * as THREE7 from "three";
function getCowBodyMat(colorHex) {
  let mat = _cowBodyMats.get(colorHex);
  if (!mat) {
    mat = new THREE7.MeshLambertMaterial({ color: colorHex });
    markSharedMaterial(mat);
    _cowBodyMats.set(colorHex, mat);
  }
  return mat;
}
function _buildCowboyHatTemplate() {
  const g = new THREE7.Group();
  const hatBrown = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 6961690 }));
  const hatBand = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 3807752 }));
  const brimGeo = markSharedGeometry(new THREE7.CylinderGeometry(8, 8, 0.8, 16));
  const crownGeo = markSharedGeometry(new THREE7.CylinderGeometry(4, 4.5, 4, 12));
  const bandGeo = markSharedGeometry(new THREE7.CylinderGeometry(4.6, 4.6, 0.8, 12));
  const topGeo = markSharedGeometry(new THREE7.CylinderGeometry(4, 4, 0.4, 12));
  const brim = new THREE7.Mesh(brimGeo, hatBrown);
  brim.position.y = 38.5;
  g.add(brim);
  const crown = new THREE7.Mesh(crownGeo, hatBrown);
  crown.position.y = 41;
  g.add(crown);
  const band = new THREE7.Mesh(bandGeo, hatBand);
  band.position.y = 39.5;
  g.add(band);
  const top = new THREE7.Mesh(topGeo, hatBrown);
  top.position.y = 43;
  g.add(top);
  return g;
}
function _buildWizardHatTemplate() {
  const g = new THREE7.Group();
  const purpleMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 6955673 }));
  const brownBand = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 6961690 }));
  const yellowMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16768256 }));
  const wizBrimGeo = markSharedGeometry(new THREE7.CylinderGeometry(7, 7, 0.6, 16));
  const wizConeGeo = markSharedGeometry(new THREE7.ConeGeometry(5, 14, 12));
  const wizBandGeo = markSharedGeometry(new THREE7.CylinderGeometry(5.2, 5.2, 1, 12));
  const buckleGeo = markSharedGeometry(new THREE7.BoxGeometry(2, 1.5, 0.5));
  const wizBrim = new THREE7.Mesh(wizBrimGeo, purpleMat);
  wizBrim.position.y = 38.5;
  g.add(wizBrim);
  const wizCone = new THREE7.Mesh(wizConeGeo, purpleMat);
  wizCone.position.y = 46;
  g.add(wizCone);
  const wizBand = new THREE7.Mesh(wizBandGeo, brownBand);
  wizBand.position.y = 39.5;
  g.add(wizBand);
  const buckle = new THREE7.Mesh(buckleGeo, yellowMat);
  buckle.position.set(0, 39.5, 5.3);
  g.add(buckle);
  return g;
}
function _buildCrownHatTemplate() {
  const g = new THREE7.Group();
  const goldMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16768256 }));
  const baseGeo = markSharedGeometry(new THREE7.CylinderGeometry(5, 5, 3, 12));
  const spikeGeo = markSharedGeometry(new THREE7.ConeGeometry(0.8, 3.5, 6));
  const jewelGeo = markSharedGeometry(new THREE7.OctahedronGeometry(0.7, 0));
  const bigJewelGeo = markSharedGeometry(new THREE7.OctahedronGeometry(1.2, 0));
  const jewelColors = [16720418, 2293538, 2237183, 16720639, 16776994];
  const jewelMats = jewelColors.map((col) => markSharedMaterial(new THREE7.MeshLambertMaterial({ color: col })));
  const bigJewelMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16720452 }));
  const base = new THREE7.Mesh(baseGeo, goldMat);
  base.position.y = 39;
  g.add(base);
  for (let pi = 0; pi < 6; pi++) {
    const ang = pi / 6 * Math.PI * 2;
    const spike = new THREE7.Mesh(spikeGeo, goldMat);
    spike.position.set(Math.cos(ang) * 4.5, 42, Math.sin(ang) * 4.5);
    g.add(spike);
    const jewel = new THREE7.Mesh(jewelGeo, jewelMats[pi % jewelMats.length]);
    jewel.position.set(Math.cos(ang) * 4.5, 44.5, Math.sin(ang) * 4.5);
    g.add(jewel);
  }
  const bigJewel = new THREE7.Mesh(bigJewelGeo, bigJewelMat);
  bigJewel.position.set(0, 39, 5);
  g.add(bigJewel);
  return g;
}
function _buildCapHatTemplate() {
  const g = new THREE7.Group();
  const capColor = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 2245802 }));
  const domeGeo = markSharedGeometry(new THREE7.SphereGeometry(5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2));
  const visorGeo = markSharedGeometry(new THREE7.BoxGeometry(8, 0.5, 5));
  const btnGeo = markSharedGeometry(new THREE7.SphereGeometry(0.6, 6, 6));
  const dome = new THREE7.Mesh(domeGeo, capColor);
  dome.position.y = 39;
  g.add(dome);
  const visor = new THREE7.Mesh(visorGeo, capColor);
  visor.position.set(0, 39, 5);
  g.add(visor);
  const btn = new THREE7.Mesh(btnGeo, capColor);
  btn.position.y = 44;
  g.add(btn);
  return g;
}
function _buildPartyHatTemplate() {
  const g = new THREE7.Group();
  const partyMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16729258 }));
  const partyConeGeo = markSharedGeometry(new THREE7.ConeGeometry(4, 12, 12));
  const spotGeo = markSharedGeometry(new THREE7.SphereGeometry(0.6, 6, 6));
  const pomGeo = markSharedGeometry(new THREE7.SphereGeometry(1.2, 6, 6));
  const pomMat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16777215 }));
  const spotColors = [16768324, 4521949, 4513279, 14548804];
  const spotMats = spotColors.map((col) => markSharedMaterial(new THREE7.MeshLambertMaterial({ color: col })));
  const partyCone = new THREE7.Mesh(partyConeGeo, partyMat);
  partyCone.position.y = 44;
  g.add(partyCone);
  for (let si = 0; si < 8; si++) {
    const spot = new THREE7.Mesh(spotGeo, spotMats[si % spotMats.length]);
    const ang = si / 8 * Math.PI * 2;
    const sy = 40 + si % 3 * 2.5;
    const sr = 3.5 - si % 3 * 0.7;
    spot.position.set(Math.cos(ang) * sr, sy, Math.sin(ang) * sr);
    g.add(spot);
  }
  const pom = new THREE7.Mesh(pomGeo, pomMat);
  pom.position.y = 50.5;
  g.add(pom);
  return g;
}
function _randomHairColor() {
  const t = Math.random() * 0.6;
  const r = Math.floor(40 + t * 140);
  const g = Math.floor(25 + t * 90);
  const b = Math.floor(15 + t * 50);
  return r << 16 | g << 8 | b;
}
function _buildPompadourTemplate() {
  const g = new THREE7.Group();
  const col = _randomHairColor();
  const mat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: col }));
  const base = new THREE7.Mesh(markSharedGeometry(new THREE7.SphereGeometry(5.5, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2)), mat);
  base.position.y = 38;
  g.add(base);
  const pomp = new THREE7.Mesh(markSharedGeometry(new THREE7.BoxGeometry(7, 6, 5)), mat);
  pomp.position.set(0, 43, 2);
  pomp.rotation.x = -0.3;
  g.add(pomp);
  const curl = new THREE7.Mesh(markSharedGeometry(new THREE7.SphereGeometry(3, 8, 6)), mat);
  curl.position.set(0, 45, 5);
  g.add(curl);
  return g;
}
function _buildAfroTemplate() {
  const g = new THREE7.Group();
  const col = _randomHairColor();
  const mat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: col }));
  const afro = new THREE7.Mesh(markSharedGeometry(new THREE7.SphereGeometry(9, 10, 8)), mat);
  afro.position.y = 42;
  g.add(afro);
  return g;
}
function _buildMohawkTemplate() {
  const g = new THREE7.Group();
  const col = _randomHairColor();
  const mat = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: col }));
  for (let i = 0; i < 5; i++) {
    const spike = new THREE7.Mesh(markSharedGeometry(new THREE7.BoxGeometry(1.5, 5 + Math.random() * 3, 2.5)), mat);
    spike.position.set(0, 42 + i * 0.5, -3 + i * 2);
    g.add(spike);
  }
  return g;
}
function cloneHat(type) {
  const tpl = _HAT_TEMPLATES[type] || _HAT_TEMPLATES.party;
  return tpl.clone(true);
}
function buildCow(color, personality) {
  const c = COL[color] || 16746666;
  const bodyMat = getCowBodyMat(c);
  const g = new THREE7.Group();
  const torso = new THREE7.Mesh(COW_GEO.torso, bodyMat);
  torso.position.set(0, 18, 0);
  torso.castShadow = true;
  g.add(torso);
  const s1 = new THREE7.Mesh(COW_GEO.spotLarge, COW_SPOT_MAT);
  s1.position.set(-7.1, 20, 0);
  s1.rotation.y = -Math.PI / 2;
  g.add(s1);
  const s2 = new THREE7.Mesh(COW_GEO.spotLarge, COW_SPOT_MAT);
  s2.position.set(7.1, 16, -1);
  s2.rotation.y = Math.PI / 2;
  g.add(s2);
  const s3 = new THREE7.Mesh(COW_GEO.spot25, COW_SPOT_MAT);
  s3.position.set(0, 27.1, 1);
  s3.rotation.x = -Math.PI / 2;
  g.add(s3);
  const s4 = new THREE7.Mesh(COW_GEO.spot22, COW_SPOT_MAT);
  s4.position.set(-2.5, 22, 5.1);
  g.add(s4);
  const s5 = new THREE7.Mesh(COW_GEO.spot16, COW_SPOT_MAT);
  s5.position.set(3, 15, 5.1);
  g.add(s5);
  const s6 = new THREE7.Mesh(COW_GEO.spot24, COW_SPOT_MAT);
  s6.position.set(2, 19, -5.1);
  s6.rotation.y = Math.PI;
  g.add(s6);
  const s7 = new THREE7.Mesh(COW_GEO.spot18, COW_SPOT_MAT);
  s7.position.set(-3, 24, -5.1);
  s7.rotation.y = Math.PI;
  g.add(s7);
  const head = new THREE7.Mesh(COW_GEO.head, bodyMat);
  head.position.set(0, 33, 0);
  head.castShadow = true;
  g.add(head);
  const e1 = new THREE7.Mesh(COW_GEO.eye, COW_EYE_MAT);
  e1.position.set(-3, 35, 5);
  g.add(e1);
  const e2 = new THREE7.Mesh(COW_GEO.eye, COW_EYE_MAT);
  e2.position.set(3, 35, 5);
  g.add(e2);
  const p1 = new THREE7.Mesh(COW_GEO.pupil, COW_PUPIL_MAT);
  p1.position.set(-3, 35, 6.5);
  g.add(p1);
  const p2 = new THREE7.Mesh(COW_GEO.pupil, COW_PUPIL_MAT);
  p2.position.set(3, 35, 6.5);
  g.add(p2);
  if (personality === "aggressive") {
    const brow1 = new THREE7.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow1.position.set(-3, 37, 5.5);
    brow1.rotation.z = -0.4;
    g.add(brow1);
    const brow2 = new THREE7.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow2.position.set(3, 37, 5.5);
    brow2.rotation.z = 0.4;
    g.add(brow2);
    const frown = new THREE7.Mesh(COW_GEO.mouth2, COW_MOUTH_MAT);
    frown.position.set(0, 31.5, 5.5);
    g.add(frown);
  } else if (personality === "timid") {
    const brow1 = new THREE7.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow1.position.set(-3, 37, 5.5);
    brow1.rotation.z = 0.3;
    g.add(brow1);
    const brow2 = new THREE7.Mesh(COW_GEO.brow, COW_MOUTH_MAT);
    brow2.position.set(3, 37, 5.5);
    brow2.rotation.z = -0.3;
    g.add(brow2);
    const sad = new THREE7.Mesh(COW_GEO.mouth15, COW_MOUTH_MAT);
    sad.position.set(0, 32, 5.5);
    g.add(sad);
  } else {
    const smile = new THREE7.Mesh(COW_GEO.mouth2, COW_MOUTH_MAT);
    smile.position.set(0, 31.5, 5.5);
    smile.rotation.set(0, 0, Math.PI);
    g.add(smile);
  }
  const cigGroup = new THREE7.Group();
  const cigBody = new THREE7.Mesh(COW_GEO.cigBody, COW_CIG_BODY_MAT);
  cigBody.rotation.z = Math.PI / 2;
  cigBody.position.x = 0;
  cigGroup.add(cigBody);
  const filter = new THREE7.Mesh(COW_GEO.cigFilter, COW_CIG_FILTER_MAT);
  filter.rotation.z = Math.PI / 2;
  filter.position.x = -2.75;
  cigGroup.add(filter);
  const ember = new THREE7.Mesh(COW_GEO.cigEmber, COW_CIG_EMBER_MAT);
  ember.position.x = 2.2;
  cigGroup.add(ember);
  const emberGlow = new THREE7.Mesh(COW_GEO.cigEmberGlow, COW_CIG_EMBER_GLOW_MAT);
  emberGlow.position.x = 2.2;
  cigGroup.add(emberGlow);
  cigGroup.position.set(4, 31, 6);
  cigGroup.rotation.z = -0.2;
  g.add(cigGroup);
  g.userData.smokeOrigin = new THREE7.Vector3(6.2, 30.6, 6);
  const h1 = new THREE7.Mesh(COW_GEO.horn, bodyMat);
  h1.position.set(-4, 41, 0);
  h1.rotation.set(0, 0, -0.3);
  g.add(h1);
  const h2 = new THREE7.Mesh(COW_GEO.horn, bodyMat);
  h2.position.set(4, 41, 0);
  h2.rotation.set(0, 0, 0.3);
  g.add(h2);
  const legL = new THREE7.Mesh(COW_GEO.leg, bodyMat);
  legL.position.set(-4, 3, 0);
  g.add(legL);
  const legR = new THREE7.Mesh(COW_GEO.leg, bodyMat);
  legR.position.set(4, 3, 0);
  g.add(legR);
  const hoof1 = new THREE7.Mesh(COW_GEO.hoof, COW_HOOF_MAT);
  hoof1.position.set(-4, -4, 0);
  g.add(hoof1);
  const hoof2 = new THREE7.Mesh(COW_GEO.hoof, COW_HOOF_MAT);
  hoof2.position.set(4, -4, 0);
  g.add(hoof2);
  const udder = new THREE7.Mesh(COW_GEO.udder, COW_UDDER_MAT);
  udder.position.set(0, 13, 5.5);
  udder.scale.set(1, 0.7, 0.8);
  g.add(udder);
  const teat1 = new THREE7.Mesh(COW_GEO.teat, COW_UDDER_MAT);
  teat1.position.set(-1.5, 13, 7);
  teat1.rotation.x = Math.PI / 2;
  g.add(teat1);
  const teat2 = new THREE7.Mesh(COW_GEO.teat, COW_UDDER_MAT);
  teat2.position.set(1.5, 13, 7);
  teat2.rotation.x = Math.PI / 2;
  g.add(teat2);
  const armL = new THREE7.Mesh(COW_GEO.arm, bodyMat);
  armL.position.set(-9, 20, 0);
  armL.rotation.x = Math.PI;
  armL.rotation.z = 0.3;
  g.add(armL);
  const armR = new THREE7.Mesh(COW_GEO.arm, bodyMat);
  armR.position.set(9, 20, 0);
  armR.rotation.x = Math.PI;
  armR.rotation.z = -0.3;
  g.add(armR);
  return g;
}
function buildTank() {
  const g = new THREE7.Group();
  const treadL = new THREE7.Mesh(TANK_GEO.tread, TANK_TREAD_MAT);
  treadL.position.set(-19, 6, 0);
  treadL.castShadow = true;
  g.add(treadL);
  const treadR = new THREE7.Mesh(TANK_GEO.tread, TANK_TREAD_MAT);
  treadR.position.set(19, 6, 0);
  treadR.castShadow = true;
  g.add(treadR);
  const hull = new THREE7.Mesh(TANK_GEO.hull, TANK_HULL_MAT);
  hull.position.set(0, 21, 0);
  hull.castShadow = true;
  g.add(hull);
  const turret = new THREE7.Mesh(TANK_GEO.turret, TANK_TURRET_MAT);
  turret.position.set(0, 36, -2);
  turret.castShadow = true;
  g.add(turret);
  const hatch = new THREE7.Mesh(TANK_GEO.hatch, TANK_TURRET_MAT);
  hatch.position.set(-6, 42.5, -4);
  g.add(hatch);
  const cBase = new THREE7.Mesh(TANK_GEO.cannonBase, TANK_TURRET_MAT);
  cBase.position.set(0, 36, 14);
  g.add(cBase);
  const cannon = new THREE7.Mesh(TANK_GEO.cannon, TANK_BARREL_MAT);
  cannon.rotation.x = Math.PI / 2;
  cannon.position.set(0, 36, 36);
  g.add(cannon);
  const m249Mount = new THREE7.Mesh(TANK_GEO.m249Mount, TANK_TURRET_MAT);
  m249Mount.position.set(6, 44, 4);
  g.add(m249Mount);
  const m249 = new THREE7.Mesh(TANK_GEO.m249, TANK_BARREL_MAT);
  m249.rotation.x = Math.PI / 2;
  m249.position.set(6, 45, 16);
  g.add(m249);
  g.userData.smokeOrigin = new THREE7.Vector3(0, 36, 58);
  return g;
}
function updateCows(time, dt) {
  const seen = /* @__PURE__ */ new Set();
  const nowMs = performance.now();
  for (const p of state_default.serverPlayers) {
    if (p.id === state_default.myId && (state_default.cameraMode !== "third" || state_default.adsActive)) continue;
    seen.add(String(p.id));
    const pid = String(p.id);
    if (!state_default.cowMeshes[pid]) {
      const m = p.isTank ? buildTank() : buildCow(p.color, p.personality);
      scene.add(m);
      const nameStr = p.name || "Cow";
      if (!_nameMeasureCtx) _nameMeasureCtx = document.createElement("canvas").getContext("2d");
      _nameMeasureCtx.font = "bold 32px Segoe UI";
      const nameW = _nameMeasureCtx.measureText(nameStr).width;
      const padding = 60;
      const cw = Math.min(512, Math.max(256, Math.ceil(nameW + padding)));
      const nc = document.createElement("canvas");
      nc.width = cw;
      nc.height = 64;
      const nctx = nc.getContext("2d");
      nctx.font = "bold 32px Segoe UI";
      nctx.textAlign = "center";
      const circleX = cw / 2 - nameW / 2 - 16;
      nctx.beginPath();
      nctx.arc(circleX, 34, 10, 0, Math.PI * 2);
      nctx.fillStyle = COL_HEX[p.color] || "#aaa";
      nctx.fill();
      nctx.fillStyle = "rgba(0,0,0,0.5)";
      nctx.fillText(nameStr, cw / 2 + 9, 39);
      nctx.fillStyle = "#ffffff";
      nctx.fillText(nameStr, cw / 2 + 8, 38);
      const ntex = new THREE7.CanvasTexture(nc);
      ntex.minFilter = THREE7.LinearFilter;
      const nmat = new THREE7.SpriteMaterial({ map: ntex, transparent: true, depthTest: false });
      const nsprite = new THREE7.Sprite(nmat);
      nsprite.position.set(0, 50, 0);
      nsprite.scale.set(40 * (cw / 256), 10, 1);
      m.add(nsprite);
      if (!p.isTank) {
        const hatType = ["cowboy", "wizard", "party", "crown", "cap", "pompadour", "afro", "mohawk"][Math.abs(p.id || 0) % 8];
        m.add(cloneHat(hatType));
      }
      state_default.cowMeshes[pid] = { mesh: m, nameSprite: nsprite, isTank: !!p.isTank };
    }
    const cowObj = state_default.cowMeshes[pid];
    const cm = cowObj.mesh;
    const isLocal = p.id === state_default.myId;
    const pos = isLocal && state_default.mePredicted ? state_default.mePredicted : getInterpolatedEntity(p);
    if (!cowObj.isDead) {
      cm.position.x = pos.x;
      cm.position.z = pos.y;
      cm.position.y = pos.z !== void 0 ? pos.z : getTerrainHeight(pos.x, pos.y);
      const sz = p.sizeMult || 1;
      const crouchY = p.crouching ? 0.5 : 1;
      cm.scale.set(sz, sz * crouchY, sz);
    }
    cm.visible = true;
    if (!p.alive && !cowObj.isDead) {
      cowObj.isDead = true;
      cm.rotation.z = Math.PI / 2;
      cm.position.y = (pos.z !== void 0 ? pos.z : getTerrainHeight(pos.x, pos.y)) + 5;
      if (cowObj.nameSprite) cowObj.nameSprite.visible = false;
      if (cowObj.hpSprite) cowObj.hpSprite.sprite.visible = false;
      if (cowObj.chatBubble) {
        cm.remove(cowObj.chatBubble.sprite);
        if (cowObj.chatBubble.timer) clearTimeout(cowObj.chatBubble.timer);
        cowObj.chatBubble.tex.dispose();
        cowObj.chatBubble.mat.dispose();
        cowObj.chatBubble = null;
      }
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
    }
    if (isLocal) {
      cm.rotation.y = state_default.yaw + Math.PI;
    } else if (pos.aim !== void 0) {
      cm.rotation.y = pos.aim;
    }
    if (state_default.debugMode && p.alive) {
      const eh = 35 * (p.sizeMult || 1);
      const headBase = eh * 0.75;
      const headSpanLocal = 20;
      const headHeight = headSpanLocal * (2 / 3);
      const headBottom = headBase + (headSpanLocal - headHeight);
      if (!cowObj.debugBody) {
        cowObj.debugBody = new THREE7.Mesh(DEBUG_BODY_GEO, DEBUG_BODY_MAT);
        cm.add(cowObj.debugBody);
        cowObj.debugHead = new THREE7.Mesh(DEBUG_HEAD_GEO, DEBUG_HEAD_MAT);
        cm.add(cowObj.debugHead);
        const muzzleY = 35;
        const arrowShaft = new THREE7.Mesh(DEBUG_ARROW_SHAFT_GEO, DEBUG_ARROW_MAT);
        arrowShaft.rotation.x = Math.PI / 2;
        arrowShaft.position.set(0, muzzleY, 15);
        const arrowHead = new THREE7.Mesh(DEBUG_ARROW_HEAD_GEO, DEBUG_ARROW_MAT);
        arrowHead.rotation.x = Math.PI / 2;
        arrowHead.position.set(0, muzzleY, 32);
        const arrowGroup = new THREE7.Group();
        arrowGroup.add(arrowShaft);
        arrowGroup.add(arrowHead);
        cm.add(arrowGroup);
        cowObj.debugArrow = arrowGroup;
      }
      cowObj.debugBody.position.set(0, headBottom / 2, 0);
      cowObj.debugBody.scale.y = headBottom;
      cowObj.debugBody.visible = true;
      cowObj.debugHead.position.set(0, headBottom + headHeight / 2, 0);
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
      const htex = new THREE7.CanvasTexture(hc);
      htex.minFilter = THREE7.LinearFilter;
      const hmat = new THREE7.SpriteMaterial({ map: htex, transparent: true, depthTest: false });
      const hs = new THREE7.Sprite(hmat);
      hs.position.set(0, 48, 0);
      hs.scale.set(30, 4, 1);
      cm.add(hs);
      cowObj.hpSprite = { sprite: hs, canvas: hc, ctx: hc.getContext("2d"), tex: htex };
    }
    const armorVal = p.armor || 0;
    if (p.alive && armorVal > 0 && !cowObj.shieldBubble) {
      const shieldMat = new THREE7.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.55, side: THREE7.DoubleSide });
      const shield = new THREE7.Mesh(SHIELD_BUBBLE_GEO, shieldMat);
      shield.position.set(0, 26, 0);
      shield.scale.set(0.95, 1.55, 0.95);
      cm.add(shield);
      cowObj.shieldBubble = shield;
    }
    if (cowObj.shieldBubble) {
      if (!p.alive || armorVal <= 0) {
        cm.remove(cowObj.shieldBubble);
        cowObj.shieldBubble.material.dispose();
        cowObj.shieldBubble = null;
      } else {
        cowObj.shieldBubble.visible = !p.spawnProt;
        cowObj.shieldBubble.material.opacity = Math.max(0.2, armorVal / 100 * 0.6);
      }
    }
    if (p.spawnProt && !cowObj.spawnBubble) {
      const spMat = new THREE7.MeshBasicMaterial({ color: 16772676, transparent: true, opacity: 0.2, side: THREE7.DoubleSide });
      const sp = new THREE7.Mesh(SPAWN_BUBBLE_GEO, spMat);
      sp.position.set(0, 26, 0);
      sp.scale.set(0.95, 1.55, 0.95);
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
      if (obj.chatBubble) {
        if (obj.chatBubble.timer) clearTimeout(obj.chatBubble.timer);
        obj.chatBubble.tex.dispose();
        obj.chatBubble.mat.dispose();
      }
      delete state_default.cowMeshes[id];
    }
  }
}
function showChatBubble(playerId, text) {
  const pid = String(playerId);
  const cowObj = state_default.cowMeshes[pid];
  if (!cowObj || cowObj.isDead) return;
  if (cowObj.chatBubble) {
    cowObj.mesh.remove(cowObj.chatBubble.sprite);
    if (cowObj.chatBubble.timer) clearTimeout(cowObj.chatBubble.timer);
    cowObj.chatBubble.tex.dispose();
    cowObj.chatBubble.mat.dispose();
    cowObj.chatBubble = null;
  }
  const truncated = text.length > CHAT_BUBBLE_MAX_CHARS ? text.slice(0, CHAT_BUBBLE_MAX_CHARS - 1) + "\u2026" : text;
  if (!_measureCtx) _measureCtx = document.createElement("canvas").getContext("2d");
  _measureCtx.font = "bold " + CHAT_BUBBLE_FONT_PX + "px Segoe UI";
  const textPxW = _measureCtx.measureText(truncated).width;
  const bodyW = Math.ceil(textPxW + CHAT_BUBBLE_PAD_X * 2);
  const bodyH = Math.ceil(CHAT_BUBBLE_FONT_PX + CHAT_BUBBLE_PAD_Y * 2);
  const margin = 16;
  const W = bodyW + margin * 2;
  const H2 = bodyH + margin * 2 + CHAT_BUBBLE_TAIL;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H2;
  const ctx = cv.getContext("2d");
  ctx.font = "bold " + CHAT_BUBBLE_FONT_PX + "px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const bx = margin, by = margin, r = 18;
  ctx.fillStyle = CHAT_BUBBLE_BG_RGBA;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.lineTo(bx + bodyW - r, by);
  ctx.quadraticCurveTo(bx + bodyW, by, bx + bodyW, by + r);
  ctx.lineTo(bx + bodyW, by + bodyH - r);
  ctx.quadraticCurveTo(bx + bodyW, by + bodyH, bx + bodyW - r, by + bodyH);
  ctx.lineTo(bx + r, by + bodyH);
  ctx.quadraticCurveTo(bx, by + bodyH, bx, by + bodyH - r);
  ctx.lineTo(bx, by + r);
  ctx.quadraticCurveTo(bx, by, bx + r, by);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W / 2 - 14, by + bodyH - 1);
  ctx.lineTo(W / 2 + 14, by + bodyH - 1);
  ctx.lineTo(W / 2, by + bodyH + CHAT_BUBBLE_TAIL);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = CHAT_BUBBLE_FG_RGBA;
  ctx.fillText(truncated, W / 2, by + bodyH / 2);
  const tex = new THREE7.CanvasTexture(cv);
  tex.minFilter = THREE7.LinearFilter;
  const mat = new THREE7.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE7.Sprite(mat);
  const worldW = W * CHAT_BUBBLE_WORLD_PER_PX;
  const worldH = H2 * CHAT_BUBBLE_WORLD_PER_PX;
  sprite.position.set(0, 60 + worldH / 2, 0);
  sprite.scale.set(worldW, worldH, 1);
  cowObj.mesh.add(sprite);
  const bubble = { sprite, tex, mat, timer: null };
  bubble.timer = setTimeout(() => {
    if (cowObj.chatBubble !== bubble) return;
    cowObj.mesh.remove(sprite);
    tex.dispose();
    mat.dispose();
    cowObj.chatBubble = null;
  }, CHAT_BUBBLE_MS);
  cowObj.chatBubble = bubble;
}
var _wispTmpPos, COW_GEO, COW_SPOT_MAT, COW_UDDER_MAT, COW_HOOF_MAT, COW_EYE_MAT, COW_PUPIL_MAT, COW_MOUTH_MAT, COW_CIG_BODY_MAT, COW_CIG_FILTER_MAT, COW_CIG_EMBER_MAT, COW_CIG_EMBER_GLOW_MAT, _cowBodyMats, _HAT_TEMPLATES, SHIELD_BUBBLE_GEO, SPAWN_BUBBLE_GEO, DEBUG_BODY_GEO, DEBUG_HEAD_GEO, DEBUG_ARROW_SHAFT_GEO, DEBUG_ARROW_HEAD_GEO, DEBUG_BODY_MAT, DEBUG_HEAD_MAT, DEBUG_ARROW_MAT, TANK_GEO, TANK_HULL_MAT, TANK_TURRET_MAT, TANK_TREAD_MAT, TANK_BARREL_MAT, CHAT_BUBBLE_MS, CHAT_BUBBLE_MAX_CHARS, CHAT_BUBBLE_FONT_PX, _measureCtx, _nameMeasureCtx, CHAT_BUBBLE_PAD_X, CHAT_BUBBLE_PAD_Y, CHAT_BUBBLE_TAIL, CHAT_BUBBLE_BG_RGBA, CHAT_BUBBLE_FG_RGBA, CHAT_BUBBLE_WORLD_PER_PX;
var init_entities = __esm({
  "client/entities.js"() {
    init_config();
    init_state();
    init_renderer();
    init_terrain();
    init_particles();
    init_three_utils();
    init_snapshot();
    _wispTmpPos = new THREE7.Vector3();
    COW_GEO = {
      torso: new THREE7.BoxGeometry(14, 18, 10),
      head: new THREE7.BoxGeometry(10, 10, 10),
      spotLarge: new THREE7.CircleGeometry(3, 8),
      // side spots
      spot25: new THREE7.CircleGeometry(2.5, 8),
      // top spot
      spot22: new THREE7.CircleGeometry(2.2, 8),
      // chest spot
      spot16: new THREE7.CircleGeometry(1.6, 8),
      // chest spot small
      spot24: new THREE7.CircleGeometry(2.4, 8),
      // rump spot
      spot18: new THREE7.CircleGeometry(1.8, 8),
      // rump spot small
      eye: new THREE7.SphereGeometry(2, 6, 6),
      pupil: new THREE7.SphereGeometry(1, 6, 6),
      brow: new THREE7.BoxGeometry(3, 0.6, 0.6),
      mouth2: new THREE7.TorusGeometry(2, 0.4, 6, 12, Math.PI),
      // smile + frown
      mouth15: new THREE7.TorusGeometry(1.5, 0.4, 6, 12, Math.PI),
      // sad
      cigBody: new THREE7.CylinderGeometry(0.4, 0.4, 4, 4),
      cigFilter: new THREE7.CylinderGeometry(0.45, 0.45, 1.5, 4),
      cigEmber: new THREE7.SphereGeometry(0.5, 4, 4),
      cigEmberGlow: new THREE7.SphereGeometry(1, 4, 4),
      horn: new THREE7.ConeGeometry(1.5, 8, 5),
      leg: new THREE7.CylinderGeometry(2.5, 2, 12, 5),
      hoof: new THREE7.BoxGeometry(4, 2, 5),
      udder: new THREE7.SphereGeometry(3, 6, 6),
      teat: new THREE7.CylinderGeometry(0.5, 0.3, 2, 4),
      arm: new THREE7.CylinderGeometry(1.5, 1.5, 12, 5)
    };
    for (const g of Object.values(COW_GEO)) markSharedGeometry(g);
    COW_SPOT_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16777215 }));
    COW_UDDER_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 16746666 }));
    COW_HOOF_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 4473924 }));
    COW_EYE_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 16777215 }));
    COW_PUPIL_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 2236962 }));
    COW_MOUTH_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 2236962 }));
    COW_CIG_BODY_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 15658734 }));
    COW_CIG_FILTER_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 14518323 }));
    COW_CIG_EMBER_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 16729088 }));
    COW_CIG_EMBER_GLOW_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 16737792, transparent: true, opacity: 0.25 }));
    _cowBodyMats = /* @__PURE__ */ new Map();
    _HAT_TEMPLATES = {
      cowboy: _buildCowboyHatTemplate(),
      wizard: _buildWizardHatTemplate(),
      crown: _buildCrownHatTemplate(),
      cap: _buildCapHatTemplate(),
      party: _buildPartyHatTemplate(),
      pompadour: _buildPompadourTemplate(),
      afro: _buildAfroTemplate(),
      mohawk: _buildMohawkTemplate()
    };
    SHIELD_BUBBLE_GEO = markSharedGeometry(new THREE7.SphereGeometry(24, 12, 12));
    SPAWN_BUBBLE_GEO = markSharedGeometry(new THREE7.SphereGeometry(25, 12, 12));
    DEBUG_BODY_GEO = markSharedGeometry(new THREE7.CylinderGeometry(14, 14, 1, 12));
    DEBUG_HEAD_GEO = markSharedGeometry(new THREE7.CylinderGeometry(10, 10, 20 * (2 / 3), 12));
    DEBUG_ARROW_SHAFT_GEO = markSharedGeometry(new THREE7.CylinderGeometry(0.8, 0.8, 30, 6));
    DEBUG_ARROW_HEAD_GEO = markSharedGeometry(new THREE7.ConeGeometry(2.5, 5, 6));
    DEBUG_BODY_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 65280, wireframe: true }));
    DEBUG_HEAD_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 16729156, wireframe: true }));
    DEBUG_ARROW_MAT = markSharedMaterial(new THREE7.MeshBasicMaterial({ color: 16768256, wireframe: true }));
    TANK_GEO = {
      hull: new THREE7.BoxGeometry(34, 18, 56),
      turret: new THREE7.BoxGeometry(26, 12, 30),
      cannon: new THREE7.CylinderGeometry(2, 2, 44, 8),
      cannonBase: new THREE7.BoxGeometry(8, 8, 6),
      m249: new THREE7.CylinderGeometry(0.9, 0.9, 18, 6),
      m249Mount: new THREE7.BoxGeometry(4, 4, 6),
      tread: new THREE7.BoxGeometry(8, 12, 56),
      hatch: new THREE7.CylinderGeometry(4, 4, 1.5, 8)
    };
    for (const g of Object.values(TANK_GEO)) markSharedGeometry(g);
    TANK_HULL_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 4872762 }));
    TANK_TURRET_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 4214320 }));
    TANK_TREAD_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 2236962 }));
    TANK_BARREL_MAT = markSharedMaterial(new THREE7.MeshLambertMaterial({ color: 2763306 }));
    CHAT_BUBBLE_MS = 5e3;
    CHAT_BUBBLE_MAX_CHARS = 80;
    CHAT_BUBBLE_FONT_PX = 38;
    _measureCtx = null;
    _nameMeasureCtx = null;
    CHAT_BUBBLE_PAD_X = 60;
    CHAT_BUBBLE_PAD_Y = 28;
    CHAT_BUBBLE_TAIL = 22;
    CHAT_BUBBLE_BG_RGBA = "rgba(255,255,255,0.62)";
    CHAT_BUBBLE_FG_RGBA = "rgba(0,0,0,0.78)";
    CHAT_BUBBLE_WORLD_PER_PX = 0.32;
  }
});

// client/map-objects.js
import * as THREE8 from "three";
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
  for (const id in _houseWallMap) delete _houseWallMap[id];
  for (const idx in _houseParts) delete _houseParts[idx];
  (state_default.mapFeatures.walls || []).forEach((w) => {
    if (w.houseIdx != null) {
      _houseWallMap[w.id] = { houseIdx: w.houseIdx, side: w.houseSide };
      if (!_houseParts[w.houseIdx]) _houseParts[w.houseIdx] = { group: null, sideDecor: {}, roof: [], wallIds: /* @__PURE__ */ new Set(), destroyedWallIds: /* @__PURE__ */ new Set() };
      _houseParts[w.houseIdx].wallIds.add(w.id);
    }
  });
  function addMap(m) {
    scene.add(m);
    _mapMeshes.push(m);
    return m;
  }
  const wm = new THREE8.MeshLambertMaterial({ color: 8006182 });
  const trimMat = new THREE8.MeshLambertMaterial({ color: 13156520 });
  const capMat = new THREE8.MeshLambertMaterial({ color: 4861978 });
  const xMat = new THREE8.MeshLambertMaterial({ color: 13156520 });
  const weatherMat = new THREE8.MeshLambertMaterial({ color: 3807764, transparent: true, opacity: 0.55 });
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
        const stain = new THREE8.Mesh(new THREE8.CircleGeometry(2 + Math.random() * 3, 6), weatherMat);
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
  const unitBox = new THREE8.BoxGeometry(1, 1, 1);
  const unitBeam = new THREE8.BoxGeometry(1, 2.5, 1);
  function buildBoxIM(xforms, geo, mat, slotKey) {
    if (xforms.length === 0) return null;
    const im = new THREE8.InstancedMesh(geo, mat, xforms.length);
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
    _wallXBeamIM = new THREE8.InstancedMesh(unitBeam, xMat, xBeamXforms.length);
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
  const barnWallMat = new THREE8.MeshLambertMaterial({ color: 8006182 });
  const barnRoofMat = new THREE8.MeshLambertMaterial({ color: 4861978 });
  const barnTrimMat = new THREE8.MeshLambertMaterial({ color: 13156520 });
  (state_default.mapFeatures.shelters || []).forEach((s) => {
    const th = getTerrainHeight(s.x, s.y);
    const bw = s.r * 2 || 60, bd = s.r * 2 || 60, bh = 35;
    const stiltH = 100;
    const g = new THREE8.Group();
    const stiltGeo = new THREE8.CylinderGeometry(3, 3, stiltH, 6);
    const stiltMat = new THREE8.MeshLambertMaterial({ color: 6964258 });
    [[-bw / 2 + 4, -bd / 2 + 4], [bw / 2 - 4, -bd / 2 + 4], [-bw / 2 + 4, bd / 2 - 4], [bw / 2 - 4, bd / 2 - 4]].forEach(([sx2, sz2]) => {
      const stilt = new THREE8.Mesh(stiltGeo, stiltMat);
      stilt.position.set(sx2, stiltH / 2, sz2);
      stilt.castShadow = true;
      g.add(stilt);
    });
    const braceGeo = new THREE8.BoxGeometry(bw - 8, 3, 3);
    const brace1 = new THREE8.Mesh(braceGeo, stiltMat);
    brace1.position.set(0, stiltH * 0.3, -bd / 2 + 4);
    g.add(brace1);
    const brace2 = new THREE8.Mesh(braceGeo, stiltMat);
    brace2.position.set(0, stiltH * 0.3, bd / 2 - 4);
    g.add(brace2);
    const floorMat = new THREE8.MeshLambertMaterial({ color: 9136404 });
    const floor = new THREE8.Mesh(new THREE8.BoxGeometry(bw + 4, 3, bd + 4), floorMat);
    floor.position.y = stiltH;
    g.add(floor);
    const walls = new THREE8.Mesh(new THREE8.BoxGeometry(bw, bh, bd), barnWallMat);
    walls.position.y = stiltH + bh / 2;
    walls.castShadow = true;
    g.add(walls);
    const trim = new THREE8.Mesh(new THREE8.BoxGeometry(bw + 0.5, 3, bd + 0.5), barnTrimMat);
    trim.position.y = stiltH + bh * 0.6;
    g.add(trim);
    const roofW = bw + 10, roofD = bd + 6;
    const roofGeo = new THREE8.BoxGeometry(roofW, 4, roofD);
    const roofL = new THREE8.Mesh(roofGeo, barnRoofMat);
    roofL.position.set(-roofW * 0.2, stiltH + bh + 8, 0);
    roofL.rotation.z = 0.4;
    roofL.castShadow = true;
    g.add(roofL);
    const roofR = new THREE8.Mesh(roofGeo, barnRoofMat);
    roofR.position.set(roofW * 0.2, stiltH + bh + 8, 0);
    roofR.rotation.z = -0.4;
    roofR.castShadow = true;
    g.add(roofR);
    const ridge = new THREE8.Mesh(new THREE8.BoxGeometry(4, 4, roofD + 2), barnRoofMat);
    ridge.position.y = stiltH + bh + 14;
    g.add(ridge);
    const doorMat = new THREE8.MeshLambertMaterial({ color: 3351057 });
    const door = new THREE8.Mesh(new THREE8.BoxGeometry(bw * 0.35, bh * 0.7, 0.5), doorMat);
    door.position.set(0, stiltH + bh * 0.35, bd / 2 + 0.3);
    g.add(door);
    const windowMat = new THREE8.MeshLambertMaterial({ color: 16768392 });
    const win = new THREE8.Mesh(new THREE8.BoxGeometry(8, 8, 0.5), windowMat);
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
    const stex2 = new THREE8.CanvasTexture(sc);
    stex2.minFilter = THREE8.LinearFilter;
    const ss = new THREE8.Sprite(new THREE8.SpriteMaterial({ map: stex2, transparent: true, depthTest: false }));
    ss.position.set(0, stiltH + bh + 22, 0);
    ss.scale.set(40, 10, 1);
    g.add(ss);
    g.position.set(s.x, th, s.y);
    addMap(g);
  });
  (state_default.mapFeatures.houses || []).forEach((h, hIdx) => {
    const th = getTerrainHeight(h.cx, h.cy);
    const wallH2 = 70;
    const houseGroup = new THREE8.Group();
    const hp = _houseParts[hIdx];
    if (hp) hp.group = houseGroup;
    const roofMat = new THREE8.MeshLambertMaterial({ color: 4861978 });
    const frameMat = new THREE8.MeshLambertMaterial({ color: 3809306 });
    const glassMat = new THREE8.MeshLambertMaterial({ color: 8965375, transparent: true, opacity: 0.55 });
    const doorMat = new THREE8.MeshLambertMaterial({ color: 5912608 });
    const isLongX = h.w >= h.d;
    const longLen = isLongX ? h.w : h.d;
    const shortLen = isLongX ? h.d : h.w;
    const eaveOverhang = 10;
    const roofSlabW = shortLen / 2 + eaveOverhang;
    const roofSlabD = longLen + eaveOverhang * 2;
    const roofGeo = new THREE8.BoxGeometry(roofSlabW, 3, roofSlabD);
    const roofLift = 20;
    const slopeA = Math.atan2(roofLift, shortLen / 2);
    const roofL = new THREE8.Mesh(roofGeo, roofMat);
    const roofR = new THREE8.Mesh(roofGeo, roofMat);
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
    if (hp) hp.roof.push(roofL, roofR);
    const ridgeGeo = isLongX ? new THREE8.BoxGeometry(4, 4, longLen + eaveOverhang * 2) : new THREE8.BoxGeometry(longLen + eaveOverhang * 2, 4, 4);
    const ridge = new THREE8.Mesh(ridgeGeo, roofMat);
    ridge.position.y = wallH2 + roofLift;
    houseGroup.add(ridge);
    if (hp) hp.roof.push(ridge);
    const T = 20;
    const doorW = 60, doorH = 50;
    const doorPlacement = (() => {
      if (h.doorSide === "N") return [0, -h.d / 2 + T / 2, 0];
      if (h.doorSide === "S") return [0, h.d / 2 - T / 2, Math.PI];
      if (h.doorSide === "W") return [-h.w / 2 + T / 2, 0, Math.PI / 2];
      return [h.w / 2 - T / 2, 0, -Math.PI / 2];
    })();
    const [dLocalX, dLocalZ, dFacingY] = doorPlacement;
    const frame = new THREE8.Mesh(new THREE8.BoxGeometry(doorW + 6, doorH + 6, T + 2), frameMat);
    frame.position.set(dLocalX, doorH / 2, dLocalZ);
    frame.rotation.y = dFacingY;
    houseGroup.add(frame);
    const door = new THREE8.Mesh(new THREE8.BoxGeometry(doorW, doorH, 2), doorMat);
    const ajar = 0.3;
    door.position.set(dLocalX, doorH / 2, dLocalZ);
    door.rotation.y = dFacingY + ajar;
    houseGroup.add(door);
    if (hp) hp.sideDecor[h.doorSide] = [frame, door];
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
      const winFrame = new THREE8.Mesh(new THREE8.BoxGeometry(winW + 4, winH + 4, T + 1), frameMat);
      winFrame.position.set(lx, winY, lz);
      winFrame.rotation.y = rot;
      houseGroup.add(winFrame);
      const glass = new THREE8.Mesh(new THREE8.BoxGeometry(winW, winH, T + 2), glassMat);
      glass.position.set(lx, winY, lz);
      glass.rotation.y = rot;
      houseGroup.add(glass);
      if (hp) hp.sideDecor[side] = [winFrame, glass];
    }
    houseGroup.position.set(h.cx, th, h.cy);
    addMap(houseGroup);
  });
}
function _buildBarricadeTemplate() {
  const W = 52, H_DEPTH = 8, H2 = 55;
  const g = new THREE8.Group();
  const plankMat = markSharedMaterial(new THREE8.MeshLambertMaterial({ color: 7030048 }));
  const darkPlank = markSharedMaterial(new THREE8.MeshLambertMaterial({ color: 4861717 }));
  const weatherStain = markSharedMaterial(new THREE8.MeshLambertMaterial({ color: 2759176, transparent: true, opacity: 0.6 }));
  const metalMat = markSharedMaterial(new THREE8.MeshLambertMaterial({ color: 5920096 }));
  const rivetMat = markSharedMaterial(new THREE8.MeshLambertMaterial({ color: 2762284 }));
  const rustMat = markSharedMaterial(new THREE8.MeshLambertMaterial({ color: 5909008, transparent: true, opacity: 0.7 }));
  const body = new THREE8.Mesh(markSharedGeometry(new THREE8.BoxGeometry(W, H2, H_DEPTH)), plankMat);
  body.position.set(0, H2 / 2, 0);
  body.castShadow = true;
  g.add(body);
  const stripeGeo = markSharedGeometry(new THREE8.BoxGeometry(W + 0.2, 1.5, H_DEPTH + 0.2));
  for (let i = 1; i < 4; i++) {
    const stripe = new THREE8.Mesh(stripeGeo, darkPlank);
    stripe.position.set(0, H2 / 4 * i, 0);
    g.add(stripe);
  }
  const plateInset = 4;
  const plateGeo = markSharedGeometry(new THREE8.BoxGeometry(W - plateInset * 2, H2 - plateInset * 2, 0.8));
  const rivetGeo = markSharedGeometry(new THREE8.SphereGeometry(0.7, 5, 5));
  const rustGeo = markSharedGeometry(new THREE8.CircleGeometry(1, 6));
  for (const side of [1, -1]) {
    const plate = new THREE8.Mesh(plateGeo, metalMat);
    plate.position.set(0, H2 / 2, side * (H_DEPTH / 2 + 0.3));
    g.add(plate);
    for (let rp = 0; rp < 3; rp++) {
      const rust = new THREE8.Mesh(rustGeo, rustMat);
      const r = 1.5 + Math.random() * 2;
      rust.scale.set(r, r, 1);
      rust.position.set((Math.random() - 0.5) * (W - plateInset * 2 - 4), plateInset + 3 + Math.random() * (H2 - plateInset * 2 - 6), side * (H_DEPTH / 2 + 0.85));
      if (side < 0) rust.rotation.y = Math.PI;
      g.add(rust);
    }
    const rivetCols = 5, rivetRows = 3;
    for (let rc = 0; rc < rivetCols; rc++) {
      for (let rr = 0; rr < rivetRows; rr++) {
        const rivet = new THREE8.Mesh(rivetGeo, rivetMat);
        const rx = -W / 2 + plateInset + 3 + rc * (W - plateInset * 2 - 6) / (rivetCols - 1);
        const ry = plateInset + 3 + rr * (H2 - plateInset * 2 - 6) / (rivetRows - 1);
        rivet.position.set(rx, ry, side * (H_DEPTH / 2 + 0.9));
        g.add(rivet);
      }
    }
  }
  const streakGeo = markSharedGeometry(new THREE8.BoxGeometry(0.5, H2 - 8, 0.3));
  for (let ws = 0; ws < 2; ws++) {
    const streak = new THREE8.Mesh(streakGeo, weatherStain);
    streak.position.set(-W / 2 + 4 + ws * (W - 8), H2 / 2, H_DEPTH / 2 + 0.1);
    g.add(streak);
  }
  const beamLen = Math.hypot(W, H2) * 0.95;
  const beam1 = new THREE8.Mesh(markSharedGeometry(new THREE8.BoxGeometry(beamLen, 3, 0.6)), darkPlank);
  beam1.position.set(0, H2 / 2, 0);
  beam1.rotation.z = Math.atan2(H2, W);
  g.add(beam1);
  return g;
}
function onHouseWallDestroyed(wallId) {
  const ref = _houseWallMap[wallId];
  if (!ref) return;
  const hp = _houseParts[ref.houseIdx];
  if (!hp || !hp.group) return;
  hp.destroyedWallIds.add(wallId);
  const decor = hp.sideDecor[ref.side];
  if (decor) {
    for (const m of decor) {
      hp.group.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
    delete hp.sideDecor[ref.side];
  }
  if (hp.destroyedWallIds.size >= hp.wallIds.size && hp.roof.length > 0) {
    for (const m of hp.roof) {
      hp.group.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
    hp.roof.length = 0;
  }
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
  const g = new THREE8.Group();
  const th = getTerrainHeight(towerX, towerZ);
  const poleMat = new THREE8.MeshLambertMaterial({ color: 8947848 });
  const pole = new THREE8.Mesh(new THREE8.CylinderGeometry(1.5, 2, 80, 6), poleMat);
  pole.position.y = 40;
  g.add(pole);
  const cap = new THREE8.Mesh(new THREE8.SphereGeometry(3, 6, 6), new THREE8.MeshLambertMaterial({ color: 16768324 }));
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
  const ftex = new THREE8.CanvasTexture(fc);
  const flag = new THREE8.Mesh(new THREE8.PlaneGeometry(30, 18), new THREE8.MeshBasicMaterial({ map: ftex, side: THREE8.DoubleSide }));
  flag.position.set(16, 70, 0);
  g.add(flag);
  g.position.set(towerX, th, towerZ);
  scene.add(g);
  towerMesh = g;
}
var _mapMeshes, _wallBodyIM, _wallTrimIM, _wallCapIM, _wallXBeamIM, _wallSlotsById, _HIDDEN, _houseWallMap, _houseParts, _tmpWallMat4, _tmpWallPos, _tmpWallQuat, _tmpWallScale, _tmpWallEuler, _barricadeMeshes, _BARRICADE_TEMPLATE, towerX, towerZ, towerMesh;
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
    _HIDDEN = new THREE8.Matrix4().makeScale(0, 0, 0);
    _houseWallMap = {};
    _houseParts = {};
    _tmpWallMat4 = new THREE8.Matrix4();
    _tmpWallPos = new THREE8.Vector3();
    _tmpWallQuat = new THREE8.Quaternion();
    _tmpWallScale = new THREE8.Vector3();
    _tmpWallEuler = new THREE8.Euler();
    _barricadeMeshes = {};
    _BARRICADE_TEMPLATE = _buildBarricadeTemplate();
    towerX = MW / 2;
    towerZ = MH / 2;
    towerMesh = null;
  }
});

// client/weapons-view.js
import * as THREE9 from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
function notifyShotFired(weapon) {
  const add = HEAT_PER_SHOT[weapon] != null ? HEAT_PER_SHOT[weapon] : 0.08;
  _barrelHeat = Math.min(1, _barrelHeat + add);
  _flashQueue++;
  _flashUntil = performance.now() + FLASH_DURATION_MS;
}
function resetBarrelHeat() {
  _barrelHeat = 0;
  _smokeAccum = 0;
  _flashQueue = 0;
  _flashUntil = 0;
  if (_flashMesh) _flashMesh.visible = false;
}
function updateMinigunSound(spinPct) {
  const actx2 = getAudioCtx();
  if (!actx2) return;
  if (spinPct > 0.01) {
    if (!_minigunOsc) {
      _minigunOsc = actx2.createOscillator();
      _minigunGain = actx2.createGain();
      _minigunOsc.type = "sawtooth";
      _minigunOsc.connect(_minigunGain);
      _minigunGain.connect(actx2.destination);
      _minigunOsc.start();
    }
    const vol = Math.min(0.06, spinPct * 0.06) * (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5);
    _minigunGain.gain.setTargetAtTime(vol, actx2.currentTime, 0.05);
    _minigunOsc.frequency.setTargetAtTime(80 + spinPct * 200, actx2.currentTime, 0.05);
  } else if (_minigunOsc) {
    try {
      _minigunOsc.stop();
    } catch (e) {
    }
    try {
      _minigunOsc.disconnect();
      _minigunGain.disconnect();
    } catch (e) {
    }
    _minigunOsc = null;
    _minigunGain = null;
  }
}
function getVmGroup() {
  return vmGroup;
}
function buildHoof() {
  return new THREE9.Object3D();
}
function buildViewmodel(type, dual) {
  if (vmGroup) {
    vmScene.remove(vmGroup);
  }
  vmGroup = new THREE9.Group();
  vmDual = !!dual;
  const dark = new THREE9.MeshBasicMaterial({ color: 4473924 });
  const metal = new THREE9.MeshBasicMaterial({ color: 10066329 });
  const wood = new THREE9.MeshBasicMaterial({ color: 9132587 });
  const olive = new THREE9.MeshBasicMaterial({ color: 5597999 });
  const black = new THREE9.MeshBasicMaterial({ color: 2236962 });
  if (type === "normal") {
    const slide = new THREE9.Mesh(new THREE9.BoxGeometry(1.8, 1.5, 6), dark);
    slide.position.set(0, 0, -3);
    vmGroup.add(slide);
    const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.35, 0.35, 3, 6), metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.2, -6.5);
    vmGroup.add(barrel);
    const grip = new THREE9.Mesh(new THREE9.BoxGeometry(1.5, 3.5, 1.8), dark);
    grip.rotation.x = 0.2;
    grip.position.set(0, -2.5, -1);
    vmGroup.add(grip);
    const mag = new THREE9.Mesh(new THREE9.BoxGeometry(1, 2.5, 1.2), new THREE9.MeshBasicMaterial({ color: 3355443 }));
    mag.position.set(0, -3.5, -1);
    vmGroup.add(mag);
    const trigger = new THREE9.Mesh(new THREE9.BoxGeometry(0.3, 1, 0.8), metal);
    trigger.position.set(0, -1.2, -1.5);
    vmGroup.add(trigger);
    const sight = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.5, 0.4), metal);
    sight.position.set(0, 1, -5);
    vmGroup.add(sight);
  } else if (type === "shotgun") {
    const buildBenelliProc = (parent, xOff) => {
      const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.7, 0.7, 18, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(xOff, 0.3, -10);
      parent.add(barrel);
      const tubeMag = new THREE9.Mesh(new THREE9.CylinderGeometry(0.6, 0.6, 14, 8), dark);
      tubeMag.rotation.x = Math.PI / 2;
      tubeMag.position.set(xOff, -0.7, -8);
      parent.add(tubeMag);
      const receiver = new THREE9.Mesh(new THREE9.BoxGeometry(2.2, 2.5, 5), black);
      receiver.position.set(xOff, -0.3, -2);
      parent.add(receiver);
      const forend = new THREE9.Mesh(new THREE9.BoxGeometry(2, 1.8, 5), dark);
      forend.position.set(xOff, -0.5, -6);
      parent.add(forend);
      const grip = new THREE9.Mesh(new THREE9.BoxGeometry(1.5, 3.5, 1.5), black);
      grip.rotation.x = 0.3;
      grip.position.set(xOff, -2.5, 0);
      parent.add(grip);
      const stock = new THREE9.Mesh(new THREE9.CylinderGeometry(0.5, 0.5, 6, 6), metal);
      stock.rotation.x = Math.PI / 2;
      stock.position.set(xOff, -0.3, 3.5);
      parent.add(stock);
      const buttpad = new THREE9.Mesh(new THREE9.BoxGeometry(2, 2.5, 0.8), dark);
      buttpad.position.set(xOff, -0.3, 6.5);
      parent.add(buttpad);
    };
    const primary = new THREE9.Group();
    const secondGroup = new THREE9.Group();
    secondGroup.position.x = -12;
    secondGroup.visible = vmDual;
    vmGroup.add(primary);
    vmGroup.add(secondGroup);
    vmGroup.userData.benelliSecond = secondGroup;
    const gloader = new GLTFLoader(fbxLoadingManager);
    gloader.load("models/PSX_Benelli.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(40, 40, 40);
      model.rotation.set(0, Math.PI, 0);
      model.position.set(1.5, -3, -7);
      primary.add(model);
      const dup = model.clone(true);
      secondGroup.add(dup);
    }, void 0, () => {
      buildBenelliProc(primary, 0);
      buildBenelliProc(secondGroup, 0);
    });
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
      const grayMat = new THREE9.MeshBasicMaterial({ color: 1710618 });
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
      const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.4, 0.4, 14, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.2, -8);
      vmGroup.add(barrel);
      const body = new THREE9.Mesh(new THREE9.BoxGeometry(2, 2, 8), dark);
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
          c.material = new THREE9.ShaderMaterial({
            vertexShader: "varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
            fragmentShader: "varying vec3 vPos;void main(){float t=clamp((vPos.y+20.0)/40.0,0.0,1.0);vec3 col=mix(vec3(0.2,0.27,0.12),vec3(0.15,0.2,0.08),t);gl_FragColor=vec4(col,1.0);}"
          });
        }
      });
      vmGroup.add(fbx);
    }, void 0, () => {
      const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.5, 0.5, 22, 8), dark);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0, -12);
      vmGroup.add(barrel);
      const stock = new THREE9.Mesh(new THREE9.BoxGeometry(2, 2, 12), wood);
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
  } else if (type === "knife") {
    const bladeMat = new THREE9.MeshBasicMaterial({ color: 13421772 });
    const handleMat = new THREE9.MeshBasicMaterial({ color: 2236962 });
    const guardMat = new THREE9.MeshBasicMaterial({ color: 6710886 });
    const blade = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 1.2, 7), bladeMat);
    blade.position.set(0, 0, -10);
    vmGroup.add(blade);
    const tip = new THREE9.Mesh(new THREE9.ConeGeometry(0.6, 2, 4), bladeMat);
    tip.rotation.x = -Math.PI / 2;
    tip.position.set(0, 0, -14.5);
    vmGroup.add(tip);
    const guard = new THREE9.Mesh(new THREE9.BoxGeometry(2.4, 0.6, 0.8), guardMat);
    guard.position.set(0, 0, -6);
    vmGroup.add(guard);
    const handle = new THREE9.Mesh(new THREE9.CylinderGeometry(0.55, 0.6, 4, 6), handleMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0, -0.2, -3.5);
    vmGroup.add(handle);
    const pommel = new THREE9.Mesh(new THREE9.SphereGeometry(0.7, 6, 4), guardMat);
    pommel.position.set(0, -0.2, -1);
    vmGroup.add(pommel);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -1, -4);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "none";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "aug") {
    const bodyMat = new THREE9.MeshBasicMaterial({ color: 4874296 });
    const stock = new THREE9.Mesh(new THREE9.BoxGeometry(2.4, 2.4, 12), bodyMat);
    stock.position.set(0, -0.1, -1);
    vmGroup.add(stock);
    const fore = new THREE9.Mesh(new THREE9.BoxGeometry(1.6, 1.4, 5), bodyMat);
    fore.position.set(0, -0.4, -8);
    vmGroup.add(fore);
    const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.32, 0.32, 6, 6), black);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.1, -13);
    vmGroup.add(barrel);
    const scope = new THREE9.Mesh(new THREE9.CylinderGeometry(0.55, 0.55, 5, 8), black);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 1.55, -3);
    vmGroup.add(scope);
    const ringA = new THREE9.Mesh(new THREE9.CylinderGeometry(0.7, 0.7, 0.4, 8), metal);
    ringA.rotation.x = Math.PI / 2;
    ringA.position.set(0, 1.55, -1);
    vmGroup.add(ringA);
    const ringB = new THREE9.Mesh(new THREE9.CylinderGeometry(0.7, 0.7, 0.4, 8), metal);
    ringB.rotation.x = Math.PI / 2;
    ringB.position.set(0, 1.55, -5);
    vmGroup.add(ringB);
    const grip = new THREE9.Mesh(new THREE9.BoxGeometry(0.8, 1.8, 0.9), black);
    grip.position.set(0, -1.9, -8);
    vmGroup.add(grip);
    const trig = new THREE9.Mesh(new THREE9.BoxGeometry(0.5, 1, 0.7), metal);
    trig.position.set(0, -1.6, -5);
    vmGroup.add(trig);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -10);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "akm") {
    const woodMat = new THREE9.MeshBasicMaterial({ color: 7027231 });
    const steelMat = new THREE9.MeshBasicMaterial({ color: 2763306 });
    const recv = new THREE9.Mesh(new THREE9.BoxGeometry(2, 2.2, 10), steelMat);
    recv.position.set(0, 0, -3);
    vmGroup.add(recv);
    const gas = new THREE9.Mesh(new THREE9.CylinderGeometry(0.25, 0.25, 5, 6), steelMat);
    gas.rotation.x = Math.PI / 2;
    gas.position.set(0, 1, -8);
    vmGroup.add(gas);
    const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.3, 0.3, 6, 6), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.3, -11);
    vmGroup.add(barrel);
    const muzzle = new THREE9.Mesh(new THREE9.CylinderGeometry(0.45, 0.35, 1.5, 6), steelMat);
    muzzle.rotation.x = Math.PI / 2;
    muzzle.position.set(0, 0.3, -14.5);
    vmGroup.add(muzzle);
    const stock = new THREE9.Mesh(new THREE9.BoxGeometry(1.6, 1.6, 7), woodMat);
    stock.position.set(0, -0.4, 4);
    stock.rotation.x = 0.06;
    vmGroup.add(stock);
    const handguard = new THREE9.Mesh(new THREE9.BoxGeometry(1.6, 1.4, 4.5), woodMat);
    handguard.position.set(0, -0.3, -6.5);
    vmGroup.add(handguard);
    const grip = new THREE9.Mesh(new THREE9.BoxGeometry(1, 2.5, 1.2), woodMat);
    grip.position.set(0, -2.2, -1);
    vmGroup.add(grip);
    const mag = new THREE9.Mesh(new THREE9.BoxGeometry(1, 4, 1.6), new THREE9.MeshBasicMaterial({ color: 1710618 }));
    mag.position.set(0, -3.2, -2.5);
    mag.rotation.x = 0.2;
    vmGroup.add(mag);
    const fSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.25, 1.2, 0.25), metal);
    fSight.position.set(0, 1.8, -10);
    vmGroup.add(fSight);
    const rSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.6, 0.4), metal);
    rSight.position.set(0, 1.5, -0.5);
    vmGroup.add(rSight);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -9);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "sks") {
    const woodMat = new THREE9.MeshBasicMaterial({ color: 8014376 });
    const steelMat = new THREE9.MeshBasicMaterial({ color: 3355443 });
    const recv = new THREE9.Mesh(new THREE9.BoxGeometry(1.8, 2, 10), steelMat);
    recv.position.set(0, 0, -3);
    vmGroup.add(recv);
    const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.28, 0.28, 8, 6), steelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.3, -12);
    vmGroup.add(barrel);
    const stock = new THREE9.Mesh(new THREE9.BoxGeometry(1.6, 1.8, 8), woodMat);
    stock.position.set(0, -0.3, 4);
    stock.rotation.x = 0.08;
    vmGroup.add(stock);
    const handguard = new THREE9.Mesh(new THREE9.BoxGeometry(1.4, 1.2, 5), woodMat);
    handguard.position.set(0, -0.5, -7);
    vmGroup.add(handguard);
    const mag = new THREE9.Mesh(new THREE9.BoxGeometry(0.8, 2.5, 1.4), steelMat);
    mag.position.set(0, -2.2, -2);
    mag.rotation.x = 0.1;
    vmGroup.add(mag);
    const fSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.25, 1, 0.25), metal);
    fSight.position.set(0, 1.5, -10);
    vmGroup.add(fSight);
    const rSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.7, 0.4), metal);
    rSight.position.set(0, 1.5, -0.5);
    vmGroup.add(rSight);
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -9);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "thompson") {
    const buildThompsonProc = (parent) => {
      const woodMat = new THREE9.MeshBasicMaterial({ color: 9132587 });
      const steelMat = new THREE9.MeshBasicMaterial({ color: 2763306 });
      const recv = new THREE9.Mesh(new THREE9.BoxGeometry(2.2, 2.4, 9), steelMat);
      recv.position.set(0, 0, -3);
      parent.add(recv);
      const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.35, 0.35, 5, 6), steelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.3, -10);
      parent.add(barrel);
      const comp = new THREE9.Mesh(new THREE9.CylinderGeometry(0.55, 0.55, 2, 8), steelMat);
      comp.rotation.x = Math.PI / 2;
      comp.position.set(0, 0.3, -8.5);
      parent.add(comp);
      const stock = new THREE9.Mesh(new THREE9.BoxGeometry(1.8, 1.6, 6), woodMat);
      stock.position.set(0, -0.5, 3.5);
      stock.rotation.x = 0.1;
      parent.add(stock);
      const grip = new THREE9.Mesh(new THREE9.BoxGeometry(1.2, 2.5, 1.2), woodMat);
      grip.position.set(0, -2.2, -1);
      parent.add(grip);
      const fgrip = new THREE9.Mesh(new THREE9.BoxGeometry(0.8, 2, 0.8), woodMat);
      fgrip.position.set(0, -2, -5.5);
      parent.add(fgrip);
      const mag = new THREE9.Mesh(new THREE9.BoxGeometry(1, 4, 1.6), steelMat);
      mag.position.set(0, -3, -2.5);
      parent.add(mag);
      const rSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.6, 0.4), metal);
      rSight.position.set(0, 1.6, -0.5);
      parent.add(rSight);
      const fSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.3, 0.8, 0.3), metal);
      fSight.position.set(0, 1.6, -7);
      parent.add(fSight);
    };
    const primary = new THREE9.Group();
    vmGroup.add(primary);
    const gloader = new GLTFLoader(fbxLoadingManager);
    gloader.load("models/PSX_Thompson.gltf", (gltf) => {
      const model = gltf.scene;
      const grayMat = new THREE9.MeshBasicMaterial({ color: 1710618 });
      model.traverse((o) => {
        if (o.isMesh) o.material = grayMat;
      });
      model.scale.set(8, 8, 8);
      model.rotation.set(0, 0, 0);
      model.position.set(1.5, -2, -7);
      primary.add(model);
    }, void 0, () => {
      buildThompsonProc(primary);
    });
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -7);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "mp5k") {
    const bodyMat = new THREE9.MeshBasicMaterial({ color: 2763306 });
    const gunGroup = new THREE9.Group();
    const recv = new THREE9.Mesh(new THREE9.BoxGeometry(2, 2, 7), bodyMat);
    recv.position.set(0, 0, -3);
    gunGroup.add(recv);
    const barrel = new THREE9.Mesh(new THREE9.CylinderGeometry(0.3, 0.3, 4, 6), black);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.3, -8.5);
    gunGroup.add(barrel);
    const fSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.3, 0.8, 0.3), metal);
    fSight.position.set(0, 1.5, -7);
    gunGroup.add(fSight);
    const rSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.6, 0.4), metal);
    rSight.position.set(0, 1.4, -0.5);
    gunGroup.add(rSight);
    const mag = new THREE9.Mesh(new THREE9.BoxGeometry(1, 3.5, 1.4), new THREE9.MeshBasicMaterial({ color: 1710618 }));
    mag.position.set(0, -2.5, -2.5);
    mag.rotation.x = 0.15;
    gunGroup.add(mag);
    const trig = new THREE9.Mesh(new THREE9.BoxGeometry(0.5, 0.8, 0.6), metal);
    trig.position.set(0, -1.3, -4.5);
    gunGroup.add(trig);
    const fg = new THREE9.Mesh(new THREE9.BoxGeometry(0.7, 1.5, 0.8), bodyMat);
    fg.position.set(0, -1.5, -5.5);
    gunGroup.add(fg);
    gunGroup.position.set(2, 0, 0);
    vmGroup.add(gunGroup);
    const gunLeft = gunGroup.clone(true);
    gunLeft.position.set(-6, 0, 0);
    gunLeft.visible = vmDual;
    vmGroup.add(gunLeft);
    vmGroup.userData.mp5kSecond = gunLeft;
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -7);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "magswap";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  } else if (type === "cowtank") {
    const outerTube = new THREE9.Mesh(new THREE9.CylinderGeometry(2.2, 2.2, 16, 10), olive);
    outerTube.rotation.x = Math.PI / 2;
    outerTube.position.set(0, 0, -8);
    vmGroup.add(outerTube);
    const innerTube = new THREE9.Mesh(new THREE9.CylinderGeometry(1.8, 1.8, 8, 10), new THREE9.MeshBasicMaterial({ color: 3820074 }));
    innerTube.rotation.x = Math.PI / 2;
    innerTube.position.set(0, 0, -14);
    vmGroup.add(innerTube);
    const fSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.5, 2, 0.5), metal);
    fSight.position.set(0, 2.8, -16);
    vmGroup.add(fSight);
    const rSight = new THREE9.Mesh(new THREE9.BoxGeometry(0.5, 1.5, 0.5), metal);
    rSight.position.set(0, 2.5, -1);
    vmGroup.add(rSight);
    const trigGuard = new THREE9.Mesh(new THREE9.BoxGeometry(1.5, 3, 2), dark);
    trigGuard.position.set(0, -2.5, -3);
    vmGroup.add(trigGuard);
    const band1 = new THREE9.Mesh(new THREE9.CylinderGeometry(2.4, 2.4, 0.5, 10), new THREE9.MeshBasicMaterial({ color: 16768256 }));
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
  } else if (type === "python") {
    const gunGroup = new THREE9.Group();
    const frame = new THREE9.Mesh(new THREE9.BoxGeometry(1.8, 1.6, 5), dark);
    frame.position.set(0, -0.3, -1);
    gunGroup.add(frame);
    const cyl = new THREE9.Mesh(new THREE9.CylinderGeometry(1, 1, 2, 8), metal);
    cyl.rotation.x = Math.PI / 2;
    cyl.position.set(0, -0.2, -2);
    gunGroup.add(cyl);
    const brl = new THREE9.Mesh(new THREE9.CylinderGeometry(0.35, 0.35, 6, 6), dark);
    brl.rotation.x = Math.PI / 2;
    brl.position.set(0, 0.2, -6.5);
    gunGroup.add(brl);
    const rib = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.4, 5), metal);
    rib.position.set(0, 0.7, -5.5);
    gunGroup.add(rib);
    const grip = new THREE9.Mesh(new THREE9.BoxGeometry(1.5, 3.5, 2), new THREE9.MeshBasicMaterial({ color: 7027231 }));
    grip.position.set(0, -3, 1.5);
    grip.rotation.x = -0.2;
    gunGroup.add(grip);
    const hmr = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.8, 0.5), metal);
    hmr.position.set(0, 1, 1.5);
    gunGroup.add(hmr);
    gunGroup.position.set(2, 0, 0);
    vmGroup.add(gunGroup);
    const gunLeft = gunGroup.clone(true);
    gunLeft.position.set(-6, 0, 0);
    gunLeft.visible = vmDual;
    vmGroup.add(gunLeft);
    vmGroup.userData.mp5kSecond = gunLeft;
  } else if (type === "m249") {
    const bodyMat = new THREE9.MeshBasicMaterial({ color: 5597999 });
    const body = new THREE9.Mesh(new THREE9.BoxGeometry(2.5, 2, 12), bodyMat);
    body.position.set(0, 0, -4);
    vmGroup.add(body);
    const brl = new THREE9.Mesh(new THREE9.CylinderGeometry(0.35, 0.35, 8, 6), dark);
    brl.rotation.x = Math.PI / 2;
    brl.position.set(0, 0.3, -12);
    vmGroup.add(brl);
    const ammoBox = new THREE9.Mesh(new THREE9.BoxGeometry(2, 3, 3), bodyMat);
    ammoBox.position.set(0, -3, -3);
    vmGroup.add(ammoBox);
    const handle = new THREE9.Mesh(new THREE9.BoxGeometry(0.4, 0.8, 3), dark);
    handle.position.set(0, 1.8, -4);
    vmGroup.add(handle);
    const stock = new THREE9.Mesh(new THREE9.BoxGeometry(2, 1.5, 4), bodyMat);
    stock.position.set(0, -0.5, 4);
    vmGroup.add(stock);
  } else if (type === "minigun") {
    const housing = new THREE9.Mesh(new THREE9.CylinderGeometry(2, 2.2, 5, 8), dark);
    housing.rotation.x = Math.PI / 2;
    housing.position.set(0, -0.5, 0);
    vmGroup.add(housing);
    const barrelGroup = new THREE9.Group();
    barrelGroup.position.set(0, -0.5, -9);
    for (let i = 0; i < 6; i++) {
      const angle = i / 6 * Math.PI * 2;
      const tube = new THREE9.Mesh(new THREE9.CylinderGeometry(0.25, 0.25, 14, 4), dark);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0);
      barrelGroup.add(tube);
    }
    const clamp = new THREE9.Mesh(new THREE9.CylinderGeometry(1.8, 1.8, 0.6, 8), metal);
    clamp.rotation.x = Math.PI / 2;
    clamp.position.set(0, 0, -3);
    barrelGroup.add(clamp);
    const core = new THREE9.Mesh(new THREE9.CylinderGeometry(0.4, 0.4, 16, 6), metal);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0, 1);
    barrelGroup.add(core);
    vmGroup.add(barrelGroup);
    vmGroup.userData.minigunBarrels = barrelGroup;
    const hoof = buildHoof();
    hoof.position.set(-0.3, -0.5, -5);
    hoof.rotation.set(-0.2, 0.1, 0.5);
    hoof.userData.restPos = hoof.position.clone();
    hoof.userData.restRot = hoof.rotation.clone();
    hoof.userData.reloadStyle = "cylinder";
    vmGroup.add(hoof);
    vmGroup.userData.hoof = hoof;
  }
  vmGroup.position.set(2, -3, -5);
  vmGroup.rotation.set(0, 0.05, 0);
  vmScene.add(vmGroup);
  vmType = type;
  resetBarrelHeat();
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
    if (vmGroup && vmGroup.userData.mp5kSecond) vmGroup.userData.mp5kSecond.visible = meDual;
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
    if (state_default._boltRacking && vmType === "bolty") {
      vmGroup.rotation.z = -0.3;
      vmGroup.position.x += 2;
      vmGroup.position.y -= 1;
    } else if (vmType === "bolty") {
      vmGroup.rotation.z *= 0.8;
    }
    if (vmGroup.userData.minigunBarrels && me) {
      const spinPct = me.minigunSpin || 0;
      if (spinPct > 0) {
        vmGroup.userData.minigunBarrels.rotation.z += spinPct * 30 * (1 / 60);
      }
      updateMinigunSound(spinPct);
    } else {
      updateMinigunSound(0);
    }
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
    _updateBarrelEffects(me);
  } else {
    _smokeAccum = 0;
    _lastSmokeT = 0;
    _flashQueue = 0;
  }
}
function _muzzleWorldPos(weapon) {
  const offset = MUZZLE_OFFSETS[weapon];
  if (!offset) return null;
  _muzzleTmp.set(offset.x, offset.y, offset.z).applyQuaternion(cam.quaternion);
  return {
    x: cam.position.x + _muzzleTmp.x,
    y: cam.position.y + _muzzleTmp.y,
    z: cam.position.z + _muzzleTmp.z
  };
}
function _updateBarrelEffects(me) {
  if (!me || !me.alive) {
    _smokeAccum = 0;
    _lastSmokeT = 0;
    _flashQueue = 0;
    _flashUntil = 0;
    if (_flashMesh) _flashMesh.visible = false;
    _barrelHeat = 0;
    return;
  }
  if (state_default.adsActive) {
    _smokeAccum = 0;
    _flashQueue = 0;
    _flashUntil = 0;
    if (_flashMesh) _flashMesh.visible = false;
    const now2 = performance.now();
    const dt2 = _lastSmokeT ? Math.min(0.1, (now2 - _lastSmokeT) / 1e3) : 0;
    _lastSmokeT = now2;
    _barrelHeat = Math.max(0, _barrelHeat - HEAT_DECAY * dt2);
    return;
  }
  const wep = vmType;
  const muzzle = _muzzleWorldPos(wep);
  const now = performance.now();
  const dt = _lastSmokeT ? Math.min(0.1, (now - _lastSmokeT) / 1e3) : 0;
  _lastSmokeT = now;
  _updateMuzzleFlashMesh(wep, now);
  _flashQueue = 0;
  _barrelHeat = Math.max(0, _barrelHeat - HEAT_DECAY * dt);
  if (!muzzle || _barrelHeat < SMOKE_THRESHOLD) {
    _smokeAccum = 0;
    return;
  }
  const intensity = Math.min(1, (_barrelHeat - SMOKE_THRESHOLD) / (1 - SMOKE_THRESHOLD));
  _smokeAccum += dt * (1.5 + intensity * 8.5);
  while (_smokeAccum >= 1) {
    _smokeAccum -= 1;
    const size = 0.4 + intensity * 1;
    const greyByte = 85 + (Math.random() * 85 | 0);
    const color = greyByte << 16 | greyByte << 8 | greyByte;
    spawnParticle({
      geo: PGEO_SPHERE_LO,
      color,
      x: muzzle.x,
      y: muzzle.y,
      z: muzzle.z,
      sx: size,
      sy: size,
      sz: size,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.5 + intensity * 3 + Math.random() * 1.5,
      vz: (Math.random() - 0.5) * 1.5,
      life: 0.45 + intensity * 0.85,
      peakOpacity: 0.2 + intensity * 0.45,
      growth: 1.2 + intensity * 1.5
    });
  }
}
function _ensureFlashMesh() {
  if (_flashMesh) return _flashMesh;
  const grp = new THREE9.Group();
  const coreMat = new THREE9.MeshBasicMaterial({ color: 16777184 });
  const haloMat = new THREE9.MeshBasicMaterial({ color: 16755251 });
  const core = new THREE9.Mesh(new THREE9.SphereGeometry(0.7, 8, 6), coreMat);
  const halo = new THREE9.Mesh(new THREE9.SphereGeometry(1.4, 8, 6), haloMat);
  grp.add(core);
  grp.add(halo);
  grp.visible = false;
  _flashMesh = grp;
  return grp;
}
function _updateMuzzleFlashMesh(weapon, now) {
  const mesh = _ensureFlashMesh();
  if (vmGroup && _flashOwnerVm !== vmGroup) {
    if (mesh.parent) mesh.parent.remove(mesh);
    vmGroup.add(mesh);
    _flashOwnerVm = vmGroup;
  }
  if (!vmGroup) {
    mesh.visible = false;
    return;
  }
  const off = MUZZLE_OFFSETS[weapon];
  if (!off) {
    mesh.visible = false;
    return;
  }
  if (now >= _flashUntil) {
    mesh.visible = false;
    return;
  }
  mesh.position.set(off.x, off.y, off.z);
  const sc = FLASH_SCALE[weapon] || 1;
  mesh.scale.set(sc, sc, sc);
  mesh.visible = true;
}
var vmGroup, vmType, vmDual, MUZZLE_OFFSETS, HEAT_PER_SHOT, HEAT_DECAY, SMOKE_THRESHOLD, _muzzleTmp, _barrelHeat, _smokeAccum, _lastSmokeT, _flashQueue, _flashMesh, _flashUntil, _flashOwnerVm, FLASH_DURATION_MS, _minigunOsc, _minigunGain, _throwAway, _pistolDelayUntil, FLASH_SCALE;
var init_weapons_view = __esm({
  "client/weapons-view.js"() {
    init_state();
    init_renderer();
    init_three_utils();
    init_particles();
    init_audio();
    vmGroup = null;
    vmType = null;
    vmDual = false;
    MUZZLE_OFFSETS = {
      normal: { x: 2, y: -2.8, z: -13 },
      shotgun: { x: 2, y: -0.8, z: -24 },
      burst: { x: 3.5, y: -2.6, z: -22 },
      bolty: { x: 3, y: -3.5, z: -26 },
      aug: { x: 3.5, y: -2.6, z: -22 },
      mp5k: { x: 2, y: -2.8, z: -16 },
      thompson: { x: 2, y: -2.5, z: -18 },
      sks: { x: 2.5, y: -2.6, z: -22 },
      akm: { x: 2.5, y: -2.6, z: -20 },
      python: { x: 2, y: -2.8, z: -16 },
      m249: { x: 2.5, y: -2.6, z: -22 },
      minigun: { x: 3, y: -2.8, z: -22 },
      cowtank: { x: 2, y: -3, z: -22 }
    };
    HEAT_PER_SHOT = {
      normal: 0.08,
      shotgun: 0.18,
      burst: 0.07,
      bolty: 0.1,
      aug: 0.07,
      mp5k: 0.05,
      thompson: 0.06,
      sks: 0.1,
      akm: 0.08,
      python: 0.15,
      m249: 0.05,
      minigun: 0.04,
      cowtank: 0.2
    };
    HEAT_DECAY = 0.18;
    SMOKE_THRESHOLD = 0.2;
    _muzzleTmp = new THREE9.Vector3();
    _barrelHeat = 0;
    _smokeAccum = 0;
    _lastSmokeT = 0;
    _flashQueue = 0;
    _flashMesh = null;
    _flashUntil = 0;
    _flashOwnerVm = null;
    FLASH_DURATION_MS = 60;
    _minigunOsc = null;
    _minigunGain = null;
    _throwAway = null;
    _pistolDelayUntil = 0;
    FLASH_SCALE = {
      shotgun: 1.6,
      bolty: 1.4,
      python: 1.2,
      akm: 1.1,
      sks: 1.1,
      m249: 1.2,
      minigun: 1.1,
      cowtank: 1.8
    };
  }
});

// client/pickups.js
import * as THREE10 from "three";
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
  const g = new THREE10.Group();
  const glassMat = new THREE10.MeshLambertMaterial({ color: 5605631, transparent: true, opacity: 0.6 });
  const liquidMat = new THREE10.MeshBasicMaterial({ color: 3368703 });
  const corkMat = new THREE10.MeshLambertMaterial({ color: 11176021 });
  const body = new THREE10.Mesh(new THREE10.CylinderGeometry(4, 5, 10, 8), glassMat);
  g.add(body);
  const liquid = new THREE10.Mesh(new THREE10.CylinderGeometry(3.5, 4.5, 7, 8), liquidMat);
  liquid.position.y = -1;
  g.add(liquid);
  const neck = new THREE10.Mesh(new THREE10.CylinderGeometry(2, 3, 3, 8), glassMat);
  neck.position.y = 6;
  g.add(neck);
  const cork = new THREE10.Mesh(new THREE10.CylinderGeometry(2.2, 2.2, 2, 6), corkMat);
  cork.position.y = 7;
  g.add(cork);
  const glow = new THREE10.Mesh(new THREE10.SphereGeometry(10, 8, 8), new THREE10.MeshBasicMaterial({ color: 5605631, transparent: true, opacity: 0.15 }));
  g.add(glow);
  g.position.set(a.x, getTerrainHeight(a.x, a.y) + 15, a.y);
  return g;
}
function _buildWeaponPickupModel(type) {
  const g = new THREE10.Group();
  const dark = new THREE10.MeshLambertMaterial({ color: 4473924 });
  const metal = new THREE10.MeshLambertMaterial({ color: 10066329 });
  const olive = new THREE10.MeshLambertMaterial({ color: 5597999 });
  const black = new THREE10.MeshLambertMaterial({ color: 2236962 });
  const wood = new THREE10.MeshLambertMaterial({ color: 9132587 });
  if (type === "shotgun") {
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.5, 0.5, 14, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    g.add(barrel);
    const body = new THREE10.Mesh(new THREE10.BoxGeometry(4, 2, 1.5), black);
    body.position.x = -2;
    g.add(body);
    const stock = new THREE10.Mesh(new THREE10.BoxGeometry(4, 1.5, 1.2), wood);
    stock.position.x = -6;
    g.add(stock);
  } else if (type === "burst") {
    const loader = new FBXLoader2(fbxLoadingManager);
    loader.load("models/M16_ps1.fbx", (fbx) => {
      fbx.scale.set(0.05, 0.05, 0.05);
      fbx.rotation.set(0, -Math.PI / 2, 0);
      const grayMat = new THREE10.MeshBasicMaterial({ color: 1710618 });
      fbx.traverse((c) => {
        if (c.isMesh) c.material = grayMat;
      });
      g.add(fbx);
    }, void 0, () => {
      const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.3, 0.3, 10, 6), dark);
      barrel.rotation.z = Math.PI / 2;
      g.add(barrel);
      const body = new THREE10.Mesh(new THREE10.BoxGeometry(6, 2, 1.5), new THREE10.MeshLambertMaterial({ color: 1710618 }));
      body.position.x = -1;
      g.add(body);
    });
  } else if (type === "bolty") {
    const loader = new FBXLoader2(fbxLoadingManager);
    loader.load("models/Sniper.fbx", (fbx) => {
      fbx.scale.set(0.0175, 0.0175, 0.0175);
      fbx.rotation.set(Math.PI, Math.PI, Math.PI);
      fbx.traverse((c) => {
        if (c.isMesh) c.material = new THREE10.MeshBasicMaterial({ color: 2767402 });
      });
      g.add(fbx);
    }, void 0, () => {
      const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.4, 0.4, 16, 6), new THREE10.MeshLambertMaterial({ color: 2767402 }));
      barrel.rotation.z = Math.PI / 2;
      g.add(barrel);
      const scope = new THREE10.Mesh(new THREE10.CylinderGeometry(0.8, 0.8, 4, 6), dark);
      scope.rotation.z = Math.PI / 2;
      scope.position.set(-1, 1.5, 0);
      g.add(scope);
    });
  } else if (type === "cowtank") {
    const tube = new THREE10.Mesh(new THREE10.CylinderGeometry(1.5, 1.5, 12, 8), olive);
    tube.rotation.z = Math.PI / 2;
    g.add(tube);
    const sight = new THREE10.Mesh(new THREE10.BoxGeometry(0.4, 1.5, 0.4), metal);
    sight.position.set(5, 2, 0);
    g.add(sight);
    const band = new THREE10.Mesh(new THREE10.CylinderGeometry(1.7, 1.7, 0.5, 8), new THREE10.MeshLambertMaterial({ color: 16768256 }));
    band.rotation.z = Math.PI / 2;
    band.position.x = -2;
    g.add(band);
  } else if (type === "aug") {
    const augBody = new THREE10.MeshLambertMaterial({ color: 4874296 });
    const augBlk = new THREE10.MeshLambertMaterial({ color: 2236962 });
    const augMet = new THREE10.MeshLambertMaterial({ color: 7829367 });
    const stock = new THREE10.Mesh(new THREE10.BoxGeometry(7, 2.6, 1.6), augBody);
    stock.position.set(-3, 0, 0);
    g.add(stock);
    const fore = new THREE10.Mesh(new THREE10.BoxGeometry(4, 1.6, 1.4), augBody);
    fore.position.set(2.5, -0.2, 0);
    g.add(fore);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.32, 0.32, 6, 6), augBlk);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(5.5, 0.1, 0);
    g.add(barrel);
    const scope = new THREE10.Mesh(new THREE10.CylinderGeometry(0.55, 0.55, 4.2, 8), augBlk);
    scope.rotation.z = Math.PI / 2;
    scope.position.set(-1.4, 1.55, 0);
    g.add(scope);
    const ringA = new THREE10.Mesh(new THREE10.CylinderGeometry(0.7, 0.7, 0.4, 8), augMet);
    ringA.rotation.z = Math.PI / 2;
    ringA.position.set(0.5, 1.55, 0);
    g.add(ringA);
    const ringB = new THREE10.Mesh(new THREE10.CylinderGeometry(0.7, 0.7, 0.4, 8), augMet);
    ringB.rotation.z = Math.PI / 2;
    ringB.position.set(-3.3, 1.55, 0);
    g.add(ringB);
    const grip = new THREE10.Mesh(new THREE10.BoxGeometry(0.7, 1.6, 0.9), augBlk);
    grip.position.set(2.2, -1.6, 0);
    g.add(grip);
    const trig = new THREE10.Mesh(new THREE10.BoxGeometry(0.4, 1, 0.6), augMet);
    trig.position.set(0.6, -1.5, 0);
    g.add(trig);
  } else if (type === "mp5k") {
    const recv = new THREE10.Mesh(new THREE10.BoxGeometry(5, 1.8, 1.6), black);
    g.add(recv);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.3, 0.3, 3, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(4, 0.2, 0);
    g.add(barrel);
    const mag = new THREE10.Mesh(new THREE10.BoxGeometry(1, 3, 1.2), black);
    mag.position.set(-0.5, -2, 0);
    mag.rotation.z = 0.1;
    g.add(mag);
    const fgrip = new THREE10.Mesh(new THREE10.BoxGeometry(0.6, 1.4, 0.7), dark);
    fgrip.position.set(1.5, -1.3, 0);
    g.add(fgrip);
  } else if (type === "akm") {
    const recv = new THREE10.Mesh(new THREE10.BoxGeometry(7, 1.8, 1.4), dark);
    g.add(recv);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.3, 0.3, 5, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(6, 0.2, 0);
    g.add(barrel);
    const stock = new THREE10.Mesh(new THREE10.BoxGeometry(4, 1.3, 1), wood);
    stock.position.set(-5.5, -0.2, 0);
    stock.rotation.z = 0.06;
    g.add(stock);
    const mag = new THREE10.Mesh(new THREE10.BoxGeometry(0.9, 3.5, 1.3), dark);
    mag.position.set(-1, -2.5, 0);
    mag.rotation.z = 0.15;
    g.add(mag);
    const gasT = new THREE10.Mesh(new THREE10.CylinderGeometry(0.2, 0.2, 4, 6), metal);
    gasT.rotation.z = Math.PI / 2;
    gasT.position.set(3, 1, 0);
    g.add(gasT);
  } else if (type === "sks") {
    const recv = new THREE10.Mesh(new THREE10.BoxGeometry(7, 1.8, 1.4), dark);
    g.add(recv);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.28, 0.28, 6, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(6, 0.2, 0);
    g.add(barrel);
    const stock = new THREE10.Mesh(new THREE10.BoxGeometry(5, 1.4, 1), wood);
    stock.position.set(-6, -0.2, 0);
    stock.rotation.z = 0.08;
    g.add(stock);
    const mag = new THREE10.Mesh(new THREE10.BoxGeometry(0.7, 2, 1.2), dark);
    mag.position.set(-1, -1.8, 0);
    g.add(mag);
  } else if (type === "thompson") {
    const recv = new THREE10.Mesh(new THREE10.BoxGeometry(6, 2, 1.6), dark);
    g.add(recv);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.35, 0.35, 4, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(5, 0.2, 0);
    g.add(barrel);
    const comp = new THREE10.Mesh(new THREE10.CylinderGeometry(0.5, 0.5, 1.5, 8), metal);
    comp.rotation.z = Math.PI / 2;
    comp.position.set(4, 0.2, 0);
    g.add(comp);
    const stock = new THREE10.Mesh(new THREE10.BoxGeometry(4, 1.4, 1), wood);
    stock.position.set(-5, -0.3, 0);
    stock.rotation.z = 0.1;
    g.add(stock);
    const mag = new THREE10.Mesh(new THREE10.BoxGeometry(0.9, 3.5, 1.3), dark);
    mag.position.set(-1, -2.5, 0);
    g.add(mag);
    const grip = new THREE10.Mesh(new THREE10.BoxGeometry(1, 2, 1), wood);
    grip.position.set(0.5, -1.8, 0);
    g.add(grip);
  } else if (type === "python") {
    const frame = new THREE10.Mesh(new THREE10.BoxGeometry(3.5, 1.2, 1), dark);
    g.add(frame);
    const cyl = new THREE10.Mesh(new THREE10.CylinderGeometry(0.7, 0.7, 1, 8), metal);
    cyl.rotation.z = Math.PI / 2;
    cyl.position.set(-0.5, 0, 0);
    g.add(cyl);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.25, 0.25, 3, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(3, 0.2, 0);
    g.add(barrel);
    const grip = new THREE10.Mesh(new THREE10.BoxGeometry(0.8, 2, 0.9), wood);
    grip.position.set(-1.5, -1.2, 0);
    grip.rotation.z = 0.15;
    g.add(grip);
  } else if (type === "m249") {
    const recv = new THREE10.Mesh(new THREE10.BoxGeometry(8, 2, 1.6), olive);
    g.add(recv);
    const barrel = new THREE10.Mesh(new THREE10.CylinderGeometry(0.3, 0.3, 6, 6), dark);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(7, 0.2, 0);
    g.add(barrel);
    const stock = new THREE10.Mesh(new THREE10.BoxGeometry(3, 1.2, 1), olive);
    stock.position.set(-5.5, -0.3, 0);
    g.add(stock);
    const ammoBox = new THREE10.Mesh(new THREE10.BoxGeometry(1.5, 2, 1.5), olive);
    ammoBox.position.set(-0.5, -2, 0);
    g.add(ammoBox);
    const handle = new THREE10.Mesh(new THREE10.BoxGeometry(0.2, 0.8, 2), dark);
    handle.position.set(0, 1.5, 0);
    g.add(handle);
  } else if (type === "minigun") {
    const housing = new THREE10.Mesh(new THREE10.CylinderGeometry(1.2, 1.3, 3, 8), dark);
    housing.rotation.z = Math.PI / 2;
    housing.position.set(-2, 0, 0);
    g.add(housing);
    for (let i = 0; i < 6; i++) {
      const angle = i / 6 * Math.PI * 2;
      const tube = new THREE10.Mesh(new THREE10.CylinderGeometry(0.12, 0.12, 8, 4), dark);
      tube.rotation.z = Math.PI / 2;
      tube.position.set(2, Math.sin(angle) * 0.6, Math.cos(angle) * 0.6);
      g.add(tube);
    }
    const clamp = new THREE10.Mesh(new THREE10.CylinderGeometry(0.9, 0.9, 0.4, 8), metal);
    clamp.rotation.z = Math.PI / 2;
    clamp.position.set(4.5, 0, 0);
    g.add(clamp);
    const grip = new THREE10.Mesh(new THREE10.BoxGeometry(0.6, 1.8, 0.8), black);
    grip.position.set(-1, -1.8, 0);
    g.add(grip);
  }
  return g;
}
function _buildWeaponPickupGroup(w) {
  const g = new THREE10.Group();
  const model = _buildWeaponPickupModel(w.weapon);
  model.scale.set(1.5, 1.5, 1.5);
  model.position.y = 15;
  g.add(model);
  const glow = new THREE10.Mesh(new THREE10.SphereGeometry(12, 8, 8), new THREE10.MeshBasicMaterial({ color: WPCOL[w.weapon] || 16755200, transparent: true, opacity: 0.15 }));
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
  const ltex = new THREE10.CanvasTexture(lc);
  ltex.minFilter = THREE10.LinearFilter;
  const ls = new THREE10.Sprite(new THREE10.SpriteMaterial({ map: ltex, transparent: true, depthTest: false }));
  ls.position.set(0, 28, 0);
  ls.scale.set(30, 8, 1);
  g.add(ls);
  g.position.set(w.x, getTerrainHeight(w.x, w.y), w.y);
  return g;
}
function _buildFoodModel(type, golden) {
  const g = new THREE10.Group();
  if (golden) {
    const star = new THREE10.Mesh(new THREE10.OctahedronGeometry(6, 0), new THREE10.MeshLambertMaterial({ color: 16768256 }));
    const glow = new THREE10.Mesh(new THREE10.SphereGeometry(9, 6, 6), new THREE10.MeshBasicMaterial({ color: 16768256, transparent: true, opacity: 0.2 }));
    g.add(star);
    g.add(glow);
  } else if (type === "strawberry") {
    const body = new THREE10.Mesh(new THREE10.ConeGeometry(3.5, 7, 6), new THREE10.MeshLambertMaterial({ color: 16720452 }));
    body.rotation.x = Math.PI;
    body.position.y = 3.5;
    g.add(body);
    const leaf = new THREE10.Mesh(new THREE10.ConeGeometry(4, 2, 4), new THREE10.MeshLambertMaterial({ color: 2271778 }));
    leaf.position.y = 7.5;
    g.add(leaf);
  } else if (type === "cake") {
    const base = new THREE10.Mesh(new THREE10.CylinderGeometry(4, 4, 5, 8), new THREE10.MeshLambertMaterial({ color: 16764040 }));
    base.position.y = 2.5;
    g.add(base);
    const frosting = new THREE10.Mesh(new THREE10.CylinderGeometry(4.2, 4.2, 1.5, 8), new THREE10.MeshLambertMaterial({ color: 16746666 }));
    frosting.position.y = 5.5;
    g.add(frosting);
    const cherry = new THREE10.Mesh(new THREE10.SphereGeometry(1, 6, 6), new THREE10.MeshLambertMaterial({ color: 16711680 }));
    cherry.position.y = 7;
    g.add(cherry);
  } else if (type === "pizza") {
    const slice = new THREE10.Mesh(new THREE10.ConeGeometry(5, 1.5, 3), new THREE10.MeshLambertMaterial({ color: 16763972 }));
    slice.rotation.x = Math.PI / 2;
    slice.position.y = 3;
    g.add(slice);
    const pep1 = new THREE10.Mesh(new THREE10.CylinderGeometry(1, 1, 0.5, 6), new THREE10.MeshLambertMaterial({ color: 13378048 }));
    pep1.position.set(0, 3.8, -1);
    g.add(pep1);
    const pep2 = new THREE10.Mesh(new THREE10.CylinderGeometry(0.8, 0.8, 0.5, 6), new THREE10.MeshLambertMaterial({ color: 13378048 }));
    pep2.position.set(1.5, 3.8, 1);
    g.add(pep2);
  } else if (type === "icecream") {
    const cone = new THREE10.Mesh(new THREE10.ConeGeometry(3, 6, 6), new THREE10.MeshLambertMaterial({ color: 14527061 }));
    cone.rotation.x = Math.PI;
    cone.position.y = 3;
    g.add(cone);
    const scoop = new THREE10.Mesh(new THREE10.SphereGeometry(3.5, 6, 6), new THREE10.MeshLambertMaterial({ color: 16772829 }));
    scoop.position.y = 6.5;
    g.add(scoop);
    const scoop2 = new THREE10.Mesh(new THREE10.SphereGeometry(3, 6, 6), new THREE10.MeshLambertMaterial({ color: 16746666 }));
    scoop2.position.y = 9.5;
    g.add(scoop2);
  } else if (type === "donut") {
    const ring = new THREE10.Mesh(new THREE10.TorusGeometry(3, 1.5, 6, 12), new THREE10.MeshLambertMaterial({ color: 14527078 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 4;
    g.add(ring);
    const glaze = new THREE10.Mesh(new THREE10.TorusGeometry(3, 1.6, 6, 12), new THREE10.MeshLambertMaterial({ color: 16737962 }));
    glaze.rotation.x = Math.PI / 2;
    glaze.position.y = 4.5;
    glaze.scale.set(1, 1, 0.3);
    g.add(glaze);
  } else if (type === "cupcake") {
    const wrapper = new THREE10.Mesh(new THREE10.CylinderGeometry(3, 2.5, 4, 8), new THREE10.MeshLambertMaterial({ color: 16755268 }));
    wrapper.position.y = 2;
    g.add(wrapper);
    const swirl = new THREE10.Mesh(new THREE10.ConeGeometry(3.5, 5, 8), new THREE10.MeshLambertMaterial({ color: 16746700 }));
    swirl.position.y = 6.5;
    g.add(swirl);
  } else if (type === "cookie") {
    const disk = new THREE10.Mesh(new THREE10.CylinderGeometry(3.5, 3.5, 1.5, 8), new THREE10.MeshLambertMaterial({ color: 13404211 }));
    disk.position.y = 3;
    g.add(disk);
    for (let i = 0; i < 4; i++) {
      const chip = new THREE10.Mesh(new THREE10.SphereGeometry(0.6, 4, 4), new THREE10.MeshLambertMaterial({ color: 4465152 }));
      chip.position.set(Math.cos(i * 1.6) * 2, 4, Math.sin(i * 1.6) * 2);
      g.add(chip);
    }
  } else {
    const m = new THREE10.Mesh(new THREE10.SphereGeometry(4, 6, 6), new THREE10.MeshLambertMaterial({ color: 16724821 }));
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
  const nowMs = Date.now();
  const WEAPON_LIFETIME = 15e3;
  const WEAPON_BLINK_START = WEAPON_LIFETIME - 4e3;
  const BLINK_CYCLE = 0.33;
  for (const w of state_default.clientWeapons) {
    const wid = String(w.id);
    seenWp.add(wid);
    if (!_weaponMeshes[wid]) {
      const g2 = _buildWeaponPickupGroup(w);
      scene.add(g2);
      _weaponMeshes[wid] = g2;
    }
    const g = _weaponMeshes[wid];
    g.children[0].rotation.y = time * 2;
    g.children[0].position.y = 15 + Math.sin(time * 3 + w.x) * 3;
    const age = w.spawnTime ? nowMs - w.spawnTime : 0;
    if (age > WEAPON_BLINK_START) {
      const warningElapsed = age - WEAPON_BLINK_START;
      const t01 = Math.min(1, warningElapsed / 4e3);
      const visibleFrac = 0.85 - t01 * 0.75;
      const cyclePos = time % BLINK_CYCLE / BLINK_CYCLE;
      const v = cyclePos < visibleFrac;
      if (g.visible !== v) g.visible = v;
    } else if (!g.visible) {
      g.visible = true;
    }
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
    _WP_LABELS = { shotgun: "XM1014", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW", aug: "AUG", mp5k: "MP5SD", thompson: "THOMPSON", sks: "SKS", akm: "AK", python: "PYTHON", m249: "M249", minigun: "MINIGUN" };
  }
});

// client/projectiles.js
import * as THREE11 from "three";
function disposeRocketSound(id) {
  const s = rocketSounds[id];
  if (!s) return;
  try {
    s.osc.stop();
  } catch (e) {
  }
  try {
    s.osc.disconnect();
    s.gain.disconnect();
    if (s.panner) s.panner.disconnect();
  } catch (e) {
  }
  delete rocketSounds[id];
}
function clearRocketSounds() {
  for (const id in rocketSounds) disposeRocketSound(id);
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
      const m = new THREE11.Group();
      const casingMat = new THREE11.MeshBasicMaterial({ color: 11171652 });
      const casing = new THREE11.Mesh(new THREE11.CylinderGeometry(radius, radius, casingH, 8), casingMat);
      casing.rotation.x = Math.PI / 2;
      casing.position.z = -(casingH / 2 - length * 0.1);
      m.add(casing);
      const tipMat = new THREE11.MeshBasicMaterial({ color: col });
      const tip = new THREE11.Mesh(new THREE11.ConeGeometry(radius, coneH, 8), tipMat);
      tip.rotation.x = Math.PI / 2;
      tip.position.z = length / 2 - coneH / 2;
      m.add(tip);
      const glow = new THREE11.Mesh(new THREE11.CylinderGeometry(radius * 2.4, radius * 0.6, length * 1.5, 6), new THREE11.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 }));
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
        const panner = createPanner(p.x, p.y3d, p.y);
        g.connect(panner);
        o.start();
        rocketSounds[p.id] = { osc: o, gain: g, panner };
      }
    }
    if (p.cowtank && rocketSounds[p.id] && rocketSounds[p.id].panner) {
      setPannerPosition(rocketSounds[p.id].panner, p.x, p.y3d, p.y);
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
        // Torus is rotated by π/2 about X so the ring lies in world XZ.
        // After that rotation, the geo's local Z axis is world Y (height) —
        // collapsing sz keeps the splash a flat ring on the water surface
        // instead of a 3D balloon that puffs upward as it grows.
        sx: 1.5,
        sy: 1.5,
        sz: 1e-3,
        rotX: Math.PI / 2,
        life: 0.6,
        peakOpacity: 1,
        growth: 5,
        side: THREE11.DoubleSide
      });
    }
    if (p.y3d < terrH + 56) {
      for (const b of state_default.barricades) {
        const dxB = p.x - b.cx, dyB = p.y - b.cy;
        const cosA = b._cosA, sinA = b._sinA;
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
    if (state_default.debugMode) {
      if (!mesh.userData._dbgWire) {
        const wGeo = new THREE11.SphereGeometry(5, 6, 4);
        const wMat = new THREE11.MeshBasicMaterial({ color: 65280, wireframe: true });
        mesh.userData._dbgWire = new THREE11.Mesh(wGeo, wMat);
        mesh.add(mesh.userData._dbgWire);
      }
      mesh.userData._dbgWire.visible = true;
    } else if (mesh.userData._dbgWire) {
      mesh.userData._dbgWire.visible = false;
    }
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
      disposeRocketSound(p.id);
      state_default.projData.splice(i, 1);
    }
  }
  for (const id in rocketSounds) {
    if (!state_default.projMeshes[id]) disposeRocketSound(id);
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
import * as THREE12 from "three";
var init_zone = __esm({
  "client/zone.js"() {
    init_config();
    init_state();
    init_renderer();
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
    spectateMsg: document.getElementById("spectateMsg"),
    playerCount: document.getElementById("playerCount"),
    chatLog: document.getElementById("chatLog"),
    minimap: document.getElementById("minimap"),
    lowHealthOverlay: document.getElementById("lowHealthOverlay"),
    spawnProtOverlay: document.getElementById("spawnProtOverlay")
  };
  const spinBar = document.createElement("div");
  spinBar.id = "minigunSpinBar";
  spinBar.style.cssText = "position:fixed;bottom:120px;left:50%;transform:translateX(-50%);width:200px;display:none;z-index:50;pointer-events:none;";
  const spinTrack = document.createElement("div");
  spinTrack.id = "minigunSpinTrack";
  spinTrack.style.cssText = "width:100%;height:12px;background:rgba(0,0,0,0.6);border:1px solid #666;border-radius:3px;overflow:hidden;transition:box-shadow 0.15s;";
  const spinFill = document.createElement("div");
  spinFill.id = "minigunSpinFill";
  spinFill.style.cssText = "height:100%;width:0%;background:linear-gradient(90deg,#ff4400,#ffaa00);border-radius:2px;transition:width 0.08s linear,background 0.15s;";
  spinTrack.appendChild(spinFill);
  spinBar.appendChild(spinTrack);
  const spinLabel = document.createElement("div");
  spinLabel.id = "minigunSpinLabel";
  spinLabel.style.cssText = "color:#ffaa00;font-size:10px;text-align:center;margin-top:2px;letter-spacing:1px;font-weight:bold;text-shadow:0 0 3px rgba(0,0,0,0.8);transition:color 0.15s;";
  spinLabel.textContent = "SPIN UP [RMB]";
  spinBar.appendChild(spinLabel);
  if (!document.getElementById("minigunSpinKeys")) {
    const style = document.createElement("style");
    style.id = "minigunSpinKeys";
    style.textContent = "@keyframes minigunReadyPulse{0%,100%{box-shadow:0 0 4px rgba(0,255,68,0.5),inset 0 0 4px rgba(0,255,68,0.3);}50%{box-shadow:0 0 12px rgba(0,255,68,0.95),inset 0 0 6px rgba(0,255,68,0.5);}}";
    document.head.appendChild(style);
  }
  document.body.appendChild(spinBar);
  H.spinBar = spinBar;
  H.spinTrack = spinTrack;
  H.spinFill = spinFill;
  H.spinLabel = spinLabel;
  H._spinPrev = 0;
  H._spinState = "idle";
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
    H.xpBar.style.display = "none";
    H.dashBar.style.display = aliveDisp;
    H.atkBar.style.display = aliveDisp;
    H.crosshair.style.display = aliveDisp;
    H.barricadeBar.style.display = aliveDisp;
    H.barricadeLabel.style.display = aliveDisp;
  }
  if (H.spinBar) {
    const showSpin = aliveHud && me.weapon === "minigun";
    H.spinBar.style.display = showSpin ? "block" : "none";
    if (showSpin) {
      const spin = me.minigunSpin || 0;
      const pct = Math.min(100, spin * 100);
      H.spinFill.style.width = pct + "%";
      const dSpin = spin - H._spinPrev;
      let nextState;
      if (spin >= 0.99) nextState = "ready";
      else if (spin <= 1e-3) nextState = "idle";
      else if (dSpin > 5e-4) nextState = "up";
      else if (dSpin < -5e-4) nextState = "down";
      else nextState = H._spinState;
      if (nextState !== H._spinState) {
        H._spinState = nextState;
        if (nextState === "ready") {
          H.spinFill.style.background = "#00ff44";
          H.spinTrack.style.animation = "minigunReadyPulse 0.6s ease-in-out infinite";
          H.spinLabel.textContent = "READY [LMB]";
          H.spinLabel.style.color = "#00ff44";
        } else if (nextState === "down") {
          H.spinFill.style.background = "linear-gradient(90deg,#3399ff,#88ccff)";
          H.spinTrack.style.animation = "";
          H.spinTrack.style.boxShadow = "";
          H.spinLabel.textContent = "SPIN DOWN";
          H.spinLabel.style.color = "#88ccff";
        } else if (nextState === "up") {
          H.spinFill.style.background = "linear-gradient(90deg,#ff4400,#ffaa00)";
          H.spinTrack.style.animation = "";
          H.spinTrack.style.boxShadow = "";
          H.spinLabel.textContent = "SPINNING UP...";
          H.spinLabel.style.color = "#ffaa00";
        } else {
          H.spinFill.style.background = "linear-gradient(90deg,#ff4400,#ffaa00)";
          H.spinTrack.style.animation = "";
          H.spinTrack.style.boxShadow = "";
          H.spinLabel.textContent = "SPIN UP [RMB]";
          H.spinLabel.style.color = "#ffaa00";
        }
      }
      H._spinPrev = spin;
    } else if (H._spinState !== "idle") {
      H._spinState = "idle";
      H._spinPrev = 0;
      H.spinTrack.style.animation = "";
      H.spinTrack.style.boxShadow = "";
    }
  }
  if (!state_default._hudTick) state_default._hudTick = 0;
  state_default._hudTick += dt;
  if (state_default._hudTick >= 0.1 && state_default.chatLog.length > 0) {
    const tickDt = state_default._hudTick;
    state_default._hudTick = 0;
    for (let i = state_default.chatLog.length - 1; i >= 0; i--) {
      state_default.chatLog[i].t -= tickDt;
      if (state_default.chatLog[i].t <= 0) state_default.chatLog.splice(i, 1);
    }
    const chatEl = H.chatLog;
    if (chatEl) {
      const chatSig = state_default.chatLog.length + "|" + (state_default.chatLog[0] ? state_default.chatLog[0].text : "") + "|" + (state_default.chatLog.length > 1 ? state_default.chatLog[state_default.chatLog.length - 1].text : "");
      if (chatSig !== state_default._chatSig) {
        state_default._chatSig = chatSig;
        chatEl.innerHTML = state_default.chatLog.map((c) => {
          const opacity = Math.min(1, c.t / 3);
          if (c.system) {
            return '<div style="margin-bottom:2px;opacity:' + opacity + ';color:#ddd">' + c.text + "</div>";
          }
          const col = COL_HEX[c.color] || "#ff88aa";
          return '<div style="margin-bottom:2px;opacity:' + opacity + '"><span style="color:' + col + ';font-weight:bold">' + _escapeHtml(c.name) + ":</span> " + _escapeHtml(c.text) + "</div>";
        }).join("");
      }
    }
  } else if (state_default._hudTick >= 0.1) {
    state_default._hudTick = 0;
    if (H.chatLog && H.chatLog.innerHTML !== "") H.chatLog.innerHTML = "";
  }
  if (!me) return;
  const hPct = Math.max(0, me.hunger / 100);
  H.hungerFill.style.width = hPct * 100 + "%";
  H.hungerFill.style.background = hPct > 0.5 ? "#ffffff" : hPct > 0.25 ? "#dddddd" : "#ff4444";
  H.hungerTxt.textContent = "MILK " + Math.ceil(me.hunger) + "%";
  const wep = me.weapon || "normal";
  const wepNames = { shotgun: "XM1014", burst: "M16A2", bolty: "L96", cowtank: "M72 LAW", normal: "P250", aug: "AUG", mp5k: "MP5K", thompson: "Thompson", sks: "SKS", akm: "AK", knife: "Knife" };
  let ammoText = "", ammoCls = "";
  if (wep === "cowtank") {
    ammoText = "1/1";
  } else if (me.ammo >= 0) {
    const hasExt = (me.extMagMult || 1) > 1;
    const baseMag = (hasExt ? import_constants8.EXT_MAG_SIZES[wep] : import_constants8.MAG_SIZES[wep]) || 0;
    const dualMult = me.dualWield && import_constants8.DUAL_WIELD_FAMILY.has(wep) ? 2 : 1;
    const maxMag = baseMag * dualMult;
    ammoText = me.ammo + "/" + maxMag;
    if (me.alive && me.ammo <= 0 && !me.reloading && wep !== "minigun" && maxMag > 0) {
      const now = performance.now();
      if (!state_default._autoReloadAt || now - state_default._autoReloadAt > 300) {
        state_default._autoReloadAt = now;
        send({ type: "reload" });
      }
    }
    const ammoFrac = maxMag > 0 ? me.ammo / maxMag : 1;
    ammoCls = ammoFrac <= 0.25 ? "ammoCrit" : ammoFrac <= 0.5 ? "ammoLow" : "";
  }
  let reloadBlock = "";
  if (me.ammo >= 0 && me.reloading) {
    if (wep === "shotgun" && state_default._reloadLastAmmo != null && me.ammo !== state_default._reloadLastAmmo) {
      state_default._reloadStart = null;
    }
    if (!state_default._reloadStart) {
      state_default._reloadStart = performance.now();
      const RELOAD_MS = { burst: 3e3, mp5k: 3e3, thompson: 3e3, sks: 2500, akm: 3e3, aug: 3500, bolty: 2500, normal: 2e3 };
      const reloadMult = me.dualWield ? 2 : 1;
      state_default._reloadDuration = wep === "shotgun" ? 750 : (RELOAD_MS[wep] || 2e3) * reloadMult;
    }
    state_default._reloadLastAmmo = me.ammo;
    const elapsed = performance.now() - state_default._reloadStart;
    const pct = Math.min(100, elapsed / state_default._reloadDuration * 100);
    reloadBlock = '<div style="color:#ffaa44;font-size:0.35em;margin-bottom:4px;line-height:1">RELOADING...</div><div style="width:260px;height:10px;background:rgba(0,0,0,0.6);border-radius:3px;margin:0 0 8px auto"><div style="height:100%;border-radius:3px;background:#ffaa44;width:' + pct + '%"></div></div>';
  } else {
    state_default._reloadStart = null;
    state_default._reloadDuration = null;
    state_default._reloadLastAmmo = null;
  }
  clampFireMode(wep);
  let fireModeBlock = "";
  if (import_constants8.BURST_FAMILY.has(wep) && wep !== "thompson") {
    const modeLabel = state_default.fireMode === "auto" ? "AUTO" : state_default.fireMode === "semi" ? "SEMI" : "BURST";
    fireModeBlock = "<div>" + modeLabel + "</div>";
  }
  const dualTag = me.dualWield ? " \xD72" : "";
  if (!state_default._weaponDomReady) {
    H.weapon.innerHTML = '<div data-slot="reload"></div><div data-slot="body"></div>';
    state_default._weaponReloadEl = H.weapon.firstChild;
    state_default._weaponBodyEl = H.weapon.lastChild;
    state_default._weaponDomReady = true;
    state_default._reloadHtml = "";
    state_default._bodySig = "";
  }
  if (state_default._reloadHtml !== reloadBlock) {
    state_default._reloadHtml = reloadBlock;
    state_default._weaponReloadEl.innerHTML = reloadBlock;
  }
  const bodySig = wep + "|" + dualTag + "|" + fireModeBlock;
  if (state_default._bodySig !== bodySig) {
    state_default._bodySig = bodySig;
    state_default._weaponBodyEl.innerHTML = fireModeBlock + (wepNames[wep] || wep) + dualTag + ' <span data-slot="ammo"></span>';
    state_default._ammoSpan = state_default._weaponBodyEl.querySelector('[data-slot="ammo"]');
  }
  if (state_default._ammoSpan) {
    if (state_default._ammoSpan.textContent !== ammoText) state_default._ammoSpan.textContent = ammoText;
    if (state_default._ammoSpan.className !== ammoCls) state_default._ammoSpan.className = ammoCls;
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
    const augBase = (state_default.fireMode === "auto" ? 18 : 8) * 2.25;
    const mp5kBase = state_default.fireMode === "auto" ? 36 : 16;
    const baseSpread = { normal: 28, shotgun: 42, bolty: 5, cowtank: 10, burst: state_default.fireMode === "auto" ? 18 : 8, aug: augBase, mp5k: mp5kBase, thompson: 40, sks: 12, akm: state_default.fireMode === "auto" ? 24 : 10 }[wep] || 8;
    const crouchMult = state_default.crouching ? 0.35 : 1;
    const movingMult = state_default.keys["KeyW"] || state_default.keys["KeyS"] || state_default.keys["KeyA"] || state_default.keys["KeyD"] ? 2.2 : 1;
    const reloadMult = me.reloading ? 2.6 : 1;
    const fireMult = me.attackCooldown > 0 ? 1.6 : 1;
    const spread = Math.round(baseSpread * crouchMult * movingMult * reloadMult * fireMult);
    H.chN.style.marginTop = -spread - 8 + "px";
    H.chS.style.marginTop = spread + "px";
    H.chE.style.marginLeft = spread + "px";
    H.chW.style.marginLeft = -spread - 8 + "px";
  }
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
      let netLine = "";
      const ns = state_default.netStats;
      if (ns) {
        const tickRcv = ns._lastTickRcv || 0;
        const tickGap = ns._lastTickGap || 0;
        const tickRcvPct = tickRcv > 0 ? Math.round(tickRcv / (tickRcv + tickGap) * 100) : 0;
        let jitter = 0;
        if (ns.tickGaps.length > 1) {
          let mean = 0;
          for (const g of ns.tickGaps) mean += g;
          mean /= ns.tickGaps.length;
          let variance = 0;
          for (const g of ns.tickGaps) {
            const d = g - mean;
            variance += d * d;
          }
          jitter = Math.sqrt(variance / ns.tickGaps.length);
        }
        let snaps = 0, totalDrift = 0;
        for (const r of ns.reconcileSnapsWindow) {
          if (r.snapped) snaps++;
          totalDrift += r.drift;
        }
        const avgDrift = ns.reconcileSnapsWindow.length > 0 ? (totalDrift / ns.reconcileSnapsWindow.length).toFixed(2) : "0";
        netLine = "\nTICK rcv: " + tickRcvPct + "% (" + tickRcv + "/" + (tickRcv + tickGap) + ") jit=" + jitter.toFixed(1) + "ms\nRECONCILE: " + snaps + " snaps, drift avg " + avgDrift + "u";
      }
      dbg.textContent = "POS: " + me.x.toFixed(0) + ", " + me.y.toFixed(0) + ", " + (me.z || 0).toFixed(1) + "\nAIM: yaw=" + yawDeg + " pitch=" + pitchDeg + "\nWEP: " + (me.weapon || "normal") + " ammo=" + (me.ammo >= 0 ? me.ammo : "\u221E") + (state_default.fireMode ? " [" + state_default.fireMode + "]" : "") + "\nFPS: " + state_default.fpsDisplay + " PING: " + Math.round(state_default.pingVal) + "ms TRANSPORT: " + (getTransportKind() === "geckos" ? "WebRTC" : "WebSocket") + "\nPLAYERS: " + _aliveCount + "/" + state_default.serverPlayers.length + "\nPROJ: " + state_default.projData.length + netLine + iwLine;
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
var import_constants8, _escapeHtml, H;
var init_hud = __esm({
  "client/hud.js"() {
    init_config();
    init_state();
    import_constants8 = __toESM(require_constants());
    init_network();
    init_input();
    _escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    H = null;
  }
});

// client/bullet-holes.js
import * as THREE13 from "three";
function getTexture() {
  if (_tex) return _tex;
  const sz = 64;
  const c = document.createElement("canvas");
  c.width = sz;
  c.height = sz;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  g.addColorStop(0, "rgba(15,15,15,0.95)");
  g.addColorStop(0.3, "rgba(25,25,25,0.85)");
  g.addColorStop(0.6, "rgba(40,40,40,0.5)");
  g.addColorStop(0.85, "rgba(50,50,50,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  ctx.strokeStyle = "rgba(20,20,20,0.6)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const len = 8 + Math.random() * 16;
    ctx.beginPath();
    ctx.moveTo(sz / 2, sz / 2);
    ctx.lineTo(sz / 2 + Math.cos(angle) * len, sz / 2 + Math.sin(angle) * len);
    ctx.stroke();
  }
  _tex = new THREE13.CanvasTexture(c);
  _tex.minFilter = THREE13.LinearFilter;
  return _tex;
}
function spawnBulletHole(gameX, gameY, gameZ, surfaceKey) {
  if (typeof gameX !== "number" || typeof gameY !== "number" || typeof gameZ !== "number") return;
  if (_holes.length >= MAX_HOLES) {
    const old = _holes.shift();
    scene.remove(old.mesh);
    old.mat.dispose();
  }
  const mat = new THREE13.MeshBasicMaterial({
    map: getTexture(),
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE13.DoubleSide
  });
  const mesh = new THREE13.Mesh(_geo, mat);
  mesh.position.set(gameX, gameZ, gameY);
  const terrH = getTerrainHeight(gameX, gameY);
  const isGround = Math.abs(gameZ - terrH) < 3;
  if (isGround) {
    mesh.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
    mesh.position.y = terrH + 0.05;
  } else {
    _tmpLook.copy(cam.position);
    _tmpLook.y = mesh.position.y;
    mesh.lookAt(_tmpLook);
    mesh.rotation.z = Math.random() * Math.PI * 2;
  }
  scene.add(mesh);
  _holes.push({ mesh, mat, life: HOLE_LIFE, surfaceKey: surfaceKey || null });
}
function removeBulletHolesBySurfaceKey(surfaceKey) {
  if (!surfaceKey) return;
  for (let i = _holes.length - 1; i >= 0; i--) {
    if (_holes[i].surfaceKey === surfaceKey) {
      scene.remove(_holes[i].mesh);
      _holes[i].mat.dispose();
      _holes.splice(i, 1);
    }
  }
}
function updateBulletHoles(dt) {
  for (let i = _holes.length - 1; i >= 0; i--) {
    const h = _holes[i];
    h.life -= dt;
    if (h.life <= 0) {
      scene.remove(h.mesh);
      h.mat.dispose();
      _holes.splice(i, 1);
    }
  }
}
function clearBulletHoles() {
  for (const h of _holes) {
    scene.remove(h.mesh);
    h.mat.dispose();
  }
  _holes.length = 0;
}
var HOLE_LIFE, MAX_HOLES, HOLE_SIZE, _geo, _tex, _holes, _tmpLook;
var init_bullet_holes = __esm({
  "client/bullet-holes.js"() {
    init_renderer();
    init_terrain();
    HOLE_LIFE = 30;
    MAX_HOLES = 200;
    HOLE_SIZE = 3;
    _geo = new THREE13.PlaneGeometry(HOLE_SIZE, HOLE_SIZE);
    _tex = null;
    _holes = [];
    _tmpLook = new THREE13.Vector3();
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
      projectile: "projectile",
      projectileHit: "projectileHit",
      tracer: "tracer",
      wallImpact: "wallImpact",
      explosion: "explosion",
      chat: "chat",
      // barricadePlaced, barricadeDestroyed, barricadeHit, wallDestroyed, wallDamaged
      // — removed, state rides the tick payload (walls/barricades arrays).
      kill: "kill",
      winner: "winner",
      restart: "restart",
      levelup: "levelup",
      cowstrikeWarning: "cowstrikeWarning",
      cowstrike: "cowstrike",
      botsToggled: "botsToggled",
      botsFreeWillToggled: "botsFreeWillToggled",
      nightToggled: "nightToggled",
      // weaponPickup, weaponSpawn, weaponDespawn, weaponDrop, food, eat,
      // armorPickup, armorSpawn — removed, state rides tick payload.
      reloaded: "reloaded",
      shellLoaded: "shellLoaded",
      emptyMag: "emptyMag",
      shieldHit: "shieldHit",
      shieldBreak: "shieldBreak",
      newHost: "newHost",
      kicked: "kicked",
      mooTaunt: "mooTaunt",
      meleeSwing: "meleeSwing",
      meleeHit: "meleeHit"
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
      placeBarricade: "placeBarricade",
      chat: "chat",
      dropWeapon: "dropWeapon",
      minigunSpin: "minigunSpin",
      switchWeapon: "switchWeapon",
      setUpdateRate: "setUpdateRate",
      moo: "moo",
      meleeAttack: "meleeAttack",
      debugJoin: "debugJoin"
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
      GRAVITY,
      BARRICADE_HEIGHT,
      PLAYER_WALL_INFLATE,
      HEAVY_WEAPON_SPEED,
      MINIGUN_SPUN_SPEED_MULT,
      MINIGUN_SLOW_DELAY_S
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
        const walkMult = input.walking ? PLAYER_WALK_MULT : 1;
        const inputSpeedMult = input.speedMult != null ? input.speedMult : 1;
        let heavyMult = 1;
        if (p.weapon === "minigun") {
          heavyMult = HEAVY_WEAPON_SPEED.minigun;
          const spin = p._minigunSpinTime != null ? p._minigunSpinTime : p.minigunSpin || 0;
          if (spin >= MINIGUN_SLOW_DELAY_S) heavyMult = MINIGUN_SPUN_SPEED_MULT;
        } else if (HEAVY_WEAPON_SPEED[p.weapon]) {
          heavyMult = HEAVY_WEAPON_SPEED[p.weapon];
        }
        const speed = PLAYER_BASE_SPEED * sizeSlowdown * p.perks.speedMult * walkMult * inputSpeedMult * heavyMult;
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
function setCurrentInput(dx, dy, walking, aim) {
  currentInput.dx = dx;
  currentInput.dy = dy;
  currentInput.walking = walking;
  if (typeof aim === "number") currentInput.aim = aim;
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
    perks: p.perks || buildPredictedPerks(p),
    isBot: false,
    // Heavy-weapon slow inputs — shared/movement.js reads these to decide
    // whether to apply the minigun/m249 speed penalty.
    weapon: p.weapon || "normal",
    minigunSpin: p.minigunSpin || 0
  };
}
function initPrediction() {
  if (!state_default.me) return;
  state_default.mePredicted = snapshotPlayer(state_default.me);
  predictRing.length = 0;
  accumulator = 0;
  _prevPredicted._set = false;
  errX = 0;
  errY = 0;
  errZ = 0;
  _predictErrorLogged = false;
}
function refreshWorld() {
  _world.walls = state_default.mapFeatures.walls || [];
  _world.barricades = state_default.barricades || [];
  _world.zone = state_default.serverZone;
  return _world;
}
function getRenderedPredicted() {
  if (!state_default.mePredicted) return null;
  const f = Math.max(0, Math.min(1, accumulator / TICK_DT));
  if (!_prevPredicted._set) {
    _renderedOut.x = state_default.mePredicted.x;
    _renderedOut.y = state_default.mePredicted.y;
    _renderedOut.z = state_default.mePredicted.z;
    return _renderedOut;
  }
  _renderedOut.x = _prevPredicted.x + (state_default.mePredicted.x - _prevPredicted.x) * f;
  _renderedOut.y = _prevPredicted.y + (state_default.mePredicted.y - _prevPredicted.y) * f;
  _renderedOut.z = _prevPredicted.z + (state_default.mePredicted.z - _prevPredicted.z) * f;
  return _renderedOut;
}
function computeLocalSpeedMult() {
  const mp = state_default.mePredicted;
  let mult = 1;
  if (mp && mp.weapon === "knife") mult *= import_constants9.KNIFE_SPEED_MULT;
  if (state_default.localHitSlowEndsAt > performance.now()) mult *= import_constants9.HIT_SLOW_MULT;
  return mult;
}
function mirrorServerScalars() {
  const sm = state_default.me, mp = state_default.mePredicted;
  mp.weapon = sm.weapon || "normal";
  mp.minigunSpin = sm.minigunSpin || 0;
  mp.foodEaten = sm.foodEaten || 0;
  mp.stunTimer = sm.stunTimer || 0;
  if (sm.spawnProt) mp.spawnProtection = 1;
  if (mp.perks) {
    mp.perks.speedMult = sm.speedMult != null ? sm.speedMult : 1;
    mp.perks.sizeMult = sm.sizeMult != null ? sm.sizeMult : 1;
  }
}
function predictStep(frameDt) {
  if (!state_default.mePredicted || !state_default.me) return;
  mirrorServerScalars();
  accumulator += frameDt;
  if (accumulator > 0.25) accumulator = 0.25;
  const world = refreshWorld();
  while (accumulator >= TICK_DT) {
    accumulator -= TICK_DT;
    _prevPredicted.x = state_default.mePredicted.x;
    _prevPredicted.y = state_default.mePredicted.y;
    _prevPredicted.z = state_default.mePredicted.z;
    _prevPredicted._set = true;
    _stepInput.dx = currentInput.dx;
    _stepInput.dy = currentInput.dy;
    _stepInput.walking = !!currentInput.walking;
    _stepInput.speedMult = computeLocalSpeedMult();
    send({ type: "move", dx: _stepInput.dx, dy: _stepInput.dy, walking: _stepInput.walking, aim: currentInput.aim, speedMult: _stepInput.speedMult });
    if (state_default.pingLast === 0) state_default.pingLast = performance.now();
    const seqAtStep = state_default.inputSeq;
    try {
      (0, import_movement.stepPlayerMovement)(state_default.mePredicted, TICK_DT, world, _stepInput, terrain);
    } catch (e) {
      if (!_predictErrorLogged) {
        _predictErrorLogged = true;
        console.error("[prediction] stepPlayerMovement threw:", e);
      }
      accumulator = 0;
      return;
    }
    predictRing.push({ seq: seqAtStep, state: snapshotPlayer(state_default.mePredicted), input: { dx: _stepInput.dx, dy: _stepInput.dy, walking: _stepInput.walking, speedMult: _stepInput.speedMult } });
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
  for (let i = 0; i < predictRing.length; i++) {
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
  const ns = state_default.netStats;
  const nowMs = performance.now();
  ns.reconcileSnapsWindow.push({ t: nowMs, drift, snapped: drift > RECONCILE_EPSILON });
  while (ns.reconcileSnapsWindow.length > 0 && nowMs - ns.reconcileSnapsWindow[0].t > 1e3) {
    ns.reconcileSnapsWindow.shift();
  }
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
  const world = refreshWorld();
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
var import_movement, import_constants9, TICK_HZ, TICK_DT, RECONCILE_EPSILON, PREDICT_RING_CAP, terrain, accumulator, errX, errY, errZ, errRemainTime, ERR_LINEAR_TIME, ERR_INSTANT_SNAP, ERR_DEAD_ZONE, predictRing, currentInput, _world, _stepInput, _predictErrorLogged, _prevPredicted, _renderedOut;
var init_prediction = __esm({
  "client/prediction.js"() {
    init_state();
    import_movement = __toESM(require_movement());
    init_terrain();
    init_network();
    import_constants9 = __toESM(require_constants());
    TICK_HZ = import_constants9.TICK_RATE;
    TICK_DT = 1 / TICK_HZ;
    RECONCILE_EPSILON = 2;
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
    currentInput = { dx: 0, dy: 0, walking: false, aim: 0 };
    _world = { walls: null, barricades: null, zone: null };
    _stepInput = { dx: 0, dy: 0, walking: false, speedMult: 1 };
    _predictErrorLogged = false;
    _prevPredicted = { x: 0, y: 0, z: 0, _set: false };
    _renderedOut = { x: 0, y: 0, z: 0 };
  }
});

// client/message-handlers.js
import * as THREE14 from "three";
function _preload(file) {
  if (_audioCache[file]) return;
  const a = new Audio(file);
  a.preload = "auto";
  a.load();
  _audioCache[file] = a;
}
function playSfx(file, baseVol = 0.3) {
  const cached = _audioCache[file];
  const snd = cached ? cached.cloneNode() : new Audio(file);
  if (!cached) _preload(file);
  const vol = (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5) * baseVol;
  snd.volume = vol * (0.9 + Math.random() * 0.2);
  snd.playbackRate = 0.93 + Math.random() * 0.14;
  snd.play().catch(() => {
  });
}
function forceUnADS() {
  if (!state_default.adsActive) return;
  state_default.adsActive = false;
  state_default.adsLocked = false;
  cam.fov = 75;
  cam.updateProjectionMatrix();
  const sO = document.getElementById("scopeOverlay");
  if (sO) sO.style.display = "none";
  const aO = document.getElementById("augScopeOverlay");
  if (aO) aO.style.display = "none";
  document.getElementById("crosshair").style.display = "block";
  const vg = getVmGroup();
  if (vg) vg.visible = true;
}
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
function flashEdge(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = "none";
  el.style.opacity = "1";
  void el.offsetHeight;
  el.style.transition = "";
  el.style.opacity = "0";
}
function addKillFeed(txt, t) {
  state_default.chatLog.push({ name: "", color: "", text: txt, t, system: true });
  if (state_default.chatLog.length > 10) state_default.chatLog.shift();
}
function updateHostControls() {
  const hc = document.getElementById("hostControls");
  if (!hc) return;
  const inLobby = state_default.state === "lobby" && state_default.hostId && state_default.myId === state_default.hostId;
  hc.style.display = inLobby ? "block" : "none";
}
var import_messages, import_constants10, _tmpDir, _audioCache, _hitFlash, handlers;
var init_message_handlers = __esm({
  "client/message-handlers.js"() {
    init_state();
    init_audio();
    init_renderer();
    init_weapons_view();
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
    import_constants10 = __toESM(require_constants());
    init_config();
    init_snapshot();
    init_prediction();
    init_bullet_holes();
    _tmpDir = new THREE14.Vector3();
    _audioCache = {};
    [
      "mp5sd-shot.ogg",
      "python-shot.ogg",
      "thompson-shot.ogg",
      "ak-shot.ogg",
      "m16-shot.ogg",
      "aug-shot.ogg",
      "headshot.mp3",
      "hitmarker.mp3",
      "weapon-pickup.mp3",
      "shield-pickup.mp3",
      "minigunA.ogg",
      "minigunB.ogg",
      "minigunC.ogg",
      "minigunD.ogg",
      "LRA.ogg",
      "LRB.ogg",
      "LRC.ogg",
      "LRD.ogg"
    ].forEach(_preload);
    _hitFlash = null;
    handlers = {
      serverStatus(msg) {
        const el = document.getElementById("gameStatus");
        if (el) {
          if (msg.debugScene) {
            el.textContent = "\u{1F527} DEBUG MODE \u2014 " + (msg.total || 0) + " player" + ((msg.total || 0) !== 1 ? "s" : "");
            el.style.color = "#ffaa44";
          } else if (msg.gameState === "playing") {
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
        document.title = (msg.debugScene ? "[DEBUG] " : "") + "Strawberry Cow";
        const jb = document.getElementById("joinBtn");
        if (jb && !state_default.myId) {
          jb.textContent = msg.debugScene ? "JOIN DEBUG" : msg.gameState === "playing" ? "SPECTATE MEADOW" : "QUEUE FOR MEADOW";
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
        try {
          closeActive();
        } catch (e) {
        }
      },
      lobby(msg) {
        const cd = msg.countdown > 0 ? " (" + msg.countdown + "s)" : "";
        const readyTxt = msg.allReady ? "All ready! Starting" + cd : "Waiting for cows to ready up";
        if (!state_default._botRevealTime) state_default._botRevealTime = Date.now() + 3e3;
        const botsRevealed = Date.now() > state_default._botRevealTime;
        const isHost = state_default.hostId === state_default.myId;
        const pList = msg.players.map((p) => {
          if (p.isBot && !botsRevealed) return '<div style="color:#ff8888;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#555;margin-right:6px;vertical-align:middle"></span><span style="display:inline-block;width:120px;text-align:left">Connecting<span style="display:inline-block;width:18px;text-align:left">' + ".".repeat(1 + Math.floor(Date.now() / 500) % 3) + "</span></span> \u23F3</div>";
          const dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (COL_HEX[p.color] || "#aaa") + ';margin-right:6px;vertical-align:middle"></span>';
          const crown = p.id === state_default.hostId && !p.isBot ? " \u{1F451}" : "";
          const canKick = isHost && !p.isBot && p.id !== state_default.myId;
          const kickBtn = canKick ? ' <span onclick="window.kickPlayer(' + p.id + ')" style="cursor:pointer;color:#ff4444;float:right;font-weight:bold" title="Kick">\u2715</span>' : "";
          return '<div style="color:' + (p.ready ? "#88ff88" : "#ff8888") + ';padding:2px 0">' + dot + (p.name || "?") + crown + (p.isBot ? " \u{1F916}" : p.ready ? " \u2714" : " ...") + kickBtn + "</div>";
        }).join("");
        document.getElementById("joinScreen").querySelector("h2").innerHTML = readyTxt + '<div style="margin-top:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(204,136,255,0.3);border-radius:8px;padding:8px 16px;font-size:13px;max-height:200px;overflow-y:auto;width:260px;text-align:left">' + pList + "</div>";
        const jb = document.getElementById("joinBtn");
        if (jb && state_default.myId) {
          const myLobby = msg.players.find((p) => p.id === state_default.myId);
          if (myLobby) {
            if (myLobby.ready) {
              jb.textContent = "UNREADY \u2714";
              jb.style.background = "#88ff88";
              jb.style.color = "#000";
            } else {
              jb.textContent = "READY TO GRAZE";
              jb.style.background = "#44ff44";
              jb.style.color = "#000";
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
        state_default.localHitSlowEndsAt = 0;
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
        state_default.localHitSlowEndsAt = 0;
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
        state_default.chatLog = [];
        state_default.fireMode = "auto";
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
        clearBulletHoles();
      },
      // 40 Hz tick broadcast with full player state (mutable + sticky fields).
      // Merges into serverPlayers in-place. Position rendering for remote players
      // comes from SI interpolation; this merge keeps HUD/kill-feed data current.
      tick(msg) {
        if (typeof msg.tickNum === "number") {
          const ns = state_default.netStats;
          const recvT = performance.now();
          if (state_default.lastTickNum > 0 && msg.tickNum > state_default.lastTickNum + 1) {
            ns.tickGapCount += msg.tickNum - state_default.lastTickNum - 1;
          }
          ns.tickRcvCount++;
          if (ns.lastTickRecvT > 0) {
            ns.tickGaps.push(recvT - ns.lastTickRecvT);
            if (ns.tickGaps.length > 30) ns.tickGaps.shift();
          }
          ns.lastTickRecvT = recvT;
          ns.tickArrivals.push(recvT);
          while (ns.tickArrivals.length > 0 && recvT - ns.tickArrivals[0] > 1e3) {
            ns.tickArrivals.shift();
          }
          if (recvT - (ns._windowStart || 0) > 1e3) {
            ns._lastTickRcv = ns.tickRcvCount;
            ns._lastTickGap = ns.tickGapCount;
            ns.tickRcvCount = 0;
            ns.tickGapCount = 0;
            ns._windowStart = recvT;
          }
          state_default.lastTickNum = msg.tickNum;
        }
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
        if (typeof msg.snapSeq === "number") state_default.lastRecvSnapSeq = msg.snapSeq;
        const tickPlayers = msg.snapshot ? msg.snapshot.state : msg.players || [];
        const isKeyframe = !!msg.keyframe;
        if (isKeyframe) {
          state_default.serverPlayers = tickPlayers.map((t) => ({ ...t }));
        } else {
          const byId = /* @__PURE__ */ new Map();
          for (const sp of state_default.serverPlayers) byId.set(sp.id, sp);
          for (const t of tickPlayers) {
            const existing = byId.get(t.id);
            if (!existing) {
              state_default.serverPlayers.push({ ...t });
              continue;
            }
            if (existing.id === state_default.myId) {
              const { aimAngle, dir, ...rest } = t;
              Object.assign(existing, rest);
            } else {
              Object.assign(existing, t);
            }
          }
          if (msg.removedIds) {
            const removed = new Set(msg.removedIds);
            state_default.serverPlayers = state_default.serverPlayers.filter((p) => !removed.has(p.id));
          }
        }
        for (const t of tickPlayers) {
          const cachedP = state_default.serverPlayers.find((sp) => sp.id === t.id);
          if (t.justDashed && cachedP) {
            const smooth = cachedP.id === state_default.myId ? { x: cachedP.x, y: cachedP.y } : getInterpolatedEntity(cachedP);
            const th = getTerrainHeight(smooth.x, smooth.y);
            for (let i = 0; i < 15; i++) {
              const sz = 3 + Math.random() * 4;
              spawnParticle({ geo: PGEO_SPHERE_LO, color: 13421772, x: smooth.x + (Math.random() - 0.5) * 20, y: th + 5 + Math.random() * 15, z: smooth.y + (Math.random() - 0.5) * 20, sx: sz, life: 0.8 + Math.random() * 0.4, peakOpacity: 0.6, vy: 30, growth: 1.8 });
            }
            sfx(300, 0.15, "sine", 0.08);
          }
          if (t.justEliminated) {
            const name = cachedP && cachedP.name || t.name || "?";
            addKillFeed(name + " eliminated (#" + (t.eliminatedRank || "?") + ")", 5);
            if (t.id === state_default.myId) {
              sfxDeath();
              state_default.perkMenuOpen = false;
              state_default.pendingLevelUps = 0;
              const pm = document.getElementById("perkMenu");
              if (pm) pm.style.display = "none";
              if (state_default.killerId) state_default.spectateTargetId = state_default.killerId;
              else {
                const firstAlive = state_default.serverPlayers.find((sp) => sp.alive && sp.id !== state_default.myId);
                if (firstAlive) state_default.spectateTargetId = firstAlive.id;
              }
            }
          }
        }
        if (msg.snapshot) {
          const fullState = state_default.serverPlayers.map((p) => ({ ...p }));
          addSnapshot({ id: msg.snapshot.id, time: msg.snapshot.time, state: fullState });
        }
        if (msg.walls) {
          const wallById = /* @__PURE__ */ new Map();
          for (const w of msg.walls) wallById.set(w.id, w);
          if (state_default.mapFeatures && state_default.mapFeatures.walls) {
            for (let i = state_default.mapFeatures.walls.length - 1; i >= 0; i--) {
              const cached = state_default.mapFeatures.walls[i];
              if (!wallById.has(cached.id)) {
                destroyWall(cached.id);
                onHouseWallDestroyed(cached.id);
                removeBulletHolesBySurfaceKey("wall:" + cached.id);
                state_default.mapFeatures.walls.splice(i, 1);
              }
            }
            for (const w of state_default.mapFeatures.walls) {
              const svr = wallById.get(w.id);
              if (svr) w.hp = svr.hp;
            }
          }
        }
        if (msg.barricades) {
          const bById = /* @__PURE__ */ new Map();
          for (const b of msg.barricades) bById.set(b.id, b);
          for (let i = state_default.barricades.length - 1; i >= 0; i--) {
            const cached = state_default.barricades[i];
            if (!bById.has(cached.id)) {
              const pos = { x: cached.cx, y: getTerrainHeight(cached.cx, cached.cy) + 20, z: cached.cy };
              removeBarricade(cached.id);
              removeBulletHolesBySurfaceKey("barricade:" + cached.id);
              sfx(300, 0.08, "square", 0.05, pos);
              sfx(150, 0.15, "sawtooth", 0.04, pos);
            }
          }
          const existingIds = new Set(state_default.barricades.map((b) => b.id));
          for (const b of msg.barricades) {
            if (!existingIds.has(b.id)) {
              addBarricade({ id: b.id, cx: b.cx, cy: b.cy, w: b.w, h: b.h, angle: b.angle });
              if (b.ownerId === state_default.myId) {
                state_default.barricadeReadyAt = performance.now() + 5e3;
                sfx(200, 0.08, "square", 0.08);
                sfx(150, 0.12, "triangle", 0.06);
              }
            }
          }
        }
        if (msg.foodIds) {
          const serverFoodIds = new Set(msg.foodIds);
          state_default.serverFoods = state_default.serverFoods.filter((f) => serverFoodIds.has(f.id));
        }
        if (msg.weaponPickups) {
          const wpById = /* @__PURE__ */ new Map();
          for (const w of msg.weaponPickups) wpById.set(w.id, w);
          state_default.clientWeapons = state_default.clientWeapons.filter((w) => wpById.has(w.id));
          const existingWpIds = new Set(state_default.clientWeapons.map((w) => w.id));
          for (const w of msg.weaponPickups) {
            if (!existingWpIds.has(w.id)) {
              state_default.clientWeapons.push({ id: w.id, x: w.x, y: w.y, weapon: w.weapon });
            }
          }
        }
        if (msg.armorPickups) {
          setArmorSpawns(msg.armorPickups);
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
        if (state_default.me && state_default.me.weapon && state_default._lastWeapon && state_default.me.weapon !== state_default._lastWeapon && state_default.me.weapon !== "normal") {
          playSfx("weapon-pickup.mp3", 0.4);
        }
        if (state_default.me && state_default._lastArmor !== void 0 && state_default.me.armor > state_default._lastArmor) {
          playSfx("shield-pickup.mp3", 0.4);
        }
        if (state_default.me) {
          state_default._lastWeapon = state_default.me.weapon;
          state_default._lastArmor = state_default.me.armor || 0;
        }
        if (msg.zone) state_default.serverZone = msg.zone;
        if (state_default.pingLast > 0) {
          const pd = performance.now() - state_default.pingLast;
          if (pd < 2e3) state_default.pingVal = state_default.pingVal * 0.7 + pd * 0.3;
          state_default.pingLast = 0;
        }
      },
      // Seq-based input ack — server echoes the highest applied input seq plus
      // the authoritative position at that tick. Local player reconciliation
      // compares predicted-at-seq against this to detect and correct drift.
      inputAck(msg) {
        if (typeof msg.seq !== "number" || msg.seq <= state_default.lastAckedInput) return;
        if (typeof msg.x !== "number" || typeof msg.y !== "number" || typeof msg.z !== "number") return;
        state_default.lastAckedInput = msg.seq;
        if (state_default.mePredicted) {
          if (typeof msg.stunTimer === "number") state_default.mePredicted.stunTimer = msg.stunTimer;
          if (typeof msg.spawnProt === "boolean") state_default.mePredicted.spawnProtection = msg.spawnProt ? 1 : 0;
        }
        reconcilePrediction({
          x: msg.x,
          y: msg.y,
          z: msg.z,
          vz: msg.vz || 0,
          onGround: !!msg.onGround
        });
      },
      // playerSnapshot removed — sticky fields now included in every tick.
      // food, eat — removed, state rides tick payload (foodIds array).
      projectile(msg) {
        let vy3d = msg.vz || 0, spawnH = msg.z || 15 + getTerrainHeight(msg.x, msg.y);
        let spawnX = msg.x, spawnZ = msg.y;
        if (msg.ownerId === state_default.myId) {
          const myWep = state_default.me ? state_default.me.weapon : "normal";
          notifyShotFired(myWep);
          const MUZZLES = {
            normal: { x: 2, y: -2.8, z: -13 },
            shotgun: { x: 2, y: -0.8, z: -24 },
            burst: { x: 3.5, y: -2.6, z: -22 },
            bolty: { x: 0, y: -4, z: -26 },
            cowtank: { x: 2, y: -3, z: -22 },
            aug: { x: 3.5, y: -2.6, z: -22 },
            mp5k: { x: 2, y: -2.8, z: -16 },
            thompson: { x: 2, y: -2.5, z: -18 },
            sks: { x: 2.5, y: -2.6, z: -22 },
            akm: { x: 2.5, y: -2.6, z: -20 }
          };
          let m = MUZZLES[myWep] || MUZZLES.normal;
          if (myWep === "burst" && state_default.me && state_default.me.dualWield && msg.muzzle === 1) {
            m = { x: m.x - 9, y: m.y, z: m.z };
          }
          if (myWep === "shotgun" && state_default.me && state_default.me.dualWield && msg.muzzle === 1) {
            m = { x: m.x - 9, y: m.y, z: m.z };
          }
          if (myWep === "mp5k" && state_default.me && state_default.me.dualWield && msg.muzzle === 1) {
            m = { x: m.x - 8, y: m.y, z: m.z };
          }
          if (myWep === "bolty" && !state_default.adsActive) {
            m = { x: 3, y: -3.5, z: -26 };
          }
          if (myWep === "aug" && state_default.adsActive) {
            m = { x: 0, y: -3.5, z: -22 };
          }
          _tmpDir.set(m.x, m.y, m.z).applyQuaternion(cam.quaternion);
          spawnX = cam.position.x + _tmpDir.x;
          spawnH = cam.position.y + _tmpDir.y;
          spawnZ = cam.position.z + _tmpDir.z;
          if (state_default.cameraMode === "third" && !state_default.adsActive) {
            const cm = state_default.cowMeshes[String(state_default.myId)] && state_default.cowMeshes[String(state_default.myId)].mesh;
            if (cm) {
              const cosY = Math.cos(state_default.yaw), sinY = Math.sin(state_default.yaw);
              spawnX = cm.position.x + 9 * cosY;
              spawnH = cm.position.y + 20;
              spawnZ = cm.position.z - 9 * sinY;
            }
          }
        }
        if (msg.shotgun !== void 0) {
          vy3d += (Math.random() - 0.5) * 150;
        }
        let projVx = msg.vx, projVy = msg.vy, projVy3d = vy3d;
        if (msg.ownerId === state_default.myId) {
          const speed = Math.hypot(msg.vx, msg.vy);
          const convergeT = 0.12;
          const cx = msg.x + msg.vx * convergeT;
          const cy = msg.y + msg.vy * convergeT;
          const cz = (msg.z || spawnH) + vy3d * convergeT;
          const dx = cx - spawnX, dy = cy - spawnZ, dz = cz - spawnH;
          const dLen = Math.hypot(dx, dy);
          if (dLen > 1) {
            projVx = dx / dLen * speed;
            projVy = dy / dLen * speed;
            projVy3d = dz / dLen * speed;
          }
        }
        state_default.projData.push({ id: msg.id, x: spawnX, y: spawnZ, vx: projVx, vy: projVy, color: msg.color || "pink", bolty: msg.bolty, cowtank: msg.cowtank, y3d: spawnH, vy3d: projVy3d, _lastTrailPos: msg.bolty ? { x: spawnX, y: spawnH, z: spawnZ } : void 0 });
        if (msg.ownerId !== state_default.myId) {
          const th = getTerrainHeight(msg.x, msg.y);
          const pos = { x: msg.x, y: th + 50, z: msg.y };
          if (msg.tankCannon) {
            sfxRocket(0.6, pos);
            sfxExplosion(0.45, pos);
          } else if (msg.bolty) sfxBolty(0.1, pos);
          else if (msg.cowtank) sfxRocket(0.12, pos);
          else if (msg.shotgun !== void 0) sfxShotgun(0.1, pos);
          else if (msg.burst !== void 0) sfxLR(0.1, pos);
          else sfx(400, 0.12, "square", 0.08, pos);
        }
        if (msg.ownerId === state_default.myId) {
          const myWep = state_default.me ? state_default.me.weapon : "normal";
          if (msg.shotgun === false) {
          } else if (myWep === "bolty" || msg.bolty) {
            sfxBolty();
            setTimeout(() => {
              forceUnADS();
              state_default._boltRacking = true;
            }, 100);
            setTimeout(() => {
              state_default._boltRacking = false;
            }, 2500);
          } else if (myWep === "cowtank" || msg.cowtank) sfxRocket(0.12);
          else if (msg.shotgun === true) sfxShotgun(0.1);
          else if (myWep === "shotgun") sfxShotgun(0.1);
          else if (import_constants10.BURST_FAMILY.has(myWep) || msg.burst !== void 0) sfxLR(0.1);
          else sfxShoot();
          if (msg.shotgun === false) {
          } else {
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
              ],
              // AKM — heavy upward pull with wider lateral wander than M16.
              // More pronounced = harder to control but rewards spray control.
              akm: [
                { p: 0.018, y: 4e-3 },
                { p: 0.02, y: 6e-3 },
                { p: 0.017, y: -3e-3 },
                { p: 0.021, y: -7e-3 },
                { p: 0.019, y: 5e-3 },
                { p: 0.022, y: 8e-3 },
                { p: 0.018, y: -6e-3 },
                { p: 0.02, y: -9e-3 },
                { p: 0.017, y: 4e-3 },
                { p: 0.021, y: 7e-3 },
                { p: 0.023, y: -5e-3 },
                { p: 0.019, y: -8e-3 },
                { p: 0.018, y: 6e-3 },
                { p: 0.02, y: 9e-3 },
                { p: 0.017, y: -4e-3 },
                { p: 0.022, y: -7e-3 },
                { p: 0.019, y: 5e-3 },
                { p: 0.021, y: 8e-3 },
                { p: 0.018, y: -6e-3 },
                { p: 0.02, y: -9e-3 },
                { p: 0.017, y: 3e-3 },
                { p: 0.023, y: 7e-3 },
                { p: 0.019, y: -5e-3 },
                { p: 0.021, y: -8e-3 },
                { p: 0.018, y: 4e-3 },
                { p: 0.02, y: 6e-3 },
                { p: 0.017, y: -3e-3 },
                { p: 0.022, y: -7e-3 },
                { p: 0.019, y: 5e-3 },
                { p: 0.021, y: 8e-3 }
              ],
              // SKS — random per-shot recoil, no repeating pattern. Each shot
              // kicks a random amount up + random yaw. Marksman feel.
              sks: [
                { p: () => 0.015 + Math.random() * 0.012, y: () => (Math.random() - 0.5) * 0.012 }
              ],
              // Thompson — steady upward climb with slight rightward drift,
              // 1.1x MP5K magnitude. Heavier gun = more predictable but stronger pull.
              thompson: [
                { p: 0.016, y: 2e-3 },
                { p: 0.017, y: 3e-3 },
                { p: 0.015, y: 4e-3 },
                { p: 0.018, y: 5e-3 },
                { p: 0.016, y: 3e-3 },
                { p: 0.017, y: 4e-3 },
                { p: 0.015, y: 2e-3 },
                { p: 0.018, y: 5e-3 },
                { p: 0.016, y: 3e-3 },
                { p: 0.017, y: -2e-3 },
                { p: 0.019, y: -3e-3 },
                { p: 0.016, y: -1e-3 },
                { p: 0.018, y: 4e-3 },
                { p: 0.017, y: 3e-3 },
                { p: 0.015, y: 2e-3 },
                { p: 0.016, y: 5e-3 },
                { p: 0.018, y: 4e-3 },
                { p: 0.017, y: 3e-3 },
                { p: 0.015, y: -2e-3 },
                { p: 0.019, y: -3e-3 }
              ],
              // MP5K — fast erratic jitter, 1.2x LR magnitude, bias upward-left
              // then correcting right. Stockless = less predictable.
              mp5k: [
                { p: 0.014, y: -5e-3 },
                { p: 0.016, y: -8e-3 },
                { p: 0.013, y: -3e-3 },
                { p: 0.015, y: 6e-3 },
                { p: 0.018, y: 9e-3 },
                { p: 0.014, y: 4e-3 },
                { p: 0.012, y: -7e-3 },
                { p: 0.017, y: -0.01 },
                { p: 0.013, y: -5e-3 },
                { p: 0.016, y: 8e-3 },
                { p: 0.019, y: 7e-3 },
                { p: 0.014, y: 3e-3 },
                { p: 0.013, y: -6e-3 },
                { p: 0.015, y: -8e-3 },
                { p: 0.012, y: -4e-3 },
                { p: 0.016, y: 7e-3 },
                { p: 0.018, y: 9e-3 },
                { p: 0.013, y: 5e-3 },
                { p: 0.014, y: -6e-3 },
                { p: 0.017, y: -9e-3 },
                { p: 0.012, y: -3e-3 },
                { p: 0.015, y: 8e-3 },
                { p: 0.019, y: 0.01 },
                { p: 0.013, y: 4e-3 },
                { p: 0.014, y: -5e-3 },
                { p: 0.016, y: -7e-3 },
                { p: 0.012, y: -2e-3 },
                { p: 0.015, y: 6e-3 },
                { p: 0.018, y: 8e-3 },
                { p: 0.013, y: 3e-3 }
              ],
              // AUG — vertical-dominant kick with a slow rightward drift, very
              // different from the M16 snake. Bullpup centerline = predictable
              // pitch ramp, then a small lateral creep that the player has to
              // pull against.
              aug: [
                { p: 0.014, y: 1e-3 },
                { p: 0.013, y: 2e-3 },
                { p: 0.012, y: 3e-3 },
                { p: 0.012, y: 4e-3 },
                { p: 0.011, y: 4e-3 },
                { p: 0.011, y: 5e-3 },
                { p: 0.01, y: 5e-3 },
                { p: 0.01, y: 6e-3 },
                { p: 9e-3, y: 6e-3 },
                { p: 9e-3, y: -2e-3 },
                { p: 8e-3, y: -3e-3 },
                { p: 8e-3, y: -4e-3 },
                { p: 9e-3, y: -1e-3 },
                { p: 0.01, y: 1e-3 },
                { p: 0.011, y: 3e-3 }
              ],
              // Python — heavy vertical kick, revolver feel
              python: [
                { p: 0.04, y: () => (Math.random() - 0.5) * 8e-3 }
              ],
              // M249 — medium sustained recoil, slight wander
              m249: [
                { p: 0.015, y: 3e-3 },
                { p: 0.016, y: -2e-3 },
                { p: 0.014, y: 4e-3 },
                { p: 0.017, y: -3e-3 },
                { p: 0.015, y: 2e-3 },
                { p: 0.016, y: -4e-3 },
                { p: 0.014, y: 5e-3 },
                { p: 0.017, y: -2e-3 },
                { p: 0.015, y: 3e-3 },
                { p: 0.016, y: -5e-3 },
                { p: 0.014, y: 4e-3 },
                { p: 0.017, y: -3e-3 }
              ],
              // Minigun — low per-shot recoil, constant vibration
              minigun: [
                { p: 5e-3, y: () => (Math.random() - 0.5) * 6e-3 }
              ]
            };
            const pattern = recoilPatterns[wep];
            if (pattern && state_default.me) {
              const now = performance.now();
              if (now - state_default.recoilTimer > 500) state_default.recoilIndex = 0;
              state_default.recoilTimer = now;
              const r = pattern[state_default.recoilIndex % pattern.length];
              const burstMod = import_constants10.BURST_FAMILY.has(wep) && state_default.fireMode === "burst" ? 0.65 : 1;
              const tacticowMod = state_default.me.recoilMult || 1;
              const walkingMod = state_default.crouching ? 0.73 : 1;
              const dualMod = state_default.me.dualWield ? wep === "shotgun" ? 1.1 : 1.3 : 1;
              const augHipMod = wep === "aug" && !state_default.adsActive ? 2.25 : 1;
              const recoilMult = burstMod * tacticowMod * walkingMod * dualMod * augHipMod;
              const rp = typeof r.p === "function" ? r.p() : r.p;
              const ry = typeof r.y === "function" ? r.y() : r.y;
              state_default.pitch += rp * recoilMult;
              state_default.yaw += ry * recoilMult;
              state_default.pitch = Math.max(-1.2, Math.min(1.2, state_default.pitch));
              state_default.recoilIndex++;
            }
          }
        }
      },
      wallImpact(msg) {
        const th = getTerrainHeight(msg.x, msg.y);
        const impactZ = msg.z != null ? msg.z : th + 30;
        for (let i = 0; i < 5; i++) {
          spawnParticle({
            geo: PGEO_SPHERE_LO,
            color: 16768324,
            x: msg.x + (Math.random() - 0.5) * 8,
            y: impactZ + (Math.random() - 0.5) * 8,
            z: msg.y + (Math.random() - 0.5) * 8,
            sx: 0.8,
            life: 0.4,
            peakOpacity: 1,
            vx: (Math.random() - 0.5) * 40,
            vy: (Math.random() - 0.5) * 40,
            vz: (Math.random() - 0.5) * 40
          });
        }
        const wallKey = msg.wallId != null ? "wall:" + msg.wallId : null;
        spawnBulletHole(msg.x, msg.y, impactZ, wallKey);
        if (state_default.debugMode && msg.ownerId === state_default.myId) {
          const dbgGeo = new THREE14.BoxGeometry(3, 3, 3);
          const dbgMat = new THREE14.MeshBasicMaterial({ color: 3377407, transparent: true, opacity: 0.8 });
          const dbgCube = new THREE14.Mesh(dbgGeo, dbgMat);
          dbgCube.position.set(msg.x, impactZ, msg.y);
          scene.add(dbgCube);
          setTimeout(() => {
            scene.remove(dbgCube);
            dbgGeo.dispose();
            dbgMat.dispose();
          }, 4e3);
        }
      },
      projectileHit(msg) {
        state_default.projData = state_default.projData.filter((p) => p.id !== msg.projectileId);
        if (state_default.projMeshes[msg.projectileId]) {
          disposeMeshTree(state_default.projMeshes[msg.projectileId]);
          delete state_default.projMeshes[msg.projectileId];
        }
        const _hitTarget = msg.targetId ? state_default.serverPlayers.find((p) => p.id === msg.targetId) : null;
        if (state_default.debugMode && msg.ownerId === state_default.myId) {
          let hx, hy, hz;
          if (msg.wall && typeof msg.x === "number") {
            hx = msg.x;
            hz = msg.y;
            hy = typeof msg.z === "number" ? msg.z : getTerrainHeight(msg.x, msg.y);
          } else if (_hitTarget) {
            hx = _hitTarget.x;
            hz = _hitTarget.y;
            hy = (_hitTarget.z || 0) + getTerrainHeight(_hitTarget.x, _hitTarget.y) + 20;
          }
          if (hx != null) {
            const dbgGeo = new THREE14.BoxGeometry(3, 3, 3);
            const dbgMat = new THREE14.MeshBasicMaterial({ color: 16711680, transparent: true, opacity: 0.7 });
            const dbgCube = new THREE14.Mesh(dbgGeo, dbgMat);
            dbgCube.position.set(hx, hy, hz);
            scene.add(dbgCube);
            setTimeout(() => {
              scene.remove(dbgCube);
              dbgGeo.dispose();
              dbgMat.dispose();
            }, 1e4);
          }
        }
        if (msg.targetId === state_default.myId) {
          sfxHit();
          flashHit(0.5, 150);
          flashEdge("damageEdgeFlash");
          const newEnd = performance.now() + import_constants10.HIT_SLOW_DURATION_MS;
          if (newEnd > state_default.localHitSlowEndsAt) state_default.localHitSlowEndsAt = newEnd;
        }
        if (msg.wall && typeof msg.x === "number" && typeof msg.y === "number") {
          const terrainH = getTerrainHeight(msg.x, msg.y);
          const z = typeof msg.z === "number" ? msg.z : terrainH + 5;
          const surfaceKey = msg.wallId != null ? "wall:" + msg.wallId : msg.barricadeId != null ? "barricade:" + msg.barricadeId : null;
          spawnBulletHole(msg.x, msg.y, z, surfaceKey);
          const onGround = Math.abs(z - terrainH) < 1.5;
          const sparkColor = onGround ? 5622835 : 16768324;
          const sparkCount = onGround ? 7 : 4;
          const sparkSpread = onGround ? 60 : 40;
          const sparkScale = onGround ? 0.6 : 0.7;
          for (let i = 0; i < sparkCount; i++) {
            spawnParticle({
              geo: PGEO_SPHERE_LO,
              color: sparkColor,
              x: msg.x + (Math.random() - 0.5) * 4,
              y: z + (Math.random() - 0.5) * 4 + (onGround ? 1 : 0),
              z: msg.y + (Math.random() - 0.5) * 4,
              sx: sparkScale,
              life: onGround ? 0.55 : 0.35,
              peakOpacity: 1,
              vx: (Math.random() - 0.5) * sparkSpread,
              vy: onGround ? 8 + Math.random() * 22 : (Math.random() - 0.5) * sparkSpread,
              vz: (Math.random() - 0.5) * sparkSpread,
              gy: onGround ? 60 : 0
            });
          }
          if (!onGround) {
            spawnParticle({
              geo: PGEO_SPHERE_LO,
              color: 12303291,
              x: msg.x,
              y: z,
              z: msg.y,
              sx: 2,
              life: 0.5,
              peakOpacity: 1,
              noFade: true,
              growth: 4,
              vy: 12
            });
          }
        }
        if (msg.targetId && msg.ownerId === state_default.myId && msg.targetId !== state_default.myId) {
          const snd = new Audio(msg.headshot ? "headshot.mp3" : "hitmarker.mp3");
          snd.volume = (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5) * 0.5;
          snd.play().catch(() => {
          });
          const hm = document.getElementById("hitMarker");
          if (hm) {
            hm.classList.toggle("head", !!msg.headshot);
            hm.classList.add("show");
            clearTimeout(window._hitMarkerTimer);
            window._hitMarkerTimer = setTimeout(() => {
              hm.classList.remove("show");
            }, msg.headshot ? 260 : 160);
          }
        }
        if (msg.targetId && !msg.wall) {
          const target = _hitTarget;
          if (target) {
            const smooth = target.id === state_default.myId ? { x: target.x, y: target.y, z: target.z } : getInterpolatedEntity(target);
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
          const target = _hitTarget;
          if (target) {
            const dmg = msg.dmg;
            const hasShield = target.armor > 0;
            const color = msg.headshot ? "#ff2222" : hasShield ? dmg >= 25 ? "#1144aa" : dmg >= 10 ? "#3377cc" : "#88bbff" : dmg >= 25 ? "#ff4444" : dmg >= 10 ? "#ffaa44" : "#ffffff";
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
            const tex = new THREE14.CanvasTexture(nc);
            tex.minFilter = THREE14.LinearFilter;
            const mat = new THREE14.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
            const sprite = new THREE14.Sprite(mat);
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
      // Hitscan tracer — cosmetic visual from shooter to impact point.
      // Animated at bullet speed, auto-disposes on arrival.
      tracer(msg) {
        const fromX = msg.fromX, fromY = msg.fromY, fromZ = msg.fromZ;
        let toX = msg.toX, toY = msg.toY, toZ = msg.toZ;
        const travelTime = (msg.travelTime || 0.1) * 1e3;
        let spawnX = fromX, spawnY = fromY, spawnZ = fromZ;
        if (msg.ownerId === state_default.myId) {
          const wep = state_default.me ? state_default.me.weapon : "normal";
          notifyShotFired(wep);
          const MUZZLES = {
            normal: { x: 2, y: -2.8, z: -13 },
            shotgun: { x: 2, y: -0.8, z: -24 },
            burst: { x: 3.5, y: -2.6, z: -22 },
            bolty: { x: 0, y: -4, z: -26 },
            cowtank: { x: 2, y: -3, z: -22 },
            aug: { x: 3.5, y: -2.6, z: -22 },
            mp5k: { x: 2, y: -2.8, z: -16 },
            thompson: { x: 2, y: -2.5, z: -18 },
            sks: { x: 2.5, y: -2.6, z: -22 },
            akm: { x: 2.5, y: -2.6, z: -20 },
            python: { x: 2, y: -2.8, z: -10 },
            m249: { x: 3, y: -2.5, z: -22 },
            minigun: { x: 0, y: -3, z: -24 }
          };
          const m = MUZZLES[wep] || MUZZLES.normal;
          const pitchSteep = Math.abs(state_default.pitch) > 0.6;
          if (pitchSteep) {
            spawnX = cam.position.x;
            spawnZ = cam.position.y;
            spawnY = cam.position.z;
          } else {
            const mDir = new THREE14.Vector3(m.x, m.y, m.z).applyQuaternion(cam.quaternion);
            spawnX = cam.position.x + mDir.x;
            spawnZ = cam.position.y + mDir.y;
            spawnY = cam.position.z + mDir.z;
          }
          if (state_default.cameraMode === "third" && !state_default.adsActive) {
            const cm = state_default.cowMeshes[String(state_default.myId)] && state_default.cowMeshes[String(state_default.myId)].mesh;
            if (cm) {
              const cosY = Math.cos(state_default.yaw), sinY = Math.sin(state_default.yaw);
              spawnX = cm.position.x + 9 * cosY;
              spawnZ = cm.position.y + 20;
              spawnY = cm.position.z - 9 * sinY;
            }
          }
          if (wep === "bolty") {
            sfxBolty();
            if (state_default.adsActive) state_default.adsLocked = true;
            setTimeout(() => {
              forceUnADS();
              state_default._boltRacking = true;
            }, 100);
            setTimeout(() => {
              state_default._boltRacking = false;
            }, 2500);
          } else if (wep === "shotgun") sfxShotgun(0.1);
          else if (wep === "mp5k") {
            playSfx("mp5sd-shot.ogg", 0.12);
          } else if (wep === "python") {
            playSfx("python-shot.ogg", 0.4);
          } else if (wep === "thompson") {
            playSfx("thompson-shot.ogg", 0.3);
          } else if (wep === "akm" || wep === "sks") {
            playSfx("ak-shot.ogg", 0.35);
          } else if (wep === "burst") playSfx("m16-shot.ogg", 0.35);
          else if (wep === "aug") playSfx("aug-shot.ogg", 0.35);
          else if (wep === "m249") playSfx(["LRA.ogg", "LRB.ogg", "LRC.ogg", "LRD.ogg"][Math.random() * 4 | 0], 0.3);
          else if (wep === "minigun") playSfx(["minigunA.ogg", "minigunB.ogg", "minigunC.ogg", "minigunD.ogg"][Math.random() * 4 | 0], 0.25);
          else if (import_constants10.BURST_FAMILY.has(wep)) sfxLR(0.1);
          else sfxShoot();
          const HITSCAN_RECOIL = {
            normal: { p: 8e-3, y: 0 },
            minigun: { p: 5e-3, y: 0 },
            m249: { p: 0.015, y: 3e-3 },
            python: { p: 0.04, y: 0 },
            thompson: { p: 0.016, y: 2e-3 },
            mp5k: { p: 0.014, y: -5e-3 },
            burst: { p: 0.012, y: 3e-3 },
            aug: { p: 0.012, y: 3e-3 },
            akm: { p: 0.018, y: 4e-3 },
            sks: { p: 0.015, y: 0 },
            bolty: { p: 0.05, y: 5e-3 },
            shotgun: { p: 0.03, y: 0 }
          };
          if (state_default.me) {
            const r = HITSCAN_RECOIL[wep] || HITSCAN_RECOIL.normal;
            const now = performance.now();
            if (now - state_default.recoilTimer > 500) state_default.recoilIndex = 0;
            state_default.recoilTimer = now;
            const tacticowMod = state_default.me.recoilMult || 1;
            const walkingMod = state_default.crouching ? 0.73 : 1;
            const dualMod = state_default.me.dualWield ? 1.3 : 1;
            const augHipMod = wep === "aug" && !state_default.adsActive ? 2.25 : 1;
            const recoilMult = tacticowMod * walkingMod * dualMod * augHipMod;
            state_default.pitch += r.p * recoilMult;
            state_default.yaw += (typeof r.y === "number" ? r.y : (Math.random() - 0.5) * 6e-3) * recoilMult;
            state_default.pitch = Math.max(-1.2, Math.min(1.2, state_default.pitch));
            state_default.recoilIndex++;
          }
        } else {
          const th = getTerrainHeight(fromX, fromY);
          const pos = { x: fromX, y: th + 50, z: fromY };
          if (msg.weapon === "bolty") sfxBolty(0.1, pos);
          else if (msg.weapon === "shotgun") sfxShotgun(0.1, pos);
          else if (msg.weapon === "mp5k") {
            playSfx("mp5sd-shot.ogg", 0.15);
          } else if (msg.weapon === "python") {
            playSfx("python-shot.ogg", 0.2);
          } else if (msg.weapon === "thompson") {
            playSfx("thompson-shot.ogg", 0.15);
          } else if (msg.weapon === "akm" || msg.weapon === "sks") {
            playSfx("ak-shot.ogg", 0.17);
          } else if (msg.weapon === "burst") playSfx("m16-shot.ogg", 0.17);
          else if (msg.weapon === "aug") playSfx("aug-shot.ogg", 0.17);
          else if (msg.weapon === "m249") playSfx(["LRA.ogg", "LRB.ogg", "LRC.ogg", "LRD.ogg"][Math.random() * 4 | 0], 0.15);
          else if (msg.weapon === "minigun") playSfx(["minigunA.ogg", "minigunB.ogg", "minigunC.ogg", "minigunD.ogg"][Math.random() * 4 | 0], 0.12);
          else if (import_constants10.BURST_FAMILY.has(msg.weapon)) sfxLR(0.1, pos);
          else sfxShoot(0.07, pos);
        }
        const isBolty = msg.weapon === "bolty";
        const sz = isBolty ? 1.5 : 0.75;
        const length = sz * (isBolty ? 16 : 12), radius = sz * 0.7;
        const group = new THREE14.Group();
        const casingMat = new THREE14.MeshBasicMaterial({ color: 11171652 });
        const casing = new THREE14.Mesh(new THREE14.CylinderGeometry(radius, radius, length * 0.6, 8), casingMat);
        casing.rotation.x = Math.PI / 2;
        group.add(casing);
        const tipMat = new THREE14.MeshBasicMaterial({ color: 16768392 });
        const tip = new THREE14.Mesh(new THREE14.ConeGeometry(radius, length * 0.4, 8), tipMat);
        tip.rotation.x = Math.PI / 2;
        tip.position.z = length / 2;
        group.add(tip);
        const glowColor = isBolty ? 16777164 : 16768392;
        const glowOpacity = isBolty ? 0.5 : 0.25;
        const glowLen = isBolty ? length * 3 : length * 1.5;
        const glow = new THREE14.Mesh(new THREE14.CylinderGeometry(radius * 2.4, radius * 0.6, glowLen, 6), new THREE14.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: glowOpacity }));
        glow.rotation.x = Math.PI / 2;
        glow.position.z = -length * 0.6;
        group.add(glow);
        group.position.set(spawnX, spawnZ, spawnY);
        group.lookAt(toX, toZ, toY);
        scene.add(group);
        const WATER_Y = -30;
        const startsAbove = spawnZ > WATER_Y;
        const endsAbove = toZ > WATER_Y;
        if (startsAbove !== endsAbove) {
          const tCross = (WATER_Y - spawnZ) / (toZ - spawnZ);
          const wxX = spawnX + (toX - spawnX) * tCross;
          const wxY = spawnY + (toY - spawnY) * tCross;
          if (getTerrainHeight(wxX, wxY) < WATER_Y) {
            setTimeout(() => {
              spawnParticle({
                geo: PGEO_TORUS,
                color: 16777215,
                x: wxX,
                y: WATER_Y + 0.3,
                z: wxY,
                // sz collapsed — see projectiles.js water-splash for the rotation/axis math.
                sx: 1.5,
                sy: 1.5,
                sz: 1e-3,
                rotX: Math.PI / 2,
                life: 0.6,
                peakOpacity: 1,
                growth: 5,
                side: THREE14.DoubleSide
              });
            }, tCross * travelTime);
          }
        }
        const startT = performance.now();
        const anim = () => {
          const elapsed = performance.now() - startT;
          const progress = Math.min(1, elapsed / travelTime);
          const x = spawnX + (toX - spawnX) * progress;
          const y = spawnY + (toY - spawnY) * progress;
          const z = spawnZ + (toZ - spawnZ) * progress;
          group.position.set(x, z, y);
          if (isBolty && progress < 1) {
            for (let ti = 0; ti < 4; ti++) {
              spawnParticle({
                geo: PGEO_SPHERE_LO,
                color: 16777164,
                x: x + (Math.random() - 0.5) * 2,
                y: z + (Math.random() - 0.5) * 2,
                z: y + (Math.random() - 0.5) * 2,
                sx: 0.7 + Math.random() * 0.5,
                life: 1.2,
                peakOpacity: 0.85,
                growth: -0.3
              });
            }
          }
          const ahead = Math.min(1, progress + 0.05);
          const ax = spawnX + (toX - spawnX) * ahead;
          const ay = spawnY + (toY - spawnY) * ahead;
          const az = spawnZ + (toZ - spawnZ) * ahead;
          group.lookAt(ax, az, ay);
          if (progress >= 1) {
            scene.remove(group);
            casingMat.dispose();
            tipMat.dispose();
            glow.material.dispose();
            casing.geometry.dispose();
            tip.geometry.dispose();
            glow.geometry.dispose();
            const impX = toX, impY = toY, impZ = toZ;
            const isShotgun = msg.weapon === "shotgun";
            if (state_default.debugMode && msg.ownerId === state_default.myId) {
              const dbgGeo = new THREE14.BoxGeometry(3, 3, 3);
              const dbgMat = new THREE14.MeshBasicMaterial({ color: 16711680, transparent: true, opacity: 0.7 });
              const dbgCube = new THREE14.Mesh(dbgGeo, dbgMat);
              dbgCube.position.set(impX, impZ || getTerrainHeight(impX, impY), impY);
              scene.add(dbgCube);
              setTimeout(() => {
                scene.remove(dbgCube);
                dbgGeo.dispose();
                dbgMat.dispose();
              }, 1e4);
            }
            if (msg.hit) {
              const target = state_default.serverPlayers.find((p) => p.id === msg.hit);
              if (target) {
                const tz = (target.z || 0) + getTerrainHeight(target.x, target.y);
                const impactY3d = msg.headshot ? tz + 36 : tz + 20;
                const count = isShotgun ? 2 : msg.headshot ? 18 : 8;
                for (let i = 0; i < count; i++) {
                  spawnParticle({ geo: PGEO_SPHERE_LO, color: 16720418, x: target.x + (Math.random() - 0.5) * 8, y: impactY3d + (Math.random() - 0.5) * 8, z: target.y + (Math.random() - 0.5) * 8, sx: msg.headshot ? 1.2 : 0.8, life: 0.6, peakOpacity: 1, vx: (Math.random() - 0.5) * 60, vy: 10 + Math.random() * 30, vz: (Math.random() - 0.5) * 60, gy: 80 });
                }
              }
              if (msg.ownerId === state_default.myId && msg.hit !== state_default.myId) {
                const snd = new Audio(msg.headshot ? "headshot.mp3" : "hitmarker.mp3");
                snd.volume = (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5) * 0.5;
                snd.play().catch(() => {
                });
                const hm = document.getElementById("hitMarker");
                if (hm) {
                  hm.style.display = "block";
                  setTimeout(() => {
                    hm.style.display = "none";
                  }, msg.headshot ? 250 : 150);
                }
              }
              if (msg.hit === state_default.myId) {
                sfxHit();
                flashHit(0.5, 150);
                flashEdge("damageEdgeFlash");
                const newEnd = performance.now() + import_constants10.HIT_SLOW_DURATION_MS;
                if (newEnd > state_default.localHitSlowEndsAt) state_default.localHitSlowEndsAt = newEnd;
              }
            } else {
              const terrH = getTerrainHeight(impX, impY);
              const iz = impZ || terrH + 5;
              spawnBulletHole(impX, impY, iz, null);
              const onGround = Math.abs(iz - terrH) < 1.5;
              const sparkColor = onGround ? 5622835 : 16768324;
              const sparkCount = isShotgun ? 2 : onGround ? 7 : 4;
              for (let i = 0; i < sparkCount; i++) {
                spawnParticle({ geo: PGEO_SPHERE_LO, color: sparkColor, x: impX + (Math.random() - 0.5) * 4, y: iz + (Math.random() - 0.5) * 4, z: impY + (Math.random() - 0.5) * 4, sx: 0.6, life: 0.4, peakOpacity: 1, vx: (Math.random() - 0.5) * 40, vy: 10 + Math.random() * 20, vz: (Math.random() - 0.5) * 40, gy: 60 });
              }
              if (!onGround && !isShotgun) {
                spawnParticle({ geo: PGEO_SPHERE_LO, color: 12303291, x: impX, y: iz, z: impY, sx: 2, life: 0.5, peakOpacity: 0.5, growth: 4, vy: 12 });
              }
            }
            return;
          }
          requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
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
            x: ex + (Math.random() - 0.5) * er * 0.4,
            y: th + 5 + Math.random() * 15,
            z: ey + (Math.random() - 0.5) * er * 0.4,
            sx: smokeSize,
            life: 6 + Math.random() * 1.5,
            peakOpacity: 1,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 2,
            vz: (Math.random() - 0.5) * 2,
            growth: 0.3
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
          side: THREE14.DoubleSide
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
        sfxExplosion(0.15, { x: ex, y: th + 10, z: ey });
      },
      // eliminated — now handled via justEliminated event flag in tick handler.
      chat(msg) {
        state_default.chatLog.push({ name: msg.name, color: msg.color, text: msg.text, t: 10 });
        if (state_default.chatLog.length > 6) state_default.chatLog.shift();
        if (msg.playerId != null) showChatBubble(msg.playerId, msg.text);
      },
      mooTaunt(msg) {
        if (msg.playerId != null) showChatBubble(msg.playerId, "moo!");
        if (msg.playerId === state_default.myId) sfxMoo();
        else sfxMoo(0.18, { x: msg.x, y: getTerrainHeight(msg.x, msg.y) + 40, z: msg.y });
      },
      meleeSwing(msg) {
        const th = getTerrainHeight(msg.x, msg.y);
        sfxMeleeSwing({ x: msg.x, y: th + 40, z: msg.y });
      },
      meleeHit(msg) {
        const th = getTerrainHeight(msg.x, msg.y);
        sfxMeleeHit({ x: msg.x, y: th + 40, z: msg.y });
        if (msg.targetId === state_default.myId) {
          flashHit(0.55, 220);
        }
      },
      // barricadePlaced — now detected via tick barricade state diff.
      // barricadeDestroyed, barricadeHit, wallDestroyed, wallDamaged
      // — removed, state changes detected via tick wall/barricade arrays.
      kill(msg) {
        addKillFeed("\u{1F480} " + (msg.killerName || "?") + " \u2192 " + (msg.victimName || "?"), 5);
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
          const v = 0.32 * (typeof state_default.masterVol !== "undefined" ? state_default.masterVol : 0.5);
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
        state_default.chatLog = [];
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
        const jbReset = document.getElementById("joinBtn");
        if (jbReset) {
          jbReset.textContent = "QUEUE FOR MEADOW";
          jbReset.style.background = "";
          jbReset.style.color = "";
          jbReset.style.display = "";
        }
        startMenuMusic();
      },
      levelup(msg) {
        if (!state_default.me || !state_default.me.alive) return;
        sfxLevelUp();
        flashEdge("levelupEdgeFlash");
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
              side: THREE14.DoubleSide
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
      // dash — now handled via justDashed event flag in tick handler.
      // weaponPickup, weaponSpawn, weaponDespawn, weaponDrop
      // — removed, state rides tick payload (weaponPickups array).
      reloaded(msg) {
        if (msg.playerId !== state_default.myId) return;
        addKillFeed("Reloaded!", 1.5);
        if (import_constants10.BURST_FAMILY.has(msg.weapon)) sfxReloadLR();
        else if (msg.weapon === "bolty") sfxReloadBolty();
        else if (msg.weapon === "shotgun") sfxShellLoad();
      },
      shellLoaded(msg) {
        if (msg.playerId === state_default.myId) sfxShellLoad();
      },
      emptyMag(msg) {
        sfxEmptyMag();
        forceUnADS();
      },
      // armorPickup, armorSpawn — removed, state rides tick payload (armorPickups array).
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
        sfx(800, 0.1, "sine", 0.05, { x: msg.x, y: th + 20, z: msg.y });
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
          side: THREE14.DoubleSide
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
import * as THREE15 from "three";
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
    init_bullet_holes();
    init_message_handlers();
    init_snapshot();
    init_prediction();
    setVmGroupRef(getVmGroup);
    var _tmpFwd = new THREE15.Vector3();
    var _tmpRight = new THREE15.Vector3();
    var _tmpDir2 = new THREE15.Vector3();
    var _tmpEuler = new THREE15.Euler(0, 0, 0, "YXZ");
    var last = performance.now();
    var frameCount = 0;
    function loop(ts) {
      frameCount++;
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
      updateInterpolation(frameCount);
      const now = Date.now();
      let spectatingTarget = false;
      if ((!me || !me.alive) && state_default.state === "playing") {
        let target = null, firstAlive = null;
        for (const p of state_default.serverPlayers) {
          if (!p.alive || p.id === state_default.myId) continue;
          if (!firstAlive) firstAlive = p;
          if (p.id === state_default.spectateTargetId) {
            target = p;
            break;
          }
        }
        if (!target && firstAlive) {
          target = firstAlive;
          state_default.spectateTargetId = target.id;
        }
        if (target) {
          spectatingTarget = true;
          const smooth = getInterpolatedEntity(target);
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
      let curMx = 0, curMz = 0;
      let curAim = 0;
      const curWalking = !!state_default.crouching;
      if (me && me.alive) {
        _tmpFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
        _tmpFwd.y = 0;
        if (_tmpFwd.length() > 0.01) _tmpFwd.normalize();
        else _tmpFwd.set(0, 0, -1);
        _tmpRight.set(-_tmpFwd.z, 0, _tmpFwd.x);
        curAim = Math.atan2(_tmpFwd.x, _tmpFwd.z);
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
        const curLen = Math.hypot(curMx, curMz);
        if (curLen > 0) {
          curMx /= curLen;
          curMz /= curLen;
        }
      }
      if (me && me.alive) {
        setCurrentInput(curMx, curMz, curWalking, curAim);
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
        let upOff = 0;
        if (state_default.cameraMode === "third" && !state_default.adsActive) {
          const sinY = Math.sin(state_default.yaw), cosY = Math.cos(state_default.yaw);
          const back = 95, right = 22;
          upOff = 22;
          cam.position.x += sinY * back + cosY * right;
          cam.position.z += cosY * back - sinY * right;
        }
        cam.position.y += (dynCH + targetZ + upOff - cam.position.y) * camLerpY;
      }
      if (!spectatingTarget) {
        _tmpEuler.set(state_default.pitch, state_default.yaw, 0, "YXZ");
        cam.quaternion.setFromEuler(_tmpEuler);
      }
      updateAudioListener(cam);
      sun.position.set(cam.position.x + 300, 400, cam.position.z + 200);
      sun.target.position.set(cam.position.x, 0, cam.position.z);
      sun.target.updateMatrixWorld();
      buildMap();
      buildTowerIfNeeded();
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
              side: THREE15.DoubleSide,
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
      updateBulletHoles(dt);
      if (!state_default._laserDot) {
        state_default._laserDot = new THREE15.Mesh(
          new THREE15.SphereGeometry(1.5, 8, 8),
          new THREE15.MeshBasicMaterial({ color: 16711680 })
        );
        state_default._laserDot.visible = false;
        scene.add(state_default._laserDot);
      }
      if (me && me.alive && (me.weapon === "bolty" || me.weapon === "aug")) {
        const fwd2 = new THREE15.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
        let dotX = cam.position.x + fwd2.x * 2e3;
        let dotY = cam.position.y + fwd2.y * 2e3;
        let dotZ = cam.position.z + fwd2.z * 2e3;
        let hitDist = 2e3;
        for (let d = 5; d < 2e3; d += 5) {
          const rx = cam.position.x + fwd2.x * d;
          const ry = cam.position.y + fwd2.y * d;
          const rz = cam.position.z + fwd2.z * d;
          const th = getTerrainHeight(rx, rz);
          if (ry < th) {
            dotX = rx;
            dotY = th;
            dotZ = rz;
            hitDist = d;
            break;
          }
          let wallHit = false;
          if (state_default.mapFeatures && state_default.mapFeatures.walls) {
            for (const w of state_default.mapFeatures.walls) {
              if (rx > w.x && rx < w.x + w.w && rz > w.y && rz < w.y + w.h && ry < th + 70) {
                dotX = rx;
                dotY = ry;
                dotZ = rz;
                hitDist = d;
                wallHit = true;
                break;
              }
            }
          }
          if (wallHit) break;
          let bHit = false;
          for (const b of state_default.barricades) {
            const dx = rx - b.cx, dz = rz - b.cy;
            if (Math.abs(dx) < b.w / 2 + 5 && Math.abs(dz) < b.h / 2 + 5 && ry < th + 56) {
              dotX = rx;
              dotY = ry;
              dotZ = rz;
              hitDist = d;
              bHit = true;
              break;
            }
          }
          if (bHit) break;
          let cowHit = false;
          for (const p of state_default.serverPlayers) {
            if (p.id === state_default.myId || !p.alive) continue;
            const pth = getTerrainHeight(p.x, p.y);
            if (ry > pth && ry < pth + 50 && Math.hypot(rx - p.x, rz - p.y) < 16) {
              dotX = rx;
              dotY = ry;
              dotZ = rz;
              hitDist = d;
              cowHit = true;
              break;
            }
          }
          if (cowHit) break;
        }
        state_default._laserDot.position.set(dotX, dotY + 0.5, dotZ);
        const s = Math.max(0.34, 1.23 - hitDist / 1500);
        state_default._laserDot.scale.set(s, s, s);
        state_default._laserDot.visible = true;
      } else if (state_default._laserDot) {
        state_default._laserDot.visible = false;
      }
      if (!state_default._remoteLaserDots) state_default._remoteLaserDots = {};
      if (!state_default._remoteLaserT) state_default._remoteLaserT = 0;
      state_default._remoteLaserT += dt;
      if (state_default._remoteLaserT >= 0.1) {
        state_default._remoteLaserT = 0;
        const laserWeapons = /* @__PURE__ */ new Set(["bolty", "aug"]);
        const seenDots = /* @__PURE__ */ new Set();
        for (const p of state_default.serverPlayers) {
          if (p.id === state_default.myId || !p.alive || !laserWeapons.has(p.weapon)) continue;
          const distToCam = Math.hypot(p.x - cam.position.x, p.y - cam.position.z);
          if (distToCam > 500) continue;
          seenDots.add(p.id);
          if (!state_default._remoteLaserDots[p.id]) {
            const dot2 = new THREE15.Mesh(
              new THREE15.SphereGeometry(1.5, 6, 6),
              new THREE15.MeshBasicMaterial({ color: 16711680 })
            );
            dot2.visible = false;
            scene.add(dot2);
            state_default._remoteLaserDots[p.id] = dot2;
          }
          const dot = state_default._remoteLaserDots[p.id];
          const ax = Math.sin(p.aimAngle || 0);
          const az = Math.cos(p.aimAngle || 0);
          const pth = getTerrainHeight(p.x, p.y);
          const py = pth + 35;
          let dHit = 2e3, hx = p.x + ax * 2e3, hy = py, hz = p.y + az * 2e3;
          for (let d = 10; d < 2e3; d += 10) {
            const rx = p.x + ax * d, rz = p.y + az * d;
            const th = getTerrainHeight(rx, rz);
            if (py < th) {
              hx = rx;
              hy = th;
              hz = rz;
              dHit = d;
              break;
            }
          }
          dot.position.set(hx, hy + 0.5, hz);
          const ds = Math.max(0.4, 1.45 - dHit / 1500);
          dot.scale.set(ds, ds, ds);
          dot.visible = true;
        }
        for (const id of Object.keys(state_default._remoteLaserDots)) {
          if (!seenDots.has(Number(id))) {
            state_default._remoteLaserDots[id].visible = false;
            scene.remove(state_default._remoteLaserDots[id]);
            state_default._remoteLaserDots[id].geometry.dispose();
            state_default._remoteLaserDots[id].material.dispose();
            delete state_default._remoteLaserDots[id];
          }
        }
      }
      ren.render(scene, cam);
      const vmGroup2 = getVmGroup();
      vmDebugGroup.visible = state_default.debugMode && state_default.state === "playing";
      if (vmGroup2 && state_default.state === "playing" && me && me.alive && (state_default.cameraMode !== "third" || state_default.adsActive)) {
        ren.autoClear = false;
        ren.clearDepth();
        ren.render(vmScene, vmCam);
        ren.autoClear = true;
      } else if (vmDebugGroup.visible) {
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
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      clearSnapshots();
      last = performance.now();
    });
    connect3();
    requestAnimationFrame(loop);
  }
});
export default require_index();
/*! Bundled license information:

@yandeu/events/lib/index.js:
  (**
   * @package      npmjs.com/package/@yandeu/events (events.min.js)
   *
   * @author       Arnout Kazemier (https://github.com/3rd-Eden)
   * @copyright    Copyright (c) 2014 Arnout Kazemier
   * @license      {@link https://github.com/primus/eventemitter3/blob/master/LICENSE|MIT}
   *
   * @author       Yannick Deubel (https://github.com/yandeu)
   * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/yandeu/events
   * @license      {@link https://github.com/yandeu/events/blob/master/LICENSE|MIT}
   *)

@geckos.io/snapshot-interpolation/lib/slerp.js:
  (**
   * @author        three.js authors
   * @copyright     Copyright © 2010-2021 three.js authors
   * @license       {@link https://github.com/mrdoob/three.js/blob/dev/LICENSE|MIT}
   * @description   Copied and modified from: https://github.com/mrdoob/three.js/blob/464efc85ecfda5c03d786d15d8f8eff20d70f256/src/math/Quaternion.js
   *)

@geckos.io/snapshot-interpolation/lib/index.js:
  (**
   * @author       Yannick Deubel (https://github.com/yandeu)
   * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/geckosio/snapshot-interpolation
   * @license      {@link https://github.com/geckosio/snapshot-interpolation/blob/master/LICENSE|GNU GPLv3}
   *)
*/
//# sourceMappingURL=bundle.js.map
