import { NextResponse } from 'next/server';
import { listJobs, getJobStats } from '@/server/runtime/jobStore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dev/jobs
 * 
 * List all jobs (for Mission Control UI)
 * 
 * Query params:
 * - type: Filter by job type
 * - status: Filter by status
 * - sessionId: Filter by session
 * - agentId: Filter by agent
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: {
      type?: any;
      status?: any;
      sessionId?: string;
      agentId?: string;
    } = {};
    
    if (searchParams.get('type')) {
      filters.type = searchParams.get('type') as any;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any;
    }
    if (searchParams.get('sessionId')) {
      filters.sessionId = searchParams.get('sessionId')!;
    }
    if (searchParams.get('agentId')) {
      filters.agentId = searchParams.get('agentId')!;
    }
    
    const jobs = listJobs(filters);
    const stats = getJobStats();
    
    return NextResponse.json({
      jobs,
      stats,
    });
  } catch (error: any) {
    console.error('[API] Error listing jobs:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to list jobs' },
      { status: 500 }
    );
  }
}

