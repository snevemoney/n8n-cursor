/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests to failing services
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes in half-open before closing
  timeout: number; // Time in ms before attempting half-open
  resetTimeout: number; // Time in ms before resetting failure count
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  resetTimeout: 300000 // 5 minutes
};

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private lastSuccessTime: number = 0;
  private openedAt: number = 0;
  private options: CircuitBreakerOptions;

  constructor(
    private name: string,
    options: Partial<CircuitBreakerOptions> = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should attempt to close the circuit
    if (this.state === 'open') {
      const timeSinceOpen = Date.now() - this.openedAt;
      if (timeSinceOpen >= this.options.timeout) {
        this.state = 'half-open';
        this.successCount = 0;
        console.log(`🔓 Circuit breaker ${this.name} moved to half-open`);
      } else {
        throw new CircuitBreakerError(
          `Circuit breaker ${this.name} is OPEN. Service unavailable.`,
          this.state
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'closed';
        this.successCount = 0;
        console.log(`✅ Circuit breaker ${this.name} closed after successful recovery`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    // Update metrics (lazy import to avoid circular dependency)
    try {
      const { getMetricsCollector } = require('./metrics');
      const metrics = getMetricsCollector();
      metrics.incrementCounter('scorpion_circuit_breaker_failures_total', { service: this.name });
    } catch (error) {
      // Metrics not available, continue anyway
    }

    if (this.state === 'half-open') {
      // Failed in half-open, immediately open again
      this.state = 'open';
      this.openedAt = Date.now();
      this.successCount = 0;
      console.log(`❌ Circuit breaker ${this.name} reopened after failure in half-open`);
    } else if (this.state === 'closed' && this.failureCount >= this.options.failureThreshold) {
      // Too many failures, open the circuit
      this.state = 'open';
      this.openedAt = Date.now();
      console.log(`⚠️ Circuit breaker ${this.name} opened after ${this.failureCount} failures`);
    }

    // Reset failure count after reset timeout
    setTimeout(() => {
      if (this.failureCount > 0 && Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.failureCount = Math.max(0, this.failureCount - 1);
      }
    }, this.options.resetTimeout);
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      openedAt: this.openedAt,
      timeSinceOpen: this.state === 'open' ? Date.now() - this.openedAt : 0
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.successCount = 0;
    this.openedAt = 0;
    console.log(`🔄 Circuit breaker ${this.name} manually reset`);
  }
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public state: CircuitState
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// Circuit breaker registry
const circuitBreakers: Map<string, CircuitBreaker> = new Map();

/**
 * Get or create a circuit breaker for a service
 */
export function getCircuitBreaker(
  serviceName: string,
  options?: Partial<CircuitBreakerOptions>
): CircuitBreaker {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, options));
  }
  return circuitBreakers.get(serviceName)!;
}

