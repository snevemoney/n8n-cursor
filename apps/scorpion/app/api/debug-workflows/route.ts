import { NextRequest, NextResponse } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const GET = withErrorHandling(async () => {
  const debug: any = {
    step1_env_check: {
      // Standardize on N8N_API_URL (N8N_BASE_URL kept for backward compatibility)
      N8N_API_URL: process.env.N8N_API_URL || process.env.N8N_BASE_URL || 'NOT SET',
      N8N_BASE_URL_DEPRECATED: process.env.N8N_BASE_URL || 'NOT SET (use N8N_API_URL instead)',
      N8N_API_KEY_LENGTH: process.env.N8N_API_KEY?.length || 0,
      HAS_KEY: !!process.env.N8N_API_KEY,
      API_KEY_PREVIEW: process.env.N8N_API_KEY ? 
        `${process.env.N8N_API_KEY.substring(0, 10)}...${process.env.N8N_API_KEY.substring(process.env.N8N_API_KEY.length - 5)}` : 
        'NOT SET'
    },
    step2_client_init: null,
    step3_client_config: null,
    step4_api_call: null,
    step5_result: null,
    error: null
  };

  // Step 2: Initialize client
  const client = getMCPn8nClient();
  debug.step2_client_init = 'SUCCESS - Client created';
  
  // Step 3: Check client configuration
  debug.step3_client_config = {
    isConfigured: client.isConfigured(),
    baseUrl: (client as any).baseUrl,
    hasApiKey: !!(client as any).apiKey,
    apiKeyLength: (client as any).apiKey?.length || 0,
    circuitBreaker: client.getCircuitBreakerStatus()
  };

  // Step 4: Make API call (with error handling)
  debug.step4_api_call = 'Calling listWorkflows()...';
  let workflows: any[] = [];
  let apiError: any = null;
  
  try {
    if (client.isConfigured()) {
      workflows = await client.listWorkflows({ limit: 5 });
  debug.step5_result = {
    workflows_count: workflows?.length || 0,
    is_array: Array.isArray(workflows),
    first_workflow: workflows?.[0] ? {
      id: workflows[0].id,
      name: workflows[0].name,
      active: workflows[0].active
    } : null
  };
    } else {
      debug.step5_result = {
        workflows_count: 0,
        is_array: true,
        first_workflow: null,
        error: 'n8n client not configured'
      };
    }
  } catch (error: any) {
    apiError = error.message || String(error);
    debug.error = apiError;
    debug.step5_result = {
      workflows_count: 0,
      is_array: true,
      first_workflow: null,
      error: apiError
    };
  }

  return createSuccessResponse({
    debug,
    workflows: workflows?.slice(0, 3) || [],
    configured: client.isConfigured(),
    error: apiError || null
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { action } = await request.json().catch(() => ({}));
  
  if (action === 'reset-circuit-breaker') {
    const client = getMCPn8nClient();
    client.resetCircuitBreaker();
    return createSuccessResponse({
      message: 'Circuit breaker reset'
    });
  }

  return createErrorResponse(
    ApiErrorCode.INVALID_REQUEST,
    'Invalid action. Valid actions: reset-circuit-breaker',
    undefined,
    400
  );
});


