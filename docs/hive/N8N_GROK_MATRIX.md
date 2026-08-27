# n8n × Grok matrix (2026-08-27)

n8n **fills gaps** (webhooks, VPS cron, telemetry ingest, smokes, error-heal, router). It is **not** a second daily OS and **not** the notify plane.

**Daily OS:** Grok Bot (17 agents) + Cursor. Grok plugins: Gmail read/draft, Calendar read, GitHub read.

**Daily OS notify:** Grok Watchdog / Grok chat. n8n does not page the operator.

**Sinks (locked 2026-08-27):**
- **Grok Watchdog / Grok chat** — notify (only)
- **Scorpion register-outcome** — **legacy optional audit**. Not the preferred sink. Not required. Failure must not fail the job.
- **Telegram** — **legacy**. Do not fail on missing Telegram. Do not add new Telegram send paths. Do not renumber topics. Do not wipe souls.

**n8n role:** webhooks + cron + gap-fill on `https://evenslouis.ca/n8n` and `https://evenslouis.ca/webhook/*`. **n8ncloud.tech is dead.**

**Never without HITL:** client email send. OpenClaw `:18789` and Philanthropy `:3002` are **HOLD** — not hard-fail gates.

**Lanes:** `ai-partner-websites` · `amazon-own-store` · `dropship-later` HOLD · `hive-os`. Building mode — no selling until the operator says so.

**Zero-loss this PR:** no `n8n_data` wipe, no force-push, no merge to main, no new secrets, no activate-all, no live import.

---

## Inventory (`workflows/hive/*.json` + `scripts/hive/n8n-catalog.json`)

| Catalog / file | Decision | Why |
|----------------|----------|-----|
| `hive-golden-path-smoke-notify` / `golden-path-smoke-notify.json` | **update-in-place** | G3 smoke webhook still matters; Scorpion register is optional audit |
| `hive-daily-operational-digest` / `daily-operational-digest.json` | **update-in-place** | Merge must stay `mode=append`; cron gap-fill; notify is Grok |
| `hive-ecosystem-route` / `ecosystem-router.json` | **update-in-place** | Router hole vs catalog routes; path `hive-ecosystem-route` |
| `hive-outer-heaven-report-notify` / `outer-heaven-report-notify.json` | **update-in-place** | Webhook gap-fill; Telegram/Scorpion both legacy |
| `hive-ce-lead-notify` / `ce-lead-notify.json` | **update-in-place** | G2 CE webhook; HITL; no client send |
| `hive-founder-signal` / `founder-signal-ingest.json` | **update-in-place** | Ingest webhook; Scorpion audit optional |
| `hive-error-heal-notify` / `error-heal-notify.json` | **update-in-place** | Alert = no-send Grok/event-bus note. No Telegram send. Scorpion not required. |
| `hive-creative-pivot` / `creative-pivot-notify.json` | **update-in-place** | HITL heuristic webhook |
| `hive-telemetry-ingest` / `telemetry-ingest.json` | **gap-to-add** | Watchdog ingest webhook (JSON only, `active: false`) |
| `hive-disk-alert` / `disk-alert.json` | **gap-to-add** | Report-only cron/webhook stub; no prune/delete; not activated |
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

---

## 17 Grok agents vs n8n ownership

n8n role = **webhook / cron / gap-fill** only. Notify owner is always **Grok Watchdog / Grok chat** unless the row says **none**.

