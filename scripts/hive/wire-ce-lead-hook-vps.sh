#!/usr/bin/env bash
# Wire CE Prisma lead-create → hive bridge on VPS (/root/client-engine)
set -euo pipefail

SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
CE_ROOT="${CE_VPS_ROOT:-/root/client-engine}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

ssh -o BatchMode=yes "$SSH_TARGET" "mkdir -p $CE_ROOT/src/lib/hive"

scp -o BatchMode=yes "$ROOT/scripts/hive/ce-lead-notify.ts" \
  "$SSH_TARGET:$CE_ROOT/src/lib/hive/lead-notify.ts"

ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<'REMOTE'
set -euo pipefail
CE_ROOT="/root/client-engine"
DB_TS="$CE_ROOT/src/lib/db.ts"
TOKEN=$(docker inspect evenslouis_paths-ce-hive-bridge-1 --format '{{range .Config.Env}}{{println .}}{{end}}' | grep '^CE_HIVE_TOKEN=' | cut -d= -f2-)
BRIDGE="http://evenslouis_paths-ce-hive-bridge-1:3205"

mkdir -p "$CE_ROOT/src/lib/hive"

python3 <<'PY'
from pathlib import Path
path = Path("/root/client-engine/src/lib/db.ts")
text = path.read_text()
if "notifyHiveLeadCreated" in text:
    print("db.ts already wired")
else:
    text = text.replace(
        'import { logSlow, PERF } from "@/lib/perf";',
        'import { logSlow, PERF } from "@/lib/perf";\nimport { notifyHiveLeadCreated } from "@/lib/hive/lead-notify";',
    )
    needle = '          return result;\n        });\n      },\n    },\n  });'
    insert = (
        '          if (model === "Lead" && operation === "create" && result && typeof result === "object" && "id" in result) {\n'
        '            notifyHiveLeadCreated(result as { id: string; contactName?: string | null; title?: string; contactEmail?: string | null; status?: string });\n'
        '          }\n'
        '          return result;\n        });\n      },\n    },\n  });'
    )
    if needle not in text:
        raise SystemExit("db.ts pattern not found — manual merge required")
    path.write_text(text.replace(needle, insert))
    print("db.ts updated")
PY

ENV_FILE="$CE_ROOT/.env"
touch "$ENV_FILE"
grep -q '^CE_HIVE_BRIDGE_URL=' "$ENV_FILE" && sed -i "s|^CE_HIVE_BRIDGE_URL=.*|CE_HIVE_BRIDGE_URL=${BRIDGE}|" "$ENV_FILE" || echo "CE_HIVE_BRIDGE_URL=${BRIDGE}" >> "$ENV_FILE"
grep -q '^CE_HIVE_TOKEN=' "$ENV_FILE" && sed -i "s|^CE_HIVE_TOKEN=.*|CE_HIVE_TOKEN=${TOKEN}|" "$ENV_FILE" || echo "CE_HIVE_TOKEN=${TOKEN}" >> "$ENV_FILE"

echo "==> Rebuild CE pro container"
cd "$CE_ROOT"
docker compose build pro
docker compose up -d pro
docker compose ps pro
REMOTE

echo "==> CE lead hook wired"
