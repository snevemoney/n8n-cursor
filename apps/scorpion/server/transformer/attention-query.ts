/**
 * Attention Query - Self-Attention at System Level
 * 
 * Maps to: Self-Attention (Q, K, V)
 * 
 * Planner + Council agents query the Resource Index to find relevant resources.
 * This is like attention: Q (query from agent) · K^T (resource embeddings) → attention scores.
 */

import type { ResourceIndex } from './resource-index';
import type { ScorpionContext } from './scorpion-context';
import type { HeadOutput } from './head-output';

/**
 * Attention Query Result
 * 
 * Maps to: Attention scores and weighted values
 */
export interface AttentionResult {
  resources: Array<{
    entryId: string;
    score: number; // Attention weight (0-1)
    reason: string;
  }>;
  topTools: Array<{
    toolId: string;
    score: number;
    reason: string;
  }>;
  topDocs: Array<{
    docId: string;
    score: number;
    snippet: string;
  }>;
  topWorkflows: Array<{
    workflowId: string;
    score: number;
    reason: string;
  }>;
}

/**
 * Planner Attention Query
 * 
 * Maps to: Query vector (Q) from Planner agent
 * 
 * Planner asks: "Which tools, workflows, and knowledge chunks are relevant for this task?"
 */
export async function plannerAttentionQuery(
  resourceIndex: ResourceIndex,
  context: ScorpionContext
): Promise<AttentionResult> {
  const query = context.userQuery || context.currentTask || '';
  
  // Query for tools
  const toolResults = await resourceIndex.search(query, {
    type: 'tool',
    limit: 10,
  });
  
  // Query for docs
  const docResults = await resourceIndex.search(query, {
    type: 'doc',
    limit: 5,
  });
  
  // Query for workflows
  const workflowResults = await resourceIndex.search(query, {
    type: 'workflow',
    limit: 5,
  });
  
  return {
    resources: [
      ...toolResults.map(r => ({
        entryId: r.entry.id,
        score: r.score,
        reason: `Tool matches query: ${query}`,
      })),
      ...docResults.map(r => ({
        entryId: r.entry.id,
        score: r.score,
        reason: `Doc matches query: ${query}`,
      })),
      ...workflowResults.map(r => ({
        entryId: r.entry.id,
        score: r.score,
        reason: `Workflow matches query: ${query}`,
      })),
    ],
    topTools: toolResults.map(r => ({
      toolId: r.entry.id,
      score: r.score,
      reason: r.entry.description,
    })),
    topDocs: docResults.map(r => ({
      docId: r.entry.id,
      score: r.score,
      snippet: r.entry.description.substring(0, 200),
    })),
    topWorkflows: workflowResults.map(r => ({
      workflowId: r.entry.id,
      score: r.score,
      reason: r.entry.description,
    })),
  };
}

/**
 * Council Agent Attention Query
 * 
 * Maps to: Multi-head attention (each council member = one head)
 * 
 * Each council agent (Architectus, Analytica, etc.) queries from its perspective.
 */
export async function councilAgentAttentionQuery(
  resourceIndex: ResourceIndex,
  context: ScorpionContext,
  agentPerspective: string // e.g., 'architecture', 'data', 'code', 'risk'
): Promise<HeadOutput> {
  // Build query from agent perspective
  const baseQuery = context.userQuery || context.currentTask || '';
  const perspectiveQuery = `${agentPerspective} ${baseQuery}`;
  
  // Query resources with perspective-specific tags
  const perspectiveTags = getPerspectiveTags(agentPerspective);
  const results = await resourceIndex.search(perspectiveQuery, {
    tags: perspectiveTags,
    limit: 10,
  });
  
  // Build priorities from results
  const priorities = results.map(r => ({
    itemId: r.entry.id,
    score: r.score,
    reason: `Relevant from ${agentPerspective} perspective: ${r.entry.description}`,
  }));
  
  // Extract actions from top resources
  const actions = results.slice(0, 5).map(r => 
    `Consider ${r.entry.title}: ${r.entry.description}`
  );
  
  // Extract risks (if any error logs or failed workflows)
  const risks: string[] = [];
  const errorLogs = await resourceIndex.list('log', ['error']);
  if (errorLogs.length > 0) {
    risks.push(`Found ${errorLogs.length} error logs that may be relevant`);
  }
  
  return {
    headName: agentPerspective,
    priorities,
    actions,
    risks,
    toolSuggestions: results
      .filter(r => r.entry.type === 'tool')
      .map(r => ({
        toolId: r.entry.id,
        confidence: r.score,
        reason: r.entry.description,
      })),
    knowledgeHits: results
      .filter(r => r.entry.type === 'doc')
      .map(r => ({
        docId: r.entry.id,
        relevance: r.score,
        snippet: r.entry.description.substring(0, 200),
      })),
  };
}

function getPerspectiveTags(perspective: string): string[] {
  const tagMap: Record<string, string[]> = {
    architecture: ['architecture', 'design', 'system', 'cloud'],
    data: ['data', 'metrics', 'analytics', 'observability'],
    code: ['code', 'implementation', 'refactor', 'tool'],
    risk: ['risk', 'safety', 'test', 'validation', 'rollback'],
  };
  
  return tagMap[perspective] || [perspective];
}

