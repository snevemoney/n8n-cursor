#!/usr/bin/env bash
# plain: Asked which repo/branch it is on, Jarvis reports the real branch and HEAD from git (and says 'detached' when it is), never a guess.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, subprocess as sp
from hands import workspace_read as w
d=pathlib.Path(tempfile.mkdtemp()); g=lambda *a: sp.run(["git","-C",str(d),*a],check=True,capture_output=True,text=True).stdout.strip()
g("init","-q","-b","feat-x"); (d/"f").write_text("1"); g("add","f"); g("-c","user.email=a@b","-c","user.name=t","commit","-qm","m")
sha=g("rev-parse","--short","HEAD")
r=w.run({"op":"git","path":str(d)}, roots=[d]); assert r["ok"] and r["branch"]=="feat-x" and r["head"].startswith(sha[:7]), r
g("checkout","-q","--detach")
r=w.run({"op":"git","path":str(d)}, roots=[d]); assert r["ok"] and r["branch"]=="detached" and r["head"].startswith(sha[:7]), r
P
