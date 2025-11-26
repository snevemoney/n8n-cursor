/**
 * Metrics Collector
 * Collects and stores metrics for Prometheus export
 */

import type { Metric, CounterMetric, GaugeMetric, HistogramMetric, MetricType } from './types';

export class MetricsCollector {
  private counters: Map<string, CounterMetric> = new Map();
  private gauges: Map<string, GaugeMetric> = new Map();
  private histograms: Map<string, HistogramMetric[]> = new Map();
  private summaries: Map<string, SummaryMetric[]> = new Map();

  /**
   * Increment a counter
   */
  increment(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.getKey(name, labels);
    const existing = this.counters.get(key);
    
    if (existing) {
      existing.value += value;
      existing.timestamp = Date.now();
    } else {
      this.counters.set(key, {
        name,
        type: 'counter',
        value,
        labels,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Set a gauge value
   */
  set(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, {
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Observe a histogram value
   */
  observe(name: string, value: number, labels?: Record<string, string>, buckets?: number[]): void {
    const key = this.getKey(name, labels);
    const existing = this.histograms.get(key) || [];
    
    existing.push({
      name,
      type: 'histogram',
      value,
      labels,
      buckets: buckets || [0.1, 0.5, 1, 2.5, 5, 10, 30, 60, 120],
      timestamp: Date.now(),
    });
    
    // Keep only last 1000 observations per histogram
    if (existing.length > 1000) {
      existing.shift();
    }
    
    this.histograms.set(key, existing);
  }

  /**
   * Get all metrics in Prometheus format
   */
  getPrometheusFormat(): string {
    const lines: string[] = [];
    
    // Counters
    for (const metric of this.counters.values()) {
      const labels = this.formatLabels(metric.labels);
      lines.push(`# TYPE ${metric.name} counter`);
      lines.push(`${metric.name}${labels} ${metric.value}`);
    }
    
    // Gauges
    for (const metric of this.gauges.values()) {
      const labels = this.formatLabels(metric.labels);
      lines.push(`# TYPE ${metric.name} gauge`);
      lines.push(`${metric.name}${labels} ${metric.value}`);
    }
    
    // Histograms (simplified - aggregate into buckets)
    for (const [key, observations] of this.histograms.entries()) {
      if (observations.length === 0) continue;
      
      const firstObs = observations[0];
      const labels = this.formatLabels(firstObs.labels);
      const buckets = firstObs.buckets || [0.1, 0.5, 1, 2.5, 5, 10, 30, 60, 120];
      
      lines.push(`# TYPE ${firstObs.name} histogram`);
      
      // Count observations per bucket
      const bucketCounts: Record<number, number> = {};
      let sum = 0;
      let count = 0;
      
      for (const obs of observations) {
        sum += obs.value;
        count++;
        
        for (const bucket of buckets) {
          if (obs.value <= bucket) {
            bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
          }
        }
      }
      
      // Output buckets
      for (const bucket of buckets) {
        const count = bucketCounts[bucket] || 0;
        lines.push(`${firstObs.name}_bucket{le="${bucket}"}${labels} ${count}`);
      }
      
      // Output sum and count
      lines.push(`${firstObs.name}_sum${labels} ${sum}`);
      lines.push(`${firstObs.name}_count${labels} ${count}`);
    }
    
    return lines.join('\n') + '\n';
  }

  /**
   * Get metrics as JSON
   */
  getMetrics(): Metric[] {
    const metrics: Metric[] = [];
    
    for (const metric of this.counters.values()) {
      metrics.push(metric);
    }
    
    for (const metric of this.gauges.values()) {
      metrics.push(metric);
    }
    
    // For histograms, return aggregated stats
    for (const [key, observations] of this.histograms.entries()) {
      if (observations.length === 0) continue;
      
      const values = observations.map(o => o.value).sort((a, b) => a - b);
      const p50 = values[Math.floor(values.length * 0.5)];
      const p95 = values[Math.floor(values.length * 0.95)];
      const p99 = values[Math.floor(values.length * 0.99)];
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      
      metrics.push({
        name: observations[0].name + '_p50',
        value: p50,
        labels: observations[0].labels,
        timestamp: Date.now(),
      });
      
      metrics.push({
        name: observations[0].name + '_p95',
        value: p95,
        labels: observations[0].labels,
        timestamp: Date.now(),
      });
      
      metrics.push({
        name: observations[0].name + '_p99',
        value: p99,
        labels: observations[0].labels,
        timestamp: Date.now(),
      });
      
      metrics.push({
        name: observations[0].name + '_mean',
        value: mean,
        labels: observations[0].labels,
        timestamp: Date.now(),
      });
    }
    
    return metrics;
  }

  /**
   * Clear old metrics (older than maxAge milliseconds)
   */
  clearOldMetrics(maxAge: number = 3600000): void {
    const now = Date.now();
    
    // Clear old counters
    for (const [key, metric] of this.counters.entries()) {
      if (metric.timestamp && (now - metric.timestamp) > maxAge) {
        this.counters.delete(key);
      }
    }
    
    // Clear old gauges
    for (const [key, metric] of this.gauges.entries()) {
      if (metric.timestamp && (now - metric.timestamp) > maxAge) {
        this.gauges.delete(key);
      }
    }
    
    // Clear old histogram observations
    for (const [key, observations] of this.histograms.entries()) {
      const filtered = observations.filter(obs => {
        if (!obs.timestamp) return true;
        return (now - obs.timestamp) <= maxAge;
      });
      
      if (filtered.length === 0) {
        this.histograms.delete(key);
      } else {
        this.histograms.set(key, filtered);
      }
    }
  }

  /**
   * Generate key for metric lookup
   */
  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    
    return `${name}{${labelStr}}`;
  }

  /**
   * Format labels for Prometheus
   */
  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }
    
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`)
      .join(',');
    
    return `{${labelStr}}`;
  }
}

// Singleton instance
let metricsCollectorInstance: MetricsCollector | null = null;

export function getMetricsCollector(): MetricsCollector {
  if (!metricsCollectorInstance) {
    metricsCollectorInstance = new MetricsCollector();
    
    // Clean up old metrics every hour
    setInterval(() => {
      metricsCollectorInstance?.clearOldMetrics(3600000); // 1 hour
    }, 3600000);
  }
  
  return metricsCollectorInstance;
}

