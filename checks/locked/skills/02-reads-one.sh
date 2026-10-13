#!/usr/bin/env bash
# plain: Jarvis can read one named skill's text; an unknown name or a path like ../ is refused, and long skills are capped at 16 KB.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from hands import skills as s
d=pathlib.Path(tempfile.mkdtemp()); (d/"alpha").mkdir()
(d/"alpha"/"SKILL.md").write_text("---\nname: alpha\n---\nREAL BODY\n"+"x"*40000)
r=s.run({"op":"read","name":"alpha"}, roots=[d]); assert r["ok"] and "REAL BODY" in r["text"] and len(r["text"].encode())<=16384, (r.get("ok"), len(r.get("text","")))
for bad in ("nope","../alpha","/etc/passwd"):
    assert s.run({"op":"read","name":bad}, roots=[d])["ok"] is False, bad
P
