/**
 * Timeout utility for enforcing latency budgets
 */

export interface TimeoutConfig {
  planning?: number; // Default: 1500ms
  council?: number; // Default: 1000ms
  execution?: number; // Default: 800ms per tool
  summarizer?: number; // Default: 1500ms
}

const DEFAULT_TIMEOUTS: Required<TimeoutConfig> = {
  planning: 1500,
  council: 1000,
  execution: 800,
  summarizer: 1500,
};

/**
 * Wrap a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Execute planner phase with timeout
 */
export async function executeWithPlanningTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUTS.planning
): Promise<T> {
  return withTimeout(fn(), timeoutMs, `Planning phase timed out after ${timeoutMs}ms`);
}

/**
 * Execute council phase with timeout
 */
export async function executeWithCouncilTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUTS.council
): Promise<T> {
  return withTimeout(fn(), timeoutMs, `Council phase timed out after ${timeoutMs}ms`);
}

/**
 * Execute tool execution with timeout
 */
export async function executeWithExecutionTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUTS.execution
): Promise<T> {
  return withTimeout(fn(), timeoutMs, `Tool execution timed out after ${timeoutMs}ms`);
}

/**
 * Execute summarizer phase with timeout
 */
export async function executeWithSummarizerTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_TIMEOUTS.summarizer
): Promise<T> {
  return withTimeout(fn(), timeoutMs, `Summarizer phase timed out after ${timeoutMs}ms`);
}

/**
 * Get timeout config from environment or use defaults
 */
export function getTimeoutConfig(): Required<TimeoutConfig> {
  return {
    planning: parseInt(process.env.LATENCY_BUDGET_PLANNING || String(DEFAULT_TIMEOUTS.planning), 10),
    council: parseInt(process.env.LATENCY_BUDGET_COUNCIL || String(DEFAULT_TIMEOUTS.council), 10),
    execution: parseInt(process.env.LATENCY_BUDGET_EXECUTION || String(DEFAULT_TIMEOUTS.execution), 10),
    summarizer: parseInt(process.env.LATENCY_BUDGET_SUMMARIZER || String(DEFAULT_TIMEOUTS.summarizer), 10),
  };
}

