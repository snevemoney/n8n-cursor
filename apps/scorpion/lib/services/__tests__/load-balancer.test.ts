/**
 * Load Balancer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getLoadBalancer } from '../load-balancer';
import type { ServiceInstance } from '../types';

describe('LoadBalancer', () => {
  const loadBalancer = getLoadBalancer();

  const createMockInstance = (id: string, port: number): ServiceInstance => ({
    id,
    serviceName: 'test-api',
    version: '1.0.0',
    host: 'localhost',
    port,
    protocol: 'http',
    status: 'healthy',
    registeredAt: new Date().toISOString(),
    lastHeartbeat: new Date().toISOString(),
  });

  beforeEach(() => {
    loadBalancer.resetConnections();
  });

  it('should select instance using round-robin', () => {
    const instances = [
      createMockInstance('1', 3000),
      createMockInstance('2', 3001),
      createMockInstance('3', 3002),
    ];

    const selected1 = loadBalancer.selectInstance(instances, 'round-robin');
    const selected2 = loadBalancer.selectInstance(instances, 'round-robin');
    const selected3 = loadBalancer.selectInstance(instances, 'round-robin');
    const selected4 = loadBalancer.selectInstance(instances, 'round-robin');

    expect(selected1).toBeDefined();
    expect(selected2).toBeDefined();
    expect(selected3).toBeDefined();
    expect(selected4).toBeDefined();
    
    // Round-robin should cycle through instances
    expect(selected1?.port).toBe(3000);
    expect(selected2?.port).toBe(3001);
    expect(selected3?.port).toBe(3002);
    expect(selected4?.port).toBe(3000); // Back to first
  });

  it('should select instance using random strategy', () => {
    const instances = [
      createMockInstance('1', 3000),
      createMockInstance('2', 3001),
      createMockInstance('3', 3002),
    ];

    const selected = loadBalancer.selectInstance(instances, 'random');
    expect(selected).toBeDefined();
    expect(instances).toContain(selected);
  });

  it('should select instance using least-connections', () => {
    const instances = [
      createMockInstance('1', 3000),
      createMockInstance('2', 3001),
    ];

    // Increment connections for first instance
    loadBalancer.incrementConnections('1');
    loadBalancer.incrementConnections('1');

    const selected = loadBalancer.selectInstance(instances, 'least-connections');
    expect(selected?.id).toBe('2'); // Should select instance with fewer connections
  });

  it('should select instance using weighted strategy', () => {
    const instances = [
      {
        ...createMockInstance('1', 3000),
        metadata: { weight: '2.0' },
      },
      {
        ...createMockInstance('2', 3001),
        metadata: { weight: '1.0' },
      },
    ];

    const selected = loadBalancer.selectInstance(instances, 'weighted');
    expect(selected).toBeDefined();
    expect(instances).toContain(selected);
  });

  it('should prefer healthy instances', () => {
    const instances = [
      {
        ...createMockInstance('1', 3000),
        status: 'healthy' as const,
      },
      {
        ...createMockInstance('2', 3001),
        status: 'unhealthy' as const,
      },
    ];

    const selected = loadBalancer.selectInstance(instances, 'round-robin');
    expect(selected?.status).toBe('healthy');
  });

  it('should fallback to unhealthy if no healthy instances', () => {
    const instances = [
      {
        ...createMockInstance('1', 3000),
        status: 'unhealthy' as const,
      },
    ];

    const selected = loadBalancer.selectInstance(instances, 'round-robin');
    expect(selected).toBeDefined();
    expect(selected?.status).toBe('unhealthy');
  });

  it('should return null for empty instances', () => {
    const selected = loadBalancer.selectInstance([], 'round-robin');
    expect(selected).toBeNull();
  });

  it('should track connection counts', () => {
    loadBalancer.incrementConnections('instance-1');
    loadBalancer.incrementConnections('instance-1');
    loadBalancer.incrementConnections('instance-2');

    loadBalancer.decrementConnections('instance-1');

    // After decrement, instance-1 should have 1 connection, instance-2 should have 1
    // So least-connections should pick either (both have same count)
    const instances = [
      createMockInstance('instance-1', 3000),
      createMockInstance('instance-2', 3001),
    ];

    const selected = loadBalancer.selectInstance(instances, 'least-connections');
    expect(selected).toBeDefined();
  });
});

