# n8n → Grok Agent Association Map

**Purpose:** Bind existing https://evenslouis.ca/n8n workflows to the right Grok agents as **legacy tools** (not daily OS).  
**Sources:** `scripts/hive/n8n-catalog.json`, `docs/hive/N8N_WORKFLOW_CATALOG.md`, workflow JSON under `workflows/hive/`.  
**Date:** 2026-08-12 · Researcher  
**Live Active/Inactive on VPS:** UNVERIFIED here — Watchdog confirms via Executions/UI.

## Rules for every agent

1. Prefer Grok plugins/scripts first. Call n8n only when this map says the workflow is yours **and** Grok cannot do the job.
2. Base URL: `https://evenslouis.ca/webhook` + path. UI: `https://evenslouis.ca/n8n`.
3. Auth: most hive routes need `X-Hive-Secret` — never paste secret values in chat; ask operator if missing.
4. `HITL=true` → propose only; operator approves (money/send/deploy/activate).
5. Never wipe `n8n_data`. Never n8ncloud.tech. No greenfield workflows.
6. Always pass `correlationId` when schema requires it.

Legacy OpenClaw owner names in catalog (Big Boss, Herald, Naomi, Scout, …) are remapped below to **current Grok agents**.

---

## Master map

| Workflow | Path / trigger | HITL | Primary agent | Secondary | When to use |
|----------|----------------|------|---------------|-----------|-------------|
| `hive-golden-path-smoke-notify` | `/webhook/hive-smoke-notify` | no | **Watchdog** | Big Boss | Health smoke after changes |
| `hive-outer-heaven-report-notify` | `/webhook/hive-outer-heaven-report` | no | **Librarian** | Watchdog | Weekly Outer Heaven report cron/notify |
| `hive-operator-digest` | `/webhook/hive-operator-digest` + cron | no | **Big Boss** | Day Planner | Morning operator JSON digest |
| `hive-daily-operational-digest` | cron | no | **Big Boss** | Watchdog | State-of-hive Telegram digest |
| `hive-telemetry-ingest` | `/webhook/hive-telemetry-ingest` | no | **Watchdog** | Forge | Boot/test/CRITICAL telemetry |
| `evens-email-notify` | `/webhook/notifications/email` | no* | **Communications Manager** | Watchdog | Operator email fallback (not client send) |
| `hive-error-heal-notify` | `/webhook/hive-error-heal` | **yes** | **Forge** | Watchdog, HITL Operator | Self-heal propose → PR; operator merges |
| `hive-ecosystem-route` | `/webhook/hive-ecosystem-route` | no† | **Watchdog** | Big Boss | Master router to other hive webhooks |
| `hive-execute-tool` | `/webhook/hive-execute-tool` | no† | **Big Boss** | Watchdog | JSON-RPC toolbox router (legacy) |
| `hive-ce-lead-notify` | `/webhook/hive-ce-lead-notify` | **yes** | **Lead Hunter** | Money Desk, HITL Operator, Product GTM | CE lead → register + alert; approve on /pro |
| `phase9-pipedrive-lead` | `/webhook/phase9-pipedrive-lead` | **yes** | **Lead Hunter** | Money Desk, HITL Operator | Pipedrive inbound; do not fire casually |
| `evens-master-orchestrator` | `/webhook/master-orchestrator` | **yes** | **Big Boss** | HITL Operator | Legacy master orchestration; paid/client = HITL |
| `evens-support-agent` | `/webhook/support-agent` | **yes** | **Communications Manager** | Consultant | Support webhook; operatorConfirm |
| `evens-elevenlabs-post-call` | `/webhook/cb151ce6-…` | **yes** | **Creative Studio** | Communications Manager | Voice/ElevenLabs; client audio = HITL |
| `hive-founder-signal` | `/webhook/hive-founder-signal` | no | **Big Boss** | Librarian, Researcher | Founder behavior / note ingest |
| `hive-chronicle-ingest` | `/webhook/hive-chronicle-ingest` | no | **Librarian** | Big Boss | Outer Heaven chronicle ingest |
| `hive-meta-critique` | `/webhook/hive-meta-critique` | **yes** | **Consultant** | Forge, Big Boss | CRITIQUE directive → Forge staging PR |
| `hive-sunday-meta-critique` | cron | **yes** | **Consultant** | Forge | Weekly meta-critique cron |
| `hive-predictive-construct` | `/webhook/hive-predictive-construct` | **yes** | **Product GTM** | Forge, HITL Operator | Inactive DRAFT only; never auto-activate |
| `hive-creative-pivot` | `/webhook/hive-creative-pivot` | **yes** | **Forge** | Big Boss, Creative Studio | Loop-cost pivot heuristic |
| `hive-market-signal-ingest` | `/webhook/hive-market-signal` | no | **Lead Hunter** | Researcher, Product GTM | Planned — prefer revenue-sensors script |
| `hive-feature-priority-rank` | `/webhook/hive-feature-rank` | no | **Product GTM** | Consultant | Planned — prefer scripts |
| `hive-revenue-sensor-hourly` | cron / script | no | **Money Desk** | Watchdog, Product GTM | Prefer `hive-revenue-sensors.py` over n8n |
| `hive-web-learning-cycle` | VPS cron script | no | **Researcher** | Librarian | Prefer `web-learning-cycle.py`; n8n stub inactive |
| `hive-ce-leads-digest` | TBD | no | **Lead Hunter** | Money Desk | Planned Phase 3 |
| `hive-disk-alert` | cron planned | no | **Watchdog** | — | Planned hardening |

