#!/usr/bin/env bash
# plain: Without Watch armed, a mac_act click is refused: nothing is clicked.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from brain import pipeline as p
r=p.run_tool({"tool":"mac_act","args":{"op":"click","x":0.5,"y":0.5,"label":"OK"}},"click the OK button",hive=pathlib.Path(tempfile.mkdtemp()),retrieve_roots=[])
assert r.get("ok") is not True and "clicked" not in str(r.get("spoken","")).lower(), r
P
