/**
 * Tool Metadata Extension
 * 
 * Adds rich metadata to tools for better discoverability and documentation
 */

export type ToolCategory =
    | 'research'
    | 'knowledge'
    | 'system'
    | 'automation'
    | 'planning'
    | 'development'
    | 'agents'
    | 'ai-models'
    | 'debug'
    | 'utility';

export type ToolStatus = 'stable' | 'beta' | 'experimental';

export type ToolUsage =
    | 'planner'    // Used by planner for task decomposition
    | 'council'    // Used by council for plan review
    | 'build'      // Used by build/deploy agents
    | 'ops'        // Used by operations/monitoring
    | 'knowledge'  // Used by knowledge/learning systems
    | 'executor';  // Used directly by executor

export interface ToolMetadata {
    category: ToolCategory;
    status: ToolStatus;
    docsUrl?: string;
    usedBy?: ToolUsage[];
    tags?: string[];
    examples?: Array<{
        description: string;
        args: Record<string, any>;
    }>;
}

/**
 * Tool metadata registry
 * Maps tool names to their metadata
 */
export const toolMetadata: Record<string, ToolMetadata> = {
    // Research Tools
    'research.run': {
        category: 'research',
        status: 'stable',
        docsUrl: '/docs/tools/research',
        usedBy: ['planner', 'executor'],
        tags: ['web', 'async', 'external-api'],
        examples: [{
            description: 'Search for recent market analysis',
            args: { query: 'AI market trends 2025', depth: 'medium', category: 'market-analysis' }
        }]
    },
    'research.start': {
        category: 'research',
        status: 'beta',
        usedBy: ['executor'],
        tags: ['web', 'deprecated'],
    },

    // Knowledge Tools
    'kb.search': {
        category: 'knowledge',
        status: 'stable',
        docsUrl: '/docs/tools/knowledge-search',
        usedBy: ['planner', 'council', 'executor'],
        tags: ['rag', 'embeddings', 'core'],
        examples: [{
            description: 'Search knowledge base for project information',
            args: { query: 'How does Scorpion work?', limit: 5 }
        }]
    },
    'knowledge.list': {
        category: 'knowledge',
        status: 'stable',
        usedBy: ['planner', 'knowledge'],
        tags: ['list', 'management'],
    },
    'knowledge.get': {
        category: 'knowledge',
        status: 'stable',
        usedBy: ['executor'],
        tags: ['retrieval'],
    },
    'ontology.search': {
        category: 'knowledge',
        status: 'experimental',
        usedBy: ['knowledge'],
        tags: ['structured', 'graph'],
    },

    // System Tools
    'system.health': {
        category: 'system',
        status: 'stable',
        docsUrl: '/docs/tools/system-health',
        usedBy: ['ops', 'planner'],
        tags: ['monitoring', 'health-check', 'core'],
        examples: [{
            description: 'Check system status',
            args: {}
        }]
    },
    'logs.tail': {
        category: 'system',
        status: 'stable',
        usedBy: ['ops', 'planner'],
        tags: ['debugging', 'monitoring'],
    },
    'stats.get': {
        category: 'system',
        status: 'stable',
        usedBy: ['ops'],
        tags: ['metrics', 'analytics'],
    },
    'backup.create': {
        category: 'system',
        status: 'beta',
        usedBy: ['ops'],
        tags: ['data', 'resilience'],
    },
    'operations.list': {
        category: 'system',
        status: 'stable',
        usedBy: ['ops'],
        tags: ['list', 'monitoring'],
    },
    'settings.get': {
        category: 'system',
        status: 'stable',
        usedBy: ['planner', 'ops'],
        tags: ['config'],
    },
    'notifications.post': {
        category: 'system',
        status: 'stable',
        usedBy: ['executor', 'ops'],
        tags: ['alerts', 'communication'],
    },
    'notifications.list': {
        category: 'system',
        status: 'stable',
        usedBy: ['ops'],
        tags: ['list'],
    },

    // Automation Tools
    'workflows.trigger': {
        category: 'automation',
        status: 'stable',
        docsUrl: '/docs/tools/workflows',
        usedBy: ['planner', 'executor'],
        tags: ['n8n', 'orchestration', 'core'],
    },
    'workflows.list': {
        category: 'automation',
        status: 'stable',
        usedBy: ['planner'],
        tags: ['list', 'discovery'],
    },
    'workflows.get': {
        category: 'automation',
        status: 'stable',
        usedBy: ['executor'],
        tags: ['retrieval'],
    },

    // Planning Tools
    'project.analyze': {
        category: 'planning',
        status: 'stable',
        docsUrl: '/docs/tools/project-analyze',
        usedBy: ['planner', 'council'],
        tags: ['codebase', 'architecture', 'core'],
    },
    'project.status': {
        category: 'planning',
        status: 'stable',
        usedBy: ['planner'],
        tags: ['status', 'tracking'],
    },

    // Development Tools
    'code.readFile': {
        category: 'development',
        status: 'stable',
        docsUrl: '/docs/tools/code-read',
        usedBy: ['planner', 'executor'],
        tags: ['filesystem', 'ast', 'core'],
        examples: [{
            description: 'Read a TypeScript file',
            args: { path: 'apps/scorpion/lib/chat/tools/index.ts' }
        }]
    },
    'files.recent': {
        category: 'development',
        status: 'stable',
        usedBy: ['planner', 'executor'],
        tags: ['filesystem', 'discovery'],
    },
    ' ocr.extract': {
        category: 'development',
        status: 'beta',
        usedBy: ['executor'],
        tags: ['vision', 'ml'],
    },

    // Agent Tools
    'agent.deploy': {
        category: 'agents',
        status: 'beta',
        docsUrl: '/docs/tools/agent-deploy',
        usedBy: ['build', 'planner'],
        tags: ['deployment', 'lifecycle'],
    },
    'agents.list': {
        category: 'agents',
        status: 'stable',
        usedBy: ['planner'],
        tags: ['list', 'discovery'],
    },
    'agents.get': {
        category: 'agents',
        status: 'stable',
        usedBy: ['executor'],
        tags: ['retrieval'],
    },

    // AI Model Tools
    'llm.train': {
        category: 'ai-models',
        status: 'experimental',
        usedBy: ['build'],
        tags: ['training', 'ml'],
    },
    'llm.evaluate': {
        category: 'ai-models',
        status: 'experimental',
        usedBy: ['build'],
        tags: ['evaluation', 'ml'],
    },
    'llm.experiments.list': {
        category: 'ai-models',
        status: 'experimental',
        usedBy: ['build'],
        tags: ['list', 'ml'],
    },
    'llm.models.compare': {
        category: 'ai-models',
        status: 'experimental',
        usedBy: ['build'],
        tags: ['comparison', 'ml'],
    },
    'llamacpp.webui': {
        category: 'ai-models',
        status: 'beta',
        usedBy: ['ops'],
        tags: ['local-llm', 'interface'],
    },
};

/**
 * Get metadata for a tool
 */
export function getToolMetadata(toolName: string): ToolMetadata | null {
    return toolMetadata[toolName] || null;
}

/**
 * Get all tools with metadata
 */
export function getToolsWithMetadata() {
    return Object.entries(toolMetadata).map(([name, metadata]) => ({
        name,
        ...metadata
    }));
}

/**
 * Filter tools by category
 */
export function getToolsByCategory(category: ToolCategory) {
    return Object.entries(toolMetadata)
        .filter(([_, meta]) => meta.category === category)
        .map(([name, meta]) => ({ name, ...meta }));
}

/**
 * Filter tools by status
 */
export function getToolsByStatus(status: ToolStatus) {
    return Object.entries(toolMetadata)
        .filter(([_, meta]) => meta.status === status)
        .map(([name, meta]) => ({ name, ...meta }));
}

/**
 * Filter tools by usage
 */
export function getToolsByUsage(usage: ToolUsage) {
    return Object.entries(toolMetadata)
        .filter(([_, meta]) => meta.usedBy?.includes(usage))
        .map(([name, meta]) => ({ name, ...meta }));
}
