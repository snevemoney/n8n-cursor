#!/usr/bin/env bash
# plain: Code runs in a throwaway temp folder: files it writes land there, it cannot write into the repo or home, and the repo is unchanged.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
before=$(git status --porcelain | md5)
python3 - <<"P"
import pathlib, subprocess
from hands import code_run as c
top=subprocess.check_output(["git","rev-parse","--show-toplevel"],text=True).strip()
r=c.run({"code":"open(\"rel.txt\",\"w\").write(\"x\")\nprint(\"rel-ok\")"}); assert "rel-ok" in r["stdout"], r
assert not pathlib.Path("rel.txt").exists()
target=pathlib.Path(top)/"CODE_RUN_PROBE.txt"
r=c.run({"code":f"open({str(target)!r},\"w\").write(\"x\")"}); assert r["passed"] is False and not target.exists(), r
home=pathlib.Path.home()/"CODE_RUN_PROBE.txt"
r=c.run({"code":f"open({str(home)!r},\"w\").write(\"x\")"}); assert r["passed"] is False and not home.exists(), r
P
[ "$before" = "$(git status --porcelain | md5)" ]
