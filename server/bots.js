// Bot orchestration layer. All the side effects live here: broadcasts, combat
// handler invocations, projectile spawning, chat. The decision logic (target
// selection, movement, aim, fire intent) lives in pure `bot-ai.js`.
//
// updateBots() builds a read-only world struct once per tick and passes it to
// `decideBotTurn(bot, world)` for each alive bot. The returned `intent` is
// applied to the bot (mutations + side-effect calls).

const { MAP_W, MAP_H, BOT_NAMES, BOT_PROFILES, pickBotChatLine } = require('./config');
const { rand } = require('./utils');
const { broadcast } = require('./network');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { handleDash, handleReload, placeBarricadeForPlayer, eyeHeight } = require('./combat');
const { handleDropWeapon } = require('./weapons');
const { resetAfterCowtank } = require('./weapon-fire');
const { decideBotTurn } = require('./bot-ai');
const { assignColor } = require('./player');
const weaponFire = require('./weapon-fire');
const { MAG_SIZES } = require('../shared/constants');

function botMaybeChat(bot) {
  if (!bot._lastChatT) bot._lastChatT = 0;
  bot._lastChatT++;
  if (bot._lastChatT < 18) return;
  if (Math.random() < 0.08) {
    const line = pickBotChatLine(bot);
    if (!line) return;
    broadcast({ type: 'chat', playerId: bot.id, name: bot.name, color: bot.color, text: line });
    bot._lastChatT = 0;
  }
}

function spawnBots() {
  if (!gameState.isBotsEnabled()) return;
  const humanCount = gameState.countInLobby();
  const botsNeeded = Math.max(0, 8 - humanCount);
  const humanNames = new Set();
  let hasTank = false;
  for (const [, p] of gameState.getPlayers()) {
    if (!p.isBot && p.name) humanNames.add(p.name.toLowerCase());
    if (p.isTank) hasTank = true;
  }
  const shuffled = lobbyState.getShuffledBotNames();
  const availNames = (shuffled.length ? shuffled : BOT_NAMES).filter(n => !humanNames.has(n.toLowerCase()));
  for (let i = 0; i < botsNeeded; i++) {
    const botId = gameState.nextPlayerId();
    // First spawned bot in a fresh round is the M1 Bradley. Only one per round.
    const isTank = !hasTank && i === 0;
    if (isTank) hasTank = true;
    const name = isTank ? 'M1 Bradley' : (availNames[i % availNames.length] || ('Bot' + botId));
    const bot = {
      id: botId, ws: null, name, color: assignColor(),
      x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200), z: 0, vz: 0, onGround: true, dx: 0, dy: 0, dir: 'south',
      hunger: isTank ? 300 : 100, score: 0, alive: true, inLobby: false,
      eating: false, eatTimer: 0, foodEaten: 0,
      xp: 0, level: 0, xpToNext: 50, kills: 0,
      dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
      perks: isTank
        ? { speedMult: 0.55, maxHunger: 300, sizeMult: 1.7, damage: 1.2 }
        : { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1 },
      weaponPerks: { cooldown: 1, hungerDiscount: 0, damageMult: 1 },
      weapon: isTank ? 'cowtank' : 'normal',
      weaponTimer: 0,
      ammo: isTank ? 999 : 10,
      reloading: 0,
      armor: isTank ? 200 : (10 + Math.floor(Math.random() * 40)),
      maxArmor: isTank ? 200 : undefined,
      isBot: true, botTarget: null, botActionTimer: 2, spawnProtection: 1,
      // Tank-specific fields. Secondary M249 ticks on its own cooldown so the
      // cannon and the coax MG fire independently; the M1 Bradley shoots both
      // every chance it gets.
      isTank,
      _secondaryWeapon: isTank ? 'm249' : null,
      _secondaryAmmo: isTank ? 999 : 0,
      _secondaryAttackCooldown: 0,
      // Smoothed turret heading. Lerps toward the desired aim at a capped rate
      // so quick player jukes outpace the cannon traverse — that "delayed
      // turning" feeling master asked for.
      _tankTurretAim: 0,
    };
    gameState.addPlayer(botId, bot);
  }
}

