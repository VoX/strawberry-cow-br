const { TICK_RATE, MAP_W, MAP_H } = require('./config');
const { KNIFE_SPEED_MULT, JUMP_VZ } = require('../shared/constants');
const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation');
// Server-side SI — creates timestamped snapshots and stores them in a vault
// for lag-compensated hit detection (time rewind).
const SI = new SnapshotInterpolation(TICK_RATE);
SI.vault.setMaxSize(300); // 10 seconds at 30 FPS
const { stepPlayerMovement } = require('../shared/movement');
const { broadcast, sendTo } = require('./network');
const transport = require('./transport');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { generateMap } = require('./map');
const { getGroundHeight, WALL_HEIGHT, generateTerrain, getSeed } = require('./terrain');
const { spawnInitialFood, spawnFood, spawnGoldenFood, spawnWeaponPickup, safeRandPos } = require('./spawning');
const { spawnBots, updateBots } = require('./bots');
const { getPlayerStates, getPlayerTicks, applyHungerDelta, resolveDeaths, clearPendingDeaths, eliminatePlayer, serializeFood, buildServerStatus } = require('./player');
const { handleWeaponPickups, handleArmorPickups } = require('./weapons');
const { updateProjectiles } = require('./combat');
const { rand } = require('./utils');
const gameFsm = require('./game-fsm');

function startGame() {
  lobbyState.transitionToPlaying();
  // Clear all round-scoped collections BEFORE map/food/bot generation refills them
  gameState.resetRound();
  // Drop any hunger-death ids that late-firing cowstrike callbacks (or any
  // end-of-round death path) may have left in the set while the round was ending.
  clearPendingDeaths();
  // Reset per-player move queue + ack state across round boundaries.
  for (const [, p] of gameState.getPlayers()) {
    p.lastInputSeq = 0;
    p._lastRecvMoveSeq = 0;
    p._moveQueue = null;
    p._lastMoveSpeedMult = 1;
    p._ackSnapshot = null;
  }
  // Clear the SI vault — stale snapshots from the previous round would
  // pollute lag-compensation lookups in the new round.
  SI.vault.clear();
  gameState.setGameTime(0);
  gameState.setZone({ x: 0, y: 0, w: MAP_W, h: MAP_H });
  generateTerrain(Math.random() * 10000);
  generateMap();
  spawnInitialFood();
  spawnBots();

  let i = 0;
  const spawnPoints = [];
  const cx = MAP_W / 2, cy = MAP_H / 2, radius = 400;
  const count = gameState.countInLobby();
  for (let j = 0; j < count; j++) {
    const angle = (j / count) * Math.PI * 2;
    const rawX = cx + Math.cos(angle) * radius, rawY = cy + Math.sin(angle) * radius;
    // Push spawn point out of wall deadzones
    const safe = safeRandPos(rawX - 30, rawX + 30, rawY - 30, rawY + 30);
    spawnPoints.push(safe);
  }

  for (const [, p] of gameState.getPlayers()) {
    if (p.inLobby) {
      const sp = spawnPoints[i % spawnPoints.length];
      Object.assign(p, {
        x: sp.x, y: sp.y, z: 0, vz: 0, onGround: true, hunger: 100, score: 0, alive: true,
        inLobby: false, dir: 'south', eating: false, eatTimer: 0,
        foodEaten: 0, xp: 0, level: 0, xpToNext: 50, kills: 0,
        dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
        perks: { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1 },
        weaponPerks: { cooldown: 1, hungerDiscount: 0, damageMult: 1 },
        weapon: 'normal', weaponTimer: 0,
        ammo: 10, reloading: 0,
        spawnProtection: 1,
      });
      i++;
    }
  }

  for (const [, p] of gameState.getPlayers()) { p.barricadeReadyAt = 0; p.mooReadyAt = 0; p.meleeReadyAt = 0; }
  broadcast({
    type: 'start',
    terrainSeed: getSeed(),
    players: getPlayerStates(),
    foods: gameState.getFoods().map(serializeFood),
    zone: gameState.getZone(),
    map: { walls: gameState.getWalls(), mud: gameState.getMudPatches(), ponds: gameState.getHealPonds(), portals: gameState.getPortals(), shelters: gameState.getShelters(), houses: gameState.getHouses() },
    barricades: gameState.getBarricades(),
    armorPickups: gameState.getArmorPickups().map(a => ({ id: a.id, x: a.x, y: a.y })),
    weapons: gameState.getWeaponPickups().map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon, spawnTime: w.spawnTime })),
  });
  broadcast(buildServerStatus());

  gameState.clearTickInterval();
  gameState.setTickInterval(setInterval(gameTick, 1000 / TICK_RATE));
}

