#!/usr/bin/env bash
# plain: Jarvis lists active loops, and cancel really stops one: it no longer shows as active.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
f=pathlib.Path(tempfile.mkdtemp())/"loops.json"; os.environ["JARVIS_LOOPS_FILE"]=str(f)
from hands import loop as L
a=L.run({'op':'start','what':'check disk','every_min':10})['loop']['id']
b=L.run({'op':'start','what':'check vps status','every_min':30})['loop']['id']
assert {x['id'] for x in L.run({'op':'list'})['loops']}=={a,b}
assert L.run({'op':'cancel','id':a})['ok']
assert {x['id'] for x in L.run({'op':'list'})['loops']}=={b}
assert L.run({'op':'cancel','id':'nope'})['ok'] is False
P
