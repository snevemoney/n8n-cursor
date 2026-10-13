import { afterEach, describe, expect, it } from 'vitest';
import { isApiKeyAuthConfigured, verifyAPIKey } from '@/lib/api-auth';
import { isPrivilegedApiPath } from '@/lib/security/privileged-paths';
import { timingSafeEqualString } from '@/lib/security/timing-safe';
import { MissingEnvError, requireEnv } from '@/lib/env';
import { parsePagination, paginate } from '@/lib/api-pagination';
import { signToken, verifyToken } from '@/lib/security/jwt';

function requestWith(headers: Record<string, string>) {
  const headerBag = new Headers(headers);
  return {
    headers: headerBag,
    cookies: { get: () => undefined },
    nextUrl: { searchParams: new URLSearchParams() },
  } as Parameters<typeof verifyAPIKey>[0];
}

const saved = {
  SCORPION_API_KEY: process.env.SCORPION_API_KEY,
  N8N_SCORPION_API_KEY: process.env.N8N_SCORPION_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
};

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  delete process.env.HARDENING_TEST_MISSING;
  delete process.env.HARDENING_TEST_PRESENT;
});

describe('requireEnv fail-closed', () => {
  it('throws when the variable is missing', () => {
    delete process.env.HARDENING_TEST_MISSING;
    expect(() => requireEnv('HARDENING_TEST_MISSING')).toThrow(MissingEnvError);
  });

  it('returns a trimmed value when set', () => {
    process.env.HARDENING_TEST_PRESENT = '  abc  ';
    expect(requireEnv('HARDENING_TEST_PRESENT')).toBe('abc');
  });
});

describe('verifyAPIKey fail-closed', () => {
  it('rejects when no API key is configured', async () => {
    delete process.env.SCORPION_API_KEY;
    delete process.env.N8N_SCORPION_API_KEY;
    expect(isApiKeyAuthConfigured()).toBe(false);
    const result = await verifyAPIKey(
      requestWith({ authorization: 'Bearer anything' })
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('not_configured');
  });

  it('rejects a missing credential when configured', async () => {
    process.env.SCORPION_API_KEY = 'configured-key-value-16';
    const result = await verifyAPIKey(requestWith({}));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('missing');
  });

  it('rejects an invalid key', async () => {
    process.env.SCORPION_API_KEY = 'configured-key-value-16';
    const result = await verifyAPIKey(requestWith({ 'x-api-key': 'nope' }));
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid');
  });

  it('accepts a matching x-api-key', async () => {
    process.env.SCORPION_API_KEY = 'configured-key-value-16';
    const result = await verifyAPIKey(
      requestWith({ 'x-api-key': 'configured-key-value-16' })
    );
    expect(result.valid).toBe(true);
  });
});

describe('JWT fail-closed', () => {
  it('refuses to sign without JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    expect(() => signToken({ userId: 'op' })).toThrow(MissingEnvError);
  });

  it('signs and verifies when JWT_SECRET is set', () => {
    process.env.JWT_SECRET = 'test-jwt-secret-16ch';
    const token = signToken({ userId: 'op', role: 'operator' });
    const payload = verifyToken(token);
    expect(payload.userId).toBe('op');
    expect(payload.role).toBe('operator');
  });
});

describe('privileged paths', () => {
  it('locks dump and mutate routes', () => {
    expect(isPrivilegedApiPath('/api/test-env', 'GET')).toBe(true);
    expect(isPrivilegedApiPath('/api/migrate', 'POST')).toBe(true);
    expect(isPrivilegedApiPath('/api/settings', 'GET')).toBe(true);
    expect(isPrivilegedApiPath('/api/agents/abc/run', 'POST')).toBe(true);
    expect(isPrivilegedApiPath('/api/agents', 'POST')).toBe(true);
    expect(isPrivilegedApiPath('/api/edge/nodes', 'GET')).toBe(true);
  });

  it('leaves health and agent list GET open', () => {
    expect(isPrivilegedApiPath('/api/health', 'GET')).toBe(false);
    expect(isPrivilegedApiPath('/api/agents', 'GET')).toBe(false);
    expect(isPrivilegedApiPath('/api/security/auth/login', 'POST')).toBe(false);
  });
});

describe('timingSafeEqualString', () => {
  it('matches equal strings', () => {
    expect(timingSafeEqualString('abc', 'abc')).toBe(true);
  });

  it('rejects different strings', () => {
    expect(timingSafeEqualString('abc', 'abd')).toBe(false);
    expect(timingSafeEqualString('abc', 'ab')).toBe(false);
  });
});

describe('parsePagination', () => {
  it('defaults to 50 / 0 and clamps', () => {
    expect(parsePagination(new URLSearchParams())).toEqual({ limit: 50, offset: 0 });
    expect(parsePagination(new URLSearchParams('limit=9999&offset=-4'))).toEqual({
      limit: 200,
      offset: 0,
    });
    expect(paginate(['a', 'b', 'c', 'd'], { limit: 2, offset: 1 })).toEqual(['b', 'c']);
  });
});
