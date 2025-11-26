/**
 * Central Agent Metadata Registry
 * 
 * Single source of truth for all agents in Scorpion:
 * - 9 Council members
 * - 8 Specialized agents
 * 
 * This registry provides metadata for introspection, routing, and UI display.
 */

export type AgentType = 'council' | 'specialized';
export type AgentStatus = 'active' | 'experimental' | 'deprecated';

export interface AgentMetadata {
  id: string;
  type: AgentType;
  name: string;
  role: string;
  description: string;
  inputs?: string[];
  outputs?: string[];
  tools?: string[];
  status: AgentStatus;
  // Additional metadata
  weight?: number; // For council members
  specialty?: string; // For council members
  goal?: string; // For council members
  capabilities?: string[]; // For specialized agents
  icon?: string; // For UI display
}

/**
 * Council Members Registry
 * 9 expert agents that deliberate on complex decisions
 */
const COUNCIL_MEMBERS: AgentMetadata[] = [
  {
    id: 'E-001',
    type: 'council',
    name: 'Architectus',
    role: 'System Architect',
    specialty: 'Monorepo, services, modularity',
    description: 'Master strategist who thinks in systems, patterns, and long-term implications. Sees blueprints before buildings.',
    weight: 1.5,
    goal: 'Keep Scorpion scalable and extensible.',
    status: 'active',
    inputs: ['plan', 'system_context'],
    outputs: ['architectural_review', 'scalability_assessment'],
    tools: ['project.analyze', 'code.readFile']
  },
  {
    id: 'A-002',
    type: 'council',
    name: 'Analytica',
    role: 'Knowledge & RAG Strategist',
    specialty: 'RAG, embeddings, retrieval quality',
    description: 'Intelligence gatherer who sees connections others miss, patterns in chaos, knowledge where others see noise.',
    weight: 1.2,
    goal: 'Maximize reuse of past side hustles and docs.',
    status: 'active',
    inputs: ['plan', 'knowledge_context'],
    outputs: ['rag_strategy', 'knowledge_recommendations'],
    tools: ['kb.search', 'knowledge.get']
  },
  {
    id: 'P-003',
    type: 'council',
    name: 'Pragmaton',
    role: 'Execution Engineer',
    specialty: 'n8n, automation, API wiring',
    description: 'Field operative who thinks in terms of what actually works, not what looks good on paper. Brutally honest about feasibility.',
    weight: 1.3,
    goal: 'Translate council output into workflows.',
    status: 'active',
    inputs: ['plan', 'execution_context'],
    outputs: ['feasibility_assessment', 'execution_plan'],
    tools: ['workflows.trigger', 'workflows.list']
  },
  {
    id: 'S-004',
    type: 'council',
    name: 'Satori',
    role: 'Alignment & Safety',
    specialty: 'user intent, privacy, business rules',
    description: 'Ethical compass who sees human impact, alignment issues, and hidden consequences. The conscience of the operation.',
    weight: 1.0,
    goal: 'Ensure decisions match Evens\' goals and values.',
    status: 'active',
    inputs: ['plan', 'user_intent'],
    outputs: ['safety_assessment', 'alignment_check'],
    tools: []
  },
  {
    id: 'N-005',
    type: 'council',
    name: 'Nexus',
    role: 'Integration Specialist',
    specialty: 'API design, data flows, webhooks',
    description: 'Connector who sees how systems interact, where integrations break, and how data flows.',
    weight: 1.1,
    goal: 'Ensure seamless communication between all services.',
    status: 'active',
    inputs: ['plan', 'integration_context'],
    outputs: ['integration_review', 'api_assessment'],
    tools: ['system.health']
  },
  {
    id: 'S-006',
    type: 'council',
    name: 'Sentinel',
    role: 'Security & Performance',
    specialty: 'Security, rate limiting, optimization',
    description: 'Guardian who sees threats everywhere - and is usually right. Paranoid by design, and that\'s their strength.',
    weight: 1.2,
    goal: 'Protect system integrity and maximize performance.',
    status: 'active',
    inputs: ['plan', 'security_context'],
    outputs: ['security_assessment', 'performance_review'],
    tools: ['system.health', 'logs.tail']
  },
  {
    id: 'C-007',
    type: 'council',
    name: 'Catalyst',
    role: 'Innovation Advisor',
    specialty: 'New technologies, AI trends, experimentation',
    description: 'Innovator who sees possibilities where others see problems. Balances excitement of new ideas with reality of complexity.',
    weight: 0.9,
    goal: 'Identify opportunities for cutting-edge improvements.',
    status: 'active',
    inputs: ['plan', 'innovation_context'],
    outputs: ['innovation_suggestions', 'trend_analysis'],
    tools: ['research.run']
  },
  {
    id: 'O-008',
    type: 'council',
    name: 'Oracle',
    role: 'Data & Analytics',
    specialty: 'Metrics, insights, predictive analytics',
    description: 'Data seer who sees trends, metrics, and signals in the noise. Speaks with confidence backed by evidence.',
    weight: 1.1,
    goal: 'Turn data into actionable intelligence.',
    status: 'active',
    inputs: ['plan', 'metrics_context'],
    outputs: ['data_analysis', 'predictive_insights'],
    tools: ['system.health']
  },
  {
    id: 'M-009',
    type: 'council',
    name: 'Mentor',
    role: 'LLM Training & Evaluation',
    specialty: 'Model training, fine-tuning, evaluation, prompt engineering',
    description: 'LLM training master who understands model architectures, training strategies, fine-tuning techniques, and evaluation metrics.',
    weight: 1.2,
    goal: 'Guide LLM development, training strategies, and model optimization.',
    status: 'active',
    inputs: ['plan', 'llm_context'],
    outputs: ['training_recommendations', 'evaluation_plan'],
    tools: ['llm.train', 'llm.evaluate']
  }
];

