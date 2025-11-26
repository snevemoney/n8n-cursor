/**
 * Head Output - Multi-Head Attention Output
 * 
 * Maps to: Multi-Head Attention (each specialized agent = one head)
 * 
 * Each agent (Architectus, Analytica, Pragmaton, Risk/QA) produces a HeadOutput.
 * The Orchestrator then merges all HeadOutput[] into an IntegrationPlan.
 */

export interface HeadOutput {
  headName: string; // e.g., 'architectus', 'analytica', 'pragmaton', 'risk'
  priorities: Array<{
    itemId: string;
    score: number; // 0-1, attention weight
    reason: string;
  }>;
  actions: string[]; // Proposed action descriptions
  risks: string[]; // Risk notes
  toolSuggestions?: Array<{
    toolId: string;
    confidence: number;
    reason: string;
  }>;
  knowledgeHits?: Array<{
    docId: string;
    relevance: number;
    snippet: string;
  }>;
}

/**
 * Integration Plan - Merged output from all heads
 * 
 * Maps to: Multi-Head Attention Output Projection (W_out)
 * 
 * The Orchestrator/Integrator agent takes all HeadOutput[] and produces this unified plan.
 */
export interface IntegrationPlan {
  orderedSteps: Step[];
  chosenTools: ToolCall[];
  validationSteps: Step[];
  rollbackPlan?: Step[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedDuration?: number;
}

export interface Step {
  id: string;
  type: 'tool_call' | 'validation' | 'rollback' | 'notification';
  description: string;
  tool?: string;
  params?: Record<string, unknown>;
  dependsOn?: string[]; // Step IDs that must complete first
  timeout?: number;
}

export interface ToolCall {
  toolId: string;
  name: string;
  params: Record<string, unknown>;
  expectedOutput?: string;
}

/**
 * Merge multiple HeadOutputs into an IntegrationPlan
 * 
 * Maps to: Concatenating head outputs and applying W_out projection
 */
export function mergeHeadOutputs(
  headOutputs: HeadOutput[],
  contextSummary?: {
    techDebtCount?: number;
    failingWorkflows?: string[];
  }
): IntegrationPlan {
  // Collect all priorities and sort by combined score
  const allPriorities = headOutputs.flatMap(head => 
    head.priorities.map(p => ({
      ...p,
      headName: head.headName,
    }))
  );
  
  // Sort by score (attention weight)
  allPriorities.sort((a, b) => b.score - a.score);
  
  // Collect all actions
  const allActions = headOutputs.flatMap(head => head.actions);
  
  // Collect all risks
  const allRisks = headOutputs.flatMap(head => head.risks);
  
  // Determine risk level
  const riskLevel: IntegrationPlan['riskLevel'] = 
    allRisks.length > 5 ? 'high' :
    allRisks.length > 2 ? 'medium' : 'low';
  
  // Build ordered steps from actions
  const orderedSteps: Step[] = allActions.map((action, idx) => ({
    id: `step-${idx + 1}`,
    type: 'tool_call',
    description: action,
  }));
  
  // Collect tool suggestions
  const chosenTools: ToolCall[] = headOutputs
    .flatMap(head => head.toolSuggestions || [])
    .filter(tool => tool.confidence > 0.5)
    .map(tool => ({
      toolId: tool.toolId,
      name: tool.toolId, // TODO: resolve actual tool name
      params: {},
    }));
  
  // Add validation steps if there are risks or failing workflows
  const validationSteps: Step[] = [];
  if (riskLevel !== 'low' || (contextSummary?.failingWorkflows?.length ?? 0) > 0) {
    validationSteps.push({
      id: 'validate-1',
      type: 'validation',
      description: 'Run tests and health checks',
    });
  }
  
  return {
    orderedSteps,
    chosenTools,
    validationSteps,
    riskLevel,
  };
}

