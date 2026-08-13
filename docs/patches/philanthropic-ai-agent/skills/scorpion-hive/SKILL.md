---
name: scorpion-hive
description: >
  Scorpion hive + Client Engine machine tools for Outer Heaven Telegram no-SSH
  missions (Phase 8). Use when the operator asks for CE actions, lead lookup,
  Scorpion/ops health, n8n execution status via hive, or to register a mission
  outcome. Calls Philanthropy POST /api/agent → Scorpion /scorpion/api/hive/*
  with HIVE_MACHINE_TOKEN (never echo the token).
---

# Scorpion hive (Phase 8)

Read-heavy first. HITL for spend, client send, prod deploy, deletes, secrets.

## Tools

| Tool | What | Params |
|------|------|--------|
| `ce_list_actions` | Last N Client Engine actions | `limit` (default 10, max 50) |
| `ce_lookup_lead` | Lead lookup | `q` (required) |
| `scorpion_health` | Hive health (`ceConfigured`, `n8nConfigured`) | none |
| `scorpion_register_outcome` | Log mission to CE and/or Scorpion | `missionId`, `summary`, `target` (`ce`\|`scorpion`\|`both`) |
| `n8n_get_execution` | n8n execution via Scorpion hive | `id` |

## Call shape

```json
POST http://127.0.0.1:3002/api/agent
{ "tool": "scorpion_health", "params": {}, "agentId": "bigboss" }
```

## Playbooks

1. **Ops digest** — `scorpion_health` → `ce_list_actions` limit 5 → report to Telegram topic.
2. **Lead check** — `ce_lookup_lead` with `q` → summarize hits (no raw secrets).
3. **Close mission** — `scorpion_register_outcome` with clear `missionId` + one-line `summary`.

## Rules

- Never print `HIVE_MACHINE_TOKEN` or raw env.
- Log attempts to #live-activity (topic 424).
- Prefer hive over SSH for these reads/writes.
