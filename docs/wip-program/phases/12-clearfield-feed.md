# Phase 12 — Clearfield export schema + SENTINEL feed

**Macro:** OSINT casefile feeds SENTINEL; not a second emergency app.

**Refs:** `clearfield-evidence-flow`, [CLEARFIELD_EXPORT_V1.md](../../patches/product-candidates/CLEARFIELD_EXPORT_V1.md), `shield-buddies` (SENTINEL staging), lane `hive_capability` on `/work`, `packages/shared-config/src/repo-registry.ts`

**Exit:** One real export ingested by SENTINEL staging.

## Micro-tasks

- [ ] Casefile entity model (case, claim, source) documented/implemented
- [ ] Contradiction recording supported
- [ ] Link graph MVP
- [ ] Export schema v1 for SENTINEL checked in (`CLEARFIELD_EXPORT_V1.md`)
- [ ] Auth for export API **or** signed file drop
- [ ] SENTINEL staging consumes one export successfully
- [ ] Operator UI or CLI to build a casefile
- [ ] Lane remains `capability` / `hive_capability` on `/work` (not product_candidate)
- [ ] No public marketing site yet
- [ ] Backup for Clearfield data store
- [ ] Document non-goals (not PWA, not ProofCheck, not SENTINEL brand)
- [ ] Scorpion work-log entry for mesh milestone (`POST /api/hive/register`)
