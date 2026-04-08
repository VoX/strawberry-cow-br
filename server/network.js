const state = require('./state');

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const [, p] of state.players) {
    if (p.ws && p.ws.readyState === 1) p.ws.send(msg);
  }
}

function sendTo(ws, data) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(data));
}

module.exports = { broadcast, sendTo };
