/**
 * Health Checker
 * Performs health checks on service instances
 */

import type { ServiceInstance, ServiceHealth, HealthCheck } from './types';
import { getServiceRegistry } from './registry';

export class HealthChecker {
  /**
   * Perform health check on a service instance
   */
  async checkHealth(instance: ServiceInstance): Promise<ServiceHealth> {
    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    // Check 1: Network connectivity
    const connectivityCheck = await this.checkConnectivity(instance);
    checks.push(connectivityCheck);

    // Check 2: Health endpoint (if available)
    if (instance.metadata?.healthEndpoint) {
      const endpointCheck = await this.checkHealthEndpoint(instance);
      checks.push(endpointCheck);
    }

    // Check 3: Response time
    const responseTimeCheck = await this.checkResponseTime(instance);
    checks.push(responseTimeCheck);

    // Determine overall status
    const hasFailures = checks.some(c => c.status === 'fail');
    const hasWarnings = checks.some(c => c.status === 'warn');
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (hasFailures) {
      status = 'unhealthy';
    } else if (hasWarnings) {
      status = 'degraded';
    }

    const health: ServiceHealth = {
      serviceId: instance.id,
      status,
      checks,
      timestamp: new Date().toISOString(),
    };

    // Record health in registry
    const registry = getServiceRegistry();
    await registry.recordHealth(health);
    await registry.heartbeat(instance.id, status);

    return health;
  }

  /**
   * Check network connectivity
   */
  private async checkConnectivity(instance: ServiceInstance): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const url = `${instance.protocol}://${instance.host}:${instance.port}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Scorpion-HealthChecker/1.0',
        },
      });

      clearTimeout(timeout);
      const duration = Date.now() - startTime;

      if (response.ok || response.status < 500) {
        return {
          name: 'connectivity',
          status: 'pass',
          message: `Service reachable (${response.status})`,
          duration,
        };
      } else {
        return {
          name: 'connectivity',
          status: 'fail',
          message: `Service returned error: ${response.status}`,
          duration,
        };
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name: 'connectivity',
        status: 'fail',
        message: error.message || 'Connection failed',
        duration,
      };
    }
  }

  /**
   * Check health endpoint
   */
  private async checkHealthEndpoint(instance: ServiceInstance): Promise<HealthCheck> {
    const startTime = Date.now();
    const healthEndpoint = instance.metadata?.healthEndpoint || '/health';
    
    try {
      const url = `${instance.protocol}://${instance.host}:${instance.port}${healthEndpoint}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Scorpion-HealthChecker/1.0',
        },
      });

      clearTimeout(timeout);
      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          name: 'health_endpoint',
          status: 'pass',
          message: 'Health endpoint responding',
          duration,
        };
      } else {
        return {
          name: 'health_endpoint',
          status: 'warn',
          message: `Health endpoint returned ${response.status}`,
          duration,
        };
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name: 'health_endpoint',
        status: 'warn',
        message: `Health endpoint check failed: ${error.message}`,
        duration,
      };
    }
  }

  /**
   * Check response time
   */
  private async checkResponseTime(instance: ServiceInstance): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const url = `${instance.protocol}://${instance.host}:${instance.port}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Scorpion-HealthChecker/1.0',
        },
      });

      clearTimeout(timeout);
      const duration = Date.now() - startTime;

      // Warn if response time is too high
      if (duration > 2000) {
        return {
          name: 'response_time',
          status: 'warn',
          message: `Slow response: ${duration}ms`,
          duration,
        };
      }

      return {
        name: 'response_time',
        status: 'pass',
        message: `Response time: ${duration}ms`,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name: 'response_time',
        status: 'fail',
        message: `Response time check failed: ${error.message}`,
        duration,
      };
    }
  }

  /**
   * Check all registered services
   */
  async checkAllServices(): Promise<ServiceHealth[]> {
    const registry = getServiceRegistry();
    const services = await registry.listServices();
    
    const healthChecks = await Promise.allSettled(
      services.map(service => this.checkHealth(service))
    );

    return healthChecks
      .filter((result): result is PromiseFulfilledResult<ServiceHealth> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }
}

// Singleton instance
let healthCheckerInstance: HealthChecker | null = null;

export function getHealthChecker(): HealthChecker {
  if (!healthCheckerInstance) {
    healthCheckerInstance = new HealthChecker();
  }
  return healthCheckerInstance;
}

