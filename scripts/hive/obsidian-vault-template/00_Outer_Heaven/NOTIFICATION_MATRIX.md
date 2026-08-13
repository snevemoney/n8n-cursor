# Notification matrix — Grok first

**Principle:** One event, one `correlationId`. **Grok Bot gets the mission first.** Telegram/email fan-out is fallback. Scorpion **registers only** — Grok reads API; operator does not open Scorpion UI.

---

## Event → channel map

| Event type | Grok Bot (primary) | Telegram (fallback) | Email | Scorpion | Cursor |
|------------|---------------------|---------------------|-------|----------|--------|
| CRITICAL | Big Boss + Watchdog mission | #alerts | immediate | register API | load chronicle if building |
| WARN | Watchdog summary mission | #alerts | daily digest | register API | — |
| Business | CE & Leads mission + /pro link | #general digest | daily digest | register API | — |
| Engineering | Forge / Life & Business Ops | #alerts if fail | weekly digest | register API | fix if teamed |
| INFO | silent (cron digest) | silent | silent | telemetry ingest | git mirror |

---

## Lane → Grok agent

| Lane | Agent | Example trigger |
|------|-------|-----------------|
| Rollup / delegate | Big Boss | Daily 7am digest |
| Health / smokes | Watchdog Ops | golden-paths fail |
| Fix lanes 1–4 | Life & Business Ops | smoke 8/8 fail |
| Tier 3 queue | HITL Operator | need_hitl missions |
| n8n catalog | n8n Automation | catalog drift |
| CE / leads | CE & Leads | queue items |
| Builder | Forge Builder | smoke-ce-builder fail |
| Research | Scout Lead Gen | web-learning draft ready |

---

## Severity rules

| Severity | Notify operator? | Grok dispatch? | Telegram? |
|----------|------------------|----------------|-----------|
| INFO | No | No | No |
| WARN | Yes (digest OK) | Yes | #alerts or digest |
| CRITICAL | Yes (immediate) | Yes (Big Boss) | #alerts + optional email |

---

## Implementation hooks

| Hook | Purpose |
|------|---------|
| `emit-operator-event.sh` | Scripts emit WARN+ with Grok mission |
| `hive-operator-digest` n8n | Daily 07:00 EDT JSON for Big Boss cron |
| `grokbot-dispatch-missions.py --event` | Programmatic mission by severity/lane |
| `hive-telemetry-ingest` | Register + CRITICAL → error-heal route |

---

## Grok cron (via grokbot-setup-agents.py)

| Schedule | Agent | Task |
|----------|-------|------|
| `0 */6 * * *` | Watchdog Ops | Golden paths + smokes via browser/API |
| `0 8 * * *` | HITL Operator | Tier 3 list with /pro + n8n links |
| `0 7 * * *` | Big Boss | Daily digest from operator webhook JSON |

---

## Operator surfaces (priority order)

1. **Grok Bot** — daily + extreme ops
2. **Cursor** — build (optional team with Grok)
3. **Telegram** — 24×7 fallback
4. **Email** — CRITICAL only
5. **Scorpion UI** — extreme fallback if Grok unavailable