\* Operator notify only — never client email without Tier 3.  
† Downstream route may be HITL — check target workflow.

---

## Per-agent legacy kit (cheat sheet)

### Watchdog — health & bus
- Own: `hive-golden-path-smoke-notify`, `hive-telemetry-ingest`, `hive-ecosystem-route` (ops routing), `hive-disk-alert` (planned)
- Watch: all Executions errors; catalog drift; OAuth expiry; n8ncloud refs
- Scripts: `smoke-*.sh`, `hive-watchdog.sh`, `life-business-ops-fix.sh`

### Forge — fix / self-heal
- Own: `hive-error-heal-notify`, `hive-creative-pivot`
- Support: meta-critique PRs, predictive drafts (inactive), import scripts only
- Never: merge main, activate prod, wipe volumes

### Big Boss — digests & founder loop
- Own: `hive-operator-digest`, `hive-daily-operational-digest`, `hive-founder-signal`, `hive-execute-tool`, `evens-master-orchestrator` (HITL)
- Morning: prefer Grok brief; n8n digest = fallback feed

### Librarian — memory bus
- Own: `hive-chronicle-ingest`, `hive-outer-heaven-report-notify`
- Prefer: `outer-heaven-brief.py` + vault for reads; n8n for ingest/notify glue

### Day Planner
- Consume: `hive-operator-digest` output (do not own webhook firing)
- Calendar/email: Grok plugins first

### Lead Hunter
- Own: `hive-ce-lead-notify`, `phase9-pipedrive-lead`, `hive-market-signal-ingest` (planned)
- All lead mutates → HITL /pro

### Money Desk
- Watch/use: `hive-revenue-sensor-hourly` (prefer Python), CE lead money implications with HITL Operator
- No autonomous treasury

### HITL Operator
- Gate: any `HITL=true` row — especially CE leads, error-heal merge, predictive activate, ElevenLabs client, master orchestrator paid paths

### Communications Manager
- Own: `evens-email-notify` (operator), `evens-support-agent` (HITL)
- Client send still Tier 3

