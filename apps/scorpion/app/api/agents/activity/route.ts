import { NextRequest, NextResponse } from 'next/server';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations } from '@/lib/agent-operations';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * GET /api/agents/activity - Get agent activity logs from operations executor
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const executor = getAgentOperationsExecutor();
  
  // Get execution history (all agents or specific agent)
  const executions = executor.getExecutionHistory(agentId || undefined, limit * 2); // Get more to filter
  
  // Get all operations to map operation IDs to names
  const allOperations = new Map<string, { name: string; agentId: string }>();
  if (agentId) {
    const ops = getAgentOperations(agentId);
    ops.forEach(op => allOperations.set(op.id, { name: op.name, agentId }));
  } else {
    // Get operations for all agents (we'll need to get agent IDs from executions)
    const agentIds = new Set(executions.map(e => e.agentId));
    agentIds.forEach(id => {
      const ops = getAgentOperations(id);
      ops.forEach(op => allOperations.set(op.id, { name: op.name, agentId: id }));
    });
  }
  
  // Convert executions to activity logs
  const activityLogs = executions
    .slice(0, limit)
    .map(exec => {
      const operation = allOperations.get(exec.operationId);
      const operationName = operation?.name || exec.operationId;
      const agentName = operation?.agentId || exec.agentId;
      
      // Format time
      const time = new Date(exec.startedAt).toLocaleTimeString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // Determine log level based on status
      let level: 'info' | 'warn' | 'error' = 'info';
      let text = '';
      
      if (exec.status === 'running') {
        level = 'info';
        text = `[${agentName}] Starting operation: ${operationName}`;
      } else if (exec.status === 'completed') {
        level = exec.result?.success ? 'info' : 'warn';
        const resultMsg = exec.result?.message || 'completed';
        text = `[${agentName}] Operation ${operationName} ${exec.result?.success ? 'completed' : 'failed'}: ${resultMsg}`;
        if (exec.actualDuration) {
          text += ` (${exec.actualDuration}ms)`;
        }
      } else if (exec.status === 'failed') {
        level = 'error';
        const errorMsg = exec.result?.message || 'failed';
        text = `[${agentName}] Operation ${operationName} failed: ${errorMsg}`;
      }
      
      return {
        time,
        text,
        level,
        agentId: exec.agentId,
        operationId: exec.operationId,
        timestamp: exec.startedAt
      };
    });
  
  return createSuccessResponse({
    logs: activityLogs,
    total: activityLogs.length
  });
});

