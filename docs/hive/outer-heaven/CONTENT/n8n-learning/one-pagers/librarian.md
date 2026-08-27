# Librarian — n8n legacy one-pager
**Labels:** FACT = hive JSON / inventory · INFERENCE = ops

## Role in estate
Memory bus glue: Outer Heaven report notify + chronicle ingest. **Reads** prefer `outer-heaven-brief.py` / vault — n8n is ingest/notify only. Deepens (does not contradict) playbook kit + estate 177/69.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Outer Heaven Report Notify | `outer-heaven-report-notify.json` | POST `/webhook/hive-outer-heaven-report` (`onReceived`) + cron `0 14 * * 1` (Mon 14:00 UTC) | no | Weekly / on-demand GP report to Telegram + register | ACTIVE **FACT** |
| Hive Chronicle Ingest | `hive-chronicle-ingest.json` | POST `/webhook/hive-chronicle-ingest` | no | Register chronicle; highSignal → founder-signal | **Repo JSON FACT** (`active:false` in file); **not in live hive name list** — alias/import UNVERIFIED |

## How they work (nodes — from JSON)

### outer-heaven-report-notify.json
**Shape FACT:** `Webhook` → `Build Report` → `Alert Grok Watchdog` → `Respond OK`. n8n notify sink = Grok Watchdog webhook env GROK_WATCHDOG_WEBHOOK_URL.
- **Code FACT:** cid from webhook body or `hive-report-${Date.now()}`; builds pass/fail lines from `gp.paths`; `voiceBrief` string.
- **Hosts:** `evenslouis.ca`, `api.telegram.org`

### hive-chronicle-ingest.json
**Shape FACT:** `Chronicle Webhook` → `Normalize Body` → `Register Scorpion` → IF `High Signal?` → `Forward Founder Signal` → `Respond OK`.
- **Code FACT:** cid `chronicle-*`; `highSignal = body.highSignal === true || tags.includes('founder-signal')`; forward POST `/webhook/hive-founder-signal` + secret.
- Respond note FACT: “append on Mac via append-chronicle.sh or mine-transcripts.py”.

## Call recipe
```bash
curl -sS -X POST "https://evenslouis.ca/webhook/hive-outer-heaven-report" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"oh-report-001"}'

# Chronicle — prefer Mac append scripts if webhook not live
curl -sS -X POST "https://evenslouis.ca/webhook/hive-chronicle-ingest" \
  -H "Content-Type: application/json" -H "X-Hive-Secret: $HIVE_SECRET" \
  -d '{"correlationId":"chr-001","source":"grok","summary":"Session note for Outer Heaven","tags":["ops"],"highSignal":false}'
```
**Prefer:** `outer-heaven-brief.py`, vault reads, `append-chronicle.sh` / `mine-transcripts.py`.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Use n8n as the SSOT reader for Outer Heaven content.
- Fire chronicle webhook as production until Watchdog confirms live alias.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
