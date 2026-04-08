# Strawberry Cow BR — Code Restructuring Plan

## Current State

- `server3d.js` — ~1,126 lines, Node.js WebSocket game server (all logic in one file)
- `dist/fps.html` — ~1,519 lines, single HTML file with inline CSS + Three.js client module
- `package.json` — CommonJS, only dependency is `ws`
- No build tooling, no bundler, no module system on client

---

## 1. Server-Side Restructuring (`server3d.js` -> `server/`)

### Proposed Directory Structure

```
server/
  index.js              — entry point: creates HTTP server, WebSocket server, starts lobby
  config.js             — constants (PORT, TICK_RATE, MAP_W, MAP_H, COLORS, FOOD_TYPES, WEAPON_TYPES, BOT_NAMES)
  state.js              — mutable game state container (players, foods, projectiles, zone, timers, counters)
  network.js            — broadcast(), sendTo(), WebSocket connection handler, message router
  lobby.js              — lobby state machine: startLobby(), lobbyTick(), checkAllReady(), getLobbyPlayers()
  game.js               — startGame(), gameTick(), checkWinner(), restart logic
  player.js             — player creation, eliminatePlayer(), assignColor(), getPlayerStates()
  combat.js             — attack handler (all weapon fire logic), projectile updates, bump PVP, dash, cowstrike
  weapons.js            — weapon pickup/drop logic, armor pickup logic, fireBot()
  perks.js              — perk application logic (the big if/else chain in the 'perk' message handler)
  map.js                — generateMap(), WALLS/MUD/PONDS/PORTALS/SHELTERS generation
  spawning.js           — spawnFood(), spawnGoldenFood(), spawnWeaponPickup(), spawnInitialFood()
  bots.js               — spawnBots(), updateBots(), bot AI decision tree
  utils.js              — rand()
```

### Module Groupings (what moves where)

| Module | Lines (approx) | Key Functions |
|--------|----------------|---------------|
| `config.js` | ~30 | All constants, type definitions |
| `state.js` | ~20 | Exported mutable state object that other modules reference |
| `network.js` | ~80 | WS connection handler, message dispatch, broadcast/sendTo |
| `lobby.js` | ~60 | Lobby countdown, ready checks, lobby→game transition |
| `game.js` | ~100 | Game tick orchestration, zone shrinking, winner check, restart |
| `player.js` | ~60 | Player init, elimination, serialization |
| `combat.js` | ~250 | Attack processing (all weapon types), projectile physics, bump combat, dash |
| `weapons.js` | ~50 | Pickup/drop handlers, armor pickups |
| `perks.js` | ~50 | Perk selection and stat application |
| `map.js` | ~80 | Procedural map generation |
| `spawning.js` | ~50 | Food/weapon/armor spawning |
| `bots.js` | ~130 | Bot AI, fireBot() |
| `utils.js` | ~5 | rand() helper |

### Key Design Decisions

- **Shared state object**: `state.js` exports a single mutable object (`{ players, foods, projectiles, zone, gameState, ... }`). All modules import and mutate this directly. This mirrors the current global variable pattern with minimal refactoring risk.
- **No class hierarchy**: Keep it functional. The current code uses plain objects and Maps — no reason to introduce classes.
- **Message routing**: `network.js` handles the WebSocket `on('message')` and dispatches to the appropriate module function based on `msg.type`. This replaces the giant switch-like if chain in the current connection handler.

---

## 2. Client-Side Restructuring (`dist/fps.html` -> `client/`)

### Build Tool: esbuild

**Why esbuild over alternatives:**
- Zero config needed for basic JS bundling
- Sub-second builds (fast iteration)
- Native ESM support (the client already uses `import * as THREE`)
- No complex plugin ecosystem to learn
- Output is a single bundled JS file that gets loaded by a minimal HTML shell

**Why not Vite:** Vite is great for dev servers, but this game already has its own WebSocket server. Adding a second dev server with HMR proxying adds complexity for minimal benefit at this scale. esbuild's watch mode + a simple file serve is sufficient.

**Why not raw ES modules:** The current CDN import map (`three` from jsdelivr) works, but splitting into many files would mean either a complex import map or switching to npm-installed Three.js. esbuild handles this cleanly.

### Proposed Directory Structure

