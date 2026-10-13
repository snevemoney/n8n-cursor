#!/usr/bin/env bash
# plain: Asks to start, list or cancel a loop go to the loop hand; small talk, loop me in and web searches do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Start a loop that checks disk space every 10 minutes.","List my loops.","Cancel the disk loop."]
no=["Tell me a short joke.","Loop me in on the PR.","Search the web for the latest stable Python","Good evening Jarvis"]
for u in yes: assert p.wants_loop(u), u
for u in no: assert not p.wants_loop(u), u
P
