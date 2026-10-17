"""Karpathy LLM-wiki "integrate" step (Evens 10-16/17: give Jarvis Karpathy capabilities). After a packet is written,
every method lands on its family page and every tool/repo it names gets an entity page listing where it was seen, so
the knowledge compounds instead of sitting in one packet. Deterministic, no model call; pages are append-only and
deduplicated, so re-running is safe. Lives next to the packets: watch-later/wiki/{families,tools}/*.md + index.md."""
from __future__ import annotations

import json
import re
from pathlib import Path


def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")[:60] or "misc"


def _append_once(page: Path, title: str, line: str) -> bool:
    page.parent.mkdir(parents=True, exist_ok=True)
    text = page.read_text() if page.exists() else f"# {title}\n\n"
    if line in text:
        return False
    page.write_text(text.rstrip("\n") + "\n" + line + "\n")
    return True


def integrate(packet: Path, wiki: Path, title: str = "") -> dict:
    """Fold one packet into the wiki. Returns how many pages and lines changed."""
    pid = packet.name
    methods = []
    f = packet / "methods.jsonl"
    if f.is_file():
        for row in f.read_text().splitlines():
            try:
                methods.append(json.loads(row))
            except ValueError:
                continue
    touched, lines = set(), 0
    for m in methods:
        name = str(m.get("name") or "").strip()
        if not name:
            continue
        fam = str(m.get("family") or "unsorted")
        ref = f"- **{name}** — {str(m.get('summary') or '')[:200]} ([{pid}](../../packets/{pid}/LEARNED.md){', ' + str(m.get('at')) if m.get('at') else ''})"
        page = wiki / "families" / f"{_slug(fam)}.md"
        if _append_once(page, f"Family: {fam}", ref):
            touched.add(page); lines += 1
        for tool in m.get("tools_repos") or m.get("tools") or []:
            t = str(tool).strip()
            if not t or len(t) > 80:
                continue
            tpage = wiki / "tools" / f"{_slug(t)}.md"
            if _append_once(tpage, f"Tool / repo: {t}", f"- used in **{name}** ([{pid}](../../packets/{pid}/LEARNED.md))"):
                touched.add(tpage); lines += 1
    _index(wiki)
    return {"packet": pid, "pages": len(touched), "lines": lines}


def _index(wiki: Path) -> None:
    out = ["# Signals wiki (auto-maintained; Karpathy LLM-wiki pattern)", "",
           "Families are concept pages; tools are entity pages. Every line links back to the packet it came from.", ""]
    for sect in ("families", "tools"):
        pages = sorted((wiki / sect).glob("*.md")) if (wiki / sect).is_dir() else []
        out += [f"## {sect.title()} ({len(pages)})", ""]
        for p in pages:
            n = sum(1 for l in p.read_text().splitlines() if l.startswith("- "))
            out.append(f"- [{p.stem}]({sect}/{p.name}) — {n} entries")
        out.append("")
    wiki.mkdir(parents=True, exist_ok=True)
    (wiki / "index.md").write_text("\n".join(out))


def integrate_all(packets: Path, wiki: Path) -> dict:
    total = {"packets": 0, "pages": 0, "lines": 0}
    for p in sorted(x for x in packets.iterdir() if x.is_dir()):
        r = integrate(p, wiki)
        total["packets"] += 1; total["lines"] += r["lines"]
    total["pages"] = sum(1 for _ in wiki.rglob("*.md"))
    return total


if __name__ == "__main__":
    import sys
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "jarvis-cowork/jarvis-signals/docs/hive/outer-heaven/CONTENT/watch-later"
    print(json.dumps(integrate_all(root / "packets", root / "wiki")))
