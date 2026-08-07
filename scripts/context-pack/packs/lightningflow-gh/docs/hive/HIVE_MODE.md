# Hive mode — lightningflow (GH stub)

## How this talks to the hive

Lane `legacy`. Canonical home: Superseded by n8n-cursor.

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: the live parked LightningFlow on evenslouis.ca.  
Do not confuse with: lightningflow-monorepo, lightning-ui.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
