import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ollamaUrl = searchParams.get('url') || 'http://localhost:11434';

    // Proxy request to Ollama to list models
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Ollama error: ${response.status}` },
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

