/**
 * Anomaly Detector
 * High-level API for training and using neural network for telemetry anomaly detection
 */

import { type NeuralNetwork, NeuralNetwork as NN, type TrainingMetrics } from './neural-network';
import {
  createTrainingDataset,
  detectAnomalies,
  computeAnomalyScore,
  extractFeatures,
  featuresToArray,
  labelFeatures,
  getFeatureStats,
  FeatureExtractorConfig,
  clearFeatureHistory,
  type TelemetryFeatures,
} from './feature-extractor';
import type { DomainEvent } from '../telemetry/schema';
import {
  type ModelConfig,
  DEFAULT_UPGRADED_CONFIG,
  createLayerConfigs,
  validateModelConfig,
  getModelConfigSummary,
} from './model-config';
import {
  type NormalizationStats,
  fitNormalization,
  applyNormalization,
  normalizeSingleSample,
  getNormalizationSummary,
} from './normalization';

export interface AnomalyDetectorConfig {
  modelConfig?: ModelConfig;
  autoTrain?: boolean;
  retrainInterval?: number; // milliseconds
}

export interface AnomalyPrediction {
  isAnomaly: boolean;
  score: number; // 0-1, higher = more likely anomaly
  confidence: number; // confidence in prediction
  features: TelemetryFeatures;
  timestamp: number;
}

/**
 * Anomaly Detector - combines feature extraction + neural network
 */
export class AnomalyDetector {
  private network: NeuralNetwork;
  private modelConfig: ModelConfig;
  private normalizationStats: NormalizationStats | null = null;
  private isTraining = false;
  private lastTrainingTime = 0;

  constructor(private config: AnomalyDetectorConfig = {}) {
    // Use provided model config or default upgraded config
    this.modelConfig = config.modelConfig || DEFAULT_UPGRADED_CONFIG;
    validateModelConfig(this.modelConfig);

    // Log configuration
    console.log('[Anomaly Detector] Initializing with configuration:');
    console.log(getModelConfigSummary(this.modelConfig));

    // Create neural network from model config
    const layerConfigs = createLayerConfigs(this.modelConfig);
    this.network = new NN({
      layers: layerConfigs,
      loss: this.modelConfig.loss,
      learningRate: this.modelConfig.learningRate,
      momentum: this.modelConfig.momentum,
      name: this.modelConfig.name,
    });
  }

