const { broadcast } = require('./network');
const state = require('./state');

function handleWeaponPickups(dt) {
  for (const [, p] of state.players) {
    if (!p.alive) continue;
    for (let i = state.weaponPickups.length - 1; i >= 0; i--) {
      const w = state.weaponPickups[i];
      if (Math.hypot(p.x - w.x, p.y - w.y) < 45) {
        if ((p.pickupCooldown || 0) > 0 || (p.weapon !== 'normal' && p.weapon !== w.weapon && w.weapon !== 'cowtank')) continue;
        if (w.weapon === 'cowtank') {
          p.weapon = 'cowtank';
          p.weaponLevel = 0;
          p.weaponTimer = 15;
        } else if (p.weapon === w.weapon) {
          p.weaponLevel = Math.min(3, (p.weaponLevel || 0) + 1);
        } else {
          p.weapon = w.weapon;
          p.weaponLevel = 0;
          p.weaponTimer = 0;
        }
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
  state.weaponPickups.push({ id: state.foodIdCounter++, x: player.x + 20, y: player.y, weapon: player.weapon });
  broadcast({ type: 'weaponSpawn', id: state.weaponPickups[state.weaponPickups.length-1].id, x: player.x + 20, y: player.y, weapon: player.weapon });
  player.weapon = 'normal'; player.pickupCooldown = 2;
  player.weaponLevel = 0;
  broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
}

module.exports = { handleWeaponPickups, handleArmorPickups, handleDropWeapon };
