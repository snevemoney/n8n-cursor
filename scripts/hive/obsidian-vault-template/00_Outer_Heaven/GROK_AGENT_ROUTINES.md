# Grok agent routines

**47** automations across **47** agents.

Regenerate: `python3 scripts/hive/build-grok-agent-routines.py --write`

Provision core: `python3 scripts/hive/grokbot-setup-routines.py --core --force-update`

## Core 13

| Agent | Schedule | Routine |
|-------|----------|---------|
| Big Boss | daily_morning | Morning brief |
| Watchdog Ops | every_6_hours | Hive smoke check |
| Life & Business Ops | daily_midday | Lanes 1-4 smoke |
| HITL Operator | daily_morning_8 | Morning HITL digest |
| n8n Automation | weekly_monday | Catalog verify |
| CE & Leads | daily_eod | CE read snapshot |
| Telegram Console | weekly_monday | Shortcut parity |
| Forge Builder | weekly_monday | Builder smoke |
| Scout Lead Gen | daily_eod | Warm outreach rep |
| Vault Librarian | daily_morning_730 | Capture cycle verify |
| Engineering Lead | weekly_monday | Engineering smokes |
| Creative Studio | weekly_monday | THEMES lane check |
| Security Reviewer | weekly_monday | Security posture read |

## Roster (sample by wave)

### wave1 (21 agents)

- ProofCheck GTM: weekly_monday
- SENTINEL GTM: weekly_monday
- ClipEngine GTM: weekly_monday
- TrendSpotter GTM: weekly_monday
- Growth & SEO Lead: weekly_monday
- … and 16 more

### wave2 (7 agents)

- Funnel Optimizer: weekly_monday
- Distribution Ops: weekly_monday
- Pipeline Analyst: semi_monthly
- Market Scout: weekly_monday
- Platform Engineer: weekly_monday
- … and 2 more

### wave3 (6 agents)

- Finance Ops: monthly
- Client Delivery Lead: monthly
- Animation Studio: monthly
- Visual Design: monthly
- Media Producer: monthly
- … and 1 more

## New consulting + plugin agents (wave1)

- **Client Enablement Partner** (Rung 0): weekly_monday — AI OS workshops + morning brief templates
- **AI Audit Partner** (Rung 1): weekly_monday — paid audit + four-blank project proposals
- **Day Planner** (Coffee): daily_morning — Gmail + Calendar plugin day plan

## Handoff chains + morning brief

Playbook: `docs/hive/outer-heaven/AI_PARTNER_PLAYBOOK.md`
Plugins: `docs/hive/GROKBOT_PLUGINS.md`

Big Boss `daily_morning` = hive brief + Day Planner calendar/email merge.
Day Planner `daily_morning` = Gmail + Calendar plugin-first day plan.

Orchestrator chains (4): `research-to-gtm`, `intel-to-build`, `consulting-ladder`, `heal-loop`

```bash
python3 scripts/hive/grokbot-orchestrate.py --validate
python3 scripts/hive/grokbot-orchestrate.py --dry-run --watch --once
```

