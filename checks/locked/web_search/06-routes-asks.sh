#!/usr/bin/env bash
# plain: Asks like 'search the web for the latest stable Python' go to web search, not the browser mission; small talk, 'open example.com' and file reads do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Search the web: latest stable Python","Look up online who won the 2026 World Cup","Google the current price of an iPhone 17"]
no=["Tell me a short joke.","Open example.com in the browser","Read the first line of README.md in your repo."]
for u in yes: assert p.wants_web_search(u), u
for u in no: assert not p.wants_web_search(u), u
P
