#!/usr/bin/env bash
# plain: CI runs the eval on every PR that touches apps/agent-stack.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
f="$(git rev-parse --show-toplevel)/.github/workflows/jarvis-probe-eval.yml"
test -f "$f"
grep -q "pull_request" "$f"
grep -q "apps/agent-stack" "$f"
grep -q "eval/eval_probes.py" "$f"
