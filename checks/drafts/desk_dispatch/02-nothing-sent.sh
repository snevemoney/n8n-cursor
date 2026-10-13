#!/usr/bin/env bash
# plain: Nothing is sent anywhere: the dispatch hand has no network, shell or messaging calls, and the result says sent: false.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
t=pathlib.Path(tempfile.mkdtemp()); at=t/"ACTIVE_TASKS.md"
at.write_text("| Surface | Owner |\n|---|---|\n| Jev router labels (advisory) | Jev desk (ADVISORY) since 02:00 |\n")
os.environ["JARVIS_ACTIVE_TASKS"]=str(at)
from hands import desk_dispatch as dd
r=dd.run({'desk':'watchdog','ask':'re-run checks'}, hive=t); assert r['sent'] is False and r['ok'], r
P
! grep -nE 'subprocess|urllib|requests|socket|smtplib|slack|telegram|Popen' hands/desk_dispatch.py
