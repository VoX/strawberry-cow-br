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

// Full player state for start/spectate sync. Uses the same getPlayerTick()
// that the 30Hz broadcast uses — no separate snapshot shape needed.
function getPlayerStates() {
  const arr = [];
  for (const [, p] of gameState.getPlayers()) {
    if (p.corpseReaped) continue;
    if (p.alive || (!p.inLobby && lobbyState.isPlaying())) {
      arr.push(getPlayerTick(p));
    }
  }
  return arr;
}

// broadcastPlayerSnapshot is no longer needed — sticky fields are now
// included in every tick via getPlayerTick(). All 7 call sites removed.

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

// Full player state per tick — mutable + sticky fields combined.
// Previously sticky fields (name/color/weapon/perks) were sent via a
// separate playerSnapshot message on event. Now everything rides the
// 30Hz tick so dropped ticks are harmless and there's no stale-sticky bug.
function getPlayerTick(p) {
  const perks = p.perks || {};
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
    // Sticky fields (previously on playerSnapshot):
    name: p.name, color: p.color, weapon: p.weapon || 'normal',
    dualWield: !!p.dualWield,
    sizeMult: perks.sizeMult || 1, speedMult: perks.speedMult || 1,
    recoilMult: p.recoilMult || 1, extMagMult: p.extMagMult || 1,
    xpToNext: p.xpToNext || 50,
    personality: p.personality || null,
    // Event flags — set for ONE tick then cleared by clearEventFlags().
    // Client detects rising edge to trigger visuals/audio.
    justDashed: !!p._justDashed,
    justEliminated: !!p._justEliminated,
    eliminatedRank: p._eliminatedRank || 0,
  };
}

// Clear one-tick event flags after the tick broadcast.
function clearEventFlags() {
  for (const [, p] of gameState.getPlayers()) {
    p._justDashed = false;
    p._justEliminated = false;
    p._eliminatedRank = 0;
  }
}

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
  p._pendingJump = false;
  // countAlive iterates live players — p is already alive=false so we don't
  // subtract. rank = remaining_live + 1 == eliminated player's finishing rank.
  const remaining = gameState.countAlive(false);
  if (p.lastAttacker && reason === 'hunger') {
    const attacker = gameState.getPlayer(p.lastAttacker);
    if (attacker && attacker.alive) {
      attacker.kills = (attacker.kills || 0) + 1;
      attacker.score += 50;
      applyHungerDelta(attacker, 18);
      // Perks/XP temporarily disabled
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
  // Event flags — client detects alive→false + these fields in the next tick.
  p._justEliminated = true;
  p._eliminatedRank = remaining + 1;
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
  return { type: 'serverStatus', gameState: lobbyState.getPhase(), alive, total, debugScene: gameState.isDebugScene() };
}

module.exports = { assignColor, getPlayerStates, getPlayerTick, getPlayerTicks, clearEventFlags, applyHungerDelta, applyArmorDelta, resolveDeaths, clearPendingDeaths, eliminatePlayer, serializeFood, buildServerStatus };
