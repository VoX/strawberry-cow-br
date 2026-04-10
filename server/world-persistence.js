// World state persistence — saves placed buildings (barricades), tool
// cupboards, and sleeping bags to data/world.json. Loaded on server
// start to restore the persistent world across restarts.

const fs = require('fs');
const path = require('path');
const gameState = require('./game-state');
const { broadcast } = require('./network');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SAVE_FILE = path.join(DATA_DIR, 'world.json');

function saveWorld() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const data = {
      barricades: gameState.getBarricades()
        .filter(b => b.permanent)
        .map(b => ({
          id: b.id, cx: b.cx, cy: b.cy, w: b.w, h: b.h, angle: b.angle,
          ownerId: b.ownerId, hp: b.hp, material: b.material || 'wood',
          pieceType: b.pieceType || 'plank',
        })),
      toolCupboards: gameState.getToolCupboards(),
      sleepingBags: [...gameState.getSleepingBags().entries()].map(([pid, bag]) => ({
        playerId: pid, ...bag,
      })),
    };
    fs.writeFileSync(SAVE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('[world-persistence] save failed:', e.message);
  }
}

function loadWorld() {
  try {
    if (!fs.existsSync(SAVE_FILE)) return false;
    const data = JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
    // Restore barricades
    if (data.barricades) {
      for (const b of data.barricades) {
        gameState.addBarricade({
          ...b,
          _cosA: Math.cos(b.angle), _sinA: Math.sin(b.angle),
          _terrainH: 0, // terrain height will be recalculated by the client
          placedAt: Date.now(), permanent: true,
        });
      }
      console.log('[world-persistence] restored', data.barricades.length, 'barricades');
    }
    // Restore tool cupboards
    if (data.toolCupboards) {
      for (const tc of data.toolCupboards) {
        gameState.addToolCupboard(tc);
      }
      console.log('[world-persistence] restored', data.toolCupboards.length, 'tool cupboards');
    }
    // Restore sleeping bags
    if (data.sleepingBags) {
      for (const sb of data.sleepingBags) {
        const { playerId, ...bag } = sb;
        gameState.setSleepingBag(playerId, bag);
      }
      console.log('[world-persistence] restored', data.sleepingBags.length, 'sleeping bags');
    }
    return true;
  } catch (e) {
    console.warn('[world-persistence] load failed:', e.message);
    return false;
  }
}

// Auto-save every 60 seconds
let _autoSaveTimer = null;
function startAutoSave() {
  if (_autoSaveTimer) return;
  _autoSaveTimer = setInterval(saveWorld, 60000);
  // Also save on SIGTERM/SIGINT for graceful shutdown
  process.on('SIGTERM', () => { saveWorld(); process.exit(0); });
  process.on('SIGINT', () => { saveWorld(); process.exit(0); });
}

module.exports = { saveWorld, loadWorld, startAutoSave };
