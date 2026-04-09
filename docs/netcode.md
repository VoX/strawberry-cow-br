# Strawberry Cow Netcode

How the client and server talk to each other. Covers the wire protocol, the tick/snapshot split, rate limiting, backpressure, and the server authority model.

## Tl;dr

- **Transport**: raw WebSocket, JSON-encoded, no compression. Single endpoint at `/strawberrycow-fps-ws/`.
- **Authority**: 100% server-authoritative. The client sends inputs, never positions. There is no client-side prediction for movement or combat.
- **Tick rate**: 30 Hz (`server/config.js::TICK_RATE = 30`). One `setInterval(gameTick, 1000/30)` drives the whole simulation.
- **Two-channel broadcast**: every tick ships mutable state via a `tick` message; sticky/rare fields ship via event-driven `playerSnapshot` messages.
- **Backpressure**: slow clients drop `tick` messages instead of queueing them. Nothing else is droppable.
- **Rate limiting**: per-connection, per-message-type token buckets. 10 consecutive violations = socket close.
- **Boot-time safety nets**: message-type enum integrity check on the server, handler coverage check on the client.

## Transport layer

### Server

`server/index.js` creates a single `ws.WebSocketServer` with three non-default knobs:

```js
perMessageDeflate: false,   // latency > bandwidth for a 30 Hz action game
maxPayload: 16 * 1024,      // 16 KB cap — every legit client message is <1 KB
```

Compression is off because `perMessageDeflate` coalesces small frames and adds per-send latency. We measured inchworming at the client traceable to deflate backpressure + Nagle batching. Turning it off is worth the extra bandwidth.

`maxPayload: 16384` hard-caps single messages so a bad actor can't hold memory with megabyte frames before the rate limiter gets a chance to run.

On connect, two more socket knobs get flipped:

```js
ws._socket.setNoDelay(true);           // disable Nagle, flush every send immediately
ws._socket.setKeepAlive(true, 10000);  // kernel-level dead-peer detection
```

Plus a WebSocket-level heartbeat: every 5 seconds (`HEARTBEAT_MS`), the server pings each client. Clients mark `ws.isAlive = true` on pong. Any client that fails to pong between two heartbeats gets terminated. This catches mid-stack stalls (frozen tab, broken intermediary) that look fine to TCP while the websocket is wedged.

### Client

`client/network.js` opens the socket and wires incoming messages into a single handler callback:

```js
S.ws = new WebSocket(proto + '://' + location.host + '/strawberrycow-fps-ws/');
S.ws.onmessage = e => { if (msgHandler) msgHandler(JSON.parse(e.data)); };
```

`client/index.js` registers the dispatch function:

```js
setMessageHandler(msg => {
  const h = handlers[msg.type];
  if (h) h(msg);
});
```

`handlers` is a plain object in `client/message-handlers.js` keyed by message type. One named function per type. No string comparisons, no switch statements, no polymorphic dispatch — just an object lookup per inbound message.

## Wire format

Every frame in either direction is `JSON.stringify(...)` of an object with a `type` field. No binary, no protobuf, no MessagePack. The hot path (`tick`) is small enough (~8 players × ~20 fields) that JSON wins on CPU for the parse/serialize vs. the complexity of a binary codec.

### Message type registry

`shared/messages.js` is the single source of truth for every valid `type` string. It exports three frozen objects:

- **`S2C`** — server → client. 45 types covering gameplay state, entity spawns/despawns, visual effects, lobby events, and admin toggles.
- **`C2S`** — client → server. 16 types covering inputs (`move`, `attack`, `dash`, `jump`), host controls (`toggleBots`, `kick`), lobby actions (`ready`, `setName`), and chat.
- **`MSG`** — `{ ...S2C, ...C2S }` for call sites that don't care about direction.

Two boot-time assertions keep the registry honest:

1. **`assertEnumIntegrity()`** runs inside `server/index.js` before the WebSocket server starts. It walks `MSG` and throws if any value is empty, non-string, or a duplicate. Fail-loud on boot beats shipping a typo.
2. **`assertHandlerCoverage()`** is an IIFE at the bottom of `client/message-handlers.js`. It iterates `Object.values(S2C)` and logs `console.error` for any type that doesn't have a corresponding handler function. Catches stale handlers after a rename.

The enum is also the contract for the rest of this document — if you see a type name below, it's defined in `shared/messages.js`.

## Server → client flow

### The 30 Hz tick loop

`server/game.js::gameTick` runs at 30 Hz via `setInterval(gameTick, 1000/TICK_RATE)`. It does everything: physics, AI, combat, zone damage, food spawns, projectile stepping, death resolution, broadcast. At the end of the tick it ships exactly one `tick` broadcast containing the mutable state of every alive-or-spectating player.

