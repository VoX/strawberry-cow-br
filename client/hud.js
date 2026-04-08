import { MW, MH } from './config.js';
import S from './state.js';

export function updateHud(me, time, dt) {
  // FPS counter
  S.fpsFrames++;
  const fpsNow = performance.now();
  if (fpsNow - S.fpsLast >= 1000) { S.fpsDisplay = S.fpsFrames; S.fpsFrames = 0; S.fpsLast = fpsNow; }
  document.getElementById('fpsCounter').textContent = S.fpsDisplay + 'fps | ' + Math.round(S.pingVal) + 'ms';

  if (!me) return;
  const hPct = Math.max(0, me.hunger / 100);
  document.getElementById('hungerFill').style.width = (hPct * 100) + '%';
  document.getElementById('hungerFill').style.background = hPct > 0.5 ? '#44ff44' : hPct > 0.25 ? '#ffaa00' : '#ff4444';
  document.getElementById('hungerTxt').textContent = 'HUNGER ' + Math.ceil(me.hunger) + '%';
  const wep = me.weapon || 'normal';
  const wepNames = { shotgun: 'Benelli', burst: 'LR-300', bolty: 'L96', cowtank: 'LAW', normal: 'Spit' };
  document.getElementById('weapon').textContent = (wepNames[wep] || wep) + (me.weaponLevel > 0 ? ' Lv' + (me.weaponLevel + 1) : '');
  const armorVal = me.armor || 0;
  document.getElementById('armorBar').style.display = armorVal > 0 ? 'block' : 'none';
  document.getElementById('armorFill').style.width = Math.min(100, armorVal) + '%';
  document.getElementById('armorTxt').textContent = 'ARMOR ' + Math.ceil(armorVal);
  const xpPct = me.xpToNext > 0 ? Math.max(0, Math.min(100, (me.xp || 0) / (me.xpToNext || 50) * 100)) : 0;
  document.getElementById('xpFill').style.width = xpPct + '%';
  document.getElementById('xpTxt').textContent = 'LV' + (me.level || 0) + ' ' + Math.floor(me.xp || 0) + '/' + (me.xpToNext || 50) + ' XP';
  document.getElementById('lowHealthOverlay').style.display = me.hunger < 30 ? 'block' : 'none';
  document.getElementById('lowHealthOverlay').style.opacity = me.hunger < 30 ? Math.min(1, (30 - me.hunger) / 30 * (0.5 + Math.sin(time * 4) * 0.2)) : '0';

  document.getElementById('score').textContent = (me && me.alive ? 'Score: ' + (me.score || 0) + ' | Kills: ' + (me.kills || 0) + ' | Lv' + (me.level || 0) : 'Waiting for next round...');
  document.getElementById('spectateMsg').style.display = (me && me.alive) ? 'none' : 'block';
  document.getElementById('playerCount').textContent = '\u{1F404} ' + S.serverPlayers.filter(p => p.alive).length + '/' + S.serverPlayers.length;

  // Killfeed
  S.killfeed.forEach(k => k.t -= dt); S.killfeed = S.killfeed.filter(k => k.t > 0);
  document.getElementById('killfeed').innerHTML = S.killfeed.map(k => '<div style="margin-bottom:3px;opacity:' + Math.min(1, k.t) + '">' + k.txt + '</div>').join('');

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
