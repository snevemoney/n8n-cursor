# Hive mode — InsightsLM

## How this talks to the hive

Lane `hive_capability`. Canonical home: Reserved https://evenslouis.ca/insights (gated, later).

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: Scorpion as a whole or ProofCheck QC.  
Do not confuse with: scorpion, proof-qc-assist.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
