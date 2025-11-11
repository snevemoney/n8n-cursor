import { z } from 'zod';
import type { ToolSpec } from '../types';

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

// Import user tools
import { userTools, getUserTool, executeUserTool, isUserTool, getUserToolBySlashCommand } from './user-tools';

/**
 * Tools registry - all available tools for Chat-AGI (AI-callable)
 */
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
export function detectUserTool(message: string): { tool: any; argsText: string } | null {
  if (!message || typeof message !== 'string') {
    return null;
  }
  
  try {
    const lowerMessage = message.toLowerCase().trim();
    
    // Check for slash commands first
    if (lowerMessage.startsWith('/')) {
      const slashCommand = lowerMessage.split(' ')[0];
      const tool = getUserToolBySlashCommand(slashCommand);
      if (tool) {
        return { tool, argsText: message.slice(slashCommand.length).trim() };
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
 * List all available tools
 */
export function listTools(): ToolSpec[] {
  return Object.values(tools).map(({ handler, ...spec }) => spec);
}

/**
 * Execute a tool (AI-callable or user tool)
 */
export async function executeTool(name: string, args: any): Promise<any> {
  // Check if it's a user tool
  if (isUserTool(name)) {
    return executeUserTool(name, args);
  }
  
  // Otherwise, it's an AI-callable tool
  const tool = getTool(name);
  
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  
  // Validate args
  try {
    tool.schema.parse(args);
  } catch (error: any) {
    throw new Error(`Invalid arguments for ${name}: ${error.message}`);
  }
  
  // Execute with timeout
  const timeout = 60000; // 60s
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Tool execution timeout')), timeout);
  });
  
  return Promise.race([
    tool.handler(args),
    timeoutPromise,
  ]);
}

// Re-export user tool functions
export { userTools, getUserTool, executeUserTool, isUserTool, listUserTools, getUserToolBySlashCommand } from './user-tools';

