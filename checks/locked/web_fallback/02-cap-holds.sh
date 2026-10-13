#!/usr/bin/env bash
# plain: Trying two engines never breaks the 6-second cap: if both are slow, Jarvis answers honestly within about 6.5 s.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import time
from hands import web_search as W
W.ENGINES = [lambda q, t: time.sleep(5) or [], lambda q, t: time.sleep(5) or []]
t = time.time(); r = W.run({"query": "x"}); assert not r["ok"] and time.time() - t < 6.6, (r, time.time() - t)
P
