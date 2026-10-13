#!/usr/bin/env bash
# plain: Asking Jarvis to hand something to a desk writes one advisory job card on the hive bus with the desk, the ask and a time.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
t=pathlib.Path(tempfile.mkdtemp()); at=t/"ACTIVE_TASKS.md"
at.write_text("| Surface | Owner |\n|---|---|\n| Jev router labels (advisory) | Jev desk (ADVISORY) since 02:00 |\n")
os.environ["JARVIS_ACTIVE_TASKS"]=str(at)
from hands import desk_dispatch as dd
r=dd.run({'desk':'jev','ask':'should I merge PR 619?'}, hive=t)
cards=list((t/'.hive'/'bus'/'desk_cards').glob('*.json')); assert len(cards)==1, cards
c=json.loads(cards[0].read_text())
assert c['desk']=='jev' and 'PR 619' in c['ask'] and c['advisory'] is True and c['sent'] is False and c.get('at'), c
P
