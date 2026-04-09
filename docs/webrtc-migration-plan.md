# WebRTC Data Channel Migration Plan (WebSocket → geckos.io)

**Goal**: replace the game's WebSocket transport with WebRTC data channels via [geckos.io](https://github.com/geckosio/geckos.io) so the "gameplay" message types (especially the 30 Hz `tick`) stop suffering from TCP head-of-line blocking. Keep everything else behaviorally identical — same enum, same payloads, same handler dispatch.

**Why this addresses head-of-line blocking**: TCP guarantees in-order delivery, so a single dropped packet stalls every subsequent message on the same connection until retransmit succeeds. WebRTC data channels are UDP with an opt-in reliability layer — unreliable channels drop lost packets entirely, and the next tick supersedes the missing one. No stall. `geckos.io` gives us two channels to pick from per-message: unreliable/unordered by default, reliable via `{reliable:true, interval, runs}` which re-sends the payload until ack'd.

## Pre-work (before touching transport)

### P.1 — Audit every `send()` / `broadcast()` / `sendTo()` call site

The current code already has three seams:
- `client/network.js::send(msg)` — every client→server message
- `server/network.js::broadcast(data)` — fan-out S2C
- `server/network.js::sendTo(ws, data)` — per-client S2C

These three functions are the entire surface area to port. Everything else in the codebase already calls through them — there's almost zero direct `ws.send()` in gameplay code. That is excellent news; the port is 95 % inside these three files.

Non-compliant spots that bypass the seams (must route through first):
- `server/game.js:311-319` — Phase 7 per-client `p.ws.send(tickStr)` + inline backpressure check (added during the rate-decoupling work).
- `server/game.js:322-333` — per-client `sendTo(p.ws, {type:'inputAck', ...})` — already routes through `sendTo`, good.
- `server/index.js::proxyRudeFm` — raw HTTP response path for the Rude FM stream. Not a game message, stays on the HTTP server.

**Task**: pull the Phase 7 tick stride gate back into `server/network.js` as a new `sendTickTo(player, payload)` helper. After the geckos migration this becomes the only place that knows about the transport.

### P.2 — Abstract the transport behind a thin interface

Introduce two tiny wrapper modules that both implementations (current WS, future geckos) conform to:

**`server/transport.js`**:
```js
// Single interface the game code calls into. Implementation is swapped
// at boot via require('./transport/ws') or require('./transport/geckos').
module.exports = {
  init(httpServer, handlers) {},        // bind to server + register handlers
  onConnect(cb) {},                      // (playerRef) => void
  onMessage(cb) {},                      // (playerRef, msg) => void
  onDisconnect(cb) {},                   // (playerRef) => void
  sendReliable(playerRef, msg) {},       // used for: everything except tick
  sendUnreliable(playerRef, msg) {},     // used for: tick
  broadcastReliable(msg) {},             // used for: everything except tick
  broadcastUnreliable(msg) {},           // used for: tick
  closePlayer(playerRef, reason) {},
};
```

**`client/transport.js`** (parallel shape): `connect()`, `onMessage(cb)`, `sendReliable(msg)`, `sendUnreliable(msg)`, `close()`.

`playerRef` is whatever opaque handle the transport hands back — a `ws` today, a `channel` post-migration. Game code never inspects it; it just stores it on the player object.

The game code stops touching `ws` / `channel` directly. `server/index.js::ws.on('connection')` becomes `transport.onConnect(player => …)`. `server/index.js::ws.on('message')` becomes `transport.onMessage((player, msg) => …)`. `broadcast(...)` in `server/network.js` becomes a call to `transport.broadcastReliable(...)`.

This abstraction is the entire pre-work value — once it's in, swapping WebSocket for geckos is a single-file replacement of `server/transport/ws.js` with `server/transport/geckos.js` and the corresponding client-side swap.

### P.3 — Build-time module flag

Add `GAME_TRANSPORT=ws|geckos` env var (default `ws`). `server/transport.js` reads it at boot and `require()`s the right impl. Client bundler does the same via an esbuild `--define:process.env.GAME_TRANSPORT=...` flag. Lets us ship both implementations in parallel during the cutover, A/B test, and roll back instantly.

