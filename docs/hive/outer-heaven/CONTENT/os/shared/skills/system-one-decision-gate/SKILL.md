---
name: System-One decision gate
description: >-
  Use when an app/agent step only needs a bounded label, score, or yes/no — not
  free-text generation. Cheap local gate scores allowed answers; escalate to an
  expensive model/HITL when labels are open-ended, confidence is low, or the job
  is taste/money/architecture. Anti-triggers: installing TypeSafe Jev as hive
  face, quoting vendor 193×/$ as FACT, replacing writing/code/math/reasoning
  calls, live `/` product ship while building mode HOLD.
merged_from: [decision-model-patterns]
---

# System-One decision gate

**Owner:** Researcher (extract) · Forge (wire) · Watchdog (meter).  
**Platform:** Grok Bot + Cursor. **Install:** `none (process-only)` — local recreation only.  
**Source:** Devsplainers `yt:B-1nLUAixzI` L2 `/workspace/research/youtube-daily/l2-20260918/B-1nLUAixzI/` (GHOST Sep-18 REDO close 2026-09-21).  
**Pairs:** [match-model-to-task](sand-workflow:match-model-to-task).

## When
- Routing tickets / emails / alerts / tool-calls to a **closed** label set
- Yes/no or rubric score before waking an expensive agent
- Grading/linting LLM output at volume with fixed categories
- You would otherwise prompt an LLM for JSON and hope it stays in-schema

## Anti-triggers
- Writing, code gen, math, multi-step reasoning (keep the LLM)
- Stable task with lots of labeled data where a small fine-tune already wins
- “Just install TypeSafe / Jev / jev-ultrafast” without Tier-3 HITL
- Treating homepage 193× / 444× / ¢ pricing as hive FACT
- Building-mode live `/` decision-product ship

## Recipe
1. **Define labels** up front (Choice ≤255 / Score rubric / Noul yes-no). Empty or `free_text`/`architecture`/`taste` → escalate.
2. **Send state** (text/JSON) + label list to the cheap gate — one shot; no token generation loop.
3. **Combine in code** if the decision needs multiple factors (parallel questions do not see each other).
4. **Threshold** — act on high confidence; else escalate to expensive model or HITL.
5. **Never** call TypeSafe from hive until waitlist+key approved; use local WORKAROUND.

## Tools
| Need | Path | Label |
|---|---|---|
| Local gate + 5/1 proof | `l2-20260918/B-1nLUAixzI/recreation/decision_gate.py` → `gate-run.json` | **PROVE** |
| Model routing doctrine | match-model-to-task | **PROVE** (process) |
| TypeSafe Jev hosted API / SDK | — | **BLOCKED** |
| Vendor 193× / $ / calibration chart | — | **UNVERIFIED** |
| Jev / jev-ultrafast as hive face | — | **BLOCKED** |

## Prompt
```
System-One gate:
State: […]
Labels: [closed list]
If labels open-ended OR max_prob < threshold → ESCALATE_EXPENSIVE / HITL
Else → CHEAP_LOCAL choice + probs
Do not install TypeSafe. Do not quote 193×/$ as FACT.
```

## Steal (FACT timedtext)
- Smart if-statement: condition in plain English; answer must be from your list.
- Choice / Score / Noul; parallel questions; logic stays in testable code.
- LLM write cost dominates; decision models read-and-score.
- RLCD calibration is a **claim** — no public chart yet; test on your labeled set.
- “Can't hallucinate” only means can't exit the list — can still pick wrong.
- Best pattern: LLM writes plan/rules once; gate runs the thousand tiny calls.

## Honesty
GHOST Sep-18 media existed; skill was ABSENT until this REDO. Local gate proves **shape** (5 cheap / 1 escalate), not TypeSafe quality/latency.


## Harness plugs enrich 2026-09-21 — LangChain yt:VE5dsWll06M (no new skill)
Source: L2 `/workspace/research/youtube-daily/l2-20260921/VE5dsWll06M/` · pattern `harness-route-risk-judge`.
Primitives (Choice/Score/Null) unchanged. **NEW** = wire the gate into the agent loop:

| Plug | When | Local proof |
|---|---|---|
| MODEL_ROUTE | Simple vs complex task → cheap vs expensive model | `/workspace/research/packets/signals-2mo-backlog-20261010/recreations/20261011/run1430/harness_judge.py` |
| RISK_GATE | Auto-mode: block risky tool calls (rm -rf, DROP DB) | same |
| JUDGE_RUBRIC | Online eval rubric (correct / grounded / cited) | same |

