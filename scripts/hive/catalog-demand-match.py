#!/usr/bin/env python3
"""Match operator need to catalog / lanes — USE | BUILD | RESEARCH | REFUSE | ASK."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"
LANES_PATH = ROOT / "scripts/hive/business-lanes.json"
TYPES_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/business-types.json"

KILL_TERMS = [
    "ofm",
    "ig farm",
    "betting",
    "polymarket",
    "auto-dial",
    "auto-dialer",
    "i do ai",
    "generic landing",
]

KEYWORD_MACHINES: list[tuple[str, list[str]]] = [
    ("product-ad-from-photo", ["ad", "ads", "ugc", "higgsfield", "creative", "dropship ad"]),
    ("clip-factory", ["clip", "shorts", "podcast", "youtube edit"]),
    ("private-book-install", ["book", "calendly", "intake", "missed call", "speed-to-lead", "plumber", "hvac"]),
    ("invoice-email-automation", ["invoice", "billing", "payment"]),
    ("inbox-to-task-routing", ["inbox", "email triage", "gmail"]),
    ("folder-to-deck", ["deck", "presentation", "pdf", "slides", "meeting"]),
    ("review-to-book", ["review", "google review", "clinic", "dental"]),
    ("list-anneal", ["list", "outbound", "b2b"]),
]


def _load_catalog() -> list[dict]:
    if not CATALOG_PATH.is_file():
        return []
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8")).get("entries", [])


def _load_lanes() -> list[dict]:
    return json.loads(LANES_PATH.read_text(encoding="utf-8")).get("lanes", [])


def _handshake_card(entry: dict | None, machine: str | None) -> dict:
    """Plugin / terminal / browser / writer for BUILD path."""
    plugins = (entry or {}).get("required_plugins") or []
    skills = (entry or {}).get("required_skills") or []
    mid = machine or (entry or {}).get("parent_model_id") or "unknown"
    plugin_status = "missing"
    if "higgsfield" in plugins:
        plugin_status = "check Grok plugins — Higgsfield authorized on this bot (HITL OAuth)"
    elif not plugins:
        plugin_status = "ok (none required)"

    terminal_cmds = [
        f"python3 scripts/hive/catalog-demand-match.py --need \"...\"",
    ]
    if entry:
        terminal_cmds.append(
            f"python3 scripts/hive/catalog-lane-upgrade.py --sku-id {entry['id']} --dry-run"
        )
    if mid == "product-ad-from-photo":
        terminal_cmds.append("See scripts/hive/grok-skills/product-ad-from-photo.md")
    if mid == "private-book-install":
        terminal_cmds.append("pnpm --filter speed-to-lead-demo dev  # after PR #39 merge")
        plugin_status = "n8n on-demand calling (connected_n8n) — propose HITL, do not connect Twilio"

    browser = []
    if "higgsfield" in plugins:
        browser.append("https://higgsfield.ai — fallback if plugin not connected")
    if mid == "private-book-install":
        browser.append("Prospect site — screenshot leak above fold (Forge)")
        browser.append("n8n On-demand calling (live) — no new Twilio OAuth")

    return {
        "plugin": plugin_status,
        "skills": skills or ["see steal sheet"],
        "terminal": terminal_cmds,
        "browser": browser or ["none"],
        "writer": "Cursor or Mac local-exec commits repo; Grok cloud recommends only",
    }


def match_need(need: str) -> dict:
    q = need.lower().strip()
    if any(k in q for k in KILL_TERMS):
        return {
            "verdict": "REFUSE",
            "reason": "Matches kill list — not our lane",
            "matches": [],
        }

    lanes = _load_lanes()
    catalog = _load_catalog()
    matches: list[dict] = []

    for lane in lanes:
        if lane.get("status") == "active":
            lid = lane["id"]
            if lid.replace("-", " ") in q or lid in q:
                matches.append({"kind": "lane", "id": lid, "lifecycle": "operating"})

    for mid, keywords in KEYWORD_MACHINES:
        if any(kw in q for kw in keywords):
            found = False
            for e in catalog:
                if e.get("parent_model_id") == mid or e.get("machine") == mid:
                    matches.append(
                        {
                            "kind": "catalog",
                            "id": e["id"],
                            "lifecycle": e.get("lifecycle"),
                            "machine": mid,
                        }
                    )
                    found = True
                    break
            if not found:
                matches.append(
                    {
                        "kind": "catalog",
                        "id": f"{mid}__unlisted",
                        "lifecycle": "catalog",
                        "machine": mid,
                    }
                )

    # dedupe
    seen = set()
    uniq = []
    for m in matches:
        key = (m["kind"], m.get("id"))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(m)

    operating = [m for m in uniq if m.get("lifecycle") == "operating" or m.get("kind") == "lane"]
    catalog_ready = [m for m in uniq if m.get("lifecycle") in ("catalog", "building", "researching")]

    if operating:
        verdict = "USE"
        reason = "Operating lane or machine already serves this need"
    elif catalog_ready:
        verdict = "BUILD"
        reason = "Catalog row exists — handshake tools/skills then pilot then upgrade"
    elif uniq:
        verdict = "RESEARCH"
        reason = "Partial match — deepen before upgrade"
    elif len(q.split()) < 3:
        verdict = "ASK"
        reason = "Need more specificity (who, outcome, channel)"
    else:
        verdict = "RESEARCH"
        reason = "Not in catalog — Researcher packet + demand-validate before lane"

    primary_entry = None
    primary_machine = None
    for m in uniq:
        if m.get("kind") == "catalog":
            for e in catalog:
                if e["id"] == m["id"]:
                    primary_entry = e
                    primary_machine = m.get("machine")
                    break
        if primary_entry:
            break
    if not primary_machine and uniq:
        primary_machine = uniq[0].get("machine") or uniq[0].get("id")

    handshake = _handshake_card(primary_entry, primary_machine)

    return {
        "verdict": verdict,
        "reason": reason,
        "need": need,
        "matches": uniq[:8],
        "handshake": handshake,
        "next": {
            "USE": "Run existing lane skill chain; do not spawn duplicate business",
            "BUILD": "Handshake → pilot → catalog-lane-upgrade.py --operator-yes (Cursor writes)",
            "RESEARCH": "researcher-research-to-system + insert catalog lifecycle=researching",
            "REFUSE": "Stop — nearest legal analog only if any",
            "ASK": "One clarifying question via ask-principal",
        }[verdict],
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--need", required=True, help="Operator need in natural language")
    ap.add_argument("--format", choices=["json", "text"], default="json")
    args = ap.parse_args()
    result = match_need(args.need)
    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        print(f"VERDICT: {result['verdict']}")
        print(result["reason"])
        print(f"NEXT: {result['next']}")
        hs = result.get("handshake") or {}
        print(f"HANDSHAKE plugin: {hs.get('plugin')}")
        print(f"HANDSHAKE writer: {hs.get('writer')}")
        for cmd in hs.get("terminal") or []:
            print(f"  terminal: {cmd}")
        for url in hs.get("browser") or []:
            print(f"  browser: {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
