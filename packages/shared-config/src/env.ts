/**
 * Environment-aware URL configuration
 * Detects local vs cloud environment and returns appropriate URLs
 */

/**
 * Get the n8n base URL based on environment
 * - Local: uses .local domains or localhost
 * - Cloud: uses production domain
 */
export function getN8nBaseUrl(): string {
  // Check for explicit env var first (works in both client and server)
  const publicUrl = process.env['NEXT_PUBLIC_N8N_BASE_URL'];
  if (publicUrl) {
    return publicUrl;
  }

  // Client-side detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development (.local domains or localhost)
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        hostname.includes('.local')) {
      return 'http://n8n.local/webhook';
    }
    
    // Client-side production/cloud - use cloud URL
    // This ensures n8ncloud.tech and LightningFlow.online still work
    return 'https://n8ncloud.tech/webhook';
  }

  // Server-side detection
  // Check NODE_ENV for development
  const nodeEnv = process.env['NODE_ENV'];
  if (nodeEnv === 'development') {
    return 'http://n8n.local/webhook';
  }

  // Server-side production or fallback
  const baseUrl = process.env['N8N_BASE_URL'];
  return baseUrl || 'https://n8ncloud.tech/webhook';
}

/**
 * Get the default tenant ID
 */
export function getDefaultTenantId(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'test-tenant-webhook-validation';
}

/**
 * Check if running in local development
 */
export function isLocalDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' ||
           hostname.includes('.local');
  }
  
  return process.env.NODE_ENV === 'development';
}

