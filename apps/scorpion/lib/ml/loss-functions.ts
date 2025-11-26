/**
 * Loss Functions for Neural Network
 * Implements Cross-Entropy, MSE and their derivatives
 * Pure TypeScript implementation
 */

import type { Matrix } from './matrix';

/**
 * Mean Squared Error (MSE) Loss
 * L = (1/n) * Σ(y_pred - y_true)^2
 * Used for regression tasks
 */
export function meanSquaredError(predictions: Matrix, targets: Matrix): number {
  if (predictions.length !== targets.length || predictions[0].length !== targets[0].length) {
    throw new Error('Predictions and targets must have the same shape');
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < predictions.length; i++) {
    for (let j = 0; j < predictions[i].length; j++) {
      const diff = predictions[i][j] - targets[i][j];
      sum += diff * diff;
      count++;
    }
  }

  return sum / count;
}

/**
 * MSE Derivative
 * dL/dy_pred = 2 * (y_pred - y_true) / n
 */
export function meanSquaredErrorDerivative(predictions: Matrix, targets: Matrix): Matrix {
  const n = predictions.length * predictions[0].length;

  return predictions.map((row, i) =>
    row.map((val, j) => (2 * (val - targets[i][j])) / n)
  );
}

/**
 * Binary Cross-Entropy Loss
 * L = -(1/n) * Σ[y_true * log(y_pred) + (1 - y_true) * log(1 - y_pred)]
 * Used for binary classification
 */
export function binaryCrossEntropy(predictions: Matrix, targets: Matrix, epsilon = 1e-15): number {
  if (predictions.length !== targets.length || predictions[0].length !== targets[0].length) {
    throw new Error('Predictions and targets must have the same shape');
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < predictions.length; i++) {
    for (let j = 0; j < predictions[i].length; j++) {
      // Clip predictions to prevent log(0)
      const pred = Math.max(epsilon, Math.min(1 - epsilon, predictions[i][j]));
      const target = targets[i][j];

      sum += -(target * Math.log(pred) + (1 - target) * Math.log(1 - pred));
      count++;
    }
  }

  return sum / count;
}

/**
 * Binary Cross-Entropy Derivative
 * dL/dy_pred = -(y_true / y_pred) + (1 - y_true) / (1 - y_pred)
 */
export function binaryCrossEntropyDerivative(
  predictions: Matrix,
  targets: Matrix,
  epsilon = 1e-15
): Matrix {
  return predictions.map((row, i) =>
    row.map((val, j) => {
      // Clip predictions to prevent division by zero
      const pred = Math.max(epsilon, Math.min(1 - epsilon, val));
      const target = targets[i][j];

      return -(target / pred) + (1 - target) / (1 - pred);
    })
  );
}

/**
 * Categorical Cross-Entropy Loss
 * L = -(1/n) * ΣΣ y_true * log(y_pred)
 * Used for multi-class classification
 */
export function categoricalCrossEntropy(
  predictions: Matrix,
  targets: Matrix,
  epsilon = 1e-15
): number {
  if (predictions.length !== targets.length || predictions[0].length !== targets[0].length) {
    throw new Error('Predictions and targets must have the same shape');
  }

  let sum = 0;
  const n = predictions.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < predictions[i].length; j++) {
      // Clip predictions to prevent log(0)
      const pred = Math.max(epsilon, Math.min(1, predictions[i][j]));
      sum += -targets[i][j] * Math.log(pred);
    }
  }

  return sum / n;
}

/**
 * Categorical Cross-Entropy Derivative
 * When combined with softmax, simplifies to: y_pred - y_true
 * This is the gradient that flows back from the loss
 */
export function categoricalCrossEntropyDerivative(
  predictions: Matrix,
  targets: Matrix
): Matrix {
  // For softmax + cross-entropy, derivative simplifies to predictions - targets
  return predictions.map((row, i) =>
    row.map((val, j) => val - targets[i][j])
  );
}

/**
 * Sparse Categorical Cross-Entropy Loss
 * Same as categorical but targets are class indices instead of one-hot
 * L = -(1/n) * Σ log(y_pred[class_index])
 */
export function sparseCategoricalCrossEntropy(
  predictions: Matrix,
  targets: number[],
  epsilon = 1e-15
): number {
  if (predictions.length !== targets.length) {
    throw new Error('Number of predictions must match number of targets');
  }

  let sum = 0;
  const n = predictions.length;

  for (let i = 0; i < n; i++) {
    const classIndex = targets[i];
    const pred = Math.max(epsilon, Math.min(1, predictions[i][classIndex]));
    sum += -Math.log(pred);
  }

  return sum / n;
}

