/**
 * Machine Learning Library for Scorpion
 * From-scratch neural network implementation for telemetry anomaly detection
 */

// Core neural network components
export {
  NeuralNetwork,
  Layer,
  createClassificationNetwork,
  createAnomalyDetectionNetwork,
  type NeuralNetworkConfig,
  type LayerConfig,
  type TrainingMetrics,
  type PredictionResult,
} from './neural-network';

// Matrix operations
export {
  matrixMultiply,
  transpose,
  matrixAdd,
  matrixSubtract,
  matrixHadamard,
  matrixScalarMultiply,
  matrixScalarAdd,
  randomMatrix,
  zeros,
  ones,
  normalize,
  standardize,
  flatten,
  reshape,
  addBias,
  sumAxis,
  matrixMap,
  sameShape,
  shape,
  printMatrix,
  type Matrix,
  type Vector,
} from './matrix';

// Activation functions
export {
  relu,
  reluDerivative,
  sigmoid,
  sigmoidDerivative,
  softmax,
  softmaxDerivative,
  tanh,
  tanhDerivative,
  leakyRelu,
  leakyReluDerivative,
  linear,
  linearDerivative,
  getActivation,
  getActivationDerivative,
  type ActivationType,
} from './activations';

// Loss functions
export {
  meanSquaredError,
  meanSquaredErrorDerivative,
  meanAbsoluteError,
  meanAbsoluteErrorDerivative,
  binaryCrossEntropy,
  binaryCrossEntropyDerivative,
  categoricalCrossEntropy,
  categoricalCrossEntropyDerivative,
  sparseCategoricalCrossEntropy,
  huberLoss,
  huberLossDerivative,
  accuracy,
  getLossFunction,
  getLossDerivative,
  type LossType,
} from './loss-functions';

// Feature extraction for telemetry
export {
  extractFeatures,
  featuresToArray,
  getFeatureNames,
  labelFeatures,
  createTrainingDataset,
  createRealtimeBatch,
  detectAnomalies,
  computeAnomalyScore,
  getFeatureStats,
  FeatureExtractorConfig,
  FEATURE_WINDOW_MS,
  SAMPLING_INTERVAL_MS,
  type TelemetryFeatures,
} from './feature-extractor';

// High-level anomaly detector
export {
  AnomalyDetector,
  createAnomalyDetector,
  type AnomalyDetectorConfig,
  type AnomalyPrediction,
} from './anomaly-detector';
