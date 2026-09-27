// LightningFlow AI Contracts - Validator Utilities
// Common validation utilities and helpers

import Ajv, { type ErrorObject, type Schema, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';

type ValidateOptions = {
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  useDefaults?: boolean;
};

const defaultValidateOptions = {
  coerceTypes: true,
  removeAdditional: true,
  useDefaults: true
} as const;

function addContractFormats(instance: Ajv): Ajv {
  instance.addFormat('uuid', {
    type: 'string',
    validate: (str: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    }
  });

  instance.addFormat('satoshi', {
    type: 'number',
    validate: (value: number) => {
      return Number.isInteger(value) && value >= 1;
    }
  });

  instance.addFormat('payment-hash', {
    type: 'string',
    validate: (str: string) => {
      const hashRegex = /^[a-f0-9]{64}$/i;
      return hashRegex.test(str);
    }
  });

  instance.addFormat('preimage', {
    type: 'string',
    validate: (str: string) => {
      const preimageRegex = /^[a-f0-9]{64}$/i;
      return preimageRegex.test(str);
    }
  });
  return instance;
}

function createAjv(options: { coerceTypes: boolean; removeAdditional: boolean; useDefaults: boolean }): Ajv {
  return addContractFormats(addErrors(addFormats(new Ajv({
    allErrors: true,
    strict: false,
    verbose: true,
    removeAdditional: options.removeAdditional,
    useDefaults: options.useDefaults,
    coerceTypes: options.coerceTypes
  }))));
}

// Create configured Ajv instance
export const ajv = createAjv(defaultValidateOptions);

type JsonSchema = {
  properties?: Record<string, JsonSchema>;
  required?: string[];
  $ref?: string;
  [key: string]: unknown;
};

interface RequestWithBody<T = unknown> {
  body: unknown;
  validatedData?: T;
}

interface JsonResponse {
  status(code: number): JsonResponse;
  json(body: unknown): void;
}

type NextFunction = () => void;

// Validation result type
export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors?: ErrorObject[];
  errorMessage?: string;
}

function compilerFor(options: ValidateOptions): Ajv {
  const coerceTypes = options.coerceTypes ?? defaultValidateOptions.coerceTypes;
  const removeAdditional = options.removeAdditional ?? defaultValidateOptions.removeAdditional;
  const useDefaults = options.useDefaults ?? defaultValidateOptions.useDefaults;
  if (
    coerceTypes === defaultValidateOptions.coerceTypes &&
    removeAdditional === defaultValidateOptions.removeAdditional &&
    useDefaults === defaultValidateOptions.useDefaults
  ) {
    return ajv;
  }
  return createAjv({ coerceTypes, removeAdditional, useDefaults });
}

// Generic validator function
export function validate<T = unknown>(
  schema: Schema,
  data: unknown,
  options: ValidateOptions = {}
): ValidationResult<T> {
  try {
    const compiler = compilerFor(options);
    const validate = compiler.compile(schema);
    const valid = validate(data);
    
    if (valid) {
      return {
        valid: true,
        data: data as T
      };
    } else {
      return {
        valid: false,
        errors: validate.errors || [],
        errorMessage: compiler.errorsText(validate.errors)
      };
    }
  } catch (error) {
    return {
      valid: false,
      errorMessage: error instanceof Error ? error.message : 'Validation error'
    };
  }
}

function failure(
  error: string,
  details?: ErrorObject[]
): { success: false; error: string; details?: ErrorObject[] } {
  const result: { success: false; error: string; details?: ErrorObject[] } = {
    success: false,
    error
  };
  if (details !== undefined) {
    result.details = details;
  }
  return result;
}

