const { MAP_W, MAP_H } = require('./config');
const { broadcast } = require('./network');
const state = require('./state');
const { getTerrainHeight, getGroundHeight, WALL_HEIGHT } = require('./terrain');

const MAG_SIZES = { normal: 15, burst: 30, shotgun: 6, bolty: 5 };

const BASE_EYE_HEIGHT = 35;
function eyeHeight(p) {
  const crouchMult = p.walking ? 0.45 : 1;
  return BASE_EYE_HEIGHT * (p.perks ? p.perks.sizeMult : 1) * crouchMult;
}

function handleAttack(player, msg) {
  if (!player || !player.alive || player.attackCooldown > 0.005) return;
  const weapon = player.weapon || 'normal';
  if (player.reloading > 0) {
    if (weapon === 'shotgun' && player.ammo > 0) {
      clearTimeout(player.reloadTimer);
      player.reloading = 0;
    } else {
      return;
    }
  }
  const magSize = MAG_SIZES[weapon];
  if (magSize && player.ammo <= 0) {
    const { sendTo } = require('./network');
    sendTo(player.ws, { type: 'emptyMag' });
    player.attackCooldown = 0.3;
    // Auto-reload
    handleReload(player);
    return;
  }
  if (state.projectiles.length >= 200) return;
  const wLvl = player.weaponLevel || 0;
  const wp = player.weaponPerks || { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false };
  const cdMult = Math.max(0.3, (1 - wLvl * 0.1) * wp.cooldown);
  const dmgMult = (1 + wLvl * 0.15) * wp.damageMult;
  const hungerDiscount = wLvl + wp.hungerDiscount;
  const velMult = wp.velocity;
  const burstMod = wp.burstMod;
  let ax = msg.aimX || 0, ay = msg.aimY || 0, az = msg.aimZ || 0;
  const alen3d = Math.hypot(ax, ay, az);
  if (alen3d < 0.1) {
    const dirMap = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] };
    const dd = dirMap[player.dir] || [0,1];
    ax = dd[0]; ay = dd[1]; az = 0;
  } else { ax /= alen3d; ay /= alen3d; az /= alen3d; }
  const aimZ = az;

  const walkSpreadMult = player.walking ? 0.73 : 1;
  if (weapon === 'shotgun' && player.hunger > Math.max(3, 10 - hungerDiscount)) {
    player.hunger -= Math.max(3, 9 - hungerDiscount);
    player.attackCooldown = 1.0 * cdMult;
    const volleyId = state.foodIdCounter++;
    for (let b = 0; b < 5; b++) {
      const spread = (Math.random() - 0.5) * 0.157 * walkSpreadMult;
      const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
      const by = ax * Math.sin(spread) + ay * Math.cos(spread);
      const projId = state.foodIdCounter++;
      const dmg = 5 * player.perks.damage * dmgMult;
      const spreadVz = aimZ + (Math.random() - 0.5) * 0.2 * walkSpreadMult;
      const proj = { id: projId, ownerId: player.id, x: player.x + bx * 40, y: player.y + by * 40, z: player.z + eyeHeight(player), vx: bx * 1200 * velMult, vy: by * 1200 * velMult, vz: spreadVz * 1200 * velMult, life: 999, dmg, volleyId, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: player.color, shotgun: b === 0 });
    }
    if (magSize) player.ammo--;
  } else if (weapon === 'burst' && player.hunger > Math.max(2, 6 - hungerDiscount)) {
    const autoMode = msg.fireMode === 'auto';
    if (autoMode) {
      // Full auto — single shot, low cooldown, slight spread
      player.hunger -= Math.max(1, 2 - hungerDiscount);
      player.attackCooldown = 0.067 * cdMult; // exactly 2 ticks @ 30Hz — avoids quantization stutter
      const projId = state.foodIdCounter++;
      const dmg = 3 * player.perks.damage * dmgMult;
      const spread = 0.026 * walkSpreadMult;
      const sax = ax + (Math.random() - 0.5) * spread * 2;
      const say = ay + (Math.random() - 0.5) * spread * 2;
      const saz = aimZ + (Math.random() - 0.5) * spread * 2;
      const proj = { id: projId, ownerId: player.id, x: player.x + sax * 40, y: player.y + say * 40, z: player.z + eyeHeight(player), vx: sax * 1600 * velMult, vy: say * 1600 * velMult, vz: saz * 1600 * velMult, life: 999, dmg, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: player.color });
      if (magSize) player.ammo--;
    } else {
      // Burst mode — 3 (or 5) shot burst
      const burstCount = burstMod ? 5 : 3;
      player.hunger -= Math.max(2, 5 - hungerDiscount);
      player.attackCooldown = 0.8 * cdMult;
      for (let b = 0; b < burstCount; b++) {
        const projId = state.foodIdCounter++;
        const dmg = 6 * player.perks.damage * dmgMult;
        const offset = b * 15;
        const proj = { id: projId, ownerId: player.id, x: player.x + ax * (40 + offset), y: player.y + ay * (40 + offset), z: player.z + eyeHeight(player), vx: ax * 1760 * velMult, vy: ay * 1760 * velMult, vz: aimZ * 1760 * velMult, life: 999, dmg, piercing: wp.piercing };
        state.projectiles.push(proj);
        const bb = b;
        setTimeout(() => {
          broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: player.color, burst: bb === 0 });
        }, bb * 80);
      }
      if (magSize) player.ammo = Math.max(0, player.ammo - burstCount);
    }
  } else if (weapon === 'bolty' && player.hunger > Math.max(3, 8 - hungerDiscount)) {
    player.hunger -= Math.max(3, 7 - hungerDiscount);
    player.attackCooldown = 2.5 * cdMult;
    const projId = state.foodIdCounter++;
    const dmg = 28 * player.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: player.id, x: player.x + ax * 40, y: player.y + ay * 40, z: player.z + eyeHeight(player), vx: ax * 16800 * velMult, vy: ay * 16800 * velMult, vz: aimZ * 16800 * velMult, life: 999, dmg, piercing: wp.piercing, wallPiercing: true };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: player.color, bolty: true });
    if (magSize) player.ammo--;
  } else if (weapon === 'cowtank' && player.hunger > Math.max(2, 6 - hungerDiscount)) {
    player.hunger -= Math.max(2, 5 - hungerDiscount);
    player.attackCooldown = 1.0 * cdMult;
    const projId = state.foodIdCounter++;
    const dmg = 38 * player.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: player.id, x: player.x + ax * 40, y: player.y + ay * 40, z: player.z + eyeHeight(player), vx: ax * 2000 * velMult, vy: ay * 2000 * velMult, vz: aimZ * 2000 * velMult, life: 999, dmg, explosive: true, blastRadius: 180 };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: player.color, cowtank: true });
    // Single use — weapon disappears after firing
    player.weapon = 'normal'; player.weaponLevel = 0;
    player.ammo = Math.ceil(15 * (player.extMagMult || 1));
    player.reloading = 0;
    broadcast({ type: 'weaponDrop', playerId: player.id, name: player.name });
  } else if (weapon === 'normal' && player.hunger > Math.max(1, 3 - hungerDiscount)) {
    player.hunger -= Math.max(1, 2 - hungerDiscount);
    player.attackCooldown = 1.0 * cdMult;
    const shotCount = burstMod ? 3 : 1;
    for (let b = 0; b < shotCount; b++) {
      const projId = state.foodIdCounter++;
      const dmg = 8 * player.perks.damage * dmgMult;
      const offset = b * 12;
      const proj = { id: projId, ownerId: player.id, x: player.x + ax * (40 + offset), y: player.y + ay * (40 + offset), z: player.z + eyeHeight(player), vx: ax * 1400 * velMult, vy: ay * 1400 * velMult, vz: aimZ * 1400 * velMult, life: 999, dmg, piercing: wp.piercing };
      state.projectiles.push(proj);
      const bcast = { type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, z: proj.z, vx: proj.vx, vy: proj.vy, vz: proj.vz, color: player.color };
      if (shotCount > 1) bcast.burst = b === 0;
      broadcast(bcast);
    }
    if (magSize) player.ammo = Math.max(0, player.ammo - shotCount);
  }
}

