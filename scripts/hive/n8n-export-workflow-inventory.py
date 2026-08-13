#!/usr/bin/env python3
"""Export full n8n workflow inventory (paginated API) for agent-workflow-map updates."""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUT = (
    ROOT / "docs/hive/outer-heaven/CONTENT/n8n-learning/live-workflow-inventory.json"
)
DEFAULT_MD = (
    ROOT / "docs/hive/outer-heaven/CONTENT/n8n-learning/live-workflow-inventory.md"
)


def _load_key() -> tuple[str, str]:
    base = os.environ.get("N8N_API_URL", "https://evenslouis.ca/n8n/api/v1").rstrip("/")
    if base.endswith("/api/v1"):
        api_root = base
    else:
        api_root = base.rstrip("/") + "/api/v1"
    key = os.environ.get("N8N_API_KEY", "").strip()
    if not key:
        for env_path in (
            Path.home() / ".grokbot/os-config.json",
            ROOT / ".env",
        ):
            if env_path.suffix == ".json" and env_path.is_file():
                try:
                    data = json.loads(env_path.read_text(encoding="utf-8"))
                    key = str(data.get("N8N_API_KEY", "")).strip()
                except json.JSONDecodeError:
                    pass
            elif env_path.is_file():
                for line in env_path.read_text(encoding="utf-8").splitlines():
                    if line.startswith("N8N_API_KEY="):
                        key = line.split("=", 1)[1].strip().strip('"').strip("'")
                        break
            if key:
                break
    if not key:
        raise SystemExit("N8N_API_KEY required (env or VPS .env)")
    return api_root, key


def fetch_all_workflows(api_root: str, key: str) -> list[dict]:
    out: list[dict] = []
    cursor: str | None = None
    while True:
        url = f"{api_root}/workflows?limit=100"
        if cursor:
            url += f"&cursor={urllib.parse.quote(cursor)}"
        req = urllib.request.Request(
            url,
            headers={"Accept": "application/json", "X-N8N-API-KEY": key},
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode())
        batch = body.get("data") or []
        out.extend(batch)
        cursor = body.get("nextCursor")
        if not cursor:
            break
    return out


def write_markdown(path: Path, workflows: list[dict], generated_at: str) -> None:
    active = [w for w in workflows if w.get("active")]
    lines = [
        "# Live n8n workflow inventory (API)",
        "",
        f"Generated: {generated_at}",
        f"Total: **{len(workflows)}** · Active: **{len(active)}** · Inactive: **{len(workflows) - len(active)}**",
        "",
        "Regenerate: `python3 scripts/hive/n8n-export-workflow-inventory.py --write`",
        "",
        "| Active | Name | ID |",
        "|--------|------|-----|",
    ]
    for w in sorted(workflows, key=lambda x: (not x.get("active"), str(x.get("name", "")).lower())):
        flag = "yes" if w.get("active") else "no"
        lines.append(f"| {flag} | {w.get('name', '?')} | `{w.get('id', '')}` |")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Export full n8n workflow inventory")
    ap.add_argument("--write", action="store_true", help="Write JSON + markdown under docs/")
    ap.add_argument("--json", action="store_true", help="Print JSON to stdout")
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--md", type=Path, default=DEFAULT_MD)
    args = ap.parse_args()

    api_root, key = _load_key()
    workflows = fetch_all_workflows(api_root, key)
    generated_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    active = sum(1 for w in workflows if w.get("active"))
    payload = {
        "generatedAt": generated_at,
        "source": api_root,
        "total": len(workflows),
        "active": active,
        "inactive": len(workflows) - active,
        "workflows": [
            {
                "id": w.get("id"),
                "name": w.get("name"),
                "active": bool(w.get("active")),
                "createdAt": w.get("createdAt"),
                "updatedAt": w.get("updatedAt"),
            }
            for w in workflows
        ],
    }

    if args.write:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        write_markdown(args.md, workflows, generated_at)
        print(f"Wrote {args.out} ({len(workflows)} workflows, {active} active)")
        print(f"Wrote {args.md}")

    if args.json or not args.write:
        print(json.dumps(payload, indent=2))
    else:
        print(f"total={len(workflows)} active={active}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
