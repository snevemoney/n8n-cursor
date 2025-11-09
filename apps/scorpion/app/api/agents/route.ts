import { NextResponse } from 'next/server';
import { councilMembers } from '@scorpion/core';
import { getAgentOperationsExecutor } from '@/lib/agent-operations-executor';

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
 * TODO: Connect to actual log aggregation system
 */
async function getAgentActivities(agentId: string, agentName: string, count: number = 10): Promise<AgentActivity[]> {
  const activities: AgentActivity[] = [];
  
  // For now, return empty array - activities will come from:
  // - System logs
  // - Council deliberation history
  // - Workflow execution participation
  // - RAG query processing
  
  // TODO: Implement when logging/telemetry system is set up
  // const logs = await getSystemLogs({ agent: agentName, limit: count });
  // const deliberations = await getCouncilHistory({ member: agentName, limit: count });
  
  return activities;
}

/**
 * Generate agent ID from name
 */
function generateAgentId(name: string, index: number): string {
  // Convert name to ID format: "Architectus" -> "E-001"
  const prefixes = ['E', 'A', 'P', 'S', 'N', 'S', 'C', 'O'];
  const prefix = prefixes[index] || 'X';
  const num = (index + 1).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * Convert council members to agent dossiers with real activity data
 */
async function councilMembersToAgentDossiers(): Promise<AgentDossier[]> {
  const dossiers: AgentDossier[] = [];
  
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

    dossiers.push({
      id: agentId,
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
      recentActivities: activities.slice(0, 10), // Top 10 most recent
      lastActivity: activities.length > 0 ? activities[0].timestamp : createdAt
    });
  }
  
  return dossiers;
}

/**
 * GET /api/agents - List all agents
 */
export async function GET() {
  try {
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
    
    return NextResponse.json({
      agents,
      summary: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        standby: agents.filter(a => a.status === 'standby').length,
        offline: agents.filter(a => a.status === 'offline').length,
      }
    });
  } catch (error: any) {
    console.error('Error getting agents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get agents' },
      { status: 500 }
    );
  }
}
