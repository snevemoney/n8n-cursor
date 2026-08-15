#!/usr/bin/env python3
"""Seed PROJECTS/*.md notes from repo-registry.ts for Outer Heaven library.

Usage:
  python3 scripts/hive/outer-heaven/seed-project-notes.py
  python3 scripts/hive/outer-heaven/seed-project-notes.py --target docs/hive/outer-heaven/PROJECTS
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REGISTRY_TS = ROOT / "packages/shared-config/src/repo-registry.ts"
DEFAULT_TARGET = ROOT / "scripts/hive/obsidian-vault-template/00_Outer_Heaven/PROJECTS"


def parse_registry() -> list[dict]:
    if not REGISTRY_TS.is_file():
        return []
    text = REGISTRY_TS.read_text(encoding="utf-8")
    entries: list[dict] = []
    blocks = re.findall(r"\{\s*id:\s*'([^']+)'.*?\}", text, re.DOTALL)
    # Parse each object block more reliably
    for block in re.finditer(
        r"\{\s*id:\s*'(?P<id>[^']+)',\s*github:\s*'(?P<github>[^']+)',\s*name:\s*'(?P<name>[^']+)',\s*role:\s*'(?P<role>[^']+)',\s*lane:\s*'(?P<lane>[^']+)',\s*maturity:\s*'(?P<maturity>[^']+)',\s*pathVerdict:\s*'(?P<pathVerdict>[^']+)',\s*apexPath:\s*(?P<apex>null|'[^']*'),\s*confusionWith:\s*\[(?P<confusion>[^\]]*)\],\s*githubDescription:\s*\n?\s*'(?P<desc>[^']*)',\s*topics:\s*\[(?P<topics>[^\]]*)\],\s*canonicalHome:\s*'(?P<home>[^']+)',\s*notTheProductOf:\s*'(?P<not>[^']*)',",
        text,
        re.DOTALL,
    ):
        g = block.groupdict()
        apex = g["apex"]
        if apex != "null":
            apex = apex.strip("'")
        else:
            apex = None
        entries.append(
            {
                "id": g["id"],
                "github": g["github"],
                "name": g["name"],
                "role": g["role"],
                "lane": g["lane"],
                "maturity": g["maturity"],
                "pathVerdict": g["pathVerdict"],
                "apexPath": apex,
                "confusionWith": [x.strip().strip("'") for x in g["confusion"].split(",") if x.strip()],
                "topics": [x.strip().strip("'") for x in g["topics"].split(",") if x.strip()],
                "canonicalHome": g["home"],
                "notTheProductOf": g["not"],
            }
        )
    return entries


def local_paths(repo_id: str) -> dict[str, str]:
    """Known Mac/VPS paths for hive core repos."""
    mac = Path.home()
    paths: dict[str, str] = {
        "n8n-cursor": str(mac / "n8n-cursor"),
        "client-engine": str(mac / "client-engine-1") + " (or ~/client-engine)",
        "philanthropic-ai-agent": "iCloud philanthropic-ai-agent + VPS /root/philanthropic-ai-agent",
        "outer-heaven-backups": "VPS cron only",
    }
    return {"mac": paths.get(repo_id, "TBD — run discover-local-projects.py"), "vps": f"/root/domain-paths/{repo_id}" if repo_id == "n8n-cursor" else f"/root/{repo_id}"}


def render_note(entry: dict) -> str:
    paths = local_paths(entry["id"])
    apex = entry["apexPath"] or "None"
    confusion = ", ".join(entry["confusionWith"]) or "—"
    topics = ", ".join(entry["topics"]) or "—"
    return f"""---
repo_id: {entry["id"]}
lane: {entry["lane"]}
maturity: {entry["maturity"]}
survival_score: null
last_agent_touch: null
tags: [{topics}]
---

# {entry["name"]} (`{entry["id"]}`)

## Role

{entry["role"]}

## Paths

| Host | Path |
|------|------|
| Mac | {paths["mac"]} |
| VPS | {paths["vps"]} |
| GitHub | {entry["github"]} |

## Hive facts

- **Lane / maturity:** `{entry["lane"]}` / `{entry["maturity"]}`
- **Apex path:** {apex}
- **Canonical home:** {entry["canonicalHome"]}
- **Do not confuse with:** {confusion}
- **Not the product of:** {entry["notTheProductOf"]}

## Encyclopedia

See `docs/hive/PRODUCT_ENCYCLOPEDIA.md` § {entry["id"]}.

## Chronicle links

_(wikilink entries as sessions touch this project)_

## Blockers

_(operator / agent notes)_
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", type=Path, default=DEFAULT_TARGET)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    entries = parse_registry()
    if not entries:
        print("No entries parsed from repo-registry.ts", file=__import__("sys").stderr)
        return 1
    args.target.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        out = args.target / f"{entry['id']}.md"
        content = render_note(entry)
        if args.dry_run:
            print(f"Would write {out}")
        else:
            out.write_text(content, encoding="utf-8")
            print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
