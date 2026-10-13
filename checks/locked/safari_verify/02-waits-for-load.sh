#!/usr/bin/env bash
# plain: Jarvis keeps reading the tab for a few seconds while the page loads, and still says "not verified" if Safari never reaches the page.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import types, itertools
from hands import see as S
S._run = lambda *a, **k: types.SimpleNamespace(returncode=0, stdout="", stderr="")
seq = itertools.chain([{"ok": True, "open": True, "url": "https://old.example/", "title": "Old"}] * 4, itertools.repeat({"ok": True, "open": True, "url": "https://example.com/", "title": "Example Domain"}))
S.safari_front = lambda timeout=None: next(seq)
S.POLL_SEC = 0.01
r = S.safari_open("https://example.com"); assert r["ok"], r
S.safari_front = lambda timeout=None: {"ok": True, "open": True, "url": "https://other.example/", "title": "Other"}
r = S.safari_open("https://example.com"); assert not r["ok"] and "not yet verified" in r["spoken"], r
P
