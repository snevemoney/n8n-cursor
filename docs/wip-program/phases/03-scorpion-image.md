# Phase 3 — Scorpion real image + hive register

**Macro:** Operator cockpit is the real Next app; hive register HTTP is live.

**Refs:** `apps/scorpion/`, `apps/scorpion/app/api/hive/register/`, `apps/scorpion/app/api/hive/ce/`, `apps/scorpion/app/api/hive/n8n/`, `apps/scorpion/app/api/hive/health/`, `docs/wip-program/DISK_PLAN.md`, `Dockerfile.evenslouis` (Scorpion), `https://evenslouis.ca/scorpion`

**Exit:** Stub replaced; register round-trip works (curl + Telegram).

## Micro-tasks

- [ ] Execute disk prune plan from Phase 0 (`docs/wip-program/DISK_PLAN.md`) until safe headroom (≥12G or remote build)
- [ ] Build `Dockerfile.evenslouis` successfully (prefer CI / off-box if VPS tight)
- [ ] Deploy image to `/scorpion` with `127.0.0.1:3003` bind (Caddy only for public)
- [ ] Verify `/scorpion/healthz` (or equivalent) through Caddy on `evenslouis.ca`
- [ ] Implement `POST /api/hive/register` for targets `ce|scorpion|both` (`apps/scorpion/app/api/hive/register/route.ts`)
- [ ] Implement `GET /api/hive/ce/actions` proxy/adapter (`server/hive/ceBridge.ts`)
- [ ] Implement `GET /api/hive/n8n/executions/:id` adapter (`server/hive/n8nBridge.ts`)
- [ ] Wire `scorpion_register_outcome` / `scorpion_log_event` philanthropic tools
- [ ] Keep council/RAG operator-gated (not public on portfolio)
- [ ] Ensure no portfolio hero link to Scorpion (`apps/portfolio` / `/`)
- [ ] Smoke register from curl with `Authorization: Bearer $HIVE_MACHINE_TOKEN`
- [ ] Smoke register from Telegram via philanthropic tool
