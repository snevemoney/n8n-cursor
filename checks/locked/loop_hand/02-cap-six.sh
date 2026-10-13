#!/usr/bin/env bash
# plain: No more than 6 loops can be started per day; the 7th is refused in code.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
f=pathlib.Path(tempfile.mkdtemp())/"loops.json"; os.environ["JARVIS_LOOPS_FILE"]=str(f)
from hands import loop as L
for i in range(6): assert L.run({'op':'start','what':f'check disk {i}','every_min':15})['ok'], i
r=L.run({'op':'start','what':'check disk 7','every_min':15}); assert r['ok'] is False and '6' in r['spoken'], r
P
