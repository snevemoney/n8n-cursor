#!/usr/bin/env bash
# plain: Anything else keeps today's path: small talk, file reads, vault asks and near-misses get no fixed route.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=["Tell me a short joke.","Read the first line of README.md in your repo.","What did I say earlier?","search my vault for teal","Can you open up about how you work?","What would you say about Python?","Which repos do you have installed locally?","I saw it on my screen yesterday, remind me","what is a VPS","open question: should I merge?"]
for u in U:
    assert p.fixed_route(u) is None, (u, p.fixed_route(u))
P
