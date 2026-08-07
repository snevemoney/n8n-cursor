# Evenslouis WIP program (implementation pack)

In-repo deliverables for the fused **20-phase** WIP program.

| Doc | Phase |
|-----|-------|
| [HARD_RULES.md](./HARD_RULES.md) | all |
| [INVENTORY_FREEZE.md](./INVENTORY_FREEZE.md) | 0 |
| [DISK_PLAN.md](./DISK_PLAN.md) | 0 / 18 |
| [MISSION_PLAYBOOKS.md](./MISSION_PLAYBOOKS.md) | 8 |
| [PROMOTION_CHECKLIST.md](./PROMOTION_CHECKLIST.md) | 16 / 19 |
| [URL_FINISH_TASKLISTS.md](./URL_FINISH_TASKLISTS.md) | live URL → finish tasks (Playwright) |
| [phases/](./phases/) | 1–19 |
| [../patches/philanthropic-ai-agent/tools/](../patches/philanthropic-ai-agent/tools/) | 1+ |
| [../patches/client-engine/HIVE_API.md](../patches/client-engine/HIVE_API.md) | 2 / 6 / 7 |
| [../patches/product-candidates/](../patches/product-candidates/) | 9–14 |
| [`scripts/wip-program/`](../../scripts/wip-program/) | verify |

## Scorpion hive HTTP

- `POST/GET /api/hive/register`
- `GET /api/hive/ce/actions`
- `GET /api/hive/n8n/executions?id=`
- `GET /api/hive/health`

Machine auth: `Authorization: Bearer $HIVE_MACHINE_TOKEN` when set.
