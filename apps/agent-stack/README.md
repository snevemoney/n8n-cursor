# @hive/agent-stack

One pipeline. Face on `127.0.0.1:4018`. Safari, not Chrome.

Input → full context file → Cursor CLI picks one tool (`vault_read` / `safari_see` / `cursor_ask` / `status` / `refuse_hard_step`) → hard-step proposal only → butler speak → bus.

- **Face (local):** PCB HUD + mic + TTS. POST `/api/turn` (JSON or SSE).
- **Voice:** Kokoro `bm_lewis` (British butler). ElevenLabs Tarquin if a key is already on the machine.
- **Brain:** `brain/pipeline.py`. The pack is a file. No `prompt[:4000]`. No classify-as-brain.
- **Hands:** Safari via `hands/see.py`. Cursor ask is repo only. Grok Bot is a desk, not the mouth.
- **Hard steps:** send / pay / deploy / book / publish = spoken proposal, then STOP.

```
./start.sh check
# headed Mac only — kill leftover 4018 first, do not start with AGENT_STACK_DRY_TTS:
# lsof -iTCP:4018 -sTCP:LISTEN
env -u AGENT_STACK_DRY_TTS ./start.sh
# start.sh unsets DRY_TTS on live 4018. Hard-refresh Safari http://127.0.0.1:4018/
```

No Ollama. No new xAI key. No computer takeover.
