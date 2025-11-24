/**
 * Service Types
 * Type definitions for service registry and discovery
 */

export interface ServiceInstance {
  id: string;
  serviceName: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  status: 'healthy' | 'unhealthy' | 'unknown';
  metadata?: Record<string, string>;
  registeredAt: string;
  lastHeartbeat: string;
  tags?: string[];
}

export interface ServiceDefinition {
  name: string;
  version: string;
  description?: string;
  endpoints: ServiceEndpoint[];
  dependencies?: string[]; // Other service names this depends on
  tags?: string[];
}

export interface ServiceEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
  requiresAuth?: boolean;
}

export interface ServiceHealth {
  serviceId: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  timestamp: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration?: number; // milliseconds
}

