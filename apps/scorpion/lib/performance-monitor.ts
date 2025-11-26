/**
 * Performance Monitoring
 * Tracks API response times, slow queries, and performance baselines
 */

import { getMetricsCollector } from './metrics';

export interface PerformanceBaseline {
  endpoint: string;
  p50: number; // milliseconds
  p95: number; // milliseconds
  p99: number; // milliseconds
  max: number; // milliseconds
}

// Performance baselines (in milliseconds)
const PERFORMANCE_BASELINES: Record<string, PerformanceBaseline> = {
  '/api/health': {
    endpoint: '/api/health',
    p50: 100,
    p95: 200,
    p99: 500,
    max: 1000,
  },
  '/api/healthz': {
    endpoint: '/api/healthz',
    p50: 10,
    p95: 50,
    p99: 100,
    max: 200,
  },
  '/api/chat/stream': {
    endpoint: '/api/chat/stream',
    p50: 500,
    p95: 2000,
    p99: 5000,
    max: 10000,
  },
  '/api/agents': {
    endpoint: '/api/agents',
    p50: 200,
    p95: 500,
    p99: 1000,
    max: 2000,
  },
  '/api/logs': {
    endpoint: '/api/logs',
    p50: 300,
    p95: 800,
    p99: 1500,
    max: 3000,
  },
  default: {
    endpoint: 'default',
    p50: 200,
    p95: 1000,
    p99: 2000,
    max: 5000,
  },
};

/**
 * Track API request performance
 */
export function trackRequestPerformance(
  endpoint: string,
  durationMs: number,
  statusCode: number
): void {
  const metrics = getMetricsCollector();
  
  // Record request duration
  metrics.recordHistogram('scorpion_api_request_duration_seconds', durationMs / 1000, {
    endpoint,
    status: statusCode.toString(),
  });

  // Record request count
  metrics.increment('scorpion_api_requests_total', {
    endpoint,
    status: statusCode.toString(),
  });

  // Check against baselines
  const baseline = PERFORMANCE_BASELINES[endpoint] || PERFORMANCE_BASELINES.default;
  
  if (durationMs > baseline.p99) {
    metrics.increment('scorpion_api_slow_requests_total', {
      endpoint,
      threshold: 'p99',
    });
    console.warn(`⚠️  Slow request detected: ${endpoint} took ${durationMs}ms (p99: ${baseline.p99}ms)`);
  } else if (durationMs > baseline.p95) {
    metrics.increment('scorpion_api_slow_requests_total', {
      endpoint,
      threshold: 'p95',
    });
    console.info(`ℹ️  Request above p95: ${endpoint} took ${durationMs}ms (p95: ${baseline.p95}ms)`);
  }
}

/**
 * Track database query performance
 */
export function trackQueryPerformance(
  query: string,
  durationMs: number,
  success: boolean
): void {
  const metrics = getMetricsCollector();
  
  // Record query duration
  metrics.recordHistogram('scorpion_db_query_duration_seconds', durationMs / 1000, {
    success: success.toString(),
  });

  // Record query count
  metrics.increment('scorpion_db_queries_total', {
    success: success.toString(),
  });

  // Alert on slow queries (>100ms)
  if (durationMs > 100) {
    metrics.increment('scorpion_db_slow_queries_total');
    console.warn(`⚠️  Slow query detected: ${query.substring(0, 100)}... took ${durationMs}ms`);
  }
}

/**
 * Track external API call performance
 */
export function trackExternalAPIPerformance(
  service: string,
  endpoint: string,
  durationMs: number,
  success: boolean
): void {
  const metrics = getMetricsCollector();
  
  // Record external API call duration
  metrics.recordHistogram('scorpion_external_api_duration_seconds', durationMs / 1000, {
    service,
    endpoint,
    success: success.toString(),
  });

  // Record external API call count
  metrics.increment('scorpion_external_api_calls_total', {
    service,
    endpoint,
    success: success.toString(),
  });

  // Alert on slow external calls (>2s)
  if (durationMs > 2000) {
    metrics.increment('scorpion_external_api_slow_calls_total', { service });
    console.warn(`⚠️  Slow external API call: ${service}${endpoint} took ${durationMs}ms`);
  }
}

/**
 * Get performance baseline for an endpoint
 */
export function getPerformanceBaseline(endpoint: string): PerformanceBaseline {
  return PERFORMANCE_BASELINES[endpoint] || PERFORMANCE_BASELINES.default;
}

/**
 * Check if a request duration violates performance baseline
 */
export function violatesBaseline(endpoint: string, durationMs: number): {
  violated: boolean;
  threshold: 'p50' | 'p95' | 'p99' | 'max' | null;
  baseline: PerformanceBaseline;
} {
  const baseline = getPerformanceBaseline(endpoint);
  
  if (durationMs > baseline.max) {
    return { violated: true, threshold: 'max', baseline };
  } else if (durationMs > baseline.p99) {
    return { violated: true, threshold: 'p99', baseline };
  } else if (durationMs > baseline.p95) {
    return { violated: true, threshold: 'p95', baseline };
  } else if (durationMs > baseline.p50) {
    return { violated: true, threshold: 'p50', baseline };
  }
  
  return { violated: false, threshold: null, baseline };
}

