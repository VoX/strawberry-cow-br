import S from './state.js';
import { STATEFUL_INPUT_TYPES } from '../shared/constants.js';
import { wsTransport, geckosTransport, transportKind, userPickedTransport } from './transport.js';

// Messages whose `type` is in this set go through the transport's
// unreliable channel. On WebSocket that's identical to reliable; on
// geckos.io it's fire-and-forget UDP — the entire point of the migration.
// `move` is the only unreliable C2S type: 20 Hz WASD vector, the next
// message always supersedes the previous one, losing 1-2 is invisible.
const UNRELIABLE_TYPES = new Set(['move']);
const RECONNECT_DELAY_MS = 2000;

// Active transport — starts as the bundle-time pick from transport.js.
// May be reassigned by the W.2 fallback when geckos fails to handshake.
let _active = transportKind === 'geckos' ? geckosTransport : wsTransport;
let _activeKind = transportKind;
// Have we received any message from the server since this connect()? Gates
// the auto-fallback: an onClose BEFORE any message means the transport
// failed to establish; an onClose AFTER means a normal disconnect and
// we should run the standard reconnect-with-same-transport logic.
let _receivedSinceConnect = false;
// Reconnect timer handle — guarded so a stray double onClose can't queue
// two parallel reconnects (which would race two onOpen handlers).
let _reconnectTimer = null;

let msgHandler = null;
export function setMessageHandler(fn) { msgHandler = fn; }

function _showStatus(text, color) {
  const ss = document.getElementById('serverStatus');
  if (ss) { ss.textContent = text; ss.style.color = color; }
}

function _showDisconnectOverlay() {
  let dc = document.getElementById('disconnectMsg');
  if (!dc) {
    dc = document.createElement('div');
    dc.id = 'disconnectMsg';
    dc.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;background:rgba(0,0,0,0.8);padding:30px 50px;border-radius:12px;border:2px solid #ff4444;text-align:center;font-family:Segoe UI,sans-serif';
    dc.innerHTML = '<div style="color:#ff4444;font-size:24px;font-weight:bold;margin-bottom:8px">DISCONNECTED</div><div style="color:#aaa;font-size:14px">Reconnecting to meadow...</div>';
    document.body.appendChild(dc);
  }
  dc.style.display = 'block';
}

function _hideDisconnectOverlay() {
  const dc = document.getElementById('disconnectMsg');
  if (dc) dc.style.display = 'none';
}

function _scheduleReconnect() {
  if (_reconnectTimer) return;
  _reconnectTimer = setTimeout(() => { _reconnectTimer = null; connect(); }, RECONNECT_DELAY_MS);
}

export function connect() {
  if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
  _receivedSinceConnect = false;
  _active.connect({
    onOpen: () => {
      console.log('[transport] open via', _activeKind);
      _showStatus('\u2705 meadow online', '#88ff88');
      _hideDisconnectOverlay();
    },
    onMessage: (msg) => {
      _receivedSinceConnect = true;
      if (msgHandler) msgHandler(msg);
    },
    onClose: () => {
      // Auto-fallback: geckos opened a channel but never delivered a
      // single message → handshake failed (UDP blocked, ICE failure,
      // strict NAT). Switch to ws and retry transparently. Only fires
      // when the user didn't explicitly pick a transport.
      if (_activeKind === 'geckos' && !_receivedSinceConnect && !userPickedTransport) {
        console.warn('[transport] geckos failed to deliver any message — falling back to ws');
        _active = wsTransport;
        _activeKind = 'ws';
        _showStatus('\u26A0 falling back to ws', '#ffaa44');
        connect();
        return;
      }
      // Normal disconnect path — reconnect after a beat. In lobby state
      // we suppress the overlay since the initial connect is part of
      // normal flow.
      _showStatus('\u274C meadow offline', '#ff6666');
      if (S.state === 'join' || S.state === 'lobby') _hideDisconnectOverlay();
      else _showDisconnectOverlay();
      _scheduleReconnect();
    },
  });
}

// Force-close the currently-active transport. Used by the `kicked`
// message handler so the kick disconnects from whichever transport is
// actually carrying the session (which may be ws after a geckos
// fallback, not the initial-pick geckos).
export function closeActive() {
  try { _active.close(); } catch (e) {}
}

export function send(m) {
  if (!m) return;
  if (STATEFUL_INPUT_TYPES.has(m.type)) {
    m.seq = ++S.inputSeq;
  }
  if (UNRELIABLE_TYPES.has(m.type)) _active.sendUnreliable(m);
  else _active.sendReliable(m);
}
