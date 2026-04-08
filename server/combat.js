const { MAP_W, MAP_H } = require('./config');
const { broadcast } = require('./network');
const state = require('./state');

function handleAttack(player, msg) {
  if (!player || !player.alive || player.attackCooldown > 0) return;
  const weapon = player.weapon || 'normal';
  const wLvl = player.weaponLevel || 0;
  const wp = player.weaponPerks || { velocity: 1, cooldown: 1, hungerDiscount: 0, extraProj: 0, damageMult: 1, piercing: false };
  const cdMult = Math.max(0.3, (1 - wLvl * 0.1) * wp.cooldown);
  const dmgMult = (1 + wLvl * 0.15) * wp.damageMult;
  const hungerDiscount = wLvl + wp.hungerDiscount;
  const velMult = wp.velocity;
  const burstMod = wp.burstMod;
  let ax = msg.aimX || 0, ay = msg.aimY || 0;
  const alen = Math.hypot(ax, ay);
  if (alen < 0.1) {
    const dirMap = { south: [0,1], north: [0,-1], east: [1,0], west: [-1,0] };
    const dd = dirMap[player.dir] || [0,1];
    ax = dd[0]; ay = dd[1];
  } else { ax /= alen; ay /= alen; }

  if (weapon === 'shotgun' && player.hunger > Math.max(2, 7 - hungerDiscount)) {
    player.hunger -= Math.max(2, 6 - hungerDiscount);
    player.attackCooldown = 1.5 * cdMult;
    const volleyId = state.foodIdCounter++;
    for (let b = 0; b < 5; b++) {
      const spread = (Math.random() - 0.5) * 0.2;
      const bx = ax * Math.cos(spread) - ay * Math.sin(spread);
      const by = ax * Math.sin(spread) + ay * Math.cos(spread);
      const projId = state.foodIdCounter++;
      const dmg = 5 * player.perks.damage * dmgMult;
      const proj = { id: projId, ownerId: player.id, x: player.x + bx * 40, y: player.y + by * 40, vx: bx * 600 * velMult, vy: by * 600 * velMult, life: 0.35, dmg, volleyId, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, shotgun: b === 0 });
    }
  } else if (weapon === 'burst' && player.hunger > Math.max(2, 6 - hungerDiscount)) {
    const burstCount = burstMod ? 5 : 3;
    player.hunger -= Math.max(2, 5 - hungerDiscount);
    player.attackCooldown = 1.2 * cdMult;
    for (let b = 0; b < burstCount; b++) {
      const projId = state.foodIdCounter++;
      const dmg = 6 * player.perks.damage * dmgMult;
      const offset = b * 15;
      const proj = { id: projId, ownerId: player.id, x: player.x + ax * (40 + offset), y: player.y + ay * (40 + offset), vx: ax * 800 * velMult, vy: ay * 800 * velMult, life: 1.5, dmg, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, burst: b === 0 });
    }
  } else if (weapon === 'bolty' && player.hunger > Math.max(3, 8 - hungerDiscount)) {
    player.hunger -= Math.max(3, 7 - hungerDiscount);
    player.attackCooldown = 2.5 * cdMult;
    const projId = state.foodIdCounter++;
    const dmg = 25 * player.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: player.id, x: player.x + ax * 40, y: player.y + ay * 40, vx: ax * 4200 * velMult, vy: ay * 4200 * velMult, life: 1.5, dmg, piercing: wp.piercing };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, bolty: true });
  } else if (weapon === 'cowtank' && player.hunger > Math.max(2, 6 - hungerDiscount)) {
    player.hunger -= Math.max(2, 5 - hungerDiscount);
    player.attackCooldown = 1.0 * cdMult;
    const projId = state.foodIdCounter++;
    const dmg = 25 * player.perks.damage * dmgMult;
    const proj = { id: projId, ownerId: player.id, x: player.x + ax * 40, y: player.y + ay * 40, vx: ax * 1000 * velMult, vy: ay * 1000 * velMult, life: 1.2, dmg, explosive: true };
    state.projectiles.push(proj);
    broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, cowtank: true });
  } else if (weapon === 'normal' && player.hunger > Math.max(1, 3 - hungerDiscount)) {
    player.hunger -= Math.max(1, 2 - hungerDiscount);
    player.attackCooldown = 1.0 * cdMult;
    const shotCount = burstMod ? 3 : 1;
    for (let b = 0; b < shotCount; b++) {
      const projId = state.foodIdCounter++;
      const dmg = 8 * player.perks.damage * dmgMult;
      const offset = b * 12;
      const proj = { id: projId, ownerId: player.id, x: player.x + ax * (40 + offset), y: player.y + ay * (40 + offset), vx: ax * 700 * velMult, vy: ay * 700 * velMult, life: 1.5, dmg, piercing: wp.piercing };
      state.projectiles.push(proj);
      broadcast({ type: 'projectile', id: projId, ownerId: player.id, x: proj.x, y: proj.y, vx: proj.vx, vy: proj.vy, color: player.color, burst: b === 0 && shotCount > 1 });
    }
  }
}

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const pr = state.projectiles[i];
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    if (pr.life <= 0 || pr.x < 0 || pr.x > MAP_W || pr.y < 0 || pr.y > MAP_H) {
      state.projectiles.splice(i, 1); continue;
    }
    // Wall collision
    let hitWall = false;
    const speed = Math.hypot(pr.vx, pr.vy);
    const steps = Math.max(1, Math.ceil(speed * dt / 15));
    const stepX = pr.vx * dt / steps, stepY = pr.vy * dt / steps;
    let checkX = pr.x - pr.vx * dt, checkY = pr.y - pr.vy * dt;
    for (let s = 0; s <= steps && !hitWall; s++) {
      for (const w of state.WALLS) {
        const wx1 = w.x - 10, wy1 = w.y - 10;
        const wx2 = w.x + Math.max(w.w, 20) + 10, wy2 = w.y + Math.max(w.h, 20) + 10;
        if (checkX > wx1 && checkX < wx2 && checkY > wy1 && checkY < wy2) { hitWall = true; break; }
      }
      checkX += stepX; checkY += stepY;
    }
    if (hitWall && !pr.piercing) {
      broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: null, ownerId: pr.ownerId, wall: true, x: checkX, y: checkY });
      state.projectiles.splice(i, 1); continue;
    }
    // Hit detection against players
    for (const [, p] of state.players) {
      if (!p.alive || p.id === pr.ownerId) continue;
      if (Math.hypot(p.x - pr.x, p.y - pr.y) < 40) {
        let dmg = pr.dmg;
        if (pr.volleyId) {
          if (!p._volleyHits) p._volleyHits = {};
          p._volleyHits[pr.volleyId] = (p._volleyHits[pr.volleyId] || 0) + 1;
          const hits = p._volleyHits[pr.volleyId];
          dmg = pr.dmg * (1 + (hits - 1) * 0.5);
        }
        let armor = (p.weapon === 'cowtank') ? 0.5 : 1;
        if (p.perks && p.perks.damageReduction) armor *= (1 - p.perks.damageReduction);
        let actualDmg = dmg * armor;
        if (p.armor > 0) { const absorbed = Math.min(p.armor, actualDmg); p.armor -= absorbed; actualDmg -= absorbed; }
        p.hunger -= actualDmg;
        p.stunTimer = (p.weapon === 'cowtank') ? 0.2 : 0.5;
        p.lastAttacker = pr.ownerId;
        if (p.weapon === 'cowtank') broadcast({ type: 'armorHit', playerId: p.id, x: p.x, y: p.y });
        if (pr.explosive) {
          const blastRadius = 120;
          for (const [, t] of state.players) {
            if (!t.alive || t.id === pr.ownerId || t.id === p.id) continue;
            const bdist = Math.hypot(t.x - pr.x, t.y - pr.y);
            if (bdist < blastRadius) {
              const falloff = 1 - bdist / blastRadius;
              t.hunger -= dmg * 0.6 * falloff;
              t.stunTimer = 0.3;
              t.lastAttacker = pr.ownerId;
            }
          }
          broadcast({ type: 'explosion', x: pr.x, y: pr.y, radius: blastRadius });
        }
        broadcast({ type: 'projectileHit', projectileId: pr.id, targetId: p.id, ownerId: pr.ownerId, dmg: Math.round(dmg) });
        if (pr.piercing) {
          pr.piercing = false;
          pr.dmg *= 0.6;
        } else {
          state.projectiles.splice(i, 1);
        }
        break;
      }
    }
  }
}

