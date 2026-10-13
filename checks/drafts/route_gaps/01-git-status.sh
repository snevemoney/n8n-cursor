#!/usr/bin/env bash
# plain: "What does git status say?" goes to the file-read hand and reports clean vs. changed from real git, not a guess.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import subprocess, tempfile, pathlib, os
from brain import pipeline as p
from hands import workspace_read as W
for u in ["What does git status say in your repo? Any uncommitted changes?", "Is my working tree clean?", "Do I have uncommitted changes?"]:
    r = p.model_free_route(u); assert r and r["tool"] == "workspace_read", (u, r)
    assert W.args_from_utterance(u)["op"] == "status", u
d = pathlib.Path(tempfile.mkdtemp()); subprocess.run(["git","init","-q",str(d)],check=True)
subprocess.run(["git","-C",str(d),"-c","user.email=a@b","-c","user.name=t","commit","-q","--allow-empty","-m","x"],check=True)
r = W.run({"op":"status","path":str(d)}, roots=[d]); assert r["ok"] and "clean" in r["spoken"].lower(), r
(d/"new.txt").write_text("x")
r = W.run({"op":"status","path":str(d)}, roots=[d]); assert r["ok"] and "1" in r["spoken"] and "clean" not in r["spoken"].lower(), r
assert "new.txt" not in str(W.log_meta(r))
P
