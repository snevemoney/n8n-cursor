#!/usr/bin/env bash
# Reuse the canonical tracked credential scanner. Findings print path/kind only.
set -euo pipefail
repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
exec python3 "$repo_root/scripts/hive/eng/secret-scan.py"
