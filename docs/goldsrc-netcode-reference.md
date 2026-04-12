# GoldSrc/Source Engine Netcode Reference

Technical reference for Counter-Strike / Half-Life netcode. Covers every technique Valve uses for real-time FPS networking.

## Transport & Wire Format

GoldSrc/Source uses **UDP/IP exclusively** — no TCP. The core philosophy, inherited from Quake: "any information not received on first transmission is not worth sending again because it will be too old." Reliability is layered on top via a custom **NetChannel** abstraction:

- **Unreliable messages**: Game state snapshots, entity updates. Lost packets are never retransmitted; the next snapshot supersedes them.
- **Reliable messages**: Critical events (disconnect, level transitions, resource downloads). NetChannel implements ack-based guaranteed delivery with sequencing — each reliable message gets a sequence number, receiver acks it, sender retransmits until acked.

Packets are **pre-fragmented to ~1400 bytes** to avoid router-level fragmentation at the 1500-byte MTU. Wire format uses **Huffman compression** with pre-computed frequency tables.

Each packet carries **ack numbers in both directions** — the server tags outgoing snapshots with a sequence ID, and the client's next packet includes the last sequence it received. This ack chain drives delta compression baseline advancement.

## Client-Side Prediction

The client runs **the same simulation code as the server** for local player movement. Each tick, the client samples keyboard/mouse state into a **usercmd** (`CUserCmd` struct) containing:
- Movement direction (forward/side/up)
- View angles (pitch/yaw/roll)
- Button bitmask (fire, jump, duck, etc.)
- Impulse commands
- Tick timestamp

Usercmds are stored in a **circular ring buffer** (`CInput::PerUserInput_t::m_pCommands`).

The prediction loop:
1. Start from the last **server-acknowledged state** (most recent snapshot confirming your position).
2. **Replay all unacknowledged usercmds** from the ring buffer against local physics — `CPrediction::RunSimulation` invokes `C_BasePlayer::PhysicsSimulate` for each.
3. The result is the predicted current position, rendered immediately with zero perceived latency.

Usercmds are sent to the server at `cl_cmdrate` (default 30/sec). Multiple usercmds are **bundled per packet** and **delta-compressed** against each other using `WriteUsercmdDeltaToBuffer`. The client sends redundant recent commands so the server can reconstruct the input queue even after packet loss.

## Server-Side Processing

The server runs a fixed-timestep simulation at `sv_tickrate` (66.67 in CS:S/TF2, 64 in CS:GO, 30 in L4D). Each tick:

1. **Process incoming usercmds** from all clients — each executed in sequence, advancing the player's authoritative state.
2. **Run physics simulation** — collision, projectiles, game logic.
3. **Check game rules** — scoring, round state.
4. **Capture world snapshot** — complete authoritative state of all entities.

The server throttles per-client update frequency via `cl_updaterate` (client-requested, clamped by `sv_minupdaterate`/`sv_maxupdaterate`). A client requesting 20 updates/sec gets a snapshot every ~50ms regardless of tickrate.

## Entity Interpolation

Only the local player is predicted. All other entities are rendered **in the past** using interpolation between two buffered snapshots. The interpolation delay:

```
lerp = max(cl_interp, cl_interp_ratio / cl_updaterate)
```

Default `cl_interp` is 0.1 (100ms). With `cl_interp_ratio 2` and `cl_updaterate 64`, lerp = 31.25ms.

The client maintains a buffer of recent snapshots. For each remote entity, it finds two snapshots straddling `current_time - lerp` and linearly interpolates position, angles, and animation. This smooths over jitter and single-packet loss — with ratio 2, losing one packet still leaves two valid snapshots to interpolate between.

When data is missing beyond the buffer, **extrapolation** kicks in (`cl_extrapolate 1`), projecting from the last known velocity. Capped at 0.25 seconds (`cl_extrapolate_amount`) because extrapolation diverges quickly.

## Server Reconciliation

