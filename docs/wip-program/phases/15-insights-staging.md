# Phase 15 — InsightsLM staging (gated)

**Macro:** `/insights` live for operator research; one narrative with Scorpion RAG.

**Blocked on:** Phase 8 exit report green (hive prod gate).

**Refs:** `insights-lm-private`, `docs/guides/deployment/INSIGHTS_STAGING.md`, `infra/caddy/Caddyfile.evenslouis.prod`, OpenClaw `#research` (8) / `#autoresearch` (9), `https://evenslouis.ca/insights*`

**Exit:** Gated `/insights` answers a real query.

## Micro-tasks

- [ ] Confirm Phase 8 exit report is green (do not stage if hive gate HOLD)
- [ ] Deploy InsightsLM (`insights-lm-private`) on `127.0.0.1:<port>` with resource caps
- [ ] Replace Caddy `respond 503` with `reverse_proxy` in `infra/caddy/Caddyfile.evenslouis.prod`
- [ ] Operator basic_auth remains on `/insights*`
- [ ] Wire `#research` (8) Sigint R/W ingest per topic capability map
- [ ] Wire `#autoresearch` (9) LiquidSnake paths
- [ ] Document Scorpion knowledge coexistence rules (one research narrative — not a second public product)
- [ ] Backup volumes + restore note
- [ ] No portfolio hero mention as public product
- [ ] Healthz through Caddy
- [ ] Smoke: ingest doc → query answer
- [ ] Update `docs/guides/deployment/INSIGHTS_STAGING.md` status to “staged”
