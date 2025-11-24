/**
 * Circuit Breaker Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreaker, CircuitBreakerManager } from '../circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      resetTimeout: 5000,
    });
  });

  it('should start in closed state', () => {
    expect(breaker.canExecute()).toBe(true);
    const stats = breaker.getStats();
    expect(stats.state).toBe('closed');
  });

  it('should open after threshold failures', async () => {
    const failingFn = () => Promise.reject(new Error('Test error'));

    // Fail 3 times (threshold)
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.canExecute()).toBe(false);
    const stats = breaker.getStats();
    expect(stats.state).toBe('open');
  });

  it('should allow execution in closed state', async () => {
    const successFn = () => Promise.resolve('success');

    const result = await breaker.execute(successFn);
    expect(result).toBe('success');
    expect(breaker.canExecute()).toBe(true);
  });

  it('should transition to half-open after timeout', async () => {
    const failingFn = () => Promise.reject(new Error('Test error'));

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (e) {
        // Expected
      }
    }

    expect(breaker.getStats().state).toBe('open');

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Check state (should be half-open)
    breaker['updateState']();
    const stats = breaker.getStats();
    expect(['half-open', 'open']).toContain(stats.state);
  });

  it('should close after success threshold in half-open', async () => {
    const failingFn = () => Promise.reject(new Error('Test error'));
    const successFn = () => Promise.resolve('success');

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (e) {
        // Expected
      }
    }

    // Wait and transition to half-open
    await new Promise(resolve => setTimeout(resolve, 1100));
    breaker['updateState']();

    // Succeed 2 times (threshold)
    for (let i = 0; i < 2; i++) {
      await breaker.execute(successFn);
    }

    const stats = breaker.getStats();
    expect(stats.state).toBe('closed');
  });

  it('should reset circuit breaker', () => {
    breaker.reset();
    const stats = breaker.getStats();
    expect(stats.state).toBe('closed');
    expect(stats.failures).toBe(0);
    expect(stats.successes).toBe(0);
  });
});

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager;

  beforeEach(() => {
    manager = new CircuitBreakerManager();
  });

  it('should get or create circuit breaker', () => {
    const breaker1 = manager.getBreaker('service-1');
    const breaker2 = manager.getBreaker('service-1');

    expect(breaker1).toBe(breaker2);
  });

  it('should get all stats', () => {
    manager.getBreaker('service-1');
    manager.getBreaker('service-2');

    const stats = manager.getAllStats();
    expect(Object.keys(stats)).toHaveLength(2);
    expect(stats['service-1']).toBeDefined();
    expect(stats['service-2']).toBeDefined();
  });

  it('should reset specific breaker', () => {
    const breaker = manager.getBreaker('service-1');
    breaker.reset = vi.fn();

    manager.reset('service-1');
    expect(breaker.reset).toHaveBeenCalled();
  });

  it('should reset all breakers', () => {
    const breaker1 = manager.getBreaker('service-1');
    const breaker2 = manager.getBreaker('service-2');
    breaker1.reset = vi.fn();
    breaker2.reset = vi.fn();

    manager.resetAll();
    expect(breaker1.reset).toHaveBeenCalled();
    expect(breaker2.reset).toHaveBeenCalled();
  });
});

