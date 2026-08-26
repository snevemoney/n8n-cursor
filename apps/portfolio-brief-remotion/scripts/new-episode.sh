#!/bin/bash
# Copy the latest episode as a stub and register YYYY-MM-DD.
# Copied numbers are NOT live — overwrite from today's research.
set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-}"
if [[ ! "${DATE}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "usage: scripts/new-episode.sh YYYY-MM-DD" >&2
  exit 1
fi

DEST="src/data/episodes/${DATE}.ts"
if [[ -f "${DEST}" ]]; then
  echo "exists: ${DEST} — edit it; will not overwrite" >&2
  exit 1
fi

LATEST="$(ls src/data/episodes/*.ts | sort | tail -1)"
if [[ -z "${LATEST}" ]]; then
  echo "no source episode under src/data/episodes/" >&2
  exit 1
fi

python3 - "${LATEST}" "${DEST}" "${DATE}" <<'PY'
from datetime import datetime
from pathlib import Path
import sys

src_path = Path(sys.argv[1])
dest_path = Path(sys.argv[2])
new_date = sys.argv[3]
src_date = src_path.stem
src_label = datetime.strptime(src_date, "%Y-%m-%d").strftime("%b %d, %Y").upper()
new_label = datetime.strptime(new_date, "%Y-%m-%d").strftime("%b %d, %Y").upper()
text = src_path.read_text(encoding="utf-8")
text = text.replace(src_date, new_date).replace(src_label, new_label)
banner = (
    f"// STUB copied from {src_date}. Replace every number from today's research.\n"
    f"// Overwrite markets (GLOBAL/US/CA), opportunities, and unknowns from today's tape.\n"
    f"// Do not treat copied prices as live. Do not invent a ticker, score, or Next-NVDA name.\n"
)
dest_path.write_text(banner + text, encoding="utf-8")

ident = "episode" + new_date.replace("-", "")
load = Path("src/data/loadEpisode.ts")
body = load.read_text(encoding="utf-8")
if ident in body or f"'{new_date}'" in body:
    print(f"wrote {dest_path} (already registered)")
    raise SystemExit(0)

imp = f"import {{episode as {ident}}} from './episodes/{new_date}';\n"
if "/* new-episode:imports */" in body:
    body = body.replace("/* new-episode:imports */", imp + "/* new-episode:imports */")
else:
    last = body.rfind("from './episodes/")
    if last < 0:
        raise SystemExit("loadEpisode.ts: no episode import to append after")
    nl = body.find("\n", last)
    body = body[: nl + 1] + imp + body[nl + 1 :]

row = f"  '{new_date}': {ident},\n"
if "  /* new-episode:registry */" in body:
    body = body.replace("  /* new-episode:registry */", row + "  /* new-episode:registry */")
else:
    brace = body.find("const registry")
    open_b = body.find("{", brace)
    close_b = body.find("};", open_b)
    body = body[:close_b] + row + body[close_b:]

load.write_text(body, encoding="utf-8")
print(f"wrote {dest_path}")
print(f"registered {new_date} in src/data/loadEpisode.ts")
print("overwrite stub numbers from research, then: npm run typecheck && EPISODE_ID=" + new_date + " bash scripts/qa-stills.sh && bash scripts/still-pack.sh && bash scripts/render-voice.sh " + new_date + " && bash scripts/render-morning.sh " + new_date + " && bash scripts/render-day.sh " + new_date)
PY
