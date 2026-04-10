# Eliminating Reliable Gameplay Events — Migration Plan

## How Source/GoldSrc Does It

Source uses four distinct networking systems:

1. **Entity Snapshots** — persistent state that affects gameplay rides the delta-compressed tick. Player flags (FL_ONGROUND, FL_DUCKING), weapon state (m_iClip1, owner), entity health, positions. ~90% of bandwidth. Delta-compressed, unreliable.

2. **Temp Entities** — fire-and-forget cosmetic effects sent unreliably. Muzzle flashes, tracers, sparks, explosion visuals, blood sprays. Capped at 32 per tick. If lost, the effect just doesn't play.

3. **UserMessages** — reliable HUD feedback for specific players. Damage indicators, reload animations, "picked up X" notifications. Small, targeted, guaranteed delivery.

4. **Game Events** — broadcast notifications for global UI (kill feed, round state, achievements). Reliable, listened by multiple subsystems.

**The key insight:** Source doesn't send "wallDamaged" events — wall health is a snapshot field that changes. Source doesn't send "jump" events — FL_ONGROUND flag clears in the player snapshot. The client reacts to state changes, not events.

## Our Current Reliable Gameplay Messages

Categorized by how Source would handle them:

### Category A: Should become snapshot state (ride the delta tick)

These represent persistent game state that should be fields in the tick, not separate events. The delta compression system already handles sending only changed fields efficiently.

| Current message | Source equivalent | Migration |
|---|---|---|
| `wallDamaged` | Entity snapshot field `m_iHealth` | Add wall HP array to tick payload |
| `wallDestroyed` | Entity snapshot (entity removed) | Wall HP drops to 0 in tick, client detects and removes |
| `barricadeHit` | Entity snapshot field | Add barricade HP array to tick payload |
| `barricadeDestroyed` | Entity snapshot (entity removed) | Barricade HP drops to 0, client detects and removes |
| `weaponSpawn` | New entity appears in snapshot | Add weapon pickup array to tick payload |
| `weaponDespawn` | Entity removed from snapshot | Weapon absent from tick = client removes it |
| `armorSpawn` | New entity appears in snapshot | Add armor pickup array to tick payload |
| `food` (respawn) | New entity appears in snapshot | Add food array to tick payload |
| `eat` | Entity removed + player foodEaten changes | Food absent from tick + player state change |
| `weaponPickup` | Owner field change in snapshot | Already in tick (weapon/dualWield fields) — client can detect change |
| `weaponDrop` | Owner field change in snapshot | Already in tick — client detects weapon→'normal' |
| `armorPickup` | Entity removed + player armor changes | Armor pickup absent + armor value changes |
| `eliminated` | `m_iHealth` → 0 in snapshot | Already in tick (alive=false). Need to add rank. |
| `dash` | Could be a player flag | Add `dashing` flag to player tick, client detects rising edge |
| `shieldBreak` | Armor → 0 state change | Client detects armor transitioning from >0 to 0 |

### Category B: Should become unreliable temp entities (fire-and-forget visuals)

These are cosmetic one-shot effects. Missing one is acceptable — the next tick's state is still correct.

| Current message | Source equivalent | Migration |
|---|---|---|
| `projectileHit` | `TE_Impact` + `TE_BloodSprite` | Send unreliable. Missing = no hit flash, but damage already applied via snapshot |
| `wallImpact` | `TE_Impact` + `TE_WorldDecal` | Send unreliable. Missing = no spark visual |
| `explosion` | `TE_Explosion` | Send unreliable. Missing = no explosion visual (damage still applied via HP changes) |
| `meleeSwing` | Temp entity | Send unreliable. Missing = no swing sound |
| `meleeHit` | Temp entity | Send unreliable. Missing = no hit sound |
| `shieldHit` | Temp entity | Send unreliable. Missing = no shield flash |
| `mooTaunt` | Temp entity | Already cosmetic. Send unreliable |
| `cowstrikeWarning` | Temp entity | Visual warning. Send unreliable |
| `cowstrike` | Temp entity | Visual effect. Send unreliable |

### Category C: Should stay reliable (keep as-is)

These are HUD feedback or game-wide notifications that must arrive.

