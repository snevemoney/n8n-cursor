#!/usr/bin/env bash
# plain: Something Jarvis is told to remember is still there after a restart (a fresh process reads it back).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile, pathlib, json, subprocess, sys
tmp=pathlib.Path(tempfile.mkdtemp())/"mem.json"; os.environ["JARVIS_MEMORY_FILE"]=str(tmp)
from hands import memory as m
r=m.run({'op':'remember','text':'gate code is blue-heron'}); assert r['ok'], r
out=subprocess.run([sys.executable,'-c','from hands import memory as m; print(m.run({"op":"recall"}))'],capture_output=True,text=True,env=dict(os.environ)).stdout
assert 'blue-heron' in out, out
P
