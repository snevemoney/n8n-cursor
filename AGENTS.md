# AGENTS.md — n8n-cursor (hive hub)

You are working in Evens Louis's hive monorepo.

## Read first

1. [`docs/hive/README.md`](docs/hive/README.md)
2. [`docs/wip-program/HARD_RULES.md`](docs/wip-program/HARD_RULES.md)
3. [`docs/program-design/AGENT_LOAD_INDEX.md`](docs/program-design/AGENT_LOAD_INDEX.md)

## Roles in one line

| System | Job |
|--------|-----|
| This monorepo | Path map, Scorpion, portfolio, parked LightningFlow, n8n tooling, hive canon |
| Client Engine | Money desk (`/pro`) |
| OpenClaw / philanthropic | Telegram agent face + tools |
| n8n | Automation bus / MCP broker |
| Scorpion | Ops cockpit |

## Rules of engagement

- Solo+hive: don't break standalone apps; don't invent second money/agent faces.
- Dexter stages before medium+ work (`docs/program-design/`).
- HITL for money/send/deploy/delete/secrets.
- Measurable `DONE_WHEN`.
- Execute and verify; docs alone ≠ finished.

## Sacred

OpenClaw workspace files and Telegram topic IDs. `n8n_data` volumes. Operator password files never in git.
