import { NextRequest } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/security/auth';
import { z } from 'zod';

const debugActionSchema = z.object({
  action: z.enum(['reset-circuit-breaker']),
});

export const GET = withErrorHandling(
  requireAuth(async () => {
    const debug: Record<string, unknown> = {
      step1_env_check: {
        N8N_API_URL: process.env['N8N_API_URL'] || process.env['N8N_BASE_URL'] || 'NOT SET',
        N8N_BASE_URL_DEPRECATED: process.env['N8N_BASE_URL'] || 'NOT SET (use N8N_API_URL instead)',
        N8N_API_KEY_LENGTH: process.env['N8N_API_KEY']?.length || 0,
        HAS_KEY: !!process.env['N8N_API_KEY'],
      },
      step2_client_init: null,
      step3_client_config: null,
      step4_api_call: null,
      step5_result: null,
      error: null,
    };

    const client = getMCPn8nClient();
    debug.step2_client_init = 'SUCCESS - Client created';

    debug.step3_client_config = {
      isConfigured: client.isConfigured(),
      baseUrl: (client as any).baseUrl,
      hasApiKey: !!(client as any).apiKey,
      apiKeyLength: (client as any).apiKey?.length || 0,
      circuitBreaker: client.getCircuitBreakerStatus(),
    };

    debug.step4_api_call = 'Calling listWorkflows()...';
    let workflows: any[] = [];
    let apiError: string | null = null;

    try {
      if (client.isConfigured()) {
        workflows = await client.listWorkflows({ limit: 5 });
        debug.step5_result = {
          workflows_count: workflows?.length || 0,
          is_array: Array.isArray(workflows),
          first_workflow: workflows?.[0]
            ? {
                id: workflows[0].id,
                name: workflows[0].name,
                active: workflows[0].active,
              }
            : null,
        };
      } else {
        debug.step5_result = {
          workflows_count: 0,
          is_array: true,
          first_workflow: null,
          error: 'n8n client not configured',
        };
      }
    } catch (error: any) {
      apiError = error.message || String(error);
      debug.error = apiError;
      debug.step5_result = {
        workflows_count: 0,
        is_array: true,
        first_workflow: null,
        error: apiError,
      };
    }

    return createSuccessResponse({
      debug,
      workflows: workflows?.slice(0, 3) || [],
      configured: client.isConfigured(),
      error: apiError || null,
    });
  })
);

export const POST = withErrorHandling(
  requireAuth(async (request: NextRequest) => {
    const body = await request.json().catch(() => null);
    const validation = debugActionSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse(
        ApiErrorCode.INVALID_REQUEST,
        'Invalid action. Valid actions: reset-circuit-breaker',
        validation.error.errors,
        400
      );
    }

    const client = getMCPn8nClient();
    client.resetCircuitBreaker();
    return createSuccessResponse({
      message: 'Circuit breaker reset',
    });
  })
);
