# Phase 17 — Multi-product runbooks + incidents

**Macro:** Solo-operator incident model across hive + live products.

**Refs:** `docs/runbooks/`, `docs/ONCALL.md`, `docs/INCIDENT_TEMPLATE.md`, `docs/DR_RUNBOOK.md`, Scorpion health (`/scorpion/api/hive/health`), OpenClaw `#alerts` (13), CE `/pro`

**Exit:** Tabletop notes filed; runbooks linked from Scorpion or docs index.

## Micro-tasks

- [ ] Runbook template (deploy, rollback, healthz, backup, contacts) under `docs/runbooks/` or `docs/wip-program/`
- [ ] SENTINEL runbook complete (own domain from Phase 10)
- [ ] ProofCheck runbook complete (own domain from Phase 11)
- [ ] CE / n8n / OpenClaw / Scorpion hive runbook complete
- [ ] Severity rubric → Telegram topic + CE ticket fields
- [ ] `#alerts` (13) routing rules documented
- [ ] Scorpion “health links” view (not a second statuspage product)
- [ ] On-call notes for solo operator (`docs/ONCALL.md` refresh)
- [ ] Incident tabletop: CE down — notes filed
- [ ] Incident tabletop: OpenClaw down — notes filed
- [ ] Incident tabletop: SENTINEL down — notes filed
- [ ] Postmortem template stored in docs (`docs/INCIDENT_TEMPLATE.md` or sibling)
