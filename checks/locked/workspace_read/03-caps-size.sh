#!/usr/bin/env bash
# plain: A big file comes back cut to a fixed size with a clear 'truncated' note, so a read can't flood the answer.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from hands import workspace_read as w
d=pathlib.Path(tempfile.mkdtemp()); (d/"big.txt").write_text("x"*500000)
r=w.run({"op":"read","path":str(d/"big.txt")}, roots=[d])
assert r["ok"] and len(r["text"])<=w.MAX_BYTES<=16000 and r.get("truncated") is True, (len(r["text"]),r.get("truncated"))
P
