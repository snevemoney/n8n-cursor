#!/usr/bin/env bash
# plain: Jarvis can read a real file inside an allowed folder and gives back its actual first line, not a made-up one.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from hands import workspace_read as w
d=pathlib.Path(tempfile.mkdtemp()); (d/"README.md").write_text("# Real Title\nbody\n")
r=w.run({"op":"read","path":str(d/"README.md")}, roots=[d])
assert r["ok"] is True and r["text"].splitlines()[0]=="# Real Title", r
P