function applyExplosion(pr, excludeId) {
  const blastRadius = pr.blastRadius || 120;
  // Destroy barricades caught in the blast
  for (let i = state.BARRICADES.length - 1; i >= 0; i--) {
    const b = state.BARRICADES[i];
    if (Math.hypot(b.cx - pr.x, b.cy - pr.y) < blastRadius) {
      broadcast({ type: 'barricadeDestroyed', id: b.id });
      state.BARRICADES.splice(i, 1);
    }
  }
  for (const [, t] of state.players) {
    if (!t.alive || t.id === pr.ownerId || t.id === excludeId) continue;
    const bdist = Math.hypot(t.x - pr.x, t.y - pr.y, (t.z + eyeHeight(t) / 2) - pr.z);
    if (bdist < blastRadius) {
      const falloff = 1 - bdist / blastRadius;
      if (t.armor > 0) { broadcast({ type: 'shieldBreak', playerId: t.id, x: t.x, y: t.y }); t.armor = 0; }
      const dmg = excludeId ? pr.dmg * 0.6 : 100;
      t.hunger -= dmg * falloff;
      t.stunTimer = 0.3;
      t.lastAttacker = pr.ownerId;
    }
  }
  // Knockback — push ALL players (including shooter) away from blast in 3D
  for (const [, t] of state.players) {
    if (!t.alive) continue;
    const dx = t.x - pr.x, dy = t.y - pr.y, dz = (t.z + eyeHeight(t) / 2) - pr.z;
    const bdist = Math.hypot(dx, dy, dz);
    if (bdist < blastRadius && bdist > 1) {
      const falloff = 1 - bdist / blastRadius;
      const pushForce = 300 * falloff;
      const nx = dx / bdist, ny = dy / bdist, nz = dz / bdist;
      t.x += nx * pushForce; t.y += ny * pushForce;
      t.vz = (t.vz || 0) + nz * pushForce + 80 * falloff;
      // Wall collision after knockback
      for (const w of state.WALLS) {
        if (t.x > w.x - 15 && t.x < w.x + w.w + 15 && t.y > w.y - 15 && t.y < w.y + w.h + 15) {
          const escL = t.x - (w.x - 15), escR = (w.x + w.w + 15) - t.x;
          const escT = t.y - (w.y - 15), escB = (w.y + w.h + 15) - t.y;
          const minEsc = Math.min(escL, escR, escT, escB);
          if (minEsc === escL) t.x = w.x - 15;
          else if (minEsc === escR) t.x = w.x + w.w + 15;
          else if (minEsc === escT) t.y = w.y - 15;
          else t.y = w.y + w.h + 15;
        }
      }
    }
  }
  broadcast({ type: 'explosion', x: pr.x, y: pr.y, radius: blastRadius, blastRadius });
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const pr = state.projectiles[i];
    const prevX = pr.x, prevY = pr.y, prevZ = pr.z, prevVz = pr.vz;
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    pr.z += pr.vz * dt;
    // Cowtank has full gravity, others have minimal
    if (pr.explosive) pr.vz = pr.vz - 400 * dt;
    else pr.vz = pr.vz - 50 * dt;
    const speed = Math.hypot(pr.vx, pr.vy);
    // Hit detection FIRST — ray-segment vs cylinder intersection (before terrain/wall checks)
    const dx = pr.x - prevX, dy = pr.y - prevY, dz = pr.z - prevZ;
    let hitPlayer = null, hitT = Infinity;
    for (const [, p] of state.players) {
      if (!p.alive || p.id === pr.ownerId || p.spawnProtection > 0) continue;
      const eh = eyeHeight(p);
      const headBase = p.z + eh * 0.75;
      const hitboxes = [
        { r: 18, zMin: p.z - 3, zMax: headBase, head: false },
        { r: 12, zMin: headBase, zMax: headBase + 20, head: true },
      ];
      for (const hb of hitboxes) {
        // 2D ray-circle: find t where |prev + t*d - p|^2 = r^2 in XY plane
        const ox = prevX - p.x, oy = prevY - p.y;
        const a = dx * dx + dy * dy;
        const b = 2 * (ox * dx + oy * dy);
        const c = ox * ox + oy * oy - hb.r * hb.r;
        const disc = b * b - 4 * a * c;
        if (disc < 0) continue;
        const sqrtDisc = Math.sqrt(disc);
        for (const sign of [-1, 1]) {
          const t = (-b + sign * sqrtDisc) / (2 * a);
          if (t < 0 || t > 1) continue;
          const iz = prevZ + dz * t;
          if (iz >= hb.zMin && iz <= hb.zMax && t < hitT) {
            hitT = t; hitPlayer = p;
            p._wasHeadshot = hb.head;
          }
        }
      }
    }
    if (hitPlayer) {
      const p = hitPlayer;
      const headshot = !!p._wasHeadshot;
        let dmg = pr.dmg;
        if (headshot) dmg *= (pr.volleyId ? 1.2 : 1.8);
        if (pr.volleyId) {
          if (!p._volleyHits) p._volleyHits = {};
          p._volleyHits[pr.volleyId] = (p._volleyHits[pr.volleyId] || 0) + 1;
          const hits = p._volleyHits[pr.volleyId];
          dmg = pr.dmg * (1 + (hits - 1) * 0.5);
        }
        let armor = 1;
        if (p.perks && p.perks.damageReduction) armor *= (1 - p.perks.damageReduction);
        let actualDmg = dmg * armor;
        if (pr.explosive && p.armor > 0) {
          broadcast({ type: 'shieldBreak', playerId: p.id, x: p.x, y: p.y });
          p.armor = 0;
        } else if (p.armor > 0) {
          const absorbed = Math.min(p.armor, actualDmg);
          const hadArmor = p.armor;
          p.armor -= absorbed; actualDmg -= absorbed;
          broadcast({ type: 'shieldHit', playerId: p.id, x: p.x, y: p.y });
          if (hadArmor > 0 && p.armor <= 0) broadcast({ type: 'shieldBreak', playerId: p.id, x: p.x, y: p.y });
        }
        p.hunger -= actualDmg;
        p.stunTimer = 0.5;
        p.lastAttacker = pr.ownerId;
        if (pr.explosive) applyExplosion(pr, p.id);
        // Milksteal: heal owner 1% on hit
        const owner = state.players.get(pr.ownerId);
        if (owner && owner.milksteal && owner.alive) {
          owner.hunger = Math.min(owner.perks.maxHunger, owner.hunger + 0.5);
        }
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: p.id, ownerId: pr.ownerId, dmg: Math.round(dmg), headshot });
        if (pr.piercing) {
          pr.piercing = false;
          pr.dmg *= 0.6;
        } else {
          state.projectiles.splice(i, 1); continue;
        }
    }
    // Terrain collision
    if (pr.z < getTerrainHeight(pr.x, pr.y)) {
      if (pr.explosive) applyExplosion(pr, null);
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: pr.x, y: pr.y });
      state.projectiles.splice(i, 1); continue;
    }
    // Bounds / lifetime
    if (pr.life <= 0 || pr.x < 0 || pr.x > MAP_W || pr.y < 0 || pr.y > MAP_H) {
      if (pr.explosive) applyExplosion(pr, null);
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: pr.x, y: pr.y });
      state.projectiles.splice(i, 1); continue;
    }
    // Wall collision
    let hitWall = false;
    let hitBarricade = false;
    const steps = Math.max(1, Math.ceil(speed * dt / 15));
    const stepX = pr.vx * dt / steps, stepY = pr.vy * dt / steps;
    let checkX = prevX, checkY = prevY;
    for (let s = 0; s <= steps && !hitWall && !hitBarricade; s++) {
      for (const w of state.WALLS) {
        const wx1 = w.x - 10, wy1 = w.y - 10;
        const wx2 = w.x + Math.max(w.w, 20) + 10, wy2 = w.y + Math.max(w.h, 20) + 10;
        if (checkX > wx1 && checkX < wx2 && checkY > wy1 && checkY < wy2) { hitWall = true; break; }
      }
      // Barricades block everything except L96 (which has wallPiercing)
      if (!hitWall && !pr.wallPiercing) {
        for (const b of state.BARRICADES) {
          // Transform check point into barricade's local (unrotated) frame.
          // lx = projection along aim direction (thin axis, h)
          // ly = projection perpendicular to aim (wide axis, w)
          const dxB = checkX - b.cx, dyB = checkY - b.cy;
          const cosA = Math.cos(b.angle), sinA = Math.sin(b.angle);
          const lx = cosA * dxB + sinA * dyB;
          const ly = -sinA * dxB + cosA * dyB;
          if (Math.abs(lx) < b.h / 2 && Math.abs(ly) < b.w / 2) {
            const bTerrainH = getTerrainHeight(b.cx, b.cy);
            if (pr.z <= bTerrainH + 55) { hitBarricade = true; break; }
          }
        }
      }
      checkX += stepX; checkY += stepY;
    }
    if (hitWall) {
      const wallTerrainH = getTerrainHeight(checkX, checkY);
      if (pr.z > wallTerrainH + WALL_HEIGHT) hitWall = false;
    }
    if (hitWall && pr.wallPiercing) {
      // Wall-piercing projectile — show impact and decrement penetration count
      broadcast({ type: 'wallImpact', x: checkX, y: checkY, z: pr.z });
      pr._wallHits = (pr._wallHits || 0) + 1;
      if (pr._wallHits >= 2) {
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: checkX, y: checkY });
        state.projectiles.splice(i, 1); continue;
      }
    } else if (hitWall || hitBarricade) {
      if (pr.explosive) applyExplosion(pr, null);
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: checkX, y: checkY });
      state.projectiles.splice(i, 1); continue;
    }
  }
}

