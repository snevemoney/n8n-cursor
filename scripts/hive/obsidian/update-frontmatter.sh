#!/usr/bin/env bash
set -euo pipefail
FILE="${1:-}"; shift || true
[[ -n "$FILE" && -f "$FILE" ]] || { echo "Usage: update-frontmatter.sh note.md k=v ..."; exit 1; }
python3 - "$FILE" "$@" <<'PY'
import pathlib, sys
from datetime import datetime, timezone

path = pathlib.Path(sys.argv[1])
updates = {}
for arg in sys.argv[2:]:
    if "=" in arg:
        k, v = arg.split("=", 1)
        updates[k.strip()] = v.strip()

text = path.read_text(encoding="utf-8")
if text.startswith("---"):
    parts = text.split("---", 2)
    fm_lines = parts[1].strip().splitlines() if len(parts) >= 3 else []
    body = parts[2] if len(parts) >= 3 else text
else:
    fm_lines, body = [], text

fm, order = {}, []
for line in fm_lines:
    if ":" in line and not line.strip().startswith("#"):
        key, val = line.split(":", 1)
        key = key.strip()
        fm[key] = val.strip().strip('"').strip("'")
        order.append(key)

for k, v in updates.items():
    if k not in order:
        order.append(k)
    fm[k] = v

if "updated_at" not in updates:
    fm["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if "updated_at" not in order:
        order.append("updated_at")

out_fm = "\n".join(f"{k}: {fm[k]}" for k in order if k in fm)
lead = "\n" if body.startswith("\n") else "\n"
path.write_text(f"---\n{out_fm}\n---{lead}{body.lstrip(chr(10))}", encoding="utf-8")
print("Updated:", ", ".join(updates.keys()))
PY
