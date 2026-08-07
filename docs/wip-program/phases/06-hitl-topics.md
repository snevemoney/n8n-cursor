# Phase 6 — HITL + topic least privilege

**Macro:** Agents cannot silent-spend, silent-deploy, or touch secrets.

**Refs:** `docs/guides/deployment/OPENCLAW_TOPIC_CAPABILITY_MAP.md`, `docs/patches/client-engine/HIVE_API.md`, `docs/wip-program/HARD_RULES.md`, CE approval queue (`POST /api/hive/actions/queue`), Telegram topics on Outer Heaven

**Exit:** Fail-closed tests pass for money and secrets.

## Micro-tasks

- [ ] CE approval queue UI for agent-proposed actions under `/pro`
- [ ] Map HITL types: spend · client send · prod deploy · delete · secrets · `openclaw.json`
- [ ] Enforce topic map: CE money (`A`) only via `#ledger` / `#business` / `#crm`
- [ ] `#scout` may write leads; must not invoice
- [ ] `#builds` may trigger n8n; prod deploy still HITL
- [ ] Reject tool calls that violate topic policy with a clear Telegram reason
- [ ] Scorpion breadcrumb on every HITL request/decision (`POST /api/hive/register`)
- [ ] Operator SLA note: how to approve from `/pro` (docs, VPS-only secrets off git)
- [ ] Test: attempted spend without approval fails closed
- [ ] Test: attempted secret read outside n8n MCP broker fails closed
- [ ] Document HITL in operator docs (link from WIP README / HARD_RULES)
- [ ] `#live-activity` (424) shows HITL waiting state
