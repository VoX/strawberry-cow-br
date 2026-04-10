const { TICK_RATE, MAP_W, MAP_H } = require('./config');
const { KNIFE_SPEED_MULT } = require('../shared/constants');
const { stepPlayerMovement } = require('../shared/movement');
const { broadcast, sendTo } = require('./network');
const transport = require('./transport');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { generateMap } = require('./map');
const { getGroundHeight, WALL_HEIGHT, generateTerrain, getSeed } = require('./terrain');
const { spawnInitialFood, spawnFood, spawnGoldenFood, spawnWeaponPickup, safeRandPos } = require('./spawning');
const { spawnBots, updateBots } = require('./bots');
const { getPlayerStates, getPlayerTicks, getPlayerTickDeltas, broadcastPlayerSnapshot, applyHungerDelta, resolveDeaths, clearPendingDeaths, eliminatePlayer, serializeFood, buildServerStatus } = require('./player');
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
  // Reset per-player input seq counters — CSP (Phase 4) replays inputs-since-ack,
  // and carrying seqs across a round boundary would reference sim state that
  // no longer exists. Client mirrors this reset in the `start` handler. The
  // ackSnapshot follows the same lifecycle — clear it so the first inputAck
  // of the new round doesn't ship a stale-round position to the client.
  for (const [, p] of gameState.getPlayers()) {
    p.lastInputSeq = 0;
    p._lastRecvMoveSeq = 0;
    p._moveQueue = null;
    p._lastMoveSpeedMult = 1;
    p._ackSnapshot = null;
  }
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
  // Phase 5: capture the "display state" positions BEFORE movement runs,
  // so lag compensation in Phase 6 can rewind to the frame the client was
  // actually looking at when they pulled the trigger. Stored under the
  // incremented tickNum — consumers look up by tickNum.
  gameState.pushHistorySnapshot();

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

    // Snapshot stored in place — re-armed only when lastInputSeq
    // advances. Each draining of the queue advances lastInputSeq by
    // exactly one client predict step's worth, so the snapshot now
    // truly represents "first server tick that integrated this seq",
    // matching the client's first ring entry for that seq.
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

  // Broadcast tick — mutable-per-tick player fields only. Sticky fields
  // (name/color/weapon/perks/xpToNext/sizeMult/recoilMult/extMagMult) travel
  // on the 'playerSnapshot' message emitted at weapon pickup / perk /
  // level up / armor / dual-wield events. Zone is 4 numbers, sent every tick.
  // Phase 7: build the tick payload once, then per-client sendUnreliable
  // with a stride gate so each client sees their chosen updateRate. A
  // player with updateRate=15 gets every 2nd tick; updateRate=30 gets
  // every tick. `tick` is unreliable — on WebSocket this drops under
  // backpressure; on geckos.io it goes out as fire-and-forget UDP.
  //
  // KNOWN LATENT ISSUES — safe today because no client UI changes
  // updateRate from the default 30 (stride always = 1). Fix together
  // BEFORE shipping a client-side rate control: interp delay, displayTick
  // math, and inputAck cadence all assume 30 Hz tick arrival.
  const tickPayload = {
    type: 'tick',
    tickNum: gameState.getTickNum(),
    players: getPlayerTickDeltas(),
    zone: gameState.getZone(),
    gameTime: Math.floor(gameState.getGameTime()),
  };
  const currentTick = gameState.getTickNum();
  for (const [, p] of gameState.getPlayers()) {
    if (p.isBot || !p.ws) continue;
    const stride = Math.max(1, Math.round(TICK_RATE / (p.updateRate || TICK_RATE)));
    if (currentTick % stride !== 0) continue;
    transport.sendUnreliable(p.ws, tickPayload);
  }

  // Phase 2 input ack — echo each human player's last-applied input seq
  // plus the server-authoritative position AT THE TICK THAT FIRST PROCESSED
  // THAT SEQ. CSP reconcile pairs predicted-at-seq against this snapshot;
  // sending the LATEST position would let drift accumulate linearly with
  // idle ticks past the input and snap on every ack. The snapshot is
  // captured in the per-player movement loop above when lastInputSeq
  // first advances.
  // inputAck at 15 Hz (every 2nd tick) — faster reconciliation for the new TTK
  if (gameState.getTickNum() % 2 === 0) {
    for (const [, p] of gameState.getPlayers()) {
      if (p.isBot || !p.ws || !p._ackSnapshot) continue;
      const snap = p._ackSnapshot;
      // Net stats — moves received in the trailing 1-second window vs
      // expected (TICK_RATE/sec). Lets the client debug overlay show
      // unreliable C2S packet loss.
      const moveArrivedPct = p._moveArrivals ? Math.round((p._moveArrivals.length / TICK_RATE) * 100) : 0;
      sendTo(p.ws, {
        type: 'inputAck',
        seq: snap.seq,
        x: snap.x, y: snap.y, z: snap.z,
        vz: snap.vz,
        onGround: snap.onGround,
        stunTimer: snap.stunTimer,
        spawnProt: snap.spawnProt,
        moveArrivedPct,
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

module.exports = { startGame, gameTick, checkWinner };
