#!/usr/bin/env bash
# plain: A hard-step tool (send, pay, deploy, book, publish) is blocked before it runs, even when the model picks it for an innocent-sounding ask.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from brain import pipeline as p, hooks as h
for t in ("send","pay","deploy","book","publish"):
    assert h.pre_tool(t, "hello there")["allow"] is False, t
    r=p.run_tool({"tool":t,"args":{}}, "hello there", hive=pathlib.Path(tempfile.mkdtemp()), retrieve_roots=[])
    assert r["tool"]=="refuse_hard_step" and r.get("sent") is False, r
assert h.pre_tool("workspace_read","read README")["allow"] is True
P
