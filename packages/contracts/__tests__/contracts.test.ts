import {
  createErrorResponse,
  createExpressErrorResponse,
  errorCatalog,
  getErrorCategory,
  getHttpStatus,
  isRetryable,
  isValidErrorCode,
  validateErrorCode,
} from '../src/errors';
import { FlagLoader, validateFlagSchema } from '../src/flags';
import {
  API_ENDPOINTS,
  API_VERSION,
  HTTP_STATUS,
  isErrorResponse,
  isSuccessResponse,
  validatePagination,
  validatePayment,
  validateUser,
} from '../src/openapi';
import {
  createMetricAttributes,
  createResourceAttributes,
  createSpanAttributes,
  defaultTelemetryConfig,
} from '../src/telemetry';
import {
  formatValidationErrors,
  isValidSchema,
  mergeSchemas,
  validateRequest,
  validators,
} from '../src/validators';

const FLAG_ENV_KEYS = [
  'NEXT_PUBLIC_FF_NEW_DASHBOARD',
  'FF_BITCOIN_LIGHTNING_INTEGRATION',
  'FF_LNbits_WEBHOOK_VALIDATION',
  'FF_AGENT_AUTO_SCALING',
  'FF_MAX_CONCURRENT_AGENTS',
  'FF_AGENT_TIMEOUT_MS',
  'FF_ENABLE_METRICS_COLLECTION',
  'FF_METRICS_RETENTION_DAYS',
  'FF_ENABLE_DEBUG_LOGGING',
  'FF_LOG_LEVEL',
  'FF_ENABLE_RATE_LIMITING',
  'FF_RATE_LIMIT_REQUESTS_PER_MINUTE',
  'FF_ENABLE_CORS',
  'FF_CORS_ORIGINS',
  'FF_ENABLE_WEBHOOK_RETRY',
  'FF_WEBHOOK_MAX_RETRIES',
  'FF_WEBHOOK_RETRY_DELAY_MS',
  'FF_ENABLE_DATABASE_POOLING',
  'FF_DATABASE_POOL_SIZE',
  'FF_ENABLE_REDIS_CACHING',
  'FF_REDIS_CACHE_TTL_SECONDS',
  'FF_ENABLE_SECURITY_HEADERS',
  'FF_ENABLE_CSRF_PROTECTION',
  'FF_ENABLE_SQL_INJECTION_PROTECTION',
  'FF_ENABLE_XSS_PROTECTION',
  'FF_ENABLE_CONTENT_SECURITY_POLICY',
  'FF_ENABLE_STRICT_TRANSPORT_SECURITY',
  'FF_ENABLE_AGENT_MONITORING',
  'FF_AGENT_HEALTH_CHECK_INTERVAL_MS',
  'FF_ENABLE_AGENT_AUTO_RECOVERY',
  'FF_AGENT_MAX_FAILURES',
  'FF_ENABLE_BITCOIN_PRICE_TRACKING',
  'FF_BITCOIN_PRICE_UPDATE_INTERVAL_MS',
  'FF_ENABLE_LIGHTNING_NETWORK_MONITORING',
  'FF_LIGHTNING_NETWORK_CHECK_INTERVAL_MS',
];

function withFlagEnv(overrides: Record<string, string | undefined>, run: () => void): void {
  const saved: Record<string, string | undefined> = {};
  for (const key of FLAG_ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    run();
  } finally {
    for (const key of FLAG_ENV_KEYS) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
  }
}

