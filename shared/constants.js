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

// Burst-family weapons share the burst-fire pipeline, ADS-irrelevant
// recoil ramp shape, fire-mode selector, and reload sound. Used in
// hud.js, input.js, message-handlers.js, and weapon-fire.js to avoid
// scattered string OR-checks.
const BURST_FAMILY = new Set(['burst', 'aug']);

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
  BARRICADE_HEIGHT, PLAYER_WALL_INFLATE,
  STATEFUL_INPUT_TYPES, BURST_FAMILY,
  COLORS, FOOD_TYPES, WEAPON_TYPES,
};
