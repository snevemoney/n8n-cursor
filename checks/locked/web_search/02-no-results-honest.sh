#!/usr/bin/env bash
# plain: When search returns nothing or fails, Jarvis says it could not find sources instead of making an answer up.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import web_search as w
for f in (lambda q,timeout: [], lambda q,timeout: (_ for _ in ()).throw(OSError("down"))):
    r=w.run({"query":"x"}, fetch=f); assert r["ok"] is False and r["cites"]==[] and r["spoken"], r
P
