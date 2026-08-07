import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ollamaUrl = searchParams.get('url') || 'http://localhost:11434';

    // Check if Ollama is available
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'HEAD',
    });

    return NextResponse.json({ available: response.ok });
  } catch (error) {
    return NextResponse.json({ available: false });
  }
}

