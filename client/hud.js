import { MW, MH } from './config.js';
import S from './state.js';
import { BURST_FAMILY } from '../shared/constants.js';

// Cache all HUD element refs at first invocation instead of calling getElementById every frame
let H = null;
function initHudRefs() {
  H = {
    fpsCounter: document.getElementById('fpsCounter'),
    weapon: document.getElementById('weapon'),
    hunger: document.getElementById('hunger'),
    hungerFill: document.getElementById('hungerFill'),
    hungerTxt: document.getElementById('hungerTxt'),
    xpBar: document.getElementById('xpBar'),
    xpFill: document.getElementById('xpFill'),
    xpTxt: document.getElementById('xpTxt'),
    dashBar: document.getElementById('dashBar'),
    dashFill: document.getElementById('dashFill'),
    atkBar: document.getElementById('atkBar'),
    atkFill: document.getElementById('atkFill'),
    armorBar: document.getElementById('armorBar'),
    armorFill: document.getElementById('armorFill'),
    armorTxt: document.getElementById('armorTxt'),
    crosshair: document.getElementById('crosshair'),
    chN: document.getElementById('chN'),
    chS: document.getElementById('chS'),
    chE: document.getElementById('chE'),
    chW: document.getElementById('chW'),
    barricadeBar: document.getElementById('barricadeBar'),
    barricadeFill: document.getElementById('barricadeFill'),
    barricadeLabel: document.getElementById('barricadeLabel'),
    spectateMsg: document.getElementById('spectateMsg'),
    playerCount: document.getElementById('playerCount'),
    chatLog: document.getElementById('chatLog'),
    minimap: document.getElementById('minimap'),
    lowHealthOverlay: document.getElementById('lowHealthOverlay'),
    spawnProtOverlay: document.getElementById('spawnProtOverlay'),
  };
}

