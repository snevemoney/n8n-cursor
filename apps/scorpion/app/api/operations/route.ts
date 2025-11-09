import { NextResponse } from 'next/server';
import { getSystemAutomation } from '@/lib/system-automation';
import { getMCPn8nClient } from '@/lib/mcp-n8n-client';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations } from '@/lib/agent-operations';

/**
 * GET /api/operations - Get active and recent operations
 */
export async function GET() {
  try {
    const systemAutomation = getSystemAutomation();
    const n8nClient = getMCPn8nClient();
    const executor = getAgentOperationsExecutor();
    
    // Get recent errors and system status
    const errors = systemAutomation.getErrors();
    const recentErrors = errors.slice(-20);
    
    // Get n8n workflow executions (recent operations)
    let recentExecutions: any[] = [];
    try {
      const executions = await n8nClient.listExecutions({ limit: 50 });
      recentExecutions = executions.map((exec: any) => ({
        id: exec.id,
        workflowId: exec.workflowId,
        workflowName: exec.workflowName || `Workflow ${exec.workflowId}`,
        status: exec.finished ? (exec.stoppedAt ? 'completed' : 'running') : 'failed',
        startedAt: exec.startedAt,
        stoppedAt: exec.stoppedAt,
        mode: exec.mode,
        location: 'n8n Cloud',
        type: 'workflow',
        error: exec.error?.message || exec.data?.resultData?.error?.message || null
      }));
    } catch (e) {
      console.warn('Could not fetch n8n executions:', e);
    }
    
    // Get agent operations from executor
    const agentExecutions = executor.getExecutionHistory(undefined, 50);
    const agentOperations = agentExecutions.map((exec) => {
      // Get operation details
      const operations = getAgentOperations(exec.agentId);
      const operation = operations.find(op => op.id === exec.operationId);
      
      // Get execution details including logs
      const details = executor.getExecutionDetails(exec.operationId);
      
      return {
        id: `agent-${exec.operationId}-${exec.startedAt}`,
        workflowId: exec.operationId,
        workflowName: operation?.name || `Agent Operation ${exec.operationId}`,
        status: exec.status,
        startedAt: new Date(exec.startedAt).toISOString(),
        stoppedAt: exec.completedAt ? new Date(exec.completedAt).toISOString() : null,
        mode: 'automatic',
        location: `Agent ${exec.agentId}`,
        type: 'agent',
        agentId: exec.agentId,
        error: exec.result && !exec.result.success ? exec.result.message : null,
        // Add execution verification details
        executionDetails: {
          actualDuration: details?.actualDuration,
          logs: details?.executionLogs || [],
          hasLogs: (details?.executionLogs?.length || 0) > 0
        }
      };
    });
    
    // Combine all operations
    const operations = [
      ...recentExecutions,
      ...agentOperations,
      ...recentErrors.map(e => ({
        id: `error-${Date.parse(e.timestamp)}`,
        workflowName: e.source,
        status: 'failed',
        startedAt: e.timestamp,
        stoppedAt: e.timestamp,
        mode: 'automatic',
        location: 'System',
        type: 'system',
        error: e.message
      }))
    ].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    // Calculate stats
    const stats = {
      total: operations.length,
      running: operations.filter(o => o.status === 'running').length,
      completed: operations.filter(o => o.status === 'completed').length,
      failed: operations.filter(o => o.status === 'failed').length,
      byType: {
        workflow: operations.filter(o => o.type === 'workflow').length,
        agent: operations.filter(o => o.type === 'agent').length,
        system: operations.filter(o => o.type === 'system').length
      },
      byLocation: operations.reduce((acc: any, op) => {
        acc[op.location] = (acc[op.location] || 0) + 1;
        return acc;
      }, {})
    };
    
    // Top 50 recent operations
    const recentOperations = operations.slice(0, 50);
    
    return NextResponse.json({
      stats,
      operations: recentOperations,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error getting operations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get operations' },
      { status: 500 }
    );
  }
}

