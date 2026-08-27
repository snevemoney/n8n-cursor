# n8n × Grok matrix (2026-08-27)

n8n **fills gaps** in the hive matrix. It is **not** a second daily OS.

**Daily OS:** Grok Bot (17 agents) + Cursor. Grok plugins: Gmail read/draft, Calendar read, GitHub read.

**n8n (legacy fallback):** VPS webhooks, server cron that must stay, telemetry ingest, golden-path smokes, error heal, ecosystem router. Host: `https://evenslouis.ca/n8n` and `https://evenslouis.ca/webhook/*`. **n8ncloud.tech is dead.**

**Never from n8n or Grok without HITL:** client email send. **Telegram:** optional/legacy (G1 soft) — do not fail a job on a missing hive report. Prefer Scorpion register / Grok / Outer Heaven. OpenClaw `:18789` and Philanthropy `:3002` are **HOLD** — not hard-fail gates.

**Lanes:** `ai-partner-websites` · `amazon-own-store` · `dropship-later` HOLD · `hive-os`. Operator is in **building mode** — no selling until he says so.

**Zero-loss this PR:** no `n8n_data` wipe, no force-push, no merge to main, no new secrets, no activate-all, no live import.

---

## Inventory (`workflows/hive/*.json` + `scripts/hive/n8n-catalog.json`)

| Catalog / file | Decision | Why |
|----------------|----------|-----|
| `hive-golden-path-smoke-notify` / `golden-path-smoke-notify.json` | **update-in-place** | G3 smoke still matters; register path + facts stale |
| `hive-daily-operational-digest` / `daily-operational-digest.json` | **update-in-place** | Merge must stay `mode=append`; Telegram optional; Scorpion first |
| `hive-ecosystem-route` / `ecosystem-router.json` | **update-in-place** | Router hole vs catalog routes; path `hive-ecosystem-route` |
| `hive-outer-heaven-report-notify` / `outer-heaven-report-notify.json` | **update-in-place** | Telegram-only → register preferred |
| `hive-ce-lead-notify` / `ce-lead-notify.json` | **update-in-place** | G2 CE; path + register; no client send |
| `hive-founder-signal` / `founder-signal-ingest.json` | **update-in-place** | Add register; rewrite “must activate” as HITL import |
| `hive-error-heal-notify` / `error-heal-notify.json` | **update-in-place** | Was empty stub; fill FACT shape; Alert Outer Heaven 401 = HITL |
| `hive-creative-pivot` / `creative-pivot-notify.json` | **update-in-place** | Was empty stub; HITL register |
| `hive-telemetry-ingest` / `telemetry-ingest.json` | **gap-to-add** | Watchdog catalog hole (JSON only, `active: false`) |
| `hive-disk-alert` / `disk-alert.json` | **gap-to-add** | Planned/404; report-only; no prune/delete; not activated |
| `hive-operator-digest` / `hive-operator-digest.json` | **leave-archived** | Stub. Grok Day Planner owns the day plan. Do not fire. |
| `evens-email-notify` | **leave-archived** | Grok Gmail owns inbox. Do not rebuild email in n8n. |
| `evens-support-agent` | **leave-archived** | HITL live name; no hive JSON |
| `evens-master-orchestrator` | **leave-archived** | HITL live name; no hive JSON |
| `evens-elevenlabs-post-call` | **leave-archived** | HITL live; no new client-audio path |
| `evens-on-demand-calling` | **leave-archived** | HITL live; no webhook in git |
| `phase9-pipedrive-lead` | **leave-archived** | HITL inbound; do not casual-fire |
| `hive-chronicle-ingest` | **leave-archived** | Prefer `append-chronicle.sh` / Librarian vault |
| `hive-execute-tool` | **leave-archived** | Toolbox live name; no new JSON this PR |
| `hive-meta-critique` / `hive-sunday-meta-critique` | **leave-archived** | Consultant HITL; not a Watchdog hole |
| `hive-predictive-construct` | **leave-archived** | Draft-only; never auto-activate |
| `hive-market-signal-ingest` / `hive-feature-priority-rank` / `hive-revenue-sensor-hourly` | **leave-archived** | Prefer `hive-revenue-sensors.py` |
| `hive-web-learning-cycle` | **leave-archived** | Prefer `web-learning-cycle.py` |
| `hive-ce-leads-digest` | **leave-archived** | Planned Phase 3; selling HOLD |

Keep = still valid after fact rewrite (none were “keep verbatim” — all hive JSON that remain callable were update-in-place).

---

## 17 Grok agents vs n8n ownership

