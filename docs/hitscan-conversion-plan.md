# Delayed Hitscan Conversion Plan

## Concept

Replace physics-simulated projectile entities with **delayed hitscan** for all bullet weapons. The server resolves hits instantly via ray trace (zero projectile entities, zero per-tick physics), but delays damage application by `distance / bulletSpeed` to preserve the feel of bullet travel time. The client draws cosmetic tracers that visually fly at the bullet's speed.

## Why

- **Performance**: each projectile entity runs physics + hit detection every tick. At 1200 RPM (minigun), that's 20 entities/sec × 3s lifetime = 60 active entities per player. Hitscan: zero entities.
- **Simplicity**: no projectile lifecycle management, no spawn/despawn broadcasts, no client-side projectile stepping.
- **Determinism**: hits are resolved in one computation, not spread across multiple ticks of integration.

## Server Architecture

### `fireHitscan(shooter, weapon, aim, stats, opts)`

New function in `server/weapon-fire.js`. Called from `handleAttack` in `combat.js` for all non-projectile weapons.

```
1. Compute ray origin: shooter position + eye height
2. Compute ray direction: aim vector (normalized)
3. Apply lag compensation: rewind all players to shooter's serverTime via SI vault
4. For each target along the ray (sorted by distance):
   a. Compute travelTime = distance / bulletSpeed
   b. Compute gravityDrop = 0.5 * GRAVITY * travelTime²
   c. Adjust ray Z by -gravityDrop at target's distance
   d. Check intersection with target's hitbox (capsule, same as current)
   e. If hit:
      - Compute damage (headshot multiplier, armor, etc.)
      - Schedule damage via setTimeout(applyDamage, travelTime * 1000)
      - Record hit info for tracer broadcast
      - Break (first hit stops the ray, unless wall-piercing)
5. If no player hit, check wall/barricade/terrain intersection:
   a. Same drop-adjusted ray
   b. Record impact point for tracer
6. Broadcast unreliable tracer:
   {type: 'tracer', fromX, fromY, fromZ, toX, toY, toZ, weapon, travelTime,
    ownerId, color, hit: targetId|null, headshot, shotgunPellet}
```

### Bullet Drop Model

Real-world-style ballistic drop computed analytically:

```
travelTime = distance / bulletSpeed
drop = 0.5 * GRAVITY * travelTime²
```

