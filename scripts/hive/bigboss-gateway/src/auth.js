import { createHmac, timingSafeEqual } from 'node:crypto';

export function readGatewaySecret(env = process.env) {
  return String(env.BIGBOSS_GATEWAY_SECRET || '').trim();
}

export function hmacHex(secret, rawBody) {
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody ?? '', 'utf8');
  return createHmac('sha256', secret).update(body).digest('hex');
}

function normalizeSignature(value) {
  const s = String(value || '').trim();
  if (s.toLowerCase().startsWith('sha256=')) return s.slice(7).trim();
  return s;
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

/**
 * Fail-closed auth.
 * - Secret unset → reject
 * - Accept HMAC-SHA256 hex of raw body in x-voice-signature
 * - Accept Authorization: Bearer <same secret>
 */
export function authorize({ secret, rawBody, headers }) {
  if (!secret) {
    return { ok: false, status: 401, reason: 'secret_unset' };
  }

  const headerBag = lowerHeaders(headers);
  const sig = normalizeSignature(headerBag['x-voice-signature']);
  if (sig) {
    const expected = hmacHex(secret, rawBody);
    if (safeEqualString(sig.toLowerCase(), expected.toLowerCase())) {
      return { ok: true, via: 'hmac' };
    }
  }

  const auth = headerBag.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  const bearerValue = match ? match[1].trim() : auth.trim();
  if (bearerValue && safeEqualString(bearerValue, secret)) {
    return { ok: true, via: 'bearer' };
  }

  return { ok: false, status: 401, reason: sig ? 'bad_signature' : 'missing_auth' };
}

function lowerHeaders(headers = {}) {
  const out = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue;
    out[String(key).toLowerCase()] = Array.isArray(value) ? value.join(',') : String(value);
  }
  return out;
}