```js
broadcast({
  type: 'tick',
  players: getPlayerTicks(),
  zone: gameState.getZone(),
  gameTime: Math.floor(gameState.getGameTime()),
});
```

### Why tick + snapshot instead of one big "state" broadcast

Previously `gameTick` shipped a single `state` message with the full player shape on every tick: name, color, weapon, perks, level, xp, xpToNext, sizeMult, dualWield, recoilMult, extMagMult, plus all the mutable fields. That was ~120 bytes per player, 30 times per second, per connected client. With 8 players that's ~292 KB/s of upload per active room even though 90% of those bytes never changed between ticks.

The sweep split the broadcast in two:

- **`tick`** — ships only the fields that change on almost every tick: position, velocity-derived aim, hunger, score, ammo, cooldowns, stun timer, spawn-protection flag. `server/player.js::getPlayerTick(p)` builds these.
- **`playerSnapshot`** — ships the full player shape (sticky + mutable). Emitted only when a sticky field actually changes: weapon pickup, weapon drop, perk selection, level up, dual-wield toggle, cowtank single-use auto-drop. `server/player.js::broadcastPlayerSnapshot(p)` is the single entry point; every mutation site calls it.

After the split, the tick payload dropped from ~120 to ~35 bytes per player and the full bandwidth dropped by ~73% (measured: 292 KB/s → 80 KB/s for 8 players).

### Sticky-field discipline

Because sticky fields are not in `tick`, every place in the server code that writes one *must* call `broadcastPlayerSnapshot(p)` before the tick ends, or the client will stay stale until the next unrelated snapshot event. The sweep added this call to:

- `server/weapons.js::handleWeaponPickups` — weapon + dualWield + ammo changed
- `server/weapons.js::handleDropWeapon` — same fields changed
- `server/perks.js::handlePerk` — sizeMult/recoilMult/extMagMult/perks.* changed
- `server/player.js::eliminatePlayer` kill-credit level-up — level/xp/xpToNext changed
- `server/game.js::gameTick` golden-food level-up — same
- `server/combat.js::handleAttack` cowtank post-fire — weapon/dualWield/ammo reset
- `server/bots.js::fireBot` cowtank post-fire — identical to player path

These are the 7 sticky-mutation sites in the codebase. If you add an 8th (e.g. a perk that mutates `p.weapon`), you need to add a snapshot call too. A missing call is silent — the client just looks stale.

### Start / spectate full-state sync

On join, the server sends one of two full-state messages depending on lobby phase:

- **`start`** — fires at round start for players who were in the lobby. Contains terrain seed, every player's full shape, all foods, walls, barricades, weapon pickups, armor pickups, mud patches, heal ponds, portals, shelters, houses, the zone, and the map feature bundle.
- **`spectate`** — identical payload for a mid-round join. Same field set.

Both use `getPlayerStates()` (which calls `getPlayerSnapshot` per alive player), so a fresh client has the exact same full shape it would get from a stream of `playerSnapshot` events.

### Event-driven messages

Everything else is event-driven and ships immediately from the relevant code path. Examples:

- `projectile` — new projectile spawned (from `server/weapon-fire.js` or `server/combat.js::applyExplosion`)
- `projectileHit` — projectile damaged a player (from `server/combat.js`)
- `wallImpact` / `wallDamaged` / `wallDestroyed` — projectile hit a wall (from combat + ballistics)
- `barricadeHit` / `barricadeDestroyed` — projectile or blast hit a barricade
- `explosion` — blast visual + audio trigger
- `eliminated` — player died (hunger, disconnect, or other); carries the rank the victim finished at
- `kill` — killer credit, emitted alongside `eliminated` when the victim had a `lastAttacker`
- `eat` / `food` — food pickups and respawns
- `weaponSpawn` / `weaponDespawn` / `weaponPickup` / `weaponDrop` — weapon pickup lifecycle
- `armorSpawn` / `armorPickup` / `shieldHit` / `shieldBreak` — armor pickup + shield lifecycle
- `chat` — player chat broadcast with name + color + text (120-char cap)
- `cowstrikeWarning` / `cowstrike` — perk ability visual + stun waves
- `levelup` — sent only to the leveling player's socket (via `sendTo`); tells the client to show the perk menu
- `restart` / `winner` — round-end transitions

Every one of these is in `S2C` and has a handler in `client/message-handlers.js`.

## Client → server flow

Client inputs ship as small JSON frames. The active ones:

