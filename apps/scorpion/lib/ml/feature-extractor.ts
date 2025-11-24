/**
 * Feature Extraction for Telemetry Data
 * Converts telemetry events into normalized feature vectors for neural network training
 */

import type { DomainEvent } from '../telemetry/schema';
import {
  computeBackpressure,
  computeAgentKPIs,
  computeThroughput,
  computeErrorRate,
} from '../telemetry/derived';
import { normalize, standardize, type Matrix } from './matrix';

/**
 * Time window for feature extraction (in milliseconds)
 */
export const FEATURE_WINDOW_MS = 60000; // 1 minute
export const SAMPLING_INTERVAL_MS = 5000; // 5 seconds

/**
 * History cache for computing temporal features (trends, moving averages)
 * Stores last N feature extractions for computing derivatives
 */
interface FeatureHistory {
  errorRate: number;
  queueDepth: number;
  timestamp: number;
}

const featureHistory: FeatureHistory[] = [];
const MAX_HISTORY_SIZE = 10; // Keep last 10 samples for trend calculation

/**
 * Feature vector structure
 * These are the input features for the neural network
 */
export interface TelemetryFeatures {
  // Event rates
  eventRate: number; // Events per second
  errorRate: number; // Proportion of error events

  // Queue metrics
  backpressureRatio: number; // Enqueue/drain ratio
  queueDepth: number; // Current queue depth

  // Agent performance
  agentSuccessRate: number; // Average agent success rate
  agentErrorCount: number; // Total agent errors in window

  // System health
  httpErrorRate: number; // HTTP error proportion
  jobFailureRate: number; // Job failure proportion

  // Temporal features
  timeOfDay: number; // Hour of day (0-23) normalized to [0, 1]
  errorRateTrend: number; // Rate of change in error rate (derivative)
  queueDepthMA: number; // Moving average of queue depth

  // Metadata (not used as features)
  timestamp: number;
  label?: 'normal' | 'anomaly';
}

/**
 * Extract features from a window of telemetry events
 */
export function extractFeatures(
  events: DomainEvent[],
  windowStart: number,
  windowEnd: number = Date.now()
): TelemetryFeatures {
  const windowMs = windowEnd - windowStart;
  const windowEvents = events.filter(e => e.ts >= windowStart && e.ts < windowEnd);

  // Event rate (events per second)
  const eventRate = windowEvents.length / (windowMs / 1000);

  // Error rate (proportion of error events)
  const errorEvents = windowEvents.filter(e =>
    e.type.includes('error') ||
    e.type.includes('failed') ||
    e.severity === 'error' ||
    e.severity === 'critical'
  );
  const errorRate = windowEvents.length > 0 ? errorEvents.length / windowEvents.length : 0;

  // Backpressure metrics
  const backpressure = computeBackpressure(windowEvents);
  const backpressureRatio = Math.min(backpressure.ratio, 10); // Cap at 10x for normalization

  // Queue depth (from most recent queue.depth event)
  const queueDepthEvents = windowEvents.filter(e => e.type === 'queue.depth');
  const queueDepth = queueDepthEvents.length > 0
    ? Math.max(...queueDepthEvents.map(e => 'depth' in e ? Number(e.depth) : 0))
    : 0;

  // Agent KPIs
  const agentKPIs = computeAgentKPIs(windowEvents);
  const agentSuccessRate = agentKPIs.length > 0
    ? agentKPIs.reduce((sum, kpi) => sum + kpi.successRate, 0) / agentKPIs.length
    : 1.0; // Default to 1.0 if no agents
  const agentErrorCount = agentKPIs.reduce((sum, kpi) => sum + kpi.errorCount, 0);

  // HTTP error rate
  const httpEvents = windowEvents.filter(e => e.type === 'http.error');
  const httpErrorRate = windowEvents.length > 0 ? httpEvents.length / windowEvents.length : 0;

  // Job failure rate
  const jobEvents = windowEvents.filter(e =>
    e.type === 'job.completed' || e.type === 'job.failed'
  );
  const jobFailures = windowEvents.filter(e => e.type === 'job.failed');
  const jobFailureRate = jobEvents.length > 0 ? jobFailures.length / jobEvents.length : 0;

  // Time of day feature (helps detect time-based patterns)
  const date = new Date(windowEnd);
  const timeOfDay = date.getHours() / 24; // Normalize to [0, 1]

  // Compute temporal features (trends and moving averages)
  let errorRateTrend = 0;
  let queueDepthMA = queueDepth;

  if (featureHistory.length > 0) {
    // Compute error rate trend (derivative approximation)
    const lastHistory = featureHistory[featureHistory.length - 1];
    const timeDiff = (windowEnd - lastHistory.timestamp) / 1000; // seconds
    if (timeDiff > 0) {
      errorRateTrend = (errorRate - lastHistory.errorRate) / timeDiff;
    }

    // Compute moving average of queue depth
    const recentQueueDepths = featureHistory.slice(-5).map(h => h.queueDepth);
    recentQueueDepths.push(queueDepth);
    queueDepthMA = recentQueueDepths.reduce((sum, val) => sum + val, 0) / recentQueueDepths.length;
  }

  // Update history cache
  featureHistory.push({
    errorRate,
    queueDepth,
    timestamp: windowEnd,
  });

  // Maintain max history size
  if (featureHistory.length > MAX_HISTORY_SIZE) {
    featureHistory.shift();
  }

  return {
    eventRate,
    errorRate,
    backpressureRatio,
    queueDepth,
    agentSuccessRate,
    agentErrorCount,
    httpErrorRate,
    jobFailureRate,
    timeOfDay,
    errorRateTrend,
    queueDepthMA,
    timestamp: windowEnd,
  };
}

