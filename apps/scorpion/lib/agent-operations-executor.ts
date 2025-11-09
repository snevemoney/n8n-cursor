/**
 * Agent Operations Executor
 * Manages execution of safe operations by agents
 */

import { 
  SafeOperation, 
  getAgentOperations, 
  canExecuteOperation,
  OperationResult 
} from './agent-operations';
import { getNotificationManager } from './notification-manager';
import { emitEvent } from './telemetry/emitter';

interface OperationExecution {
  operationId: string;
  agentId: string;
  startedAt: number;
  completedAt?: number;
  result?: OperationResult;
  status: 'running' | 'completed' | 'failed';
  executionLogs?: string[]; // Store execution logs
  actualDuration?: number; // Actual execution time (not including min duration)
}

class AgentOperationsExecutor {
  private executions: Map<string, OperationExecution> = new Map();
  private lastExecuted: Map<string, number> = new Map();
  private activeExecutions: Set<string> = new Set();
  private recentCompletions: Map<string, number> = new Map();
  
  /**
   * Execute a safe operation
   */
  async executeOperation(operationId: string, agentId: string): Promise<OperationResult> {
    // Check if already running
    if (this.activeExecutions.has(operationId)) {
      return { 
        success: false, 
        message: 'Operation already in progress' 
      };
    }
    
    // Check frequency limits
    if (!canExecuteOperation(operationId, this.lastExecuted)) {
      const operation = getAgentOperations(agentId).find(op => op.id === operationId);
      const lastTime = this.lastExecuted.get(operationId) || 0;
      const waitTime = Math.ceil((operation!.maxFrequency * 60 * 1000 - (Date.now() - lastTime)) / 1000 / 60);
      return { 
        success: false, 
        message: `Operation can be executed again in ${waitTime} minutes` 
      };
    }
    
    const operation = getAgentOperations(agentId).find(op => op.id === operationId);
    if (!operation) {
      return { 
        success: false, 
        message: 'Operation not found or not allowed for this agent' 
      };
    }
    
    // Mark as running
    this.activeExecutions.add(operationId);
    const execution: OperationExecution = {
      operationId,
      agentId,
      startedAt: Date.now(),
      status: 'running',
      executionLogs: []
    };
    this.executions.set(operationId, execution);
    
    // Log execution start
    const startLog = `[${new Date().toISOString()}] 🦂 Agent ${agentId} starting operation: ${operation.name} (${operationId})`;
    console.log(startLog);
    execution.executionLogs?.push(startLog);
    
    // Emit telemetry event
    emitEvent({
      type: 'agent.operation.started',
      source: 'agent-operations-executor',
      agentId,
      operationId,
      operationName: operation.name,
      severity: 'info',
    });
    
    try {
      const startTime = Date.now();
      
      // Execute operation (capture actual execution time)
      const resultPromise = operation.execute();
      
      // Ensure minimum execution time for visual feedback (at least 3 seconds)
      const minDuration = 3000;
      const [result] = await Promise.all([
        resultPromise,
        new Promise(resolve => setTimeout(resolve, minDuration))
      ]);
      
      const actualDuration = Date.now() - startTime;
      execution.actualDuration = actualDuration;
      execution.completedAt = Date.now();
      execution.result = result;
      execution.status = result.success ? 'completed' : 'failed';
      
      // Log execution result
      const resultLog = `[${new Date().toISOString()}] ${result.success ? '✅' : '❌'} Operation ${operation.name} ${result.success ? 'completed' : 'failed'}: ${result.message} (Duration: ${actualDuration}ms)`;
      console.log(resultLog);
      execution.executionLogs?.push(resultLog);
      
      // Log execution details if available
      if (result.data) {
        const detailsLog = `[${new Date().toISOString()}] Execution details: ${JSON.stringify(result.data, null, 2)}`;
        console.log(detailsLog);
        execution.executionLogs?.push(detailsLog);
      }
      
      // Track completion time for "completed" display
      if (execution.status === 'completed') {
        this.recentCompletions.set(agentId, Date.now());
        setTimeout(() => {
          this.recentCompletions.delete(agentId);
        }, 5000);
      }
      
      // Update last executed time
      this.lastExecuted.set(operationId, Date.now());
      
      // Emit telemetry event for completion
      emitEvent({
        type: result.success ? 'agent.operation.completed' : 'agent.operation.failed',
        source: 'agent-operations-executor',
        agentId,
        operationId,
        operationName: operation.name,
        duration: actualDuration,
        error: result.success ? undefined : result.message,
        severity: result.success ? 'info' : 'error',
      });
      
      // Handle approval requirement
      if (result.requiresApproval && result.approvalId) {
        const notificationManager = getNotificationManager();
        notificationManager.notify(
          'info',
          'medium',
          'Operation Requires Approval',
          `${operation.name}: ${result.message}`,
          true
        );
      }
      
      return result;
    } catch (error: any) {
      const actualDuration = Date.now() - execution.startedAt;
      execution.actualDuration = actualDuration;
      execution.completedAt = Date.now();
      execution.status = 'failed';
      execution.result = {
        success: false,
        message: error.message || 'Operation failed'
      };
      
      // Log error
      const errorLog = `[${new Date().toISOString()}] ❌ Operation ${operation.name} threw error: ${error.message || 'Unknown error'}`;
      console.error(errorLog);
      execution.executionLogs?.push(errorLog);
      
      // Emit telemetry event for failure
      emitEvent({
        type: 'agent.operation.failed',
        source: 'agent-operations-executor',
        agentId,
        operationId,
        operationName: operation.name,
        duration: actualDuration,
        error: error.message || 'Unknown error',
        severity: 'error',
      });
      
      return execution.result;
    } finally {
      this.activeExecutions.delete(operationId);
    }
  }
  