- **`move`** — `{type, dx, dy, walking}`. Movement intent as a normalized ±1 vector plus a crouch/walk flag. Server clamps and computes `aimAngle` from the vector. Sent by `client/input.js` whenever WASD state changes or every ~16 ms during movement.
- **`attack`** — `{type, fireMode, aimX, aimY, ...}`. Fire request with aim coordinates and burst/auto flag. Server runs `handleAttack` → `fireWeapon` to actually spawn projectiles and deduct ammo.
- **`reload`**, **`dash`**, **`jump`**, **`dropWeapon`** — action triggers, no payload beyond the type.
- **`placeBarricade`** — `{type, aimX, aimY}`. Server validates cooldown and places a barricade at the aim point.
- **`perk`** — `{type, id}`. After the server sent `levelup`, the client shows a perk menu; the player's choice comes back as `perk`.
- **`chat`** — `{type, text}`. 120-char cap enforced server-side.
- **`join`**, **`setName`**, **`ready`** — lobby actions.
- **`kick`**, **`toggleBots`**, **`toggleBotsFreeWill`**, **`toggleNight`** — host-only actions; the server verifies `isHost(player.id)` before acting.

There is no position field in any client message. The client does not send `{x, y}`. It sends *intent* (dx/dy, aim direction, fire mode) and the server simulates the world forward. This is why there is no client-side prediction — without the client running the same simulation the server runs, there's nothing to predict against.

## Rate limiting

`server/index.js::checkRate` implements per-connection, per-message-type token buckets.

```js
const RATE_LIMITS = Object.freeze({
  move: 40, attack: 30, chat: 2, placeBarricade: 5,
  toggleBots: 2, toggleBotsFreeWill: 2, toggleNight: 2,
  ready: 5, kick: 2, setName: 2, perk: 5,
  dash: 10, reload: 5, dropWeapon: 5, jump: 20,
});
```

The rates are tokens-per-second budgets. On every inbound message, `checkRate` refills the bucket based on elapsed time since the last check, then tries to spend 1 token. If the bucket is dry, the message is silently dropped and a violation counter increments. Ten consecutive violations on any single type closes the socket with code 1008 ("rate").

Unknown message types bypass the limiter entirely — this is intentional so adding a new client→server type doesn't require touching this table. If you want an abusable type covered, add it to `RATE_LIMITS`.

Buckets are lazily allocated per `(socket, msgType)` on first touch and live on `ws._rateBuckets`. They die with the socket; no GC pressure.

## Backpressure

`server/network.js::broadcast` has one escape hatch for slow clients:

```js
const BACKPRESSURE_BYTES = 256 * 1024;
const DROPPABLE_TYPES = new Set(['tick']);

function broadcast(data) {
  const msg = JSON.stringify(data);
  const droppable = DROPPABLE_TYPES.has(data && data.type);
  for (const [, p] of gameState.getPlayers()) {
    const ws = p.ws;
    if (!ws || ws.readyState !== 1) continue;
    if (droppable && ws.bufferedAmount > BACKPRESSURE_BYTES) continue;
    ws.send(msg);
  }
}
```

If a client has more than 256 KB buffered (because their connection is stalled and the OS socket buffer is backing up), the server drops subsequent `tick` broadcasts to that one client until the buffer drains. Every other message type (`projectile`, `eliminated`, `kill`, `playerSnapshot`, `weaponPickup`, chat, etc.) is still delivered — those are authoritative one-shot events and missing one breaks the game.

`tick` is uniquely safe to drop because the next tick supersedes it entirely. The client's tick handler merges received fields into the existing cached player state (`Object.assign(existing, t)`) rather than replacing it, so even if two ticks go missing, the third one re-establishes truth. See below.

This is the one place slow clients stop hurting everyone — before the drop guard, a single stalled socket would balloon server memory, delay every other client's shared-serialization step, and eventually OOM the process.

## Client state merging

`client/message-handlers.js::tick` does the merge:

```js
const seen = new Set();
for (const t of msg.players) {
  seen.add(t.id);
  const existing = S.serverPlayers.find(sp => sp.id === t.id);
  if (!existing) continue; // race: no snapshot yet, skip until one arrives
  Object.assign(existing, t);
}
// Drop players the server dropped. Preserves sticky fields on survivors.
for (let i = S.serverPlayers.length - 1; i >= 0; i--) {
  if (!seen.has(S.serverPlayers[i].id)) S.serverPlayers.splice(i, 1);
}
S.me = S.serverPlayers.find(p => p.id === S.myId) || null;
```

Key invariants:

- **Tick messages merge, they do not replace.** If the tick handler replaced entries, sticky fields like `weapon` and `name` would vanish on every tick and reappear on the next snapshot.
- **Unknown ids are skipped, not appended.** A `tick` entry for a player the client doesn't yet have a snapshot for means the player joined mid-round and the `playerSnapshot` hasn't arrived yet. Skipping is safer than pushing a stub missing the sticky fields.
- **Unseen survivors are dropped.** If the server's tick doesn't include player X, X was either corpse-reaped, left the lobby, or disconnected. The client drops them from `serverPlayers` immediately.

