#!/usr/bin/env bash
# Park LightningFlow on evenslouis.ca — return 503 instead of proxying dead :3201/:3202/:3203
set -euo pipefail

SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
CADDYFILE="${HIVE_CADDYFILE:-/etc/caddy/Caddyfile}"
MARKER="# lightningflow-parked-503"

remote_patch() {
  ssh -o BatchMode=yes "$SSH_TARGET" "CADDYFILE='$CADDYFILE' MARKER='$MARKER' bash -s" <<'EOF'
set -euo pipefail
if grep -q "$MARKER" "$CADDYFILE" 2>/dev/null; then
  echo "Already patched ($MARKER present)"
  exit 0
fi

cp "$CADDYFILE" "${CADDYFILE}.bak.$(date +%Y%m%d%H%M%S)"

python3 - <<PY
from pathlib import Path
import re
import os

path = Path(os.environ["CADDYFILE"])
marker = os.environ["MARKER"]
text = path.read_text()

replacement = f"""\t# LightningFlow parked — containers optional (Secret 21 grid: CE/Scorpion/n8n core)
\t{marker}
\thandle /lightningflow* {{
\t\trespond "LightningFlow is parked on evenslouis.ca. Core hive: /scorpion, /pro, /n8n." 503
\t}}"""

pattern = r"\t# LightningFlow path deployment\.[\s\S]*?\thandle /lightningflow\* \{[\s\S]*?\n\t\}"
if not re.search(pattern, text):
    raise SystemExit("Could not find lightningflow block in Caddyfile")

text = re.sub(pattern, replacement, text, count=1)
path.write_text(text)
print("Patched Caddyfile")
PY

# Patch Caddy reload (systemd reload can fail with NAMESPACE on some hosts)
caddy validate --config "$CADDYFILE"
systemctl restart caddy
curl -sS -o /dev/null -w "lightningflow: %{http_code}\n" --max-time 5 https://evenslouis.ca/lightningflow || true
EOF
}

remote_patch
echo "LightningFlow parked (503)"
