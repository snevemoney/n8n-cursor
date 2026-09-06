# @hive/agent-stack

One pipeline. Face on `127.0.0.1:4018`. Safari, not Chrome.

Input → full context file → conversation by default. Cursor CLI picks a hand (`vault_read` / `safari_see` / `cursor_ask` / `status` / `refuse_hard_step`) only when one is needed. Hard-step proposal only → butler speak → bus.

- **Face (local):** PCB HUD + mic + TTS. POST `/api/turn` (JSON or SSE).
- **Voice:** Kokoro `bm_lewis` (British butler). ElevenLabs Tarquin if a key is already on the machine.
- **Brain:** `brain/pipeline.py`. The pack is a file. No `prompt[:4000]`. Logged-in Cursor is `agent -p` with the same `~/.local/bin/agent`, HOME, and repo cwd as Terminal. Face loads existing `.env` / `.env.dev` keys (`XAI_API_KEY` / `GROK_API_KEY`) at start — it does not invent keys. A live `agent status` that is logged in wins over a stale `cursor_login_said` flag. If Cursor is dark, `call_grok` uses that key or an already-running Grok Bot gateway (`~/.grokbot/local-exec-daemon-connection.json`). UNKNOWN/queued is not a reply. No key lecture. No new desk. No Ollama.
- **Hands:** Safari via `hands/see.py`. Cursor ask is repo only. Grok Bot is a desk; its live local gateway may speak when Cursor is dark.
- **Hard steps:** send / pay / deploy / book / publish = spoken proposal, then STOP.

```
./start.sh check
# headed Mac only — kill leftover 4018 first, do not start with AGENT_STACK_DRY_TTS:
# lsof -iTCP:4018 -sTCP:LISTEN
env -u AGENT_STACK_DRY_TTS ./start.sh
# start.sh unsets DRY_TTS on live 4018. Hard-refresh Safari http://127.0.0.1:4018/
```

No Ollama. No new xAI key. No computer takeover.
