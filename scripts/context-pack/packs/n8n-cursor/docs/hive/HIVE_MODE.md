# Hive mode — n8n-cursor

## How this talks to the hive

Lane `hive_core`. Canonical home: https://evenslouis.ca/.

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: Client Engine, Outer Heaven, or any Lovable side project.  
Do not confuse with: client-engine, philanthropic-ai-agent.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
