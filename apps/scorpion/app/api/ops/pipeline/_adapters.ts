import { selectToolsByTags } from "@/lib/orchestrator/tool-registry";
import { getRAGStore } from "@/lib/shared-stores";
import { userTools } from "@/lib/chat/tools";
import { runModelUnified, parseModelJSON } from "@/lib/chat/modelRunner";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();
  
  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }
  
  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }
  
  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);
  
  return fallbackPath;
}

import { PipelineContext } from "@/lib/orchestrator/run-pipeline";

export async function planner(objective: string, context: PipelineContext) {
  try {
    const systemPrompt = readFileSync(getPromptPath("planner.system.txt"), "utf-8");
    const userPrompt = `Objective: ${objective}\n\nContext: ${JSON.stringify(context, null, 2)}`;
    
    // Use a model that's more likely to exist - fallback to llama3.1:8b or scorpion:latest
    const defaultModel = process.env['OLLAMA_MODEL'] || process.env['PLANNER_MODEL'] || "llama3.1:8b";
    const response = await runModelUnified(
      systemPrompt,
      userPrompt,
      {
        provider: process.env['LLM_PRIMARY'] || "ollama",
        model: defaultModel,
        maxTokens: 2000,
        temperature: 0.7
      }
    );
    
    const plan = parseModelJSON(response);
    
    const steps = Array.isArray(plan.plan) 
      ? plan.plan.map((s: any) => ({ id: `s${s.id || Date.now()}`, desc: s.title || s.desc || String(s) }))
      : plan.steps?.map((s: string, i: number) => ({ id: `s${i+1}`, desc: s })) || [{ id: "s1", desc: objective }];
    
    return {
      ok: true,
      data: {
        steps,
        deliverable: plan.deliverable || plan.done_when?.[0] || `Complete ${objective}`,
        phase_hints: {
          needs_council: (steps.length ?? 0) > 1
        }
      }
    };
  } catch (error: any) {
    console.error("[Adapter] Planner failed:", error);
    // Fallback for simple queries
    const isSimple = /(news|latest|today|update|breaking)/i.test(objective);
    return {
      ok: true,
      data: {
        steps: isSimple ? [{ id: "s1", desc: "Gather top sources" }] : [{ id: "s1", desc: "Answer directly" }],
        deliverable: `Complete ${objective}`,
        phase_hints: { needs_council: false }
      }
    };
  }
}

export async function council(objective: string, plan: any) {
  if ((plan?.steps?.length ?? 0) <= 1) {
    return { ok: true, skip_reason: "single-step objective" };
  }

  try {
    const systemPrompt = readFileSync(getPromptPath("council.system.txt"), "utf-8");
    const planText = Array.isArray(plan.steps) 
      ? plan.steps.map((s: any) => s.desc || s.title || String(s)).join("\n")
      : String(plan.steps || "");
    const userPrompt = `User Question: ${objective}\n\nPlan Steps:\n${planText}`;
    
    // Use a model that's more likely to exist - fallback to llama3.1:8b or scorpion:latest
    const defaultModel = process.env['OLLAMA_MODEL'] || process.env['PLANNER_MODEL'] || "llama3.1:8b";
    const response = await runModelUnified(
      systemPrompt,
      userPrompt,
      {
        provider: process.env['LLM_PRIMARY'] || "ollama",
        model: defaultModel,
        maxTokens: 3000,
        temperature: 0.8
      }
    );
    
    const votes = parseModelJSON(response);
    
    if (!Array.isArray(votes)) {
      throw new Error("Council response is not an array");
    }
    
    const summary = votes.filter((v: any) => v.vote === "approve").length >= votes.length / 2
      ? "Council approved the plan"
      : "Council requested revisions";
    
    return {
      ok: true,
      data: {
        votes: votes.map((v: any) => ({
          agent: v.agent || v.agentName || "unknown",
          vote: (v.vote === "approve" ? "approve" : "revise") as "approve" | "revise",
          note: v.rationale || v.note || ""
        })),
        revisions: votes.filter((v: any) => v.edits).flatMap((v: any) => v.edits || []),
        summary
      }
    };
  } catch (error: any) {
    console.error("[Adapter] Council failed:", error);
    return { ok: true, skip_reason: "council unavailable" };
  }
}

export async function router(objective: string) {
  try {
    const result = selectToolsByTags(objective);
    return {
      ok: true,
      data: {
        matched_tools: result.tools,
        matched_count: result.matchedCount,
        installed_count: result.installedCount,
        rationale: result.rationale
      }
    };
  } catch (error: any) {
    console.error("[Adapter] Router failed:", error);
    return {
      ok: true,
      data: {
        matched_tools: [],
        matched_count: 0,
        installed_count: 0,
        rationale: "Tool selection failed"
      }
    };
  }
}