```
client/
  index.html            — minimal HTML shell (just DOM structure + styles + <script src="bundle.js">)
  index.js              — entry point: imports all modules, calls connect() and requestAnimationFrame(loop)
  config.js             — constants (MW, MH, CH, COL, FOOD_E, WPCOL, weapon name maps)
  state.js              — client state (ws, myId, serverPlayers, serverFoods, projData, keys, yaw, pitch, etc.)
  network.js            — connect(), send(), handleMsg() dispatcher
  audio.js              — AudioContext init, sfx(), all sound effects (sfxShoot, sfxBolty, etc.), music system
  input.js              — keyboard handler, mouse/pointer lock, mobile touch controls, doAttack(), doDash()
  renderer.js           — Three.js scene setup, camera, lights, skybox, clouds, resize handler
  terrain.js            — heightMap generation, getTerrainHeight(), ground mesh, fence building
  entities.js           — buildCow(), cow mesh management, update loop for cow positions/health bars
  map-objects.js        — buildMap() (walls, portals, shelters/barns), buildTower(), tower height calc
  weapons-view.js       — viewmodel scene, buildViewmodel() for each weapon type, updateViewmodel()
  pickups.js            — weapon pickup rendering, armor pickup rendering, food rendering
  projectiles.js        — projectile mesh creation, update, cleanup
  effects.js            — cowstrike visuals (fireballs, explosions, camera shake), dash smoke, hit flash, particles
  hud.js                — HUD updates (hunger bar, armor bar, XP bar, score, weapon display, killfeed, minimap)
  zone.js               — zone wall rendering, ground overlay
  ui.js                 — join screen, lobby screen, ready button, win screen, perk menu, spectate message
dist/
  index.html            — build output (copied from client/index.html)
  bundle.js             — esbuild output
  models/               — existing FBX models (unchanged)
```

### Module Groupings

| Module | Lines (approx) | Responsibility |
|--------|----------------|----------------|
| `index.html` | ~70 | Pure DOM: all div/canvas elements + CSS styles |
| `audio.js` | ~80 | All Web Audio API code, music playback |
| `input.js` | ~100 | All event listeners (keyboard, mouse, touch), pointer lock |
| `renderer.js` | ~50 | Three.js boilerplate (scene, camera, lights, skybox) |
| `terrain.js` | ~80 | Heightmap, ground mesh, fence |
| `entities.js` | ~100 | Cow mesh building, per-frame cow updates |
| `map-objects.js` | ~200 | Walls, tower, shelters (the biggest visual chunk) |
| `weapons-view.js` | ~120 | First-person viewmodel for each weapon |
| `pickups.js` | ~80 | Food, weapon, armor pickup rendering |
| `projectiles.js` | ~50 | Projectile mesh lifecycle |
| `effects.js` | ~150 | All particle effects, camera shake, cowstrike visuals |
| `hud.js` | ~60 | DOM-based HUD updates |
| `ui.js` | ~80 | Screens (join, lobby, win), perk menu |
| `network.js` | ~60 | WebSocket connection + message dispatch |
| `state.js` | ~30 | All mutable client state |
| `config.js` | ~15 | Constants |

### Build Setup

```json
// package.json additions
{
  "scripts": {
    "build:client": "esbuild client/index.js --bundle --outfile=dist/bundle.js --format=esm --external:three --external:three/*",
    "watch:client": "esbuild client/index.js --bundle --outfile=dist/bundle.js --format=esm --external:three --external:three/* --watch",
    "dev": "npm run watch:client & node server/index.js",
    "start": "node server/index.js"
  }
}
```

Three.js stays as a CDN import (via import map in index.html) — no need to npm-install it. esbuild's `--external` flag preserves the bare `three` imports so the browser import map resolves them.

---

## 3. Shared Code

### Currently Duplicated Logic

| Logic | Server Location | Client Location | Shareable? |
|-------|----------------|-----------------|------------|
| Map dimensions (MW=2000, MH=1500) | `server3d.js:6` | `fps.html:77` | Yes — `shared/config.js` |
| Color map | `server3d.js:7` | `fps.html:314` | Partially (server uses names, client uses hex) |
| Weapon types/names | `server3d.js:33` | `fps.html:730-731` | Yes |
| Food type names | `server3d.js:8-16` | `fps.html:315` | Yes (names only) |
| Terrain heightmap formula | Not on server | `fps.html:232` | No (server is 2D, client is 3D) |

### Recommendation

Create a minimal `shared/` directory:

```
shared/
  constants.js          — MAP_W, MAP_H, WEAPON_TYPES, FOOD_TYPES (names), COLORS
```

