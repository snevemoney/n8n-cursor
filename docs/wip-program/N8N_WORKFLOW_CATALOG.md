# n8n hive workflow catalog (Phase 5)

Living inventory for the hive bus. Regenerate from live n8n when credentials allow:

```bash
# On VPS (n8n API key from n8n owner settings / env)
curl -sS -H "X-N8N-API-KEY: $N8N_API_KEY" \
  http://127.0.0.1:5678/api/v1/workflows | jq .
```

## Broker decision

**n8n MCP is the secret broker** — see [phases/MCP_BROKER_DECISION.md](./phases/MCP_BROKER_DECISION.md).

## Hard rules

- Never `docker compose down -v` on `n8n_data`
- Webhooks stay **without** basic_auth (`/webhook*`, `/n8n/webhook*`)
- Tag each workflow **HITL** vs **autonomous** before allowlisting triggers

## Live UI

- Operator: `https://evenslouis.ca/n8n/` → `/n8n/home/workflows`
- Health: `https://evenslouis.ca/healthz` (n8n)

## Catalog table (fill / refresh)

| name | id | webhook path | HITL? | autonomous? | notes |
|------|-----|--------------|-------|-------------|-------|
| _(run inventory)_ | | | | | Populate via API or n8n UI export |

## Dual-host webhooks

| Host | Path pattern | Auth |
|------|--------------|------|
| `evenslouis.ca` | `/webhook*`, `/n8n/webhook*` | none (machines) |
| `n8ncloud.tech` | `/webhook*` | none (machines) |

## Credential sync

```bash
pnpm cred:dry   # from monorepo
pnpm workflows:sync
```
