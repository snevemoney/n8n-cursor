#!/usr/bin/env bash
# plain: The Face log keeps every old line, adds the new turn at the end, and a new day still starts with its header.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, datetime
from memory import chats as c
root=pathlib.Path(tempfile.mkdtemp()); c.dest_oh_roots=lambda extra=None: [root]
dest=root/c.SESSIONS_REL/"jarvis"/(datetime.date.today().isoformat()+".md")
c.append_jarvis_turn(utterance="first ask", spoken="first answer.", roots=[root])
t1=dest.read_text(); assert t1.startswith("---\nsurface: jarvis") and "first ask" in t1
c.append_jarvis_turn(utterance="second ask", spoken="second answer.", roots=[root])
t2=dest.read_text(); assert t2.startswith(t1) and t2.index("first ask")<t2.index("second ask")
P
