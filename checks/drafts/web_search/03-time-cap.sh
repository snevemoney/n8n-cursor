#!/usr/bin/env bash
# plain: A search never takes longer than 6 seconds; a slow search is cut off with an honest line.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import time
from hands import web_search as w
assert w.TIMEOUT_S<=6
def slow(q,timeout): time.sleep(10); return []
t=time.time(); r=w.run({"query":"x"}, fetch=slow); assert time.time()-t<7.5 and r["ok"] is False, r
P
