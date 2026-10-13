#!/usr/bin/env bash
# plain: A different host or path is never counted as the requested page.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import see as S
assert S.same_page("https://example.com", "https://www.example.com/")
assert not S.same_page("https://example.com", "https://example.org/")
assert not S.same_page("https://example.com/a", "https://example.com/b")
P
