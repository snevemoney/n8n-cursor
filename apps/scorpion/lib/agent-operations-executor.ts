/**
 * Agent Operations Executor
 * Manages execution of safe operations by agents
 * Persists execution history to disk
 */

import { 
  SafeOperation, 
  getAgentOperations, 
  canExecuteOperation,
  OperationResult 
} from './agent-operations';
import { getNotificationManager } from './notification-manager';
import { emitEvent } from './telemetry/emitter';
import fs from 'fs/promises';
import path from 'path';
import { writeFileWithFallback, validateAndRefreshStorage, isStorageError } from './storage/storage-error-handler';

interface OperationExecution {
  operationId: string;
  agentId: string;
  startedAt: number;
  completedAt?: number;
  result?: OperationResult;
  status: 'running' | 'completed' | 'failed';
  executionLogs?: string[]; // Store execution logs
  actualDuration?: number; // Actual execution time (not including min duration)
  executionKey?: string; // Unique key for this execution instance
}

interface PersistedData {
  executions: Array<{ key: string; execution: OperationExecution }>;
  lastExecuted: Array<[string, number]>;
}

class AgentOperationsExecutor {
  private executions: Map<string, OperationExecution> = new Map();
  private lastExecuted: Map<string, number> = new Map();
  private activeExecutions: Set<string> = new Set();
  private recentCompletions: Map<string, number> = new Map();
  private dataDir: string;
  private operationsFile: string;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  constructor() {
    // Will be initialized with SSD-aware directory
    this.dataDir = path.join(process.cwd(), 'data', 'scorpion');
    this.operationsFile = path.join(this.dataDir, 'operations-executions.json');
  }

  /**
   * Initialize and load persisted data from disk
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Use SSD-aware data directory
      const { getDataDir } = await import('./storage/storage-config');
      this.dataDir = await getDataDir();
      this.operationsFile = path.join(this.dataDir, 'operations-executions.json');
      
      // Ensure data directory exists with fallback support
      const { ensureDirWithFallback } = await import('./storage/storage-error-handler');
      const dirResult = await ensureDirWithFallback(this.dataDir);
      if (!dirResult.success) {
        throw new Error(`Failed to create data directory: ${this.dataDir}`);
      }
      if (dirResult.usedFallback) {
        this.dataDir = dirResult.path;
        this.operationsFile = path.join(this.dataDir, 'operations-executions.json');
        console.warn(`⚠️ Using fallback data directory: ${this.dataDir}`);
      }
      
      // Load persisted executions
      try {
        const content = await fs.readFile(this.operationsFile, 'utf-8');
        const data: PersistedData = JSON.parse(content);
        
        // Restore executions (only completed/failed, not running)
        if (data.executions) {
          for (const { key, execution } of data.executions) {
            // Only restore completed/failed executions (running ones are lost on restart)
            if (execution.status === 'completed' || execution.status === 'failed') {
              this.executions.set(key, execution);
            }
          }
          console.log(`✅ Loaded ${this.executions.size} persisted operations from disk`);
        }
        
        // Restore last executed times
        if (data.lastExecuted) {
          this.lastExecuted = new Map(data.lastExecuted);
        }
      } catch (error: any) {
        // File doesn't exist yet, that's okay
        if (error.code !== 'ENOENT') {
          console.warn('Failed to load persisted operations:', error.message);
        }
      }
      
      // Auto-save every 30 seconds (like RAGStore)
      this.autoSaveInterval = setInterval(() => {
        this.save().catch(err => {
          console.error('Failed to auto-save operations:', err);
        });
      }, 30 * 1000);
      
      this.initialized = true;
    } catch (error: any) {
      console.error('Failed to initialize operations executor:', error);
      throw error;
    }
  }

  /**
   * Save executions to disk with robust error handling
   */
  private async save(): Promise<void> {
    try {
      // Validate storage before saving
      const validation = await validateAndRefreshStorage();
      if (!validation.isValid) {
        console.warn('⚠️ Storage validation failed, operations may not be persisted');
      }
      
      // Update paths if storage was refreshed
      if (validation.wasRefreshed) {
        const { getDataDir } = await import('./storage/storage-config');
        this.dataDir = await getDataDir();
        this.operationsFile = path.join(this.dataDir, 'operations-executions.json');
        console.log(`🔄 Storage refreshed, using new path: ${this.dataDir}`);
      }
      
      // Only save completed/failed executions (not running ones)
      const executionsToSave = Array.from(this.executions.entries())
        .filter(([_, exec]) => exec.status === 'completed' || exec.status === 'failed')
        .map(([key, exec]) => ({ key, execution: exec }));
      
      // Keep only last 1000 executions to prevent file from growing too large
      const sortedExecutions = executionsToSave
        .sort((a, b) => (b.execution.startedAt || 0) - (a.execution.startedAt || 0))
        .slice(0, 1000);
      
      const data: PersistedData = {
        executions: sortedExecutions,
        lastExecuted: Array.from(this.lastExecuted.entries())
      };
      
      // Use robust write with fallback
      const result = await writeFileWithFallback(
        this.operationsFile,
        JSON.stringify(data, null, 2),
        { ensureDir: true, maxRetries: 3 }
      );
      
      if (!result.success) {
        console.error(`❌ Failed to save operations after retries: ${result.error}`);
        if (result.usedFallback) {
          console.log(`   Fallback path used: ${result.path}`);
        }
      } else if (result.usedFallback) {
        console.warn(`⚠️ Operations saved to fallback location: ${result.path}`);
      }
    } catch (error: any) {
      console.error('Failed to save operations:', error);
      if (isStorageError(error)) {
        console.warn('   This appears to be a storage disconnection issue');
      }
    }
  }
  
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
    
