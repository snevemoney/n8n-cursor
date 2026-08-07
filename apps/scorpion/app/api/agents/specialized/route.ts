import { NextRequest, NextResponse } from 'next/server';
import { 
  DataAnalyticsAgent,
  SystemDesignAgent,
  AIToolsAgent,
  BusinessStrategyAgent,
  PythonExpertAgent,
  LLMTrainingAgent,
  ModelEvaluationAgent,
  PromptEngineeringAgent,
  LLMAdapter
} from '@scorpion/core';
import { getRAGStore } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';
import { getRecommendedModelForRAM } from '@/lib/utils/modelSelector';

export const dynamic = 'force-dynamic';

// Agent registry
const agentClasses = {
  'data-analytics': DataAnalyticsAgent,
  'system-design': SystemDesignAgent,
  'ai-tools': AIToolsAgent,
  'business-strategy': BusinessStrategyAgent,
  'python-expert': PythonExpertAgent,
  'llm-training': LLMTrainingAgent,
  'model-evaluation': ModelEvaluationAgent,
  'prompt-engineering': PromptEngineeringAgent,
};

const agentInfo = {
  'data-analytics': {
    name: 'Data Analytics Agent',
    description: 'Data analysis, ML pipelines, metrics, visualization',
    icon: '📊',
    capabilities: ['descriptive', 'diagnostic', 'predictive', 'prescriptive', 'visualization', 'metrics']
  },
  'system-design': {
    name: 'System Design Agent',
    description: 'Architecture, scalability, design patterns',
    icon: '🏗️',
    capabilities: ['architecture', 'scalability', 'technology-selection', 'observability']
  },
  'ai-tools': {
    name: 'AI Tools Agent',
    description: 'AI tool selection, agent design patterns',
    icon: '🤖',
    capabilities: ['tool-recommendation', 'agent-design', 'workflow-orchestration']
  },
  'business-strategy': {
    name: 'Business Strategy Agent',
    description: 'Business models, GTM, pricing, competitive analysis',
    icon: '💼',
    capabilities: ['business-model', 'gtm-strategy', 'pricing', 'competitive-analysis']
  },
  'python-expert': {
    name: 'Python Expert Agent',
    description: 'Python programming, code review, optimization',
    icon: '🐍',
    capabilities: ['code-generation', 'code-review', 'optimization', 'best-practices']
  },
  'llm-training': {
    name: 'LLM Training Agent',
    description: 'LLM training strategies, hyperparameter optimization',
    icon: '🎓',
    capabilities: ['training-strategy', 'hyperparameter-tuning', 'fine-tuning']
  },
  'model-evaluation': {
    name: 'Model Evaluation Agent',
    description: 'Model evaluation, benchmarking, performance analysis',
    icon: '📈',
    capabilities: ['evaluation', 'benchmarking', 'performance-analysis', 'comparison']
  },
  'prompt-engineering': {
    name: 'Prompt Engineering Agent',
    description: 'Prompt optimization, A/B testing, templates',
    icon: '✍️',
    capabilities: ['prompt-optimization', 'a-b-testing', 'template-generation']
  },
};

/**
 * GET /api/agents/specialized - List all specialized agents
 */
export const GET = withErrorHandling(async () => {
  return createSuccessResponse({
    agents: Object.entries(agentInfo).map(([id, info]) => ({
      id,
      ...info
    }))
  });
});

const executeAgentSchema = z.object({
  agentId: z.enum(['data-analytics', 'system-design', 'ai-tools', 'business-strategy', 'python-expert', 'llm-training', 'model-evaluation', 'prompt-engineering']),
  method: z.string().min(1),
  params: z.any(),
});

/**
 * POST /api/agents/specialized - Execute a specialized agent method
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, executeAgentSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { agentId, method, params } = validation.data;

  try {
    // Initialize agent
    const AgentClass = agentClasses[agentId];
    if (!AgentClass) {
      return createErrorResponse(
        ApiErrorCode.INVALID_PARAMETER,
        `Unknown agent: ${agentId}`,
        { agentId },
        400
      );
    }

    const ragStore = await getRAGStore();
    const llm = new LLMAdapter({
      provider: process.env['SCORPION_MODEL_SOURCE'] === 'openai' ? 'openai' : 'ollama',
      model: process.env['OLLAMA_MODEL'] || getRecommendedModelForRAM()
    });

    const agent = new AgentClass(llm, ragStore);

    // Check if method exists
    if (typeof (agent as any)[method] !== 'function') {
      return createErrorResponse(
        ApiErrorCode.INVALID_PARAMETER,
        `Method ${method} not found on agent ${agentId}`,
        { agentId, method },
        400
      );
    }

    // Execute method
    const result = await (agent as any)[method](params);

    return createSuccessResponse({
      agentId,
      method,
      result
    });
  } catch (error: any) {
    console.error(`Error executing agent ${agentId}.${method}:`, error);
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      `Agent execution failed: ${error.message}`,
      { agentId, method, error: error.message },
      500
    );
  }
});

