const MAP_W = 2000;
const MAP_H = 1500;
// Server simulation tick rate. Shared with the client so the CSP fixed
// timestep (client/prediction.js) and the lag-comp interp-delay-ticks
// math (client/input.js) don't duplicate a 30 literal that would drift
// if Phase 7 decouples tick/broadcast rates.
const TICK_RATE = 30;

// --- Movement / physics constants ------------------------------------------
// Lifted out of server/game.js + server/ballistics.js so shared/movement.js
// (Phase 3 of the netcode prediction plan) and the client-side prediction
// loop (Phase 4) can call the same integrator with identical numbers.
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
const BURST_FAMILY = new Set(['burst', 'aug']);

// Weapons that benefit from the dual-wield perk (two pistols / two Benellis /
// dual M16A2). Used by hud.js mag display, combat.js ammo calc, and the
// weapon-pickup path in weapons.js to decide whether a second copy counts.
const DUAL_WIELD_FAMILY = new Set(['normal', 'shotgun', 'burst']);

// Base magazine capacity by weapon. Single source of truth for hud.js,
// server/weapon-fire.js, and server/combat.js reload/extMag math.
const MAG_SIZES = { normal: 15, burst: 20, shotgun: 6, bolty: 5, aug: 30 };
// Extended-mag perk grants these capacities instead; dual-wield multiplies
// by 2 further.
const EXT_MAG_SIZES = { normal: 19, burst: 25, shotgun: 8, bolty: 7, aug: 38 };

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

// Resource nodes — gathering via knife melee. Each type defines HP to
// harvest, resource yield per hit, resource type name, and respawn time.
const RESOURCE_TYPES = {
  grass: { hp: 30,  yield: 5,  resource: 'grass', respawnMs: 120000 },
  tree:  { hp: 80,  yield: 10, resource: 'wood',  respawnMs: 120000 },
  rock:  { hp: 100, yield: 8,  resource: 'stone', respawnMs: 120000 },
  scrap: { hp: 60,  yield: 4,  resource: 'metal', respawnMs: 120000 },
};
const RESOURCE_SPAWN_COUNTS = { grass: 40, tree: 20, rock: 15, scrap: 8 };
const RESOURCE_CAP = 500;

// Crafting recipes — keyed by recipe ID. Each recipe lists the resource
// cost and what it produces. 'give' is either a weapon name (replaces
// current weapon) or an ammo/heal/item action.
const CRAFTING_RECIPES = {
  pistol:       { label: 'Pistol',         cost: { wood: 50,  metal: 30 }, give: { weapon: 'normal', ammo: 15 } },
  shotgun:      { label: 'Shotgun',        cost: { wood: 80,  metal: 50 }, give: { weapon: 'shotgun', ammo: 6 } },
  burst:        { label: 'M16A2',          cost: { wood: 60,  metal: 80 }, give: { weapon: 'burst', ammo: 20 } },
  bolty:        { label: 'L96 Sniper',     cost: { wood: 40,  metal: 120 }, give: { weapon: 'bolty', ammo: 5 } },
  aug:          { label: 'AUG',            cost: { wood: 80,  metal: 100 }, give: { weapon: 'aug', ammo: 30 } },
  cowtank:      { label: 'M72 LAW',        cost: { wood: 50,  metal: 150, stone: 30 }, give: { weapon: 'cowtank', ammo: 1 } },
  ammo_pistol:  { label: 'Pistol Ammo',    cost: { metal: 10 }, give: { ammoFor: 'normal', amount: 15 } },
  ammo_rifle:   { label: 'Rifle Ammo',     cost: { metal: 10 }, give: { ammoFor: 'burst', amount: 30, also: ['aug'] } },
  ammo_shotgun: { label: 'Shotgun Shells', cost: { metal: 5, wood: 5 }, give: { ammoFor: 'shotgun', amount: 8 } },
  ammo_sniper:  { label: 'Sniper Rounds',  cost: { metal: 15 }, give: { ammoFor: 'bolty', amount: 5 } },
  ammo_rocket:  { label: 'Rocket',         cost: { metal: 30, stone: 10 }, give: { ammoFor: 'cowtank', amount: 1 } },
  hay_bale:     { label: 'Hay Bale',       cost: { grass: 20 }, give: { heal: 30 } },
  smoothie:     { label: 'Grass Smoothie', cost: { grass: 40, wood: 10 }, give: { heal: 60 } },
  sleeping_bag: { label: 'Sleeping Bag',  cost: { grass: 30, wood: 20 }, give: { sleepingBag: true } },
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
const WEAPON_TYPES = ['shotgun','burst','bolty','shotgun','burst','bolty','cowtank','aug'];

module.exports = {
  MAP_W, MAP_H, TICK_RATE,
  PLAYER_BASE_SPEED, PLAYER_WALK_MULT, MUD_SPEED_MULT, GRAVITY,
  BARRICADE_HEIGHT, PLAYER_WALL_INFLATE, JUMP_VZ,
  KNIFE_SPEED_MULT, HIT_SLOW_MULT, HIT_SLOW_DURATION_MS,
  SPEED_MULT_MIN, SPEED_MULT_MAX,
  KNIFE_MELEE_RANGE, KNIFE_MELEE_CONE_COS, KNIFE_MELEE_DAMAGE, KNIFE_MELEE_CD_MS,
  RESOURCE_TYPES, RESOURCE_SPAWN_COUNTS, RESOURCE_CAP,
  CRAFTING_RECIPES,
  STATEFUL_INPUT_TYPES, BURST_FAMILY, DUAL_WIELD_FAMILY, MAG_SIZES, EXT_MAG_SIZES,
  COLORS, FOOD_TYPES, WEAPON_TYPES,
};
