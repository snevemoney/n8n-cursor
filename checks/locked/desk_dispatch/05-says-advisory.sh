#!/usr/bin/env bash
# plain: Jarvis says the card is advisory and was not sent, and names the desk.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json
t=pathlib.Path(tempfile.mkdtemp()); at=t/"ACTIVE_TASKS.md"
at.write_text("| Surface | Owner |\n|---|---|\n| Jev router labels (advisory) | Jev desk (ADVISORY) since 02:00 |\n")
os.environ["JARVIS_ACTIVE_TASKS"]=str(at)
from hands import desk_dispatch as dd
r=dd.run(dd.args_from_utterance('Ask Jev whether I should merge PR 619.'), hive=t)
s=r['spoken'].lower(); assert 'jev' in s and 'advisory' in s and ('not sent' in s or 'nothing was sent' in s), r
P
