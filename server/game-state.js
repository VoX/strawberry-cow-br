// GameState — owns round-scoped world data.
// Singleton; import as `const gameState = require('./game-state')`.
const { MAP_W, MAP_H } = require('./config');

class GameState {
  constructor() {
    // id counters — a single monotonic entity counter is shared by projectiles,
    // foods, weapon pickups, armor pickups, and barricade ids (they don't collide
    // because clients key by object category). Player ids use their own counter
    // because they're exposed directly on network messages.
    this._nextPlayerId = 1;
    this._entityIdCounter = 1;
    this._barricadeIdCounter = 1;

    // players (shared: lobby tracks ready state, round tracks alive players)
    this._players = new Map();

    // round clock + zone
    this._gameTime = 0;
    this._zone = { x: 0, y: 0, w: MAP_W, h: MAP_H };

    // Monotonic tick counter — reset every round, incremented once per
    // gameTick(). Included on the tick broadcast so the client has a
    // canonical integer "which tick is this" identifier (gameTime is a
    // float in seconds and lossy for indexing). Infrastructure for phases
    // 1, 4, 5, 6 of the netcode prediction plan.
    this._tickNum = 0;

    // dynamic round objects
    this._projectiles = [];
    this._foods = [];
    this._weaponPickups = [];
    this._armorPickups = [];
    this._barricades = [];
    this._resourceNodes = [];
    this._sleepingBags = new Map(); // playerId → { id, x, y, ownerId }

    // static round features (rebuilt each round in generateMap)
    this._walls = [];
    this._mudPatches = [];
    this._healPonds = [];
    this._portals = [];
    this._shelters = [];
    this._houses = [];

    // round-scoped flags
    this._cowstrikeActive = false;

    // settings tied to round
    this._botsEnabled = true;
    this._botsFreeWill = true;
    this._nightMode = false;

    // interval handles
    this._tickInterval = null;
    this._restartTimer = null;

    // Round-scoped setTimeout handles — cleared by clearRoundTimers() during
    // resetRound() so stale callbacks (cowstrike kicks, delayed burst
    // broadcasts, shell-by-shell reload chains) don't fire into the next round.
    this._roundTimers = new Set();

    // Phase 5: historical position ring. Per-tick snapshot of alive player
    // positions, keyed by tickNum, bounded to HISTORY_TICKS entries. The
    // lag-compensation path (Phase 6) reads from here when processing an
    // attack — it looks up the tick the client was seeing, runs the hit
    // check against those positions, then rolls forward. Storage-only in
    // Phase 5 (no consumers yet); Phase 6 adds the rewind lookup.
    //
    // HISTORY_TICKS = 20 → 666ms at 30 Hz, enough to cover even 300ms ping
    // players after the ~100ms interp delay. Beyond that we clamp to the
    // oldest available snapshot.
    this._positionHistory = [];
  }

  // History ring cap — bounds memory to ~16 players × ~50 bytes × 20 ticks ≈ 16 KB.
  get HISTORY_TICKS() { return 20; }

  // --- shared constants ----------------------------------------------------
  get BARRICADE_COOLDOWN_MS() { return 5000; }
  get BOT_BARRICADE_COOLDOWN_MS() { return 10000; } // bots get +100% longer cooldown

  // --- id counters ---------------------------------------------------------
  nextPlayerId() { return this._nextPlayerId++; }
  nextEntityId() { return this._entityIdCounter++; }
  nextBarricadeId() { return this._barricadeIdCounter++; }

  // --- players -------------------------------------------------------------
  getPlayers() { return this._players; }
  getPlayer(id) { return this._players.get(id); }
  addPlayer(id, p) { this._players.set(id, p); }
  removePlayer(id) { this._players.delete(id); }

  // Counts alive players optionally filtering out bots. Iterates once, no allocation.
  countAlive(humansOnly = false) {
    let n = 0;
    for (const [, p] of this._players) {
      if (!p.alive) continue;
      if (humansOnly && p.isBot) continue;
      n++;
    }
    return n;
  }

