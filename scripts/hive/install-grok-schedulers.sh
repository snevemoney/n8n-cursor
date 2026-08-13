#!/usr/bin/env bash
# Install all Grok Mac schedulers: orchestrator (15m), biweekly craft, optional digest backup.
# Usage: bash scripts/hive/install-grok-schedulers.sh [--with-digest]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WITH_DIGEST=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-digest) WITH_DIGEST=1; shift ;;
    --repo) ROOT="${2:-}"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--with-digest] [--repo PATH]"
      exit 0
      ;;
    *) echo "Unknown: $1" >&2; exit 1 ;;
  esac
done

bash "$ROOT/scripts/hive/install-grok-orchestrator-launchd.sh" --repo "$ROOT"
bash "$ROOT/scripts/hive/install-grok-biweekly-launchd.sh" --repo "$ROOT"

if [[ "$WITH_DIGEST" -eq 1 ]]; then
  bash "$ROOT/scripts/hive/install-grok-digest-launchd.sh" --repo "$ROOT"
  echo "  digest backup: com.hive.grok-digest (07:05)"
else
  echo "  digest backup: skipped (pass --with-digest to install 07:05 backup)"
fi

echo "All Grok schedulers installed."