| Current message | Source equivalent | Why keep reliable |
|---|---|---|
| `kill` | Game event `player_death` | Kill feed must be accurate |
| `emptyMag` | UserMessage `AmmoDenied` | Player feedback, sendTo |
| `reloaded` | UserMessage `ReloadEffect` | Animation trigger, sendTo |
| `shellLoaded` | UserMessage | Per-shell reload feedback, sendTo |
| `levelup` | UserMessage | Opens perk menu, must arrive |

### Category D: Projectiles — the hard one

**Current approach:** Server broadcasts `projectile` with spawn position/velocity when a shot is fired. Client creates a visual tracer and steps it locally. Server broadcasts `projectileHit` when it hits something.

**How Source does it:** Hitscan weapons are resolved INSTANTLY server-side with lag compensation. The tracer/impact visuals are sent as temp entities. No projectile entity exists on the wire. For projectile weapons (rockets/grenades), they ARE real networked entities — they appear in snapshots with position updated every tick.

**Our options:**

**Option 1: Hitscan conversion (recommended for most weapons)**
Most of our weapons are effectively hitscan — the projectile travels so fast it resolves within 1-3 ticks. Convert these to instant server-side resolution:
- Server fires the weapon → resolves hit immediately (with lag comp) → applies damage
- Send tracer visual as unreliable temp entity (spawn pos, impact pos, weapon type)
- Client draws the tracer from the visual data, no local projectile stepping
- Eliminates `projectile` messages entirely for hitscan weapons

**Option 2: Snapshot entities for slow projectiles**
For truly slow projectiles (cowtank rocket, M72 LAW):
- Add active projectiles to the tick snapshot as a separate entity array
- Client interpolates projectile positions from snapshot data (via SI)
- No separate `projectile` spawn message needed — they just appear in the next tick
- `projectileHit` becomes a temp entity or inferred from projectile disappearing + explosion state

## Implementation Plan

### Phase 1: World state in tick (walls, barricades, food, weapons, armor)

Add arrays of world entities to the tick payload:

```js
const tickPayload = {
  type: 'tick',
  tickNum, snapSeq, snapshot, zone: tickZone, gameTime,
  // World entity state:
  walls: walls.map(w => ({ id: w.id, hp: w.hp })),          // only id + hp, position is static
  barricades: barricades.map(b => ({ id: b.id, hp: b.hp })), // same
  foods: foods.map(f => ({ id: f.id })),                      // presence = exists, absence = eaten
  weaponPickups: weaponPickups.map(w => ({ id: w.id, x: w.x, y: w.y, weapon: w.weapon })),
  armorPickups: armorPickups.map(a => ({ id: a.id, x: a.x, y: a.y })),
};
```

**Delta compression handles this automatically** — only changed fields are sent. A wall that lost HP sends `{id, hp}`. A food that was eaten is absent (detected via `removedIds` pattern). A new weapon spawn appears as a new entry.

**Client changes:** Instead of handling `wallDamaged`, `barricadeHit`, `eat`, `food`, `weaponSpawn`, `weaponDespawn`, `armorSpawn` events, the client diffs the current tick's world state against its cached state:
- Wall HP changed → play damage visual
- Wall absent → play destruction visual  
- Food absent → play eat effect (if player was near it)
- New weapon pickup → spawn the pickup model
- Weapon pickup absent → remove the model

**Messages eliminated:** `wallDamaged`, `wallDestroyed`, `barricadeHit`, `barricadeDestroyed`, `food`, `eat`, `weaponSpawn`, `weaponDespawn`, `armorSpawn`, `armorPickup`, `weaponPickup`, `weaponDrop`, `shieldBreak`

**Messages removed from S2C enum:** 13 types

### Phase 2: Player event flags in tick

Add transient flags to the player tick for one-shot events:

```js
function getPlayerTick(p) {
  return {
    ...existingFields,
    // Event flags — set to true for ONE tick, then cleared.
    // Client detects rising edge to trigger visuals/audio.
    justDashed: p._justDashed || false,
    justEliminated: p._justEliminated || false,
    eliminatedRank: p._eliminatedRank || 0,
  };
}
```

After building the tick, clear the flags:
```js
for (const [, p] of gameState.getPlayers()) {
  p._justDashed = false;
  p._justEliminated = false;
}
```

**Client detects state transitions** for events that don't need explicit flags:
- `alive` went from true→false: player was eliminated
- `armor` went from >0 to 0: shield broke
- `weapon` changed: weapon picked up or dropped

