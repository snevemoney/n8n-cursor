// Tool Layer v2: Enhanced registry with metadata, timeouts, retries, and resource awareness

import { ToolName, ToolTags, ToolMetadata } from '../../server/types/tooling';
import { LIGHTWEIGHT_MODE, DISABLE_BROWSER_TOOLS } from '../config/tool-config';

export type ToolTag = ToolTags;

export type ToolMeta = {
  name: ToolName;
  tags: ToolTag[];
  description: string;
  run: Function;
  // Tool Layer v2: Metadata
  metadata?: {
    timeoutMs: number;
    maxRetries: number;
    enabledInLiteMode: boolean;
  };
};

const TOOLS: ToolMeta[] = [];

export const toolRegistry = {
  register: (t: ToolMeta) => {
    if (TOOLS.find(existing => existing.name === t.name)) {
      console.warn(`[Tool Registry] Tool ${t.name} already registered, skipping`);
      return;
    }
    TOOLS.push(t);
  },
  
  byTags: (tags: ToolTag[], respectLiteMode: boolean = true): string[] => {
    return TOOLS
      .filter(t => {
        // Filter by tags
        if (!tags.some(tag => t.tags.includes(tag))) {
          return false;
        }
        // Filter by lite mode if enabled
        if (respectLiteMode && LIGHTWEIGHT_MODE) {
          if (t.metadata?.enabledInLiteMode === false) {
            return false;
          }
        }
        // Filter by browser tools if disabled
        if (DISABLE_BROWSER_TOOLS && t.tags.includes('browser')) {
          return false;
        }
        return true;
      })
      .map(t => t.name);
  },
  
  all: (respectLiteMode: boolean = true): string[] => {
    return TOOLS
      .filter(t => {
        if (respectLiteMode && LIGHTWEIGHT_MODE) {
          if (t.metadata?.enabledInLiteMode === false) {
            return false;
          }
        }
        if (DISABLE_BROWSER_TOOLS && t.tags.includes('browser')) {
          return false;
        }
        return true;
      })
      .map(t => t.name);
  },
  
  get: (name: string): ToolMeta | undefined => {
    return TOOLS.find(t => t.name === name);
  },
  
  list: (respectLiteMode: boolean = true): ToolMeta[] => {
    return TOOLS.filter(t => {
      if (respectLiteMode && LIGHTWEIGHT_MODE) {
        if (t.metadata?.enabledInLiteMode === false) {
          return false;
        }
      }
      if (DISABLE_BROWSER_TOOLS && t.tags.includes('browser')) {
        return false;
  }
      return true;
    });
  },
  
  /**
   * Check if a tool is available (not disabled by lite mode or browser restrictions)
   */
  isAvailable: (name: string): boolean => {
    const tool = TOOLS.find(t => t.name === name);
    if (!tool) return false;
    
    if (LIGHTWEIGHT_MODE && tool.metadata?.enabledInLiteMode === false) {
      return false;
    }
    
    if (DISABLE_BROWSER_TOOLS && tool.tags.includes('browser')) {
      return false;
    }
    
    return true;
  }
};

// Tool Layer v2: Enhanced tag-based tool selection with smart routing
export function selectToolsByTags(objective: string): {
  tools: string[];
  rationale: string;
  matchedCount: number;
  installedCount: number;
} {
  const lower = objective.toLowerCase();
  
  // Enhanced intent detection for better tool routing
  const wantsResearch = /news|research|latest|summar(y|ise)|sources?|citations?|find|search|web|internet|online/.test(lower);
  const wantsKB = /doc|knowledge|kb|file|internal|document|rag|store/.test(lower);
  const wantsMath = /calculat|math|compute|solve|equation|formula/.test(lower);
  const wantsMedia = /image|video|audio|media|generate|create|picture|photo/.test(lower);
  const wantsDesign = /design|layout|ui|ux|mockup|prototype|wireframe/.test(lower);
  
  // System/debug queries
  const wantsSystem = /error|bug|issue|problem|crash|fail|health|status|system|debug|log/.test(lower);
  const wantsLogs = /log|tail|recent|history|trace|debug/.test(lower);
  
  // File/code queries
  const wantsFiles = /file|code|read|source|script|program|implementation/.test(lower);
  
  // Project/ops queries
  const wantsProject = /project|analyze|structure|status|operations|workflow|agent|deploy/.test(lower);
  
  // News-specific (should prefer news.search if available, but fallback to research.run)
  const wantsNews = /news|latest|recent|today|this week|this month/.test(lower);
  
  const primaryTags: ToolTag[] = [];
  const secondaryTags: ToolTag[] = [];
  
  // Primary intent detection
  if (wantsSystem || wantsLogs) {
    primaryTags.push("system");
    primaryTags.push("logs");
    primaryTags.push("ops");
  }
  
  if (wantsFiles) {
    primaryTags.push("files");
    secondaryTags.push("ops");
  }
  
  if (wantsProject) {
    primaryTags.push("ops");
    secondaryTags.push("system");
  }
  
  if (wantsResearch || wantsNews) {
    primaryTags.push("research");
    // In lite mode, research tools are disabled, so also suggest KB as fallback
    if (LIGHTWEIGHT_MODE) {
      secondaryTags.push("kb");
    }
  }
  
  if (wantsKB) {
    primaryTags.push("kb");
  }
  
  if (wantsMath) {
    primaryTags.push("math");
  }
  
  if (wantsMedia) {
    primaryTags.push("media");
  }
  
  if (wantsDesign) {
    primaryTags.push("design");
  }
  
  // If no primary tags, use "other" as fallback
  if (primaryTags.length === 0) {
    primaryTags.push("other");
  }
  
  // Get tools matching primary tags
  let tools = toolRegistry.byTags(primaryTags, true); // Respect lite mode
  
  // If we have secondary tags and not many primary matches, also include secondary
  if (tools.length < 3 && secondaryTags.length > 0) {
    const secondaryTools = toolRegistry.byTags(secondaryTags, true);
    // Merge without duplicates
    const allTools = new Set([...tools, ...secondaryTools]);
    tools = Array.from(allTools);
  }
  
  const installedCount = toolRegistry.all(false).length; // Total installed (including disabled)
  const availableCount = toolRegistry.all(true).length; // Available in current mode
  
  // Guardrail: if none match, fall back to safe set (light tools only)
  if (tools.length === 0) {
    const fallback = toolRegistry.byTags(['light', 'ops', 'system'], true).slice(0, 8);
    return {
      tools: fallback,
      rationale: `No tagged tools matched intent. Using safe fallback set (${fallback.length} light tools). Lite mode: ${LIGHTWEIGHT_MODE ? 'enabled' : 'disabled'}`,
      matchedCount: 0,
      installedCount
    };
  }
  
  // Build rationale with context
  let rationale = `Matched tags: ${primaryTags.join(", ")}`;
  if (secondaryTags.length > 0) {
    rationale += ` (also considered: ${secondaryTags.join(", ")})`;
  }
  rationale += ` from objective: "${objective.substring(0, 100)}"`;
  if (LIGHTWEIGHT_MODE) {
    rationale += ` [Lite mode: ${availableCount}/${installedCount} tools available]`;
  }
  
  return {
    tools,
    rationale,
    matchedCount: tools.length,
    installedCount
  };
}

