#!/usr/bin/env bash
# plain: The log line for a memory turn has metadata only (op, ok, count), never the remembered text.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json, subprocess, sys
tmp=pathlib.Path(tempfile.mkdtemp())/"mem.json"; os.environ["JARVIS_MEMORY_FILE"]=str(tmp)
from hands import memory as m
r=m.run({'op':'remember','text':'secret-ish phrase zebra'}); assert 'log' in r and 'zebra' not in json.dumps(r['log']), r
assert set(r['log']) <= {'op','ok','count','tool','ms'}, r['log']
P
