# @hive/agent-stack

One pipeline. Face on `127.0.0.1:4018`. Safari, not Chrome.

Input → full context file → conversation by default. Cursor CLI picks a hand (`vault_read` / `safari_see` / `cursor_ask` / `status` / `refuse_hard_step`) only when one is needed. Hard-step proposal only → butler speak → bus.

- **Face (local):** PCB HUD + mic + TTS. POST `/api/turn` (JSON or SSE).
- **Voice:** Kokoro `bm_lewis` (British butler). ElevenLabs Tarquin if a key is already on the machine.
- **Brain:** `brain/pipeline.py`. Talk owner is OpenRouter (`call_openrouter` via `call_grok`). Retrieve-then-talk: vault `00_Outer_Heaven` for about-me, then the mouth. Scratchpad / thinking-process is never spoken. Cursor CLI is the `cursor_ask` hand only — not the first mouth, not `pick_prompt` converse. Face loads existing `.env` / `.env.local` keys at start. UNKNOWN/queued is not a reply. No key lecture. No new desk. No Ollama.
- **Hands:** `vault_read` / `safari_see` / `cursor_ask` / `status` / `refuse_hard_step`. Watch-armed only: `mac_act`. OpenRouter may emit `tool_calls`; otherwise retrieve-then-talk. Still images attach when `OPENROUTER_VISION_MODEL` can see them. Safari via `hands/see.py`. Grok Bot is a desk.
- **Hard steps:** send / pay / deploy / book / publish = spoken proposal, then STOP.

```
./start.sh check
# headed Mac only — kill leftover 4018 first, do not start with AGENT_STACK_DRY_TTS:
# lsof -iTCP:4018 -sTCP:LISTEN
env -u AGENT_STACK_DRY_TTS ./start.sh
# start.sh unsets DRY_TTS on live 4018. Hard-refresh Safari http://127.0.0.1:4018/
```

No Ollama. No new xAI key. No computer takeover.
