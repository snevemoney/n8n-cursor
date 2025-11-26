/**
 * Layer class for Neural Network
 * Represents a single layer with weights, biases, and activations
 */

import type { Matrix, Vector } from './matrix';
import {
  matrixMultiply,
  transpose,
  matrixAdd,
  matrixHadamard,
  matrixScalarMultiply,
  addBias,
  sumAxis,
  randomMatrix,
  zeros,
} from './matrix';
import { getActivation, getActivationDerivative, type ActivationType } from './activations';

export interface LayerConfig {
  inputSize: number;
  outputSize: number;
  activation: ActivationType;
  dropout?: number; // Dropout rate (0.0 to 1.0)
  name?: string;
}

export interface LayerState {
  input: Matrix;
  weightedSum: Matrix;
  output: Matrix;
  weights: Matrix;
  biases: Vector;
}

/**
 * Dense (Fully Connected) Layer
 */
export class Layer {
  public inputSize: number;
  public outputSize: number;
  public activation: ActivationType;
  public dropout: number;
  public name: string;

  // Trainable parameters
  public weights: Matrix; // (inputSize × outputSize)
  public biases: Vector; // (outputSize)

  // Cached values for backpropagation
  private input: Matrix | null = null;
  private weightedSum: Matrix | null = null;
  private output: Matrix | null = null;
  private dropoutMask: Matrix | null = null; // Dropout mask for backprop

  // Gradient accumulators (for mini-batch training)
  private weightsGradient: Matrix | null = null;
  private biasesGradient: Vector | null = null;
  private gradientCount = 0;

  // Momentum velocity (for SGD with momentum)
  private weightsVelocity: Matrix | null = null;
  private biasesVelocity: Vector | null = null;

  constructor(config: LayerConfig) {
    this.inputSize = config.inputSize;
    this.outputSize = config.outputSize;
    this.activation = config.activation;
    this.dropout = config.dropout || 0.0;
    this.name = config.name || `layer_${config.inputSize}_${config.outputSize}`;

    // Initialize weights with Xavier/Glorot initialization
    this.weights = randomMatrix(this.inputSize, this.outputSize);

    // Initialize biases to zero
    this.biases = Array(this.outputSize).fill(0);
  }

  /**
   * Forward pass through the layer
   * input: (batchSize × inputSize)
   * output: (batchSize × outputSize)
   * isTraining: whether to apply dropout (only during training)
   */
  forward(input: Matrix, isTraining: boolean = false): Matrix {
    // Cache input for backpropagation
    this.input = input;

    // Weighted sum: Z = X·W + b
    const weighted = matrixMultiply(input, this.weights);
    this.weightedSum = addBias(weighted, this.biases);

    // Apply activation function: A = activation(Z)
    const activationFn = getActivation(this.activation);
    this.output = activationFn(this.weightedSum);

    // Apply dropout if enabled and training
    if (this.dropout > 0 && isTraining) {
      const { output, mask } = this.applyDropout(this.output, this.dropout);
      this.output = output;
      this.dropoutMask = mask;
    } else {
      this.dropoutMask = null;
    }

    return this.output;
  }

  /**
   * Backward pass through the layer
   * outputGradient: gradient flowing back from next layer (batchSize × outputSize)
   * returns: gradient to flow back to previous layer (batchSize × inputSize)
   */
  backward(outputGradient: Matrix, learningRate: number): Matrix {
    if (!this.input || !this.weightedSum || !this.output) {
      throw new Error('Must call forward() before backward()');
    }

    const batchSize = this.input.length;

    // Apply dropout mask to gradient if dropout was used
    let gradient = outputGradient;
    if (this.dropoutMask) {
      gradient = matrixHadamard(gradient, this.dropoutMask);
    }

    // Apply activation derivative
    if (this.activation !== 'softmax') {
      // For softmax, gradient is already computed with loss derivative
      const activationDeriv = getActivationDerivative(this.activation);
      const dActivation = activationDeriv(this.weightedSum);
      gradient = matrixHadamard(gradient, dActivation);
    }

    // Compute gradients
    // dW = X^T · dZ / batchSize
    const inputTranspose = transpose(this.input);
    const weightsGrad = matrixMultiply(inputTranspose, gradient);
    let weightsGradNorm = matrixScalarMultiply(weightsGrad, 1 / batchSize);

    // db = sum(dZ, axis=0) / batchSize
    let biasesGrad = sumAxis(gradient, 0).map(val => val / batchSize);

    // Apply gradient clipping
    weightsGradNorm = this.clipGradient(weightsGradNorm, 1.0);
    biasesGrad = biasesGrad.map(val => Math.max(-1.0, Math.min(1.0, val)));

    // Accumulate gradients (for mini-batch)
    if (this.weightsGradient === null) {
      this.weightsGradient = weightsGradNorm;
      this.biasesGradient = biasesGrad;
    } else {
      this.weightsGradient = matrixAdd(this.weightsGradient, weightsGradNorm);
      this.biasesGradient = this.biasesGradient.map((val, i) => val + biasesGrad[i]);
    }
    this.gradientCount++;

    // Compute gradient to flow back: dX = dZ · W^T
    const weightsTranspose = transpose(this.weights);
    const inputGradient = matrixMultiply(gradient, weightsTranspose);

    return inputGradient;
  }

