import { NextRequest, NextResponse } from 'next/server';
import { telemetry } from '@/lib/telemetry/emitter';
import { getRAGStore, getOntologyStore, getOrchestrator } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { getMistakeLearner } from '@/lib/fine-tuning/mistake-learner';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationSystem } from '@/lib/notifications';
import { getMetricsCollector } from '@/lib/metrics';
import { createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telemetry/populate
 * 
 * Immediately generate real telemetry data from actual system state
 * This ensures the observability dashboard shows real data, not demos
 */
export async function POST(req: NextRequest) {
  try {
    // Force a fresh health check (bypass cache) and emit telemetry
    const healthChecks = await Promise.allSettled([
      checkRAG(),
      checkOntology(),
      checkOrchestrator(),
      checkTrainingData(),
      checkMistakeLearner(),
      checkN8nClient(),
      checkSystemAutomation(),
      checkNotifications(),
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

    // Emit telemetry events for each system
    healthChecks.forEach((result, index) => {
      const systemName = systemNames[index];

      if (result.status === 'fulfilled') {
        const checkResult = result.value;
        const telemetryStatus = checkResult.status === 'ok' ? 'healthy' :
                                checkResult.status === 'warning' ? 'degraded' : 'down';

        telemetry.systemHealth(systemName, telemetryStatus);
        telemetry.systemLog(
          checkResult.status === 'ok' ? 'info' :
          checkResult.status === 'warning' ? 'warn' : 'error',
          `${systemName}: ${checkResult.status}${checkResult.message ? ` - ${checkResult.message}` : ''}`,
          'telemetry-populate',
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
          'telemetry-populate'
        );
        errors++;
      }
    });

    // Emit overall summary
    const overallStatus = errors > 2 ? 'unhealthy' : errors > 0 || warnings > 0 ? 'degraded' : 'healthy';
    telemetry.systemLog(
      overallStatus === 'healthy' ? 'info' : overallStatus === 'degraded' ? 'warn' : 'error',
      `System health: ${healthy} healthy, ${warnings} warnings, ${errors} errors`,
      'telemetry-populate',
      { healthy, warnings, errors }
    );

    // Emit real system metrics
    try {
      const metrics = getMetricsCollector();
      const prometheusMetrics = metrics.exportPrometheus();
      
      // Parse and emit key metrics as telemetry events
      const lines = prometheusMetrics.split('\n');
      for (const line of lines) {
        if (line.startsWith('scorpion_') && !line.startsWith('#')) {
          const parts = line.split(' ');
          if (parts.length >= 2) {
            const metricName = parts[0];
            const value = parseFloat(parts[1]);
            if (!isNaN(value)) {
              telemetry.systemLog('info', `Metric: ${metricName} = ${value}`, 'metrics-collector', {
                metric: metricName,
                value
              });
            }
          }
        }
      }
    } catch (err) {
      // Silent fail - metrics are optional
    }

    // Job events are emitted from actual system activity (workflows, agents, etc.)
    // No demo/sample data - only real events from real operations

    return createSuccessResponse({
      message: 'Real telemetry data generated',
      summary: {
        healthy,
        warnings,
        errors,
        total: systemNames.length
      }
    });
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      error.message || 'Failed to populate telemetry data',
      undefined,
      500
    );
  }
}

// Health check functions (same as health endpoint)
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

