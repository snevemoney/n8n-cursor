/**
 * GET /api/ml/normalization
 * Returns normalization statistics for the trained model
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { getNormalizationSummary } from '@/lib/ml/normalization';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const detector = getSharedAnomalyDetector();
    const saved = detector.save();
    const normalizationStats = saved.normalizationStats;

    if (!normalizationStats) {
      return NextResponse.json({
        ok: true,
        hasStats: false,
        stats: null,
        summary: 'No normalization statistics available – train the model first.',
        message: 'Model has not been trained yet',
      });
    }

    return NextResponse.json({
      ok: true,
      hasStats: true,
      stats: normalizationStats,
      summary: getNormalizationSummary(normalizationStats),
      metadata: {
        sampleCount: normalizationStats.sampleCount,
        featureCount: normalizationStats.means.length,
        timestamp: normalizationStats.timestamp,
        updatedAt: new Date(normalizationStats.timestamp).toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] /ml/normalization error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
