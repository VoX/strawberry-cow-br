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
  else if (id === 'tiny') { perks.speedMult += 0.25; perks.sizeMult *= 0.75; }
  else if (id === 'damage') perks.damage += 0.5;
  else if (id === 'velocity') { if (player.weaponPerks) player.weaponPerks.velocity += 0.4; }
  else if (id === 'fastfire') { if (player.weaponPerks) player.weaponPerks.cooldown *= 0.75; }
  else if (id === 'cheapshot') { if (player.weaponPerks) player.weaponPerks.hungerDiscountPct = (player.weaponPerks.hungerDiscountPct || 0) + 0.33; }
  else if (id === 'extraproj') { if (player.weaponPerks) player.weaponPerks.extraProj += 1; }
  else if (id === 'bigbore') { if (player.weaponPerks) player.weaponPerks.damageMult += 0.2; }
  else if (id === 'piercing') { if (player.weaponPerks) player.weaponPerks.piercing = true; }
  else if (id === 'burstmod') { if (player.weaponPerks) player.weaponPerks.burstMod = true; }
  else if (id === 'dashcd') { player.dashCdMult = (player.dashCdMult || 1) * 0.6; }
  else if (id === 'dashdist') { player.dashDistMult = (player.dashDistMult || 1) * 1.5; }
  else if (id === 'kevlar') { player.maxArmor = (player.maxArmor || 50) + 25; }
  else if (id === 'shotgun' || id === 'burst' || id === 'bolty') { /* weapon handled client-side */ }
  else if (id === 'cowstrike') {
    state.cowstrikeActive = true;
    broadcast({ type: 'cowstrikeWarning', playerId: player.id, name: player.name });
    setTimeout(() => { state.cowstrikeActive = false; }, 9000);
    [5000, 6500, 8000].forEach((delay, wave) => {
      setTimeout(() => {
        if (state.gameState !== 'playing') return;
        for (const [, target] of state.players) {
          if (target.alive && target.id !== player.id) {
            let sheltered = false;
            for (const sh of state.SHELTERS) {
              if (Math.hypot(target.x - sh.x, target.y - sh.y) < sh.r) { sheltered = true; break; }
            }
            if (sheltered) continue;
            target.hunger -= 15;
            target.stunTimer = 1.5;
            target.lastAttacker = player.id;
          }
        }
        broadcast({ type: 'cowstrike', playerId: player.id, name: player.name, wave });
      }, delay);
    });
  }
}

module.exports = { handlePerk };
