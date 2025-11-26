import { NextRequest, NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/lib/utils/ollama-health';
import { checkLlamaCppHealth } from '@/lib/utils/llamacpp-health';

// Helper to test Redis connection
async function testRedisConnection(redisUrl: string): Promise<{ connected: boolean; error?: string }> {
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: redisUrl });
    
    // Set a timeout for the connection test
    const timeoutPromise = new Promise<{ connected: boolean; error?: string }>((resolve) => {
      setTimeout(() => resolve({ connected: false, error: 'Connection timeout' }), 2000);
    });
    
    const connectPromise = (async () => {
      try {
        await client.connect();
        await client.ping();
        await client.quit();
        return { connected: true };
      } catch (err: any) {
        try {
          await client.quit();
        } catch {
          // Ignore quit errors
        }
        return { connected: false, error: err.message || 'Connection failed' };
      }
    })();
    
    return await Promise.race([connectPromise, timeoutPromise]);
  } catch (error: any) {
    return { connected: false, error: error.message || 'Failed to import Redis client' };
  }
}

// Helper to test Database connection
async function testDatabaseConnection(dbUrl: string): Promise<{ connected: boolean; error?: string }> {
  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: dbUrl });
    
    // Set a timeout for the connection test
    const timeoutPromise = new Promise<{ connected: boolean; error?: string }>((resolve) => {
      setTimeout(() => resolve({ connected: false, error: 'Connection timeout' }), 2000);
    });
    
    const connectPromise = (async () => {
      try {
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        return { connected: true };
      } catch (err: any) {
        try {
          await client.end();
        } catch {
          // Ignore end errors
        }
        return { connected: false, error: err.message || 'Connection failed' };
      }
    })();
    
    return await Promise.race([connectPromise, timeoutPromise]);
  } catch (error: any) {
    return { connected: false, error: error.message || 'Failed to import PostgreSQL client' };
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    ollama: { status: 'up' | 'down'; error?: string; model?: string };
    llamacpp: { status: 'up' | 'down'; error?: string; model?: string };
    openai: { status: 'up' | 'down'; error?: string };
    redis?: { status: 'up' | 'down'; error?: string };
    database?: { status: 'up' | 'down'; error?: string };
    mlx?: { status: 'up' | 'down'; error?: string };
  };
  latency: {
    ollama?: number;
    llamacpp?: number;
    openai?: number;
  };
}

