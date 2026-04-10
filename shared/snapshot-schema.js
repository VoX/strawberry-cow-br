// Typed-array-buffer-schema definitions for tick snapshot encoding.
// Shared between server (encode) and client (decode).
// Converts the full tick message (snapshot + zone + metadata) into a
// compact ArrayBuffer — 77-83% smaller than JSON.
//
// CJS format: required by both server (Node) and client (esbuild bundles CJS).

const { BufferSchema, Model, uint8, uint16, int16, int32, float32, float64, string8 } = require('@geckos.io/typed-array-buffer-schema');

const playerSchema = BufferSchema.schema('player', {
  id: { type: string8, length: 12 },
  x: float32,
  y: float32,
  z: float32,
  dir: uint8,
  aimAngle: float32,
  hunger: uint8,
  score: uint16,
  alive: uint8,
  eating: uint8,
  foodEaten: uint8,
  level: uint8,
  xp: uint16,
  armor: uint8,
  kills: uint8,
  stunTimer: uint8,
  dashCooldown: uint8,
  attackCooldown: uint8,
  spawnProt: uint8,
  ammo: int16,
  reloading: uint8,
  crouching: uint8,
});

// Full tick schema — includes the SI snapshot fields (id, time, state)
// plus game metadata (tickNum, zone, gameTime) in one buffer.
const tickSchema = BufferSchema.schema('tick', {
  // SI snapshot fields
  id: { type: string8, length: 6 },   // snapshot ID
  time: float64,                        // server timestamp (ms)
  // Game metadata
  tickNum: int32,
  gameTime: int32,
  // Zone bounds
  zoneX: float32,
  zoneY: float32,
  zoneW: float32,
  zoneH: float32,
  // Player state array
  state: [playerSchema],
});

// 32 KB buffer — enough for 16 players × ~45 bytes each + header.
const tickModel = new Model(tickSchema, 32);

// Encode a full tick message into a binary buffer.
// Input: { snapshot: {id, time, state}, tickNum, gameTime, zone: {x,y,w,h} }
function encodeTick(tickMsg) {
  const snap = tickMsg.snapshot;
  const zone = tickMsg.zone || { x: 0, y: 0, w: 0, h: 0 };
  const flat = {
    id: snap.id,
    time: snap.time,
    tickNum: tickMsg.tickNum || 0,
    gameTime: tickMsg.gameTime || 0,
    zoneX: zone.x, zoneY: zone.y, zoneW: zone.w, zoneH: zone.h,
    state: snap.state.map(p => ({
      ...p,
      alive: p.alive ? 1 : 0,
      eating: p.eating ? 1 : 0,
      spawnProt: p.spawnProt ? 1 : 0,
      reloading: p.reloading ? 1 : 0,
      crouching: p.crouching ? 1 : 0,
    })),
  };
  return tickModel.toBuffer(flat);
}

// Decode a binary buffer back into the tick message structure.
// Returns: { type:'tick', tickNum, gameTime, zone, snapshot: {id, time, state} }
function decodeTick(buffer) {
  const flat = tickModel.fromBuffer(buffer);
  // Trim string padding.
  flat.id = flat.id.trim();
  for (const p of flat.state) {
    p.id = p.id.trim();
    p.alive = !!p.alive;
    p.eating = !!p.eating;
    p.spawnProt = !!p.spawnProt;
    p.reloading = !!p.reloading;
    p.crouching = !!p.crouching;
  }
  return {
    type: 'tick',
    tickNum: flat.tickNum,
    gameTime: flat.gameTime,
    zone: { x: flat.zoneX, y: flat.zoneY, w: flat.zoneW, h: flat.zoneH },
    snapshot: { id: flat.id, time: flat.time, state: flat.state },
  };
}

module.exports = { encodeTick, decodeTick };