| Grok agent | Owner of | n8n role | Workflow ids |
|------------|----------|----------|--------------|
| **Big Boss** | Founder loop; reads Grok brief | **legacy** (cron/webhook) | `VOqRWrgrP2Wmoriq` (daily digest cron), `Tut13ZH74cL1VYb8` (founder-signal webhook). Notify: Grok. |
| **Day Planner** | Morning day plan, calendar | **none** (Grok Calendar) | `hive-operator-digest` stub — **leave-archived**. Do not rebuild day-plan in n8n. |
| **Watchdog** | Smoke, telemetry, router, disk report; **daily notify** | **legacy** + **gap** | `TyxDfyLVDtxgqHfC` (G3 smoke webhook), `5d1c6bbb-555f-42b2-919d-309d2b4f748d` (router), `cEQpuN8Fh5jTrA9l` (telemetry JSON), disk-alert JSON. Notify: Grok chat — not Telegram, not Scorpion-as-OS. |
| **HITL Operator** | Gates HITL rows | **legacy** (gate) | error-heal `RbQEZ8LYInOIsWoK`, creative-pivot `ZK6R6e0EqK9AX1qo`, CE `131918c7-1ca3-4205-8d42-cfc802c19a30`. |
| **Money Desk** | Finance snapshot | **none** | Revenue-sensor script-first. No n8n money path. |
| **Lead Hunter** | CE / pipeline | **legacy** (webhook) | `131918c7-1ca3-4205-8d42-cfc802c19a30` (G2 CE). Building mode — no sell. Notify: Grok. |
| **Product GTM** | GTM / predictive draft | **none** (leave-archived) | predictive / feature-rank — do not activate. |
| **Researcher** | Intel | **none** | `web-learning-cycle.py` first. |
| **Forge** | Self-heal / pivot propose | **legacy** (webhook) | `RbQEZ8LYInOIsWoK`, `ZK6R6e0EqK9AX1qo`. Staging PR only. Alert is no-send Grok note. |
| **Creative Studio** | Voice / plates | **none** this PR | ElevenLabs live HITL — no new client-audio JSON. |
| **Consultant** | Critique directive | **none** (leave-archived) | meta-critique cron — not imported here. |
| **Librarian** | Memory / OH report | **legacy** (webhook) | `e39875ba-a355-43f2-9dd6-dc0e4bcda2ef`. Chronicle script-first. Notify: Grok. |
| **Wealth Manager** | Daily Wealth show | **none** | Grok / Remotion. |
| **Personal CFO** | Personal finance | **none** | Grok. |
| **Career Strategist** | Career check | **none** | Grok. |
| **Communications Manager** | Inbox triage | **none** (Grok Gmail) | `evens-email-notify` leave-archived. **Never** client send from n8n. |
| **Publishing Engine** | Publishing pipeline | **none** | Grok. Publish stays HITL. |

`n8n role` key: **legacy** = existing webhook/cron glue · **gap** = JSON added, not activated · **none** = Grok owns it.

---

## Stale → current changelog

| Stale | Current (2026-08-27) |
|-------|----------------------|
| n8n is the daily OS / Grok does not exist | Daily OS = Grok Bot (17) + Cursor. n8n = webhooks/cron/gap-fill only. |
| Call `n8ncloud.tech` | Dead. Only `https://evenslouis.ca/n8n` and `https://evenslouis.ca/webhook/*`. |
| Telegram hive report is required | Telegram is **legacy**. Do not fail. Do not add new Telegram send. Do not renumber topics. |
| **Scorpion register is the preferred notify sink** | **Locked:** Scorpion is **legacy optional audit**. Daily notify = **Grok Watchdog / Grok chat**. |
| Daily digest Merge `combine` + `multiplex` | `Wait For Both Fetches` **`mode=append`** (PR #82 kept). |
| Golden-path register required for smoke OK | Register-outcome optional; G3 webhook still matters; 401 on Scorpion is not a notify failure. |
| Router path `hive-ecosystem-router` + 4 routes | Path `hive-ecosystem-route`; catalog routes including telemetry + disk-alert. |
| CE webhook `hive-ce-lead` | Catalog path `hive-ce-lead-notify`. G2 still matters. No selling / no client send. |
| Error Heal Alert = Telegram or Scorpion HTTP | **No Telegram send. Scorpion not required.** Alert = no-send Grok/event-bus note. |
| `hive-disk-alert` planned/404 | Report-only JSON added. No prune/delete. Not activated. |
| `hive-telemetry-ingest` missing repo JSON | JSON added (`active: false`). |
| Philanthropy :3002 / OpenClaw :18789 required | **HOLD.** Not hard-fail gates. |
| Operator digest as n8n day plan | Leave-archived. Grok Day Planner owns the day. |
| Email/calendar rebuilt in n8n | **Not done.** Grok plugins own those. |
| Client outreach / send from n8n | **Not added.** |
| Activate-all / live import / merge main | **Not done.** |

---

## What this PR does not do

- Import or activate anything on live n8n
- Merge to `main`
- Add secrets or Telegram topic IDs
- Add new Telegram send nodes or Scorpion-required nodes
- Treat Scorpion as the notify OS
- Wipe or delete `n8n_data` / souls / workflows
- Require Philanthropy or OpenClaw
- Rebuild email, calendar, or day-plan in n8n
- Add a client-send path
