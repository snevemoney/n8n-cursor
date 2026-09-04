# @hive/agent-stack

Sittings 1–4 of the fullstack-agent **pattern** port. Original MIT code. Not a fork.

We will not clone Jared’s AGPL Claude installer. These are the three Jarvis feelings on the hive:

- **Face:** living canvas-wisp presence on `127.0.0.1:4018`. Reacts to bus phase. Not WebGL. Not vendored `ai-visualizer`.
- **Mouth:** always-on open mic on the face, with a visible LIVE/MUTE toggle. Barge-in cancels talk. Local STT + local TTS. Auto-approve off.
- **Memory:** vault Q&A — keyword retrieve over the adopted vault + hive os allow-list. Cited snippets. UNKNOWN on a miss. Adopt is the path; this sitting is the ask.

Hands stay parked. Hosts: Cursor + Grok. Claude Code operate-never. Live `/` HOLD.

```
npm test
npm run adopt
./start.sh check
# headed Mac only — kill leftover voice-os first:
# lsof -iTCP:4018 -sTCP:LISTEN
./start.sh          # execs apps/agent-stack/face/serve.py
```

Face owns the mic. Mouth is the write path, not a second daemon. Type is fallback when Web Speech is missing.

Still not Jared: no Claude Code, no vendored visualizer repo, no ElevenLabs, no Agent.send SDK — desk jobs still ASK and queue.

Upstream (pattern only, AGPL, not vendored): https://github.com/jaredrhod/fullstack-agent
