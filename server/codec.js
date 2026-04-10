// Server-side message codec — encodes outgoing messages as MessagePack
// binary and decodes incoming messages from either JSON text or MessagePack.
const { encode, decode } = require('@msgpack/msgpack');

function encodeMsg(obj) {
  return encode(obj); // ws accepts Uint8Array directly, no Buffer copy needed
}

function decodeMsg(data) {
  if (typeof data === 'string') return JSON.parse(data);
  // Binary — msgpack or ArrayBuffer
  if (data instanceof ArrayBuffer) return decode(new Uint8Array(data));
  if (Buffer.isBuffer(data)) return decode(data);
  if (data instanceof Uint8Array) return decode(data);
  return JSON.parse(String(data));
}

module.exports = { encodeMsg, decodeMsg };
