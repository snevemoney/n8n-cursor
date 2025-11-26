/**
 * Planner LLM Router
 * Routes planning & council requests to guaranteed cloud models with fallback
 * Prevents 404 errors from missing local Ollama models
 */

import { runModel, type LLMRequest, type LLMResponse } from '../llm/modelAdapter';

export interface PlannerLLMConfig {
  provider: 'ollama' | 'openai' | 'auto';
  model?: string;
  fallbackProvider?: 'openai' | 'ollama';
  fallbackModel?: string;
  checkOllamaModelExists?: boolean;
}

export interface PlannerLLMResult {
  content: string;
  model: string;
  provider: 'ollama' | 'openai';
  usedFallback: boolean;
}

/**
 * Check if Ollama model exists
 */
async function checkOllamaModelExists(model: string): Promise<boolean> {
  try {
    const ollamaUrl = process.env['OLLAMA_URL'] || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`);
    if (!response.ok) return false;
    
    const data = await response.json();
    const models = (data.models || []).map((m: any) => m.name);
    return models.includes(model);
  } catch (error) {
    return false;
  }
}

/**
 * Check if Ollama is reachable
 */
async function checkOllamaReachable(): Promise<boolean> {
  try {
    const ollamaUrl = process.env['OLLAMA_URL'] || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Check if OpenAI is configured
 */
function checkOpenAIConfigured(): boolean {
  return !!process.env['OPENAI_API_KEY'] && process.env['OPENAI_API_KEY'].trim().length > 0;
}

/**
 * Router for planner LLM calls with automatic fallback
 * Priority: Cloud (OpenAI) > Local (Ollama) if model exists
 */
export async function routePlannerLLM(
  request: LLMRequest,
  config: PlannerLLMConfig = {}
): Promise<PlannerLLMResult> {
  const provider = config.provider || (process.env['PLANNER_LLM_PROVIDER'] as 'ollama' | 'openai' | 'auto') || 'auto';
  const fallbackProvider = config.fallbackProvider || 'openai';
  const model = config.model || request.model || process.env['PLANNER_LLM_MODEL'] || 'llama3.1:8b';
  const fallbackModel = config.fallbackModel || process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
  const checkModelExists = config.checkOllamaModelExists !== false;

  // Helper to run with specific source
  const runWithSource = async (source: 'ollama' | 'openai', modelName: string): Promise<LLMResponse> => {
    const originalSource = process.env['SCORPION_MODEL_SOURCE'];
    process.env['SCORPION_MODEL_SOURCE'] = source;
    try {
      return await runModel({
        ...request,
        model: modelName
      });
    } finally {
      if (originalSource) {
        process.env['SCORPION_MODEL_SOURCE'] = originalSource;
      } else {
        delete process.env['SCORPION_MODEL_SOURCE'];
      }
    }
  };

  // Auto mode: prefer cloud for reliability
  if (provider === 'auto') {
    // If OpenAI is configured, use it for planning (more reliable)
    if (checkOpenAIConfigured()) {
      console.log('[Planner Router] Using OpenAI (auto mode, cloud preferred)');
      try {
        const response = await runWithSource('openai', fallbackModel);
        return {
          content: response.content,
          model: response.model,
          provider: 'openai',
          usedFallback: false
        };
      } catch (error: any) {
        console.warn('[Planner Router] OpenAI failed, trying Ollama:', error.message);
        // Fall through to Ollama
      }
    }

    // Try Ollama if configured and model exists
    if (checkModelExists) {
      const ollamaReachable = await checkOllamaReachable();
      if (ollamaReachable) {
        const modelExists = await checkOllamaModelExists(model);
        if (modelExists) {
          console.log(`[Planner Router] Using Ollama model: ${model}`);
          try {
            const response = await runWithSource('ollama', model);
            return {
              content: response.content,
              model: response.model,
              provider: 'ollama',
              usedFallback: false
            };
          } catch (error: any) {
            console.warn('[Planner Router] Ollama failed:', error.message);
          }
        } else {
          console.warn(`[Planner Router] Ollama model ${model} not found`);
        }
      }
    }

    // Final fallback: OpenAI if available
    if (checkOpenAIConfigured()) {
      console.log('[Planner Router] Using OpenAI fallback');
      const response = await runWithSource('openai', fallbackModel);
      return {
        content: response.content,
        model: response.model,
        provider: 'openai',
        usedFallback: true
      };
    }

    throw new Error('No LLM provider available. Configure OPENAI_API_KEY or ensure Ollama is running with required model.');
  }

  // Explicit provider selection
  if (provider === 'openai') {
    if (!checkOpenAIConfigured()) {
      throw new Error('OPENAI_API_KEY not configured but OpenAI provider requested');
    }
    const response = await runWithSource('openai', fallbackModel);
    return {
      content: response.content,
      model: response.model,
      provider: 'openai',
      usedFallback: false
    };
  }

  if (provider === 'ollama') {
    if (checkModelExists) {
      const modelExists = await checkOllamaModelExists(model);
      if (!modelExists) {
        // Try fallback
        if (fallbackProvider === 'openai' && checkOpenAIConfigured()) {
          console.warn(`[Planner Router] Ollama model ${model} not found, falling back to OpenAI`);
          const response = await runWithSource('openai', fallbackModel);
          return {
            content: response.content,
            model: response.model,
            provider: 'openai',
            usedFallback: true
          };
        }
        throw new Error(`Ollama model ${model} not found and no fallback configured`);
      }
    }

    const response = await runWithSource('ollama', model);
    return {
      content: response.content,
      model: response.model,
      provider: 'ollama',
      usedFallback: false
    };
  }

  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Preflight check for planner readiness
 */
export interface PlannerPreflightResult {
  ready: boolean;
  provider: 'ollama' | 'openai' | 'none';
  model?: string;
  errors: string[];
  warnings: string[];
}

export async function checkPlannerPreflight(): Promise<PlannerPreflightResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let provider: 'ollama' | 'openai' | 'none' = 'none';
  let model: string | undefined;

  // Check OpenAI
  const openaiConfigured = checkOpenAIConfigured();
  if (openaiConfigured) {
    provider = 'openai';
    model = process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
  } else {
    warnings.push('OPENAI_API_KEY not configured - planner will rely on Ollama');
  }

  // Check Ollama
  const ollamaReachable = await checkOllamaReachable();
  if (ollamaReachable) {
    const plannerModel = process.env['PLANNER_LLM_MODEL'] || 'llama3.1:8b';
    const modelExists = await checkOllamaModelExists(plannerModel);
    if (modelExists) {
      if (provider === 'none') {
        provider = 'ollama';
        model = plannerModel;
      }
    } else {
      warnings.push(`Ollama model ${plannerModel} not found`);
      if (provider === 'none') {
        errors.push(`No LLM provider available. Configure OPENAI_API_KEY or install Ollama model: ${plannerModel}`);
      }
    }
  } else {
    warnings.push('Ollama not reachable');
    if (provider === 'none') {
      errors.push('No LLM provider available. Configure OPENAI_API_KEY or start Ollama');
    }
  }

  return {
    ready: errors.length === 0,
    provider,
    model,
    errors,
    warnings
  };
}

