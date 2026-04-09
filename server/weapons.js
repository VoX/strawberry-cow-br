const { broadcast } = require('./network');
const state = require('./state');

const MAG_SIZES = { normal: 15, burst: 30, shotgun: 6, bolty: 5 };

function handleWeaponPickups(dt) {
  for (const [, p] of state.players) {
    if (!p.alive) continue;
    for (let i = state.weaponPickups.length - 1; i >= 0; i--) {
      const w = state.weaponPickups[i];
      if (Math.hypot(p.x - w.x, p.y - w.y) < 45) {
        if (p._ignorePickupId === w.id && (p.pickupCooldown || 0) > 0) continue;
        if (p.weapon !== 'normal' && p.weapon !== w.weapon) continue;
        if (p.weapon === w.weapon) {
          p.weaponLevel = Math.min(3, (p.weaponLevel || 0) + 1);
          // Keep current ammo on upgrade
        } else {
          p.weapon = w.weapon;
          p.weaponLevel = 0;
          p.weaponTimer = 0;
          p.ammo = Math.ceil((MAG_SIZES[w.weapon] || 0) * (p.extMagMult || 1));
        }
        p.reloading = 0;
        if (p.reloadTimer) { clearTimeout(p.reloadTimer); p.reloadTimer = null; }
        broadcast({ type: 'weaponPickup', playerId: p.id, name: p.name, weapon: p.weapon, level: p.weaponLevel, pickupId: w.id });
        state.weaponPickups.splice(i, 1);
      }
    }
  }
}

function handleArmorPickups() {
  for (const [, p] of state.players) {
    if (!p.alive) continue;
    for (let i = state.armorPickups.length - 1; i >= 0; i--) {
      const a = state.armorPickups[i];
      if (Math.hypot(p.x - a.x, p.y - a.y) < 45) {
        p.armor = Math.min(p.maxArmor || 50, (p.armor || 0) + 25);
        broadcast({ type: 'armorPickup', playerId: p.id, name: p.name, pickupId: a.id });
        state.armorPickups.splice(i, 1);
      }
    }
  }
}

function handleDropWeapon(player) {
  if (!player || !player.alive || player.weapon === 'normal') return;
  const dropId = state.foodIdCounter++;
  state.weaponPickups.push({ id: dropId, x: player.x + 20, y: player.y, weapon: player.weapon });
  broadcast({ type: 'weaponSpawn', id: dropId, x: player.x + 20, y: player.y, weapon: player.weapon });
  player.weapon = 'normal'; player.pickupCooldown = 2; player._ignorePickupId = dropId;
  player.weaponLevel = 0;
  player.ammo = Math.ceil((MAG_SIZES['normal'] || 15) * (player.extMagMult || 1));
  player.reloading = 0;
  if (player.reloadTimer) { clearTimeout(player.reloadTimer); player.reloadTimer = null; }
  broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
}

module.exports = { handleWeaponPickups, handleArmorPickups, handleDropWeapon };
