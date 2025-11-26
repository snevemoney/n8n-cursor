/**
 * Standard API Error Handler
 * Provides consistent error responses, logging, and error codes across all API routes
 */

import { NextResponse } from 'next/server';
import { getMetricsCollector } from './metrics';

export enum ApiErrorCode {
  // 400 - Client Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  
  // 401 - Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // 403 - Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // 404 - Not Found
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // 409 - Conflict
  CONFLICT = 'CONFLICT',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  
  // 429 - Rate Limit
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // 500 - Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // 503 - Service Unavailable
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: any,
  statusCode: number = 500,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const error: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  // Log error with context
  try {
    const metrics = getMetricsCollector();
    if (metrics && typeof metrics.incrementCounter === 'function') {
      metrics.incrementCounter('scorpion_errors_total', {
        code,
        statusCode: statusCode.toString(),
      });
    }
  } catch (e) {
    // Metrics collector not available or error - continue without metrics
  }

  console.error(`[API Error] ${code}: ${message}`, {
    code,
    message,
    details,
    statusCode,
    requestId,
    timestamp: error.error.timestamp,
  });

  return NextResponse.json(error, { status: statusCode });
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error: any) {
      // Handle known error types
      if (error.name === 'ZodError') {
        return createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          'Invalid request parameters',
          error.errors,
          400
        );
      }

      if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        return createErrorResponse(
          ApiErrorCode.TIMEOUT_ERROR,
          'Request timed out',
          undefined,
          504
        );
      }

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return createErrorResponse(
          ApiErrorCode.EXTERNAL_SERVICE_ERROR,
          'External service unavailable',
          undefined,
          503
        );
      }

      // Default to internal error
      return createErrorResponse(
        ApiErrorCode.INTERNAL_ERROR,
        error.message || 'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? error.stack : undefined,
        500
      );
    }
  };
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: { parse: (data: any) => T }
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid request body',
        error.errors || error.message,
        400
      ),
    };
  }
}

/**
 * Get request ID from headers or generate one
 */
export function getRequestId(request: Request): string {
  return (
    request.headers.get('x-request-id') ||
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
}

