#!/usr/bin/env bash
# Ingest one Obsidian trigger/strategy markdown file → hive-founder-signal
set -euo pipefail

FILE="${1:-}"
BASE="${EVENSLOUIS_BASE:-https://evenslouis.ca}"
SECRET="${HIVE_WEBHOOK_SECRET:-}"
VAULT="${HIVE_OBSIDIAN_VAULT:-}"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: HIVE_WEBHOOK_SECRET=... ingest-trigger-file.sh /path/to/note.md"
  exit 1
fi
if [[ -z "$SECRET" ]]; then
  echo "HIVE_WEBHOOK_SECRET required"
  exit 1
fi

rel="$FILE"
if [[ -n "$VAULT" && "$FILE" == "$VAULT"* ]]; then
  rel="${FILE#"$VAULT"/}"
fi

cid="obsidian-$(date +%s)-$(basename "$FILE" .md | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 24)"

payload=$(python3 <<PY
import json, re, pathlib
text = pathlib.Path("${FILE}").read_text(encoding="utf-8", errors="replace")
body = text
tags = []
if text.startswith("---"):
    parts = text.split("---", 2)
    if len(parts) >= 3:
        fm, body = parts[1], parts[2]
        for line in fm.splitlines():
            if line.strip().startswith("tags:"):
                rest = line.split(":", 1)[1].strip()
                if rest.startswith("["):
                    import ast
                    try:
                        tags = ast.literal_eval(rest)
                    except Exception:
                        pass
# wikilinks as tags
tags.extend(re.findall(r"\[\[([^\]|]+)", body))
tags = list(dict.fromkeys(t.strip() for t in tags if t))[:20]
print(json.dumps({
  "route": "founder-signal",
  "correlationId": "${cid}",
  "sourceRepo": "obsidian-vault",
  "payload": {
    "signalType": "note",
    "source": "obsidian",
    "path": "${rel}",
    "text": body.strip()[:8000],
    "tags": tags,
  }
}))
PY
)

curl -sS -X POST "${BASE}/webhook/hive-ecosystem-route" \
  -H "Content-Type: application/json" \
  -H "X-Hive-Secret: ${SECRET}" \
  -d "$payload" | python3 -m json.tool

echo ""
echo "Ingested ${rel} as ${cid}"
