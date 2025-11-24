// Tool Layer v2: Comprehensive tool registration with metadata, tags, timeouts, retries, and lite mode

import { toolRegistry } from "./tool-registry";
import { tools } from "../chat/tools/index";

/**
 * Tool Layer v2: Tool metadata definitions
 * Each tool has:
 * - tags: for routing and filtering
 * - timeoutMs: maximum execution time
 * - maxRetries: number of retry attempts
 * - enabledInLiteMode: whether tool works in lightweight mode (8GB systems)
 */
const TOOL_METADATA: Record<string, {
  tags: string[];
  timeoutMs: number;
  maxRetries: number;
  enabledInLiteMode: boolean;
}> = {
  // Research tools - browser-based DuckDuckGo search (NO API KEYS NEEDED)
  'research.run': {
    tags: ['research', 'browser', 'medium'],
    timeoutMs: 0, // No timeout - let research complete naturally, stream incremental results
    maxRetries: 1,
    enabledInLiteMode: true, // Uses browser-based DuckDuckGo, works on all systems
  },
  'research.start': {
    tags: ['research', 'browser', 'heavy'],
    timeoutMs: 30_000,
    maxRetries: 1,
    enabledInLiteMode: false,
  },
  
  // Knowledge base - light, fast, enabled in lite mode
  'kb.search': {
    tags: ['kb', 'light'],
    timeoutMs: 5_000, // 5s - should be fast
    maxRetries: 1,
    enabledInLiteMode: true,
  },
  'knowledge.list': {
    tags: ['kb', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'knowledge.get': {
    tags: ['kb', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'ontology.search': {
    tags: ['kb', 'light'],
    timeoutMs: 5_000,
    maxRetries: 1,
    enabledInLiteMode: true,
  },
  
  // System & ops tools - light, enabled in lite mode
  'system.health': {
    tags: ['system', 'ops', 'light'],
    timeoutMs: 15_000, // Increased from 3s to 15s - system health can take time
    maxRetries: 1, // Allow one retry
    enabledInLiteMode: true,
  },
  'logs.tail': {
    tags: ['logs', 'ops', 'light'],
    timeoutMs: 15_000, // Increased from 5s to 15s - log retrieval can take time
    maxRetries: 1, // Allow one retry
    enabledInLiteMode: true,
  },
  'project.status': {
    tags: ['ops', 'system', 'light'],
    timeoutMs: 5_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'project.analyze': {
    tags: ['ops', 'system', 'heavy'],
    timeoutMs: 30_000,
    maxRetries: 1,
    enabledInLiteMode: false, // Can be CPU intensive
  },
  'operations.list': {
    tags: ['ops', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'stats.get': {
    tags: ['ops', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  
  // Workflow tools - medium weight
  'workflows.trigger': {
    tags: ['ops', 'other'],
    timeoutMs: 30_000,
    maxRetries: 1,
    enabledInLiteMode: true,
  },
  'workflows.list': {
    tags: ['ops', 'light'],
    timeoutMs: 5_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'workflows.get': {
    tags: ['ops', 'light'],
    timeoutMs: 5_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  
  // Agent tools - medium to heavy
  'agent.deploy': {
    tags: ['ops', 'heavy'],
    timeoutMs: 60_000,
    maxRetries: 1,
    enabledInLiteMode: false, // Deployment can be heavy
  },
  'agents.list': {
    tags: ['ops', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'agents.get': {
    tags: ['ops', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  
  // File & code tools - light to medium
  'code.readFile': {
    tags: ['files', 'ops', 'light'],
    timeoutMs: 5_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'files.recent': {
    tags: ['files', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'ocr.extract': {
    tags: ['files', 'heavy'],
    timeoutMs: 30_000,
    maxRetries: 1,
    enabledInLiteMode: false, // OCR can be CPU intensive
  },
  
  // LLM tools - heavy, disabled in lite mode
  'llm.train': {
    tags: ['llm', 'heavy'],
    timeoutMs: 300_000, // 5 minutes
    maxRetries: 0,
    enabledInLiteMode: false,
  },
  'llm.evaluate': {
    tags: ['llm', 'heavy'],
    timeoutMs: 120_000, // 2 minutes
    maxRetries: 0,
    enabledInLiteMode: false,
  },
  'llm.experiments.list': {
    tags: ['llm', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  'llm.models.compare': {
    tags: ['llm', 'heavy'],
    timeoutMs: 60_000,
    maxRetries: 1,
    enabledInLiteMode: false,
  },
  
  // Notification tools - light
  'notifications.post': {
    tags: ['ops', 'light'],
    timeoutMs: 3_000,
    maxRetries: 1,
    enabledInLiteMode: true,
  },
  'notifications.list': {
    tags: ['ops', 'light'],
    timeoutMs: 3_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  
  // Backup tools - medium
  'backup.create': {
    tags: ['ops', 'heavy'],
    timeoutMs: 120_000, // 2 minutes
    maxRetries: 1,
    enabledInLiteMode: false, // Can be I/O intensive
  },
  
  // Settings tools - light
  'settings.get': {
    tags: ['ops', 'light'],
    timeoutMs: 2_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
  
  // llama.cpp Web UI tool - light, enabled in lite mode
  'llamacpp.webui': {
    tags: ['llm', 'ui', 'light'],
    timeoutMs: 1_000,
    maxRetries: 0,
    enabledInLiteMode: true,
  },
};

// Check if research API keys are available
function hasResearchKeys(): boolean {
  return !!(
    process.env.TAVILY_API_KEY ||
    process.env.NEWS_API_KEY ||
    process.env.SERPAPI_KEY
  );
}

// Register all tools with their tags
export function registerAllTools() {
  console.log('[Tool Registry] Starting Tool Layer v2 registration, available tools:', Object.keys(tools || {}));
  
  const hasResearchKeysAvailable = hasResearchKeys();
  if (!hasResearchKeysAvailable) {
    console.log('[Tool Registry] ⚠️ No research API keys found - research.run and research.start will be disabled');
  }
  
  let registeredCount = 0;
  let skippedCount = 0;
  let disabledCount = 0;
  
  // Register each tool with metadata
  for (const [toolName, tool] of Object.entries(tools || {})) {
    if (!tool || !tool.handler) {
      console.warn(`[Tool Registry] Tool ${toolName} missing handler, skipping`);
      skippedCount++;
      continue;
  }

    // NOTE: research.run uses browser-based DuckDuckGo (no API keys needed)
    // Only skip research.start if no API keys (legacy tool)
    if (toolName === 'research.start' && !hasResearchKeysAvailable) {
      console.log(`[Tool Registry] Skipping ${toolName} - no research API keys configured (legacy tool)`);
      disabledCount++;
      continue; // Don't register at all
    }
    
    const metadata = TOOL_METADATA[toolName];
    if (!metadata) {
      console.warn(`[Tool Registry] Tool ${toolName} missing metadata, using defaults`);
      // Use safe defaults for unknown tools
    toolRegistry.register({
        name: toolName as any,
        tags: ['other'],
        description: tool.description || `Tool: ${toolName}`,
        run: tool.handler,
        metadata: {
          timeoutMs: 30_000,
          maxRetries: 0,
          enabledInLiteMode: true, // Default to enabled for safety
        },
      });
      registeredCount++;
      continue;
    }
    
    toolRegistry.register({
      name: toolName as any,
      tags: metadata.tags as any[],
      description: tool.description || `Tool: ${toolName}`,
      run: tool.handler,
      metadata: {
        timeoutMs: metadata.timeoutMs,
        maxRetries: metadata.maxRetries,
        enabledInLiteMode: metadata.enabledInLiteMode,
      },
    });
    
    registeredCount++;
  }

  const totalAvailable = toolRegistry.all(false).length; // Count all, including disabled
  const availableInLiteMode = toolRegistry.all(true).length;
  
  console.log(`[Tool Registry] Tool Layer v2 registration complete:`);
  console.log(`  - Registered: ${registeredCount} tools`);
  console.log(`  - Skipped: ${skippedCount} tools`);
  console.log(`  - Disabled (no keys): ${disabledCount} tools`);
  console.log(`  - Total available: ${totalAvailable} tools`);
  console.log(`  - Available in lite mode: ${availableInLiteMode} tools`);
  
  if (registeredCount === 0) {
    console.error('[Tool Registry] WARNING: No tools registered! Check if tools are available.');
  }
}

// Call this during app initialization
registerAllTools();

