---
name: Decision-model patterns
description: Use when a workflow has a fuzzy micro-decision (route, flag, score, classify) to wire into code with a cheap decision model (Jev-style) or LLM, using fan-out, confidence gates, composite scores, and intent routing.
---
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
Related: [agentic-app-policy-workflow](sand-workflow:agentic-app-policy-workflow) (deterministic spine), [cheap-read-expensive-decide](sand-workflow:cheap-read-expensive-decide).

## Enrich 2026-10-10: fixed-menu decision loop (`yt:8ijN8LGljKg` Creator Magic)
On a timer: build a small snapshot → the model returns ONE choice from a fixed menu with a probability → confidence gate → hard limits in code → act in **DRY_RUN** first. `menu_decision_loop.py` 4/4. The hive uses this for routing and ops, never trading (market-watch-no-trade).

## Enrich 2026-10-10: same category, other vendors (`yt:No-JPdFvYWU` Fireship)
OpenAI's **Decisions API** (tiny Luna model picks from a fixed list) and **Fastino GLiNER 2.5** (open-weight, local, "up to 8x faster") do the same job as Jev. Keep `decide()` vendor-neutral so you can swap them.

## Enrich 2026-10-10: numbered-elements browser agent (`yt:zac3kEUwIlg` Simon Scrapes on Jev)
Don't screenshot. List the interactive elements as numbered data → ask 2 choice questions in one call (action type; element # or none) → act only if both have confidence ≥ 0.7, else escalate → re-read after the page settles. PROVE: `browser_decision_agent.py` (local fixture, 5-step signup; strict threshold escalates).
