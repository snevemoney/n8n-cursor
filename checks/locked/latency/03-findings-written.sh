#!/usr/bin/env bash
# plain: The latency findings are written down with measured numbers: where the 10-27 s after On it went, what was fixed, what is left.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
f=eval/latency-findings.md; [ -f $f ]; grep -qi "archive" $f; grep -qE "[0-9]+(\.[0-9]+)? ?s" $f; grep -qi "left" $f
