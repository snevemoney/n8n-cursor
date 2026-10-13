#!/usr/bin/env bash
# plain: The pipeline routes draft asks to the drafts hand.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_DRAFTS_DIR=$T/d JARVIS_ACTION_LOG=$T/act.jsonl
python3 - <<"P"
from brain import pipeline as p
assert "drafts" in p.HANDS and "drafts" in p.DETERMINISTIC_HANDS
assert p._drafts_hand().wants_draft("Draft a Slack message to the team about the deploy.")
assert not p._drafts_hand().wants_draft("What is 17 times 23?")
P
