#!/usr/bin/env bash
# plain: "Read the file X.txt in my Downloads" reads Downloads/X.txt (not the repo).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, os
from hands import workspace_read as W
home = pathlib.Path(tempfile.mkdtemp()); (home/"Downloads").mkdir(); (home/"Downloads"/"note-zz.txt").write_text("Quarterly notes: revenue flat.\n")
os.environ["HOME"] = str(home)
a = W.args_from_utterance("Read the file note-zz.txt in my Downloads and summarize it.")
assert a["op"] == "read" and a["path"].endswith("Downloads/note-zz.txt"), a
r = W.run(a, roots=[home/"Downloads"]); assert r["ok"] and "revenue flat" in r["spoken"], r
P
