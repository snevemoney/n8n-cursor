#!/usr/bin/env bash
# plain: Opening example.com counts as verified when Safari lands on https://example.com/ (trailing slash or www. differences are the same page), and the reply names the page title.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import types
from hands import see as S
S._run = lambda *a, **k: types.SimpleNamespace(returncode=0, stdout="", stderr="")
S.safari_front = lambda timeout=None: {"ok": True, "open": True, "url": "https://example.com/", "title": "Example Domain"}
r = S.safari_open("https://example.com"); assert r["ok"] and "Example Domain" in r["spoken"], r
P
