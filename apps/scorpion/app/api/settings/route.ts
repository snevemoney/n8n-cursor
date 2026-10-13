import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { requireAuth } from '@/lib/security/auth';
import { z } from 'zod';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'scorpion', 'settings.json');

interface Settings {
  ollamaUrl: string;
  ollamaModel: string;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3.2:latest',
  autoRefresh: true,
  refreshInterval: 30,
  theme: 'dark',
  notifications: true,
  soundEnabled: false
};

const settingsSchema = z.object({
  ollamaUrl: z.string().url().optional(),
  ollamaModel: z.string().optional(),
  autoRefresh: z.boolean().optional(),
  refreshInterval: z.number().min(1).max(3600).optional(),
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  notifications: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  ragIndexing: z.boolean().optional(),
  autoTrigger: z.boolean().optional(),
  councilAutoContext: z.boolean().optional(),
  modelSource: z.string().optional(),
  openaiKey: z.string().optional(),
  entityRetention: z.string().optional(),
  ragModel: z.string().optional(),
  useOpenAIEmbeddings: z.boolean().optional(),
  useOpenAIFunctionCalling: z.boolean().optional(),
  maxAgents: z.number().min(1).max(16).optional(),
  requestTimeout: z.number().min(1000).max(120000).optional(),
}).passthrough();

/**
 * GET /api/settings - Load user settings
 */
export const GET = withErrorHandling(requireAuth(async () => {
  // Ensure directory exists
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  
  // Try to read existing settings
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const settings = JSON.parse(data);
    return createSuccessResponse(settings);
  } catch (error) {
    // File doesn't exist, return defaults
    return createSuccessResponse(DEFAULT_SETTINGS);
  }
}));

/**
 * POST /api/settings - Save user settings
 */
export const POST = withErrorHandling(requireAuth(async (request: NextRequest) => {
  const validation = await validateRequest(request, settingsSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const settings = validation.data;
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  
  // Merge with existing settings to preserve any we didn't send
  let existingSettings = DEFAULT_SETTINGS;
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    existingSettings = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, use defaults
  }
  
  const mergedSettings = {
    ...existingSettings,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  
  // Save to file
  await fs.writeFile(
    SETTINGS_FILE,
    JSON.stringify(mergedSettings, null, 2),
    'utf-8'
  );
  
  // Sync OpenAI settings to environment variables (if API key provided)
  if (settings.openaiKey) {
    process.env['OPENAI_API_KEY'] = settings.openaiKey;
  }
  if (settings.useOpenAIEmbeddings !== undefined) {
    process.env['USE_OPENAI_EMBEDDINGS'] = settings.useOpenAIEmbeddings ? 'true' : 'false';
  }
  if (settings.useOpenAIFunctionCalling !== undefined) {
    process.env['USE_OPENAI_FUNCTION_CALLING'] = settings.useOpenAIFunctionCalling ? 'true' : 'false';
  }
  
  return createSuccessResponse({
    settings: mergedSettings
  });
}));

/**
 * DELETE /api/settings - Reset to defaults
 */
export const DELETE = withErrorHandling(requireAuth(async () => {
  try {
    await fs.unlink(SETTINGS_FILE);
  } catch (error) {
    // File doesn't exist, that's fine
  }
  
  return createSuccessResponse({
    settings: DEFAULT_SETTINGS
  });
}));

