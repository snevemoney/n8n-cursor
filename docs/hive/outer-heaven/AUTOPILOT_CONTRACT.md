# Autopilot contract — while Evens is at 9–5

**Primary operator face:** Grok Bot (9 agents) — solo or teamed with Cursor.  
**Backend register:** Scorpion API (`/api/hive/*`) — machines and Grok agents read it; operator does **not** need the Scorpion UI daily.

---

## What runs silently (Tier 0–2)

| Job | Where | Schedule | Operator action |
|-----|-------|----------|-----------------|
| Capture cycle | Mac | Every 15 min (launchd) | None |
| INBOX + transcript miner | Mac | With capture cycle | None |
| hive-watchdog | VPS | Every 10 min | None unless heal fails |
| Golden paths smokes | VPS | Watchdog + daily digest | None if PASS |
| Chronicle append | Mac/VPS | Continuous | None |
| Staging self-heal PRs | GitHub | On CI fail | Review when notified |
| Web learning (read-only) | VPS/Mac | Weekly | Review DRAFT methods |

**Rule:** Tier 0–2 must **never** ping the operator unless severity ≥ WARN (see `NOTIFICATION_MATRIX.md`).

---

## What notifies you (WARN+)

1. **Grok Bot first** — Big Boss or lane agent mission (browser + SSH)
2. **Telegram fallback** — #alerts / #general digest
3. **Email fallback** — via n8n `evens-email-notify` for CRITICAL
4. **Cursor** — only when you open it; git mirror + chronicle load automatically

Scorpion **registers** the event via `hive-telemetry-ingest` → `/api/hive/register`. You do not open `/scorpion` to see it.

---

## What always needs you (Tier 3)

Never auto-execute:

- Money / deals / Treasury
- Client send (email, SMS, social)
- Prod deploy / main merge
- Secrets / OAuth / credential edits
- Delete data / wipe volumes / OpenClaw souls

**Flow:** Grok notifies → you approve on https://evenslouis.ca/pro or https://evenslouis.ca/n8n (OAuth).

---

## Grok ↔ Cursor team (summary)

See `GROK_CURSOR_TEAM.md` for full handoff protocol.

| Mode | You | Grok | Cursor |
|------|-----|------|--------|
| Solo Grok | Ops only | smokes, VPS, digests | idle |
| Solo Cursor | Build only | optional Watchdog cron | code |
| Team | Strategy + Tier 3 | ops parallel | build parallel |

---

## Mac one-command install

```bash
bash scripts/hive/outer-heaven/install-capture-launchd.sh
```

Requires `HIVE_OBSIDIAN_VAULT` or pass `--vault /path/to/vault`.

---

## Emit operator events (scripts/agents)

```bash
bash scripts/hive/outer-heaven/emit-operator-event.sh \
  --severity WARN --lane business --summary "20hr week at 8/20" \
  --correlationId oh-week-20260811
```

Posts telemetry + dispatches Grok mission when severity ≥ WARN.

---

## Safety (non-negotiable)

- Web learning: read-only; no credential scraping; no auto client send
- Notify ≠ approve — Grok links to `/pro` for Tier 3
- OpenClaw souls/topics, n8n_data, zero-loss rules unchanged
- n8n: **evenslouis.ca only** — never n8ncloud.tech
