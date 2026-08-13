# Phase 10 — SENTINEL own-domain launch runbook

**Macro:** First product candidate live off-apex (not a new `evenslouis.ca` product path).

**Refs:** `shield-buddies`, `/work` catalog (`apps/portfolio`), `packages/shared-config/src/repo-registry.ts` / `product-registry.ts`, Phase 9 QA matrix signed, Clearfield feed stub (Phase 12)

**Exit:** Public own-domain SENTINEL with healthz + deploy/rollback runbook.

## Micro-tasks

- [ ] Choose domain; configure DNS + TLS
- [ ] Deploy bound `127.0.0.1` + reverse proxy (Caddy pattern; never `0.0.0.0` public bind)
- [ ] Healthz endpoint live and monitored
- [ ] Deploy / rollback runbook written (link from Phase 17 later)
- [ ] Store/install assets ready (icons, screenshots)
- [ ] Privacy policy published on own domain
- [ ] Clearfield feed v0 hook (even if stub receiver) for future Phase 12
- [ ] Update `/work` badge to **live** + external URL (`product-registry` / portfolio catalog)
- [ ] Log launch as CE work item (your work — not multi-tenant product DB)
- [ ] OpenClaw `#alerts` (13) wired for SENTINEL health fail
- [ ] Post-launch smoke on a real device (PWA install + offline core)
- [ ] Freeze non-critical feature work for N days (stabilize)
