# @hive/agent-stack

Sittings of the fullstack-agent **pattern** port. Original MIT code. Not a fork.

Face on `127.0.0.1:4018` is Jared's visualizer from tape `FiOTrxq9ckM` stills: a living green circuit board you talk to. First tap/Space arms the mic (Chrome). Chip says LISTENING when it can hear. Say JARVIS. Not an Observe card. Not a Mouth / Hold Home dashboard.

- **Face:** full-bleed PCB HUD. Idle / listen / think / speak. Original canvas. Not vendored `ai-visualizer`.
- **Mouth:** write path behind the face. Local STT + local TTS. Auto-approve off. Hear-loop stays (one MediaStream, SR backoff).
- **Brain:** listen → retrieve vault hot files → local model (`ollama` on `127.0.0.1:11434`) or a cited extract → speak the answer on 4018. UNKNOWN on a miss. A question never queues Grok.

Hands stay parked. Hosts: Cursor + Grok. Claude Code operate-never. Live `/` HOLD.

```
npm test
npm run adopt
./start.sh check
# headed Mac only — kill leftover voice-os first:
# lsof -iTCP:4018 -sTCP:LISTEN
# kill that pid if it is voice-os.py
./start.sh          # execs apps/agent-stack/face/serve.py
open http://127.0.0.1:4018/
```

Ask the board a vault question (`what's my north star`, `who am I`, `what's the plan`). The chip goes THINKING, then SPEAKING with the answer. No Grokbot handoff.

Still not Jared's installer: no Claude Code, no AGPL `ai-memory-vault` clone, no ElevenLabs. Desk jobs (look at / browse / write code) still ASK. Hard steps refuse.

Upstream (pattern only, AGPL, not vendored): https://github.com/jaredrhod/fullstack-agent
