---
name: Jev preflight
description: >-
  Use before an expensive model call or tool run when the question is bounded
  (classify, score, route, rank, flag, narrow). Jev is the shared cheap
  fast-judgment layer (judgment.evaluate). It saves frontier calls. It is not a
  second brain and it never approves sends, merges, spend, deploys or publishes.
---

# Jev preflight (shared fast judgment)

Operator lock 2026-09-23. Jev is an optional cheap preflight that runs before expensive reasoning or tools. It is not a second brain.
Right now its main job is **cheap triage that saves paid model calls** (every platform is near its usage cap).

## When to call Jev
Call it when **all** of these are true:
1. The question is bounded: a fixed set of choices, a score, a route, a rank, or a flag.
2. A wrong answer costs little, or a human or deterministic check catches it later.
3. The alternative is spending a frontier or Opus-class turn just to decide *where* to go.

Skip Jev and use code when you're checking exact state: pid alive, file exists, row count, exit code, CI status. Those are deterministic checks, not judgment calls.
Skip Jev and use a frontier model for open generation, coding, architecture, research synthesis, or conversation.
Send it to a human for authority: send, pay, deploy, merge, publish, book, credential change, destructive git, or a public port.

## May / may not
| MAY | MAY NOT |
|---|---|
| classify, score, route, rank, flag, narrow, suggest, escalate | invent authority, or approve hard steps (send / merge / spend / deploy / publish) |
| return a distribution with an `other` or no-opinion exit | declare a job done, or replace independent verification |
| abstain: NO_ACTION / WAIT / ASK / ESCALATE | silently rewrite shared memory |
| | be Jarvis's brain or conversational mouth, or write code |

If confidence is below the threshold, Jev has no opinion and the call goes to the frontier model. Confidence is not evidence.

## Modes
- **SHADOW**: Jev runs and its answer is logged. Nothing acts on it. Start every new wire here.
- **ADVISORY**: the answer is shown to the agent or operator, and the agent decides. This is the default for desks.
- **ASSIST**: Jev narrows or pre-fills, and the agent confirms.
- **GATE**: Jev can *block or route away* (for example: skip the expensive call, or escalate). It can never *approve* a hard step. Only use GATE after calibration (Brier/ECE per pack, false-block rate).

## Packs (role → pack in `scripts/hive/eng/jev-question-packs-v1.yaml`)
The SSOT names role packs under `jev/packs/`. **That directory doesn't exist on main yet.** The packs are sections of the single YAML file:
| Role pack (SSOT name) | YAML pack(s) | Overlay |
|---|---|---|
| big-boss-routing | `intake.core`, `route.select`, `context.select` | `big_boss` |
| watchdog-preflight | `verification.proof`, `completion.preclose`, `incident.triage` | `watchdog` |
| researcher-signal | `signal.triage`, `research.deep` | `researcher` |
| librarian-memory | `memory.provenance` | `librarian` |
| forge-engineering | `engineering.prebuild`, `engineering.architecture`, `infrastructure.change` | `forge` |
| creative-reference | `creative.reference` (+ the `jev-craft-gate` skill) | `creative_studio` |
| hitl-risk | `hitl.authority`, `publishing.preflight`, `finance.decision` | `hitl_operator` |

The pack cap is 12 questions per call. Ask one judgment per question, and pin the phrasing, threshold and version.

## How to call it
**A. Boundary / router (offline, deterministic, free). Use this first everywhere.** From a checkout of `snevemoney/n8n-cursor`:
```bash
python3 scripts/hive/eng/judgment.py --json '{"role":"big_boss","verb":"route","pack":"route.select","evidence":[{"kind":"task","summary":"..."}]}'
```
It returns `lane` (deterministic / jev / frontier / human) and `action`. `lane=jev` means a bounded Jev call is allowed. `frontier` means use the paid model. `human` means escalate.
The verbs Jev may take are: route, rank, gate, filter, score, react, select. `select` builds an OpenRouter request but sends it **only** if `HIVE_OPENROUTER_CALL=1`.

