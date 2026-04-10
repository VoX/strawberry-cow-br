// Weapon-aware bot AI. No personality system — bots adapt behavior based
// on the weapon they're holding. Pure decision function: no side effects,
// no require() of network/game-state.
//
// Weapon tiers drive engagement distance, fire mode selection, and
// positioning. Higher-tier bots maintain distance; lower-tier rush.

const { MAP_W, MAP_H } = require('./config');
const { rand } = require('./utils');
const { BURST_FAMILY } = require('../shared/constants');

// Weapon tier + behavior config. Higher tier = bot prefers it more.
// idealRange: distance bot tries to maintain during combat.
// fireRange: max distance bot will shoot from.
// aimSpread: random deviation added to aim (lower = more accurate).
// preferredMode: fire mode the bot uses.
const WEAPON_CONFIG = {
  bolty:    { tier: 6, idealRange: 500, fireRange: 800, aimSpread: 0.15, preferredMode: 'burst' },
  sks:      { tier: 5, idealRange: 350, fireRange: 600, aimSpread: 0.18, preferredMode: 'burst' },
  akm:      { tier: 5, idealRange: 280, fireRange: 500, aimSpread: 0.22, preferredMode: 'auto' },
  aug:      { tier: 4, idealRange: 300, fireRange: 500, aimSpread: 0.20, preferredMode: 'auto' },
  burst:    { tier: 4, idealRange: 260, fireRange: 450, aimSpread: 0.22, preferredMode: 'auto' },
  thompson: { tier: 3, idealRange: 150, fireRange: 250, aimSpread: 0.30, preferredMode: 'burst' },
  mp5k:     { tier: 3, idealRange: 120, fireRange: 220, aimSpread: 0.30, preferredMode: 'auto' },
  shotgun:  { tier: 3, idealRange: 80,  fireRange: 120, aimSpread: 0.15, preferredMode: 'burst' },
  normal:   { tier: 1, idealRange: 100, fireRange: 180, aimSpread: 0.35, preferredMode: 'burst' },
  cowtank:  { tier: 6, idealRange: 300, fireRange: 500, aimSpread: 0.10, preferredMode: 'burst' },
  knife:    { tier: 0, idealRange: 40,  fireRange: 60,  aimSpread: 0.40, preferredMode: 'burst' },
};

function getWeaponConfig(weapon) {
  return WEAPON_CONFIG[weapon] || WEAPON_CONFIG.normal;
}

// Liang-Barsky segment vs AABB — 2D pathfinding check with inflated wall bbox.
function segmentHitsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
  if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;
  const dx = x2 - x1, dy = y2 - y1;
  let tMin = 0, tMax = 1;
  const pp = [-dx, dx, -dy, dy];
  const qq = [x1 - rx, (rx + rw) - x1, y1 - ry, (ry + rh) - y1];
  for (let i = 0; i < 4; i++) {
    if (pp[i] === 0) { if (qq[i] < 0) return false; }
    else {
      const tt = qq[i] / pp[i];
      if (pp[i] < 0) { if (tt > tMax) return false; if (tt > tMin) tMin = tt; }
      else { if (tt < tMin) return false; if (tt < tMax) tMax = tt; }
    }
  }
  return tMin <= tMax;
}

function routeAroundWalls(px, py, tx, ty, walls) {
  const LOOKAHEAD = 320, pad = 40;
  const ddx = tx - px, ddy = ty - py;
  const dTotSq = ddx * ddx + ddy * ddy;
  let cx = tx, cy = ty;
  if (dTotSq > LOOKAHEAD * LOOKAHEAD) {
    const f = LOOKAHEAD / Math.sqrt(dTotSq);
    cx = px + ddx * f; cy = py + ddy * f;
  }
  const midX = (px + cx) / 2, midY = (py + cy) / 2;
  let blockingWall = null;
  for (const w of walls) {
    const wcx = w.x + w.w / 2, wcy = w.y + w.h / 2;
    const dx = midX - wcx, dy = midY - wcy;
    const reach = LOOKAHEAD + (w.w > w.h ? w.w : w.h);
    if (dx * dx + dy * dy > reach * reach) continue;
    if (segmentHitsRect(px, py, cx, cy, w.x - pad, w.y - pad, w.w + pad * 2, w.h + pad * 2)) {
      blockingWall = w; break;
    }
  }
  if (!blockingWall) return null;
  const w = blockingWall;
  const corners = [
    { x: w.x - pad, y: w.y - pad },
    { x: w.x + w.w + pad, y: w.y - pad },
    { x: w.x - pad, y: w.y + w.h + pad },
    { x: w.x + w.w + pad, y: w.y + w.h + pad },
  ];
  let best = corners[0], bestCost = Infinity;
  for (const c of corners) {
    const cost = Math.hypot(px - c.x, py - c.y) + Math.hypot(c.x - tx, c.y - ty);
    if (cost < bestCost) { bestCost = cost; best = c; }
  }
  return best;
}