  /**
   * Get next operation for an agent to execute
   */
  getNextOperation(agentId: string): SafeOperation | null {
    const operations = getAgentOperations(agentId);
    
    // Find operation that can be executed
    for (const operation of operations) {
      if (canExecuteOperation(operation.id, this.lastExecuted)) {
        return operation;
      }
    }
    
    return null;
  }
  
  /**
   * Get current execution status
   */
  getExecutionStatus(operationId: string): OperationExecution | undefined {
    return this.executions.get(operationId);
  }
  
  /**
   * Get all active executions
   */
  getActiveExecutions(): OperationExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.status === 'running');
  }
  
  /**
   * Get execution history
   */
  getExecutionHistory(agentId?: string, limit: number = 50): OperationExecution[] {
    let executions = Array.from(this.executions.values());
    
    if (agentId) {
      executions = executions.filter(exec => exec.agentId === agentId);
    }
    
    return executions
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
      .slice(0, limit);
  }
  
  /**
   * Get last executed time for an operation
   */
  getLastExecuted(operationId: string): number | undefined {
    return this.lastExecuted.get(operationId);
  }

  /**
   * Check if agent recently completed an operation
   */
  getRecentCompletion(agentId: string): boolean {
    const completionTime = this.recentCompletions.get(agentId);
    if (!completionTime) return false;
    // Show "completed" for 5 seconds after completion
    return (Date.now() - completionTime) < 5000;
  }

  /**
   * Get execution details including logs
   */
  getExecutionDetails(operationId: string): OperationExecution | undefined {
    return this.executions.get(operationId);
  }
  
  /**
   * Get all execution logs
   */
  getAllExecutionLogs(limit: number = 100): Array<{ execution: OperationExecution; logs: string[] }> {
    return Array.from(this.executions.values())
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
      .slice(0, limit)
      .map(exec => ({
        execution: exec,
        logs: exec.executionLogs || []
      }));
  }
}

// Singleton instance
let executor: AgentOperationsExecutor | null = null;

export function getAgentOperationsExecutor(): AgentOperationsExecutor {
  if (!executor) {
    executor = new AgentOperationsExecutor();
  }
  return executor;
}