function handleBumpCombat(dt) {
  const alivePlayers = [];
  for (const [, p] of state.players) { if (p.alive) alivePlayers.push(p); }
  for (let i = 0; i < alivePlayers.length; i++) {
    for (let j = i + 1; j < alivePlayers.length; j++) {
      const a = alivePlayers[i], b = alivePlayers[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (dist < 65) {
        const aSpeed = Math.hypot(a.dx, a.dy);
        const bSpeed = Math.hypot(b.dx, b.dy);
        const sizeDiffA = Math.min(1.3, Math.max(0.5, 1 + (a.foodEaten - b.foodEaten) * 0.03));
        const sizeDiffB = Math.min(1.3, Math.max(0.5, 1 + (b.foodEaten - a.foodEaten) * 0.03));
        const baseDmg = 6 * dt;
        const aCharge = aSpeed > 0.5 ? 1.3 : 0.7;
        const bCharge = bSpeed > 0.5 ? 1.3 : 0.7;
        b.hunger -= baseDmg * sizeDiffA * aCharge * a.perks.damage;
        a.hunger -= baseDmg * sizeDiffB * bCharge * b.perks.damage;
        a.lastAttacker = b.id;
        b.lastAttacker = a.id;
        if (dist > 1) {
          const nx = (b.x - a.x) / dist, ny = (b.y - a.y) / dist;
          const push = 150 * dt;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
        broadcast({ type: 'bump', a: a.id, b: b.id });
      }
    }
  }
}

function handleDash(player) {
  if (!player || !player.alive || player.dashCooldown > 0) return;
  const len = Math.hypot(player.dx, player.dy);
  if (len > 0.1) {
    const nx = player.dx / len, ny = player.dy / len;
    const dashSteps = Math.round(12 * (player.dashDistMult || 1));
    for (let step = 0; step < dashSteps; step++) {
      player.x += nx * 10; player.y += ny * 10;
      let blocked = false;
      for (const w of state.WALLS) {
        if (player.x > w.x - 15 && player.x < w.x + w.w + 15 && player.y > w.y - 15 && player.y < w.y + w.h + 15) {
          blocked = true; break;
        }
      }
      if (!blocked) {
        for (const b of state.BARRICADES) {
          const dxB = player.x - b.cx, dyB = player.y - b.cy;
          const cosA = Math.cos(b.angle), sinA = Math.sin(b.angle);
          const lx = cosA * dxB + sinA * dyB;
          const ly = -sinA * dxB + cosA * dyB;
          if (Math.abs(lx) < b.h / 2 + 15 && Math.abs(ly) < b.w / 2 + 15) { blocked = true; break; }
        }
      }
      if (blocked) { player.x -= nx * 10; player.y -= ny * 10; break; }
    }
    player.x = Math.max(state.zone.x + 20, Math.min(state.zone.x + state.zone.w - 20, player.x));
    player.y = Math.max(state.zone.y + 20, Math.min(state.zone.y + state.zone.h - 20, player.y));
    player.z = getGroundHeight(player.x, player.y);
    player.vz = 0;
    player.dashCooldown = 3 * (player.dashCdMult || 1);
    broadcast({ type: 'dash', playerId: player.id });
  }
}

function getMaxAmmo(player, weapon) {
  const base = MAG_SIZES[weapon];
  if (!base) return 0;
  return Math.ceil(base * (player.extMagMult || 1));
}

function handleReload(player) {
  if (!player || !player.alive || player.reloading > 0) return;
  const weapon = player.weapon || 'normal';
  const maxAmmo = getMaxAmmo(player, weapon);
  if (!maxAmmo || player.ammo >= maxAmmo) return;
  player.reloading = 1;

  if (weapon === 'shotgun') {
    // Shell by shell reload
    const loadShell = () => {
      if (!player.alive || player.weapon !== 'shotgun' || player.ammo >= getMaxAmmo(player, 'shotgun')) {
        player.reloading = 0;
        broadcast({ type: 'reloaded', playerId: player.id, weapon: 'shotgun' });
        return;
      }
      player.ammo++;
      broadcast({ type: 'shellLoaded', playerId: player.id, ammo: player.ammo });
      if (player.ammo < getMaxAmmo(player, 'shotgun')) {
        player.reloadTimer = setTimeout(loadShell, 750);
      } else {
        player.reloading = 0;
        broadcast({ type: 'reloaded', playerId: player.id, weapon: 'shotgun' });
      }
    };
    player.reloadTimer = setTimeout(loadShell, 750);
  } else {
    // Full mag reload for other weapons
    const reloadTime = weapon === 'bolty' ? 2500 : 2000;
    player.reloadTimer = setTimeout(() => {
      player.ammo = getMaxAmmo(player, player.weapon);
      player.reloading = 0;
      broadcast({ type: 'reloaded', playerId: player.id, weapon });
    }, reloadTime);
  }
}

function placeBarricadeForPlayer(player, aimX, aimY) {
  if (!player || !player.alive) return false;
  const nowMs = Date.now();
  if (player.barricadeReadyAt && nowMs < player.barricadeReadyAt) return false;
  let ax = aimX || 0, ay = aimY || 0;
  const alen = Math.hypot(ax, ay);
  if (alen < 0.01) {
    const d = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] }[player.dir] || [0,1];
    ax = d[0]; ay = d[1];
  } else { ax /= alen; ay /= alen; }
  const cx = player.x + ax * 45;
  const cy = player.y + ay * 45;
  const angle = Math.atan2(ay, ax);
  const W = 52, H = 8;
  const bid = state.barricadeIdCounter++;
  state.BARRICADES.push({ id: bid, cx, cy, w: W, h: H, angle, ownerId: player.id, placedAt: nowMs });
  const cdMs = player.isBot ? state.BOT_BARRICADE_COOLDOWN_MS : state.BARRICADE_COOLDOWN_MS;
  player.barricadeReadyAt = nowMs + cdMs;
  broadcast({ type: 'barricadePlaced', id: bid, cx, cy, w: W, h: H, angle, ownerId: player.id });
  return true;
}

module.exports = { handleAttack, updateProjectiles, handleBumpCombat, handleDash, handleReload, MAG_SIZES, placeBarricadeForPlayer };
