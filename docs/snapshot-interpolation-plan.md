# Snapshot Interpolation Migration Plan

## Overview

Replace all custom client-side prediction, server reconciliation, remote player interpolation, and server lag compensation with two geckos.io companion libraries:

- **`@geckos.io/snapshot-interpolation`** (v1.1.1) — time-based snapshot interpolation, vault storage, clock sync
- **`@geckos.io/typed-array-buffer-schema`** (v1.2.1) — schema-based binary serialization (JS objects ↔ ArrayBuffer)

## What Gets Replaced

| Current system | File(s) | Replacement |
|---|---|---|
| Custom ring buffer prediction + Bernier replay | `client/prediction.js` | SI vault + gradual correction |
| Custom remote player interpolation | `client/interp.js` | `SI.calcInterpolation()` |
| Seq-based inputAck system | `server/game.js:347-366`, `client/message-handlers.js:378-402` | Removed — snapshots serve as implicit acks |
| Per-tick player state broadcast | `server/game.js:324-337` | SI snapshots via typed-array-buffer-schema |
| No lag compensation | — | Server-side SI vault for time-rewind hit detection |

## What Stays

| System | File(s) | Why |
|---|---|---|
| Shared movement physics | `shared/movement.js` | Client still needs deterministic step for prediction |
| Server move queue + drain | `server/dispatch.js`, `server/game.js` | Server processes inputs one-per-tick for determinism |
| Jump-through-move-queue | `server/game.js:182-186` | Still needed for deferred jump |
| All combat/weapon/perk logic | `server/combat.js`, `server/weapon-fire.js`, etc. | Unrelated to interpolation |
| WS transport msgpack | `server/transports/ws.js`, `client/transports/ws.js` | Binary encoding for WebSocket path |

---

## Phase 1: Install Dependencies + Define Schemas

### 1.1 Install packages
```bash
npm install @geckos.io/snapshot-interpolation @geckos.io/typed-array-buffer-schema
```

### 1.2 Create shared schema definitions

**New file: `shared/schemas.js`**

Define a typed-array-buffer-schema for the tick/snapshot payload. Every interpolatable field needs a schema entry.

```js
const { BufferSchema, Model } = require('@geckos.io/typed-array-buffer-schema');
const { uint8, uint16, int16, float32, string8, bool8 } = require('@geckos.io/typed-array-buffer-schema');

// Player entity schema — must cover all fields needed for rendering + interpolation
const playerSchema = BufferSchema.schema('player', {
  id:        { type: string8, length: 12 },  // player ID (string)
  x:         { type: int16, digits: 1 },      // position (-3276.8 to 3276.7, 0.1 precision)
  y:         { type: int16, digits: 1 },
  z:         { type: int16, digits: 1 },      // vertical
  dir:       uint8,                            // cardinal direction 0-3
  aimAngle:  { type: int16, digits: 2 },       // radians × 100
  hunger:    uint8,                            // 0-255 (max hunger is 100-200)
  score:     uint16,                           // 0-65535
  alive:     { type: bool8 },                  // [alive, eating, spawnProt, reloading, crouching, -, -]
  foodEaten: uint8,
  level:     uint8,
  xp:        uint16,
  armor:     uint8,
  kills:     uint8,
  stunTimer: uint8,
  dashCooldown:   uint8,
  attackCooldown: uint8,
  ammo:      int16,                            // -1 = unlimited
});

// Full snapshot schema — wraps player array + metadata
const snapshotSchema = BufferSchema.schema('snapshot', {
  id:   { type: string8, length: 6 },          // SI snapshot ID
  time: { type: float64 },                     // server timestamp (ms)
  state: [playerSchema],                       // array of player entities
});

const snapshotModel = new Model(snapshotSchema, 16); // 16KB buffer max
```

**Note on `bool8`:** packs up to 7 booleans into 1 byte. We pack `alive`, `eating`, `spawnProt`, `reloading`, `crouching` into one `bool8` field and unpack on receive.

### 1.3 Decide: use schema on geckos only, not WS

WS transport already uses msgpack binary. typed-array-buffer-schema gives even better compression for fixed-schema data (no key names), but we'll use it on **both transports** for the snapshot path since it replaces msgpack for tick data. The schema is shared code, transport-agnostic.

