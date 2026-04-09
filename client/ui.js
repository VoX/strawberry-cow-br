import S from './state.js';
import { PERKS } from './config.js';
import { send } from './network.js';
import { startMenuMusic, stopMenuMusic } from './audio.js';

// Load saved name + volume
try { const sn = localStorage.getItem('cowName3d'); if (sn) document.getElementById('nameIn').value = sn; } catch (e) {}
try { const sv = localStorage.getItem('cowVol3d'); if (sv) { document.getElementById('volSlider').value = sv; document.getElementById('volLbl').textContent = sv + '%'; } } catch (e) {}
S.masterVol = parseFloat(document.getElementById('volSlider').value) / 100;

try { const sm = localStorage.getItem('cowMusic3d'); if (sm) { S.musicStyle = sm; document.getElementById('musicSelect').value = sm; } } catch(e) {}
document.getElementById('musicSelect').addEventListener('change', e => {
  S.musicStyle = e.target.value;
  try { localStorage.setItem('cowMusic3d', e.target.value); } catch(ex) {}
  // If we're in the lobby, swap the menu music immediately
  if (S.state !== 'playing') { stopMenuMusic(); startMenuMusic(); }
});

document.getElementById('botsCheck').addEventListener('change', e => { send({ type: 'toggleBots' }); });
document.getElementById('botsFreeWillCheck').addEventListener('change', e => { send({ type: 'toggleBotsFreeWill' }); });
document.getElementById('volSlider').addEventListener('input', e => {
  S.masterVol = e.target.value / 100; document.getElementById('volLbl').textContent = e.target.value + '%';
  try { localStorage.setItem('cowVol3d', e.target.value); } catch (ex) {}
});
const COW_NAMES = ['MooCow','BurgerBoy','SteakMate','DairyQueen','CowPoke','BeefCake','MilkMan','Cheddar','UdderChaos','MooLander','CowntDracula','SirLoin','AngusYoung','T-Bone','Bovinity','Cowculator','MooDonna','Heifernator','PrimeMooVer','Bullseye','CreamPuff','Grazey','Moosician','Barnaby','Wagyu','Bessie'];
let _nameIdx = Math.floor(Math.random() * COW_NAMES.length);

// Set a random default name if no saved name
try { const sn = localStorage.getItem('cowName3d'); if (!sn) document.getElementById('nameIn').value = COW_NAMES[_nameIdx]; } catch(e) {}

const randomBtn = document.getElementById('randomNameBtn');
if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    _nameIdx = (_nameIdx + 1) % COW_NAMES.length;
    document.getElementById('nameIn').value = COW_NAMES[_nameIdx];
  });
}

document.getElementById('joinBtn').addEventListener('click', () => {
  const n = document.getElementById('nameIn').value.trim() || COW_NAMES[Math.floor(Math.random() * COW_NAMES.length)];
  document.getElementById('nameIn').value = n;
  try { localStorage.setItem('cowName3d', n); } catch (e) {}
  send({ type: 'join', name: n });
});
document.getElementById('nameIn').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('joinBtn').click(); });

export function showPerkMenu() {
  S.perkMenuOpen = true;
  const me = S.serverPlayers ? S.serverPlayers.find(p => p.id === S.myId) : null;
  const choices = []; const pool = [...PERKS].filter(p => {
    if (p.id === 'cowstrike' && Math.random() >= 0.15) return false;
    if (p.id === 'extmag' && me && me.extMagMult > 1) return false;
    if (p.id === 'tacticow' && me && me.recoilMult < 1) return false;
    return true;
  });
  for (let i = 0; i < 3 && pool.length; i++) { const idx = Math.floor(Math.random() * pool.length); choices.push(pool.splice(idx, 1)[0]); }
  const el = document.getElementById('perkMenu');
  el.innerHTML = '<div style="color:#ffee55;font-size:13px;font-weight:bold;margin-right:8px;align-self:center">LEVEL UP!</div>' + choices.map((p, i) => '<div class="perkCard" data-perk="' + p.id + '"><div style="color:#888;font-size:11px">[' + (i + 1) + ']</div><div style="color:#ff88aa;font-size:15px;font-weight:bold;margin:3px 0">' + p.name + '</div><div style="color:#aaa;font-size:11px">' + p.desc + '</div></div>').join('');
  el.style.display = 'flex';
  el.querySelectorAll('.perkCard').forEach(card => {
    card.addEventListener('click', () => { window.pickPerk(card.dataset.perk); });
  });
  window._perkChoices = choices;
}

window.pickPerk = function (id) {
  send({ type: 'perk', id });
  S.pendingLevelUps--; S.perkMenuOpen = false;
  document.getElementById('perkMenu').style.display = 'none';
  if (S.pendingLevelUps > 0) setTimeout(showPerkMenu, 300);
};
