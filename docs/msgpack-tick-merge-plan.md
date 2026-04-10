# MessagePack Binary Ticks + State Merge Plan

## Goal

1. Use MessagePack binary encoding for ALL unreliable messages on BOTH transports (WS + geckos via `channel.raw.emit()`)
2. Merge `playerSnapshot` and `serverStatus` into the tick broadcast — eliminate separate messages
3. Evaluate other merge candidates

## Part 1: MessagePack on geckos unreliable path

### Current state
- **WS**: already uses msgpack for everything (encode on send, decode on receive)
- **geckos**: plain objects everywhere (geckos JSON-serializes internally)

### Change: use `channel.raw.emit()` for unreliable sends

geckos.io has a `raw` API that bypasses JSON serialization:
```js
channel.raw.emit(buffer)  // sends raw binary via data channel
```
On receive, the client listens via `channel.onRaw(data => ...)` which delivers the raw ArrayBuffer/Uint8Array.

**Server geckos transport — unreliable send:**
```js
const { encode } = require('@msgpack/msgpack');

function sendUnreliable(channel, msg) {
  if (!channel) return;
  try { channel.raw.emit(encode(msg)); } catch (e) {}
}
```

**Client geckos transport — receive:**
```js
// Regular event messages (reliable, plain objects)
_channel.on(MSG_EVENT, data => { onMessage(data); });

// Raw binary messages (unreliable ticks, msgpack)
_channel.onRaw(data => {
  const msg = decode(data instanceof ArrayBuffer ? new Uint8Array(data) : data);
  onMessage(msg);
});
```

**Reliable sends stay as plain objects** — geckos' retry envelope requires JSON-serializable data.

### Bandwidth impact

msgpack is ~35% smaller than JSON for our tick payloads (benchmark showed 3,266 vs 5,003 bytes at 16 players). At 30Hz × 16 players:
- JSON: 146.6 KB/s
- msgpack: 95.7 KB/s
- Savings: ~51 KB/s (34%)

### Latency impact

msgpack encode is 2.2x slower than JSON.stringify, but at 0.049ms per encode (16 players) the absolute cost is negligible — 0.15% of the 33ms tick budget.

## Part 2: Merge playerSnapshot into tick

### What playerSnapshot carries

The "sticky" fields not in the current tick:
```
name, color, weapon, dualWield, sizeMult, speedMult,
recoilMult, extMagMult, xpToNext, personality
```

### Change: include sticky fields in every tick

Merge `getPlayerTick()` and `getPlayerSnapshot()` into a single `getPlayerFullTick()` that includes everything:

```js
function getPlayerFullTick(p) {
  const perks = p.perks || {};
  return {
    id: p.id, x: p.x, y: p.y, z: p.z, dir: p.dir,
    hunger: p.hunger, score: p.score, alive: p.alive, eating: p.eating,
    foodEaten: p.foodEaten, level: p.level || 0, xp: p.xp || 0,
    armor: p.armor || 0, kills: p.kills || 0, stunTimer: p.stunTimer || 0,
    aimAngle: p.aimAngle || 0,
    dashCooldown: p.dashCooldown || 0, attackCooldown: p.attackCooldown || 0,
    spawnProt: p.spawnProtection > 0,
    ammo: p.ammo !== undefined ? p.ammo : -1, reloading: p.reloading > 0,
    crouching: !!p.walking,
    // Sticky fields (previously only in playerSnapshot):
    name: p.name, color: p.color, weapon: p.weapon || 'normal',
    dualWield: !!p.dualWield,
    sizeMult: perks.sizeMult || 1, speedMult: perks.speedMult || 1,
    recoilMult: p.recoilMult || 1, extMagMult: p.extMagMult || 1,
    xpToNext: p.xpToNext || 50,
    personality: p.personality || null,
  };
}
```

### What gets removed

1. **`broadcastPlayerSnapshot(p)`** — delete the function entirely
2. **All 7 call sites** that invoke it:
   - `server/weapons.js:46` (weapon pickup)
   - `server/weapons.js:84` (weapon drop with stashed)
   - `server/weapons.js:104` (weapon drop)
   - `server/perks.js:68` (perk applied)
   - `server/weapon-fire.js:411` (cowtank post-fire)
   - `server/dispatch.js:271` (switch to knife)
   - `server/dispatch.js:276` (switch to primary)
3. **`playerSnapshot` message type** — remove from `shared/messages.js::S2C`
4. **`playerSnapshot` handler** in `client/message-handlers.js`
5. **`getPlayerSnapshot()`** in `server/player.js` — only `getPlayerFullTick()` remains

### Client-side impact

The tick handler's `Object.assign(existing, t)` merge already handles all fields — sticky fields just arrive every tick now instead of on-event. No client code changes needed beyond removing the dead `playerSnapshot` handler.

