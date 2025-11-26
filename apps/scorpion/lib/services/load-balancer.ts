/**
 * Load Balancer
 * Simple load balancing logic for service instances
 */

import type { ServiceInstance } from './types';

export type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'random' | 'weighted';

export class LoadBalancer {
  private roundRobinIndex: Map<string, number> = new Map();
  private connectionCounts: Map<string, number> = new Map();

  /**
   * Select a service instance using the specified strategy
   */
  selectInstance(
    instances: ServiceInstance[],
    strategy: LoadBalancingStrategy = 'round-robin'
  ): ServiceInstance | null {
    if (instances.length === 0) {
      return null;
    }

    // Filter to healthy instances only
    const healthyInstances = instances.filter(i => i.status === 'healthy');
    if (healthyInstances.length === 0) {
      // Fallback to any instance if no healthy ones
      return instances[0];
    }

    switch (strategy) {
      case 'round-robin':
        return this.roundRobin(healthyInstances);
      case 'least-connections':
        return this.leastConnections(healthyInstances);
      case 'random':
        return this.random(healthyInstances);
      case 'weighted':
        return this.weighted(healthyInstances);
      default:
        return healthyInstances[0];
    }
  }

  /**
   * Round-robin selection
   */
  private roundRobin(instances: ServiceInstance[]): ServiceInstance {
    const key = instances[0]?.serviceName || 'default';
    const currentIndex = this.roundRobinIndex.get(key) || 0;
    const selected = instances[currentIndex % instances.length];
    
    this.roundRobinIndex.set(key, (currentIndex + 1) % instances.length);
    return selected;
  }

  /**
   * Least connections selection
   */
  private leastConnections(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((least, current) => {
      const leastConnections = this.connectionCounts.get(least.id) || 0;
      const currentConnections = this.connectionCounts.get(current.id) || 0;
      return currentConnections < leastConnections ? current : least;
    });
  }

  /**
   * Random selection
   */
  private random(instances: ServiceInstance[]): ServiceInstance {
    return instances[Math.floor(Math.random() * instances.length)];
  }

  /**
   * Weighted selection (based on metadata weight or version)
   */
  private weighted(instances: ServiceInstance[]): ServiceInstance {
    // Simple weighted: prefer newer versions or instances with weight metadata
    const weights = instances.map(instance => {
      const weight = instance.metadata?.weight 
        ? parseFloat(instance.metadata.weight) 
        : 1.0;
      return { instance, weight };
    });

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const { instance, weight } of weights) {
      random -= weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[0];
  }

  /**
   * Increment connection count for an instance
   */
  incrementConnections(instanceId: string): void {
    const current = this.connectionCounts.get(instanceId) || 0;
    this.connectionCounts.set(instanceId, current + 1);
  }

  /**
   * Decrement connection count for an instance
   */
  decrementConnections(instanceId: string): void {
    const current = this.connectionCounts.get(instanceId) || 0;
    if (current > 0) {
      this.connectionCounts.set(instanceId, current - 1);
    }
  }

  /**
   * Reset connection counts
   */
  resetConnections(): void {
    this.connectionCounts.clear();
  }
}

// Singleton instance
let loadBalancerInstance: LoadBalancer | null = null;

export function getLoadBalancer(): LoadBalancer {
  if (!loadBalancerInstance) {
    loadBalancerInstance = new LoadBalancer();
  }
  return loadBalancerInstance;
}

