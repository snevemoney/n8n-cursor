"""vault_graph — the link graph of his Obsidian vault for Jarvis (canvas X40 graph reasoning, Z70 voice graph focus).

Reads markdown only (never writes): [[wiki links]], ![[embeds]], [text](note.md) links and #tags. Answers backlinks,
outgoing links, orphans (no links in or out), dead ends (links in, none out), unresolved links (targets that do not
exist) and top tags. Vault: $JARVIS_VAULT or ~/Vaults/My_Billion_Dollar_Vault.
"""
from __future__ import annotations

import os
import re
from collections import Counter, defaultdict
from pathlib import Path

WIKI = re.compile(r"!?\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|[^\]]*)?\]\]")
MDLINK = re.compile(r"\[[^\]]*\]\(([^)\s]+\.md)\)")
TAG = re.compile(r"(?<![\w/&#])#([A-Za-z][\w/-]{1,40})")
SKIP = {".obsidian", ".trash", ".git", "node_modules"}
MAX_FILES = 20000


def vault() -> Path:
    return Path(os.environ.get("JARVIS_VAULT") or Path.home() / "Vaults/My_Billion_Dollar_Vault").expanduser()


def build(root: Path | None = None) -> dict:
    root = Path(root or vault())
    notes: dict[str, Path] = {}
    for i, p in enumerate(root.rglob("*.md")):
        if i > MAX_FILES:
            break
        if any(part in SKIP for part in p.relative_to(root).parts):
            continue
        notes.setdefault(p.stem.lower(), p)
    out: dict[str, set] = defaultdict(set)
    inn: dict[str, set] = defaultdict(set)
    unresolved: Counter = Counter()
    tags: Counter = Counter()
    for key, p in notes.items():
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        tags.update(t.lower() for t in TAG.findall(text))
        targets = [t.strip() for t in WIKI.findall(text)] + [Path(t).stem for t in MDLINK.findall(text)]
        for t in targets:
            k = Path(t).name.lower().removesuffix(".md")
            if k in notes:
                if k != key:
                    out[key].add(k); inn[k].add(key)
            elif k:
                unresolved[t.strip()] += 1
    return {"root": root, "notes": notes, "out": out, "in": inn, "unresolved": unresolved, "tags": tags}


def _name(g: dict, k: str) -> str:
    return g["notes"][k].stem


def find(g: dict, name: str) -> str | None:
    q = str(name or "").strip().lower().removesuffix(".md")
    if q in g["notes"]:
        return q
    hits = sorted(k for k in g["notes"] if q and q in k)
    return hits[0] if hits else None


def answer(op: str, name: str = "", limit: int = 15, root: Path | None = None) -> dict:
    g = build(root)
    n = len(g["notes"])
    if op in ("backlinks", "links", "focus"):
        k = find(g, name)
        if not k:
            return {"ok": False, "text": f"No note called {name!r} in the vault ({n} notes)."}
        if op == "focus":
            return {"ok": True, "note": _name(g, k), "text": f"Showing {_name(g, k)} on the graph."}
        items = sorted(g["in" if op == "backlinks" else "out"].get(k, set()))
        if not items:
            return {"ok": True, "note": _name(g, k), "items": [], "text": f"Nothing links to {_name(g, k)}." if op == "backlinks" else f"{_name(g, k)} links to nothing."}
        head = f"{len(items)} notes link to {_name(g, k)}: " if op == "backlinks" else f"{_name(g, k)} links to {len(items)} notes: "
        return {"ok": True, "note": _name(g, k), "items": [_name(g, x) for x in items], "text": head + ", ".join(_name(g, x) for x in items[:limit])}
    if op == "orphans":
        items = sorted(k for k in g["notes"] if not g["in"].get(k) and not g["out"].get(k))
        return {"ok": True, "count": len(items), "text": f"{len(items)} of {n} notes have no links in or out; first: " + ", ".join(_name(g, x) for x in items[:limit])}
    if op == "dead_ends":
        items = sorted(k for k in g["notes"] if g["in"].get(k) and not g["out"].get(k))
        return {"ok": True, "count": len(items), "text": f"{len(items)} notes are linked to but link nowhere; first: " + ", ".join(_name(g, x) for x in items[:limit])}
    if op == "unresolved":
        top = g["unresolved"].most_common(limit)
        return {"ok": True, "count": sum(g["unresolved"].values()), "text": f"{len(g['unresolved'])} missing link targets; most linked: " + ", ".join(f"{t} ({c})" for t, c in top)}
    if op == "tags":
        top = g["tags"].most_common(limit)
        return {"ok": True, "text": f"{len(g['tags'])} tags; most used: " + ", ".join(f"#{t} ({c})" for t, c in top)}
    return {"ok": False, "text": "vault_graph op is one of: focus, backlinks, links, orphans, dead_ends, unresolved, tags"}
