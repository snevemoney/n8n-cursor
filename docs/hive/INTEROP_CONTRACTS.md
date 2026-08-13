# Interop contracts

## Logical flow

```
You (Telegram or Cursor)
  → OpenClaw Gateway (127.0.0.1:18789)  # Brain / face
      → Philanthropy tools API (:3002)   # Hands
          → n8n MCP / webhooks           # Bus
          → CE hive bridge (:3205)       # Money desk machine API
          → Scorpion /api/hive/*         # Cockpit register / debug
      → reply Telegram (+ logs/screenshots)
```

## Machine HTTP (summary)

| Direction | Endpoint | Auth | Notes |
|-----------|----------|------|-------|
| Machines → OpenClaw | `POST /claw/hooks*` | hook token | Wake/notify — **no** basic_auth |
| OpenClaw → n8n | `/n8n/webhook*` or apex `/webhook*` | webhook secrets | Jobs; callbacks to hooks |
| Agents → CE | hive bridge `:3205` / CE hive routes | Bearer machine token | leads, notes, HITL queue |
| Agents → Scorpion | `/scorpion/api/hive/*` | machine | register, n8n execution debug |
| Cursor → n8n | MCP HTTP | streamable-http | Editor tooling |

## Register targets

When work finishes, register outcome:

- **CE** — clients, leads, deals, builds, invoices, money-touching events  
- **Scorpion** — ops, council, knowledge, workflow health  
- **both** — when a mission spans money + ops  

## HITL queue

Money-touching actions go through CE approval (`ce_queue_action` / propose → owner approve). Never bypass status fields via generic PATCH.

## Creative engineering loop (agent contract)

1. Restate goal  
2. Inventory controllable tools  
3. If blocked → alternate **legal** path (never invent credentials)  
4. Log to `#live-activity`  
5. HITL only when policy requires  
6. Register outcome  
7. Remember in MEMORY / knowledge  

## Sacred OpenClaw files

`SOUL.md`, `SOUL-BASE.md`, `AGENTS.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md`, `HEARTBEAT.md`, `BOOTSTRAP.md`, `MEMORY.md`, `DREAMS.md`, `memory/`, Telegram topic IDs, `openclaw.json`  

Patches to BigBoss SOUL/TOOLS = **append only**.

## Telegram topics (do not renumber)

See product map / OpenClaw topic capability map on migration branch docs. Core idea: `#general` BigBoss, domain topics for research/builds/ledger/crm/etc.

## VPS reality

Hostinger `69.62.66.78` (Ubuntu 24.04) shared by Outer Heaven (`/opt/philanthropy`), CE, n8n, and other services. Disk pressure is a recurring ops constraint. Bind app ports to `127.0.0.1`; Caddy public only.