### Product GTM
- Own: `hive-predictive-construct` (draft only), `hive-feature-priority-rank` (planned)
- Suppress loud GTM until offer validated (north star #3)

### Consultant
- Own: `hive-meta-critique`, `hive-sunday-meta-critique`
- Output = directive to Forge, not prod deploy

### Creative Studio
- Own: `evens-elevenlabs-post-call` (HITL for client-facing)
- Secondary on creative-pivot aesthetics

### Researcher
- Own: `hive-web-learning-cycle` (script-first)
- Secondary: market-signal research packets; never blind-fire webhooks for research spam

### Agents with **no** primary n8n workflow today
Wealth Manager · Personal CFO · Career Strategist · Publishing Engine — stay on Grok/plugins/vault unless a catalog row is added later.

---

## How agents should “learn” a workflow (ops ritual)

1. Read this map row + catalog `inputSchema`.
2. Open workflow in https://evenslouis.ca/n8n (read-only) or JSON under `workflows/hive/`.
3. Check last Executions (Watchdog) — success/fail pattern.
4. Dry-run with fixture from `N8N_WORKFLOW_CATALOG.md` only if low-risk and secret available via env — else propose to operator.
5. Save one-line “I own X” into agent memory / Librarian.

---

## Confidence

- Association from catalog + doctrine owners remapped to Grok roster: **FACT** (repo) + **OPINION** on secondary owners where catalog used OpenClaw codenames.  
- Live activation state: **UNVERIFIED** until Watchdog UI pass.  
- Planned rows: do not call until status ≠ planned.

---

## Visual debug SOP (operator 2026-08-12)

When a owned workflow is **off, failing, or drift-suspect**, the primary agent MUST use Grok **browser/computer** on https://evenslouis.ca/n8n (read-only by default):

1. Open the workflow canvas (not only Executions list).
2. Screenshot: (a) full workflow map / node graph, (b) the failing node’s parameters + error, (c) Executions detail for the bad run.
3. Attach those screenshots in the operator chat (and to Forge if a fix/PR is needed).
4. Do **not** guess from memory of the graph — pixels beat prose.
5. Login/2FA → hand box to operator (`request_box_help`); never ask for passwords in chat.
6. Still zero-loss: no credential edits, activate toggles, or volume wipes without Tier 3.

**Default owners for this ritual:** Watchdog (health/failures), Forge (fix loops). Others screenshot when their owned workflow misbehaves.

---

## Live status snapshot (Watchdog 2026-08-12 ~14:30 ET)

| Catalog | Evidence | Status |
|---------|----------|--------|
| hive-golden-path-smoke-notify | POST → 200 Workflow started | **ACTIVE** |
| hive-telemetry-ingest | POST → 200 Workflow started | **ACTIVE** |
| hive-ecosystem-route | active=true in list; POST → 200 | **ACTIVE** |
| hive-disk-alert | POST → 404 | **MISSING / planned** |

Note (FACT from Watchdog): `n8n_list_workflows` ~30 workflows / ~14 active; display names may not match catalog ids for smoke/telemetry — **production webhook response is source of truth**. Naming drift = Watchdog ongoing watch item. Do not invent disk-alert until operator scopes import.

---

## Inventory caveat (2026-08-12 ~14:51 ET)

**FACT (operator + Watchdog):** n8n UI shows ~**160** workflows; list API reported ~**30**.  
Prior association map rows based on `n8n-catalog.json` + API are a **subset**, not the full estate.  
Full inventory = signed-in UI scrape (in progress: Watchdog + Researcher). Remap to follow.

---

## Inventory resolved (2026-08-12 ~14:53 ET)

**Root cause:** pagination bug (`limit=30`, no cursor) — not missing workflows.  
**Truth:** **177** workflows · **69** active · **108** inactive (API export).  
**Full remap:** [full-estate-agent-map.md](./full-estate-agent-map.md)  
**Live files (Mac repo):** `docs/hive/outer-heaven/CONTENT/n8n-learning/live-workflow-inventory.{md,json}`  
**UI scrape:** still for Visual debug screenshots / name drift — **not** for counts.
