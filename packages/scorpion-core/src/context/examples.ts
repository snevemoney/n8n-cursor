/**
 * Examples of using the LLM Grounding System
 * These examples demonstrate how to provide proper context to LLM models
 */

import { 
  generateGroundedSystemPrompt, 
  generateGroundingContext,
  getMemorySystem,
  getAssetSource,
  getAction,
  GroundingOptions
} from './grounding';
import { LLMAdapter } from '../llm/modelAdapter';
import { runModel } from '../llm/modelAdapter';

/**
 * Example 1: Basic grounding for asset management assistant
 */
export async function exampleAssetManagementAssistant() {
  const llm = new LLMAdapter();
  
  const grounding: GroundingOptions = {
    includeMemory: true,
    includeAssets: true,
    includeActions: true,
    businessName: "Acme Corporation"
  };

  const response = await llm.chat(
    "What maintenance is due this month?",
    "You are an asset management assistant.",
    grounding
  );

  return response;
}

/**
 * Example 2: RAG-enhanced query with full grounding
 */
export async function exampleRAGQuery() {
  const grounding: GroundingOptions = {
    includeMemory: true,
    includeAssets: true,
    includeActions: true,
    includePrompts: true,
    businessName: "TechCorp"
  };

  const response = await runModel({
    prompt: "Find the HVAC troubleshooting guide and check if we have any pending work orders for HVAC systems",
    system: "You are a helpful technical assistant.",
    grounding
  });

  return response.content;
}

/**
 * Example 3: Agent-specific grounding
 */
export async function exampleAgentSpecific() {
  const grounding: GroundingOptions = {
    agentId: "infra-scout",
    includeMemory: true,
    includeActions: true
  };

  const systemPrompt = generateGroundedSystemPrompt({
    basePrompt: "You are InfraScout, monitoring infrastructure health.",
    ...grounding
  });

  const response = await runModel({
    prompt: "Check system health across all services",
    system: systemPrompt
  });

  return response.content;
}

/**
 * Example 4: Get specific grounding information
 */
export function exampleGetGroundingInfo() {
  // Get memory system information
  const ragMemory = getMemorySystem('rag');
  console.log('RAG Memory:', ragMemory?.description);
  console.log('Access Pattern:', ragMemory?.accessPattern);

  // Get asset source information
  const assetRegistry = getAssetSource('Asset Registry');
  console.log('Asset Registry Capabilities:', assetRegistry?.capabilities);

  // Get action information
  const queryAction = getAction('query_asset_registry');
  console.log('Query Asset Registry Parameters:', queryAction?.parameters);
  console.log('Returns:', queryAction?.returns);

  return {
    memory: ragMemory,
    asset: assetRegistry,
    action: queryAction
  };
}

/**
 * Example 5: Full grounding context for custom use
 */
export function exampleFullContext() {
  const context = generateGroundingContext({
    includeMemory: true,
    includeAssets: true,
    includeActions: true,
    includePrompts: true,
    businessName: "Example Corp"
  });

  // Use context to build custom prompts
  const memoryInfo = context.memory.systems
    .map(m => `- ${m.type}: ${m.description}`)
    .join('\n');

  const assetInfo = context.assets.sources
    .map(a => `- ${a.name}: ${a.description}`)
    .join('\n');

  const actionInfo = context.actions.available
    .map(a => `- ${a.name}: ${a.description}`)
    .join('\n');

  return {
    memoryInfo,
    assetInfo,
    actionInfo,
    fullContext: context
  };
}

/**
 * Example 6: Conditional grounding based on task
 */
export async function exampleConditionalGrounding(task: string) {
  let grounding: GroundingOptions = {
    includeMemory: true
  };

  // Add assets for data queries
  if (task.includes('query') || task.includes('data') || task.includes('metrics')) {
    grounding.includeAssets = true;
  }

  // Add actions for operations
  if (task.includes('create') || task.includes('update') || task.includes('schedule')) {
    grounding.includeActions = true;
  }

  // Add prompts for complex tasks
  if (task.includes('analyze') || task.includes('report')) {
    grounding.includePrompts = true;
  }

  const response = await runModel({
    prompt: task,
    system: "You are a helpful assistant.",
    grounding
  });

  return response.content;
}

/**
 * Example 7: Multi-tenant grounding
 */
export async function exampleMultiTenant(tenantId: string, businessName: string) {
  const grounding: GroundingOptions = {
    includeMemory: true,
    includeAssets: true,
    includeActions: true,
    businessName
  };

  const systemPrompt = generateGroundedSystemPrompt({
    basePrompt: `You are an assistant for ${businessName}. All queries are automatically filtered by tenant.`,
    ...grounding
  });

  const response = await runModel({
    prompt: "Show me our asset inventory",
    system: systemPrompt
  });

  return response.content;
}

