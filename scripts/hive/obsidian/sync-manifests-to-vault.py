#!/usr/bin/env python3
"""Mirror manifest.json → Obsidian tracking notes with YAML frontmatter."""
import json
import datetime
import pathlib
import os
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
VAULT = os.environ.get("HIVE_OBSIDIAN_VAULT")
if not VAULT:
    print("HIVE_OBSIDIAN_VAULT required", file=sys.stderr)
    sys.exit(1)

OUT = pathlib.Path(VAULT) / "02_System_Manifests"
OUT.mkdir(parents=True, exist_ok=True)


def write_note(src: pathlib.Path, slug: str) -> None:
    data = json.loads(src.read_text())
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    fm = {
        "app_id": data.get("tool_name") or data.get("repo_id") or slug,
        "status": data.get("status", "wip"),
        "repo_id": data.get("repo_id", slug),
        "version": data.get("version", ""),
        "last_sync": now,
        "health_rating": 100,
        "current_bottleneck": "",
    }
    lines = ["---"] + [f"{k}: {v}" for k, v in fm.items()] + ["---", ""]
    lines.append(f"# {data.get('tool_name') or slug}")
    lines.append("")
    lines.append(data.get("description", ""))
    lines.append("")
    lines.append("## Endpoints")
    for ep in data.get("endpoints", []):
        lines.append(f"- **{ep.get('id', '?')}** `{ep.get('method', 'GET')} {ep.get('path', '')}`")
    lines.append("")
    lines.append(f"Synced from hub `{src.name}`")
    out = OUT / f"{slug}.md"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote", out)


hub = ROOT / "manifest.json"
if hub.is_file():
    write_note(hub, "n8n-cursor")

ext = ROOT / "manifests" / "external"
if ext.is_dir():
    for f in ext.glob("*.manifest.json"):
        write_note(f, f.name.replace(".manifest.json", ""))

idx = ROOT / "scripts" / "hive" / "obsidian" / "build-graph-index.mjs"
if idx.is_file():
    subprocess.run(["node", str(idx), VAULT], check=False)

print("Manifest sync complete →", OUT)
