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
const { decideBotTurn, PERSONALITIES } = require('./bot-ai');
const { assignColor, broadcastPlayerSnapshot } = require('./player');
const weaponFire = require('./weapon-fire');
const { MAG_SIZES } = weaponFire;

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
  for (const [, p] of gameState.getPlayers()) { if (!p.isBot && p.name) humanNames.add(p.name.toLowerCase()); }
  const shuffled = lobbyState.getShuffledBotNames();
  const availNames = (shuffled.length ? shuffled : BOT_NAMES).filter(n => !humanNames.has(n.toLowerCase()));
  for (let i = 0; i < botsNeeded; i++) {
    const botId = gameState.nextPlayerId();
    const name = availNames[i % availNames.length] || ('Bot' + botId);
    // Permanent personality from BOT_PROFILES if the name is in the
    // table; otherwise random across the three personalities.
    const profile = BOT_PROFILES[name];
    const personality = (profile && profile.personality) || PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const bot = {
      id: botId, ws: null, name, color: assignColor(),
      x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200), z: 0, vz: 0, onGround: true, dx: 0, dy: 0, dir: 'south',
      hunger: 100, score: 0, alive: true, inLobby: false,
      eating: false, eatTimer: 0, foodEaten: 0,
      xp: 0, level: 0, xpToNext: 50, kills: 0,
      dashCooldown: 0, attackCooldown: 0, stunTimer: 0, lastAttacker: null,
      perks: { speedMult: 1, maxHunger: 100, sizeMult: 1, damage: 1 },
      weaponPerks: { cooldown: 1, hungerDiscount: 0, damageMult: 1 },
      weapon: 'normal', weaponTimer: 0, ammo: 15, reloading: 0, armor: 10 + Math.floor(Math.random() * 40),
      isBot: true, botTarget: null, botActionTimer: 2, spawnProtection: 1,
      personality,
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

function updateBots(dt) {
  if (!gameState.isBotsFreeWill()) return;
  const world = buildWorld();
  for (const [, p] of gameState.getPlayers()) {
    if (!p.isBot || !p.alive) continue;
    p.botActionTimer -= dt;
    if (p.botActionTimer > 0) continue;
    p.botActionTimer = 0.5 + Math.random() * 0.8;
    botMaybeChat(p);

    const intent = decideBotTurn(p, world);

    // Apply movement + facing
    p.dx = intent.dx;
    p.dy = intent.dy;
    if (intent.dx !== 0 || intent.dy !== 0) p.aimAngle = intent.aimAngle;

    // Execute fire intents (AI may request 0 or more per tick; current logic
    // only ever returns 0 or 1, but the list form keeps the door open)
    for (const fire of intent.fires) {
      fireBot(p, fire.ax, fire.ay, fire.target);
    }

    // Dash
    if (intent.dash) {
      p.dx = intent.dash.dx;
      p.dy = intent.dash.dy;
      handleDash(p);
      p.dashCooldown = p.dashCooldown * 4;
    }

    // Barricade drop
    if (intent.barricade) {
      placeBarricadeForPlayer(p, intent.barricade.ax, intent.barricade.ay);
    }
  }
}

// Bot firing: thin wrapper around weapon-fire.js::fireWeapon. Handles
// bot-specific concerns (aim-Z computed from target, aggressive → auto fire
// mode for burst, cowtank one-shot-drop cleanup). All per-weapon projectile
// spawning + broadcast lives in the shared spine.
function fireBot(bot, ax, ay, target) {
  // Fire direction overrides the movement aimAngle the orchestrator set above —
  // strafe direction and shoot direction aren't always the same (bots lead,
  // pivot-shoot, etc). The client-visible aim reflects the last action taken.
  bot.aimAngle = Math.atan2(-ax, ay);
  const weapon = bot.weapon || 'normal';
  const magSize = MAG_SIZES[weapon];
  if (magSize && bot.ammo <= 0) { handleReload(bot); return; }
  if (bot.reloading > 0) return;
  const { cdMult, dmgMult } = weaponFire.extractShooterModifiers(bot);

  const stats = weaponFire.BOT_STATS[weapon] || weaponFire.BOT_STATS.normal;
  if (bot.hunger <= stats.hungerGate) return;

  // Compute vertical aim from target elevation — bots don't have a camera, so
  // they lead the target's eye position using flat-ground distance.
  const botZ = bot.z + eyeHeight(bot);
  const targetZ = target ? (target.z + eyeHeight(target) / 2) : botZ;
  const targetDist2d = target ? Math.hypot(target.x - bot.x, target.y - bot.y) : 1;
  const az = targetDist2d > 1 ? (targetZ - botZ) / targetDist2d : 0;

  const fireMode = (weapon === 'burst' && bot.personality === 'aggressive') ? 'auto' : 'burst';
  const fired = weaponFire.fireWeapon(bot, weapon, { ax, ay, az }, stats, {
    walkSpreadMult: 1,
    dualWield: false,
    fireMode,
    emitMuzzleFlag: false,
    cdMult,
    dmgMult,
    eyeHeight,
  });
  if (!fired) return;

  // Cowtank one-shot drop — same as player handleAttack post-fire cleanup.
  if (weapon === 'cowtank') {
    bot.weapon = 'normal';
    bot.dualWield = false;
    bot.ammo = Math.ceil(15 * (bot.extMagMult || 1));
    bot.reloading = 0;
    broadcast({ type: 'weaponDrop', playerId: bot.id, name: bot.name });
    broadcastPlayerSnapshot(bot);
  }
}

module.exports = { spawnBots, updateBots };
