/**
 * Voice Speak API
 * Power of 10 Rule 3: ≤ 60 lines, Rule 7: Handle errors
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Power of 10 Rule 2: Bounded retries
const MAX_RETRIES = 3;
const VOICE_SERVICE_URL = process.env['VOICE_SERVICE_URL'] || 'http://localhost:7001';

/**
 * POST /api/voice/speak - Speak text via voice service
 * Power of 10 Rule 3: ≤ 60 lines
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Power of 10 Rule 2: Bounded retries
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const response = await fetch(`${VOICE_SERVICE_URL}/voice/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sessionId: `speak-${Date.now()}` }),
        });

        if (response.ok) {
          return NextResponse.json({ ok: true });
        }

        if (retries < MAX_RETRIES - 1) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        const errorText = await response.text();
        throw new Error(`Voice service error: ${response.status} - ${errorText}`);
      } catch (err) {
        retries++;
        if (retries >= MAX_RETRIES) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Voice Speak] Error:', errorMessage);
    
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

