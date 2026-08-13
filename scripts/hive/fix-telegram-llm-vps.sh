#!/usr/bin/env bash
# Fix Telegram silence: stuck OpenClaw gateway + model registry + OpenRouter max_tokens 402.
# Run on VPS: bash scripts/hive/fix-telegram-llm-vps.sh
set -euo pipefail

MAX_TOKENS="${HIVE_MAX_TOKENS:-1024}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "== Restore OpenRouter models in all agent models.json =="
python3 - <<PY
import glob, json, shutil
from datetime import datetime, timezone
from pathlib import Path

STAMP = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
MODELS = [
    ("anthropic/claude-sonnet-4-6", "Claude Sonnet 4.6"),
    ("anthropic/claude-haiku-4-5", "Claude Haiku 4.5"),
    ("openai/gpt-4.1", "GPT-4.1"),
    ("openai/gpt-4o", "GPT-4o"),
    ("openai/gpt-4o-mini", "GPT-4o mini"),
    ("openrouter/free", "OpenRouter Free"),
    ("meta-llama/llama-3.3-70b-instruct:free", "Llama 3.3 70B Free"),
]
MAX_TOKENS = int("${MAX_TOKENS}")

def entry(mid, name):
    return {
        "id": mid, "name": name, "reasoning": False, "input": ["text"],
        "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
        "contextWindow": 200000, "maxTokens": MAX_TOKENS,
    }

for path in glob.glob("/root/.openclaw/agents/*/agent/models.json"):
    shutil.copy2(path, f"{path}.bak-{STAMP}")
    data = json.loads(Path(path).read_text())
    prov = data.setdefault("providers", {}).setdefault("openrouter", {})
    existing = {m.get("id") for m in prov.get("models", []) if isinstance(m, dict)}
    models = [m for m in prov.get("models", []) if isinstance(m, dict)]
    for mid, name in MODELS:
        if mid not in existing:
            models.append(entry(mid, name))
        else:
            for m in models:
                if m.get("id") == mid:
                    m["maxTokens"] = MAX_TOKENS
    prov["models"] = models
    prov.setdefault("baseUrl", "https://openrouter.ai/api/v1")
    prov.setdefault("api", "openai-completions")
    prov.setdefault("apiKey", "OPENROUTER_API_KEY")
    Path(path).write_text(json.dumps(data, indent=2) + "\n")
print("models.json patched")
PY

echo "== Patch openclaw.json fallbacks + simple tier =="
python3 - <<'PY'
import json, shutil
from datetime import datetime, timezone
from pathlib import Path

STAMP = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
OPENCLAW = Path("/root/.openclaw/openclaw.json")
shutil.copy2(OPENCLAW, f"{OPENCLAW}.bak-{STAMP}")
oc = json.loads(OPENCLAW.read_text())
defaults = oc.setdefault("agents", {}).setdefault("defaults", {})
model = defaults.setdefault("model", {})
fallbacks = list(model.get("fallbacks") or [])
for fb in ["openrouter/openrouter/free", "openrouter/meta-llama/llama-3.3-70b-instruct:free"]:
    if fb not in fallbacks:
        fallbacks.append(fb)
model["fallbacks"] = fallbacks
entries = oc.setdefault("plugins", {}).setdefault("entries", {})
cr = entries.setdefault("complexity-router", {}).setdefault("config", {})
tiers = cr.setdefault("tiers", {})
tiers["simple"] = "openrouter/openrouter/free"
tiers.setdefault("free", "openrouter/openrouter/free")
tg = oc.setdefault("channels", {}).setdefault("telegram", {})
if tg.get("streaming") not in (True, False, "off", "partial", "block", "progress"):
    tg["streaming"] = "progress"
tg.pop("richMessages", None)
OPENCLAW.write_text(json.dumps(oc, indent=2) + "\n")
print("openclaw.json patched")
PY

if [[ -f "${SCRIPT_DIR}/sync-vps-llm-keys.py" ]]; then
  echo "== Sync LLM keys =="
  python3 "${SCRIPT_DIR}/sync-vps-llm-keys.py" || echo "WARN sync-vps-llm-keys skipped"
fi

echo "== Hard restart OpenClaw =="
pm2 stop openclaw 2>/dev/null || true
sleep 2
pkill -f "openclaw.mjs gateway" 2>/dev/null || true
pkill -f "openclaw/dist/index.js gateway" 2>/dev/null || true
pkill -f "openclaw-gateway" 2>/dev/null || true
sleep 2
pm2 start openclaw --update-env

for i in $(seq 1 12); do
  if curl -fsS --max-time 3 http://127.0.0.1:18789/health >/dev/null 2>&1; then
    echo "OpenClaw health OK"
    curl -sS http://127.0.0.1:18789/health
    break
  fi
  sleep 5
done

echo "== Ping operator in #general (topic 1) =="
if [[ "${HEAL_NO_PING:-0}" != "1" ]]; then
  export PATH="/opt/node22/bin:$PATH"
  /opt/node22/bin/node /opt/node22/lib/node_modules/openclaw/openclaw.mjs message send \
    --channel telegram \
    --target -1003718712318 \
    --thread-id 1 \
    --message "👑 Big Boss — Telegram lane repaired. Send *ping* or *status* in this thread." \
    --json || echo "WARN ping send failed"
else
  echo "skip ping (HEAL_NO_PING=1)"
fi

exit 0