Still **BLOCKED**: TypeSafe API, `langchain-typesafe`, Jev as hive face, live `/` product.
Still **UNVERIFIED**: vendor 200×/400× and “more reliable than LLM-as-judge”.
Pairs: [match-model-to-task](sand-workflow:match-model-to-task) · [agent-harness-loops](sand-workflow:agent-harness-loops) · [four-blank-before-build](sand-workflow:four-blank-before-build).


## CapEx OpenRouter Jev (2026-09-22)

Packet: `/workspace/research/packets/typesafe-jev-hive-wire-20260922/`  
Client: `/workspace/packages/typesafe-jev-hive/` (stdlib; OpenRouter Decisions; model `typesafe/jev-1.13`).

| Need | Path | Label |
|---|---|---|
| Dry-run / shadow client | `packages/typesafe-jev-hive` | **CapEx** — authority none until `evidence/dry-run-result.json` is `OK` |
| Named judgment slots only | packet `HIVE_WIRE_PLAN.md` + package `slots.py` | semantic only |
| Direct TypeSafe SaaS / SDK / jev-ultrafast | — | still **BLOCKED** (builder no-rent) |
| Live `/` | — | **HOLD** |

If `OPENROUTER_API_KEY` missing → `BLOCKED_MISSING_KEY` and stop (do not invent).
Facts / HOLD / HITL / send-pay-deploy stay code — never route to Jev.


## X bookmarks desktop 20260923 — decision-in-agent-loop wave
Packet: `/workspace/research/packets/x-bookmarks/20260923-desktop/` · cluster OpenRouter / Layton / 0xRicker / mika / grok-top10 / CodingGarden / hari65535.

**FACT (preview atoms):** A decision model answers yes/no / multiple-choice with confidence; much of software is a **sequence of bounded decisions**, not paragraph generation. Pattern: `request → structured state → cheap decision → act` — move the expensive model **out of every decision loop**. Tool-router demos: decide which tool + args from a closed set (no free-text LLM).

**UNVERIFIED:** Vendor 193× / 444× / ¢ / latency benches in promo posts.

| Need | Label |
|---|---|
| Bounded-label gate process (local) | **PROVE** (existing recreation) |
| OpenRouter `typesafe/jev-1.13` CapEx craft slots | CapEx / jev-craft-gate |
| Direct TypeSafe SaaS / jev-ultrafast hive face | **BLOCKED** |
| Money-with-Jev / Meta-ads autopilot guides | **NO-SKILL** |


## YT daily stamp 2026-09-24 (`yt:qkCHiEFEZQg` Web Dev Cody 562 Jev demos) L2 PROVE

Packet: `/workspace/research/youtube-daily/l2-20260924/qkCHiEFEZQg/` · A–E PASS · Cap≤1.

### Steal (FACT)
- Score external demo catalogs on axes: creativity / wow / **utility** / technical depth / domain / form / views — **prefer utility** for day-job adopt.
- Distill only orthogonal patterns: **SCORER · ROUTER · GUARD · FILTER · REFLEX** — never mint 562 skills from 562 posts.
- 562 demos = **EXTERNAL_SIGNAL** (operator lock). Candidate eval backlog only; lifecycle ≤ EXPERIMENT_REQUIRED / LOCALLY_SUPPORTED until local hive evidence.
- Recreation: `recreation/utility_first_ranker.py` (utility-weighted sort PROVE).

### Tools
| Need | Path | Label |
|---|---|---|
| Local utility-first rank | packet recreation | **PROVE** |
| Hosted catalog mirror | https://webdevcody.github.io/jev-demos/ | **PROVE** (curl) |
| TypeSafe Jev API as hive face | — | **BLOCKED** — would work if Tier-3 key; use system-one-decision-gate WORKAROUND |
| Vendor 200× / ¢ claims | tape stills | **UNVERIFIED** |

Platform: **Grok Bot + Cursor**. Install: **none (process-only)**.

