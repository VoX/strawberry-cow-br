import { MW, MH } from './config.js';

// Mutable client state — all modules import and mutate this directly
const S = {
  myId: null,
  myColor: 'pink',
  state: 'join',
  serverPlayers: [],
  me: null, // cached reference to our own player in serverPlayers — refreshed in the state handler
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
  musicStyle: 'classic',
  hostId: null,
  spectateTargetId: null,
  killerId: null,
  killerName: null,
  barricadeReadyAt: 0, // performance.now() timestamp when next barricade can be placed
  crouching: false, // C toggles walk/crouch mode (50% speed, reduced spread/recoil, lower camera)
  cameraMode: 'first', // 'first' or 'third' — H toggles. Third = over-the-shoulder, hides viewmodel and renders local cow.
  chatLog: [], // { name, color, text, t (lifetime remaining in seconds) }
  chatOpen: false,
  barricades: [], // { id, cx, cy, w, h, angle } — mirrored from server for client-side projectile prediction
  lastTickNum: 0, // monotonic server tick counter — updated from every `tick` broadcast.
  inputSeq: 0,    // client-side monotonic counter for STATEFUL_INPUT_TYPES. Incremented in network.js::send.
  lastAckedInput: 0, // highest seq the server has confirmed applying — echoed via inputAck broadcast.
  lastRecvSnapSeq: -1, // last snapshot seq received — piggybacked on moves for delta ack
  mePredicted: null, // predicted local player state — camera reads from here, reconciled against server on inputAck.
  localHitSlowEndsAt: 0, // performance.now() ms — local on-hit slowdown timer (client-authoritative)
  localPrimaryWeapon: null, // last-held primary stashed when switching to knife
  _hudTick: 0,              // 10 Hz throttle accumulator for HUD chat/minimap
  _reloadStart: null,       // performance.now() when current reload began
  _reloadDuration: null,    // expected reload duration in ms
  // Network monitoring (debug-mode only). Sliding 1-second windows.
  netStats: {
    tickArrivals: [], // performance.now() of each tick recv
    tickGaps: [],     // ms between consecutive ticks (sliding 1s)
    lastTickRecvT: 0,
    expectedNextTickNum: 0,
    tickGapCount: 0,  // total skipped tick numbers in window
    tickRcvCount: 0,  // total ticks received in window
    reconcileSnapsWindow: [], // [{t, drift}] sliding 1s
  },
};

export default S;
