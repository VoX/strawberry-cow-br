# Strawberry Cow Netcode

How the client and server talk to each other. Covers transport, prediction, interpolation, reconciliation, the tick/snapshot split, and how to add new features that play nicely with the netcode.

## Architecture summary

- **Dual transport**: WebSocket (TCP, reliable) + geckos.io WebRTC data channels (UDP, unreliable). Client auto-selects geckos, falls back to WS if UDP is blocked.
- **Authority**: 100% server-authoritative. The client sends inputs (dx/dy/aim), never positions.
- **Tick rate**: 30 Hz (`server/config.js::TICK_RATE = 30`).
- **Local player**: client-side prediction with seq-based Bernier reconciliation. Zero-latency response to WASD; server corrections absorbed by a 150ms render-offset smoother.
- **Remote players**: snapshot interpolation via `@geckos.io/snapshot-interpolation`. Renders 100ms in the past with smooth lerp between server snapshots.
- **Encoding**: WS uses MessagePack binary. Geckos uses geckos.io's internal JSON serialization (raw binary doesn't survive the library's emit API).
- **Two-channel broadcast**: mutable state via 30Hz `tick` messages; sticky fields via event-driven `playerSnapshot` messages.

## Transport layer

### Dual transport design

Both WebSocket and geckos.io (WebRTC) transports run simultaneously. `server/transport.js` is a facade that routes per-peer `sendReliable`/`sendUnreliable` calls to the correct transport via a `WeakMap<ref, impl>`.

**WebSocket** (`server/transports/ws.js`, `client/transports/ws.js`):
- Reliable TCP. Both reliable and unreliable sends go through `ws.send()`.
- MessagePack binary encoding for all messages (`@msgpack/msgpack`).
- `perMessageDeflate: false` — latency > bandwidth for a 30Hz action game.
- `maxPayload: 16KB`, `setNoDelay(true)`, kernel keepalive at 10s.
- 5-second WebSocket-level heartbeat (ping/pong) catches frozen tabs.

**geckos.io** (`server/transports/geckos.js`, `client/transports/geckos.js`):
- WebRTC data channels. Unreliable sends are fire-and-forget UDP.
- Reliable sends use geckos' built-in retry mechanism (`{reliable: true, interval: 150, runs: 10}`).
- All messages pass as plain JS objects — geckos.io's emit API doesn't handle raw binary (Uint8Array) correctly. The library JSON-serializes payloads internally for its retry/dedup envelope.
- Signaling rides HTTP through Caddy reverse proxy at `/.wrtc/v2/`.

**Client auto-fallback** (`client/network.js`): tries geckos first. If no message arrives before the geckos channel fires `onClose`, switches to WS transparently.

### Reliability routing

`server/network.js` routes each message type:
- **Unreliable** (`UNRELIABLE_TYPES = Set(['tick'])`): dropped under backpressure, next tick supersedes. On geckos this is true UDP fire-and-forget.
- **Reliable**: everything else (events, acks, lobby messages). On geckos, retransmitted by the library.

### Rate limiting

`server/transports/ws.js::checkRate` — per-connection, per-type token buckets. 10 consecutive violations = socket close (code 1008). Unknown types pass through.

## Client-side prediction (local player)

### How it works

`client/prediction.js` implements Source/CS-style prediction:

1. **Fixed timestep** at 30Hz (`TICK_DT = 1/30`). The render loop accumulates frame time; the predict loop runs 0-2 steps per render frame.
2. **Send and predict are lockstep.** Each fixed step: send a `move` message (which increments `S.inputSeq`), then run `stepPlayerMovement()` on `S.mePredicted`, then push `{seq, state, input}` onto the prediction ring.
3. **Shared movement function** (`shared/movement.js::stepPlayerMovement`): identical code runs on both client and server. This is the load-bearing invariant — if client and server diverge, you get rubber-banding.
4. **Sub-tick interpolation**: `getRenderedPredicted()` lerps between the previous and current predicted position based on the accumulator fraction, so 60fps rendering doesn't show the 30Hz step cadence.

### Reconciliation

When the server sends an `inputAck` (15Hz, every 2nd tick):

1. **Find the ring entry** matching the acked seq (FIRST match — server snapshot is captured on the first tick that integrates each new `lastInputSeq`).
2. **Compare** predicted position vs server position. If drift <= `RECONCILE_EPSILON` (1.0 units), prediction matched — drop confirmed entries, done.
3. **If divergent**: snap `S.mePredicted` to server state, drop confirmed entries, **replay all remaining ring entries** using their stored inputs. This is Bernier's design.
4. **Render smoother**: the pre-snap → post-replay camera delta goes into `errX/Y/Z`, which decays linearly over 150ms (`ERR_LINEAR_TIME`). Camera reads `mePredicted + renderOffset`, so the logical position jumps instantly but the camera glides.
5. **Hard snap** (>40 units): teleport/respawn, skip the smoother.

### Key invariants

- `STATEFUL_INPUT_TYPES = Set(['move'])`. Only moves get seq numbers. Adding seq to attack/jump would create gaps the server can't match.
- `stunTimer` and `spawnProtection` are server-only — synced via the tick handler. The client can't predict getting hit.
- The prediction ring holds 60 entries (2 seconds at 30Hz).

## Remote player interpolation

### Snapshot interpolation (`@geckos.io/snapshot-interpolation`)

`client/snapshot.js` wraps the SI library for remote entity rendering:

