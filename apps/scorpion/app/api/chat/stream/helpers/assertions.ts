// apps/scorpion/app/api/chat/stream/helpers/assertions.ts
// Power of 10 Rule 4: The assertion density should average at least two assertions per function

/**
 * Assert a condition is true, throw if false
 * Power of 10 Rule 4: Assertions for fail-fast behavior
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert value is not null or undefined
 * Power of 10 Rule 4: Assertions for parameter validation
 */
export function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message} - value is null or undefined`);
  }
}

/**
 * Assert value is a string
 * Power of 10 Rule 4: Assertions for type validation
 */
export function assertString(value: unknown, message: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Assertion failed: ${message} - expected string, got ${typeof value}`);
  }
}

/**
 * Assert value is an array
 * Power of 10 Rule 4: Assertions for type validation
 */
export function assertArray<T>(value: unknown, message: string): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Assertion failed: ${message} - expected array, got ${typeof value}`);
  }
}

/**
 * Assert value is an object
 * Power of 10 Rule 4: Assertions for type validation
 */
export function assertObject(value: unknown, message: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Assertion failed: ${message} - expected object, got ${typeof value}`);
  }
}

/**
 * Assert number is within bounds
 * Power of 10 Rule 4: Assertions for bounds checking
 */
export function assertInBounds(
  value: number,
  min: number,
  max: number,
  message: string
): asserts value is number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`Assertion failed: ${message} - expected number`);
  }
  if (value < min || value > max) {
    throw new Error(`Assertion failed: ${message} - value ${value} out of bounds [${min}, ${max}]`);
  }
}

