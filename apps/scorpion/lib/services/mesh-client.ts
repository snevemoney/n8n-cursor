/**
 * Service Mesh Client
 * Enhanced service client with circuit breakers, retries, and timeouts
 */

import { getServiceClient } from './client';
import { getCircuitBreakerManager, type CircuitBreakerConfig } from './circuit-breaker';
import { RetryHandler, type RetryConfig } from './retry';
import type { LoadBalancingStrategy } from './load-balancer';

export interface MeshClientConfig {
  circuitBreaker?: CircuitBreakerConfig;
  retry?: RetryConfig;
  timeout?: number; // Request timeout in ms
  strategy?: LoadBalancingStrategy;
}

export class MeshClient {
  private serviceClient = getServiceClient();
  private circuitBreakerManager = getCircuitBreakerManager();

  /**
   * Make a request with full mesh features
   */
  async request<T = any>(
    serviceName: string,
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      config?: MeshClientConfig;
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      config = {},
    } = options;

    const {
      circuitBreaker,
      retry,
      timeout = 10000,
      strategy = 'round-robin',
    } = config;

    // Get circuit breaker for this service
    const breaker = this.circuitBreakerManager.getBreaker(serviceName, circuitBreaker);

    // Check if circuit is open
    if (!breaker.canExecute()) {
      throw new Error(`Circuit breaker is OPEN for service: ${serviceName}`);
    }

    // Execute with circuit breaker and retry
    const result = await breaker.execute(async () => {
      const retryResult = await RetryHandler.execute(
        async () => {
          const response = await this.serviceClient.request(serviceName, path, {
            method,
            body,
            headers,
            strategy,
            timeout,
          });

          if (!response.ok) {
            const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            throw error;
          }

          return await response.json();
        },
        retry || {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          strategy: 'exponential',
          jitter: true,
        }
      );

      if (!retryResult.success) {
        throw retryResult.error || new Error('Request failed after retries');
      }

      return retryResult.result as T;
    });

    return result;
  }

  /**
   * Get circuit breaker stats for a service
   */
  getCircuitBreakerStats(serviceName: string) {
    const breaker = this.circuitBreakerManager.getBreaker(serviceName);
    return breaker.getStats();
  }

  /**
   * Get all circuit breaker stats
   */
  getAllCircuitBreakerStats() {
    return this.circuitBreakerManager.getAllStats();
  }

  /**
   * Reset circuit breaker for a service
   */
  resetCircuitBreaker(serviceName: string): void {
    this.circuitBreakerManager.reset(serviceName);
  }
}

// Singleton instance
let meshClientInstance: MeshClient | null = null;

export function getMeshClient(): MeshClient {
  if (!meshClientInstance) {
    meshClientInstance = new MeshClient();
  }
  return meshClientInstance;
}

