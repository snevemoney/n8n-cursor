#!/usr/bin/env bash
# plain: A missing or broken config file is skipped without crashing, and the reply says how many were skipped.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from hands import mcp_inventory as mi
d=pathlib.Path(tempfile.mkdtemp()); (d/"bad.json").write_text("{not json")
r=mi.run({}, paths=[("claude",d/"bad.json"),("cursor",d/"none.json")])
assert r["ok"] is True and r["servers"]==[] and r["skipped"]>=1, r
P