// Check if a point is inside any wall's deadzone (wall AABB + padding).
// Bots avoid navigating to points inside deadzones.
function isInWallDeadzone(x, y, walls) {
  const pad = 45; // generous padding so bots don't clip corners
  for (const w of walls) {
    if (x > w.x - pad && x < w.x + w.w + pad && y > w.y - pad && y < w.y + w.h + pad) {
      return true;
    }
  }
  return false;
}

// Push a target point out of any wall deadzone by finding the nearest
// edge and offsetting past it. Returns the original point if clear.
function pushOutOfDeadzone(x, y, walls) {
  const pad = 50;
  for (const w of walls) {
    if (x > w.x - pad && x < w.x + w.w + pad && y > w.y - pad && y < w.y + w.h + pad) {
      // Find nearest edge to escape to
      const dists = [
        { d: Math.abs(x - (w.x - pad)), nx: w.x - pad - 5, ny: y },        // left
        { d: Math.abs(x - (w.x + w.w + pad)), nx: w.x + w.w + pad + 5, ny: y }, // right
        { d: Math.abs(y - (w.y - pad)), nx: x, ny: w.y - pad - 5 },        // top
        { d: Math.abs(y - (w.y + w.h + pad)), nx: x, ny: w.y + w.h + pad + 5 }, // bottom
      ];
      dists.sort((a, b) => a.d - b.d);
      return { x: dists[0].nx, y: dists[0].ny };
    }
  }
  return { x, y };
}

function scanSurroundings(p, world) {
  let nearestFood = null, nearFoodDist = Infinity;
  for (const f of world.foods) {
    if (f.poisoned) continue;
    const d = Math.hypot(p.x - f.x, p.y - f.y);
    if (d < nearFoodDist) { nearFoodDist = d; nearestFood = f; }
  }
  let nearestEnemy = null, nearEnemyDist = Infinity;
  for (const [, e] of world.players) {
    if (e.id === p.id || !e.alive) continue;
    const d = Math.hypot(p.x - e.x, p.y - e.y);
    if (d < nearEnemyDist) { nearEnemyDist = d; nearestEnemy = e; }
  }
  let nearestWeapon = null, nearWeaponDist = Infinity;
  let bestWeaponTier = -1;
  const myTier = getWeaponConfig(p.weapon).tier;
  for (const w of world.weaponPickups) {
    const wCfg = getWeaponConfig(w.weapon);
    // Only consider weapons that are an upgrade
    if (wCfg.tier <= myTier) continue;
    const d = Math.hypot(p.x - w.x, p.y - w.y);
    if (wCfg.tier > bestWeaponTier || (wCfg.tier === bestWeaponTier && d < nearWeaponDist)) {
      nearWeaponDist = d; nearestWeapon = w; bestWeaponTier = wCfg.tier;
    }
  }
  return { nearestFood, nearFoodDist, nearestEnemy, nearEnemyDist, nearestWeapon, nearWeaponDist };
}

