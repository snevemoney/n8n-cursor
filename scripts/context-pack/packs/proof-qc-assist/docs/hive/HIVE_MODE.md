# Hive mode — ProofCheck QC

## How this talks to the hive

Lane `product_candidate`. Canonical home: GitHub (WIP).

### Register / bus

- **Money outcomes** → Client Engine (never auto-send/auto-build)
- **Ops / knowledge / workflow health** → Scorpion
- **Automations** → n8n webhooks / MCP
- **Human intent** → OpenClaw / Telegram (one agent face)

### Anti-overlap

Not: Client Engine proofs, InsightsLM, or Clearfield.  
Do not confuse with: client-engine, insights-lm-private, clearfield-evidence-flow.

### HITL

Spend · client send · prod deploy · delete data · secrets · `openclaw.json` require Evens.

Hub contracts: snevemoney/n8n-cursor `docs/hive/INTEROP_CONTRACTS.md`.