// Validation middleware for Express
export function createValidationMiddleware<T = unknown>(schema: Schema) {
  return (req: RequestWithBody<T>, res: JsonResponse, next: NextFunction): void => {
    const result = validate<T>(schema, req.body);
    
    if (!result.valid) {
      res.status(400).json({
        error: 'LFAI-0100',
        message: 'Invalid request parameters',
        details: result.errors,
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    req.validatedData = result.data as T;
    next();
  };
}

// Request validation helper
export function validateRequest<T = unknown>(
  schema: Schema,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: ErrorObject[] } {
  const result = validate<T>(schema, data);
  
  if (result.valid && result.data !== undefined) {
    return {
      success: true,
      data: result.data
    };
  }
  if (result.valid) {
    return {
      success: true,
      data: data as T
    };
  }
  return failure(result.errorMessage || 'Validation failed', result.errors);
}

// Response validation helper
export function validateResponse<T = unknown>(
  schema: Schema,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: ErrorObject[] } {
  const result = validate<T>(schema, data);
  
  if (result.valid && result.data !== undefined) {
    return {
      success: true,
      data: result.data
    };
  }
  if (result.valid) {
    return {
      success: true,
      data: data as T
    };
  }
  return failure(result.errorMessage || 'Response validation failed', result.errors);
}

// Schema compilation helper
export function compileSchema(schema: Schema): ValidateFunction {
  try {
    return ajv.compile(schema);
  } catch (error) {
    throw new Error(`Schema compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Schema validation helper
export function isValidSchema(schema: Schema): boolean {
  try {
    ajv.compile(schema);
    return true;
  } catch {
    return false;
  }
}

// Custom validation functions
export const validators = {
  // UUID validation
  isUUID: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  // Satoshi validation
  isSatoshi: (value: number): boolean => {
    return Number.isInteger(value) && value >= 1;
  },

  // Payment hash validation
  isPaymentHash: (value: string): boolean => {
    const hashRegex = /^[a-f0-9]{64}$/i;
    return hashRegex.test(value);
  },

  // Preimage validation
  isPreimage: (value: string): boolean => {
    const preimageRegex = /^[a-f0-9]{64}$/i;
    return preimageRegex.test(value);
  },

  // Bitcoin address validation (basic)
  isBitcoinAddress: (value: string): boolean => {
    // Basic validation - in production, use a proper Bitcoin address validator
    const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return addressRegex.test(value);
  },

  // Lightning invoice validation (basic)
  isLightningInvoice: (value: string): boolean => {
    // Basic validation - in production, use a proper Lightning invoice validator
    return value.startsWith('lnbc') || value.startsWith('lntb') || value.startsWith('lnbcrt');
  },

  // Email validation
  isEmail: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // URL validation
  isURL: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  // ISO 8601 date validation
  isISO8601: (value: string): boolean => {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return iso8601Regex.test(value) && !isNaN(Date.parse(value));
  },

  // Positive integer validation
  isPositiveInteger: (value: number): boolean => {
    return Number.isInteger(value) && value > 0;
  },

  // Non-negative integer validation
  isNonNegativeInteger: (value: number): boolean => {
    return Number.isInteger(value) && value >= 0;
  }
};

// Validation error formatter
export function formatValidationErrors(errors: ErrorObject[]): string {
  return errors.map(error => {
    const path = error.instancePath || error.schemaPath;
    const message = error.message;
    return `${path}: ${message}`;
  }).join(', ');
}

// Schema merge helper
export function mergeSchemas(...schemas: JsonSchema[]): JsonSchema {
  return schemas.reduce<JsonSchema>((merged, schema) => {
    return {
      ...merged,
      ...schema,
      properties: {
        ...(merged.properties ?? {}),
        ...(schema.properties ?? {})
      },
      required: [
        ...(merged.required ?? []),
        ...(schema.required ?? [])
      ]
    };
  }, {});
}

// Schema reference resolver
export function resolveSchemaReferences(schema: unknown, definitions: unknown): unknown {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  const node = schema as Record<string, unknown>;
  if (typeof node['$ref'] === 'string') {
    const refPath = node['$ref'].replace('#/', '').split('/');
    let resolved: unknown = definitions;
    for (const part of refPath) {
      resolved = (resolved as Record<string, unknown>)[part];
    }
    return resolveSchemaReferences(resolved, definitions);
  }

  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    resolved[key] = resolveSchemaReferences(value, definitions);
  }

  return resolved;
}

// Export Ajv instance for custom use
export { ajv as default };
