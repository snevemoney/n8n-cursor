import { NextResponse } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';

export async function GET() {
  const debug: any = {
    step1_env_check: {
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'NOT SET',
      N8N_API_KEY_LENGTH: process.env.N8N_API_KEY?.length || 0,
      HAS_KEY: !!process.env.N8N_API_KEY
    },
    step2_client_init: null,
    step3_api_call: null,
    step4_result: null,
    error: null
  };

  try {
    // Step 2: Initialize client
    const client = getMCPn8nClient();
    debug.step2_client_init = 'SUCCESS - Client created';

    // Step 3: Make API call
    debug.step3_api_call = 'Calling listWorkflows()...';
    const workflows = await client.listWorkflows({ limit: 5 });
    
    // Step 4: Result
    debug.step4_result = {
      workflows_count: workflows?.length || 0,
      is_array: Array.isArray(workflows),
      first_workflow: workflows?.[0] ? {
        id: workflows[0].id,
        name: workflows[0].name
      } : null
    };

    return NextResponse.json({
      success: true,
      debug,
      workflows: workflows?.slice(0, 3)
    });
  } catch (error: any) {
    debug.error = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    };
    
    return NextResponse.json({
      success: false,
      debug
    }, { status: 500 });
  }
}


