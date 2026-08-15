# Day Planner — n8n legacy one-pager
**Labels:** FACT = digest JSON shapes · INFERENCE = consume-only role

## Role in estate
**Consume** digest outputs; do **not** own webhook firing. Calendar/email via Grok plugins first. Voice assistant (Telegram + Gcal) is secondary ACTIVE name (**UNVERIFIED** nodes).

## Workflows you consume (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| Hive Daily Operational Digest | `daily-operational-digest.json` | cron `0 12 * * *` | no | Morning state-of-hive (Telegram) | ACTIVE **FACT** |
| Hive Operator Digest | `hive-operator-digest.json` | cron `0 11 * * *` + webhook | no | Structured JSON for planning | Repo FACT; live alias UNVERIFIED |
| Voice assistant agent (Telegram + Gcal) | *(no hive JSON)* | UNVERIFIED | caution | Secondary calendar | ACTIVE name **FACT** estate map |

## How they work (nodes — from JSON) — consume fields only

### daily-operational-digest — fields to read
From `Build Digest` **FACT:** markdown sections System Uptime & Health (stability%), Testing & Self-Healing, Financial Velocity (N/A / Tier 3). cid `digest-${date}`.

### hive-operator-digest — fields to read
From `Build Operator Digest` **FACT:** `goldenPaths.{pass,total,stabilityPct,paths}`, `missions24h`, `tier3Open`, `tier3Items[]`, `grokMission`, `links.{pro,n8n,goldenPaths}`, `telegramText`.

## Call recipe
**Do not fire digests** unless Big Boss/operator asks. Prefer:
- Grok Calendar / Gmail plugins
- Read Telegram digest / Scorpion missions
- Optional: Big Boss may POST operator-digest; you parse JSON only

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Own or spam hive webhooks.
- Schedule n8n changes for calendar — use Grok plugins.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