describe('error catalog', () => {
  it('accepts catalog codes and rejects unknown codes', () => {
    expect(isValidErrorCode('LFAI-0001')).toBe(true);
    expect(isValidErrorCode('LFAI-9999')).toBe(false);
    expect(() => validateErrorCode('NOPE')).toThrow('Invalid error code: NOPE');
  });

  it('maps auth and rate-limit codes to status and retry', () => {
    expect(getHttpStatus('LFAI-0001')).toBe(401);
    expect(getErrorCategory('LFAI-0001')).toBe('authentication');
    expect(isRetryable('LFAI-0001')).toBe(false);
    expect(getHttpStatus('LFAI-0200')).toBe(429);
    expect(isRetryable('LFAI-0200')).toBe(true);
  });

  it('builds a response from the catalog entry', () => {
    const response = createErrorResponse('LFAI-0101', { field: 'email' }, 'req-1');
    expect(response.error).toBe('LFAI-0101');
    expect(response.message).toBe(errorCatalog['LFAI-0101'].message);
    expect(response.category).toBe('validation');
    expect(response.retryable).toBe(false);
    expect(response.requestId).toBe('req-1');
    expect(response.details).toEqual({ field: 'email' });
    expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('wraps the catalog http status for express', () => {
    const wrapped = createExpressErrorResponse('LFAI-0300');
    expect(wrapped.status).toBe(404);
    expect(wrapped.body.error).toBe('LFAI-0300');
  });

  it('gives every catalog entry a status, message, category, and retry flag', () => {
    for (const [code, info] of Object.entries(errorCatalog)) {
      expect(code).toMatch(/^LFAI-\d{4}$/);
      expect(typeof info.http).toBe('number');
      expect(info.message.length).toBeGreaterThan(0);
      expect(info.category.length).toBeGreaterThan(0);
      expect(typeof info.retryable).toBe('boolean');
    }
  });
});

describe('feature flags', () => {
  it('loads documented defaults when flag env vars are unset', () => {
    withFlagEnv({}, () => {
      const flags = new FlagLoader('prod').getFlags();
      expect(flags.NEW_DASHBOARD).toBe(false);
      expect(flags.BITCOIN_LIGHTNING_INTEGRATION).toBe(true);
      expect(flags.MAX_CONCURRENT_AGENTS).toBe(10);
      expect(flags.LOG_LEVEL).toBe('info');
      expect(flags.CORS_ORIGINS).toEqual(['https://lightningflow.online']);
      expect(new FlagLoader('prod').validate().valid).toBe(true);
    });
  });

  it('parses boolean, number, and list env values', () => {
    withFlagEnv(
      {
        NEXT_PUBLIC_FF_NEW_DASHBOARD: 'TRUE',
        FF_MAX_CONCURRENT_AGENTS: '4',
        FF_AGENT_TIMEOUT_MS: 'not-a-number',
        FF_CORS_ORIGINS: 'https://a.example, https://b.example',
        FF_LOG_LEVEL: 'debug',
      },
      () => {
        const flags = new FlagLoader('int').getFlags();
        expect(flags.NEW_DASHBOARD).toBe(true);
        expect(flags.MAX_CONCURRENT_AGENTS).toBe(4);
        expect(flags.AGENT_TIMEOUT_MS).toBe(30000);
        expect(flags.CORS_ORIGINS).toEqual(['https://a.example', 'https://b.example']);
        expect(flags.LOG_LEVEL).toBe('debug');
      }
    );
  });

  it('parses JSON list flags', () => {
    withFlagEnv({ FF_CORS_ORIGINS: '["https://json.example"]' }, () => {
      expect(new FlagLoader().getFlag('CORS_ORIGINS')).toEqual(['https://json.example']);
    });
  });

  it('rejects non-boolean flags in isEnabled', () => {
    withFlagEnv({}, () => {
      expect(() => new FlagLoader().isEnabled('MAX_CONCURRENT_AGENTS')).toThrow(
        'Flag MAX_CONCURRENT_AGENTS is not a boolean flag'
      );
    });
  });

  it('rejects unknown flag names', () => {
    expect(validateFlagSchema({ NEW_DASHBOARD: false }).valid).toBe(true);
    const unknown = validateFlagSchema({ NOT_A_FLAG: true });
    expect(unknown.valid).toBe(false);
    expect(unknown.errors).toContain('Unknown flag: NOT_A_FLAG');
  });
});

describe('openapi guards', () => {
  const user = {
    id: 'user-1',
    email: 'a@b.co',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    subscription_tier: 'pro',
    theme: 'dark',
    timezone: 'UTC',
  };

  it('accepts a complete user and rejects a missing theme', () => {
    expect(validateUser(user)).toBe(true);
    expect(validateUser({ ...user, theme: 'neon' })).toBe(false);
  });

  it('checks payment and pagination shapes', () => {
    expect(
      validatePayment({
        id: 'pay-1',
        amount_sats: 1000,
        description: 'invoice',
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      })
    ).toBe(true);
    expect(validatePayment({ id: 'pay-1', status: 'nope' })).toBe(false);
    expect(
      validatePagination({
        page: 2,
        limit: 20,
        total: 40,
        total_pages: 2,
        has_next: false,
        has_prev: true,
      })
    ).toBe(true);
  });

  it('distinguishes error and success responses', () => {
    expect(isErrorResponse({ error: { code: 'LFAI-0100' } })).toBe(true);
    expect(isErrorResponse({ data: {} })).toBe(false);
    expect(isSuccessResponse({ data: { ok: true } })).toBe(true);
    expect(isSuccessResponse({ data: { ok: true }, error: { code: 'x' } })).toBe(false);
  });

  it('exposes the versioned payment path', () => {
    expect(API_VERSION).toBe('v1');
    expect(HTTP_STATUS.RATE_LIMITED).toBe(429);
    expect(API_ENDPOINTS.HEALTH).toBe('/healthz');
    expect(API_ENDPOINTS.PAYMENT_BY_ID('abc')).toBe('/payments/abc');
  });
});

describe('telemetry attributes', () => {
  it('keeps primitive span values and stringifies the rest', () => {
    const attributes = createSpanAttributes({
      ok: true,
      count: 2,
      name: 'pay',
      extra: { id: 1 },
      skipped: null,
      missing: undefined,
    });
    expect(attributes).toEqual({
      ok: true,
      count: 2,
      name: 'pay',
      extra: '[object Object]',
    });
  });

  it('stringifies metric attributes and drops empty values', () => {
    expect(createMetricAttributes({ status: 200, note: null, flag: false })).toEqual({
      status: '200',
      flag: 'false',
    });
  });

  it('maps the default resource config onto resource attribute keys', () => {
    const resource = createResourceAttributes(defaultTelemetryConfig);
    expect(resource['service.name']).toBe('lightningflow-ai');
    expect(resource['deployment.environment']).toBe('int');
    expect(resource['container.image']).toBe('lightningflow/ai:latest');
  });
});

describe('validators', () => {
  const amountSchema = {
    type: 'object',
    properties: {
      amount: { type: 'integer', minimum: 1 },
    },
    required: ['amount'],
    additionalProperties: false,
  };

  it('validates request bodies against a schema', () => {
    const ok = validateRequest<{ amount: number }>(amountSchema, { amount: 5 });
    expect(ok).toEqual({ success: true, data: { amount: 5 } });

    const missing = validateRequest(amountSchema, {});
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.length).toBeGreaterThan(0);
    }
  });

  it('checks identifiers, amounts, and invoices', () => {
    expect(validators.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validators.isUUID('not-a-uuid')).toBe(false);
    expect(validators.isSatoshi(1)).toBe(true);
    expect(validators.isSatoshi(0)).toBe(false);
    expect(validators.isPaymentHash('a'.repeat(64))).toBe(true);
    expect(validators.isPaymentHash('zz')).toBe(false);
    expect(validators.isEmail('a@b.co')).toBe(true);
    expect(validators.isEmail('nope')).toBe(false);
    expect(validators.isURL('https://lightningflow.online')).toBe(true);
    expect(validators.isLightningInvoice('lnbc1exampleinvoicevalue')).toBe(true);
    expect(validators.isLightningInvoice('bc1qexample')).toBe(false);
  });

  it('compiles schemas and merges required fields', () => {
    expect(isValidSchema(amountSchema)).toBe(true);
    expect(isValidSchema(null)).toBe(false);
    const merged = mergeSchemas(
      { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] },
      { properties: { b: { type: 'number' } }, required: ['b'] }
    );
    expect(merged.required).toEqual(['a', 'b']);
    expect(merged.properties).toEqual({
      a: { type: 'string' },
      b: { type: 'number' },
    });
  });

  it('formats ajv errors', () => {
    const failed = validateRequest(amountSchema, {});
    expect(failed.success).toBe(false);
    if (!failed.success && failed.details) {
      expect(formatValidationErrors(failed.details)).toContain('amount');
    }
  });
});
