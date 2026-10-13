#!/usr/bin/env bash
# plain: If Jev is slow, the router does not wait: assist gives up within 800 ms and the normal path runs.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import time
from brain import jev_router as j
j.pick_skill=lambda u: (time.sleep(2), {"handler":"status","confidence":0.99})[1]
t=time.monotonic(); r=j.assist("run status"); el=time.monotonic()-t
assert r is None and el<=0.9, (r, el)
P
