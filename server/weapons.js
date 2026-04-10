const { broadcast } = require('./network');
const gameState = require('./game-state');
const combat = require('./combat');
const { MAG_SIZES, DUAL_WIELD_FAMILY } = require('../shared/constants');
const { applyArmorDelta } = require('./player');

function handleWeaponPickups(dt) {
  const weaponPickups = gameState.getWeaponPickups();
  for (const [, p] of gameState.getPlayers()) {
    if (!p.alive) continue;
    for (let i = weaponPickups.length - 1; i >= 0; i--) {
      const w = weaponPickups[i];
      if (Math.hypot(p.x - w.x, p.y - w.y) < 45) {
        if (p._ignorePickupId === w.id && (p.pickupCooldown || 0) > 0) continue;
        // Effective primary weapon = whichever weapon they're actually
        // CARRYING (held or stashed-while-knifing). Pickups always
        // affect the primary slot, never the knife slot.
        const heldPrimary = p.weapon === 'knife' ? p._primaryWeapon : p.weapon;
        if (heldPrimary !== 'normal' && heldPrimary !== w.weapon) continue;
        const sameWeapon = heldPrimary === w.weapon;
        if (sameWeapon) {
          const alreadyDual = p.weapon === 'knife' ? p._primaryDualWield : p.dualWield;
          if (!DUAL_WIELD_FAMILY.has(w.weapon)) continue; // can't dual-wield this weapon
          if (alreadyDual) continue; // already dual-wielding, no third gun
          if (p.weapon === 'knife') p._primaryDualWield = true;
          else p.dualWield = true;
          p._shotgunAlt = false;
          // Refill ammo on whichever slot the primary lives on right now.
          if (p.weapon === 'knife') p._primaryAmmo = combat.getMaxAmmo({ ...p, weapon: w.weapon, dualWield: p._primaryDualWield }, w.weapon);
          else p.ammo = combat.getMaxAmmo(p, p.weapon);
        } else if (p.weapon === 'knife') {
          // Hot-swap the stashed primary while continuing to hold the knife.
          p._primaryWeapon = w.weapon;
          p._primaryDualWield = false;
          p._primaryAmmo = combat.getMaxAmmo({ ...p, weapon: w.weapon, dualWield: false }, w.weapon);
        } else {
          p.weapon = w.weapon;
          p.dualWield = false;
          p.weaponTimer = 0;
          p.ammo = combat.getMaxAmmo(p, p.weapon);
        }
        combat.cancelReload(p);
        broadcast({ type: 'weaponPickup', playerId: p.id, name: p.name, weapon: p.weapon, dualWield: !!p.dualWield, pickupId: w.id });
        // Sticky fields changed — ship a snapshot so clients update
        // viewmodel + HUD next frame instead of waiting for a tick.

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
  if (!player || !player.alive) return;
  // Knife is always-equipped — pressing Q while holding it drops the
  // STASHED primary (if any), not the knife itself. Switching back via
  // 1 then would be empty, so the player goes back to pistol.
  if (player.weapon === 'knife') {
    const stashed = player._primaryWeapon;
    if (!stashed || stashed === 'normal') return;
    const dropId = gameState.nextEntityId();
    gameState.addWeaponPickup({ id: dropId, x: player.x + 50, y: player.y, weapon: stashed });
    broadcast({ type: 'weaponSpawn', id: dropId, x: player.x + 50, y: player.y, weapon: stashed });
    player._primaryWeapon = 'normal';
    player._primaryAmmo = combat.getMaxAmmo(player, 'normal');
    player._primaryDualWield = false;
    player.pickupCooldown = 2; player._ignorePickupId = dropId;
    broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
    return;
  }
  if (player.weapon === 'normal') return;
  const dropId = gameState.nextEntityId();
  gameState.addWeaponPickup({ id: dropId, x: player.x + 50, y: player.y, weapon: player.weapon });
  broadcast({ type: 'weaponSpawn', id: dropId, x: player.x + 50, y: player.y, weapon: player.weapon });
  if (player.dualWield) {
    // Dropping one of two — stay with single weapon, halve the mag
    player.dualWield = false;
    player.pickupCooldown = 2; player._ignorePickupId = dropId;
    const newMax = combat.getMaxAmmo(player, player.weapon);
    player.ammo = Math.min(player.ammo, newMax);
  } else {
    player.weapon = 'normal'; player.pickupCooldown = 2; player._ignorePickupId = dropId;
    player.dualWield = false;
    player.ammo = combat.getMaxAmmo(player, 'normal');
  }
  combat.cancelReload(player);
  broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
}

module.exports = { handleWeaponPickups, handleArmorPickups, handleDropWeapon };
