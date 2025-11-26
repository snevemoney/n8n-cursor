import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { safeExtractJson } from './jsonExtractor';
import { logPromptMetrics, estimateTokens, type PromptMetrics } from './metrics';

// Import tolerant parsing helpers (will be available in app context)
// These are optional - if not available, we'll use basic sanitization
let tolerantJsonHelpers: {
  tryParseJSON?: (raw: string) => any;
  sanitizeSafetyGuardResponse?: (data: any) => any;
  coerceExecutionStatus?: (raw: unknown) => 'success' | 'failed' | 'skipped';
} | null = null;

/**
 * Register tolerant JSON helpers from app context
 * Called once at startup to enable frontier-level parsing
 */
export function registerTolerantJsonHelpers(helpers: typeof tolerantJsonHelpers) {
  tolerantJsonHelpers = helpers;
}

/**
 * Load system prompt from apps/scorpion/lib/prompts/
 */
export async function loadSystemPrompt(name: string): Promise<string> {
  const cwd = process.cwd();
  
  // Try multiple paths
  const paths = [
    join(cwd, 'apps/scorpion/lib/prompts', name),
    join(cwd, 'lib/prompts', name),
    join(cwd.replace(/\/apps\/scorpion.*$/, ''), 'apps/scorpion/lib/prompts', name),
  ];
  
  for (const promptPath of paths) {
    if (existsSync(promptPath)) {
      const content = readFileSync(promptPath, 'utf-8');
      if (content && content.trim().length > 0) {
        return content;
      }
    }
  }
  
  throw new Error(`System prompt not found: ${name} (tried: ${paths.join(', ')})`);
}

/**
 * Run a specialized prompt with Zod validation
 * 
 * @param name - Prompt filename (e.g., 'safety-guard.system.txt')
 * @param input - Input data to pass as user message (will be JSON stringified)
 * @param schema - Zod schema for output validation
 * @param config - Model configuration
 * @param runModelFn - Function to run the model (injected dependency)
 * @returns Parsed and validated output
 */
export async function runPrompt<T>(
  name: string,
  input: unknown,
  schema: z.ZodSchema<T>,
  config: { provider: string; model: string; maxTokens?: number; temperature?: number },
  runModelFn: (systemPrompt: string, userPrompt: string, config: any) => Promise<string>
): Promise<T> {
  const startTime = Date.now();
  const promptName = name.replace('.system.txt', '').replace('summarizer.system.', 'summarizer.'); // Handle intent-specific prompts
  
  // Check feature flag
  const featureFlag = `SCORPION_ENABLE_${promptName.toUpperCase().replace(/-/g, '_')}`;
  if (process.env[featureFlag] === '0' || process.env[featureFlag] === 'false') {
    throw new Error(`Feature disabled: ${featureFlag}`);
  }
  
  try {
    // Load system prompt
    const sysPrompt = await loadSystemPrompt(name);
    
    // Format user input as JSON string
    const userInput = typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    
    // Run model
    const raw = await runModelFn(sysPrompt, userInput, config);
    
    // Extract JSON from response
    let json = safeExtractJson(raw);
    
    // FRONTIER-LEVEL: Pre-sanitize for safety-guard and executor to prevent enum failures
    if (promptName === 'safety-guard' && tolerantJsonHelpers?.sanitizeSafetyGuardResponse) {
      try {
        json = tolerantJsonHelpers.sanitizeSafetyGuardResponse(json);
        console.log(`[Prompt ${promptName}] Pre-sanitized safety guard response`);
      } catch (sanitizeError: any) {
        console.warn(`[Prompt ${promptName}] Sanitization failed, using raw JSON:`, sanitizeError.message);
      }
    } else if (promptName === 'executor' && tolerantJsonHelpers?.coerceExecutionStatus) {
      try {
        // Sanitize executor status field
        if (json && typeof json === 'object' && 'status' in json) {
          json = {
            ...json,
            status: tolerantJsonHelpers.coerceExecutionStatus(json.status),
          };
          console.log(`[Prompt ${promptName}] Pre-sanitized executor status`);
        }
      } catch (sanitizeError: any) {
        console.warn(`[Prompt ${promptName}] Sanitization failed, using raw JSON:`, sanitizeError.message);
      }
    }
    
    // Parse and validate with Zod
    const parsed = schema.safeParse(json);
    
    if (!parsed.success) {
      const latency = Date.now() - startTime;
      console.error(`[Prompt ${promptName}] Validation failed:`, parsed.error.format());
      throw new Error(`Bad ${promptName} JSON: ${parsed.error.message}`);
    }
    
    const latency = Date.now() - startTime;
    const tokens = estimateTokens(raw);
    console.log(`[Prompt ${promptName}] OK (${latency}ms, ${tokens} tokens)`);
    
    // Log metrics
    logPromptMetrics({
      prompt: promptName,
      latency_ms: latency,
      tokens,
      ok: true,
    });
    
    return parsed.data;
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[Prompt ${promptName}] Error (${latency}ms):`, error.message);
    
    // Log metrics with error details
    const validationErrors = error.message?.includes('Validation failed') || error.message?.includes('Bad')
      ? [error.message]
      : undefined;
    
    logPromptMetrics({
      prompt: promptName,
      latency_ms: latency,
      tokens: 0,
      ok: false,
      error: error.message,
      validation_errors: validationErrors,
    });
    
    throw error;
  }
}

/**
 * Run prompt with kill-switch: if parsing fails twice, skip and return null
 */
export async function runPromptWithKillSwitch<T>(
  name: string,
  input: unknown,
  schema: z.ZodSchema<T>,
  config: { provider: string; model: string; maxTokens?: number; temperature?: number },
  runModelFn: (systemPrompt: string, userPrompt: string, config: any) => Promise<string>,
  maxRetries: number = 2
): Promise<T | null> {
  let lastError: Error | null = null;
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await runPrompt(name, input, schema, config, runModelFn);
      
      // Log successful retry if it wasn't the first attempt
      if (attempt > 1) {
        const latency = Date.now() - startTime;
        logPromptMetrics({
          prompt: name.replace('.system.txt', ''),
          latency_ms: latency,
          ok: true,
          retry_count: attempt - 1,
        });
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`[Prompt ${name}] Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }
  
  // Kill-switch: skip this prompt and continue
  const latency = Date.now() - startTime;
  console.warn(`[Prompt ${name}] Kill-switch activated after ${maxRetries} failures, skipping`);
  
  // Log final failure metrics
  logPromptMetrics({
    prompt: name.replace('.system.txt', ''),
    latency_ms: latency,
    ok: false,
    error: lastError?.message || 'Kill-switch activated',
    retry_count: maxRetries,
  });
  
  return null;
}

