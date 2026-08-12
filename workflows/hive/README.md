# Hive Workflows

Operational n8n workflows for the Hive ecosystem. All webhooks use the canonical domain: `https://evenslouis.ca/webhook/*`.

## Workflows

| File | Purpose | Trigger |
|------|---------|---------|
| `daily-operational-digest.json` | Aggregates 24h missions + golden paths → Telegram digest | Schedule (daily 8AM) |
| `ecosystem-router.json` | Routes inbound signals to target hive workflows | Webhook POST |
| `founder-signal-ingest.json` | Receives and normalizes founder signals from router | Webhook POST |
| `golden-path-smoke-notify.json` | Registers golden path smoke test with Scorpion | Webhook POST |
| `ce-lead-notify.json` | CE Lead alert → Telegram | Webhook POST |
| `outer-heaven-report-notify.json` | Outer Heaven report → Telegram | Webhook POST |

## Required n8n Environment Variables

Set these in **n8n Settings > Variables** (not in repo):

| Variable | Used By | Notes |
|----------|---------|-------|
| `TELEGRAM_BOT_TOKEN` | digest, ce-lead, outer-heaven | Format: `123456789:ABCdefGHI...` |
| `HIVE_TELEGRAM_CHAT_ID` | digest (fallback for all) | Telegram chat/group ID |
| `HIVE_DIGEST_TOPIC_ID` | digest | Optional message_thread_id for forum topics |
| `HIVE_CE_LEAD_CHAT_ID` | ce-lead | Overrides HIVE_TELEGRAM_CHAT_ID |
| `HIVE_OUTER_HEAVEN_CHAT_ID` | outer-heaven | Overrides HIVE_TELEGRAM_CHAT_ID |

## Import & Activation SOP

```bash
# 1. Import all hive workflows
n8n import --input workflows/hive/daily-operational-digest.json
n8n import --input workflows/hive/ecosystem-router.json
n8n import --input workflows/hive/founder-signal-ingest.json
n8n import --input workflows/hive/golden-path-smoke-notify.json
n8n import --input workflows/hive/ce-lead-notify.json
n8n import --input workflows/hive/outer-heaven-report-notify.json

# 2. Set environment variables in n8n UI

# 3. Activate workflows in n8n UI (order matters for router dependencies):
#    a. founder-signal-ingest (must be active BEFORE ecosystem-router forwards to it)
#    b. ecosystem-router
#    c. All others
```

## Operator Tier-3 Items (Post-PR)

These require human-in-the-loop and cannot be automated from this PR:

1. **Activate `founder-signal-ingest`** — Required for Ecosystem Router to stop returning 404 on `hive-founder-signal` forwards.
2. **Set `TELEGRAM_BOT_TOKEN`** — Required for all Telegram notifications. Without it, `ce-lead-notify` and `outer-heaven-report-notify` produce 404 from Telegram API.
3. **Set `HIVE_TELEGRAM_CHAT_ID`** (and optionally per-workflow overrides) — Required for message delivery.
4. **Verify golden path smoke** — After import, trigger golden-path-smoke-notify and confirm Scorpion responds 201. If 400, check Scorpion is running and `/api/services/register` accepts the payload.
