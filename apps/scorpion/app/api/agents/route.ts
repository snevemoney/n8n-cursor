import { NextRequest, NextResponse } from 'next/server';
import { councilMembers } from '@scorpion/core';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations, generateDefaultOperations, addAgentOperations } from '@/lib/agent-operations';
import { getSystemAutomation } from '@/lib/system-automation';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { getStoredAgents, addAgent, getAgentById, updateAgentStatus } from '@/lib/agent-storage';
import { z } from 'zod';

// In-memory status cache for council members (static agents)
// In production, this could be persisted to a database
const councilMemberStatusCache = new Map<string, 'active' | 'standby' | 'offline'>();

/**
 * Get status for a council member (with caching)
 */
function getCouncilMemberStatus(agentId: string): 'active' | 'standby' | 'offline' {
  return councilMemberStatusCache.get(agentId) || 'active';
}

/**
 * Set status for a council member
 */
function setCouncilMemberStatus(agentId: string, status: 'active' | 'standby' | 'offline'): void {
  councilMemberStatusCache.set(agentId, status);
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  type: 'task' | 'analysis' | 'decision' | 'collaboration';
  description: string;
  risk: 'low' | 'medium' | 'high';
  status: 'success' | 'failed' | 'pending';
}

export interface AgentDossier {
  id: string;
  codename: string;
  role: string;
  weight: number;
  expertise: string;
  age: string | null; // For display purposes
  createdAt: string;
  status: 'active' | 'standby' | 'offline';
  stats: {
    totalActivities: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  };
  riskProfile: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivities: AgentActivity[];
  lastActivity?: string; // Timestamp of last activity
  currentOperation?: {
    id: string;
    startedAt: string;
    status: 'running' | 'completed' | 'failed';
  };
  nextOperation?: {
    id: string;
    name: string;
    type: 'analyze' | 'review' | 'monitor' | 'optimize' | 'cleanup' | 'update' | 'index' | 'test' | 'scan' | 'suggest';
  };
}

/**
 * Get real activities for an agent from system logs and operations
 * Now connected to real execution data from AgentOperationsExecutor
 */
async function getAgentActivities(agentId: string, agentName: string, count: number = 10): Promise<AgentActivity[]> {
  const activities: AgentActivity[] = [];
  const executor = getAgentOperationsExecutor();
  const systemAutomation = getSystemAutomation();
  
  // Get execution history for this agent
  const executions = executor.getExecutionHistory(agentId, count);
  
  // Get available operations to map operation IDs to names/types
  const operations = getAgentOperations(agentId);
  
  // Convert executions to activities
  executions.forEach(exec => {
    const operation = operations.find(op => op.id === exec.operationId);
    const operationName = operation?.name || exec.operationId;
    
    // Determine activity type based on operation type
    let activityType: 'task' | 'analysis' | 'decision' | 'collaboration' = 'task';
    if (operation?.type) {
      if (['analyze', 'review', 'monitor'].includes(operation.type)) {
        activityType = 'analysis';
      } else if (['suggest', 'optimize'].includes(operation.type)) {
        activityType = 'decision';
      } else if (['test', 'scan'].includes(operation.type)) {
        activityType = 'collaboration';
      }
    }
    
    // Determine risk level based on operation result
    let risk: 'low' | 'medium' | 'high' = 'low';
    if (exec.result && !exec.result.success) {
      risk = 'high';
    } else if (operation?.type === 'cleanup' || operation?.type === 'update') {
      risk = 'medium';
    }
    
    activities.push({
      id: exec.operationId,
      timestamp: new Date(exec.startedAt).toISOString(),
      type: activityType,
      description: `${operationName}${exec.completedAt ? ' completed' : exec.status === 'running' ? ' in progress' : ' started'}`,
      risk,
      status: exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'failed' : 'pending'
    });
  });
  
  // Get system errors related to this agent
  const errors = systemAutomation.getErrors();
  const agentErrors = errors
    .filter(e => e.source.toLowerCase().includes(agentName.toLowerCase()) || e.source.includes(agentId))
    .slice(0, Math.floor(count / 2)); // Mix errors with executions
  
  agentErrors.forEach(error => {
    activities.push({
      id: `error-${error.id}`,
      timestamp: error.detectedAt,
      type: 'task',
      description: `Error detected: ${error.message}`,
      risk: error.severity === 'critical' || error.severity === 'high' ? 'high' : 'medium',
      status: error.resolvedAt ? 'success' : 'failed'
    });
  });
  
  // Sort by timestamp (most recent first) and limit
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, count);
}

