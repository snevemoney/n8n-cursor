#!/usr/bin/env bash
# plain: The turn log keeps metadata only for reader turns: no file text and no absolute home paths.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import workspace_read as w
m=w.log_meta({"ok":True,"op":"read","path":"/Users/someone/x/README.md","text":"# Secret Title"})
s=str(m); assert "Secret Title" not in s and "/Users/" not in s and m.get("op")=="read", m
P