/**
 * Huber Loss (Smooth L1 Loss)
 * Combines MSE and MAE - less sensitive to outliers than MSE
 * L = 0.5 * (y_pred - y_true)^2                    if |y_pred - y_true| <= delta
 * L = delta * (|y_pred - y_true| - 0.5 * delta)   otherwise
 */
export function huberLoss(predictions: Matrix, targets: Matrix, delta = 1.0): number {
  if (predictions.length !== targets.length || predictions[0].length !== targets[0].length) {
    throw new Error('Predictions and targets must have the same shape');
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < predictions.length; i++) {
    for (let j = 0; j < predictions[i].length; j++) {
      const diff = Math.abs(predictions[i][j] - targets[i][j]);

      if (diff <= delta) {
        sum += 0.5 * diff * diff;
      } else {
        sum += delta * (diff - 0.5 * delta);
      }
      count++;
    }
  }

  return sum / count;
}

/**
 * Huber Loss Derivative
 */
export function huberLossDerivative(predictions: Matrix, targets: Matrix, delta = 1.0): Matrix {
  return predictions.map((row, i) =>
    row.map((val, j) => {
      const diff = val - targets[i][j];
      const absDiff = Math.abs(diff);

      if (absDiff <= delta) {
        return diff;
      } else {
        return delta * Math.sign(diff);
      }
    })
  );
}

/**
 * Mean Absolute Error (MAE) / L1 Loss
 * L = (1/n) * Σ|y_pred - y_true|
 * More robust to outliers than MSE
 */
export function meanAbsoluteError(predictions: Matrix, targets: Matrix): number {
  if (predictions.length !== targets.length || predictions[0].length !== targets[0].length) {
    throw new Error('Predictions and targets must have the same shape');
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < predictions.length; i++) {
    for (let j = 0; j < predictions[i].length; j++) {
      sum += Math.abs(predictions[i][j] - targets[i][j]);
      count++;
    }
  }

  return sum / count;
}

/**
 * MAE Derivative
 * dL/dy_pred = sign(y_pred - y_true) / n
 */
export function meanAbsoluteErrorDerivative(predictions: Matrix, targets: Matrix): Matrix {
  const n = predictions.length * predictions[0].length;

  return predictions.map((row, i) =>
    row.map((val, j) => Math.sign(val - targets[i][j]) / n)
  );
}

/**
 * Loss function type
 */
export type LossType = 'mse' | 'mae' | 'binaryCrossEntropy' | 'categoricalCrossEntropy' | 'huber';

/**
 * Get loss function by name
 */
export function getLossFunction(
  name: LossType
): (predictions: Matrix, targets: Matrix) => number {
  switch (name) {
    case 'mse':
      return meanSquaredError;
    case 'mae':
      return meanAbsoluteError;
    case 'binaryCrossEntropy':
      return binaryCrossEntropy;
    case 'categoricalCrossEntropy':
      return categoricalCrossEntropy;
    case 'huber':
      return huberLoss;
    default:
      throw new Error(`Unknown loss function: ${name}`);
  }
}

/**
 * Get loss derivative by name
 */
export function getLossDerivative(
  name: LossType
): (predictions: Matrix, targets: Matrix) => Matrix {
  switch (name) {
    case 'mse':
      return meanSquaredErrorDerivative;
    case 'mae':
      return meanAbsoluteErrorDerivative;
    case 'binaryCrossEntropy':
      return binaryCrossEntropyDerivative;
    case 'categoricalCrossEntropy':
      return categoricalCrossEntropyDerivative;
    case 'huber':
      return huberLossDerivative;
    default:
      throw new Error(`Unknown loss function: ${name}`);
  }
}

/**
 * Accuracy metric for classification
 * Returns percentage of correct predictions
 */
export function accuracy(predictions: Matrix, targets: Matrix): number {
  let correct = 0;
  const n = predictions.length;

  for (let i = 0; i < n; i++) {
    // Find index of max value in prediction and target
    const predClass = predictions[i].indexOf(Math.max(...predictions[i]));
    const targetClass = targets[i].indexOf(Math.max(...targets[i]));

    if (predClass === targetClass) {
      correct++;
    }
  }

  return correct / n;
}
