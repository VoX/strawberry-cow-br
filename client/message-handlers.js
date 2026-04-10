// Server→client message handler table. Each entry is a small named handler that
// owns one `msg.type`. index.js wires these via `setMessageHandler` with a plain
// `handlers[msg.type]?.(msg)` lookup — no string comparisons per tick, no extra
// indirection. Preserve behaviour exactly; simplify passes will follow.
//
// State is shared via the singleton `S` import, so handlers can still communicate
// indirectly (e.g. `eliminated` writes `S.killerId`, `kill` also writes it, both
// are read by the loop / spectate code). All the side effects that used to live
// in the giant `handleMsg` function still live here — same DOM pokes, same audio
// cues, same particle spawns.
import * as THREE from 'three';
import S from './state.js';
import { sfx, sfxShoot, sfxBolty, sfxShotgun, sfxRocket, sfxLR, sfxExplosion, sfxHit, sfxEat, sfxLevelUp, sfxDeath, sfxEmptyMag, sfxReloadLR, sfxReloadBolty, sfxShellLoad, setMusicPlaying, resetMusic, getAudioCtx, startMenuMusic, stopMenuMusic, initAudio } from './audio.js';
import { scene, cam, setNightMode } from './renderer.js';
import { getTerrainHeight, rebuildTerrain } from './terrain.js';
import { send, closeActive as closeActiveTransport } from './network.js';
import { showPerkMenu } from './ui.js';
import { spawnParts, showChatBubble } from './entities.js';
import { addBarricade, removeBarricade, clearBarricades, destroyWall } from './map-objects.js';
import { clearRocketSounds } from './projectiles.js';
import { spawnParticle, clearParticles, PGEO_SPHERE_LO, PGEO_SPHERE_MED, PGEO_BOX, PGEO_TORUS } from './particles.js';
import { setArmorSpawns, onArmorSpawn, onArmorPickup, clearPickups } from './pickups.js';
import { disposeMeshTree } from './three-utils.js';
import { S2C } from '../shared/messages.js';
import { BURST_FAMILY } from '../shared/constants.js';
import { INTERP_HIST_CAP, interpSamplePlayer } from './interp.js';
import { reconcilePrediction } from './prediction.js';
import { spawnBulletHole, clearBulletHoles, removeBulletHolesBySurfaceKey } from './bullet-holes.js';

// Reusable temp vector for the projectile muzzle-offset transform. Was shared
// with the render loop in index.js via `_tmpDir`; we get our own private one so
// the module is self-contained.
const _tmpDir = new THREE.Vector3();

// DOM element refs cached on first use — avoids repeated getElementById lookups
// in handlers that fire on every hit or frame-adjacent event (projectileHit,
// cowstrike, bump).
let _hitFlash = null, _hitMarker = null;
function getHitFlash() { return _hitFlash || (_hitFlash = document.getElementById('hitFlash')); }
function getHitMarker() { return _hitMarker || (_hitMarker = document.getElementById('hitMarker')); }

// Flash the red damage overlay. duration is ms, bg is an optional background color
// for variant flashes (cowstrike uses orange). Matches the 3 inline variants that
// used to be scattered across projectileHit / cowstrike / bump.
function flashHit(opacity, duration, bg) {
  const el = getHitFlash();
  if (!el) return;
  if (bg) el.style.background = bg;
  el.style.opacity = String(opacity);
  setTimeout(() => {
    el.style.opacity = '0';
    if (bg) el.style.background = 'rgba(255,0,0,0.3)';
  }, duration);
}

// Soft edge-of-screen flashes — radial vignettes that briefly hit
// opacity 1 and then fade back via CSS transition. Disable the
// transition for the punch-in (so opacity 1 commits instantly), force a
// reflow, then re-enable the transition for the fade. Without the
// transition disable + reflow the browser collapses the 0→1→0 sequence
// into a single 0→0 paint and the flash never appears.
function flashEdge(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'none';
  el.style.opacity = '1';
  void el.offsetHeight; // force reflow so the opacity:1 commits
  el.style.transition = '';
  el.style.opacity = '0';
}

// Push a system-style line into the chat log. Replaces the old killfeed
// path (which had its own UI and array) — kill notifications, weapon
// pickups, mode changes, cowstrike warnings etc. all share the same chat
// surface now. `t` is the lifetime in seconds before fade-out.
function addKillFeed(txt, t) {
  S.chatLog.push({ name: '', color: '', text: txt, t, system: true });
  if (S.chatLog.length > 10) S.chatLog.shift();
}

// Host-controls toggle — referenced by several lobby handlers. Moved out of
// index.js so the dispatch module is self-contained.
function updateHostControls() {
  const hc = document.getElementById('hostControls');
  if (!hc) return;
  const inLobby = S.state === 'lobby' && S.hostId && S.myId === S.hostId;
  hc.style.display = inLobby ? 'block' : 'none';
}

