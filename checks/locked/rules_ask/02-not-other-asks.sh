#!/usr/bin/env bash
# plain: Asks about other rules (client sends, who can merge, PASS) still go to their existing answers, not the rules list.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
python3 - <<"P"
from brain import pipeline as p
for u in ["Summarize the rules for client sends.", "Who can merge PRs?", "Who is allowed to issue a PASS?", "Explain the rules of chess."]:
    r = p.model_free_route(u); assert not r or r["tool"] != "rules", (u, r)
P
