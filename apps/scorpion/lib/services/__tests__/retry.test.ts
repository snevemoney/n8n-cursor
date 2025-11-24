/**
 * Retry Handler Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryHandler } from '../retry';

describe('RetryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await RetryHandler.execute(fn, {
      maxAttempts: 3,
      initialDelay: 10,
      maxDelay: 100,
      strategy: 'fixed',
    });

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(result.attempts).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const result = await RetryHandler.execute(fn, {
      maxAttempts: 3,
      initialDelay: 10,
      maxDelay: 100,
      strategy: 'fixed',
    });

    expect(result.success).toBe(true);
    expect(result.result).toBe('success');
    expect(result.attempts).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should fail after max attempts', async () => {
    const error = new Error('Always fails');
    const fn = vi.fn().mockRejectedValue(error);

    const result = await RetryHandler.execute(fn, {
      maxAttempts: 3,
      initialDelay: 10,
      maxDelay: 100,
      strategy: 'fixed',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe(error);
    expect(result.attempts).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValue('success');

    const startTime = Date.now();
    const result = await RetryHandler.execute(fn, {
      maxAttempts: 3,
      initialDelay: 100,
      maxDelay: 1000,
      strategy: 'exponential',
      backoffMultiplier: 2,
    });
    const duration = Date.now() - startTime;

    expect(result.success).toBe(true);
    // Should have waited at least initialDelay
    expect(duration).toBeGreaterThanOrEqual(90); // Allow some margin
  });

  it('should identify retryable errors', () => {
    expect(RetryHandler.isRetryableError({ name: 'NetworkError' })).toBe(true);
    expect(RetryHandler.isRetryableError({ name: 'TimeoutError' })).toBe(true);
    expect(RetryHandler.isRetryableError({ status: 500 })).toBe(true);
    expect(RetryHandler.isRetryableError({ status: 429 })).toBe(true);
    expect(RetryHandler.isRetryableError({ status: 400 })).toBe(false);
    expect(RetryHandler.isRetryableError({ status: 404 })).toBe(false);
  });
});

