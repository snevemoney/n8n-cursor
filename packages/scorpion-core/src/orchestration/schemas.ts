import { z } from 'zod';

/**
 * Zod schemas for all 17 specialized prompts
 * These match the output formats specified in each prompt file
 */

// ============================================================================
// EXECUTOR
// ============================================================================
export const ExecutorStepSchema = z.object({
  stepId: z.string(),
  status: z.enum(['success', 'failed', 'skipped']),
  startedAt: z.string(), // ISO8601
  endedAt: z.string(), // ISO8601
  tool: z.string(),
  args: z.record(z.any()),
  result: z.any().optional(), // raw tool output (truncated if huge)
  error: z.object({
    message: z.string(),
    kind: z.string(),
    retryUsed: z.boolean(),
  }).nullable().optional(), // Allow null or undefined for successful steps
});

// ============================================================================
// TOOL ROUTER
// ============================================================================
export const ToolRouterSchema = z.object({
  intent: z.enum(['identity', 'small_talk', 'general_question', 'project_help', 'system_debug', 'operational']),
  tools: z.array(z.object({
    tool: z.string(),
    reason: z.string(),
    priority: z.number().min(1).max(5),
  })),
  notes: z.string().optional(),
});

// ============================================================================
// SAFETY GUARD
// ============================================================================
// Accept "unsafe" as a valid issue type (model sometimes returns this)
// Map it to "security" internally for consistency
const SafetyIssueType = z.union([
  z.enum(['privacy', 'security', 'copyright', 'self-harm', 'illegal', 'medical', 'financial_misuse']),
  z.literal('unsafe'),
]);

export const SafetyGuardSchema = z.object({
  allowed: z.boolean(),
  issues: z.array(SafetyIssueType),
  redactions: z.array(z.object({
    type: z.enum(['secret', 'pii']),
    placeholder: z.string(),
  })).optional(),
  safeAlternative: z.string().nullable().optional(), // Allow null or undefined when no alternative needed
}).transform((data) => {
  // Normalize "unsafe" to "security" for internal consistency
  return {
    ...data,
    issues: data.issues.map(issue => issue === 'unsafe' ? 'security' : issue),
  };
});

// ============================================================================
// RAG RETRIEVER
// ============================================================================
export const RagRetrieverSchema = z.object({
  rewrites: z.array(z.object({
    q: z.string(),
    reason: z.string(),
  })),
  sources: z.array(z.object({
    id: z.enum(['kb', 'code', 'docs', 'logs']),
    weight: z.number().min(0).max(1),
  })),
  scoring: z.object({
    coverage: z.number().min(0).max(1),
    specificity: z.number().min(0).max(1),
    freshness: z.number().min(0).max(1),
  }),
  stopIfEnough: z.boolean(),
});

// ============================================================================
// KNOWLEDGE INGEST
// ============================================================================
export const KnowledgeIngestSchema = z.object({
  docId: z.string(),
  chunks: z.array(z.object({
    chunkId: z.string(),
    text: z.string(),
    title: z.string(),
    path: z.string(), // file or url
    tags: z.array(z.string()),
    hash: z.string(), // sha256
    links: z.array(z.string()).optional(),
  })),
});

// ============================================================================
// ONTOLOGY LINKER
// ============================================================================
export const OntologyLinkerSchema = z.object({
  entities: z.array(z.object({
    id: z.string(), // slug
    type: z.enum(['Service', 'Agent', 'File', 'Workflow', 'Model']),
    name: z.string(),
    aliases: z.array(z.string()).optional(),
  })).optional().default([]), // Allow empty array
  relations: z.array(z.object({
    src: z.string(), // entityId
    rel: z.enum(['uses', 'calls', 'produces', 'depends_on']),
    dst: z.string(), // entityId
    evidence: z.string(), // quote or path
  })).optional().default([]), // Allow empty array
});

// ============================================================================
// MEMORY MANAGER
// ============================================================================
export const MemoryManagerSchema = z.object({
  decision: z.enum(['store', 'ignore']),
  reason: z.string(),
  memory: z.object({
    type: z.enum(['preference', 'capability', 'project_fact']),
    key: z.string(),
    value: z.string(),
    ttlDays: z.number().nullable().optional(), // null | 30 | 90
  }).optional(),
});

// ============================================================================
// IMPLEMENTER
// ============================================================================
export const ImplementerManifestSchema = z.object({
  changes: z.array(z.object({
    path: z.string(),
    action: z.enum(['modify', 'create', 'delete']),
    reason: z.string(),
  })),
});

// Note: Implementer also outputs unified diffs (not JSON), handled separately

// ============================================================================
// TESTER
// ============================================================================
export const TesterSchema = z.object({
  suite: z.string(),
  framework: z.enum(['vitest', 'jest', 'playwright']),
  tests: z.array(z.object({
    name: z.string(),
    type: z.enum(['unit', 'integration', 'e2e']),
    path: z.string(), // suggested file
    code: z.string(), // test code
    covers: z.array(z.string()), // fn|route|component
  })),
  acceptanceCriteria: z.array(z.string()),
});

