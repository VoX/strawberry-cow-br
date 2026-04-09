const { broadcast } = require('./network');
const lobbyState = require('./lobby-state');
const gameState = require('./game-state');
const { broadcastPlayerSnapshot, applyHungerDelta, applyArmorDelta } = require('./player');

function handlePerk(player, id) {
  if (!player || !player.alive || !player.perks) return;
  const perks = player.perks;
  if (id === 'speed') perks.speedMult += 0.3;
  else if (id === 'extrahunger') perks.maxHunger += 25;
  else if (id === 'tiny') { if (perks.sizeMult > 0.43) { perks.speedMult += 0.25; perks.sizeMult *= 0.75; } }
  else if (id === 'fastfire') { if (player.weaponPerks) player.weaponPerks.cooldown *= 0.75; }
  else if (id === 'cheapshot') { if (player.weaponPerks) player.weaponPerks.hungerDiscount = (player.weaponPerks.hungerDiscount || 0) + 1; }
  else if (id === 'bigbore') { if (player.weaponPerks) player.weaponPerks.damageMult += 0.2; }
  else if (id === 'dashcd') { player.dashCdMult = (player.dashCdMult || 1) * 0.6; }
  else if (id === 'kevlar') {
    // Damage reduction perk — stacks
    if (!player.perks.damageReduction) player.perks.damageReduction = 0;
    player.perks.damageReduction = Math.min(0.75, player.perks.damageReduction + 0.15);
  }
  else if (id === 'milksteal') {
    player.milksteal = true;
    player.perks.damage += 0.0625; // roughly +0.5 dmg on 8-base weapons
  }
  else if (id === 'tacticow') {
    if (!player._hasTacticow) { player._hasTacticow = true; player.recoilMult = 0.7; }
  }
  else if (id === 'extmag') {
    if (!player._hasExtMag) {
      player._hasExtMag = true;
      player.extMagMult = 1.25; // kept for client-side compat; server uses the EXT_MAG lookup
      const { getMaxAmmo } = require('./combat');
      player.ammo = getMaxAmmo(player, player.weapon || 'normal');
    }
  }
  else if (id === 'cowstrike') {
    // One-shot visual + stun — no sticky-field mutation, so no snapshot below.
    gameState.setCowstrikeActive(true);
    broadcast({ type: 'cowstrikeWarning', playerId: player.id, name: player.name });
    gameState.scheduleRoundTimer(() => { gameState.setCowstrikeActive(false); }, 9000);
    [5000, 6500, 8000].forEach((delay, wave) => {
      gameState.scheduleRoundTimer(() => {
        if (!lobbyState.isPlaying()) return;
        const affectedIds = [];
        for (const [, target] of gameState.getPlayers()) {
          if (target.alive && target.id !== player.id) {
            let sheltered = false;
            for (const sh of gameState.getShelters()) {
              if (Math.hypot(target.x - sh.x, target.y - sh.y) < sh.r) { sheltered = true; break; }
            }
            if (sheltered) continue;
            applyArmorDelta(target, -(target.armor || 0));
            target.stunTimer = 1.5;
            applyHungerDelta(target, -15, player.id);
            affectedIds.push(target.id);
          }
        }
        // Broadcast the visual effect to everyone, but mark which players are being hit
        broadcast({ type: 'cowstrike', playerId: player.id, name: player.name, wave, affectedIds });
      }, delay);
    });
    return;
  }
  // All non-cowstrike perks mutated sticky fields (sizeMult, recoilMult,
  // extMagMult, perks.*). Ship a snapshot so clients pick up the new viewmodel
  // scale / HUD indicator / perk-gating logic immediately instead of drifting
  // until the next sticky-field change.
  broadcastPlayerSnapshot(player);
}

// Perks bots are allowed to auto-pick — matches the client-facing pool.
const BOT_PERKS = [
  'speed','extrahunger','fastfire','cheapshot','bigbore',
  'kevlar','dashcd','tiny','extmag','tacticow','milksteal',
];
function botPickRandomPerk(bot) {
  const pool = BOT_PERKS.filter(id => {
    if (id === 'extmag' && bot._hasExtMag) return false;
    if (id === 'tacticow' && bot._hasTacticow) return false;
    if (id === 'tiny' && bot.perks && bot.perks.sizeMult <= 0.43) return false;
    return true;
  });
  if (!pool.length) return;
  const id = pool[Math.floor(Math.random() * pool.length)];
  handlePerk(bot, id);
}

module.exports = { handlePerk, botPickRandomPerk };
