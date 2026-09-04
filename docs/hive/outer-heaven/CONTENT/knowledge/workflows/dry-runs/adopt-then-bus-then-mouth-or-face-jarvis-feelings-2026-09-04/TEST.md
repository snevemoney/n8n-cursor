# Dry-run TEST — adopt-then-bus-then-mouth-or-face sitting 4 (Jarvis feelings) 2026-09-04

```
DONE-CHECK: mouth self-test (always-on classify + vault Q&A + refuse hard-steps + ASK before desk) + face /healthz and GET / 200 on 127.0.0.1:4018; LIVE writes listen; MUTE kills mic; yellow ASK; start.sh starts face/serve.py; hands parked
CAP: localhost · no inferred hard-step · no ElevenLabs · no mouse · no headed-mic claim
COST: Web Speech + speechSynthesis + optional `say`
STOP-KIND: cap + done-check
```

Builder runs:

```
cd apps/agent-stack && npm test && npm run adopt && ./start.sh check
AGENT_STACK_DRY_TTS=1 python3 apps/agent-stack/mouth/test_turn.py
python3 apps/agent-stack/face/test_serve.py
```

Headed LIVE mic is UNKNOWN on this cloud host — do not claim it.
Watchdog fills GRADE. Builder does not self-PROVEN.
