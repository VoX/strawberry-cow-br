const { MAP_W, MAP_H, FOOD_TYPES, WEAPON_TYPES } = require('./config');
const { rand } = require('./utils');
const gameState = require('./game-state');

function spawnFood(poisoned) {
  const m = 80;
  const type = FOOD_TYPES[Math.random() * FOOD_TYPES.length | 0];
  const zone = gameState.getZone();
  const food = {
    id: gameState.nextEntityId(),
    x: rand(zone.x + m, zone.x + zone.w - m),
    y: rand(zone.y + m, zone.y + zone.h - m),
    type, poisoned: !!poisoned,
    golden: false,
  };
  gameState.addFood(food);
  return food;
}

function spawnGoldenFood() {
  const zone = gameState.getZone();
  const food = {
    id: gameState.nextEntityId(),
    x: rand(zone.x + 80, zone.x + zone.w - 80),
    y: rand(zone.y + 80, zone.y + zone.h - 80),
    type: { name: 'golden', hunger: 40, pts: 50 },
    poisoned: false, golden: true,
  };
  gameState.addFood(food);
  return food;
}

function spawnWeaponPickup() {
  const zone = gameState.getZone();
  const w = {
    id: gameState.nextEntityId(),
    x: rand(zone.x + 100, zone.x + zone.w - 100),
    y: rand(zone.y + 100, zone.y + zone.h - 100),
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
    gameState.addArmorPickup({ id: gameState.nextEntityId(), x: rand(200, MAP_W-200), y: rand(200, MAP_H-200) });
  }
}

module.exports = { spawnFood, spawnGoldenFood, spawnWeaponPickup, spawnInitialFood };