The `start`/`spectate` full-state messages can use the same `getPlayerFullTick()` via `getPlayerStates()`.

### Size impact with msgpack

Adding ~10 sticky fields per player adds roughly 80-100 bytes per player in JSON, ~50-60 bytes in msgpack (strings compress well — key names are shorter, string values are length-prefixed instead of quoted).

At 16 players + 30Hz:
- Current msgpack tick-only: ~95.7 KB/s
- Estimated msgpack full-tick: ~125 KB/s
- Still 15% less than current JSON tick-only (146.6 KB/s)

## Part 3: Merge serverStatus into tick

### What serverStatus carries

```js
{ type: 'serverStatus', gameState: phase, alive: n, total: n, debugScene: bool }
```

### Change: add these 4 fields to the tick payload

```js
const tickPayload = {
  type: 'tick',
  tickNum, snapshot, zone, gameTime,
  // Merged from serverStatus:
  phase: lobbyState.getPhase(),
  alive: countAlive(),
  total: countTotal(),
  debugScene: gameState.isDebugScene(),
};
```

### What gets removed

1. **`broadcast(buildServerStatus())`** — 4 call sites in game.js, player.js, dispatch.js, game-fsm.js
2. **`serverStatus` message type** — remove from S2C
3. **`serverStatus` handler** in client — merge into tick handler
4. **`buildServerStatus()`** function in player.js — inline the 4 fields

### Size impact

+4 fields (~30 bytes JSON, ~20 bytes msgpack). Negligible.

## Part 4: Other merge candidates

### Good candidates (recommend merging)

**`weaponPickup` / `weaponDrop`** — These broadcast `{playerId, name, weapon, dualWield}` which are now redundant with full-tick data. The client uses them for kill-feed-style "X picked up Y" messages. Could merge by:
- Adding a `lastPickup` or `weaponEvent` field to the player tick
- Client detects weapon changes by comparing previous tick state

**Verdict:** nice-to-have but adds complexity to change detection on the client. Keep for now.

### Bad candidates (keep separate)

| Message | Why keep separate |
|---------|-------------------|
| `projectile` | Spawns a visual entity — needs exact position/velocity at spawn time, not next-tick approximation |
| `projectileHit` | Triggers hit visual/sound at exact impact position |
| `explosion` | Same — exact position for visual |
| `kill` / `eliminated` | Kill feed text, death visual — event-driven UI |
| `eat` | Food pickup visual/sound at exact food position |
| `barricadePlaced/Hit/Destroyed` | Entity lifecycle — needs exact timing for create/destroy |
| `wallImpact/Damaged/Destroyed` | Same |
| `chat` | Text content, not state |
| `dash` / `mooTaunt` / `meleeSwing` / `meleeHit` | Visual/audio effects at exact positions |
| `reloaded` / `shellLoaded` / `emptyMag` | sendTo (not broadcast), UI feedback |

These are all one-shot events that need reliable delivery and exact timing. Stuffing them into unreliable ticks would mean dropped events = missing kill feed, missing explosion visuals, silent shots.

## Implementation order

1. **Merge playerSnapshot into tick** — biggest simplification win, removes 7 call sites + 1 message type
2. **Merge serverStatus into tick** — trivial, 4 fields
3. **msgpack on geckos unreliable via raw.emit** — bandwidth win on WebRTC path
4. **Test** — verify no stale state bugs, verify geckos binary works

## Files changed

| File | Change |
|------|--------|
| `server/player.js` | Replace `getPlayerTick` + `getPlayerSnapshot` with `getPlayerFullTick`. Delete `broadcastPlayerSnapshot`. Inline `buildServerStatus` fields. |
| `server/game.js` | Add phase/alive/total/debugScene to tick payload. Remove `broadcast(buildServerStatus())` calls. |
| `server/game-fsm.js` | Remove `broadcast(buildServerStatus())` calls. |
| `server/dispatch.js` | Remove `broadcastPlayerSnapshot` calls. Remove `broadcast(buildServerStatus())`. |
| `server/weapons.js` | Remove `broadcastPlayerSnapshot` calls. |
| `server/perks.js` | Remove `broadcastPlayerSnapshot` call. |
| `server/weapon-fire.js` | Remove `broadcastPlayerSnapshot` call. |
| `server/combat.js` | Remove `broadcastPlayerSnapshot` import. |
| `server/bots.js` | Remove `broadcastPlayerSnapshot` import. |
| `server/transports/geckos.js` | Use `channel.raw.emit(encode(msg))` for unreliable. |
| `client/transports/geckos.js` | Add `channel.onRaw()` handler for binary ticks. |
| `client/message-handlers.js` | Remove `playerSnapshot` and `serverStatus` handlers. Merge their logic into `tick`. |
| `shared/messages.js` | Remove `playerSnapshot` and `serverStatus` from S2C. |
