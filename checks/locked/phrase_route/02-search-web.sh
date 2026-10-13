#!/usr/bin/env bash
# plain: 10 of 10 'search the web' phrasings go to web_search with just the question as the query.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=["Search the web: latest stable Python","search the web for the latest stable Python","Search online for latest stable Python","Look up online the latest stable Python","web search latest stable Python","Google the latest stable Python","search the internet for latest stable Python","Can you search the web for latest stable Python?","Please search the web: latest stable Python","check online: latest stable Python"]
for u in U:
    r=p.fixed_route(u); assert r and r["tool"]=="web_search" and "python" in r["args"]["query"].lower() and "search" not in r["args"]["query"].lower(), (u,r)
P
