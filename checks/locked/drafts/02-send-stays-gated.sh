#!/usr/bin/env bash
# plain: Sending or posting is never done by the drafts hand: send asks are hard steps and the permission table gates "send".
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_DRAFTS_DIR=$T/d JARVIS_ACTION_LOG=$T/act.jsonl
python3 - <<"P"
from hands import drafts as D, permissions as P
from brain import pipeline as p
for u in ("Send that email to Zubair now.","Post the Slack message to #general."):
    assert not D.wants_draft(u) and p.is_hard_step(u), u
assert P.decide("send")=="confirm"
src=open("hands/drafts.py").read()
for bad in ("smtplib","sendmail","chat.postMessage","osascript","send_message"): assert bad not in src, bad
P
