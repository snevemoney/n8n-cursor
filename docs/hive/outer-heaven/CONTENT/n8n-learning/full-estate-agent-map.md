# Full n8n estate → Grok agents (177 workflows)

**Truth source:** API inventory (paginated) — `docs/hive/outer-heaven/CONTENT/n8n-learning/live-workflow-inventory.{md,json}`  
**Generated:** 2026-08-12 · **177 total · 69 active · 108 inactive**  
**Bug fixed:** `n8n_list_workflows` was `limit=30` without cursor — not missing data.  
**Regenerate:** `python3 scripts/hive/n8n-export-workflow-inventory.py --write`  
**After philanthropy deploy:** `grok-hive-tool.py --grok-agent "Watchdog" --tool n8n_list_workflows --params '{"all":true}'` → expect meta.total 177.

## How to use this map

1. **Grok plugins/scripts first** — n8n is legacy bus.
2. Prefer **ACTIVE** rows below as callable legacy tools.
3. **INACTIVE** = templates/experiments — do not fire; Forge may archive/cleanup only with operator OK.
4. **Hive-named** rows stay canon with `n8n-catalog.json` webhook paths.
5. On failure: Visual debug SOP (screenshot canvas + failing node + Executions).
6. Never wipe `n8n_data` / never n8ncloud / HITL for send-money-activate.

---

## A) Hive core (catalog-aligned) — ACTIVE unless noted

| Live name | Catalog id | Active | Primary agent |
|-----------|------------|--------|---------------|
| Hive Golden Path Smoke Notify | hive-golden-path-smoke-notify | yes | Watchdog |
| Hive Telemetry Ingest | hive-telemetry-ingest | yes | Watchdog |
| Hive Ecosystem Master Router | hive-ecosystem-route | yes | Watchdog |
| Hive Outer Heaven Report Notify | hive-outer-heaven-report-notify | yes | Librarian |
| Hive Founder Signal Ingest | hive-founder-signal | yes | Big Boss |
| Hive Daily Operational Digest | hive-daily-operational-digest | yes | Big Boss |
| Hive Toolbox Router | hive-execute-tool | yes | Big Boss |
| Hive Error Heal Notify | hive-error-heal-notify | yes | Forge (HITL) |
| Hive Creative Pivot Notify | hive-creative-pivot | yes | Forge (HITL) |
| Hive CE Lead Notify | hive-ce-lead-notify | yes | Lead Hunter (HITL) |
| Hive Revenue Sensor Hourly | hive-revenue-sensor-hourly | yes | Money Desk |
| Phase 9 — Lead Pipeline (Pipedrive…) | phase9-pipedrive-lead | yes | Lead Hunter (HITL) |
| Email Notification System (active) | evens-email-notify | yes | Communications Manager |
| Master Orchestration System | evens-master-orchestrator | yes | Big Boss (HITL) |
| elevenlabs post call workflow | evens-elevenlabs-post-call | yes | Creative Studio (HITL) |
| Hive Meta Critique Notify | hive-meta-critique | **no** | Consultant (HITL) |
| Hive Sunday Meta Critique | hive-sunday-meta-critique | **no** | Consultant (HITL) |
| Hive Predictive Construct | hive-predictive-construct | **no** | Product GTM (draft only) |
| Support Agent Webhook | evens-support-agent | **no** | Communications Manager (HITL) |

Missing from live list vs catalog planned: `hive-disk-alert`, chronicle-ingest display name (check alias), operator-digest (may be named differently — Watchdog verify).

---

## B) Active non-hive — agent association (legacy tools)

### Watchdog (ops / security / browser infra)
- Security & Monitoring System
- Emergency Response System
- Error Recovery System
- Backup & Restore System
- Testing & QA System
- browser tool · start browser tool · Ultimate Browser Agent
- webhookSecurity (inactive — still Watchdog if revived)

### Lead Hunter (leads / social scrape / enrichment)
- New Leads Workflow
- Website Lead Capture with Apollo.io Enrichment…
- PI Attorney Lead Qualifier
- Find LinkedIn · Instagram finder · Social media finder
- Extract * Profile Data (FB/IG/LinkedIn/TikTok/Twitter) → Sheets
- Scrape Ads · Review Scraper
- Company research · Market research (active research scrapers)

### Communications Manager (email / inbound)
- Evens Louis Email Reply Agent
- Email Notification System (active)
- Voice assistant agent (Telegram + Gcal) — secondary with Day Planner
- Inactive nearby: Gmail AI Email Manager, Support Agent Webhook, 🤖Email Agent — revive only with HITL

### Creative Studio (image / video / nano / voice)
- ai nana · ai nana generator sub · create image · combine image · Combine Images Nanobanana · Edit Image Nanobanana Tool · ai background removal
- Nano Photoshop Agent
- On-demand calling · Siri AI Agent template
- elevenlabs post call (also HITL)

