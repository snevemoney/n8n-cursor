#!/usr/bin/env bash
# plain: Starting a loop records what it checks, how often, and checkable stop fields (stop_when, max_runs, expires), marked read-only.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
f=pathlib.Path(tempfile.mkdtemp())/"loops.json"; os.environ["JARVIS_LOOPS_FILE"]=str(f)
from hands import loop as L
r=L.run(L.args_from_utterance('Start a loop that checks disk space every 10 minutes.'))
assert r['ok'], r
x=r['loop']; assert x['every_min']==10 and 'disk' in x['what'] and x['read_only'] is True, x
for k in ('stop_when','max_runs','expires','id','created'): assert x.get(k) not in (None,''), (k,x)
P
