# Phase 14 — Trendspotter paper pipeline

**Macro:** TikTok→ticker→Kalshi overlap scores; **paper only** (no live money).

**Refs:** `trendspotter-ai`, [TRENDSPOTTER_PAPER.md](../../patches/product-candidates/TRENDSPOTTER_PAPER.md), OpenClaw `#trend` (419), anti-overlap vs CE leads / Scout, `packages/shared-config/src/repo-registry.ts`

**Exit:** Daily paper scores produced without live orders.

## Micro-tasks

- [ ] Source ingest job implemented
- [ ] Ticker extraction working
- [ ] Kalshi overlap scoring working
- [ ] Persist to Trendspotter DB (not CE leads, not Scout sessions)
- [ ] Paper-trade ledger (no live money / no CE invoice path)
- [ ] Optional `#trend` (419) daily digest notify
- [ ] HITL gate documented if live trading ever considered
- [ ] Failure / retry for ingest job
- [ ] Basic dashboard or markdown daily report
- [ ] Anti-overlap README check (`docs/patches/github-hygiene/headers/trendspotter-ai.md`)
- [ ] `/work` status update via registry
- [ ] Resource caps so scraper cannot starve hive VPS (`DISK_PLAN` / compose caps)
