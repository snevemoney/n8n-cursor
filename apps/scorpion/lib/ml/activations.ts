/**
 * Activation Functions for Neural Network
 * Implements ReLU, Sigmoid, Softmax and their derivatives
 * Pure TypeScript implementation (no ML libraries)
 */

export type Matrix = number[][];
export type Vector = number[];

/**
 * ReLU (Rectified Linear Unit)
 * f(x) = max(0, x)
 * Introduces non-linearity while being computationally efficient
 */
export function relu(x: Matrix): Matrix {
  return x.map(row => row.map(val => Math.max(0, val)));
}

/**
 * ReLU Derivative
 * f'(x) = 1 if x > 0, else 0
 * Used in backpropagation
 */
export function reluDerivative(x: Matrix): Matrix {
  return x.map(row => row.map(val => (val > 0 ? 1 : 0)));
}

/**
 * Sigmoid Activation
 * f(x) = 1 / (1 + e^(-x))
 * Squashes values to (0, 1) range
 */
export function sigmoid(x: Matrix): Matrix {
  return x.map(row => row.map(val => 1 / (1 + Math.exp(-val))));
}

/**
 * Sigmoid Derivative
 * f'(x) = f(x) * (1 - f(x))
 * Used in backpropagation
 */
export function sigmoidDerivative(x: Matrix): Matrix {
  const sig = sigmoid(x);
  return sig.map((row, i) => row.map((val, j) => val * (1 - val)));
}

/**
 * Softmax Activation
 * Converts raw scores to probability distribution
 * Used in output layer for classification
 *
 * f(x_i) = e^(x_i) / sum(e^(x_j))
 */
export function softmax(x: Matrix): Matrix {
  return x.map(row => {
    // Subtract max for numerical stability
    const maxVal = Math.max(...row);
    const exp = row.map(val => Math.exp(val - maxVal));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(val => val / sum);
  });
}

/**
 * Softmax Derivative
 * For use in backpropagation with cross-entropy loss
 * When combined with cross-entropy, derivative simplifies to (output - target)
 */
export function softmaxDerivative(output: Matrix, target: Matrix): Matrix {
  return output.map((row, i) =>
    row.map((val, j) => val - target[i][j])
  );
}

/**
 * Tanh Activation
 * f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
 * Squashes values to (-1, 1) range
 */
export function tanh(x: Matrix): Matrix {
  return x.map(row => row.map(val => Math.tanh(val)));
}

/**
 * Tanh Derivative
 * f'(x) = 1 - tanh(x)^2
 */
export function tanhDerivative(x: Matrix): Matrix {
  const tanhVals = tanh(x);
  return tanhVals.map(row => row.map(val => 1 - val * val));
}

/**
 * Leaky ReLU
 * f(x) = max(0.01x, x)
 * Allows small negative values to pass through
 */
export function leakyRelu(x: Matrix, alpha = 0.01): Matrix {
  return x.map(row => row.map(val => (val > 0 ? val : alpha * val)));
}

/**
 * Leaky ReLU Derivative
 * f'(x) = 1 if x > 0, else alpha
 */
export function leakyReluDerivative(x: Matrix, alpha = 0.01): Matrix {
  return x.map(row => row.map(val => (val > 0 ? 1 : alpha)));
}

/**
 * No activation (identity function)
 * f(x) = x
 * Used when no activation is needed
 */
export function linear(x: Matrix): Matrix {
  return x;
}

/**
 * Linear Derivative
 * f'(x) = 1
 */
export function linearDerivative(x: Matrix): Matrix {
  return x.map(row => row.map(() => 1));
}

/**
 * Activation function type
 */
export type ActivationType = 'relu' | 'sigmoid' | 'softmax' | 'tanh' | 'leakyRelu' | 'linear';

/**
 * Get activation function by name
 */
export function getActivation(name: ActivationType): (x: Matrix) => Matrix {
  switch (name) {
    case 'relu':
      return relu;
    case 'sigmoid':
      return sigmoid;
    case 'softmax':
      return softmax;
    case 'tanh':
      return tanh;
    case 'leakyRelu':
      return leakyRelu;
    case 'linear':
      return linear;
    default:
      throw new Error(`Unknown activation function: ${name}`);
  }
}

/**
 * Get activation derivative by name
 */
export function getActivationDerivative(name: ActivationType): (x: Matrix) => Matrix {
  switch (name) {
    case 'relu':
      return reluDerivative;
    case 'sigmoid':
      return sigmoidDerivative;
    case 'tanh':
      return tanhDerivative;
    case 'leakyRelu':
      return leakyReluDerivative;
    case 'linear':
      return linearDerivative;
    case 'softmax':
      // Softmax derivative is handled specially with cross-entropy
      throw new Error('Use softmaxDerivative(output, target) for softmax');
    default:
      throw new Error(`Unknown activation function: ${name}`);
  }
}
