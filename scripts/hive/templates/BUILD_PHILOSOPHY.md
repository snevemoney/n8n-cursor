# BUILD_PHILOSOPHY.md — programmatic software success (all build agents)

**CRITICAL:** Read `OPERATIONAL_MANDATE.md` first — four non-negotiable rules for human-count-one leverage.

Scale secrets: `EMPIRE_SECRETS.md` (data moat, liquidity, legacy arbitrage + deploy validation gate).

Read full YAML on hub: `SOFTWARE_SUCCESS_PHILOSOPHY.yaml` · `OPERATIONAL_MANDATE.yaml` · `EMPIRE_SECRETS.yaml` (Big Boss workspace)

## Core directive

**Minimize code surface area while maximizing addressable market.** Code is liability; APIs and catalog webhooks are assets.

## Before you write or refactor

1. **Core question:** Mandatory problem? Minimum custom LOC?
2. **Scalability:** Callable via `/api/hive/*`, Philanthropy `/api/agent`, or n8n catalog webhook — without UI?
3. **Distribution/health:** Register + golden paths + execution IDs — not "ship and hope"?
4. **Hive gate:** Tier 3 blocked (money/deploy/secrets)? Dexter gate for medium+?
5. **Empire gate:** `bash scripts/hive/empire-validation-gate.sh "feature"` — data moat · liquidity · legacy arbitrage

## Rules (execute, don't debate)

### Ruthless minimization
- Reuse hive APIs, CE bridge, existing Philanthropy tools before new code.
- Prefer deletion/refactor over expansion.
- >5 files for a tiny fix → stop; vertical slice.

### API-first
- Headless endpoint or webhook before UI.
- Document in INTEROP_CONTRACTS or N8N_WORKFLOW_CATALOG.

### High utility only
- Prioritize: golden-path failures, CE queue pain, operator manual steps.
- De-prioritize: cosmetic UI, speculative features.

### Distribution (parallel, not after)
- Business squad drafts; **Tier 3** for any client-facing send.
- Tie SEO/landing work to CE funnel or `/work` catalog.

### Hyper-instrumentation
- After change: typecheck/test → smoke → `scorpion_register_outcome` + `correlationId`.
- Use `n8n_get_execution`, `hive report`, expert-audit — not operator bug reports.
- Rollback/deploy fixes → `hitl_propose_action`, never `deploy_trigger` from Telegram.

## Stack (this hive)

TypeScript/Next.js: Scorpion, Client Engine, Philanthropy. n8n = glue. OpenClaw = Telegram face.

## Problem we solve

Operator runs hive at 9–5: Telegram → agents/n8n → CE money + Scorpion ops, HITL on money/deploy/secrets.

## Role hints

| You | Focus |
|-----|--------|
| Forge / Sigint / Naomi / Herald | Takes 1, 2, 5 on every change |
| SolidSnake / VenomSnake | Take 3 + architecture |
| Ocelot / Business / Scout | Takes 3, 4 — money on `/pro` |
| Big Boss | Checklist + Tier 2 ops, Tier 3 propose |

Execute and verify. Docs alone ≠ done.