/**
 * GET /api/health
 * Aggregates health status of all services
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ollama: { status: 'down' },
      llamacpp: { status: 'down' },
      openai: { status: 'down' },
    },
    latency: {},
  };

  // Check Ollama
  try {
    const ollamaUrl = process.env['OLLAMA_URL'] || 'http://localhost:11434';
    const ollamaHealth = await checkOllamaHealth(ollamaUrl);
    const ollamaLatency = Date.now() - startTime;
    
    if (ollamaHealth.healthy) {
      health.services.ollama = {
        status: 'up',
        model: ollamaHealth.model || process.env['OLLAMA_MODEL'] || 'default',
      };
      health.latency.ollama = ollamaLatency;
    } else {
      health.services.ollama = {
        status: 'down',
        error: ollamaHealth.error || 'Unknown error',
      };
      health.status = 'degraded';
    }
  } catch (error: any) {
    health.services.ollama = {
      status: 'down',
      error: error.message || 'Connection failed',
    };
    health.status = 'degraded';
  }

  // Check llama.cpp
  try {
    const llamacppUrl = process.env['LLAMACPP_BASE_URL'] || 'http://localhost:8033';
    const llamacppStartTime = Date.now();
    const llamacppHealth = await checkLlamaCppHealth(llamacppUrl);
    const llamacppLatency = Date.now() - llamacppStartTime;
    
    if (llamacppHealth.healthy) {
      health.services.llamacpp = {
        status: 'up',
        model: llamacppHealth.model || process.env['LLAMACPP_MODEL'] || 'default',
      };
      health.latency.llamacpp = llamacppLatency;
    } else {
      // Only mark as degraded if llama.cpp is explicitly enabled
      if (process.env['LLAMACPP_ENABLED'] === 'true') {
        health.services.llamacpp = {
          status: 'down',
          error: llamacppHealth.error || 'Unknown error',
        };
        health.status = 'degraded';
      } else {
        // If not enabled, mark as down but don't affect overall health
        health.services.llamacpp = {
          status: 'down',
          error: 'LLAMACPP_ENABLED not set to true (optional)',
        };
      }
    }
  } catch (error: any) {
    // Only mark as degraded if llama.cpp is explicitly enabled
    if (process.env['LLAMACPP_ENABLED'] === 'true') {
      health.services.llamacpp = {
        status: 'down',
        error: error.message || 'Connection failed',
      };
      health.status = 'degraded';
    } else {
      health.services.llamacpp = {
        status: 'down',
        error: 'Not configured (optional)',
      };
    }
  }

  // Check OpenAI (lightweight check - just verify API key exists)
  try {
    const openaiKey = process.env['OPENAI_API_KEY'];
    if (openaiKey && openaiKey.length > 20) {
      health.services.openai = { status: 'up' };
    } else {
      health.services.openai = {
        status: 'down',
        error: 'OPENAI_API_KEY not configured',
      };
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
  } catch (error: any) {
    health.services.openai = {
      status: 'down',
      error: error.message || 'Unknown error',
    };
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  // Check Redis
  try {
    const redisUrl = process.env['REDIS_URL'];
    if (redisUrl) {
      // Verify URL format first
      const urlPattern = /^redis(s)?:\/\//;
      if (!urlPattern.test(redisUrl)) {
        health.services.redis = {
          status: 'down',
          error: 'Invalid REDIS_URL format',
        };
      } else {
        // Actually test the connection
        const testResult = await testRedisConnection(redisUrl);
        if (testResult.connected) {
          health.services.redis = { status: 'up' };
        } else {
          health.services.redis = {
            status: 'down',
            error: testResult.error || 'Connection failed',
          };
        }
      }
    } else {
      health.services.redis = {
        status: 'down',
        error: 'REDIS_URL not configured',
      };
    }
  } catch (error: any) {
    health.services.redis = {
      status: 'down',
      error: error.message || 'Connection failed',
    };
  }

  // Check Database
  try {
    const dbUrl = process.env['DATABASE_URL'] || process.env['POSTGRES_URL'];
    if (dbUrl) {
      // Verify URL format first
      const urlPattern = /^postgres(ql)?:\/\//;
      if (!urlPattern.test(dbUrl)) {
        health.services.database = {
          status: 'down',
          error: 'Invalid DATABASE_URL format',
        };
      } else {
        // Actually test the connection
        const testResult = await testDatabaseConnection(dbUrl);
        if (testResult.connected) {
          health.services.database = { status: 'up' };
        } else {
          health.services.database = {
            status: 'down',
            error: testResult.error || 'Connection failed',
          };
        }
      }
    } else {
      health.services.database = {
        status: 'down',
        error: 'DATABASE_URL not configured',
      };
    }
  } catch (error: any) {
    health.services.database = {
      status: 'down',
      error: error.message || 'Connection failed',
    };
  }

  // Check MLX (Apple Silicon ML acceleration - optional)
  try {
    const mlxEnabled = process.env['MLX_ENABLED'] === 'true';
    if (mlxEnabled) {
      // Check if we're on Apple Silicon
      const isAppleSilicon = process.platform === 'darwin' && process.arch === 'arm64';
      if (isAppleSilicon) {
        // Try to verify MLX is available (Python library)
        // For now, if enabled and on Apple Silicon, assume it's available
        // In the future, could check Python/MLX installation
        health.services.mlx = { status: 'up' };
      } else {
        health.services.mlx = {
          status: 'down',
          error: 'MLX requires Apple Silicon (ARM64)',
        };
      }
    } else {
      // MLX is optional - only show as down if explicitly enabled but not available
      // For now, if not enabled, we'll still show it but mark as optional
      health.services.mlx = {
        status: 'down',
        error: 'MLX_ENABLED not set to true (optional - Apple Silicon ML acceleration)',
      };
    }
  } catch (error: any) {
    health.services.mlx = {
      status: 'down',
      error: error.message || 'Unknown error',
    };
  }

  // Determine overall status
  // Critical services: at least one LLM provider must be up
  const llmServices = [health.services.ollama, health.services.llamacpp, health.services.openai];
  const hasWorkingLLM = llmServices.some(s => s.status === 'up');
  if (!hasWorkingLLM) {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}