**Messages eliminated:** `dash`, `eliminated`, `shieldBreak`

### Phase 3: Unreliable temp entities

Convert visual-only messages to unreliable sends:

```js
// server/network.js — new helper for temp entities
function broadcastUnreliable(data) {
  transport.broadcastUnreliable(data);
}
```

Convert these to unreliable:
- `projectileHit` → `broadcastUnreliable(...)` — hit spark/blood
- `wallImpact` → `broadcastUnreliable(...)` — wall spark
- `explosion` → `broadcastUnreliable(...)` — explosion visual
- `meleeSwing` → `broadcastUnreliable(...)` — swing sound
- `meleeHit` → `broadcastUnreliable(...)` — hit sound
- `shieldHit` → `broadcastUnreliable(...)` — shield flash
- `mooTaunt` → `broadcastUnreliable(...)` — moo visual/sound
- `cowstrikeWarning` / `cowstrike` → `broadcastUnreliable(...)` — visual effects

**No client code changes needed** — the handler is the same regardless of reliability. We just accept that a dropped packet means a missing visual effect.

### Phase 4: Projectile consolidation

**Hitscan weapons** (normal, P250, MP5K, AK, SKS, Thompson, AUG, M16, L96):
- Remove `projectile` broadcast for these
- Add an unreliable `tracer` temp entity: `{ type: 'tracer', fromX, fromY, fromZ, toX, toY, toZ, weapon }`
- Client draws visual tracer from the data, no local stepping
- Hit detection already happened server-side, damage applied via player state

**Slow projectiles** (cowtank/M72 LAW rocket):
- Add `activeProjectiles` array to tick payload
- Each entry: `{ id, x, y, z, weapon }` (position updated every tick)
- Client interpolates via SI or simple lerp
- When projectile disappears from tick + explosion appears → client plays explosion at last known position

### Phase 5: Bandwidth impact

**Current:** Each of these events is ~30-80 bytes, sent reliably (TCP guarantees delivery + ordering overhead). During combat with 16 players, a busy tick might have 10-20 events alongside the tick broadcast.

**After:** All this data rides the delta-compressed tick. World entity arrays are delta'd — only changed entries are sent. Event flags are booleans that delta to zero on the next tick. Temp entities are unreliable (no TCP overhead).

Estimated savings:
- Eliminate ~15 reliable message types from the hot path
- Reduce reliable-channel traffic by ~60-80% during combat
- World state in tick adds ~100-200 bytes per tick (delta'd to near-zero when nothing changes)

## Files Changed

| File | Change |
|------|--------|
| `server/game.js` | Add world entities to tick payload. Clear event flags after broadcast. |
| `server/player.js` | Add event flags to getPlayerTick(). Set flags in eliminatePlayer(). |
| `server/combat.js` | Switch projectileHit/wallImpact/explosion/meleeHit/shieldHit to broadcastUnreliable. Remove projectile broadcast for hitscan. Add tracer temp entity. |
| `server/weapons.js` | Remove weaponPickup/weaponDrop broadcasts. |
| `server/spawning.js` | Remove food/weaponSpawn/armorSpawn broadcasts. |
| `server/network.js` | Add more types to UNRELIABLE_TYPES or add broadcastUnreliable helper. |
| `client/message-handlers.js` | Add world-state diff logic in tick handler. Remove 13+ event handlers. Add tracer handler. |
| `shared/messages.js` | Remove eliminated message types from S2C. |

## Implementation order

1. **Phase 3 first** (unreliable temp entities) — lowest risk, no state changes, just change reliable→unreliable on visual-only messages
2. **Phase 2** (event flags) — small addition to tick, removes a few event types
3. **Phase 1** (world state in tick) — biggest change, most message types eliminated
4. **Phase 4** (projectile consolidation) — most complex, touches combat core

Each phase is independently shippable and testable.

## What stays reliable (not touched)

- `kill` — kill feed accuracy
- `emptyMag` / `reloaded` / `shellLoaded` — player HUD feedback (sendTo)
- `levelup` — perk menu trigger (sendTo)
- `inputAck` — prediction reconciliation
- `lobby` / `start` / `spectate` / `joined` / `restart` / `winner` — lifecycle
- `chat` — text delivery
- `kicked` / `newHost` / `botsToggled` / `nightToggled` — admin
- `barricadePlaced` — needs position data for client physics (could move to tick later)
