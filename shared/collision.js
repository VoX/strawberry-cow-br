// Shared collision helpers — used by both the server simulation loop and
// the client-side prediction loop (CSP). Must stay byte-identical
// between sides or prediction will rubber band on every wall push-out.

const { PLAYER_WALL_INFLATE } = require('./constants');

// Push a player out of any overlapping wall AABB (inflated by the capsule
// radius). Callers pass an optional `zGate(player, wall)` callback — the
// server's gameTick uses it to skip walls the player has jumped OVER, so
// they skim the top instead of being slammed sideways. blastKnockback
// passes no zGate (knockback is unconditional).
//
// Mutates `p.x`/`p.y` in place. No return value.
function pushOutOfWalls(p, walls, zGate) {
  for (const w of walls) {
    const left = w.x - PLAYER_WALL_INFLATE, right = w.x + w.w + PLAYER_WALL_INFLATE;
    const top = w.y - PLAYER_WALL_INFLATE, bot = w.y + w.h + PLAYER_WALL_INFLATE;
    if (p.x > left && p.x < right && p.y > top && p.y < bot) {
      if (zGate && !zGate(p, w)) continue;
      const escL = p.x - left, escR = right - p.x;
      const escT = p.y - top, escB = bot - p.y;
      const minEsc = Math.min(escL, escR, escT, escB);
      if (minEsc === escL) p.x = left;
      else if (minEsc === escR) p.x = right;
      else if (minEsc === escT) p.y = top;
      else p.y = bot;
    }
  }
}

module.exports = { pushOutOfWalls };
