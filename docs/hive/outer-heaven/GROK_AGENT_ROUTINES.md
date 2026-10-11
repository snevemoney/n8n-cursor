# Grok agent routines — EVENS AI OS

**17** routines across **17** core agents.

Regenerate: `python3 scripts/hive/build-grok-agent-routines.py --write`

Provision: `python3 scripts/hive/grokbot-setup-routines.py --core --force-update`

| Agent | Schedule | Routine |
|-------|----------|---------|
| Big Boss | daily_morning | Morning brief |
| Day Planner | daily_morning | Morning day plan |
| Watchdog | every_6_hours | Control plane heartbeat |
| HITL Operator | daily_morning_8 | Morning HITL digest |
| Money Desk | daily_eod | Business finance snapshot |
| Lead Hunter | daily_eod | Lead pipeline check |
| Product GTM | weekly_monday | GTM phase rotation |
| Researcher | weekly_monday | Weekly intel dossier |
| Forge | weekly_monday | Engineering smoke |
| Creative Studio | weekly_monday | Creative lane check |
| Consultant | weekly_monday | Consulting ladder prep |
| Librarian | daily_morning_730 | Memory consolidation |
| Wealth Manager | daily_eod | Portfolio review |
| Personal CFO | weekly_monday | Personal finance check |
| Career Strategist | weekly_monday | Career development check |
| Communications Manager | daily_morning | Inbox triage |
| Publishing Engine | weekly_monday | Publishing pipeline check |

All routines open with can-act gate. When blocked, explain + ask — never silent skip.

Handoff chains: `scripts/hive/grok-handoff-chains.json`
