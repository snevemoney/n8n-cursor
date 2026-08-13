#!/usr/bin/env python3
"""Spawn agent squads from templates into agent-roster-registry.json.

Usage:
  python3 scripts/hive/spawn-agent-squad.py --name AutoFlow --template gtm --dry-run
  python3 scripts/hive/spawn-agent-squad.py --sync-products --dry-run
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY_PATH = Path(__file__).resolve().parent / "agent-roster-registry.json"
REGISTRY_TS = ROOT / "packages/shared-config/src/repo-registry.ts"

_spec = importlib.util.spec_from_file_location(
    "agent_roster_registry", Path(__file__).resolve().parent / "agent-roster-registry.py"
)
_roster_mod = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_roster_mod)
agent_fn = _roster_mod.agent
fused_agent = _roster_mod.fused_agent
gtm_squad_fused = _roster_mod.gtm_squad_fused
slug = _roster_mod.slug
TEMPLATES = _roster_mod.TEMPLATES


def load_registry() -> dict:
    if REGISTRY_PATH.is_file():
        return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    return _roster_mod.build_registry()


def save_registry(data: dict) -> None:
    REGISTRY_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def parse_products() -> list[dict]:
    text = REGISTRY_TS.read_text(encoding="utf-8")
    entries: list[dict] = []
    pattern = re.compile(
        r"\{\s*id:\s*'(?P<id>[^']+)',\s*github:\s*'(?P<github>[^']+)',\s*name:\s*'(?P<name>[^']+)',\s*role:\s*'(?P<role>[^']+)',\s*lane:\s*'(?P<lane>[^']+)',\s*maturity:\s*'(?P<maturity>[^']+)',\s*pathVerdict:\s*'(?P<pathVerdict>[^']+)',\s*apexPath:\s*(?P<apex>null|'[^']*'),\s*confusionWith:\s*\[(?P<confusion>[^\]]*)\],\s*githubDescription:\s*\n?\s*'(?P<desc>[^']*)',\s*topics:\s*\[(?P<topics>[^\]]*)\],\s*canonicalHome:\s*'(?P<home>[^']+)',\s*notTheProductOf:\s*'(?P<not>[^']*)',",
        re.DOTALL,
    )
    for m in pattern.finditer(text):
        g = m.groupdict()
        if g["role"] in ("product", "candidate", "research"):
            entries.append({"id": g["id"], "name": g["name"], "lane": g["lane"]})
    return entries


def existing_gtm_products(registry: dict) -> set[str]:
    squads = {a["squad"] for a in registry["agents"] if a["squad"].startswith("product-gtm-")}
    return {s.replace("product-gtm-", "") for s in squads}


def spawn_from_template(name: str, template: str) -> list[dict]:
    tpl = TEMPLATES.get(template)
    if not tpl:
        raise SystemExit(f"Unknown template: {template}")
    if template == "gtm":
        return [
            gtm_squad_fused(
                name,
                f"{name} product GTM",
                [f"https://www.google.com/search?q={slug(name)}"],
            )
        ]
    if template == "product-eng":
        squad = f"product-eng-{slug(name)}"
        return [
            fused_agent(
                display_name=f"{name} Full Stack",
                title=f"{name} Full Stack",
                category="craft",
                squad=squad,
                lane="engineering",
                role_profile="builder",
                phases=[("Build", f"{name} — full stack vertical slice")],
                fused_from=[f"{name} Eng Lead", f"{name} Frontend", f"{name} Test Engineer"],
                wave="research",
            ),
        ]
    if template == "creative-project":
        squad = f"creative-project-{slug(name)}"
        return [
            fused_agent(
                display_name=f"{name} Creative",
                title=f"{name} Creative",
                category="craft",
                squad=squad,
                lane="creative",
                role_profile="creative",
                phases=[
                    ("Produce", f"{name} — production"),
                    ("Visual", f"{name} — art direction"),
                    ("Edit", f"{name} — finishing"),
                ],
                fused_from=[f"{name} Producer", f"{name} Artist", f"{name} Editor"],
                wave="research",
            ),
        ]
    raise SystemExit(f"Unsupported template: {template}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", help="Product/project name for template")
    ap.add_argument("--template", choices=list(TEMPLATES.keys()))
    ap.add_argument("--sync-products", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    registry = load_registry()

    if args.sync_products:
        products = parse_products()
        covered = existing_gtm_products(registry)
        missing = [p for p in products if slug(p["name"]) not in covered and slug(p["id"]) not in covered]
        if args.dry_run:
            print(f"Products in repo-registry: {len(products)}")
            print(f"GTM squads covered: {len(covered)}")
            for p in missing:
                print(f"  UNCOVERED: {p['name']} ({p['id']})")
            return 0 if not missing else 1
        if not missing:
            print("All products have GTM squads")
            return 0
        for p in missing:
            rows = spawn_from_template(p["name"], "gtm")
            registry["agents"].extend(rows)
            print(f"Spawned GTM squad for {p['name']} ({len(rows)} agents)")
        registry["agentCount"] = len(registry["agents"])
        save_registry(registry)
        return 0

    if not args.name or not args.template:
        ap.error("--name and --template required unless --sync-products")

    rows = spawn_from_template(args.name, args.template)
    if args.dry_run:
        for r in rows:
            print(json.dumps({"id": r["id"], "displayName": r["displayName"], "squad": r["squad"]}))
        return 0

    registry["agents"].extend(rows)
    registry["agentCount"] = len(registry["agents"])
    save_registry(registry)
    print(f"Appended {len(rows)} agents to {REGISTRY_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
