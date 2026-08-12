# Hive Workflows

Operational n8n workflows for the Hive ecosystem. All webhooks use the canonical domain: `https://evenslouis.ca/webhook/*`.

## Workflows

| File | Live ID | Purpose | Trigger |
|------|---------|---------|---------|
| `daily-operational-digest.json` | `VOqRWrgrP2Wmoriq` | Aggregates 24h missions + golden paths → Telegram digest | Schedule (daily 8AM) |
| `ecosystem-router.json` | `5d1c6bbb-555f-42b2-919d-309d2b4f748d` | Routes inbound signals to target hive workflows | Webhook POST |
| `founder-signal-ingest.json` | — (new) | Receives and normalizes founder signals from router | Webhook POST |
| `golden-path-smoke-notify.json` | `TyxDfyLVDtxgqHfC` | Registers golden path smoke test with Scorpion | Webhook POST |
| `ce-lead-notify.json` | `131918c7-1ca3-4205-8d42-cfc802c19a30` | CE Lead alert → Telegram | Webhook POST |
| `outer-heaven-report-notify.json` | `e39875ba-a355-43f2-9dd6-dc0e4bcda2ef` | Outer Heaven report → Telegram | Webhook POST |

## Failing Execution References (root-cause evidence)

| Workflow | Failing Execution | Error |
|----------|-------------------|-------|
| Daily Digest | [exec 1705](https://evenslouis.ca/n8n/workflow/VOqRWrgrP2Wmoriq/executions/1705) | ExpressionError: "Node 'Fetch Golden Paths' hasn't been executed" |
| Ecosystem Router | [exec 55](https://evenslouis.ca/n8n/workflow/5d1c6bbb-555f-42b2-919d-309d2b4f748d/executions/55) | Forward to Target 404 on POST hive-founder-signal |
| Golden Path Smoke | [exec 1404](https://evenslouis.ca/n8n/workflow/TyxDfyLVDtxgqHfC/executions/1404) | Register Scorpion 400 Validation failed |
| CE Lead Notify | [exec 64](https://evenslouis.ca/n8n/workflow/131918c7-1ca3-4205-8d42-cfc802c19a30/executions/64) | Telegram Alert httpRequest 404 |
| Outer Heaven Report | [exec 21](https://evenslouis.ca/n8n/workflow/e39875ba-a355-43f2-9dd6-dc0e4bcda2ef/executions/21) | Send Outer Heaven Telegram 404 |

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

Since these workflows already exist in the live n8n instance (IDs above), use **update import** to overwrite:

```bash
# 1. Update existing workflows (preserves ID, overwrites nodes/connections)
n8n import --input workflows/hive/daily-operational-digest.json
n8n import --input workflows/hive/ecosystem-router.json
n8n import --input workflows/hive/golden-path-smoke-notify.json
n8n import --input workflows/hive/ce-lead-notify.json
n8n import --input workflows/hive/outer-heaven-report-notify.json

# 2. Import NEW workflow (founder-signal-ingest does not exist in prod yet)
n8n import --input workflows/hive/founder-signal-ingest.json

# 3. Set environment variables in n8n UI (Settings > Variables)

# 4. Activate workflows in n8n UI (order matters for router dependencies):
#    a. founder-signal-ingest (must be active BEFORE ecosystem-router forwards to it)
#    b. ecosystem-router
#    c. All others
```

### Verifying the fix in n8n UI

1. Open the workflow by ID (e.g. `VOqRWrgrP2Wmoriq` for Digest)
2. Click **Execute Workflow** (manual trigger) or wait for schedule
3. Inspect each node's output in the execution view
4. Compare with the failing execution linked above to confirm the error is resolved

## Operator Tier-3 Items (Post-PR)

These require human-in-the-loop and cannot be automated from this PR:

1. **Activate `founder-signal-ingest`** — Required for Ecosystem Router to stop returning 404 on `hive-founder-signal` forwards.
2. **Set `TELEGRAM_BOT_TOKEN`** — Required for all Telegram notifications. Without it, `ce-lead-notify` and `outer-heaven-report-notify` produce 404 from Telegram API.
3. **Set `HIVE_TELEGRAM_CHAT_ID`** (and optionally per-workflow overrides) — Required for message delivery.
4. **Verify golden path smoke** — After import, trigger golden-path-smoke-notify and confirm Scorpion responds 201. If 400, check Scorpion is running and `/api/services/register` accepts the payload.