function handleBumpCombat(dt) {
  const alivePlayers = [];
  for (const [, p] of state.players) { if (p.alive) alivePlayers.push(p); }
  for (let i = 0; i < alivePlayers.length; i++) {
    for (let j = i + 1; j < alivePlayers.length; j++) {
      const a = alivePlayers[i], b = alivePlayers[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 65) {
        const aSpeed = Math.hypot(a.dx, a.dy);
        const bSpeed = Math.hypot(b.dx, b.dy);
        const sizeDiffA = Math.min(1.3, Math.max(0.5, 1 + (a.foodEaten - b.foodEaten) * 0.03));
        const sizeDiffB = Math.min(1.3, Math.max(0.5, 1 + (b.foodEaten - a.foodEaten) * 0.03));
        const baseDmg = 6 * dt;
        const aCharge = aSpeed > 0.5 ? 1.3 : 0.7;
        const bCharge = bSpeed > 0.5 ? 1.3 : 0.7;
        const aArmor = (a.weapon === 'cowtank') ? 0.5 : 1;
        const bArmor = (b.weapon === 'cowtank') ? 0.5 : 1;
        b.hunger -= baseDmg * sizeDiffA * aCharge * a.perks.damage * bArmor;
        a.hunger -= baseDmg * sizeDiffB * bCharge * b.perks.damage * aArmor;
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
      for (const w of state.WALLS) {
        if (player.x > w.x - 15 && player.x < w.x + w.w + 15 && player.y > w.y - 15 && player.y < w.y + w.h + 15) {
          player.x -= nx * 10; player.y -= ny * 10; step = 99; break;
        }
      }
    }
    player.x = Math.max(state.zone.x + 20, Math.min(state.zone.x + state.zone.w - 20, player.x));
    player.y = Math.max(state.zone.y + 20, Math.min(state.zone.y + state.zone.h - 20, player.y));
    player.dashCooldown = 3 * (player.dashCdMult || 1);
    broadcast({ type: 'dash', playerId: player.id });
  }
}

module.exports = { handleAttack, updateProjectiles, handleBumpCombat, handleDash };