### Researcher (research / RAG / summarize)
- Company research · Market research · Summarize site · Website scraper
- Build a PDF Document RAG System… (3 active dupes — flag consolidation)
- Demo: RAG in n8n 4 (active demo — prefer not for prod)
- Inactive: Research anything, AI Research Agent*, paper collection — library only

### Wealth Manager / Personal CFO
- Automated Stock Analysis Reports… (active) → **Wealth Manager** primary
- Inactive: Automate Financial Operations… → Personal CFO if ever activated (HITL)

### Product GTM / Publishing Engine
- Inactive content/social pipelines (auto post, YouTube trend, Ads to video, viral ads) → Publishing Engine when operator activates
- AI Automation Agency client onboarding/delivery (inactive) → Consultant + Product GTM templates only

### Forge (fix / scaffolds / SaaS experiments)
Watch — many **active** “System” scaffolds look like product experiments; do not expand without operator:
- Advanced Features · Analytics & Reporting · API Key Management · Asset Management API (Corrected) · Authentication & User Management · Compliance & Audit · Sustainability Dashboard · Tenant Onboarding · Work Order Management (Corrected) · Chat AI Agent - Asset Management · My Sub-Workflow 1 · n8n hacks
**OPINION:** Treat as Forge+Watchdog “estate hygiene” candidates (document, don’t grow). Screenshot if failing.

### Money Desk
- Hive Revenue Sensor Hourly (active)
- Website Lead Capture / New Leads — secondary with Lead Hunter for revenue path

### HITL Operator
Gates any HITL path above + any inactive workflow someone proposes to activate.

### Day Planner
- Consume digests; Voice assistant (Gcal) secondary — prefer Grok Calendar plugin.

### Career Strategist / Publishing / Wealth (no exclusive active hive row)
Use inactive templates only when operator scopes a mission.

---

## C) Hygiene recommendations (OPINION — operator decide)

1. **Dupe RAG:** 3 active identical “Build a PDF Document RAG…” — keep one, deactivate extras after screenshot proof.
2. **Inactive pile (108):** mostly templates — Librarian tag as TEMPLATE vs OPS in vault; don’t map as daily tools.
3. **Active SaaS scaffolds:** confirm which are real prod vs leftover — Watchdog screenshot list + Forge propose archive batch (Tier 3 activate changes).
4. **Counts:** always from paginated API / export script — UI scrape for canvas screenshots only.

---

## D) Agent cheat — “what I may call”

| Agent | Call these ACTIVE legacy flows |
|-------|--------------------------------|
| Watchdog | Hive smoke/telemetry/ecosystem + Security/Emergency/Error Recovery/Backup/QA + browser tools |
| Forge | Hive error-heal, creative-pivot + scaffold systems when fixing |
| Big Boss | Hive digests, founder-signal, toolbox, Master Orchestration (HITL) |
| Librarian | Hive Outer Heaven Report (+ chronicle if present) |
| Lead Hunter | CE lead, Phase 9, New Leads, scrapers, Apollo capture, PI qualifier |
| Comms | Email Notification, Evens Email Reply |
| Creative Studio | Nana/image tools, ElevenLabs, Nano Photoshop |
| Researcher | Company/Market research, Summarize site, Website scraper, one RAG |
| Money Desk | Revenue Sensor Hourly |
| Wealth Manager | Stock Analysis Reports |
| Consultant | Meta critique when activated |
| Product GTM | Predictive Construct only as inactive draft |

---

## Confidence

- Counts 177/69/108: **FACT** (export 2026-08-12)  
- Hive name↔catalog: **FACT** where names match  
- Non-hive agent buckets: **OPINION** (name heuristics) — refine after Watchdog screenshots / operator correction  
- Pagination root cause: **FACT** (operator fix note)

---

## UI vs API (2026-08-12 scrape)

| Source | Count | Use |
|--------|-------|-----|
| API export (paginated) | **177** / 69 active | Counts + IDs |
| UI Personal list | **160** Published/blank | Screenshots, Published flag |

UI inventory file: `ui-workflow-inventory-160.md`. Hive Meta Critique / Predictive Construct = not Published (matches inactive).

---

## Corroboration (Watchdog REST 2026-08-12)

| Metric | Value | Label |
|--------|-------|-------|
| API total | 177 | FACT |
| Archived | 17 | FACT — explains UI **160** (non-archived) |
| Active / inactive | 69 / 108 | FACT |
| Hive-named | 14 (11 active / 3 inactive) | FACT |
| Prod executions | 1759 · failed 57 · **3.2%** fail | FACT (overview) |
| Avg duration | ~2.01s | FACT |

Note: some rows show `active=true` **and** `[ARCHIVED]` (e.g. start browser tool, one RAG dupe) — treat archived as non-callable for ops even if active flag odd. Full dump: `rest-full-177.md`.
