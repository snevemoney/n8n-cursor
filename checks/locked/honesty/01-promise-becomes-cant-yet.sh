#!/usr/bin/env bash
# plain: A reply that only promises an action ('I'll check your Downloads folder') with no tool run becomes an honest 'I can't do that yet' line.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from mouth import persona as m
for s in ["I'll check your Downloads folder for you, sir.","I'll open example.com in Safari and get the page title for you."]:
    o=m.promise_guard(s, ran_tool=False); l=o.lower()
    assert "i'll" not in l and "can't" in l and "yet" in l, o
P