    // Create unique execution key (operationId + agentId + timestamp)
    const executionKey = `${operationId}-${agentId}-${Date.now()}`;
    
    const execution: OperationExecution = {
      operationId,
      agentId,
      startedAt: Date.now(),
      status: 'running',
      executionLogs: [],
      executionKey
    };
    this.executions.set(executionKey, execution);
    
    // Log execution start
    const startLog = `[${new Date().toISOString()}] 🦂 Agent ${agentId} starting operation: ${operation.name} (${operationId})`;
    console.log(startLog);
    execution.executionLogs?.push(startLog);
    
    // Emit telemetry event - use system.log since agent.operation.started doesn't exist in schema
    emitEvent({
      type: 'system.log',
      source: 'agent-operations-executor',
      level: 'info',
      message: `Agent ${agentId} starting operation: ${operation.name}`,
      severity: 'info',
      context: {
        agentId,
        operationId,
        operationName: operation.name
      }
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
      
      // Save to disk after completion
      await this.save();
      
      // Emit telemetry event for completion
      if (result.success) {
        emitEvent({
          type: 'agent.operation.completed',
          source: 'agent-operations-executor',
          agentId,
          operationId,
          operationName: operation.name,
          duration: actualDuration,
          severity: 'info',
        });
      } else {
        emitEvent({
          type: 'agent.operation.failed',
          source: 'agent-operations-executor',
          agentId,
          operationId,
          operationName: operation.name,
          duration: actualDuration,
          error: result.message,
          severity: 'error',
        });
      }
      
      // Emit log event for the operation
      if (!result.success) {
        emitEvent({
          type: 'system.log',
          source: `agent-${agentId}`,
          level: 'error',
          message: `Operation ${operation.name} failed: ${result.message}`,
          severity: 'error',
        });
      }
      
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
      
      // Emit log event for the error
      emitEvent({
        type: 'system.log',
        source: `agent-${agentId}`,
        level: 'error',
        message: `Operation ${operation.name} threw error: ${error.message || 'Unknown error'}`,
        severity: 'error',
      });
      
      // Save to disk after failure
      await this.save();
      
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
   * Get current execution status (by operationId - returns most recent)
   */
  getExecutionStatus(operationId: string): OperationExecution | undefined {
    const matchingExecutions = Array.from(this.executions.values())
      .filter(exec => exec.operationId === operationId)
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    return matchingExecutions[0];
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
   * Get execution details including logs (by executionKey or operationId)
   */
  getExecutionDetails(operationIdOrKey: string): OperationExecution | undefined {
    // First try as execution key
    const byKey = this.executions.get(operationIdOrKey);
    if (byKey) return byKey;
    
    // Then try as operationId (return most recent)
    const matchingExecutions = Array.from(this.executions.values())
      .filter(exec => exec.operationId === operationIdOrKey)
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
    return matchingExecutions[0];
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
    // Initialize asynchronously (don't block)
    executor.initialize().catch(err => {
      console.error('Failed to initialize operations executor:', err);
    });
  }
  return executor;
}