// Build a read-only view of the world for bot-ai. References are shared, not
// copied — decision code must not mutate anything on the struct.
function buildWorld() {
  return {
    players: gameState.getPlayers(),
    foods: gameState.getFoods(),
    walls: gameState.getWalls(),
    weaponPickups: gameState.getWeaponPickups(),
    shelters: gameState.getShelters(),
    isCowstrikeActive: gameState.isCowstrikeActive(),
  };
}

// Tank turret traverse rate (rad/s). Low enough that a sprinting player
// circling the tank can stay outside the cannon's lead — that's the design.
const TANK_TURN_RATE = 0.7;

function _shortestAngleDelta(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function updateBots(dt) {
  if (!gameState.isBotsFreeWill()) return;
  const world = buildWorld();
  for (const [, p] of gameState.getPlayers()) {
    if (!p.isBot || !p.alive) continue;
    p.botActionTimer -= dt;
    if (p.botActionTimer > 0) continue;
    p.botActionTimer = 0.15 + Math.random() * 0.25;
    botMaybeChat(p);

    const intent = decideBotTurn(p, world);

    // Apply movement + facing + fire mode
    p.dx = intent.dx;
    p.dy = intent.dy;
    if (p.isTank) {
      // Smoothed turret traverse — desired heading is whatever the AI wanted
      // (movement aim or fire-target aim). We rotate at most TANK_TURN_RATE
      // per second toward it so the cannon visibly trails the player.
      // botActionTimer drives the loop at 0.15-0.4s, so multiply by that
      // window to avoid microsteps that look like instant snaps.
      const stepDt = 0.15 + 0.25; // upper bound; close enough for visible lag
      let desired = intent.aimAngle;
      if (intent.fires && intent.fires.length > 0) {
        const f = intent.fires[0];
        desired = Math.atan2(-f.ax, f.ay);
      }
      const delta = _shortestAngleDelta(p.aimAngle || 0, desired);
      const maxStep = TANK_TURN_RATE * stepDt;
      const step = Math.max(-maxStep, Math.min(maxStep, delta));
      p.aimAngle = (p.aimAngle || 0) + step;
    } else if (intent.dx !== 0 || intent.dy !== 0) {
      p.aimAngle = intent.aimAngle;
    }
    if (intent.fireMode) p._fireMode = intent.fireMode;

    // Drop weapon to make room for upgrade pickup
    if (intent.dropWeapon) {
      handleDropWeapon(p);
    }

    // Execute fire intents — for tanks, the cannon's actual fire direction
    // is the current (lagged) turret heading, NOT the AI's desired aim.
    // Fast strafing players slip the lead; slow ones eat a rocket.
    for (const fire of intent.fires) {
      if (p.isTank) {
        const ax = -Math.sin(p.aimAngle);
        const ay = Math.cos(p.aimAngle);
        fireBot(p, ax, ay, fire.target);
      } else {
        fireBot(p, fire.ax, fire.ay, fire.target);
      }
    }

    // Tank coax M249 — independent cooldown, fires the moment a target is
    // reachable along the current turret heading. Same lagged aim, different
    // weapon profile (hitscan, tiny per-shot damage, fast cycle).
    if (p.isTank && (p._secondaryAttackCooldown || 0) <= 0) {
      let target = null, td = Infinity;
      for (const [, e] of gameState.getPlayers()) {
        if (e.id === p.id || !e.alive || e.inLobby) continue;
        if (e.spawnProtection > 0) continue;
        const d = Math.hypot(p.x - e.x, p.y - e.y);
        if (d < td) { td = d; target = e; }
      }
      if (target && td < 700) {
        const ax = -Math.sin(p.aimAngle);
        const ay = Math.cos(p.aimAngle);
        fireBotSecondary(p, ax, ay, target);
      }
    }

    // Dash — tanks don't dash. Treads, not wheels.
    if (intent.dash && !p.isTank) {
      p.dx = intent.dash.dx;
      p.dy = intent.dash.dy;
      handleDash(p);
      p.dashCooldown = p.dashCooldown * 4;
    }

    // Barricade drop — tanks don't deploy cover either.
    if (intent.barricade && !p.isTank) {
      placeBarricadeForPlayer(p, intent.barricade.ax, intent.barricade.ay);
    }
  }
}

// Bot firing: thin wrapper around weapon-fire.js::fireWeapon. Handles
// bot-specific concerns (aim-Z computed from target, aggressive → auto fire
// mode for burst, cowtank one-shot-drop cleanup). All per-weapon projectile
// spawning + broadcast lives in the shared spine.
function fireBot(bot, ax, ay, target) {
  // Fire direction overrides the movement aimAngle for normal bots (strafe and
  // shoot directions diverge — leading, pivoting, etc). Tanks skip the snap
  // because their aimAngle IS the slow-traversed turret heading; we'd undo the
  // lag if we let fireBot smash it back to the target vector.
  if (!bot.isTank) bot.aimAngle = Math.atan2(-ax, ay);
  const weapon = bot.weapon || 'normal';
  const magSize = MAG_SIZES[weapon];
  if (magSize && bot.ammo <= 0) { handleReload(bot); return; }
  if (bot.reloading > 0) return;
  const { cdMult, dmgMult } = weaponFire.extractShooterModifiers(bot);

  const stats = weaponFire.BOT_STATS[weapon] || weaponFire.BOT_STATS.normal;

  // Compute vertical aim from target elevation — bots don't have a camera, so
  // they lead the target's eye position using flat-ground distance.
  const botZ = bot.z + eyeHeight(bot);
  const targetZ = target ? (target.z + eyeHeight(target) / 2) : botZ;
  const targetDist2d = target ? Math.hypot(target.x - bot.x, target.y - bot.y) : 1;
  const az = targetDist2d > 1 ? (targetZ - botZ) / targetDist2d : 0;

  const fired = weaponFire.fireWeapon(bot, weapon, { ax, ay, az }, stats, {
    walkSpreadMult: 1,
    dualWield: false,
    fireMode: bot._fireMode || 'auto',
    emitMuzzleFlag: false,
    cdMult,
    dmgMult,
    eyeHeight,
  });
  if (!fired) return;

  // Tanks have an inexhaustible cannon — skip the disposable-LAW reset that
  // would otherwise hand them a pistol after every shot.
  if (weapon === 'cowtank' && !bot.isTank) resetAfterCowtank(bot);
}

// Tank coax-MG fire. Swaps the shooter's weapon/cooldown/ammo to the secondary
// slot for the duration of the fireWeapon call so the centralized fire spine
// reads the right stats, then restores the primary slot. Eye height is
// elevated because the M249 sits on top of the turret roof, above the cannon.
const TANK_M249_EYE_OFFSET = 50;
function tankSecondaryEyeHeight(p) { return eyeHeight(p) + TANK_M249_EYE_OFFSET; }

function fireBotSecondary(bot, ax, ay, target) {
  const weapon = bot._secondaryWeapon;
  if (!weapon) return;
  const stats = weaponFire.BOT_STATS[weapon] || weaponFire.BOT_STATS.normal;

  // Vertical lead from the elevated mount.
  const botZ = bot.z + tankSecondaryEyeHeight(bot);
  const targetZ = target ? (target.z + eyeHeight(target) / 2) : botZ;
  const targetDist2d = target ? Math.hypot(target.x - bot.x, target.y - bot.y) : 1;
  const az = targetDist2d > 1 ? (targetZ - botZ) / targetDist2d : 0;

  // Save primary slot, swap in secondary so fireWeapon sees a "normal" shooter.
  const savedWeapon = bot.weapon;
  const savedAmmo = bot.ammo;
  const savedCd = bot.attackCooldown;
  bot.weapon = weapon;
  bot.ammo = bot._secondaryAmmo;
  bot.attackCooldown = 0;

  const { cdMult, dmgMult } = weaponFire.extractShooterModifiers(bot);
  const fired = weaponFire.fireWeapon(bot, weapon, { ax, ay, az }, stats, {
    walkSpreadMult: 1,
    dualWield: false,
    fireMode: 'auto',
    emitMuzzleFlag: false,
    cdMult,
    dmgMult,
    eyeHeight: tankSecondaryEyeHeight,
  });

  // Capture mutations the fire spine wrote into shooter.attackCooldown/.ammo
  // BEFORE restoring the primary slot, so the secondary cooldown ticks down
  // independently and the secondary mag drains independently.
  if (fired) {
    bot._secondaryAttackCooldown = bot.attackCooldown;
    bot._secondaryAmmo = bot.ammo;
  }
  bot.weapon = savedWeapon;
  bot.ammo = savedAmmo;
  bot.attackCooldown = savedCd;
}

module.exports = { spawnBots, updateBots };
