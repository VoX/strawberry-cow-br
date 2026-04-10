// Shared wire-format message type enum. Every server->client broadcast/sendTo
// and every client->server ws message goes through one of these strings.
//
// The enum exists so (a) server startup can assert no dupes/empties, and
// (b) client boot can verify `message-handlers.js::handlers` covers every
// server->client type. The coverage assert catches drift (e.g. a renamed
// wallDamaged handler that nobody noticed was stale).
//
// Migration of `broadcast({type:'foo'})` call sites to `MSG.FOO` is a mechanical
// followup; this module just needs to exist + assertions need to fire.

// --- server -> client ------------------------------------------------------
// Every type a client might receive from the server.
const S2C = Object.freeze({
  serverStatus: 'serverStatus',
  joined: 'joined',
  lobby: 'lobby',
  spectate: 'spectate',
  start: 'start',
  tick: 'tick',
  inputAck: 'inputAck',
  playerSnapshot: 'playerSnapshot',
  food: 'food',
  eat: 'eat',
  projectile: 'projectile',
  projectileHit: 'projectileHit',
  wallImpact: 'wallImpact',
  explosion: 'explosion',
  eliminated: 'eliminated',
  chat: 'chat',
  barricadePlaced: 'barricadePlaced',
  barricadeDestroyed: 'barricadeDestroyed',
  barricadeHit: 'barricadeHit',
  wallDestroyed: 'wallDestroyed',
  wallDamaged: 'wallDamaged',
  kill: 'kill',
  winner: 'winner',
  restart: 'restart',
  levelup: 'levelup',
  cowstrikeWarning: 'cowstrikeWarning',
  cowstrike: 'cowstrike',
  botsToggled: 'botsToggled',
  botsFreeWillToggled: 'botsFreeWillToggled',
  nightToggled: 'nightToggled',
  dash: 'dash',
  weaponPickup: 'weaponPickup',
  weaponSpawn: 'weaponSpawn',
  weaponDespawn: 'weaponDespawn',
  weaponDrop: 'weaponDrop',
  reloaded: 'reloaded',
  shellLoaded: 'shellLoaded',
  emptyMag: 'emptyMag',
  armorPickup: 'armorPickup',
  armorSpawn: 'armorSpawn',
  shieldHit: 'shieldHit',
  shieldBreak: 'shieldBreak',
  newHost: 'newHost',
  kicked: 'kicked',
  mooTaunt: 'mooTaunt',
  meleeSwing: 'meleeSwing',
  meleeHit: 'meleeHit',
});

// --- client -> server ------------------------------------------------------
// Every type the server accepts from a client ws message.
const C2S = Object.freeze({
  join: 'join',
  setName: 'setName',
  ready: 'ready',
  kick: 'kick',
  toggleBots: 'toggleBots',
  toggleBotsFreeWill: 'toggleBotsFreeWill',
  toggleNight: 'toggleNight',
  perk: 'perk',
  move: 'move',
  attack: 'attack',
  reload: 'reload',
  dash: 'dash',
  jump: 'jump',
  placeBarricade: 'placeBarricade',
  chat: 'chat',
  dropWeapon: 'dropWeapon',
  switchWeapon: 'switchWeapon',
  setUpdateRate: 'setUpdateRate',
  moo: 'moo',
  meleeAttack: 'meleeAttack',
});

const MSG = Object.freeze({ ...S2C, ...C2S });

// Sanity: no empty strings, no dupes (the freeze above would catch dupes at
// authoring time via object-literal key collision, but a runtime check lets a
// refactor pass fail loud on boot instead of silently shipping a typo).
function assertEnumIntegrity() {
  const seen = new Set();
  for (const [k, v] of Object.entries(MSG)) {
    if (!v || typeof v !== 'string') throw new Error(`MSG.${k} is not a non-empty string: ${JSON.stringify(v)}`);
    if (seen.has(v)) throw new Error(`MSG has duplicate value "${v}"`);
    seen.add(v);
  }
}

module.exports = { MSG, S2C, C2S, assertEnumIntegrity };
