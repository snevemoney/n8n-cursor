#!/usr/bin/env bash
# plain: Jarvis refuses to read secrets (.env, keys, ~/.grok-private, ssh) and anything outside the allowed folders, including ../ and symlink escapes.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, os
from hands import workspace_read as w
d=pathlib.Path(tempfile.mkdtemp()); out=pathlib.Path(tempfile.mkdtemp())
for n in (".env","id_rsa","server.pem","creds.key",".env.local"): (d/n).write_text("SECRET=1")
(out/"x.txt").write_text("outside"); os.symlink(out/"x.txt", d/"link.txt")
pd=d/".grok-private"; pd.mkdir(); (pd/"a.md").write_text("p")
bad=[d/".env",d/"id_rsa",d/"server.pem",d/"creds.key",d/".env.local",out/"x.txt",d/"link.txt",pd/"a.md",str(d)+"/../"+out.name+"/x.txt"]
for p in bad:
    r=w.run({"op":"read","path":str(p)}, roots=[d])
    assert r["ok"] is False and "SECRET" not in str(r) and "outside" not in str(r.get("text","")), (p,r)
P