Keep it small. The server and client are fundamentally different (2D physics vs 3D rendering), so most logic is NOT actually duplicable. The shared constants prevent drift (e.g., adding a weapon type to server but forgetting the client name mapping).

Both server and client can import from `shared/` — esbuild will bundle it into the client, and Node.js can require/import it directly.

---

## 4. Migration Strategy

### Guiding Principle

**One module at a time, always deployable.** Each step should leave the game fully functional.

### Phase 1: Server Extraction (lowest risk)

The server has no build step — extracting modules is just moving functions into files and adding require/exports.

1. **Create `server/config.js` and `server/utils.js`** — extract constants and `rand()`. Update `server3d.js` to import them. Test.
2. **Create `server/state.js`** — move all `let` game state variables into an exported object. Update all references in `server3d.js`. Test.
3. **Extract `server/map.js`** — `generateMap()` + wall/feature arrays. Test.
4. **Extract `server/bots.js`** — `spawnBots()`, `updateBots()`, `fireBot()`. Test.
5. **Extract `server/spawning.js`** — food/weapon spawn functions. Test.
6. **Extract `server/player.js`** — `eliminatePlayer()`, `assignColor()`, `getPlayerStates()`. Test.
7. **Extract `server/combat.js`** — attack handling, projectile updates, bump PVP. This is the biggest and most intertwined chunk — do it last on the server side. Test.
8. **Extract `server/lobby.js`** and `server/game.js`** — game state machine. Test.
9. **Extract `server/network.js`** — WS handler and message routing. Move `server3d.js` -> `server/index.js`. Test.
10. **Delete `server3d.js`**, update any start scripts / systemd unit.

**Testing at each step:** Run the existing `test.js` harness + manual play-test. The game tick runs at 20Hz so regressions are immediately obvious.

### Phase 2: Client Build Setup

1. **Install esbuild** — `npm install --save-dev esbuild`
2. **Create `client/index.html`** — copy just the HTML/CSS from `fps.html`, replace the `<script type="module">` block with `<script type="module" src="bundle.js"></script>` (keeping the import map for Three.js).
3. **Create `client/index.js`** — copy the entire `<script>` contents from `fps.html` as-is. Verify esbuild builds it and the game works identically.
4. **Add build scripts** to `package.json`.

### Phase 3: Client Extraction

Extract modules one at a time from `client/index.js`, rebuild after each:

1. **`client/config.js`** and **`client/state.js`** — constants and mutable state.
2. **`client/audio.js`** — self-contained, no dependencies on other game code.
3. **`client/renderer.js`** — Three.js scene setup (scene, camera, lights, skybox).
4. **`client/terrain.js`** — heightmap and ground mesh.
5. **`client/input.js`** — all event listeners.
6. **`client/network.js`** — WebSocket connection.
7. **`client/hud.js`** and **`client/ui.js`** — DOM manipulation.
8. **`client/entities.js`** — cow mesh building and updates.
9. **`client/map-objects.js`** — walls, tower, shelters.
10. **`client/weapons-view.js`** — first-person viewmodels.
11. **`client/pickups.js`** — food/weapon/armor rendering.
12. **`client/projectiles.js`** — projectile rendering.
13. **`client/effects.js`** — visual effects (cowstrike, particles, etc.).
14. **`client/zone.js`** — zone wall rendering.

### Phase 4: Shared Constants

1. Create `shared/constants.js` with map dimensions, weapon types, food types.
2. Update server modules to import from `shared/`.
3. Update client modules to import from `shared/`.
4. Verify esbuild bundles the shared code correctly.

### Rollback Plan

At any point, the old `server3d.js` and `dist/fps.html` can be restored from git. Each phase is a series of small commits. If a step breaks something, revert that single commit.

---

## Final Directory Structure

```
strawberrycow/
  package.json
  shared/
    constants.js
  server/
    index.js
    config.js
    state.js
    network.js
    lobby.js
    game.js
    player.js
    combat.js
    weapons.js
    perks.js
    map.js
    spawning.js
    bots.js
    utils.js
  client/
    index.html
    index.js
    config.js
    state.js
    network.js
    audio.js
    input.js
    renderer.js
    terrain.js
    entities.js
    map-objects.js
    weapons-view.js
    pickups.js
    projectiles.js
    effects.js
    hud.js
    ui.js
    zone.js
  dist/
    index.html          (copied from client/)
    bundle.js           (esbuild output)
    models/
      M16_ps1.fbx
      Sniper.fbx
  test.js
```
