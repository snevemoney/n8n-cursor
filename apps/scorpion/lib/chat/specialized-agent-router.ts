/**
 * Specialized Agent Router
 * Routes requests to appropriate specialized agents based on question type
 */

export interface SpecializedAgentRoute {
  agentId: string;
  agentName: string;
  method?: string;
  confidence: number;
  reason: string;
}

export interface SpecializedAgentGroup {
  name: string;
  agents: string[];
  description: string;
}

/**
 * Available specialized agent groups
 */
export const SPECIALIZED_AGENT_GROUPS: Record<string, SpecializedAgentGroup> = {
  'llm-development': {
    name: 'LLM Development',
    agents: ['llm-training', 'model-evaluation', 'prompt-engineering'],
    description: 'For questions about training models, evaluating performance, or optimizing prompts'
  },
  'data-analytics': {
    name: 'Data Analytics',
    agents: ['data-analytics'],
    description: 'For data analysis, visualization, and metrics questions'
  },
  'system-design': {
    name: 'System Design',
    agents: ['system-design'],
    description: 'For architecture, scalability, and system design questions'
  },
  'ai-tools': {
    name: 'AI Tools',
    agents: ['ai-tools'],
    description: 'For AI tool recommendations and agent design questions'
  },
  'business-strategy': {
    name: 'Business Strategy',
    agents: ['business-strategy'],
    description: 'For business model, GTM, and strategy questions'
  },
  'python': {
    name: 'Python Development',
    agents: ['python-expert'],
    description: 'For Python code generation, review, and optimization questions'
  }
};

/**
 * Detect if a question should route to specialized agents
 */
export function detectSpecializedAgentRoute(question: string, planSummary?: string): SpecializedAgentRoute[] {
  const text = (question + ' ' + (planSummary || '')).toLowerCase();
  const routes: SpecializedAgentRoute[] = [];

  // LLM Development Group
  if (
    /\b(train|training|fine.?tun|finetun|hyperparameter|learning.?rate|batch.?size|epoch|model.?train|llm.?train)\b/i.test(text) ||
    /\b(evaluat|benchmark|model.?compar|performance.?metric|accuracy|loss|perplexity)\b/i.test(text) ||
    /\b(prompt.?engin|prompt.?optim|prompt.?test|prompt.?design|prompt.?templat)\b/i.test(text) ||
    /\b(model.?develop|model.?optim|model.?improve|model.?fine.?tun)\b/i.test(text)
  ) {
    if (/\b(train|training|fine.?tun|hyperparameter|learning.?rate|batch.?size|epoch)\b/i.test(text)) {
      routes.push({
        agentId: 'llm-training',
        agentName: 'LLM Training Agent',
        confidence: 0.9,
        reason: 'Question involves model training or fine-tuning'
      });
    }
    if (/\b(evaluat|benchmark|model.?compar|performance.?metric|accuracy|loss)\b/i.test(text)) {
      routes.push({
        agentId: 'model-evaluation',
        agentName: 'Model Evaluation Agent',
        confidence: 0.9,
        reason: 'Question involves model evaluation or comparison'
      });
    }
    if (/\b(prompt.?engin|prompt.?optim|prompt.?test|prompt.?design)\b/i.test(text)) {
      routes.push({
        agentId: 'prompt-engineering',
        agentName: 'Prompt Engineering Agent',
        confidence: 0.9,
        reason: 'Question involves prompt engineering or optimization'
      });
    }
  }

  // Data Analytics
  if (
    /\b(analyz|visualiz|metric|kpi|dashboard|data.?insight|trend|forecast)\b/i.test(text) &&
    !/\b(model|llm|train|prompt)\b/i.test(text)
  ) {
    routes.push({
      agentId: 'data-analytics',
      agentName: 'Data Analytics Agent',
      confidence: 0.85,
      reason: 'Question involves data analysis or visualization'
    });
  }

  // System Design
  if (
    /\b(architect|scalab|design.?pattern|system.?design|microservice|api.?design|database.?design)\b/i.test(text)
  ) {
    routes.push({
      agentId: 'system-design',
      agentName: 'System Design Agent',
      confidence: 0.85,
      reason: 'Question involves system architecture or design'
    });
  }

  // AI Tools
  if (
    /\b(ai.?tool|agent.?design|agent.?pattern|react|reflection|planning|multi.?agent|orchestrat)\b/i.test(text)
  ) {
    routes.push({
      agentId: 'ai-tools',
      agentName: 'AI Tools Agent',
      confidence: 0.85,
      reason: 'Question involves AI tools or agent design'
    });
  }

  // Business Strategy
  if (
    /\b(business.?model|gtm|go.?to.?market|pricing|fundraising|competit|strategy|negotiat)\b/i.test(text)
  ) {
    routes.push({
      agentId: 'business-strategy',
      agentName: 'Business Strategy Agent',
      confidence: 0.85,
      reason: 'Question involves business strategy or planning'
    });
  }

  // Python Expert
  if (
    /\b(python|code.?generat|code.?review|code.?optim|async|library.?recommend|test.?generat|debug)\b/i.test(text) &&
    !/\b(model|llm|train)\b/i.test(text)
  ) {
    routes.push({
      agentId: 'python-expert',
      agentName: 'Python Expert Agent',
      confidence: 0.85,
      reason: 'Question involves Python development'
    });
  }

  return routes.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Execute a specialized agent method
 */
export async function executeSpecializedAgent(
  agentId: string,
  method: string,
  params: any
): Promise<any> {
  try {
    const response = await fetch('http://localhost:3003/api/agents/specialized', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent execution failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success ? result.data.result : result.result;
  } catch (error: any) {
    console.error(`[SpecializedAgentRouter] Error executing ${agentId}.${method}:`, error);
    throw error;
  }
}

/**
 * Get recommended agent group for a question
 */
export function getRecommendedAgentGroup(question: string): SpecializedAgentGroup | null {
  const routes = detectSpecializedAgentRoute(question);
  
  if (routes.length === 0) {
    return null;
  }

  // Find the group that contains the highest confidence agent
  const topRoute = routes[0];
  for (const [groupId, group] of Object.entries(SPECIALIZED_AGENT_GROUPS)) {
    if (group.agents.includes(topRoute.agentId)) {
      return group;
    }
  }

  return null;
}

