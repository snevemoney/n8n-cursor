#!/usr/bin/env bash
# plain: A hand that failed (file not found) still reports ok=false: the fix does not paint failures green.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d)
JARVIS_READ_ROOTS=$T T=$T timeout 60 python3 - <<"P"
import os
from pathlib import Path
from brain import pipeline as p
o=p.apply_pipeline("Read the first line of NOPE.md in your repo.", hive=Path(os.environ["T"]), retrieve_roots=[])
assert o.get("ok") is False, {k:o.get(k) for k in ("ok","tool","spoken")}
P
rm -rf $T
