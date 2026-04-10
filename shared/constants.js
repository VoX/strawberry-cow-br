const MAP_W = 2000;
const MAP_H = 1500;
// Server simulation tick rate. Shared with the client so the CSP fixed
// timestep (client/prediction.js) and the lag-comp interp-delay-ticks
// math don't duplicate a literal that would drift if tick/broadcast
// rates are ever decoupled.
const TICK_RATE = 40;

// --- Movement / physics constants ------------------------------------------
// Lifted out of server/game.js + server/ballistics.js so shared/movement.js
// and the client-side prediction loop (CSP) can call the same integrator
// with identical numbers.
const PLAYER_BASE_SPEED = 108;          // server/game.js movement formula base
const PLAYER_WALK_MULT = 0.5;           // walking/crouching speed multiplier
const MUD_SPEED_MULT = 0.5;             // mud patch slowdown
const GRAVITY = 800;                    // z-axis gravity units/s^2
const BARRICADE_HEIGHT = 55;            // barricades are 55 units tall
const PLAYER_WALL_INFLATE = 15;         // AABB inflation matching capsule radius
const JUMP_VZ = 230;                    // vertical velocity injected by jump

// Client-authoritative speed multipliers — sent in each move's
// `speedMult` field. Both halves of the CSP loop must consume the same
// constants or the simulation diverges.
const KNIFE_SPEED_MULT = 1.2;
const HIT_SLOW_MULT = 0.5;
const HIT_SLOW_DURATION_MS = 500;
const SPEED_MULT_MIN = 0;               // clamp on incoming move messages
const SPEED_MULT_MAX = 2;

// Knife melee. Range is ~2 body widths ahead, 90° total cone (45° either
// side of aim), damage so 2 hits kill a full-health target, 500ms cooldown.
const KNIFE_MELEE_RANGE = 62;
const KNIFE_MELEE_CONE_COS = 0.707;      // cos(45°) — dot-product gate on aim
const KNIFE_MELEE_DAMAGE = 55;
const KNIFE_MELEE_CD_MS = 500;

// Burst-family weapons share the burst-fire pipeline, ADS-irrelevant
// recoil ramp shape, fire-mode selector, and reload sound. Used in
// hud.js, input.js, message-handlers.js, and weapon-fire.js to avoid
// scattered string OR-checks.
const BURST_FAMILY = new Set(['burst', 'aug', 'mp5k', 'akm']);

// Weapons that benefit from the dual-wield perk (two pistols / two Benellis /
// dual M16A2). Used by hud.js mag display, combat.js ammo calc, and the
// weapon-pickup path in weapons.js to decide whether a second copy counts.
// Dual-wield: only lightweight weapons. M16 + Benelli disabled for now
// (too heavy to dual-wield realistically). Re-enable by adding back
// 'shotgun' and 'burst' to this set.
const DUAL_WIELD_FAMILY = new Set(['normal', 'mp5k', 'python']);

// Base magazine capacity by weapon. Single source of truth for hud.js,
// server/weapon-fire.js, and server/combat.js reload/extMag math.
const MAG_SIZES = { normal: 10, burst: 20, shotgun: 6, bolty: 5, aug: 30, mp5k: 30, thompson: 20, sks: 10, akm: 30, python: 6, minigun: 300, m249: 100 };
const EXT_MAG_SIZES = { normal: 13, burst: 25, shotgun: 8, bolty: 7, aug: 38, mp5k: 38, thompson: 25, sks: 13, akm: 38, python: 8, minigun: 400, m249: 150 };

// Weapons with a speed penalty when held. Applied in shared/movement.js.
const HEAVY_WEAPON_SPEED = { minigun: 0.3, m249: 0.5 };

// Client input types that carry a monotonic seq number for CSP reconciliation.
// The client stamps seq on every stateful send; the server tracks the highest
// seen per player and echoes it back via `inputAck`. Each seq MUST correspond
// 1:1 with a client predict step — `move` is the only type that runs the
// integrator, so it's the only type in this set. Including non-move types
// here would inject "invisible" seq gaps between predict steps (a shot fired
// between two predict steps would bump the seq the next step inherits,
// breaking the symmetry between client predict cadence and server tick
// cadence and causing per-shot rubberband while strafe-firing). See
// client/prediction.js for the full netcode-strategy reference.
const STATEFUL_INPUT_TYPES = new Set([
  'move',
]);

// Caliber + barrel length per weapon — not gameplay-active yet. Future
// use for damage-by-caliber, barrel-length dropoff, and shared ammo pools.
// Barrel lengths are real-world values in mm for the actual firearms.
const WEAPON_CALIBER = {
  normal:   { caliber: '9x19mm',     barrelMm: 108 },  // SIG P250 Compact
  mp5k:     { caliber: '9x19mm',     barrelMm: 115 },  // HK MP5K
  thompson: { caliber: '.45 ACP',    barrelMm: 267 },  // M1A1 Thompson
  burst:    { caliber: '5.56x45mm',  barrelMm: 508 },  // M16A2
  aug:      { caliber: '5.56x45mm',  barrelMm: 508 },  // Steyr AUG A1
  sks:      { caliber: '7.62x39mm',  barrelMm: 520 },  // SKS
  akm:      { caliber: '7.62x39mm',  barrelMm: 415 },  // AKM
  bolty:    { caliber: '7.62x51mm',  barrelMm: 660 },  // AI Arctic Warfare (L96)
  shotgun:  { caliber: '12ga',       barrelMm: 660 },  // XM1014 (Benelli M4)
  cowtank:  { caliber: '66mm HEAT',  barrelMm: 670 },  // M72 LAW
  python:   { caliber: '.357 Mag',  barrelMm: 152 },  // Colt Python 6"
  minigun:  { caliber: '5.56x45mm', barrelMm: 559 },  // M134 Minigun
  m249:     { caliber: '5.56x45mm', barrelMm: 465 },  // FN M249 SAW
};

const COLORS = ['pink','blue','green','gold','purple','red','orange','cyan'];
const FOOD_TYPES = [
  {name:'strawberry',hunger:15,pts:10},
  {name:'cake',hunger:30,pts:25},
  {name:'pizza',hunger:20,pts:15},
  {name:'icecream',hunger:25,pts:20},
  {name:'donut',hunger:18,pts:12},
  {name:'cupcake',hunger:22,pts:18},
  {name:'cookie',hunger:12,pts:8},
];
const WEAPON_TYPES = ['shotgun','burst','bolty','shotgun','burst','bolty','cowtank','aug','mp5k','thompson','sks','akm','python','m249','minigun'];

module.exports = {
  MAP_W, MAP_H, TICK_RATE,
  PLAYER_BASE_SPEED, PLAYER_WALK_MULT, MUD_SPEED_MULT, GRAVITY,
  BARRICADE_HEIGHT, PLAYER_WALL_INFLATE, JUMP_VZ,
  KNIFE_SPEED_MULT, HIT_SLOW_MULT, HIT_SLOW_DURATION_MS,
  SPEED_MULT_MIN, SPEED_MULT_MAX,
  KNIFE_MELEE_RANGE, KNIFE_MELEE_CONE_COS, KNIFE_MELEE_DAMAGE, KNIFE_MELEE_CD_MS,
  STATEFUL_INPUT_TYPES, BURST_FAMILY, DUAL_WIELD_FAMILY, MAG_SIZES, EXT_MAG_SIZES,
  HEAVY_WEAPON_SPEED, WEAPON_CALIBER,
  COLORS, FOOD_TYPES, WEAPON_TYPES,
};
