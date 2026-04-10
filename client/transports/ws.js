// WebSocket client transport. Wraps the browser `WebSocket` object
// behind the common transport interface defined in client/transport.js.
// Lifted from client/network.js during W.0 of the WebRTC migration so a
// geckos.io sibling can slot in without touching the game code.
//
// Reliability semantics on TCP/WS: both sendReliable and sendUnreliable
// call the same ws.send. Unreliable is advisory — the geckos.io sibling
// honors it as fire-and-forget UDP.

let _ws = null;
let _onMessage = null;
let _onOpen = null;
let _onClose = null;

function connect(opts) {
  _onMessage = opts && opts.onMessage;
  _onOpen = opts && opts.onOpen;
  _onClose = opts && opts.onClose;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  _ws = new WebSocket(proto + '://' + location.host + '/strawberrycow-fps-ws/');
  _ws.onopen = () => { if (_onOpen) _onOpen(); };
  _ws.onmessage = e => {
    if (!_onMessage) return;
    try { _onMessage(JSON.parse(e.data)); } catch (err) { /* drop garbage */ }
  };
  _ws.onclose = () => { if (_onClose) _onClose(); };
  _ws.onerror = () => { /* surfaced via onclose */ };
}

function sendReliable(msg) {
  if (!_ws || _ws.readyState !== 1) return;
  _ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
}

// Over TCP there's no true unreliable channel — same wire path, different
// semantic intent. The geckos sibling will diverge here.
function sendUnreliable(msg) { sendReliable(msg); }

function close() {
  if (_ws) { try { _ws.close(); } catch (e) {} }
  _ws = null;
}

export default {
  connect,
  sendReliable,
  sendUnreliable,
  close,
};
