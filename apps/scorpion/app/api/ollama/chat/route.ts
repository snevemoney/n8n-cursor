import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages, ollamaUrl = 'http://localhost:11434' } = body;

    if (!model || !messages) {
      return NextResponse.json(
        { error: 'Missing model or messages' },
        { status: 400 }
      );
    }

    // Proxy request to Ollama
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ollama error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ollama proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to Ollama' },
      { status: 500 }
    );
  }
}


