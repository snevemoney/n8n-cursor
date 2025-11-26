/**
 * Minimal Transformer Demo - Mirrors Scorpion Architecture
 * 
 * This is a simplified transformer implementation that demonstrates
 * how Scorpion's architecture maps to transformer concepts:
 * 
 * - Input & Context → Tokenization + Embeddings
 * - Planner → Encoder Self-Attention
 * - Council → Multi-Head Attention
 * - Tools & RAG → Cross-Attention
 * - Executor → Decoder
 * - Summarizer → Output Projection
 * 
 * Power of 10 Rule 3: Functions ≤ 60 lines
 */

export interface MiniTransformerConfig {
  vocabSize: number;
  dModel: number;      // Model dimension (e.g., 128)
  nHeads: number;      // Number of attention heads (e.g., 4)
  nLayers: number;     // Number of layers (e.g., 2)
  dFF: number;         // Feed-forward dimension (e.g., 512)
  maxSeqLen: number;   // Maximum sequence length
}

export interface Token {
  id: number;
  text: string;
  embedding: number[];
}

export interface AttentionHead {
  q: number[][];  // Query weights
  k: number[][];  // Key weights
  v: number[][];  // Value weights
}

export interface TransformerLayer {
  selfAttention: AttentionHead[];
  crossAttention?: AttentionHead;  // For decoder layers
  ffn: {
    w1: number[][];
    w2: number[][];
  };
}

/**
 * Sinusoidal positional encoding (like original transformer)
 */
export function createPositionalEncoding(
  seqLen: number,
  dModel: number
): number[][] {
  const pe: number[][] = [];
  
  for (let pos = 0; pos < seqLen; pos++) {
    const encoding: number[] = [];
    for (let i = 0; i < dModel; i++) {
      if (i % 2 === 0) {
        encoding.push(Math.sin(pos / Math.pow(10000, i / dModel)));
      } else {
        encoding.push(Math.cos(pos / Math.pow(10000, (i - 1) / dModel)));
      }
    }
    pe.push(encoding);
  }
  
  return pe;
}

/**
 * Multi-head attention (like Council deliberation)
 */
export function multiHeadAttention(
  queries: number[][],
  keys: number[][],
  values: number[][],
  nHeads: number,
  dModel: number
): number[][] {
  const dK = dModel / nHeads;
  const headOutputs: number[][][] = [];
  
  // Split into heads (like council members)
  for (let h = 0; h < nHeads; h++) {
    const qHead = queries.map(q => q.slice(h * dK, (h + 1) * dK));
    const kHead = keys.map(k => k.slice(h * dK, (h + 1) * dK));
    const vHead = values.map(v => v.slice(h * dK, (h + 1) * dK));
    
    // Compute attention scores (Q @ K^T)
    const scores: number[][] = [];
    for (let i = 0; i < qHead.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < kHead.length; j++) {
        let dot = 0;
        for (let k = 0; k < dK; k++) {
          dot += qHead[i][k] * kHead[j][k];
        }
        row.push(dot / Math.sqrt(dK)); // Scale
      }
      scores.push(row);
    }
    
    // Softmax
    const softmaxScores = scores.map(row => {
      const max = Math.max(...row);
      const exp = row.map(x => Math.exp(x - max));
      const sum = exp.reduce((a, b) => a + b, 0);
      return exp.map(x => x / sum);
    });
    
    // Apply to values
    const headOutput: number[][] = [];
    for (let i = 0; i < softmaxScores.length; i++) {
      const output: number[] = [];
      for (let j = 0; j < dK; j++) {
        let sum = 0;
        for (let k = 0; k < vHead.length; k++) {
          sum += softmaxScores[i][k] * vHead[k][j];
        }
        output.push(sum);
      }
      headOutput.push(output);
    }
    headOutputs.push(headOutput);
  }
  
  // Concatenate heads (like council consensus)
  const output: number[][] = [];
  for (let i = 0; i < queries.length; i++) {
    const concat: number[] = [];
    for (const head of headOutputs) {
      concat.push(...head[i]);
    }
    output.push(concat);
  }
  
  return output;
}

/**
 * Feed-forward network (like tool execution)
 */
export function feedForward(
  x: number[][],
  w1: number[][],
  w2: number[][]
): number[][] {
  // First linear layer + ReLU
  const hidden: number[][] = [];
  for (const row of x) {
    const out: number[] = [];
    for (let i = 0; i < w1[0].length; i++) {
      let sum = 0;
      for (let j = 0; j < row.length; j++) {
        sum += row[j] * w1[j][i];
      }
      out.push(Math.max(0, sum)); // ReLU
    }
    hidden.push(out);
  }
  
  // Second linear layer
  const output: number[][] = [];
  for (const row of hidden) {
    const out: number[] = [];
    for (let i = 0; i < w2[0].length; i++) {
      let sum = 0;
      for (let j = 0; j < row.length; j++) {
        sum += row[j] * w2[j][i];
      }
      out.push(sum);
    }
    output.push(out);
  }
  
  return output;
}

