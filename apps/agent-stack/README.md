# @hive/agent-stack

Sittings of the fullstack-agent **pattern** port. Original MIT code. Not a fork.

Face on `127.0.0.1:4018` is Jared's visualizer from tape `FiOTrxq9ckM` stills: a living green circuit board you talk to. First tap/Space arms the mic (Chrome). Chip says LISTENING when it can hear. Say JARVIS. Not an Observe card. Not a Mouth / Hold Home dashboard.

- **Face (local):** full-bleed PCB HUD + mic + TTS on this 8GB Mac only. Original canvas. Not vendored `ai-visualizer`.
- **Brain (online):** listen → decide → CALL Grok / hive / VPS / Cursor → speak the reply. Vault retrieve is extra context, not the product memory.
- **ASK only** for send / pay / deploy / book / publish. Hard steps stay Evens.

The fake this sitting killed: “send to Grokbot” then queue `jobs.jsonl` and stay silent. Also refused: local Ollama / extractive vault-as-brain (8GB Mac).

Hands stay parked. Hosts: Cursor + Grok. Claude Code operate-never. Live `/` HOLD. No Ollama.

```
npm test
npm run adopt
./start.sh check
python3 mouth/turn.py --wires          # which keys are live (no secrets)
# headed Mac only — kill leftover voice-os first:
# lsof -iTCP:4018 -sTCP:LISTEN
./start.sh          # execs apps/agent-stack/face/serve.py
open http://127.0.0.1:4018/
```

**Hear a real online answer**

1. Export `XAI_API_KEY` or `GROK_API_KEY` (xAI chat). Optional: `GROK_MODEL` (default `grok-4`).
2. Keep hive HTTP up (`evenslouis.ca` golden-paths / healthz). SSH `HIVE_VPS_SSH` (default `root@69.62.66.78`) for VPS status.
3. Open Chrome on `http://127.0.0.1:4018/`. HUD should read **NEURAL LINK - GROK LIVE**.
4. Say **JARVIS**, then a question (“what should I work on”) or “what's the VPS status”.
5. The chip speaks the Grok / hive / VPS reply. If a key is missing it says **UNKNOWN** and names the wire.

Grok Bot `sendPrompt` is invoked when the xAI key is missing and `GROKBOT_BASE_URL` + `GROKBOT_TOKEN` are set. That gateway does not return spoken text — UNKNOWN, not a fake queue. Sealed `~/.grokbot/local-exec-daemon-connection.json` is the same: name the wire, do not pretend.

Upstream (pattern only, AGPL, not vendored): https://github.com/jaredrhod/fullstack-agent