### P.4 — Decide on a payload wire format

Current: `JSON.stringify(obj)` / `JSON.parse(string)` through both paths. Both WS and geckos accept string payloads directly — no change needed.

Potential optimization: geckos also supports `channel.raw.emit(arrayBuffer)` for binary payloads with zero JSON overhead. That would reduce CPU on the 30 Hz tick hot path by ~20–30 % at large player counts. **NOT in scope for this migration** — flag for a follow-up once the transport swap is stable. Migrate the JSON shape first, optimize later.

## Library specifics — geckos.io

Server setup (from the README):
```js
const geckos = require('@geckos.io/server').default;
const { iceServers } = require('@geckos.io/server');
const io = geckos({
  // Production: iceServers default includes public STUN + a geckos-hosted TURN fallback.
  // We'll override with our own (see Infra section below).
  iceServers: PRODUCTION ? iceServers : [],
  portRange: { min: 10000, max: 20000 },  // UDP port pool for peer connections
  multiplex: true,                          // share one UDP port across all connections
  cors: { allowAuthorization: true },
});
io.addServer(httpServer);                    // piggyback on existing http.Server
io.onConnection(channel => {
  channel.on('setName', data => { ... });
  channel.onDisconnect(() => { ... });
  channel.emit('joined', {...});             // unreliable by default
  channel.emit('playerSnapshot', {...}, { reliable: true, interval: 150, runs: 10 });
});
```

Client setup:
```js
import geckos from '@geckos.io/client';
const channel = geckos({
  url: 'https://claw.bitvox.me',
  port: 9208,
});
channel.onConnect(err => { if (err) reconnect(); });
channel.on('tick', msg => { ... });
channel.emit('move', {dx, dy, walking});
channel.emit('attack', data, { reliable: true });
```

