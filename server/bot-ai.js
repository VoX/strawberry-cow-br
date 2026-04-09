// Pure bot decision-making. Given a bot and a read-only `world` struct, returns
// an `intent` object describing what the bot wants to do this tick. The caller
// (bots.js orchestrator) is responsible for executing the intent — mutating bot
// fields, broadcasting projectiles, invoking combat handlers, etc.
//
// Purity rules:
//   - NO require() of network, game-state, lobby-state, lobby, game
//   - NO broadcasts, NO DOM, NO side effects
//   - May read bot state (it is the subject of the decision)
//   - May write bot-local scratch fields (_wanderTarget, _stuckSidestep,
//     _lastPos) — these are bot-AI bookkeeping, not game state
//
// Build `world` once per tick in the orchestrator and pass the same reference
// to every bot — shared references are fine, no copies.

const { MAP_W, MAP_H } = require('./config');
const { rand } = require('./utils');

const PERSONALITIES = ['timid', 'balanced', 'aggressive'];
const PERSONALITY_STATS = {
  aggressive: { engageRange: 700, fireRange: 500, hungerThreshold: 30, fleeHp: 15 },
  balanced:   { engageRange: 500, fireRange: 350, hungerThreshold: 50, fleeHp: 40 },
  timid:      { engageRange: 300, fireRange: 200, hungerThreshold: 70, fleeHp: 50 },
};

// Liang-Barsky segment vs AABB — returns true if the segment crosses the rect.
// NOTE: This is a 2D pathfinding check with an inflated wall bbox (pad=28), used
// to steer bots around walls before they bump into them. It is intentionally NOT
// `ballistics.segVsWalls` — that's a 3D projectile-hit check with tight bounds
// that returns the earliest hit. Bots want loose planar avoidance, not a hit.
function segmentHitsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
  if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;
  const dx = x2 - x1, dy = y2 - y1;
  let tMin = 0, tMax = 1;
  const pp = [-dx, dx, -dy, dy];
  const qq = [x1 - rx, (rx + rw) - x1, y1 - ry, (ry + rh) - y1];
  for (let i = 0; i < 4; i++) {
    if (pp[i] === 0) {
      if (qq[i] < 0) return false;
    } else {
      const tt = qq[i] / pp[i];
      if (pp[i] < 0) { if (tt > tMax) return false; if (tt > tMin) tMin = tt; }
      else { if (tt < tMin) return false; if (tt < tMax) tMax = tt; }
    }
  }
  return tMin <= tMax;
}

// Steer around walls: if the line from (px,py) to target crosses any wall,
// return the best corner to route around. Otherwise null (direct path clear).
function routeAroundWalls(px, py, tx, ty, walls) {
  const LOOKAHEAD = 220;
  const pad = 28;
  // Squared-distance for the initial clamp; only sqrt if we actually rescale.
  const ddx = tx - px, ddy = ty - py;
  const dTotSq = ddx * ddx + ddy * ddy;
  let cx = tx, cy = ty;
  if (dTotSq > LOOKAHEAD * LOOKAHEAD) {
    const f = LOOKAHEAD / Math.sqrt(dTotSq);
    cx = px + ddx * f;
    cy = py + ddy * f;
  }
  // Hoist midpoint out of the loop — it's constant across the wall scan.
  const midX = (px + cx) / 2, midY = (py + cy) / 2;
  let blockingWall = null;
  for (const w of walls) {
    const wcx = w.x + w.w / 2, wcy = w.y + w.h / 2;
    const dx = midX - wcx, dy = midY - wcy;
    // Squared-distance prune — avoids sqrt per wall per bot per decision.
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

// Scan world for the nearest food / enemy / weapon relative to bot p.
// Returns a plain struct; does not mutate.
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
    const d = Math.hypot(p.x - e.x, p.y - e.y, p.z - e.z);
    if (d < nearEnemyDist) { nearEnemyDist = d; nearestEnemy = e; }
  }
  let nearestWeapon = null, nearWeaponDist = Infinity;
  for (const w of world.weaponPickups) {
    const d = Math.hypot(p.x - w.x, p.y - w.y);
    if (d < nearWeaponDist) { nearWeaponDist = d; nearestWeapon = w; }
  }
  return { nearestFood, nearFoodDist, nearestEnemy, nearEnemyDist, nearestWeapon, nearWeaponDist };
}

