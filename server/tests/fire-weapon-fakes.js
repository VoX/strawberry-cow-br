// Fakes installed into Node's require.cache before combat.js / bots.js load.
// combat.js and bots.js both do `require('./game-state')`, `require('./network')`,
// and combat.js destructures from `require('./terrain')` — intercepting these at
// cache-level lets us exercise fireWeapon without booting the real server.
//
// USAGE:
//   const fakes = require('./fire-weapon-fakes').install();
//   // NOW require combat / bots — they'll pick up the fakes
//   const combat = require('../combat');
//   // …run test…
//   fakes.reset(); // clear captured state between test cases (same module instance reused)
//
// We do NOT uninstall the fakes after tests finish — that would require reloading
// combat/bots between cases, which is pointless for a standalone script.

const path = require('path');

// Resolve the same keys combat.js / bots.js use ('./game-state') to their fully
// qualified cache keys. Must be called before the real modules get loaded.
function resolveKey(relFromServer) {
  return require.resolve(path.join(__dirname, '..', relFromServer));
}

function install() {
  // --- Shared captured state ------------------------------------------------
  const state = {
    broadcasts: [],
    projectiles: [],
    nextEntityIdCounter: 1,
  };

  // --- game-state fake ------------------------------------------------------
  // Minimal surface: only what combat.js and bots.js touch.
  const fakePlayers = new Map();
  const fakeGameState = {
    nextEntityId() { return state.nextEntityIdCounter++; },
    nextBarricadeId() { return state.nextEntityIdCounter++; },
    getProjectiles() { return state.projectiles; },
    addProjectile(p) { state.projectiles.push(p); },
    getPlayers() { return fakePlayers; },
    getPlayer(id) { return fakePlayers.get(id); },
    getWalls() { return []; },
    getBarricades() { return []; },
    addBarricade(b) {},
    getFoods() { return []; },
    getWeaponPickups() { return []; },
    getShelters() { return []; },
    isCowstrikeActive() { return false; },
    isBotsFreeWill() { return true; },
    isBotsEnabled() { return true; },
    // Routes through global.setTimeout so the test's sync-patch still intercepts it.
    scheduleRoundTimer(fn, ms) { return setTimeout(fn, ms); },
    clearRoundTimers() {},
    // tickNum for lag comp history. Tests don't exercise lag comp
    // (no projectile stepping into the future), so a fixed 0 is fine.
    getTickNum() { return 0; },
    BARRICADE_COOLDOWN_MS: 5000,
    BOT_BARRICADE_COOLDOWN_MS: 10000,
  };

  // --- network fake ---------------------------------------------------------
  const fakeNetwork = {
    broadcast(data) { state.broadcasts.push(JSON.parse(JSON.stringify(data))); },
    sendTo(_ws, data) { state.broadcasts.push({ _sendTo: true, ...JSON.parse(JSON.stringify(data)) }); },
  };

  // --- terrain fake ---------------------------------------------------------
  // combat.js destructures getTerrainHeight / getGroundHeight / WALL_HEIGHT at
  // module load time. fireWeapon doesn't call them, but load has to succeed.
  const fakeTerrain = {
    getTerrainHeight() { return 0; },
    getGroundHeight() { return 0; },
    getSeed() { return 0; },
    generateTerrain() {},
    WALL_HEIGHT: 80,
  };

  // --- bot-ai shim ----------------------------------------------------------
  // bots.js does `const { decideBotTurn } = require('./bot-ai');` at load time,
  // so the destructured binding is captured once. To be able to override it
  // per test case, we load the REAL bot-ai, then wrap decideBotTurn in a
  // trampoline that reads from a mutable `state.decideBotTurnOverride`. Tests
  // can set/clear the override to inject canned intents.
  const realBotAi = require(path.join(__dirname, '..', 'bot-ai'));
  state.decideBotTurnOverride = null;
  const wrappedBotAi = {
    ...realBotAi,
    decideBotTurn(bot, world) {
      if (state.decideBotTurnOverride) return state.decideBotTurnOverride(bot, world);
      return realBotAi.decideBotTurn(bot, world);
    },
  };

  // --- Inject into require.cache --------------------------------------------
  const entries = [
    ['./game-state', fakeGameState],
    ['./network', fakeNetwork],
    ['./terrain', fakeTerrain],
    ['./bot-ai', wrappedBotAi],
  ];
  for (const [rel, exports] of entries) {
    const key = resolveKey(rel);
    require.cache[key] = {
      id: key,
      filename: key,
      loaded: true,
      exports,
      children: [],
      paths: [],
    };
  }

  // --- Reset helper (between test cases) ------------------------------------
  function reset() {
    state.broadcasts.length = 0;
    state.projectiles.length = 0;
    state.nextEntityIdCounter = 1;
    state.decideBotTurnOverride = null;
    fakePlayers.clear();
  }

  return {
    state,
    fakePlayers,
    fakeGameState,
    fakeNetwork,
    reset,
  };
}

module.exports = { install };
