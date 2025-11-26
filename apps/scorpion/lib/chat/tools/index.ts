import { z } from 'zod';
import type { ToolSpec } from '../types';
import { validateToolResult, normalizeErrorResult } from './contract';

// Import individual tools
import * as research from './research';
import * as knowledge from './knowledge';
import * as workflows from './workflows';
import * as logs from './logs';
import * as notifications from './notifications';
import * as agentDeploy from './agent-deploy';
import * as systemHealth from './system-health';
import * as projectAnalyze from './project-analyze';
import * as backupCreate from './backup-create';
import * as code from './code';
import * as llmTrain from './llm-train';
import * as llmEvaluate from './llm-evaluate';
import * as files from './files';
import * as knowledgeList from './knowledge-list';
import * as agentsList from './agents-list';
import * as workflowsList from './workflows-list';
import * as statsGet from './stats-get';
import * as notificationsList from './notifications-list';
import * as projectStatus from './project-status';
import * as operationsList from './operations-list';
import * as workflowsGet from './workflows-get';
import * as agentsGet from './agents-get';
import * as knowledgeGet from './knowledge-get';
import * as settingsGet from './settings-get';
import * as ontologySearch from './ontology-search';
import * as researchStart from './research-start';
import * as llmExperimentsList from './llm-experiments-list';
import * as llmModelsCompare from './llm-models-compare';
import * as ocr from './ocr';
import * as llamacppWebui from './llamacpp-webui';

// Import user tools
import { userTools, getUserTool, executeUserTool, isUserTool, getUserToolBySlashCommand } from './user-tools';

// Import metadata utilities
import { getToolMetadata } from './metadata';

/**
 * Tools registry - all available tools for Chat-AGI (AI-callable)
 */
const debugEcho: ToolSpec & { handler: (args: any) => Promise<any> } = {
  name: "debug.echo",
  label: "Debug Echo",
  description: "Echoes back the given message, used for testing tool wiring.",
  category: "debug",
  status: "stable",
  schema: z.object({
    message: z.string().describe("Message to echo back"),
  }),
  handler: async ({ message }: { message: string }) => {
    return {
      ok: true,
      data: {
        echoed: message,
        timestamp: new Date().toISOString(),
      },
    };
  },
};
export const tools: Record<string, ToolSpec & { handler: (args: any) => Promise<any> }> = {
  'research.run': research,
  'kb.search': knowledge,
  'workflows.trigger': workflows,
  'logs.tail': logs,
  'notifications.post': notifications,
  'agent.deploy': agentDeploy,
  'system.health': systemHealth,
  'project.analyze': projectAnalyze,
  'backup.create': backupCreate,
  'code.readFile': code,
  'llm.train': llmTrain,
  'llm.evaluate': llmEvaluate,
  'files.recent': files,
  'knowledge.list': knowledgeList,
  'agents.list': agentsList,
  'workflows.list': workflowsList,
  'stats.get': statsGet,
  'notifications.list': notificationsList,
  'project.status': projectStatus,
  'operations.list': operationsList,
  'workflows.get': workflowsGet,
  'agents.get': agentsGet,
  'knowledge.get': knowledgeGet,
  'settings.get': settingsGet,
  'ontology.search': ontologySearch,
  'research.start': researchStart,
  'llm.experiments.list': llmExperimentsList,
  'llm.models.compare': llmModelsCompare,
  'ocr.extract': ocr,
  'llamacpp.webui': llamacppWebui,
  'debug.echo': debugEcho,
};

/**
 * All tools (AI + User tools) - for reference
 */
export const allTools = {
  ...tools,
  ...userTools,
};

/**
 * Detect user tool from natural language command
 * Recognizes commands like "create image", "generate image", "make image" → user.image
 */
