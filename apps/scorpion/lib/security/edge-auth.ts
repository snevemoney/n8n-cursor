/**
 * Edge-safe privileged-route auth (no jsonwebtoken).
 * Used by Next.js middleware only.
 */

import { timingSafeEqualString } from './timing-safe';

function b64urlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifyHs256Jwt(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  const [header, payload, signature] = parts;
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlToBytes(signature),
      new TextEncoder().encode(`${header}.${payload}`)
    );
    if (!valid) {
      return false;
    }
    const claims = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload))) as { exp?: number };
    if (typeof claims.exp === 'number' && claims.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractEdgeCredential(headers: Headers, cookieHeader: string | null): {
  bearer: string | null;
  apiKey: string | null;
  cookieToken: string | null;
} {
  const authHeader = headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const apiKey = headers.get('x-api-key');
  let cookieToken: string | null = null;
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === 'scorpion_token' || name === 'token') {
        cookieToken = rest.join('=');
        break;
      }
    }
  }
  return { bearer, apiKey, cookieToken };
}

export function apiKeyMatches(provided: string, configured: string[]): boolean {
  return configured.some((candidate) => timingSafeEqualString(provided, candidate));
}
