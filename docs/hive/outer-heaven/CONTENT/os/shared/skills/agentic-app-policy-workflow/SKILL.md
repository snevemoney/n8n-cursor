---
name: agentic-app-policy-workflow
description: >-
  Use when designing or building an "agentic app" (an AI feature that answers or acts
  on rules: HR/leave, refunds, pricing, approvals, compliance, send/spend gates) and
  correctness matters more than fluency: put the rules in tested deterministic
  functions behind a classify→route spine, let the LLM only classify/extract and
  phrase, refuse anything not covered, keep a human Send step for actions. Triggers:
  "agentic app", "policy bot", "answer from the handbook", "RAG gives wrong numbers",
  "Oracle AI Agent Studio", "deterministic agent workflow", "HITL approval agent".
  Anti-triggers: open-ended research/chat with no rule source, creative writing,
  one-off scripts.
---
# Agentic app: deterministic spine + policy-as-code

**Owner:** Forge (build) · Consultant (client architecture framing) · Watchdog (checks tests exist before ship)
**Platform:** any workflow engine — n8n (Switch + Code nodes), Python, Cursor/Claude Code app, Oracle AI Agent Studio (paid Fusion). Box-proven in Python + isolated n8n.
**Install:** none. Templates: `/workspace/research/youtube-daily/l2-20261010/cWjS56edaUA/recreation/` (`northwind_policy.py` + tests, `leave_advisor_workflow.py`, `leave_policy_advisor.n8n.json`, `rag_contrast.py`, `transfer_tier3_gate/`).
**Related:** [agent-harness-loops](sand-workflow:agent-harness-loops) · [n8n-box-sandbox](sand-workflow:n8n-box-sandbox) · [system-one-decision-gate](sand-workflow:system-one-decision-gate)
**Source:** `yt:cWjS56edaUA` (Cole Medin, "Agentic Apps", 12:29) — outcome first 0:51–1:22 + 11:45–11:57, one view/HITL Send t0020, builder prompt t0185, background next-actions 4:35–5:12, deterministic workflow 5:14–6:42 (t0335/t0380), policy store + functions 7:23–8:18 (t0490), RAG contrast 8:20–8:56, leave workflow + chat test t0545/t0555 (9:05–9:12 scoping), run-as identity 9:30–10:20 (t0580), visual outputs 10:22–11:39 (t0630). Packet `/workspace/research/youtube-daily/l2-20261010/cWjS56edaUA/`.

## Recipe
1. **Outcome first**: the app does the job and stops at a draft; a human hits **Send** for anything external (money/send/deploy/secret).
2. **Spine**: Trigger → *LLM classify + extract* (route label + typed fields) → **Switch** by route → **Policy node** per route → *LLM phrase* (numbers only from policy output) → answer. Unknown route → **OTHER = fixed refusal string** (never improvise).
3. **Policy-as-code**: one small function per question (`calculateEntitlement(fte, years)` …), strict typed inputs (raise on bad input → OTHER/ask), **unit tests from the handbook's worked examples**, and *scoping* (each route only loads its functions).
4. **Missing input → ask** (e.g. years of service), don't guess.
5. **Identity**: decide run-as (triggering user vs automation identity) per action; least privilege.
6. **Generate, then test**: an agent may draft the functions from the policy PDF ("one function per question…"), but nothing ships without passing tests.
7. Show outputs visually (table/chart) when the answer is data.

## Tools
| Piece | Status | Evidence |
|---|---|---|
| Policy functions + tests | **PROVE** 2026-10-10 | `test_northwind_policy.py` 8/8 OK (toy numbers, calibrated to the tape's 13.5) |
| Python workflow reproduces on-screen answers | **PROVE** | `run_output.txt`: 13.5 days, verbatim refusal, 6 weeks at 60%, asks years |
| Same spine on n8n (Switch + Code) | **PROVE** | exec 9 `n8n_run_summary.json` identical answers |
| Transfer to a different policy (Tier-3 HITL gate) | **PROVE** | `transfer_tier3_gate/` 4/4 tests; send/deploy → DRAFT_AND_WAIT_FOR_SEND |
| LLM classify/phrase steps | **WORKAROUND** | regex/template stubs on box; swap a chat model in (any desk call / Cursor agent) |
| RAG-only contrast | **WORKAROUND** (illustration) | `rag_contrast.py` naive retriever gives 15 / sick-leave "10" / "1" — not a measurement of real RAG |
| Oracle AI Agent Studio | **BLOCKED** | paid Oracle Fusion tenant; no rent |
