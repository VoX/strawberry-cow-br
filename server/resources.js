// Resource node spawning and respawn tick. Nodes are world objects that
// players harvest via knife melee (combat.js::handleMelee checks nodes
// before checking player targets). Depleted nodes set a respawn timer
// and reappear after RESOURCE_TYPES[type].respawnMs.

const gameState = require('./game-state');
const { broadcast } = require('./network');
const { RESOURCE_TYPES, RESOURCE_SPAWN_COUNTS } = require('../shared/constants');
const { MAP_W, MAP_H } = require('./config');
const { rand } = require('./utils');

const MARGIN = 100;

function makeNode(type) {
  const cfg = RESOURCE_TYPES[type];
  let x, y;
  if (type === 'tree') {
    // North-biased (forest)
    x = rand(MARGIN, MAP_W - MARGIN);
    y = rand(MARGIN, MAP_H * 0.5);
  } else if (type === 'rock' || type === 'scrap') {
    // South-biased (quarry)
    x = rand(MARGIN, MAP_W - MARGIN);
    y = rand(MAP_H * 0.5, MAP_H - MARGIN);
  } else {
    // Grass — everywhere
    x = rand(MARGIN, MAP_W - MARGIN);
    y = rand(MARGIN, MAP_H - MARGIN);
  }
  return {
    id: gameState.nextEntityId(),
    type, x, y,
    hp: cfg.hp,
    maxHp: cfg.hp,
    respawnAt: null,
  };
}

function spawnResourceNodes() {
  for (const [type, count] of Object.entries(RESOURCE_SPAWN_COUNTS)) {
    for (let i = 0; i < count; i++) {
      gameState.addResourceNode(makeNode(type));
    }
  }
}

// Called once per server tick — checks depleted nodes for respawn.
function tickResourceNodes() {
  const now = Date.now();
  for (const node of gameState.getResourceNodes()) {
    if (node.respawnAt && now >= node.respawnAt) {
      const cfg = RESOURCE_TYPES[node.type];
      node.hp = cfg.hp;
      node.respawnAt = null;
      // New random position on respawn
      if (node.type === 'tree') {
        node.x = rand(MARGIN, MAP_W - MARGIN);
        node.y = rand(MARGIN, MAP_H * 0.5);
      } else if (node.type === 'rock' || node.type === 'scrap') {
        node.x = rand(MARGIN, MAP_W - MARGIN);
        node.y = rand(MAP_H * 0.5, MAP_H - MARGIN);
      } else {
        node.x = rand(MARGIN, MAP_W - MARGIN);
        node.y = rand(MARGIN, MAP_H - MARGIN);
      }
      broadcast({ type: 'resourceNodeSpawn', node: serializeNode(node) });
    }
  }
}

function serializeNode(n) {
  return { id: n.id, type: n.type, x: n.x, y: n.y, hp: n.hp, maxHp: n.maxHp };
}

function serializeActiveNodes() {
  return gameState.getResourceNodes()
    .filter(n => !n.respawnAt)
    .map(serializeNode);
}

module.exports = { spawnResourceNodes, tickResourceNodes, serializeActiveNodes };
