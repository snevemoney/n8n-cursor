// LightningFlow AI Contracts - Error Types and Helpers
// Generated from contracts/errors.yaml

// Error code type
export type ErrorCode = 
  | 'LFAI-0001' | 'LFAI-0002' | 'LFAI-0003' | 'LFAI-0004' | 'LFAI-0005'
  | 'LFAI-0100' | 'LFAI-0101' | 'LFAI-0102' | 'LFAI-0103' | 'LFAI-0104' | 'LFAI-0105'
  | 'LFAI-0200' | 'LFAI-0201' | 'LFAI-0202'
  | 'LFAI-0300' | 'LFAI-0301' | 'LFAI-0302' | 'LFAI-0303' | 'LFAI-0304' | 'LFAI-0305' | 'LFAI-0306'
  | 'LFAI-0400' | 'LFAI-0401' | 'LFAI-0402' | 'LFAI-0403' | 'LFAI-0404'
  | 'LFAI-0500' | 'LFAI-0501' | 'LFAI-0502' | 'LFAI-0503' | 'LFAI-0504' | 'LFAI-0505' | 'LFAI-0506' | 'LFAI-0507' | 'LFAI-0508'
  | 'LFAI-0600' | 'LFAI-0601' | 'LFAI-0602' | 'LFAI-0603' | 'LFAI-0604'
  | 'LFAI-0700' | 'LFAI-0701' | 'LFAI-0702' | 'LFAI-0703' | 'LFAI-0704'
  | 'LFAI-0800' | 'LFAI-0801' | 'LFAI-0802' | 'LFAI-0803' | 'LFAI-0804' | 'LFAI-0805'
  | 'LFAI-0900' | 'LFAI-0901' | 'LFAI-0902' | 'LFAI-0903' | 'LFAI-0904' | 'LFAI-0905';

// Error category type
export type ErrorCategory = 
  | 'authentication' | 'authorization' | 'validation' | 'rate_limiting'
  | 'agent' | 'webhook' | 'bitcoin' | 'lightning' | 'database'
  | 'external_service' | 'system' | 'security';

// Error details interface
export interface ErrorDetails {
  [key: string]: any;
}

// Error response interface
export interface ErrorResponse {
  error: ErrorCode;
  message: string;
  description?: string;
  category: ErrorCategory;
  retryable: boolean;
  timestamp: string;
  requestId?: string;
  details?: ErrorDetails;
}

