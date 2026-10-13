#!/usr/bin/env bash
# plain: A turn answered by a deterministic hand that worked (file read) reports ok=true, not ok=false.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); echo "# probe-line" > $T/README.md
JARVIS_READ_ROOTS=$T T=$T timeout 60 python3 - <<"P"
import os
from pathlib import Path
from brain import pipeline as p
o=p.apply_pipeline("Read the first line of README.md in your repo.", hive=Path(os.environ["T"]), retrieve_roots=[])
assert o.get("ok") is True and "probe-line" in str(o.get("spoken")), {k:o.get(k) for k in ("ok","tool","spoken")}
assert "Again, sir. Done" not in str(o.get("spoken")), o.get("spoken")
P
rm -rf $T
