# Phase 5 — n8n catalog + MCP broker

**Macro:** One automation bus; one secret broker.

**Decision:** **n8n MCP is the broker** — see [MCP_BROKER_DECISION.md](./MCP_BROKER_DECISION.md).

**Refs:** `apps/n8n-cursor/`, `workflows/`, `pnpm cred:dry`, `pnpm workflows:sync`, apex `/n8n` on portfolio host, dual-host webhook pair (see `EVENSLOUIS_PRODUCT_MAP.md`), `docs/N8N_ENTERPRISE_PLAYBOOK.md`, `packages/shared-config/src/repo-registry.ts`

**Exit:** Catalog published; broker decision recorded; allowlisted trigger works.

## Micro-tasks

- [ ] Inventory hive workflows (name, id, webhook path) under `workflows/` + live n8n
- [ ] Tag each workflow HITL vs autonomous
- [ ] Publish catalog markdown in monorepo docs (link from this phase + WIP README)
- [ ] Dual-host webhook regression (portfolio host + legacy webhook host per product map)
- [ ] Monitor `/n8n/healthz` (public monitor path; no basic_auth)
- [ ] Record broker decision: **n8n MCP** (not Scorpion MCP) in `MCP_BROKER_DECISION.md`
- [ ] Move shared API secrets into broker only (agents call broker; no per-agent key sprawl)
- [ ] Point philanthropic tools at broker for multi-key calls (`TOOL_CONTRACTS.md`)
- [ ] Wire `n8n_trigger_webhook` tool with allowlist only
- [ ] Document credential sync dry-run (`pnpm cred:dry`)
- [ ] Error workflow → Telegram `#alerts` (topic 13) for failed production runs
- [ ] Hard rule in catalog: never `docker compose down -v` on `n8n_data`
