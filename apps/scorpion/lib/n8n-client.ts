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
  private maxRetries: number;
  private retryDelay: number;

  constructor(apiKey?: string, options?: { maxRetries?: number; retryDelay?: number }) {
    // Remove /webhook from base URL to get API base
    const webhookUrl = getN8nBaseUrl();
    this.baseUrl = webhookUrl.replace('/webhook', '');
    this.apiKey = apiKey || process.env.N8N_API_KEY;
    this.maxRetries = options?.maxRetries || 3;
    this.retryDelay = options?.retryDelay || 1000; // 1 second base delay
  }

  /**
   * Sleep helper for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make request with retry logic
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = 0
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      // Retry on server errors or rate limits
      if ((response.status >= 500 || response.status === 429) && retries < this.maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : this.retryDelay * Math.pow(2, retries); // Exponential backoff
        
        console.warn(`Retrying request (${retries + 1}/${this.maxRetries}) after ${delay}ms...`);
        await this.sleep(delay);
        return this.fetchWithRetry(url, options, retries + 1);
      }

      return response;
    } catch (error: any) {
      // Retry on network errors
      if (retries < this.maxRetries && (error.name === 'TypeError' || error.name === 'NetworkError')) {
        const delay = this.retryDelay * Math.pow(2, retries);
        console.warn(`Network error, retrying (${retries + 1}/${this.maxRetries}) after ${delay}ms...`);
        await this.sleep(delay);
        return this.fetchWithRetry(url, options, retries + 1);
      }
      throw error;
    }
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

      const response = await this.fetchWithRetry(`${this.baseUrl}/api/v1/workflows`, {
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

      const response = await this.fetchWithRetry(`${this.baseUrl}/api/v1/workflows/${id}`, {
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

      const response = await this.fetchWithRetry(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
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

  /**
   * Export workflow from n8n to filesystem
   */
  async exportWorkflow(id: string, filePath: string): Promise<boolean> {
    try {
      const workflow = await this.getWorkflow(id);
      if (!workflow) {
        return false;
      }

      const fs = await import('fs/promises');
      await fs.writeFile(filePath, JSON.stringify(workflow, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Failed to export workflow ${id}:`, error);
      return false;
    }
  }
}