---

## Phase 2: Server-Side Snapshot Creation

### 2.1 Create server SI instance

**Modified file: `server/game.js`**

```js
const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation');
const SI = new SnapshotInterpolation(TICK_RATE); // 30 FPS
```

The server SI instance serves two purposes:
- `SI.snapshot.create(state)` — creates timestamped snapshots
- `SI.vault` — stores snapshots for lag compensation

### 2.2 Replace tick broadcast with SI snapshots

In `gameTick()`, replace the current tick payload construction + broadcast:

**Before:**
```js
const tickPayload = { type: 'tick', tickNum, players: getPlayerTicks(), zone, gameTime };
// ...per-player sendUnreliable(tickPayload)
```

**After:**
```js
// Build entity state array (SI requires flat array with id fields)
const state = getPlayerTicks(); // already returns [{id, x, y, z, ...}, ...]
const snapshot = SI.snapshot.create(state);
SI.vault.add(snapshot); // store for lag compensation

// Serialize with typed-array-buffer-schema
const buffer = snapshotModel.toBuffer(snapshot);

// Broadcast — include non-interpolatable metadata alongside
const tickMsg = { type: 'tick', snapshot, zone, gameTime, tickNum };
broadcast(tickMsg);
```

**Decision: schema encoding vs raw object**
Since geckos can't handle binary in its emit API, we pass raw objects on geckos. For WS, we can encode with msgpack as before. The typed-array-buffer-schema encoding is best used if we eventually fix geckos binary support or switch to raw data channels. For now, the snapshot structure is the key win — the SI library's time-synced vault and interpolation logic.

### 2.3 Remove inputAck broadcast

Delete the `tickNum % 2 === 0` inputAck broadcast block in `gameTick()` (lines ~347-366). The snapshot itself serves as the "ack" — the client compares its predicted position against the server snapshot at the corresponding time.

Also remove `p._ackSnapshot` capture logic (lines ~197-206).

### 2.4 Server vault for lag compensation

Store snapshots in `SI.vault`. When processing hit detection in `combat.js`:

```js
// Client sends: { type: 'attack', ..., serverTime: SI.serverTime }
// Server rewinds:
const shots = SI.vault.get(msg.serverTime);
if (shots) {
  const rewound = SI.interpolate(shots.older, shots.newer, msg.serverTime, 'x y z');
  // Check collision against rewound.state positions
}
```

This replaces our current "check against current tick state" approach with proper lag-compensated hit detection.

---

## Phase 3: Client-Side Snapshot Interpolation (Remote Players)

### 3.1 Create client SI instance

**Modified file: `client/message-handlers.js` or new `client/snapshot.js`**

```js
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
const SI = new SnapshotInterpolation(30); // server sends at 30 FPS
```

### 3.2 Replace tick handler

In the `tick` message handler, instead of manually updating `S.serverPlayers` and pushing to `_histBuf`:

```js
// Add snapshot to SI vault
SI.snapshot.add(msg.snapshot);

// Update non-interpolatable state (zone, gameTime, etc.)
S.zone = msg.zone;
S.gameTime = msg.gameTime;
```

### 3.3 Replace interp.js with SI.calcInterpolation

**Delete: `client/interp.js`**

In the render loop (`client/index.js`), replace `interpSamplePlayer()` calls with:

```js
const interpolated = SI.calcInterpolation('x y z aimAngle(rad)', 'state');
if (interpolated) {
  for (const entity of interpolated.state) {
    if (entity.id === S.myId) continue; // skip local player
    const p = S.serverPlayers[entity.id];
    if (p) {
      p._renderX = entity.x;
      p._renderY = entity.y;
      p._renderZ = entity.z;
      p._renderAim = entity.aimAngle;
    }
  }
}
```

SI handles:
- Interpolation buffer (3 server frames = 100ms at 30 FPS)
- Clock sync between client and server
- Linear lerp for positions
- Radian-aware lerp for aim angles
- Missing entity handling (new players appear at their first known position)

### 3.4 Non-interpolatable fields

Fields like `hunger`, `alive`, `kills`, `armor`, `ammo`, `reloading` are NOT interpolated — they snap to the latest value. The tick handler still updates these directly on `S.serverPlayers` from the latest snapshot.

---

