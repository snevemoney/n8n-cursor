/**
 * OpenAI Function Calling Integration
 * Bridges OpenAI function calling with Scorpion's existing tool system
 * 
 * HYBRID APPROACH: Use OpenAI function calling when available, fallback to existing tool system
 */

import { getOpenAIService, isOpenAIAvailable, FunctionDefinition } from '@scorpion/core/llm';
import { tools, allTools } from './tools';
import { ToolSpec } from './types';

/**
 * Convert Scorpion tool specs to OpenAI function definitions
 */
export function convertToolsToFunctions(toolSpecs: Record<string, ToolSpec & { handler?: any }>): FunctionDefinition[] {
  return Object.entries(toolSpecs).map(([name, tool]) => ({
    name,
    description: tool.description,
    parameters: tool.schema._def || {
      type: 'object',
      properties: {},
      required: [],
    },
  }));
}

/**
 * Execute a tool call from OpenAI function calling
 */
export async function executeToolCall(
  toolName: string,
  args: Record<string, any>
): Promise<{ result: any; error?: string }> {
  try {
    const tool = allTools[toolName];
    
    if (!tool) {
      return {
        result: null,
        error: `Tool ${toolName} not found`,
      };
    }

    if (!tool.handler) {
      return {
        result: null,
        error: `Tool ${toolName} has no handler`,
      };
    }

    // Validate args against schema
    const parsed = tool.schema.parse(args);
    
    // Execute tool
    const result = await tool.handler(parsed);
    
    return { result };
  } catch (error: any) {
    return {
      result: null,
      error: error.message || 'Tool execution failed',
    };
  }
}

/**
 * Get OpenAI function definitions for available tools
 * Filters to only AI-callable tools (excludes user tools)
 */
export function getOpenAIFunctions(): FunctionDefinition[] {
  return convertToolsToFunctions(tools);
}

/**
 * Check if OpenAI function calling should be used
 */
export function shouldUseOpenAIFunctionCalling(): boolean {
  return isOpenAIAvailable() && process.env.USE_OPENAI_FUNCTION_CALLING !== 'false';
}

