const { MAP_W, MAP_H, FOOD_TYPES, WEAPON_TYPES } = require('./config');
const { rand } = require('./utils');
const gameState = require('./game-state');

// Returns a random point within the given bounds that doesn't overlap
// any wall deadzone. Retries up to 10 times then gives up.
function safeRandPos(xMin, xMax, yMin, yMax) {
  const walls = gameState.getWalls();
  const pad = 45;
  for (let i = 0; i < 10; i++) {
    const x = rand(xMin, xMax), y = rand(yMin, yMax);
    let blocked = false;
    for (const w of walls) {
      if (x > w.x - pad && x < w.x + w.w + pad && y > w.y - pad && y < w.y + w.h + pad) { blocked = true; break; }
    }
    if (!blocked) return { x, y };
  }
  return { x: rand(xMin, xMax), y: rand(yMin, yMax) };
}

function spawnFood(poisoned) {
  const m = 80;
  const type = FOOD_TYPES[Math.random() * FOOD_TYPES.length | 0];
  const zone = gameState.getZone();
  const pos = safeRandPos(zone.x + m, zone.x + zone.w - m, zone.y + m, zone.y + zone.h - m);
  const food = {
    id: gameState.nextEntityId(),
    x: pos.x, y: pos.y,
    type, poisoned: !!poisoned,
    golden: false,
  };
  gameState.addFood(food);
  return food;
}

function spawnGoldenFood() {
  const zone = gameState.getZone();
  const pos = safeRandPos(zone.x + 80, zone.x + zone.w - 80, zone.y + 80, zone.y + zone.h - 80);
  const food = {
    id: gameState.nextEntityId(),
    x: pos.x, y: pos.y,
    type: { name: 'golden', hunger: 40, pts: 50 },
    poisoned: false, golden: true,
  };
  gameState.addFood(food);
  return food;
}

function spawnWeaponPickup() {
  const zone = gameState.getZone();
  const pos = safeRandPos(zone.x + 100, zone.x + zone.w - 100, zone.y + 100, zone.y + zone.h - 100);
  const w = {
    id: gameState.nextEntityId(),
    x: pos.x, y: pos.y,
    weapon: WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)],
    spawnTime: Date.now(),
  };
  gameState.addWeaponPickup(w);
  return w;
}

function spawnInitialFood() {
  // (gameState.resetRound() already cleared foods/weaponPickups/armorPickups before we were called.)
  for (let i = 0; i < 35; i++) spawnFood(false);
  for (let i = 0; i < 3; i++) spawnWeaponPickup();
  for (let i = 0; i < 2; i++) {
    const ap = safeRandPos(200, MAP_W-200, 200, MAP_H-200);
    gameState.addArmorPickup({ id: gameState.nextEntityId(), x: ap.x, y: ap.y });
  }
  // Spawn one of every weapon type in a ring around the center flag.
  const uniqueWeapons = [...new Set(WEAPON_TYPES)];
  const cx = MAP_W / 2, cy = MAP_H / 2, radius = 80;
  for (let i = 0; i < uniqueWeapons.length; i++) {
    const angle = (i / uniqueWeapons.length) * Math.PI * 2;
    gameState.addWeaponPickup({
      id: gameState.nextEntityId(),
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      weapon: uniqueWeapons[i],
      spawnTime: null, // null = never despawn
    });
  }
}

module.exports = { spawnFood, spawnGoldenFood, spawnWeaponPickup, spawnInitialFood, safeRandPos };