  /**
   * Train the network on historical telemetry data
   */
  async train(
    events: DomainEvent[],
    options: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
      verbose?: boolean;
      onProgress?: (metrics: TrainingMetrics) => void;
    } = {}
  ): Promise<TrainingMetrics[]> {
    const {
      epochs = this.modelConfig.epochs,
      batchSize = this.modelConfig.batchSize,
      validationSplit = 0.2,
      verbose = true,
      onProgress,
    } = options;

    this.isTraining = true;

    console.log('🧠 [Anomaly Detector] Extracting features from telemetry...');

    // Extract features and create training dataset (no normalization yet)
    const { X, Y, features } = createTrainingDataset(events, {
      normalizeFeatures: false, // We'll apply persistent Z-score normalization
      standardizeFeatures: false,
    });

    if (X.length === 0 || Y.length === 0) {
      console.warn('[Anomaly Detector] No training data available');
      this.isTraining = false;
      return [];
    }

    console.log(`📊 [Anomaly Detector] Dataset: ${X.length} samples, ${X[0].length} features`);

    // Fit normalization statistics on training data
    console.log('📏 [Anomaly Detector] Fitting normalization statistics...');
    this.normalizationStats = fitNormalization(X, FeatureExtractorConfig.featureNames);

    if (verbose) {
      console.log('\n' + getNormalizationSummary(this.normalizationStats));
    }

    // Apply Z-score normalization
    const X_normalized = applyNormalization(X, this.normalizationStats);

    // Log class distribution
    const normalCount = Y.filter(y => y[0] === 1).length;
    const anomalyCount = Y.filter(y => y[1] === 1).length;
    console.log(`🔍 Class Distribution: ${normalCount} normal, ${anomalyCount} anomalies`);

    // Train the network with all model config parameters
    const history = this.network.train(X_normalized, Y, {
      epochs,
      batchSize,
      validationSplit,
      verbose,
      lrDecay: this.modelConfig.lrDecay,
      lrDecayStep: this.modelConfig.lrDecayStep,
      onEpochEnd: onProgress,
    });

    this.lastTrainingTime = Date.now();
    this.isTraining = false;

    console.log('✅ [Anomaly Detector] Training complete with persistent normalization');

    return history;
  }

  /**
   * Predict if current system state is anomalous
   */
  predict(events: DomainEvent[], windowMs: number = 60000): AnomalyPrediction {
    if (!this.normalizationStats) {
      throw new Error('Model must be trained before making predictions (normalization stats missing)');
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    // Extract features for current window
    const features = extractFeatures(events, windowStart, now);

    // Convert to input array and apply persistent normalization
    const inputArray = featuresToArray(features);
    const normalizedInput = normalizeSingleSample(inputArray, this.normalizationStats);
    const inputMatrix = [normalizedInput];

    // Predict with MC Dropout for uncertainty estimation (if enabled)
    const samples = this.modelConfig.mcDropoutEnabled ? this.modelConfig.mcDropoutSamples : 1;
    const result = this.network.predictWithConfidence(inputMatrix, samples);

    const score = computeAnomalyScore(result.output[0]);

    // Determine if anomaly (threshold = 0.5)
    const isAnomaly = score > 0.5;

    return {
      isAnomaly,
      score,
      confidence: result.confidence,
      features,
      timestamp: now,
    };
  }

  /**
   * Batch prediction on multiple windows
   */
  predictBatch(events: DomainEvent[], windowCount: number = 10): AnomalyPrediction[] {
    if (!this.normalizationStats) {
      throw new Error('Model must be trained before making predictions (normalization stats missing)');
    }

    const now = Date.now();
    const windowMs = 60000;
    const stepMs = 5000; // 5 second steps

    const predictions: AnomalyPrediction[] = [];

    for (let i = 0; i < windowCount; i++) {
      const windowEnd = now - (i * stepMs);
      const windowStart = windowEnd - windowMs;

      const features = extractFeatures(events, windowStart, windowEnd);
      const inputArray = featuresToArray(features);
      const normalizedInput = normalizeSingleSample(inputArray, this.normalizationStats);
      const inputMatrix = [normalizedInput];

      const samples = this.modelConfig.mcDropoutEnabled ? this.modelConfig.mcDropoutSamples : 1;
      const result = this.network.predictWithConfidence(inputMatrix, samples);
      const score = computeAnomalyScore(result.output[0]);

      predictions.push({
        isAnomaly: score > 0.5,
        score,
        confidence: result.confidence,
        features,
        timestamp: windowEnd,
      });
    }

    return predictions.reverse(); // Return chronological order
  }

  /**
   * Evaluate network performance on test data
   */
  evaluate(events: DomainEvent[]): {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  } {
    if (!this.normalizationStats) {
      throw new Error('Model must be trained before evaluation (normalization stats missing)');
    }

    const { X, Y } = createTrainingDataset(events, {
      normalizeFeatures: false,
      standardizeFeatures: false,
    });

    if (X.length === 0 || Y.length === 0) {
      return { accuracy: 0, precision: 0, recall: 0, f1Score: 0 };
    }

    // Apply persistent normalization
    const X_normalized = applyNormalization(X, this.normalizationStats);

    const predictions = this.network.predict(X_normalized);

    // Calculate confusion matrix
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < predictions.length; i++) {
      const predictedAnomaly = predictions[i][1] > 0.5;
      const actualAnomaly = Y[i][1] === 1;

      if (predictedAnomaly && actualAnomaly) truePositives++;
      else if (!predictedAnomaly && !actualAnomaly) trueNegatives++;
      else if (predictedAnomaly && !actualAnomaly) falsePositives++;
      else if (!predictedAnomaly && actualAnomaly) falseNegatives++;
    }

    const accuracy = (truePositives + trueNegatives) / predictions.length;
    const precision =
      truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall =
      truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1Score =
      precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
    };
  }

  /**
   * Get network status
   */
  getStatus(): {
    isTrained: boolean;
    isTraining: boolean;
    lastTrainingTime: number;
    trainingHistory: TrainingMetrics[];
  } {
    return {
      isTrained: this.network.getHistory().length > 0,
      isTraining: this.isTraining,
      lastTrainingTime: this.lastTrainingTime,
      trainingHistory: this.network.getHistory(),
    };
  }

  /**
   * Save trained model weights
   */
  save(): {
    weights: any;
    modelConfig: ModelConfig;
    normalizationStats: NormalizationStats | null;
    config: AnomalyDetectorConfig;
    metadata: {
      lastTrainingTime: number;
      featureCount: number;
      version: string;
    };
  } {
    const weights = this.network.saveWeights();

    return {
      weights,
      modelConfig: this.modelConfig,
      normalizationStats: this.normalizationStats,
      config: this.config,
      metadata: {
        lastTrainingTime: this.lastTrainingTime,
        featureCount: FeatureExtractorConfig.numFeatures,
        version: this.modelConfig.version,
      },
    };
  }

  /**
   * Load trained model weights
   */
  load(data: {
    weights: any;
    modelConfig?: ModelConfig;
    normalizationStats?: NormalizationStats;
    config?: AnomalyDetectorConfig;
  }): void {
    this.network.loadWeights(data.weights);

    if (data.modelConfig) {
      this.modelConfig = data.modelConfig;
    }

    if (data.normalizationStats) {
      this.normalizationStats = data.normalizationStats;
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }

    console.log('✅ [Anomaly Detector] Model loaded successfully');
    console.log(`   Model: ${this.modelConfig.name} v${this.modelConfig.version}`);
    console.log(`   Normalization: ${this.normalizationStats ? 'loaded' : 'missing'}`);
  }

  /**
   * Get network summary
   */
  summary(): void {
    this.network.summary();
    console.log('\n🔍 Feature Extractor:');
    console.log(`  Features: ${FeatureExtractorConfig.featureNames.join(', ')}`);
    console.log(`  Window: ${FeatureExtractorConfig.windowMs}ms`);
    console.log(`  Classes: ${FeatureExtractorConfig.outputClasses.join(', ')}`);
  }

  /**
   * Reset network to untrained state
   */
  reset(): void {
    this.network.reset();
    this.normalizationStats = null;
    clearFeatureHistory();
    this.lastTrainingTime = 0;
    console.log('🔄 [Anomaly Detector] Reset complete (network, normalization, and feature history cleared)');
  }

  /**
   * Get network internal state for visualization
   */
  getNetworkState(): {
    activations: number[][];
    weights: any;
    architecture: {
      inputSize: number;
      hiddenLayers: number[];
      outputSize: number;
    };
  } | null {
    if (this.network.getHistory().length === 0) {
      return null;
    }

    // Get current activations by running a dummy forward pass
    const layers = this.network.getLayers();
    const activations: number[][] = [];

    // Collect layer outputs
    layers.forEach(layer => {
      if (layer.getOutput) {
        const output = layer.getOutput();
        if (output && output.length > 0) {
          activations.push(output[0]); // First sample in batch
        }
      }
    });

    // Get weights
    const weights = this.network.saveWeights();

    return {
      activations,
      weights,
      architecture: {
        inputSize: this.modelConfig.inputSize,
        hiddenLayers: this.modelConfig.hiddenLayers,
        outputSize: this.modelConfig.outputSize,
      },
    };
  }
}

/**
 * Create a pre-configured anomaly detector
 */
export function createAnomalyDetector(config?: AnomalyDetectorConfig): AnomalyDetector {
  return new AnomalyDetector(config);
}
