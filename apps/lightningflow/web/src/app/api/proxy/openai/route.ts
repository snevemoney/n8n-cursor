import { NextRequest, NextResponse } from 'next/server';
import { getUserWorkspace } from '@/lib/secure/auth';
import { proxyOpenAI } from '@/lib/secure/openaiProxy';
import { checkQuota } from '@/lib/secure/checkQuota';

/**
 * POST /api/proxy/openai
 * Secure OpenAI proxy with RLS policy binding and usage tracking
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { workspaceId } = await getUserWorkspace();

    // Check quota before making the request
    await checkQuota(workspaceId, 50000); // Default limit of 50k tokens

    const data = await proxyOpenAI(workspaceId, body);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('OpenAI proxy error:', error);
    
    if (error.message.includes('Usage limit exceeded')) {
      return NextResponse.json(
        { error: 'Usage limit exceeded. Please upgrade your plan.' },
        { status: 429 }
      );
    }
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 