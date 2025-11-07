/**
 * Prometheus Metrics Collection System
 * Collects and exposes metrics for all Scorpion systems
 */

export interface MetricValue {
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

export interface CounterMetric {
  type: 'counter';
  name: string;
  help: string;
  values: Map<string, MetricValue>; // key is label combination
}

export interface GaugeMetric {
  type: 'gauge';
  name: string;
  help: string;
  values: Map<string, MetricValue>;
}

export interface HistogramMetric {
  type: 'histogram';
  name: string;
  help: string;
  buckets: number[];
  values: Map<string, {
    count: number;
    sum: number;
    buckets: Map<number, number>; // bucket -> count
    labels?: Record<string, string>;
  }>;
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private startTime: number = Date.now();

  /**
   * Register a counter metric
   */
  registerCounter(name: string, help: string): void {
    this.metrics.set(name, {
      type: 'counter',
      name,
      help,
      values: new Map()
    });
  }

  /**
   * Register a gauge metric
   */
  registerGauge(name: string, help: string): void {
    this.metrics.set(name, {
      type: 'gauge',
      name,
      help,
      values: new Map()
    });
  }

  /**
   * Register a histogram metric
   */
  registerHistogram(name: string, help: string, buckets: number[] = [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000]): void {
    this.metrics.set(name, {
      type: 'histogram',
      name,
      help,
      buckets,
      values: new Map()
    });
  }

  /**
   * Increment a counter
   */
  incrementCounter(name: string, labels?: Record<string, string>, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'counter') {
      console.warn(`Counter ${name} not registered`);
      return;
    }

    const key = this.getLabelKey(labels);
    const existing = metric.values.get(key) || { value: 0, labels };
    metric.values.set(key, {
      ...existing,
      value: existing.value + value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Set a gauge value
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'gauge') {
      console.warn(`Gauge ${name} not registered`);
      return;
    }

    const key = this.getLabelKey(labels);
    metric.values.set(key, {
      value,
      labels,
      timestamp: Date.now()
    });
  }

  /**
   * Observe a histogram value
   */
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== 'histogram') {
      console.warn(`Histogram ${name} not registered`);
      return;
    }

    const key = this.getLabelKey(labels);
    const existing = metric.values.get(key) || {
      count: 0,
      sum: 0,
      buckets: new Map(),
      labels
    };

    existing.count++;
    existing.sum += value;

    // Update buckets
    for (const bucket of metric.buckets) {
      if (value <= bucket) {
        existing.buckets.set(bucket, (existing.buckets.get(bucket) || 0) + 1);
      }
    }
    // +Inf bucket
    existing.buckets.set(Infinity, existing.count);

    metric.values.set(key, existing);
  }

  /**
   * Get label key for metric storage
   */
  private getLabelKey(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    // Add process start time
    lines.push(`# HELP scorpion_process_start_time_seconds Start time of the process since unix epoch in seconds.`);
    lines.push(`# TYPE scorpion_process_start_time_seconds gauge`);
    lines.push(`scorpion_process_start_time_seconds ${this.startTime / 1000}`);

    // Export each metric
    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      if (metric.type === 'counter' || metric.type === 'gauge') {
        for (const [key, metricValue] of metric.values.entries()) {
          const labelStr = key ? `{${key}}` : '';
          lines.push(`${metric.name}${labelStr} ${metricValue.value}`);
        }
      } else if (metric.type === 'histogram') {
        for (const [key, data] of metric.values.entries()) {
          const labelStr = key ? `{${key}}` : '';
          
          // Export bucket counts
          for (const bucket of metric.buckets) {
            const count = data.buckets.get(bucket) || 0;
            const bucketLabel = bucket === Infinity ? '+Inf' : bucket.toString();
            lines.push(`${metric.name}_bucket{le="${bucketLabel}"${labelStr ? ',' + key : ''}} ${count}`);
          }
          
          // Export count and sum
          lines.push(`${metric.name}_count${labelStr} ${data.count}`);
          lines.push(`${metric.name}_sum${labelStr} ${data.sum}`);
        }
      }
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Initialize default metrics
   */
  initializeDefaultMetrics(): void {
    // System health metrics
    this.registerGauge('scorpion_system_health', 'Overall system health (1=healthy, 0.5=degraded, 0=unhealthy)');
    this.registerGauge('scorpion_rag_knowledge_items', 'Number of knowledge items in RAG store');
    this.registerGauge('scorpion_ontology_entities', 'Number of entities in ontology store');
    this.registerGauge('scorpion_workflows_total', 'Total number of workflows');
    this.registerGauge('scorpion_workflows_synced', 'Number of synced workflows');

    // API metrics
    this.registerCounter('scorpion_api_requests_total', 'Total number of API requests');
    this.registerHistogram('scorpion_api_request_duration_seconds', 'API request duration in seconds', [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10]);
    
    // Training data metrics
    this.registerGauge('scorpion_training_data_total', 'Total number of training examples');
    this.registerGauge('scorpion_training_data_high_quality', 'Number of high-quality training examples');
    this.registerGauge('scorpion_training_data_average_quality', 'Average quality score of training data');

    // Mistake learning metrics
    this.registerGauge('scorpion_mistakes_total', 'Total number of recorded mistakes');
    this.registerGauge('scorpion_mistakes_learned', 'Number of mistakes that have been learned');
    this.registerGauge('scorpion_mistakes_unlearned', 'Number of mistakes not yet learned');

    // Workflow sync metrics
    this.registerCounter('scorpion_workflow_sync_operations_total', 'Total workflow sync operations');
    this.registerHistogram('scorpion_workflow_sync_duration_seconds', 'Workflow sync duration in seconds');

    // Error metrics
    this.registerCounter('scorpion_errors_total', 'Total number of errors');
    
    // Backup metrics
    this.registerCounter('scorpion_backups_total', 'Total number of backups performed');
    this.registerGauge('scorpion_backup_size_bytes', 'Size of last backup in bytes');
    this.registerGauge('scorpion_backup_age_seconds', 'Age of last backup in seconds');

    // Circuit breaker metrics
    this.registerGauge('scorpion_circuit_breaker_state', 'Circuit breaker state (0=closed, 1=open, 0.5=half-open)');
    this.registerCounter('scorpion_circuit_breaker_failures_total', 'Total circuit breaker failures');
  }
}

// Singleton instance
let metricsCollector: MetricsCollector | null = null;

export function getMetricsCollector(): MetricsCollector {
  if (!metricsCollector) {
    metricsCollector = new MetricsCollector();
    metricsCollector.initializeDefaultMetrics();
  }
  return metricsCollector;
}

