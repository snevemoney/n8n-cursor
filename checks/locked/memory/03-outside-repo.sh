#!/usr/bin/env bash
# plain: The default memory file lives outside the repo (private), and is readable only by Evens (mode 600).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, pathlib, subprocess, stat
os.environ.pop('JARVIS_MEMORY_FILE', None)
from hands import memory as m
top=pathlib.Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip()).resolve()
p=pathlib.Path(m.default_path()).expanduser().resolve()
assert top not in p.parents, p
import tempfile; t=pathlib.Path(tempfile.mkdtemp())/'m.json'; os.environ['JARVIS_MEMORY_FILE']=str(t)
m.run({'op':'remember','text':'x'}); assert stat.S_IMODE(t.stat().st_mode)==0o600, oct(t.stat().st_mode)
P
