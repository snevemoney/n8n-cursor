/**
 * Monitoring Types
 * Type definitions for metrics, SLIs, and SLOs
 */

export interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: number;
}

export interface CounterMetric extends Metric {
  type: 'counter';
}

export interface GaugeMetric extends Metric {
  type: 'gauge';
}

export interface HistogramMetric extends Metric {
  type: 'histogram';
  buckets?: number[];
}

export interface SummaryMetric extends Metric {
  type: 'summary';
  quantiles?: number[];
}

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * Four Golden Signals
 */
export interface GoldenSignals {
  latency: {
    p50: number; // milliseconds
    p95: number;
    p99: number;
    mean: number;
  };
  traffic: {
    requestsPerSecond: number;
    requestsTotal: number;
  };
  errors: {
    errorRate: number; // percentage
    errorCount: number;
    totalRequests: number;
  };
  saturation: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    activeConnections: number;
  };
}

/**
 * Service Level Indicator (SLI)
 */
export interface SLI {
  id: string;
  name: string;
  description: string;
  metric: string; // e.g., 'http_request_duration_seconds'
  threshold: number; // e.g., 0.95 for 95th percentile
  window: string; // e.g., '5m', '1h', '24h'
  labels?: Record<string, string>; // Filter labels
}

/**
 * Service Level Objective (SLO)
 */
export interface SLO {
  id: string;
  name: string;
  description: string;
  sliId: string;
  target: number; // e.g., 0.999 for 99.9%
  window: string; // e.g., '30d'
  errorBudget: number; // Remaining error budget percentage
  status: 'healthy' | 'warning' | 'breach';
}

/**
 * Service Level Agreement (SLA)
 */
export interface SLA {
  id: string;
  name: string;
  description: string;
  slos: string[]; // Array of SLO IDs
  consequences: string; // What happens if SLA is breached
}

