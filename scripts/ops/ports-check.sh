#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"; cd "$ROOT"
require() { command -v "$1" >/dev/null || { echo "Missing $1"; exit 1; }; }
require jq || true

echo "Registered ports (config/ports.yaml):"
python3 - <<'PY'
import yaml, json
print(json.dumps(yaml.safe_load(open("config/ports.yaml")), indent=2))
PY

echo "Active listeners:"
sudo lsof -i -P -n | sed -n '1,10p' || true
echo "Check complete."
