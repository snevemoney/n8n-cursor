# n8n MCP surface inspection — DO NOT CONNECT YET

**Date:** 2026-09-16 ~17:45 ET  
**Mode:** Discover / security surface only — **no AddMcpServer, no AuthenticateMcpServer, no token paste**  
**Target instance (DECLARED from hive memory):** `https://evenslouis.ca/n8n` (UI redirects `/n8n` → `/n8n/home/workflows` — VERIFIED HTTP 301)

## Current Grok shared-box state

| Check | Result | Evidence |
|---|---|---|
| n8n in GetMcpServerStatus catalog | **ABSENT** | VERIFIED live probe 2026-09-16 (28 servers listed; no n8n) |
| SearchPlugins `n8n` | **0 matches** | VERIFIED |
| Shared-box `mcp.json` / Codex mcp config with n8n | **NOT FOUND** | DISCOVERED absence under `~/.codex`, `~/.config` small configs |
| Operator Codex-local n8n MCP | **DECLARED by Evens** (local Mac/Codex) — not on Grok box | UNKNOWN endpoint URL until operator provides redacted config |

**Conclusion:** Grok fleet cannot currently call n8n via MCP. Connecting is a *new* shared-box integration, not a repair.

## Official instance-level MCP model (docs.n8n.io — DISCOVERED)

Sources: [Connect to n8n MCP server](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/), [MCP server tools reference](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference/).

### Auth
- **OAuth** (recommended) — per-client grants; revocable in Connected clients UI
- **API key / personal MCP access token** — Bearer; shown once; rotation revokes previous
- Server URL form: ends in `/mcp-server/http` under the instance
- Self-host kill switch: `N8N_DISABLED_MODULES=mcp`

### Credential / secret visibility (critical)
- `list_credentials` returns **id / name / type / scopes / project** — **never returns secret data** (docs)
- Workflow node payloads strip credentials to `{id, name}` only
- Agents can still **use** credentials by ID (auto-assign, `explore_node_resources`, execute) without seeing raw values — same as credential-broker pattern for *values*, but **not** a permission broker (any connected client with write tools can trigger side effects)

### Tool classes (high level)

| Class | Examples | Risk on shared Grok box |
|---|---|---|
| Read / inventory | `search_workflows`, `get_workflow_details`, `search_workflow_executions`, `get_workflow_execution` (meta), `list_credentials` (metadata), `search_projects` | Medium — estate visibility to all desks sharing the MCP account |
| Execute / side effects | `execute_workflow` (production default), `test_workflow`, `call_agent` (**real side effects warning**) | **HIGH** — money/send/webhook fires if workflows allow |
| Mutate / CRUD | `create_workflow_from_code`, `update_workflow`, `archive_workflow`, `publish_workflow`, `unpublish_workflow`, data table row/column CRUD | **HIGH** — estate mutation |
| Agents module | `create_agent`, `mutate_agent`, `publish_agent`, `delete_agent`, integrations | **HIGH** — permanent delete possible |
| Builder helpers | `validate_workflow`, `search_nodes`, `get_node_types`, SDK reference | Lower if write tools gated |

### Exposure model
- Instance MCP must be enabled (owner/admin)
- Per-workflow **Available in MCP** required for execute/modify (except `search_workflows` previews all viewable workflows)
- **Not scoped per client:** all connected clients see all MCP-enabled workflows (user-scoped only)
- OAuth can grant different permission sets per client (prefer this over a shared API key on the box)

## Security assessment for 17-desk shared box

### Must not do
1. Paste a personal MCP API token into a shared env file visible to every desk
2. Connect instance MCP with full write tools before HITL policy + tool allowlist
3. Assume “credentials never returned” ⇒ safe — **execute/publish still act as the user**
4. Auto-enable MCP for all 177 workflows / auto-expose new workflows

### Safer path (proposed — not executed)
1. Confirm instance MCP enabled + n8n version ≥ tools we need (docs cite 2.12+ builder; prefer current)
2. Prefer **OAuth** client named `Grok-Bot-ControlPlane` with **minimal grants** if UI allows read-heavy scopes
3. Expose **only** inventory workflows (or none) until Watchdog/HITL policy exists
4. Capability Graph path: `n8n.mcp` with subpaths read vs write; write = `requires_hitl: true`, Tier-3
5. Long-term: Credential Broker — agents request alias; broker injects into n8n; agents never hold bearer tokens (aligns with Evens note)
6. Alternative narrow surface: MCP Server Trigger node exposing **read-only custom tools** (list active workflows, get status) instead of full instance MCP

### Open questions for Evens (HITL)
1. Exact MCP Server URL for `evenslouis.ca` (path only is fine; **do not paste token in chat** — use secret-request if later connecting)
2. Is instance-level MCP already enabled? Which workflows marked Available in MCP?
3. Codex-local connection: OAuth or API key? Which permission grants?
4. Accept shared-box risk of any desk waking MCP write tools under token-meter, or require Big Boss/Watchdog-only routing?

## Recommendation

**BLOCKED / do not connect yet.** Surface is powerful (execute + publish + CRUD + call_agent side effects). Secrets-not-returned is necessary but insufficient. Proceed only after: OAuth minimal grants (or brokered token), HITL policy for write tools, explicit workflow allowlist, and Capability Graph multi-path entry with `evidence_level=discovered` until first VERIFIED read probe.

## Related hive notes
- n8n estate maps exist under OH / workspace inventories (legacy digest kits) — still Grok-first OS; n8n = structured automation plane, not canvas babysitting
- Builder no-rent / Tier-3 HITL / token-meter unchanged
