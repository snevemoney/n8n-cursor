import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';

/**
 * OpenAI Image Generation API Route
 * Generate images using OpenAI DALL-E (hybrid: requires OpenAI)
 */
export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const {
      prompt,
      model = 'dall-e-3',
      n = 1,
      quality = 'standard',
      response_format = 'url',
      size = '1024x1024',
      style = 'natural',
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIService();

    const imageResponse = await openai.createImage({
      prompt,
      model,
      n,
      quality,
      response_format,
      size,
      style,
    });

    return NextResponse.json(imageResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

