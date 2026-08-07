# Phase 8 — Daily mission playbooks (hive prod exit)

**Macro:** Daily-driver Telegram ops without SSH.

**Refs:** [MISSION_PLAYBOOKS.md](../MISSION_PLAYBOOKS.md), `apps/scorpion/app/api/hive/register/`, `docs/patches/philanthropic-ai-agent/tools/TOOL_CONTRACTS.md`, Phases 1–7 green

**Exit:** Three consecutive no-SSH missions; Phase 1–8 hive gate green → product launches (Phase 9+) may start.

## Micro-tasks

- [ ] Playbook: last 10 CE actions (see `MISSION_PLAYBOOKS.md` §1)
- [ ] Playbook: diagnose n8n execution (§2)
- [ ] Playbook: start lead pipeline (§3)
- [ ] Playbook: retry webhook until green (§4)
- [ ] Playbook: ops health digest — CE + n8n + Scorpion + OpenClaw (§5)
- [ ] Save playbooks where BigBoss/agents can reuse them (`docs/wip-program/MISSION_PLAYBOOKS.md` + Outer Heaven workspace link)
- [ ] Structured mission outcome schema in register API (`POST /api/hive/register`)
- [ ] Dashboard or Scorpion list of last N missions (`GET /api/hive/register`)
- [ ] Run mission A end-to-end unattended (no SSH)
- [ ] Run mission B end-to-end unattended (no SSH)
- [ ] Run mission C end-to-end unattended (no SSH)
- [ ] Write Phase 8 exit report: blockers remaining before product launches (template below)

## Phase 8 exit report template

```markdown
# Phase 8 exit report — YYYY-MM-DD

## Missions (3 consecutive, no SSH)
| # | Playbook | Started | Ended | Outcome ID | Pass? |
|---|----------|---------|-------|------------|-------|
| A | | | | | |
| B | | | | | |
| C | | | | | |

## Hive gate (Phases 1–7)
- [ ] Phase 1 read smokes green
- [ ] Phase 2 CE APIs + builder gate
- [ ] Phase 3 Scorpion image + register
- [ ] Phase 4 OpenClaw restore drill
- [ ] Phase 5 catalog + n8n MCP broker
- [ ] Phase 6 HITL fail-closed
- [ ] Phase 7 lead→invoice path

## Blockers before product launches (9+)
1. …
2. …

## Decision
- [ ] Hive prod gate GREEN — proceed to Phase 9 SENTINEL QA
- [ ] HOLD — list required fixes above
```
