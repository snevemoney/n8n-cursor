---
name: n8n-llm-build-bakeoff
description: >-
  Use when choosing which LLM (or harness) should BUILD n8n workflows for us, or
  when re-checking that choice after a new model ships: run the same two realistic
  build prompts per model on an isolated n8n, grade the produced workflows on a
  production-break rubric (not on chat output), log real $ / time, pick the
  cheapest model that passes. Triggers: "which model builds n8n best", "cheapest
  model for n8n", "model bakeoff", "compare models on n8n", new frontier/open model
  release. Anti-triggers: picking a model for runtime agent calls inside a workflow
  (use match-model-to-task / match-model-to-task), production n8n edits.
---
# n8n LLM build bakeoff (cheapest model that passes)

**Owner:** Researcher (method + rubric) · Forge (runs the contestants in a Cursor cloud agent) · Watchdog (verifies grades from workflow JSON + execution files)
**Platform:** isolated n8n ([n8n-box-sandbox](sand-workflow:n8n-box-sandbox)) + a coding harness with the **n8n MCP server** (OpenCode / Claude Code / Cursor agent). Model calls via OpenRouter (key lives in Cursor → run inside a Cursor cloud agent).
**Install:** none on box. Kit: `/workspace/research/youtube-daily/l2-20261010/i-mBOC3dbZU/recreation/` → `grade_n8n_workflow.py`, `cost_ledger.py`, `task1_reference.workflow.json`, `task2_*_reference.workflow.json`, `variants/`.
**Related:** [match-model-to-task](sand-workflow:match-model-to-task) · [n8n-legacy-ops](sand-workflow:n8n-legacy-ops) · [four-blank-before-build](sand-workflow:four-blank-before-build)
**Source:** `yt:i-mBOC3dbZU` (n8n × Flowgrammer, 30:28) — setup 0:47–1:18, prompt 1 t0092, good T1 2:04–2:47, prompt 2 t0765, good T2 13:10–14:52, DQ calls 18:21–27:55, totals t1695, recommendation 29:10–29:20. Packet `/workspace/research/youtube-daily/l2-20261010/i-mBOC3dbZU/`.

## Recipe
1. **Same harness for all** (OpenCode in the tape) so no model gets a home-harness edge; max effort; same n8n version; **reset the instance** before each run.
2. **Two prompts, verbatim** (METHOD.md): T1 = hourly RSS → "News Articles" Data Table, unique-only, feeds addable without editing the workflow. T2 = AI agent over that table (chat + sub-workflow) + `/news` API endpoint with `count` default 10. Prompts are deliberately "imperfect but realistic".
3. **Judge the artifact, not the chat**: export each produced workflow JSON, run it, then `python3 grade_n8n_workflow.py <wf.json> [--task 1|2]`. Rubric (from the tape's DQ calls):
   - HARD (DQ = "would break in production"): T1 hourly trigger, **cross-run dedupe** (rowNotExists/upsert on link), saves to the table; T2 chat + sub-workflow triggers, **no data fetch in front of the agent** (runs every turn), **every data tool bounded** (no Return All on a growing table); API webhook /news calling the agent.
   - MAJOR (PASS_WITH_GAPS): normalize schema; ≥2 tools (recent + search); search uses **contains** not exact; conversation memory; count default 10; **API error branch returns JSON error**; JSON response.
   - SOFT (comment only): feeds editable without editing the workflow (Kimi hard-coded them, still passed T1 on tape), in-run dedupe, session-key fallback, sticky notes/naming.
4. **Cost ledger**: record $ and wall time per task per model from the harness → `cost_ledger.py` (totals, winner, cheapest-passing, premium over cheapest). Tokens ≠ cost.
   - Note (INFERENCE): on tape every "no error response" DQ (GLM/Kimi/Qwen) also had a Return-All tool, so error-response-alone is graded MAJOR here, not HARD.
5. **Pick**: cheapest model with zero HARD fails on both tasks. If it's a "steer it yourself" model (fast/cheap but MAJOR gaps), only for desks that know n8n.

## Tape result (FACT, 2026-10 models; re-run when models change)
Grok 4.7 $7.36 / 30:01 **#1**; Opus 5.5 $8.68 / 32:08 #2; GPT-6 Astra $7.05 DQ (preload); GLM 5.3 $1.76 DQ (Return All, no error resp.); Kimi K3 $3.41 DQ; Qwen 3.8 Max $3.00 DQ. All six passed T1. Advice: Grok if you don't know n8n; Qwen/Kimi if you'll steer.

## Tools
| Step | Status | Evidence / unblock |
|---|---|---|
| Reference T1 workflow live on n8n (3 feeds → 82 rows; re-run adds 0) | **PROVE** 2026-10-10 | `task1_run1_summary.json`, `task1_run2_summary.json`, `task1_rowcount_after_run2.txt` |
| Reference T2 API `count` parse (default 10, clamp 50) | **PROVE** | `task2_api_parsecount_runs.txt` |
| Grader reproduces the tape's verdicts on 6 workflows | **PROVE** | `grade_results.txt` (ref PASS, Kimi-like PASS, no-dedupe DQ, GLM-like DQ, Astra-like DQ, API-no-error PASS_WITH_GAPS) |
| Cost ledger matches on-screen totals | **PROVE** | `cost_ledger_output.txt` 6/6 |
| T2 agent workflow run (chat) | **BLOCKED** | needs a chat-model credential in the sandbox |
| Contestant model runs | **BLOCKED** | Unblock: parent-owned **Cursor cloud agent** (OpenRouter key lives in Cursor): install n8n-box-sandbox kit, enable instance MCP, run prompt 1+2 per model via OpenCode/Claude Code, export JSONs, grade with `grade_n8n_workflow.py`, log into `cost_ledger.py`. Minimum field: Grok 4.7 + GLM 5.3. |
| n8n MCP server on self-hosted | **WORKAROUND** | present (`/mcp-server/http`) but `mcpAccessEnabled=false` by default; enable in Settings of the sandbox only |
