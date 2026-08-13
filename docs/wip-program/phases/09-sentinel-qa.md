# Phase 9 — SENTINEL production QA

**Macro:** Quebec offline emergency PWA ready for domain cutover.

**Refs:** `shield-buddies` repo, [SENTINEL_QA_MATRIX.md](../../patches/product-candidates/SENTINEL_QA_MATRIX.md), `packages/shared-config/src/repo-registry.ts`, `docs/guides/deployment/EVENSLOUIS_PRODUCT_MAP.md`, anti-overlap vs Clearfield

**Exit:** Signed QA matrix; **no** domain cutover until Phase 10.

## Micro-tasks

- [ ] Installability / PWA manifest QA
- [ ] Offline core flows QA
- [ ] Supplies module QA
- [ ] Check-ins QA
- [ ] Vault QA
- [ ] Critical alert / emergency flows QA
- [ ] Mid/low Android performance pass
- [ ] FR/EN copy pass if required
- [ ] Privacy + emergency disclaimer draft
- [ ] Security review: local data; no accidental hive coupling to CE/n8n
- [ ] Anti-overlap check vs Clearfield (`clearfield-evidence-flow` = capability feed only)
- [ ] QA sign-off checklist checked into `shield-buddies` or CE work log (matrix in `docs/patches/product-candidates/SENTINEL_QA_MATRIX.md`)
