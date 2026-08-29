# Architecture Drift Report

**Generated:** 2026-08-29 (automated weekly review)
**Scope:** `ARCHITECTURE.md`, `CLAUDE.md`, and the agent/council implementations under `apps/scorpion/` and `packages/scorpion-core/`, cross-checked against the Outer Heaven design docs (`docs/hive/outer-heaven/`).

## TL;DR

This monorepo has **two entirely separate "agent" systems** that share vocabulary but not code:

1. **Scorpion agents** (TypeScript, `apps/scorpion/` + `packages/scorpion-core/`) — the council/specialized-agent system behind the chat product.
2. **Outer Heaven / EVENS AI OS agents** (Python, `scripts/hive/`) — the 17-agent personal-ops roster documented in `docs/hive/outer-heaven/AGENT_ROSTER.md`.

**The Outer Heaven roster (#2) is clean.** `AGENT_ROSTER.md` matches `scripts/hive/os_agents_config.py` exactly — 17 core agents, 35 retired agents, 8 renames, all in sync. It's a generated doc (`agent-roster-registry.py --write --write-doc`) and it shows: no drift found there.

**The Scorpion council system (#1) has significant drift.** There are **five independent, mutually-inconsistent definitions of "the council"** living in the codebase simultaneously, plus one that's completely dead code. Details below.

---

## Finding 1 (High): Five competing "council member" registries

| # | File | Members | Wired to runtime? |
|---|------|---------|--------------------|
| A | `packages/scorpion-core/src/agents/registry.ts` (`COUNCIL_MEMBERS`) | 9, IDs `E-001…M-009` | **No — dead code.** Exported via `@scorpion/core` but grepped zero importers in `apps/scorpion`. |
| B | `packages/scorpion-core/src/council/members.ts` (`councilMembers`) | 9, same names as A but **no `id` field at all** | Yes — powers `/api/agents` (the Agents dashboard) via `councilMembersToAgentDossiers()`. |
| C | `apps/scorpion/lib/chat/council.ts` (`getCouncilMembers()`) | 9, same names but **different IDs** than A (`N-001` vs `N-005`, `O-001` vs `O-008`, `S-001`/`S-002` vs `S-004`/`S-006`, `C-001` vs `C-007`, `M-001` vs `M-009`) | Yes — used directly by `/api/council` (streaming) and as the `'legacy'` fallback inside `runCouncilLegacy`. |
| D | `apps/scorpion/server/council/index.ts` (`MEMBERS`) | **21** councillors across 6 "layers" (the 9 named agents above *plus* 12 more: Simplicity, ToolSanity, DataOps, Performance, DataAnalytics, AIFoundations, GenerativeModels, PromptQuality, Security, Ethics, Bias, HumanContext) | **Yes — this is the one that actually runs** in the main chat pipeline by default (`SCORPION_COUNCIL_IMPLEMENTATION=v2` → `runCouncilV2` → `runCouncil` from this file). |
| E | `AGENT_ROSTER.md`-style doc for Scorpion | *(none exists)* | — |

Registry **A** literally says in its own header comment: *"Single source of truth for all agents in Scorpion: 9 Council members, 8 Specialized agents."* It is not a source of truth for anything — nothing imports it, and the number it asserts (9) contradicts what actually executes at runtime (21, via D).

**Impact:** anyone consulting `registry.ts` for "how many council members exist" or "what's Nexus's weight" gets an answer that is wrong for the live system and inconsistent with the dashboard (which uses **B**, also 9, but with no IDs — so agent IDs shown nowhere match the IDs `A`/`C` claim). If `B` or `C` is ever edited to fix a weight or role, `A` silently goes stale (it's already stale) and nobody notices because it isn't loaded.

**Suggested fix:** pick one file as the real registry (recommend `apps/scorpion/server/council/index.ts::MEMBERS`, since it's what actually runs), delete or explicitly deprecate A, B, and C's duplicate member lists, and have the `/api/agents` dashboard and `/api/council` route both read from it.

## Finding 2 (Medium): `ARCHITECTURE.md` describes a council size that matches none of the five

`apps/scorpion/ARCHITECTURE.md` §"Data Flow Example: Web Research Query" states:

> `2. Council: Validate plan quality (5 expert votes)`

No implementation anywhere in the repo runs 5 council members — the candidates are 9 (A/B/C) or 21 (D). This line has drifted from whichever implementation it was originally describing. `ARCHITECTURE.md`'s own "Key Design Patterns" section also just says "Multi-Agent Consensus: Council of expert agents" without a count, so the doc is internally inconsistent (vague everywhere except this one stale example).

**Suggested fix:** update the example to reflect the real runtime council size (21 under `v2`, or state it's configurable via `SCORPION_COUNCIL_IMPLEMENTATION` / `COUNCIL_MODE`), or generalize the wording to avoid hardcoding a number that will drift again.

## Finding 3 (Medium): Two live implementation paths, feature-flagged, doc doesn't mention either

Runtime council selection is controlled by `process.env.SCORPION_COUNCIL_IMPLEMENTATION` (`'v2'` default → server/council MEMBERS with 21 councillors; `'legacy'` → `lib/chat/council.ts`'s 9-member LLM-role-play council with a completely different prompting/streaming model — caucus rounds, personality prompts, casual-question detection, etc.). There's also a *third* code path, `/api/council/route.ts`, which calls `runCouncilDeliberationStreaming` (the "legacy" implementation) **directly**, bypassing the `SCORPION_COUNCIL_IMPLEMENTATION` flag entirely — so that endpoint always uses the 9-member legacy council regardless of the flag's value.

None of this branching, or the existence of the flag, is mentioned in `ARCHITECTURE.md`. `server/orchestrator/council/legacy.ts`'s own docstring ("This wraps the old council implementations and routes them through v2. All old code paths should import from here instead of directly.") is itself violated by `/api/council/route.ts` importing `runCouncilDeliberationStreaming` directly instead of going through the adapter.

**Suggested fix:** document the flag and the two implementations in `ARCHITECTURE.md`, and either route `/api/council/route.ts` through `runCouncilLegacy` (per the adapter's own stated contract) or explicitly note why it's exempt.

## Finding 4 (Low): Specialized-agent layer is clean but the "8 agents" framing in `registry.ts` is misleading

Unlike the council, the **specialized agents** (`data-analytics`, `system-design`, `ai-tools`, `business-strategy`, `python-expert`, `llm-training`, `model-evaluation`, `prompt-engineering`) are consistent everywhere they're actually used:
- 8 implementation files under `packages/scorpion-core/src/agents/*.ts`
- 8 entries in the dead `registry.ts` (matches, for what it's worth)
- 8 entries in `apps/scorpion/lib/chat/specialized-agent-router.ts::SPECIALIZED_AGENT_GROUPS` (IDs match)
- 8 classes wired directly in `apps/scorpion/app/api/agents/specialized/route.ts`

No drift here. Flagged only because `registry.ts`'s dead "single source of truth" framing (Finding 1) makes it look authoritative for this layer too, and future edits to the specialized agents could drift the same way the council did if someone starts trusting `registry.ts`.

## Finding 5 (Informational): "Outer Heaven design" and "Scorpion" are different agent systems — worth stating explicitly somewhere

`CLAUDE.md` opens with instructions to read the Outer Heaven session/agent docs, and separately documents Scorpion's "Multi-Agent Council System." Nothing in the repo currently states that these are unrelated systems (different runtime, different language, different roster, no shared code) — a reasonable reading of "agents exist in docs but not in code, or vice versa" could send a reader looking for `Big Boss` / `Watchdog` / `Money Desk` inside `apps/scorpion/server/council/` (they're not there — that's `scripts/hive/os_agents_config.py`), or looking for `Architectus` / `Sentinel` in the Outer Heaven roster (they're not there either).

**Suggested fix:** a one-line note in `CLAUDE.md` under "Project Overview" clarifying that Scorpion's council and the Outer Heaven/EVENS AI OS roster are independent agent systems, to save future driftreviews (and humans) the cross-referencing work done here.

---

## What was checked and found *not* drifted

- Outer Heaven 17-agent roster: `AGENT_ROSTER.md` ⟷ `scripts/hive/os_agents_config.py` — **in sync** (roster, renames, and all 35 retirements match exactly).
- Scorpion specialized agents (8): implementation files ⟷ router ⟷ API route — **in sync** (see Finding 4).
- `ARCHITECTURE.md`'s described request pipeline (Planner → Council → Knowledge → Tools → Answer → Summarizer, phase files under `phases/`) — file names and line-count claims spot-checked against `phases/councilPhase.ts`; structurally accurate.

## Files referenced in this review

- `apps/scorpion/ARCHITECTURE.md`
- `CLAUDE.md`
- `packages/scorpion-core/src/agents/registry.ts`, `index.ts`
- `packages/scorpion-core/src/council/members.ts`
- `apps/scorpion/server/council/index.ts`
- `apps/scorpion/server/orchestrator/council/legacy.ts`, `v2.ts`
- `apps/scorpion/lib/chat/council.ts`
- `apps/scorpion/lib/chat/specialized-agent-router.ts`
- `apps/scorpion/app/api/agents/route.ts`, `app/api/agents/specialized/route.ts`, `app/api/council/route.ts`
- `apps/scorpion/app/api/chat/stream/phases/councilPhase.ts`
- `docs/hive/outer-heaven/AGENT_ROSTER.md`
- `scripts/hive/os_agents_config.py`
