/**
 * n8n REST API Client
 * Direct REST API calls to n8n instance (simpler and more reliable than MCP wrapping)
 */

export class MCPn8nClient {
  private baseUrl: string;
  private apiKey: string;
  private lastAuthError: number = 0;
  private authErrorThrottle: number = 60000; // Only log auth errors once per minute
  
  // Request queue and rate limiting
  private activeRequests: number = 0;
  private maxConcurrentRequests: number = 3; // Only 3 concurrent requests
  private minRequestInterval: number = 300; // 300ms between requests
  private lastRequestTime: number = 0;
  
  // Circuit breaker
  private failureCount: number = 0;
  private circuitBreakerOpen: boolean = false;
  private circuitBreakerResetTime: number = 0;
  private maxFailures: number = 10;
  private circuitBreakerTimeout: number = 60000; // 1 minute
  
  constructor() {
    this.baseUrl = process.env.N8N_API_URL || process.env.N8N_BASE_URL || 'https://n8ncloud.tech';
    this.apiKey = process.env.N8N_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ N8N_API_KEY not set - n8n operations will be disabled');
    }
  }

  /**
   * Check if n8n is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Queue a request with concurrency control and rate limiting
   */
  private async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if we're at max concurrency
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Rate limit: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.activeRequests++;
    this.lastRequestTime = Date.now();
    
    try {
      return await fn();
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Make a request to n8n API (with queueing and circuit breaker)
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('n8n client not configured - missing API key');
    }

    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      if (Date.now() < this.circuitBreakerResetTime) {
        throw new Error('Circuit breaker open - n8n API temporarily disabled');
      } else {
        // Reset circuit breaker
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
        console.log('✅ Circuit breaker reset - resuming n8n API calls');
      }
    }

    return this.queueRequest(async () => {
      const url = `${this.baseUrl}${endpoint}`;
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'X-N8N-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
            ...options.headers
          },
          signal: AbortSignal.timeout(30000) // Increased to 30 seconds
        });

        if (!response.ok) {
          // Throttle auth error logging
          if (response.status === 401 || response.status === 403) {
            const now = Date.now();
            if (now - this.lastAuthError > this.authErrorThrottle) {
              console.error(`❌ n8n authentication failed - check N8N_API_KEY`);
              this.lastAuthError = now;
            }
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error(`❌ n8n API error ${response.status}:`, errorText.substring(0, 200));
          }
          throw new Error(`n8n API error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        const result = contentType && contentType.includes('application/json')
          ? await response.json()
          : await response.text();
        
        // Success - reset failure count
        this.failureCount = 0;
        return result;
      } catch (error: any) {
        // Track failures for circuit breaker
        this.failureCount++;
        
        // Open circuit breaker if too many failures
        if (this.failureCount >= this.maxFailures) {
          this.circuitBreakerOpen = true;
          this.circuitBreakerResetTime = Date.now() + this.circuitBreakerTimeout;
          console.error(`🚨 Circuit breaker OPEN - too many n8n API failures (${this.failureCount}). Pausing for ${this.circuitBreakerTimeout/1000}s`);
        }
        
        // Only log non-auth errors in detail
        if (!error.message?.includes('401') && !error.message?.includes('403')) {
          console.error(`❌ n8n request failed:`, error.message);
        }
        throw error;
      }
    });
  }

  /**
   * List all workflows
   */
  async listWorkflows(options: { 
    limit?: number; 
    offset?: number; 
    active?: boolean; 
    tags?: string[] 
  } = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    // Default to n8n's max limit of 250
    const limit = options.limit || 250;
    queryParams.append('limit', limit.toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    if (options.active !== undefined) queryParams.append('active', options.active.toString());
    
    const endpoint = `/workflows${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.request(endpoint);
    
    // n8n API returns { data: [...workflows] }
    const workflows = response.data || [];
    
    if (Array.isArray(workflows)) {
      console.log(`✅ Retrieved ${workflows.length} workflows from n8n`);
      return workflows;
    }
    
    console.warn('n8n returned non-array workflows:', response);
    return [];
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<any | null> {
    try {
      const workflow = await this.request(`/workflows/${id}`);
      
      if (workflow && workflow.id) {
        console.log(`✅ Retrieved workflow: ${workflow.name || id}`);
        return workflow;
      }
      
      console.warn('n8n returned invalid workflow:', workflow);
      return null;
    } catch (error) {
      console.error(`getWorkflow error for ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a workflow
   */
  async createWorkflow(workflow: any): Promise<any | null> {
    try {
      const created = await this.request('/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow)
      });
      
      console.log(`✅ Created workflow: ${created.name || created.id}`);
      return created;
    } catch (error) {
      console.error('createWorkflow error:', error);
      return null;
    }
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(id: string, updates: any): Promise<any | null> {
    try {
      const updated = await this.request(`/workflows/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      
      console.log(`✅ Updated workflow: ${id}`);
      return updated;
    } catch (error) {
      console.error(`updateWorkflow error for ${id}:`, error);
      return null;
    }
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(id: string): Promise<boolean> {
    try {
      await this.request(`/workflows/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: true })
      });
      console.log(`✅ Activated workflow: ${id}`);
      return true;
    } catch (error) {
      console.error(`activateWorkflow error for ${id}:`, error);
      return false;
    }
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(id: string): Promise<boolean> {
    try {
      await this.request(`/workflows/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: false })
      });
      console.log(`✅ Deactivated workflow: ${id}`);
      return true;
    } catch (error) {
      console.error(`deactivateWorkflow error for ${id}:`, error);
      return false;
    }
  }

  /**
   * Export workflow (alias for getWorkflow for compatibility)
   */
  async exportWorkflow(id: string): Promise<any | null> {
    return this.getWorkflow(id);
  }
}

// Singleton instance
let mcpClient: MCPn8nClient | null = null;

export function getMCPn8nClient(): MCPn8nClient {
  if (!mcpClient) {
    mcpClient = new MCPn8nClient();
  }
  return mcpClient;
}