/**
 * Generate agent ID from name and index
 */
function generateAgentId(name: string, index: number): string {
  // Convert name to ID format: "Architectus" -> "E-001"
  const prefixes = ['E', 'A', 'P', 'S', 'N', 'S', 'C', 'O', 'M'];
  const prefix = prefixes[index] || 'X';
  const num = (index + 1).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * Generate agent ID for new agents (not in static council)
 */
function generateNewAgentId(name: string, existingIds: string[]): string {
  // Use first letter of name as prefix
  const prefix = name.substring(0, 1).toUpperCase();
  
  // Find next available number for this prefix
  let num = 1;
  let agentId = `${prefix}-${num.toString().padStart(3, '0')}`;
  
  while (existingIds.includes(agentId)) {
    num++;
    agentId = `${prefix}-${num.toString().padStart(3, '0')}`;
  }
  
  return agentId;
}

/**
 * Convert council members and stored agents to agent dossiers with real activity data
 */
async function councilMembersToAgentDossiers(): Promise<AgentDossier[]> {
  const dossiers: AgentDossier[] = [];
  
  // Process static council members
  for (let index = 0; index < councilMembers.length; index++) {
    const member = councilMembers[index];
    const agentId = generateAgentId(member.name, index);
    const activities = await getAgentActivities(agentId, member.name, 15);
    
    const successCount = activities.filter(a => a.status === 'success').length;
    const failedCount = activities.filter(a => a.status === 'failed').length;
    const pendingCount = activities.filter(a => a.status === 'pending').length;
    
    const lowRisk = activities.filter(a => a.risk === 'low').length;
    const mediumRisk = activities.filter(a => a.risk === 'medium').length;
    const highRisk = activities.filter(a => a.risk === 'high').length;

    // Calculate creation date (stagger by 30 days each)
    const createdAt = new Date(Date.now() - (index * 30 * 24 * 60 * 60 * 1000)).toISOString();

    // Get status from cache (defaults to 'active')
    const status = getCouncilMemberStatus(agentId);

    dossiers.push({
      id: agentId,
      codename: member.name,
      role: member.role,
      weight: member.weight,
      expertise: member.specialty,
      age: null, // AI agents don't have biological age
      createdAt,
      status,
      stats: {
        totalActivities: activities.length,
        successCount,
        failedCount,
        pendingCount
      },
      riskProfile: {
        low: lowRisk,
        medium: mediumRisk,
        high: highRisk
      },
      recentActivities: activities.slice(0, 10), // Top 10 most recent
      lastActivity: activities.length > 0 ? activities[0].timestamp : createdAt
    });
  }
  
  // Process dynamically stored agents
  const storedAgents = await getStoredAgents();
  for (const storedAgent of storedAgents) {
    // Skip if already in static council
    const alreadyExists = councilMembers.some(m => m.name === storedAgent.name);
    if (alreadyExists) continue;
    
    const activities = await getAgentActivities(storedAgent.id, storedAgent.name, 15);
    
    const successCount = activities.filter(a => a.status === 'success').length;
    const failedCount = activities.filter(a => a.status === 'failed').length;
    const pendingCount = activities.filter(a => a.status === 'pending').length;
    
    const lowRisk = activities.filter(a => a.risk === 'low').length;
    const mediumRisk = activities.filter(a => a.risk === 'medium').length;
    const highRisk = activities.filter(a => a.risk === 'high').length;

    dossiers.push({
      id: storedAgent.id,
      codename: storedAgent.name,
      role: storedAgent.role,
      weight: storedAgent.weight,
      expertise: storedAgent.specialty,
      age: null,
      createdAt: storedAgent.createdAt,
      status: storedAgent.status,
      stats: {
        totalActivities: activities.length,
        successCount,
        failedCount,
        pendingCount
      },
      riskProfile: {
        low: lowRisk,
        medium: mediumRisk,
        high: highRisk
      },
      recentActivities: activities.slice(0, 10),
      lastActivity: activities.length > 0 ? activities[0].timestamp : storedAgent.createdAt
    });
  }
  
  return dossiers;
}

/**
 * GET /api/agents - List all agents
 */
export const GET = withErrorHandling(async () => {
    const agents = await councilMembersToAgentDossiers();
    
    const executor = getAgentOperationsExecutor();
    const activeExecutions = executor.getActiveExecutions();

    // Add current operation to each agent dossier
    agents.forEach(dossier => {
      const activeExecution = activeExecutions.find(
        exec => exec.agentId === dossier.id
      );
      
      if (activeExecution) {
        dossier.currentOperation = {
          id: activeExecution.operationId,
          startedAt: new Date(activeExecution.startedAt).toISOString(),
          status: activeExecution.status
        };
      }
      
      // Get next available operation
      const nextOp = executor.getNextOperation(dossier.id);
      if (nextOp) {
        dossier.nextOperation = {
          id: nextOp.id,
          name: nextOp.name,
          type: nextOp.type
        };
      }
    });
    
    return createSuccessResponse({
      agents,
      summary: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        standby: agents.filter(a => a.status === 'standby').length,
        offline: agents.filter(a => a.status === 'offline').length,
      }
    });
});

