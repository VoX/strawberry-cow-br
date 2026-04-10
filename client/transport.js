// Client transport facade. Game code imports from client/network.js
// (which routes per-message reliability) and never touches a raw
// WebSocket or ServerChannel.
//
// Selection precedence (later wins):
//   1. bundle-time default: geckos (W.2 cutover — UDP path is the
//      default).
//   2. URL param: ?transport=ws or ?transport=geckos.
//   3. runtime fallback in client/network.js — if a geckos disconnect
//      (real onClose, ICE failure, or the 5 s connect-timeout) fires
//      before any message has been received, network.js transparently
//      switches to wsTransport and retries.
//
// Interface (every impl conforms):
//   connect(opts)                 open a connection; opts carries an
//                                 onOpen / onMessage / onClose callback trio
//   sendReliable(msg)             per-client reliable send
//   sendUnreliable(msg)           per-client best-effort (drop on loss)
//   close()                       tear down

import wsTransport from './transports/ws.js';
import geckosTransport from './transports/geckos.js';

const _params = new URLSearchParams(location.search);
const _override = _params.get('transport');
export const transportKind = _override === 'ws' ? 'ws' : 'geckos';
// True iff the user explicitly set ?transport=… — gates the auto-
// fallback in client/network.js so a deliberate pick is never overridden.
export const userPickedTransport = _params.has('transport');
console.log('[transport] initial pick:', transportKind);

export { wsTransport, geckosTransport };
