/**
 * Neural Network Class
 * From-scratch implementation inspired by the YouTube video
 * Supports forward pass, backpropagation, and training
 */

import { Layer, type LayerConfig } from './layer';
import type { Matrix } from './matrix';
import { getLossFunction, getLossDerivative, accuracy, type LossType } from './loss-functions';
import { softmaxDerivative } from './activations';

export interface NeuralNetworkConfig {
  layers: LayerConfig[];
  loss: LossType;
  learningRate?: number;
  momentum?: number;
  name?: string;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  timestamp: number;
}

export interface PredictionResult {
  output: Matrix;
  confidence: number;
  predictedClass?: number;
}

/**
 * Neural Network
 * Stacks multiple layers and handles training/inference
 */
export class NeuralNetwork {
  public layers: Layer[];
  public loss: LossType;
  public learningRate: number;
  public momentum: number;
  public name: string;

  // Training history
  public trainingHistory: TrainingMetrics[] = [];
  public isTraining = false;

  constructor(config: NeuralNetworkConfig) {
    this.layers = config.layers.map(layerConfig => new Layer(layerConfig));
    this.loss = config.loss;
    this.learningRate = config.learningRate || 0.01;
    this.momentum = config.momentum || 0.0;
    this.name = config.name || 'neural_network';

    // Validate layer connectivity
    for (let i = 0; i < this.layers.length - 1; i++) {
      if (this.layers[i].outputSize !== this.layers[i + 1].inputSize) {
        throw new Error(
          `Layer ${i} output size (${this.layers[i].outputSize}) doesn't match layer ${i + 1} input size (${this.layers[i + 1].inputSize})`
        );
      }
    }
  }

  /**
   * Forward pass through the entire network
   * input: (batchSize × inputSize)
   * isTraining: whether to apply dropout (only during training)
   * returns: (batchSize × outputSize)
   */
  forward(input: Matrix, isTraining: boolean = false): Matrix {
    let output = input;

    for (const layer of this.layers) {
      output = layer.forward(output, isTraining);
    }

    return output;
  }

  /**
   * Backward pass (backpropagation)
   * Computes gradients and updates weights
   */
  backward(predictions: Matrix, targets: Matrix): void {
    // Compute loss gradient
    let gradient: Matrix;

    // Special case: softmax + categorical cross-entropy
    const outputLayer = this.layers[this.layers.length - 1];
    if (outputLayer.activation === 'softmax' && this.loss === 'categoricalCrossEntropy') {
      // Gradient simplifies to: predictions - targets
      gradient = softmaxDerivative(predictions, targets);
    } else {
      // General case: use loss derivative
      const lossDerivative = getLossDerivative(this.loss);
      gradient = lossDerivative(predictions, targets);
    }

    // Backpropagate through layers (reverse order)
    for (let i = this.layers.length - 1; i >= 0; i--) {
      gradient = this.layers[i].backward(gradient, this.learningRate);
    }
  }

  /**
   * Apply accumulated gradients to all layers
   * Called after processing a mini-batch
   */
  applyGradients(): void {
    for (const layer of this.layers) {
      layer.applyGradients(this.learningRate, this.momentum);
    }
  }