  /**
   * Apply accumulated gradients to update weights and biases
   * Called after processing a mini-batch
   * momentum: momentum coefficient (0.0 = vanilla SGD, 0.9 = typical momentum)
   */
  applyGradients(learningRate: number, momentum: number = 0.0): void {
    if (!this.weightsGradient || !this.biasesGradient || this.gradientCount === 0) {
      return;
    }

    // Average gradients over mini-batch
    const avgWeightsGrad = matrixScalarMultiply(
      this.weightsGradient,
      1 / this.gradientCount
    );
    const avgBiasesGrad = this.biasesGradient.map(val => val / this.gradientCount);

    if (momentum > 0) {
      // Initialize velocity on first update
      if (this.weightsVelocity === null) {
        this.weightsVelocity = zeros(this.inputSize, this.outputSize);
        this.biasesVelocity = Array(this.outputSize).fill(0);
      }

      // Update velocity: v = β * v - lr * grad
      this.weightsVelocity = this.weightsVelocity.map((row, i) =>
        row.map((val, j) => momentum * val - learningRate * avgWeightsGrad[i][j])
      );
      this.biasesVelocity = this.biasesVelocity!.map(
        (val, i) => momentum * val - learningRate * avgBiasesGrad[i]
      );

      // Update parameters: W = W + v
      this.weights = this.weights.map((row, i) =>
        row.map((val, j) => val + this.weightsVelocity![i][j])
      );
      this.biases = this.biases.map((val, i) => val + this.biasesVelocity![i]);
    } else {
      // Vanilla SGD: W = W - lr * dW
      this.weights = this.weights.map((row, i) =>
        row.map((val, j) => val - learningRate * avgWeightsGrad[i][j])
      );
      this.biases = this.biases.map((val, i) => val - learningRate * avgBiasesGrad[i]);
    }

    // Reset gradient accumulators
    this.weightsGradient = null;
    this.biasesGradient = null;
    this.gradientCount = 0;
  }

  /**
   * Get layer state (for visualization/debugging)
   */
  getState(): LayerState {
    if (!this.input || !this.weightedSum || !this.output) {
      throw new Error('Layer has not been used in forward pass yet');
    }

    return {
      input: this.input,
      weightedSum: this.weightedSum,
      output: this.output,
      weights: this.weights,
      biases: this.biases,
    };
  }

  /**
   * Get weights for serialization
   */
  getWeights(): { weights: Matrix; biases: Vector } {
    return {
      weights: this.weights,
      biases: this.biases,
    };
  }

  /**
   * Set weights from serialized data
   */
  setWeights(weights: Matrix, biases: Vector): void {
    if (weights.length !== this.inputSize || weights[0].length !== this.outputSize) {
      throw new Error(
        `Weight shape mismatch: expected (${this.inputSize}, ${this.outputSize}), got (${weights.length}, ${weights[0].length})`
      );
    }

    if (biases.length !== this.outputSize) {
      throw new Error(
        `Bias shape mismatch: expected ${this.outputSize}, got ${biases.length}`
      );
    }

    this.weights = weights;
    this.biases = biases;
  }

  /**
   * Get number of parameters in this layer
   */
  getParameterCount(): number {
    const weightParams = this.inputSize * this.outputSize;
    const biasParams = this.outputSize;
    return weightParams + biasParams;
  }

  /**
   * Reset cached values (call between different forward passes)
   */
  reset(): void {
    this.input = null;
    this.weightedSum = null;
    this.output = null;
    this.dropoutMask = null;
  }

  /**
   * Get current output (for visualization)
   */
  getOutput(): Matrix | null {
    return this.output;
  }

  /**
   * Apply dropout to a matrix during training
   * Implements inverted dropout (scale during training, not inference)
   * Returns both the dropped-out output and the mask for backprop
   */
  private applyDropout(input: Matrix, dropoutRate: number): { output: Matrix; mask: Matrix } {
    const keepProb = 1.0 - dropoutRate;
    const scale = 1.0 / keepProb; // Inverted dropout scaling

    const mask: Matrix = input.map(row =>
      row.map(() => (Math.random() > dropoutRate ? scale : 0))
    );

    const output: Matrix = input.map((row, i) => row.map((val, j) => val * mask[i][j]));

    return { output, mask };
  }

  /**
   * Clip gradients to prevent exploding gradients
   * Clips each element to [-clipValue, clipValue]
   */
  private clipGradient(gradient: Matrix, clipValue: number): Matrix {
    return gradient.map(row => row.map(val => Math.max(-clipValue, Math.min(clipValue, val))));
  }
}
