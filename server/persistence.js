// Simple JSON file persistence for player progress. Saves on disconnect,
// restores on reconnect (matched by player name). Data stored in a single
// JSON file at ./data/players.json.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SAVE_FILE = path.join(DATA_DIR, 'players.json');

let _data = {}; // name → { resources, weapon, ammo, durability, level, xp, xpToNext, perks, weaponPerks, sleepingBag }

// Load on startup
function loadAll() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(SAVE_FILE)) {
      _data = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
      console.log('[persistence] loaded', Object.keys(_data).length, 'player saves');
    }
  } catch (e) {
    console.warn('[persistence] load failed:', e.message);
  }
}

// Save all to disk
function saveAll() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SAVE_FILE, JSON.stringify(_data, null, 2));
  } catch (e) {
    console.warn('[persistence] save failed:', e.message);
  }
}

// Save a single player's progress (called on disconnect or periodically)
function savePlayer(player) {
  if (!player || !player.name || player.isBot) return;
  _data[player.name] = {
    resources: player.resources || { grass: 0, wood: 0, stone: 0, metal: 0 },
    weapon: player.weapon || 'normal',
    ammo: player.ammo || 0,
    durability: player.durability || 0,
    level: player.level || 0,
    xp: player.xp || 0,
    xpToNext: player.xpToNext || 50,
    perks: player.perks ? { ...player.perks } : null,
    weaponPerks: player.weaponPerks ? { ...player.weaponPerks } : null,
    kills: player.kills || 0,
    deaths: player.deaths || 0,
  };
  saveAll();
}

// Restore a player's saved progress (called on join)
function restorePlayer(player) {
  if (!player || !player.name || player.isBot) return false;
  const saved = _data[player.name];
  if (!saved) return false;
  if (saved.resources) player.resources = { ...saved.resources };
  if (saved.weapon) player.weapon = saved.weapon;
  if (saved.ammo != null) player.ammo = saved.ammo;
  if (saved.durability != null) player.durability = saved.durability;
  if (saved.level != null) { player.level = saved.level; player.xp = saved.xp || 0; player.xpToNext = saved.xpToNext || 50; }
  if (saved.perks) player.perks = { ...saved.perks };
  if (saved.weaponPerks) player.weaponPerks = { ...saved.weaponPerks };
  if (saved.kills != null) player.kills = saved.kills;
  if (saved.deaths != null) player.deaths = saved.deaths;
  return true;
}

// Load at module init
loadAll();

module.exports = { savePlayer, restorePlayer, saveAll };