/**
 * Convert feature object to numeric array (for neural network input)
 */
export function featuresToArray(features: TelemetryFeatures): number[] {
  return [
    features.eventRate,
    features.errorRate,
    features.backpressureRatio,
    features.queueDepth,
    features.agentSuccessRate,
    features.agentErrorCount,
    features.httpErrorRate,
    features.jobFailureRate,
    features.timeOfDay,
    features.errorRateTrend,
    features.queueDepthMA,
  ];
}

/**
 * Get feature names (for debugging/visualization)
 */
export function getFeatureNames(): string[] {
  return [
    'eventRate',
    'errorRate',
    'backpressureRatio',
    'queueDepth',
    'agentSuccessRate',
    'agentErrorCount',
    'httpErrorRate',
    'jobFailureRate',
    'timeOfDay',
    'errorRateTrend',
    'queueDepthMA',
  ];
}

/**
 * Label data as normal or anomaly based on thresholds
 * This is a simple heuristic for supervised learning
 */
export function labelFeatures(features: TelemetryFeatures): 'normal' | 'anomaly' {
  // Anomaly conditions (any one triggers anomaly label)
  const isAnomaly =
    features.errorRate > 0.2 || // More than 20% errors
    features.backpressureRatio > 2.0 || // 2x backpressure
    features.agentSuccessRate < 0.5 || // Less than 50% agent success
    features.httpErrorRate > 0.15 || // More than 15% HTTP errors
    features.jobFailureRate > 0.3; // More than 30% job failures

  return isAnomaly ? 'anomaly' : 'normal';
}

/**
 * Create training dataset from historical telemetry events
 */
