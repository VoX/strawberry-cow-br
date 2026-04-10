const { COLORS } = require('./config');
const { broadcast, sendTo } = require('./network');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');

function assignColor() {
  const used = new Set();
  for (const [, p] of gameState.getPlayers()) used.add(p.color);
  for (const c of COLORS) { if (!used.has(c)) return c; }
  return COLORS[Math.random() * COLORS.length | 0];
}

// Full player shape — sticky (name/color/weapon/perks) + mutable (pos/hunger/ammo).
// Used by 'start' / 'spectate' / first-snapshot paths where the client needs
// everything at once. The 30Hz broadcast is now split into getPlayerTick
// (mutable only) + getPlayerSnapshot (full shape), emitted on events.
function getPlayerStates() {
  const arr = [];
  for (const [, p] of gameState.getPlayers()) {
    if (p.corpseReaped) continue;
    if (p.alive || (!p.inLobby && lobbyState.isPlaying())) {
      arr.push(getPlayerSnapshot(p));
    }
  }
  return arr;
}

// Full shape for a single player. Used by the 'playerSnapshot' broadcast when
// a sticky field changes (weapon pickup, perk, level up, dual-wield toggle,
// weapon drop). Also returns the initial shape for 'start'/'spectate' via
// getPlayerStates(). Contains both sticky (name/color/weapon/perks/...) and
// mutable (x/y/hunger/...) fields so a fresh client has everything it needs.
function getPlayerSnapshot(p) {
  const perks = p.perks || {};
  return {
    id: p.id, name: p.name, color: p.color, x: p.x, y: p.y, z: p.z, dir: p.dir,
    hunger: p.hunger, score: p.score, alive: p.alive, eating: p.eating,
    foodEaten: p.foodEaten, level: p.level || 0, xp: p.xp || 0,
    xpToNext: p.xpToNext || 50, sizeMult: perks.sizeMult || 1, armor: p.armor || 0,
    // Phase 4 CSP: speedMult must ship so the client's local stepPlayerMovement
    // multiplies by the same factor the server does — otherwise speed-perk
    // players predict at 1.0x and reconcile pumps a visible rubberband at ~6Hz.
    speedMult: perks.speedMult || 1,
    kills: p.kills || 0, stunTimer: p.stunTimer || 0, weapon: p.weapon || 'normal', aimAngle: p.aimAngle || 0, dualWield: !!p.dualWield,
    dashCooldown: p.dashCooldown || 0, attackCooldown: p.attackCooldown || 0, spawnProt: p.spawnProtection > 0,
    ammo: p.ammo !== undefined ? p.ammo : -1, reloading: p.reloading > 0, recoilMult: p.recoilMult || 1, extMagMult: p.extMagMult || 1,
    personality: p.personality || null,
    crouching: !!p.walking,
  };
}

// Ship a player-snapshot broadcast. Called whenever a sticky field mutates
// (weapon pickup/drop, perk, level up, dual-wield toggle). Collapses 4 duplicate
// call sites into one and gives grep a single seam to audit every snapshot emit.
function broadcastPlayerSnapshot(p) {
  broadcast({ type: 'playerSnapshot', player: getPlayerSnapshot(p) });
}

// Unified death barrier — the one and only entry point for hunger mutation.
// Previous design let combat.js, perks.js, weapon-fire.js and game.js all do
// `p.hunger -= dmg` inline, which meant a combat hit wasn't noticed until the
// NEXT tick's movement loop ran — a ~33 ms window in which a "dead" player
// could keep firing, get hit again (mis-crediting the kill), heal in a pond,
// or be visible alive in the tick broadcast. Now every write goes through
// applyHungerDelta, which clamps, tracks the attacker, and enqueues a death
// for end-of-tick resolution via resolveDeaths().
const _pendingDeaths = new Set();
function applyHungerDelta(p, delta, attackerId = null) {
  if (!p || !p.alive) return;
  const maxH = (p.perks && p.perks.maxHunger) || 100;
  p.hunger = Math.max(0, Math.min(maxH, p.hunger + delta));
  if (attackerId !== null && attackerId !== p.id) p.lastAttacker = attackerId;
  if (p.hunger <= 0) _pendingDeaths.add(p.id);
}
function resolveDeaths() {
  if (_pendingDeaths.size === 0) return 0;
  let count = 0;
  for (const id of _pendingDeaths) {
    const p = gameState.getPlayer(id);
    if (p && p.alive) { eliminatePlayer(p, 'hunger'); count++; }
  }
  _pendingDeaths.clear();
  return count;
}
// Wipe any stale hunger-drained ids on round reset. Cowstrike waves scheduled
// via scheduleRoundTimer can fire during the restart countdown and leak ids
// into _pendingDeaths; without this, the next round's first tick would
// spuriously eliminate a fresh-spawned player whose id happens to match.
function clearPendingDeaths() { _pendingDeaths.clear(); }

// Universal armor cap. Players currently never get a per-player maxArmor set
// (the spawn path zeros p.armor and never populates p.maxArmor), so the cap
// lives here as a single game-wide constant. If per-perk armor caps get added
// later, migrate to `p.maxArmor = ARMOR_CAP` at spawn + let perks override.
const ARMOR_CAP = 50;

// Single entry for armor mutations. Clamps to [0, ARMOR_CAP], broadcasts the
// shieldBreak visual EXACTLY ONCE per positive→zero transition (combat.js,
// perks.js cowstrike, weapons.js pickup previously each open-coded this
// pattern and the cowstrike path even skipped the break-visual when armor
// was already 0). Callers no longer emit shieldBreak inline.
function applyArmorDelta(p, delta) {
  if (!p || !p.alive) return;
  const maxA = p.maxArmor || ARMOR_CAP;
  const prev = p.armor || 0;
  p.armor = Math.max(0, Math.min(maxA, prev + delta));
  if (prev > 0 && p.armor === 0) {
    broadcast({ type: 'shieldBreak', playerId: p.id, x: p.x, y: p.y });
  }
}

