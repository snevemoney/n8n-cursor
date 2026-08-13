# Agents lab — build, improve, retire, research

Living registry. **Retire** = mark deprecated here — never silent delete OpenClaw souls/topics.

---

## Grok Bot (Mac — daily, 9 agents)

| Agent | Lane | Status | Last mission | Action |
|-------|------|--------|--------------|--------|
| Big Boss | Commander / delegate | active | Hive rollup | improve |
| Watchdog Ops | Health + smokes | active | golden paths | improve |
| Life & Business Ops | Fix lanes 1–4 | active | 8/8 smokes | improve |
| HITL Operator | Tier 3 queue links | active | digest | maintain |
| n8n Automation | evenslouis.ca catalog | active | catalog verify | improve |
| CE & Leads | Read-only /pro | active | health check | maintain |
| Telegram Console | Shortcut parity | active | read-only diff | improve |
| Forge Builder | smoke-ce-builder | active | stub until /pro | maintain |
| Scout Lead Gen | Read-only research | active | lead scan | improve |

Setup: `python3 scripts/hive/grokbot-setup-agents.py`

---

## Telegram OpenClaw (VPS — fallback, 17 agents)

Roster in Big Boss `HIVE_CONTEXT.md`. Topics are **sacred** — do not renumber.

Key lanes: Big Boss, Naomi, Forge, Scout, Radar, Herald, Ledger, Business, Voice, Designer, Social, Creator, Ocelot, Sigint, Liquid, Venom, + special threads (#knowledge, #alerts).

Sync: `python3 scripts/hive/sync-openclaw-workspace-hive.py`

---

## Retired / deprecated agents

| Agent | Platform | Retired | Reason |
|-------|----------|---------|--------|
| _(none yet)_ | | | |

---

## Research queue — engineer agents to evaluate

| Candidate | Type | Pros | Cons | Status |
|-----------|------|------|------|--------|
| Cursor Composer | coding agent | repo-native, hive wired | Mac-only | **production** |
| Grok Bot 9-pack | ops coordination | daily console, VPS SSH | gateway intermittent | **production** |
| OpenClaw 17 | Telegram fallback | 24×7, tool API | restart/heal sensitivity | **production** |
| _(add new tools here)_ | | | | research |

## Web learning queue (unchecked → web-learning-cycle.py)

- [ ] Hive telemetry patterns — read docs/hive/TELEMETRY_OVERWATCH.md

---

## Promotion criteria

An agent moves from **research** → **production** when:

1. Clear lane — no overlap with existing agent (see `CONFUSION_LOG.md`)
2. Zero-loss behavior verified in missions
3. Documented in this file + `HIVEMIND_DNA.md` load path if daily driver
4. Operator approves (Tier 2 for ops agents; Tier 3 if touches money/send)

---

## Bad agent protocol

1. Log failure pattern in chronicle with tag `agent-retire-candidate`
2. Add row to **Retired** table with reason
3. Disable missions/cron — do **not** delete souls, topics, or history
4. Optionally fork improved agent with new name/lane
