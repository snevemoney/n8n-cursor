import { z } from 'zod';
import type { ToolSpec } from '../../types';

// Import user tools
import * as tutorial from './tutorial';
import * as translate from './translate';
import * as contentAssistant from './content-assistant';
import * as searchAssistant from './search-assistant';
import * as summarize from './summarize';
import * as grammar from './grammar';
import * as design from './design';
import * as simplify from './simplify';
import * as transcribe from './transcribe';
import * as presentation from './presentation';
import * as workflowAuto from './workflow-auto';
import * as videoClip from './video-clip';
import * as storyboard from './storyboard';
import * as researchEngine from './research-engine';
import * as seoWriter from './seo-writer';
import * as mediaEditor from './media-editor';
import * as marketing from './marketing';
import * as purposefulSearch from './purposeful-search';
import * as copyGenerator from './copy-generator';
import * as imageGen from './image-gen';

/**
 * User tools registry - user-triggered tools (not AI-callable)
 * These tools are executed directly when user invokes them via slash command or UI
 * 
 * Tools marked with `implemented: false` are incomplete and will be hidden from the UI
 */
export const userTools: Record<string, ToolSpec & { handler: (args: any) => Promise<any>; userTool: true; implemented?: boolean }> = {
  'user.tutorial': { ...tutorial, userTool: true, implemented: true },
  'user.translate': { ...translate, userTool: true, implemented: true }, // ✅ Implemented with AI translation
  'user.content': { ...contentAssistant, userTool: true, implemented: true },
  'user.search': { ...searchAssistant, userTool: true, implemented: true },
  'user.summarize': { ...summarize, userTool: true, implemented: true },
  'user.grammar': { ...grammar, userTool: true, implemented: true }, // ✅ Implemented with structured suggestions parsing
  'user.design': { ...design, userTool: true, implemented: true },
  'user.simplify': { ...simplify, userTool: true, implemented: true }, // ✅ Implemented with structured changes extraction
  'user.transcribe': { ...transcribe, userTool: true, implemented: true }, // ✅ Implemented with OpenAI Whisper
  'user.presentation': { ...presentation, userTool: true, implemented: false }, // TODO: Parse into structured JSON
  'user.workflow': { ...workflowAuto, userTool: true, implemented: false }, // TODO: Parse and validate JSON
  'user.video-clip': { ...videoClip, userTool: true, implemented: false }, // TODO: Implement video analysis
  'user.storyboard': { ...storyboard, userTool: true, implemented: true },
  'user.research': { ...researchEngine, userTool: true, implemented: true },
  'user.seo': { ...seoWriter, userTool: true, implemented: true },
  'user.media-edit': { ...mediaEditor, userTool: true, implemented: false }, // TODO: Implement media editing
  'user.marketing': { ...marketing, userTool: true, implemented: true },
  'user.purposeful-search': { ...purposefulSearch, userTool: true, implemented: true },
  'user.copy': { ...copyGenerator, userTool: true, implemented: true },
  'user.image': { ...imageGen, userTool: true, implemented: true }, // ✅ Implemented with OpenAI DALL-E
};

/**
 * Get user tool by name
 */
export function getUserTool(name: string) {
  return userTools[name];
}

/**
 * List all available user tools (only implemented tools by default)
 */
export function listUserTools(includeUnimplemented: boolean = false): Array<ToolSpec & { slashCommand: string; category: string; icon: string; implemented?: boolean }> {
  return Object.values(userTools)
    .filter(tool => includeUnimplemented || tool.implemented !== false)
    .map(({ handler, userTool, implemented, ...spec }) => ({
      ...spec,
      slashCommand: getSlashCommand(spec.name),
      category: getCategory(spec.name),
      icon: getIcon(spec.name),
      implemented: implemented !== false,
    }));
}

/**
 * Get user tool metadata by slash command
 */
export function getUserToolMetadataBySlashCommand(cmd: string) {
  for (const [name, tool] of Object.entries(userTools)) {
    if (getSlashCommand(name) === cmd) {
      return {
        ...tool,
        slashCommand: getSlashCommand(name),
        category: getCategory(name),
        icon: getIcon(name),
      };
    }
  }
  return null;
}

