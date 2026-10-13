#!/usr/bin/env bash
# plain: "Run this python and tell me the output: print(sum(range(10)))" runs exactly that code in the sandbox and says 45.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
python3 - <<"P"
from hands import code_run as C
a = C.args_from_utterance("Run this python and tell me the output: print(sum(range(10)))")
assert a.get("code") == "print(sum(range(10)))", a
r = C.run(a); assert r["passed"] and "45" in r["spoken"], r
P
