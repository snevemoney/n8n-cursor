# @hive/agent-stack

Sittings of the fullstack-agent **pattern** port. Original MIT code. Not a fork.

Face on `127.0.0.1:4018` is Jared's visualizer from tape `FiOTrxq9ckM` stills: a living green circuit board you talk to. First tap/Space arms the mic in Safari. Chip says LISTENING when it can hear. Say JARVIS. Not an Observe card. Not a Mouth / Hold Home dashboard.

- **Face (local):** full-bleed PCB HUD + mic + TTS on this 8GB Mac only. Original canvas. Not vendored `ai-visualizer`.
- **Brain (store):** Obsidian vault + this repo + chat sessions + the hive. Already adopted. Not an LLM.
- **Hosts:** Cursor (repo hand) + Grok (talk desk). Face/mic/TTS stay local. Neither host is the skull.
- **ASK only** for send / pay / deploy / book / publish. Hard steps stay Evens.

The fake this sitting killed: naming Cursor or Grok Bot as the brain. Also refused: local Ollama / `jobs.jsonl` as the answer.

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

**Hear the store**

1. Vault is `/Users/evenslouis/Documents/My_Billion_Dollar_Vault` (hive folder `00_Outer_Heaven`). Repo is this tree. Sessions stay on disk (`cursor-chat-sessions` / `grok-chat-sessions`). Hive is `.hive` + skills.
2. Open Safari on `http://127.0.0.1:4018/` and hard-refresh. HUD should read **NEURAL LINK - STORE**.
3. Say **JARVIS**, then a normal sentence. Converse packs the store. A talk host is optional. Cursor is only for repo turns (`look at the code`).
4. Do not export an xAI key to make the product exist. Do not run `agent login` to make the skull exist.

Upstream (pattern only, AGPL, not vendored): https://github.com/jaredrhod/fullstack-agent
