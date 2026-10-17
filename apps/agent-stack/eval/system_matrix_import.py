#!/usr/bin/env python3
"""Import the owner's Jarvis System Matrix canvas (the finished-state HTML) into eval/system_matrix.json.

The canvas is the target: every node green, every link connected. This keeps its exact order — lanes left to right
as the canvas draws them (COLS), then the two bands (platforms, verification); nodes and links in the order the page
declares them — so eval/route_matrix.py --by-node can report coverage the same way the canvas reads.
Only ids, lane, labels and link labels are kept; the page's evidence prose stays in the owner's file.

  python3 eval/system_matrix_import.py ~/Downloads/Jarvis_System_Matrix_Finished_Green.html
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

OUT = Path(__file__).with_name("system_matrix.json")
NODE_ARRAYS = ("N", "CAPABILITY_NODES", "SIGNAL_NODES")
EDGE_ARRAYS = ("E", "CAPABILITY_EDGES", "SIGNAL_EDGES")


def _array(src: str, name: str):
    m = re.search(r"\bconst\s+" + re.escape(name) + r"\s*=\s*\[", src)
    if not m:
        return None
    start = m.end() - 1
    depth, quote, esc = 0, None, False
    for i in range(start, len(src)):
        c = src[i]
        if quote:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == quote:
                quote = None
            continue
        if c in "\"'`":
            quote = c
        elif c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                body = re.sub(r",\s*([\]}])", r"\1", src[start:i + 1])  # JS trailing commas
                return json.loads(body)
    return None


def _groups(src: str) -> dict:
    m = re.search(r"const\s+GROUPS\s*=\s*\{(.*?)\n\};", src, re.S)
    out = {}
    for gid, title in re.findall(r"(\w+)\s*:\s*\{\s*t\s*:\s*\"([^\"]+)\"", m.group(1) if m else ""):
        out[gid] = title
    return out


def parse(src: str) -> dict:
    cols = _array(src, "COLS") or []
    groups = _groups(src)
    order = [g for col in cols for g in col] + [g for g in groups if g not in {x for col in cols for x in col}]
    nodes = [n for name in NODE_ARRAYS for n in (_array(src, name) or [])]
    links = [e for name in EDGE_ARRAYS for e in (_array(src, name) or [])]
    lanes = []
    for gid in order:
        lanes.append({"id": gid, "title": groups.get(gid, gid),
                      "nodes": [{"id": n[0], "label": n[2]} for n in nodes if n[1] == gid]})
    return {"source": "Jarvis System Matrix — Finished State (owner canvas)",
            "counts": {"lanes": len(lanes), "nodes": len(nodes), "links": len(links)},
            "lanes": lanes,
            "links": [{"from": e[0], "to": e[1], "label": e[3] if len(e) > 3 else ""} for e in links]}


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__.strip().splitlines()[-1]); return 2
    data = parse(Path(argv[1]).expanduser().read_text(encoding="utf-8"))
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    c = data["counts"]
    print(f"system matrix: {c['lanes']} lanes · {c['nodes']} nodes · {c['links']} links → {OUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