function updateStuckTracking(p) {
  if (!p._lastPos) p._lastPos = { x: p.x, y: p.y, t: 0, stuckCount: 0 };
  p._lastPos.t += 0.2;
  // Check every 0.4s (was 1s) — detect stuck faster
  if (p._lastPos.t > 0.4) {
    const moved = Math.hypot(p.x - p._lastPos.x, p.y - p._lastPos.y);
    if (moved < 8) {
      p._lastPos.stuckCount = (p._lastPos.stuckCount || 0) + 1;
      if (p._lastPos.stuckCount === 1 && (p.dx !== 0 || p.dy !== 0)) {
        // First stuck: sidestep perpendicular to current direction
        p._stuckSidestep = { x: p.x + (-p.dy) * 100, y: p.y + p.dx * 100, t: 1.0 };
      } else if (p._lastPos.stuckCount >= 2) {
        // Still stuck after sidestep: pick a random new destination far away
        p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
        p._lastPos.stuckCount = 0;
        p._stuckSidestep = null;
      }
    } else {
      p._lastPos.stuckCount = 0;
    }
    p._lastPos = { x: p.x, y: p.y, t: 0, stuckCount: p._lastPos.stuckCount };
  }
  if (p._stuckSidestep) {
    p._stuckSidestep.t -= 0.2;
    if (p._stuckSidestep.t <= 0) p._stuckSidestep = null;
  }
}

