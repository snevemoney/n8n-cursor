import { NextRequest, NextResponse } from 'next/server';
import { getRAGStore, getOntologyStore, getOrchestrator } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';
import { getMistakeLearner } from '@/lib/fine-tuning/mistake-learner';
import { getSystemAutomation } from '@/lib/system-automation';
import { getNotificationSystem } from '@/lib/notifications';

/**
 * GET /api/health - Comprehensive health check endpoint
 * Returns status of all Scorpion systems
 */
export async function GET(request: NextRequest) {
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

  // Check RAG Store
  try {
    const ragStore = await getRAGStore();
    const knowledge = ragStore.getAllKnowledge();
    health.systems.rag = {
      status: 'ok',
      details: {
        knowledgeItems: knowledge.length,
        initialized: true
      }
    };
    health.summary.healthy++;
  } catch (error: any) {
    health.systems.rag = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check Ontology Store
  try {
    const ontologyStore = await getOntologyStore();
    const entities = await ontologyStore.query({});
    health.systems.ontology = {
      status: 'ok',
      details: {
        entities: entities.length,
        initialized: true
      }
    };
    health.summary.healthy++;
  } catch (error: any) {
    health.systems.ontology = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check Orchestrator
  try {
    const orchestrator = await getOrchestrator();
    const summary = await orchestrator.getSummary();
    health.systems.orchestrator = {
      status: summary.status.overallHealth === 'critical' ? 'error' : 
              summary.status.overallHealth === 'degraded' ? 'warning' : 'ok',
      details: {
        totalKnowledge: summary.totalKnowledge,
        workflows: summary.workflows,
        projectHealth: summary.status.overallHealth
      }
    };
    if (health.systems.orchestrator.status === 'ok') {
      health.summary.healthy++;
    } else if (health.systems.orchestrator.status === 'warning') {
      health.summary.warnings++;
      if (health.status === 'healthy') health.status = 'degraded';
    } else {
      health.summary.errors++;
      health.status = 'unhealthy';
    }
  } catch (error: any) {
    health.systems.orchestrator = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check Training Data Collector
  try {
    const collector = getTrainingDataCollector();
    const stats = collector.getStats();
    health.systems.trainingData = {
      status: stats.highQuality >= 10 ? 'ok' : 'warning',
      details: {
        totalExamples: stats.total,
        highQuality: stats.highQuality,
        averageQuality: stats.averageQuality
      }
    };
    if (health.systems.trainingData.status === 'ok') {
      health.summary.healthy++;
    } else {
      health.summary.warnings++;
      if (health.status === 'healthy') health.status = 'degraded';
    }
  } catch (error: any) {
    health.systems.trainingData = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check Mistake Learner
  try {
    const learner = getMistakeLearner();
    const stats = learner.getStats();
    health.systems.mistakeLearner = {
      status: stats.unlearned > 10 ? 'warning' : 'ok',
      details: {
        totalMistakes: stats.total,
        learned: stats.learned,
        unlearned: stats.unlearned
      }
    };
    if (health.systems.mistakeLearner.status === 'ok') {
      health.summary.healthy++;
    } else {
      health.summary.warnings++;
      if (health.status === 'healthy') health.status = 'degraded';
    }
  } catch (error: any) {
    health.systems.mistakeLearner = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check Notification System
  try {
    const notifications = getNotificationSystem();
    const unread = notifications.getUnreadNotifications();
    const actionRequired = notifications.getNotificationsRequiringAction();
    health.systems.notifications = {
      status: actionRequired.length > 5 ? 'warning' : 'ok',
      details: {
        unread: unread.length,
        actionRequired: actionRequired.length
      }
    };
    if (health.systems.notifications.status === 'ok') {
      health.summary.healthy++;
    } else {
      health.summary.warnings++;
      if (health.status === 'healthy') health.status = 'degraded';
    }
  } catch (error: any) {
    health.systems.notifications = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check System Automation
  try {
    const automation = getSystemAutomation();
    const stackHealth = await automation.checkStackHealth();
    health.systems.systemAutomation = {
      status: stackHealth.overallHealth === 'critical' ? 'error' :
              stackHealth.overallHealth === 'degraded' ? 'warning' : 'ok',
      details: {
        overallHealth: stackHealth.overallHealth,
        services: stackHealth.services.length,
        onlineServices: stackHealth.services.filter(s => s.status === 'online').length
      }
    };
    if (health.systems.systemAutomation.status === 'ok') {
      health.summary.healthy++;
    } else if (health.systems.systemAutomation.status === 'warning') {
      health.summary.warnings++;
      if (health.status === 'healthy') health.status = 'degraded';
    } else {
      health.summary.errors++;
      health.status = 'unhealthy';
    }
  } catch (error: any) {
    health.systems.systemAutomation = {
      status: 'error',
      message: error.message
    };
    health.summary.errors++;
    health.status = 'unhealthy';
  }
  health.summary.total++;

  // Check Environment Variables
  const requiredEnvVars = ['N8N_API_KEY'];
  const missingEnvVars: string[] = [];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }
  
  health.systems.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'warning',
    details: {
      missing: missingEnvVars,
      n8nConfigured: !!process.env.N8N_API_KEY,
      ollamaConfigured: !!process.env.OLLAMA_URL
    }
  };
  if (health.systems.environment.status === 'ok') {
    health.summary.healthy++;
  } else {
    health.summary.warnings++;
    if (health.status === 'healthy') health.status = 'degraded';
  }
  health.summary.total++;

  // Determine HTTP status code
  const statusCode = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : // Still return 200 but with degraded status
                     503; // Unhealthy

  return NextResponse.json(health, { status: statusCode });
}

