#!/usr/bin/env python3
"""CEO vault force-graph from the existing on-disk index. Not a second wiki."""
from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
INDEX = HIVE / "graph-index.json"

# Same rooms as GRAPH.md. Also match vaults that omit the 00_Outer_Heaven/ prefix.
CEO_RE = re.compile(
    r"^(?:00_Outer_Heaven/)?"
    r"(?:"
    r"(?:PROJECTS|THEMES|METHODS|INBOX|PATTERNS)/|"
    r"CONTENT/(?:knowledge/project-habits/|job-cards/|business-kits/|"
    r"ai-partner-scoring-prototype-ladder/|"
    r"(?:Knowledge Library|VAULT_MAP)\.md$|"
    r"os/(?:(?:Operations Hub|OS-GRAPH)\.md$|"
    r"sessions/(?:Conversation Timeline|Archive Coverage|Recent Conversations)\.md$))|"
    r"CHRONICLE/(?:Project Timeline|2026-09)\.md$|"
    r"(?:AGENT_CHEAT_SHEET|Outer Heaven)\.md$"
    r")"
)
TAKES_RE = re.compile(r"CONTENT/job-cards/takes")


def ceo_path(path: str) -> bool:
    rel = (path or "").replace("\\", "/").lstrip("/")
    if TAKES_RE.search(rel):
        return False
    if CEO_RE.search(rel):
        return True
    return bool(CEO_RE.search("00_Outer_Heaven/" + rel))


def node_color(path: str) -> str:
    rel = (path or "").replace("\\", "/")
    if "/PROJECTS/" in f"/{rel}" or rel.startswith("PROJECTS/"):
        return "#7ee0d0"
    if "/job-cards/" in rel:
        return "#e0c07e"
    if "/THEMES/" in f"/{rel}" or rel.startswith("THEMES/"):
        return "#7ea8e0"
    if "/METHODS/" in f"/{rel}" or rel.startswith("METHODS/") or "/business-kits/" in rel:
        return "#8ee07e"
    if "/INBOX/" in f"/{rel}" or rel.startswith("INBOX/"):
        return "#c07ee0"
    return "#3dff6a"


def _load_index(path: Path | None = None) -> dict:
    dest = path if path is not None else INDEX
    if not dest.is_file():
        return {}
    try:
        data = json.loads(dest.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def _basename(value: str) -> str:
    text = (value or "").replace("\\", "/").split("|", 1)[0].strip()
    text = text.rsplit("/", 1)[-1]
    if text.endswith(".md"):
        text = text[:-3]
    return text


def _resolve_target(target: str, by_name: dict[str, str], by_path: dict[str, str]) -> str | None:
    raw = (target or "").replace("\\", "/").split("|", 1)[0].strip()
    if not raw:
        return None
    if raw in by_name:
        return by_name[raw]
    if raw in by_path:
        return by_path[raw]
    name = _basename(raw)
    if name in by_name:
        return by_name[name]
    for suffix in (raw, raw + ".md", "00_Outer_Heaven/" + raw, "00_Outer_Heaven/" + raw + ".md"):
        if suffix in by_path:
            return by_path[suffix]
    return None


def force_graph(*, index_path: Path | None = None, cap: int = 240) -> dict:
    """Nodes/links for 3d-force-graph. CEO rooms only. Unresolved links stay off."""
    idx = _load_index(index_path)
    raw_nodes = idx.get("nodes") if isinstance(idx.get("nodes"), dict) else {}
    chosen: list[tuple[str, str, str]] = []
    by_name: dict[str, str] = {}
    by_path: dict[str, str] = {}
    for name, meta in raw_nodes.items():
        row = meta if isinstance(meta, dict) else {}
        path = str(row.get("path") or "")
        if not ceo_path(path):
            continue
        node_id = path or str(name)
        chosen.append((node_id, str(name), path))
        by_name[str(name)] = node_id
        by_name[_basename(path)] = node_id
        by_path[path] = node_id
        by_path[path.replace("00_Outer_Heaven/", "", 1)] = node_id
        if path.endswith(".md"):
            by_path[path[:-3]] = node_id
    chosen = chosen[: max(1, int(cap))]
    allowed = {node_id for node_id, _name, _path in chosen}
    nodes = [
        {
            "id": node_id,
            "name": name,
            "path": path,
            "color": node_color(path),
        }
        for node_id, name, path in chosen
        if node_id in allowed
    ]
    links: list[dict] = []
    seen: set[tuple[str, str]] = set()
    edges = idx.get("edges") if isinstance(idx.get("edges"), list) else []
    for edge in edges:
        if not isinstance(edge, dict):
            continue
        src = by_name.get(str(edge.get("from") or ""))
        if src is None:
            src = _resolve_target(str(edge.get("sourcePath") or ""), by_name, by_path)
        dest = _resolve_target(str(edge.get("to") or ""), by_name, by_path)
        if not src or not dest or src == dest:
            continue
        if src not in allowed or dest not in allowed:
            continue
        pair = (src, dest)
        if pair in seen:
            continue
        seen.add(pair)
        links.append({"source": src, "target": dest})
    return {
        "ok": True,
        "kind": "vault-ceo-graph",
        "nodes": nodes,
        "links": links,
        "nodeCount": len(nodes),
        "linkCount": len(links),
        "source": str((index_path or INDEX)),
    }