const createAgentSchema = z.object({
  codename: z.string().min(1),
  role: z.string().min(1),
  specialty: z.string().optional(),
  weight: z.number().min(0).max(2).default(1.0),
  goal: z.string().optional(),
  status: z.enum(['active', 'standby', 'offline']).default('active'),
  capabilities: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

/**
 * POST /api/agents - Create a new agent
 * Full integration: Adds to council, radar, and creates missions
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, createAgentSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { codename, role, specialty, weight, goal, status, capabilities, priority } = validation.data;
  
  try {
    // Get existing agents to generate unique ID
    const existingAgents = await councilMembersToAgentDossiers();
    const existingIds = existingAgents.map(a => a.id);
    
    // Generate agent ID
    const agentId = generateNewAgentId(codename, existingIds);
    
    // Create stored agent
    const storedAgent = {
      id: agentId,
      name: codename,
      role,
      specialty: specialty || role,
      weight,
      goal: goal || `Support ${role} operations.`,
      createdAt: new Date().toISOString(),
      status: status as 'active' | 'standby' | 'offline'
    };
    
    // Save agent to storage (adds to council/radar)
    await addAgent(storedAgent);
    
    // Generate and add default operations/missions for this agent
    const defaultOperations = generateDefaultOperations(
      agentId,
      codename,
      role,
      storedAgent.specialty
    );
    
    if (defaultOperations.length > 0) {
      addAgentOperations(defaultOperations);
    }
    
    // Return created agent with full integration confirmation
    return createSuccessResponse({
      id: agentId,
      codename,
      role,
      status: storedAgent.status,
      weight,
      specialty: storedAgent.specialty,
      goal: storedAgent.goal,
      createdAt: storedAgent.createdAt,
      operationsCreated: defaultOperations.length,
      message: `Agent "${codename}" created successfully and integrated into council, radar, and mission control with ${defaultOperations.length} operations.`
    });
  } catch (error: any) {
    console.error('[POST /api/agents] Error creating agent:', error);
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to create agent: ${error.message}`,
      { error: error.message },
      500
    );
  }
});