/**
 * Get slash command for a user tool
 */
function getSlashCommand(toolName: string): string {
  const mapping: Record<string, string> = {
    'user.tutorial': '/tutorial',
    'user.translate': '/translate',
    'user.content': '/content',
    'user.search': '/search',
    'user.summarize': '/summarize',
    'user.grammar': '/grammar',
    'user.design': '/design',
    'user.simplify': '/simplify',
    'user.transcribe': '/transcribe',
    'user.presentation': '/presentation',
    'user.workflow': '/workflow',
    'user.video-clip': '/video-clip',
    'user.storyboard': '/storyboard',
    'user.research': '/research-deep',
    'user.seo': '/seo',
    'user.media-edit': '/media-edit',
    'user.marketing': '/marketing',
    'user.purposeful-search': '/purposeful-search',
    'user.copy': '/copy',
    'user.image': '/image',
  };
  return mapping[toolName] || `/${toolName.replace('user.', '')}`;
}

/**
 * Get category for a user tool
 */
function getCategory(toolName: string): string {
  const categories: Record<string, string> = {
    'user.tutorial': 'media',
    'user.translate': 'content',
    'user.content': 'content',
    'user.search': 'research',
    'user.summarize': 'content',
    'user.grammar': 'content',
    'user.design': 'design',
    'user.simplify': 'content',
    'user.transcribe': 'media',
    'user.presentation': 'content',
    'user.workflow': 'automation',
    'user.video-clip': 'media',
    'user.storyboard': 'media',
    'user.research': 'research',
    'user.seo': 'content',
    'user.media-edit': 'media',
    'user.marketing': 'content',
    'user.purposeful-search': 'research',
    'user.copy': 'content',
    'user.image': 'design',
  };
  return categories[toolName] || 'content';
}

/**
 * Get icon for a user tool
 */
function getIcon(toolName: string): string {
  const icons: Record<string, string> = {
    'user.tutorial': '📹',
    'user.translate': '🌐',
    'user.content': '✍️',
    'user.search': '🔍',
    'user.summarize': '📝',
    'user.grammar': '✓',
    'user.design': '🎨',
    'user.simplify': '📖',
    'user.transcribe': '🎤',
    'user.presentation': '📊',
    'user.workflow': '⚙️',
    'user.video-clip': '✂️',
    'user.storyboard': '🎬',
    'user.research': '🔬',
    'user.seo': '📈',
    'user.media-edit': '🎞️',
    'user.marketing': '💼',
    'user.purposeful-search': '🌱',
    'user.copy': '📋',
    'user.image': '🖼️',
  };
  return icons[toolName] || '🔧';
}

/**
 * Execute a user tool
 */
export async function executeUserTool(name: string, args: any): Promise<any> {
  const tool = getUserTool(name);
  
  if (!tool) {
    throw new Error(`User tool not found: ${name}`);
  }
  
  // Validate and parse args (applies defaults)
  let parsedArgs: any;
  try {
    parsedArgs = tool.schema.parse(args);
  } catch (error: any) {
    throw new Error(`Invalid arguments for ${name}: ${error.message}`);
  }
  
  // Execute with timeout
  const timeout = 300000; // 5 minutes for user tools (longer than AI tools)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('User tool execution timeout')), timeout);
  });
  
  return Promise.race([
    tool.handler(parsedArgs),
    timeoutPromise,
  ]);
}

/**
 * Check if a tool name is a user tool
 */
export function isUserTool(toolName: string): boolean {
  return toolName.startsWith('user.') && userTools.hasOwnProperty(toolName);
}

/**
 * Get user tool by slash command
 */
export function getUserToolBySlashCommand(cmd: string): (ToolSpec & { handler: (args: any) => Promise<any>; userTool: true; label: string }) | null {
  for (const [name, tool] of Object.entries(userTools)) {
    if (getSlashCommand(name) === cmd) {
      return tool as typeof tool & { label: string };
    }
  }
  return null;
}

