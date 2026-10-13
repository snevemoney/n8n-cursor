#!/usr/bin/env bash
# plain: 10 of 10 VPS status asks go to the live read-only status probe (which=vps), not old prose.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=["VPS status","What is the status of my Hostinger VPS?","vps status please","Is my VPS up?","How is the VPS doing?","status of the vps","Check my VPS status","Hostinger VPS status","is the server up","whats the vps status"]
for u in U:
    r=p.fixed_route(u); assert r and r["tool"]=="status" and r["args"]["which"]=="vps", (u,r)
P
