# TEST — adopt-then-bus-then-os · 2026-09-04

**Builder:** Forge (this sitting). Not Watchdog.
**Slice:** adopt existing vault + write file bus. Mouth/face parked.

```
DONE-CHECK: agent-stack.py self-test exits 0 · adopt writes .hive/agent-stack.json kind=agentic-os · validate exits 0 · no CLAUDE.md / no apps/fullstack-agent
CAP: no mic · no face server · no billed TTS · no live /
COST: local disk only
```

Commands:

```
python3 scripts/hive/tests/test_agent_stack.py
python3 scripts/hive/os/agent-stack.py self-test
python3 scripts/hive/os/agent-stack.py adopt
python3 scripts/hive/os/agent-stack.py validate
```
