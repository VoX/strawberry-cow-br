import S from './state.js';
import { STATEFUL_INPUT_TYPES } from '../shared/constants.js';

let msgHandler = null;
export function setMessageHandler(fn) { msgHandler = fn; }

export function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  S.ws = new WebSocket(proto + '://' + location.host + '/strawberrycow-fps-ws/');
  S.ws.onopen = () => {
    console.log('connected');
    const ss = document.getElementById('serverStatus'); if (ss) { ss.textContent = '\u2705 meadow online'; ss.style.color = '#88ff88'; }
    const dc = document.getElementById('disconnectMsg'); if (dc) dc.style.display = 'none';
  };
  S.ws.onmessage = e => { if (msgHandler) msgHandler(JSON.parse(e.data)); };
  S.ws.onclose = () => {
    const ss = document.getElementById('serverStatus'); if (ss) { ss.textContent = '\u274C meadow offline'; ss.style.color = '#ff6666'; }
    let dc = document.getElementById('disconnectMsg');
    if (S.state === 'join' || S.state === 'lobby') { if (dc) dc.style.display = 'none'; setTimeout(connect, 2000); return; }
    if (!dc) {
      dc = document.createElement('div'); dc.id = 'disconnectMsg';
      dc.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;background:rgba(0,0,0,0.8);padding:30px 50px;border-radius:12px;border:2px solid #ff4444;text-align:center;font-family:Segoe UI,sans-serif';
      dc.innerHTML = '<div style="color:#ff4444;font-size:24px;font-weight:bold;margin-bottom:8px">DISCONNECTED</div><div style="color:#aaa;font-size:14px">Reconnecting to meadow...</div>';
      document.body.appendChild(dc);
    }
    dc.style.display = 'block';
    setTimeout(connect, 2000);
  };
  S.ws.onerror = () => { const ss = document.getElementById('serverStatus'); if (ss) { ss.textContent = '\u274C meadow offline'; ss.style.color = '#ff6666'; } };
}

export function send(m) {
  if (!S.ws || S.ws.readyState !== 1) return;
  if (m && STATEFUL_INPUT_TYPES.has(m.type)) {
    m.seq = ++S.inputSeq;
  }
  S.ws.send(JSON.stringify(m));
}
