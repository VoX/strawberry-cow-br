// geckos.io client transport. Conforms to the same interface as
// client/transports/ws.js so the rest of the client never sees the
// difference. Wire format mirrors the server: a single fixed event name
// (`msg`) carries the existing `{type, ...rest}` JSON payload as data.
// Reliable messages set `{reliable: true, interval: 150, runs: 10}` so
// the library re-sends until acknowledged; unreliable messages are
// single-shot UDP fire-and-forget.

import geckosClient from '@geckos.io/client';

const RELIABLE_OPTS = Object.freeze({ reliable: true, interval: 150, runs: 10 });
const MSG_EVENT = 'msg';
// How long to wait for the data channel to open before declaring the
// geckos transport unreachable. The auto-fallback in client/network.js
// (W.2) calls this value to know when to give up and retry on WS.
const CONNECT_TIMEOUT_MS = 5000;

let _channel = null;
let _onMessage = null;
let _onOpen = null;
let _onClose = null;
let _connectTimer = null;
let _closed = false;

function connect(opts) {
  _onMessage = opts && opts.onMessage;
  _onOpen = opts && opts.onOpen;
  _onClose = opts && opts.onClose;
  _closed = false;

  // Geckos signaling rides HTTP. Caddy reverse-proxies the
  // `/strawberrycow-fps-rtc/` path to the local geckos server's signaling
  // port. The library hits `<url>/.wrtc/v2/connections` for the handshake
  // and the data channel itself uses UDP directly to the box's public IP.
  _channel = geckosClient({
    url: location.protocol + '//' + location.host,
    // Default geckos signaling port is 9208 but we proxy through Caddy on
    // 443 by virtue of the URL routing — leave port unset so the library
    // uses the standard URL.
    port: null,
  });

  // Single notify-once guard. Each path that decides "this transport
  // failed" must (a) clear the connect timer, (b) set _closed = true,
  // (c) tear down the channel, (d) fire onClose. Centralized so the
  // timer / onConnect-error / onDisconnect paths can't double-fire.
  const fireClose = (reason) => {
    if (_closed) return;
    _closed = true;
    if (_connectTimer) { clearTimeout(_connectTimer); _connectTimer = null; }
    if (_channel) { try { _channel.close(); } catch (e) {} _channel = null; }
    if (reason) console.warn('[transport:geckos] ' + reason);
    if (_onClose) _onClose();
  };

  _connectTimer = setTimeout(
    () => fireClose('connect timeout after ' + CONNECT_TIMEOUT_MS + ' ms'),
    CONNECT_TIMEOUT_MS,
  );

  _channel.onConnect(err => {
    if (_connectTimer) { clearTimeout(_connectTimer); _connectTimer = null; }
    if (err) { fireClose('onConnect error: ' + (err && err.message)); return; }
    if (_onOpen) _onOpen();
  });

  _channel.on(MSG_EVENT, data => {
    if (!_onMessage) return;
    try { _onMessage(data); } catch (err) { /* never let a handler crash kill the transport */ }
  });

  _channel.onDisconnect(() => fireClose(null));
}

function sendReliable(msg) {
  if (!_channel) return;
  try { _channel.emit(MSG_EVENT, msg, RELIABLE_OPTS); } catch (e) { /* channel closed */ }
}
function sendUnreliable(msg) {
  if (!_channel) return;
  try { _channel.emit(MSG_EVENT, msg); } catch (e) { /* channel closed */ }
}

function close() {
  _closed = true;
  if (_connectTimer) { clearTimeout(_connectTimer); _connectTimer = null; }
  if (_channel) { try { _channel.close(); } catch (e) {} }
  _channel = null;
}

export default {
  connect,
  sendReliable,
  sendUnreliable,
  close,
};