// Error catalog
export const errorCatalog: Record<ErrorCode, {
  http: number;
  message: string;
  description: string;
  category: ErrorCategory;
  retryable: boolean;
}> = {
  // Authentication & Authorization (LFAI-0001 to LFAI-0099)
  'LFAI-0001': {
    http: 401,
    message: 'Invalid or missing authentication token',
    description: 'The provided authentication token is invalid or missing',
    category: 'authentication',
    retryable: false
  },
  'LFAI-0002': {
    http: 401,
    message: 'Authentication token expired',
    description: 'The authentication token has expired and needs to be refreshed',
    category: 'authentication',
    retryable: false
  },
  'LFAI-0003': {
    http: 403,
    message: 'Insufficient permissions',
    description: 'The authenticated user does not have sufficient permissions for this operation',
    category: 'authorization',
    retryable: false
  },
  'LFAI-0004': {
    http: 403,
    message: 'Access denied',
    description: 'Access to the requested resource is denied',
    category: 'authorization',
    retryable: false
  },
  'LFAI-0005': {
    http: 401,
    message: 'Invalid API key',
    description: 'The provided API key is invalid or has been revoked',
    category: 'authentication',
    retryable: false
  },

  // Validation Errors (LFAI-0100 to LFAI-0199)
  'LFAI-0100': {
    http: 400,
    message: 'Invalid request parameters',
    description: 'The request parameters are invalid or malformed',
    category: 'validation',
    retryable: false
  },
  'LFAI-0101': {
    http: 400,
    message: 'Missing required field',
    description: 'A required field is missing from the request',
    category: 'validation',
    retryable: false
  },
  'LFAI-0102': {
    http: 400,
    message: 'Invalid field format',
    description: 'A field has an invalid format or type',
    category: 'validation',
    retryable: false
  },
  'LFAI-0103': {
    http: 400,
    message: 'Field value out of range',
    description: 'A field value is outside the allowed range',
    category: 'validation',
    retryable: false
  },
  'LFAI-0104': {
    http: 400,
    message: 'Invalid JSON payload',
    description: 'The request body contains invalid JSON',
    category: 'validation',
    retryable: false
  },
  'LFAI-0105': {
    http: 400,
    message: 'Request body too large',
    description: 'The request body exceeds the maximum allowed size',
    category: 'validation',
    retryable: false
  },

  // Rate Limiting (LFAI-0200 to LFAI-0299)
  'LFAI-0200': {
    http: 429,
    message: 'Rate limit exceeded',
    description: 'The request rate limit has been exceeded',
    category: 'rate_limiting',
    retryable: true
  },
  'LFAI-0201': {
    http: 429,
    message: 'Too many requests',
    description: 'Too many requests have been made in a short time period',
    category: 'rate_limiting',
    retryable: true
  },
  'LFAI-0202': {
    http: 429,
    message: 'Quota exceeded',
    description: 'The API quota has been exceeded',
    category: 'rate_limiting',
    retryable: true
  },

  // Agent Errors (LFAI-0300 to LFAI-0399)
  'LFAI-0300': {
    http: 404,
    message: 'Agent not found',
    description: 'The requested agent does not exist',
    category: 'agent',
    retryable: false
  },
  'LFAI-0301': {
    http: 400,
    message: 'Agent configuration invalid',
    description: 'The agent configuration is invalid or malformed',
    category: 'agent',
    retryable: false
  },
  'LFAI-0302': {
    http: 409,
    message: 'Agent already exists',
    description: 'An agent with the same name already exists',
    category: 'agent',
    retryable: false
  },
  'LFAI-0303': {
    http: 500,
    message: 'Agent execution failed',
    description: 'The agent execution failed due to an internal error',
    category: 'agent',
    retryable: true
  },
  'LFAI-0304': {
    http: 408,
    message: 'Agent execution timeout',
    description: 'The agent execution timed out',
    category: 'agent',
    retryable: true
  },
  'LFAI-0305': {
    http: 503,
    message: 'Agent service unavailable',
    description: 'The agent service is currently unavailable',
    category: 'agent',
    retryable: true
  },
  'LFAI-0306': {
    http: 400,
    message: 'Agent type not supported',
    description: 'The requested agent type is not supported',
    category: 'agent',
    retryable: false
  },

  // Webhook Errors (LFAI-0400 to LFAI-0499)
  'LFAI-0400': {
    http: 400,
    message: 'Invalid webhook signature',
    description: 'The webhook signature is invalid or missing',
    category: 'webhook',
    retryable: false
  },
  'LFAI-0401': {
    http: 400,
    message: 'Invalid webhook payload',
    description: 'The webhook payload is invalid or malformed',
    category: 'webhook',
    retryable: false
  },
  'LFAI-0402': {
    http: 400,
    message: 'Webhook event not supported',
    description: 'The webhook event type is not supported',
    category: 'webhook',
    retryable: false
  },
  'LFAI-0403': {
    http: 500,
    message: 'Webhook processing failed',
    description: 'Failed to process the webhook event',
    category: 'webhook',
    retryable: true
  },
  'LFAI-0404': {
    http: 429,
    message: 'Webhook rate limit exceeded',
    description: 'Webhook rate limit has been exceeded',
    category: 'webhook',
    retryable: true
  },

  // Bitcoin/Lightning Errors (LFAI-0500 to LFAI-0599)
  'LFAI-0500': {
    http: 400,
    message: 'Invalid Bitcoin address',
    description: 'The provided Bitcoin address is invalid',
    category: 'bitcoin',
    retryable: false
  },
  'LFAI-0501': {
    http: 400,
    message: 'Invalid Lightning invoice',
    description: 'The provided Lightning invoice is invalid',
    category: 'lightning',
    retryable: false
  },
  'LFAI-0502': {
    http: 400,
    message: 'Insufficient balance',
    description: 'Insufficient balance for the requested operation',
    category: 'bitcoin',
    retryable: false
  },
  'LFAI-0503': {
    http: 400,
    message: 'Payment amount too small',
    description: 'The payment amount is below the minimum allowed',
    category: 'lightning',
    retryable: false
  },
  'LFAI-0504': {
    http: 400,
    message: 'Payment amount too large',
    description: 'The payment amount exceeds the maximum allowed',
    category: 'lightning',
    retryable: false
  },
  'LFAI-0505': {
    http: 500,
    message: 'Lightning network error',
    description: 'An error occurred while communicating with the Lightning network',
    category: 'lightning',
    retryable: true
  },
  'LFAI-0506': {
    http: 500,
    message: 'Bitcoin network error',
    description: 'An error occurred while communicating with the Bitcoin network',
    category: 'bitcoin',
    retryable: true
  },
  'LFAI-0507': {
    http: 400,
    message: 'Channel not found',
    description: 'The requested Lightning channel does not exist',
    category: 'lightning',
    retryable: false
  },
  'LFAI-0508': {
    http: 400,
    message: 'Channel capacity insufficient',
    description: 'The channel does not have sufficient capacity for the operation',
    category: 'lightning',
    retryable: false
  },

  // Database Errors (LFAI-0600 to LFAI-0699)
  'LFAI-0600': {
    http: 500,
    message: 'Database connection failed',
    description: 'Failed to connect to the database',
    category: 'database',
    retryable: true
  },
  'LFAI-0601': {
    http: 500,
    message: 'Database query failed',
    description: 'A database query failed to execute',
    category: 'database',
    retryable: true
  },
  'LFAI-0602': {
    http: 500,
    message: 'Database transaction failed',
    description: 'A database transaction failed to commit',
    category: 'database',
    retryable: true
  },
  'LFAI-0603': {
    http: 500,
    message: 'Database constraint violation',
    description: 'A database constraint was violated',
    category: 'database',
    retryable: false
  },
  'LFAI-0604': {
    http: 500,
    message: 'Database timeout',
    description: 'A database operation timed out',
    category: 'database',
    retryable: true
  },

  // External Service Errors (LFAI-0700 to LFAI-0799)
  'LFAI-0700': {
    http: 503,
    message: 'External service unavailable',
    description: 'An external service is currently unavailable',
    category: 'external_service',
    retryable: true
  },
  'LFAI-0701': {
    http: 500,
    message: 'External service error',
    description: 'An error occurred while communicating with an external service',
    category: 'external_service',
    retryable: true
  },
  'LFAI-0702': {
    http: 400,
    message: 'External service invalid response',
    description: 'An external service returned an invalid response',
    category: 'external_service',
    retryable: true
  },
  'LFAI-0703': {
    http: 408,
    message: 'External service timeout',
    description: 'An external service request timed out',
    category: 'external_service',
    retryable: true
  },
  'LFAI-0704': {
    http: 401,
    message: 'External service authentication failed',
    description: 'Authentication with an external service failed',
    category: 'external_service',
    retryable: false
  },

  // System Errors (LFAI-0800 to LFAI-0899)
  'LFAI-0800': {
    http: 500,
    message: 'Internal server error',
    description: 'An unexpected internal server error occurred',
    category: 'system',
    retryable: true
  },
  'LFAI-0801': {
    http: 503,
    message: 'Service temporarily unavailable',
    description: 'The service is temporarily unavailable',
    category: 'system',
    retryable: true
  },
  'LFAI-0802': {
    http: 500,
    message: 'Configuration error',
    description: 'A configuration error occurred',
    category: 'system',
    retryable: false
  },
  'LFAI-0803': {
    http: 500,
    message: 'Resource exhaustion',
    description: 'System resources have been exhausted',
    category: 'system',
    retryable: true
  },
  'LFAI-0804': {
    http: 500,
    message: 'Memory allocation failed',
    description: 'Failed to allocate memory for the operation',
    category: 'system',
    retryable: true
  },
  'LFAI-0805': {
    http: 500,
    message: 'File system error',
    description: 'A file system error occurred',
    category: 'system',
    retryable: true
  },

  // Security Errors (LFAI-0900 to LFAI-0999)
  'LFAI-0900': {
    http: 400,
    message: 'Security validation failed',
    description: 'Security validation failed for the request',
    category: 'security',
    retryable: false
  },
  'LFAI-0901': {
    http: 400,
    message: 'Input sanitization failed',
    description: 'Input sanitization failed due to malicious content',
    category: 'security',
    retryable: false
  },
  'LFAI-0902': {
    http: 400,
    message: 'CSRF token invalid',
    description: 'The CSRF token is invalid or missing',
    category: 'security',
    retryable: false
  },
  'LFAI-0903': {
    http: 400,
    message: 'XSS protection triggered',
    description: 'XSS protection was triggered by the request',
    category: 'security',
    retryable: false
  },
  'LFAI-0904': {
    http: 400,
    message: 'SQL injection attempt detected',
    description: 'A potential SQL injection attempt was detected',
    category: 'security',
    retryable: false
  },
  'LFAI-0905': {
    http: 429,
    message: 'Too many failed authentication attempts',
    description: 'Too many failed authentication attempts from this IP',
    category: 'security',
    retryable: true
  }
};

