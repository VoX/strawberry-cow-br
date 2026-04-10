# typed-array-buffer-schema Integration Plan

## Goal

Replace JSON/MessagePack encoding with `@geckos.io/typed-array-buffer-schema` for the high-frequency tick path. Schema-based binary encoding gives ~77-83% compression over JSON by eliminating key names and using fixed-width typed fields.

## Current encoding by transport

| Transport | Reliable (events) | Unreliable (ticks) |
|-----------|-------------------|-------------------|
| WebSocket | MessagePack binary | MessagePack binary |
| geckos.io | Plain objects (geckos JSON internally) | Plain objects (geckos JSON internally) |

## Problem we hit last time

Player IDs are **numbers** (from `gameState.nextPlayerId()`), but the schema's `string8` type calls `.padEnd()` — crashes on non-strings. Simple fix: coerce to string.

Additionally, geckos.io's `channel.emit()` doesn't reliably pass ArrayBuffer through its serialization layer for reliable messages (retry envelope mangles binary). For unreliable sends, geckos data channels natively support binary — but geckos.io's emit wrapper may still interfere.

## Proposed approach

### WebSocket path — full schema encoding

WS handles raw binary natively. `ws.send(arrayBuffer)` works. Client sets `ws.binaryType = 'arraybuffer'` and already receives binary.

**Server send:**
```js
// server/transports/ws.js
function sendUnreliable(ws, msg) {
  if (msg instanceof ArrayBuffer || msg instanceof Uint8Array) {
    ws.send(msg);  // raw binary passthrough
    return;
  }
  ws.send(encodeMsg(msg));  // msgpack for non-schema messages
}
```

**Client receive:**
```js
// client/transports/ws.js
ws.onmessage = e => {
  if (e.data instanceof ArrayBuffer) {
    const view = new Uint8Array(e.data);
    // Schema buffers start with 0x23 (#) — the schema ID delimiter
    const msg = view[0] === 0x23 ? decodeTick(e.data) : decode(view);
    onMessage(msg);
  } else {
    onMessage(JSON.parse(e.data));  // fallback for text frames
  }
};
```

The `0x23` prefix is how typed-array-buffer-schema marks its buffers (first byte is `#` = ASCII 35 = 0x23). MessagePack map objects start with `0x80+` so there's no ambiguity.

### geckos.io path — two options

**Option A: Schema on unreliable only (recommended)**

Unreliable sends go through geckos.io's data channel, which is a standard RTCDataChannel. These channels natively support binary (ArrayBuffer). The question is whether geckos.io's `channel.emit(event, data)` passes the ArrayBuffer through or tries to JSON-serialize it.

Testing needed: call `channel.emit('msg', arrayBuffer)` with no reliability options and check if the client receives an ArrayBuffer or garbage.

If it works:
```js
// server/transports/geckos.js
function sendUnreliable(channel, msg) {
  if (msg instanceof ArrayBuffer || msg instanceof Uint8Array) {
    channel.emit(MSG_EVENT, msg);  // binary passthrough
    return;
  }
  channel.emit(MSG_EVENT, msg);  // plain object, geckos JSON
}
```

Client receives and checks `instanceof ArrayBuffer` before decoding, same as WS.

Reliable sends stay as plain objects — geckos' retry mechanism wraps payloads in its own envelope and mangles binary.

**Option B: Bypass geckos.io emit, use raw data channel**

If Option A doesn't work, we can access the underlying RTCDataChannel directly:

```js
// Access geckos.io's internal data channel
const dc = channel.raw;  // or channel.dataChannel — need to check API
dc.send(arrayBuffer);     // raw binary, no geckos envelope
```

This bypasses geckos.io's event system entirely for unreliable tick sends. The client would need a separate `dc.onmessage` handler that decodes the schema buffer directly. Fragile — couples us to geckos internals.

**Option C: Don't use schema on geckos**

