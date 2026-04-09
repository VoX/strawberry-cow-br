// Mulberry32 — tiny, fast, deterministic PRNG. Produces the same sequence
// across Node.js versions and is cheap to reset between test cases.
// Reference: https://stackoverflow.com/a/47593316
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let _origRandom = null;

// Replace Math.random globally with a seeded PRNG. Must be paired with restoreRandom().
function patchRandom(seed) {
  if (_origRandom) throw new Error('patchRandom: already patched');
  _origRandom = Math.random;
  const rng = mulberry32(seed);
  Math.random = rng;
}

function restoreRandom() {
  if (!_origRandom) return;
  Math.random = _origRandom;
  _origRandom = null;
}

module.exports = { mulberry32, patchRandom, restoreRandom };
