import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';
import { getSystemAutomation } from '@/lib/system-automation';
import { councilMembers } from '@scorpion/core/council';
import { getExperimentTracker } from '@/lib/llm/experiment-tracker';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

// Disable Next.js caching for this route (prevents >2MB cache errors)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Timeout wrapper for promises
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
}

/**
 * GET /api/stats - System-wide statistics for home page
 * Returns partial data even if some dependencies fail
 * Responds quickly with graceful degradation
 */
export const GET = withErrorHandling(async () => {
    // Initialize defaults for all stats
    let summary: any = {
      workflows: [],
      totalKnowledge: 0,
      documentation: { totalFiles: 0 },
      workspace: { totalFiles: 0 },
      databases: []
    };
    let errors: any[] = [];
    let recentErrors: any[] = [];
    let llmStats = {
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
      pending: 0,
    };
    let configured = true;
    let activeWorkflowExecutions = 0;
    let completedWorkflowExecutions = 0;
    let runningOperations = 0;
    
    // Try to get orchestrator summary (non-critical) with short timeout
    try {
      const orchestrator = await getOrchestrator();
      summary = await withTimeout(orchestrator.getSummary(), 1000);
    } catch (error: any) {
      // Continue with defaults
    }
    
    // Try to get system automation stats (non-critical)
    try {
      const systemAutomation = getSystemAutomation();
      errors = systemAutomation.getErrors();
      recentErrors = errors.slice(-10);
    } catch (error) {
      // Continue with empty arrays
    }
    
    // Try to get running operations count (non-critical)
    try {
      const executor = getAgentOperationsExecutor();
      const activeOps = executor.getActiveExecutions();
      runningOperations = activeOps.length;
    } catch (error) {
      // Continue with default value
    }
    
    // Calculate stats (these should always work)
    const totalProjects = 1;
    const activeAgents = councilMembers.filter(m => m.weight > 0).length;
    const totalWorkflows = summary.workflows?.length || 0;
    const knowledgeItems = summary.totalKnowledge || 0;
    
    // Recent activity
    const recentActivities = [
      ...recentErrors.map(e => ({
        type: 'error' as const,
        message: e.message,
        timestamp: e.timestamp,
        source: e.source
      })),
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
        active: activeWorkflowExecutions,
        completed: completedWorkflowExecutions
      },
      knowledge: {
        total: knowledgeItems,
        documents: summary.documentation?.totalFiles || 0,
        codeFiles: summary.workspace?.totalFiles || 0,
        databases: summary.databases?.length || 0
      },
      operations: {
        total: recentActivities.length,
        running: runningOperations,
        completed: recentActivities.filter(a => a.type !== 'error').length,
        failed: recentErrors.length
      },
      llmExperiments: llmStats,
      system: {
        health: errors.length === 0 ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        lastCheck: new Date().toISOString()
      },
      recentActivity: recentActivities,
      configured
    };
    
    return createSuccessResponse(stats);
});

