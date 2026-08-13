#!/usr/bin/env python3
"""Human schedule presets → cron or launchd for Grok agent routines."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Literal

PRESETS_PATH = Path(__file__).resolve().parent / "grok-schedule-presets.json"

Engine = Literal["cron", "launchd"]


def load_presets() -> dict[str, Any]:
    data = json.loads(PRESETS_PATH.read_text(encoding="utf-8"))
    return data["presets"]


def preset_names() -> list[str]:
    return sorted(load_presets().keys())


def resolve_preset(name: str) -> dict[str, Any]:
    presets = load_presets()
    if name not in presets:
        raise KeyError(f"Unknown schedule preset: {name}. Valid: {', '.join(preset_names())}")
    row = presets[name]
    engine = row["engine"]
    if engine == "cron":
        return {"engine": "cron", "cron": row["cron"], "label": row.get("label", name)}
    return {
        "engine": "launchd",
        "launchd": row["launchd"],
        "label": row.get("label", name),
    }


def preset_to_cron(name: str) -> str | None:
    """Return cron string or None if preset uses launchd."""
    resolved = resolve_preset(name)
    if resolved["engine"] == "cron":
        return resolved["cron"]
    return None


def is_launchd_preset(name: str) -> bool:
    return resolve_preset(name)["engine"] == "launchd"


def main() -> int:
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--preset", help="Resolve one preset")
    args = ap.parse_args()
    if args.list:
        for n in preset_names():
            r = resolve_preset(n)
            if r["engine"] == "cron":
                print(f"{n}\tcron\t{r['cron']}")
            else:
                print(f"{n}\tlaunchd\t{r['launchd']}")
        return 0
    if args.preset:
        print(json.dumps(resolve_preset(args.preset), indent=2))
        return 0
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
