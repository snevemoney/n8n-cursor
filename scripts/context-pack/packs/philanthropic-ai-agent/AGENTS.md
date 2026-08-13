# AGENTS.md — Outer Heaven / Philanthropy

> Hive context pack (Dexter + Evens Louis hive). Full canon: n8n-cursor `docs/hive/`.

## What this is

**Tool backend (hands) for OpenClaw Telegram agents — not a public SaaS UI.**

- Lane: `hive_core` · Maturity: `active`
- Apex path: `/claw/hooks`
- Canonical home: Telegram Outer Heaven (OpenClaw)
- **Not** the product of: Scorpion browser cockpit or Client Engine
- Do not confuse with: scorpion, n8n-cursor, client-engine

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
