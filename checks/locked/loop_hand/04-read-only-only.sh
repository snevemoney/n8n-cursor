#!/usr/bin/env bash
# plain: A loop that would send, pay, delete, deploy, post or write anything is refused; loops can only check things.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
f=pathlib.Path(tempfile.mkdtemp())/"loops.json"; os.environ["JARVIS_LOOPS_FILE"]=str(f)
from hands import loop as L
for w in ('send an email to Bob','delete old files','deploy the site','post a tweet','pay the invoice','write a file'):
    r=L.run({'op':'start','what':w,'every_min':60}); assert r['ok'] is False, (w,r)
P
