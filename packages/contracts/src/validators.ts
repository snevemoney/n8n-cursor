// LightningFlow AI Contracts - Validator Utilities
// Common validation utilities and helpers

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';

// Create configured Ajv instance
export const ajv = addErrors(addFormats(new Ajv({
  allErrors: true,
  strict: false,
  verbose: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true
})));

// Custom formats
ajv.addFormat('uuid', {
  type: 'string',
  validate: (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
});

ajv.addFormat('satoshi', {
  type: 'integer',
  validate: (value: number) => {
    return Number.isInteger(value) && value >= 1;
  }
});

ajv.addFormat('payment-hash', {
  type: 'string',
  validate: (str: string) => {
    const hashRegex = /^[a-f0-9]{64}$/i;
    return hashRegex.test(str);
  }
});

ajv.addFormat('preimage', {
  type: 'string',
  validate: (str: string) => {
    const preimageRegex = /^[a-f0-9]{64}$/i;
    return preimageRegex.test(str);
  }
});

// Validation result type
export interface ValidationResult<T = any> {
  valid: boolean;
  data?: T;
  errors?: Ajv.ErrorObject[];
  errorMessage?: string;
}

// Generic validator function
export function validate<T = any>(
  schema: any,
  data: any,
  options: {
    coerceTypes?: boolean;
    removeAdditional?: boolean;
    useDefaults?: boolean;
  } = {}
): ValidationResult<T> {
  try {
    const validate = ajv.compile(schema);
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
        errorMessage: ajv.errorsText(validate.errors)
      };
    }
  } catch (error) {
    return {
      valid: false,
      errorMessage: error instanceof Error ? error.message : 'Validation error'
    };
  }
}

// Validation middleware for Express
export function createValidationMiddleware<T = any>(schema: any) {
  return (req: any, res: any, next: any) => {
    const result = validate<T>(schema, req.body);
    
    if (!result.valid) {
      return res.status(400).json({
        error: 'LFAI-0100',
        message: 'Invalid request parameters',
        details: result.errors,
        timestamp: new Date().toISOString()
      });
    }
    
    req.validatedData = result.data;
    next();
  };
}

// Request validation helper
export function validateRequest<T = any>(
  schema: any,
  data: any
): { success: true; data: T } | { success: false; error: string; details?: any } {
  const result = validate<T>(schema, data);
  
  if (result.valid) {
    return {
      success: true,
      data: result.data!
    };
  } else {
    return {
      success: false,
      error: result.errorMessage || 'Validation failed',
      details: result.errors
    };
  }
}

// Response validation helper
export function validateResponse<T = any>(
  schema: any,
  data: any
): { success: true; data: T } | { success: false; error: string; details?: any } {
  const result = validate<T>(schema, data);
  
  if (result.valid) {
    return {
      success: true,
      data: result.data!
    };
  } else {
    return {
      success: false,
      error: result.errorMessage || 'Response validation failed',
      details: result.errors
    };
  }
}

// Schema compilation helper
export function compileSchema(schema: any) {
  try {
    return ajv.compile(schema);
  } catch (error) {
    throw new Error(`Schema compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Schema validation helper
export function isValidSchema(schema: any): boolean {
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
export function formatValidationErrors(errors: Ajv.ErrorObject[]): string {
  return errors.map(error => {
    const path = error.instancePath || error.schemaPath;
    const message = error.message;
    return `${path}: ${message}`;
  }).join(', ');
}

// Schema merge helper
export function mergeSchemas(...schemas: any[]): any {
  return schemas.reduce((merged, schema) => {
    return {
      ...merged,
      ...schema,
      properties: {
        ...merged.properties,
        ...schema.properties
      },
      required: [
        ...(merged.required || []),
        ...(schema.required || [])
      ]
    };
  }, {});
}

// Schema reference resolver
export function resolveSchemaReferences(schema: any, definitions: any): any {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/', '').split('/');
    let resolved = definitions;
    for (const part of refPath) {
      resolved = resolved[part];
    }
    return resolveSchemaReferences(resolved, definitions);
  }

  const resolved: any = {};
  for (const [key, value] of Object.entries(schema)) {
    resolved[key] = resolveSchemaReferences(value, definitions);
  }

  return resolved;
}

// Export Ajv instance for custom use
export { ajv as default };
