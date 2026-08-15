# Watchdog — n8n legacy one-pager
**Labels:** FACT = from hive JSON / live inventory 2026-08-12 · INFERENCE = role/ops judgment · UNVERIFIED = non-hive name association (no repo JSON)

## Role in estate
Live status SSOT for the n8n bus: smoke, telemetry, ecosystem routing, catalog/name drift, Executions fail rate. Prefer Grok plugins/scripts; call ACTIVE hive rows only when Grok cannot. **FACT estate:** 177 workflows · 69 active · 108 inactive · 17 archived · ~3.2% fail.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Golden Path Smoke Notify | `golden-path-smoke-notify.json` | POST `/webhook/hive-smoke-notify` (`onReceived`) | no | After deploy/change — health smoke | ACTIVE **FACT** |
| Hive Telemetry Ingest | `telemetry-ingest.json` | POST `/webhook/hive-telemetry-ingest` (`onReceived`) | no (CRITICAL → heal HITL) | Boot/test/CRITICAL events | ACTIVE **FACT** |
| Hive Ecosystem Master Router | `ecosystem-router.json` | POST `/webhook/hive-ecosystem-route` (`responseNode`) | no† | Fan-out to known hive routes | ACTIVE **FACT** |
| *(planned)* hive-disk-alert | — | — | no | Disk hardening | MISSING (404) **FACT** |

† Downstream route may be HITL. Secondary watch (estate map **INFERENCE** names): Security & Monitoring, Emergency Response, Error Recovery, Backup & Restore, Testing & QA, browser tool / start browser tool / Ultimate Browser Agent — **UNVERIFIED nodes** (no JSON in `workflows/hive/`).

## How they work (nodes — from JSON)

### golden-path-smoke-notify.json — *Hive Golden Path Smoke Notify*
**Shape FACT:** `Webhook` → `Register Scorpion` (httpRequest POST `evenslouis.ca` `/scorpion/api/hive/register`, auth header present).
- No code node. No respondToWebhook (responseMode `onReceived`).
- **Hosts:** `evenslouis.ca`

### telemetry-ingest.json — *Hive Telemetry Ingest*
**Shape FACT:** `Telemetry Webhook` → `Normalize Event` (code) → `Audit Sink Register` → IF `CRITICAL?` → (`Urgent Telegram` ‖ `Trigger Self-Heal`).
- **Code FACT:** mints `correlationId`; sets `isCritical` from severity/event; CRITICAL branch POSTs `evenslouis.ca/webhook/hive-error-heal` with `X-Hive-Secret`.
- **Hosts:** `evenslouis.ca`, `api.telegram.org`
- **Error path FACT:** CRITICAL → Forge `hive-error-heal` (HITL merge later).

### ecosystem-router.json — *Hive Ecosystem Master Router*
**Shape FACT:** `Router Webhook` → `Resolve Route` (code) → IF `Known Route?` → true: `Forward to Target` → `Respond OK` · false: `Respond Unknown Route` (HTTP 404).
- **Code FACT routes map:** `golden-path-smoke`, `error-heal`, `outer-heaven-report`, `market-signal`, `ce-lead-notify`, `founder-signal`, `meta-critique`, `predictive-construct` → each `https://evenslouis.ca/webhook/...`
- cid prefix `eco-${Date.now()}`; forwardBody = `{ correlationId, sourceRepo, ...payload }`
- Forward uses `X-Hive-Secret`. **Hosts:** dynamic target on `evenslouis.ca`

## Call recipe
```bash
# Smoke (prefer scripts/hive/*smoke*.sh when available)
curl -sS -X POST "https://evenslouis.ca/webhook/hive-smoke-notify" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"smoke-demo-001","message":"watchdog smoke"}'

# Telemetry
curl -sS -X POST "https://evenslouis.ca/webhook/hive-telemetry-ingest" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"tel-001","repository_name":"n8n-cursor","event_type":"INFO","severity":"INFO","context":{}}'

# Ecosystem route
curl -sS -X POST "https://evenslouis.ca/webhook/hive-ecosystem-route" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"route":"golden-path-smoke","correlationId":"eco-001","sourceRepo":"watchdog","payload":{"message":"via router"}}'
```
**Prefer Grok:** `grok-hive-tool.py --tool n8n_list_workflows`, local smoke scripts — n8n only for bus glue.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Invent `hive-disk-alert` until imported (**FACT** 404).
- Grow SaaS scaffold “System” workflows — hygiene candidates only (**INFERENCE**).
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
