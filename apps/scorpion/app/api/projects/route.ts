import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/projects - Get project details and statistics
 */
export const GET = withErrorHandling(async () => {
    const orchestrator = await getOrchestrator();
    
    // Get comprehensive project knowledge (uses 30s cache)
    const summary = await orchestrator.getSummary();
    
    // Extract data - getSummary() returns arrays for workflows and databases
    const workflowsArray = Array.isArray(summary.workflows) ? summary.workflows : [];
    const databasesArray = Array.isArray(summary.databases) ? summary.databases : [];

    // Calculate workspace counts (apps is object, packages is array in manifest)
    const appsCount = summary.workspace?.apps 
      ? (Array.isArray(summary.workspace.apps) 
          ? summary.workspace.apps.length 
          : Object.keys(summary.workspace.apps).length)
      : 0;
    const packagesCount = summary.workspace?.packages
      ? (Array.isArray(summary.workspace.packages)
          ? summary.workspace.packages.length
          : Object.keys(summary.workspace.packages).length)
      : 0;

    // Format for frontend with safe navigation
    const projectData = {
      name: 'Scorpion',
      description: 'Central Orchestration & Intelligence Platform',
      status: 'active',
      created: '2025-01-01',
      lastUpdated: summary.status?.lastIngestion || new Date().toISOString(),
      
      // Workspace stats - count apps and packages
      workspace: {
        totalFiles: packagesCount, // Packages count
        totalDirectories: appsCount, // Apps count (frontend maps totalDirectories -> apps)
        languages: [], // Not available in summary type
        frameworks: [] // Not available in summary type
      },
      
      // Database stats - map database array
      databases: databasesArray.map((db: any) => ({
        name: db.name || 'Unknown',
        tables: db.tables?.length || 0,
        schema: db.schema || 'public'
      })),
      
      // Workflow stats - count from workflow array
      workflows: {
        total: workflowsArray.length,
        active: workflowsArray.filter((w: any) => w.active === true || w.active === 'true').length,
        categories: workflowsArray.reduce((acc: any, w: any) => {
          const cat = w.category || 'uncategorized';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {})
      },
      
      // Documentation stats - not available in summary type, use defaults
      documentation: {
        totalFiles: 0,
        totalSize: 0,
        categories: []
      },
      
      // Infrastructure - services come from summary.services array
      infrastructure: {
        services: Array.isArray(summary.services) ? summary.services : [],
        containers: [],
        networks: []
      },
      
      // Knowledge stats - use totalKnowledge from summary
      knowledge: {
        totalItems: summary.totalKnowledge || 0,
        entities: 0, // Not available in summary type
        relationships: 0 // Not available in summary type
      },
      
      // Conversation stats
      conversations: summary.conversations || {
        total: 0,
        totalMessages: 0,
        recentConversations: 0
      },
      
      // Health (based on summary data)
      health: {
        status: summary.status?.overallHealth || 'healthy',
        message: 'System operational',
        issues: [],
        lastCheck: new Date().toISOString()
      },
      
      // Tech Debt and Missing Features from status
      techDebt: (() => {
        const td = summary.status?.techDebt;
        console.log(`[GET /api/projects] Tech debt from status:`, JSON.stringify(td));
        return td || {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };
      })(),
      missingFeatures: (() => {
        const mf = summary.status?.missingFeatures;
        console.log(`[GET /api/projects] Missing features from status:`, JSON.stringify(mf));
        return mf || {
          p0: 0,
          p1: 0,
          p2: 0
        };
      })(),
      
      // Use lastIngestion from status if available
      lastIngestion: summary.status?.lastIngestion || new Date().toISOString()
    };
    
    return createSuccessResponse(projectData);
});

