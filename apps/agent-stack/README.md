# @hive/agent-stack

Sittings 1–3 of the fullstack-agent **pattern** port. Original MIT code. Not a fork.

- Adopt the existing Obsidian vault. Never create `~/my-agent` or a `CLAUDE.md` home.
- Write `.hive/agent-stack.json` + `.hive/bus/state.json`.
- **Mouth (sitting 2):** hold Home / hold Talk → local STT → bus write → Cursor or Grok desk job after spoken yes. Local TTS (`say` or `speechSynthesis`). Auto-approve off. ElevenLabs ASK only.
- **Face (sitting 3):** `127.0.0.1:4018` cinematic observe-pane reads the bus. Not evenslouis.ca. Not a second hive.
- **Hands stay parked.** No mouse takeover.
- Hosts: Cursor + Grok. Claude Code operate-never.

```
npm test
npm run adopt
./start.sh check
./start.sh          # execs the face if present
```

PTT is on the face, not a mouth daemon. Type is fallback when Web Speech is missing.

Upstream (pattern only, AGPL, not vendored): https://github.com/jaredrhod/fullstack-agent
