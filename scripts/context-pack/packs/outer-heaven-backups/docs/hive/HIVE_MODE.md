# Hive mode — Outer Heaven Backups

## How this talks to the hive

Lane `hive_core`. Canonical home: VPS cron only.

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: the Philanthropy tool API or OpenClaw gateway itself.  
Do not confuse with: philanthropic-ai-agent.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
