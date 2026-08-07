# Phase 2 — Client Engine machine APIs + builder

**Macro:** CE is a real hive backend for reads/safe-acts; operator UI is not 502-silent.

**Refs:** `docs/patches/client-engine/HIVE_API.md`, `docs/patches/client-engine/`, `https://evenslouis.ca/pro`, `/builder` → `:3001`, `packages/shared-config/src/repo-registry.ts` (`client-engine`)

**Exit:** Philanthropic read/write backends exist; builder is not a mystery naked 502.

## Micro-tasks

- [ ] Stabilize `/pro` Auth.js session path on `evenslouis.ca` (see `docs/patches/client-engine/files/src/lib/auth.ts`)
- [ ] Close leftover CE domain-path PRs or supersede them with this WIP program
- [ ] Machine-auth `GET` last N actions — CE `GET /api/hive/actions?limit=` (contract in `HIVE_API.md`)
- [ ] Machine-auth lead/deal lookup — CE `GET /api/hive/leads?q=`
- [ ] Machine-auth create note — CE `POST /api/hive/notes` (`ce_create_note` backend)
- [ ] Machine-auth queue approval — CE `POST /api/hive/actions/queue` (`ce_queue_action`; HITL only)
- [x] Fix `/builder` image/proxy **or** serve explicit unavailable page (stub on `:3001`, 200 HTML — real builder tree still missing)
- [ ] Confirm CE postgres / redis / worker healthchecks in compose
- [ ] Confirm CE memory/CPU caps in compose on VPS
- [ ] Document operator login = Caddy basic_auth + app login only (no browser machine-token bypass)
- [ ] Audit that apex `/api*` stays gated (operator-only)
- [ ] Add CE audit field `source=openclaw|n8n|operator` on agent writes
