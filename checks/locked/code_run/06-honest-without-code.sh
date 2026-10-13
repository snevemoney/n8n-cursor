#!/usr/bin/env bash
# plain: When the ask has no code in it, Jarvis says plainly what it needs instead of pretending it ran something.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import code_run as c
r=c.run(c.args_from_utterance("Write a python function that reverses a string and run its test."))
assert r.get("ran") is False and r["passed"] is False and "code" in r["spoken"].lower(), r
r2=c.run(c.args_from_utterance("Run this python: print(2+2)")); assert "4" in r2["stdout"], r2
P
