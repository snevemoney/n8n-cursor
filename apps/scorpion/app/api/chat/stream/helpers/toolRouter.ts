// apps/scorpion/app/api/chat/stream/helpers/toolRouter.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Check return values

/**
 * Deterministic fallback routing for critical intents
 * Used when LLM-based tool router fails or for critical system queries
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 6: Always returns a value (or null)
 */
export function fallbackRoute(userMessage: string): { intent: string; tools: string[] } | null {
  // Power of 10 Rule 4: Assertions
  if (!userMessage || typeof userMessage !== 'string') {
    return null;
  }

  const text = userMessage.toLowerCase();
  
  // System health queries
  if (text.includes('system health') || text.includes('health check') || text.includes('test system health')) {
    return { intent: 'system_debug', tools: ['system.health', 'stats.get'] };
  }
  
  // Log viewing queries
  if ((text.includes('logs') && text.includes('tail')) || text.startsWith('tail logs') || text.includes('show logs')) {
    return { intent: 'system_debug', tools: ['logs.tail'] };
  }
  
  // Project status queries
  if (text.includes('project status') || text.includes('project health')) {
    return { intent: 'system_debug', tools: ['project.status', 'system.health'] };
  }
  
  return null;
}

