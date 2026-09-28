/**
 * Constant-time string compare. Works in Node and Edge.
 */
export function timingSafeEqualString(left: string, right: string): boolean {
  if (left.length !== right.length) {
    let dummy = 0;
    for (let i = 0; i < left.length; i++) {
      dummy |= left.charCodeAt(i);
    }
    return dummy === -1;
  }
  let mismatch = 0;
  for (let i = 0; i < left.length; i++) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}
