import { NextRequest, NextResponse } from 'next/server';
import { runCouncil } from '@scorpion/core/council';
import { councilMembers } from '@scorpion/core/council';
import { getOntologyStore } from '@/lib/shared-stores';

/**
 * POST /api/council - Run a council meeting
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = body.topic || "Should we deploy the latest Scorpion build?";
    
    // Get ontology store for context-aware deliberation
    const store = await getOntologyStore();
    const result = await runCouncil(topic, store);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Council meeting error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run council meeting' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/council - Get council members info
 */
export async function GET() {
  try {
    return NextResponse.json({
      members: councilMembers,
      count: councilMembers.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load council members' },
      { status: 500 }
    );
  }
}

