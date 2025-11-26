import { Phase, PhaseStatus, Emit } from "./phases";
import { selectToolsByTags } from "./tool-registry";

/**
 * Power of 10 Rule 5: Typed context interface
 */
export interface PipelineContext {
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Power of 10 Rule 5: Typed execution result
 */
export interface ExecutionResult {
  ok: boolean;
  summary: string;
  data?: {
    method?: string;
    tool?: string;
    result?: unknown;
    sources?: unknown[];
    hits?: Array<{id: string; snippet: string; source: string}>;
    blocks?: Array<{ type: string; body: string }>;
  };
  error?: { code: string; message: string };
}

type PipelineInput = {
  modelPlan: (objective: string, context: PipelineContext) => Promise<{ steps: string[]; deliverable: string }>;
  modelCouncil: (objective: string, plan: string) => Promise<{ votes: Array<{agent: string; vote: "approve"|"revise"; note: string}>; summary: string }>;
  kbSearch?: (query: string, options?: { topK?: number }) => Promise<Array<{id: string; snippet: string; source: string}>>;
  userToolsRegistry?: { listNames: () => string[] };
  objective: string;
  context: PipelineContext;
  emit: Emit;
};

/**
 * Power of 10 Rule 5: Typed log data
 */
type LogData = Record<string, unknown> | string | number | boolean | null | undefined;

/**
 * Power of 10 Rule 3: Structured logging helper
 */
function createLogger(): (phase: string, event: string, data?: LogData) => void {
  return (phase: string, event: string, data?: LogData) => {
    console.log(`[Pipeline:${phase}] ${event}`, data ? JSON.stringify(data, null, 2) : "");
  };
}

/**
 * Power of 10 Rule 3: Helper to execute plan phase
 */
async function executePlanPhase(
  inp: PipelineInput,
  log: (phase: string, event: string, data?: LogData) => void,
  emit: Emit
): Promise<PhaseStatus> {
  log("PLAN", "phase.start", { objective: inp.objective });
  emit({ type: "phase.start", phase: Phase.PLAN, objective: inp.objective });
  
  try {
    const plan = await inp.modelPlan(inp.objective, inp.context);
    log("PLAN", "phase.end", { status: "done", stepsCount: plan.steps?.length || 0 });
    const planResult: PhaseStatus = { status: "done", payload: plan };
    emit({ type: "phase.end", phase: Phase.PLAN, result: planResult });
    return planResult;
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    log("PLAN", "phase.end", { status: "error", error: errorMessage });
    const planResult: PhaseStatus = { 
      status: "error", 
      error: { code: "PLAN_FAIL", message: errorMessage } 
    };
  emit({ type: "phase.end", phase: Phase.PLAN, result: planResult });
    return planResult;
  }
}

/**
 * Power of 10 Rule 3: Helper to execute council phase
 */
async function executeCouncilPhase(
  inp: PipelineInput,
  planResult: PhaseStatus,
  log: (phase: string, event: string, data?: LogData) => void,
  emit: Emit
): Promise<PhaseStatus> {
  log("COUNCIL", "phase.start", { objective: inp.objective });
  emit({ type: "phase.start", phase: Phase.COUNCIL, objective: inp.objective });
  
  const needsCouncil = planResult.status === "done" && planResult.payload && typeof planResult.payload === 'object' && 'steps' in planResult.payload
    ? (Array.isArray(planResult.payload.steps) ? planResult.payload.steps.length : 0) > 1
    : false;
  
  if (!needsCouncil) {
    log("COUNCIL", "phase.end", { status: "skipped", reason: "single-step objective" });
    const councilResult: PhaseStatus = { status: "skipped", reason: "single-step objective" };
    emit({ type: "phase.end", phase: Phase.COUNCIL, result: councilResult });
    return councilResult;
  }
  
    try {
    const planText = planResult.status === "done" && planResult.payload && typeof planResult.payload === 'object' && 'steps' in planResult.payload
      ? (Array.isArray(planResult.payload.steps) 
        ? planResult.payload.steps.join("\n") 
          : String(planResult.payload.steps || ""))
      : "";
    const council = await inp.modelCouncil(inp.objective, planText);
      log("COUNCIL", "phase.end", { status: "done", votesCount: council.votes?.length || 0 });
    const councilResult: PhaseStatus = { status: "done", payload: council };
    emit({ type: "phase.end", phase: Phase.COUNCIL, result: councilResult });
    return councilResult;
  } catch (e: unknown) {
      log("COUNCIL", "phase.end", { status: "skipped", reason: "council unavailable" });
    const councilResult: PhaseStatus = { status: "skipped", reason: "council unavailable; proceeding with plan" };
  emit({ type: "phase.end", phase: Phase.COUNCIL, result: councilResult });
    return councilResult;
  }
}

/**
 * Power of 10 Rule 3: Helper to execute tool selection phase
 */
function executeToolSelectPhase(
  inp: PipelineInput,
  log: (phase: string, event: string, data?: LogData) => void,
  emit: Emit
): { toolsChosen: string[]; toolRationale: string; matchedCount: number; installedCount: number } {
  log("TOOL_SELECT", "phase.start", { objective: inp.objective });
  emit({ type: "phase.start", phase: Phase.TOOL_SELECT, objective: inp.objective });
  
  try {
    const sel = selectToolsByTags(inp.objective);
    log("TOOL_SELECT", "tool.selected", { 
      tools: sel.tools, 
      matchedCount: sel.matchedCount, 
      installedCount: sel.installedCount, 
      rationale: sel.rationale 
    });
    emit({ 
      type: "tool.selected", 
      tools: sel.tools, 
      rationale: sel.rationale,
      matchedCount: sel.matchedCount,
      installedCount: sel.installedCount
    });
    log("TOOL_SELECT", "phase.end", { status: "done", toolsCount: sel.tools.length });
    emit({ 
      type: "phase.end", 
      phase: Phase.TOOL_SELECT, 
      result: { status: "done", payload: { toolsChosen: sel.tools, toolRationale: sel.rationale, matchedCount: sel.matchedCount, installedCount: sel.installedCount } } 
    });
    return {
      toolsChosen: sel.tools,
      toolRationale: sel.rationale,
      matchedCount: sel.matchedCount,
      installedCount: sel.installedCount
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    log("TOOL_SELECT", "phase.end", { status: "error", error: errorMessage });
  emit({ 
    type: "phase.end", 
    phase: Phase.TOOL_SELECT, 
      result: { status: "error", error: { code: "TOOL_SELECT_FAIL", message: errorMessage } } 
    });
    throw new Error(`Tool selection failed: ${errorMessage}`);
  }
}

/**
 * Power of 10 Rule 3: Helper to execute knowledge base phase
 */
async function executeKnowledgePhase(
  inp: PipelineInput,
  log: (phase: string, event: string, data?: LogData) => void,
  emit: Emit
): Promise<Array<{id: string; snippet: string; source: string}>> {
  log("KNOWLEDGE", "phase.start", { objective: inp.objective });
  emit({ type: "phase.start", phase: Phase.KNOWLEDGE, objective: inp.objective });
  
  const kbQuery = inp.objective;
  let kbHits: Array<{id: string; snippet: string; source: string}> = [];
  let kbSkipReason: string | undefined;
  
  if (inp.kbSearch) {
    try {
      log("KNOWLEDGE", "kb.query.start", { query: kbQuery });
      kbHits = await inp.kbSearch(kbQuery, { topK: 5 });
      log("KNOWLEDGE", "kb.query.result", { hitCount: kbHits.length });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      log("KNOWLEDGE", "kb.query.error", { error: errorMessage });
      kbSkipReason = "no knowledge index available";
      console.warn("KB search failed:", e);
    }
  } else {
    kbSkipReason = "no knowledge index available";
  }
  
  emit({ type: "kb.query", query: kbQuery, hitCount: kbHits.length });
  const kbResult: PhaseStatus = kbHits.length
    ? { status: "done", payload: kbHits }
    : { status: "skipped", reason: kbSkipReason || "no matching documents" };
  log("KNOWLEDGE", "phase.end", { status: kbResult.status, hitCount: kbHits.length, reason: kbResult.status === "skipped" ? kbResult.reason : undefined });
  emit({ type: "phase.end", phase: Phase.KNOWLEDGE, result: kbResult });

  return kbHits;
}

/**
 * Power of 10 Rule 3: Helper to execute user tools phase
 */
function executeUserToolsPhase(
  inp: PipelineInput,
  log: (phase: string, event: string, data?: LogData) => void,
  emit: Emit
): void {
  log("USER_TOOLS", "phase.start", { objective: inp.objective });
  emit({ type: "phase.start", phase: Phase.USER_TOOLS, objective: inp.objective });
  const userToolNames = inp.userToolsRegistry?.listNames() || [];
  log("USER_TOOLS", "userTools.list", { count: userToolNames.length });
  emit({ type: "userTools.list", count: userToolNames.length });
  const userToolsResult: PhaseStatus = userToolNames.length
    ? { status: "done", payload: userToolNames }
    : { status: "skipped", reason: "no user tools installed" };
  log("USER_TOOLS", "phase.end", { status: userToolsResult.status, count: userToolNames.length });
  emit({ type: "phase.end", phase: Phase.USER_TOOLS, result: userToolsResult });
}

/**
 * Power of 10 Rule 3: Helper to execute execution phase
 */
async function executeExecutionPhase(
  inp: PipelineInput,
  toolsChosen: string[],
  kbHits: Array<{id: string; snippet: string; source: string}>,
  log: (phase: string, event: string, data?: LogData) => void,
  emit: Emit
): Promise<PhaseStatus> {
  log("EXECUTE", "phase.start", { objective: inp.objective, toolsChosen });
  emit({ type: "phase.start", phase: Phase.EXECUTE, objective: inp.objective });
  
  const execResult = await executeByPolicy({ 
    objective: inp.objective, 
    toolsChosen, 
    kbHits, 
    context: inp.context 
  }).catch((e: unknown) => {
    const errorMessage = e instanceof Error ? e.message : String(e);
    log("EXECUTE", "exec.error", { error: errorMessage });
    return {
      ok: false,
      summary: errorMessage,
      error: { code: "EXEC_FAIL", message: errorMessage }
    };
  });
  
  log("EXECUTE", "exec.result", { ok: execResult?.ok, summary: execResult?.summary });
  emit({ 
    type: "exec.result", 
    ok: !!execResult?.ok, 
    summary: execResult?.summary ?? "" 
  });
  
  const finalResult: PhaseStatus = execResult?.ok
    ? { status: "done", payload: execResult }
    : { status: "error", error: execResult?.error || { code: "EXEC_FAIL", message: execResult?.summary ?? "unknown" } };
  
  log("EXECUTE", "phase.end", { status: finalResult.status });
  emit({ type: "phase.end", phase: Phase.EXECUTE, result: finalResult });

  return finalResult;
}

/**
 * Power of 10 Rule 3: Main pipeline function (refactored from 160 lines to ~30 lines)
 */
export async function runPipeline(inp: PipelineInput): Promise<PhaseStatus> {
  const { emit } = inp;
  const log = createLogger();

  // 1) PLAN
  const planResult = await executePlanPhase(inp, log, emit);
  if (planResult.status !== "done") return planResult;

  // 2) COUNCIL
  await executeCouncilPhase(inp, planResult, log, emit);

  // 3) TOOL SELECT
  const { toolsChosen } = executeToolSelectPhase(inp, log, emit);

  // 4) KNOWLEDGE
  const kbHits = await executeKnowledgePhase(inp, log, emit);

  // 5) USER TOOLS
  executeUserToolsPhase(inp, log, emit);

  // 6) EXECUTE
  return await executeExecutionPhase(inp, toolsChosen, kbHits, log, emit);
}

/**
 * Power of 10 Rule 3: Helper to execute research tool
 */
async function executeResearchTool(
  research: string,
  objective: string,
  context: PipelineContext
): Promise<ExecutionResult> {
  try {
      const { toolRegistry } = await import("./tool-registry");
      const tool = toolRegistry.get(research);
      
      if (!tool) {
        throw new Error(`Tool ${research} not found in registry`);
      }
      
      const args = {
        query: objective,
        depth: "medium" as const,
        category: "general" as const,
        maxSites: 5
      };
      
      const result = await Promise.race([
        tool.run(args, { requestId: context.requestId || "pipeline" }),
      new Promise<{ ok: false; error: string }>((_, reject) => 
          setTimeout(() => reject(new Error("TIMEOUT")), 20000)
        )
    ]) as { ok?: boolean; error?: string | { code: string; message: string }; sources?: unknown[]; data?: { sources?: unknown[] } };
      
      if (result?.ok === false) {
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : (result.error && typeof result.error === 'object' && 'message' in result.error 
            ? String(result.error.message) 
            : "Unknown error");
        return {
          ok: false,
        summary: `Research tool failed: ${errorMessage}`,
        error: { code: "TOOL_ERROR", message: errorMessage }
        };
      }
      
    const sources = result?.sources || (result?.data && typeof result.data === 'object' && 'sources' in result.data 
      ? (Array.isArray(result.data.sources) ? result.data.sources : [])
      : []);
      return { 
        ok: true, 
        summary: `Research completed. Found ${sources.length} sources.`,
        data: { method: "research", tool: research, result, sources }
      };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    if (errorMessage.includes("TIMEOUT") || errorMessage.includes("timeout")) {
        return { 
          ok: false, 
          summary: "Research tool timeout at 20s",
          error: { code: "TIMEOUT", message: "Research tool exceeded 20s timeout" }
        };
      }
      return { 
        ok: false, 
      summary: `Research tool failed: ${errorMessage}`,
      error: { code: "TOOL_ERROR", message: errorMessage }
      };
    }
  }

/**
 * Power of 10 Rule 3: Helper to create KB-based result
 */
function createKBResult(kbHits: Array<{id: string; snippet: string; source: string}>): ExecutionResult {
    return { 
      ok: true, 
      summary: `Answered from knowledge base (${kbHits.length} hits)`,
      data: { method: "kb", hits: kbHits }
    };
  }

/**
 * Power of 10 Rule 3: Helper to create fallback result
 */
function createFallbackResult(objective: string): ExecutionResult {
  return { 
    ok: true, 
    summary: "No tools/KB applicable; produced direct answer",
    data: { 
      blocks: [{ 
        type: "text", 
        body: `No matching tools or KB found for: "${objective}". Answered directly.` 
      }] 
    } 
  };
}

/**
 * Power of 10 Rule 3: Minimal execution policy (refactored from 89 lines to ~25 lines)
 */
async function executeByPolicy({ 
  objective, 
  toolsChosen, 
  kbHits, 
  context 
}: {
  objective: string;
  toolsChosen: string[];
  kbHits: Array<{id: string; snippet: string; source: string}>;
  context: PipelineContext;
}): Promise<ExecutionResult> {
  // 1) prefer research tool for "latest" queries
  const research = toolsChosen.find(n => n.includes("research") || n.includes("search"));
  if (research) {
    return await executeResearchTool(research, objective, context);
  }

  // 2) if KB hits exist, synthesize an answer from them
  if (kbHits?.length) {
    return createKBResult(kbHits);
  }

  // 3) fallback: answer directly
  return createFallbackResult(objective);
}