// Error helper functions
export function createErrorResponse(
  code: ErrorCode,
  details?: ErrorDetails,
  requestId?: string
): ErrorResponse {
  const errorInfo = errorCatalog[code];
  
  return {
    error: code,
    message: errorInfo.message,
    description: errorInfo.description,
    category: errorInfo.category,
    retryable: errorInfo.retryable,
    timestamp: new Date().toISOString(),
    requestId,
    details
  };
}

export function getErrorInfo(code: ErrorCode) {
  return errorCatalog[code];
}

export function getHttpStatus(code: ErrorCode): number {
  return errorCatalog[code].http;
}

export function isRetryable(code: ErrorCode): boolean {
  return errorCatalog[code].retryable;
}

export function getErrorCategory(code: ErrorCode): ErrorCategory {
  return errorCatalog[code].category;
}

// Error response helpers for different frameworks
export function createExpressErrorResponse(
  code: ErrorCode,
  details?: ErrorDetails,
  requestId?: string
) {
  const errorInfo = errorCatalog[code];
  
  return {
    status: errorInfo.http,
    body: createErrorResponse(code, details, requestId)
  };
}

export function createNextResponse(
  code: ErrorCode,
  details?: ErrorDetails,
  requestId?: string
) {
  const errorInfo = errorCatalog[code];
  
  return new Response(
    JSON.stringify(createErrorResponse(code, details, requestId)),
    {
      status: errorInfo.http,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Error validation
export function isValidErrorCode(code: string): code is ErrorCode {
  return code in errorCatalog;
}

export function validateErrorCode(code: string): ErrorCode {
  if (!isValidErrorCode(code)) {
    throw new Error(`Invalid error code: ${code}`);
  }
  return code;
}

// Error categories
export const errorCategories: Record<ErrorCategory, string> = {
  authentication: 'Authentication-related errors',
  authorization: 'Authorization-related errors',
  validation: 'Input validation errors',
  rate_limiting: 'Rate limiting errors',
  agent: 'Agent-related errors',
  webhook: 'Webhook-related errors',
  bitcoin: 'Bitcoin-related errors',
  lightning: 'Lightning Network-related errors',
  database: 'Database-related errors',
  external_service: 'External service errors',
  system: 'System-related errors',
  security: 'Security-related errors'
};

// HTTP status code mappings
export const httpStatusCodes: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  408: 'Request Timeout',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  503: 'Service Unavailable'
};






