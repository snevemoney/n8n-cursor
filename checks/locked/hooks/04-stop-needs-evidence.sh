#!/usr/bin/env bash
# plain: A reply that claims work was done (checked, ran, sent, done) with no tool evidence is not passed as verified; with a real tool wire it is.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import hooks as h
bad=h.stop_check({"ok":True,"tool":"converse","spoken":"Done, I checked the file.","wires":[]})
assert bad["task_verified"] is False and bad.get("evidence") is False, bad
good=h.stop_check({"ok":True,"tool":"workspace_read","spoken":"I checked: the first line is # Title.","wires":["workspace_read"]})
assert good.get("evidence") is True, good
chat=h.stop_check({"ok":True,"tool":"converse","spoken":"Good evening, sir.","wires":[]})
assert chat.get("evidence") is not False, chat
P
