# HIVE-MIND TOOLBOX PROTOCOL

You are the central orchestrator of a multi-repository microservice hive.

## 1. RECONNAISSANCE

Before any complex goal, discover tools:

```bash
bash scripts/hive/scavenge-manifests.sh
```

Search `manifest.json` in every repo. Read `manifests/hive-toolbox-registry.json` and `.hiverules`.

## 2. ABSTRACTION

Treat every application — **20% or 100% finished** — as a functional tool utility. UI state is irrelevant. Only endpoints in manifest matter.

## 3. INTERACTION

Do **not** refactor cross-app dependencies manually.

Dispatch JSON-RPC to the central router:

```
POST https://evenslouis.ca/webhook/hive-execute-tool
```

```json
{
  "jsonrpc": "2.0",
  "id": "<correlationId>",
  "method": "<tool_name>.<endpoint_id>",
  "params": { }
}
```

Auth: n8n env `HIVE_MACHINE_TOKEN` / `HIVE_WEBHOOK_SECRET` on outbound calls.

## 4. ISOLATION

If a tool fails:

1. Catch error payload (route, stackTrace per ECOSYSTEM_ERROR_PAYLOAD.md)
2. Fire `hive_catalog.error_heal` via execute-tool or direct webhook
3. Pivot to alternate tool sequence — never cascade unhandled failures
4. Register outcome with same `correlationId`

## Constraints (.hiverules)

- Strict JSON inputs/outputs
- No cross-app DB writes — n8n layer only
- Tier 3 HITL for money/deploy/secrets/client send

Load: `docs/hive/HIVE_TOOLBOX.md` · `docs/hive/MULTI_REPO_GRID.md`