| Grok agent | Owner of | n8n role | Workflow ids |
|------------|----------|----------|--------------|
| **Big Boss** | Founder loop, digest fallback | **legacy** | `VOqRWrgrP2Wmoriq` (daily digest), `Tut13ZH74cL1VYb8` (founder-signal). `hive-execute-tool` / `evens-master-orchestrator` live names only (no new JSON). |
| **Day Planner** | Morning day plan, calendar | **none** (Grok Calendar) | Consume-only: `hive-operator-digest` stub — **leave-archived**. Do not rebuild day-plan in n8n. |
| **Watchdog** | Smoke, telemetry, router, disk report | **legacy** + **gap** | `TyxDfyLVDtxgqHfC` (G3 smoke), `5d1c6bbb-555f-42b2-919d-309d2b4f748d` (router), `cEQpuN8Fh5jTrA9l` (telemetry, new JSON), disk-alert JSON (no live id). |
| **HITL Operator** | Gates HITL rows | **legacy** (gate, not owner) | Any `HITL=true` catalog row: error-heal `RbQEZ8LYInOIsWoK`, creative-pivot `ZK6R6e0EqK9AX1qo`, CE `131918c7-1ca3-4205-8d42-cfc802c19a30`. |
| **Money Desk** | Finance snapshot | **none** | Revenue-sensor stays script-first. No new n8n money path. |
| **Lead Hunter** | CE / pipeline | **legacy** | `131918c7-1ca3-4205-8d42-cfc802c19a30` (G2 CE). Pipedrive phase9 live name only. Building mode — no sell. |
| **Product GTM** | GTM / predictive draft | **none** (leave-archived) | `hive-predictive-construct` / feature-rank planned — do not activate. |
| **Researcher** | Intel | **none** | `web-learning-cycle.py` first. No n8n research spam. |
| **Forge** | Self-heal / pivot propose | **legacy** | `RbQEZ8LYInOIsWoK` (error-heal), `ZK6R6e0EqK9AX1qo` (creative-pivot). Staging PR only. |
| **Creative Studio** | Voice / plates | **none** this PR | `evens-elevenlabs-post-call` live HITL — no new client-audio JSON. |
| **Consultant** | Critique directive | **none** (leave-archived) | meta-critique / Sunday cron — not imported here. |
| **Librarian** | Memory / OH report | **legacy** | `e39875ba-a355-43f2-9dd6-dc0e4bcda2ef` (OH report). Chronicle ingest script-first. |
| **Wealth Manager** | Daily Wealth show | **none** | Grok / Remotion. No n8n. |
| **Personal CFO** | Personal finance | **none** | Grok. No n8n. |
| **Career Strategist** | Career check | **none** | Grok. No n8n. |
| **Communications Manager** | Inbox triage | **none** (Grok Gmail) | `evens-email-notify` leave-archived. **Never** client send from n8n. |
| **Publishing Engine** | Publishing pipeline | **none** | Grok. Publish stays HITL. |

`n8n role` key: **legacy** = keep/update existing bus glue · **gap** = JSON added this PR, not activated · **none** = Grok owns it; do not rebuild in n8n.

---

## Stale → current changelog

| Stale | Current (2026-08-27) |
|-------|----------------------|
| n8n is the daily OS / Grok does not exist | Daily OS = Grok Bot (17) + Cursor. n8n is legacy fallback only. |
| Call `n8ncloud.tech` | Dead. Only `https://evenslouis.ca/n8n` and `https://evenslouis.ca/webhook/*`. |
| Telegram hive report is required | Telegram is G1 soft/legacy. Do not fail on missing Telegram. Prefer Scorpion register / Grok. Do not renumber topics. Do not wipe souls. |
| Daily digest Merge `combine` + `multiplex` | `Wait For Both Fetches` **`mode=append`** (same fix as PR #82 — kept, not reverted). |
| Golden-path register → `/api/services/register` | Register `https://evenslouis.ca/scorpion/api/hive/register` with existing `X-Hive-Secret` / `HIVE_WEBHOOK_SECRET` (Watchdog smoke path). |
| Router path `hive-ecosystem-router` + 4 routes | Path `hive-ecosystem-route`; catalog routes including telemetry + disk-alert. No :3002/:18789 gates. |
| CE webhook `hive-ce-lead` | Catalog path `hive-ce-lead-notify`. G2 still matters. Building mode — no selling / no client send. |
| Error Heal / Creative Pivot = empty stubs | Filled from FACT one-pager shapes. **Alert Outer Heaven:** no invented credentials; 401 = operator HITL; same `X-Hive-Secret` pattern as smoke-notify. |
| `hive-disk-alert` planned/404 | Report-only JSON added (`disk-alert.json`). No prune, no delete. Not activated. |
| `hive-telemetry-ingest` missing repo JSON | `telemetry-ingest.json` added (`active: false`). Watchdog hole filled in git only. |
| Philanthropy :3002 / OpenClaw :18789 required | **HOLD.** Workflows must not hard-fail if they are down. |
| Operator digest as n8n day plan | Leave-archived stub. Grok Day Planner + Calendar plugin own the day. |
| Email/calendar rebuilt in n8n | **Not done.** Grok plugins own those. |
| Client outreach / send from n8n | **Not added.** HITL only, never from this PR. |
| Activate-all / live import / merge main | **Not done.** Watchdog/operator import later. |

---

## What this PR does not do

- Import or activate anything on live n8n
- Merge to `main`
- Add secrets or Telegram topic IDs
- Wipe or delete `n8n_data` / souls
- Require Philanthropy or OpenClaw
- Rebuild email, calendar, or day-plan in n8n
- Add a client-send path
