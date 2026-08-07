# Evenslouis WIP program (implementation pack)

Implements the fused **20-phase** WIP program in-repo: contracts, hive APIs, patches, checklists, and ops scripts.

| Doc | Phase |
|-----|-------|
| [HARD_RULES.md](./HARD_RULES.md) | all |
| [INVENTORY_FREEZE.md](./INVENTORY_FREEZE.md) | 0 |
| [DISK_PLAN.md](./DISK_PLAN.md) | 0 / 18 |
| [MISSION_PLAYBOOKS.md](./MISSION_PLAYBOOKS.md) | 8 |
| [PROMOTION_CHECKLIST.md](./PROMOTION_CHECKLIST.md) | 16 / 19 |
| [phases/](./phases/) | 1–19 checklists + [MCP_BROKER_DECISION.md](./phases/MCP_BROKER_DECISION.md) |
| [../patches/philanthropic-ai-agent/](../patches/philanthropic-ai-agent/) | 1+ tools |
| [../patches/client-engine/](../patches/client-engine/) | 2 / 6 / 7 |
| [../patches/product-candidates/](../patches/product-candidates/) | 9–16 |
| [`scripts/wip-program/`](../../scripts/wip-program/) | verify / sync |

Hive HTTP (Scorpion):

- `POST /api/hive/register`
- `GET /api/hive/register` (recent outcomes)
- `GET /api/hive/ce/actions`
- `GET /api/hive/n8n/executions/:id` (via query)
- `GET /api/hive/health`

Machine auth: `Authorization: Bearer $HIVE_MACHINE_TOKEN` (or `X-Hive-Token`) when token is set.
