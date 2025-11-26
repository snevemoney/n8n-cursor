/**
 * API Gateway Types
 * Type definitions for API Gateway functionality
 */

export interface ApiKey {
  id: string;
  keyName: string;
  keyHash: string;
  isActive: boolean;
  expiresAt?: string;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  allowedEndpoints?: string[];
  blockedEndpoints?: string[];
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

export interface ApiUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  requestTime: string;
  durationMs?: number;
  userAgent?: string;
  ipAddress?: string;
  requestSize?: number;
  responseSize?: number;
}

export interface RateLimitConfig {
  perMinute: number;
  perHour: number;
  perDay: number;
}

export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
}

export interface ApiGatewayConfig {
  enabled: boolean;
  requireApiKey: boolean;
  defaultRateLimit: RateLimitConfig;
  versionPrefix: string; // '/api/v1'
}

