# Strawberry Cow: Survival Mode Design Document

**Core Fantasy:** You are a cow surviving in a persistent pasture. Gather grass, build a barn, craft weapons, defend your turf. Other cows want your stuff.

**Core Loop (30-second cycle):** Gather resources from the world, return to base, craft or upgrade something, venture out again. Every trip outside is a risk/reward decision.

## Implementation Priority

1. Remove round system, enable persistent server state
2. Resource nodes + gathering via knife
3. Inventory system (6+18 slots)
4. Crafting menu with 15 recipes
5. Ammo consumption
6. Base building (6 pieces, wood tier only)
7. Hunger drain
8. Death -> loot bag -> respawn
9. Day/night cycle
10. Stone/metal upgrades, tool cupboard, sleeping bag

Steps 1-5 form the minimum playable loop. Steps 6-8 make it a survival game. Steps 9-10 are polish.

## Systems

### Persistent World
No rounds, no shrinking zone. Players join/leave freely. Server runs continuously.

### Resources (4 types)
- Grass: ground patches (everywhere), bare hooves, 5/hit
- Wood: trees/fences, knife, 10/hit
- Stone: rock nodes, knife, 8/hit
- Metal: scrap piles (rare), knife, 4/hit

Nodes have HP (grass=30, tree=80, rock=100, scrap=60). Respawn after 120s.

### Crafting (15 recipes, instant, C key menu)
Weapons: pistol 50w/30m, shotgun 80w/50m, M16 60w/80m, L96 40w/120m, AUG 80w/100m, M72 50w/150m/30s
Ammo: pistol/M16/AUG mag (30rnd) 10m, shotgun shells (8) 5m/5w, sniper (5) 15m, rocket (1) 30m/10s
Building: wood wall/floor/door 50w, stone 50s, metal 50m
Healing: hay bale (30hp/5s) 20g, grass smoothie (60hp/3s) 40g/10w

### Base Building (6 pieces)
Foundation, Wall, Doorway, Door, Window wall, Roof. Grid-snap placement.
Material tiers: Wood 200HP, Stone 500HP, Metal 1000HP.
Tool Cupboard: 50w/20m, prevents others building within 15 units.

### Hunger
Max 100, drains 0.5/sec (200s full->zero). At 0: 2 dmg/sec. Food restores hunger.

### Day/Night (20min cycle)
12min day, 8min night. Night: reduced light, more fog, hostile bot spawns at borders.

### Death/Respawn
Drop all inventory as loot bag (persists 300s). Respawn in 5s at random or sleeping bag.
Sleeping bag: 30g/20w, sets spawn point.

### Inventory
6 hotbar slots (1-6) + 18 storage. Resources stack (max 500). Weapons don't stack. Ammo stacks (max 120).

### Map (2000x1500)
Biomes: Meadow (center, grass), Forest (north, wood), Quarry (south, stone/metal).
Landmarks: The Barn (center), Milking Station (east), Hay Fields (west), Old Fence (south).

### PvP
No safe zones. Tool cupboards prevent grief-building. Raid with rockets/sustained fire.
Stone walls ~3 rockets, metal ~8. Offline raiding allowed. Combat stats unchanged.