1. **Server creates SI snapshots** in `gameTick()`: `SI.snapshot.create(getPlayerTicks())` wraps the player state array in a timestamped envelope. Stored in `SI.vault` for future lag compensation.
2. **Client feeds snapshots** via `addSnapshot(msg.snapshot)` in the tick handler.
3. **Once per frame**, `updateInterpolation(frameId)` calls `SI.calcInterpolation('x y z aimAngle(rad)')`. This finds two server snapshots bracketing `now - timeOffset - interpolationBuffer` and lerps between them.
4. **Per-entity lookup**: `getInterpolatedEntity(p)` scans the cached result for a matching `id`. Falls back to raw tick position if SI doesn't have enough data yet.

The interpolation buffer is `(1000/30) * 3 = 100ms` — remote entities render 100ms in the past for smooth motion. This trades display latency for perfectly smooth interpolation instead of 30Hz step-jitter.

### Why SI for remotes but not local player

We tried using SI for local player reconciliation. It doesn't work:

- **SI has no built-in prediction or reconciliation** — despite the README claiming it. The library is purely an interpolation tool.
- **Time-based matching is fuzzy.** The server position is always 1-2 ticks behind the client's prediction due to latency. The time-based approach can't match specific inputs like seq numbers can.
- **Gradual correction causes visible jitter** on direction changes. The old render-offset smoother + instant snap is visually superior.

## Server tick broadcast

### Tick structure

```js
{
  type: 'tick',
  tickNum: number,
  snapshot: { id, time, state: [...players] },  // SI snapshot
  zone: { x, y, w, h },
  gameTime: number
}
```

The `snapshot` field is an SI-format timestamped envelope. `state` contains `getPlayerTick()` output for each alive/spectatable player — mutable fields only (position, aim, hunger, ammo, cooldowns, etc.).

### inputAck (15 Hz)

Every 2nd tick, the server sends each human player their ack:

```js
{
  type: 'inputAck',
  seq: lastAppliedSeq,
  x, y, z, vz, onGround,
  stunTimer, spawnProt
}
```

The position is captured **on the first tick that integrates each new seq** — not the latest position. This matches the client's first ring entry for that seq, ensuring 1:1 comparison.

### Move queue

Client moves are enqueued in `player._moveQueue[]` (capped at 6). `gameTick` drains ONE move per tick per player — 1:1 with the client's predict step. This ensures the server integrates the same number of steps as the client predicted.

Jump is deferred via `_pendingJump` flag — applied at drain time, not receipt time, so it's in sync with the prediction cadence.

## Adding new features — netcode checklist

### New server → client message

1. Add the type to `shared/messages.js::S2C`.
2. Add a handler in `client/message-handlers.js`.
3. Decide reliability: if it's a one-shot event (kill, explosion, pickup), it goes reliable (default). If it's superseded by the next one, add to `UNRELIABLE_TYPES` in `server/network.js`.

### New client → server message

1. Add the type to `shared/messages.js::C2S`.
2. Add a handler in `server/dispatch.js`.
3. Add a rate limit in `server/transports/ws.js::RATE_LIMITS`.
4. Do NOT add it to `STATEFUL_INPUT_TYPES` unless it needs seq-based reconciliation (almost certainly doesn't).

### New player field

**Mutable (changes every tick)**: add to `server/player.js::getPlayerTick()`. Client automatically receives it via the tick handler's `Object.assign` merge. If you need it for prediction, sync it from the tick handler onto `S.mePredicted`.

**Sticky (changes on events)**: add to `server/player.js::getPlayerSnapshot()`. Call `broadcastPlayerSnapshot(p)` at every mutation site. If you forget, the client stays stale until the next unrelated snapshot event — this is silent and hard to catch.

### New movement mechanic

If it affects `stepPlayerMovement()` (speed, collision, gravity):
- Implement in `shared/movement.js` so both client and server run the same code.
- Any input the mechanic needs must be in the `move` message (dx, dy, walking, speedMult, aim).
- If it needs server-only state (stun, spawn protection), sync that state onto `S.mePredicted` in the tick handler.

If it's server-only (hunger drain, zone damage, food pickup): implement only on the server. The client learns about it via the tick broadcast.

### New visual effect for remote players

If it depends on position (particles at a player's feet, laser dot): use `getInterpolatedEntity(p)` to get the SI-interpolated position, not `p.x/p.y`. The raw tick position is up to 100ms ahead of where the entity visually renders.

## Files

| File | Purpose |
|---|---|
| `shared/movement.js` | Shared movement integrator — runs identically on client + server |
| `shared/messages.js` | S2C + C2S + MSG enums, `assertEnumIntegrity()` |
| `shared/constants.js` | STATEFUL_INPUT_TYPES, weapon stats, game constants |
| `client/prediction.js` | Local player CSP: ring buffer, predict step, reconcile, render smoother |
| `client/snapshot.js` | Remote player interpolation via SI library |
| `client/message-handlers.js` | Handler table (one function per S2C type) |
| `client/network.js` | Transport selection, reconnect, `send()` with seq injection |
| `client/transports/ws.js` | WebSocket transport (msgpack binary) |
| `client/transports/geckos.js` | geckos.io WebRTC transport (plain objects) |
| `server/game.js` | 30Hz tick loop, SI snapshot creation, inputAck broadcast |
| `server/dispatch.js` | C2S message routing, move queue, player creation |
| `server/transport.js` | Transport facade routing to WS/geckos impls |
| `server/transports/ws.js` | WS impl with rate limiting + heartbeat |
| `server/transports/geckos.js` | geckos impl with deferred close for reliable flush |
| `server/network.js` | `broadcast()` + `sendTo()`, reliability routing, backpressure |
| `server/player.js` | `getPlayerTick`, `getPlayerSnapshot`, death/armor/hunger funnels |
