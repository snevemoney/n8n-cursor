# Promotion checklist (future repos)

Use this before promoting any new or side surface into hive / product_candidate / own-domain launch.

**Defaults (HARD_RULES):** new repos start as **`side_wip` + `NO_PATH`** until a registry PR says otherwise.  
**Registries:** `packages/shared-config/src/repo-registry.ts`, `product-registry.ts`  
**Public story:** `/` + `/work` only for visitors (`apps/portfolio`).  
**Broker:** n8n MCP ([phases/MCP_BROKER_DECISION.md](./phases/MCP_BROKER_DECISION.md)).

## Before opening a promotion PR

- [ ] Repo has hygiene README header (see `docs/patches/github-hygiene/headers/`)
- [ ] Anti-overlap statement written (what this is **not**)
- [ ] Lane proposed: `side_wip` | `hive_capability` | `product_candidate` | `hive_core` | `parked`
- [ ] Maturity proposed: `phase_0` | `wip` | `near_ship` | `live` | …
- [ ] Apex path decision: **`NO_PATH`** unless hive_core with existing map entry
- [ ] Product candidates: own-domain plan (never new apex product path on `evenslouis.ca` by default)
- [ ] Secrets: none in git; machine secrets via n8n MCP broker / VPS env only
- [ ] Healthz plan (`/healthz` or product equivalent) if it will be deployed
- [ ] Bind plan: `127.0.0.1` + Caddy; no public `0.0.0.0` in prod
- [ ] Backup / restore note if it has a data store
- [ ] HITL impact reviewed (spend / send / deploy / delete / secrets)
- [ ] `/work` catalog copy drafted to match registry
- [ ] Does **not** violate hard rules (one money OS, one agent face, one clipper, one emergency brand, Lightning parked)

## Registry PR must include

- [ ] `repo-registry.ts` entry updated
- [ ] `product-registry.ts` updated if `/work` shows it
- [ ] Hygiene header / GitHub description / topics aligned
- [ ] Link to this checklist in PR body
- [ ] Explicit graduation criteria if leaving `side_wip` (see Phase 16)

## Post-merge

- [ ] Verify `/work` badges match registry (script under `scripts/wip-program/` when available)
- [ ] No portfolio hero tool/LF URLs introduced
- [ ] Log promotion as CE/Scorpion work item if it is operator work
