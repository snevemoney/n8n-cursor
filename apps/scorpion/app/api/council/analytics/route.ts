// apps/scorpion/app/api/council/analytics/route.ts

import { NextResponse } from 'next/server';
import { getCouncilStatistics, getAllCouncilResults } from '@/server/council/councilStorage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const [statistics, recentResults] = await Promise.all([
      getCouncilStatistics({ userId }),
      getAllCouncilResults({ limit: limit || 50, userId }),
    ]);

    return NextResponse.json({
      statistics,
      recentResults,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Council Analytics] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch council analytics' },
      { status: 500 },
    );
  }
}