  /**
   * Train the network on a dataset
   * X: input data (batchSize × inputSize)
   * Y: target labels (batchSize × outputSize)
   */
  train(
    X: Matrix,
    Y: Matrix,
    options: {
      epochs?: number;
      batchSize?: number;
      validationSplit?: number;
      shuffle?: boolean;
      verbose?: boolean;
      lrDecay?: number;
      lrDecayStep?: number;
      onEpochEnd?: (metrics: TrainingMetrics) => void;
      onBatchEnd?: (batchLoss: number, batchIndex: number) => void;
    } = {}
  ): TrainingMetrics[] {
    const {
      epochs = 10,
      batchSize = 32,
      validationSplit = 0.1,
      shuffle = true,
      verbose = true,
      lrDecay = 0.95,
      lrDecayStep = 10,
      onEpochEnd,
      onBatchEnd,
    } = options;

    this.isTraining = true;
    this.trainingHistory = [];

    // Split data into training and validation
    const splitIndex = Math.floor(X.length * (1 - validationSplit));
    const XTrain = X.slice(0, splitIndex);
    const YTrain = Y.slice(0, splitIndex);
    const XVal = X.slice(splitIndex);
    const YVal = Y.slice(splitIndex);

    console.log(`\n🧠 Training Neural Network: ${this.name}`);
    console.log(`   Training samples: ${XTrain.length}`);
    console.log(`   Validation samples: ${XVal.length}`);
    console.log(`   Epochs: ${epochs}, Batch size: ${batchSize}`);
    console.log(`   Learning rate: ${this.learningRate}\n`);

    // Training loop
    for (let epoch = 0; epoch < epochs; epoch++) {
      const startTime = Date.now();

      // Shuffle data if requested
      let indices = Array.from({ length: XTrain.length }, (_, i) => i);
      if (shuffle) {
        indices = this.shuffleArray(indices);
      }

      let epochLoss = 0;
      let batchCount = 0;

      // Mini-batch training
      for (let i = 0; i < XTrain.length; i += batchSize) {
        const batchIndices = indices.slice(i, Math.min(i + batchSize, XTrain.length));
        const XBatch = batchIndices.map(idx => XTrain[idx]);
        const YBatch = batchIndices.map(idx => YTrain[idx]);

        // Forward pass (with dropout enabled during training)
        const predictions = this.forward(XBatch, true);

        // Compute loss
        const lossFunc = getLossFunction(this.loss);
        const batchLoss = lossFunc(predictions, YBatch);
        epochLoss += batchLoss;
        batchCount++;

        // Backward pass
        this.backward(predictions, YBatch);

        // Apply gradients (after accumulating over mini-batch)
        this.applyGradients();

        // Reset layer caches for next batch
        for (const layer of this.layers) {
          layer.reset();
        }

        // Callback for batch end
        if (onBatchEnd) {
          onBatchEnd(batchLoss, Math.floor(i / batchSize));
        }
      }

      // Average loss over epoch
      const avgLoss = epochLoss / batchCount;

      // Validation
      const valPredictions = this.predict(XVal);
      const valAcc = accuracy(valPredictions, YVal);

      // Record metrics
      const metrics: TrainingMetrics = {
        epoch: epoch + 1,
        loss: avgLoss,
        accuracy: valAcc,
        timestamp: Date.now(),
      };
      this.trainingHistory.push(metrics);

      // Log progress
      const duration = Date.now() - startTime;
      if (verbose) {
        console.log(
          `Epoch ${epoch + 1}/${epochs} - ${duration}ms - loss: ${avgLoss.toFixed(4)} - val_accuracy: ${(valAcc * 100).toFixed(2)}%`
        );
      }

      // Callback for epoch end
      if (onEpochEnd) {
        onEpochEnd(metrics);
      }

      // Apply learning rate decay
      if ((epoch + 1) % lrDecayStep === 0) {
        this.learningRate *= lrDecay;
        if (verbose) {
          console.log(`📉 Learning rate decayed to ${this.learningRate.toFixed(6)}`);
        }
      }
    }

    this.isTraining = false;
    console.log(`\n✅ Training complete!`);

    return this.trainingHistory;
  }

  /**
   * Make predictions on new data
   * X: input data (batchSize × inputSize)
   * returns: predictions (batchSize × outputSize)
   */
  predict(X: Matrix): Matrix {
    return this.forward(X);
  }