export function detectUserTool(message: string): { tool: any; argsText: string; isAiTool?: boolean } | null {
  if (!message || typeof message !== 'string') {
    return null;
  }

  try {
    const lowerMessage = message.toLowerCase().trim();

    // Check for slash commands first (both user tools and AI-callable tools)
    if (lowerMessage.startsWith('/')) {
      const slashCommand = lowerMessage.split(' ')[0];
      const slashCommandName = slashCommand.slice(1); // Remove leading '/'
      
      // First, try to find in user tools
      const userTool = getUserToolBySlashCommand(slashCommand);
      if (userTool) {
        return { tool: userTool, argsText: message.slice(slashCommand.length).trim(), isAiTool: false };
      }
      
      // Then, try to find in AI-callable tools registry (e.g., /debug.echo → debug.echo)
      const aiTool = tools[slashCommandName];
      if (aiTool) {
        return { tool: aiTool, argsText: message.slice(slashCommand.length).trim(), isAiTool: true };
      }
    }

    // Natural language detection patterns
    const patterns: Array<{
      keywords: string[];
      toolName: string;
      extractArgs?: (msg: string) => string;
    }> = [
        {
          keywords: ['create image', 'generate image', 'make image', 'design image', 'draw image', 'image generation', 'create a image', 'generate a image'],
          toolName: 'user.image',
          extractArgs: (msg) => {
            // Extract prompt after action words
            const match = msg.match(/(?:create|generate|make|design|draw)\s+(?:an?\s+)?image\s+(?:of|with|showing|depicting)?\s*(.+)/i);
            return match ? match[1].trim() : '';
          }
        },
        {
          keywords: ['transcribe', 'transcription', 'convert audio', 'audio to text', 'speech to text', 'extract transcript'],
          toolName: 'user.transcribe',
        },
        {
          keywords: ['create design', 'design layout', 'design spec', 'create layout'],
          toolName: 'user.design',
        },
        {
          keywords: ['summarize', 'create summary', 'make summary'],
          toolName: 'user.summarize',
        },
        {
          keywords: ['marketing copy', 'ad copy', 'create marketing'],
          toolName: 'user.marketing',
        },
        {
          keywords: ['generate copy', 'create copy', 'ad copy'],
          toolName: 'user.copy',
        },
        {
          keywords: ['seo article', 'seo content', 'landing page'],
          toolName: 'user.seo',
        },
        {
          keywords: ['deep research', 'research deep', 'conduct research'],
          toolName: 'user.research',
        },
        {
          keywords: ['storyboard', 'video script', 'create storyboard'],
          toolName: 'user.storyboard',
        },
      ];

    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword)) {
          const tool = userTools[pattern.toolName as keyof typeof userTools];
          if (tool && (tool as any).implemented !== false) {
            const argsText = pattern.extractArgs ? pattern.extractArgs(message) : message.replace(new RegExp(keyword, 'i'), '').trim();
            return { tool, argsText };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[detectUserTool] Error detecting tool:', error);
    return null;
  }
}


/**
 * Get tool by name
 */
export function getTool(name: string) {
  return tools[name];
}


/**
 * List all available tools with metadata
 */
export function listTools(): Array<ToolSpec & { metadata?: import('./metadata').ToolMetadata | null }> {
  // Import metadata utilities - done at module level below
  return Object.values(tools).map(({ handler, ...spec }) => ({
    ...spec,
    metadata: getToolMetadata(spec.name),
  }));
}

// Export metadata utilities
export { getToolMetadata, getToolsWithMetadata, getToolsByCategory, getToolsByStatus, getToolsByUsage } from './metadata';
export type { ToolMetadata, ToolCategory, ToolStatus, ToolUsage } from './metadata';

/**
 * Execute a tool (AI-callable or user tool)
 * Enforces consistent {ok, data, sources?, ms, error?} schema
 */
export async function executeTool(name: string, args: any): Promise<any> {
  const startTime = Date.now();

  // Check if it's a user tool
  if (isUserTool(name)) {
    try {
      const result = await executeUserTool(name, args);
      return validateToolResult(result, name, startTime);
    } catch (error: any) {
      return normalizeErrorResult(error, name, startTime);
    }
  }

  // Otherwise, it's an AI-callable tool
  const tool = getTool(name);

  if (!tool) {
    return normalizeErrorResult(new Error(`Tool not found: ${name}`), name, startTime);
  }

  // Validate args
  try {
    tool.schema.parse(args);
  } catch (error: any) {
    return normalizeErrorResult(new Error(`Invalid arguments for ${name}: ${error.message}`), name, startTime);
  }

  // Execute with timeout (configurable per tool, default 60s)
  // For research.run: use RESEARCH_MAX_WAIT_MS (default 180s) or disable timeout entirely
  let timeout = 60000; // Default 60s for most tools

  if (name === 'research.run') {
    // Research tool: use environment variable or allow infinite wait
    const maxWait = parseInt(process.env.RESEARCH_MAX_WAIT_MS || '0', 10);
    if (maxWait === 0) {
      // 0 means no timeout - research can run indefinitely
      timeout = Infinity;
    } else {
      timeout = maxWait;
    }
  }

  // If timeout is Infinity, skip the timeout wrapper
  if (!isFinite(timeout)) {
    try {
      const result = await tool.handler(args);
      return validateToolResult(result, name, startTime);
    } catch (error: any) {
      return normalizeErrorResult(error, name, startTime);
    }
  }

  // Otherwise use Promise.race with timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tool execution timeout')), timeout);
  });

  try {
    const result = await Promise.race([
      tool.handler(args),
      timeoutPromise,
    ]);
    return validateToolResult(result, name, startTime);
  } catch (error: any) {
    return normalizeErrorResult(error, name, startTime);
  }
}

// Re-export user tool functions
export { userTools, getUserTool, executeUserTool, isUserTool, listUserTools, getUserToolBySlashCommand } from './user-tools';

