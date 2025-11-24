/**
 * Edge Deployment Types
 * Type definitions for multi-region edge deployment
 */

export type Region = 'us-east' | 'us-west' | 'eu-west' | 'eu-central' | 'ap-south' | 'ap-northeast' | 'local';

export interface EdgeNode {
  id: string;
  region: Region;
  host: string;
  port: number;
  protocol: 'http' | 'https';
  status: 'active' | 'standby' | 'maintenance';
  latency?: number; // ms
  capacity?: number; // requests per second
  metadata?: Record<string, string>;
  lastHealthCheck?: string;
}

export interface EdgeRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '*';
  targetRegion?: Region;
  preferredRegions?: Region[];
  fallbackRegions?: Region[];
  cacheEnabled?: boolean;
  cacheTTL?: number; // seconds
}

export interface EdgeRequest {
  path: string;
  method: string;
  clientRegion?: Region;
  clientIP?: string;
  headers?: Record<string, string>;
}

export interface EdgeResponse {
  region: Region;
  nodeId: string;
  latency: number;
  cached: boolean;
  data: any;
}

