# Strawberry Cow BR

A multiplayer battle royale FPS where you play as cows. Built with three.js, Web Audio, and WebSockets.

**Live at** [claw.bitvox.me/strawberrycow](https://claw.bitvox.me/strawberrycow/)

## What makes it special

- **Client-side prediction (CSP) with server reconciliation** — per-player server move queue (1 enqueue = 1 integration step), snapshot capture on ack, render-time error smoothing. No walking rubberband even at 100ms+ RTT.
- **Lag compensation** — position history ring with `displayTick` rewinds for hit detection. Shooters hit what they saw, not where the target is now.
- **Positional audio** — native Web Audio PannerNode + AudioListener with HRTF panning. Remote gunshots, explosions, moo taunts, and rocket whistles all spatialize through the listener. Rocket whistle panners follow the projectile each frame.
- **Synthesized SFX** — all weapon sounds are real .ogg samples layered with a synth sub-bass thump + noise crack for punch. Moo taunt is fully synthesized with 5 random profiles (vibrato, formant sweep, breath noise).
- **Procedural music** — 7 menu music styles (classic, tribal, industrial, money, boy, neo, radio stream) + adaptive in-game music that shifts mood based on health and alive count.
- **Cow-based gameplay** — knife melee, barricades, shield eggs, cowstrike killstreak, dual-wield, 50+ named bot personalities with signature chat lines, a hunger-as-health system where eating food heals you.

## Project structure

```
client/          ES module browser code (esbuild bundles to dist/)
server/          Node.js CommonJS game server (WebSocket + WebRTC)
shared/          CJS modules used by both (movement integrator, constants, messages)
public/          Static assets (HTML, audio, models) — copied to dist/ at build time
dist/            Build output (served by Caddy) — bundle.js is gitignored
scripts/         Build script + DOM-id pre-check
```

## Quick start

```bash
npm install
npm run build          # bundles client + copies assets to dist/
node server/index.js   # starts the game server
```

For development with auto-rebuild on save:

```bash
npm run watch
```

## Tech stack

- **Renderer**: three.js (ES module, loaded via importmap)
- **Audio**: Web Audio API (PannerNode spatial, oscillator synth, sample playback)
- **Networking**: WebSocket (ws) + WebRTC data channels (geckos.io) with WS fallback
- **Bundler**: esbuild (fast, single entry point, three.js external)
- **Server**: plain Node.js, no framework
- **Hosting**: Caddy reverse proxy serves dist/ as static, proxies WS/WebRTC to Node

## Tests

```bash
npm test               # runs all three test suites
npm run test:terrain   # terrain determinism
npm run test:movement  # movement characterization
npm run test:fire-weapon  # weapon fire characterization
```
