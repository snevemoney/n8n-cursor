#!/usr/bin/env bash
# plain: There is one ack line: 'On it.' is defined once (ACK_LINE in brain/pipeline.py), not copied into mouth/ or face/.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); trap "rm -rf $T" EXIT; export T
n=$(grep -rn "\"On it\.\"" brain mouth face hands --include=*.py | grep -v "/test_" | wc -l)
[ "$n" -eq 1 ] || { echo "On it. literals: $n" >&2; exit 1; }
