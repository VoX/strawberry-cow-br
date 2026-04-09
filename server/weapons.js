const { broadcast } = require('./network');
const gameState = require('./game-state');
const combat = require('./combat');
const { MAG_SIZES } = require('./weapon-fire');
const { broadcastPlayerSnapshot, applyArmorDelta } = require('./player');

function handleWeaponPickups(dt) {
  const weaponPickups = gameState.getWeaponPickups();
  for (const [, p] of gameState.getPlayers()) {
    if (!p.alive) continue;
    for (let i = weaponPickups.length - 1; i >= 0; i--) {
      const w = weaponPickups[i];
      if (Math.hypot(p.x - w.x, p.y - w.y) < 45) {
        if (p._ignorePickupId === w.id && (p.pickupCooldown || 0) > 0) continue;
        if (p.weapon !== 'normal' && p.weapon !== w.weapon) continue;
        if (p.weapon === w.weapon) {
          // Picking up a second of the same weapon (only benelli + M16A2 support dual-wield)
          if ((w.weapon === 'shotgun' || w.weapon === 'burst') && !p.dualWield) {
            p.dualWield = true;
            p._shotgunAlt = false; // fresh start on every new dual-wield session
          }
          p.ammo = combat.getMaxAmmo(p, p.weapon);
        } else {
          p.weapon = w.weapon;
          p.dualWield = false;
          p.weaponTimer = 0;
          p.ammo = combat.getMaxAmmo(p, p.weapon);
        }
        p.reloading = 0;
        if (p.reloadTimer) { clearTimeout(p.reloadTimer); p.reloadTimer = null; }
        broadcast({ type: 'weaponPickup', playerId: p.id, name: p.name, weapon: p.weapon, dualWield: !!p.dualWield, pickupId: w.id });
        // Sticky fields changed (weapon, dualWield, ammo via getMaxAmmo) — ship
        // a snapshot so clients update viewmodel + HUD next frame instead of
        // waiting for a tick that only carries mutable state.
        broadcastPlayerSnapshot(p);
        gameState.removeWeaponPickupAt(i);
      }
    }
  }
}

function handleArmorPickups() {
  const armorPickups = gameState.getArmorPickups();
  for (const [, p] of gameState.getPlayers()) {
    if (!p.alive) continue;
    for (let i = armorPickups.length - 1; i >= 0; i--) {
      const a = armorPickups[i];
      if (Math.hypot(p.x - a.x, p.y - a.y) < 45) {
        applyArmorDelta(p, 25);
        broadcast({ type: 'armorPickup', playerId: p.id, name: p.name, pickupId: a.id });
        gameState.removeArmorPickupAt(i);
      }
    }
  }
}

function handleDropWeapon(player) {
  if (!player || !player.alive || player.weapon === 'normal') return;
  const dropId = gameState.nextEntityId();
  gameState.addWeaponPickup({ id: dropId, x: player.x + 20, y: player.y, weapon: player.weapon });
  broadcast({ type: 'weaponSpawn', id: dropId, x: player.x + 20, y: player.y, weapon: player.weapon });
  if (player.dualWield) {
    // Dropping one of two — stay with single weapon, halve the mag
    player.dualWield = false;
    player.pickupCooldown = 2; player._ignorePickupId = dropId;
    const newMax = combat.getMaxAmmo(player, player.weapon);
    player.ammo = Math.min(player.ammo, newMax);
  } else {
    player.weapon = 'normal'; player.pickupCooldown = 2; player._ignorePickupId = dropId;
    player.dualWield = false;
    player.ammo = Math.ceil((MAG_SIZES['normal'] || 15) * (player.extMagMult || 1));
  }
  player.reloading = 0;
  if (player.reloadTimer) { clearTimeout(player.reloadTimer); player.reloadTimer = null; }
  broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
  // weapon + dualWield changed (sticky fields) — ship a snapshot so the client
  // viewmodel swaps back to pistol instead of staying on the dropped weapon
  // until the next unrelated snapshot event.
  broadcastPlayerSnapshot(player);
}

module.exports = { handleWeaponPickups, handleArmorPickups, handleDropWeapon };
