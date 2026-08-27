# Lead Hunter — n8n legacy one-pager
**Labels:** FACT = hive JSON · UNVERIFIED = estate name-only non-hive

## Role in estate
CE / Pipedrive lead ingress → register + alert; all mutations HITL via /pro. Scrapers/enrichment are secondary ACTIVE estate tools (name-level).

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive CE Lead Notify | `ce-lead-notify.json` | POST `/webhook/hive-ce-lead-notify` (`responseNode`) | **yes** | New CE lead → Scorpion + Telegram → /pro | ACTIVE **FACT** |
| Phase 9 — Lead Pipeline (Pipedrive…) | *(no hive JSON)* | catalog `/webhook/phase9-pipedrive-lead` | **yes** | Pipedrive inbound — do not casual-fire | ACTIVE **FACT** name; nodes **UNVERIFIED** |
| hive-market-signal-ingest | *(planned / no JSON)* | `/webhook/hive-market-signal` | no | Planned — prefer revenue-sensors script | NOT in live list **FACT** |

### ACTIVE non-hive (name-level — UNVERIFIED nodes)
New Leads Workflow · Website Lead Capture with Apollo.io Enrichment… · PI Attorney Lead Qualifier · Find LinkedIn · Instagram finder · Social media finder · Extract * Profile Data (FB/IG/LinkedIn/TikTok/Twitter) → Sheets · Scrape Ads · Review Scraper · Company research · Market research (also Researcher).

## How they work (nodes — from JSON)

### ce-lead-notify.json — *Hive CE Lead Notify*
**Shape FACT:** `CE Lead Webhook` → `Build Alert` → `Alert Grok Watchdog` → `Respond OK`. n8n notify sink = Grok Watchdog webhook env GROK_WATCHDOG_WEBHOOK_URL.
- **Code FACT:** cid `ce-lead-${Date.now()}` (or body); fields leadId/name/email/status/source; text includes “Review on /pro (Tier 3 for approve/send): https://evenslouis.ca/pro”.
- Respond: `{ ok, correlationId, registered, notified }`.
- **Hosts:** `evenslouis.ca`, `api.telegram.org`

## Call recipe
```bash
# Prefer scripts/hive/smoke-ce-lead-slice.sh / ce-hitl-smoke.sh
curl -sS -X POST "https://evenslouis.ca/webhook/hive-ce-lead-notify" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"ce-lead-demo01","name":"Test Lead","email":"test@example.com","status":"new","source":"client-engine"}'
```
Phase 9 / scrapers: propose only; operator confirms. Prefer Grok research scripts over spam-firing scrapers.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Approve/send/mutate leads without HITL /pro Tier 3.
- Assume scraper node graphs — screenshot first (**UNVERIFIED**).
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
