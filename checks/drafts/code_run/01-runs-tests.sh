#!/usr/bin/env bash
# plain: Jarvis runs a small Python snippet with its test and reports pass or fail truthfully.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import code_run as c
ok=c.run({"code":"def rev(s):\n    return s[::-1]\n","test":"assert rev(\"ab\")==\"ba\"\nprint(\"t-ok\")"})
assert ok["ok"] and ok["passed"] is True and "t-ok" in ok["stdout"], ok
bad=c.run({"code":"def rev(s):\n    return s\n","test":"assert rev(\"ab\")==\"ba\""})
assert bad["ok"] and bad["passed"] is False and "AssertionError" in bad["stderr"], bad
P
