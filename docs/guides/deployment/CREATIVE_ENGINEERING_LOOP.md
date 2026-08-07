# Creative engineering loop (Telegram → hive)

North star: you state intent in Telegram; BigBoss routes agents + n8n MCP/tools; outcomes register into CE and/or Scorpion; agents dig/retry creatively and report until done. HITL only for money / irreversible / secret-touching actions.

## Loop

1. Restate goal  
2. Inventory controllable tools (MCP / philanthropic API)  
3. If blocked, find another legal path (different API, n8n workflow, sibling agent)  
4. Log attempts to `#live-activity` (424)  
5. Report progress / ask HITL when policy requires  
6. Register outcome in CE and/or Scorpion  
7. Remember in MEMORY / knowledge base  

## Registration rule

| Outcome type | Register in |
|--------------|-------------|
| Clients, leads, deals, builds, invoices, deliverables | **Client Engine** |
| Ops telemetry, council, stack knowledge, workflow health | **Scorpion** |
| Spans both (e.g. client deploy failed) | **Both** |
| Work on product candidates (SENTINEL, ClipEngine, …) | CE/Scorpion as *your work* — not a shared product DB |

## Tool surface (philanthropic + MCP)

Read-heavy first, then safe-act. Implemented as contracts below; philanthropic repo patches when Cursor App has write access.

### Client Engine

| Tool | Mode | Purpose |
|------|------|---------|
| `ce_list_actions` | R | Last N CE actions/events |
| `ce_lookup_lead` | R | Deal/lead lookup |
| `ce_create_note` | W | Attach note to deal/lead |
| `ce_queue_action` | A | Queue approval-gated action |

### n8n

| Tool | Mode | Purpose |
|------|------|---------|
| `n8n_list_workflows` | R | List workflows |
| `n8n_get_execution` | R | Execution errors / debug |
| `n8n_trigger_webhook` | W | Trigger webhook / retry |
| `n8n_mcp_call` | R/W | MCP broker tool call |

### Scorpion

| Tool | Mode | Purpose |
|------|------|---------|
| `scorpion_health` | R | Health/ops summary |
| `scorpion_knowledge_search` | R | Knowledge search |
| `scorpion_log_event` | W | Council/ops breadcrumb |
| `scorpion_register_outcome` | W | Structured mission outcome |

### Report path

Telegram message to the right topic + optional screenshot/log artifact (`report_telegram`).

## Machine HTTP contracts (monorepo stubs)

Operator/machine-facing route shapes for the hive (wire implementations as CE/Scorpion/n8n allow):

- `GET /api/hive/ce/actions?limit=10` — CE last actions (operator/machine auth)
- `GET /api/hive/n8n/executions/:id` — n8n execution summary
- `POST /api/hive/register` — `{ target: "ce"|"scorpion"|"both", mission, summary, refs }`
- OpenClaw hooks: `POST /claw/hooks` — wake/notify agents

Scorpion package stub: `apps/scorpion/server/hive/` (see creative-loop module).  
Philanthropic patches: `docs/patches/philanthropic-ai-agent/`.

## Example asks

| Telegram | Hive |
|----------|------|
| “Last 10 CE actions” | `ce_list_actions` → `#general` |
| “What broke on this n8n workflow?” | `n8n_get_execution` → diagnose → Forge/Naomi → report |
| “Start a lead pipeline for X” | Scout/Business/Ocelot + n8n → register CE |
| “Keep digging until the webhook works” | Creative loop + `#live-activity` |
