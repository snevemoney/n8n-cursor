import { NextRequest, NextResponse } from 'next/server';
import { councilMembers } from '@scorpion/core';

// Import types and helper from parent route
import type { AgentDossier, AgentActivity } from '../route';

/**
 * Generate mock activities for an agent
 */
function generateAgentActivities(agentId: string, count: number = 20): AgentActivity[] {
  const activityTypes: Array<'task' | 'analysis' | 'decision' | 'collaboration'> = ['task', 'analysis', 'decision', 'collaboration'];
  const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'low', 'medium', 'high'];
  const statuses: Array<'success' | 'failed' | 'pending'> = ['success', 'success', 'success', 'failed', 'pending'];
  
  const descriptions: Record<string, string[]> = {
    task: ['Executed workflow analysis', 'Processed knowledge ingestion', 'Performed system health check', 'Updated ontology relations', 'Monitored n8n workflows', 'Validated data integrity'],
    analysis: ['Analyzed RAG query patterns', 'Evaluated system performance', 'Assessed security vulnerabilities', 'Reviewed code quality metrics', 'Studied user interaction patterns', 'Examined error logs'],
    decision: ['Approved workflow deployment', 'Rejected risky operation', 'Escalated critical issue', 'Authorized backup restoration', 'Validated system configuration', 'Approved agent collaboration'],
    collaboration: ['Participated in council meeting', 'Shared expertise with peer agents', 'Coordinated multi-agent task', 'Reviewed collaborative decision', 'Mentored junior agent', 'Facilitated knowledge transfer']
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
      timestamp: new Date(now - (i * 1800000)).toISOString(), // 30 minutes apart
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

    // Generate detailed activities
    const activities = generateAgentActivities(id, 30);
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
      recentActivities: activities
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