  // Counts players currently marked inLobby (used for round-start spawn layout).
  countInLobby() {
    let n = 0;
    for (const [, p] of this._players) if (p.inLobby) n++;
    return n;
  }

  // --- round clock / zone --------------------------------------------------
  getGameTime() { return this._gameTime; }
  setGameTime(t) { this._gameTime = t; }
  addGameTime(dt) { this._gameTime += dt; }

  getTickNum() { return this._tickNum; }
  incTickNum() { return ++this._tickNum; }

  // Phase 5 history ring. pushHistorySnapshot captures positions at the
  // START of the current tick (call BEFORE movement in gameTick so the
  // snapshot reflects the "display state" the client was rendering, which
  // is what lag comp should rewind to). getHistorySnapshot finds the
  // entry closest to (but not after) a target tickNum — if the target
  // falls off the ring, returns the oldest entry as a best-effort fallback.
  pushHistorySnapshot() {
    const snap = { tickNum: this._tickNum, time: Date.now(), positions: [] };
    for (const [, p] of this._players) {
      if (!p.alive) continue;
      snap.positions.push({
        id: p.id, x: p.x, y: p.y, z: p.z,
        sizeMult: (p.perks && p.perks.sizeMult) || 1,
        stunTimer: p.stunTimer || 0,
        spawnProtection: p.spawnProtection || 0,
        armor: p.armor || 0,
      });
    }
    this._positionHistory.push(snap);
    if (this._positionHistory.length > this.HISTORY_TICKS) this._positionHistory.shift();
  }
  getHistorySnapshot(tickNum) {
    if (this._positionHistory.length === 0) return null;
    // Walk newest → oldest and return the newest entry whose tickNum
    // is <= the target (the "at or just before" rewind point).
    for (let i = this._positionHistory.length - 1; i >= 0; i--) {
      if (this._positionHistory[i].tickNum <= tickNum) return this._positionHistory[i];
    }
    // Target is older than our oldest — clamp to oldest.
    return this._positionHistory[0];
  }

  getZone() { return this._zone; }
  setZone(z) { this._zone = z; }

  // --- projectiles ---------------------------------------------------------
  getProjectiles() { return this._projectiles; }
  addProjectile(p) { this._projectiles.push(p); }
  removeProjectileAt(idx) { this._projectiles.splice(idx, 1); }
  removeProjectile(id) {
    const i = this._projectiles.findIndex(p => p.id === id);
    if (i >= 0) this._projectiles.splice(i, 1);
  }

  // --- foods ---------------------------------------------------------------
  getFoods() { return this._foods; }
  addFood(f) { this._foods.push(f); }
  removeFoodAt(idx) { this._foods.splice(idx, 1); }

  // --- pickups -------------------------------------------------------------
  getWeaponPickups() { return this._weaponPickups; }
  addWeaponPickup(w) { this._weaponPickups.push(w); }
  removeWeaponPickupAt(idx) { this._weaponPickups.splice(idx, 1); }

  getArmorPickups() { return this._armorPickups; }
  addArmorPickup(a) { this._armorPickups.push(a); }
  removeArmorPickupAt(idx) { this._armorPickups.splice(idx, 1); }

  // --- walls & barricades --------------------------------------------------
  getWalls() { return this._walls; }
  addWall(w) { this._walls.push(w); }
  removeWallAt(idx) { this._walls.splice(idx, 1); }

  getBarricades() { return this._barricades; }
  addBarricade(b) { this._barricades.push(b); }
  getResourceNodes() { return this._resourceNodes; }
  addResourceNode(n) { this._resourceNodes.push(n); }
  getSleepingBags() { return this._sleepingBags; }
  setSleepingBag(playerId, bag) { this._sleepingBags.set(playerId, bag); }
  getSleepingBag(playerId) { return this._sleepingBags.get(playerId) || null; }
  removeSleepingBag(playerId) { this._sleepingBags.delete(playerId); }
  removeBarricade(id) {
    const idx = this._barricades.findIndex(b => b.id === id);
    if (idx >= 0) this._barricades.splice(idx, 1);
  }
  removeBarricadeAt(idx) { this._barricades.splice(idx, 1); }

