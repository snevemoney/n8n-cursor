/**
 * FRONTIER-LEVEL: Intent-specific summarizer configuration
 * Ensures each intent gets the right summarizer prompt
 */

import type { ScorpionIntent } from './types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Get the summarizer prompt path for a given intent
 */
export function getSummarizerPromptPath(intent: ScorpionIntent): string {
  // Intent-specific prompts
  const intentPrompts: Record<ScorpionIntent, string> = {
    system_debug: 'summarizer.system.system_debug.txt',
    project_help: 'summarizer.system.project_help.txt',
    general_question: 'summarizer.system.txt',
    small_talk: 'summarizer.system.txt',
    identity: 'summarizer.system.txt',
    other: 'summarizer.system.txt',
  };

  return intentPrompts[intent] || 'summarizer.system.txt';
}

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();
  
  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }
  
  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }
  
  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);
  
  return fallbackPath;
}

/**
 * Get summarizer prompt content for a given intent
 * Falls back to default if intent-specific prompt doesn't exist
 */
export function getSummarizerPrompt(intent: ScorpionIntent): string {
  const promptFilename = getSummarizerPromptPath(intent);
  const promptPath = getPromptPath(promptFilename);
  
  // Try intent-specific prompt first
  if (existsSync(promptPath)) {
    try {
      const content = readFileSync(promptPath, 'utf-8');
      if (content && content.trim().length > 0) {
        if (intent === 'system_debug') {
          console.log('[Summarizer] Using intent-specific prompt for system_debug');
        }
        return content;
      }
    } catch (error: any) {
      console.warn(`[Summarizer] Failed to read intent-specific prompt ${promptFilename}:`, error.message);
    }
  }
  
  // Fallback to default
  const defaultPath = getPromptPath('summarizer.system.txt');
  if (existsSync(defaultPath)) {
    if (intent === 'system_debug') {
      console.warn(`[Summarizer] Intent-specific prompt not found: ${promptFilename}, using default`);
    }
    return readFileSync(defaultPath, 'utf-8');
  }
  
  throw new Error(`Summarizer prompt file not found: ${defaultPath}`);
}