At GRAVITY = 600 (our game's gravity constant):
- P250 (1294 u/s) at 500 units: t=0.39s, drop=45 units (significant)
- AK (2467 u/s) at 500 units: t=0.20s, drop=12 units (noticeable)
- L96 (16800 u/s) at 500 units: t=0.03s, drop=0.3 units (negligible)
- Minigun (3312 u/s) at 500 units: t=0.15s, drop=7 units (minor)

Slower weapons have meaningful drop. Fast weapons are effectively flat. This matches our current projectile physics but computed in one step instead of 10-20 tick iterations.

### Delayed Damage

```js
const travelTime = distance / stats.speed;
gameState.scheduleRoundTimer(() => {
  // Re-check target is still alive (may have died during travel)
  const target = gameState.getPlayer(targetId);
  if (!target || !target.alive) return;
  // Apply damage through the standard pipeline
  applyHungerDelta(target, -damage, shooter.id);
  // Armor/shield handling
  if (target.armor > 0) applyArmorDelta(target, -damage * 0.5);
  // Broadcast hit visual (unreliable)
  broadcast({ type: 'projectileHit', ... });
}, travelTime * 1000);
```

The damage arrives after the bullet "would have" reached the target. At close range this is near-instant. At max range it's up to ~1.5 seconds for slow weapons.

### Shotgun Hitscan

10 rays per shot, each with random spread (same cone as current). Each ray independently traces and resolves. Each hit is independently delayed. Broadcast sends one tracer per pellet (same as current shotgun pellet broadcast).

### Wall Penetration (L96)

The L96's wallPiercing flag means the ray continues through walls. For hitscan: after hitting a wall, continue the ray with reduced damage. Check the next player/wall along the same line.

## Client Architecture

### Tracer Renderer

Replace the physics-stepped projectile renderer with a simpler from→to interpolation:

```js
// On receiving tracer message:
tracers.push({
  fromX, fromY, fromZ, toX, toY, toZ,
  speed: bulletSpeed,
  weapon, color,
  startTime: performance.now(),
  travelTime: msg.travelTime * 1000, // ms
  hit: msg.hit,
  headshot: msg.headshot,
});

// Each frame:
for (const t of tracers) {
  const elapsed = performance.now() - t.startTime;
  const progress = Math.min(1, elapsed / t.travelTime);

  // Position: lerp from→to with gravity curve
  const x = t.fromX + (t.toX - t.fromX) * progress;
  const y = t.fromY + (t.toY - t.fromY) * progress;
  const drop = 0.5 * 600 * (progress * t.travelTime / 1000) ** 2;
  const z = t.fromZ + (t.toZ - t.fromZ) * progress - drop;

  // Update mesh position
  mesh.position.set(x, z, y); // three.js Y-up

  // On arrival: play impact effect, dispose tracer
  if (progress >= 1) {
    playImpactEffect(t);
    dispose(t);
  }
}
```

### Own-Shot Tracers

For the shooter's own tracers, spawn from the camera muzzle offset (same as current). The `from` position in the server broadcast is camera-center; the client overrides it with the muzzle position for own shots. The `to` position is the server's computed impact point — this is where the bullet actually lands.

### Tracer Visual

Same bullet mesh as current (cone + casing + glow trail). The mesh travels along the from→to path with gravity curve. Simpler than the current vx/vy physics stepping because the endpoint is known at spawn time.

## What Stays as Real Projectiles

| Weapon | Why |
|--------|-----|
| M72 LAW (cowtank) | Explosive — needs blast radius at impact location, slow enough to dodge |
| Future rocket launchers | Same |
| Grenades (if added) | Arc physics, bouncing |

## What Converts to Hitscan

| Weapon | Current Speed | Travel Time (500u) | Drop (500u) |
|--------|-------------|-------------------|-------------|
| P250 (normal) | 1294 | 0.39s | 45u |
| MP5K | 1294 | 0.39s | 45u |
| Thompson | 1311 | 0.38s | 44u |
| Python | 5520 | 0.09s | 2.4u |
| M16 (burst) | 3643 | 0.14s | 5.7u |
| AUG | 4908 | 0.10s | 3.1u |
| AK | 2467 | 0.20s | 12u |
| SKS | 3381 | 0.15s | 6.6u |
| Shotgun (XM1014) | 1380 | 0.36s | 39u |
| L96 (bolty) | 16800 | 0.03s | 0.3u |
| M249 | 3312 | 0.15s | 6.8u |
| Minigun | 3312 | 0.15s | 6.8u |

## Implementation Phases

### Phase 1: Core hitscan function + minigun conversion
- Implement `fireHitscan()` in weapon-fire.js
- Ray trace with drop + delayed damage
- Unreliable `tracer` broadcast
- Convert minigun only
- Client: simple tracer renderer for hitscan tracers
- Keep old projectile system running for all other weapons

### Phase 2: Client tracer polish
- Muzzle offset for own shots
- Gravity curve on tracer path
- Impact effects (spark/blood) on arrival
- Weapon-specific tracer appearance (bolty glow trail, shotgun spread)

### Phase 3: Convert remaining weapons
- Convert one weapon at a time, test each
- Order: L96 (simplest — nearly instant), python, SKS, AK, M16, AUG, M249, MP5K, thompson, P250, shotgun (most complex — 10 rays)
- Remove projectile code for each converted weapon

### Phase 4: Remove old projectile system
- Once all bullet weapons are hitscan, the projectile stepping in combat.js only runs for rockets
- Simplify `updateProjectiles` to only handle explosive projectiles
- Remove the `projectile` S2C message type entirely
- Remove client projectile physics stepping

## Messages

### New: `tracer` (unreliable)
```js
{
  type: 'tracer',
  fromX, fromY, fromZ,  // ray origin (shooter position)
  toX, toY, toZ,        // impact point (player/wall/terrain/max range)
  weapon,               // for visual styling
  ownerId,              // for muzzle offset on own shots
  color,                // shooter color for tracer tint
  travelTime,           // seconds — client uses for animation speed
  hit: targetId | null, // who was hit (for blood vs spark)
  headshot: bool,       // headshot indicator
  shotgun: bool,        // pellet flag (skip extra sounds)
}
```

### Removed (after full conversion): `projectile`
Currently reliable. After Phase 4, no longer needed.

## Risk

- **Delayed damage timing**: `setTimeout` for damage means the damage applies outside the tick loop. Need to use `gameState.scheduleRoundTimer` so round-end cleanup cancels pending damage.
- **Shotgun 10-ray cost**: 10 ray traces per shot is more CPU per-fire than the current 10 projectile spawns, but eliminates 10 × 30Hz physics steps. Net win.
- **Wall collision**: ray-vs-AABB is cheaper than per-tick segment-vs-AABB, but needs to handle the same edge cases (barricade OBB, terrain height).
- **Existing ballistics.js**: the ray trace can reuse `findPlayerHit` and `segVsWalls` by treating the hitscan as a very long single-tick segment.
