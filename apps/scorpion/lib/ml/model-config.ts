/**
 * Model Configuration System
 * Centralized configuration for neural network architecture and training
 */

import type { LossType } from './loss-functions';
import type { LayerConfig } from './layer';

export interface ModelConfig {
  // Architecture
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  dropoutRates: number[]; // Dropout for each hidden layer

  // Training hyperparameters
  learningRate: number;
  momentum: number;
  lrDecay: number; // Learning rate decay factor
  lrDecayStep: number; // Apply decay every N epochs
  batchSize: number;
  epochs: number;

  // Loss and optimization
  loss: LossType;

  // MC Dropout settings
  mcDropoutEnabled: boolean; // Enable/disable MC Dropout uncertainty estimation
  mcDropoutSamples: number; // Number of samples for uncertainty estimation

  // Metadata
  name: string;
  version: string;
  createdAt: number;
}

/**
 * Default configuration for anomaly detection (current/legacy)
 */
export const DEFAULT_LEGACY_CONFIG: ModelConfig = {
  inputSize: 9,
  hiddenLayers: [16, 8],
  outputSize: 2,
  dropoutRates: [0.0, 0.0],
  learningRate: 0.01,
  momentum: 0.0,
  lrDecay: 1.0,
  lrDecayStep: 10,
  batchSize: 32,
  epochs: 50,
  loss: 'categoricalCrossEntropy',
  mcDropoutEnabled: false, // No MC Dropout
  mcDropoutSamples: 1,
  name: 'legacy_anomaly_detector',
  version: '1.0.0',
  createdAt: Date.now(),
};

/**
 * Upgraded configuration for serious anomaly detection
 */
export const DEFAULT_UPGRADED_CONFIG: ModelConfig = {
  inputSize: 11, // Added 2 temporal features
  hiddenLayers: [64, 32, 16],
  outputSize: 2,
  dropoutRates: [0.3, 0.2, 0.0], // Dropout on first two hidden layers
  learningRate: 0.01,
  momentum: 0.9,
  lrDecay: 0.95,
  lrDecayStep: 10,
  batchSize: 32,
  epochs: 100,
  loss: 'categoricalCrossEntropy',
  mcDropoutEnabled: true, // MC Dropout enabled
  mcDropoutSamples: 10, // MC Dropout with 10 samples
  name: 'upgraded_anomaly_detector',
  version: '2.0.0',
  createdAt: Date.now(),
};

/**
 * Validate model configuration
 */
export function validateModelConfig(config: ModelConfig): void {
  if (config.inputSize <= 0) {
    throw new Error('inputSize must be positive');
  }

  if (config.hiddenLayers.length === 0) {
    throw new Error('Must have at least one hidden layer');
  }

  if (config.hiddenLayers.some(size => size <= 0)) {
    throw new Error('All hidden layer sizes must be positive');
  }

  if (config.outputSize <= 0) {
    throw new Error('outputSize must be positive');
  }

  if (config.dropoutRates.length !== config.hiddenLayers.length) {
    throw new Error(
      `dropoutRates length (${config.dropoutRates.length}) must match hiddenLayers length (${config.hiddenLayers.length})`
    );
  }

  if (config.dropoutRates.some(rate => rate < 0 || rate >= 1)) {
    throw new Error('Dropout rates must be in range [0, 1)');
  }

  if (config.learningRate <= 0) {
    throw new Error('learningRate must be positive');
  }

  if (config.momentum < 0 || config.momentum >= 1) {
    throw new Error('momentum must be in range [0, 1)');
  }

  if (config.lrDecay <= 0 || config.lrDecay > 1) {
    throw new Error('lrDecay must be in range (0, 1]');
  }

  if (config.lrDecayStep <= 0) {
    throw new Error('lrDecayStep must be positive');
  }

  if (config.batchSize <= 0) {
    throw new Error('batchSize must be positive');
  }

  if (config.epochs <= 0) {
    throw new Error('epochs must be positive');
  }

  if (config.mcDropoutSamples < 1) {
    throw new Error('mcDropoutSamples must be at least 1');
  }
}

/**
 * Create layer configurations from model config
 */
export function createLayerConfigs(config: ModelConfig): LayerConfig[] {
  const layers: LayerConfig[] = [];

  // Input to first hidden layer
  layers.push({
    inputSize: config.inputSize,
    outputSize: config.hiddenLayers[0],
    activation: 'relu',
    dropout: config.dropoutRates[0],
  });

  // Hidden layers
  for (let i = 1; i < config.hiddenLayers.length; i++) {
    layers.push({
      inputSize: config.hiddenLayers[i - 1],
      outputSize: config.hiddenLayers[i],
      activation: 'relu',
      dropout: config.dropoutRates[i],
    });
  }

  // Output layer (no dropout)
  layers.push({
    inputSize: config.hiddenLayers[config.hiddenLayers.length - 1],
    outputSize: config.outputSize,
    activation: 'softmax',
    dropout: 0.0,
  });

  return layers;
}

/**
 * Calculate total number of parameters
 */
export function calculateParameterCount(config: ModelConfig): number {
  let total = 0;

  // Input to first hidden
  total += config.inputSize * config.hiddenLayers[0] + config.hiddenLayers[0];

  // Hidden layers
  for (let i = 1; i < config.hiddenLayers.length; i++) {
    total += config.hiddenLayers[i - 1] * config.hiddenLayers[i] + config.hiddenLayers[i];
  }

  // Output layer
  total +=
    config.hiddenLayers[config.hiddenLayers.length - 1] * config.outputSize + config.outputSize;

  return total;
}

/**
 * Get architecture summary string
 */
export function getArchitectureSummary(config: ModelConfig): string {
  const layerSizes = [config.inputSize, ...config.hiddenLayers, config.outputSize];
  return layerSizes.join(' → ');
}

/**
 * Serialize model config to JSON
 */
export function serializeModelConfig(config: ModelConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Deserialize model config from JSON
 */
export function deserializeModelConfig(json: string): ModelConfig {
  const config = JSON.parse(json);

  // Validate structure
  validateModelConfig(config);

  return config;
}

/**
 * Create a custom model config with partial overrides
 */
export function createCustomConfig(
  base: ModelConfig,
  overrides: Partial<ModelConfig>
): ModelConfig {
  const config: ModelConfig = {
    ...base,
    ...overrides,
    createdAt: Date.now(),
  };

  validateModelConfig(config);

  return config;
}

/**
 * Get model config summary for logging
 */
export function getModelConfigSummary(config: ModelConfig): string {
  const lines = [
    `Model Configuration: ${config.name} v${config.version}`,
    '─'.repeat(70),
    `Architecture: ${getArchitectureSummary(config)}`,
    `Parameters: ${calculateParameterCount(config).toLocaleString()}`,
    `Dropout: [${config.dropoutRates.join(', ')}]`,
    '',
    'Training Hyperparameters:',
    `  Learning Rate: ${config.learningRate}`,
    `  Momentum: ${config.momentum}`,
    `  LR Decay: ${config.lrDecay} (every ${config.lrDecayStep} epochs)`,
    `  Batch Size: ${config.batchSize}`,
    `  Epochs: ${config.epochs}`,
    '',
    'MC Dropout:',
    `  Enabled: ${config.mcDropoutEnabled ? 'Yes' : 'No'}`,
    `  Samples: ${config.mcDropoutSamples}`,
    '',
    `Created: ${new Date(config.createdAt).toISOString()}`,
    '─'.repeat(70),
  ];

  return lines.join('\n');
}
