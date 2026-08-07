# Philanthropic tool contracts (Phases 1 / 6 / 8)

Wire into `philanthropic-ai-agent` tool registry. Prefer calling **Scorpion hive** or **MCP broker** — do not embed every secret in Outer Heaven.

Base (operator/machine): `https://evenslouis.ca/scorpion` (strip as needed for basePath).

Auth: `Authorization: Bearer $HIVE_MACHINE_TOKEN`

## Read (Phase 1)

| Tool | Method | Upstream |
|------|--------|----------|
| `ce_list_actions` | GET | `/scorpion/api/hive/ce/actions?limit=N` |
| `ce_lookup_lead` | GET | `/scorpion/api/hive/ce/actions?q=...` |
| `n8n_list_workflows` | GET | n8n API `/api/v1/workflows` via broker |
| `n8n_get_execution` | GET | `/scorpion/api/hive/n8n/executions?id=` |
| `scorpion_health` | GET | `/scorpion/api/hive/health` |
| `scorpion_knowledge_search` | GET | Scorpion knowledge API (existing) or stub |

## Write / safe-act (Phase 2+)

| Tool | Method | Upstream |
|------|--------|----------|
| `ce_create_note` | POST | CE `/api/hive/notes` (machine) |
| `ce_queue_action` | POST | CE `/api/hive/actions/queue` (HITL) |
| `n8n_trigger_webhook` | POST | allowlisted webhook URL only |
| `scorpion_log_event` | POST | `/scorpion/api/hive/register` target=scorpion |
| `scorpion_register_outcome` | POST | `/scorpion/api/hive/register` |

## Report

| Tool | Notes |
|------|-------|
| `report_telegram` | Existing message tool → topic from capability map |

## Errors

- Never echo secrets or raw env in Telegram  
- Log attempts to `#live-activity` (424)  
- HITL violations → clear refusal (Phase 6)
