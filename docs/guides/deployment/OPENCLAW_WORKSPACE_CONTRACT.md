# OpenClaw workspace contract (sacred — do not wipe)

Outer Heaven = OpenClaw gateway + `philanthropic-ai-agent` (hands) + `outer-heaven-backups`.

**Live VPS root:** `/root/.openclaw/`  
**Repo mirror:** `snevemoney/philanthropic-ai-agent` (root docs + `openclaw/workspaces/{agent}/`)

## Workspace markdown (preserve)

Each agent workspace (and BigBoss root) is defined by:

| File | Role |
|------|------|
| `SOUL.md` | Personality, rules, dispatch behavior (system prompt core) |
| `SOUL-BASE.md` | Shared base rules (topic posting, alerts, knowledge ingest) |
| `AGENTS.md` | Roster: agent ↔ Telegram thread ↔ **topic ID** ↔ model ↔ tools |
| `IDENTITY.md` | Who the agent is |
| `USER.md` | Operator profile (Evens / Twotone) |
| `TOOLS.md` | Allowed tools / how to use them |
| `HEARTBEAT.md` | Scheduled ops, crons, silent-unless-threshold |
| `BOOTSTRAP.md` | Session bootstrap (preserve if present on VPS) |
| `MEMORY.md` | Durable memory pointers |
| `DREAMS.md` | Dream/reflection notes (preserve if present on VPS) |
| `memory/` | Dated memory logs — do not prune casually |

Also preserve:

- `/root/.openclaw/openclaw.json` — agents **never** edit
- `/root/.openclaw/cron/jobs.json`
- Hooks config (`hooks.path=/hooks`)
- AgentId ↔ match bindings (~22)

Backups: `outer-heaven-backups` must cover these paths.

## Telegram topic IDs (do not renumber)

| Topic | ID | Primary agent / use |
|-------|-----|---------------------|
| `#general` | 1 | BigBoss — operator-facing |
| `#research` | 8 | Sigint |
| `#autoresearch` | 9 | LiquidSnake |
| `#builds` | 10 | Forge |
| `#knowledge` | 11 | Knowledge library |
| `#crons` | 12 | Naomi |
| `#alerts` | 13 | Critical alerts (all) |
| `#ledger` | 162 | Ledger |
| `#council` | 163 | SolidSnake + VenomSnake |
| `#communications` | 164 | Herald |
| `#business` | 417 | Business |
| `#scout` | 418 | Scout |
| `#trend` | 419 | Radar |
| `#writer` | 420 | Voice |
| `#designer` | 421 | Designer |
| `#social` | 422 | Social |
| `#creator` | 423 | Creator |
| `#live-activity` | 424 | Mission log (all) |
| `#crm` | 1651 | Ocelot |

## Restart / stabilize (operator notes)

```bash
# On VPS — inspect gateway (do not wipe workspaces)
ls -la /root/.openclaw/
# Confirm hooks path and bindings in openclaw.json (read-only unless repairing)
# Sandbox containers may show Exited — restart gateway/service per Outer Heaven runbook
# Prefer philanthropic-ai-agent docs/RUNBOOK.md + HEARTBEAT.md schedules
```

**Never:** regenerate blank SOUL/MEMORY/DREAMS templates over live files; renumber Telegram topics; `chattr` games on `openclaw.json` without operator OK.

## Apex paths

| Surface | Path | Auth |
|---------|------|------|
| Telegram topics | none (Telegram-first) | — |
| Hooks (machine) | `/claw/hooks*` | none (token in payload) |
| Status UI | `/claw` | operator basic_auth |