/**
 * Specialized Agents Registry
 * 8 domain-specific expert agents
 */
const SPECIALIZED_AGENTS: AgentMetadata[] = [
  {
    id: 'data-analytics',
    type: 'specialized',
    name: 'Data Analytics Agent',
    role: 'Data Analysis Expert',
    description: 'Data analysis, ML pipelines, metrics, visualization',
    status: 'active',
    capabilities: ['descriptive', 'diagnostic', 'predictive', 'prescriptive', 'visualization', 'metrics'],
    icon: '📊',
    inputs: ['query', 'data_context'],
    outputs: ['analysis', 'visualizations', 'metrics'],
    tools: ['kb.search', 'project.analyze']
  },
  {
    id: 'system-design',
    type: 'specialized',
    name: 'System Design Agent',
    role: 'Architecture Expert',
    description: 'Architecture, scalability, design patterns',
    status: 'active',
    capabilities: ['architecture', 'scalability', 'technology-selection', 'observability'],
    icon: '🏗️',
    inputs: ['requirements', 'system_context'],
    outputs: ['architecture_design', 'scalability_plan'],
    tools: ['project.analyze', 'code.readFile']
  },
  {
    id: 'ai-tools',
    type: 'specialized',
    name: 'AI Tools Agent',
    role: 'AI Tools Expert',
    description: 'AI tool selection, agent design patterns',
    status: 'active',
    capabilities: ['tool-recommendation', 'agent-design', 'workflow-orchestration'],
    icon: '🤖',
    inputs: ['use_case', 'requirements'],
    outputs: ['tool_recommendations', 'agent_design'],
    tools: ['kb.search']
  },
  {
    id: 'business-strategy',
    type: 'specialized',
    name: 'Business Strategy Agent',
    role: 'Business Strategy Expert',
    description: 'Business models, GTM, pricing, competitive analysis',
    status: 'active',
    capabilities: ['business-model', 'gtm-strategy', 'pricing', 'competitive-analysis'],
    icon: '💼',
    inputs: ['business_context', 'market_data'],
    outputs: ['strategy_recommendations', 'market_analysis'],
    tools: ['research.run']
  },
  {
    id: 'python-expert',
    type: 'specialized',
    name: 'Python Expert Agent',
    role: 'Python Development Expert',
    description: 'Python programming, code review, optimization',
    status: 'active',
    capabilities: ['code-generation', 'code-review', 'optimization', 'best-practices'],
    icon: '🐍',
    inputs: ['code', 'requirements'],
    outputs: ['reviewed_code', 'optimizations', 'suggestions'],
    tools: ['code.readFile']
  },
  {
    id: 'llm-training',
    type: 'specialized',
    name: 'LLM Training Agent',
    role: 'LLM Training Expert',
    description: 'LLM training strategies, hyperparameter optimization',
    status: 'active',
    capabilities: ['training-strategy', 'hyperparameter-tuning', 'fine-tuning'],
    icon: '🎓',
    inputs: ['training_data', 'model_spec'],
    outputs: ['training_plan', 'hyperparameter_recommendations'],
    tools: ['llm.train']
  },
  {
    id: 'model-evaluation',
    type: 'specialized',
    name: 'Model Evaluation Agent',
    role: 'Model Evaluation Expert',
    description: 'Model evaluation, benchmarking, performance analysis',
    status: 'active',
    capabilities: ['evaluation', 'benchmarking', 'performance-analysis', 'comparison'],
    icon: '📈',
    inputs: ['model', 'test_data'],
    outputs: ['evaluation_report', 'benchmark_results'],
    tools: ['llm.evaluate']
  },
  {
    id: 'prompt-engineering',
    type: 'specialized',
    name: 'Prompt Engineering Agent',
    role: 'Prompt Engineering Expert',
    description: 'Prompt optimization, A/B testing, templates',
    status: 'active',
    capabilities: ['prompt-optimization', 'a-b-testing', 'template-generation'],
    icon: '✍️',
    inputs: ['prompt', 'context'],
    outputs: ['optimized_prompt', 'test_results'],
    tools: []
  }
];

