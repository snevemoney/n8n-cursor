---
source: Librarian + JSON miner (executor)
date: 2026-08-12
from: hive workflow JSON + estate maps + one-pagers
---

# n8n agent playbooks (node-learned, deepened)

**Purpose:** Teach each Grok owner how their legacy n8n workflows actually work (nodes, secrets, HITL, failover) so they can run their role without guessing.
**Truth:** 177 workflows · 69 active · 108 inactive · 17 archived · 3.2% prod fail.
**Canon maps:** [[CONTENT/n8n-learning/agent-workflow-map]] · [[CONTENT/n8n-learning/full-estate-agent-map]]
**Deep one-pagers:** `one-pagers/INDEX.md` (and `~/.grokbot/research-packets/n8n-one-pagers/`).

## Universal node lessons (every agent)

1. **Shape:** Most hive flows are `webhook|schedule → code → httpRequest(s) → respondToWebhook`.
2. **correlationId:** Code nodes mint `body.correlationId || \`prefix-${Date.now()}\``. Always pass one when calling.
3. **Auth:** Forward/router nodes often send `X-Hive-Secret` — never paste secrets in chat; use env/operator.
4. **Register sink:** Many flows POST audit to `https://evenslouis.ca/scorpion/api/hive/register`. Side effect, not the product.
5. **HITL paths:** CE leads, error-heal merge, predictive activate, ElevenLabs client, master orchestrator paid → propose only; operator /pro or Grok Tier 3.
6. **Failover chain:** `telemetry-ingest` CRITICAL → `hive-error-heal`; `toolbox-router` fail → error-heal; `founder-signal` may forward predictive (inactive draft); error-heal text escalates to `hive-creative-pivot` at fix_attempt≥3.
7. **Grok-first:** Prefer plugins/scripts; call n8n only when your map row is ACTIVE and Grok cannot do the job.
8. **Archived:** Non-callable even if `active=true`. UI ~160 = non-archived.
9. **Debug:** Visual debug SOP — canvas + failing node + Executions screenshots.
10. **Zero-loss:** Never wipe n8n_data, never n8ncloud, no activate/merge/main without Tier 3.

## Per-agent kits (deep pointers)

### Watchdog — health & bus
- **ACTIVE hive JSON:** `golden-path-smoke-notify` (Webhook→Register), `telemetry-ingest` (Normalize→Register→CRITICAL?→Telegram‖error-heal), `ecosystem-router` (Resolve Route map→Forward+secret / 404).
- **Route keys FACT:** golden-path-smoke, error-heal, outer-heaven-report, market-signal, ce-lead-notify, founder-signal, meta-critique, predictive-construct.
- **Also:** Security/Emergency/Error Recovery/Backup/QA + browser tools (estate **INFERENCE** names).
- **Missing:** hive-disk-alert (404) — do not invent.
- **One-pager:** [[one-pagers/watchdog]]

### Forge — fix / self-heal
- **ACTIVE JSON:** `error-heal-notify` (Normalize Error cid `self-heal-*`→Register→Telegram; escalate pivot ≥3), `creative-pivot-notify` (costHalt>$15 / attempt≥3 → `need_hitl`).
- **Pattern:** Self-heal proposes PR; operator merges. Creative pivot = loop-cost heuristic, not auto aesthetic deploy.
- **Hygiene:** Active SaaS scaffolds = document/archive candidates.
- **One-pager:** [[one-pagers/forge]]

### Big Boss — digests & founder loop
- **ACTIVE JSON:** `daily-operational-digest` (cron 0 12 * * *→missions+GP→Build Digest→Telegram→Register), `founder-signal-ingest` (Analyze→Register→Predict?→predictive), `toolbox-router` (JSON-RPC registry→Invoke; failover error-heal), Master Orchestration (HITL, nodes UNVERIFIED).
- **Repo JSON:** `hive-operator-digest` (cron 0 11 * * * + webhook; structured grokMission) — live name absent from 14 hive list → verify alias.
- **One-pager:** [[one-pagers/big-boss]]

### Librarian — memory bus
- **ACTIVE JSON:** `outer-heaven-report-notify` (webhook+cron Mon 14:00 UTC→Fetch GP→Format→Telegram→Register).
- **Repo JSON:** `hive-chronicle-ingest` (Normalize→Register→highSignal?→founder-signal); file `active:false`; not in live hive names — verify.
- **Reads:** outer-heaven-brief.py / vault — n8n is ingest/notify glue only.
- **One-pager:** [[one-pagers/librarian]]

### Lead Hunter — leads (HITL)
- **ACTIVE JSON:** `ce-lead-notify` (Format Lead cid `ce-lead-*`→Register→Telegram→Respond; /pro Tier 3).
- **ACTIVE names:** phase9-pipedrive-lead + New Leads / Apollo / scrapers (nodes UNVERIFIED).
- **One-pager:** [[one-pagers/lead-hunter]]

### Communications Manager
- **ACTIVE names:** Email Notification System (`/webhook/notifications/email`), Evens Email Reply Agent — nodes UNVERIFIED.
- **INACTIVE HITL:** Support Agent Webhook.
- **Never** client send without Tier 3.
- **One-pager:** [[one-pagers/communications-manager]]

### Creative Studio
- **ACTIVE name:** elevenlabs post-call (HITL); Nana/image/combine/background; Nano Photoshop — nodes UNVERIFIED.
- **Secondary JSON:** creative-pivot with Forge.
- **One-pager:** [[one-pagers/creative-studio]]

### Researcher
- **Prefer:** web-learning-cycle.py / hive-web-research.py over n8n.
- **ACTIVE estate names:** Company/Market research, Summarize site, Website scraper; pick **one** PDF RAG (3 dupes).
- **No hive research JSON.** Never spam research webhooks.
- **One-pager:** [[one-pagers/researcher]]

### Money Desk
- **ACTIVE JSON:** `revenue-sensor-hourly` (hourly→Fetch GP→Form Hypothesis→Register). Prefer `hive-revenue-sensors.py`; no autonomous treasury.
- **One-pager:** [[one-pagers/money-desk]]

### Wealth Manager
- **ACTIVE name:** Automated Stock Analysis Reports — nodes UNVERIFIED.
- Personal CFO: inactive financial ops only if operator scopes + HITL.
- **One-pager:** [[one-pagers/wealth-manager]]

### Consultant
- **INACTIVE JSON:** `meta-critique-notify`, `sunday-meta-critique` (cron→Register→Telegram→telemetry). Output = Forge staging PR directive.
- **One-pager:** [[one-pagers/consultant]]

### Product GTM
- **INACTIVE JSON:** `predictive-construct` (Build Draft→Inject n8n API `/workflows`→Register HITL). Never auto-activate.
- Suppress loud GTM until offer validated.
- **One-pager:** [[one-pagers/product-gtm]]

### HITL Operator
- Gate every HITL=true path + any activate of inactive workflows. Surfaces /pro and Tier 3.
- **One-pager:** [[one-pagers/hitl-operator]]

### Day Planner
- Consume digest outputs (daily + operator JSON fields); Voice/Gcal secondary — prefer Grok Calendar/Gmail plugins.
- Do not own webhook firing.
- **One-pager:** [[one-pagers/day-planner]]

### No primary n8n today
Career Strategist · Publishing Engine (inactive social templates only when operator scopes).
