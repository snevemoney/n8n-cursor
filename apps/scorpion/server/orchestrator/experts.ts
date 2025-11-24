/**
 * Expert Registry for MoE (Mixture of Experts) System
 * Power of 10 Rule 3: Functions ≤ 60 lines, Rule 1: No recursion
 */

export type ExpertId =
  | 'planner_core'
  | 'council_generalist'
  | 'tool_selection'
  | 'kb_specialist'
  | 'user_tools_designer'
  | 'observability_engineer'
  | 'voice_pipeline'
  | 'bitcoin_analyst'
  | 'n8n_integration'
  | 'safety_guardian'
  | 'code_architect'
  | 'infra_specialist';

export type ExpertTag =
  | 'planning'
  | 'council'
  | 'tools'
  | 'knowledge'
  | 'user_tools'
  | 'observability'
  | 'voice'
  | 'bitcoin'
  | 'orchestration'
  | 'safety'
  | 'coding'
  | 'infra';

export interface ExpertConfig {
  id: ExpertId;
  name: string;
  description: string;
  tags: ExpertTag[];
  // Soft priorities: higher = more likely to be picked
  priority: number;
  // Lightweight constraints (no recursion, no long loops, etc.)
  constraints?: {
    maxSteps?: number;
    maxTokens?: number;
  };
}

/**
 * Expert Registry
 * Power of 10 Rule 2: Bounded array, Rule 3: ≤ 60 lines
 */
export const EXPERTS: ExpertConfig[] = [
  {
    id: 'planner_core',
    name: 'Planner Core',
    description: 'Breaks user goals into phased plans for Scorpion.',
    tags: ['planning', 'orchestration'],
    priority: 10,
    constraints: { maxSteps: 8 },
  },
  {
    id: 'council_generalist',
    name: 'Council Generalist',
    description: 'Provides general reasoning and critique of plans.',
    tags: ['council'],
    priority: 8,
  },
  {
    id: 'tool_selection',
    name: 'Tool Selection Specialist',
    description: 'Chooses tools/MCP services for each step.',
    tags: ['tools', 'orchestration'],
    priority: 9,
  },
  {
    id: 'kb_specialist',
    name: 'Knowledge Base Specialist',
    description: 'Searches and retrieves relevant knowledge from vector store.',
    tags: ['knowledge'],
    priority: 7,
  },
  {
    id: 'user_tools_designer',
    name: 'User Tools Designer',
    description: 'Suggests user-facing tools and workflows.',
    tags: ['user_tools'],
    priority: 6,
  },
  {
    id: 'observability_engineer',
    name: 'Observability Engineer',
    description: 'Adds observability events and brain-map edges.',
    tags: ['observability'],
    priority: 7,
  },
  {
    id: 'voice_pipeline',
    name: 'Voice Pipeline Expert',
    description: 'Handles voice mode, STT, TTS, and audio processing.',
    tags: ['voice'],
    priority: 5,
  },
  {
    id: 'bitcoin_analyst',
    name: 'Bitcoin Analyst',
    description: 'Specializes in Bitcoin, crypto, and on-chain analysis.',
    tags: ['bitcoin', 'knowledge'],
    priority: 6,
  },
  {
    id: 'n8n_integration',
    name: 'n8n Integration Specialist',
    description: 'Manages n8n workflow orchestration and automation.',
    tags: ['orchestration', 'tools'],
    priority: 8,
  },
  {
    id: 'safety_guardian',
    name: 'Safety Guardian',
    description: 'Ensures plans and actions comply with safety rules.',
    tags: ['safety'],
    priority: 9,
  },
  {
    id: 'code_architect',
    name: 'Code Architect',
    description: 'Designs code structure, architecture, and refactoring plans.',
    tags: ['coding', 'planning'],
    priority: 7,
  },
  {
    id: 'infra_specialist',
    name: 'Infrastructure Specialist',
    description: 'Handles DevOps, deployment, and infrastructure concerns.',
    tags: ['infra', 'orchestration'],
    priority: 6,
  },
];

/**
 * Get expert by ID
 * Power of 10 Rule 3: ≤ 60 lines, Rule 2: Bounded iteration
 */
export function getExpertById(id: ExpertId): ExpertConfig | undefined {
  // Power of 10 Rule 2: Bounded loop
  for (let i = 0; i < EXPERTS.length; i++) {
    const expert = EXPERTS[i];
    if (expert && expert.id === id) {
      return expert;
    }
  }
  return undefined;
}

/**
 * Get experts by tag
 * Power of 10 Rule 3: ≤ 60 lines, Rule 2: Bounded iteration
 */
export function getExpertsByTag(tag: ExpertTag): ExpertConfig[] {
  const results: ExpertConfig[] = [];
  // Power of 10 Rule 2: Bounded loop
  for (let i = 0; i < EXPERTS.length; i++) {
    const expert = EXPERTS[i];
    if (expert && expert.tags.includes(tag)) {
      results.push(expert);
    }
  }
  return results;
}


