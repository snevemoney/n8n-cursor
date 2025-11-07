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
    
    // Safely extract workflow data
    const workflows = Array.isArray(summary.workflows) ? summary.workflows : [];
    const databases = Array.isArray(summary.databases) ? summary.databases : [];
    
    // Format for frontend with safe navigation
    const projectData = {
      name: 'Scorpion',
      description: 'Central Orchestration & Intelligence Platform',
      status: 'active',
      created: '2025-01-01',
      lastUpdated: summary.lastUpdated || new Date().toISOString(),
      
      // Workspace stats
      workspace: {
        totalFiles: summary.workspace?.totalFiles || 0,
        totalDirectories: summary.workspace?.totalDirectories || 0,
        languages: summary.workspace?.languages || [],
        frameworks: summary.workspace?.frameworks || []
      },
      
      // Database stats
      databases: databases.map((db: any) => ({
        name: db.name || 'Unknown',
        tables: db.tables?.length || 0,
        schema: db.schema || 'public'
      })),
      
      // Workflow stats
      workflows: {
        total: workflows.length,
        active: workflows.filter((w: any) => w.active === true || w.active === 'true').length,
        categories: workflows.reduce((acc: any, w: any) => {
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
      
      // Infrastructure
      infrastructure: {
        services: Array.isArray(summary.infrastructure?.services) 
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
      
      // Health (based on summary data)
      health: {
        status: summary.projectHealth?.overallStatus || 'healthy',
        message: summary.projectHealth?.message || 'System operational',
        issues: summary.projectHealth?.issues || [],
        lastCheck: new Date().toISOString()
      }
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

