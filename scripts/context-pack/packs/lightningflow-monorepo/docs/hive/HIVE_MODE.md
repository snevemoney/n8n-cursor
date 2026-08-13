# Hive mode — LightningFlow (canonical)

## How this talks to the hive

Lane `parked`. Canonical home: https://evenslouis.ca/lightningflow (parked, operator-gated).

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: the GH lightning-ui dump or GH lightningflow stub.  
Do not confuse with: lightning-ui, lightningflow-gh.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