function decideBotTurn(p, world) {
  const wCfg = getWeaponConfig(p.weapon);
  const scan = scanSurroundings(p, world);
  const { nearestFood, nearFoodDist, nearestEnemy, nearEnemyDist, nearestWeapon, nearWeaponDist } = scan;

  updateStuckTracking(p);

  const fires = [];
  let targetX, targetY;
  let fireMode = wCfg.preferredMode;

  // Revenge targeting: if the bot was recently hit, lock onto the attacker
  // regardless of range — override nearestEnemy with lastAttacker.
  let revengeTarget = null;
  if (p.lastAttacker && nearestEnemy) {
    for (const [, e] of world.players) {
      if (e.id === p.lastAttacker && e.alive) {
        revengeTarget = e;
        break;
      }
    }
  }

  // Priority 1: unstuck
  if (p._stuckSidestep) {
    targetX = p._stuckSidestep.x; targetY = p._stuckSidestep.y;
  }
  // Priority 2: existing wander target
  else if (p._wanderTarget) {
    targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
    if (Math.hypot(p.x - targetX, p.y - targetY) < 50) p._wanderTarget = null;
  }
  // Priority 3: pick up better weapon (if nearby and upgrade).
  // If holding a non-pistol, drop it first so the pickup system accepts the new one.
  else if (nearestWeapon && nearWeaponDist < 500) {
    targetX = nearestWeapon.x; targetY = nearestWeapon.y;
    if (nearWeaponDist < 60 && p.weapon !== 'normal' && p.weapon !== 'knife') {
      return { dx: 0, dy: 0, aimAngle: p.aimAngle, fires: [], dash: null, barricade: null, fireMode, dropWeapon: true };
    }
  }
  // Priority 4: cowstrike shelter
  else if (world.isCowstrikeActive && world.shelters.length > 0) {
    let nearShelter = null, nearShDist = Infinity;
    for (const sh of world.shelters) {
      const d = Math.hypot(p.x - sh.x, p.y - sh.y);
      if (d < nearShDist) { nearShDist = d; nearShelter = sh; }
    }
    if (nearShelter) { targetX = nearShelter.x; targetY = nearShelter.y; }
  }
  // Priority 5: combat — weapon-aware engagement. Revenge target overrides
  // nearest enemy if the bot was recently hit.
  else if (revengeTarget || (nearestEnemy && nearEnemyDist < Math.max(600, wCfg.fireRange + 200))) {
    const combatTarget = revengeTarget || nearestEnemy;
    const combatDist = Math.hypot(combatTarget.x - p.x, combatTarget.y - p.y);
    // Fire if in range and ready
    if (combatDist < wCfg.fireRange && p.attackCooldown <= 0 && p.hunger > 15) {
      const ax = (combatTarget.x - p.x) / combatDist + (Math.random() - 0.5) * wCfg.aimSpread;
      const ay = (combatTarget.y - p.y) / combatDist + (Math.random() - 0.5) * wCfg.aimSpread;
      fires.push({ target: combatTarget, ax, ay });

      // Smart fire mode: use semi at long range, auto at close range
      if (BURST_FAMILY.has(p.weapon)) {
        if (combatDist > wCfg.idealRange * 1.5) fireMode = 'semi';
        else if (combatDist < wCfg.idealRange * 0.6) fireMode = 'auto';
      }
    }

    // Positioning: maintain ideal range relative to combat target
    if (p.hunger < 25 && nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    } else if (combatDist < wCfg.idealRange - 30) {
      if (wCfg.tier >= 4) {
        targetX = p.x - (combatTarget.x - p.x); targetY = p.y - (combatTarget.y - p.y);
      } else {
        const perpX = -(combatTarget.y - p.y) / combatDist;
        const perpY = (combatTarget.x - p.x) / combatDist;
        const dir = (p.id % 2 === 0) ? 1 : -1;
        targetX = p.x + perpX * 60 * dir; targetY = p.y + perpY * 60 * dir;
      }
    } else if (combatDist > wCfg.idealRange + 60) {
      targetX = combatTarget.x; targetY = combatTarget.y;
    } else {
      const perpX = -(combatTarget.y - p.y) / combatDist;
      const perpY = (combatTarget.x - p.x) / combatDist;
      const dir = (p.id % 2 === 0) ? 1 : -1;
      targetX = p.x + perpX * 80 * dir; targetY = p.y + perpY * 80 * dir;
    }
  }
  // Priority 6: eat when hungry (only if really low — prefer fighting)
  else if (p.hunger < 40 && nearestFood) {
    targetX = nearestFood.x; targetY = nearestFood.y;
  }
  // Priority 7: wander — pick a point not inside a wall deadzone
  else {
    if (!p._wanderTarget) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const wx = rand(200, MAP_W - 200), wy = rand(200, MAP_H - 200);
        if (!isInWallDeadzone(wx, wy, world.walls)) { p._wanderTarget = { x: wx, y: wy }; break; }
      }
      if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
    }
    targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
  }

  // Push navigation target out of wall deadzones so bots never path INTO a wall
  if (targetX !== undefined && targetY !== undefined) {
    const pushed = pushOutOfDeadzone(targetX, targetY, world.walls);
    targetX = pushed.x; targetY = pushed.y;
  }
  // Wall-aware steering: route around walls between bot and target
  if (targetX !== undefined && targetY !== undefined && !p._stuckSidestep) {
    const detour = routeAroundWalls(p.x, p.y, targetX, targetY, world.walls);
    if (detour) { targetX = detour.x; targetY = detour.y; }
  }

  // Normalize movement
  let dx = 0, dy = 0, aimAngle = p.aimAngle;
  if (targetX !== undefined && targetY !== undefined) {
    const mdx = targetX - p.x, mdy = targetY - p.y;
    const dist = Math.hypot(mdx, mdy);
    if (dist > 10) { dx = mdx / dist; dy = mdy / dist; aimAngle = Math.atan2(-dx, dy); }
  }

  // Dash: flee when low HP + enemy close
  let dash = null;
  if (p.dashCooldown <= 0 && nearestEnemy && nearEnemyDist < 200 && (p.hunger < 30 || p.stunTimer > 0)) {
    if (nearEnemyDist > 1) {
      dash = { dx: -(nearestEnemy.x - p.x) / nearEnemyDist, dy: -(nearestEnemy.y - p.y) / nearEnemyDist };
    }
  }

  // Barricade: drop cover when taking fire at medium range
  let barricade = null;
  if (nearestEnemy && nearEnemyDist > 120 && nearEnemyDist < 500 && (p.hunger < 60 || p.stunTimer > 0)) {
    const nowMs = Date.now();
    if (!p.barricadeReadyAt || nowMs >= p.barricadeReadyAt) {
      barricade = { ax: (nearestEnemy.x - p.x) / nearEnemyDist, ay: (nearestEnemy.y - p.y) / nearEnemyDist };
    }
  }

  return { dx, dy, aimAngle, fires, dash, barricade, fireMode };
}

module.exports = { decideBotTurn, WEAPON_CONFIG };