  /**
   * Predict with confidence scores (using MC Dropout)
   * Runs multiple forward passes with dropout enabled to estimate uncertainty
   */
  predictWithConfidence(X: Matrix, nSamples: number = 10): PredictionResult {
    if (nSamples < 1) {
      throw new Error('nSamples must be at least 1');
    }

    // Run multiple forward passes with dropout enabled (MC Dropout)
    const predictions: Matrix[] = [];
    for (let i = 0; i < nSamples; i++) {
      const pred = this.forward(X, true); // isTraining=true to enable dropout
      predictions.push(pred);
    }

    // Compute mean prediction across samples
    const meanOutput: Matrix = X.map((_, sampleIdx) => {
      const classProbs: number[] = [];
      const numClasses = predictions[0][sampleIdx].length;

      for (let classIdx = 0; classIdx < numClasses; classIdx++) {
        const sum = predictions.reduce(
          (acc, pred) => acc + pred[sampleIdx][classIdx],
          0
        );
        classProbs.push(sum / nSamples);
      }

      return classProbs;
    });

    // Compute variance across predictions (uncertainty measure)
    const variance: Matrix = X.map((_, sampleIdx) => {
      const classVariances: number[] = [];
      const numClasses = predictions[0][sampleIdx].length;

      for (let classIdx = 0; classIdx < numClasses; classIdx++) {
        const mean = meanOutput[sampleIdx][classIdx];
        const sumSquaredDiff = predictions.reduce(
          (acc, pred) => acc + Math.pow(pred[sampleIdx][classIdx] - mean, 2),
          0
        );
        classVariances.push(sumSquaredDiff / nSamples);
      }

      return classVariances;
    });

    // For single prediction
    if (meanOutput.length === 1) {
      const probs = meanOutput[0];
      const maxProb = Math.max(...probs);
      const predictedClass = probs.indexOf(maxProb);

      // Confidence = 1 - (variance of predicted class)
      // Lower variance = higher confidence
      const predictedClassVariance = variance[0][predictedClass];
      const confidence = Math.max(0, 1 - predictedClassVariance);

      return {
        output: meanOutput,
        confidence,
        predictedClass,
      };
    }

    // For batch predictions, return average confidence
    const avgConfidence =
      variance.reduce((sum, row) => sum + (1 - Math.max(...row)), 0) / variance.length;

    return {
      output: meanOutput,
      confidence: avgConfidence,
    };
  }

  /**
   * Evaluate model on test data
   */
  evaluate(X: Matrix, Y: Matrix): { loss: number; accuracy: number } {
    const predictions = this.predict(X);
    const lossFunc = getLossFunction(this.loss);
    const loss = lossFunc(predictions, Y);
    const acc = accuracy(predictions, Y);

    return { loss, accuracy: acc };
  }

  /**
   * Get network summary
   */
  summary(): void {
    console.log(`\n📊 Network Summary: ${this.name}`);
    console.log('─'.repeat(80));
    console.log(
      `${'Layer'.padEnd(20)} ${'Output Shape'.padEnd(20)} ${'Parameters'.padEnd(20)}`
    );
    console.log('─'.repeat(80));

    let totalParams = 0;
    this.layers.forEach((layer, i) => {
      const layerName = `Layer ${i + 1} (${layer.activation})`;
      const outputShape = `(batch, ${layer.outputSize})`;
      const params = layer.getParameterCount();
      totalParams += params;

      console.log(
        `${layerName.padEnd(20)} ${outputShape.padEnd(20)} ${params.toString().padEnd(20)}`
      );
    });

    console.log('─'.repeat(80));
    console.log(`Total Parameters: ${totalParams}`);
    console.log('─'.repeat(80));
  }

  /**
   * Save network weights
   */
  saveWeights(): {
    name: string;
    layers: Array<{ weights: Matrix; biases: number[] }>;
    config: { loss: LossType; learningRate: number; momentum: number };
  } {
    return {
      name: this.name,
      layers: this.layers.map(layer => layer.getWeights()),
      config: {
        loss: this.loss,
        learningRate: this.learningRate,
        momentum: this.momentum,
      },
    };
  }

