/**
 * Metrics utility for tracking prompt performance
 * Logs latency, token counts, success/failure rates, and validation errors
 */

export interface PromptMetrics {
  prompt: string;
  latency_ms: number;
  tokens?: number;
  ok: boolean;
  error?: string;
  validation_errors?: string[];
  retry_count?: number;
}

// In-memory metrics store (can be replaced with external observability system)
const metricsStore: PromptMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 metrics

/**
 * Estimate token count from text (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Log prompt metrics
 */
export function logPromptMetrics(metrics: PromptMetrics): void {
  // Add to store
  metricsStore.push(metrics);
  
  // Keep only last MAX_METRICS
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.shift();
  }
  
  // Log to console (can be replaced with external observability)
  const status = metrics.ok ? '✓' : '✗';
  const tokenInfo = metrics.tokens ? ` (${metrics.tokens} tokens)` : '';
  const retryInfo = metrics.retry_count ? ` [retry ${metrics.retry_count}]` : '';
  
  console.log(
    `[Metrics] ${status} ${metrics.prompt}: ${metrics.latency_ms}ms${tokenInfo}${retryInfo}`
  );
  
  if (!metrics.ok && metrics.error) {
    console.error(`[Metrics] Error: ${metrics.error}`);
  }
  
  if (metrics.validation_errors && metrics.validation_errors.length > 0) {
    console.warn(`[Metrics] Validation errors: ${metrics.validation_errors.join(', ')}`);
  }
}

/**
 * Get metrics for a specific prompt
 */
export function getPromptMetrics(promptName: string): PromptMetrics[] {
  return metricsStore.filter(m => m.prompt === promptName);
}

/**
 * Get all metrics
 */
export function getAllMetrics(): PromptMetrics[] {
  return [...metricsStore];
}

/**
 * Get metrics summary statistics
 */
export function getMetricsSummary(): {
  total: number;
  byPrompt: Record<string, {
    count: number;
    success: number;
    failure: number;
    avgLatency: number;
    avgTokens?: number;
  }>;
} {
  const summary: {
    total: number;
    byPrompt: Record<string, {
      count: number;
      success: number;
      failure: number;
      avgLatency: number;
      avgTokens?: number;
    }>;
  } = {
    total: metricsStore.length,
    byPrompt: {},
  };
  
  for (const metric of metricsStore) {
    if (!summary.byPrompt[metric.prompt]) {
      summary.byPrompt[metric.prompt] = {
        count: 0,
        success: 0,
        failure: 0,
        avgLatency: 0,
        avgTokens: undefined,
      };
    }
    
    const promptStats = summary.byPrompt[metric.prompt];
    promptStats.count++;
    
    if (metric.ok) {
      promptStats.success++;
    } else {
      promptStats.failure++;
    }
    
    // Update average latency
    promptStats.avgLatency = 
      (promptStats.avgLatency * (promptStats.count - 1) + metric.latency_ms) / promptStats.count;
    
    // Update average tokens if available
    if (metric.tokens !== undefined) {
      if (promptStats.avgTokens === undefined) {
        promptStats.avgTokens = 0;
      }
      promptStats.avgTokens = 
        (promptStats.avgTokens * (promptStats.count - 1) + metric.tokens) / promptStats.count;
    }
  }
  
  return summary;
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics(): void {
  metricsStore.length = 0;
}

