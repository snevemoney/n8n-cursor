import { NextResponse } from 'next/server';
import { councilMembers } from '@scorpion/core';

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
}

/**
 * Generate mock activities for an agent
 */
function generateAgentActivities(agentId: string, count: number = 10): AgentActivity[] {
  const activityTypes: Array<'task' | 'analysis' | 'decision' | 'collaboration'> = ['task', 'analysis', 'decision', 'collaboration'];
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'low', 'medium', 'high'];
  const statuses: Array<'success' | 'failed' | 'pending'> = ['success', 'success', 'success', 'failed', 'pending'];
  
  const descriptions: Record<string, string[]> = {
    task: ['Executed workflow analysis', 'Processed knowledge ingestion', 'Performed system health check', 'Updated ontology relations'],
    analysis: ['Analyzed RAG query patterns', 'Evaluated system performance', 'Assessed security vulnerabilities', 'Reviewed code quality metrics'],
    decision: ['Approved workflow deployment', 'Rejected risky operation', 'Escalated critical issue', 'Authorized backup restoration'],
    collaboration: ['Participated in council meeting', 'Shared expertise with peer agents', 'Coordinated multi-agent task', 'Reviewed collaborative decision']
  };

  const activities: AgentActivity[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const descList = descriptions[type];
    const description = descList[Math.floor(Math.random() * descList.length)];

    activities.push({
      id: `${agentId}-act-${i}`,
      timestamp: new Date(now - (i * 3600000)).toISOString(), // 1 hour apart
      type,
      description,
      risk,
      status
    });
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
 * Convert council members to agent dossiers
 */
function councilMembersToAgentDossiers(): AgentDossier[] {
  return councilMembers.map((member, index) => {
    const agentId = generateAgentId(member.name, index);
    const activities = generateAgentActivities(agentId, 15);
    const successCount = activities.filter(a => a.status === 'success').length;
    const failedCount = activities.filter(a => a.status === 'failed').length;
    const pendingCount = activities.filter(a => a.status === 'pending').length;
    
    const lowRisk = activities.filter(a => a.risk === 'low').length;
    const mediumRisk = activities.filter(a => a.risk === 'medium').length;
    const highRisk = activities.filter(a => a.risk === 'high').length;

    // Calculate creation date (stagger by 30 days each)
    const createdAt = new Date(Date.now() - (index * 30 * 24 * 60 * 60 * 1000)).toISOString();

    return {
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
      recentActivities: activities.slice(0, 10) // Top 10 most recent
    };
  });
}

/**
 * GET /api/agents - List all agents
 */
export async function GET() {
  try {
    const agents = councilMembersToAgentDossiers();
    
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