  /**
   * Load network weights
   */
  loadWeights(data: {
    layers: Array<{ weights: Matrix; biases: number[] }>;
    config?: { loss?: LossType; learningRate?: number; momentum?: number };
  }): void {
    if (data.layers.length !== this.layers.length) {
      throw new Error(
        `Layer count mismatch: expected ${this.layers.length}, got ${data.layers.length}`
      );
    }

    this.layers.forEach((layer, i) => {
      layer.setWeights(data.layers[i].weights, data.layers[i].biases);
    });

    if (data.config) {
      if (data.config.loss) this.loss = data.config.loss;
      if (data.config.learningRate) this.learningRate = data.config.learningRate;
      if (data.config.momentum !== undefined) this.momentum = data.config.momentum;
    }

    console.log(`✅ Loaded weights for ${this.name}`);
  }

  /**
   * Get current learning rate
   */
  getLearningRate(): number {
    return this.learningRate;
  }

  /**
   * Set learning rate (for learning rate scheduling)
   */
  setLearningRate(lr: number): void {
    this.learningRate = lr;
    console.log(`📉 Learning rate updated to ${lr}`);
  }

  /**
   * Get all layers (for visualization)
   */
  getLayers(): Layer[] {
    return this.layers;
  }

  /**
   * Get training history
   */
  getHistory(): TrainingMetrics[] {
    return this.trainingHistory;
  }

  /**
   * Reset network (reinitialize all weights)
   */
  reset(): void {
    this.layers.forEach(layer => {
      const newLayer = new Layer({
        inputSize: layer.inputSize,
        outputSize: layer.outputSize,
        activation: layer.activation,
        name: layer.name,
      });
      const weights = newLayer.getWeights();
      layer.setWeights(weights.weights, weights.biases);
    });

    this.trainingHistory = [];
    console.log(`🔄 Network ${this.name} reset to random weights`);
  }

  /**
   * Utility: Shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Create a simple feedforward network for classification
 */
export function createClassificationNetwork(
  inputSize: number,
  hiddenSizes: number[],
  outputSize: number,
  learningRate = 0.01
): NeuralNetwork {
  const layers: LayerConfig[] = [];

  // Input to first hidden layer
  if (hiddenSizes.length > 0) {
    layers.push({
      inputSize,
      outputSize: hiddenSizes[0],
      activation: 'relu',
    });

    // Hidden layers
    for (let i = 1; i < hiddenSizes.length; i++) {
      layers.push({
        inputSize: hiddenSizes[i - 1],
        outputSize: hiddenSizes[i],
        activation: 'relu',
      });
    }

    // Last hidden to output
    layers.push({
      inputSize: hiddenSizes[hiddenSizes.length - 1],
      outputSize,
      activation: 'softmax',
    });
  } else {
    // No hidden layers
    layers.push({
      inputSize,
      outputSize,
      activation: 'softmax',
    });
  }

  return new NeuralNetwork({
    layers,
    loss: 'categoricalCrossEntropy',
    learningRate,
    name: 'classification_network',
  });
}

/**
 * Create a network for anomaly detection (binary classification)
 */
export function createAnomalyDetectionNetwork(
  inputSize: number,
  hiddenSizes: number[] = [16, 8],
  learningRate = 0.01,
  momentum = 0.9,
  dropoutRates: number[] = []
): NeuralNetwork {
  const layers: LayerConfig[] = [];

  // Input to first hidden
  layers.push({
    inputSize,
    outputSize: hiddenSizes[0],
    activation: 'relu',
    dropout: dropoutRates[0] || 0.0,
  });

  // Hidden layers
  for (let i = 1; i < hiddenSizes.length; i++) {
    layers.push({
      inputSize: hiddenSizes[i - 1],
      outputSize: hiddenSizes[i],
      activation: 'relu',
      dropout: dropoutRates[i] || 0.0,
    });
  }

  // Output layer (binary: normal vs anomaly) - no dropout
  layers.push({
    inputSize: hiddenSizes[hiddenSizes.length - 1],
    outputSize: 2,
    activation: 'softmax',
    dropout: 0.0,
  });

  return new NeuralNetwork({
    layers,
    loss: 'categoricalCrossEntropy',
    learningRate,
    momentum,
    name: 'anomaly_detector',
  });
}
