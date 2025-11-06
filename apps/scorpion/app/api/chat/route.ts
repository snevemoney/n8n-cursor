import { NextRequest, NextResponse } from 'next/server';
import { runModel, checkModelAvailability, listModels } from '@scorpion/core';
import { getUserContextPrompt } from '@scorpion/core';
import { RAGStore } from '@scorpion/core';

// Get RAG store for context injection
let ragStore: RAGStore | null = null;

function getRAGStore(): RAGStore {
  if (!ragStore) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    ragStore = new RAGStore(ollamaUrl);
  }
  return ragStore;
}

/**
 * Unified chat endpoint - works with any model source
 */
export async function POST(request: NextRequest) {
  try {
    const { message, useRAG = false, model } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Missing message' },
        { status: 400 }
      );
    }

    // Load user context
    const systemPrompt = getUserContextPrompt();

    // Optionally inject RAG context
    let enhancedPrompt = message;
    if (useRAG) {
      try {
        const store = getRAGStore();
        const relevantKnowledge = await store.search(message, 3);
        
        if (relevantKnowledge.length > 0) {
          const context = relevantKnowledge
            .map(k => `- ${k.title}: ${k.description}`)
            .join('\n');
          
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

    return NextResponse.json({
      message: response.content,
      model: response.model,
      usage: response.usage
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response from model' },
      { status: 500 }
    );
  }
}

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

