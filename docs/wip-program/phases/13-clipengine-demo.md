# Phase 13 — ClipEngine architecture + demo checklist

**Macro:** Detect→review→publish demo with rights gate; ≠ Bookflix / `#creator`.

**Refs:** `clipengine` repo, [CLIPENGINE_ARCHITECTURE.md](../../patches/product-candidates/CLIPENGINE_ARCHITECTURE.md), `docs/patches/github-hygiene/headers/clipengine.md`, OpenClaw `#creator` (423), Bookflix (`book-reimagined`), `packages/shared-config/src/repo-registry.ts`

**Exit:** Reviewed clip path demoed once end-to-end.

## Micro-tasks

- [ ] Architecture doc: ingest, rights gate, review queue, publish adapters (`CLIPENGINE_ARCHITECTURE.md`)
- [ ] Ingest adapter for one stream source
- [ ] Candidate clip detection MVP
- [ ] Human review UI
- [ ] Rights/policy blocklist (never auto-publish rules)
- [ ] Publish adapter stub (manual confirm only)
- [ ] Non-overlap tests vs Bookflix (`book-reimagined`)
- [ ] Non-overlap vs OpenClaw `#creator` (423) — ClipEngine is not Creator topic
- [ ] Demo script + sample recording ready
- [ ] Decision: demo domain vs GitHub-only (record in registry / CE log)
- [ ] `/work` maturity update if warranted (`product-registry` / `repo-registry`)
- [ ] CE/Scorpion log of demo as your work (`POST /api/hive/register`)
