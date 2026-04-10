# Per-Client Ack-Based Delta Compression Plan

## Goal

Replace the current "full state every tick" broadcast with CS-style per-client delta compression. Each client only receives fields that changed since the last snapshot they acknowledged. Unreliable delivery — lost packets just mean the next delta is computed against an older baseline.

## How CS does it (simplified for our use case)

1. Server maintains a **per-client snapshot history** (ring of N recent snapshots).
2. Each outgoing tick packet includes a **sequence number**.
3. Client's next inbound message includes the **last sequence it received** (ack).
4. Server finds the acked snapshot in the ring and **deltas the current state against it**.
5. Only changed fields are sent, each with a 1-bit "changed" flag.
6. If the acked snapshot expired from the ring (or client never acked), send a **full keyframe**.

## Why our previous attempt failed

We tried delta compression on the unreliable tick path and reverted it. The problem: we computed deltas against the **previous tick** (not the last acked tick). When a UDP packet was lost, the client never received the baseline the delta was computed against — so the delta applied on top of stale state, causing permanent field corruption (bots flashing, players stuck).

**The fix**: delta against the last **acked** baseline, not the previous tick. If the client lost packets 51-54, the server knows (because the client's ack is still at 50) and computes snapshot 55's delta against snapshot 50. All changes since 50 are included — nothing is lost.

## Architecture

### Per-client state (server)

```js
// On player object (or transport ref):
player._snapshotRing = new Array(32);  // circular buffer
player._snapshotSeq = 0;               // next sequence to assign
player._lastAckedSnapshotSeq = -1;     // last seq client confirmed
player._ringHead = 0;                  // write pointer
```

### Tick broadcast flow

```
gameTick() builds current full state (getPlayerTicks())
                    ↓
for each human player:
  1. Look up their acked baseline from _snapshotRing
  2. If no baseline found → send full keyframe
  3. If baseline found → compute delta (changed fields only)
  4. Store current full state in ring at current seq
  5. Send: { type:'tick', seq, delta: [...], zone, gameTime }
                    ↓
client receives, applies delta on top of cached state
client includes lastRecvSeq in next outbound message (move/attack/etc.)
```

### Delta encoding format

For each player entity in the tick:

```js
// Full state (keyframe):
{ id: 1, x: 100, y: 200, z: 5, hunger: 80, weapon: 'ak', ... }

// Delta (only changed fields):
{ id: 1, x: 105, y: 203 }
// Fields not listed → unchanged from baseline

// New player (not in baseline):
{ id: 7, _full: true, x: 50, y: 50, ... }  // full state for this entity

// Removed player (in baseline but not current):
// Omitted from delta array → client drops them
```

### Client-side merge

```js
// Maintain cached full state per player
const _cachedState = new Map();  // id → full player object

function applyDelta(delta, isKeyframe) {
  const seen = new Set();
  for (const d of delta) {
    seen.add(d.id);
    if (isKeyframe || d._full) {
      _cachedState.set(d.id, d);
    } else {
      const cached = _cachedState.get(d.id);
      if (cached) Object.assign(cached, d);
      else _cachedState.set(d.id, d);  // fallback: treat as full
    }
  }
  // Remove players not in this tick
  for (const id of _cachedState.keys()) {
    if (!seen.has(id)) _cachedState.delete(id);
  }
}
```

### Ack piggybacking

The client already sends `move` messages at 30Hz. Piggyback the snapshot ack:

```js
// client/network.js send()
if (STATEFUL_INPUT_TYPES.has(m.type)) {
  m.seq = ++S.inputSeq;
  m.ackSnap = S.lastRecvSnapshotSeq;  // piggyback the ack
}
```

Server reads `msg.ackSnap` in the move handler and updates `player._lastAckedSnapshotSeq`.

No extra ack messages needed — the ack rides on the existing C2S traffic.

### Delta computation (server)

```js
function computeDelta(current, baseline) {
  const delta = [];
  const baseById = new Map();
  for (const p of baseline) baseById.set(p.id, p);

  for (const p of current) {
    const base = baseById.get(p.id);
    if (!base) {
      // New player — send full state
      delta.push({ ...p, _full: true });
      continue;
    }
    // Compare field by field
    const d = { id: p.id };
    let changed = false;
    for (const key of Object.keys(p)) {
      if (key === 'id') continue;
      if (p[key] !== base[key]) {
        d[key] = p[key];
        changed = true;
      }
    }
    if (changed) delta.push(d);
    // else: completely unchanged, omit entirely
  }
  return delta;
}
```

### Ring management

```js
const RING_SIZE = 32;  // ~1 second at 30Hz

function storeSnapshot(player, seq, fullState) {
  const idx = seq % RING_SIZE;
  player._snapshotRing[idx] = { seq, state: fullState };
}

function getBaseline(player) {
  const acked = player._lastAckedSnapshotSeq;
  if (acked < 0) return null;  // never acked → keyframe
  const idx = acked % RING_SIZE;
  const entry = player._snapshotRing[idx];
  if (!entry || entry.seq !== acked) return null;  // expired → keyframe
  return entry.state;
}
```

## Bandwidth savings estimate

With 16 players, a typical tick has ~3-4 players moving (x/y/z/aimAngle change) while the rest are idle. Standing players have zero changed fields and are omitted entirely.

| Scenario | Full state (msgpack) | Delta (msgpack) | Savings |
|----------|---------------------|-----------------|---------|
| 16 players, all moving | ~3.2 KB | ~1.5 KB | 53% |
| 16 players, 4 moving | ~3.2 KB | ~0.4 KB | 87% |
| 16 players, all idle | ~3.2 KB | ~0.05 KB | 98% |

The biggest win is when players are mostly stationary (lobby, sniping, dead). The worst case (everyone moving) still saves ~50% because only x/y/z/aimAngle change — the other ~20 fields (name, color, weapon, hunger, etc.) are stable.

## Interaction with SI

The SI library's `snapshot.add()` expects a full snapshot every time. After delta merge on the client, we feed the reconstructed full state into SI:

```js
// After applying delta:
const fullState = Array.from(_cachedState.values());
const snapshot = { id: msg.snapId, time: msg.snapTime, state: fullState };
SI.snapshot.add(snapshot);  // feed full reconstructed state to SI
```

SI never sees deltas — it always gets complete snapshots.

## Implementation steps

| Step | Description | Risk |
|------|-------------|------|
| 1 | Add per-client `_snapshotRing`, `_snapshotSeq`, `_lastAckedSnapshotSeq` to player | None |
| 2 | Piggyback `ackSnap` on move messages (client send + server read) | Low |
| 3 | Server: compute delta per client, store current in ring | Medium |
| 4 | Server: send delta or keyframe based on ack state | Medium |
| 5 | Client: maintain `_cachedState`, apply deltas, feed full state to SI | Medium |
| 6 | Handle edge cases: player join mid-round (keyframe), disconnect (clear ring) | Low |
| 7 | Measure: log delta sizes vs full state sizes | None |

## Edge cases

- **First tick after join**: no ack yet → keyframe (full state).
- **Client stops sending moves** (dead, spectating): no ack piggybacking. Server's ring will expire their baseline after ~1 second → falls back to keyframes. Acceptable — dead/spectating players are low priority.
- **Ack arrives for expired seq**: ring wrapped past it → keyframe next tick.
- **Player joins mid-round**: new entity not in any baseline → `_full: true` flag on first delta.
- **msgpack encoding**: deltas are just plain objects with fewer fields. msgpack handles them identically to full state — no special encoding needed.

## What stays the same

- inputAck for prediction reconciliation — separate system, unrelated to snapshot acks
- SI for remote player interpolation — fed with reconstructed full state
- SI vault for lag compensation — server still does `SI.vault.add(fullSnapshot)` every tick
- Reliable event messages — unaffected, still broadcast/sendTo as-is

## Files changed

| File | Change |
|------|--------|
| `server/game.js` | Per-client delta computation + ring storage in tick broadcast |
| `server/dispatch.js` | Read `msg.ackSnap` from move messages, update `_lastAckedSnapshotSeq` |
| `client/network.js` | Piggyback `ackSnap` on move sends |
| `client/message-handlers.js` | Delta merge in tick handler, feed reconstructed state to SI |
| `client/state.js` | Add `lastRecvSnapshotSeq` |