When the server processes a usercmd and sends back a snapshot, it includes the **last usercmd sequence number it executed**. The client compares the server's authoritative position against what it predicted for that same usercmd tick (looked up in the ring buffer).

On **mismatch**: the client snaps its internal state to the server's authoritative position, then **replays all subsequent usercmds** the server hasn't acknowledged yet. This "snap + replay" corrects prediction while maintaining responsiveness.

To avoid visual popping, **error smoothing** interpolates the camera from the wrong position to the corrected one over `cl_smoothtime` seconds (toggleable with `cl_smooth`). Visualize prediction errors with `cl_showerror 1`.

## Lag Compensation

The signature GoldSrc/Source innovation. The server maintains a **position history buffer** for every player — storing hitbox positions for the last ~1 second of ticks.

When processing a fire usercmd, the server calculates:

```
command_execution_time = current_server_time - packet_latency - client_view_interpolation
```

It then **rewinds all other players' hitboxes** to their positions at `command_execution_time`, performs the hit trace, then **restores everyone to present positions**. The shooting player hits what they saw on their screen — "you hit what you see."

The server factors each client's interpolation amount into rewind depth. Higher `cl_interp` = deeper rewind. At extreme values (interp abuse), players can shoot around corners they've already passed on the server's timeline.

**Peeker's advantage**: the peeker sees the defender before the defender's client interpolates the peeker into view, giving an inherent advantage proportional to peeker's latency + interp.

Hit detection is **server-side only** to prevent cheating. `sv_showimpacts 1` visualizes client-side (red) vs server-side (blue) hitbox positions.

## Delta Compression

The server maintains a **per-client snapshot history** — 32 recent snapshots in a cycling array. When sending an update:

1. Look up the last snapshot the client **acknowledged** (via ack sequence in incoming packets).
2. Compare current world state against that baseline field-by-field.
3. Send only changed fields, each preceded by a **1-bit marker** (1 = changed, 0 = unchanged).

Field comparison uses a `netField_t` descriptor array with preprocessor-generated offsets — **blind memory comparison** at each offset/size without understanding field semantics.

If the baseline is **lost** (client never acked, or ack cycled out of the 32-slot history), the server sends a full state (keyframe) against a dummy all-zeros baseline.

## Bandwidth Management

Three client-side cvars:

- **`rate`** — Maximum bytes/sec the client can receive (4500 for modem, 10000+ for broadband). Most critical setting.
- **`cl_updaterate`** — Requested snapshots/sec from server (default 20). Server clamps via `sv_minupdaterate`/`sv_maxupdaterate`.
- **`cl_cmdrate`** — Usercmd packets/sec to server (default 30). Should match tickrate for best responsiveness.

Server enforces per-client throttling via `sv_minrate`/`sv_maxrate`. If a delta snapshot exceeds the client's rate budget, the server **skips that update** — the interpolation buffer absorbs the gap.

Large snapshots exceeding ~1400 bytes are fragmented across multiple UDP packets with NetChannel reassembly.

## How our game compares

| Technique | GoldSrc/Source | Strawberry Cow |
|-----------|---------------|----------------|
| Transport | UDP + custom reliability | WS (TCP) + geckos.io (WebRTC/UDP) |
| Prediction | Full client-side, shared simulation | Full client-side, shared `stepPlayerMovement` |
| Reconciliation | Seq-based ring buffer + Bernier replay | Seq-based ring buffer + Bernier replay |
| Entity interpolation | cl_interp buffer, 100ms default | SI library, 100ms buffer |
| Lag compensation | Server-side position history + time rewind | Server-side position history + displayTick rewind |
| Delta compression | Per-client ack-based field deltas | Per-client ack-based field deltas (same design) |
| Error smoothing | cl_smooth / cl_smoothtime | Linear decay render offset, 150ms |
| Wire format | Huffman + delta | MessagePack binary (WS + geckos raw) |

Key sources: Yahn Bernier's 2001 GDC paper "Latency Compensating Methods in Client/Server In-game Protocol Design and Optimization," Valve Developer Community wiki, Fabien Sanglard's Quake 3 network model reviews.
