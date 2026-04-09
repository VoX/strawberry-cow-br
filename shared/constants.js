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

// Client input types that carry a monotonic seq number for CSP reconciliation
// (Phase 4) and lag compensation (Phase 6). The client stamps seq on every
// stateful send; the server tracks the highest seen per player and echoes it
// back via `inputAck`. Lobby/host-control messages (chat, toggleBots, ready,
// kick, join, setName) are not sim inputs and are excluded.
const STATEFUL_INPUT_TYPES = new Set([
  'move', 'attack', 'dash', 'jump', 'reload', 'dropWeapon', 'placeBarricade', 'perk',
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
const WEAPON_TYPES = ['shotgun','burst','bolty','shotgun','burst','bolty','cowtank'];

module.exports = {
  MAP_W, MAP_H, TICK_RATE,
  PLAYER_BASE_SPEED, PLAYER_WALK_MULT, MUD_SPEED_MULT, GRAVITY,
  BARRICADE_HEIGHT, PLAYER_WALL_INFLATE,
  STATEFUL_INPUT_TYPES,
  COLORS, FOOD_TYPES, WEAPON_TYPES,
};