export async function rag(objective: string) {
  try {
    const ragStore = await getRAGStore();
    const results = await ragStore.search(objective, 5);
    
    if (!results || results.length === 0) {
      return { ok: true, skip_reason: "no matching documents" };
    }
    
    return {
      ok: true,
      data: {
        hits: results.map((r: any) => ({
          id: r.id || "",
          snippet: r.description || r.content || "",
          source: r.source || ""
        }))
      }
    };
  } catch (error: any) {
    console.warn("[Adapter] RAG search failed:", error);
    return { ok: true, skip_reason: "no knowledge index available" };
  }
}

export const userToolsAdapter = {
  async list() {
    try {
      return Object.keys(userTools)
        .filter(name => userTools[name].implemented !== false)
        .map(name => ({ name }));
    } catch (error) {
      console.warn("[Adapter] User tools list failed:", error);
      return [];
    }
  }
};

export async function executor({ objective, tools, plan, kb }: any) {
  try {
    // Find research tool if selected
    const research = tools?.find((t: string) => t.includes("research") || t.includes("search"));
    
    if (research) {
      const { toolRegistry } = await import("@/lib/orchestrator/tool-registry");
      const tool = toolRegistry.get(research);
      
      if (tool) {
        const args = {
          query: objective,
          depth: "medium" as const,
          category: "general" as const,
          maxSites: 10
        };
        
        const result = await Promise.race([
          tool.run(args, { requestId: `exec-${Date.now()}` }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("TIMEOUT")), 20000)
          )
        ]) as any;
        
        if (result?.ok === false) {
          return {
            ok: false,
            summary: `Research tool failed: ${result.error || "Unknown error"}`
          };
        }
        
        const sources = result?.sources || result?.data?.sources || [];
        
        // Don't claim success if we have 0 sources
        if (sources.length === 0) {
          return {
            ok: true,
            summary: `Research completed but no external sources found (browser/API limits in lite mode). Can provide general explanation from internal knowledge only.`,
            data: {
              results: [{ step_id: "s1", tool: research, ok: true, data: result }],
              artifacts: {
                ui_envelope: {
                  blocks: [
                    {
                      type: "text",
                      title: "Research Summary",
                      body: sources.length === 0 
                        ? `No external sources found (browser/API limits in lite mode). Can provide general explanation from internal knowledge only.`
                        : (result?.summary || `Found ${sources.length} sources for: ${objective}`)
                    },
                    ...(sources.length > 0 ? [{
                      type: "table",
                      title: "Sources",
                      columns: ["Title", "URL"],
                      rows: sources.slice(0, 10).map((s: any) => [s.title || "Untitled", s.url || ""])
                    }] : [])
                  ]
                },
                sources
              }
            }
          };
        }
        
        // If we have sources, return success
        return {
          ok: true,
          summary: `Research completed: ${sources.length} sources found`,
          data: {
            results: [{ step_id: "s1", tool: research, ok: true, data: result }],
            artifacts: {
              ui_envelope: {
                blocks: [
                  {
                    type: "text",
                    title: "Research Summary",
                    body: result?.summary || `Found ${sources.length} sources for: ${objective}`
                  },
                  {
                    type: "table",
                    title: "Sources",
                    columns: ["Title", "URL"],
                    rows: sources.slice(0, 10).map((s: any) => [s.title || "Untitled", s.url || ""])
                  }
                ]
              },
              sources
            }
          }
        };
      }
    }
    
    // If KB hits exist, synthesize from them
    if (kb?.length) {
      return {
        ok: true,
        summary: `Answered from knowledge base (${kb.length} hits)`,
        data: {
          results: [],
          artifacts: {
            ui_envelope: {
              blocks: [{
                type: "text",
                body: `Found ${kb.length} relevant documents in knowledge base.`
              }]
            }
          }
        }
      };
    }
    
    // Fallback
    return {
      ok: true,
      summary: "No tools/KB applicable; produced direct answer",
      data: {
        results: [],
        artifacts: {
          ui_envelope: {
            blocks: [{
              type: "text",
              body: `No matching tools or KB found for: "${objective}". Answered directly.`
            }]
          }
        }
      }
    };
  } catch (error: any) {
    return {
      ok: false,
      summary: `Execution failed: ${error?.message || String(error)}`
    };
  }
}

