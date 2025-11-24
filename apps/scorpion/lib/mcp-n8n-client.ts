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
  private startupGracePeriod: number = 10000; // 10 seconds grace period on startup
  private initializedAt: number = Date.now();

  constructor() {
    // Standardize on N8N_API_URL, with fallback to N8N_BASE_URL for backward compatibility
    let baseUrl = process.env.N8N_API_URL || process.env.N8N_BASE_URL || 'https://n8ncloud.tech';
    
    // Ensure baseUrl includes /api/v1 for n8n API endpoints
    if (!baseUrl.includes('/api/v1')) {
      baseUrl = baseUrl.replace(/\/$/, '');
      baseUrl = `${baseUrl}/api/v1`;
    }
    
    this.baseUrl = baseUrl;
    // Trim whitespace that can cause auth failures
    this.apiKey = (process.env.N8N_API_KEY || '').trim();
    
    // If API key seems truncated (< 100 chars for JWT), try reading from .env.local directly
    if (this.apiKey && this.apiKey.length < 100) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf-8');
          const match = envContent.match(/^N8N_API_KEY=(.+)$/m);
          if (match && match[1]) {
            const fileApiKey = match[1].trim();
            if (fileApiKey.length > this.apiKey.length) {
              this.apiKey = fileApiKey;
            }
          }
        }
      } catch (e) {
        // Silently fail - use what we have from process.env
      }
    }
    
    // VALIDATE API KEY - Detect placeholder values
    const placeholderPatterns = [
      'your-api-key',
      'your_n8n_api_key',
      'your-actual-n8n-api-key',
      'your_production_n8n_api_key',
      'your-api-key-here',
      'NOT SET'
    ];
    
    const isPlaceholder = placeholderPatterns.some(pattern => 
      this.apiKey.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // JWT tokens are typically 200+ characters, placeholders are < 50
    const isValidFormat = this.apiKey.length > 100 && this.apiKey.includes('.');
    
    if (!this.apiKey) {
      console.error('❌❌❌ N8N_API_KEY is NOT SET!');
      console.error('   Set it in apps/scorpion/.env.local:');
      console.error('   N8N_API_KEY=your_actual_api_key_here');
    } else if (isPlaceholder || !isValidFormat) {
      console.error('❌❌❌ INVALID N8N_API_KEY DETECTED!');
      console.error(`   Current value looks like a placeholder (length: ${this.apiKey.length})`);
      console.error(`   Preview: ${this.apiKey.substring(0, 20)}...`);
      console.error('   Update apps/scorpion/.env.local with your real API key from n8ncloud.tech');
      console.error('   Then restart the server.');
      // Don't set apiKey to empty - keep it so we can show the error
    }
    
    // Debug logging
    console.log('🔍 Scorpion n8n Client Init:', {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey && !isPlaceholder && isValidFormat,
      apiKeyLength: this.apiKey.length,
      isValidFormat,
      isPlaceholder,
      envVarExists: !!process.env.N8N_API_KEY,
      envVarLength: process.env.N8N_API_KEY?.length || 0
    });
    
    // ALWAYS reset circuit breaker on init - never block on startup
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
    
    this.initializedAt = Date.now();
  }

  /**
   * Check if n8n is configured with a VALID API key
   */
  isConfigured(): boolean {
    if (!this.apiKey) return false;
    // Reject placeholder values
    const placeholderPatterns = ['your-api-key', 'your_n8n_api_key', 'your-actual-n8n-api-key'];
    const isPlaceholder = placeholderPatterns.some(p => this.apiKey.toLowerCase().includes(p.toLowerCase()));
    const isValidFormat = this.apiKey.length > 100 && this.apiKey.includes('.');
    return !isPlaceholder && isValidFormat;
  }

  /**
   * Get circuit breaker status (for debugging)
   */
  getCircuitBreakerStatus(): {
    open: boolean;
    failureCount: number;
    resetTime: number | null;
    timeUntilReset: number | null;
    initializedAt: number;
    timeSinceInit: number;
  } {
    return {
      open: this.circuitBreakerOpen,
      failureCount: this.failureCount,
      resetTime: this.circuitBreakerResetTime || null,
      timeUntilReset: this.circuitBreakerOpen && this.circuitBreakerResetTime 
        ? Math.max(0, this.circuitBreakerResetTime - Date.now())
        : null,
      initializedAt: this.initializedAt,
      timeSinceInit: Date.now() - this.initializedAt
    };
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
   * Reset the circuit breaker manually
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerOpen = false;
    this.failureCount = 0;
    this.circuitBreakerResetTime = 0;
    console.log('✅ Circuit breaker manually reset');
  }

  /**
   * Make a request to n8n API (with queueing and circuit breaker)
   */
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isConfigured()) {
      const errorMsg = !this.apiKey 
        ? 'N8N_API_KEY is not set. Add it to apps/scorpion/.env.local'
        : 'N8N_API_KEY appears to be a placeholder. Update apps/scorpion/.env.local with your real API key';
      throw new Error(`n8n client not configured - ${errorMsg}`);
    }

    // NEVER block on startup - always allow requests through for first 30 seconds
    const timeSinceInit = Date.now() - this.initializedAt;
    const startupPeriod = 30000; // 30 seconds
    
    if (this.circuitBreakerOpen && timeSinceInit < startupPeriod) {
      // Force reset during startup period
      console.log('🔄 Resetting circuit breaker during startup period');
      this.circuitBreakerOpen = false;
      this.failureCount = 0;
    }

    // Check circuit breaker (only after startup period)
    if (this.circuitBreakerOpen && timeSinceInit >= startupPeriod) {
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
          cache: 'no-store', // Prevent Next.js from trying to cache >2MB responses
          signal: (() => {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 30000);
            return controller.signal;
          })()
        });

        if (!response.ok) {
          // Better error messages
          if (response.status === 401 || response.status === 403) {
            const now = Date.now();
            if (now - this.lastAuthError > this.authErrorThrottle) {
              console.error('❌ n8n authentication failed (401/403)');
              console.error('   Check that N8N_API_KEY in apps/scorpion/.env.local is correct');
              console.error('   Get your API key from: https://n8ncloud.tech/settings/api');
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
        const isInGracePeriod = (Date.now() - this.initializedAt) < this.startupGracePeriod;
        
        // Don't count failures during startup grace period
        if (!isInGracePeriod) {
          this.failureCount++;
          
          // Open circuit breaker if too many failures (but only after startup period)
          if (this.failureCount >= this.maxFailures) {
            this.circuitBreakerOpen = true;
            this.circuitBreakerResetTime = Date.now() + this.circuitBreakerTimeout;
            console.error(`🚨 Circuit breaker OPEN - too many n8n API failures (${this.failureCount}). Pausing for ${this.circuitBreakerTimeout/1000}s`);
          }
        } else {
          console.log(`⚠️ Failure during startup grace period (not counted): ${error.message}`);
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

  /**
   * List executions (completed and running)
   */
  async listExecutions(options: {
    limit?: number;
    workflowId?: string;
    status?: 'waiting' | 'error' | 'success' | 'running';
    includeData?: boolean;
  } = {}): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      const limit = options.limit || 50;
      queryParams.append('limit', limit.toString());
      if (options.workflowId) queryParams.append('workflowId', options.workflowId);
      if (options.status) queryParams.append('status', options.status);
      if (options.includeData !== undefined) queryParams.append('includeData', options.includeData.toString());
      
      const endpoint = `/executions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await this.request(endpoint);
      
      // n8n API returns { data: [...executions] }
      const executions = response.data || [];
      
      if (Array.isArray(executions)) {
        return executions;
      }
      
      console.warn('n8n returned non-array executions:', response);
      return [];
    } catch (error) {
      console.error('listExecutions error:', error);
      return [];
    }
  }

  /**
   * Get active (running) executions
   */
  async getActiveExecutions(workflowId?: string): Promise<any[]> {
    try {
      return await this.listExecutions({
        status: 'running',
        limit: 100,
        workflowId,
        includeData: false
      });
    } catch (error) {
      console.error('getActiveExecutions error:', error);
      return [];
    }
  }

  /**
   * Get completed executions (successful)
   */
  async getCompletedExecutions(limit: number = 100, workflowId?: string): Promise<any[]> {
    try {
      return await this.listExecutions({
        status: 'success',
        limit,
        workflowId,
        includeData: false
      });
    } catch (error) {
      console.error('getCompletedExecutions error:', error);
      return [];
    }
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

