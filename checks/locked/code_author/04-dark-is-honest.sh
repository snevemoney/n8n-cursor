#!/usr/bin/env bash
# plain: If the model can't write the code (no key, timeout, no code block), Jarvis says so, runs nothing and arms no confirm.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
python3 - <<"P"
import tempfile, pathlib
from brain import pipeline as p
from hands import code_author as A
A.CHAT = lambda m, pr: None
hive = pathlib.Path(tempfile.mkdtemp())
r = p.run_tool({"tool": "code_run", "args": {}}, "Write a python function that adds two numbers and run its test.", hive=hive, retrieve_roots=None)
assert "couldn't" in r["spoken"].lower() and not (hive / "bus" / "pending_confirm.json").exists(), r
P
