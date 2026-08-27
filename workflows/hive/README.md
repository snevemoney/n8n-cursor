# Hive Workflows

n8n **webhooks / cron / gap-fill** for the Grok-first hive matrix. Not a second daily OS. Not the notify plane.

**Daily OS (2026-08-27):** Grok Bot (17 agents) + Cursor. Grok plugins: Gmail read/draft, Calendar read, GitHub read. Never send client email from n8n or Grok without HITL.

**Daily OS notify:** Grok Watchdog / Grok chat.

**Sinks (locked):**
- Grok Watchdog / Grok chat — notify
- Scorpion register-outcome — **legacy optional audit** (not required, not preferred)
- Telegram — **legacy** (do not fail; do not add new send paths; do not renumber topics)

**n8n host:** `https://evenslouis.ca/n8n` and `https://evenslouis.ca/webhook/*`. **n8ncloud.tech is dead.**

**HOLD:** Philanthropy :3002 and OpenClaw :18789 — not hard-fail gates.

**Lanes:** ai-partner-websites · amazon-own-store · dropship-later HOLD · hive-os. Building mode — no selling until the operator says so.

**Zero-loss:** no delete/wipe of `n8n_data`, no force-push, no merge to main, no new secrets, no activate-all. Watchdog/operator import HITL.

Matrix: `docs/hive/N8N_GROK_MATRIX.md`.

## Inventory (repo JSON)

| File | Live ID | Decision | Purpose |
|------|---------|----------|---------|
| `daily-operational-digest.json` | `VOqRWrgrP2Wmoriq` | update-in-place | Cron gap-fill. Merge `mode=append`. Notify is Grok. |
| `ecosystem-router.json` | `5d1c6bbb-555f-42b2-919d-309d2b4f748d` | update-in-place | Watchdog router to catalog hive webhooks |
| `founder-signal-ingest.json` | `Tut13ZH74cL1VYb8` | update-in-place | Founder signal webhook |
| `golden-path-smoke-notify.json` | `TyxDfyLVDtxgqHfC` | update-in-place | G3 smoke webhook; Scorpion audit optional |
| `ce-lead-notify.json` | `131918c7-1ca3-4205-8d42-cfc802c19a30` | update-in-place | G2 CE webhook; HITL / no sell |
| `outer-heaven-report-notify.json` | `e39875ba-a355-43f2-9dd6-dc0e4bcda2ef` | update-in-place | OH report webhook |
| `error-heal-notify.json` | `RbQEZ8LYInOIsWoK` | update-in-place | Self-heal propose; Alert = no-send Grok/event-bus (no Telegram, Scorpion not required) |
| `creative-pivot-notify.json` | `ZK6R6e0EqK9AX1qo` | update-in-place | HITL pivot webhook |
| `telemetry-ingest.json` | `cEQpuN8Fh5jTrA9l` | gap-to-add | Watchdog telemetry webhook (not activated) |
| `disk-alert.json` | — | gap-to-add | Report-only disk alert (no prune/delete; not activated) |
| `hive-operator-digest.json` | — | leave-archived | Stub. Grok Day Planner owns the day. |

## Import & Activation SOP

**Do not import or activate from this PR.** Watchdog/operator import HITL later. Never activate-all.
