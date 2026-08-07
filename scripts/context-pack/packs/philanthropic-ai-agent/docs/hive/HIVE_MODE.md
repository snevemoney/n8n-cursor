# Hive mode — Outer Heaven

## Role

**One agent face.** Telegram topics → OpenClaw gateway → philanthropy tools → n8n / CE / Scorpion → report.

## Talks to

- n8n webhooks/MCP (bus)
- CE hive bridge (money desk — HITL)
- Scorpion hive APIs (cockpit register)
- `/claw/hooks*` machine wake (no basic_auth)

## Ops notes from chats

- OAuth Anthropic weekly limits → need real OpenAI fallbacks
- Disk pressure (Qdrant/embeddings) on shared VPS
- Local iCloud clone often lags VPS/GitHub — prefer VPS truth for runtime
