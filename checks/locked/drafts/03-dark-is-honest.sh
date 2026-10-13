#!/usr/bin/env bash
# plain: If the writing model gives nothing, Jarvis says so and saves nothing.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_DRAFTS_DIR=$T/d JARVIS_ACTION_LOG=$T/act.jsonl
python3 - <<"P"
import os
from hands import drafts as D
r=D.run("Draft an email to Zubair.", chat=lambda m,p: None)
assert r["ok"] is False and "nothing was sent" in r["spoken"]
assert not os.path.exists(os.environ["JARVIS_DRAFTS_DIR"]) or not os.listdir(os.environ["JARVIS_DRAFTS_DIR"])
P
