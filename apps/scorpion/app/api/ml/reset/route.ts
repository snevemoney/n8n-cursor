/**
 * POST /api/ml/reset
 * Reset the neural network to untrained state
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const detector = getSharedAnomalyDetector();
    detector.reset();

    console.log('[API] Neural network reset to untrained state');

    return NextResponse.json({
      ok: true,
      message: 'Network reset successfully',
    });
  } catch (error) {
    console.error('[API] /ml/reset error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