## YT daily stamp 2026-10-09 (`yt:Cl3OWig5hkk` Cole Medin, "Jev for your second brain") — L2 C PASS · D PARTIAL
Packet: `/workspace/research/youtube-daily/l2-20261009/Cl3OWig5hkk/` (METHOD has the verbatim questions; harness `recreation/jev_gate_harness.py`).
**Route clarified:** Jev is public on OpenRouter's Decisions API (`POST https://openrouter.ai/api/alpha/decisions`, model `typesafe/jev-1.13`, ~32k-token state limit). The OpenRouter key lives in **Cursor** (Evens standing 2026-10-08), so live calls run in a Cursor cloud agent (Forge), never on the box. Direct TypeSafe SaaS/SDK is still BLOCKED (builder no-rent).

Four ingest uses from the tape (Cole runs them in production, numbers are his):
| Use | Jev question shape | Threshold / result on tape |
|---|---|---|
| Prompt-injection guard on every inbound email | 3 noul in parallel: `instructs_ai`, `boundary_escape`, `relays_owner_orders` (verbatim in METHOD) | quarantine at "above 0.7" (spoken); 3/6 quarantined, regex 0/3, 0.9 s, $0.0002 |
| Draft-or-skip before the LLM drafts | Choice `draft` vs 6 `skip_*` reasons, reduced to a skip boolean | `EMAIL_SKIP_AT=0.95` ("0.8 would skip a real paid collab"); 0/150 real replies skipped |
| News firehose | several Score ladders (relevance, fit) combined with weights | relevance <0.2 never reaches the LLM; the rest go to Haiku/GLM for fit |
| Duplicates vs already-processed | noul "already covered?" | Jev 3/4 vs semantic 2/4 vs string 1/4; bias toward re-processing |
Rollout: `JEV_MODE` off → **shadow** (log beside the old path) → on. Timeout 2 s, 2 retries on {429,500,502,503,524,529}, so on failure it falls back to the old path.
**Where Jev loses (tape):** audience taste ("Haiku wins") and "is this session worth saving?" (coin flip). Keep those on LLM or human.
Hive transfer (proposal, Forge/CapEx owns the package): add an `ingest_guard` slot to `/workspace/packages/typesafe-jev-hive/` with Cole's 3 questions (owner name parametrized). The harness questions already pass `client.validate_questions`. First live run in shadow mode on synthetic fixtures, through a Cursor cloud agent. Bookmark triage variation (`--set bookmarks`) is a candidate for the 1,201-bookmark review. The box regex baseline caught 1/3 and false-flagged 1 post that only discusses injection, which is why the `instructs_ai` wording excludes "discusses AI attacks as a topic".
Labels: endpoint/config/questions = FACT (frames). Vendor 20–200×/40–1000× = UNVERIFIED. Box live result = BLOCKED (key in Cursor; no cloud agent this run).

## Full study 2026-10-10 — Jev engineering cluster (X Sep 25–30: @ArchiveExplorer, @polydao, @mikenevermiss, @0xCodila, @svpino, @typesafeai/OpenRouter router, @OpenAIDevs Decisions API)
**Verified on box (no keys, `/tmp` sandboxes):**
- `Archive228/jev-harness-engineering` lab: `python3 run.py loop --mode demo --case missing-evidence` → `complete` (5 checks, 1 repair, 0 remote requests); `unittest` **83/83 OK**. Pure stdlib.
- **Confidence formula holds:** for n options, `confidence = (n·p_max − 1)/(n − 1)` — checked on 109 saved Choice/Score answers in that repo, max deviation 0.015 (rounding). So conf 0.60 on 3 options ⇔ p_max ≥ 0.73. Confidence is *concentration*, not accuracy on your data.
- `thruwire/foreman` (Jev supervisor over Codex/OpenCode workers): `pip install -e .[dev]` in a venv → **430/430 tests pass**. `browser-use/jev-ultrafast` → **31/31 tests pass**.
**Rules distilled (article + repo):**
1. Read the distribution, not the label: `{export:.4, account:.35, payment:.25}` still labels `export`. Score returns a probability-weighted *index* into your legend; threshold on indices.
2. Give every Choice an `other` exit; the program builds the option list from live state each step (Browser Use "rebuild the menu").
3. One judgment per question; questions in one request are independent (cannot read each other) — sequential dependence = new request. Ask all independent questions in one call (state sent once).
4. Phrasing moves numbers (one word "explicitly" shifted a Noul ~0.06) → version phrasing + threshold + model pin (`jev-1.13.0`, not `jev-latest`) together; shadow a week before switching.
5. Low confidence = "no opinion", route elsewhere; it is not a negative signal. Hard rules, math and dates stay in code before the model.
6. Claude Code placements: PreToolUse gate (hard regex rules first, external actions always to human, `other` never auto-approved); Stop hook judging evidence printed by `checks.sh`; cron triage that only wakes the coder for reproducible bugs.
**Still blocked:** any live Jev call needs `TYPESAFE_API_KEY` (not on box) → BLOCKED_NO_KEY; OpenRouter-routed variants → BLOCKED_CURSOR_USAGE (script in packet `scripts/`). Vendor 193×/444× and "Decisions API 10× faster" = UNVERIFIED.

