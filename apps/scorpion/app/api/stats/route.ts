import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';
import { getSystemAutomation } from '@/lib/system-automation';
import { councilMembers } from '@scorpion/core/council';

/**
 * GET /api/stats - System-wide statistics for home page
 */
export async function GET() {
  try {
    const orchestrator = await getOrchestrator();
    const systemAutomation = getSystemAutomation();
    
    // Get summary from knowledge orchestrator
    const summary = await orchestrator.getSummary();
    
    // Get system automation stats
    const errors = systemAutomation.getErrors();
    const recentErrors = errors.slice(-10);
    
    // Calculate stats
    const totalProjects = 1; // Scorpion itself (can expand later)
    const activeAgents = councilMembers.filter(m => m.weight > 0).length;
    const totalWorkflows = summary.workflows?.length || 0;
    const knowledgeItems = summary.totalKnowledge || 0;
    
    // Recent activity (from various sources)
    const recentActivities = [
      ...recentErrors.map(e => ({
        type: 'error' as const,
        message: e.message,
        timestamp: e.timestamp,
        source: e.source
      })),
      // Add workflow executions if available
      // Add agent activities if available
    ].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
    
    const stats = {
      projects: {
        total: totalProjects,
        active: 1,
        inactive: 0
      },
      agents: {
        total: councilMembers.length,
        active: activeAgents,
        idle: councilMembers.length - activeAgents
      },
      workflows: {
        total: totalWorkflows,
        active: 0, // TODO: Get from n8n active executions
        completed: 0 // TODO: Get from n8n execution history
      },
      knowledge: {
        total: knowledgeItems,
        documents: summary.documentation?.totalFiles || 0,
        codeFiles: summary.workspace?.totalFiles || 0,
        databases: summary.databases?.length || 0
      },
      operations: {
        total: recentActivities.length,
        running: 0, // TODO: Count running operations
        completed: recentActivities.filter(a => a.type !== 'error').length,
        failed: recentErrors.length
      },
      system: {
        health: errors.length === 0 ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        lastCheck: new Date().toISOString()
      },
      recentActivity: recentActivities
    };
    
    return NextResponse.json(stats);
    
  } catch (error: any) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}

