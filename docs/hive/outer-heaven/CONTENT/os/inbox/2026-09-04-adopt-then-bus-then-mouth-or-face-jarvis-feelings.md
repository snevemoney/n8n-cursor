# Catch-up — sitting 4 is the three Jarvis feelings on our stack

**Date:** 2026-09-04  
**Skill:** `adopt-then-bus-then-mouth-or-face`  
**Do not ask Evens to paste.**

## Official sentences

- We will not clone Jared’s AGPL Claude installer. Sitting 4 builds the three Jarvis feelings on the hive.
- Face: living canvas-wisp presence on `http://127.0.0.1:4018/`. Observe rows stay secondary. Real live desk remains `serve-desk.py` on 4017.
- Mouth: always-on open mic on the face, LIVE/MUTE toggle, barge-in. Local STT/TTS. Auto-approve off. ElevenLabs ASK only.
- Memory: vault Q&A over the adopted path + hive os allow-list. Cited snippets. UNKNOWN on a miss. Adopt stored the path; this sitting answers.
- There is no live Cursor `Agent.send` SDK here. Desk jobs still ASK and queue a `desk-turn` in `.hive/bus/jobs.jsonl`.
- Claude Code, vendored visualizer, ElevenLabs, and mouse stay out. Hands parked. Builder does not self-PROVEN.

## Run

```
# kill leftover voice-os on 4018 first — do not bring it back
lsof -nP -iTCP:4018 -sTCP:LISTEN
cd apps/agent-stack
npm test
npm run adopt
./start.sh check
# headed Mac only: ./start.sh   →  http://127.0.0.1:4018/
```
