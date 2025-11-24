import { NextResponse } from 'next/server';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const GET = withErrorHandling(async () => {
  const client = getMCPn8nClient();
  
  if (!client.isConfigured()) {
    // Return 200 with status information instead of error
    return createSuccessResponse({
      healthy: false,
      configured: false,
      message: 'n8n not configured',
      workflowsFound: 0,
      fix: 'Add N8N_API_KEY to apps/scorpion/.env.local with your real API key from n8ncloud.tech',
      circuitBreaker: client.getCircuitBreakerStatus()
    });
  }
  
  // Test the API connection
  try {
  const workflows = await client.listWorkflows({ limit: 1 });
  return createSuccessResponse({
    healthy: true,
      configured: true,
    workflowsFound: workflows.length,
      message: 'n8n API connection working',
      circuitBreaker: client.getCircuitBreakerStatus()
    });
  } catch (error: any) {
    // Return 200 with error status instead of throwing
    return createSuccessResponse({
      healthy: false,
      configured: true,
      workflowsFound: 0,
      message: 'n8n API connection failed',
      error: error.message || String(error),
      circuitBreaker: client.getCircuitBreakerStatus()
  });
  }
});
