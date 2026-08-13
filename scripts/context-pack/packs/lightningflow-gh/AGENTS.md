# AGENTS.md — lightningflow (GH stub)

> Hive context pack (Dexter + Evens Louis hive). Full canon: n8n-cursor `docs/hive/`.

## What this is

**Tiny unfinished LightningFlow monorepo stub — superseded by n8n-cursor apps/lightningflow.**

- Lane: `legacy` · Maturity: `legacy`
- Apex path: `none`
- Canonical home: Superseded by n8n-cursor
- **Not** the product of: the live parked LightningFlow on evenslouis.ca
- Do not confuse with: lightningflow-monorepo, lightning-ui

## Read first

1. `PROJECT_CONTEXT.md`
2. `docs/hive/SOLO_MODE.md` and `docs/hive/HIVE_MODE.md`
3. Hub (when available): `docs/hive/README.md` in snevemoney/n8n-cursor

## Rules

- Keep this repo **solo-usable**.
- Respect hive anti-overlap (one money OS = Client Engine; one agent face = OpenClaw; one cockpit = Scorpion).
- HITL for spend, client send, prod deploy, delete data, secrets, `openclaw.json`.
- Medium+ features: Product → Architecture → Program design → Vertical slices (see `docs/program-design/README.md`).
- Prefer execute+verify; docs ≠ done.

## Sacred (if applicable)

If this repo touches OpenClaw: never wipe SOUL/AGENTS/IDENTITY/USER/TOOLS/HEARTBEAT/MEMORY/topics.
