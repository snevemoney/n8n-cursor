import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';

export const dynamic = 'force-dynamic';

/**
 * OpenAI Audio Transcription API Route
 * Transcribe audio using OpenAI Whisper (hybrid: requires OpenAI)
 */
export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIAvailable()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string | null;
    const prompt = formData.get('prompt') as string | null;
    const responseFormat = (formData.get('response_format') as 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt') || 'verbose_json';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAIService();

    const transcription = await openai.createTranscription({
      file,
      model: 'whisper-1',
      language: language || undefined,
      prompt: prompt || undefined,
      response_format: responseFormat,
      timestamp_granularities: ['word', 'segment'],
    });

    return NextResponse.json(transcription);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

