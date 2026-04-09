# Client-side Prediction + Lag Compensation Migration Plan

Multi-phase plan to incorporate Counter-Strike-style netcode features into Strawberry Cow. Covers #1 (client-side prediction), #2 (entity interpolation), #3 (lag compensation), #4 (input command sequencing), #5 (historical entity state), and #7 (tick/update rate decoupling) from `docs/netcode.md::Gaps vs Counter-Strike`.

Explicitly **out of scope** for this plan:
- **#6 (UDP transport).** Deferred to a later iteration via WebRTC data channels.
- **#8 (sim tick / snapshot tick decoupling).** Deferred.

## Design invariants

Every phase must preserve these invariants:

1. **Server is always authoritative.** Client prediction is a rendering optimization, never a source of truth. Anything the client does must be reversible on server disagreement.
2. **Existing message wire format stays backwards compatible until a phase explicitly breaks it.** We version by growing message shapes, not renaming. Old clients keep working during rollout.
3. **Test coverage grows with the code.** Every phase that touches ballistics, movement, or hit detection must add characterization tests alongside the existing `fire-weapon.characterization.js` harness.
4. **The server's characterization tests are the guardrail.** If a refactor breaks them without an accompanying fixture regen with a documented reason, the refactor is wrong.

## Pre-prep work (before Phase 1)

These are small, cheap tasks that unblock multiple downstream phases. Do them all before starting Phase 1.

### P0.1 — Verify terrain determinism

**Why:** Client-side prediction requires client and server to agree on `getTerrainHeight(x, y)` for identical inputs. If they diverge by even 0.01 units, the local sim will disagree on `p.z` and rubber-banding will happen every frame the player is on the ground.

**Status:** Already shared by construction. Both `server/terrain.js:7` and `client/terrain.js:8` use identical seeded sin/cos formulas with the same `GRID_W=200`, `GRID_H=150`, same interpolation math. `MAP_W = MW = 2000` (shared via `shared/constants.js:1`).

**Task:** Write a small test harness that:
1. Seeds both server and client terrain with the same value (pass the seed explicitly).
2. Samples `getTerrainHeight(x, y)` at 100 random `(x, y)` pairs.
3. Asserts `server.getTerrainHeight(x, y) === client.getTerrainHeight(x, y)` bit-exact.
4. Runs in `npm run test:fire-weapon` alongside existing tests.

If the assertion fails, fix the divergence before any later phase. If it passes, this becomes a regression guard for future terrain changes.

**Files:** new `server/tests/terrain-determinism.test.js`, optionally extract `heightMap` generation into `shared/terrain-math.js` to force single-source-of-truth.

**Scope:** ~50 lines. Half an afternoon.

### P0.2 — Add `tickNum` monotonic counter to broadcasts

**Why:** Phases 1, 2, 4, 5, and 6 all need a canonical "which tick is this" identifier. `gameTime` (already in the tick payload) is a float in seconds — lossy for indexing. Add a dedicated integer.

**Task:** In `server/game.js::gameTick`, add a module-level `_tickNum` counter incremented every tick. Include it in the `tick` broadcast:
```js
broadcast({
  type: 'tick',
  tickNum: _tickNum++,
  players: getPlayerTicks(),
  zone: ...,
  gameTime: ...,
});
```
Reset `_tickNum = 0` in `gameState.resetRound()`. Client stores it on `S.lastTickNum`. No consumer yet — this is infrastructure.

**Files:** `server/game.js`, `server/game-state.js::resetRound`, `client/state.js`, `client/message-handlers.js::tick`.

**Scope:** ~20 lines. One hour. Ships on its own — zero behavioral change.

### P0.3 — Audit world-state sync between client and server

**Why:** Phase 4 (CSP) makes the client run the movement integrator locally. That integrator reads `walls`, `barricades`, `mudPatches`, `healPonds`, `portals`, and `zone`. If the client's copy of any of these is ever out of sync with the server, prediction will diverge silently.

**Task:** For each world-state collection, audit the sync path:
- **walls** — broadcast in `spectate` / `start`, never mutated after round start. ✓ Safe.
- **barricades** — `addBarricade` / `removeBarricade` events. Verify the client has a handler for BOTH and that no server-side path mutates them without broadcasting. `server/combat.js::applyExplosion` at line 82 uses `broadcast({type:'barricadeDestroyed', ...})` — ✓. `server/game.js:83` for expiration — ✓. Check for any `gameState.removeBarricade(...)` that isn't followed by a broadcast.
- **mudPatches, healPonds, portals, houses** — set once in `generateMap`, never mutated. Shipped in `start`/`spectate`. ✓ Safe.
- **zone** — in every `tick`. Already merged. ✓ Safe.

**Expected finding:** audit will probably reveal one or two spots where an edge case skips the broadcast. Flag them and fix inline.

**Files:** server/combat.js, server/game.js, server/bots.js, client/message-handlers.js.

