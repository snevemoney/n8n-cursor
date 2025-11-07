import { NextRequest, NextResponse } from 'next/server';
import { getRAGStore, getOntologyStore, getOrchestrator } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { getMistakeLearner } from '@/lib/fine-tuning/mistake-learner';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationSystem } from '@/lib/notifications';
import { getMetricsCollector } from '@/lib/metrics';
import { responseCache } from '@/lib/cache';

const CACHE_TTL = 15000; // 15 seconds (since dashboard auto-refreshes)

/**
 * GET /api/health - Comprehensive health check endpoint
 * Returns status of all Scorpion systems
 * Now with parallel checks and 15-second caching for improved performance
 */
export async function GET(request: NextRequest) {
  // Check cache first
  const cached = responseCache.get('health-check');
  if (cached) {
    return NextResponse.json(cached);
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
  const checks = await Promise.allSettled([
    checkRAG(),
    checkOntology(),
    checkOrchestrator(),
    checkTrainingData(),
    checkMistakeLearner(),
    checkN8nClient(),
    checkSystemAutomation(),
    checkNotifications()
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
    'notifications'
  ];

  // Process results
  checks.forEach((result, index) => {
    health.summary.total++;
    const systemName = systemNames[index];
    
    if (result.status === 'fulfilled') {
      health.systems[systemName] = result.value;
      
      if (result.value.status === 'ok') {
        health.summary.healthy++;
      } else if (result.value.status === 'warning') {
        health.summary.warnings++;
        if (health.status === 'healthy') health.status = 'degraded';
      } else {
        health.summary.errors++;
        health.status = health.summary.errors > 2 ? 'unhealthy' : 'degraded';
      }
    } else {
      health.systems[systemName] = {
        status: 'error',
        message: result.reason?.message || 'Check failed'
      };
      health.summary.errors++;
      health.status = health.summary.errors > 2 ? 'unhealthy' : 'degraded';
    }
  });

  // Cache the result
  responseCache.set('health-check', health, CACHE_TTL);

  return NextResponse.json(health);
}

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
    return {
      status: (summary.status.overallHealth === 'critical' ? 'error' : 
              summary.status.overallHealth === 'degraded' ? 'warning' : 'ok') as const,
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
    return {
      status: (isLowQuality ? 'warning' : 'ok') as const,
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
    
    return {
      status: (hasRecentErrors ? 'warning' : 'ok') as const,
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
    
    return {
      status: (actionRequired.length > 10 ? 'warning' : 'ok') as const,
      details: {
        pendingActions: actionRequired.length,
        hasUrgent: actionRequired.some(n => n.priority === 'high')
      }
    };
  } catch (error: any) {
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}
