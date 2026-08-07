# Philanthropic / OpenClaw creative-loop tools

Cursor App cannot push to `philanthropic-ai-agent`. Apply on VPS or a machine with write access.

## Add tools (read-heavy first)

Wire these names into the existing tool registry (`app/api/agent/tools/`).
Contracts: [tools/TOOL_CONTRACTS.md](./tools/TOOL_CONTRACTS.md), sketch [tools/ce_list_actions.ts](./tools/ce_list_actions.ts).

Prefer Scorpion hive bridge + **n8n MCP broker** (not scattered secrets).

| Tool | Backend |
|------|---------|
| `ce_list_actions` | `GET /scorpion/api/hive/ce/actions` |
| `ce_lookup_lead` | `GET /scorpion/api/hive/ce/actions?q=` |
| `ce_create_note` | CE `/api/hive/notes` |
| `ce_queue_action` | CE `/api/hive/actions/queue` (HITL) |
| `n8n_list_workflows` | n8n API via broker |
| `n8n_get_execution` | `GET /scorpion/api/hive/n8n/executions?id=` |
| `n8n_trigger_webhook` | allowlisted webhook only |
| `scorpion_health` | `GET /scorpion/api/hive/health` |
| `scorpion_register_outcome` | `POST /scorpion/api/hive/register` |
| `report_telegram` | existing message tool → topic |

## SOUL.md / TOOLS.md patch (BigBoss)

Append only — do not replace personality:

See `BIGBOSS_CREATIVE_LOOP_APPEND.md`.

## Preserve

Never overwrite SOUL/AGENTS/IDENTITY/USER/TOOLS/HEARTBEAT/BOOTSTRAP/MEMORY/DREAMS or topic IDs.
