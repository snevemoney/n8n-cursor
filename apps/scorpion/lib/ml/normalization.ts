/**
 * Persistent Z-score Normalization
 * Maintains statistics across training/inference for consistent normalization
 */

import type { Matrix } from './matrix';

export interface NormalizationStats {
  means: number[]; // Per-feature means
  stds: number[]; // Per-feature standard deviations
  featureNames: string[];
  sampleCount: number;
  timestamp: number;
}

/**
 * Compute normalization statistics from training data
 * Uses Welford's online algorithm for numerical stability
 */
export function fitNormalization(
  X: Matrix,
  featureNames: string[]
): NormalizationStats {
  if (X.length === 0 || X[0].length === 0) {
    throw new Error('Cannot fit normalization on empty data');
  }

  const numFeatures = X[0].length;
  const means: number[] = Array(numFeatures).fill(0);
  const m2: number[] = Array(numFeatures).fill(0); // Sum of squared differences

  // Welford's online algorithm for mean and variance
  for (let i = 0; i < X.length; i++) {
    for (let j = 0; j < numFeatures; j++) {
      const delta = X[i][j] - means[j];
      means[j] += delta / (i + 1);
      const delta2 = X[i][j] - means[j];
      m2[j] += delta * delta2;
    }
  }

  // Compute standard deviations (with Bessel's correction)
  const stds: number[] = m2.map((val, j) => {
    const variance = val / (X.length - 1);
    const std = Math.sqrt(variance);
    // Prevent division by zero (use 1.0 for constant features)
    return std > 1e-8 ? std : 1.0;
  });

  return {
    means,
    stds,
    featureNames,
    sampleCount: X.length,
    timestamp: Date.now(),
  };
}

/**
 * Apply Z-score normalization using pre-computed statistics
 * z = (x - μ) / σ
 */
export function applyNormalization(X: Matrix, stats: NormalizationStats): Matrix {
  if (X.length === 0) {
    return [];
  }

  if (X[0].length !== stats.means.length) {
    throw new Error(
      `Feature count mismatch: expected ${stats.means.length}, got ${X[0].length}`
    );
  }

  return X.map(row =>
    row.map((val, j) => (val - stats.means[j]) / stats.stds[j])
  );
}

/**
 * Apply normalization to a single feature vector
 */
export function normalizeSingleSample(
  sample: number[],
  stats: NormalizationStats
): number[] {
  if (sample.length !== stats.means.length) {
    throw new Error(
      `Feature count mismatch: expected ${stats.means.length}, got ${sample.length}`
    );
  }

  return sample.map((val, j) => (val - stats.means[j]) / stats.stds[j]);
}

/**
 * Inverse transform (denormalize) a normalized sample
 * x = z * σ + μ
 */
export function denormalizeSample(
  normalizedSample: number[],
  stats: NormalizationStats
): number[] {
  if (normalizedSample.length !== stats.means.length) {
    throw new Error(
      `Feature count mismatch: expected ${stats.means.length}, got ${normalizedSample.length}`
    );
  }

  return normalizedSample.map((val, j) => val * stats.stds[j] + stats.means[j]);
}

/**
 * Update normalization statistics with new data (incremental learning)
 * Uses Welford's algorithm for online updates
 */
export function updateNormalizationStats(
  stats: NormalizationStats,
  newX: Matrix
): NormalizationStats {
  if (newX.length === 0) {
    return stats;
  }

  const numFeatures = stats.means.length;
  let n = stats.sampleCount;
  const means = [...stats.means];
  const m2 = stats.stds.map((std, j) => {
    // Reconstruct M2 from standard deviation
    return std * std * (n - 1);
  });

  // Update with new samples
  for (let i = 0; i < newX.length; i++) {
    n++;
    for (let j = 0; j < numFeatures; j++) {
      const delta = newX[i][j] - means[j];
      means[j] += delta / n;
      const delta2 = newX[i][j] - means[j];
      m2[j] += delta * delta2;
    }
  }

  // Recompute standard deviations
  const stds = m2.map(val => {
    const variance = val / (n - 1);
    const std = Math.sqrt(variance);
    return std > 1e-8 ? std : 1.0;
  });

  return {
    means,
    stds,
    featureNames: stats.featureNames,
    sampleCount: n,
    timestamp: Date.now(),
  };
}

/**
 * Serialize normalization stats to JSON
 */
export function serializeNormalizationStats(stats: NormalizationStats): string {
  return JSON.stringify(stats, null, 2);
}

/**
 * Deserialize normalization stats from JSON
 */
export function deserializeNormalizationStats(json: string): NormalizationStats {
  const stats = JSON.parse(json);

  // Validate structure
  if (
    !Array.isArray(stats.means) ||
    !Array.isArray(stats.stds) ||
    !Array.isArray(stats.featureNames) ||
    typeof stats.sampleCount !== 'number' ||
    typeof stats.timestamp !== 'number'
  ) {
    throw new Error('Invalid normalization stats format');
  }

  if (stats.means.length !== stats.stds.length) {
    throw new Error('Means and stds length mismatch');
  }

  return stats;
}

/**
 * Get summary statistics for debugging
 */
export function getNormalizationSummary(stats: NormalizationStats): string {
  const lines = [
    `Normalization Statistics (${stats.sampleCount} samples)`,
    '─'.repeat(60),
  ];

  for (let i = 0; i < stats.featureNames.length; i++) {
    const name = stats.featureNames[i].padEnd(20);
    const mean = stats.means[i].toFixed(4).padStart(10);
    const std = stats.stds[i].toFixed(4).padStart(10);
    lines.push(`${name} μ=${mean}  σ=${std}`);
  }

  lines.push('─'.repeat(60));
  lines.push(`Updated: ${new Date(stats.timestamp).toISOString()}`);

  return lines.join('\n');
}
