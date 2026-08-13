import { z } from 'zod';
import { emitEvent } from '@/lib/events/event-bus';
import type { WorkflowStartedEvent, WorkflowFailedEvent } from '@/lib/events/types';

export const name = 'workflows.trigger';
export const label = 'Trigger Workflow';
export const description = 'Trigger an n8n workflow execution';

export const schema = z.object({
  workflowId: z.string().min(1),
  payload: z.record(z.any()).default({}),
});

export async function handler(args: z.infer<typeof schema>) {
  const startTime = Date.now();
  const workflowName = args.workflowId; // Could be enhanced to fetch actual name
  
  try {
    // Emit workflow started event
    await emitEvent({
      id: crypto.randomUUID(),
      type: 'workflow.started',
      severity: 'info',
      timestamp: new Date().toISOString(),
      source: 'workflows.trigger',
      environment: (process.env.NODE_ENV as 'dev' | 'staging' | 'prod') || 'prod',
      data: {
        workflowId: args.workflowId,
        workflowName,
        trigger: 'tool',
      },
    });

    // Use environment variables for production n8n
    const n8nUrl = process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://evenslouis.ca/n8n';
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
    
    const duration = Date.now() - startTime;
    
    // Emit workflow failed event if response is not ok
    if (!response.ok) {
      await emitEvent({
        id: crypto.randomUUID(),
        type: 'workflow.failed',
        severity: 'error',
        timestamp: new Date().toISOString(),
        source: 'workflows.trigger',
        environment: (process.env.NODE_ENV as 'dev' | 'staging' | 'prod') || 'prod',
        data: {
          workflowId: args.workflowId,
          workflowName,
          error: `HTTP ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`,
          errorCode: `HTTP_${response.status}`,
        },
      });
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
    const duration = Date.now() - startTime;
    
    // Emit workflow failed event
    await emitEvent({
      id: crypto.randomUUID(),
      type: 'workflow.failed',
      severity: 'error',
      timestamp: new Date().toISOString(),
      source: 'workflows.trigger',
      environment: (process.env.NODE_ENV as 'dev' | 'staging' | 'prod') || 'prod',
      data: {
        workflowId: args.workflowId,
        workflowName,
        error: error.message || 'Unknown error',
        errorCode: 'EXCEPTION',
      },
    });
    
    return {
      ok: false,
      error: error.message,
    };
  }
}