Keep plain objects on geckos. Schema encoding only benefits WS. Since most players use WS anyway (geckos fails behind strict NATs/firewalls), the bandwidth win on WS alone is worthwhile.

### Schema definition

```js
// shared/snapshot-schema.js
const playerSchema = BufferSchema.schema('player', {
  id: { type: string8, length: 12 },  // coerced from number via String()
  x: float32,
  y: float32,
  z: float32,
  dir: uint8,
  aimAngle: float32,
  hunger: uint8,
  score: uint16,
  alive: uint8,        // boolean as 0/1
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

const tickSchema = BufferSchema.schema('tick', {
  id: { type: string8, length: 6 },   // SI snapshot ID
  time: float64,                        // server timestamp
  tickNum: int32,
  gameTime: int32,
  zoneX: float32, zoneY: float32,
  zoneW: float32, zoneH: float32,
  state: [playerSchema],
});
```

**Per-player size:** ~45 bytes (schema) vs ~200 bytes (JSON) = ~77% reduction.
**16 players at 30Hz:** ~23 KB/s (schema) vs ~136 KB/s (JSON).

### Encode/decode functions

```js
function encodeTick(tickMsg) {
  const snap = tickMsg.snapshot;
  const zone = tickMsg.zone;
  return tickModel.toBuffer({
    id: snap.id,
    time: snap.time,
    tickNum: tickMsg.tickNum,
    gameTime: tickMsg.gameTime,
    zoneX: zone.x, zoneY: zone.y, zoneW: zone.w, zoneH: zone.h,
    state: snap.state.map(p => ({
      ...p,
      id: String(p.id),           // FIX: coerce number ID to string
      alive: p.alive ? 1 : 0,    // booleans to uint8
      eating: p.eating ? 1 : 0,
      spawnProt: p.spawnProt ? 1 : 0,
      reloading: p.reloading ? 1 : 0,
      crouching: p.crouching ? 1 : 0,
    })),
  });
}

function decodeTick(buffer) {
  const flat = tickModel.fromBuffer(buffer);
  flat.id = flat.id.trim();
  for (const p of flat.state) {
    p.id = p.id.trim();
    // Convert back to number if numeric (player IDs are numbers)
    const numId = Number(p.id);
    if (!isNaN(numId)) p.id = numId;
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
```

## Implementation steps

1. **Create `shared/snapshot-schema.js`** with the schema + encode/decode. Include `String(p.id)` coercion.
2. **Server: encode ticks** in `game.js` — call `encodeTick(tickPayload)` and pass the ArrayBuffer to `sendUnreliable`.
3. **WS transport: binary passthrough** — detect ArrayBuffer in `sendUnreliable`, call `ws.send()` directly without msgpack.
4. **WS client: detect schema prefix** — check first byte `0x23` to route to `decodeTick` vs msgpack `decode`.
5. **Test on geckos**: try `channel.emit(event, arrayBuffer)` unreliable. If it works, enable. If not, keep plain objects on geckos (Option C).
6. **Verify**: join via both transports, confirm ticks decode correctly, measure bandwidth.

## What NOT to encode with schema

- **Reliable messages** (events, acks, lobby): low frequency, variable structure. MessagePack or plain objects are fine.
- **Client → server moves**: tiny (~30 bytes JSON), only 30/sec. Not worth the complexity.
- **inputAck**: only 15/sec per player, 8 fields. Savings negligible.

The tick broadcast is the only message that benefits meaningfully — it's 30Hz × N players × all clients.

## Risk

- **Schema must match exactly** on both sides. Adding a field to `getPlayerTick()` without updating the schema will silently drop it or corrupt the buffer.
- **String padding**: schema strings are fixed-length, padded with spaces. `trim()` on decode is required. IDs longer than 12 chars will be truncated.
- **Float precision**: `float32` gives ~7 significant digits. Player positions are 0-2000 with sub-unit precision — well within range.
