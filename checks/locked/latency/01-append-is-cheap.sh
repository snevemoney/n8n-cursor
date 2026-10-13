#!/usr/bin/env bash
# plain: Logging a turn to a large daily Face log (20 MB) takes under 0.3 s: the log is appended, not re-read and rewritten every turn (this was the seconds of delay after On it).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, time, datetime
from memory import chats as c
root=pathlib.Path(tempfile.mkdtemp())
dest=root/c.SESSIONS_REL/"jarvis"/(datetime.date.today().isoformat()+".md"); dest.parent.mkdir(parents=True)
dest.write_text("---\nsurface: jarvis\n---\n"+("old line\n"*2_500_000))
c.dest_oh_roots=lambda extra=None: [root]
real=pathlib.Path.read_text
def guard(self,*a,**k):
    assert self!=dest, "whole log re-read"
    return real(self,*a,**k)
pathlib.Path.read_text=guard
t=time.monotonic(); c.append_jarvis_turn(utterance="what branch", spoken="On branch x.", verb="workspace_read", tool="workspace_read", wires=["workspace_read"], roots=[root])
assert time.monotonic()-t < 0.3, time.monotonic()-t
P
