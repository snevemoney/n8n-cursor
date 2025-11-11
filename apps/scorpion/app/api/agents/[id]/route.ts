import { NextRequest, NextResponse } from 'next/server';
import { councilMembers } from '@scorpion/core';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';
import { getAgentOperations } from '@/lib/agent-operations';
import { getSystemAutomation } from '@/lib/system-automation';

// Import types and helper from parent route
import type { AgentDossier, AgentActivity } from '../route';

/**
 * Get real activities for an agent from system logs and operations
 * Now connected to real execution data from AgentOperationsExecutor
 */
async function getAgentActivities(agentId: string, agentName: string, count: number = 20): Promise<AgentActivity[]> {
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
 * Generate agent ID from name
 */
function generateAgentId(name: string, index: number): string {
  const prefixes = ['E', 'A', 'P', 'S', 'N', 'S', 'C', 'O'];
  const prefix = prefixes[index] || 'X';
  const num = (index + 1).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * GET /api/agents/[id] - Get detailed agent dossier
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  
  // Find the agent by matching generated ID
  let memberIndex = -1;
  const member = councilMembers.find((m, idx) => {
    const agentId = generateAgentId(m.name, idx);
    if (agentId === id) {
      memberIndex = idx;
      return true;
    }
    return false;
  });
  
  if (!member || memberIndex === -1) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Agent not found',
      { id },
      404
    );
  }

  // Get real activities for agent
  const activities = await getAgentActivities(id, member.name, 30);
  const successCount = activities.filter(a => a.status === 'success').length;
  const failedCount = activities.filter(a => a.status === 'failed').length;
  const pendingCount = activities.filter(a => a.status === 'pending').length;
  
  const lowRisk = activities.filter(a => a.risk === 'low').length;
  const mediumRisk = activities.filter(a => a.risk === 'medium').length;
  const highRisk = activities.filter(a => a.risk === 'high').length;

  // Calculate creation date (based on council member index)
  const createdAt = new Date(Date.now() - (memberIndex * 30 * 24 * 60 * 60 * 1000)).toISOString();

  const dossier: AgentDossier = {
    id: id,
    codename: member.name,
    role: member.role,
    weight: member.weight,
    expertise: member.specialty,
    age: null, // AI agents don't have biological age
    createdAt,
    status: 'active' as const,
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
    recentActivities: activities,
    lastActivity: activities.length > 0 ? activities[0].timestamp : createdAt
  };
  
  return createSuccessResponse(dossier);
});

