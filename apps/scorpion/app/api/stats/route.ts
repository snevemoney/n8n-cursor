import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';
import { getSystemAutomation } from '@/lib/system-automation';
import { councilMembers } from '@scorpion/core/council';
import { getExperimentTracker } from '@/lib/llm/experiment-tracker';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

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
    let configured = true; // Track if services are configured
    
    // Try to get orchestrator summary (non-critical) with reduced timeout
    try {
      const orchestrator = await getOrchestrator();
      // Reduced timeout to 3 seconds for faster response
      summary = await withTimeout(orchestrator.getSummary(), 3000);
    } catch (error: any) {
      console.error('[Stats API] Failed to get orchestrator summary:', error?.message || error);
      // Continue with default values - this is non-critical
    }
    
    // Try to get system automation stats (non-critical)
    try {
      const systemAutomation = getSystemAutomation();
      errors = systemAutomation.getErrors();
      recentErrors = errors.slice(-10);
    } catch (error) {
      console.error('[Stats API] Failed to get system automation stats:', error);
      // Continue with empty arrays
    }
    
    // Try to get LLM experiments stats (non-critical) with timeout
    try {
      const experimentTracker = getExperimentTracker();
      // Reduced timeout to 2 seconds for faster response
      await withTimeout(experimentTracker.initialize(), 2000);
      const experiments = await withTimeout(experimentTracker.listExperiments(), 2000);
      llmStats = {
        total: experiments.length,
        running: experiments.filter(e => e.status === 'running').length,
        completed: experiments.filter(e => e.status === 'completed').length,
        failed: experiments.filter(e => e.status === 'failed').length,
        pending: experiments.filter(e => e.status === 'pending').length,
      };
    } catch (error: any) {
      console.error('[Stats API] Failed to get LLM experiments stats:', error?.message || error);
      // Continue with default values - experiments may not be configured
    }
    
    // Try to get n8n execution stats (non-critical) with timeout
    let activeWorkflowExecutions = 0;
    let completedWorkflowExecutions = 0;
    try {
      const n8nClient = getMCPn8nClient();
      if (n8nClient.isConfigured()) {
        // Reduced timeout to 3 seconds for faster response
        const [activeExecs, completedExecs] = await Promise.allSettled([
          withTimeout(n8nClient.getActiveExecutions(), 3000),
          withTimeout(n8nClient.getCompletedExecutions(100), 3000) // Get last 100 completed
        ]);
        
        if (activeExecs.status === 'fulfilled') {
          activeWorkflowExecutions = activeExecs.value.length;
        }
        if (completedExecs.status === 'fulfilled') {
          completedWorkflowExecutions = completedExecs.value.length;
        }
      } else {
        // n8n not configured - this is expected in some setups
        configured = false;
      }
    } catch (error: any) {
      console.error('[Stats API] Failed to get n8n execution stats:', error?.message || error);
      // Continue with default values - n8n may not be available
    }
    
    // Try to get running operations count (non-critical)
    let runningOperations = 0;
    try {
      const executor = getAgentOperationsExecutor();
      const activeOps = executor.getActiveExecutions();
      runningOperations = activeOps.length;
    } catch (error) {
      console.error('[Stats API] Failed to get running operations count:', error);
      // Continue with default value
    }
    
    // Calculate stats (these should always work)
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
      configured // Include configuration status
    };
    
    return createSuccessResponse(stats);
});

