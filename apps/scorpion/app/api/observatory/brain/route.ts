/**
 * Observatory Brain API
 * Power of 10 Rule 3: ≤ 60 lines, Rule 7: Handle errors
 */

import { NextResponse } from 'next/server';
import { buildBrainGraph } from '@/server/observatory/buildBrainGraph';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const graph = await buildBrainGraph();
    
    return NextResponse.json({
      ok: true,
      data: graph,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Observatory] Error building brain graph:', errorMessage);
    
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