**B. Live named slots (TypeSafe Jev, `typesafe/jev-1.13` via the OpenRouter Decisions API).** These are LIVE for six slots since operator GO 2026-09-22: `support_queue_route`, `signal_relevance`, `demo_shelf_priority`, `claim_epistemic_class`, `cheap_vs_expensive_route`, `tool_call_risk_hint`.
**Box (works today, verified 2026-10-11 10:46 ET, status OK, ~$0.000015/slot).** `OPENROUTER_API_KEY` is now in the box env (never print it):
```bash
cd /workspace/packages/typesafe-jev-hive && PYTHONPATH=src python3 -m typesafe_jev_hive.live_slots --out <file> --slots <slot>
```
**Custom questions:** use the client API in `src/typesafe_jev_hive/client.py`:
```python
import sys; sys.path.insert(0, "/workspace/packages/typesafe-jev-hive/src")
from typesafe_jev_hive.client import decide   # decide(state, questions, *, model, session_id, timeout_s)
res = decide({"text": "..."}, {...})          # questions validated by validate_questions(); max 12
```
If you ever get `BLOCKED_MISSING_KEY` / `MissingKeyError`, report it and fall back to path A.

**C. Shared LiteLLM `jev` endpoint (LIVE 2026-10-11, preferred cross-platform path).** Base `https://llm.evenslouis.ca/v1`, model `jev` (= typesafe/jev-1.13 decisions API behind an OpenAI-compatible proxy). Every call **must** carry `choices: [...]` or `questions: {...}`; plain chat returns 400. Each key is capped at $1 / 30 days and only allows model `jev`. Keys live in `/home/box/.secrets/owned-tools.env` as `LITELLM_KEY_{JARVIS,CLAUDE_CODE,CODEX,CURSOR,GROK_DESKS}`. Never print them. Grok desks use `LITELLM_KEY_GROK_DESKS`.
```bash
set -a; . /home/box/.secrets/owned-tools.env; set +a   # loads keys silently
curl -s https://llm.evenslouis.ca/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_KEY_GROK_DESKS" -H "Content-Type: application/json" -d '{
  "model":"jev",
  "messages":[{"role":"user","content":"<task or item text>"}],
  "questions":{
    "needs_expensive":{"type":"noul","instructions":"Does this need a frontier model rather than a cheap classifier?"},
    "desk":{"type":"choice","instructions":"Which desk owns this?","criteria":{"researcher":"research","forge":"engineering","other":"anything else"}}}}' \
  | jq -r '.choices[0].message.content'
```
Short form: `"choices":["a","b","c"]` instead of `questions` gives `{"answer":{"choice":...,"probabilities":...,"confidence":...}}`. Question types: `choice` (closed labels + probabilities + confidence), `noul` (0-1 yes-likelihood), `score` (ordered legend 0..n, returns expected score + distribution). Verified 2026-10-11 ~10:58 ET with the grok-desks key: HTTP OK, 2 answers, 444 tokens.
Per-platform snippets (SDK, Codex `model_providers`, Cursor, Claude Code): `/workspace/research/packets/jev-everywhere-20261011/ENDPOINTS.md`.

Path order: A (free, deterministic boundary) → C (shared endpoint) → B (box direct, OpenRouter key) as fallback if the proxy is down.