**Scope:** Half-day audit + any inline fixes. The audit itself is just grep + reading.

### P0.4 — Extract `PLAYER_SPEED_BASE` and movement physics constants to shared

**Why:** `server/game.js:146` has the movement formula hardcoded:
```js
const speed = 108 * sizeSlowdown * p.perks.speedMult * mudSlow * walkMult;
```
Phase 4 needs the client to compute the same value. Pull these numbers into `shared/constants.js` now so Phase 4 isn't also doing a constant-hunt.

Specifically lift: `108` (base speed), `0.5` (walk mult), `800` (gravity), `-30` (water level — already in `client/index.js:124`), `BARRICADE_HEIGHT`, `PLAYER_WALL_INFLATE`.

**Files:** `shared/constants.js`, `server/game.js`, `server/ballistics.js`.

**Scope:** ~30 lines of extraction, zero behavior change. One hour.

---

## Phase 1: Entity interpolation buffer (client-only)

**Goal:** Render remote players ~100 ms in the past by lerping between bracketing `tick` snapshots. Smooths out the 30 Hz hop that currently makes remote motion visibly choppy.

**Why first:** Pure client change, zero server impact, immediate visible quality win, no dependency on any other phase. This is the "lowest risk, highest visible win" phase — ship it on its own and observe the improvement.

### Mechanism

Currently `client/message-handlers.js::tick` does:
```js
Object.assign(existing, t);  // merge tick fields into cached player
```
And `client/entities.js::updateCows` reads `p.x, p.y, p.z` from `S.serverPlayers` directly.

Replace that with a ring buffer of the last 4 tick snapshots per player plus a "render time" that's `now - INTERP_DELAY_MS`. On render, find the two snapshots bracketing `render_time` and lerp their positions.

### Pseudocode

```js
// per player: short history of (timestamp, x, y, z, dir, aimAngle)
p._history = p._history || [];
p._history.push({ t: performance.now(), x: t.x, y: t.y, z: t.z, dir: t.dir, aim: t.aimAngle });
if (p._history.length > 6) p._history.shift();
// all non-position fields still merge normally (ammo, hunger, etc.)
Object.assign(existing, t, { x: existing.x, y: existing.y, z: existing.z });
```

Then in `updateCows(time, dt)`:
```js
const renderT = performance.now() - INTERP_DELAY_MS;
for (const p of S.serverPlayers) {
  if (p.id === S.myId) continue;  // local player uses its own path
  const hist = p._history;
  // find bracketing pair
  let a = hist[0], b = hist[hist.length - 1];
  for (let i = 0; i < hist.length - 1; i++) {
    if (hist[i].t <= renderT && hist[i+1].t >= renderT) { a = hist[i]; b = hist[i+1]; break; }
  }
  const span = b.t - a.t || 1;
  const f = Math.max(0, Math.min(1, (renderT - a.t) / span));
  // use lerped position for rendering instead of p.x/p.y
  const rx = a.x + (b.x - a.x) * f;
  const ry = a.y + (b.y - a.y) * f;
  const rz = a.z + (b.z - a.z) * f;
  // feed rx/ry/rz into cm.position instead of p.x/p.y/p.z
}
```

### Files touched

- `client/message-handlers.js::tick` — history push, preserve existing x/y/z from merge.
- `client/entities.js::updateCows` — switch to lerped positions for remote cows.
- `client/state.js` — add `INTERP_DELAY_MS` constant (start at 100, tunable).
- No server changes.

### Risks

- **Extrapolation beyond the newest snapshot.** If `renderT > hist[last].t` (ticks dropped, server stalled), we either freeze at the last snapshot or naively extrapolate. Freeze is safer — pick that.
- **The local player** (`p.id === S.myId`) is NOT interpolated. They're still on the "camera lerps toward server position" path. Phase 4 replaces that with prediction.
- **Aim angle lerping** needs wraparound handling — if a cow spins from aim=3.1 to aim=-3.1 the naive lerp gives 0. Use the shortest-arc formula.
- **Tick history memory.** 6 snapshots × ~12 players × ~40 bytes = ~3 KB. Negligible.

### Exit criteria

