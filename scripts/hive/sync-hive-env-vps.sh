#!/usr/bin/env bash
# Align HIVE_* secrets across VPS env files and restart n8n + scorpion.
# Safe to re-run; never prints secret values. Only syncs hive spine keys.
set -euo pipefail

SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_ROOT="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}"
N8N_DIR="${HIVE_N8N_DIR:-/home/evens/n8n-cursor}"
SYNC_KEYS=(HIVE_MACHINE_TOKEN HIVE_WEBHOOK_SECRET HIVE_TELEGRAM_CHAT_ID HIVE_TELEGRAM_TOPIC_ID N8N_API_KEY CE_HIVE_TOKEN)

ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
python3 <<'PY'
import pathlib, subprocess

SYNC_KEYS = ["HIVE_MACHINE_TOKEN", "HIVE_WEBHOOK_SECRET", "HIVE_TELEGRAM_CHAT_ID", "HIVE_TELEGRAM_TOPIC_ID", "N8N_API_KEY", "CE_HIVE_TOKEN"]
repo = pathlib.Path("${REMOTE_ROOT}/.env")
hive = pathlib.Path("${N8N_DIR}/.env.hive")
n8n_env = pathlib.Path("${N8N_DIR}/.env")
compose = pathlib.Path("${N8N_DIR}/docker-compose.yml")

def parse(path):
    out = {}
    if path.exists():
        for line in path.read_text().splitlines():
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                out[k] = v
    return out

sources = [parse(hive), parse(repo), parse(n8n_env)]
for container_name in ("n8n-cursor-n8n-1", "evenslouis_paths-ce-hive-bridge-1"):
    try:
        raw = subprocess.check_output(
            ["docker", "inspect", container_name, "--format", "{{range .Config.Env}}{{println .}}{{end}}"],
            text=True,
        )
        parsed = {}
        for line in raw.splitlines():
            if "=" in line:
                k, v = line.split("=", 1)
                parsed[k] = v
        sources.append(parsed)
    except Exception:
        pass

vals = {}
for key in SYNC_KEYS:
    for src in sources:
        if key in src and src[key]:
            vals[key] = src[key]
            break

for key in ("HIVE_MACHINE_TOKEN", "HIVE_WEBHOOK_SECRET"):
    if key not in vals or len(vals[key]) < 16:
        raise SystemExit(f"missing or short {key} — set on ${N8N_DIR}/.env.hive first")

def upsert(path, updates):
    lines = path.read_text().splitlines() if path.exists() else []
    out, seen = [], set()
    for line in lines:
        if "=" in line and not line.startswith("#"):
            k = line.split("=", 1)[0]
            if k in updates:
                out.append(f"{k}={updates[k]}")
                seen.add(k)
            else:
                out.append(line)
        else:
            out.append(line)
    for k, v in updates.items():
        if k not in seen:
            out.append(f"{k}={v}")
    path.write_text("\n".join(out) + "\n")

upsert(repo, vals)
upsert(n8n_env, vals)

text = compose.read_text()
if "HIVE_WEBHOOK_SECRET" not in text:
    text = text.replace(
        "      - HIVE_MACHINE_TOKEN=\${HIVE_MACHINE_TOKEN}",
        "      - HIVE_MACHINE_TOKEN=\${HIVE_MACHINE_TOKEN}\n      - HIVE_WEBHOOK_SECRET=\${HIVE_WEBHOOK_SECRET}",
    )
    compose.write_text(text)

print("synced keys:", ", ".join(sorted(vals.keys())))
PY

cd "${N8N_DIR}" && docker compose up -d n8n
cd "${REMOTE_ROOT}/infra/docker"
docker compose --env-file ../../.env -f docker-compose.evenslouis-paths.yml up -d scorpion
sleep 8
docker inspect n8n-cursor-n8n-1 --format '{{range .Config.Env}}{{println .}}{{end}}' | grep '^HIVE_' | sed 's/=.*/=***/'
docker inspect evenslouis_paths-scorpion-1 --format '{{range .Config.Env}}{{println .}}{{end}}' | grep '^HIVE_MACHINE_TOKEN=' | awk -F= '{print \$1 "=*** len " length(\$2)}'
REMOTE

echo "==> sync-hive-env-vps complete"