// Mutable-per-tick fields only. Everything a client needs to interpolate
// position/aim/hunger/cooldowns between ticks, minus the sticky stuff that
// only changes on events and ships in playerSnapshot.
function getPlayerTick(p) {
  return {
    id: p.id, x: p.x, y: p.y, z: p.z, dir: p.dir,
    hunger: p.hunger, score: p.score, alive: p.alive, eating: p.eating,
    foodEaten: p.foodEaten, level: p.level || 0, xp: p.xp || 0,
    armor: p.armor || 0, kills: p.kills || 0, stunTimer: p.stunTimer || 0,
    aimAngle: p.aimAngle || 0,
    dashCooldown: p.dashCooldown || 0, attackCooldown: p.attackCooldown || 0,
    spawnProt: p.spawnProtection > 0,
    ammo: p.ammo !== undefined ? p.ammo : -1, reloading: p.reloading > 0,
    crouching: !!p.walking,
    resources: p.resources || null,
    durability: p.durability || 0,
  };
}

// Build the slim tick-broadcast payload. Mirrors getPlayerStates()'s
// visibility predicate (alive, not-lobby, not-corpse-reaped).
function getPlayerTicks() {
  const arr = [];
  for (const [, p] of gameState.getPlayers()) {
    if (p.corpseReaped) continue;
    if (p.alive || (!p.inLobby && lobbyState.isPlaying())) {
      arr.push(getPlayerTick(p));
    }
  }
  return arr;
}

function eliminatePlayer(p, reason) {
  if (!p.alive) return;
  p.alive = false;
  p.deathTime = Date.now();
  // Drop loot bag with the player's resources + weapon at death position
  if (p.resources && !p.isBot) {
    const hasLoot = Object.values(p.resources).some(v => v > 0) || (p.weapon && p.weapon !== 'knife');
    if (hasLoot) {
      const bag = {
        id: gameState.nextEntityId(),
        x: p.x, y: p.y,
        resources: { ...p.resources },
        weapon: p.weapon !== 'knife' ? p.weapon : null,
        ammo: p.weapon !== 'knife' ? p.ammo : 0,
        spawnTime: Date.now(),
      };
      gameState.addLootBag(bag);
      broadcast({ type: 'lootBagSpawn', bag });
    }
  }
  // countAlive iterates live players — p is already alive=false so we don't
  // subtract. rank = remaining_live + 1 == eliminated player's finishing rank.
  const remaining = gameState.countAlive(false);
  if (p.lastAttacker && reason === 'hunger') {
    const attacker = gameState.getPlayer(p.lastAttacker);
    if (attacker && attacker.alive) {
      attacker.kills = (attacker.kills || 0) + 1;
      attacker.score += 50;
      applyHungerDelta(attacker, 18);
      const killXp = (attacker.xpToNext || 50) * 2;
      attacker.xp = (attacker.xp || 0) + killXp;
      let humanLeveled = false;
      while (attacker.xp >= attacker.xpToNext) {
        attacker.xp = Math.max(0, attacker.xp - attacker.xpToNext);
        attacker.level++;
        attacker.xpToNext = Math.floor(50 + attacker.level * 25 + attacker.level * attacker.level * 5);
        if (attacker.isBot) { const { botPickRandomPerk } = require('./perks'); botPickRandomPerk(attacker); }
        else { sendTo(attacker.ws, { type: 'levelup', level: attacker.level }); humanLeveled = true; }
      }
      // Collapse multiple level-ups into a single sticky-field snapshot. Bot
      // level-ups snapshot via botPickRandomPerk → handlePerk → broadcast.
      if (humanLeveled) broadcastPlayerSnapshot(attacker);
      broadcast({ type: 'kill', killerId: attacker.id, killerName: attacker.name, victimId: p.id, victimName: p.name, weapon: attacker.weapon || 'unknown' });
    }
  }
  if (p.isBot) { delete p._lastPos; delete p._wanderTarget; delete p._volleyHits; }
  // Drop weapon on death
  if (p.weapon && p.weapon !== 'normal') {
    const drop = { id: gameState.nextEntityId(), x: p.x + 15, y: p.y, weapon: p.weapon };
    gameState.addWeaponPickup(drop);
    broadcast({ type: 'weaponSpawn', id: drop.id, x: drop.x, y: drop.y, weapon: drop.weapon });
    p.weapon = 'normal'; p.dualWield = false;
  }
  broadcast({ type: 'eliminated', playerId: p.id, name: p.name, rank: remaining + 1, x: p.x, y: p.y, z: p.z });
  broadcast(buildServerStatus());
}

function serializeFood(f) {
  return { id: f.id, x: f.x, y: f.y, type: f.type.name, poisoned: f.poisoned, golden: f.golden };
}

function buildServerStatus() {
  let alive = 0, total = 0;
  for (const [, p] of gameState.getPlayers()) {
    if (!p.inLobby) { total++; if (p.alive) alive++; }
  }
  return { type: 'serverStatus', gameState: lobbyState.getPhase(), alive, total };
}

module.exports = { assignColor, getPlayerStates, getPlayerSnapshot, getPlayerTick, getPlayerTicks, broadcastPlayerSnapshot, applyHungerDelta, applyArmorDelta, resolveDeaths, clearPendingDeaths, eliminatePlayer, serializeFood, buildServerStatus };
