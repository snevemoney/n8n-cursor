import { NextRequest, NextResponse } from 'next/server';
import { getRAGStore, getOntologyStore, getOrchestrator } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { getMistakeLearner } from '@/lib/fine-tuning/mistake-learner';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationSystem } from '@/lib/notifications';
import { getMetricsCollector } from '@/lib/metrics';
import { responseCache } from '@/lib/cache';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, getRequestId } from '@/lib/api-error-handler';
import { telemetry } from '@/lib/telemetry/emitter';

const CACHE_TTL = 15000; // 15 seconds (since dashboard auto-refreshes)

/**
 * GET /api/health - Comprehensive health check endpoint
 * Returns status of all Scorpion systems
 * Now with parallel checks and 15-second caching for improved performance
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const requestId = getRequestId(request);
  
  // Check cache first
  const cached = responseCache.get('health-check');
  if (cached) {
    // Even with cached data, emit telemetry events for observability
    // This ensures the dashboard always has fresh telemetry data
    try {
      Object.entries(cached.systems || {}).forEach(([systemName, systemData]: [string, any]) => {
        const telemetryStatus = systemData.status === 'ok' ? 'healthy' : 
                                systemData.status === 'warning' ? 'degraded' : 'down';
        telemetry.systemHealth(systemName, telemetryStatus);
      });
      
      // Emit summary log
      telemetry.systemLog(
        cached.status === 'healthy' ? 'info' : cached.status === 'degraded' ? 'warn' : 'error',
        `Health check (cached): ${cached.summary?.healthy || 0} healthy, ${cached.summary?.warnings || 0} warnings, ${cached.summary?.errors || 0} errors`,
        'health-check',
        { summary: cached.summary, cached: true }
      );
    } catch (err) {
      // Silent fail - telemetry is optional
    }
    
    return createSuccessResponse(cached);
  }

  const health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    systems: Record<string, {
      status: 'ok' | 'warning' | 'error';
      message?: string;
      details?: any;
    }>;
    summary: {
      total: number;
      healthy: number;
      warnings: number;
      errors: number;
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    systems: {},
    summary: {
      total: 0,
      healthy: 0,
      warnings: 0,
      errors: 0
    }
  };

  // Run all health checks in parallel for better performance
  // Note: Supabase and Redis are optional (not used - all data stored locally)
  const checks = await Promise.allSettled([
    checkRAG(),
    checkOntology(),
    checkOrchestrator(),
    checkTrainingData(),
    checkMistakeLearner(),
    checkN8nClient(),
    checkSystemAutomation(),
    checkNotifications(),
    checkOllama() // Ollama is local - optional but recommended for LLM features
    // Supabase and Redis removed - not used, all data stored locally
  ]);

  // System names matching the order of checks
  const systemNames = [
    'rag',
    'ontology',
    'orchestrator',
    'trainingData',
    'mistakeLearner',
    'n8nClient',
    'systemAutomation',
    'notifications',
    'ollama'
  ];

  // Core systems that affect overall health status
  const coreSystems = new Set(['rag', 'ontology', 'orchestrator', 'trainingData', 'mistakeLearner', 'notifications']);
  // Optional systems - warnings don't cause degraded status
  // systemAutomation is optional because it checks external services (n8n, Ollama) which are optional
  const optionalSystems = new Set(['n8nClient', 'ollama', 'systemAutomation']);

  // Process results and emit telemetry events
  checks.forEach((result, index) => {
    health.summary.total++;
    const systemName = systemNames[index];
    
    if (result.status === 'fulfilled') {
      health.systems[systemName] = result.value;
      
      // Emit telemetry event for each service
      const telemetryStatus = result.value.status === 'ok' ? 'healthy' : 
                              result.value.status === 'warning' ? 'degraded' : 'down';
      try {
        telemetry.systemHealth(systemName, telemetryStatus);
        telemetry.systemLog(
          result.value.status === 'ok' ? 'info' : 
          result.value.status === 'warning' ? 'warn' : 'error',
          `${systemName}: ${result.value.status}${result.value.message ? ` - ${result.value.message}` : ''}`,
          'health-check',
          result.value.details
        );
      } catch (err) {
        // Silent fail - telemetry is optional
      }
      
      if (result.value.status === 'ok') {
        health.summary.healthy++;
      } else if (result.value.status === 'warning') {
        health.summary.warnings++;
        // Only mark as degraded if a CORE system has warnings (optional systems don't affect status)
        if (health.status === 'healthy' && coreSystems.has(systemName)) {
          health.status = 'degraded';
        }
        // Optional systems (n8nClient, ollama, systemAutomation) warnings don't cause degraded status
      } else {
        health.summary.errors++;
        // Errors always cause degraded/unhealthy status
        health.status = health.summary.errors > 2 ? 'unhealthy' : 'degraded';
      }
    } else {
      health.systems[systemName] = {
        status: 'error',
        message: result.reason?.message || 'Check failed'
      };
      
      // Emit telemetry event for failed check
      try {
        telemetry.systemHealth(systemName, 'down');
        telemetry.systemLog(
          'error',
          `${systemName}: Check failed - ${result.reason?.message || 'Unknown error'}`,
          'health-check'
        );
      } catch (err) {
        // Silent fail - telemetry is optional
      }
      
      health.summary.errors++;
      health.status = health.summary.errors > 2 ? 'unhealthy' : 'degraded';
    }
  });
  
  // Emit overall health summary log
  try {
    telemetry.systemLog(
      health.status === 'healthy' ? 'info' : health.status === 'degraded' ? 'warn' : 'error',
      `Health check completed: ${health.summary.healthy} healthy, ${health.summary.warnings} warnings, ${health.summary.errors} errors`,
      'health-check',
      { summary: health.summary }
    );
  } catch (err) {
    // Silent fail
  }

  // Cache the result
  responseCache.set('health-check', health, CACHE_TTL);

  return createSuccessResponse(health);
});

// Individual health check functions (lightweight and independent)

async function checkRAG() {
  try {
    const ragStore = await getRAGStore();
    const knowledge = ragStore.getAllKnowledge();
    return {
      status: 'ok' as const,
      details: {
        knowledgeItems: knowledge.length,
        initialized: true
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkOntology() {
  try {
    const ontologyStore = await getOntologyStore();
    const entities = await ontologyStore.query({});
    return {
      status: 'ok' as const,
      details: {
        entities: entities.length,
        initialized: true
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkOrchestrator() {
  try {
    const orchestrator = await getOrchestrator();
    const summary = await orchestrator.getSummary();
    const statusValue = summary.status.overallHealth === 'critical' ? 'error' : 
                        summary.status.overallHealth === 'degraded' ? 'warning' : 'ok';
    return {
      status: statusValue as 'error' | 'warning' | 'ok',
      details: {
        totalKnowledge: summary.totalKnowledge,
        workflows: summary.workflows,
        projectHealth: summary.status.overallHealth
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkTrainingData() {
  try {
    const collector = getTrainingDataCollector();
    const stats = collector.getStats();
    const isLowQuality = stats.total > 5 && stats.averageQuality < 0.5;
    const statusValue = isLowQuality ? 'warning' : 'ok';
    return {
      status: statusValue as 'warning' | 'ok',
      details: {
        totalExamples: stats.total,
        highQuality: stats.highQuality,
        averageQuality: stats.averageQuality
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkMistakeLearner() {
  try {
    const learner = getMistakeLearner();
    const stats = learner.getStats();
    return {
      status: 'ok' as const,
      details: {
        mistakesTracked: stats.total,
        learned: stats.learned,
        patternsDetected: stats.topPatterns.length
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkN8nClient() {
  try {
    const { getMCPn8nClient } = await import('@/lib/mcp-n8n-client');
    const client = getMCPn8nClient();
    const configured = client.isConfigured();
    
    if (!configured) {
      return {
        status: 'warning' as const,
        message: 'n8n client not configured'
      };
    }

    return {
      status: 'ok' as const,
      details: {
        configured: true
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkSystemAutomation() {
  try {
    const automation = getSystemAutomation();
    const health = await automation.checkStackHealth();
    const errors = automation.getErrors();
    
    const hasRecentErrors = errors.length > 0 && 
      (Date.now() - new Date(errors[0].detectedAt).getTime()) < 300000; // 5 min
    
    const statusValue = hasRecentErrors ? 'warning' : 'ok';
    return {
      status: statusValue as 'warning' | 'ok',
      details: {
        recentErrors: errors.slice(0, 3),
        stackHealth: health
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkNotifications() {
  try {
    const notifications = getNotificationSystem();
    const actionRequired = notifications.getNotificationsRequiringAction();
    
    const statusValue = actionRequired.length > 10 ? 'warning' : 'ok';
    return {
      status: statusValue as 'warning' | 'ok',
      details: {
        pendingActions: actionRequired.length,
        hasUrgent: actionRequired.some((n: any) => n.severity === 'high' || n.severity === 'critical')
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}

async function checkOllama() {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    
    // Quick connectivity check (with timeout)
    // Ollama is a LOCAL service - install it locally: https://ollama.ai
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout (increased from 2s)
    
    try {
      const response = await fetch(`${ollamaUrl}/api/version`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          status: 'ok' as const,
          details: {
            url: ollamaUrl,
            version: data.version || 'unknown',
            reachable: true,
            note: 'Local Ollama service running'
          }
        };
      } else {
        return {
          status: 'warning' as const,
          message: `Ollama returned ${response.status} (install locally: https://ollama.ai)`
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return {
          status: 'warning' as const,
          message: 'Ollama not running locally (optional - install: https://ollama.ai)'
        };
      }
      // Connection refused or other network error
      return {
        status: 'warning' as const,
        message: 'Ollama not running locally (optional - install: https://ollama.ai)'
      };
    }
  } catch (error: any) {
    return {
      status: 'warning' as const,
      message: 'Ollama check failed (optional - install locally: https://ollama.ai)'
    };
  }
}