export function createTrainingDataset(
  events: DomainEvent[],
  options: {
    samplingInterval?: number;
    windowSize?: number;
    normalizeFeatures?: boolean;
    standardizeFeatures?: boolean;
  } = {}
): {
  X: Matrix; // Input features (samples × features)
  Y: Matrix; // Labels (samples × 2) - one-hot encoded [normal, anomaly]
  features: TelemetryFeatures[];
  featureNames: string[];
} {
  const {
    samplingInterval = SAMPLING_INTERVAL_MS,
    windowSize = FEATURE_WINDOW_MS,
    normalizeFeatures = true,
    standardizeFeatures = false,
  } = options;

  if (events.length === 0) {
    return {
      X: [],
      Y: [],
      features: [],
      featureNames: getFeatureNames(),
    };
  }

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => a.ts - b.ts);

  const firstEvent = sortedEvents[0].ts;
  const lastEvent = sortedEvents[sortedEvents.length - 1].ts;

  // Generate samples at regular intervals
  const samples: TelemetryFeatures[] = [];

  for (let windowEnd = firstEvent + windowSize; windowEnd <= lastEvent; windowEnd += samplingInterval) {
    const windowStart = windowEnd - windowSize;

    const features = extractFeatures(sortedEvents, windowStart, windowEnd);
    const label = labelFeatures(features);

    samples.push({
      ...features,
      label,
    });
  }

  if (samples.length === 0) {
    return {
      X: [],
      Y: [],
      features: [],
      featureNames: getFeatureNames(),
    };
  }

  // Convert to matrices
  let X: Matrix = samples.map(featuresToArray);

  // One-hot encode labels: [1, 0] = normal, [0, 1] = anomaly
  const Y: Matrix = samples.map(sample =>
    sample.label === 'normal' ? [1, 0] : [0, 1]
  );

  // Apply normalization/standardization if requested
  if (standardizeFeatures) {
    X = standardize(X);
  } else if (normalizeFeatures) {
    X = normalize(X);
  }

  return {
    X,
    Y,
    features: samples,
    featureNames: getFeatureNames(),
  };
}

/**
 * Create training batch for real-time learning
 * Useful for online learning scenarios
 */
export function createRealtimeBatch(
  recentEvents: DomainEvent[],
  batchSize: number = 32
): {
  X: Matrix;
  Y: Matrix;
  features: TelemetryFeatures[];
} | null {
  if (recentEvents.length === 0) {
    return null;
  }

  const now = Date.now();
  const batchStart = now - (batchSize * SAMPLING_INTERVAL_MS);

  // Create mini-batch of samples
  const samples: TelemetryFeatures[] = [];

  for (let i = 0; i < batchSize; i++) {
    const windowEnd = batchStart + (i * SAMPLING_INTERVAL_MS);
    const windowStart = windowEnd - FEATURE_WINDOW_MS;

    const features = extractFeatures(recentEvents, windowStart, windowEnd);
    const label = labelFeatures(features);

    samples.push({
      ...features,
      label,
    });
  }

  // Convert to matrices
  const X: Matrix = samples.map(featuresToArray);
  const Y: Matrix = samples.map(sample =>
    sample.label === 'normal' ? [1, 0] : [0, 1]
  );

  return {
    X: normalize(X),
    Y,
    features: samples,
  };
}

/**
 * Detect anomalies in real-time using trained network
 */
export function detectAnomalies(
  predictions: Matrix,
  threshold: number = 0.7
): boolean[] {
  return predictions.map(pred => {
    // pred[0] = normal probability, pred[1] = anomaly probability
    return pred[1] > threshold; // True if anomaly probability > threshold
  });
}

/**
 * Compute anomaly score (0 = normal, 1 = anomaly)
 */
export function computeAnomalyScore(prediction: number[]): number {
  // prediction[1] is the anomaly probability from softmax
  return prediction[1];
}

/**
 * Get feature statistics for monitoring/debugging
 */
export function getFeatureStats(features: TelemetryFeatures[]): {
  featureName: string;
  min: number;
  max: number;
  mean: number;
  std: number;
}[] {
  if (features.length === 0) {
    return [];
  }

  const featureNames = getFeatureNames();
  const stats: Array<{
    featureName: string;
    min: number;
    max: number;
    mean: number;
    std: number;
  }> = [];

  const featureArrays = features.map(featuresToArray);

  for (let i = 0; i < featureNames.length; i++) {
    const values = featureArrays.map(arr => arr[i]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);

    stats.push({
      featureName: featureNames[i],
      min,
      max,
      mean,
      std,
    });
  }

  return stats;
}

/**
 * Clear feature history cache
 * Useful when resetting the model or starting fresh
 */
export function clearFeatureHistory(): void {
  featureHistory.length = 0;
}

/**
 * Export feature extractor configuration
 */
export const FeatureExtractorConfig = {
  numFeatures: getFeatureNames().length,
  featureNames: getFeatureNames(),
  windowMs: FEATURE_WINDOW_MS,
  samplingIntervalMs: SAMPLING_INTERVAL_MS,
  outputClasses: ['normal', 'anomaly'],
  numClasses: 2,
} as const;
