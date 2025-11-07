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

/**
 * Tools registry - all available tools for Chat-AGI
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
};

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
 * Execute a tool
 */
export async function executeTool(name: string, args: any): Promise<any> {
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

