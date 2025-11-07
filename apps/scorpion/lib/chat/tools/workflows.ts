import { z } from 'zod';

export const name = 'workflows.trigger';
export const label = 'Trigger Workflow';
export const description = 'Trigger an n8n workflow execution';

export const schema = z.object({
  workflowId: z.string().min(1),
  payload: z.record(z.any()).default({}),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Use environment variables for production n8n
    const n8nUrl = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8ncloud.tech';
    const n8nApiKey = process.env.N8N_API_KEY;
    
    // Try to trigger via webhook first
    let url = `${n8nUrl}/webhook/${args.workflowId}`;
    let headers: any = { 'Content-Type': 'application/json' };
    
    // If we have an API key, use the API endpoint instead
    if (n8nApiKey) {
      url = `${n8nUrl}/api/v1/workflows/${args.workflowId}/execute`;
      headers['X-N8N-API-KEY'] = n8nApiKey;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(n8nApiKey ? { data: args.payload } : args.payload),
    });
    
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      ok: response.ok,
      status: response.status,
      executionId: data.executionId || data.id || `exec-${Date.now()}`,
      deepLink: `/workflows?exec=${args.workflowId}`,
      workflowUrl: `${n8nUrl}/workflow/${args.workflowId}`,
      data: typeof data === 'string' ? data : JSON.stringify(data),
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

