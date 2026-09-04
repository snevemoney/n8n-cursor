---
name: talk-then-see-then-bus
description: >-
  Voice + live screen share on the existing agentic OS. Mouth writes
  the file bus. Face reads it. Hive skills, file sandbox, queued
  browse/watch. ASK before side effects. Hands arm after Yes, then
  a preview click moves the Mac mouse. Cursor plus Grok. Do not
  install Claude Code.
---

# Talk, then see, then bus

**Owner:** Forge (pane) · Watchdog (GRADE) · HITL (hard steps).  
**Status:** WIRED 2026-09-04. Hands unparked the same day (Evens: do not park). Not accepted forever.  
**Cursor copy:** `.cursor/skills/talk-then-see-then-bus/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/talk-then-see-then-bus/SKILL.md`  
**CLI:** `python3 scripts/hive/os/voice-os.py serve|self-test|turn`  
**Driver:** `python3 scripts/hive/os/hands.py` (ctypes CoreGraphics, dry-run in tests)  
**Parents:** `adopt-then-bus-then-os` · `voice-four-pieces-three-doors` · `barge-in-then-tool-silence` · `observe-pane`  
**Surface:** `apps/portfolio/public/obsidianOS/voice.html` via `127.0.0.1:4018`

**Tapes:** `whIp1SOahOM` · `ud7wzdiM0gk` · `YK-qJwmwjVc` (caption-only). Steal gather→ask→act, see-the-screen, narrate, interrupt, **mouse takeover**. Claude Code / Fable / Retell / phone = operate-never.

## Card

```
DONE-CHECK: voice-os.py self-test + pane on 127.0.0.1:4018/voice.html (hold-talk, getDisplayMedia, bus poll, ASK, hands arm + dry click)
CAP: this Mac only · 127.0.0.1 · no inferred hard-step clicks · no phone · no billed TTS
COST: Web Speech + speechSynthesis + ctypes CoreGraphics. No pyobjc / cliclick. ElevenLabs ASK.
STOP-KIND: cap + done-check
HOSTS: cursor + grok
PERMISSION: ask
HANDS: wired (ASK then bus.hands_armed)
```

## Steps

1. `python3 scripts/hive/os/agent-stack.py adopt && python3 scripts/hive/os/agent-stack.py validate`
2. `python3 scripts/hive/os/voice-os.py self-test`
3. `python3 scripts/hive/os/voice-os.py serve` — open `http://127.0.0.1:4018/voice.html`
4. Share **Entire Screen**. Hold talk or type. Yellow = approve.
5. Say **take the mouse** → Yes. Click the preview to click the Mac. Esc / **hands off** disarms.
6. Enable Accessibility for the Terminal/Python running `voice-os.py` if HID events do not land.
7. Browse / watch become jobs on `.hive/bus/jobs.jsonl` for the Cursor host (`cursor-ide-browser` / `cursor-video-watch`).
8. Watchdog GRADE. Builder does not self-PROVEN.

## Never

Claude Code / Fable / Cowork · Retell / Twilio / Vapi / phone · invent a click from a button name · 0.0.0.0 bind · send / pay / deploy / book / publish · second OS home · AGPL vendor into `apps/` · live `/` · post live CGEvents in unit tests