  // --- terrain features ----------------------------------------------------
  // Populated once per round in generateMap(), cleared by resetRound().
  getMudPatches() { return this._mudPatches; }
  addMudPatch(m) { this._mudPatches.push(m); }
  getHealPonds() { return this._healPonds; }
  addHealPond(h) { this._healPonds.push(h); }
  getPortals() { return this._portals; }
  addPortal(p) { this._portals.push(p); }
  getShelters() { return this._shelters; }
  addShelter(s) { this._shelters.push(s); }
  getHouses() { return this._houses; }
  addHouse(h) { this._houses.push(h); }

  // --- round-scoped flags --------------------------------------------------
  isCowstrikeActive() { return this._cowstrikeActive; }
  setCowstrikeActive(v) { this._cowstrikeActive = v; }

  // --- round settings ------------------------------------------------------
  isBotsEnabled() { return this._botsEnabled; }
  setBotsEnabled(v) { this._botsEnabled = v; }
  toggleBotsEnabled() { this._botsEnabled = !this._botsEnabled; return this._botsEnabled; }

  isBotsFreeWill() { return this._botsFreeWill; }
  setBotsFreeWill(v) { this._botsFreeWill = v; }
  toggleBotsFreeWill() { this._botsFreeWill = !this._botsFreeWill; return this._botsFreeWill; }

  isNightMode() { return this._nightMode; }
  setNightMode(v) { this._nightMode = v; }
  toggleNightMode() { this._nightMode = !this._nightMode; return this._nightMode; }

  // --- interval handles ----------------------------------------------------
  getTickInterval() { return this._tickInterval; }
  setTickInterval(t) { this._tickInterval = t; }
  clearTickInterval() {
    if (this._tickInterval) clearInterval(this._tickInterval);
    this._tickInterval = null;
  }

  getRestartTimer() { return this._restartTimer; }
  setRestartTimer(t) { this._restartTimer = t; }
  clearRestartTimer() {
    if (this._restartTimer) clearInterval(this._restartTimer);
    this._restartTimer = null;
  }

  // --- round-scoped timers --------------------------------------------------
  // Wraps setTimeout so the handle is tracked and cancelled on round reset.
  // The wrapper drops its own handle from the set when the callback runs so
  // the set doesn't grow unbounded with resolved timers. The try/catch is
  // load-bearing: centralizing setTimeouts means a single thrown callback
  // would otherwise take the whole process down.
  scheduleRoundTimer(fn, ms) {
    const handle = setTimeout(() => {
      this._roundTimers.delete(handle);
      try { fn(); } catch (e) { console.error('[scheduleRoundTimer]', e); }
    }, ms);
    this._roundTimers.add(handle);
    return handle;
  }
  clearRoundTimers() {
    for (const h of this._roundTimers) clearTimeout(h);
    this._roundTimers.clear();
  }

  // --- round lifecycle helpers --------------------------------------------
  // Clears every round-scoped collection so the next round starts clean. Does NOT touch
  // players (they persist across rounds for lobby ready state) or the id counters
  // (monotonic across rounds is fine — no collisions).
  resetRound() {
    this.clearRoundTimers();
    this._tickNum = 0;
    this._positionHistory.length = 0;
    this._projectiles.length = 0;
    this._foods.length = 0;
    this._weaponPickups.length = 0;
    this._armorPickups.length = 0;
    this._barricades.length = 0;
    this._resourceNodes.length = 0;
    this._walls.length = 0;
    this._mudPatches.length = 0;
    this._healPonds.length = 0;
    this._portals.length = 0;
    this._shelters.length = 0;
    this._houses.length = 0;
    this._cowstrikeActive = false;
  }
}

module.exports = new GameState();
