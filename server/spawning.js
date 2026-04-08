const { MAP_W, MAP_H, FOOD_TYPES, WEAPON_TYPES } = require('./config');
const { rand } = require('./utils');
const state = require('./state');

function spawnFood(poisoned) {
  const m = 80;
  const type = FOOD_TYPES[Math.random() * FOOD_TYPES.length | 0];
  const food = {
    id: state.foodIdCounter++,
    x: rand(state.zone.x + m, state.zone.x + state.zone.w - m),
    y: rand(state.zone.y + m, state.zone.y + state.zone.h - m),
    type, poisoned: !!poisoned,
    golden: false,
  };
  state.foods.push(food);
  return food;
}

function spawnGoldenFood() {
  const food = {
    id: state.foodIdCounter++,
    x: rand(state.zone.x + 80, state.zone.x + state.zone.w - 80),
    y: rand(state.zone.y + 80, state.zone.y + state.zone.h - 80),
    type: { name: 'golden', hunger: 40, pts: 50 },
    poisoned: false, golden: true,
  };
  state.foods.push(food);
  return food;
}

function spawnWeaponPickup() {
  const w = {
    id: state.foodIdCounter++,
    x: rand(state.zone.x + 100, state.zone.x + state.zone.w - 100),
    y: rand(state.zone.y + 100, state.zone.y + state.zone.h - 100),
    weapon: WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)],
  };
  state.weaponPickups.push(w);
  return w;
}

function spawnInitialFood() {
  state.foods = [];
  state.weaponPickups = [];
  for (let i = 0; i < 35; i++) spawnFood(false);
  for (let i = 0; i < 3; i++) spawnWeaponPickup();
  state.armorPickups = [];
  for (let i = 0; i < 2; i++) {
    state.armorPickups.push({ id: state.foodIdCounter++, x: rand(200, MAP_W-200), y: rand(200, MAP_H-200) });
  }
}

module.exports = { spawnFood, spawnGoldenFood, spawnWeaponPickup, spawnInitialFood };
