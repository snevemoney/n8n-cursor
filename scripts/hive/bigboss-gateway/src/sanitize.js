const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9_]{20,}/g,
  /gho_[A-Za-z0-9_]{20,}/g,
  /ghu_[A-Za-z0-9_]{20,}/g,
  /ghs_[A-Za-z0-9_]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /xai-[A-Za-z0-9_-]{20,}/g,
  /Bearer\s+[A-Za-z0-9._\-+=\/]{16,}/gi,
  /BIGBOSS_GATEWAY_SECRET\s*[=:]\s*\S+/gi,
  /GITHUB_TOKEN\s*[=:]\s*\S+/gi,
];

function redactString(text) {
  let out = String(text);
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    out = out.replace(pattern, '[redacted]');
  }
  return out;
}

export function redactSecrets(value) {
  if (value == null) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));
  if (typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = redactSecrets(item);
    }
    return out;
  }
  return value;
}

export function containsSecrets(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (!text) return false;
  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) return true;
  }
  return false;
}

export function assertNoSecrets(value, extraForbidden = []) {
  const redacted = redactSecrets(value);
  const text = JSON.stringify(redacted);
  for (const needle of extraForbidden) {
    if (needle && text.includes(needle)) {
      throw new Error('response leaked a forbidden token');
    }
  }
  if (containsSecrets(redacted)) {
    throw new Error('response still contains a secret-shaped string');
  }
  return redacted;
}
