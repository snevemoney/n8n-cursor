#!/usr/bin/env bash
# Run a short script on the VPS via Hostinger Docker Manager (cursor-ops project).
# Usage: scripts/hostinger-cursor-ops.sh <<'EOF'
#   echo hello
# EOF
set -euo pipefail

HOSTINGER_API_TOKEN="${HOSTINGER_API_TOKEN:-Gx0BB3W2T4U9kzCiYLKPGPNhauVbxWFym2c5Ibh6894f797c}"
VPS_ID="${VPS_ID:-765579}"
BASE="https://developers.hostinger.com/api/vps/v1"
PROJECT="cursor-ops"

if [[ -n "${1:-}" && -f "$1" ]]; then
  INNER="$(cat "$1")"
else
  INNER="$(cat)"
fi

# Wrap so we always emit a completion marker
FULL="$(printf '%s\n%s\n' "$INNER" 'echo CURSOR_OPS_DONE')"
INNER_B64="$(printf '%s' "$FULL" | base64 -w0 2>/dev/null || printf '%s' "$FULL" | base64 | tr -d '\n')"

python3 - "$INNER_B64" <<'PY' > /tmp/cursor-ops-payload.json
import json, sys
inner_b64 = sys.argv[1]
compose = (
    "services:\n"
    "  ops:\n"
    "    image: docker:27-cli\n"
    "    restart: \"no\"\n"
    "    privileged: true\n"
    "    network_mode: host\n"
    "    volumes:\n"
    "      - /root:/root-host\n"
    "      - /opt:/opt\n"
    "      - /etc/caddy:/etc/caddy\n"
    "      - /var/run/docker.sock:/var/run/docker.sock\n"
    "      - /run:/run\n"
    "    environment:\n"
    f"      SCRIPT_B64: \"{inner_b64}\"\n"
    "    entrypoint: [\"/bin/sh\", \"-c\"]\n"
    '    command: ["echo $$SCRIPT_B64 | base64 -d > /tmp/run.sh && sh /tmp/run.sh && sleep 2"]\n'
)
# Compose $$ → $ for docker-compose env interpolation avoidance; we want shell $SCRIPT_B64.
# Actually docker compose treats $$ as escaped $. Good — container sees $SCRIPT_B64.
print(f"content_len={len(compose)}", file=sys.stderr)
if len(compose) > 8192:
    raise SystemExit(f"content too long: {len(compose)}")
json.dump({"project_name": "cursor-ops", "content": compose}, sys.stdout)
PY

echo "Deploying cursor-ops..."
curl -sS -X POST \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/cursor-ops-payload.json \
  "$BASE/virtual-machines/$VPS_ID/docker" | tee /tmp/cursor-ops-deploy.json
echo

for i in $(seq 1 12); do
  sleep 3
  curl -sS -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
    "$BASE/virtual-machines/$VPS_ID/docker/$PROJECT/logs" > /tmp/cursor-ops-logs.json
  if grep -q 'CURSOR_OPS_DONE' /tmp/cursor-ops-logs.json; then
    # ensure this run finished (not only historical)
    break
  fi
done

python3 - <<'PY'
import json
d=json.load(open('/tmp/cursor-ops-logs.json'))
blocks = d if isinstance(d, list) else (d.get('logs') or d.get('data') or [d])
ops=[]
for block in blocks:
  if not isinstance(block, dict):
    continue
  svc=str(block.get('service') or '')
  for e in block.get('entries') or []:
    if isinstance(e, dict):
      ops.append((e.get('timestamp') or '', svc, e.get('line') or ''))
# keep only ops service lines
lines=[(ts,line) for ts,svc,line in ops if 'ops' in svc or svc=='']
# last segment ending with CURSOR_OPS_DONE
ends=[i for i,(ts,line) in enumerate(lines) if 'CURSOR_OPS_DONE' in str(line)]
if ends:
  end=ends[-1]
  start=ends[-2]+1 if len(ends)>1 else max(0, end-80)
  for ts,line in lines[start:end+1]:
    print(line)
else:
  for ts,line in lines[-80:]:
    print(line)
PY
