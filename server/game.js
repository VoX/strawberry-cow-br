const { TICK_RATE, MAP_W, MAP_H } = require('./config');
const { broadcast, sendTo } = require('./network');
const state = require('./state');
const { generateMap } = require('./map');
const { getGroundHeight, WALL_HEIGHT, generateTerrain, getSeed } = require('./terrain');
const { spawnInitialFood, spawnFood, spawnGoldenFood, spawnWeaponPickup } = require('./spawning');
const { spawnBots, updateBots } = require('./bots');
const { getPlayerStates, eliminatePlayer, serializeFood } = require('./player');
const { countReady } = require('./lobby');
const { handleWeaponPickups, handleArmorPickups } = require('./weapons');
const { updateProjectiles, handleBumpCombat } = require('./combat');
const { rand } = require('./utils');

function startGame() {
  state.gameState = 'playing';
  state.gameTime = 0;
  state.zone = { x: 0, y: 0, w: MAP_W, h: MAP_H };
  generateTerrain(Math.random() * 10000);
  generateMap();
  spawnInitialFood();
  spawnBots();

  let i = 0;
  const spawnPoints = [];
  const cx = MAP_W / 2, cy = MAP_H / 2, radius = 400;
  const count = countReady();
  for (let j = 0; j < count; j++) {
    const angle = (j / count) * Math.PI * 2;
    spawnPoints.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }

  for (const [, p] of state.players) {
    if (p.inLobby) {
      const sp = spawnPoints[i % spawnPoints.length];
      Object.assign(p, {
        x: sp.x, y: sp.y, z: 0, vz: 0, onGround: true, hunger: 100, score: 0, alive: true,
        inLobby: false, dir: 'south', eating: false, eatTimer: 0,
        foodEaten: 0, xp: 0, level: 0, xpToNext: 50, kills: 0,
        dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
        perks: { speedMult: 1, radiusMult: 1, drainMult: 1, magnetRange: 0, regen: 0, maxHunger: 100, sizeMult: 1, damage: 1 },
        weaponPerks: { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false, burstMod: false },
        weapon: 'normal', weaponLevel: 0, weaponTimer: 0,
        ammo: 15, reloading: 0,
        spawnProtection: 1,
      });
      i++;
    }
  }

  state.aliveCount = 0;
  for (const [, p] of state.players) { if (p.alive) state.aliveCount++; }
  // Clear player-placed barricades from previous round
  state.BARRICADES = [];
  for (const [, p] of state.players) { p.barricadeReadyAt = 0; }
  broadcast({
    type: 'start',
    terrainSeed: getSeed(),
    players: getPlayerStates(),
    foods: state.foods.map(serializeFood),
    zone: state.zone,
    map: { walls: state.WALLS, mud: state.MUD_PATCHES, ponds: state.HEAL_PONDS, portals: state.PORTALS, shelters: state.SHELTERS },
    barricades: state.BARRICADES,
    armorPickups: state.armorPickups.map(a => ({ id: a.id, x: a.x, y: a.y })),
    weapons: state.weaponPickups.map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })),
  });

  if (state.tickInterval) clearInterval(state.tickInterval);
  state.tickInterval = setInterval(gameTick, 1000 / TICK_RATE);
}

