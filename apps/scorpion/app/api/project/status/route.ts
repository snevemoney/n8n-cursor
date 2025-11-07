import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';

async function getOrchestratorInstance() {
  return await getOrchestrator();
}

/**
 * GET /api/project/status - Get comprehensive project status
 */
export async function GET(request: NextRequest) {
  try {
    const orchestrator = await getOrchestratorInstance();
    const summary = await orchestrator.getSummary();

    // Check service health
    const serviceHealth = await checkServiceHealth();

    // Get actual workflow sync status
    const { WorkflowIngester } = await import('@scorpion/core');
    const { N8nClient } = await import('@/lib/n8n-client');
    const workflowIngester = new WorkflowIngester(process.cwd(), new N8nClient(process.env.N8N_API_KEY));
    const workflows = await workflowIngester.getWorkflows();
    const syncedCount = workflows.filter(w => w.syncedToN8n).length;

    return NextResponse.json({
      overallHealth: summary.status.overallHealth,
      techDebt: summary.status.techDebt,
      missingFeatures: summary.status.missingFeatures,
      services: serviceHealth,
      workspace: {
        apps: summary.workspace ? Object.keys(summary.workspace.apps || {}).length : 0,
        packages: summary.workspace?.packages?.length || 0
      },
      databases: summary.databases,
      workflows: {
        total: summary.workflows,
        synced: syncedCount
      },
      knowledge: {
        total: summary.totalKnowledge
      },
      lastIngestion: summary.status.lastIngestion
    });
  } catch (error: any) {
    console.error('Error getting project status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get project status' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint (lightweight)
 * For quick health checks, use /api/health for comprehensive status
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

/**
 * Check service health
 */
async function checkServiceHealth(): Promise<Array<{
  name: string;
  status: 'online' | 'offline' | 'unknown';
  url?: string;
  lastChecked: string;
}>> {
  const services = [
    {
      name: 'n8n',
      url: process.env.N8N_BASE_URL?.replace('/webhook', '') || 'http://localhost:5678'
    },
    {
      name: 'Ollama',
      url: process.env.OLLAMA_URL || 'http://localhost:11434'
    }
  ];

  const healthChecks = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const response = await fetch(`${service.url}/healthz`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        return {
          name: service.name,
          status: response.ok ? 'online' as const : 'offline' as const,
          url: service.url,
          lastChecked: new Date().toISOString()
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'offline' as const,
          url: service.url,
          lastChecked: new Date().toISOString()
        };
      }
    })
  );

  return healthChecks.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      name: services[index].name,
      status: 'unknown' as const,
      url: services[index].url,
      lastChecked: new Date().toISOString()
    };
  });
}

