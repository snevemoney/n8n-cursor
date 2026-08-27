# Big Boss — n8n legacy one-pager
**Labels:** FACT = hive JSON / inventory · INFERENCE = ops

## Role in estate
Founder loop, digests, toolbox JSON-RPC, master orchestration (HITL). Morning brief prefers Grok; n8n digests are fallback feeds.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Daily Operational Digest | `daily-operational-digest.json` | cron `0 12 * * *` (node label “Daily 08:00 EDT”) | no* | State-of-hive Telegram digest | ACTIVE **FACT** |
| Hive Founder Signal Ingest | `founder-signal-ingest.json` | POST `/webhook/hive-founder-signal` | no† | Ingest founder notes; may forward predictive | ACTIVE **FACT** |
| Hive Toolbox Router | `toolbox-router.json` | POST `/webhook/hive-execute-tool` | no† | JSON-RPC tool invoke | ACTIVE **FACT** |
| Hive Operator Digest | `hive-operator-digest.json` | cron `0 11 * * *` + POST `/webhook/hive-operator-digest` | no | JSON digest for Grok + Telegram | **Repo JSON FACT**; **not in live name list** — import/alias UNVERIFIED |
| Master Orchestration System | *(no hive JSON)* | catalog `/webhook/master-orchestrator` | **yes** | Legacy master; paid/client = HITL | ACTIVE name **FACT** inventory; nodes **UNVERIFIED** |

\* Digest surfaces Tier 3 /pro for financial velocity placeholder. † Predictive / tool failover may hit HITL paths.

## How they work (nodes — from JSON)

### daily-operational-digest.json
**Shape FACT:** Schedule → parallel `Fetch 24h Missions` + `Fetch Golden Paths` → `Wait For Both Fetches` (mode=append) → `Build Digest` → `Alert Grok Watchdog`. audits → Watchdog, not Scorpion, not Telegram. Telegram send deactivated (not a fallback).
- **Code FACT:** cid `digest-${date}`; filters telemetry/tests/failures/pivots/heals; stability % from golden paths; financial section says N/A + Tier 3 /pro.
- **Hosts:** `evenslouis.ca`, `api.telegram.org`

### founder-signal-ingest.json
**Shape FACT:** Webhook → `Analyze Signal` → `Register Brain` → IF `Predict?` → `Forward Predictive` → `Respond OK`.
- **Code FACT:** keyword heuristic (launch/campaign/…); `predict = confidence >= 0.65`; forward POST `evenslouis.ca/webhook/hive-predictive-construct` + `X-Hive-Secret`.
- Respond JSON: `{ ok, correlationId, ingested, predict, confidence }`.

### toolbox-router.json
**Shape FACT:** Webhook → `Resolve Tool` → IF `Valid Method?` → `Invoke Tool` → `Respond Result`; invalid → `Respond RPC Error`; Invoke error branch → `Failover Error Heal`.
- **Registry FACT:** `scorpion_hive_spine.{register_outcome,golden_paths,allocate_mission,hive_health}`, `hive_catalog.{golden_path_smoke,error_heal}`.
- Auth modes in code: bearer / none / hive_secret.

### hive-operator-digest.json
**Shape FACT:** Schedule **and** webhook both feed Fetch Missions/GP → `Build Operator Digest` → Telegram Fallback + Respond JSON + Register.
- **Code FACT:** returns structured `{ goldenPaths, tier3Open, tier3Items, grokMission:{agent:'Big Boss',...}, links }` + `telegramText`.

## Call recipe
```bash
curl -sS -X POST "https://evenslouis.ca/webhook/hive-founder-signal" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"sig-001","signalType":"chat","text":"planning a launch campaign for new product","source":"telegram"}'

curl -sS -X POST "https://evenslouis.ca/webhook/hive-execute-tool" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"jsonrpc":"2.0","id":"tool-001","method":"scorpion_hive_spine.golden_paths","params":{}}'

# Operator digest (if live)
curl -sS -X POST "https://evenslouis.ca/webhook/hive-operator-digest" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"opdig-001"}'
```
**Prefer:** Grok morning brief / calendar plugins; digests as data feed only.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Blind-fire Master Orchestration for client/paid work without HITL.
- Assume operator-digest is live until Watchdog confirms name/alias (**FACT** missing from 14 hive-named live list).
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
