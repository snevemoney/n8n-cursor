# MCP broker decision

**Status:** Decided  
**Date:** 2026-08-07  
**Phase:** 5 (`05-n8n-mcp-broker.md`)

## Decision

**n8n MCP is the chosen secret/tool broker** for the Evenslouis hive.

Agents (Outer Heaven / philanthropic tools), Scorpion hive adapters, and automation callers must prefer **n8n MCP** for multi-key / shared-credential tool calls. Do **not** embed every API secret in OpenClaw workspace files or in each philanthropic tool process.

## Why n8n MCP (not Scorpion MCP)

| Criterion | n8n MCP | Scorpion MCP |
|-----------|---------|--------------|
| Already sits on the automation bus | Yes (`/n8n`, webhooks, credentials) | Would duplicate credential store |
| Credential sync tooling | `pnpm cred:sync` / `cred:dry` | Not the source of truth |
| HITL + error workflows | Native Error Trigger → `#alerts` | Would re-implement |
| Hard rule: one broker | Fits “one automation bus” | Would split secrets |

Scorpion remains the **ops cockpit** (`/scorpion`) and hive HTTP surface (`/api/hive/*`). It is **not** the secret broker.

## Implications

1. Philanthropic tools call n8n MCP (or Scorpion hive adapters that themselves use broker-backed credentials) — see `docs/patches/philanthropic-ai-agent/tools/TOOL_CONTRACTS.md`.
2. Shared API secrets live in n8n credentials / MCP broker config on the VPS only — never in git.
3. `n8n_trigger_webhook` remains allowlisted; spend/send/deploy/delete/secrets stay HITL (Phase 6).
4. Revisit only via an explicit registry/WIP PR — do not silently add a second broker.

## Related paths

- `apps/n8n-cursor/`
- `workflows/`
- `docs/wip-program/HARD_RULES.md` (rule 13)
- `docs/guides/deployment/OPENCLAW_TOPIC_CAPABILITY_MAP.md` (MCP broker rule)
- Apex `/n8n` on the portfolio host; dual-host webhook regression per product map / Phase 5
