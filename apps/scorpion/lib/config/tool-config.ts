/**
 * Tool Layer v2 Configuration
 * Centralized configuration for tool behavior, resource awareness, and lite mode
 */

import { detectLightweightMode } from '../utils/systemResources';

/**
 * Global lightweight mode flag
 * - Auto-detected based on system RAM (<=8GB)
 * - Can be overridden with CHAT_LIGHTWEIGHT_MODE env var
 * - Can be overridden with LIGHTWEIGHT_MODE env var
 */
export const LIGHTWEIGHT_MODE: boolean = (() => {
  // Explicit override via LIGHTWEIGHT_MODE (preferred)
  if (process.env.LIGHTWEIGHT_MODE !== undefined) {
    return process.env.LIGHTWEIGHT_MODE === 'true';
  }
  // Legacy override via CHAT_LIGHTWEIGHT_MODE
  if (process.env.CHAT_LIGHTWEIGHT_MODE !== undefined) {
    return process.env.CHAT_LIGHTWEIGHT_MODE === 'true';
  }
  // Auto-detect based on system resources
  return detectLightweightMode();
})();

/**
 * Disable browser-based tools (Playwright, browser pool, etc.)
 * Useful for systems with limited resources or when browser tools are unreliable
 */
export const DISABLE_BROWSER_TOOLS: boolean = 
  process.env.DISABLE_BROWSER_TOOLS === 'true' || LIGHTWEIGHT_MODE;

/**
 * Log configuration on module load
 */
if (LIGHTWEIGHT_MODE) {
  console.log('[Tool Config] LIGHTWEIGHT_MODE enabled - heavy tools will be disabled');
}
if (DISABLE_BROWSER_TOOLS) {
  console.log('[Tool Config] DISABLE_BROWSER_TOOLS enabled - browser-based tools will be disabled');
}

