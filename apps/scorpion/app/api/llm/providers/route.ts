import { NextResponse } from 'next/server';
import { getProviderStatus } from '@/lib/utils/providerSelector';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getProviderStatus();
    
    return NextResponse.json({
      success: true,
      data: status
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error('[API /llm/providers] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get provider status',
      stack: process.env['NODE_ENV'] === 'development' ? error.stack : undefined
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

