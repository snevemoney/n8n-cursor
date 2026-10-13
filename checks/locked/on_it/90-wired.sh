#!/usr/bin/env bash
# plain: 'On it.' is actually wired: the turn code yields ACK_LINE before running a fixed-route or file-read tool, and the logger writes first_chunk_ms.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); trap "rm -rf $T" EXIT; export T
grep -q "ACK_LINE" brain/pipeline.py
grep -q "first_chunk_ms" memory/turn_log.py
grep -q "first_ms" mouth/turn.py
