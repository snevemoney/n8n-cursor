import { NextRequest, NextResponse } from 'next/server';
import { N8nClient } from '@/lib/n8n-client';
import { requireAuth } from '@/lib/security/auth';

export const GET = requireAuth(async (_request: NextRequest) => {
  try {
    const client = new N8nClient();
    const workflows = await client.listWorkflows();

    return NextResponse.json({
      success: true,
      count: workflows.length,
      sample: workflows.slice(0, 3).map((w) => ({ id: w.id, name: w.name })),
    });
  } catch (error: any) {
    console.error('[test-n8n] failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
});