export function updateHud(me, time, dt) {
  if (!H) initHudRefs();
  // FPS counter
  S.fpsFrames++;
  const fpsNow = performance.now();
  if (fpsNow - S.fpsLast >= 1000) { S.fpsDisplay = S.fpsFrames; S.fpsFrames = 0; S.fpsLast = fpsNow; }
  H.fpsCounter.textContent = S.fpsDisplay + 'fps | ' + Math.round(S.pingVal) + 'ms';

  // Hide alive-only HUD elements when spectating
  const aliveHud = me && me.alive;
  const aliveDisp = aliveHud ? '' : 'none';
  if (S._aliveDisp !== aliveDisp) {
    S._aliveDisp = aliveDisp;
    H.weapon.style.display = aliveDisp;
    H.hunger.style.display = aliveDisp;
    H.xpBar.style.display = aliveDisp;
    H.dashBar.style.display = aliveDisp;
    H.atkBar.style.display = aliveDisp;
    H.crosshair.style.display = aliveDisp;
    H.barricadeBar.style.display = aliveDisp;
    H.barricadeLabel.style.display = aliveDisp;
  }

  if (!me) return;
  const hPct = Math.max(0, me.hunger / 100);
  H.hungerFill.style.width = (hPct * 100) + '%';
  H.hungerFill.style.background = hPct > 0.5 ? '#ffffff' : hPct > 0.25 ? '#dddddd' : '#ff4444';
  H.hungerTxt.textContent = 'MILK ' + Math.ceil(me.hunger) + '%';
  const wep = me.weapon || 'normal';
  const wepNames = { shotgun: 'Benelli', burst: 'M16A2', bolty: 'L96', cowtank: 'M72 LAW', normal: 'M92 Pistol', aug: 'AUG' };
  let ammoTxt = '';
  let reloadBlock = '';
  if (wep === 'cowtank') {
    // M72 LAW is a single-shot disposable weapon
    ammoTxt = ' 1/1';
  } else if (me.ammo >= 0) {
    const BASE_MAG = {normal: 15, burst: 20, shotgun: 6, bolty: 5, aug: 30};
    const EXT_MAG = {normal: 19, burst: 25, shotgun: 8, bolty: 7, aug: 38};
    const hasExt = (me.extMagMult || 1) > 1;
    const baseMag = (hasExt ? EXT_MAG[wep] : BASE_MAG[wep]) || 0;
    const dualMult = (me.dualWield && (wep === 'burst' || wep === 'shotgun')) ? 2 : 1;
    const maxMag = baseMag * dualMult;
    ammoTxt = ' ' + me.ammo + '/' + maxMag;
    // Reload progress bar — track start time and expected duration client-side
    if (me.reloading) {
      if (!S._reloadStart) {
        S._reloadStart = performance.now();
        const RELOAD_MS = { burst: 2000, bolty: 2500, normal: 2000 };
        const reloadMult = me.dualWield ? 2 : 1;
        if (wep === 'shotgun') S._reloadDuration = Math.max(750, (maxMag - me.ammo) * 750);
        else S._reloadDuration = (RELOAD_MS[wep] || 2000) * reloadMult;
      }
      const elapsed = performance.now() - S._reloadStart;
      const pct = Math.min(100, (elapsed / S._reloadDuration) * 100);
      reloadBlock =
        '<div style="color:#ffaa44;font-size:0.35em;margin-bottom:4px;line-height:1">RELOADING...</div>' +
        '<div style="width:260px;height:10px;background:rgba(0,0,0,0.6);border-radius:3px;margin:0 0 8px auto">' +
          '<div style="height:100%;border-radius:3px;background:#ffaa44;width:' + pct + '%"></div>' +
        '</div>';
    } else {
      S._reloadStart = null;
      S._reloadDuration = null;
    }
  }
  // Fire mode indicator — shown for weapons with selector switches
  let fireModeBlock = '';
  if (BURST_FAMILY.has(wep)) {
    const modeLabel = S.fireMode === 'auto' ? 'AUTO' : S.fireMode === 'semi' ? 'SEMI' : 'BURST';
    fireModeBlock = '<div>' + modeLabel + '</div>';
  }
  const dualTag = me.dualWield ? ' ×2' : '';
  const weaponSig = wep + '|' + ammoTxt + '|' + dualTag + '|' + fireModeBlock + '|' + reloadBlock;
  if (S._weaponSig !== weaponSig) {
    S._weaponSig = weaponSig;
    H.weapon.innerHTML = reloadBlock + fireModeBlock + (wepNames[wep] || wep) + dualTag + ammoTxt;
  }
  const armorVal = me.armor || 0;
  H.armorBar.style.display = (aliveHud && armorVal > 0) ? 'block' : 'none';
  H.armorFill.style.width = Math.min(100, armorVal) + '%';
  H.armorTxt.textContent = 'SHIELD ' + Math.ceil(armorVal);
  const xpPct = me.xpToNext > 0 ? Math.max(0, Math.min(100, (me.xp || 0) / (me.xpToNext || 50) * 100)) : 0;
  H.xpFill.style.width = xpPct + '%';
  H.xpTxt.textContent = 'LV' + (me.level || 0) + ' ' + Math.floor(me.xp || 0) + '/' + (me.xpToNext || 50) + ' XP';
  H.lowHealthOverlay.style.display = me.hunger < 30 ? 'block' : 'none';
  H.lowHealthOverlay.style.opacity = me.hunger < 30 ? Math.min(1, (30 - me.hunger) / 30 * (0.5 + Math.sin(time * 4) * 0.2)) : '0';
  if (H.spawnProtOverlay) {
    H.spawnProtOverlay.style.display = me.spawnProt ? 'block' : 'none';
    if (me.spawnProt) H.spawnProtOverlay.style.opacity = 0.3 + Math.sin(time * 6) * 0.1;
  }

  // Dash cooldown bar
  const dashMax = 3 * (me.dashCdMult || 1);
  const dashPct = me.dashCooldown > 0 ? Math.min(100, (me.dashCooldown / dashMax) * 100) : 0;
  H.dashFill.style.width = (100 - dashPct) + '%';
  H.dashFill.style.background = dashPct > 0 ? '#225588' : '#44aaff';
  // Barricade cooldown bar
  const nowMs = performance.now();
  const remaining = Math.max(0, S.barricadeReadyAt - nowMs);
  const barrPct = remaining > 0 ? 100 - Math.min(100, (remaining / 5000) * 100) : 100;
  H.barricadeFill.style.width = barrPct + '%';
  H.barricadeFill.style.background = remaining > 0 ? '#663322' : '#aa6633';
  // Attack cooldown — dynamically capture the peak of each cooldown window
  if (me.attackCooldown > (S._atkCdMax || 0)) S._atkCdMax = me.attackCooldown;
  if (me.attackCooldown <= 0) S._atkCdMax = 0;
  const atkMax = S._atkCdMax || 1;
  const atkPct = me.attackCooldown > 0 ? Math.min(100, (me.attackCooldown / atkMax) * 100) : 0;
  H.atkFill.style.width = (100 - atkPct) + '%';
  H.atkFill.style.background = atkPct > 0 ? '#882222' : '#ff6644';

  // Dynamic crosshair — spread per weapon, tightens when crouched, widens on movement/reload
  if (H.chN && aliveHud) {
    // AUG hipfire spread is 1.5x the M16 equivalent; the optic + ADS
    // gate brings it back to baseline when scoped (the adsMult below).
    const augBase = (S.fireMode === 'auto' ? 18 : 8) * 1.5;
    const baseSpread = { normal: 8, shotgun: 42, bolty: 5, cowtank: 10, burst: S.fireMode === 'auto' ? 18 : 8, aug: augBase }[wep] || 8;
    const crouchMult = S.crouching ? 0.35 : 1;
    const movingMult = (S.keys['KeyW'] || S.keys['KeyS'] || S.keys['KeyA'] || S.keys['KeyD']) ? 2.2 : 1;
    const reloadMult = me.reloading ? 2.6 : 1;
    const spread = Math.round(baseSpread * crouchMult * movingMult * reloadMult);
    H.chN.style.marginTop = (-spread - 8) + 'px';
    H.chS.style.marginTop = spread + 'px';
    H.chE.style.marginLeft = spread + 'px';
    H.chW.style.marginLeft = (-spread - 8) + 'px';
  }
  const specEl = H.spectateMsg;
  if (me && me.alive) {
    if (specEl.style.display !== 'none') specEl.style.display = 'none';
  } else {
    if (specEl.style.display !== 'block') specEl.style.display = 'block';
    // Only rebuild the spectate HTML when the tracked target actually changes
    const target = S.serverPlayers.find(p => p.id === S.spectateTargetId);
    const signature = (S.killerName || '') + '|' + (target ? target.name : '');
    if (S._specSignature !== signature) {
      S._specSignature = signature;
      let html = '';
      if (S.killerName) html += '<div style="color:#ff4444;font-size:22px;font-weight:bold;margin-bottom:6px">\u{1F480} KILLED BY ' + S.killerName.toUpperCase() + '</div>';
      if (target) {
        html += '<div style="color:#ffdd44;font-size:20px;font-weight:bold">\u{1F441} SPECTATING: ' + target.name + '</div>';
        html += '<div style="font-size:12px;color:#aaccff;margin-top:4px">click / \u2190 \u2192 to switch target</div>';
      } else {
        html += '<div>SPECTATING - waiting for next round</div>';
      }
      specEl.innerHTML = html;
    }
  }
  // Player count — walk once, sig-gate the DOM write
  let _aliveCount = 0;
  for (let i = 0; i < S.serverPlayers.length; i++) if (S.serverPlayers[i].alive) _aliveCount++;
  const pcSig = _aliveCount + '/' + S.serverPlayers.length;
  if (S._pcSig !== pcSig) { S._pcSig = pcSig; H.playerCount.textContent = '\u{1F404} ' + pcSig; }

  // Chat log — kill notifications, weapon pickups, mode changes, and
  // actual player chat all share this surface. Decrement + DOM rebuild
  // throttled to 10 Hz; in-place prune avoids the per-frame array realloc.
  if (!S._hudTick) S._hudTick = 0;
  S._hudTick += dt;
  if (S._hudTick >= 0.1) {
    const tickDt = S._hudTick;
    S._hudTick = 0;
    for (let i = S.chatLog.length - 1; i >= 0; i--) {
      S.chatLog[i].t -= tickDt;
      if (S.chatLog[i].t <= 0) S.chatLog.splice(i, 1);
    }
    const chatEl = H.chatLog;
    if (chatEl) {
      const colHex = { pink: '#ff88aa', blue: '#88aaff', green: '#88ff88', gold: '#ffdd44', purple: '#cc88ff', red: '#ff4444', orange: '#ff8844', cyan: '#44ffdd' };
      const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      chatEl.innerHTML = S.chatLog.map(c => {
        const opacity = Math.min(1, c.t / 3);
        if (c.system) {
          return '<div style="margin-bottom:2px;opacity:' + opacity + ';color:#ddd">' + c.text + '</div>';
        }
        const col = colHex[c.color] || '#ff88aa';
        return '<div style="margin-bottom:2px;opacity:' + opacity + '"><span style="color:' + col + ';font-weight:bold">' + escapeHtml(c.name) + ':</span> ' + escapeHtml(c.text) + '</div>';
      }).join('');
    }
  }

  // Debug overlay
  let dbg = document.getElementById('debugOverlay');
  if (!dbg && S.debugMode) {
    dbg = document.createElement('div'); dbg.id = 'debugOverlay';
    dbg.style.cssText = 'position:absolute;top:40px;left:10px;font-size:11px;color:#44ff44;text-shadow:1px 1px #000;font-family:monospace;white-space:pre;z-index:20;pointer-events:none';
    document.getElementById('hud').appendChild(dbg);
  }
  if (dbg) {
    dbg.style.display = S.debugMode ? 'block' : 'none';
    if (S.debugMode && me) {
      const yawDeg = ((S.yaw * 180 / Math.PI) % 360).toFixed(1);
      const pitchDeg = (S.pitch * 180 / Math.PI).toFixed(1);
      // Inchworm movement diagnostics — only relevant when debugging stuttery motion.
      // gaps: time between server 'state' messages (should be ~50ms at 20Hz, tight distribution)
      // deltas: per-message distance our player moved in the authoritative state
      // frameGaps: time between render frames (should be ~16ms at 60fps)
      // The underlying storage is a ring buffer; we walk only the valid prefix (count).
      let iwLine = '';
      if (S._iwStats) {
        const fmtRing = (buf, count) => {
          if (!buf || count === 0) return 'n/a';
          let min = Infinity, max = -Infinity, sum = 0;
          for (let i = 0; i < count; i++) { const v = buf[i]; if (v < min) min = v; if (v > max) max = v; sum += v; }
          return min.toFixed(0) + '/' + (sum / count).toFixed(0) + '/' + max.toFixed(0);
        };
        const iw = S._iwStats;
        iwLine = '\nSTATE gap ms: ' + fmtRing(iw.gaps, iw.gapsCount) +
                 '\nPOS delta: ' + fmtRing(iw.deltas, iw.deltasCount) +
                 '\nFRAME gap ms: ' + fmtRing(iw.frameGaps, iw.frameGapsCount) +
                 '\nJANK frames (>50ms): ' + iw.frameJank;
      }
      dbg.textContent =
        'POS: ' + me.x.toFixed(0) + ', ' + me.y.toFixed(0) + ', ' + (me.z || 0).toFixed(1) +
        '\nAIM: yaw=' + yawDeg + ' pitch=' + pitchDeg +
        '\nWEP: ' + (me.weapon || 'normal') + ' ammo=' + (me.ammo >= 0 ? me.ammo : '\u221E') + (S.fireMode ? ' [' + S.fireMode + ']' : '') +
        '\nFPS: ' + S.fpsDisplay + ' PING: ' + Math.round(S.pingVal) + 'ms' +
        '\nPLAYERS: ' + _aliveCount + '/' + S.serverPlayers.length +
        '\nPROJ: ' + S.projData.length +
        iwLine;
    }
  }

  // Minimap — throttled to 10 Hz (shares the _hudTick counter)
  if (S._hudTick === 0) {
    const mc = H.minimap, mctx = mc.getContext('2d');
    mctx.clearRect(0, 0, 120, 90); mctx.fillStyle = 'rgba(0,0,0,0.6)'; mctx.fillRect(0, 0, 120, 90);
    const sx = 120 / MW, sy = 90 / MH;
    for (const p of S.serverPlayers) {
      mctx.fillStyle = p.id === S.myId ? '#ffdd44' : (p.alive ? '#ff88aa' : '#555');
      mctx.fillRect(p.x * sx - 1, p.y * sy - 1, 3, 3);
    }
    mctx.fillStyle = 'rgba(255,255,100,0.4)';
    for (const f of S.serverFoods) { mctx.fillRect(f.x * sx, f.y * sy, 1, 1); }
  }
}
