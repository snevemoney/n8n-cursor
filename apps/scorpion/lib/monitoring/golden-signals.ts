/**
 * Four Golden Signals Tracker
 * Tracks Latency, Traffic, Errors, and Saturation
 */

import { getMetricsCollector } from './metrics';
import type { GoldenSignals } from './types';
import os from 'os';

export class GoldenSignalsTracker {
  private metrics = getMetricsCollector();
  private requestStartTimes: Map<string, number> = new Map();

  /**
   * Track request start
   */
  startRequest(requestId: string, endpoint: string, method: string): void {
    this.requestStartTimes.set(requestId, Date.now());
    
    // Increment traffic counter
    this.metrics.increment('http_requests_total', {
      method,
      endpoint,
      status: 'unknown',
    });
  }

  /**
   * Track request completion
   */
  recordRequest(
    requestId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    durationMs: number
  ): void {
    this.requestStartTimes.delete(requestId);
    
    // Record latency
    this.metrics.observe('http_request_duration_seconds', durationMs / 1000, {
      method,
      endpoint,
      status: statusCode.toString(),
    });
    
    // Update traffic counter with final status
    this.metrics.increment('http_requests_total', {
      method,
      endpoint,
      status: statusCode.toString(),
    });
    
    // Track errors (4xx, 5xx)
    if (statusCode >= 400) {
      this.metrics.increment('http_errors_total', {
        method,
        endpoint,
        status: statusCode.toString(),
      });
    }
  }

  /**
   * Track system saturation
   */
  recordSaturation(): void {
    // CPU usage
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
    }, 0);
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const cpuUsage = 100 - (idle / total) * 100;
    
    this.metrics.set('system_cpu_usage_percent', cpuUsage);
    
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;
    
    this.metrics.set('system_memory_usage_percent', memoryUsage);
    this.metrics.set('system_memory_total_bytes', totalMem);
    this.metrics.set('system_memory_free_bytes', freeMem);
    this.metrics.set('system_memory_used_bytes', usedMem);
    
    // Active connections (approximate from request tracking)
    const activeConnections = this.requestStartTimes.size;
    this.metrics.set('system_active_connections', activeConnections);
  }

  /**
   * Get current golden signals
   */
  async getGoldenSignals(timeWindowMs: number = 60000): Promise<GoldenSignals> {
    const metrics = this.metrics.getMetrics();
    const now = Date.now();
    
    // Filter metrics within time window
    const recentMetrics = metrics.filter(m => {
      if (!m.timestamp) return false;
      return (now - m.timestamp) <= timeWindowMs;
    });
    
    // Extract latency metrics
    const latencyMetrics = recentMetrics.filter(m => m.name.startsWith('http_request_duration_seconds_'));
    const latencyValues = latencyMetrics.map(m => m.value);
    
    const latency = {
      p50: this.percentile(latencyValues, 0.5) || 0,
      p95: this.percentile(latencyValues, 0.95) || 0,
      p99: this.percentile(latencyValues, 0.99) || 0,
      mean: latencyValues.length > 0 
        ? latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length 
        : 0,
    };
    
    // Extract traffic metrics
    const trafficMetrics = recentMetrics.filter(m => m.name === 'http_requests_total');
    const totalRequests = trafficMetrics.reduce((sum, m) => sum + m.value, 0);
    const requestsPerSecond = totalRequests / (timeWindowMs / 1000);
    
    // Extract error metrics
    const errorMetrics = recentMetrics.filter(m => m.name === 'http_errors_total');
    const errorCount = errorMetrics.reduce((sum, m) => sum + m.value, 0);
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    
    // Extract saturation metrics
    const cpuMetric = recentMetrics.find(m => m.name === 'system_cpu_usage_percent');
    const memoryMetric = recentMetrics.find(m => m.name === 'system_memory_usage_percent');
    const connectionsMetric = recentMetrics.find(m => m.name === 'system_active_connections');
    
    return {
      latency: {
        p50: latency.p50 * 1000, // Convert to milliseconds
        p95: latency.p95 * 1000,
        p99: latency.p99 * 1000,
        mean: latency.mean * 1000,
      },
      traffic: {
        requestsPerSecond,
        requestsTotal: totalRequests,
      },
      errors: {
        errorRate,
        errorCount,
        totalRequests,
      },
      saturation: {
        cpuUsage: cpuMetric?.value || 0,
        memoryUsage: memoryMetric?.value || 0,
        activeConnections: connectionsMetric?.value || 0,
      },
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
}

// Singleton instance
let goldenSignalsTrackerInstance: GoldenSignalsTracker | null = null;

export function getGoldenSignalsTracker(): GoldenSignalsTracker {
  if (!goldenSignalsTrackerInstance) {
    goldenSignalsTrackerInstance = new GoldenSignalsTracker();
    
    // Record saturation every 5 seconds
    setInterval(() => {
      goldenSignalsTrackerInstance?.recordSaturation();
    }, 5000);
  }
  
  return goldenSignalsTrackerInstance;
}