## Phase 4: Client-Side Prediction + Server Reconciliation

### 4.1 Rewrite prediction.js

**Replace the ring buffer + Bernier replay with SI vault + gradual correction.**

The local player is excluded from `SI.calcInterpolation()`. Instead:

**Prediction (immediate input application):**
```js
// Still uses shared/movement.js for deterministic prediction
stepPlayerMovement(S.mePredicted, TICK_DT, world, input, terrain);

// Store predicted state in a separate vault with SI timestamp
playerVault.add(SI.snapshot.create([{ id: S.myId, x: S.mePredicted.x, y: S.mePredicted.y, z: S.mePredicted.z }]));
```

**Reconciliation (gradual correction from server snapshots):**
```js
function serverReconciliation() {
  const serverSnapshot = SI.vault.get(); // latest server snapshot
  if (!serverSnapshot) return;

  // Find our predicted state closest to the server snapshot's time
  const predicted = playerVault.get(serverSnapshot.time, true);
  if (!predicted) return;

  // Find our entity in the server snapshot
  const serverMe = serverSnapshot.state.find(e => e.id === S.myId);
  if (!serverMe) return;

  // Calculate drift
  const predMe = predicted.state.find(e => e.id === S.myId);
  const offsetX = predMe.x - serverMe.x;
  const offsetY = predMe.y - serverMe.y;
  const offsetZ = predMe.z - serverMe.z;

  // Gradual correction — faster when moving, slower when still
  const isMoving = Math.abs(S.mePredicted.dx) > 0.01 || Math.abs(S.mePredicted.dy) > 0.01;
  const correction = isMoving ? 60 : 180;

  S.mePredicted.x -= offsetX / correction;
  S.mePredicted.y -= offsetY / correction;
  S.mePredicted.z -= offsetZ / correction;
}
```

### 4.2 Key differences from current system

| Aspect | Current (Bernier) | New (SI gradual) |
|---|---|---|
| Matching | Seq-based (exact) | Time-based (approximate) |
| Correction | Snap + replay all unacked inputs | Gradual drift correction per frame |
| Ring buffer | 60 entries, stores input + state | SI Vault, stores snapshots with timestamps |
| Visual smoothing | Error accumulator + linear decay | Built into gradual correction |
| inputAck | Explicit 15 Hz server message | Implicit — latest tick snapshot |
| Seq tracking | Required (S.inputSeq, S.lastAckedInput) | Not needed |

### 4.3 Remove seq tracking

- Remove `STATEFUL_INPUT_TYPES` seq injection from `client/network.js:104-106`
- Remove `S.inputSeq`, `S.lastAckedInput` from `client/state.js`
- Remove seq from move messages (server still processes moves in order via queue)
- Remove `p.lastInputSeq` from server player state
- Remove stale-seq drop logic from `server/dispatch.js:63-68`

**Wait — seq is still needed for move queue ordering.** The server uses seq to detect stale/reordered UDP moves. We should keep seq on moves but remove the inputAck system. The seq becomes purely a server-side ordering mechanism, not a reconciliation anchor.

---

## Phase 5: Server Lag Compensation

### 5.1 Combat hit detection with time rewind

**Modified file: `server/combat.js`**

Currently, hit detection checks against current-tick positions. With SI vault, we can check against where players were when the attacker clicked.

Client sends `serverTime` with attack messages:
```js
send({ type: 'attack', ..., serverTime: SI.serverTime });
```

Server processes:
```js
function checkHit(attacker, targetId, clientTime) {
  const snapshots = SI.vault.get(clientTime);
  if (!snapshots) return currentPositionCheck(); // fallback

  const rewound = SI.interpolate(snapshots.older, snapshots.newer, clientTime, 'x y z');
  const target = rewound.state.find(e => e.id === targetId);
  // Use target.x, target.y, target.z for hit check
}
```

This adds proper lag compensation — high-latency players can still land hits if they were aimed correctly at their render time.

### 5.2 Vault sizing

Server vault: `SI.vault.setMaxSize(300)` — 10 seconds at 30 FPS. Enough to compensate up to ~500ms latency (round-trip) with generous margin.

---

## Phase 6: typed-array-buffer-schema Integration

### 6.1 Schema for snapshots