The `playerSnapshot` handler is the opposite direction — it's an upsert. If the player already exists, merge in-place; otherwise append. Covers the race where a fresh join gets a tick before its initial snapshot lands (rare, but possible with ordering/coalescing).

## Death resolution timing

Hunger mutations inside the tick loop (combat hits, cowstrike waves, zone damage, firing costs, poisoned food, pond heal) route through `applyHungerDelta(p, delta, attackerId)` in `server/player.js`. If the delta drops `hunger` to ≤0, the player's id goes into a module-level `_pendingDeaths` Set — they are NOT eliminated inline.

At the end of the tick, `server/game.js::gameTick` calls `resolveDeaths()`:

```js
if (resolveDeaths() > 0) checkWinner();
broadcast({ type: 'tick', ... });
```

`resolveDeaths()` drains the set, calls `eliminatePlayer(p, 'hunger')` on each victim, and then the tick ships. This means a player who died this tick is `alive: false` in the tick broadcast, not `alive: true` followed by a separate `eliminated` message on the next tick. Fixes the ~33 ms window where a "dead" player could keep firing, get hit again (mis-crediting the kill), or appear alive on other clients.

The same `applyHungerDelta` is called from async contexts too — cowstrike waves are scheduled via `scheduleRoundTimer` and fire at 5000/6500/8000 ms after perk activation. Those callbacks run outside `gameTick`, so any death they cause is enqueued and processed on the next tick (max 33 ms drift). This is still correct for gameplay, and the `_pendingDeaths` set is cleared on round reset (`clearPendingDeaths()` in `game.js::startGame`) so stale ids can't leak across rounds.

## Armor mutation funnel

Same pattern as hunger: `applyArmorDelta(p, delta)` in `server/player.js` is the only sanctioned way to change `p.armor`. It clamps to `[0, maxArmor]` (default 50) and emits `shieldBreak` exactly once per positive→zero transition. Combat hits, cowstrike, and armor pickups all go through it. No inline `p.armor -= ...` writes anywhere in the codebase.

## Round-scoped timers

Cowstrike, delayed visual effects, and anything else that uses `setTimeout` during a round goes through `gameState.scheduleRoundTimer(fn, ms)`. The wrapper tracks the handle in a `_roundTimers` Set and try/catches the callback so one bad timer can't crash the process. `resetRound()` calls `clearRoundTimers()` first, so round-over cleanup zeroes out every pending timer. Without this wrapper, a cowstrike wave scheduled at 9 s could fire during the 10 s restart countdown and poke fresh-spawned players.

## What is NOT in the netcode

- **No client-side prediction.** The client renders whatever the server said was true at the last tick. Movement feels responsive at normal latency (30-80 ms) because there's barely any input-to-visible-motion delay at that rate, but high-latency clients will see input lag equal to their RTT + half a tick. Client-side prediction is a planned future topic.
- **No interpolation between ticks.** Entities render at whatever position the latest tick placed them. A future addition could interpolate positions across ticks for smoother motion, but currently the renderer just reads `p.x, p.y, p.z` straight from the merged tick state every frame.
- **No lag compensation on hits.** Hit detection happens in the tick where the `attack` message was processed, against positions at that tick. A high-latency shooter's shots land where they were aiming when the message was received, not where they were aiming when they pressed fire.
- **No delta compression.** Every tick ships the full mutable shape for every player. There's no "send only fields that changed since last tick" mechanism — the tick payload is already small enough that delta compression would cost more CPU than it saves bandwidth.
- **No reliable/unreliable split.** Everything goes over the same WebSocket. `tick` is the only type that can drop under backpressure; everything else is TCP-reliable by construction.

## Files

| File | Purpose |
|---|---|
| `shared/messages.js` | `S2C` + `C2S` + `MSG` enums, `assertEnumIntegrity()` |
| `server/index.js` | WebSocket server, rate limiter, heartbeat, C2S dispatch |
| `server/network.js` | `broadcast()` + `sendTo()`, backpressure drop logic |
| `server/game.js` | `gameTick` 30 Hz loop, `tick` broadcast, `checkWinner` |
| `server/player.js` | `getPlayerTick`, `getPlayerSnapshot`, `broadcastPlayerSnapshot`, `applyHungerDelta`, `applyArmorDelta`, `resolveDeaths`, `clearPendingDeaths`, `eliminatePlayer` |
| `server/game-state.js` | `scheduleRoundTimer`, `clearRoundTimers`, round-scoped collections |
| `client/network.js` | WebSocket open + dispatch shim |
| `client/message-handlers.js` | `handlers` table (one function per S2C type), `assertHandlerCoverage()` |
| `client/input.js` | Keyboard/mouse → C2S message emit |
| `client/index.js` | Render loop + `setMessageHandler` wiring |
