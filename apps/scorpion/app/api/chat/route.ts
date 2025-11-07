import { NextRequest, NextResponse } from 'next/server';
import { runModel, checkModelAvailability, listModels, getUserContextPrompt } from '@scorpion/core';
import { getRAGStore } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { withRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

/**
 * Unified chat endpoint - works with any model source
 * Always uses RAG and collects training data
 */
export const POST = withRateLimit(
  async (request: Request) => {
    const req = request as NextRequest;
    try {
    const { message, useRAG = true, model } = await request.json(); // Default to true

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message' },
        { status: 400 }
      );
    }

    // Load user context
    const systemPrompt = getUserContextPrompt();

    // Always inject RAG context (unless explicitly disabled)
    let enhancedPrompt = message;
    let ragContext: string[] = [];
    
    if (useRAG) {
      try {
        const store = await getRAGStore();
        const relevantKnowledge = await store.search(message, 5); // Get more context
        
        if (relevantKnowledge.length > 0) {
          ragContext = relevantKnowledge.map(k => `${k.title}: ${k.description}`);
          const context = ragContext.join('\n');
          
          enhancedPrompt = `Context from knowledge base:\n${context}\n\nUser question: ${message}`;
        }
      } catch (error) {
        console.warn('RAG context injection failed, continuing without it:', error);
      }
    }

    // Run model through adapter
    const response = await runModel({
      prompt: enhancedPrompt,
      system: systemPrompt,
      model,
      temperature: 0.7
    });

    // Collect training data (async, don't wait)
    try {
      const collector = getTrainingDataCollector();
      await collector.collectInteraction(
        message,
        response.content,
        {
          ragContext,
          userFeedback: undefined, // Will be set if user provides feedback
          metadata: {
            model: response.model,
            usage: response.usage,
            timestamp: new Date().toISOString()
          }
        }
      );
    } catch (error) {
      console.warn('Failed to collect training data:', error);
      // Don't fail the request if training data collection fails
    }

    return NextResponse.json({
      message: response.content,
      model: response.model,
      usage: response.usage,
      ragUsed: useRAG && ragContext.length > 0
    });
    } catch (error: any) {
      console.error('Chat error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to get response from model' },
        { status: 500 }
      );
    }
  },
  { limit: 20, windowMs: 60 * 1000 } // 20 requests per minute
);

/**
 * Check model availability and list models
 */
export async function GET() {
  try {
    const available = await checkModelAvailability();
    const models = await listModels();
    const source = process.env.SCORPION_MODEL_SOURCE || 'ollama';
    
    return NextResponse.json({
      available,
      source,
      models
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, available: false, models: [] },
      { status: 500 }
    );
  }
}

