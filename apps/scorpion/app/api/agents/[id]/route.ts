import { NextRequest, NextResponse } from 'next/server';
import { councilMembers } from '@scorpion/core';

// Import types and helper from parent route
import type { AgentDossier, AgentActivity } from '../route';

/**
 * Get real activities for an agent from system logs and operations
 * TODO: Connect to actual log aggregation system
 */
async function getAgentActivities(agentId: string, agentName: string, count: number = 20): Promise<AgentActivity[]> {
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
  const prefixes = ['E', 'A', 'P', 'S', 'N', 'S', 'C', 'O'];
  const prefix = prefixes[index] || 'X';
  const num = (index + 1).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * GET /api/agents/[id] - Get detailed agent dossier
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
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
    
    return NextResponse.json(dossier);
  } catch (error: any) {
    console.error('Error getting agent details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get agent details' },
      { status: 500 }
    );
  }
}

