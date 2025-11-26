// apps/scorpion/app/api/chat/stream/helpers/loopHelpers.ts
// Power of 10 Rule 2: All loops must have explicit max-iteration counters

/**
 * Bounded array iteration helper
 * Power of 10 Rule 2: Ensures all loops have fixed upper bounds
 */
export function boundedForEach<T>(
  array: T[],
  callback: (item: T, index: number) => void,
  maxIterations: number = 10000
): void {
  // Power of 10 Rule 4: Assertions
  if (!Array.isArray(array)) {
    return;
  }

  if (typeof callback !== 'function') {
    return;
  }

  // Power of 10 Rule 2: Bounded loop
  const limit = Math.min(array.length, maxIterations);
  for (let i = 0; i < limit; i++) {
    const item = array[i];
    if (item !== undefined) {
      callback(item, i);
    }
  }

  if (array.length > maxIterations) {
    console.warn(`[Bounded Loop] Array length ${array.length} exceeds max ${maxIterations}, truncated`);
  }
}

/**
 * Bounded map helper
 * Power of 10 Rule 2: Ensures all loops have fixed upper bounds
 */
export function boundedMap<T, R>(
  array: T[],
  callback: (item: T, index: number) => R,
  maxIterations: number = 10000
): R[] {
  // Power of 10 Rule 4: Assertions
  if (!Array.isArray(array)) {
    return [];
  }

  if (typeof callback !== 'function') {
    return [];
  }

  // Power of 10 Rule 2: Bounded loop
  const limit = Math.min(array.length, maxIterations);
  const result: R[] = [];

  for (let i = 0; i < limit; i++) {
    const item = array[i];
    if (item !== undefined) {
      const mapped = callback(item, i);
      result.push(mapped);
    }
  }

  if (array.length > maxIterations) {
    console.warn(`[Bounded Loop] Array length ${array.length} exceeds max ${maxIterations}, truncated`);
  }

  return result;
}

/**
 * Bounded filter helper
 * Power of 10 Rule 2: Ensures all loops have fixed upper bounds
 */
export function boundedFilter<T>(
  array: T[],
  callback: (item: T, index: number) => boolean,
  maxIterations: number = 10000
): T[] {
  // Power of 10 Rule 4: Assertions
  if (!Array.isArray(array)) {
    return [];
  }

  if (typeof callback !== 'function') {
    return [];
  }

  // Power of 10 Rule 2: Bounded loop
  const limit = Math.min(array.length, maxIterations);
  const result: T[] = [];

  for (let i = 0; i < limit; i++) {
    const item = array[i];
    if (item !== undefined && callback(item, i)) {
      result.push(item);
    }
  }

  if (array.length > maxIterations) {
    console.warn(`[Bounded Loop] Array length ${array.length} exceeds max ${maxIterations}, truncated`);
  }

  return result;
}

// Power of 10 Rule 2: Constants for bounded loops
export const MAX_ITERATIONS_DEFAULT = 1000;
export const MAX_EDITS = 1000;
export const MAX_PATTERNS = 100;
export const MAX_PLAN_STEPS = 1000;
export const MAX_ERRORS = 1000;
export const MAX_HITS = 10000;
export const MAX_TOOLS = 1000;
export const MAX_SOURCES = 10000;
export const MAX_RESULTS = 1000;
export const MAX_CHUNKS = 1000; // For delta event streaming