/**
 * Get all agents by type
 */
export function getAgentsByType(type: AgentType): AgentMetadata[] {
  return type === 'council' ? COUNCIL_MEMBERS : SPECIALIZED_AGENTS;
}

/**
 * Get all agents (council + specialized)
 */
export function getAllAgents(): AgentMetadata[] {
  return [...COUNCIL_MEMBERS, ...SPECIALIZED_AGENTS];
}

/**
 * Get agent by ID
 */
export function getAgentById(id: string): AgentMetadata | undefined {
  return getAllAgents().find(agent => agent.id === id);
}

/**
 * Get agent by name
 */
export function getAgentByName(name: string): AgentMetadata | undefined {
  return getAllAgents().find(agent => agent.name === name);
}

/**
 * Get council members
 */
export function getCouncilMembers(): AgentMetadata[] {
  return COUNCIL_MEMBERS;
}

/**
 * Get specialized agents
 */
export function getSpecializedAgents(): AgentMetadata[] {
  return SPECIALIZED_AGENTS;
}

/**
 * Get active agents only
 */
export function getActiveAgents(): AgentMetadata[] {
  return getAllAgents().filter(agent => agent.status === 'active');
}

/**
 * Get agents by status
 */
export function getAgentsByStatus(status: AgentStatus): AgentMetadata[] {
  return getAllAgents().filter(agent => agent.status === status);
}

/**
 * Check if agent exists
 */
export function agentExists(id: string): boolean {
  return getAgentById(id) !== undefined;
}

/**
 * Get agent metadata for display/logging
 */
export function getAgentDisplayInfo(id: string): { name: string; role: string; type: AgentType } | null {
  const agent = getAgentById(id);
  if (!agent) return null;
  return {
    name: agent.name,
    role: agent.role,
    type: agent.type
  };
}