function gameTick() {
  if (state.gameState !== 'playing') return;
  const dt = 1 / TICK_RATE;
  state.gameTime += dt;

  // Shrinking zone after 60 seconds
  if (state.gameTime > 60) {
    const shrinkRate = 15 * dt;
    state.zone.x += shrinkRate / 2;
    state.zone.y += shrinkRate / 2;
    state.zone.w = Math.max(400, state.zone.w - shrinkRate);
    state.zone.h = Math.max(300, state.zone.h - shrinkRate);
  }

  const deadThisTick = [];

  for (const [, p] of state.players) {
    if (!p.alive) continue;

    if (p.stunTimer > 0) { p.stunTimer -= dt; }

    // Spawn protection
    if (p.spawnProtection > 0) { p.spawnProtection -= dt; continue; }

    // Movement
    if (Math.abs(p.dx) + Math.abs(p.dy) > 0.01 && p.stunTimer <= 0) {
      const len = Math.hypot(p.dx, p.dy);
      const nx = p.dx / len, ny = p.dy / len;
      const sizeSlowdown = 1 - Math.min(0.3, p.foodEaten * 0.01);
      let mudSlow = 1;
      for (const m of state.MUD_PATCHES) { if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) { mudSlow = 0.5; break; } }
      const walkMult = p.walking ? 0.5 : 1;
      const speed = 108 * sizeSlowdown * p.perks.speedMult * mudSlow * walkMult;
      p.x += nx * speed * dt;
      p.y += ny * speed * dt;
      if (Math.abs(nx) > Math.abs(ny)) p.dir = nx > 0 ? 'east' : 'west';
      else p.dir = ny > 0 ? 'south' : 'north';
      if (p.isBot) p.aimAngle = Math.atan2(-nx, ny);
    }

    // Wall collision
    for (const w of state.WALLS) {
      if (p.x > w.x - 15 && p.x < w.x + w.w + 15 && p.y > w.y - 15 && p.y < w.y + w.h + 15) {
        const wallTop = getGroundHeight(w.x + w.w/2, w.y + w.h/2) + WALL_HEIGHT;
        if (p.z < wallTop) {
          const escL = p.x - (w.x - 15), escR = (w.x + w.w + 15) - p.x;
          const escT = p.y - (w.y - 15), escB = (w.y + w.h + 15) - p.y;
          const minEsc = Math.min(escL, escR, escT, escB);
          if (minEsc === escL) p.x = w.x - 15;
          else if (minEsc === escR) p.x = w.x + w.w + 15;
          else if (minEsc === escT) p.y = w.y - 15;
          else p.y = w.y + w.h + 15;
        }
      }
    }
    // Barricade collision (OBB push-out) — 55 units tall
    // Local axes: lx = along aim (thin, b.h), ly = perpendicular (wide, b.w)
    for (const b of state.BARRICADES) {
      const bTop = getGroundHeight(b.cx, b.cy) + 55;
      if (p.z >= bTop) continue;
      const dxB = p.x - b.cx, dyB = p.y - b.cy;
      const cosA = Math.cos(b.angle), sinA = Math.sin(b.angle);
      const lx = cosA * dxB + sinA * dyB;
      const ly = -sinA * dxB + cosA * dyB;
      const halfThin = b.h / 2 + 15, halfWide = b.w / 2 + 15;
      if (Math.abs(lx) < halfThin && Math.abs(ly) < halfWide) {
        // Push out along whichever axis has the shallower penetration
        const overThin = halfThin - Math.abs(lx);
        const overWide = halfWide - Math.abs(ly);
        let newLx = lx, newLy = ly;
        if (overThin < overWide) newLx = lx >= 0 ? halfThin : -halfThin;
        else newLy = ly >= 0 ? halfWide : -halfWide;
        p.x = b.cx + cosA * newLx - sinA * newLy;
        p.y = b.cy + sinA * newLx + cosA * newLy;
      }
    }

    // Height physics
    const groundH = getGroundHeight(p.x, p.y);
    if (p.vz === undefined) { p.z = groundH; p.vz = 0; }
    p.vz -= 800 * dt; // gravity
    p.z += p.vz * dt;
    if (p.z <= groundH) { p.z = groundH; p.vz = 0; p.onGround = true; }
    else { p.onGround = false; }

    // Portal teleportation
    if (!p._portalCooldown || p._portalCooldown <= 0) {
      for (const portal of state.PORTALS) {
        if (Math.hypot(p.x - portal.x1, p.y - portal.y1) < 35) {
          p.x = portal.x2; p.y = portal.y2; p._portalCooldown = 2;
          broadcast({ type: 'teleport', playerId: p.id, x: portal.x2, y: portal.y2 });
          break;
        }
        if (Math.hypot(p.x - portal.x2, p.y - portal.y2) < 35) {
          p.x = portal.x1; p.y = portal.y1; p._portalCooldown = 2;
          broadcast({ type: 'teleport', playerId: p.id, x: portal.x1, y: portal.y1 });
          break;
        }
      }
    }
    if (p._portalCooldown > 0) p._portalCooldown -= dt;

    // Mud slow
    let inMud = false;
    for (const m of state.MUD_PATCHES) {
      if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) { inMud = true; break; }
    }
    if (inMud) { p.x -= (p.x - (p.x - (p.dx || 0) * 0.3 * dt)); }

    // Heal ponds
    for (const h of state.HEAL_PONDS) {
      if (Math.hypot(p.x - h.x, p.y - h.y) < h.r) {
        p.hunger = Math.min(p.perks.maxHunger, p.hunger + 3 * dt);
      }
    }

    // Clamp to zone
    p.x = Math.max(state.zone.x + 20, Math.min(state.zone.x + state.zone.w - 20, p.x));
    p.y = Math.max(state.zone.y + 20, Math.min(state.zone.y + state.zone.h - 20, p.y));

    // Zone damage
    if (p.x <= state.zone.x + 5 || p.x >= state.zone.x + state.zone.w - 5 || p.y <= state.zone.y + 5 || p.y >= state.zone.y + state.zone.h - 5) {
      p.hunger -= 8 * dt;
    }

    // Hunger drain (skip for bots when free will is off)
    if (!(p.isBot && !state.botsFreeWill)) {
      const drainRate = 2 * p.perks.drainMult;
      p.hunger -= drainRate * dt;
    }

    // Regen
    if (p.perks.regen > 0) {
      p.hunger = Math.min(p.perks.maxHunger, p.hunger + p.perks.regen * dt);
    }

    // Cooldowns
    if (p.dashCooldown > 0) p.dashCooldown -= dt; if (p.pickupCooldown > 0) p.pickupCooldown -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;

    if (p.hunger <= 0) {
      p.hunger = 0;
      deadThisTick.push(p);
      continue;
    }

    // Eat timer
    if (p.eating) { p.eatTimer -= dt; if (p.eatTimer <= 0) p.eating = false; }

    // Magnet
    if (p.perks.magnetRange > 0) {
      for (const f of state.foods) {
        const fdx = p.x - f.x, fdy = p.y - f.y, fdist = Math.hypot(fdx, fdy);
        if (fdist < p.perks.magnetRange && fdist > 5) {
          f.x += fdx * 250 * dt / fdist;
          f.y += fdy * 250 * dt / fdist;
        }
      }
    }

    // Food collision
    const collectRadius = (35 + Math.min(20, p.foodEaten * 0.5)) * p.perks.radiusMult;
    for (let fi = state.foods.length - 1; fi >= 0; fi--) {
      const f = state.foods[fi];
      if (Math.hypot(p.x - f.x, p.y - f.y) < collectRadius) {
        if (f.poisoned) {
          p.hunger -= 20;
          p.stunTimer = 1.5;
          broadcast({ type: 'poison', playerId: p.id });
        } else {
          p.hunger = Math.min(p.perks.maxHunger, p.hunger + f.type.hunger);
          p.score += f.type.pts + (f.golden ? 30 : 0);
          if (f.golden) {
            p.perks.damage = Math.min(3, p.perks.damage + 0.5);
            broadcast({ type: 'powerup', playerId: p.id, name: p.name });
          }
        }
        p.foodEaten++;
        p.xp = (p.xp || 0) + Math.floor(8 + Math.random() * 12);
        if (p.xp >= p.xpToNext) {
          p.xp = Math.max(0, p.xp - p.xpToNext);
          p.level++;
          p.xpToNext = Math.floor(50 + p.level * 25 + p.level * p.level * 5);
          if (p.isBot) { const { botPickRandomPerk } = require('./perks'); botPickRandomPerk(p); }
          else sendTo(p.ws, { type: 'levelup', level: p.level });
        }
        p.eating = true;
        p.eatTimer = 0.5;
        broadcast({ type: 'eat', playerId: p.id, foodId: f.id, foodType: f.type.name, golden: f.golden, poisoned: f.poisoned });
        state.foods.splice(fi, 1);
      }
    }
  }

  // Weapon/armor pickups
  handleWeaponPickups(dt);
  handleArmorPickups();

  // Respawn armor pickups
  if (Math.random() < 0.004 && state.armorPickups.length < 2) {
    const a = { id: state.foodIdCounter++, x: rand(200, MAP_W-200), y: rand(200, MAP_H-200) };
    state.armorPickups.push(a);
    broadcast({ type: 'armorSpawn', id: a.id, x: a.x, y: a.y });
  }

  // Periodically spawn new weapon pickups
  if (Math.random() < 0.008 && state.weaponPickups.length < 6) {
    const w = spawnWeaponPickup();
    broadcast({ type: 'weaponSpawn', id: w.id, x: w.x, y: w.y, weapon: w.weapon });
  }

  // Process deaths
  for (const p of deadThisTick) {
    eliminatePlayer(p, 'hunger');
  }
  if (deadThisTick.length > 0) checkWinner();

  // Update AI bots
  updateBots(dt);

  // Projectile updates
  updateProjectiles(dt);

  // Spawn food
  const spawnChance = Math.max(1, state.aliveCount) * 0.15 * dt;
  if (Math.random() < spawnChance) {
    const roll = Math.random();
    let f;
    if (roll < 0.05) { f = spawnGoldenFood(); }
    else { f = spawnFood(false); }
    broadcast({ type: 'food', food: serializeFood(f) });
  }

  // Clean up volley hit trackers
  for (const [, p] of state.players) { if (p._volleyHits) p._volleyHits = {}; }

  // Broadcast state
  broadcast({ type: 'state', players: getPlayerStates(), foodCount: state.foods.length, zone: state.zone, gameTime: Math.floor(state.gameTime) });
}

function checkWinner() {
  const aliveHumans = [...state.players.values()].filter(p => p.alive && !p.isBot).length;
  const shouldEnd = state.aliveCount <= 1 || aliveHumans === 0;
  if (shouldEnd && state.gameState === 'playing') {
    let winner = null;
    for (const [, p] of state.players) {
      if (p.alive) { winner = p; break; }
    }
    state.gameState = 'ending';
    if (state.tickInterval) { clearInterval(state.tickInterval); state.tickInterval = null; }
    broadcast({ type: 'winner', playerId: winner ? winner.id : null, name: winner ? winner.name : 'Nobody', kills: winner ? winner.kills : 0, score: winner ? winner.score : 0 });
    let countdown = 10;
    state.restartTimer = setInterval(() => {
      countdown--;
      broadcast({ type: 'restart', countdown });
      if (countdown <= 0) {
        clearInterval(state.restartTimer);
        state.restartTimer = null;
        for (const [id, p] of state.players) {
          if (p.isBot) { state.players.delete(id); }
          else { p.inLobby = true; p.alive = false; }
        }
        const { startLobby } = require('./lobby');
        startLobby();
      }
    }, 1000);
  }
}

module.exports = { startGame, gameTick, checkWinner };
