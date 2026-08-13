# n8n workflow catalog (Phase 5)

Tag every hive-facing workflow. Expand as workflows are inventoried on the VPS.

| Name | Webhook / trigger | HITL | Notes |
|------|-------------------|------|-------|
| _(inventory)_ | `/n8n/webhook/...` | TBD | Fill via `n8n_list_workflows` / UI export |
| Error → Telegram | Error Trigger | n/a | Should notify `#alerts` (13) |

## Rules

- Dual-host: `evenslouis.ca` + `n8ncloud.tech` webhooks (no basic_auth)  
- Autonomous vs HITL must be explicit before creative-loop allowlist  
- **Never** `docker compose down -v` on n8n data  
- MCP broker: **n8n MCP** — see [MCP_BROKER_DECISION.md](../../wip-program/phases/MCP_BROKER_DECISION.md)

## Credential sync

- Dry-run: `pnpm cred:dry`  
- Apply only after dry-run review  