export const handlers = {
  serverStatus(msg) {
    const el = document.getElementById('gameStatus');
    if (el) {
      if (msg.gameState === 'playing') {
        el.textContent = '\u{1F3AF} Match in progress — ' + msg.alive + '/' + msg.total + ' cows remaining';
        el.style.color = '#ffaa44';
      } else if (msg.gameState === 'lobby') {
        el.textContent = '\u{1F550} Waiting for players in lobby';
        el.style.color = '#88ff88';
      } else if (msg.gameState === 'ending') {
        el.textContent = '\u{1F3C1} Match ending...';
        el.style.color = '#cc88ff';
      } else {
        el.textContent = '';
      }
    }
    // Relabel the join button when a round is already running so the
    // player knows their first click will drop them in as a spectator.
    const jb = document.getElementById('joinBtn');
    if (jb && !S.myId) {
      jb.textContent = msg.gameState === 'playing' ? 'SPECTATE MEADOW' : 'QUEUE FOR MEADOW';
    }
  },

  joined(msg) {
    S.myId = msg.id; S.myColor = msg.color; S.state = 'lobby';
    S.hostId = msg.hostId;
    window.kickPlayer = (id) => { send({ type: 'kick', targetId: id }); };
    document.getElementById('joinScreen').querySelector('h2').textContent = 'Waiting for cows...';
    document.getElementById('botsCheck').checked = msg.botsEnabled;
    document.getElementById('botsFreeWillCheck').checked = msg.botsFreeWill;
    document.getElementById('nightCheck').checked = !!msg.nightMode;
    setNightMode(!!msg.nightMode);
    updateHostControls();
    initAudio(); startMenuMusic();
  },

  nightToggled(msg) {
    document.getElementById('nightCheck').checked = msg.enabled;
    setNightMode(msg.enabled);
  },

  newHost(msg) {
    S.hostId = msg.hostId;
    updateHostControls();
  },

  kicked(msg) {
    document.getElementById('joinScreen').style.display = 'flex';
    document.getElementById('joinScreen').querySelector('h2').textContent = 'You were kicked from the lobby';
    try { closeActiveTransport(); } catch (e) {}
  },

  lobby(msg) {
    const cd = msg.countdown > 0 ? (' (' + msg.countdown + 's)') : '';
    const readyTxt = msg.allReady ? 'All ready! Starting' + cd : 'Waiting for cows to ready up';
    if (!S._botRevealTime) S._botRevealTime = Date.now() + 3000;
    const botsRevealed = Date.now() > S._botRevealTime;
    const colMap = {pink:'#ff88aa',blue:'#88aaff',green:'#88ff88',gold:'#ffdd44',purple:'#cc88ff',red:'#ff4444',orange:'#ff8844',cyan:'#44ffdd'};
    const isHost = S.hostId === S.myId;
    const pList = msg.players.map(p => {
      if (p.isBot && !botsRevealed) return '<div style="color:#ff8888;padding:2px 0"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#555;margin-right:6px;vertical-align:middle"></span><span style="display:inline-block;width:120px;text-align:left">Connecting<span style="display:inline-block;width:18px;text-align:left">' + '.'.repeat(1 + Math.floor(Date.now() / 500) % 3) + '</span></span> ⏳</div>';
      const dot = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (colMap[p.color] || '#aaa') + ';margin-right:6px;vertical-align:middle"></span>';
      const crown = (p.id === S.hostId && !p.isBot) ? ' 👑' : '';
      const canKick = isHost && !p.isBot && p.id !== S.myId;
      const kickBtn = canKick ? ' <span onclick="window.kickPlayer(' + p.id + ')" style="cursor:pointer;color:#ff4444;float:right;font-weight:bold" title="Kick">✕</span>' : '';
      return '<div style="color:' + (p.ready ? '#88ff88' : '#ff8888') + ';padding:2px 0">' + dot + (p.name || '?') + crown + (p.isBot ? ' 🤖' : (p.ready ? ' \u2714' : ' ...')) + kickBtn + '</div>';
    }).join('');
    document.getElementById('joinScreen').querySelector('h2').innerHTML = readyTxt + '<div style="margin-top:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(204,136,255,0.3);border-radius:8px;padding:8px 16px;font-size:13px;max-height:200px;overflow-y:auto;width:260px;text-align:left">' + pList + '</div>';
    // The same #joinBtn becomes the READY/UNREADY toggle once joined —
    // no DOM motion, the button stays anchored at the top of the menu.
    const jb = document.getElementById('joinBtn');
    if (jb && S.myId) {
      const myLobby = msg.players.find(p => p.id === S.myId);
      if (myLobby) {
        if (myLobby.ready) {
          jb.textContent = 'UNREADY \u2714';
          jb.style.background = '#88ff88';
          jb.style.color = '#000';
        } else {
          jb.textContent = 'READY TO GRAZE';
          jb.style.background = '#44ff44';
          jb.style.color = '#000';
        }
      }
    }
  },

  spectate(msg) {
    if (msg.terrainSeed !== undefined) rebuildTerrain(msg.terrainSeed);
    S.state = 'playing';
    updateHostControls();
    // Reset input seq counters on mid-round join / reconnect. Mirrors the
    // `start` handler — without this, a reconnect-without-reload would
    // carry stale seqs into the new round and the first reconcile would
    // walk an invalid ring.
    S.inputSeq = 0; S.lastAckedInput = 0;
    document.getElementById('joinScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    S.serverPlayers = msg.players;
    S.me = S.serverPlayers.find(p => p.id === S.myId) || null;
    S.serverFoods = (msg.foods || []).map(f => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
    if (msg.zone) S.serverZone = msg.zone;
    if (msg.map) { S.mapFeatures = msg.map; S.mapBuilt = false; }
    if (msg.weapons) S.clientWeapons = msg.weapons;
    // Dispose any stale pickup meshes from a previous round before replacing them.
    clearPickups();
    if (msg.armorPickups) setArmorSpawns(msg.armorPickups);
    clearBarricades();
    if (msg.barricades) msg.barricades.forEach(b => addBarricade(b));
  },

  start(msg) {
    if (msg.terrainSeed !== undefined) rebuildTerrain(msg.terrainSeed);
    S.state = 'playing';
    updateHostControls();
    // Reset input seq counters — mirrors server/game.js::startGame. Carrying
    // seqs across rounds would reference sim state that no longer exists.
    S.inputSeq = 0; S.lastAckedInput = 0;
    document.getElementById('joinScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    S.serverPlayers = msg.players;
    S.me = S.serverPlayers.find(p => p.id === S.myId) || null;
    S.serverFoods = (msg.foods || []).map(f => ({ id: f.id, x: f.x, y: f.y, type: f.type }));
    if (msg.zone) S.serverZone = msg.zone;
    if (msg.map) { S.mapFeatures = msg.map; S.mapBuilt = false; }
    if (msg.weapons) S.clientWeapons = msg.weapons;
    S.chatLog = []; stopMenuMusic(); resetMusic(); setMusicPlaying(true);
    S.spectateTargetId = null; S.killerId = null; S.killerName = null;
    S.barricadeReadyAt = 0;
    clearBarricades();
    if (msg.barricades) msg.barricades.forEach(b => addBarricade(b));
    clearPickups();
    setArmorSpawns(msg.armorPickups || []);
    document.getElementById('winScreen').style.display = 'none';
    for (const id in S.cowMeshes) { scene.remove(S.cowMeshes[id].mesh); } S.cowMeshes = {};
    for (const id in S.projMeshes) { disposeMeshTree(S.projMeshes[id]); } S.projMeshes = {}; S.projData = [];
    clearRocketSounds();
    clearParticles();
    clearBulletHoles();
  },

  // 30 Hz broadcast of mutable player fields only. Sticky fields
  // (name/color/weapon/perks/xpToNext/sizeMult/recoilMult/extMagMult) arrive
  // via 'start'/'spectate' (wholesale replace) or 'playerSnapshot' (per-player
  // upsert). This handler merges tick fields into the existing serverPlayers
  // array in-place — no wholesale replace, so sticky fields survive.
  //
  // Race: if a tick arrives for a player we haven't seen a snapshot for yet
  // (rare — a join mid-round would hit 'spectate' first, but a late player
  // join could race), we skip that entry. The next snapshot or spectate sync
  // will fill it in.
  tick(msg) {
    if (typeof msg.tickNum === 'number') S.lastTickNum = msg.tickNum;
    if (S._iwStats === undefined) {
      S._iwStats = {
        lastStateTs: 0, lastMeX: 0, lastMeY: 0,
        gaps: new Float32Array(120), gapsIdx: 0, gapsCount: 0,
        deltas: new Float32Array(120), deltasIdx: 0, deltasCount: 0,
        frameGaps: new Float32Array(120), frameGapsIdx: 0, frameGapsCount: 0,
        frameJank: 0,
      };
    }
    const iw = S._iwStats;
    const iwNow = performance.now();
    if (iw.lastStateTs > 0) {
      iw.gaps[iw.gapsIdx] = iwNow - iw.lastStateTs;
      iw.gapsIdx = (iw.gapsIdx + 1) % 120;
      if (iw.gapsCount < 120) iw.gapsCount++;
    }
    iw.lastStateTs = iwNow;
    // Merge each tick into the matching existing player. Track which ids we
    // saw so we can drop players the server no longer lists (corpse reaped,
    // left lobby, disconnected). Remote players (not myId) also get their
    // position appended to an interpolation history ring — the renderer
    // reads from the ring INTERP_DELAY_MS in the past so motion is smooth
    // instead of stepping once per tick. Local player keeps the direct
    // Object.assign path since phase 4 replaces that with CSP.
    const seen = new Set();
    for (const t of msg.players) {
      seen.add(t.id);
      const existing = S.serverPlayers.find(sp => sp.id === t.id);
      if (!existing) continue; // race: no snapshot yet, skip until one arrives
      if (existing.id === S.myId) {
        // Camera owns aim/dir for the local player; the server's values
        // are a stale RTT echo and would clobber the live look direction.
        const { aimAngle, dir, ...rest } = t;
        Object.assign(existing, rest);
        // Sync server-only movement gates (stun + spawn protection) into
        // the predicted player. Both make stepPlayerMovement skip the
        // movement integration entirely, but the client has no way to
        // predict them — getting hit is server-authoritative, so the
        // local CSP loop just charges forward into the stun window and
        // builds up drift until the next reconcile snaps it back. Keeping
        // these in lockstep with the tick broadcast means the next predict
        // step after the hit also respects the stun.
        if (S.mePredicted) {
          S.mePredicted.stunTimer = existing.stunTimer || 0;
          S.mePredicted.spawnProtection = existing.spawnProt ? 1 : 0;
        }
      } else {
        // Merge everything EXCEPT position/aim — those ride the interp ring.
        // Stats like hunger/ammo/score still want to snap to latest.
        Object.assign(existing, t);
        if (!existing._histBuf) existing._histBuf = [];
        existing._histBuf.push({
          t: iwNow, x: t.x, y: t.y, z: t.z, aim: t.aimAngle,
        });
        if (existing._histBuf.length > INTERP_HIST_CAP) existing._histBuf.shift();
      }
    }
    // Drop players the server dropped. Preserves sticky fields on survivors.
    for (let i = S.serverPlayers.length - 1; i >= 0; i--) {
      if (!seen.has(S.serverPlayers[i].id)) S.serverPlayers.splice(i, 1);
    }
    S.me = S.serverPlayers.find(p => p.id === S.myId) || null;
    if (S.me) {
      const dx = S.me.x - iw.lastMeX, dy = S.me.y - iw.lastMeY;
      iw.deltas[iw.deltasIdx] = Math.sqrt(dx * dx + dy * dy);
      iw.deltasIdx = (iw.deltasIdx + 1) % 120;
      if (iw.deltasCount < 120) iw.deltasCount++;
      iw.lastMeX = S.me.x;
      iw.lastMeY = S.me.y;
    }
    if (msg.zone) S.serverZone = msg.zone;
    if (S.pingLast > 0) { const pd = performance.now() - S.pingLast; if (pd < 2000) S.pingVal = S.pingVal * 0.7 + pd * 0.3; S.pingLast = 0; }
  },

  // Low-rate (~6 Hz) echo of the server's highest-applied input seq for
  // THIS client PLUS the server's authoritative position at this tick.
  // Phase 4 CSP reconcile compares predicted-at-seq against the embedded
  // position (not S.me, which would be a later tick and race).
  inputAck(msg) {
    if (typeof msg.seq !== 'number' || msg.seq <= S.lastAckedInput) return;
    // Defensive: refuse malformed payloads. Without this, a botched
    // server emit could ship undefined/NaN straight into the predicted
    // state and rubberband the player to NaN-land.
    if (typeof msg.x !== 'number' || typeof msg.y !== 'number' || typeof msg.z !== 'number') return;
    S.lastAckedInput = msg.seq;
    // Snap server-only movement gates onto the predicted player too.
    // The tick handler also syncs these, but inputAck can arrive between
    // ticks and we want the very next predict step to respect the gates.
    if (S.mePredicted) {
      if (typeof msg.stunTimer === 'number') S.mePredicted.stunTimer = msg.stunTimer;
      if (typeof msg.spawnProt === 'boolean') S.mePredicted.spawnProtection = msg.spawnProt ? 1 : 0;
    }
    reconcilePrediction({
      x: msg.x, y: msg.y, z: msg.z,
      vz: msg.vz || 0,
      onGround: !!msg.onGround,
    });
  },

  // Upsert a single player's full sticky+mutable shape. Emitted by the server
  // when a sticky field changes (weapon pickup, perk, level up, dual-wield
  // toggle). If the player is already in serverPlayers, merge; otherwise
  // append — covers the mid-round join path where a tick can arrive before
  // the spectate sync lands.
  playerSnapshot(msg) {
    const snap = msg.player;
    if (!snap || snap.id == null) return;
    const existing = S.serverPlayers.find(sp => sp.id === snap.id);
    if (existing) Object.assign(existing, snap);
    else S.serverPlayers.push(snap);
    if (snap.id === S.myId) S.me = S.serverPlayers.find(p => p.id === S.myId) || null;
  },

  food(msg) {
    const f = msg.food || msg;
    S.serverFoods.push({ id: f.id, x: f.x, y: f.y, type: f.type || f.typeName });
  },

  eat(msg) {
    S.serverFoods = S.serverFoods.filter(f => f.id !== msg.foodId);
    spawnParts(msg.playerId);
    if (msg.playerId === S.myId) sfxEat();
  },

  projectile(msg) {
    let vy3d = msg.vz || 0, spawnH = msg.z || (15 + getTerrainHeight(msg.x, msg.y));
    let spawnX = msg.x, spawnZ = msg.y;
    if (msg.ownerId === S.myId) {
      // Visual muzzle offset per weapon, in vmScene coordinates:
      // x = right, y = up, z = forward(-)/back(+). These are approximate tip positions.
      const myWep = S.me ? S.me.weapon : 'normal';
      const MUZZLES = {
        normal:  { x: 2.0, y: -2.8, z: -13 },
        shotgun: { x: 2.0, y: -0.8, z: -24 },
        burst:   { x: 3.5, y: -2.6, z: -22 },
        bolty:   { x: 0, y: -4.0, z: -26 },
        cowtank: { x: 2.0, y: -3.0, z: -22 },
      };
      let m = MUZZLES[myWep] || MUZZLES.normal;
      // Dual-wield M16: volley 1 uses the left barrel
      if (myWep === 'burst' && S.me && S.me.dualWield && msg.muzzle === 1) {
        m = { x: m.x - 9, y: m.y, z: m.z };
      }
      // Dual-wield Benelli: alternate shots come out of the left barrel
      if (myWep === 'shotgun' && S.me && S.me.dualWield && msg.muzzle === 1) {
        m = { x: m.x - 9, y: m.y, z: m.z };
      }
      // Bolty hip-fire: default offset (0, -4, -26) is centered for the ADS
      // scope view, but when hip-firing the gun is held to the right like the
      // other weapons. Offset right + down to emit the tracer from the visible
      // barrel instead of from the camera center.
      if (myWep === 'bolty' && !S.adsActive) {
        m = { x: 3, y: -3.5, z: -26 };
      }
      // Transform muzzle offset by camera orientation to world space
      _tmpDir.set(m.x, m.y, m.z).applyQuaternion(cam.quaternion);
      spawnX = cam.position.x + _tmpDir.x;
      spawnH = cam.position.y + _tmpDir.y;
      spawnZ = cam.position.z + _tmpDir.z;
    }
    if (msg.shotgun !== undefined) { vy3d += (Math.random() - 0.5) * 150; }
    // Pre-seed the trail's last position to the actual spawn point so the
    // first trail frame interpolates from the muzzle forward instead of from
    // the mesh's default (0,0,0) position, which drew a garbage trail from
    // world origin on the first frame after spawn.
    S.projData.push({ id: msg.id, x: spawnX, y: spawnZ, vx: msg.vx, vy: msg.vy, color: msg.color || 'pink', bolty: msg.bolty, cowtank: msg.cowtank, y3d: spawnH, vy3d, _lastTrailPos: msg.bolty ? { x: spawnX, y: spawnH, z: spawnZ } : undefined });
    if (msg.ownerId !== S.myId) {
      // Distance-based weapon sound for other players
      const dist = Math.hypot(msg.x - cam.position.x, msg.y - cam.position.z);
      const distVol = Math.max(0.01, 1 / (1 + dist * 0.005));
      if (msg.bolty) sfx(800, 0.25, 'sawtooth', 0.1 * distVol);
      else if (msg.cowtank) sfxRocket(0.12 * distVol);
      else if (msg.shotgun !== undefined) sfxShotgun(0.1 * distVol);
      else if (msg.burst !== undefined) sfxLR(0.1 * distVol);
      else sfx(400, 0.12, 'square', 0.08 * distVol);
    }
    if (msg.ownerId === S.myId) {
      const myWep = S.me ? S.me.weapon : 'normal';
      // Skip extra shotgun pellets (only first pellet plays sound), but play each burst round
      if (msg.shotgun === false) { /* skip extra pellets */ }
      else if (myWep === 'bolty' || msg.bolty) sfxBolty();
      else if (myWep === 'cowtank' || msg.cowtank) sfxRocket(0.12);
      else if (msg.shotgun === true) sfxShotgun(0.1);
      else if (myWep === 'shotgun') sfxShotgun(0.1);
      else if (BURST_FAMILY.has(myWep) || msg.burst !== undefined) sfxLR(0.1);
      else sfxShoot();
      // Apply recoil
      const wep = myWep;
      const recoilPatterns = {
        burst: [ // LR-300: snake pattern upward
          { p: 0.012, y: 0.003 }, { p: 0.014, y: 0.006 }, { p: 0.011, y: 0.004 },
          { p: 0.013, y: -0.003 }, { p: 0.015, y: -0.006 }, { p: 0.012, y: -0.004 },
          { p: 0.010, y: 0.005 }, { p: 0.014, y: 0.007 }, { p: 0.012, y: 0.003 },
          { p: 0.013, y: -0.005 }, { p: 0.016, y: -0.007 }, { p: 0.011, y: -0.003 },
          { p: 0.010, y: 0.004 }, { p: 0.013, y: 0.006 }, { p: 0.012, y: 0.002 },
          { p: 0.014, y: -0.004 }, { p: 0.015, y: -0.006 }, { p: 0.011, y: -0.002 },
          { p: 0.010, y: 0.005 }, { p: 0.013, y: 0.007 }, { p: 0.012, y: 0.003 },
          { p: 0.014, y: -0.005 }, { p: 0.016, y: -0.007 }, { p: 0.011, y: -0.003 },
          { p: 0.010, y: 0.004 }, { p: 0.013, y: 0.006 }, { p: 0.012, y: 0.002 },
          { p: 0.014, y: -0.004 }, { p: 0.015, y: -0.005 }, { p: 0.011, y: -0.002 },
        ],
        shotgun: [ // Benelli: strong kick up
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
          { p: 0.06, y: (Math.random()-0.5)*0.02 },
        ],
        bolty: [ // L96: big single kick
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
          { p: 0.05, y: 0.005 },
        ],
        cowtank: [ // M72 LAW: massive kick
          { p: 0.15, y: (Math.random()-0.5)*0.03 },
        ],
        normal: [ // Spit: small kick
          { p: 0.008, y: (Math.random()-0.5)*0.004 },
        ],
        // AUG — vertical-dominant kick with a slow rightward drift, very
        // different from the M16 snake. Bullpup centerline = predictable
        // pitch ramp, then a small lateral creep that the player has to
        // pull against.
        aug: [
          { p: 0.014, y: 0.001 }, { p: 0.013, y: 0.002 }, { p: 0.012, y: 0.003 },
          { p: 0.012, y: 0.004 }, { p: 0.011, y: 0.004 }, { p: 0.011, y: 0.005 },
          { p: 0.010, y: 0.005 }, { p: 0.010, y: 0.006 }, { p: 0.009, y: 0.006 },
          { p: 0.009, y: -0.002 }, { p: 0.008, y: -0.003 }, { p: 0.008, y: -0.004 },
          { p: 0.009, y: -0.001 }, { p: 0.010, y: 0.001 }, { p: 0.011, y: 0.003 },
        ],
      };
      const pattern = recoilPatterns[wep];
      if (pattern && S.me) {
        const now = performance.now();
        if (now - S.recoilTimer > 500) S.recoilIndex = 0;
        S.recoilTimer = now;
        const r = pattern[S.recoilIndex % pattern.length];
        // Burst mode kicks softer than full-auto by 35% (was 50%). Semi
        // keeps full recoil so each deliberate shot feels punchy.
        const burstMod = (BURST_FAMILY.has(wep) && S.fireMode === 'burst') ? 0.65 : 1;
        const tacticowMod = S.me.recoilMult || 1;
        const walkingMod = S.crouching ? 0.73 : 1;
        // Dual-wield recoil multiplier: benelli only gets +10%, everything else +30%
        const dualMod = S.me.dualWield ? (wep === 'shotgun' ? 1.1 : 1.3) : 1;
        // AUG hipfire penalty: 1.5x recoil when not scoped, 1x when ADS.
        const augHipMod = (wep === 'aug' && !S.adsActive) ? 1.5 : 1;
        const recoilMult = burstMod * tacticowMod * walkingMod * dualMod * augHipMod;
        S.pitch += r.p * recoilMult;
        S.yaw += r.y * recoilMult;
        S.pitch = Math.max(-1.2, Math.min(1.2, S.pitch));
        S.recoilIndex++;
      }
    }
  },

  wallImpact(msg) {
    // L96 wall penetration spark — pooled
    const th = getTerrainHeight(msg.x, msg.y);
    const impactZ = msg.z != null ? msg.z : th + 30;
    for (let i = 0; i < 5; i++) {
      spawnParticle({
        geo: PGEO_SPHERE_LO, color: 0xffdd44,
        x: msg.x + (Math.random()-0.5)*8,
        y: impactZ + (Math.random()-0.5)*8,
        z: msg.y + (Math.random()-0.5)*8,
        sx: 0.8,
        life: 0.4, peakOpacity: 1,
        vx: (Math.random()-0.5)*40,
        vy: (Math.random()-0.5)*40,
        vz: (Math.random()-0.5)*40,
      });
    }
    // Persistent bullet hole at the entry point. The L96 wallpierce path
    // also fires a projectileHit on the SECOND wall hit which spawns the
    // exit hole through the projectileHit handler — so a single bolty
    // wallbang leaves two visible holes (entry + exit/behind). The
    // surface key ties the decal to its host wall so wallDestroyed can
    // sweep it later.
    const wallKey = msg.wallId != null ? 'wall:' + msg.wallId : null;
    spawnBulletHole(msg.x, msg.y, impactZ, wallKey);
  },

  projectileHit(msg) {
    S.projData = S.projData.filter(p => p.id !== msg.projectileId);
    if (S.projMeshes[msg.projectileId]) { disposeMeshTree(S.projMeshes[msg.projectileId]); delete S.projMeshes[msg.projectileId]; }
    if (msg.targetId === S.myId) {
      sfxHit(); flashHit(0.5, 150); flashEdge('damageEdgeFlash');
      // Apply stun locally the moment we know we got hit, instead of
      // waiting for the next tick to sync stunTimer. The server gates
      // movement on stunTimer > 0 (skips the integrator), so without
      // this the client charges forward for ~RTT/2 + tick latency
      // before reconcile pulls them back. Mirroring the server's stun
      // duration here shrinks the visible rubberband to whatever the
      // smoother can absorb.
      if (S.mePredicted) S.mePredicted.stunTimer = 0.5;
    }
    // Persistent bullet hole on world geometry hits — wall, barricade, or
    // terrain. Player hits don't get holes (the blood particles below cover
    // them); the wall:true flag from the server marks the world-geometry path.
    if (msg.wall && typeof msg.x === 'number' && typeof msg.y === 'number') {
      const terrainH = getTerrainHeight(msg.x, msg.y);
      const z = typeof msg.z === 'number' ? msg.z : (terrainH + 5);
      const surfaceKey = msg.wallId != null ? 'wall:' + msg.wallId
                       : msg.barricadeId != null ? 'barricade:' + msg.barricadeId
                       : null;
      spawnBulletHole(msg.x, msg.y, z, surfaceKey);
      // Impact pop — sparks + a small smoke puff at the impact point. Walls
      // get yellow sparks; ground hits (impact within ~1 unit of terrain
      // height) swap the sparks for green grass-blade flecks so a missed
      // shot into the meadow throws up clippings.
      const onGround = Math.abs(z - terrainH) < 1.5;
      const sparkColor = onGround ? 0x55cc33 : 0xffdd44;
      const sparkCount = onGround ? 7 : 4;
      const sparkSpread = onGround ? 60 : 40;
      const sparkScale = onGround ? 0.6 : 0.7;
      for (let i = 0; i < sparkCount; i++) {
        spawnParticle({
          geo: PGEO_SPHERE_LO, color: sparkColor,
          x: msg.x + (Math.random()-0.5)*4,
          y: z + (Math.random()-0.5)*4 + (onGround ? 1 : 0),
          z: msg.y + (Math.random()-0.5)*4,
          sx: sparkScale,
          life: onGround ? 0.55 : 0.35, peakOpacity: 1,
          vx: (Math.random()-0.5)*sparkSpread,
          vy: onGround ? (8 + Math.random()*22) : (Math.random()-0.5)*sparkSpread,
          vz: (Math.random()-0.5)*sparkSpread,
          gy: onGround ? 60 : 0,
        });
      }
      // Smoke puff — a single growing translucent sphere. Walls only;
      // grass clippings already read as a "splash" without the smoke.
      if (!onGround) {
        spawnParticle({
          geo: PGEO_SPHERE_LO, color: 0xbbbbbb,
          x: msg.x, y: z, z: msg.y,
          sx: 2,
          life: 0.5, peakOpacity: 0.5,
          growth: 4,
          vy: 12,
        });
      }
    }
    // Hitmarker for attacker — overlays the crosshair without disturbing its layout
    if (msg.targetId && msg.ownerId === S.myId && msg.targetId !== S.myId) {
      sfx(600, 0.06, 'square', 0.07);
      const hm = document.getElementById('hitMarker');
      if (hm) {
        hm.classList.toggle('head', !!msg.headshot);
        hm.classList.add('show');
        if (msg.headshot) { sfx(1200, 0.15, 'sine', 0.08); sfx(1800, 0.1, 'sine', 0.06); }
        clearTimeout(window._hitMarkerTimer);
        window._hitMarkerTimer = setTimeout(() => { hm.classList.remove('show'); }, msg.headshot ? 260 : 160);
      }
    }
    // Blood impact particles — pooled. Spawn at the target's interpolated
    // render position (not the raw tick position) so blood appears on the
    // visible cow instead of 100 ms ahead of it.
    if (msg.targetId && !msg.wall) {
      const target = S.serverPlayers.find(p => p.id === msg.targetId);
      if (target) {
        const smooth = target.id === S.myId
          ? { x: target.x, y: target.y, z: target.z }
          : interpSamplePlayer(target, performance.now());
        const tz = smooth.z !== undefined ? smooth.z : getTerrainHeight(smooth.x, smooth.y);
        const impactY = msg.headshot ? tz + 36 : tz + 20;
        const count = msg.headshot ? 18 : 8;
        const baseScale = msg.headshot ? 2.6 : 1.9;
        const spd = msg.headshot ? 70 : 40;
        for (let i = 0; i < count; i++) {
          const sc = baseScale * (0.6 + Math.random() * 0.8);
          spawnParticle({
            geo: PGEO_SPHERE_LO, color: 0xcc1515,
            x: smooth.x, y: impactY, z: smooth.y,
            sx: sc,
            life: 0.9, peakOpacity: 1,
            vx: (Math.random() - 0.5) * spd,
            vy: (Math.random() * 0.6 + 0.4) * spd,
            vz: (Math.random() - 0.5) * spd,
            gy: 80,
          });
        }
      }
    }
    // Floating damage number
    if (msg.targetId && msg.dmg) {
      const target = S.serverPlayers.find(p => p.id === msg.targetId);
      if (target) {
        const dmg = msg.dmg;
        const hasShield = target.armor > 0;
        // Shielded hits get a blue ramp by damage tier (dark blue heavy →
        // light blue light); flesh hits get the existing red/orange/white
        // ramp; headshots stay bright red regardless of shield.
        const color = msg.headshot ? '#ff2222'
                    : hasShield ? (dmg >= 25 ? '#1144aa' : dmg >= 10 ? '#3377cc' : '#88bbff')
                    : (dmg >= 25 ? '#ff4444' : dmg >= 10 ? '#ffaa44' : '#ffffff');
        const prefix = hasShield ? '\u{1F6E1}\uFE0F ' : '';
        const label = prefix + dmg;
        const nc = document.createElement('canvas'); nc.width = 160; nc.height = 48;
        const ctx = nc.getContext('2d');
        ctx.font = 'bold ' + (dmg >= 25 ? 36 : dmg >= 10 ? 28 : 22) + 'px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(label, 81, 35);
        ctx.fillStyle = color; ctx.fillText(label, 80, 34);
        const tex = new THREE.CanvasTexture(nc); tex.minFilter = THREE.LinearFilter;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        const tz = target.z !== undefined ? target.z : getTerrainHeight(target.x, target.y);
        sprite.position.set(target.x + (Math.random()-0.5)*20, tz + 40 + Math.random()*10, target.y + (Math.random()-0.5)*20);
        sprite.scale.set(96, 28, 1);
        scene.add(sprite);
        let life = 1.5;
        const vy = 8 + Math.random() * 6;
        const vx = (Math.random() - 0.5) * 15;
        const vz = (Math.random() - 0.5) * 15;
        let dnDisposed = false;
        const dnCleanup = () => { if (dnDisposed) return; dnDisposed = true; scene.remove(sprite); tex.dispose(); mat.dispose(); };
        const anim = () => { if (dnDisposed) return; life -= 0.012; mat.opacity = Math.max(0, life); sprite.position.y += vy * 0.016; sprite.position.x += vx * 0.016; sprite.position.z += vz * 0.016; if (life <= 0) dnCleanup(); else requestAnimationFrame(anim); };
        requestAnimationFrame(anim);
        setTimeout(dnCleanup, 2000);
      }
    }
  },

  explosion(msg) {
    const ex = msg.x, ey = msg.y, er = msg.radius || 120;
    const th = getTerrainHeight(ex, ey);
    // Explosion flash sphere
    spawnParticle({
      geo: PGEO_SPHERE_MED, color: 0xff6600,
      x: ex, y: th + 10, z: ey,
      sx: er * 0.3,
      life: 0.5, peakOpacity: 0.6, growth: 3,
    });
    // Lingering smoke cloud (16 drifting puffs)
    for (let sc = 0; sc < 16; sc++) {
      const smokeSize = 12 + Math.random() * 16;
      spawnParticle({
        geo: PGEO_SPHERE_MED, color: 0x2a2a2a,
        x: ex + (Math.random() - 0.5) * er * 0.5,
        y: th + 10 + Math.random() * 25,
        z: ey + (Math.random() - 0.5) * er * 0.5,
        sx: smokeSize,
        life: 6 + Math.random() * 1.5, peakOpacity: 0.85,
        vx: (Math.random() - 0.5) * 8,
        vy: 5 + Math.random() * 4,
        vz: (Math.random() - 0.5) * 8,
        growth: 0.7,
      });
    }
    // Shockwave ring
    spawnParticle({
      geo: PGEO_TORUS, color: 0xffaa00,
      x: ex, y: th + 5, z: ey,
      sx: er * 0.15, sy: er * 0.15, sz: er * 0.15,
      rotX: Math.PI / 2,
      life: 0.4, peakOpacity: 0.4, growth: 5, side: THREE.DoubleSide,
    });
    // Debris particles
    for (let i = 0; i < 20; i++) {
      spawnParticle({
        geo: PGEO_SPHERE_LO, color: Math.random() > 0.3 ? 0xff4400 : 0xffdd00,
        x: ex, y: th + 8, z: ey,
        sx: 1.5 + Math.random() * 2,
        life: 0.6 + Math.random() * 0.4, peakOpacity: 1,
        vx: (Math.random() - 0.5) * 150,
        vy: 40 + Math.random() * 80,
        vz: (Math.random() - 0.5) * 150,
        gy: 240,
        growth: -1.8,
      });
    }
    // Explosion sound
    sfxExplosion(0.15);
  },

  eliminated(msg) {
    addKillFeed(msg.name + ' eliminated (#' + (msg.rank || '?') + ')', 5);
    if (msg.playerId === S.myId) {
      sfxDeath();
      // Hide perk menu on death
      S.perkMenuOpen = false;
      S.pendingLevelUps = 0;
      const pm = document.getElementById('perkMenu'); if (pm) pm.style.display = 'none';
      // If we have a tracked killer, lock spectate to them. Otherwise pick any alive player.
      if (S.killerId) S.spectateTargetId = S.killerId;
      else {
        const firstAlive = S.serverPlayers.find(p => p.alive && p.id !== S.myId);
        if (firstAlive) S.spectateTargetId = firstAlive.id;
      }
    }
  },

  chat(msg) {
    S.chatLog.push({ name: msg.name, color: msg.color, text: msg.text, t: 10 });
    if (S.chatLog.length > 6) S.chatLog.shift();
    if (msg.playerId != null) showChatBubble(msg.playerId, msg.text);
  },

  barricadePlaced(msg) {
    addBarricade({ id: msg.id, cx: msg.cx, cy: msg.cy, w: msg.w, h: msg.h, angle: msg.angle });
    if (msg.ownerId === S.myId) {
      S.barricadeReadyAt = performance.now() + 5000;
      sfx(200, 0.08, 'square', 0.08); sfx(150, 0.12, 'triangle', 0.06);
    }
  },

  barricadeDestroyed(msg) {
    removeBarricade(msg.id);
    removeBulletHolesBySurfaceKey('barricade:' + msg.id);
    sfx(300, 0.08, 'square', 0.05); sfx(150, 0.15, 'sawtooth', 0.04);
  },

  barricadeHit(msg) {
    const label = '\u{1FAB5} ' + msg.dmg;
    const nc = document.createElement('canvas'); nc.width = 160; nc.height = 48;
    const ctx = nc.getContext('2d');
    ctx.font = 'bold 26px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(label, 81, 35);
    ctx.fillStyle = '#8b5a2b'; ctx.fillText(label, 80, 34);
    const tex = new THREE.CanvasTexture(nc); tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    const th = getTerrainHeight(msg.x, msg.y);
    sprite.position.set(msg.x + (Math.random()-0.5)*12, th + 40 + Math.random()*8, msg.y + (Math.random()-0.5)*12);
    sprite.scale.set(96, 28, 1);
    scene.add(sprite);
    let life = 1.3;
    const vy = 8 + Math.random() * 4;
    const vxr = (Math.random() - 0.5) * 10;
    const vzr = (Math.random() - 0.5) * 10;
    let bnDisposed = false;
    const bnCleanup = () => { if (bnDisposed) return; bnDisposed = true; scene.remove(sprite); tex.dispose(); mat.dispose(); };
    const banim = () => { if (bnDisposed) return; life -= 0.012; mat.opacity = Math.max(0, life); sprite.position.y += vy * 0.016; sprite.position.x += vxr * 0.016; sprite.position.z += vzr * 0.016; if (life <= 0) bnCleanup(); else requestAnimationFrame(banim); };
    requestAnimationFrame(banim);
    setTimeout(bnCleanup, 1800);
  },

  wallDestroyed(msg) {
    destroyWall(msg.id);
    removeBulletHolesBySurfaceKey('wall:' + msg.id);
    // Server also removes it from WALLS, but update client S.mapFeatures for consistency
    if (S.mapFeatures && S.mapFeatures.walls) {
      S.mapFeatures.walls = S.mapFeatures.walls.filter(w => w.id !== msg.id);
    }
  },

  // Cowtank rockets partially damage walls; each hit reduces hp by 1, destroy at 0.
  // The server broadcasts wallDamaged for the partial case (destruction has its own msg).
  // Today we just update the tracked hp so any future damage visual can read it — the
  // wall InstancedMesh is static per round and doesn't currently render hp deltas.
  wallDamaged(msg) {
    if (S.mapFeatures && S.mapFeatures.walls) {
      const w = S.mapFeatures.walls.find(w => w.id === msg.id);
      if (w) w.hp = msg.hp;
    }
  },

  kill(msg) {
    addKillFeed('\u{1F480} ' + (msg.killerName || '?') + ' \u2192 ' + (msg.victimName || '?'), 5);
    if (msg.victimId === S.myId) {
      S.killerId = msg.killerId;
      S.killerName = msg.killerName;
      S.spectateTargetId = msg.killerId;
    }
  },

  winner(msg) {
    addKillFeed('\u{1F451} ' + (msg.name || '?') + ' WINS!', 10); setMusicPlaying(false);
    const ws2 = document.getElementById('winScreen');
    ws2.style.display = 'flex';
    document.getElementById('winName').textContent = (msg.name || '?') + ' WINS!';
    document.getElementById('winStats').textContent = 'Score: ' + (msg.score || 0) + ' | Kills: ' + (msg.kills || 0);
    document.getElementById('winRestart').textContent = 'Next round starting soon...';
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const v = 0.32 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
      const chords = [[82.4, 164.8], [98, 196], [110, 220], [82.4, 164.8], [110, 220], [130.8, 261.6], [164.8, 329.6]];
      chords.forEach((notes, i) => {
        notes.forEach(freq => {
          const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
          const dist = getAudioCtx().createWaveShaper();
          const curve = new Float32Array(256); for (let j = 0; j < 256; j++) { const x = j * 2 / 256 - 1; curve[j] = Math.tanh(x * 3); }
          dist.curve = curve;
          o.type = 'sawtooth'; o.frequency.value = freq;
          g.gain.setValueAtTime(v, t + i * 0.2); g.gain.setValueAtTime(v, t + i * 0.2 + 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.19);
          o.connect(dist); dist.connect(g); g.connect(getAudioCtx().destination);
          o.start(t + i * 0.2); o.stop(t + i * 0.2 + 0.2);
        });
        const k = getAudioCtx().createOscillator(), kg = getAudioCtx().createGain();
        k.type = 'sine'; k.frequency.setValueAtTime(150, t + i * 0.2); k.frequency.exponentialRampToValueAtTime(30, t + i * 0.2 + 0.1);
        kg.gain.setValueAtTime(v * 1.5, t + i * 0.2); kg.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.12);
        k.connect(kg); kg.connect(getAudioCtx().destination); k.start(t + i * 0.2); k.stop(t + i * 0.2 + 0.12);
      });
      const finalT = t + chords.length * 0.2;
      [164.8, 220, 329.6].forEach(freq => {
        const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
        const dist = getAudioCtx().createWaveShaper();
        const curve = new Float32Array(256); for (let j = 0; j < 256; j++) { const x = j * 2 / 256 - 1; curve[j] = Math.tanh(x * 4); }
        dist.curve = curve;
        o.type = 'sawtooth'; o.frequency.value = freq;
        g.gain.setValueAtTime(v * 1.2, finalT); g.gain.exponentialRampToValueAtTime(0.001, finalT + 1.5);
        o.connect(dist); dist.connect(g); g.connect(getAudioCtx().destination);
        o.start(finalT); o.stop(finalT + 1.5);
      });
    }
  },

  restart(msg) {
    if (msg.countdown > 0) return;
    // Hard refresh between rounds to clear any accumulated three.js / GPU resources.
    // Skipped when debug mode (P) is on so profiles can span multiple rounds.
    if (!S.debugMode) {
      try { localStorage.setItem('cowName3d', document.getElementById('nameIn').value || ''); } catch(e) {}
      setTimeout(() => { location.reload(); }, 300);
    }
    S.state = 'lobby';
    updateHostControls();
    document.getElementById('joinScreen').style.display = 'flex';
    document.getElementById('joinScreen').querySelector('h2').textContent = 'Waiting for cows...';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('winScreen').style.display = 'none';
    // Flush all game state
    for (const id in S.cowMeshes) {
      const obj = S.cowMeshes[id];
      disposeMeshTree(obj.mesh);
      if (obj.hpSprite) obj.hpSprite.tex.dispose();
      if (obj.shieldBubble) obj.shieldBubble.material.dispose();
      if (obj.spawnBubble) obj.spawnBubble.material.dispose();
    }
    S.cowMeshes = {};
    for (const id in S.projMeshes) disposeMeshTree(S.projMeshes[id]);
    S.projMeshes = {};
    S.projData = [];
    clearPickups();
    clearRocketSounds();
    clearParticles();
    S.serverPlayers = [];
    S.me = null;
    S.serverFoods = [];
    S.clientWeapons = [];
    S.chatLog = [];
    S.mapBuilt = false;
    S.pendingLevelUps = 0;
    S.perkMenuOpen = false;
    S.spectateTargetId = null; S.killerId = null; S.killerName = null;
    S.barricadeReadyAt = 0;
    clearBarricades();
    S._botRevealTime = null;
    document.getElementById('perkMenu').style.display = 'none';
    // Reset the queue/ready button — only reachable in debug mode where
    // we don't reload between rounds.
    const jbReset = document.getElementById('joinBtn');
    if (jbReset) {
      jbReset.textContent = 'QUEUE FOR MEADOW';
      jbReset.style.background = '';
      jbReset.style.color = '';
      jbReset.style.display = '';
    }
    startMenuMusic();
  },

  levelup(msg) {
    // Skip if spectating (not alive)
    if (!S.me || !S.me.alive) return;
    sfxLevelUp();
    flashEdge('levelupEdgeFlash');
    S.pendingLevelUps = (S.pendingLevelUps || 0) + 1;
    if (!S.perkMenuOpen) showPerkMenu();
  },

  cowstrikeWarning(msg) {
    addKillFeed('\u{1F6A8} ' + (msg.name || '?') + ' CALLED COWSTRIKE! TAKE COVER!', 6);
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const o = getAudioCtx().createOscillator(), g = getAudioCtx().createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t);
      o.frequency.linearRampToValueAtTime(900, t + 0.75); o.frequency.linearRampToValueAtTime(300, t + 1.5);
      o.frequency.linearRampToValueAtTime(900, t + 2.25); o.frequency.linearRampToValueAtTime(300, t + 3);
      const cv = 0.06 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(cv, t + 0.2);
      g.gain.setValueAtTime(cv, t + 2.5); g.gain.linearRampToValueAtTime(0, t + 3);
      o.connect(g); g.connect(getAudioCtx().destination); o.start(t); o.stop(t + 3);
    }
  },

  cowstrike(msg) {
    addKillFeed('\u{1F4A5} COWSTRIKE WAVE ' + (((msg.wave || 0) + 1)) + '!', 4);
    const amAffected = msg.affectedIds && msg.affectedIds.indexOf(S.myId) >= 0;
    if (getAudioCtx()) {
      const t = getAudioCtx().currentTime;
      const bs = getAudioCtx().sampleRate * 0.3, b = getAudioCtx().createBuffer(1, bs, getAudioCtx().sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / bs * 3);
      const n = getAudioCtx().createBufferSource(); n.buffer = b; const ng = getAudioCtx().createGain();
      const sv = 0.08 * (typeof S.masterVol !== 'undefined' ? S.masterVol : 0.5);
      ng.gain.setValueAtTime(sv, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      n.connect(ng); ng.connect(getAudioCtx().destination); n.start(t); n.stop(t + 0.4);
      sfx(60, 0.4, 'sine', 0.08);
    }
    if (amAffected) {
      flashHit(0.6, 500, 'rgba(255,100,0,0.5)');
    }
    // Cowstrike fireball storm — pooled particles, no per-particle RAF.
    // Each fireball falls with linear velocity for a computed time, then setTimeout fires the explosion.
    for (let i = 0; i < 50; i++) {
      const rx = cam.position.x + (Math.random() - 0.5) * 800;
      const rz = cam.position.z + (Math.random() - 0.5) * 800;
      const startY = 300 + Math.random() * 200;
      const groundH = getTerrainHeight(rx, rz);
      const fallDist = startY - (groundH + 5);
      const fallSpeed = 360 + Math.random() * 600; // units/sec
      const fallTime = fallDist / fallSpeed;
      const delayMs = Math.random() * 800;
      // Falling fireball
      setTimeout(() => {
        spawnParticle({
          geo: PGEO_SPHERE_MED, color: Math.random() > 0.3 ? 0xff4400 : 0xffaa00,
          x: rx, y: startY, z: rz,
          sx: 2 + Math.random() * 4,
          life: fallTime, peakOpacity: 1,
          vy: -fallSpeed,
        });
      }, delayMs);
      // Explosion at landing — fireball + shock ring + debris
      setTimeout(() => {
        spawnParticle({
          geo: PGEO_SPHERE_MED, color: 0xff6600,
          x: rx, y: groundH + 8, z: rz,
          sx: 12, life: 0.8, peakOpacity: 1, growth: 3,
        });
        spawnParticle({
          geo: PGEO_TORUS, color: 0xffaa00,
          x: rx, y: groundH + 3, z: rz,
          sx: 5, sy: 5, sz: 5, rotX: Math.PI / 2,
          life: 0.6, peakOpacity: 1, growth: 6, side: THREE.DoubleSide,
        });
        for (let j = 0; j < 12; j++) {
          const col = Math.random() > 0.3 ? 0xff4400 : (Math.random() > 0.5 ? 0xffdd00 : 0xff8800);
          spawnParticle({
            geo: PGEO_SPHERE_LO, color: col,
            x: rx, y: groundH + 5, z: rz,
            sx: 1.5 + Math.random() * 3,
            life: 0.7 + Math.random() * 0.3, peakOpacity: 1,
            vx: (Math.random() - 0.5) * 120,
            vy: 40 + Math.random() * 80,
            vz: (Math.random() - 0.5) * 120,
            gy: 180,
            growth: -2.5,
          });
        }
      }, delayMs + fallTime * 1000);
    }
    const shakeBaseX = cam.position.x, shakeBaseZ = cam.position.z;
    const shakeStart = performance.now();
    const shakeDur = 600; // wall-clock ms
    const shake = () => {
      const frac = Math.min(1, (performance.now() - shakeStart) / shakeDur);
      cam.position.x = shakeBaseX + (Math.random() - 0.5) * 3 * (1 - frac);
      cam.position.z = shakeBaseZ + (Math.random() - 0.5) * 3 * (1 - frac);
      if (frac < 1) requestAnimationFrame(shake);
    };
    shake();
  },

  botsToggled(msg) {
    document.getElementById('botsCheck').checked = msg.enabled;
    addKillFeed('Bots ' + (msg.enabled ? 'enabled' : 'disabled'), 3);
  },

  botsFreeWillToggled(msg) {
    document.getElementById('botsFreeWillCheck').checked = msg.enabled;
    addKillFeed('Bot free will ' + (msg.enabled ? 'granted' : 'revoked'), 3);
  },

  dash(msg) {
    const dasher = S.serverPlayers.find(p => p.id === msg.playerId);
    if (dasher) {
      // Use interpolated position for remote dashers so the dust lands on
      // the visible cow, not 100 ms ahead of it.
      const smooth = dasher.id === S.myId
        ? { x: dasher.x, y: dasher.y }
        : interpSamplePlayer(dasher, performance.now());
      const th = getTerrainHeight(smooth.x, smooth.y);
      for (let i = 0; i < 15; i++) {
        const sz = 3 + Math.random() * 4;
        spawnParticle({
          geo: PGEO_SPHERE_LO, color: 0xcccccc,
          x: smooth.x + (Math.random() - 0.5) * 20,
          y: th + 5 + Math.random() * 15,
          z: smooth.y + (Math.random() - 0.5) * 20,
          sx: sz, life: 0.8 + Math.random() * 0.4, peakOpacity: 0.6,
          vy: 30, growth: 1.8,
        });
      }
    }
    sfx(300, 0.15, 'sine', 0.08);
  },

  weaponPickup(msg) {
    S.clientWeapons = S.clientWeapons.filter(w => w.id !== msg.pickupId);
    const _wn = { shotgun: 'Benelli', burst: 'M16A2', bolty: 'L96', cowtank: 'M72 LAW', aug: 'AUG' };
    const wpName = _wn[msg.weapon] || msg.weapon || 'weapon';
    if (msg.playerId === S.myId) {
      addKillFeed('Picked up ' + wpName + '!', 3);
      // Default to full-auto when picking up a weapon with a fire selector
      if (BURST_FAMILY.has(msg.weapon)) S.fireMode = 'auto';
    }
    else addKillFeed((msg.name || '?') + ' picked up ' + wpName, 3);
  },

  weaponSpawn(msg) {
    S.clientWeapons.push({ id: msg.id, x: msg.x, y: msg.y, weapon: msg.weapon, spawnTime: msg.spawnTime || Date.now() });
  },

  weaponDespawn(msg) {
    S.clientWeapons = S.clientWeapons.filter(w => w.id !== msg.id);
  },

  weaponDrop(msg) {
    if (msg.playerId === S.myId) addKillFeed('Dropped weapon', 3);
    else addKillFeed((msg.name || '?') + ' dropped their weapon', 3);
  },

  reloaded(msg) {
    if (msg.playerId !== S.myId) return;
    addKillFeed('Reloaded!', 1.5);
    if (BURST_FAMILY.has(msg.weapon)) sfxReloadLR();
    else if (msg.weapon === 'bolty') sfxReloadBolty();
    else if (msg.weapon === 'shotgun') sfxShellLoad();
  },

  shellLoaded(msg) {
    if (msg.playerId === S.myId) sfxShellLoad();
  },

  emptyMag(msg) {
    sfxEmptyMag();
  },

  armorPickup(msg) {
    onArmorPickup(msg.pickupId);
    if (msg.playerId === S.myId) addKillFeed('Picked up shield (+25)', 3);
  },

  armorSpawn(msg) {
    onArmorSpawn({ id: msg.id, x: msg.x, y: msg.y });
  },

  shieldHit(msg) {
    const th = getTerrainHeight(msg.x, msg.y);
    // Blue flash particles — pooled
    for (let i = 0; i < 8; i++) {
      spawnParticle({
        geo: PGEO_SPHERE_LO, color: 0x5588ff,
        x: msg.x + (Math.random() - 0.5) * 30,
        y: th + 10 + Math.random() * 20,
        z: msg.y + (Math.random() - 0.5) * 30,
        sx: 1 + Math.random() * 2,
        life: 0.3 + Math.random() * 0.2, peakOpacity: 0.7,
        growth: -2.5,
      });
    }
    sfx(800, 0.1, 'sine', 0.05);
  },

  shieldBreak(msg) {
    const th = getTerrainHeight(msg.x, msg.y);
    // Shield break explosion — expanding blue ring (pooled torus, rotated flat)
    spawnParticle({
      geo: PGEO_TORUS, color: 0x5588ff,
      x: msg.x, y: th + 14, z: msg.y,
      sx: 5, sy: 5, sz: 5,
      rotX: Math.PI / 2,
      life: 0.4, peakOpacity: 0.5, growth: 7, side: THREE.DoubleSide,
    });
    // Blue shard particles
    for (let i = 0; i < 15; i++) {
      spawnParticle({
        geo: PGEO_BOX, color: 0x88bbff,
        x: msg.x, y: th + 14, z: msg.y,
        sx: 1, sy: 2, sz: 0.5,
        life: 0.6 + Math.random() * 0.3, peakOpacity: 0.8,
        vx: (Math.random() - 0.5) * 120,
        vy: 30 + Math.random() * 60,
        vz: (Math.random() - 0.5) * 120,
        gy: 180,
        rotVx: 12, rotVz: 9,
      });
    }
    sfx(400, 0.15, 'triangle', 0.1); sfx(200, 0.2, 'sine', 0.08);
  },
};

// Drift guard: ensure every server->client message type in the shared enum has
// a handler defined above. A missing handler here means either a stale message
// in the enum or a handler that was renamed without updating callers — either
// way, we want to know loudly at boot, not when a specific message silently
// gets dropped mid-round.
(function assertHandlerCoverage() {
  const missing = [];
  for (const type of Object.values(S2C)) {
    if (typeof handlers[type] !== 'function') missing.push(type);
  }
  if (missing.length) {
    console.error('[message-handlers] missing handlers for:', missing.join(', '));
  }
})();
