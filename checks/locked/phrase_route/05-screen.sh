#!/usr/bin/env bash
# plain: 10 of 10 screen asks go to the screen grab hand.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=["Take a screenshot of my screen and describe it.","describe my screen","what is on my screen?","whats on my screen","take a screenshot","screenshot please","grab my screen","look at my screen","Take a screen grab","what do you see on my screen"]
for u in U:
    r=p.fixed_route(u); assert r and r["tool"]=="safari_see" and r["args"]["act"]=="grab", (u,r)
P
