#!/usr/bin/env bash
# plain: Restart, reboot or shut down a server/VPS is a hard step (needs Evens's OK); a VPS status ask is still a read.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
for u in ["Restart my VPS.", "Reboot the server now.", "Shut down the VPS.", "Restart nginx on the VPS."]:
    assert p.is_hard_step(u), u
for u in ["What is the status of my Hostinger VPS?", "Is the VPS up?", "Restart the conversation, please."]:
    assert not p.is_hard_step(u), u
assert p.model_free_route("What is the status of my Hostinger VPS?")["tool"] == "status"
P
