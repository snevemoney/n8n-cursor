/**
 * Agent Operations Scheduler
 * Automatically executes safe operations for agents when idle
 */

import { getAgentOperationsExecutor } from './agent-operations-executor';
import { getAgentOperations } from './agent-operations';

const AGENT_IDS = ['E-001', 'A-002', 'P-003', 'S-004', 'N-005', 'S-006', 'C-007', 'O-008'];

class AgentOperationsScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  
  /**
   * Start scheduling operations for all agents
   */
  start() {
    if (this.isRunning) {
      console.log('🦂 Agent operations scheduler already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🦂 Starting agent operations scheduler...');
    
    // Schedule operations for each agent
    AGENT_IDS.forEach(agentId => {
      this.scheduleAgentOperations(agentId);
    });
  }
  
  /**
   * Stop scheduling operations
   */
  stop() {
    this.isRunning = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    console.log('🦂 Agent operations scheduler stopped');
  }
  
  /**
   * Schedule operations for a specific agent
   */
  private scheduleAgentOperations(agentId: string) {
    const executor = getAgentOperationsExecutor();
    
    // Check for operations every 30 seconds
    const interval = setInterval(async () => {
      try {
        const nextOperation = executor.getNextOperation(agentId);
        
        if (nextOperation) {
          console.log(`🦂 Agent ${agentId} executing: ${nextOperation.name}`);
          await executor.executeOperation(nextOperation.id, agentId);
        }
      } catch (error) {
        console.error(`❌ Error scheduling operation for ${agentId}:`, error);
      }
    }, 30000); // Check every 30 seconds
    
    this.intervals.set(agentId, interval);
  }
}

// Singleton instance
let scheduler: AgentOperationsScheduler | null = null;

export function getAgentOperationsScheduler(): AgentOperationsScheduler {
  if (!scheduler) {
    scheduler = new AgentOperationsScheduler();
  }
  return scheduler;
}

// Auto-start when module loads (in production)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  const scheduler = getAgentOperationsScheduler();
  scheduler.start();
}
