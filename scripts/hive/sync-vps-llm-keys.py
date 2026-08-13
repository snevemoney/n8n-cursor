#!/usr/bin/env python3
"""Sync LLM keys from philanthropy/CE env into OpenClaw auth-profiles + model routing."""
from __future__ import annotations

import glob
import json
import os
import re
import shutil
from datetime import datetime, timezone

PHIL_ENV = "/opt/philanthropy/.env.local"
CE_ENV = "/root/client-engine/.env"
OPENCLAW = "/root/.openclaw/openclaw.json"
BB_ENV = "/root/.openclaw/workspace-bigboss/.env"

MODEL_PRIMARY = "openrouter/anthropic/claude-sonnet-4-6"
MODEL_FALLBACKS = [
    "openrouter/openai/gpt-4.1",
    "openrouter/openai/gpt-4o",
    "openrouter/openai/gpt-4o-mini",
]

OPENROUTER_MODELS = [
    ("anthropic/claude-sonnet-4-6", "Claude Sonnet 4.6"),
    ("anthropic/claude-haiku-4-5", "Claude Haiku 4.5"),
    ("openai/gpt-4.1", "GPT-4.1"),
    ("openai/gpt-4o", "GPT-4o"),
    ("openai/gpt-4o-mini", "GPT-4o mini"),
    ("openrouter/free", "OpenRouter Free"),
]


def model_entry(model_id: str, name: str) -> dict:
    return {
        "id": model_id,
        "name": name,
        "reasoning": False,
        "input": ["text"],
        "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
        "contextWindow": 200000,
        "maxTokens": 1024,
    }


def patch_models_json(path: str) -> None:
    if not os.path.isfile(path):
        return
    data = json.load(open(path, encoding="utf-8"))
    provider = data.setdefault("providers", {}).setdefault("openrouter", {})
    existing = {m.get("id") for m in provider.get("models", []) if isinstance(m, dict)}
    models = list(provider.get("models", []))
    for model_id, name in OPENROUTER_MODELS:
        if model_id not in existing:
            models.append(model_entry(model_id, name))
    provider["models"] = models
    provider.setdefault("baseUrl", "https://openrouter.ai/api/v1")
    provider.setdefault("api", "openai-completions")
    provider.setdefault("apiKey", "OPENROUTER_API_KEY")
    json.dump(data, open(path, "w", encoding="utf-8"), indent=2)


def load_env(path: str) -> dict[str, str]:
    out: dict[str, str] = {}
    if not os.path.isfile(path):
        return out
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        out[key] = value.strip().strip('"').strip("'")
    return out


def main() -> None:
    phil = load_env(PHIL_ENV)
    ce = load_env(CE_ENV)
    keys = {
        "anthropic": phil.get("ANTHROPIC_API_KEY", ""),
        "openai": ce.get("OPENAI_API_KEY") or phil.get("OPENAI_API_KEY", ""),
        "openrouter": phil.get("OPENROUTER_API_KEY", ""),
    }
    missing = [name for name, value in keys.items() if not value]
    if missing:
        raise SystemExit(f"Missing keys: {missing}")

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

    if os.path.isfile(BB_ENV):
        text = open(BB_ENV, encoding="utf-8").read()
        for name, val in [
            ("ANTHROPIC_API_KEY", keys["anthropic"]),
            ("OPENAI_API_KEY", keys["openai"]),
            ("OPENROUTER_API_KEY", keys["openrouter"]),
        ]:
            if re.search(rf"^{name}=", text, re.M):
                text = re.sub(rf"^{name}=.*$", f"{name}={val}", text, flags=re.M)
            else:
                text += f"\n{name}={val}\n"
        open(BB_ENV, "w", encoding="utf-8").write(text)

    if ce.get("OPENAI_API_KEY") and phil.get("OPENAI_API_KEY") != ce.get("OPENAI_API_KEY"):
        text = open(PHIL_ENV, encoding="utf-8").read()
        text = re.sub(
            r"^OPENAI_API_KEY=.*$",
            f"OPENAI_API_KEY={ce['OPENAI_API_KEY']}",
            text,
            flags=re.M,
        )
        open(PHIL_ENV, "w", encoding="utf-8").write(text)

    profile_paths = sorted(glob.glob("/root/.openclaw/agents/*/agent/auth-profiles.json"))
    for path in profile_paths:
        shutil.copy2(path, f"{path}.bak-{stamp}")
        data = json.load(open(path, encoding="utf-8"))
        profiles = data.setdefault("profiles", {})
        order = data.setdefault("order", {})
        last_good = data.setdefault("lastGood", {})

        profiles["anthropic:manual"] = {
            "type": "api_key",
            "provider": "anthropic",
            "key": keys["anthropic"],
        }
        profiles["openai:manual"] = {
            "type": "api_key",
            "provider": "openai",
            "key": keys["openai"],
        }
        profiles["openrouter:manual"] = {
            "type": "api_key",
            "provider": "openrouter",
            "key": keys["openrouter"],
        }

        order["anthropic"] = ["anthropic:manual"]
        order["openai"] = ["openai:manual"]
        order["openrouter"] = ["openrouter:manual"]

        last_good["anthropic"] = "anthropic:manual"
        last_good["openai"] = "openai:manual"
        last_good["openrouter"] = "openrouter:manual"
        data["usageStats"] = {}

        json.dump(data, open(path, "w", encoding="utf-8"), indent=2)

    shutil.copy2(OPENCLAW, f"{OPENCLAW}.bak-{stamp}")
    oc = json.load(open(OPENCLAW, encoding="utf-8"))
    agents = oc.setdefault("agents", {})
    defaults = agents.setdefault("defaults", {})
    defaults.setdefault("model", {})
    defaults["model"]["primary"] = MODEL_PRIMARY
    defaults["model"]["fallbacks"] = MODEL_FALLBACKS

    for agent in agents.get("list", []):
        model = agent.get("model")
        if isinstance(model, dict):
            model["primary"] = MODEL_PRIMARY
            model["fallbacks"] = MODEL_FALLBACKS

    json.dump(oc, open(OPENCLAW, "w", encoding="utf-8"), indent=2)

    model_paths = sorted(glob.glob("/root/.openclaw/agents/*/agent/models.json"))
    for path in model_paths:
        patch_models_json(path)

    print(f"auth-profiles updated: {len(profile_paths)}")
    print(f"models.json patched: {len(model_paths)}")
    print(f"openclaw primary: {MODEL_PRIMARY}")
    print("openai source:", "client-engine/.env" if ce.get("OPENAI_API_KEY") else "philanthropy")


if __name__ == "__main__":
    main()
