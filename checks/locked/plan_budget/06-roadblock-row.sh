#!/usr/bin/env bash
# plain: A failed or UNKNOWN turn adds a roadblock entry (verb + outcome only, no text) to its log row; a good turn has none.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import time, json
from memory import turn_log as t
s=time.time()
r=t.build_row(started=s, ended=s+1, events=[{"verb":"web_search","ok":False,"outcome":"UNKNOWN","spoken":"secret words"}], talk=None, inject=None)
assert r["roadblock"]=={"verb":"web_search","outcome":"UNKNOWN"} and "secret words" not in json.dumps(r), r
r=t.build_row(started=s, ended=s+1, events=[{"verb":"workspace_read","ok":True}], talk=None, inject=None)
assert r["roadblock"] is None
P
