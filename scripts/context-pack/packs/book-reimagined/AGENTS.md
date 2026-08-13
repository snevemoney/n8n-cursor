# AGENTS.md — Bookflix

> Hive context pack (Dexter + Evens Louis hive). Full canon: n8n-cursor `docs/hive/`.

## What this is

**Upload a book → AI chapters/scenes → Netflix-style watch experience.**

- Lane: `side_wip` · Maturity: `wip`
- Apex path: `none`
- Canonical home: GitHub (side WIP)
- **Not** the product of: ClipEngine
- Do not confuse with: clipengine

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
