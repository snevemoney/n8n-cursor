/**
 * Transformer Demo API Endpoint
 * 
 * Demonstrates the minimal transformer implementation
 * and how it maps to Scorpion's architecture.
 */

import { NextResponse } from 'next/server';
import { createScorpionTransformer, MiniTransformer } from '@/server/transformer/mini-transformer';

export async function GET() {
  try {
    const transformer = createScorpionTransformer();
    
    // Demo input (like a user message)
    const input = [
      'What',
      'is',
      'the',
      'best',
      'approach',
      'to',
      'implement',
      'this',
      'feature',
    ];
    
    // Run forward pass
    const result = transformer.forward(input);
    
    return NextResponse.json({
      ok: true,
      data: {
        input,
        inputLength: input.length,
        encoderOutputShape: [result.encoderOutput.length, result.encoderOutput[0]?.length || 0],
        decoderOutputShape: [result.decoderOutput.length, result.decoderOutput[0]?.length || 0],
        finalOutputLength: result.finalOutput.length,
        architecture: {
          dModel: 128,
          nHeads: 4,
          nLayers: 2,
          mapping: {
            'Input & Context': 'Tokenization + Embeddings',
            'Planner': 'Encoder Self-Attention',
            'Council / Debate': 'Multi-Head Attention',
            'Tools & RAG': 'Cross-Attention',
            'Executor': 'Decoder',
            'Summarizer / Output': 'Output Projection',
          },
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input } = body;
    
    if (!Array.isArray(input) || input.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Input must be a non-empty array of strings' },
        { status: 400 }
      );
    }
    
    const transformer = createScorpionTransformer();
    const result = transformer.forward(input);
    
    return NextResponse.json({
      ok: true,
      data: {
        input,
        encoderOutput: result.encoderOutput,
        decoderOutput: result.decoderOutput,
        finalOutput: result.finalOutput,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

