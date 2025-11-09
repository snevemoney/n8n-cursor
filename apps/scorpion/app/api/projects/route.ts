import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';

/**
 * GET /api/projects - Get project details and statistics
 */
export async function GET() {
  try {
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
      lastUpdated: summary.lastUpdated || new Date().toISOString(),
      
      // Workspace stats - count apps and packages
      workspace: {
        totalFiles: packagesCount, // Packages count
        totalDirectories: appsCount, // Apps count (frontend maps totalDirectories -> apps)
        languages: summary.workspace?.languages || [],
        frameworks: summary.workspace?.frameworks || []
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
      
      // Documentation stats
      documentation: {
        totalFiles: summary.documentation?.totalFiles || 0,
        totalSize: summary.documentation?.totalSize || 0,
        categories: summary.documentation?.categories || []
      },
      
      // Infrastructure - services come from summary.status or summary.services
      infrastructure: {
        services: Array.isArray(summary.status?.services) 
          ? summary.status.services 
          : Array.isArray(summary.services)
          ? summary.services
          : Array.isArray(summary.infrastructure?.services) 
          ? summary.infrastructure.services 
          : [],
        containers: Array.isArray(summary.infrastructure?.containers)
          ? summary.infrastructure.containers
          : [],
        networks: Array.isArray(summary.infrastructure?.networks)
          ? summary.infrastructure.networks
          : []
      },
      
      // Knowledge stats
      knowledge: {
        totalItems: summary.knowledge?.totalItems || summary.totalKnowledge || 0,
        entities: summary.entities?.length || 0,
        relationships: summary.relationships?.length || 0
      },
      
      // Conversation stats
      conversations: summary.conversations || {
        total: 0,
        totalMessages: 0,
        recentConversations: 0
      },
      
      // Health (based on summary data)
      health: {
        status: summary.status?.overallHealth || summary.projectHealth?.overallStatus || 'healthy',
        message: summary.projectHealth?.message || 'System operational',
        issues: summary.projectHealth?.issues || [],
        lastCheck: new Date().toISOString()
      },
      
      // Tech Debt and Missing Features from status
      techDebt: summary.status?.techDebt || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      missingFeatures: summary.status?.missingFeatures || {
        p0: 0,
        p1: 0,
        p2: 0
      },
      
      // Use lastIngestion from status if available
      lastIngestion: summary.status?.lastIngestion || new Date().toISOString()
    };
    
    return NextResponse.json(projectData);
    
  } catch (error: any) {
    console.error('Error getting project data:', error);
    console.error('Error stack:', error.stack);
    
    // Return a minimal response on error
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get project data',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

