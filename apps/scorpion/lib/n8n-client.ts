/**
 * n8n API Client
 * For interacting with n8n workflows
 */

import { getN8nBaseUrl } from '@lightningflow/shared-config';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf: string | null;
  retrySuccess: boolean | null;
  startedAt: string;
  stoppedAt: string | null;
  workflowId: string;
  workflowData: N8nWorkflow;
}

export class N8nClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(apiKey?: string) {
    // Remove /webhook from base URL to get API base
    const webhookUrl = getN8nBaseUrl();
    this.baseUrl = webhookUrl.replace('/webhook', '');
    this.apiKey = apiKey || process.env.N8N_API_KEY;
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['X-N8N-API-KEY'] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to list workflows: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to list n8n workflows:', error);
      return [];
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['X-N8N-API-KEY'] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${id}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get workflow: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get n8n workflow:', error);
      return null;
    }
  }

  /**
   * Trigger a workflow execution
   */
  async triggerWorkflow(workflowId: string, data?: any): Promise<N8nExecution | null> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['X-N8N-API-KEY'] = this.apiKey;
      }

      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data || {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger workflow: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to trigger n8n workflow:', error);
      return null;
    }
  }
}

