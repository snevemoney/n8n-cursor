#!/usr/bin/env bash
# plain: A run is cut off at 10 seconds and says it timed out.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import time
from hands import code_run as c
t=time.monotonic(); r=c.run({"code":"while True:\n    pass\n"}); el=time.monotonic()-t
assert r["timed_out"] is True and r["passed"] is False and el < 13, (r, el)
P