Key API facts:
- **Default emit** = unreliable + unordered. A dropped packet is lost forever; the next message supersedes it.
- **Reliable emit** = `{reliable: true, interval: 150, runs: 10}` — the server re-sends the payload every 150 ms up to 10 times, and a server-side dedupe drops duplicates that already arrived. This is NOT SCTP-level reliability; it's "keep re-sending until the receiver saw it." Acceptable for all our command-type messages which are small and idempotent.
- **Signaling port**: TCP 9208 (configurable) for initial handshake + ICE candidate exchange. HTTP only, no WebSocket.
- **Data port range**: 10000–20000 UDP by default (we'll narrow this — see Infra).
- **Multiplex on**: all connections share one UDP port. Big win for firewall config.

## Message inventory — reliability decisions

The complete list is in `shared/messages.js`. For each, the decision is: **unreliable** only if losing it is harmless because a later message supersedes it. Everything else is reliable. VoX's stated default ("everything reliable except tick delta") is followed — the exceptions below are where the default is the right call for some other reason.

### Server → Client (`S2C`)

| Message | Reliability | Justification |
|---|---|---|
| `serverStatus` | **reliable** | Pre-join lobby-vs-playing state for join screen. One-shot, not superseded by anything. |
| `joined` | **reliable** | Per-client one-shot assignment of id/color/hostId. Must deliver. |
| `lobby` | **reliable** | Lobby roster + countdown. Rare (<1/s), authoritative state snapshot. |
| `spectate` | **reliable** | Full-state sync on mid-round join. Massive (10s of KB), must deliver. |
| `start` | **reliable** | Round-start full-state sync. Same category as spectate. |
| **`tick`** | **UNRELIABLE** | The only one. 30 Hz mutable state; next tick supersedes it. Dropping 1–3 ticks is invisible to the client merge logic (it's designed to tolerate gaps via the ring-buffer interp + CSP reconcile). **This is the payload that was causing head-of-line stalls.** |
| `inputAck` | **reliable** | Carries the ack'd seq + position at that tick. The CSP ring can't advance past an ack it never saw. 6 Hz, cheap. Could technically be unreliable (next ack supersedes it), but the reconcile math is cleaner when acks are guaranteed to arrive in order — and volume is tiny. |
| `playerSnapshot` | **reliable** | Sticky-field updates (weapon pickup, perk, level-up). Dropping one means the client shows the wrong weapon until the next sticky event — visible bug. Emit cadence is event-driven, very low volume. |
| `food`, `eat` | **reliable** | Food spawn/despawn events. Losing a spawn = ghost food on the client. Losing an eat = food that was consumed stays visible. No superseding message. |
| `projectile` | **reliable** | Projectile spawn. Losing this = invisible bullet with a real hit. Low volume per trigger pull (1–6). |
| `projectileHit`, `wallImpact`, `wallDamaged`, `wallDestroyed`, `explosion`, `barricadeHit`, `barricadeDestroyed` | **reliable** | One-shot impact events; losing any is a visible desync. |
| `barricadePlaced` | **reliable** | Without it, client walks through a wall that exists on the server. |
| `eliminated`, `kill` | **reliable** | Killfeed + death rank. Must deliver. |
| `chat` | **reliable** | Obvious. |
| `winner`, `restart` | **reliable** | Round transitions. |
| `levelup` | **reliable** | Triggers perk menu. Dropping it = stuck player with pending level up and no UI. |
| `cowstrikeWarning`, `cowstrike` | **reliable** | Ability visual + stun event. |
| `botsToggled`, `botsFreeWillToggled`, `nightToggled` | **reliable** | Host-controlled toggles. Rare. |
| `dash` | **reliable** | Dash dust particle trigger + sound. Could arguably be unreliable (visual fluff), but the volume is so low that reliability has zero cost. |
| `weaponPickup`, `weaponSpawn`, `weaponDespawn`, `weaponDrop` | **reliable** | World state changes — client would show stale weapons on the ground. |
| `reloaded`, `shellLoaded`, `emptyMag` | **reliable** | Weapon-state events that the HUD/viewmodel consume. Rare. |
| `armorPickup`, `armorSpawn`, `shieldHit`, `shieldBreak` | **reliable** | Same reasoning as weapons. |
| `newHost`, `kicked` | **reliable** | Admin events. |

**Result**: 1 unreliable type (`tick`), all others reliable. Matches VoX's stated default.

### Client → Server (`C2S`)

| Message | Reliability | Justification |
|---|---|---|
| `join`, `setName`, `ready`, `kick` | **reliable** | Lobby / admin actions, one-shot. |
| `toggleBots`, `toggleBotsFreeWill`, `toggleNight` | **reliable** | Host toggles. |
| `perk` | **reliable** | Perk pick after level-up. Losing it = leveled player with no perk applied. |
| **`move`** | **UNRELIABLE** | 20 Hz movement vector. Next `move` supersedes the previous one entirely — server just stores `p.dx, p.dy`. Losing 1–2 in a row is invisible because the player is still holding the key and the next packet arrives within 50 ms. **This is the other head-of-line culprit.** |
| `attack` | **reliable** | Fire command with aim + displayTick for lag comp. Losing a fire is a lost shot. Volume is low (≤15/sec). |
| `reload`, `dash`, `jump`, `dropWeapon`, `placeBarricade` | **reliable** | Discrete player actions. Losing any is a visible dropped input. |
| `chat` | **reliable** | Obvious. |
| `setUpdateRate` | **reliable** | Preference change, one-shot. |

**Result**: 1 unreliable type (`move`), all others reliable. Head-of-line now can't stall either direction's hot path.

### Not in the enum but on the wire

- `proxyRudeFm` — stays on the existing HTTP path, not a game message. No change.
- WebSocket ping/pong frames — replaced by geckos's internal heartbeat (channel disconnect callback fires on timeout).

## Deployment & infra changes

### Caddy (reverse proxy)

Current: Caddy terminates HTTPS for `claw.bitvox.me` and reverse-proxies `/strawberrycow-fps-ws/*` to `localhost:20021`.

New requirements:
1. **TCP signaling proxy**: geckos signaling uses plain HTTP (not WebSocket) on port 9208. Add a Caddy rule:
   ```
   handle /strawberrycow-fps-rtc/* {
     reverse_proxy localhost:9208
   }
   ```
   The client will hit `https://claw.bitvox.me/strawberrycow-fps-rtc/` which Caddy terminates and forwards to the local geckos server.
2. **UDP is NOT proxied**. Caddy (and nginx) don't proxy UDP. The client's browser establishes a DIRECT UDP connection to the cowgame box's public IP on a port in the data range (10000–20000 by default). **This is the load-bearing infra change.**

### Firewall / security group

AWS security group for the cowgame box currently allows:
- TCP 443 (Caddy HTTPS)
- TCP 80 (Caddy HTTP → 443 redirect)
- SSH

Additions required:
- **UDP 10000–10100** (narrow the port pool via `portRange: {min: 10000, max: 10100}` to keep the exposed surface small — 100 concurrent connections is plenty and the multiplex option shares one UDP port across all peers anyway, so even 1 port would technically work).
- **TCP 9208** internal-only — only needs to be reachable from localhost because Caddy proxies to it. Default iptables rules should already drop inbound on non-exposed ports.

### STUN/TURN servers

**STUN** (NAT candidate discovery): free public servers are fine for a hobby game. geckos.io's default includes Google's public STUN. We can keep the default. STUN has zero hosting cost.

**TURN** (relay when direct connection fails): this is where it gets tricky. A small fraction of clients (symmetric NATs, strict enterprise firewalls) can't establish a direct UDP path and need a TURN relay. Without a TURN server, those clients can't connect.

Options:
1. **Skip TURN entirely** — accept that ~5–10 % of clients can't connect. For a hobby game with <20 concurrent players on your claw.bitvox.me domain, this is probably fine. WebSocket-over-TCP path worked for these clients but Phase 7 prediction still falls back on lost packets… actually no, TCP would just stall for them. They're already in a bad spot.
2. **Self-host coturn** on the cowgame box (or a separate small VM). coturn is free, ~50 MB RAM idle, handles the relay for dozens of simultaneous sessions on a $5/mo VPS. TURN uses TCP 3478 + 5349 and UDP 3478 + a relay port range.
3. **Paid TURN** (Twilio, Xirsys, etc.) at ~$0.40/GB. For this game's traffic volume that's pennies per month but adds an account to manage.

**Recommendation**: **start with option 1** (skip TURN). If we get reports of players who can't connect, add coturn as option 2. Document the fallback path in the migration commit message so future-you knows where to turn.

### Certificates

geckos.io signaling is HTTP. Caddy terminates HTTPS for the signaling path. **WebRTC data channels are encrypted by default** (DTLS over UDP) using a self-signed cert that the library generates at runtime. No cert provisioning needed on our side. This is one of the cleanest parts of the migration — unlike the Rude FM Icecast mess, we don't have to proxy anything, we just need the UDP port open.

### Observability

Add lightweight logging of:
- Connection establishment time (signaling start → data channel open). Geckos emits events we can hook.
- Per-channel packet loss counter (if the library exposes it — check `channel.stats()`).
- Fallback events when a client can't establish a direct path. If we skip TURN, these show up as connection failures — log them so we know whether to reconsider option 2.

## Migration phases

### Phase W.0 — Transport abstraction (1 day, zero behavioral change)
Land `server/transport.js` + `client/transport.js` as defined above. The default impl is still WebSocket (`server/transport/ws.js`). All game code switches to calling through the abstraction. Verify `npm test` green, playtest to confirm identical behavior. This is the load-bearing refactor that makes all subsequent phases cheap.

### Phase W.1 — Parallel geckos implementation (2 days)
Add `@geckos.io/server` and `@geckos.io/client` to package.json. Create `server/transport/geckos.js` and `client/transport/geckos.js`. The signaling HTTP server is its own thing — geckos `addServer(existingHttpServer)` lets us reuse `server/index.js`'s existing `http.createServer`. Register all the same handlers via the new transport interface. **Gated behind `GAME_TRANSPORT=geckos`**, not default.

Local smoke test: `GAME_TRANSPORT=geckos npm run start` + browser at `localhost` with the matching client env. Verify connect, tick broadcast, move input, attack, death, round reset all work. No TURN needed for localhost.

### Phase W.2 — Production deploy with fallback (1 day + bake time)
Open the UDP port range (narrow to 10000–10100 via `portRange`). Add the Caddy signaling route. Deploy the parallel build with an env toggle. **Keep WebSocket as the default transport** for the rollout — only players with `?rtc=1` in the URL use geckos. Monitor connection success rate for a few days.

### Phase W.3 — Reliability audit (half day)
For each S2C and C2S message type, add a one-time boot log at the first emit: `[transport] sending <type> (reliable=<bool>)`. Compare against this plan's table. Any mismatch is a bug. Remove the logs after the audit.

### Phase W.4 — Cutover (1 day)
Flip `GAME_TRANSPORT=geckos` as the default. Keep WebSocket available via env fallback for 1–2 weeks. Close the `/strawberrycow-fps-ws/` Caddy route after the bake period, **commit removing the WebSocket implementation** in a separate commit so reverting is a single git revert.

### Phase W.5 — Binary encoding follow-up (deferred)
Once stable, consider migrating the `tick` payload to a binary encoding via geckos's `channel.raw.emit()` — a bespoke fixed-schema serializer per `getPlayerTick()` field would cut the hot-path payload size by ~40 % and parse time dramatically. Not in the base migration — only after the transport swap has baked for at least a week.

## Risks

1. **UDP blocked on enterprise networks**. Some corporate firewalls drop all UDP. Players behind them will fail to connect. Mitigation: log connection failures, add TURN if we see a non-trivial failure rate.
2. **Mobile carriers**. Some mobile carriers (especially on IPv6-only networks) can be finicky. Same mitigation path.
3. **Geckos library maturity**. The library is actively maintained but not as battle-tested as Socket.IO. If we hit a bug, we may need to patch or fork. The transport abstraction in Phase W.0 lets us bail back to WebSocket instantly if needed.
4. **Load balancer / CDN path**. If we ever put the game behind a CDN or load balancer, the WebRTC connection still needs a direct path to the game server — the CDN can't proxy it. Not a concern today (Caddy is single-host), flagged for future architecture changes.
5. **Multiple game instances**. If we ever shard into multiple game servers, each needs its own port range and STUN advertisement. Single-server for now.

## Head-of-line blocking — will this actually fix it?

**Yes, for the `tick` and `move` paths**, which are the only two that matter.

The current symptom: a single dropped packet on the WebSocket connection stalls every subsequent message for ~100–300 ms (the TCP retransmit RTT + backoff). During that stall, the client receives no updates at all — no ticks, no projectile spawns, no chat. The player sees a freeze-then-catchup.

After migration: the `tick` channel is unreliable, so a dropped tick is just GONE. The next tick (33 ms later at 30 Hz) delivers fresh state. Client-side prediction handles the gap naturally. The reliable channels (everything else) STILL have their own head-of-line semantics within their reliable stream, but those messages are event-driven and sparse — a 200 ms stall on a `projectileHit` is visible (a delayed hitmark) but not a game-freezing visual jerk. The movement path — which is what players perceive as "the game is stalling" — becomes immune.

Net effect: transient packet loss on the player's connection becomes invisible to gameplay instead of a visible freeze.

## Open questions for VoX

1. **TURN or no TURN?** My recommendation is start without, add coturn if we see failures. Approve?
2. **Deploy parallel (opt-in) or direct cutover?** I suggest Phase W.2 being `?rtc=1`-gated with a few days of bake. Is that acceptable latency for the rollout, or do you want to flip it immediately?
3. **Port range width**: narrow to 10000–10100 (100 concurrent peers) or leave at the default 10000–20000 (10001 peers)? I don't think we'll ever see >100 concurrent players but the wider range is zero effort.
4. **Deprecate WebSocket entirely, or keep as fallback forever?** Simpler code if we rip it; faster revert if we keep it. I lean toward a 2-week parallel run then rip.