// ============================================================================
// INCIDENT ANALYST
// ============================================================================
export const IncidentAnalystSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'outage']),
  impact: z.string(), // who/what
  suspectedCause: z.string(), // one-liner
  evidence: z.array(z.object({
    type: z.enum(['log', 'metric']),
    at: z.string(), // ISO8601
    detail: z.string(),
  })),
  fixNow: z.array(z.string()), // concrete steps
  prevent: z.array(z.string()), // monitor X, add retry on Y, limit Z
});

// ============================================================================
// PRODUCT MANAGER
// ============================================================================
export const ProductManagerSchema = z.object({
  problem: z.string(), // plain language
  goals: z.array(z.string()),
  nonGoals: z.array(z.string()),
  users: z.array(z.string()), // owner, ops, client SME
  proposal: z.object({
    ux: z.string(), // summary
    system: z.string(), // summary
    data: z.string(), // summary
  }),
  phases: z.array(z.object({
    name: z.string(), // MVP, etc.
    scope: z.array(z.string()),
    risks: z.array(z.string()),
    metrics: z.array(z.string()),
  })),
  openQuestions: z.array(z.string()),
});

// ============================================================================
// UI DESIGNER
// ============================================================================
export const UIDesignerSchema = z.object({
  page: z.string(), // route
  breakpoints: z.object({
    sm: z.string(), // px
    md: z.string(), // px
    lg: z.string(), // px
  }),
  layout: z.object({
    areas: z.array(z.string()), // sidebar, content, panel
    notes: z.string().optional(),
  }),
  components: z.array(z.object({
    name: z.string(), // AgentCard
    props: z.record(z.any()), // { status, name, ... }
    a11y: z.array(z.string()), // role=button, aria-pressed
  })),
  emptyStates: z.array(z.object({
    case: z.string(), // noAgents
    copy: z.string(),
    action: z.string(), // Create Agent
  })),
});

// ============================================================================
// BUDGET GOVERNOR
// ============================================================================
export const BudgetGovernorSchema = z.object({
  budget: z.object({
    timeSec: z.number().int(),
    tokens: z.number().int(),
    cpuPct: z.number().min(0).max(100),
    gpuMemGB: z.number(),
  }),
  modelChoices: z.array(z.object({
    task: z.enum(['plan', 'summarize', 'code']),
    model: z.string(), // id
    reason: z.string(),
  })),
  limits: z.array(z.object({
    type: z.string(), // concurrency
    value: z.number().int(),
  })),
  tradeoffs: z.string(), // 1-2 sentences
});

// ============================================================================
// DISPATCHER
// ============================================================================
export const DispatcherSchema = z.object({
  placements: z.array(z.object({
    task: z.string(), // embedding_batch, chat_ui_stream
    node: z.string(), // mini-01, laptop
    reason: z.string(), // RAM/throughput, latency
  })),
});

// ============================================================================
// FILE INSPECTOR
// ============================================================================
export const FileInspectorSchema = z.object({
  files: z.array(z.object({
    path: z.string(),
    ts: z.string(), // ISO8601
    kind: z.enum(['image', 'text', 'pdf']),
    summary: z.string(), // 1-2 lines
    ocrUsed: z.boolean(),
  })),
  notable: z.array(z.string()), // short highlights
});

// ============================================================================
// DATAFRAME ANALYST
// ============================================================================
export const DataframeAnalystSchema = z.object({
  columns: z.array(z.object({
    name: z.string(),
    dtype: z.string(),
    nulls: z.number().int(),
    distinct: z.number().int(),
  })),
  highlights: z.array(z.string()), // pattern/anomaly/trend
  suggestedCharts: z.array(z.object({
    type: z.enum(['line', 'bar', 'scatter']),
    x: z.string(),
    y: z.string(),
    why: z.string(),
  })),
});

// ============================================================================
// STYLE ENFORCER
// ============================================================================
export const StyleEnforcerSchema = z.object({
  tone: z.enum(['casual', 'technical', 'operational']),
  edits: z.array(z.object({
    from: z.string(), // snippet
    to: z.string(), // concise rewrite
    reason: z.enum(['clarity', 'brevity', 'precision']),
  })),
});

// Type exports for convenience
export type ExecutorStep = z.infer<typeof ExecutorStepSchema>;
export type ToolRouter = z.infer<typeof ToolRouterSchema>;
export type SafetyGuard = z.infer<typeof SafetyGuardSchema>;
export type RagRetriever = z.infer<typeof RagRetrieverSchema>;
export type KnowledgeIngest = z.infer<typeof KnowledgeIngestSchema>;
export type OntologyLinker = z.infer<typeof OntologyLinkerSchema>;
export type MemoryManager = z.infer<typeof MemoryManagerSchema>;
export type ImplementerManifest = z.infer<typeof ImplementerManifestSchema>;
export type Tester = z.infer<typeof TesterSchema>;
export type IncidentAnalyst = z.infer<typeof IncidentAnalystSchema>;
export type ProductManager = z.infer<typeof ProductManagerSchema>;
export type UIDesigner = z.infer<typeof UIDesignerSchema>;
export type BudgetGovernor = z.infer<typeof BudgetGovernorSchema>;
export type Dispatcher = z.infer<typeof DispatcherSchema>;
export type FileInspector = z.infer<typeof FileInspectorSchema>;
export type DataframeAnalyst = z.infer<typeof DataframeAnalystSchema>;
export type StyleEnforcer = z.infer<typeof StyleEnforcerSchema>;

