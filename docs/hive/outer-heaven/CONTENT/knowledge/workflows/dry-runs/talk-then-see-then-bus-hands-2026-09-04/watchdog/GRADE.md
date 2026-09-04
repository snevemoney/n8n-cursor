# Watchdog GRADE — voice-os hands 2026-09-04

Status: **pending**

Builder must not self-PROVEN.

Check:

- `take over my mouse` classifies as `hands_on`, not refuse
- first take-the-mouse is ASK; Yes sets `bus.hands_armed`
- click without coords does not invent a target
- unit tests dry-run only
- pane Hands pill + preview POST `/api/hands` when armed
- send / pay / deploy / book / publish still refuse
- no Claude Code / Fable / phone
- bind 127.0.0.1
