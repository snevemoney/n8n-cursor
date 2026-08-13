# Hive mode — QuickMarket

## How this talks to the hive

Lane `side_wip`. Canonical home: GitHub (side WIP).

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: LightningFlow or Client Engine.  
Do not confuse with: lightningflow, client-engine.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
