#!/usr/bin/env bash
# plain: Real answers are left alone: a joke, a file line, or a past-tense 'I checked' result is not changed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from mouth import persona as m
for s in ["Why don't scientists trust atoms? Because they make up everything.","The first line of README.md is: # hi","I checked the disk: 41% used."]:
    assert m.promise_guard(s, ran_tool=False)==s, s
P
