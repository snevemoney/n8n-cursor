import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';

/**
 * OpenAI Embeddings API Route
 * Generate embeddings for text using OpenAI (hybrid: falls back to Ollama if unavailable)
 */
export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const { text, texts, model = 'text-embedding-3-small' } = await request.json();

    if (!text && !texts) {
      return NextResponse.json(
        { error: 'Either text or texts must be provided' },
        { status: 400 }
      );
    }

    const openai = getOpenAIService();

    if (text) {
      const embedding = await openai.embedText(text, model);
      return NextResponse.json({ embedding, model });
    } else {
      const embeddings = await openai.embedTexts(texts, model);
      return NextResponse.json({ embeddings, model });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

