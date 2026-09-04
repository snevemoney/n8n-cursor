# Dry-run TEST — adopt-then-bus-then-mouth-or-face sittings 2–3 2026-09-04

```
DONE-CHECK: mouth self-test + face /healthz on 127.0.0.1:4018; Home PTT writes bus; yellow ASK; start.sh starts face, skips nothing required; hands parked
CAP: localhost · no inferred hard-step · no ElevenLabs · no mouse
COST: Web Speech + speechSynthesis + optional `say`
STOP-KIND: cap + done-check
```

Builder runs:

```
cd apps/agent-stack && npm test && npm run adopt && ./start.sh check
AGENT_STACK_DRY_TTS=1 python3 apps/agent-stack/mouth/test_turn.py
python3 apps/agent-stack/face/test_serve.py
```

Headed Home-key PTT is UNKNOWN on this cloud host — do not claim it.
Watchdog fills GRADE. Builder does not self-PROVEN.
