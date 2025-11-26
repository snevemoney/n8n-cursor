import { NextResponse } from 'next/server';
import { getLearningStatistics } from '../../chat/stream/helpers/patternLearningIntegration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/learning/statistics
 * Get statistics about learned patterns
 */
export async function GET() {
  try {
    const stats = getLearningStatistics();

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Learning Statistics] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get learning statistics'
      },
      { status: 500 }
    );
  }
}
