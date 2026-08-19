# Money Desk — n8n legacy one-pager
**Labels:** FACT = hive JSON · INFERENCE = revenue path sharing

## Role in estate
Revenue hypothesis sensor — **no autonomous treasury**. Prefer `hive-revenue-sensors.py` when available. CE lead money implications → HITL with Lead Hunter.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Revenue Sensor Hourly | `revenue-sensor-hourly.json` | schedule hoursInterval=1 | no* | Hourly GP → hypothesis register | ACTIVE **FACT** |

\* Hypothesis registration may imply later human action; catalog says prefer Python. Secondary with Lead Hunter: Website Lead Capture / New Leads (**UNVERIFIED** nodes).

## How they work (nodes — from JSON)

### revenue-sensor-hourly.json — *Hive Revenue Sensor Hourly*
**Shape FACT:** `Hourly` (schedule) → `Fetch Golden Paths` → `Form Hypothesis` (code) → `Register Hypothesis`.
- **Code FACT:** cid `revenue-sensor-${Date.now()}`; if failing GP paths → hypothesis “Fix failing golden paths: …”; else “All passCount/total OK — scan register for feature demand”.
- **Hosts:** `evenslouis.ca` only (no Telegram in this JSON).
- No webhook / no respondToWebhook.

## Call recipe
```bash
# Prefer script
python3 scripts/hive/hive-revenue-sensors.py hourly   # catalog note
# n8n path is cron-driven — do not invent a webhook
```

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Move money / approve float / wire CE sensors without Tier 3.
- Invent a revenue webhook path (JSON has schedule only).
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
