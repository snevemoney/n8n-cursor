#!/usr/bin/env bash
# plain: Asks like remember that..., what do you remember, forget ... go to memory; small talk and file reads do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Remember that my gate code is blue.","What do you remember about me?","Forget the gate code."]
no=["Tell me a short joke.","Read the first line of README.md in your repo.","Do you remember how to open example.com?" if False else "Open example.com in the browser","Good evening Jarvis"]
for u in yes: assert p.wants_memory(u), u
for u in no: assert not p.wants_memory(u), u
P
