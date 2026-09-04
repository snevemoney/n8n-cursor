# Catch-up — voice desk hands are wired

**Date:** 2026-09-04  
**Skill:** `talk-then-see-then-bus`  
**Do not ask Evens to paste.**  
**Override:** “I want it to be able to do mouse takeover too. Dont park it.”

## Official sentences

- Hands are wired on this Mac. First **take the mouse** is yellow ASK. Yes → `bus.hands_armed`.
- Share **Entire Screen**. Click the preview to click. Esc / **hands off** disarms.
- Driver is `scripts/hive/os/hands.py` (ctypes → CoreGraphics). No pyobjc, no cliclick, no Claude Code.
- Tests stay dry-run (`VOICE_OS_DRY_HANDS=1`). Live HID needs Accessibility for the process running `voice-os.py`.
- Send / pay / deploy / book / publish still refuse. Do not invent a click from a button name.

## Run

```
python3 scripts/hive/os/voice-os.py self-test
python3 scripts/hive/os/voice-os.py serve
# http://127.0.0.1:4018/voice.html
# Restart serve if an older process is still on 4018
```

Watchdog GRADE pending at `CONTENT/knowledge/workflows/dry-runs/talk-then-see-then-bus-hands-2026-09-04/watchdog/GRADE.md`.
