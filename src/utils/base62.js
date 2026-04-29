const BASE62_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const BASE = BigInt(62);

function encode(numberInput) {
  let num = BigInt(numberInput);

  if (num === 0n) {
    return BASE62_CHARS[0];
  }

  let shortCode = "";
  while (num > 0n) {
    const remainder = Number(num % BASE);
    shortCode = BASE62_CHARS[remainder] + shortCode;
    num /= BASE;
  }

  return shortCode;
}

function encodeObjectId(objectId) {
  const hexValue = objectId.toString();
  const numericValue = BigInt(`0x${hexValue}`);
  return encode(numericValue);
}

module.exports = {
  encode,
  encodeObjectId,
};
