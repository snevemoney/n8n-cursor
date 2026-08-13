import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';
import { responseCache } from '@/lib/cache';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 30000; // 30 seconds

async function getOrchestratorInstance() {
  return await getOrchestrator();
}

/**
 * GET /api/project/status - Get comprehensive project status
 * Now with 30-second caching for improved performance
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Check cache first
  const cached = responseCache.get('project-status');
  if (cached) {
    return createSuccessResponse(cached);
  }

    const orchestrator = await getOrchestratorInstance();
    const summary = await orchestrator.getSummary();

    // Check service health (faster version)
    const serviceHealth = await checkServiceHealthFast();

    // ✅ REMOVED: Duplicate workflow fetching - use summary.workflows directly

    const result = {
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
        synced: summary.workflows // Use summary data (avoid duplicate fetch)
      },
      knowledge: {
        total: summary.totalKnowledge
      },
      lastIngestion: summary.status.lastIngestion
    };

    // Cache for 30 seconds
    responseCache.set('project-status', result, CACHE_TTL);
    
    return createSuccessResponse(result);
});

/**
 * Health check endpoint (lightweight)
 * For quick health checks, use /api/health for comprehensive status
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

/**
 * Check service health (faster version with 2s timeout and parallel checks)
 */
async function checkServiceHealthFast(): Promise<Array<{
  name: string;
  status: 'online' | 'offline' | 'unknown';
  url?: string;
  lastChecked: string;
}>> {
  const services = [
    {
      name: 'n8n',
      // Standardize on N8N_API_URL, with fallback to N8N_BASE_URL for backward compatibility
      url: process.env['N8N_API_URL'] || process.env['N8N_BASE_URL']?.replace('/webhook', '') || 'http://localhost:5678'
    },
    {
      name: 'Ollama',
      url: process.env['OLLAMA_URL'] || 'http://localhost:11434'
    }
  ];

  const healthChecks = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout (increased from 2s)
        
        const response = await fetch(`${service.url}/healthz`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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

