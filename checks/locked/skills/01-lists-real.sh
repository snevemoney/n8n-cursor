#!/usr/bin/env bash
# plain: Asked which skills it has, Jarvis lists the real names from SKILL.md files on disk, nothing invented.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from hands import skills as s
d=pathlib.Path(tempfile.mkdtemp())
for n in ("alpha-skill","beta-skill"):
    (d/n).mkdir(); (d/n/"SKILL.md").write_text(f"---\nname: {n}\ndescription: does {n}\n---\n# {n}\nbody of {n}\n")
r=s.run({"op":"list"}, roots=[d])
assert r["ok"] is True and sorted(x["name"] for x in r["skills"])==["alpha-skill","beta-skill"], r
P
