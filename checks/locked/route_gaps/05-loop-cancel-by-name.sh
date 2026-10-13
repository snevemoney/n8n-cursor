#!/usr/bin/env bash
# plain: "Cancel the disk space loop" cancels the loop that checks disk space (its full subject), but a fragment like "disk" still cancels nothing.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib
os.environ["JARVIS_LOOPS_FILE"]=str(pathlib.Path(tempfile.mkdtemp())/"loops.json")
from hands import loop as L
assert L.run(L.args_from_utterance("Start a loop that checks disk space every 10 minutes."))["ok"]
assert L.run({"op":"cancel","id":"disk"})["ok"] is False
r = L.run(L.args_from_utterance("Cancel the disk space loop.")); assert r["ok"], r
assert "disk" not in L.run({"op":"list"})["spoken"].lower().split("active")[-1] or "0 active" in L.run({"op":"list"})["spoken"].lower() or "no active" in L.run({"op":"list"})["spoken"].lower()
P
