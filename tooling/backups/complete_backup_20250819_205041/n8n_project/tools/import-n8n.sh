#!/usr/bin/env bash
set -euo pipefail

JSON="${1:-}"
if [[ -z "$JSON" || ! -f "$JSON" ]]; then
  echo "Usage: tools/import-n8n.sh /path/to/workflow.json" >&2
  exit 1
fi

echo "🔄 Importing workflow: $(basename "$JSON")"

# Try to import using n8n CLI as the n8n user
if command -v sudo &> /dev/null && id -u n8n &> /dev/null; then
  sudo -u n8n -H bash -lc "n8n import:workflow --input='${JSON}'"
  echo "✅ Imported: ${JSON}"
else
  echo "⚠️  n8n user not found or sudo not available"
  echo "💡 You can manually import this file in the n8n UI:"
  echo "   1. Open n8n web interface"
  echo "   2. Go to Workflows → Import"
  echo "   3. Upload: ${JSON}"
fi
