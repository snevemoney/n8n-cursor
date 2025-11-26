/**
 * Transformer-Style Positional Encoding for Agent System
 * 
 * Adds sequence awareness to multi-agent workflows, similar to how
 * transformers use positional encoding to understand word order.
 * 
 * Power of 10 Rule 3: Functions ≤ 60 lines
 */

export interface PositionalContext {
  position: number;        // Step in sequence (0, 1, 2, ...)
  totalSteps: number;      // Total steps in sequence
  phase: string;           // Current phase (PLAN, COUNCIL, EXECUTE, etc.)
  encoding: number[];      // Positional encoding vector
}

/**
 * Sinusoidal positional encoding (like transformer)
 * Creates unique encoding for each position
 */
export function createSinusoidalEncoding(
  position: number,
  dModel: number
): number[] {
  const encoding: number[] = [];
  
  for (let i = 0; i < dModel; i++) {
    if (i % 2 === 0) {
      encoding.push(Math.sin(position / Math.pow(10000, i / dModel)));
    } else {
      encoding.push(Math.cos(position / Math.pow(10000, (i - 1) / dModel)));
    }
  }
  
  return encoding;
}

/**
 * Learned positional encoding (alternative approach)
 * Can be trained/updated based on actual agent behavior
 */
export class LearnedPositionalEncoding {
  private encodings: Map<string, number[]> = new Map();
  private dModel: number;
  
  constructor(dModel: number = 64) {
    this.dModel = dModel;
  }
  
  getEncoding(position: number, phase: string): number[] {
    const key = `${phase}:${position}`;
    
    if (!this.encodings.has(key)) {
      // Initialize with small random values (would be learned in training)
      const encoding = Array(this.dModel)
        .fill(0)
        .map(() => (Math.random() - 0.5) * 0.1);
      this.encodings.set(key, encoding);
    }
    
    return this.encodings.get(key)!;
  }
  
  updateEncoding(position: number, phase: string, gradient: number[]): void {
    const key = `${phase}:${position}`;
    const current = this.getEncoding(position, phase);
    const updated = current.map((val, i) => val + gradient[i] * 0.01); // Learning rate
    this.encodings.set(key, updated);
  }
}

/**
 * Create positional context for an agent step
 */
export function createPositionalContext(
  position: number,
  totalSteps: number,
  phase: string,
  encodingType: 'sinusoidal' | 'learned' = 'sinusoidal',
  learnedEncoder?: LearnedPositionalEncoding
): PositionalContext {
  const dModel = 64;
  let encoding: number[];
  
  if (encodingType === 'learned' && learnedEncoder) {
    encoding = learnedEncoder.getEncoding(position, phase);
  } else {
    encoding = createSinusoidalEncoding(position, dModel);
  }
  
  return {
    position,
    totalSteps,
    phase,
    encoding,
  };
}

/**
 * Add positional encoding to agent context
 */
export function addPositionalEncoding(
  context: Record<string, unknown>,
  positionalContext: PositionalContext
): Record<string, unknown> {
  return {
    ...context,
    positionalEncoding: positionalContext.encoding,
    position: positionalContext.position,
    totalSteps: positionalContext.totalSteps,
    phase: positionalContext.phase,
    // Add relative position info
    relativePosition: positionalContext.position / Math.max(1, positionalContext.totalSteps - 1),
    isFirst: positionalContext.position === 0,
    isLast: positionalContext.position === positionalContext.totalSteps - 1,
  };
}

/**
 * Phase-specific positional encoding
 * Different phases get different encoding patterns
 */
export function getPhaseEncoding(phase: string): number[] {
  const phaseMap: Record<string, number[]> = {
    PLAN: [1, 0, 0, 0],
    COUNCIL: [0, 1, 0, 0],
    TOOL_SELECT: [0, 0, 1, 0],
    KNOWLEDGE: [0, 0, 0, 1],
    EXECUTE: [0.5, 0.5, 0.5, 0.5],
    SUMMARIZE: [1, 1, 1, 1],
  };
  
  return phaseMap[phase] || [0, 0, 0, 0];
}

