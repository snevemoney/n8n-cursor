/**
 * Retry Logic
 * Implements retry strategies for resilient service calls
 */

export type RetryStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  strategy: RetryStrategy;
  backoffMultiplier?: number; // For exponential
  jitter?: boolean; // Add random jitter to delays
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

export class RetryHandler {
  /**
   * Execute a function with retry logic
   */
  static async execute<T>(
    fn: () => Promise<T>,
    config: RetryConfig = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      strategy: 'exponential',
      backoffMultiplier: 2,
      jitter: true,
    }
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: Error | undefined;
    let attempts = 0;

    for (attempts = 1; attempts <= config.maxAttempts; attempts++) {
      try {
        const result = await fn();
        return {
          success: true,
          result,
          attempts,
          totalDuration: Date.now() - startTime,
        };
      } catch (error: any) {
        lastError = error;

        // Don't retry on last attempt
        if (attempts >= config.maxAttempts) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempts, config);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalDuration: Date.now() - startTime,
    };
  }

  /**
   * Calculate delay based on strategy
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.strategy) {
      case 'exponential':
        delay = config.initialDelay * Math.pow(config.backoffMultiplier || 2, attempt - 1);
        break;
      case 'linear':
        delay = config.initialDelay * attempt;
        break;
      case 'fixed':
      default:
        delay = config.initialDelay;
        break;
    }

    // Cap at max delay
    delay = Math.min(delay, config.maxDelay);

    // Add jitter if enabled
    if (config.jitter) {
      const jitterAmount = delay * 0.1; // 10% jitter
      delay = delay + (Math.random() * 2 - 1) * jitterAmount;
    }

    return Math.max(0, delay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
      return true;
    }

    // Timeout errors are retryable
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return true;
    }

    // 5xx server errors are retryable
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // 429 (rate limit) is retryable
    if (error.status === 429) {
      return true;
    }

    // 4xx client errors are generally not retryable
    if (error.status >= 400 && error.status < 500) {
      return false;
    }

    // Default: retryable
    return true;
  }
}

