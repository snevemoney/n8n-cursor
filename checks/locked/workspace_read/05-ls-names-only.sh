#!/usr/bin/env bash
# plain: Listing a folder (like Downloads) returns file names only, at most 50, and never file contents.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from hands import workspace_read as w
d=pathlib.Path(tempfile.mkdtemp())
for i in range(80): (d/f"f{i:02}.txt").write_text("CONTENT")
r=w.run({"op":"ls","path":str(d)}, roots=[d])
assert r["ok"] and 0<len(r["names"])<=50 and "CONTENT" not in str(r) and r.get("more") is True, r
P
