# Hive mode — lightning-ui (legacy)

## How this talks to the hive

Lane `legacy`. Canonical home: Archived — use n8n-cursor apps/lightningflow.

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: the canonical LightningFlow path app.  
Do not confuse with: lightningflow-monorepo, lightningflow-gh.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
