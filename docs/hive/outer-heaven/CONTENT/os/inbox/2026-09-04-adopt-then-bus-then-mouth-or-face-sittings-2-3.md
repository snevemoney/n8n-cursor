# Catch-up — sittings 2–3 mouth + face are on `apps/agent-stack`

**Date:** 2026-09-04  
**Skill:** `adopt-then-bus-then-mouth-or-face`  
**Do not ask Evens to paste.**

## Official sentences

- Sitting 1 adopt + bus stays the base. This sitting wires mouth and face. Hands stay parked.
- Mouth: hold Home / hold Talk → local STT → file bus → Cursor or Grok desk job after spoken yes. Auto-approve off. ElevenLabs ASK only.
- Face: `http://127.0.0.1:4018/` cinematic observe-pane reads the same bus. Not evenslouis.ca. Not a second hive. Real live desk remains `serve-desk.py` on 4017.
- There is no live Cursor `Agent.send` SDK here. The remap is a queued `desk-turn` in `.hive/bus/jobs.jsonl`.
- Claude Code and AGPL sibling repos stay uncloned.

## Run

```
cd apps/agent-stack
npm test
npm run adopt
./start.sh check
# headed local only: ./start.sh   →  http://127.0.0.1:4018/
```
