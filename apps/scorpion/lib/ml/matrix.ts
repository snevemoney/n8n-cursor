/**
 * Matrix Operations for Neural Network
 * Pure TypeScript implementation of common matrix operations
 */

export type Matrix = number[][];
export type Vector = number[];

/**
 * Matrix multiplication: A × B
 * A: (m × n), B: (n × p) → Result: (m × p)
 */
export function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;

  if (aCols !== bRows) {
    throw new Error(`Cannot multiply matrices: (${aRows}×${aCols}) × (${bRows}×${bCols})`);
  }

  const result: Matrix = Array(aRows)
    .fill(0)
    .map(() => Array(bCols).fill(0));

  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

/**
 * Matrix transpose: A^T
 * A: (m × n) → Result: (n × m)
 */
export function transpose(matrix: Matrix): Matrix {
  const rows = matrix.length;
  const cols = matrix[0].length;

  const result: Matrix = Array(cols)
    .fill(0)
    .map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

/**
 * Element-wise matrix addition: A + B
 */
export function matrixAdd(a: Matrix, b: Matrix): Matrix {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for addition');
  }

  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

/**
 * Element-wise matrix subtraction: A - B
 */
export function matrixSubtract(a: Matrix, b: Matrix): Matrix {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for subtraction');
  }

  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

/**
 * Element-wise matrix multiplication (Hadamard product): A ⊙ B
 */
export function matrixHadamard(a: Matrix, b: Matrix): Matrix {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for Hadamard product');
  }

  return a.map((row, i) => row.map((val, j) => val * b[i][j]));
}

/**
 * Scalar multiplication: scalar × Matrix
 */
export function matrixScalarMultiply(matrix: Matrix, scalar: number): Matrix {
  return matrix.map(row => row.map(val => val * scalar));
}

/**
 * Scalar addition: scalar + Matrix
 */
export function matrixScalarAdd(matrix: Matrix, scalar: number): Matrix {
  return matrix.map(row => row.map(val => val + scalar));
}

/**
 * Initialize random matrix with Xavier/Glorot initialization
 * Helps prevent vanishing/exploding gradients
 */
export function randomMatrix(rows: number, cols: number): Matrix {
  const limit = Math.sqrt(6 / (rows + cols)); // Xavier initialization
  return Array(rows)
    .fill(0)
    .map(() =>
      Array(cols)
        .fill(0)
        .map(() => (Math.random() * 2 - 1) * limit)
    );
}

/**
 * Initialize zero matrix
 */
export function zeros(rows: number, cols: number): Matrix {
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));
}

/**
 * Initialize matrix with ones
 */
export function ones(rows: number, cols: number): Matrix {
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(1));
}

/**
 * Sum all elements in matrix
 */
export function matrixSum(matrix: Matrix): number {
  return matrix.reduce((sum, row) => sum + row.reduce((rowSum, val) => rowSum + val, 0), 0);
}

/**
 * Mean of all elements in matrix
 */
export function matrixMean(matrix: Matrix): number {
  const sum = matrixSum(matrix);
  const count = matrix.length * matrix[0].length;
  return sum / count;
}

/**
 * Flatten matrix to 1D array
 */
export function flatten(matrix: Matrix): number[] {
  return matrix.reduce((acc, row) => acc.concat(row), []);
}

/**
 * Reshape 1D array to matrix
 */
export function reshape(array: number[], rows: number, cols: number): Matrix {
  if (array.length !== rows * cols) {
    throw new Error(`Cannot reshape array of length ${array.length} to ${rows}×${cols}`);
  }

  const matrix: Matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push(array.slice(i * cols, (i + 1) * cols));
  }
  return matrix;
}

/**
 * Add broadcast support for bias addition
 * Adds vector to each row of matrix
 */
export function addBias(matrix: Matrix, bias: Vector): Matrix {
  return matrix.map(row => row.map((val, i) => val + bias[i]));
}

/**
 * Calculate sum along axis (0 = columns, 1 = rows)
 */
export function sumAxis(matrix: Matrix, axis: 0 | 1): Vector {
  if (axis === 0) {
    // Sum columns (return row vector)
    const cols = matrix[0].length;
    const result: Vector = Array(cols).fill(0);
    matrix.forEach(row => {
      row.forEach((val, j) => {
        result[j] += val;
      });
    });
    return result;
  } else {
    // Sum rows (return column vector)
    return matrix.map(row => row.reduce((sum, val) => sum + val, 0));
  }
}

/**
 * Normalize matrix values to [0, 1] range
 */
export function normalize(matrix: Matrix): Matrix {
  const flat = flatten(matrix);
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const range = max - min;

  if (range === 0) return matrix;

  return matrix.map(row => row.map(val => (val - min) / range));
}

/**
 * Standardize matrix (zero mean, unit variance)
 */
export function standardize(matrix: Matrix): Matrix {
  const flat = flatten(matrix);
  const mean = flat.reduce((sum, val) => sum + val, 0) / flat.length;
  const variance =
    flat.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flat.length;
  const std = Math.sqrt(variance);

  if (std === 0) return matrix;

  return matrix.map(row => row.map(val => (val - mean) / std));
}

/**
 * Apply function element-wise to matrix
 */
export function matrixMap(matrix: Matrix, fn: (val: number) => number): Matrix {
  return matrix.map(row => row.map(fn));
}

/**
 * Check if matrices have same shape
 */
export function sameShape(a: Matrix, b: Matrix): boolean {
  return a.length === b.length && a[0].length === b[0].length;
}

/**
 * Get matrix shape [rows, cols]
 */
export function shape(matrix: Matrix): [number, number] {
  return [matrix.length, matrix[0].length];
}

/**
 * Print matrix (for debugging)
 */
export function printMatrix(matrix: Matrix, label?: string): void {
  if (label) console.log(`\n${label}:`);
  console.log(
    matrix.map(row => row.map(val => val.toFixed(4)).join(', ')).join('\n')
  );
}
