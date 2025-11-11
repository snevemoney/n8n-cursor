/**
 * Health Telemetry Emitter
 * Periodically emits health check telemetry events for observability dashboard
 */

import { telemetry } from './emitter';
import { getRAGStore, getOntologyStore, getOrchestrator } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { getMistakeLearner } from '@/lib/fine-tuning/mistake-learner';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationSystem } from '@/lib/notifications';

let healthCheckInterval: NodeJS.Timeout | null = null;
let isRunning = false;

/**
 * Start periodic health check emitter
 * Runs health checks and emits telemetry events every 15 seconds
 */
export function startHealthEmitter(): void {
  if (isRunning) {
    console.log('[HealthEmitter] Already running');
    return;
  }

  isRunning = true;
  console.log('[HealthEmitter] Starting periodic health checks...');

  // Health emitter started - will begin checks shortly
  console.log('[HealthEmitter] Health emitter started');

  // Run initial check immediately (with delay to ensure stores are ready)
  setTimeout(() => {
    console.log('[HealthEmitter] Running initial health check...');
    performHealthCheck().catch(err => {
      console.error('[HealthEmitter] Initial health check failed:', err);
      // Even on error, emit something so dashboard shows activity
      try {
        telemetry.systemLog('warn', 'Health check initialization in progress', 'health-emitter');
        telemetry.systemHealth('health-emitter', 'degraded');
      } catch (e) {
        console.error('[HealthEmitter] Failed to emit error event:', e);
      }
    });
  }, 2000); // 2 second delay to ensure stores are initialized

  // Then run every 10 seconds for more frequent updates
  healthCheckInterval = setInterval(() => {
    console.log('[HealthEmitter] Running periodic health check...');
    performHealthCheck().catch(err => {
      console.error('[HealthEmitter] Periodic health check failed:', err);
    });
  }, 10000); // 10 seconds for real-time observability
}

/**
 * Stop periodic health check emitter
 */
export function stopHealthEmitter(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  isRunning = false;
  console.log('[HealthEmitter] Stopped');
}

/**
 * Perform health check and emit telemetry events
 */
async function performHealthCheck(): Promise<void> {
  try {
    console.log('[HealthEmitter] Starting health checks for all services...');
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

    let healthy = 0;
    let warnings = 0;
    let errors = 0;

    checks.forEach((result, index) => {
      const systemName = systemNames[index];

      if (result.status === 'fulfilled') {
        const checkResult = result.value;
        const telemetryStatus = checkResult.status === 'ok' ? 'healthy' :
                                checkResult.status === 'warning' ? 'degraded' : 'down';

        console.log(`[HealthEmitter] ${systemName}: ${telemetryStatus}`);
        telemetry.systemHealth(systemName, telemetryStatus);
        telemetry.systemLog(
          checkResult.status === 'ok' ? 'info' :
          checkResult.status === 'warning' ? 'warn' : 'error',
          `${systemName}: ${checkResult.status}${checkResult.message ? ` - ${checkResult.message}` : ''}`,
          'health-emitter',
          checkResult.details
        );

        if (checkResult.status === 'ok') {
          healthy++;
        } else if (checkResult.status === 'warning') {
          warnings++;
        } else {
          errors++;
        }
      } else {
        telemetry.systemHealth(systemName, 'down');
        telemetry.systemLog(
          'error',
          `${systemName}: Check failed - ${result.reason?.message || 'Unknown error'}`,
          'health-emitter'
        );
        errors++;
      }
    });

    // Emit summary
    const overallStatus = errors > 2 ? 'unhealthy' : errors > 0 || warnings > 0 ? 'degraded' : 'healthy';
    console.log(`[HealthEmitter] Health check complete: ${healthy} healthy, ${warnings} warnings, ${errors} errors`);
    telemetry.systemLog(
      overallStatus === 'healthy' ? 'info' : overallStatus === 'degraded' ? 'warn' : 'error',
      `Health check: ${healthy} healthy, ${warnings} warnings, ${errors} errors`,
      'health-emitter',
      { healthy, warnings, errors }
    );
  } catch (error: any) {
    console.error('[HealthEmitter] Health check error:', error);
    telemetry.systemLog('error', `Health check failed: ${error.message}`, 'health-emitter');
  }
}

// Individual health check functions (same as health endpoint)

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
    // Emit event even on error so dashboard shows something
    console.warn('[HealthEmitter] RAG check failed:', error.message);
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