function gameTick() {
  if (!lobbyState.isPlaying()) return;
  const dt = 1 / TICK_RATE;
  gameState.addGameTime(dt);
  gameState.incTickNum();
  // Lag comp history now handled by SI vault (populated at end of tick
  // via SI.snapshot.create + SI.vault.add).

  // Expire barricades older than 30 seconds
  const nowMs = Date.now();
  const barricades = gameState.getBarricades();
  for (let i = barricades.length - 1; i >= 0; i--) {
    const b = barricades[i];
    if (nowMs - b.placedAt > 30000) {
      broadcast({ type: 'barricadeDestroyed', id: b.id });
      gameState.removeBarricadeAt(i);
    }
  }
  // Reap player corpses after 15 seconds (removes from state so client cleans up mesh)
  for (const [id, p] of gameState.getPlayers()) {
    if (!p.alive && p.deathTime && nowMs - p.deathTime > 15000 && !p.inLobby) {
      if (p.isBot) {
        gameState.removePlayer(id);
      } else {
        // Keep humans in state so they can spectate, but mark corpse as gone
        p.corpseReaped = true;
      }
    }
  }
  // Expire weapon pickups after 15 seconds and respawn a new one
  const weaponPickups = gameState.getWeaponPickups();
  for (let i = weaponPickups.length - 1; i >= 0; i--) {
    const w = weaponPickups[i];
    if (!w.spawnTime) w.spawnTime = nowMs;
    if (nowMs - w.spawnTime > 15000) {
      broadcast({ type: 'weaponDespawn', id: w.id });
      gameState.removeWeaponPickupAt(i);
      const nw = spawnWeaponPickup();
      nw.spawnTime = nowMs;
      broadcast({ type: 'weaponSpawn', id: nw.id, x: nw.x, y: nw.y, weapon: nw.weapon, spawnTime: nw.spawnTime });
    }
  }

  // Zone is static — no shrinking
  const zone = gameState.getZone();

  const walls = gameState.getWalls();
  const mudPatches = gameState.getMudPatches();
  const healPonds = gameState.getHealPonds();
  const portals = gameState.getPortals();

  // Build the shared movement world + terrain shims once per tick so every
  // player call reuses the same references. Both objects are required by
  // shared/movement.js::stepPlayerMovement.
  const moveWorld = { walls, barricades, mudPatches, portals, zone };
  const moveTerrain = { getGroundHeight, WALL_HEIGHT };

  for (const [, p] of gameState.getPlayers()) {
    if (!p.alive) continue;

    // Drain ONE queued client move per tick — 1:1 with the client's
    // predict step. The dequeued speedMult is forwarded into the
    // integrator (knife / on-hit slowdown / future loadout effects).
    // On queue underflow we reuse the LAST drained mult so transient
    // packet loss doesn't drop the player back to baseline speed for
    // a tick — covers any future client-authoritative effect without
    // a per-effect special case here.
    let moveSpeedMult = p._lastMoveSpeedMult != null ? p._lastMoveSpeedMult : 1;
    if (p._moveQueue && p._moveQueue.length > 0) {
      const m = p._moveQueue.shift();
      p.dx = m.dx;
      p.dy = m.dy;
      p.walking = m.walking;
      if (m.aim != null) p.aimAngle = m.aim;
      if (typeof m.seq === 'number' && m.seq > (p.lastInputSeq || 0)) {
        p.lastInputSeq = m.seq;
      }
      if (typeof m.speedMult === 'number') moveSpeedMult = m.speedMult;
      p._lastMoveSpeedMult = moveSpeedMult;
    } else if (p.isBot && p.weapon === 'knife') {
      // Bots don't go through the queue — derive from server-side weapon.
      moveSpeedMult = KNIFE_SPEED_MULT;
    }

    // Apply deferred jump at drain time so it's in sync with the client
    // prediction cadence. Checked AFTER queue drain so it fires on the
    // same tick as the move that was active when Space was pressed.
    if (p._pendingJump && p.onGround) {
      p.vz = JUMP_VZ;
      p.onGround = false;
      p._pendingJump = false;
    }

    const wasSpawnProtected = p.spawnProtection > 0;

    stepPlayerMovement(p, dt, moveWorld, { dx: p.dx, dy: p.dy, walking: p.walking, speedMult: moveSpeedMult }, moveTerrain);

    // Capture ack snapshot on first tick that integrates a new seq.
    if (!p.isBot && (p._ackSnapshot == null || p.lastInputSeq > p._ackSnapshot.seq)) {
      if (!p._ackSnapshot) p._ackSnapshot = { seq: 0, x: 0, y: 0, z: 0, vz: 0, onGround: false, stunTimer: 0, spawnProt: false };
      const snap = p._ackSnapshot;
      snap.seq = p.lastInputSeq || 0;
      snap.x = p.x; snap.y = p.y; snap.z = p.z;
      snap.vz = p.vz || 0;
      snap.onGround = !!p.onGround;
      snap.stunTimer = p.stunTimer || 0;
      snap.spawnProt = p.spawnProtection > 0;
    }

    // Skip the remaining per-player work (hunger, food, cooldowns) for
    // spawn-protected players just like the old inline code did.
    if (wasSpawnProtected) continue;

    // Debug scene: infinite milk for all players
    if (gameState.isDebugScene() && p.hunger < 50) p.hunger = 100;

    // Heal ponds — hunger regen, stays here because stepPlayerMovement is
    // movement-only.
    for (const h of healPonds) {
      if (Math.hypot(p.x - h.x, p.y - h.y) < h.r) {
        applyHungerDelta(p, 3 * dt);
      }
    }

    // Zone damage disabled — no shrinking zone

    // Hunger drain (skip for bots when free will is off)
    if (!(p.isBot && !gameState.isBotsFreeWill())) {
      applyHungerDelta(p, -2 * dt);
    }

    // Cooldowns
    if (p.dashCooldown > 0) p.dashCooldown -= dt; if (p.pickupCooldown > 0) p.pickupCooldown -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;

    // Eat timer
    if (p.eating) { p.eatTimer -= dt; if (p.eatTimer <= 0) p.eating = false; }

    // Food collision
    const collectRadius = 35 + Math.min(20, p.foodEaten * 0.5);
    const foods = gameState.getFoods();
    for (let fi = foods.length - 1; fi >= 0; fi--) {
      const f = foods[fi];
      if (Math.hypot(p.x - f.x, p.y - f.y) < collectRadius) {
        if (f.poisoned) {
          applyHungerDelta(p, -20);
          p.stunTimer = 1.5;
        } else {
          applyHungerDelta(p, f.type.hunger);
          p.score += f.type.pts + (f.golden ? 30 : 0);
          if (f.golden) {
            p.perks.damage = Math.min(3, p.perks.damage + 0.5);
          }
        }
        p.foodEaten++;
        // Perks/XP temporarily disabled
        // p.xp = (p.xp || 0) + Math.floor(8 + Math.random() * 12);
        // if (p.xp >= p.xpToNext) { ... levelup ... }
        p.eating = true;
        p.eatTimer = 0.5;
        broadcast({ type: 'eat', playerId: p.id, foodId: f.id, foodType: f.type.name, golden: f.golden, poisoned: f.poisoned });
        gameState.removeFoodAt(fi);
      }
    }
  }

  // Weapon/armor pickups
  handleWeaponPickups(dt);
  handleArmorPickups();

  // Respawn armor pickups
  const armorPickups = gameState.getArmorPickups();
  if (Math.random() < 0.004 && armorPickups.length < 2) {
    const a = { id: gameState.nextEntityId(), x: rand(200, MAP_W-200), y: rand(200, MAP_H-200) };
    gameState.addArmorPickup(a);
    broadcast({ type: 'armorSpawn', id: a.id, x: a.x, y: a.y });
  }

  // Periodically spawn new weapon pickups
  if (Math.random() < 0.008 && weaponPickups.length < 6) {
    const w = spawnWeaponPickup();
    if (!w.spawnTime) w.spawnTime = nowMs;
    broadcast({ type: 'weaponSpawn', id: w.id, x: w.x, y: w.y, weapon: w.weapon, spawnTime: w.spawnTime });
  }

  // Update AI bots
  updateBots(dt);

  // Projectile updates
  updateProjectiles(dt);

  // Spawn food — cap at 60 total to keep food list from unbounded growth.
  const spawnChance = Math.max(1, gameState.countAlive(false)) * 0.15 * dt;
  if (Math.random() < spawnChance && gameState.getFoods().length < 60) {
    const roll = Math.random();
    let f;
    if (roll < 0.05) { f = spawnGoldenFood(); }
    else { f = spawnFood(false); }
    broadcast({ type: 'food', food: serializeFood(f) });
  }

  // Clean up volley hit trackers
  for (const [, p] of gameState.getPlayers()) { if (p._volleyHits) p._volleyHits = {}; }

  // End-of-tick death barrier. Every hunger mutation this tick (combat hits,
  // cowstrike, firing costs, poisoned food, zone/drain/pond) routed through
  // applyHungerDelta, which enqueues the victim if hunger fell to ≤0. Drain
  // the queue now so eliminations happen BEFORE the tick broadcast — stops
  // "dead" players from appearing alive for another 33 ms.
  if (resolveDeaths() > 0) checkWinner();

  // Build full player state and SI snapshot for lag comp vault.
  const players = getPlayerTicks();
  const snapshot = SI.snapshot.create(players);
  SI.vault.add(snapshot);

  // Per-client delta-compressed tick broadcast. Each client gets a delta
  // against the last snapshot they acked, or a full keyframe if no ack.
  const SNAP_RING_SIZE = 32;
  const currentTick = gameState.getTickNum();
  const tickZone = gameState.getZone();
  const gameTime = Math.floor(gameState.getGameTime());
  for (const [, p] of gameState.getPlayers()) {
    if (p.isBot || !p.ws) continue;
    const stride = Math.max(1, Math.round(TICK_RATE / (p.updateRate || TICK_RATE)));
    if (currentTick % stride !== 0) continue;

    const seq = p._snapSeq++;
    // Store a shallow copy so ring entries aren't aliased across ticks.
    p._snapRing[seq % SNAP_RING_SIZE] = { seq, state: players.map(p => ({ ...p })) };

    // Find the acked baseline.
    let baseline = null;
    if (p._lastAckedSnapSeq >= 0) {
      const entry = p._snapRing[p._lastAckedSnapSeq % SNAP_RING_SIZE];
      if (entry && entry.seq === p._lastAckedSnapSeq) baseline = entry.state;
    }

    let tickPayload;
    if (!baseline) {
      // No valid baseline — send full keyframe.
      tickPayload = {
        type: 'tick', tickNum: currentTick, snapSeq: seq,
        snapshot: { id: snapshot.id, time: snapshot.time, state: players },
        zone: tickZone, gameTime, keyframe: true,
      };
    } else {
      // Compute delta against baseline.
      const baseById = new Map();
      for (const bp of baseline) baseById.set(bp.id, bp);
      const delta = [];
      for (const cur of players) {
        const base = baseById.get(cur.id);
        if (!base) {
          delta.push({ ...cur, _full: true }); // new player
          continue;
        }
        const d = { id: cur.id };
        let changed = false;
        for (const key of Object.keys(cur)) {
          if (key === 'id') continue;
          if (cur[key] !== base[key]) { d[key] = cur[key]; changed = true; }
        }
        if (changed) delta.push(d);
      }
      // Detect players present in baseline but missing from current tick.
      const currentIds = new Set();
      for (const cur of players) currentIds.add(cur.id);
      const removedIds = [];
      for (const bp of baseline) {
        if (!currentIds.has(bp.id)) removedIds.push(bp.id);
      }
      tickPayload = {
        type: 'tick', tickNum: currentTick, snapSeq: seq,
        snapshot: { id: snapshot.id, time: snapshot.time, state: delta },
        zone: tickZone, gameTime,
      };
      if (removedIds.length) tickPayload.removedIds = removedIds;
    }
    transport.sendUnreliable(p.ws, tickPayload);
  }

  // inputAck at 15 Hz (every 2nd tick) — seq-based reconciliation for the
  // local player. SI handles remote player interpolation; this handles
  // local player prediction correction.
  if (gameState.getTickNum() % 2 === 0) {
    for (const [, p] of gameState.getPlayers()) {
      if (p.isBot || !p.ws || !p._ackSnapshot) continue;
      const snap = p._ackSnapshot;
      sendTo(p.ws, {
        type: 'inputAck',
        seq: snap.seq,
        x: snap.x, y: snap.y, z: snap.z,
        vz: snap.vz,
        onGround: snap.onGround,
        stunTimer: snap.stunTimer,
        spawnProt: snap.spawnProt,
      });
    }
  }
}

function checkWinner() {
  // Single pass counts both totals and picks the first alive player as winner
  // candidate — avoids two separate countAlive() iterations per tick.
  const players = gameState.getPlayers();
  let aliveTotal = 0, aliveHumans = 0, winner = null;
  for (const [, p] of players) {
    if (!p.alive) continue;
    aliveTotal++;
    if (!p.isBot) aliveHumans++;
    if (!winner) winner = p;
  }
  if ((aliveTotal <= 1 || aliveHumans === 0) && lobbyState.isPlaying()) {
    gameFsm.endRound(winner);
  }
}

gameFsm.registerStartGame(startGame);

module.exports = { startGame, gameTick, checkWinner, SI };