// Update stuck-detection scratch state on the bot. Mutates bot-local _lastPos
// and _stuckSidestep / _wanderTarget. These are AI bookkeeping fields, not
// gameplay state.
function updateStuckTracking(p) {
  if (!p._lastPos) p._lastPos = { x: p.x, y: p.y, t: 0, stuckCount: 0 };
  p._lastPos.t += 0.4;
  if (p._lastPos.t > 1) {
    const moved = Math.hypot(p.x - p._lastPos.x, p.y - p._lastPos.y);
    if (moved < 15) {
      p._lastPos.stuckCount = (p._lastPos.stuckCount || 0) + 1;
      if (p._lastPos.stuckCount === 1 && p.dx !== 0) {
        p._stuckSidestep = { x: p.x + (-p.dy) * 60, y: p.y + p.dx * 60, t: 1.5 };
      } else if (p._lastPos.stuckCount >= 2) {
        p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
        p._lastPos.stuckCount = 0;
      }
    } else {
      p._lastPos.stuckCount = 0;
    }
    p._lastPos = { x: p.x, y: p.y, t: 0, stuckCount: p._lastPos.stuckCount };
  }
  if (p._stuckSidestep) {
    p._stuckSidestep.t -= 0.4;
    if (p._stuckSidestep.t <= 0) p._stuckSidestep = null;
  }
}

