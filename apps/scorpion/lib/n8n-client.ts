/**
 * n8n API Client
 * For interacting with n8n workflows
 */

import { getN8nBaseUrl } from '@lightningflow/shared-config';
import { getCircuitBreaker } from './circuit-breaker';
import { getMetricsCollector } from './metrics';

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
  private circuitBreaker = getCircuitBreaker('n8n');
  private metrics = getMetricsCollector();

  constructor(apiKey?: string, options?: { maxRetries?: number; retryDelay?: number }) {
    // Use N8N_API_URL if set, otherwise fall back to getN8nBaseUrl()
    // N8N_API_URL should be the full API base URL (e.g., https://evenslouis.ca/n8n/api/v1)
    if (process.env.N8N_API_URL) {
      this.baseUrl = process.env.N8N_API_URL;
    } else {
    // Remove /webhook from base URL to get API base
    const webhookUrl = getN8nBaseUrl();
    this.baseUrl = webhookUrl.replace('/webhook', '');
    }
    
    // Get API key - Next.js may truncate long env vars, so try reading from file directly
    let envApiKey = process.env.N8N_API_KEY?.trim() || '';
    
    // If API key seems truncated (< 100 chars for JWT), try reading from .env.local directly
    if (!apiKey && envApiKey.length < 100) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf-8');
          const match = envContent.match(/^N8N_API_KEY=(.+)$/m);
          if (match && match[1]) {
            const fileApiKey = match[1].trim();
            if (fileApiKey.length > envApiKey.length) {
              console.log(`🔧 Fixed truncated API key: ${envApiKey.length} -> ${fileApiKey.length} chars`);
              envApiKey = fileApiKey;
            }
          }
        }
      } catch (e) {
        // Silently fail - use what we have from process.env
      }
    }
    
    this.apiKey = apiKey || envApiKey;
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);
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
   * List all workflows (handles pagination)
   */
  async listWorkflows(): Promise<N8nWorkflow[]> {
    const startTime = Date.now();
    console.log('🔍 listWorkflows called with:', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0
    });
    try {
      return await this.circuitBreaker.execute(async () => {
        console.log('🔍 Inside circuit breaker, about to fetch workflows');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (this.apiKey) {
          headers['X-N8N-API-KEY'] = this.apiKey;
        }

        const allWorkflows: N8nWorkflow[] = [];
        let cursor: string | null = null;
        let pageCount = 0;
        const maxPages = 50; // Safety limit to prevent infinite loops

        do {
          // If baseUrl already includes /api/v1, don't append it again
          let workflowsUrl = this.baseUrl.includes('/api/v1') 
            ? `${this.baseUrl}/workflows`
            : `${this.baseUrl}/api/v1/workflows`;
          
          // Add cursor for pagination
          if (cursor) {
            workflowsUrl += `?cursor=${encodeURIComponent(cursor)}`;
          }

          console.log('🔍 Fetching from URL:', workflowsUrl);
          console.log('🔍 Headers:', { ...headers, 'X-N8N-API-KEY': headers['X-N8N-API-KEY'] ? '[REDACTED]' : 'MISSING' });
          const response = await this.fetchWithRetry(workflowsUrl, {
          headers,
        });
          console.log('🔍 Response status:', response.status, response.ok);

        if (!response.ok) {
          this.metrics.incrementCounter('scorpion_api_requests_total', {
            method: 'GET',
            endpoint: '/api/v1/workflows',
            status: response.status.toString()
          });
          throw new Error(`Failed to list workflows: ${response.status}`);
        }

        const data = await response.json();
          const workflows = data.data || [];
          allWorkflows.push(...workflows);
          
          cursor = data.nextCursor || null;
          pageCount++;

          // Safety check
          if (pageCount >= maxPages) {
            console.warn(`⚠️ Reached max pages (${maxPages}) while fetching workflows. There may be more workflows available.`);
            break;
          }
        } while (cursor);

        const duration = (Date.now() - startTime) / 1000;
        this.metrics.observeHistogram('scorpion_workflow_sync_duration_seconds', duration, { operation: 'list' });
        this.metrics.incrementCounter('scorpion_api_requests_total', {
          method: 'GET',
          endpoint: '/api/v1/workflows',
          status: '200'
        });

        console.log(`✅ Fetched ${allWorkflows.length} workflows from n8n (${pageCount} page(s))`);
        return allWorkflows;
      });
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.metrics.observeHistogram('scorpion_workflow_sync_duration_seconds', duration, { operation: 'list', status: 'error' });
      this.metrics.incrementCounter('scorpion_errors_total', { severity: 'medium', source: 'n8n-client' });
      console.error('❌ Error in listWorkflows:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        baseUrl: this.baseUrl,
        hasApiKey: !!this.apiKey,
        apiKeyLength: this.apiKey?.length || 0
      });
      // Re-throw the error so the caller knows it failed
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    const startTime = Date.now();
    try {
      return await this.circuitBreaker.execute(async () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (this.apiKey) {
          headers['X-N8N-API-KEY'] = this.apiKey;
        }

        // If baseUrl already includes /api/v1, don't append it again
        const workflowUrl = this.baseUrl.includes('/api/v1') 
          ? `${this.baseUrl}/workflows/${id}`
          : `${this.baseUrl}/api/v1/workflows/${id}`;
        const response = await this.fetchWithRetry(workflowUrl, {
          headers,
        });

        const duration = (Date.now() - startTime) / 1000;
        this.metrics.observeHistogram('scorpion_workflow_sync_duration_seconds', duration, { operation: 'get' });

        if (!response.ok) {
          this.metrics.incrementCounter('scorpion_api_requests_total', {
            method: 'GET',
            endpoint: `/api/v1/workflows/${id}`,
            status: response.status.toString()
          });
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to get workflow: ${response.status}`);
        }

        const data = await response.json();
        this.metrics.incrementCounter('scorpion_api_requests_total', {
          method: 'GET',
          endpoint: `/api/v1/workflows/${id}`,
          status: '200'
        });
        return data;
      });
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      this.metrics.observeHistogram('scorpion_workflow_sync_duration_seconds', duration, { operation: 'get', status: 'error' });
      this.metrics.incrementCounter('scorpion_errors_total', { severity: 'medium', source: 'n8n-client' });
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

      // If baseUrl already includes /api/v1, don't append it again
      const executeUrl = this.baseUrl.includes('/api/v1') 
        ? `${this.baseUrl}/workflows/${workflowId}/execute`
        : `${this.baseUrl}/api/v1/workflows/${workflowId}/execute`;
      const response = await this.fetchWithRetry(executeUrl, {
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

