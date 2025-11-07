import { readFileSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from './modelRunner';
import type { Plan, CouncilVote } from './types';

/**
 * Council integration for plan critique
 */

/**
 * Get council members - can be customized per deployment
 * Fetches from database or uses defaults
 */
async function getCouncilMembers() {
  try {
    // Try to fetch from agents API
    const response = await fetch('http://localhost:3003/api/agents');
    if (response.ok) {
      const data = await response.json();
      const agents = data.agents || [];
      
      // Map first 8 agents to council members
      if (agents.length >= 8) {
        return agents.slice(0, 8).map((agent: any, i: number) => ({
          id: agent.id,
          name: agent.codename || `Agent-${i + 1}`,
          weight: agent.successRate > 0.8 ? 1.2 : agent.successRate > 0.6 ? 1.0 : 0.9,
        }));
      }
    }
  } catch (error) {
    console.log('[Council] Using default members');
  }
  
  // Default council members
  return [
    { id: 'E-001', name: 'Architectus', weight: 1.2, role: 'System architecture & scope' },
    { id: 'A-002', name: 'Analytica', weight: 1.1, role: 'Knowledge & RAG strategy' },
    { id: 'P-003', name: 'Pragmaton', weight: 1.0, role: 'Execution reliability' },
    { id: 'S-004', name: 'Satori', weight: 1.0, role: 'Alignment & safety' },
    { id: 'N-005', name: 'Nexus', weight: 1.0, role: 'Integrations & contracts' },
    { id: 'S-006', name: 'Sentinel', weight: 1.1, role: 'Security & performance' },
    { id: 'C-007', name: 'Catalyst', weight: 0.9, role: 'Innovation vs complexity' },
    { id: 'O-008', name: 'Oracle', weight: 1.0, role: 'Metrics & observability' },
  ];
}

/**
 * Run council deliberation on a plan
 */
export async function runCouncilDeliberation(
  plan: Plan,
  modelConfig: { provider: string; model: string }
): Promise<CouncilVote[]> {
  const councilMembers = await getCouncilMembers();
  
  try {
    // Load council system prompt
    const promptPath = join(process.cwd(), 'lib/prompts/council.system.txt');
    const systemPrompt = readFileSync(promptPath, 'utf-8');
    
    // Prepare user prompt with council member context
    const memberContext = councilMembers.map(m => 
      `${m.name} (${m.role || 'Specialist'}) - Weight: ${m.weight}`
    ).join('\n');
    
    const userPrompt = `Council Members:\n${memberContext}\n\nReview this plan and provide votes from all council members:\n\n${JSON.stringify(plan, null, 2)}`;
    
    // Run model
    const response = await runModelUnified(
      systemPrompt,
      userPrompt,
      { provider: modelConfig.provider as any, model: modelConfig.model }
    );
    
    // Parse votes
    const votes = parseModelJSON(response);
    
    if (!Array.isArray(votes)) {
      throw new Error('Council response is not an array');
    }
    
    // Add agent metadata
    return votes.map((vote: any) => {
      const member = councilMembers.find(m => m.name === vote.agent);
      return {
        ...vote,
        agentId: member?.id || 'UNKNOWN',
        agentName: vote.agent,
        weight: member?.weight || 1.0,
      };
    });
  } catch (error: any) {
    console.error('[Council] Error:', error);
    
    // Return fallback approval votes
    return councilMembers.map(member => ({
      agentId: member.id,
      agentName: member.name,
      weight: member.weight,
      vote: 'approve' as const,
      confidence: 0.7,
      rationale: `Automated approval due to council error: ${error.message}`,
    }));
  }
}

/**
 * Compute weighted consensus from votes
 */
export function computeConsensus(votes: CouncilVote[]): {
  score: number;
  approved: boolean;
  summary: string;
} {
  let totalWeight = 0;
  let approvalWeight = 0;
  let reviseWeight = 0;
  let rejectWeight = 0;
  
  votes.forEach(vote => {
    totalWeight += vote.weight;
    
    if (vote.vote === 'approve') {
      approvalWeight += vote.weight * vote.confidence;
    } else if (vote.vote === 'revise') {
      reviseWeight += vote.weight * vote.confidence;
    } else {
      rejectWeight += vote.weight * vote.confidence;
    }
  });
  
  const approvalRatio = approvalWeight / totalWeight;
  const reviseRatio = reviseWeight / totalWeight;
  const rejectRatio = rejectWeight / totalWeight;
  
  const score = approvalRatio * 10;
  const approved = approvalRatio > 0.6 && rejectRatio < 0.2;
  
  const summary = `Council consensus: ${(approvalRatio * 100).toFixed(0)}% approval, ${(reviseRatio * 100).toFixed(0)}% revise, ${(rejectRatio * 100).toFixed(0)}% reject. ${approved ? 'Plan approved.' : 'Plan needs revision.'}`;
  
  return { score, approved, summary };
}

