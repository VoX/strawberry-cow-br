import { MW, MH } from './config.js';
import S from './state.js';

export function updateHud(me, time, dt) {
  // FPS counter
  S.fpsFrames++;
  const fpsNow = performance.now();
  if (fpsNow - S.fpsLast >= 1000) { S.fpsDisplay = S.fpsFrames; S.fpsFrames = 0; S.fpsLast = fpsNow; }
  document.getElementById('fpsCounter').textContent = S.fpsDisplay + 'fps | ' + Math.round(S.pingVal) + 'ms';

  // Hide alive-only HUD elements when spectating
  const aliveHud = me && me.alive;
  const aliveDisp = aliveHud ? '' : 'none';
  ['weapon', 'hunger', 'xpBar', 'dashBar', 'atkBar', 'crosshair', 'barricadeBar', 'barricadeLabel'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = aliveDisp;
  });

  if (!me) return;
  const hPct = Math.max(0, me.hunger / 100);
  document.getElementById('hungerFill').style.width = (hPct * 100) + '%';
  document.getElementById('hungerFill').style.background = hPct > 0.5 ? '#ffffff' : hPct > 0.25 ? '#dddddd' : '#ff4444';
  document.getElementById('hungerTxt').textContent = 'MILK ' + Math.ceil(me.hunger) + '%';
  const wep = me.weapon || 'normal';
  const wepNames = { shotgun: 'Benelli', burst: 'M16A2', bolty: 'L96', cowtank: 'M72 LAW', normal: 'Spit' };
  let ammoTxt = '';
  let reloadBlock = '';
  if (me.ammo >= 0) {
    const baseMag = {normal: 15, burst: 30, shotgun: 6, bolty: 5}[wep] || 0;
    const maxMag = Math.ceil(baseMag * (me.extMagMult || 1));
    ammoTxt = ' ' + me.ammo + '/' + maxMag;
    // Reload progress bar — track start time and expected duration client-side
    if (me.reloading) {
      if (!S._reloadStart) {
        S._reloadStart = performance.now();
        const RELOAD_MS = { burst: 2000, bolty: 2500, normal: 2000 };
        if (wep === 'shotgun') S._reloadDuration = Math.max(750, (maxMag - me.ammo) * 750);
        else S._reloadDuration = RELOAD_MS[wep] || 2000;
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
  document.getElementById('weapon').innerHTML = reloadBlock + (wepNames[wep] || wep) + (me.weaponLevel > 0 ? ' Lv' + (me.weaponLevel + 1) : '') + ammoTxt;
  const armorVal = me.armor || 0;
  document.getElementById('armorBar').style.display = (aliveHud && armorVal > 0) ? 'block' : 'none';
  document.getElementById('armorFill').style.width = Math.min(100, armorVal) + '%';
  document.getElementById('armorTxt').textContent = 'SHIELD ' + Math.ceil(armorVal);
  const xpPct = me.xpToNext > 0 ? Math.max(0, Math.min(100, (me.xp || 0) / (me.xpToNext || 50) * 100)) : 0;
  document.getElementById('xpFill').style.width = xpPct + '%';
  document.getElementById('xpTxt').textContent = 'LV' + (me.level || 0) + ' ' + Math.floor(me.xp || 0) + '/' + (me.xpToNext || 50) + ' XP';
  document.getElementById('lowHealthOverlay').style.display = me.hunger < 30 ? 'block' : 'none';
  document.getElementById('lowHealthOverlay').style.opacity = me.hunger < 30 ? Math.min(1, (30 - me.hunger) / 30 * (0.5 + Math.sin(time * 4) * 0.2)) : '0';
  // Spawn protection golden overlay
  const spawnEl = document.getElementById('spawnProtOverlay');
  if (spawnEl) {
    spawnEl.style.display = me.spawnProt ? 'block' : 'none';
    if (me.spawnProt) spawnEl.style.opacity = 0.3 + Math.sin(time * 6) * 0.1;
  }

  // Dash and attack cooldown bars
  const dashFill = document.getElementById('dashFill');
  if (dashFill) {
    const dashMax = 3 * (me.dashCdMult || 1);
    const dashPct = me.dashCooldown > 0 ? Math.min(100, (me.dashCooldown / dashMax) * 100) : 0;
    dashFill.style.width = (100 - dashPct) + '%';
    dashFill.style.background = dashPct > 0 ? '#225588' : '#44aaff';
  }
  // Barricade cooldown bar — fills up client-side from the last placement timestamp
  const barrFill = document.getElementById('barricadeFill');
  if (barrFill) {
    const nowMs = performance.now();
    const remaining = Math.max(0, S.barricadeReadyAt - nowMs);
    const pct = remaining > 0 ? 100 - Math.min(100, (remaining / 5000) * 100) : 100;
    barrFill.style.width = pct + '%';
    barrFill.style.background = remaining > 0 ? '#663322' : '#aa6633';
  }
  const atkFill = document.getElementById('atkFill');
  if (atkFill) {
    // Dynamically capture the peak of each cooldown window so the bar shows real progress
    if (me.attackCooldown > (S._atkCdMax || 0)) S._atkCdMax = me.attackCooldown;
    if (me.attackCooldown <= 0) S._atkCdMax = 0;
    const atkMax = S._atkCdMax || 1;
    const atkPct = me.attackCooldown > 0 ? Math.min(100, (me.attackCooldown / atkMax) * 100) : 0;
    atkFill.style.width = (100 - atkPct) + '%';
    atkFill.style.background = atkPct > 0 ? '#882222' : '#ff6644';
  }

  // Dynamic crosshair — spread per weapon, tightens when crouched
  const chN = document.getElementById('chN'), chS = document.getElementById('chS'), chE = document.getElementById('chE'), chW = document.getElementById('chW');
  if (chN && aliveHud) {
    const baseSpread = { normal: 4, shotgun: 22, bolty: 2, cowtank: 5, burst: S.fireMode === 'auto' ? 9 : 4 }[wep] || 4;
    const crouchMult = S.crouching ? 0.73 : 1;
    const movingMult = (S.keys['KeyW'] || S.keys['KeyS'] || S.keys['KeyA'] || S.keys['KeyD']) ? 1.35 : 1;
    const reloadMult = me.reloading ? 1.5 : 1;
    const spread = Math.round(baseSpread * crouchMult * movingMult * reloadMult);
    chN.style.marginTop = (-spread - 6) + 'px';
    chS.style.marginTop = spread + 'px';
    chE.style.marginLeft = spread + 'px';
    chW.style.marginLeft = (-spread - 6) + 'px';
  }
  document.getElementById('score').textContent = (me && me.alive ? 'Score: ' + (me.score || 0) + ' | Kills: ' + (me.kills || 0) + ' | Lv' + (me.level || 0) : 'Waiting for next round...');
  const specEl = document.getElementById('spectateMsg');
  if (me && me.alive) {
    specEl.style.display = 'none';
  } else {
    specEl.style.display = 'block';
    const target = S.serverPlayers.find(p => p.id === S.spectateTargetId);
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
  document.getElementById('playerCount').textContent = '\u{1F404} ' + S.serverPlayers.filter(p => p.alive).length + '/' + S.serverPlayers.length;

  // Killfeed
  S.killfeed.forEach(k => k.t -= dt); S.killfeed = S.killfeed.filter(k => k.t > 0);
  document.getElementById('killfeed').innerHTML = S.killfeed.map(k => '<div style="margin-bottom:3px;opacity:' + Math.min(1, k.t) + '">' + k.txt + '</div>').join('');

  // Chat log — fades out after 10 seconds
  S.chatLog.forEach(c => c.t -= dt); S.chatLog = S.chatLog.filter(c => c.t > 0);
  const chatEl = document.getElementById('chatLog');
  if (chatEl) {
    const colHex = { pink: '#ff88aa', blue: '#88aaff', green: '#88ff88', gold: '#ffdd44', purple: '#cc88ff', red: '#ff4444', orange: '#ff8844', cyan: '#44ffdd' };
    const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    chatEl.innerHTML = S.chatLog.map(c => {
      const col = colHex[c.color] || '#ff88aa';
      const opacity = Math.min(1, c.t / 3);
      return '<div style="margin-bottom:2px;opacity:' + opacity + '"><span style="color:' + col + ';font-weight:bold">' + escapeHtml(c.name) + ':</span> ' + escapeHtml(c.text) + '</div>';
    }).join('');
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
      dbg.textContent =
        'POS: ' + me.x.toFixed(0) + ', ' + me.y.toFixed(0) + ', ' + (me.z || 0).toFixed(1) +
        '\nAIM: yaw=' + yawDeg + ' pitch=' + pitchDeg +
        '\nWEP: ' + (me.weapon || 'normal') + ' ammo=' + (me.ammo >= 0 ? me.ammo : '\u221E') + (S.fireMode ? ' [' + S.fireMode + ']' : '') +
        '\nFPS: ' + S.fpsDisplay + ' PING: ' + Math.round(S.pingVal) + 'ms' +
        '\nPLAYERS: ' + S.serverPlayers.filter(p => p.alive).length + '/' + S.serverPlayers.length +
        '\nPROJ: ' + S.projData.length;
    }
  }

  // Minimap
  const mc = document.getElementById('minimap'), mctx = mc.getContext('2d');
  mctx.clearRect(0, 0, 120, 90); mctx.fillStyle = 'rgba(0,0,0,0.6)'; mctx.fillRect(0, 0, 120, 90);
  const sx = 120 / MW, sy = 90 / MH;
  for (const p of S.serverPlayers) {
    mctx.fillStyle = p.id === S.myId ? '#ffdd44' : (p.alive ? '#ff88aa' : '#555');
    mctx.fillRect(p.x * sx - 1, p.y * sy - 1, 3, 3);
  }
  mctx.fillStyle = 'rgba(255,255,100,0.4)';
  for (const f of S.serverFoods) { mctx.fillRect(f.x * sx, f.y * sy, 1, 1); }
}