## How to wire it, per platform (cheap → expensive cascade)
Pattern everywhere: (1) deterministic check in code → (2) one Jev call with closed `questions` → (3) act on the band: C3+ and low-risk → proceed on the cheap path; C1–C2 → show as advice, agent decides; C0 or `needs_expensive` ≥0.5 → escalate to the frontier model; hard step → human. Log a `jev:` receipt line.
- **Router call (all platforms).** One curl with `needs_expensive` (noul) + `model_tier` choice (e.g. `["small","mid","frontier"]`) before choosing a model or spawning sub-agents. LOCALLY_SUPPORTED: endpoint verified today with a noul + choice body. Source: ENDPOINTS.md, this skill path C.
- **Claude Code.** Keep the default model. Add `.claude/commands/route.md` (slash command) or a hook that runs the curl with `$LITELLM_KEY_CLAUDE_CODE` and choices `["haiku-ok","sonnet","opus"]`; pick the sub-agent model from the answer. CANDIDATE (`/workspace/research/packets/jev-everywhere-20261011/ENDPOINTS.md`). Ships to the Mac via `~/.claude/skills/jev-preflight`.
- **Codex.** Add a `[model_providers.evens-llm]` entry (`base_url` the proxy, `env_key = "LITELLM_KEY_CODEX"`, `wire_api = "chat"`) but do NOT set `model = "jev"` as default; call Jev from a script/tool before long reasoning. CANDIDATE (ENDPOINTS.md).
- **Cursor.** A rule/command runs the curl with `$LITELLM_KEY_CURSOR`; use slot `cheap_vs_expensive_route` before picking a premium model or launching a cloud agent. Custom base URL + model `jev` only works for explicit calls carrying `choices`. CANDIDATE (ENDPOINTS.md).
- **Jarvis.** `apps/agent-stack/brain/jev_preflight.py` (PR #602, OPEN, not merged), SHADOW behind `JARVIS_JEV_PREFLIGHT=1`, logs one line to `hive/bus/jev-preflight.jsonl`, never changes the spoken reply, never raises. Routing through the proxy needs a small change in `judgment.py` (base URL, `LITELLM_KEY_JARVIS`, `choices`/`questions`). judgment.py rejects Jev as `jarvis_model`. Jarvis runs on Evens's Mac. CANDIDATE (`jev-everywhere-20261011/JARVIS-FINDINGS.md`); needs operator OK to merge/enable.
- **Grok desks.** Run `/home/box/.local/bin/jev-route "<task>" grok-desks [--pack <role>] [--critical]` before fan-out/cloud-agent launch (keys: `/home/box/.config/jev/keys.env`, mode 600, grok-desks key only). Packs: forge, researcher, watchdog, hitl_operator, money_desk, communications_manager, creative_studio (`~/.local/share/jev/packs.json`). Use `--critical` for anything touching files outside scratch, infra or money. Act on `action=`: proceed → cheap path; advise → your call; ask → ask the operator; escalate → frontier. `hard_step=human` → stop for the operator whatever Jev says. Every call is logged to `~/.local/state/jev/route.jsonl` for the weekly calibration. ADVISORY. LOCALLY_SUPPORTED (v2 receipts 2026-10-11, `/workspace/research/packets/jev-v2-20261011/`).
- **Router v2 (all platforms).** `jev-route "<task>" <platform> [--critical] [--pack X]`; outputs tier, needs_expensive, confidence, band, action, hard_step, reason; falls back to `tier=frontier` on any error. Mac bundle `/workspace/jev-wire-20261011b.tgz`. LOCALLY_SUPPORTED (box live tests).
- **Gating thresholds.** Stay SHADOW/ADVISORY until per-pack calibration exists (Brier/ECE, false-block rate). GATE may only block/route away, never approve. CANDIDATE (packs YAML `confidence_policy`, `modes`).

## Desk → pack map (Grok desks)
| Desk | Pack(s) in jev-question-packs-v1.yaml | Good live slot / question |
|---|---|---|
| Consultant | `business.opportunity`, `engineering.product` | `cheap_vs_expensive_route` |
| Money Desk | `business.opportunity`, `finance.decision` | `signal_relevance` |
| Forge | `engineering.prebuild`, `engineering.architecture`, `infrastructure.change` | `tool_call_risk_hint` |
| Personal CFO | `finance.decision` | choice: bill/category labels |
| Researcher | `signal.triage`, `research.deep` | `signal_relevance`, `claim_epistemic_class` |
| Wealth Manager | `finance.decision` | `claim_epistemic_class` |
| Librarian | `memory.provenance` | `claim_epistemic_class` |
| HITL Operator | `hitl.authority` | `tool_call_risk_hint` (advisory only) |
| Disk Saver | `infrastructure.change`, `incident.triage` | `tool_call_risk_hint` |
| Lead Hunter | `business.opportunity`, `gtm.readiness` | noul: lead fits ICP |
| Communications Manager | `publishing.preflight`, `intake.core` | `support_queue_route` |
| Watchdog | `verification.proof`, `completion.preclose`, `incident.triage` | `support_queue_route` |
| Creative Studio | `creative.reference` (+ `jev-craft-gate`) | `craft_*` slots |
| Day Planner | `intake.core`, `execution.refocus` | score: priority 0-2 |
| Publishing Engine | `publishing.preflight` | `demo_shelf_priority` |
| Product GTM | `gtm.readiness`, `engineering.product` | `demo_shelf_priority` |
| Career Strategist | `business.opportunity`, `signal.triage` | `signal_relevance` |
Pack questions are prompts you turn into ≤12 `questions` entries (one judgment each, closed labels). Add `other`/`unclear` to every choice.

## Learned from signals (methods)
Label: LOCALLY_SUPPORTED = backed by a local receipt/test; CANDIDATE = documented design, not yet proven here.
1. **Three question shapes: choice / noul / score.** LOCALLY_SUPPORTED: 13/13 slots OK 2026-10-11 (`/workspace/research/packets/jev-live-20261011/receipt.json`) plus today's endpoint test.
2. **Cost ≈ $0.000015–0.000024 per call (~400 in / ~50 out tokens).** LOCALLY_SUPPORTED (same receipt; 13 slots ≈ $0.0002). At $1/key/30d that is ~40k calls, so cost is not the constraint; the constraint is question quality.
3. **Closed labels with an `other`/`unclear`/abstain exit; one judgment per question; ≤12 per call; pin phrasing + version.** IMPLEMENTED in jev-route v2 (`unclear` tier → ASK; `packs.json` v`packs-v1.0-20261011`, 7 role packs ≤12 questions, lane choice has `other`/`unclear`). LOCALLY_SUPPORTED: /workspace/research/packets/jev-v2-20261011/receipts.txt. Source design (`scripts/hive/eng/jev-question-packs-v1.yaml`, `slots.py`, `client.validate_questions`).
4. **Confidence bands** (jev-route v2 prints `band=`; C0 → frontier, C1 → `action=advise`)**: C0 <0.55 = abstain/no opinion → frontier; C1 0.55–0.69 advisory only; C2 0.70–0.84 assist with guardrails; C3 0.85–0.94 eligible for validated low-risk automation; C4 ≥0.95 still cannot override authority.** CANDIDATE (packs YAML `confidence_policy`).
5. **Confidence caps:** no fresh live-state evidence ≤0.79; unresolved source conflict ≤0.69; self-report-only verification ≤0.69; mock-only for a live claim ≤0.54; missing operator authority = BLOCKED regardless. CANDIDATE (packs YAML).
6. **Critical decisions use the MIN confidence across critical questions, not the average.** IMPLEMENTED (`--critical`: min of tier, risk, reversible). LOCALLY_SUPPORTED (/workspace/research/packets/jev-v2-20261011/receipts.txt, docker-cleanup and key-rotate cases). Source (packs YAML `decision_rule`).
7. **Escalate to expensive model when:** `needs_expensive` noul ≥0.5, any critical answer in C0, the top-two choice probabilities are close, or the task is open generation/code/architecture/taste. IMPLEMENTED except the open-generation/taste rule (needs_expensive ≥0.5, C0 → frontier, top-two gap <0.15, critical C0/risk high). LOCALLY_SUPPORTED (top2-close fired live on the deploy case); thresholds still uncalibrated. Source (slot `cheap_vs_expensive_route` criteria in `slots.py`; band policy). Note: noul values seen today were 0.30 and 0.42 on bounded tasks, so 0.5 is a sane cut, not a calibrated one.
8. **Confidence is not evidence.** A request carrying confidence but no evidence is routed deterministic/NO_ACTION. CANDIDATE (`judgment.py` `confidence_is_evidence: False`).
9. **Abstain is a valid output** (NO_ACTION / WAIT / ASK / ESCALATE). IMPLEMENTED (`action=ask` on `unclear`; pack lane has ask/no_action/human). LOCALLY_SUPPORTED ("fix it", "Improve the onboarding" → ask). Source (`judgment.py` ABSTAIN set).
10. **Calibrate before GATE:** per-pack labeled cases, historical replay, shadow runs, Brier/ECE/reliability, false-block and missed-risk rates, latency/cost overhead. TOOLING IMPLEMENTED: every call logs to `~/.local/state/jev/route.jsonl` (sha256, no text); `/workspace/research/packets/jev-calibration/jev-calibrate.py` + `labels.csv` give accuracy, false/missed escalation, Brier/ECE, latency. Still CANDIDATE as a calibration: 0 labels so far (packs YAML `calibration_required`); no local calibration exists yet, so desks stay ADVISORY.
11. **Craft gate threshold:** per-frame premium needs confidence ≥0.65; visual inspect (≥12 frames) must be complete before Jev answers craft questions. CANDIDATE (`slots.py` `frame_premium_vs_cheap`, `pre_video_visual_inspect_complete`).
12. **Failure mode: overconfident absolutes.** Today choice slots returned confidence 1.0 on short text. Treat 1.0 on thin state as C2 at most. IMPLEMENTED (cap 0.84). LOCALLY_SUPPORTED (receipt: support_queue_route, claim_epistemic_class).
13. **Failure mode: research theater.** The Jev packet + `BLOCKED_MISSING_KEY` was once sold as a product; a dry-run/doc is not a live call. CANDIDATE (`/workspace/research/packets/hive-eng-matrix-fix-20260922/matrix/failure-modes-v0.md`).
14. **Failure mode: lock-stall.** Reciting locks instead of deciding; emit one `BLOCKED:<reason>` + unlock owner instead. CANDIDATE (same file).
15. **Failure mode: plain chat to `jev`** returns 400; Jev cannot be the main model in Claude Code/Codex/Cursor. LOCALLY_SUPPORTED by proxy design doc (`jev-everywhere-20261011/ENDPOINTS.md`); today's call with `questions` succeeded.
16. **Advisory risk slots never authorize execution;** hard allow/block stays in code RISK_GATE. IMPLEMENTED: keyword rule (send/merge/deploy/publish/pay/delete/rotate) prints `hard_step=human` regardless of Jev; the risk slot is advice only. LOCALLY_SUPPORTED (/workspace/research/packets/jev-v2-20261011/receipts.txt). Source (`slots.py` `tool_call_risk_hint` note).

### Per platform
- **Grok desks (17):** operator order 2026-10-11 (Evens): Jev is the cheap first pass for every desk. Run Jev (path C, `LITELLM_KEY_GROK_DESKS`; path B fallback) for classify/route/score/rank/flag before expensive reasoning, tool fan-out, or cloud-agent launch; path A is the free deterministic check. Use your desk's pack from the desk map and ADVISORY mode. Locks are unchanged. Put the `lane`/`action` in your receipt.
- **Jarvis:** `apps/agent-stack/brain/jev_preflight.py` (draft PR #602) is SHADOW only, behind `JARVIS_JEV_PREFLIGHT=1`, and logs to `hive/bus/jev-preflight.jsonl`.
- **Claude Code / Codex (Mac):** in a repo checkout, run path A via Bash before spawning sub-agents or long reasoning. Path B only works where the key is exported.
- **Cursor (rules + cloud agents):** path B has the key there. Use the `cheap_vs_expensive_route` slot before choosing a premium model. Use path A for everything else.

## Related
- [owned-tools](sand-workflow:owned-tools): `oh-jev` CLI wrapper (path C) plus the owned search/transcribe/fetch/notify CLIs. Run jev-route before the expensive step.

## Receipt line (append to your work receipt)
`jev: pack=<pack> mode=<SHADOW|ADVISORY|ASSIST|GATE> tier=<tier> band=<band> lane=<lane> action=<action> hard_step=<human|none> live=<yes|no> authoritative=no`