- Remote cow motion is visually smooth — no 30 Hz step-jitter.
- No observed difference in hit registration (this phase doesn't touch combat).
- Characterization tests still pass (this phase doesn't touch the server).
- Playtest: 2-3 rounds with multiple players or bots, verify no regressions.

### Scope

~150 lines. Two-day task including playtesting.

---

## Phase 2: Input command sequencing + ack echo

**Goal:** Every client input carries a monotonic sequence number. The server tracks the last-applied sequence per player and echoes it back in each `tick`. Pure infrastructure — no behavioral change — but it's a hard dependency for Phases 4 and 6.

### Mechanism

**Client side:**
- `S.inputSeq = 0` counter.
- On every `send({type:'move', ...})`, include `seq: ++S.inputSeq`.
- Also annotate `attack`, `dash`, `jump`, `reload`, `placeBarricade`, `dropWeapon` with seq numbers — anything that causes state change.
- Client remembers the most recent seq it sent.

**Server side:**
- On every `ws.on('message')` that mutates state, update `player.lastInputSeq = msg.seq` (clamped to a monotonic max — don't accept out-of-order seq).
- In `getPlayerTick(p)`, include `lastAckedInput: p.lastInputSeq` (but ONLY for the player whose tick it is — other players' seqs are private noise). Solution: add `lastAckedInputForYou` to the tick broadcast itself, keyed per-recipient. That breaks the "broadcast is the same bytes for everyone" invariant, which is load-bearing.

**Better solution:** add the ack as a separate field at the tick broadcast's TOP level, but as a map `{playerId: seq}` containing ONLY the recipient's entry. That still breaks per-recipient. Simplest: give each client their OWN `lastAcked` field via a per-client `sendTo` piggybacked onto the tick — but that defeats the broadcast optimization.

**Cleanest approach:** ship a separate `inputAck` message to each player, low-rate (e.g. every 5 ticks = 166 ms). Client tolerates infrequent acks because Phase 4's reconciliation is tolerant of "acks lag by a few frames":
```js
// server: every 5 ticks
for (const [, p] of gameState.getPlayers()) {
  if (!p.ws || p.isBot) continue;
  sendTo(p.ws, { type: 'inputAck', seq: p.lastInputSeq });
}
```
Add `inputAck` to `S2C` enum. Add a client handler that stores `S.lastAckedInput`.

### Files touched

- `shared/messages.js` — add `inputAck` to `S2C`.
- `client/network.js::send` — wrap send to auto-inject `seq` on stateful messages.
- `client/state.js` — `inputSeq`, `lastAckedInput`.
- `server/index.js` — on every stateful message, update `player.lastInputSeq`.
- `server/player.js` — add `lastInputSeq` to the initial player shape.
- `server/game.js::gameTick` — periodically emit `inputAck` per-player.
- `client/message-handlers.js` — add `inputAck` handler.

### Risks

- **Bots don't have ws** — skip them cleanly in the ack loop.
- **Stateful vs stateless messages** — `chat`, `setName`, `ready` shouldn't advance seq; they're not inputs the simulation cares about. Define a `STATEFUL_INPUT_TYPES` set in `client/network.js` to gate auto-injection.
- **Seq wraparound** — 32-bit int overflow after ~4 billion inputs. Not a concern in practice, but document the limit.

### Exit criteria

- Server and client both track sequence numbers.
- `S.lastAckedInput` advances monotonically during play.
- No behavioral change observable to players.

### Scope

~200 lines. One-day task.

---

## Phase 3: Extract pure movement integrator into `shared/movement.js`

**Goal:** Pull the player-position update logic out of `server/game.js::gameTick` into a pure, side-effect-free function that takes `(player, dt, world, input)` and returns the new `(x, y, z, vz, dir)`. The server calls it from gameTick exactly like before; Phase 4 will make the client call it too.

### What "movement" means for this extraction

The extracted function owns ONLY these responsibilities:
- Apply `p.dx, p.dy, p.walking` movement delta with speed/size/mud/walkMult adjustments.
- Update `p.dir` cardinal direction.
- Run `pushOutOfWalls` collision.
- Run barricade OBB pushout.
- Apply portal teleportation.
- Apply height physics (vz/gravity/ground clamp).
- Apply zone clamp.
- Decrement `stunTimer` (this gates movement).

The extracted function does NOT do:
- Hunger damage (zone, drain, heal ponds).
- Cooldown ticks.
- Eating logic.
- Food collision.
- Spawn protection countdown (stays in gameTick — it's not movement).

All the "not movement" items stay in gameTick and continue to run only on the server.

### API sketch

```js
// shared/movement.js
function stepPlayerMovement(p, dt, world, input) {
  // p: { x, y, z, vz, dir, dx, dy, walking, stunTimer, spawnProtection, foodEaten, perks }
  // dt: tick delta in seconds
  // world: { walls, barricades, mudPatches, portals, zone }
  // input: { dx, dy, walking } -- separate from p.dx/p.dy so the server can pass the
  //                                live input and the client can pass its buffered input
  if (p.stunTimer > 0) p.stunTimer -= dt;
  if (p.spawnProtection > 0) return; // early return; caller handles this outside
  // ...movement delta, collisions, portals, zone clamp, height physics...
  return p; // mutated in place for parity with the existing code
}
module.exports = { stepPlayerMovement };
```

Note: the function MUTATES `p` in place for parity with the existing code style. Can refactor to return-a-new-object later if pure-functional becomes desirable, but matching current behavior reduces diff.

### Files touched

- New: `shared/movement.js`.
- `server/game.js::gameTick` — replace the movement block with `stepPlayerMovement(p, dt, world, {dx: p.dx, dy: p.dy, walking: p.walking})`.
- `client/` — no change yet. Phase 4 consumes this.
- Server tests: add a new characterization test `server/tests/movement.characterization.js` that seeds a player + world, steps movement N times, snapshots the result. Same format as `fire-weapon.characterization.js`.

### Risks

- **This is the riskiest refactor in the plan.** Breaking movement breaks everything. Mitigations:
  - Write characterization tests BEFORE the refactor, snapshotting current behavior.
  - Run the harness before and after; the outputs must match byte-for-byte.
  - Keep the refactor mechanical — no "improvements", just extraction.
- **Circular dependencies.** `shared/movement.js` needs walls/barricades/zone data but shouldn't depend on `server/game-state.js`. Pass world state as a plain object argument every call.
- **Imports on the client side.** The client needs to `require` / `import` from `shared/`. Node's `require` works for the server; the client uses esbuild bundling. esbuild will resolve `shared/movement.js` if the path is relative and the file doesn't use Node-specific globals. Write it as ESM with only pure-JS math.
- **`require('./terrain')` inside shared/movement.js.** Needs `getGroundHeight`/`getTerrainHeight`. Server has `server/terrain.js`, client has `client/terrain.js`. Pass terrain as an argument too: `stepPlayerMovement(p, dt, world, input, { getTerrainHeight, getGroundHeight })`. The caller provides the right terrain module.

### Exit criteria

- New `shared/movement.js` exists and exports `stepPlayerMovement`.
- `server/game.js::gameTick` delegates to it.
- New characterization tests pass before AND after the refactor with identical fixtures (no `--write` needed).
- `fire-weapon.characterization.js` still passes untouched.
- Playtest 3-5 rounds: movement feels identical.

### Scope

~400 lines of code movement + ~200 lines of new tests. Three-day task.

---

## Phase 4: Client-side movement prediction

**Goal:** Local player movement becomes instantaneous. Inputs feel zero-latency on the client. Server is still authoritative — on disagreement, client snaps to server position and replays unacked inputs.

**Depends on:** Phases 0 (tickNum), 2 (input seq + ack), 3 (shared movement integrator), 0.4 (shared constants).

### Mechanism

The client keeps a ring buffer of `(seq, predictedState)` entries. On every input:
1. Increment `seq`.
2. Compute the predicted state locally by calling `stepPlayerMovement(S.mePredicted, dt, world, input, terrain)`.
3. Push `{seq, x, y, z, vz, dir}` onto the ring.
4. Render the local player from `S.mePredicted` instead of `S.me`.

On every `tick` with an ack:
1. Look up the ring entry with `seq === lastAckedInput`.
2. Compare predicted position to server-reported position.
3. If within a small epsilon (e.g. 1 unit), discard the entry — prediction was correct.
4. If divergent, snap `S.mePredicted` to the server position and REPLAY every unacked entry through `stepPlayerMovement` to reach a new "predicted now".
5. Drop acked entries from the ring.

### Critical constraints

- **The client must call `stepPlayerMovement` with the SAME world state the server will use at that tick.** Walls and terrain are immutable per-round, so they're fine. Barricades mutate — as long as the client's barricade list matches the server's at the same tick number, prediction holds. Phase 0.3 audits this.
- **The client must use the same `dt`** the server will use at that tick. Server uses `1/TICK_RATE = 1/30 s`. Client uses the same fixed step — NOT render frame `dt`. This means Phase 4 introduces a fixed-timestep accumulator on the client:
  ```js
  S.predictAccumulator += frameDt;
  while (S.predictAccumulator >= TICK_DT) {
    runPredictionStep(TICK_DT);
    S.predictAccumulator -= TICK_DT;
  }
  ```
- **Input buffering.** The client sends inputs at 20 Hz (throttled in `client/index.js:77`). But prediction steps run at 30 Hz. Solution: on every prediction step, use the CURRENT input vector (latest keys state) — the seq number advances but multiple prediction steps may share the same input seq. That's fine as long as the server sees the same duplication.
  - **Alternative:** bump input send rate to 30 Hz to match tick rate. Simpler — no duplication logic. Costs a bit more bandwidth.
- **Divergence threshold.** Start with 1.0 world unit. Too tight and you rubber band on floating-point drift; too loose and cheaters could teleport. Log divergence magnitudes in dev mode and tune from observed data.
- **Camera follow.** `client/index.js:97` currently lerps `cam.position` toward `me.x/me.y` with a lerpR of `1 - 0.0001^dt`. With prediction, this becomes `cam.position.copy(mePredicted)` with no lerp. Lerp can be kept for the Z axis (terrain smoothing) since the player's feet do need smoothing.

### What gets predicted

**Predicted (client runs ahead):**
- Player position (x, y)
- Player height (z, vz)
- Direction (dir)

**NOT predicted (server-only):**
- Hunger, armor, score, kills
- Weapon pickup / drop / ammo changes
- Hit detection (handled by Phase 6 lag comp)
- Eating, level up, perks
- Anything involving other players

The cow's *visual* position is predicted; its *stats* are still from the last tick.

### Files touched

- `client/index.js` — replace direct `cam.position` from `S.me.x` with `S.mePredicted.x`, add fixed-timestep prediction step, add replay on divergence.
- `client/state.js` — add `mePredicted`, `predictBuffer`, `predictAccumulator`.
- `client/message-handlers.js::tick` — on each tick, run the reconciliation: compare predicted `[seq]` to server position, snap + replay if divergent.
- `shared/movement.js` — no change (already extracted in Phase 3). This phase just calls it from the client.
- `client/terrain.js` — ensure `getTerrainHeight` is callable with identical interface to `server/terrain.js` (already verified in P0.1).

### Risks

- **Floating-point divergence.** `Math.sin`, `Math.cos`, `Math.hypot` can return slightly different values on different JavaScript engines. Node and V8 (browser) should match because they're both V8, but Safari WebKit and Firefox SpiderMonkey might differ by 1 ULP on edge cases. Mitigation: run the divergence check with a generous epsilon (1 unit) so 1-ULP drift doesn't trigger reconciliation. Longer-term: constrain all shared math to IEEE 754 basic ops (add/sub/mul/div) which are spec-identical across engines.
- **Rubber banding.** If the divergence check fires frequently, the player feels worse than before prediction was added. Mitigation: in dev mode, log every reconciliation event with (predicted, server, delta). Tune the threshold based on observed distributions.
- **Barricade mutation races.** Player A walks through a spot just as player B's barricade spawns there. Server places the barricade at tick T; client receives the `barricadePlaced` event at tick T+ping. Between T and T+ping, the client has no barricade there and the prediction walks through it. On the next ack at T+ping, the server-reported position shows the player blocked. Reconciliation snaps them back. This is correct behavior but feels bad. Mitigation: barricades cost 5 hunger + have a visible place-cooldown, so the race window is rare. Accept it for Phase 4.
- **The player can't see their own prediction diverge.** When reconciliation snaps, it's invisible to the player unless divergence is big. But inputs sent AFTER the reconciliation point are now running from a different baseline. Replay handles this correctly IF `stepPlayerMovement` is actually pure. If it isn't (e.g. reads global state), replay is wrong.
- **Input throttle (20 Hz) vs prediction step (30 Hz).** Each prediction step uses the LATEST input, so intermediate steps share inputs. The server sees the same thing (it processes whatever `p.dx, p.dy` is at the moment of tick). Should match.

### Exit criteria

- Local movement feels zero-latency, even at 150+ ms ping.
- Reconciliation rate < 1% of ticks under normal play (measured via dev-mode logging).
- No visible rubber banding in playtest with 50ms/100ms/200ms artificial latency (use `tc qdisc add ... netem delay 100ms` or dev tools throttling).
- Other players see the predicted player in the same place the server does — the prediction is invisible to them.
- Characterization tests still pass.

### Scope

~600 lines across multiple files. **The single largest phase.** Five-to-seven-day task, including artificial-latency playtesting.

---

## Phase 5: Historical entity state ring on the server

**Goal:** Server keeps a bounded ring buffer of per-tick entity positions. No one uses it yet — Phase 6 is the consumer. Landing this as a separate phase means the storage change can ship and bake independently before lag comp introduces rewind logic on top.

### Mechanism

Add a per-tick `historySnapshot` function that captures `{tickNum, time, positions: [{id, x, y, z, stunTimer, spawnProt}]}` for every alive player. Push onto a ring of length `HISTORY_TICKS = 20` (= 660 ms at 30 Hz — covers even extreme ping + interp delay).

```js
// server/game-state.js
const HISTORY_TICKS = 20;
const _positionHistory = [];
function pushHistorySnapshot(tickNum) {
  const snap = { tickNum, time: Date.now(), positions: [] };
  for (const [, p] of _players) {
    if (!p.alive) continue;
    snap.positions.push({ id: p.id, x: p.x, y: p.y, z: p.z, stunTimer: p.stunTimer, spawnProt: p.spawnProtection > 0 });
  }
  _positionHistory.push(snap);
  if (_positionHistory.length > HISTORY_TICKS) _positionHistory.shift();
}
function getHistorySnapshot(tickNum) {
  // find the snapshot with the given tickNum, or the closest older one
  for (let i = _positionHistory.length - 1; i >= 0; i--) {
    if (_positionHistory[i].tickNum <= tickNum) return _positionHistory[i];
  }
  return null; // too old, fell off the ring
}
```

Call `pushHistorySnapshot(_tickNum)` at the start of every `gameTick`, BEFORE movement runs. That way snapshot(T) reflects positions at the START of tick T — the "display" positions.

### Files touched

- `server/game-state.js` — add `_positionHistory`, `pushHistorySnapshot`, `getHistorySnapshot`, clear in `resetRound`.
- `server/game.js::gameTick` — call `pushHistorySnapshot` at top of tick.

### Risks

- **Memory.** 20 ticks × 16 players × ~50 bytes = ~16 KB per room. Trivial.
- **Fallback on overflow.** If an attack references a tickNum older than HISTORY_TICKS can hold (player was on 400ms ping), use the oldest available snapshot and accept the small rewind error.

### Exit criteria

- History ring populates each tick.
- `getHistorySnapshot(tickNum)` returns correct snapshots.
- Memory stays bounded across long rounds (verify with a ring test harness).
- Zero behavioral change.

### Scope

~100 lines. One-day task.

---

## Phase 6: Lag compensation on hit detection

**Goal:** When a player fires, the server rewinds entity positions to the tick the shooter was actually seeing, runs the hit check against those historical positions, then returns to present. High-ping players stop having to lead targets.

**Depends on:** Phases 2 (input seq), 5 (history ring).

### Mechanism

**Client side:**
- `attack` messages gain a `displayTick` field = the most recent `tickNum` the client received before firing MINUS the interp delay in ticks.
- `INTERP_DELAY_TICKS = INTERP_DELAY_MS * TICK_RATE / 1000 = 100 * 30 / 1000 = 3`. So `displayTick = S.lastTickNum - 3`.
- The rest of the `attack` message is unchanged.

**Server side:**
- In `server/combat.js::handleAttack`, before calling `fireWeapon`, look up `const historic = gameState.getHistorySnapshot(msg.displayTick);`.
- Pass `historic` through to `fireWeapon` → `updateProjectiles` ... actually, handleAttack doesn't call updateProjectiles directly. It spawns projectiles. The hit check happens in `updateProjectiles` on SUBSEQUENT ticks as the projectile travels.

**Insight:** this isn't a simple "rewind, check, roll forward" because cow projectiles take multiple ticks to reach the target. Hitscan-only lag comp (used by CS) is simpler because the shot is instantaneous.

### Adapting lag comp to physical projectiles

Two options:

**Option A — Shoot-through-history (per-tick rewind for the whole projectile flight).**
Store `projectile.fireDisplayTick` on every projectile at spawn. In `updateProjectiles`, when running `findPlayerHit`, don't use the live `players` array — use the historical snapshot offset by `(fireDisplayTick + ticks_since_fire)`. That way the projectile continues to see the "rewound" target positions as it travels. Feels right for bullets.

**Option B — First-frame-only rewind.**
On spawn, immediately do a hit check against the historical target positions for the projectile's flight path. If the projectile would hit someone in the rewound world within its max range, schedule the hit at the right flight time. Cleaner logic but diverges from the "projectile is a physical object" model.

**Recommended: Option A.** Matches the existing architecture (projectiles are already first-class entities) with minimal code change.

### Server changes for Option A

```js
// server/combat.js::updateProjectiles
const historic = gameState.getHistorySnapshot(pr.fireDisplayTick + pr.ticksAlive);
const playersForHitCheck = historic ? reconstructPlayersMap(historic) : players;
const hitPlayer = ballistics.findPlayerHit(prevX, prevY, prevZ, pr.x, pr.y, pr.z, playersForHitCheck, pr.ownerId, blockT, eyeHeight);
```

Where `reconstructPlayersMap` turns the snapshot's `positions` array into a Map with the same shape `findPlayerHit` expects. It needs at least `{id, x, y, z, alive, sizeMult, stunTimer, spawnProtection}` — alive is always `true` for history entries (dead players aren't snapshotted). sizeMult is sticky so we can grab it from the live `players` map.

### Damage application

Damage is still applied to the LIVE player via `applyHungerDelta` — rewind only affects the hit check, not the mutation. This is important: the hit is credited to the currently-alive player even if they've moved since the fire tick. If the player died between fire tick and hit resolution tick, the historical check finds them, but the live check correctly sees them as dead and drops the damage. No ghost kills.

### Files touched

- `client/input.js` or wherever `attack` is sent — add `displayTick` field.
- `client/state.js` — `lastTickNum` already from Phase 0.2.
- `server/combat.js::handleAttack` — record `fireDisplayTick` on the projectile.
- `server/combat.js::updateProjectiles` — use historical snapshot for hit check.
- `server/ballistics.js::findPlayerHit` — accept an iterable of players instead of a Map (minor signature change).
- New helper `reconstructPlayersMap` in server/combat.js.
- Characterization tests: add `lag-compensation.characterization.js` that tests "player fires at tick T, target moves between T and T+5, hit should register against target's T position".

### Risks

- **"Shot around the corner" complaints.** Classic CS complaint. Player A peeks a corner, player B (high ping) sees A still behind the corner, shoots, server rewinds and credits the hit. From A's POV, they got shot despite being safe. Documented accepted tradeoff in CS. For cow game: same tradeoff. Accept it and document.
- **Max rewind clamp.** Refuse to honor `displayTick` values older than `HISTORY_TICKS` worth of frames. Prevents abuse by clients forging ancient displayTick values.
- **Refuse to honor future displayTick values.** `if (msg.displayTick > current _tickNum) msg.displayTick = current;` — prevents cheating via "I'm firing at what I'll see in the future".
- **Projectile hit check at spawn for already-close targets.** If a target is standing right at the muzzle, the first-tick projectile step might pass through them without a hit check. Existing code handles this via the `segDist > 0.5` gate — keep that behavior, just point the hit check at historical state.
- **sizeMult is sticky and immutable per-round per-player** — safe to pull from live `players` map. If sizeMult ever becomes mutable mid-round, this needs revisiting.

### Exit criteria

- New characterization test "moving target at ping 150" passes with lag comp on, fails with lag comp off.
- High-ping players report landing shots on moving targets.
- Low-ping players don't report unexpected "shot around the corner" deaths more than once per 10 rounds (tunable via `HISTORY_TICKS`).
- No regression in `fire-weapon.characterization.js` for direct hits on stationary targets.

### Scope

~400 lines across client + server + tests. Four-day task.

---

## Phase 7: Tick rate / update rate decoupling

**Goal:** Per-client control over broadcast frequency. A player on 4G gets 15 Hz updates; a player on fiber gets 60 Hz updates. Server sim stays at its own rate.

**Depends on:** Nothing — could technically ship before Phase 1. Put it last because the impact is polish, not correctness, and it's the phase most likely to add complexity without a visible win.

### Mechanism

Currently `gameTick()` both simulates AND broadcasts in one call. Split:

```js
function simTick() {
  // all the current gameTick logic except the final broadcast
}

setInterval(simTick, 1000 / SIM_TICK_RATE);

// separate per-client broadcast loops
for each player:
  player._broadcastInterval = setInterval(() => {
    sendTo(player.ws, buildTickFor(player));
  }, 1000 / player.updateRate);
```

Client tells the server its desired update rate via a new `setUpdateRate` C2S message (rate-limited to 1/sec). Valid range [15, 60]. Default 30. Server stores on `player.updateRate`.

`buildTickFor(player)` uses the MOST RECENT sim state — it doesn't snapshot per-broadcast. Fast players see newer state than slow ones, by the broadcast granularity.

### Files touched

- `server/game.js::gameTick` → split into `simTick` + per-client broadcast loops.
- `server/player.js` — add `updateRate` to the player shape.
- `server/index.js::ws.on('connection')` — start the broadcast loop for this player, kill it on `close`.
- `shared/messages.js` — `setUpdateRate` in C2S.
- `client/state.js` — `updateRate` setting, defaults to 30.
- Client settings UI — a slider or a dropdown for the update rate.

### Risks

- **Broadcast storms.** 16 players × 60 Hz = 960 sendTo calls/sec. Fine for Node but multiply by the JSON-serialize cost and it adds up. Mitigation: serialize the tick ONCE per sim step and cache it on the player object, with a per-client-rate gate to decide when to actually call `ws.send`.
- **Backpressure interaction.** The current `DROPPABLE_TYPES = Set(['tick'])` guard still applies. Per-client update loops need the same guard.
- **Per-client timers.** 16 setIntervals is fine but could be replaced with a single sim-tick loop that checks "who's due for an update this sim-tick" based on their rate. Simpler to reason about and avoids timer drift.
- **Bandwidth for high-rate clients.** A 60 Hz player uses 2× the bandwidth of the default. Fine today; reconsider if we ever have 32-player rooms.

### Exit criteria

- Per-client update rate is tunable and observed to work under load.
- Slow players don't starve fast players or vice versa.
- Backpressure still drops correctly per-client.
- No regression in the `fire-weapon.characterization.js` or any other test.

### Scope

~300 lines across server + client. Three-day task.

---

## Dependency graph

```
P0.1 (terrain determinism) ──┐
P0.2 (tickNum)  ─────────────┤
P0.3 (world audit) ──────────┤
P0.4 (shared constants) ─────┤
                             │
                             ▼
  Phase 1 (interp buffer)  ◄── depends on P0.1 (optional), P0.2 (tickNum)
                             │
                             ▼
  Phase 2 (input seq/ack)  ◄── no dependencies beyond P0.2
                             │
                             ▼
  Phase 3 (shared movement)◄── depends on P0.4 (constants)
                             │
                             ▼
  Phase 4 (CSP)            ◄── depends on Phases 2, 3 + P0.1 (terrain)
                             │
                             ▼
  Phase 5 (history ring)   ◄── depends on P0.2 (tickNum)
                             │
                             ▼
  Phase 6 (lag comp)       ◄── depends on Phases 2, 5
                             │
                             ▼
  Phase 7 (rate decouple)  ◄── orthogonal, can ship anytime
```

Phases 1, 2, 5, and 7 can ship independently and in any order. Phase 3 is a refactor that must precede Phase 4. Phase 4 is the keystone — everything before it is infrastructure, everything after (except 7) builds on the infrastructure it introduces.

## Recommended phase ordering

| # | Phase | Rationale for this slot |
|---|---|---|
| 0 | Pre-prep (P0.1 – P0.4) | Fast, low-risk, unblocks everything downstream. |
| 1 | Entity interpolation buffer | Fastest visible win. Client-only. Ship and observe. |
| 2 | Input sequencing + ack | Pure infrastructure. Unblocks 4 and 6. No behavioral change. |
| 3 | Shared movement integrator | Required before CSP. Purely a refactor — shouldn't change behavior. |
| 4 | Client-side prediction | The big one. All prior phases exist to make this possible. |
| 5 | Historical entity state | Small and independent. Good "cooling off" phase after the intensity of Phase 4. |
| 6 | Lag compensation | Builds on 2 + 5. Player-visible correctness win. |
| 7 | Tick/update rate decoupling | Polish. Last because it's the least essential. |

## Risk summary (sorted by severity)

1. **HIGH: Client/server movement integrator divergence (Phase 4).** If `stepPlayerMovement` produces different outputs on client and server, prediction rubber bands. Mitigated by: characterization tests in Phase 3, shared `shared/movement.js`, terrain determinism verification in P0.1.
2. **HIGH: "Shot around the corner" UX (Phase 6).** Low-ping players will occasionally get killed while "safe." Mitigated by: keeping `HISTORY_TICKS` small, documenting the tradeoff, playtesting to measure frequency.
3. **MED: Sticky-field drift during prediction (Phase 4).** If a sticky field changes server-side between the prediction baseline and the ack, the client's predicted visual state can drift. Mitigated by: predicting position only, never sticky fields.
4. **MED: Barricade race during prediction (Phase 4).** Player walks through a spot where a barricade was just placed. Mitigated by: accepting the occasional snap-back.
5. **MED: History ring falls off for very high-ping players (Phase 6).** Mitigated by: fallback to oldest available snapshot + per-player ping cap at 400ms for lag comp purposes.
6. **LOW: Broadcast storms with high-rate clients (Phase 7).** Mitigated by: single shared serialize, per-client gating.
7. **LOW: Memory from history ring (Phase 5).** ~16 KB per room, negligible.

## Test strategy

Every phase adds tests:

- **Phase 0**: terrain determinism test, broadcast sequence test.
- **Phase 1**: no server test changes; playtest required.
- **Phase 2**: characterization test that seq numbers advance and are echoed.
- **Phase 3**: full characterization suite for `stepPlayerMovement` — seeded player, world, run N steps, snapshot. Must pass before AND after Phase 3 with the same fixtures.
- **Phase 4**: latency playtest (50/100/200 ms artificial latency), reconciliation rate metric, visual rubber-band audit.
- **Phase 5**: history ring unit test + bounded memory test.
- **Phase 6**: "moving target at 150 ms ping" test, "fire at ghost" test (victim dead between fire and resolution), direct-hit regression.
- **Phase 7**: per-client broadcast rate observed correctly under load.

Target: every phase lands green, no `--write` fixture regenerations without a documented behavioral reason.

## What NOT to do in this plan

- **Do not touch the transport (TCP → UDP).** That's deferred to the WebRTC iteration.
- **Do not rewrite ballistics.** Phase 6 only changes the player array passed to `findPlayerHit`, not the hit math itself.
- **Do not add prediction for other entities** (projectiles, barricades, food). Only local player movement benefits enough to justify the complexity. Projectile prediction is a second-order refinement.
- **Do not add prediction for stat fields** (hunger, armor, ammo). These ride snapshot and tick respectively and don't benefit from prediction — the player sees their own hunger drop when the server says so.
- **Do not optimize fixed-timestep reconciliation "defensively."** Ship the simplest loop that works, measure the reconciliation rate, tune only if needed.
- **Do not bundle CSP with a tick rate bump.** Keep 30 Hz for now; if 60 Hz becomes desirable, it's Phase 7's business, not Phase 4's.

## Rollout strategy

Per-phase shipping:
1. Land the phase on master (no feature flag — small project, fast revert).
2. Playtest for 2-3 rounds with the team.
3. If anyone reports regressions, revert the commit and diagnose.
4. Watch the next phase's infrastructure fits cleanly on top.

Server restarts between phases are cheap (`systemctl --user restart cowgame`, <1s downtime). Treat phases as independently shippable commits with clear commit messages so bisection works if regressions surface later.
