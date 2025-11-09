import { NextRequest, NextResponse } from 'next/server';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations, getAllSafeOperations } from '@/lib/agent-operations';

/**
 * GET /api/agents/operations - Get available operations and status
 */
export async function GET(request: NextRequest) {
  try {
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
      
      return NextResponse.json({
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

      return NextResponse.json({
        totalOperations: allOperations.length,
        activeExecutions: activeExecutions.length,
        operations: allOperations,
        active: activeExecutions,
        recentCompletions: recentCompletions
      });
    }
  } catch (error: any) {
    console.error('Error getting agent operations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get operations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/operations - Execute an operation
 */
export async function POST(request: NextRequest) {
  try {
    const { operationId, agentId } = await request.json();
    
    if (!operationId || !agentId) {
      return NextResponse.json(
        { error: 'operationId and agentId are required' },
        { status: 400 }
      );
    }
    
    const executor = getAgentOperationsExecutor();
    const result = await executor.executeOperation(operationId, agentId);
    
    return NextResponse.json({
      success: result.success,
      result
    });
  } catch (error: any) {
    console.error('Error executing operation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute operation' },
      { status: 500 }
    );
  }
}