The snapshot schema defined in Phase 1 encodes the full player state array into a compact binary format. Key savings:

- Player ID: 12 bytes (fixed string) vs variable-length JSON key
- Position x/y/z: 2 bytes each (int16 with digits:1) vs 4-8 bytes JSON number
- Booleans: 1 byte for 7 flags vs 5+ bytes each ("true"/"false")
- No key names in binary vs repeated key strings in JSON

**Estimated per-player:** ~40 bytes (schema) vs ~200 bytes (JSON) = **80% reduction**

### 6.2 Encode/decode in transport layer

For **WS transport**: encode snapshots with schema, send as binary ArrayBuffer. WS handles ArrayBuffer natively.

For **geckos transport**: since geckos can't handle raw binary in emit, we have two options:
1. Pass raw objects (current approach) — no schema benefit on geckos
2. Base64-encode the ArrayBuffer into a string field — adds ~33% overhead, partially negating the win

**Recommendation:** Use schema encoding on WS only. Geckos passes raw objects. The schema benefit is primarily on WS which carries the majority of players (geckos/WebRTC is the secondary transport). We can revisit if geckos adds native binary emit support.

### 6.3 Alternative: bypass geckos emit, use raw data channel

If we want binary on geckos too, we could bypass the library's emit/on system and write directly to the underlying RTCDataChannel. This is fragile and couples us to geckos internals. Not recommended for v1.

---

## Implementation Order

| Step | Description | Files | Risk | Test |
|---|---|---|---|---|
| **1** | Install deps, create `shared/schemas.js` | `package.json`, `shared/schemas.js` | None | Import works |
| **2** | Server SI instance + snapshot creation | `server/game.js` | Low | Snapshots logged correctly |
| **3** | Client SI instance + `snapshot.add()` in tick handler | `client/message-handlers.js` | Low | Vault populates |
| **4** | Replace `client/interp.js` with `SI.calcInterpolation()` | `client/index.js`, `client/entities.js`, delete `client/interp.js` | **Medium** | Remote players move smoothly |
| **5** | Rewrite `client/prediction.js` — vault + gradual correction | `client/prediction.js` | **High** | Local player responsive, no rubber-band |
| **6** | Remove inputAck system | `server/game.js`, `client/message-handlers.js` | Medium | No regression in feel |
| **7** | Server lag compensation via vault rewind | `server/combat.js` | Medium | Hits register correctly at high latency |
| **8** | typed-array-buffer-schema encoding on WS | `server/transports/ws.js`, `client/transports/ws.js`, `shared/schemas.js` | Low | Binary ticks decode correctly |
| **9** | Simplify + cleanup dead code | All touched files | Low | Tests pass, bundle size check |

Steps 1-3 are safe and can be verified incrementally. Step 4-5 are the high-risk changes — remote interpolation and local prediction. Step 5 is the riskiest because the feel of local movement is the most sensitive part of the game.

---

## Rollback Plan

Keep the current `client/prediction.js` and `client/interp.js` as `*.bak` files during development. If the SI-based approach feels worse, we can revert to Bernier replay by restoring those files and re-enabling inputAck.

The branch (`snapshot-interpolation`) isolates all changes from master.

---

## Open Questions

1. **Gradual correction feel**: The SI example uses divisor 60 (moving) / 180 (still) for correction speed. These will need tuning. Too fast = jittery, too slow = visible drift. Our current system's snap+replay is more aggressive but also more correct.

2. **Z-axis (jumping)**: Gradual correction on Z during jumps might feel floaty. May need to snap Z when `onGround` transitions, or use a faster correction rate for vertical.

3. **Spawn/teleport**: When a player respawns or teleports, gradual correction would slowly drift them to the new position instead of teleporting. Need a "hard snap" threshold (similar to current `ERR_INSTANT_SNAP = 40`).

4. **Determinism**: The current system guarantees client and server run the same physics with the same inputs (shared/movement.js). The SI approach relaxes this — the server is authoritative and the client gradually corrects. This is simpler but less precise.

5. **Server snapshot size**: With 16 players, each snapshot is ~640 bytes (schema) to ~3.2 KB (JSON). At 30 FPS, that's 19-96 KB/s. The vault stores 300 snapshots (10s) = 192 KB - 960 KB memory. Manageable.
