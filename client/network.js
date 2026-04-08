import S from './state.js';

let msgHandler = null;
export function setMessageHandler(fn) { msgHandler = fn; }

export function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  S.ws = new WebSocket(proto + '://' + location.host + '/strawberrycow-fps-ws/');
  S.ws.onopen = () => { console.log('connected'); const ss = document.getElementById('serverStatus'); if (ss) { ss.textContent = '\u2705 server online'; ss.style.color = '#88ff88'; } };
  S.ws.onmessage = e => { if (msgHandler) msgHandler(JSON.parse(e.data)); };
  S.ws.onclose = () => { const ss = document.getElementById('serverStatus'); if (ss) { ss.textContent = '\u274C server offline'; ss.style.color = '#ff6666'; } setTimeout(connect, 2000); };
  S.ws.onerror = () => { const ss = document.getElementById('serverStatus'); if (ss) { ss.textContent = '\u274C server offline'; ss.style.color = '#ff6666'; } };
}

export function send(m) { if (S.ws && S.ws.readyState === 1) S.ws.send(JSON.stringify(m)); }
