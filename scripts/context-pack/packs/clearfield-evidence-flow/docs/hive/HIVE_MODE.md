# Hive mode — Clearfield

## How this talks to the hive

Lane `hive_capability`. Canonical home: GitHub (hive capability).

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: SENTINEL / shield-buddies.  
Do not confuse with: shield-buddies, insights-lm-private, client-engine.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
