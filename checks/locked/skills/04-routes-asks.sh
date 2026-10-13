#!/usr/bin/env bash
# plain: Asks like which skills do you have / read the feature-loop skill go to the skills hand; small talk and file reads do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Which skills do you have?","List your skills.","Read the feature-loop skill."]
no=["Tell me a short joke.","Read the first line of README.md in your repo.","Search the web for the latest stable Python","Good evening Jarvis"]
for u in yes: assert p.wants_skills(u), u
for u in no: assert not p.wants_skills(u), u
P
