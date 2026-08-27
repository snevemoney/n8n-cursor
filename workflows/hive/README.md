# Hive Workflows

Operational n8n workflows that **fill gaps** in the Grok-first hive matrix. They are **not** a second daily OS.

**Daily OS (2026-08-27):** Grok Bot (17 agents) + Cursor. Grok plugins: Gmail read/draft, Calendar read, GitHub read. Never send client email from n8n or Grok without HITL.

**n8n role:** legacy fallback — VPS webhooks, cron that must stay on the server, telemetry ingest, golden-path smokes, error heal, ecosystem router. Canonical host `https://evenslouis.ca/n8n` and `https://evenslouis.ca/webhook/*`. **n8ncloud.tech is dead — never call it.**

**Telegram:** legacy / optional (G1 soft). Do not fail a run on missing Telegram hive report. Prefer Scorpion register / Grok / Outer Heaven (HOLD: Philanthropy :3002 and OpenClaw :18789 are down — not hard-fail gates). Do not renumber Telegram topics. Do not wipe souls.

**Lanes:** ai-partner-websites · amazon-own-store · dropship-later HOLD · hive-os. Tag notes by lane. Building mode — no selling until the operator says so.

**Zero-loss:** no delete/wipe of `n8n_data`, no force-push, no merge to main, no new secrets, no activate-all from repo JSON. Watchdog/operator import HITL.

Matrix: `docs/hive/N8N_GROK_MATRIX.md`.

## Inventory (repo JSON)

| File | Live ID | Decision | Purpose |
|------|---------|----------|---------|
| `daily-operational-digest.json` | `VOqRWrgrP2Wmoriq` | update-in-place | Cron digest → Scorpion register; Telegram optional. Merge `mode=append`. |
| `ecosystem-router.json` | `5d1c6bbb-555f-42b2-919d-309d2b4f748d` | update-in-place | Watchdog router to catalog hive webhooks |
| `founder-signal-ingest.json` | `Tut13ZH74cL1VYb8` | update-in-place | Founder signal → register |
| `golden-path-smoke-notify.json` | `TyxDfyLVDtxgqHfC` | update-in-place | G3 smoke → Scorpion register |
| `ce-lead-notify.json` | `131918c7-1ca3-4205-8d42-cfc802c19a30` | update-in-place | G2 CE lead → register + optional Telegram; HITL / no sell |
| `outer-heaven-report-notify.json` | `e39875ba-a355-43f2-9dd6-dc0e4bcda2ef` | update-in-place | OH report → register; Telegram optional |
| `error-heal-notify.json` | `RbQEZ8LYInOIsWoK` | update-in-place | Self-heal propose; Alert Outer Heaven uses X-Hive-Secret; 401 = HITL |
| `creative-pivot-notify.json` | `ZK6R6e0EqK9AX1qo` | update-in-place | HITL pivot heuristic → register |
| `telemetry-ingest.json` | `cEQpuN8Fh5jTrA9l` | gap-to-add | Watchdog telemetry sink (JSON only, not activated) |
| `disk-alert.json` | — | gap-to-add | Report-only disk alert (no prune/delete; not activated) |
| `hive-operator-digest.json` | — | leave-archived | Stub. Day Planner / Grok consume only. Do not rebuild day-plan here. |

Catalog-only / no new hive JSON (leave-archived or script-first): email/calendar/day-plan (Grok), `hive-chronicle-ingest`, `hive-execute-tool`, `hive-meta-critique`, `hive-predictive-construct`, market/feature/revenue scripts, evens-* live workflows without repo export.

## Import & Activation SOP

**Do not import or activate from this PR.** Watchdog/operator import HITL later.

When the operator imports, update-in-place (preserve live IDs). New files (`telemetry-ingest`, `disk-alert`) stay inactive until Watchdog says so.

## Operator HITL (not this PR)

1. Import selected JSON — never activate-all.
2. Existing `HIVE_WEBHOOK_SECRET` as `X-Hive-Secret` — no new secret values.
3. Telegram tokens stay optional. Do not invent them to clear a 401.
4. Alert Outer Heaven 401 = operator HITL.
5. Philanthropy :3002 and OpenClaw :18789 remain HOLD.