/**
 * Layer normalization (stability)
 */
export function layerNorm(x: number[][]): number[][] {
  const epsilon = 1e-6;
  const normalized: number[][] = [];
  
  for (const row of x) {
    const mean = row.reduce((a, b) => a + b, 0) / row.length;
    const variance = row.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / row.length;
    const std = Math.sqrt(variance + epsilon);
    normalized.push(row.map(val => (val - mean) / std));
  }
  
  return normalized;
}

/**
 * Residual connection (like context preservation)
 */
export function residual(x: number[][], sublayer: number[][]): number[][] {
  return x.map((row, i) => row.map((val, j) => val + sublayer[i][j]));
}

/**
 * Complete transformer encoder layer (like Planner phase)
 */
export function encoderLayer(
  x: number[][],
  nHeads: number,
  dModel: number,
  dFF: number
): number[][] {
  // Self-attention (like council deliberation)
  const attn = multiHeadAttention(x, x, x, nHeads, dModel);
  const attnNorm = layerNorm(residual(x, attn));
  
  // Feed-forward (like tool execution)
  // Simplified: using identity matrices for demo
  const w1 = Array(dModel).fill(0).map(() => Array(dFF).fill(0.1));
  const w2 = Array(dFF).fill(0).map(() => Array(dModel).fill(0.1));
  const ffn = feedForward(attnNorm, w1, w2);
  const ffnNorm = layerNorm(residual(attnNorm, ffn));
  
  return ffnNorm;
}

/**
 * Complete transformer (Scorpion architecture mapping)
 */
export class MiniTransformer {
  private config: MiniTransformerConfig;
  
  constructor(config: MiniTransformerConfig) {
    this.config = config;
  }
  
  /**
   * Forward pass - maps to Scorpion pipeline
   */
  forward(input: string[]): {
    encoderOutput: number[][];
    decoderOutput: number[][];
    finalOutput: number[];
  } {
    // 1. Tokenization + Embedding (Input & Context)
    const tokens = input.map((text, i) => ({
      id: i,
      text,
      embedding: Array(this.config.dModel).fill(0).map(() => Math.random() - 0.5),
    }));
    
    // 2. Positional encoding
    const posEnc = createPositionalEncoding(tokens.length, this.config.dModel);
    let x = tokens.map((t, i) => 
      t.embedding.map((val, j) => val + posEnc[i][j])
    );
    
    // 3. Encoder layers (Planner phase)
    for (let i = 0; i < this.config.nLayers; i++) {
      x = encoderLayer(x, this.config.nHeads, this.config.dModel, this.config.dFF);
    }
    const encoderOutput = x;
    
    // 4. Decoder (Executor phase) - simplified
    // In real transformer, decoder uses masked self-attention + cross-attention
    // Here we simulate with encoder output
    let decoderInput = Array(input.length).fill(0).map(() => 
      Array(this.config.dModel).fill(0).map(() => Math.random() - 0.5)
    );
    
    for (let i = 0; i < this.config.nLayers; i++) {
      // Self-attention (masked in real transformer)
      const selfAttn = multiHeadAttention(decoderInput, decoderInput, decoderInput, this.config.nHeads, this.config.dModel);
      decoderInput = layerNorm(residual(decoderInput, selfAttn));
      
      // Cross-attention (Tools & RAG) - decoder queries encoder
      const crossAttn = multiHeadAttention(decoderInput, encoderOutput, encoderOutput, this.config.nHeads, this.config.dModel);
      decoderInput = layerNorm(residual(decoderInput, crossAttn));
      
      // Feed-forward
      const w1 = Array(this.config.dModel).fill(0).map(() => Array(this.config.dFF).fill(0.1));
      const w2 = Array(this.config.dFF).fill(0).map(() => Array(this.config.dModel).fill(0.1));
      const ffn = feedForward(decoderInput, w1, w2);
      decoderInput = layerNorm(residual(decoderInput, ffn));
    }
    
    // 5. Output projection (Summarizer)
    const finalOutput = decoderInput[decoderInput.length - 1]; // Last token
    
    return {
      encoderOutput,
      decoderOutput: decoderInput,
      finalOutput,
    };
  }
}

/**
 * Create a demo transformer matching Scorpion's architecture
 */
export function createScorpionTransformer(): MiniTransformer {
  return new MiniTransformer({
    vocabSize: 1000,
    dModel: 128,      // Small for demo
    nHeads: 4,        // Like 4 council members
    nLayers: 2,       // 2 layers for simplicity
    dFF: 512,         // Feed-forward expansion
    maxSeqLen: 50,
  });
}

