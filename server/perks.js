const { broadcast } = require('./network');
const state = require('./state');

function handlePerk(player, id) {
  if (!player || !player.alive || !player.perks) return;
  const perks = player.perks;
  if (id === 'speed') perks.speedMult += 0.3;
  else if (id === 'magnet') perks.magnetRange += 200;
  else if (id === 'extrahunger') perks.maxHunger += 25;
  else if (id === 'drain') perks.drainMult *= 0.7;
  else if (id === 'radius') perks.radiusMult += 0.3;
  else if (id === 'regen') perks.regen += 0.5;
  else if (id === 'feast') player.hunger = perks.maxHunger;
  else if (id === 'tiny') { if (perks.sizeMult > 0.43) { perks.speedMult += 0.25; perks.sizeMult *= 0.75; } }
  else if (id === 'damage') perks.damage += 0.5;
  else if (id === 'velocity') { if (player.weaponPerks) player.weaponPerks.velocity += 0.4; }
  else if (id === 'fastfire') { if (player.weaponPerks) player.weaponPerks.cooldown *= 0.75; }
  else if (id === 'cheapshot') { if (player.weaponPerks) player.weaponPerks.hungerDiscount = (player.weaponPerks.hungerDiscount || 0) + 1; }
  else if (id === 'extraproj') { if (player.weaponPerks) player.weaponPerks.extraProj += 1; }
  else if (id === 'bigbore') { if (player.weaponPerks) player.weaponPerks.damageMult += 0.2; }
  else if (id === 'piercing') { if (player.weaponPerks) player.weaponPerks.piercing = true; }
  else if (id === 'burstmod') { if (player.weaponPerks) player.weaponPerks.burstMod = true; }
  else if (id === 'dashcd') { player.dashCdMult = (player.dashCdMult || 1) * 0.6; }
  else if (id === 'dashdist') { player.dashDistMult = (player.dashDistMult || 1) * 1.5; }
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
      player.extMagMult = 1.25;
      const { MAG_SIZES } = require('./combat');
      const weapon = player.weapon || 'normal';
      const baseMag = MAG_SIZES[weapon];
      if (baseMag) player.ammo = Math.ceil(baseMag * 1.25);
    }
  }
  else if (id === 'shotgun' || id === 'burst' || id === 'bolty') { /* weapon handled client-side */ }
  else if (id === 'cowstrike') {
    state.cowstrikeActive = true;
    broadcast({ type: 'cowstrikeWarning', playerId: player.id, name: player.name });
    setTimeout(() => { state.cowstrikeActive = false; }, 9000);
    [5000, 6500, 8000].forEach((delay, wave) => {
      setTimeout(() => {
        if (state.gameState !== 'playing') return;
        const affectedIds = [];
        for (const [, target] of state.players) {
          if (target.alive && target.id !== player.id) {
            let sheltered = false;
            for (const sh of state.SHELTERS) {
              if (Math.hypot(target.x - sh.x, target.y - sh.y) < sh.r) { sheltered = true; break; }
            }
            if (sheltered) continue;
            if (target.armor > 0) { target.armor = 0; broadcast({ type: 'shieldBreak', playerId: target.id, x: target.x, y: target.y }); }
            target.hunger -= 15;
            target.stunTimer = 1.5;
            target.lastAttacker = player.id;
            affectedIds.push(target.id);
          }
        }
        // Broadcast the visual effect to everyone, but mark which players are being hit
        broadcast({ type: 'cowstrike', playerId: player.id, name: player.name, wave, affectedIds });
      }, delay);
    });
  }
}

// Perks safe for bots to auto-pick. Excludes stuff that only works for humans (feast) or is too situational (cowstrike).
const BOT_PERKS = [
  'speed','magnet','extrahunger','drain','radius','regen','damage',
  'velocity','fastfire','cheapshot','bigbore','piercing','burstmod',
  'dashcd','dashdist','kevlar','milksteal','tacticow','extmag','tiny','extraproj',
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
