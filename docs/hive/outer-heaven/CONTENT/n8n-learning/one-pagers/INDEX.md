# n8n per-agent one-pagers (JSON-deep)

**Generated:** 2026-08-12 · from `workflows/hive/*.json` + estate map (177/69/108)  
**Rule:** FACT vs INFERENCE vs UNVERIFIED labeled in each file. Grok-first; n8n = legacy bus.  
**Canon:** full-estate-agent-map · agent-playbooks · n8n-catalog.json  
n8n notify sink = Grok Watchdog webhook env GROK_WATCHDOG_WEBHOOK_URL.

## One-pagers

| Agent | File |
|-------|------|
| Watchdog | [watchdog.md](./watchdog.md) |
| Forge | [forge.md](./forge.md) |
| Big Boss | [big-boss.md](./big-boss.md) |
| Librarian | [librarian.md](./librarian.md) |
| Lead Hunter | [lead-hunter.md](./lead-hunter.md) |
| Communications Manager | [communications-manager.md](./communications-manager.md) |
| Creative Studio | [creative-studio.md](./creative-studio.md) |
| Researcher | [researcher.md](./researcher.md) |
| Money Desk | [money-desk.md](./money-desk.md) |
| Wealth Manager | [wealth-manager.md](./wealth-manager.md) |
| HITL Operator | [hitl-operator.md](./hitl-operator.md) |
| Day Planner | [day-planner.md](./day-planner.md) |
| Consultant | [consultant.md](./consultant.md) |
| Product GTM | [product-gtm.md](./product-gtm.md) |

## Hive JSON coverage (repo)

| JSON | Live name in file | Primary agent |
|------|-------------------|---------------|
| golden-path-smoke-notify.json | Hive Golden Path Smoke Notify | Watchdog |
| telemetry-ingest.json | Hive Telemetry Ingest | Watchdog |
| ecosystem-router.json | Hive Ecosystem Master Router | Watchdog |
| error-heal-notify.json | Hive Error Heal Notify | Forge |
| creative-pivot-notify.json | Hive Creative Pivot Notify | Forge |
| daily-operational-digest.json | Hive Daily Operational Digest | Big Boss |
| founder-signal-ingest.json | Hive Founder Signal Ingest | Big Boss |
| toolbox-router.json | Hive Toolbox Router | Big Boss |
| hive-operator-digest.json | Hive Operator Digest | Big Boss / Day Planner consume |
| outer-heaven-report-notify.json | Hive Outer Heaven Report Notify | Librarian |
| hive-chronicle-ingest.json | Hive Chronicle Ingest | Librarian |
| ce-lead-notify.json | Hive CE Lead Notify | Lead Hunter |
| revenue-sensor-hourly.json | Hive Revenue Sensor Hourly | Money Desk |
| meta-critique-notify.json | Hive Meta Critique Notify | Consultant (inactive) |
| sunday-meta-critique.json | Hive Sunday Meta Critique | Consultant (inactive) |
| predictive-construct.json | Hive Predictive Construct | Product GTM (inactive) |

## Sacred
evenslouis.ca/n8n only · never n8ncloud · never wipe n8n_data · HITL for send/money/activate · Visual debug SOP on failures
