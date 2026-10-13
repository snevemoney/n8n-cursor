#!/usr/bin/env bash
# plain: 10 of 10 'open <site>' phrasings go straight to the Safari hand with the right https URL.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=["Open example.com","open https://example.com","Open example.com in the browser and tell me the page title.","Please open example.com in Safari","open www.example.com","Open the site example.com","go to example.com","Open https://example.com/docs in safari.","open example.com please","Navigate to example.com"]
for u in U:
    r=p.fixed_route(u); assert r and r["tool"]=="safari_see" and r["args"]["act"]=="open" and "example.com" in r["args"]["url"] and r["args"]["url"].startswith("https://"), (u,r)
P