## Enrich 2026-10-11: transcript confirms (yt:VE5dsWll06M LangChain, yt:D5v4UuvtUXc Jarvis)
- The earlier cited `harness_route_risk_judge.py` never existed on disk; the table above now points to `/workspace/research/packets/signals-2mo-backlog-20261010/recreations/20261011/run1430/harness_judge.py` (7/7 PASS, deterministic stand-in).
- LangChain's three uses, now read from the transcript: a PII yes/no with probability (LLM ~5 s vs near-instant), a **tool-call middleware** that asks "would this call delete important files?" before execution, and a **rubric judge** for online evals (input + question + agent answer + grading criteria).
- Jarvis pattern: one preflight call answers several questions at once (about the vault? addressed to the assistant? request complete? needs send/call/delete?). The "needs confirm" answer routes to a human; it never authorizes the act.

---

## Merged from `decision-model-patterns` (2026-10-11)

- Original description: Use when a workflow has a fuzzy micro-decision (route, flag, score, classify) to wire into code with a cheap decision model (Jev-style) or LLM, using fan-out, confidence gates, composite scores, and intent routing.
- Unique content carried: wiring patterns + 3 extra files from decision-model-patterns
- Original support files moved to `merged/decision-model-patterns/` (browser_decision_agent.py, decision_patterns.py, menu_decision_loop.py); relative paths in this section resolve there.

# Decision-model patterns
Source: `yt:LzweTaOzvVo` The AI Automators (2026-10-10 two-week full watch). Docs: docs.typesafe.ai/patterns.

## Steps
1. Find the fuzzy step in a workflow you already understand. Write the **smallest useful question**.
2. Pick the type: **null** (P(yes)), **choice** (from supplied options), or **score** (0–1).
3. **Speculative fan-out**: send every question you might need in one request. Code ignores the answers that don't apply.
4. **Confidence gate**: below the threshold → clarify or escalate, never act. Tune thresholds on 20+ of your own examples.
5. **Composite score**: score each factor separately, then combine with weights you own.
6. **Intent routing**: a gated choice at the entrance picks the handler.
7. A generative LLM writes text only after the code has chosen the path. Permission checks and confirmations stay in code.

## Proof
`decision_patterns.py` (this folder) → `6/6 PASS` with a stub `decide()`. Swap in the real model call. A real-model threshold sweep is BLOCKED_CURSOR_USAGE (key lives in Cursor).
Related: [agentic-app-policy-workflow](sand-workflow:agentic-app-policy-workflow) (deterministic spine), [match-model-to-task](sand-workflow:match-model-to-task).

## Enrich 2026-10-10: fixed-menu decision loop (`yt:8ijN8LGljKg` Creator Magic)
On a timer: build a small snapshot → the model returns ONE choice from a fixed menu with a probability → confidence gate → hard limits in code → act in **DRY_RUN** first. `menu_decision_loop.py` 4/4. The hive uses this for routing and ops, never trading (market-watch-no-trade).

## Enrich 2026-10-10: same category, other vendors (`yt:No-JPdFvYWU` Fireship)
OpenAI's **Decisions API** (tiny Luna model picks from a fixed list) and **Fastino GLiNER 2.5** (open-weight, local, "up to 8x faster") do the same job as Jev. Keep `decide()` vendor-neutral so you can swap them.

## Enrich 2026-10-10: numbered-elements browser agent (`yt:zac3kEUwIlg` Simon Scrapes on Jev)
Don't screenshot. List the interactive elements as numbered data → ask 2 choice questions in one call (action type; element # or none) → act only if both have confidence ≥ 0.7, else escalate → re-read after the page settles. PROVE: `browser_decision_agent.py` (local fixture, 5-step signup; strict threshold escalates).
