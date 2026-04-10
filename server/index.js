const http = require('http');
const net = require('net');

const { PORT } = require('./config');
const { assertEnumIntegrity } = require('../shared/messages');
const { buildServerStatus } = require('./player');
const { sendTo } = require('./network');
const transport = require('./transport');
const dispatch = require('./dispatch');

// Fail loud on boot if the message enum has dupes/empties — cheap safety
// net against mis-edits that would silently ship a typoed message name.
assertEnumIntegrity();

// Rude FM stream proxy. The upstream is a SHOUTcast v1.x server that
// responds with "ICY 200 OK\r\n..." instead of a proper HTTP status line,
// which Caddy's strict Go HTTP transport rejects with a 502. We open a raw
// TCP socket, send a plain HTTP/1.0 request, rewrite the first line of the
// response to "HTTP/1.1 200 OK", and pipe the rest of the bytes (ICY
// headers + mp3 frames) to the client as a proper HTTP response.
const RUDE_HOST = '78.129.228.187', RUDE_PORT = 8042;
function proxyRudeFm(req, res) {
  const upstream = net.connect(RUDE_PORT, RUDE_HOST, () => {
    // SHOUTcast v1.x serves its HTML admin page to browser User-Agents and
    // only returns the audio stream when the UA is recognized as a media
    // player. WinampMPEG/5.0 is the canonical stream-client UA.
    upstream.write(
      'GET / HTTP/1.0\r\n' +
      'Host: ' + RUDE_HOST + ':' + RUDE_PORT + '\r\n' +
      'User-Agent: WinampMPEG/5.0\r\n' +
      'Icy-MetaData: 0\r\n\r\n'
    );
  });
  let headerBuf = Buffer.alloc(0);
  let headersSent = false;
  upstream.on('data', chunk => {
    if (headersSent) { res.write(chunk); return; }
    headerBuf = Buffer.concat([headerBuf, chunk]);
    const sep = headerBuf.indexOf('\r\n\r\n');
    if (sep === -1) return;
    const body = headerBuf.slice(sep + 4);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    if (body.length) res.write(body);
    headersSent = true;
  });
  upstream.on('end', () => { try { res.end(); } catch (e) {} });
  upstream.on('error', () => { try { res.destroy(); } catch (e) {} });
  req.on('close', () => { try { upstream.destroy(); } catch (e) {} });
}

const server = http.createServer((req, res) => {
  if (req.url === '/strawberrycow-radio/rudefm') {
    return proxyRudeFm(req, res);
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Strawberry Cow Battle Royale Server');
});

// Wire the transport callbacks to the shared dispatch module. Same code
// path for both WebSocket (default) and geckos.io (when GAME_TRANSPORT=geckos).
// Each peer gets a fresh player object stored on the transport ref.
const _playerByRef = new WeakMap();
transport.onConnect((ref) => {
  const player = dispatch.createPlayer(ref);
  _playerByRef.set(ref, player);
  sendTo(ref, buildServerStatus());
});
transport.onMessage((ref, msg) => {
  const player = _playerByRef.get(ref);
  if (!player) return;
  dispatch.dispatchMessage(player, msg);
});
transport.onDisconnect((ref) => {
  const player = _playerByRef.get(ref);
  if (!player) return;
  _playerByRef.delete(ref);
  dispatch.handleDisconnect(player);
});

// transport.init MUST run after http.createServer (above) but BEFORE
// server.listen (below). The geckos lib's `addServer(httpServer)` calls
// removeAllListeners('request') and re-installs its own request handler
// that delegates non-/.wrtc paths back to the original — if listen()
// fires first, the brief window between createServer and addServer can
// race the Rude FM proxy registration. Order matters.
transport.init(server);

server.listen(PORT, () => {
  console.log(`Strawberry Cow Battle Royale server on port ${PORT}`);
});