// Pure decision function. Returns an `intent` describing what the bot wants to
// do this tick:
//   {
//     dx, dy, aimAngle,             // movement + facing (applied to bot by caller)
//     fires: [ { target, ax, ay } ],// fire requests (0+; caller invokes fireBot)
//     dash:  null | { dx, dy },     // dash request (caller invokes handleDash)
//     barricade: null | { ax, ay }, // barricade request (caller invokes placeBarricadeForPlayer)
//   }
//
// The caller MUST apply dx/dy/aimAngle to the bot before executing fires/dash
// (so fire/dash compute in terms of the new facing). This matches the pre-
// refactor behavior where those fields were mutated inline.
function decideBotTurn(p, world) {
  const personality = p.personality || 'balanced';
  const hasGun = p.weapon !== 'normal';
  const scan = scanSurroundings(p, world);
  const { nearestFood, nearFoodDist, nearestEnemy, nearEnemyDist, nearestWeapon, nearWeaponDist } = scan;

  updateStuckTracking(p);

  const stats = PERSONALITY_STATS[personality] || PERSONALITY_STATS.balanced;
  const { engageRange, fireRange, hungerThreshold, fleeHp } = stats;

  const fires = [];
  let targetX, targetY;

  if (p._stuckSidestep) {
    targetX = p._stuckSidestep.x; targetY = p._stuckSidestep.y;
  }
  else if (p._wanderTarget) {
    targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
    if (Math.hypot(p.x - targetX, p.y - targetY) < 50) p._wanderTarget = null;
  }
  else if (nearestWeapon && nearWeaponDist < 400 && !hasGun) {
    targetX = nearestWeapon.x; targetY = nearestWeapon.y;
  }
  else if (world.isCowstrikeActive && world.shelters.length > 0) {
    let nearShelter = null, nearShDist = Infinity;
    for (const sh of world.shelters) {
      const d = Math.hypot(p.x - sh.x, p.y - sh.y);
      if (d < nearShDist) { nearShDist = d; nearShelter = sh; }
    }
    if (nearShelter) { targetX = nearShelter.x; targetY = nearShelter.y; }
  }
  else if (personality === 'aggressive' && nearestEnemy && nearEnemyDist < engageRange) {
    if (nearEnemyDist < fireRange && p.attackCooldown <= 0 && p.hunger > 15) {
      const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
      const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
      fires.push({ target: nearestEnemy, ax, ay });
    }
    if (p.hunger < fleeHp && nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    } else {
      const idealDist = hasGun ? 180 : 40;
      if (nearEnemyDist < idealDist - 20) {
        const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
        const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
        const dir = (p.id % 2 === 0) ? 1 : -1;
        targetX = p.x + perpX * 60 * dir; targetY = p.y + perpY * 60 * dir;
      } else if (nearEnemyDist > idealDist + 50) {
        targetX = nearestEnemy.x; targetY = nearestEnemy.y;
      } else {
        const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
        const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
        const dir = (p.id % 2 === 0) ? 1 : -1;
        targetX = p.x + perpX * 80 * dir; targetY = p.y + perpY * 80 * dir;
      }
    }
  }
  else if (personality === 'timid') {
    if (p.hunger < hungerThreshold && nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    } else if (nearestEnemy && nearEnemyDist < engageRange) {
      if (hasGun && nearEnemyDist < fireRange && p.attackCooldown <= 0 && p.hunger > 20) {
        const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
        const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
        fires.push({ target: nearestEnemy, ax, ay });
        targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
      } else {
        targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
      }
    } else if (nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    } else {
      if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
    }
  }
  else {
    // Balanced: fight with gun, flee without, eat when hungry
    const underAttack = p.hunger < fleeHp && p.lastAttacker && nearestEnemy && nearEnemyDist < 400;
    if (p.hunger < hungerThreshold && nearestFood && !underAttack) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    } else if (nearestEnemy && nearEnemyDist < engageRange) {
      if (hasGun) {
        if (nearEnemyDist < fireRange && p.attackCooldown <= 0 && p.hunger > 15) {
          const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
          const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
          fires.push({ target: nearestEnemy, ax, ay });
        }
        const idealDist = 200;
        if (nearEnemyDist < idealDist - 30) {
          targetX = p.x - (nearestEnemy.x - p.x); targetY = p.y - (nearestEnemy.y - p.y);
        } else if (nearEnemyDist > idealDist + 50) {
          targetX = nearestEnemy.x; targetY = nearestEnemy.y;
        } else {
          const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
          const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
          const dir = (p.id % 2 === 0) ? 1 : -1;
          targetX = p.x + perpX * 80 * dir; targetY = p.y + perpY * 80 * dir;
        }
      } else {
        if (nearEnemyDist < 150 && p.attackCooldown <= 0 && p.hunger > 15) {
          const ax = (nearestEnemy.x - p.x) / nearEnemyDist + (Math.random()-0.5)*0.4;
          const ay = (nearestEnemy.y - p.y) / nearEnemyDist + (Math.random()-0.5)*0.4;
          fires.push({ target: nearestEnemy, ax, ay });
        }
        const perpX = -(nearestEnemy.y - p.y) / nearEnemyDist;
        const perpY = (nearestEnemy.x - p.x) / nearEnemyDist;
        const dir = (p.id % 2 === 0) ? 1 : -1;
        targetX = p.x + perpX * 60 * dir; targetY = p.y + perpY * 60 * dir;
      }
    } else if (nearestFood) {
      targetX = nearestFood.x; targetY = nearestFood.y;
    } else {
      if (!p._wanderTarget) p._wanderTarget = { x: rand(200, MAP_W - 200), y: rand(200, MAP_H - 200) };
      targetX = p._wanderTarget.x; targetY = p._wanderTarget.y;
    }
  }

  // Wall-aware steering: route around blocking walls (skip when sidestepping)
  if (targetX !== undefined && targetY !== undefined && !p._stuckSidestep) {
    const detour = routeAroundWalls(p.x, p.y, targetX, targetY, world.walls);
    if (detour) { targetX = detour.x; targetY = detour.y; }
  }

  // Normalize movement direction
  let dx = 0, dy = 0, aimAngle = p.aimAngle;
  if (targetX !== undefined && targetY !== undefined) {
    const mdx = targetX - p.x, mdy = targetY - p.y;
    const dist = Math.hypot(mdx, mdy);
    if (dist > 10) { dx = mdx / dist; dy = mdy / dist; aimAngle = Math.atan2(-dx, dy); }
  }

  // Dash intent: low hp + enemy close, or being stunned
  let dash = null;
  if (p.dashCooldown <= 0 && nearestEnemy && nearEnemyDist < 200 && (p.hunger < 30 || p.stunTimer > 0)) {
    if (nearEnemyDist > 1) {
      dash = {
        dx: -(nearestEnemy.x - p.x) / nearEnemyDist,
        dy: -(nearestEnemy.y - p.y) / nearEnemyDist,
      };
    } else {
      dash = { dx: 0, dy: 0 };
    }
  }

  // Barricade intent: drop cover when cornered by a ranged enemy
  let barricade = null;
  if (nearestEnemy && nearEnemyDist > 120 && nearEnemyDist < 500 && (p.hunger < 60 || p.stunTimer > 0)) {
    const nowMs = Date.now();
    if (!p.barricadeReadyAt || nowMs >= p.barricadeReadyAt) {
      barricade = {
        ax: (nearestEnemy.x - p.x) / nearEnemyDist,
        ay: (nearestEnemy.y - p.y) / nearEnemyDist,
      };
    }
  }

  return { dx, dy, aimAngle, fires, dash, barricade };
}

module.exports = { decideBotTurn, PERSONALITIES };
