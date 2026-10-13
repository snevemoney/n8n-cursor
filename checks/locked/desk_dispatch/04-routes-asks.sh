#!/usr/bin/env bash
# plain: Asks like ask Jev whether..., dispatch this to the watchdog desk go to desk_dispatch; small talk, asking Cursor about code and sending email do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Ask Jev whether I should merge PR 619.","Dispatch this to the watchdog desk: re-run the checks.","Ask the Librarian desk to file this note."]
no=["Tell me a short joke.","Ask Cursor about this repo's code.","Send an email to Bob.","Good evening Jarvis"]
for u in yes: assert p.wants_desk_dispatch(u), u
for u in no: assert not p.wants_desk_dispatch(u), u
P
