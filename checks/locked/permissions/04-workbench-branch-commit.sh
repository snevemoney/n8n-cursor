#!/usr/bin/env bash
# plain: A scratch-repo task makes a new branch, writes code + test, runs the test in the sandbox and commits on that branch only; main is untouched and nothing is pushed; every step is logged.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
import os, subprocess, json
from hands import workbench as W
fake=lambda m,p: "```python\ndef add(a, b):\n    return a + b\n```\n```python\nassert add(2, 3) == 5\n```"
u="In my scratch repo, on a new branch, add a function add(a, b) with a test, run the tests and commit."
assert W.wants_workbench(u)
r=W.run(u, chat=fake); assert r["committed"] and r["passed"] and r["branch"].startswith("jarvis/"), r
repo=os.environ["JARVIS_SCRATCH_ROOTS"]
g=lambda *a: subprocess.run(["git","-C",repo,*a],capture_output=True,text=True).stdout.strip()
assert g("rev-parse","--abbrev-ref","HEAD")==r["branch"]
assert g("log","--oneline","main").count("\n")==0, "main moved"
assert g("remote")=="", "a remote appeared"
kinds=[json.loads(l)["kind"] for l in open(os.environ["JARVIS_ACTION_LOG"])]
assert kinds[:1]==["git_branch"] and "edit" in kinds and "run_sandbox" in kinds and kinds[-1]=="git_commit", kinds
P
