# Philanthropic / OpenClaw creative-loop tools

Cursor App cannot push to `philanthropic-ai-agent`. Apply on VPS or a machine with write access.

## Add tools (read-heavy first)

Wire these names into the existing tool registry (`app/api/agent/tools/`):

| Tool | Backend |
|------|---------|
| `ce_list_actions` | CE ops/API last N events |
| `ce_lookup_lead` | CE CRM search |
| `ce_create_note` | CE note create |
| `ce_queue_action` | CE approval queue (HITL) |
| `n8n_list_workflows` | n8n API |
| `n8n_get_execution` | n8n execution errors |
| `n8n_trigger_webhook` | n8n webhook fire |
| `scorpion_health` | `GET /scorpion/healthz` or `/api/health` |
| `scorpion_register_outcome` | `POST /scorpion/api/hive/register` (basePath-aware) |
| `report_telegram` | existing message tool → topic |

## SOUL.md / TOOLS.md patch (BigBoss)

Append only — do not replace personality:

See `BIGBOSS_CREATIVE_LOOP_APPEND.md`.

## Preserve

Never overwrite SOUL/AGENTS/IDENTITY/USER/TOOLS/HEARTBEAT/BOOTSTRAP/MEMORY/DREAMS or topic IDs.
