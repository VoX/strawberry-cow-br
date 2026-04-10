# Networking Tech Plan — Implementation Guide

## Proposal 1: Jump Through Move Queue

### Goal
Eliminate the root cause of jump rubber-banding by processing jump messages at the same cadence as movement, so client prediction and server integration stay in lockstep.

### Current flow
```
Client: keydown Space → send({type:'jump'}) + predictJump()
Server: dispatch.js receives 'jump' → immediately sets p.vz=230, p.onGround=false
Server: gameTick drains move queue → integrates movement with the jump already applied
```
Problem: the jump applies at message-receipt time, not at queue-drain time. If 2 moves are queued ahead of the jump, the server integrates 2 ticks of gravity before the client expects it.

### Proposed flow
```
Client: keydown Space → enqueue {type:'jump', seq} into the same send path as moves
Server: dispatch.js enqueues jump into p._moveQueue as {seq, jump:true, dx:0, dy:0, ...}
Server: gameTick drain loop checks for jump flag → applies vz=230 + onGround=false at drain time
```

### Files changed
| File | Change |
|------|--------|
| `client/input.js` | Send jump as a move-like message with seq: `send({type:'move', seq:++S.inputSeq, dx:0, dy:0, jump:true})` |
| `client/prediction.js` | predictStep handles jump flag in the input — applies vz before integration |
| `server/dispatch.js` | Remove the standalone `if (msg.type === 'jump')` handler. Jump rides the existing move enqueue path. |
| `server/game.js` | gameTick drain: check `m.jump` flag on dequeued move → apply `p.vz = JUMP_VZ; p.onGround = false` |
| `client/prediction.js` | Remove the airborne Z-skip from reconciliation (no longer needed) |
| `shared/constants.js` | Add `'jump'` context to STATEFUL_INPUT_TYPES docs (seq now covers jump) |

### Risk
- **seq continuity**: jump now consumes a seq number. The prediction ring must store the jump state so replay works. Each ring entry already stores `{state, input}` — add `jump:true` to the input snapshot.
- **double-jump guard**: server currently checks `player.onGround` at receipt time. With queue drain, it checks at drain time — which is correct because the previous move may have landed the player. No change needed.
- **mobile jump button**: same path — just sends the move+jump message.

### Test plan
1. Jump while standing still — should feel identical to current
2. Jump while strafing — no Z rubber-band on ack
3. Rapid jump spam (bunny hop) — each jump should land cleanly
4. Jump during high-latency (add artificial 200ms delay) — verify no snap-back
5. Run `npm test` — movement characterization tests must pass

---

## Proposal 2: Delta Compression on Tick Broadcast

### Goal
Reduce tick bandwidth by 60-80% by only sending fields that changed since the last tick per player.

### Current flow
```
gameTick → getPlayerTicks() returns full 20-field object per player
→ broadcast to all clients every tick (30 Hz)
```

### Proposed flow
```
gameTick → getPlayerTickDeltas(prevTicks) returns only changed fields per player
→ broadcast deltas; client merges into existing serverPlayers via Object.assign
→ store current tick as prevTicks for next comparison
```

### Files changed
| File | Change |
|------|--------|
| `server/player.js` | New `getPlayerTickDeltas(prevMap)` function. For each player, compare current tick fields against `prevMap[id]`. Return only fields that differ. Always include `id`. |
| `server/game.js` | Store `_prevTickState = new Map()` module-level. After building tick payload, cache current state. Pass prev to `getPlayerTickDeltas()`. |
| `client/message-handlers.js` | No change needed — tick handler already does `Object.assign(existing, t)` which handles partial objects correctly. |

### Delta logic (server/player.js)
```js
function getPlayerTickDeltas(prevMap) {
  const arr = [];
  for (const [, p] of gameState.getPlayers()) {
    if (p.corpseReaped) continue;
    const cur = getPlayerTick(p);
    const prev = prevMap.get(p.id);
    if (!prev) { arr.push(cur); continue; } // new player, send full
    const delta = { id: p.id };
    let changed = false;
    for (const key of Object.keys(cur)) {
      if (key === 'id') continue;
      if (cur[key] !== prev[key]) { delta[key] = cur[key]; changed = true; }
    }
    if (changed) arr.push(delta);
    // else: player unchanged, omit entirely
  }
  return arr;
}
```

