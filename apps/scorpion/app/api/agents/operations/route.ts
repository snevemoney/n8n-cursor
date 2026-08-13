import { NextRequest, NextResponse } from 'next/server';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations, getAllSafeOperations } from '@/lib/agent-operations';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agents/operations - Get available operations and status
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    
    const executor = getAgentOperationsExecutor();
    
    if (agentId) {
      // Get operations for specific agent
      const operations = getAgentOperations(agentId);
      const nextOperation = executor.getNextOperation(agentId);
      const history = executor.getExecutionHistory(agentId, 10);
      const activeExecutions = executor.getActiveExecutions().filter(
        exec => exec.agentId === agentId
      );
      
      // Add last executed time and canExecute flag
      const operationsWithStatus = operations.map(op => {
        const lastExecuted = executor.getLastExecuted(op.id);
        const isActive = activeExecutions.some(exec => exec.operationId === op.id);
        return {
          ...op,
          lastExecuted,
          isActive,
          canExecute: !isActive && (lastExecuted === undefined || 
            (Date.now() - lastExecuted) >= (op.maxFrequency * 60 * 1000))
        };
      });
      
      return createSuccessResponse({
        agentId,
        operations: operationsWithStatus,
        nextOperation,
        recentHistory: history,
        activeExecutions: activeExecutions
      });
    } else {
      // Get all operations and active executions
      const allOperations = getAllSafeOperations();
      const activeExecutions = executor.getActiveExecutions();
      
      // Get recent completions
      const recentCompletions: string[] = [];
      // We'll need to expose this from executor or check execution history
      const allExecutions = executor.getExecutionHistory();
      const fiveSecondsAgo = Date.now() - 5000;
      allExecutions.forEach(exec => {
        if (exec.status === 'completed' && exec.completedAt && exec.completedAt > fiveSecondsAgo) {
          if (!recentCompletions.includes(exec.agentId)) {
            recentCompletions.push(exec.agentId);
          }
        }
      });

      return createSuccessResponse({
        totalOperations: allOperations.length,
        activeExecutions: activeExecutions.length,
        operations: allOperations,
        active: activeExecutions,
        recentCompletions: recentCompletions
      });
    }
});

const executeOperationSchema = z.object({
  operationId: z.string().min(1),
  agentId: z.string().min(1)
});

/**
 * POST /api/agents/operations - Execute an operation
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, executeOperationSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { operationId, agentId } = validation.data;
  
  const executor = getAgentOperationsExecutor();
  const result = await executor.executeOperation(operationId, agentId);
  
  return createSuccessResponse({
    success: result.success,
    result
  });
});
