# Autonomous Software Factory (Secrets 7–9)

Closed-loop, self-improving engine — not assistants. Control plane: **OpenClaw / Telegram**. Surgeon: **Cursor / Claude Code**. Nervous system: **n8n**. DNA: **AI Brain** (knowledge + repo rules).

YAML: `EMPIRE_SECRETS.yaml` (secrets 7–9) · Full doc: [`AUTONOMOUS_FACTORY.md`](./AUTONOMOUS_FACTORY.md)

---

## Secret 7 — Self-healing infrastructure loop

```
[ Prod error / health fail ] → n8n webhook
        → package stack trace + correlationId
        → OpenClaw / Cursor / Claude Code (Forge)
        → branch · patch · test · PR
        → YOU merge on phone (Tier 3 — never auto-merge from Telegram)
```

- Catalog workflow: `hive-error-heal-notify` — `bash scripts/hive/n8n-import-error-heal.sh`
- On fail: `n8n_get_execution`, `hive report`, register `ops.self_heal.proposed`
- **Forbidden:** `deploy_trigger`, auto-merge main, auto-rollback prod

---

## Secret 8 — Context windows as DNA

Messy brain = broken code.

| Layer | File |
|-------|------|
| Cursor/Claude repos | `.cursorrules` (hub template) |
| OpenClaw agents | `HIVE_CONTEXT.md`, `OPERATIONAL_MANDATE.md`, `EMPIRE_SECRETS.md`, `AUTONOMOUS_FACTORY.md` |
| Business logic | `docs/hive/USER_INTENT.md`, Tier 3 / CE constraints |

Before build: `search_knowledge_base` · load AGENT_LOAD_INDEX · reject code without telemetry + register hooks.

Billing/Stripe: **CE path only** — Tier 3 propose, never auto-wire from chat.

---

## Secret 9 — Programmatic feature factory

```
Market signals (Apify, Reddit, CE requests, missions)
        → n8n aggregate + rank (revenue × ease)
        → Dexter/council gate if medium+
        → Forge scaffolds API + docs → staging
        → empire-validation-gate → YOU merge → prod
```

Agents: LiquidSnake ranks · SolidSnake gates · Forge builds · Big Boss coordinates.

---

## Closed loop (must register every leg)

Every automation: **correlationId** → `scorpion_register_outcome` → `#live-activity (424)`.

Turn on: sync workspaces + add n8n catalog rows + wire Sentry/health webhooks to n8n.

```bash
python3 scripts/hive/upgrade-hive-leverage.py   # VPS
bash scripts/hive/empire-validation-gate.sh "feature"
```
