/**
 * llama.cpp Web UI Tool
 * Opens llama.cpp Web UI for local model experimentation
 */

import { z } from 'zod';
import type { ToolSpec } from '../types';
import { validateToolResult, normalizeErrorResult } from './contract';

export const name = 'llamacpp.webui';
export const label = 'Llama.cpp Web UI';
export const description = 'Open llama.cpp Web UI for interactive local model experimentation and debugging';

export const schema = z.object({
  // No parameters needed - just opens the UI
});

export async function handler(args: z.infer<typeof schema>): Promise<ToolSpec['handler'] extends (...args: any[]) => Promise<infer R> ? R : never> {
  try {
    const llamacppUrl = process.env.LLAMACPP_BASE_URL || 'http://localhost:8033';
    const isEnabled = process.env.LLAMACPP_ENABLED === 'true' || !!process.env.LLAMACPP_BASE_URL;
    
    if (!isEnabled) {
      return validateToolResult({
        ok: false,
        error: 'llama.cpp is not enabled. Set LLAMACPP_ENABLED=true or LLAMACPP_BASE_URL in your environment.',
      });
    }
    
    return validateToolResult({
      ok: true,
      data: {
        url: llamacppUrl,
        message: `llama.cpp Web UI is available at ${llamacppUrl}`,
        instructions: 'Open this URL in your browser to access the llama.cpp Web UI for interactive model experimentation.',
        features: [
          'Interactive chat interface',
          'Model settings (temperature, context, etc.)',
          'Token statistics and performance metrics',
          'Reasoning/thinking visualization (for thinking models)',
          'Context usage monitoring',
        ],
      },
    });
  } catch (error: any) {
    return normalizeErrorResult(error, 'llamacpp.webui');
  }
}

