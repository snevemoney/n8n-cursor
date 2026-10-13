#!/usr/bin/env bash
# plain: "Write a python function that ... and run its test" makes the builder model write code and a test, a critic from a different model family reviews it, nothing runs yet, and Jarvis asks for "confirm"; "confirm" then runs it in the sandbox.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
python3 - <<"P"
import tempfile, pathlib
from brain import pipeline as p
from hands import code_author as A
calls = []
def chat(model, prompt):
    calls.append(model)
    if "Review" in prompt: return "LGTM: the test covers the empty string."
    return "```python\ndef rev(s):\n    return s[::-1]\n```\n```python\nassert rev('ab') == 'ba'\nassert rev('') == ''\n```"
A.CHAT = chat
hive = pathlib.Path(tempfile.mkdtemp())
u = "Write a python function that reverses a string and run its test."
assert p.model_free_route(u)["tool"] == "code_run"
r = p.run_tool({"tool": "code_run", "args": {}}, u, hive=hive, retrieve_roots=None)
assert "confirm" in r["spoken"].lower() and "critic" in r["spoken"].lower(), r
assert A.family(calls[0]) != A.family(calls[1]), calls
assert (hive / "bus" / "pending_confirm.json").exists()
pick = p.confirm_take(hive, "confirm"); assert pick and pick["tool"] == "code_run", pick
r2 = p.run_tool(pick, pick["utterance"], hive=hive, retrieve_roots=None)
assert "passed" in r2["spoken"], r2
P
