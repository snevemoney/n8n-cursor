// AJV validator setup for LightningFlow AI contracts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js';

// Configure AJV with formats and custom keywords
export const ajv = addFormats(new Ajv({ 
  allErrors: true, 
  strict: false,
  verbose: true,
  removeAdditional: false
}));

// Add custom format validators
ajv.addFormat('date-time-utc', {
  type: 'string',
  validate: (data: string) => {
    try {
      const dt = DateTime.fromISO(data);
      return dt.isValid && dt.zoneName === 'UTC';
    } catch {
      return false;
    }
  }
});

ajv.addFormat('satoshis', {
  type: 'number',
  validate: (data: number) => {
    return Number.isInteger(data) && data >= 0;
  }
});

ajv.addFormat('uuid-v4', {
  type: 'string',
  validate: (data: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(data);
  }
});

ajv.addFormat('lightning-invoice', {
  type: 'string',
  validate: (data: string) => {
    // Basic Lightning invoice validation (starts with lnbc)
    return data.startsWith('lnbc') && data.length > 20;
  }
});

ajv.addFormat('node-pubkey', {
  type: 'string',
  validate: (data: string) => {
    // Lightning node pubkey validation (66 hex characters)
    const pubkeyRegex = /^[0-9a-f]{66}$/i;
    return pubkeyRegex.test(data);
  }
});

// Add custom keywords
ajv.addKeyword({
  keyword: 'currency',
  type: 'number',
  validate: (schema: any, data: number) => {
    if (schema === 'sats') {
      return Number.isInteger(data) && data >= 0;
    }
    return true;
  }
});

ajv.addKeyword({
  keyword: 'timezone',
  type: 'string',
  validate: (schema: any, data: string) => {
    try {
      return DateTime.now().setZone(data).isValid;
    } catch {
      return false;
    }
  }
});

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    instancePath: string;
    schemaPath: string;
    keyword: string;
    params: any;
    message: string;
    data?: any;
  }>;
}

// Generic validation function
export function validate<T>(schema: any, data: T): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  return {
    valid,
    errors: valid ? undefined : validate.errors || []
  };
}

// Validation error class
export class ValidationError extends Error {
  public readonly errors: ValidationResult['errors'];
  public readonly data: any;

  constructor(message: string, errors: ValidationResult['errors'], data: any) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.data = data;
  }

  toString(): string {
    return `${this.message}\n${this.errors?.map(e => `  ${e.instancePath}: ${e.message}`).join('\n') || ''}`;
  }
}

// Utility function to validate and throw on error
export function validateOrThrow<T>(schema: any, data: T, context?: string): T {
  const result = validate(schema, data);
  
  if (!result.valid) {
    const message = context ? `Validation failed for ${context}` : 'Validation failed';
    throw new ValidationError(message, result.errors, data);
  }
  
  return data;
}

// Currency validation utilities
export function validateSatoshis(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0;
}

export function validateDecimalAmount(amount: string | number): boolean {
  try {
    const decimal = new Decimal(amount);
    return decimal.gte(0) && decimal.isFinite();
  } catch {
    return false;
  }
}

// Time validation utilities
export function validateUTCTimestamp(timestamp: string): boolean {
  try {
    const dt = DateTime.fromISO(timestamp);
    return dt.isValid && dt.zoneName === 'UTC';
  } catch {
    return false;
  }
}

export function validateTimezone(timezone: string): boolean {
  try {
    return DateTime.now().setZone(timezone).isValid;
  } catch {
    return false;
  }
}

// UUID validation utilities
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Lightning Network validation utilities
export function validateLightningInvoice(invoice: string): boolean {
  return invoice.startsWith('lnbc') && invoice.length > 20;
}

export function validateNodePubkey(pubkey: string): boolean {
  const pubkeyRegex = /^[0-9a-f]{66}$/i;
  return pubkeyRegex.test(pubkey);
}

// Email validation utility
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Pagination validation utilities
export function validatePagination(page: number, limit: number): boolean {
  return Number.isInteger(page) && page >= 1 && 
         Number.isInteger(limit) && limit >= 1 && limit <= 100;
}

// Feature flag validation utilities
export function validateFeatureFlagName(name: string): boolean {
  const flagNameRegex = /^[A-Z_]+$/;
  return flagNameRegex.test(name);
}

// Error code validation utilities
export function validateErrorCode(code: string): boolean {
  const errorCodeRegex = /^LFAI-[0-9]{4}$/;
  return errorCodeRegex.test(code);
}

// Export commonly used schemas for validation
export const commonSchemas = {
  uuid: { type: 'string', format: 'uuid-v4' },
  email: { type: 'string', format: 'email' },
  satoshis: { type: 'integer', minimum: 0, currency: 'sats' },
  timestamp: { type: 'string', format: 'date-time-utc' },
  timezone: { type: 'string', timezone: true },
  lightningInvoice: { type: 'string', format: 'lightning-invoice' },
  nodePubkey: { type: 'string', format: 'node-pubkey' },
  pagination: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 }
    },
    required: ['page', 'limit']
  }
};








