import { NextRequest, NextResponse } from 'next/server';
import { getMistakeLearner } from '@/lib/fine-tuning/mistake-learner';

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/correct - Record a correction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { originalInput, wrongOutput, correctedOutput, correction } = body;

    // Validate required fields
    if (!originalInput || typeof originalInput !== 'string' || originalInput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid originalInput field' },
        { status: 400 }
      );
    }

    if (!wrongOutput || typeof wrongOutput !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid wrongOutput field' },
        { status: 400 }
      );
    }

    if (!correctedOutput || typeof correctedOutput !== 'string' || correctedOutput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid correctedOutput field' },
        { status: 400 }
      );
    }

    const learner = getMistakeLearner();
    await learner.recordMistake(
      originalInput,
      wrongOutput,
      correctedOutput,
      correction || 'User correction'
    );

    // Trigger immediate learning
    await learner.learnFromMistakes();

    return NextResponse.json({
      success: true,
      message: 'Correction recorded and learned'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

