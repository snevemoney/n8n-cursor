#!/bin/bash
# Skip-TTS gate for the Juno pack (default) or a named VOICE_PACK.
# Exit 0 = cues.json hash matches printed full-cut cues AND expected wavs are on disk.
# Exit 1 = generate TTS.
# Exit 3 = host-gate.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "${SCRIPT_DIR}/.."
# shellcheck source=./_host-gate.sh
source "${SCRIPT_DIR}/_host-gate.sh"
wealth_host_gate

DATE="${1:-}"
if [[ ! "${DATE}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "usage: scripts/voice-pack-ready.sh YYYY-MM-DD" >&2
  exit 1
fi

PACK="${VOICE_PACK:-}"
if [[ -z "${PACK}" ]]; then
  if [[ -f "public/voice/${DATE}/full-higgs-juno/cues.json" ]]; then
    PACK="full-higgs-juno"
  elif [[ -f "public/voice/${DATE}/full-higgs-juno-${DATE}/cues.json" ]]; then
    PACK="full-higgs-juno-${DATE}"
  else
    PACK="full-higgs-juno"
  fi
fi

PACK_DIR="public/voice/${DATE}/${PACK}"
CUES="${PACK_DIR}/cues.json"
TMP="$(mktemp)"
trap 'rm -f "${TMP}"' EXIT

npx tsx src/voice/printCues.ts "${DATE}" > "${TMP}"

python3 - "${CUES}" "${TMP}" <<'PY'
import hashlib
import json
import re
import sys
from pathlib import Path

cues_path = Path(sys.argv[1])
printed = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
full = printed["cuts"]["full"]


def safe_name(scene: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]", "-", scene) + ".wav"


def normalize(cues):
    rows = []
    for cue in cues:
        scene = cue["sceneId"]
        rows.append(
            {
                "file": cue.get("file") or safe_name(scene),
                "lines": cue["lines"],
                "sceneId": scene,
            }
        )
    return rows


expected = normalize(full["cues"])
exp_hash = hashlib.sha256(
    json.dumps(expected, sort_keys=True, ensure_ascii=False).encode("utf-8")
).hexdigest()
expected_n = len(expected)

if not cues_path.is_file():
    print(f"NEED_TTS missing_cues expected={expected_n} hash={exp_hash}")
    raise SystemExit(1)

disk = json.loads(cues_path.read_text(encoding="utf-8"))
disk_rows = normalize(disk.get("cues") or [])
disk_hash = hashlib.sha256(
    json.dumps(disk_rows, sort_keys=True, ensure_ascii=False).encode("utf-8")
).hexdigest()
pack = cues_path.parent
missing = [row["file"] for row in expected if not (pack / row["file"]).is_file()]
present = expected_n - len(missing)

if disk_hash == exp_hash and not missing:
    print(f"SKIP_TTS hash={disk_hash} wavs={expected_n} pack={pack}")
    raise SystemExit(0)

print(
    f"NEED_TTS hash_disk={disk_hash} hash_expected={exp_hash} "
    f"wavs={present}/{expected_n} missing={len(missing)}"
)
raise SystemExit(1)
PY
