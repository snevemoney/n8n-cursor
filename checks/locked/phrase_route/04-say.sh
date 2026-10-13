#!/usr/bin/env bash
# plain: 10 of 10 'say X' asks speak exactly X and nothing else.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=[("Say hello out loud.","hello"),("say hello","hello"),("Say: good morning","good morning"),('Say "testing one two"',"testing one two"),("say good night out loud","good night"),("Please say hi Evens","hi Evens"),("say the word teal","the word teal"),("Say ready.","ready"),("say: all clear","all clear"),("Say hello world out loud","hello world")]
for u,want in U:
    r=p.fixed_route(u); assert r and r["tool"]=="say" and r["speak"]==want, (u,r)
P
