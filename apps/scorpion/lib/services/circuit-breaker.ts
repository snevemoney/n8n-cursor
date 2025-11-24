/**
 * Circuit Breaker
 * Implements circuit breaker pattern for fault tolerance
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time in ms before attempting half-open
  resetTimeout: number; // Time in ms before resetting failure count
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private nextAttemptTime?: number;

  constructor(
    private serviceId: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute
      resetTimeout: 300000, // 5 minutes
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition
    this.updateState();

    if (this.state === 'open') {
      throw new Error(`Circuit breaker is OPEN for service ${this.serviceId}`);
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
   * Check if request should be allowed
   */
  canExecute(): boolean {
    this.updateState();
    return this.state !== 'open';
  }

  /**
   * Get current stats
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttemptTime = undefined;
  }

  /**
   * Update circuit state based on current conditions
   */
  private updateState(): void {
    const now = Date.now();

    // Transition from open to half-open after timeout
    if (this.state === 'open' && this.nextAttemptTime && now >= this.nextAttemptTime) {
      this.state = 'half-open';
      this.successes = 0;
      this.nextAttemptTime = undefined;
    }

    // Reset failure count after reset timeout
    if (this.lastFailureTime && now - this.lastFailureTime > this.config.resetTimeout) {
      this.failures = 0;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();

    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        // Close circuit after enough successes
        this.state = 'closed';
        this.failures = 0;
        this.successes = 0;
      }
    } else if (this.state === 'closed') {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failures++;

    if (this.state === 'half-open') {
      // Any failure in half-open opens the circuit
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.timeout;
      this.successes = 0;
    } else if (this.state === 'closed' && this.failures >= this.config.failureThreshold) {
      // Open circuit after threshold failures
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.config.timeout;
    }
  }
}

/**
 * Circuit Breaker Manager
 * Manages circuit breakers for multiple services
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(serviceId: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(serviceId)) {
      this.breakers.set(serviceId, new CircuitBreaker(serviceId, config));
    }
    return this.breakers.get(serviceId)!;
  }

  /**
   * Get all circuit breaker stats
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [serviceId, breaker] of this.breakers.entries()) {
      stats[serviceId] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset circuit breaker for a service
   */
  reset(serviceId: string): void {
    const breaker = this.breakers.get(serviceId);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Singleton instance
let circuitBreakerManagerInstance: CircuitBreakerManager | null = null;

export function getCircuitBreakerManager(): CircuitBreakerManager {
  if (!circuitBreakerManagerInstance) {
    circuitBreakerManagerInstance = new CircuitBreakerManager();
  }
  return circuitBreakerManagerInstance;
}

