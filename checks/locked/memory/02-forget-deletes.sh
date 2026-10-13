#!/usr/bin/env bash
# plain: Forget really deletes: after forget, recall does not return it and the text is gone from the file.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json, subprocess, sys
tmp=pathlib.Path(tempfile.mkdtemp())/"mem.json"; os.environ["JARVIS_MEMORY_FILE"]=str(tmp)
from hands import memory as m
m.run({'op':'remember','text':'parking spot 42C'}); m.run({'op':'remember','text':'likes oat milk'})
r=m.run({'op':'forget','text':'parking spot'}); assert r['ok'], r
assert '42C' not in json.dumps(m.run({'op':'recall'})) and '42C' not in tmp.read_text()
assert 'oat milk' in json.dumps(m.run({'op':'recall'}))
P
