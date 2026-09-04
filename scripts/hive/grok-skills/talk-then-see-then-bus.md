---
name: talk-then-see-then-bus
description: >-
  Voice + live screen share on the existing agentic OS. Mouth writes
  the file bus. Face reads it. Hive skills, file sandbox, queued
  browse/watch. ASK before side effects. Hands stay parked.
  Cursor plus Grok. Do not install Claude Code.
---

# Talk, then see, then bus

**Owner:** Forge (pane) · Watchdog (GRADE) · HITL (hard steps).  
**Status:** WIRED 2026-09-04. Not accepted forever.  
**Cursor copy:** `.cursor/skills/talk-then-see-then-bus/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/talk-then-see-then-bus/SKILL.md`  
**CLI:** `python3 scripts/hive/os/voice-os.py serve|self-test|turn`  
**Parents:** `adopt-then-bus-then-os` · `voice-four-pieces-three-doors` · `barge-in-then-tool-silence` · `observe-pane`  
**Surface:** `apps/portfolio/public/obsidianOS/voice.html` via `127.0.0.1:4018`

**Tapes:** `whIp1SOahOM` · `ud7wzdiM0gk` · `YK-qJwmwjVc` (caption-only). Steal gather→ask→act, see-the-screen, narrate, interrupt. Claude Code / Fable / Retell / mouse takeover = operate-never.

## Card

```
DONE-CHECK: voice-os.py self-test + pane on 127.0.0.1:4018/voice.html (hold-talk, getDisplayMedia, bus poll, ASK)
CAP: one surface · no phone · no mouse takeover · no billed TTS
COST: Web Speech + speechSynthesis only. ElevenLabs ASK.
STOP-KIND: cap + done-check
HOSTS: cursor + grok
PERMISSION: ask
HANDS: parked
```

## Steps

1. `python3 scripts/hive/os/agent-stack.py adopt && python3 scripts/hive/os/agent-stack.py validate`
2. `python3 scripts/hive/os/voice-os.py self-test`
3. `python3 scripts/hive/os/voice-os.py serve` — open `http://127.0.0.1:4018/voice.html`
4. Share screen. Hold talk or type. Yellow = approve.
5. Browse / watch become jobs on `.hive/bus/jobs.jsonl` for the Cursor host (`cursor-ide-browser` / `cursor-video-watch`).
6. Watchdog GRADE. Builder does not self-PROVEN.

## Never

Claude Code / Fable / Cowork · Retell / Twilio / Vapi / phone · mouse-keyboard takeover · 0.0.0.0 bind · send / pay / deploy / book / publish · second OS home · AGPL vendor into `apps/` · live `/`
