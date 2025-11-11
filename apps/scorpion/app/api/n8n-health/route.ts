import { NextResponse } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const GET = withErrorHandling(async () => {
  const client = getMCPn8nClient();
  
  if (!client.isConfigured()) {
    return createErrorResponse(
      ApiErrorCode.SERVICE_UNAVAILABLE,
      'N8N_API_KEY not configured or appears to be a placeholder',
      {
        fix: 'Add N8N_API_KEY to apps/scorpion/.env.local with your real API key from n8ncloud.tech'
      },
      503
    );
  }
  
  // Test the API connection
  const workflows = await client.listWorkflows({ limit: 1 });
  return createSuccessResponse({
    healthy: true,
    workflowsFound: workflows.length,
    message: 'n8n API connection working'
  });
});
