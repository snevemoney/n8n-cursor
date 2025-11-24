/**
 * Edge Client
 * Client for making requests through edge nodes
 */

import { getEdgeRouter, type RoutingStrategy } from './router';
import { getEdgeCache } from './cache';
import type { EdgeRequest, EdgeResponse, Region } from './types';

export class EdgeClient {
  /**
   * Make request through edge network
   */
  async request<T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      clientRegion?: Region;
      clientIP?: string;
      strategy?: RoutingStrategy;
      cacheEnabled?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<EdgeResponse & { data: T }> {
    const {
      method = 'GET',
      body,
      headers = {},
      clientRegion,
      clientIP,
      strategy = 'nearest',
      cacheEnabled = true,
      cacheTTL = 3600, // 1 hour default
    } = options;

    const router = getEdgeRouter();
    const cache = getEdgeCache();

    // Build request
    const request: EdgeRequest = {
      path,
      method,
      clientRegion,
      clientIP,
      headers,
    };

    // Check cache for GET requests
    if (method === 'GET' && cacheEnabled) {
      const cacheKey = `edge:${path}:${clientRegion || 'global'}`;
      const cached = cache.get(cacheKey, clientRegion);
      if (cached) {
        return {
          region: clientRegion || 'local',
          nodeId: 'cache',
          latency: 0,
          cached: true,
          data: cached,
        };
      }
    }

    // Route to edge node
    const node = await router.route(request, strategy);

    if (!node) {
      throw new Error('No edge nodes available');
    }

    // Make request
    const startTime = Date.now();
    const url = `${node.protocol}://${node.host}:${node.port}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Scorpion-EdgeClient/1.0',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Edge request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Cache response for GET requests
    if (method === 'GET' && cacheEnabled && response.ok) {
      const cacheKey = `edge:${path}:${clientRegion || 'global'}`;
      cache.set(cacheKey, data, cacheTTL * 1000, clientRegion);
    }

    // Update node latency
    const registry = await import('./registry').then(m => m.getEdgeRegistry());
    await registry.updateNodeHealth(node.id, latency);

    return {
      region: node.region,
      nodeId: node.id,
      latency,
      cached: false,
      data,
    };
  }

  /**
   * Get optimal region for client
   */
  async getOptimalRegion(clientIP?: string, clientRegion?: Region): Promise<Region> {
    const router = getEdgeRouter();
    return router.getOptimalRegion(clientIP, clientRegion);
  }
}

// Singleton instance
let edgeClientInstance: EdgeClient | null = null;

export function getEdgeClient(): EdgeClient {
  if (!edgeClientInstance) {
    edgeClientInstance = new EdgeClient();
  }
  return edgeClientInstance;
}

