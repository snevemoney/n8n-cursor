// Utility functions to encode a URL as an LNURL string using bech32
// Implements minimal bech32 encoding per BIP-173
// The code is kept small to avoid adding new dependencies

export function encodeLnurl(url: string): string {
  const words = convertBits(new TextEncoder().encode(url), 8, 5, true);
  const checksum = createChecksum('lnurl', words);
  const combined = words.concat(checksum);
  const charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  let result = 'lnurl1';
  for (const c of combined) {
    result += charset[c];
  }
  return result;
}

function createChecksum(hrp: string, words: number[]): number[] {
  const values = hrpExpand(hrp).concat(words).concat([0, 0, 0, 0, 0, 0]);
  const mod = polymod(values) ^ 1;
  const ret = [] as number[];
  for (let p = 0; p < 6; p++) {
    ret.push((mod >> (5 * (5 - p))) & 31);
  }
  return ret;
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) >> 5);
  }
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) & 31);
  }
  return ret;
}

function polymod(values: number[]): number {
  const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const value of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) {
        chk ^= GENERATORS[i];
      }
    }
  }
  return chk;
}

function convertBits(data: Uint8Array, from: number, to: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << to) - 1;
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    if (value < 0 || value >> from !== 0) {
      return [];
    }
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      ret.push((acc << (to - bits)) & maxv);
    }
  } else if (bits >= from || ((acc << (to - bits)) & maxv)) {
    return [];
  }
  return ret;
}