### Risk
- **First-tick for new joiners**: handled by `spectate`/`start` message which sends full player state.
- **Reconnect**: if a client misses a delta, subsequent deltas apply on top of stale state. The `playerSnapshot` sticky-field messages and periodic full-state via `spectate` on rejoin cover this.
- **Object comparison**: uses strict `!==`. Works for numbers/booleans/strings. The `resources` field (if present) is an object — needs JSON comparison or per-field check. On main branch, resources aren't in the tick, so this isn't an issue yet.

### Expected savings
Typical tick: only x, y, z, aimAngle change (4 of 20 fields). With 16 players:
- Current: 16 × 20 fields = 320 field writes per tick
- Delta: 16 × 4 fields + 16 × id = 80 field writes per tick (75% reduction)
- Players who are standing still: 0 fields (omitted entirely)

---

## Proposal 3: inputAck Rate Increase

### Goal
Reduce the reconciliation window from 167ms (5 ticks) to 33-67ms (1-2 ticks) for snappier hit feedback with the new faster TTK.

### Current flow
```
game.js line 353: if (gameState.getTickNum() % 5 === 0) { ... send inputAck ... }
```

### Proposed change
```js
// Send every 2nd tick (15 Hz) instead of every 5th (6 Hz)
if (gameState.getTickNum() % 2 === 0) { ... }
```

### Files changed
| File | Change |
|------|--------|
| `server/game.js` | Change `% 5` to `% 2` on the ack broadcast gate (one line) |

### Bandwidth impact
- Current: 6 acks/sec × ~80 bytes × 16 players = 7.7 KB/s
- Proposed: 15 acks/sec × ~80 bytes × 16 players = 19.2 KB/s
- Delta: +11.5 KB/s total server upstream. Negligible.

### Risk
- None. Client already handles acks at any rate. The reconciliation code processes each ack independently — more acks = more frequent corrections = smoother prediction.
- The prediction ring is sized at 60 entries (2 seconds at 30 Hz). At 15 Hz ack rate, the ring holds 4 seconds of un-acked inputs — still plenty of runway.

---

## Proposal 4: Targeted Broadcasts Audit

### Goal
Replace remaining `broadcast()` calls with `sendTo()` where only one client uses the message.

### Audit results

| Message type | Current | Handler behavior | Fix |
|---|---|---|---|
| `emptyMag` | `sendTo` (already fixed) | — | Done |
| `reloaded` | `sendTo` (already fixed) | — | Done |
| `shellLoaded` | `sendTo` (already fixed) | — | Done |
| `levelup` | `sendTo` | — | Already correct |
| `kill` | `broadcast` | All clients show kill feed | Keep broadcast (intentional) |
| `weaponDrop` | `broadcast` | All clients show "X dropped weapon" | Keep broadcast |
| `weaponPickup` | `broadcast` | All clients show "X picked up Y" | Keep broadcast |
| `dash` | `broadcast` | All clients see dash visual | Keep broadcast |
| `barricadePlaced` | `broadcast` | All clients need the barricade data | Keep broadcast |
| `playerSnapshot` | `broadcast` | All clients need weapon/perk updates | Keep broadcast |
| `mooTaunt` | `broadcast` | All clients hear + see the moo | Keep broadcast |
| `meleeSwing` | `broadcast` | All clients hear the swing | Keep broadcast |
| `meleeHit` | `broadcast` | All clients see/hear the hit | Keep broadcast |

### Conclusion
The major single-client messages (`reloaded`, `shellLoaded`, `emptyMag`) are already fixed. The remaining broadcasts are legitimately needed by all clients. **No further changes needed.** This proposal is complete.

---

## Implementation order
1. **Proposal 3** (ack rate) — one-line change, zero risk, immediate benefit
2. **Proposal 2** (delta compression) — medium effort, big bandwidth win
3. **Proposal 1** (jump queue) — highest effort, fixes root cause of a visual glitch
4. **Proposal 4** — already done, no further work
