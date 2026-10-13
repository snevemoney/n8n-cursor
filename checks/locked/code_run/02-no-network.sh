#!/usr/bin/env bash
# plain: Code run by Jarvis cannot reach the network: a web request or socket connect fails.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import code_run as c
for code in ("import urllib.request\nurllib.request.urlopen(\"http://example.com\", timeout=3)\n",
             "import socket\nsocket.create_connection((\"1.1.1.1\", 53), timeout=3)\n"):
    r=c.run({"code":code}); assert r["passed"] is False, r
P
