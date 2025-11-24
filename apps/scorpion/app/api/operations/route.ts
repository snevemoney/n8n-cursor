import { NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations } from '@/lib/agent-operations';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/operations - Get active and recent operations
 * Optimized with parallel processing using Promise.allSettled
 */
export const GET = withErrorHandling(async () => {
    const systemAutomation = getSystemAutomation();
    const n8nClient = getMCPn8nClient();
    const executor = getAgentOperationsExecutor();
    
    // Parallelize independent data fetching operations
    const [errorsResult, agentExecutionsResult] = await Promise.allSettled([
      // Get recent errors and system status (synchronous, wrapped in Promise)
      Promise.resolve(systemAutomation.getErrors()),
      // Get agent operations from executor (synchronous, wrapped in Promise)
      Promise.resolve(executor.getExecutionHistory(undefined, 50))
    ]);
    
    // Extract results safely
    const errors = errorsResult.status === 'fulfilled' ? errorsResult.value : [];
    const recentErrors = errors.slice(-20);
    
    // Get n8n executions if client is configured
    let recentExecutions: any[] = [];
    try {
      if (n8nClient.isConfigured()) {
        const executions = await n8nClient.listExecutions({ limit: 50, includeData: false });
        recentExecutions = executions.map((exec: any) => ({
          id: exec.id,
          workflowId: exec.workflowId,
          workflowName: exec.workflowData?.name || `Workflow ${exec.workflowId}`,
          status: exec.finished ? (exec.stoppedAt ? 'completed' : 'failed') : 'running',
          startedAt: exec.startedAt,
          startedAtTimestamp: Date.parse(exec.startedAt), // Pre-compute for sorting
          stoppedAt: exec.stoppedAt || null,
          mode: exec.mode || 'manual',
          location: 'n8n',
          type: 'workflow',
          error: exec.stoppedAt && !exec.finished ? 'Execution stopped' : null
        }));
      }
    } catch (error) {
      console.error('[Operations API] Failed to get n8n executions:', error);
      // Continue with empty array
    }
    
    const agentExecutions = agentExecutionsResult.status === 'fulfilled' ? agentExecutionsResult.value : [];
    const agentOperations = agentExecutions.map((exec) => {
      // Get operation details
      const operations = getAgentOperations(exec.agentId);
      const operation = operations.find(op => op.id === exec.operationId);
      const startedAtTimestamp = typeof exec.startedAt === 'string' 
        ? Date.parse(exec.startedAt) || 0 
        : (typeof exec.startedAt === 'number' ? exec.startedAt : 0); // Pre-compute for sorting
      
      // Get execution details including logs (use executionKey if available, otherwise operationId)
      const executionKey = exec.executionKey || exec.operationId;
      const details = executor.getExecutionDetails(executionKey);
      
      // Use executionKey for unique ID, fallback to generated ID
      const uniqueId = exec.executionKey || `agent-${exec.operationId}-${exec.startedAt}`;
      
      return {
        id: uniqueId,
        workflowId: exec.operationId,
        workflowName: operation?.name || `Agent Operation ${exec.operationId}`,
        status: exec.status,
        startedAt: new Date(exec.startedAt).toISOString(),
        startedAtTimestamp: startedAtTimestamp, // Pre-computed for sorting
        stoppedAt: exec.completedAt ? new Date(exec.completedAt).toISOString() : null,
        mode: 'automatic',
        location: `Agent ${exec.agentId}`,
        type: 'agent',
        agentId: exec.agentId,
        error: exec.result && !exec.result.success ? exec.result.message : null,
        // Add execution verification details
        executionDetails: {
          actualDuration: details?.actualDuration || exec.actualDuration,
          logs: details?.executionLogs || exec.executionLogs || [],
          hasLogs: (details?.executionLogs?.length || exec.executionLogs?.length || 0) > 0
        }
      };
    });
    
    // Combine all operations
    const operations = [
      ...recentExecutions,
      ...agentOperations,
      ...recentErrors.map(e => {
        const timestamp = Date.parse(e.detectedAt);
        return {
          id: `error-${timestamp}`,
          workflowName: e.source,
          status: 'failed',
          startedAt: e.detectedAt,
          startedAtTimestamp: timestamp, // Pre-compute timestamp for sorting
          stoppedAt: e.detectedAt,
          mode: 'automatic',
          location: 'System',
          type: 'system',
          error: e.message
        };
      })
    ].map(op => ({
      ...op,
      startedAtTimestamp: op.startedAtTimestamp || Date.parse(op.startedAt)
    })).sort((a, b) => 
      (b.startedAtTimestamp || 0) - (a.startedAtTimestamp || 0)
    );
    
    // Calculate stats - single pass with reduce for better performance
    const stats = operations.reduce((acc: any, op) => {
      acc.total++;
      // Count by status
      if (op.status === 'running') acc.running++;
      if (op.status === 'completed') acc.completed++;
      if (op.status === 'failed') acc.failed++;
      // Count by type
      if (op.type === 'workflow') acc.byType.workflow++;
      if (op.type === 'agent') acc.byType.agent++;
      if (op.type === 'system') acc.byType.system++;
      // Count by location
      acc.byLocation[op.location] = (acc.byLocation[op.location] || 0) + 1;
      return acc;
    }, {
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
      byType: {
        workflow: 0,
        agent: 0,
        system: 0
      },
      byLocation: {}
    });
    
    // Top 50 recent operations
    const recentOperations = operations.slice(0, 50);
    
    return createSuccessResponse({
      stats,
      operations: recentOperations,
      lastUpdated: new Date().toISOString()
    });
});

