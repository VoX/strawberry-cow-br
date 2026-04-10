import S from './state.js';
import { PERKS } from './config.js';
import { send } from './network.js';
import { startMenuMusic, stopMenuMusic, customMusicAvailable } from './audio.js';
import { setNightMode } from './renderer.js';
import { toggleFullscreen } from './input.js';

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

// Load saved name + volume
try { const sn = localStorage.getItem('cowName3d'); if (sn) document.getElementById('nameIn').value = sn; } catch (e) {}
try { const sv = localStorage.getItem('cowVol3d'); if (sv) { document.getElementById('volSlider').value = sv; document.getElementById('volLbl').textContent = sv + '%'; } } catch (e) {}
S.masterVol = parseFloat(document.getElementById('volSlider').value) / 100;
try { const smv = localStorage.getItem('cowMusicVol3d'); if (smv) { document.getElementById('musicVolSlider').value = smv; document.getElementById('musicVolLbl').textContent = smv + '%'; } } catch (e) {}
S.musicVol = parseFloat(document.getElementById('musicVolSlider').value) / 100;

try { const sm = localStorage.getItem('cowMusic3d'); if (sm) { S.musicStyle = sm; document.getElementById('musicSelect').value = sm; } } catch(e) {}
// Custom music pack files are gitignored — check they exist on this deploy
// and hide the dropdown option if they don't, so players can't pick a dead
// style. If the stored preference was custom on a deploy without the files,
// fall back to classic to avoid silent music.
customMusicAvailable().then(ok => {
  if (ok) return;
  const opt = document.querySelector('#musicSelect option[value="custom"]');
  if (opt) opt.remove();
  if (S.musicStyle === 'custom') {
    S.musicStyle = 'classic';
    document.getElementById('musicSelect').value = 'classic';
    try { localStorage.setItem('cowMusic3d', 'classic'); } catch (ex) {}
  }
});
document.getElementById('musicSelect').addEventListener('change', e => {
  S.musicStyle = e.target.value;
  try { localStorage.setItem('cowMusic3d', e.target.value); } catch(ex) {}
  // If we're in the lobby, swap the menu music immediately
  if (S.state !== 'playing') { stopMenuMusic(); startMenuMusic(); }
});

// Night mode — host-only control, server-synced to all players.
// Null-safe: if the HTML somehow ships without #nightCheck, skip wiring instead
// of crashing module init (which would stop the whole bundle from loading).
const _nightCheckEl = document.getElementById('nightCheck');
if (_nightCheckEl) _nightCheckEl.addEventListener('change', e => {
  if (S.hostId && S.myId === S.hostId) {
    send({ type: 'toggleNight' });
  } else {
    // Revert UI state for non-hosts — reflect the authoritative server value
    e.target.checked = !e.target.checked;
  }
});

document.getElementById('botsCheck').addEventListener('change', e => {
  if (S.hostId && S.myId === S.hostId) send({ type: 'toggleBots' });
  else e.target.checked = !e.target.checked;
});
document.getElementById('botsFreeWillCheck').addEventListener('change', e => {
  if (S.hostId && S.myId === S.hostId) send({ type: 'toggleBotsFreeWill' });
  else e.target.checked = !e.target.checked;
});
document.getElementById('volSlider').addEventListener('input', e => {
  S.masterVol = e.target.value / 100; document.getElementById('volLbl').textContent = e.target.value + '%';
  try { localStorage.setItem('cowVol3d', e.target.value); } catch (ex) {}
});
document.getElementById('musicVolSlider').addEventListener('input', e => {
  S.musicVol = e.target.value / 100; document.getElementById('musicVolLbl').textContent = e.target.value + '%';
  try { localStorage.setItem('cowMusicVol3d', e.target.value); } catch (ex) {}
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
    // Push to server if already in the lobby — otherwise it just updates the
    // pre-join input and the name rides along on the 'join' message.
    commitLobbyName();
  });
}

document.getElementById('joinBtn').addEventListener('click', () => {
  // Single button: pre-join → sends `join`, then transitions to a `ready`
  // toggle once the lobby snapshot arrives. Stays at the same screen
  // position the whole time so the player can click twice without moving
  // the mouse. The lobby handler in message-handlers.js owns the
  // text/color updates after join.
  if (!S.myId) {
    const n = document.getElementById('nameIn').value.trim() || COW_NAMES[Math.floor(Math.random() * COW_NAMES.length)];
    document.getElementById('nameIn').value = n;
    try { localStorage.setItem('cowName3d', n); } catch (e) {}
    send({ type: 'join', name: n });
    return;
  }
  // Already joined — toggle ready state. The server echoes the new
  // ready value via the next lobby broadcast which updates the button
  // text/color.
  send({ type: 'ready' });
});
// Debug scene button — joins with debug mode (no bots, infinite milk)
const debugBtn = document.getElementById('debugBtn');
if (debugBtn) debugBtn.addEventListener('click', () => {
  if (S.myId) return;
  const n = document.getElementById('nameIn').value.trim() || COW_NAMES[Math.floor(Math.random() * COW_NAMES.length)];
  document.getElementById('nameIn').value = n;
  try { localStorage.setItem('cowName3d', n); } catch (e) {}
  send({ type: 'debugJoin', name: n });
});

// In-lobby name updates — blur or enter commits the new name
function commitLobbyName() {
  if (!S.myId || S.state !== 'lobby') return;
  const n = document.getElementById('nameIn').value.trim();
  if (!n) return;
  try { localStorage.setItem('cowName3d', n); } catch (e) {}
  send({ type: 'setName', name: n });
}
document.getElementById('nameIn').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!S.myId) document.getElementById('joinBtn').click();
    else { commitLobbyName(); e.target.blur(); }
  }
});
document.getElementById('nameIn').addEventListener('blur', commitLobbyName);

export function showPerkMenu() {
  S.perkMenuOpen = true;
  const me = S.me;
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
