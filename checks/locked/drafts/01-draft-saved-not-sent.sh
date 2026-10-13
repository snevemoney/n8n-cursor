#!/usr/bin/env bash
# plain: "Draft an email/Slack/text" writes a local draft file, reads it back, says it is not sent, and logs it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_DRAFTS_DIR=$T/d JARVIS_ACTION_LOG=$T/act.jsonl
python3 - <<"P"
import os, json
from hands import drafts as D
fake=lambda m,p: "Subject: Scorecard done\nHi Zubair, the Jarvis scorecard is done."
r=D.run("Draft an email to Zubair saying the Jarvis scorecard is done.", chat=fake)
assert r["ok"] and r["sent"] is False and "not sent" in r["spoken"] and "Zubair" in r["spoken"], r
assert os.path.isfile(r["file"]) and r["file"].startswith(os.environ["JARVIS_DRAFTS_DIR"])
k=[json.loads(l)["kind"] for l in open(os.environ["JARVIS_ACTION_LOG"])]; assert k==["draft"], k
assert D.channel("Draft a Slack message to the team")=="slack" and D.channel("Write a short text to Sam")=="text"
P
