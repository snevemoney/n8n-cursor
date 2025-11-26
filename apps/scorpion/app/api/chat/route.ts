import { NextRequest, NextResponse } from 'next/server';
import { runModel, checkModelAvailability, listModels, getUserContextPrompt } from '@scorpion/core';
import { getRAGStore } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { withRateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { getMetricsCollector } from '@/lib/metrics';
import { trace } from '@/lib/tracing';

/**
 * Unified chat endpoint - works with any model source
 * Always uses RAG and collects training data
 */
export const POST = withRateLimit(
  async (request: Request) => {
    const req = request as NextRequest;
    const startTime = Date.now();
    const metrics = getMetricsCollector();

    try {
      // Extract request body first to use in trace tags
      const body = await request.json();
      const { message, useRAG = true, model } = body;

      return await trace('chat.request', async (spanId) => {

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

        const duration = (Date.now() - startTime) / 1000;
        metrics.incrementCounter('scorpion_api_requests_total', {
          method: 'POST',
          endpoint: '/api/chat',
          status: '200'
        });
        metrics.observeHistogram('scorpion_api_request_duration_seconds', duration, {
          method: 'POST',
          endpoint: '/api/chat'
        });

        return NextResponse.json({
          message: response.content,
          model: response.model,
          usage: response.usage,
          ragUsed: useRAG && ragContext.length > 0
        });
      }, { useRAG: String(useRAG), model: model || 'default' });
    } catch (error: any) {
      const duration = (Date.now() - startTime) / 1000;
      metrics.incrementCounter('scorpion_api_requests_total', {
        method: 'POST',
        endpoint: '/api/chat',
        status: '500'
      });
      metrics.observeHistogram('scorpion_api_request_duration_seconds', duration, {
        method: 'POST',
        endpoint: '/api/chat',
        status: 'error'
      });
      metrics.incrementCounter('scorpion_errors_total', {
        severity: 'high',
        source: 'chat-api',
        errorCode: code
      });

      // Return safe, structured error
      return NextResponse.json(
        {
          error: message,
          code,
          id: errorId,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status }
      );
    }
  },
  { limit: 20, windowMs: 60 * 1000 } // 20 requests per minute
);

/**
 * Check model availability and list models
 * Used as fallback when Ollama is unavailable
 */
export async function GET() {
  try {
    const available = await checkModelAvailability();
    const models = await listModels();
    const source = process.env.SCORPION_MODEL_SOURCE || 'ollama';

    return NextResponse.json({
      success: true,
      available,
      source,
      models: models || [],
      fallbackAvailable: source === 'openai' ? !!process.env.OPENAI_API_KEY : false
    });
  } catch (error: any) {
    // If model source is unavailable, return 200 with available: false
    // This is an expected condition, not an error
    const source = process.env.SCORPION_MODEL_SOURCE || 'ollama';
    console.warn(`Model source ${source} unavailable:`, error.message);
    return NextResponse.json({
      success: false,
      available: false,
      source,
      models: [],
      error: error.message || 'Model source unavailable',
      fallbackAvailable: false
    });
  }
}

