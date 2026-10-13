#!/usr/bin/env bash
# plain: The card quotes the desk's current ACTIVE_TASKS lock row, or says there is none.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
t=pathlib.Path(tempfile.mkdtemp()); at=t/"ACTIVE_TASKS.md"
at.write_text("| Surface | Owner |\n|---|---|\n| Jev router labels (advisory) | Jev desk (ADVISORY) since 02:00 |\n")
os.environ["JARVIS_ACTIVE_TASKS"]=str(at)
from hands import desk_dispatch as dd
r=dd.run({'desk':'jev','ask':'x'}, hive=t); assert 'Jev desk (ADVISORY)' in r['card']['lock'], r
r=dd.run({'desk':'forge','ask':'x'}, hive=t); assert 'no ACTIVE_TASKS row' in r['card']['lock'], r
P
