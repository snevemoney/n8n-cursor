/**
 * Service Client
 * Client for making requests to discovered services with load balancing
 */

import { getServiceRegistry } from './registry';
import { getLoadBalancer, type LoadBalancingStrategy } from './load-balancer';
import type { ServiceInstance } from './types';

export class ServiceClient {
  /**
   * Make a request to a service by name
   */
  async request(
    serviceName: string,
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      strategy?: LoadBalancingStrategy;
      timeout?: number;
    } = {}
  ): Promise<Response> {
    const {
      method = 'GET',
      body,
      headers = {},
      strategy = 'round-robin',
      timeout = 10000,
    } = options;

    // Discover service instances
    const registry = getServiceRegistry();
    const instances = await registry.discover(serviceName, true);

    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    // Select instance using load balancer
    const loadBalancer = getLoadBalancer();
    const instance = loadBalancer.selectInstance(instances, strategy);

    if (!instance) {
      throw new Error(`Failed to select instance for service: ${serviceName}`);
    }

    // Build URL
    const url = `${instance.protocol}://${instance.host}:${instance.port}${path}`;

    // Track connection
    loadBalancer.incrementConnections(instance.id);

    try {
      // Make request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Scorpion-ServiceClient/1.0',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      // On error, mark instance as potentially unhealthy
      await registry.heartbeat(instance.id, 'unhealthy');
      throw error;
    } finally {
      loadBalancer.decrementConnections(instance.id);
    }
  }

  /**
   * Get service instance URL
   */
  async getServiceUrl(serviceName: string, path: string = ''): Promise<string> {
    const registry = getServiceRegistry();
    const instances = await registry.discover(serviceName, true);

    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    const loadBalancer = getLoadBalancer();
    const instance = loadBalancer.selectInstance(instances);

    if (!instance) {
      throw new Error(`Failed to select instance for service: ${serviceName}`);
    }

    return `${instance.protocol}://${instance.host}:${instance.port}${path}`;
  }
}

// Singleton instance
let serviceClientInstance: ServiceClient | null = null;

export function getServiceClient(): ServiceClient {
  if (!serviceClientInstance) {
    serviceClientInstance = new ServiceClient();
  }
  return serviceClientInstance;
}

