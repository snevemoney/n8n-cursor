#!/usr/bin/env bash
# plain: Asks like "read the first line of README.md", "what branch are you on", "list my Downloads" and "which repos do you have" go to the reader; small talk does not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Read the first line of README.md in your repo.","What repo and branch are you working from right now?","Use a tool: list the files in my Downloads folder.","Which repos do you have installed locally?"]
no=["Tell me a short joke.","What is 17 times 23?","Good evening Jarvis, how are you doing tonight?","Open example.com in the browser"]
for u in yes: assert p.wants_workspace_read(u), u
for u in no: assert not p.wants_workspace_read(u), u
P
