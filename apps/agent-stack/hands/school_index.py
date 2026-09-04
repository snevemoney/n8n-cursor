#!/usr/bin/env python3
"""Machine index of on-disk school / university / professional COURSE-SKILLs.

164 is the enrolled Saylor catalog claim (saylor-catalog-complete.md).
The index is every Course-tagged skill on disk. No prefix allow-list.
Named topic: rank from this full index. Whole shelf: synthesize the full index.
Never invent slugs. Do not dump SKILL.md bodies.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
GROK_SKILLS = ROOT / "scripts/hive/grok-skills"
CURSOR_SKILLS = ROOT / ".cursor/skills"
TRIGGERS = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
CATALOG_COMPLETE = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-catalog-complete.md"
INDEX_PATH = HERE / "school-index.json"
ENROLLED_CLAIM = 164
ROUTERS = frozenset({"saylor-course-skill", "saylor-mentor-pass"})
COURSE_FIELD_RE = re.compile(
    r"(?im)^\*\*Course:\*\*\s*([A-Z]{2,6})\s*[- ]?(\d{3})\b"
)
COURSE_TITLE_RE = re.compile(
    r"(?im)^#\s+.+\(([A-Z]{2,6})\s*[- ]?(\d{3})\)"
)
NAME_RE = re.compile(r"(?im)^name:\s*([a-z0-9][a-z0-9-]{2,})\s*$")
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9-]{2,}", re.I)
STOP = {
    "the", "and", "for", "you", "your", "our", "this", "that", "with",
    "from", "what", "whats", "how", "why", "when", "who", "about",
    "tell", "please", "just", "check", "checking", "brief", "briefing",
    "load", "use", "run", "skill", "skills", "professional", "university",
    "saylor", "course", "courses", "jarvis", "hey", "sir", "task", "asks",
    "checklists", "checklist",
}
FILE_CAP = 80_000
WHEN_CAP = 280
TOPIC_CAP = 24


def tokens(text: str) -> list[str]:
    out: list[str] = []
    for raw in TOKEN_RE.findall(text or ""):
        word = raw.lower().strip("-")
        if word in STOP or len(word) < 3:
            continue
        if word not in out:
            out.append(word)
    return out


def section(text: str, heading: str, cap: int = WHEN_CAP) -> str:
    pat = re.compile(
        rf"(?ims)^##\s+{re.escape(heading)}\s*\n+(.*?)(?=^##\s+|\Z)"
    )
    hit = pat.search(text or "")
    if not hit:
        return ""
    body = re.sub(r"\s+", " ", hit.group(1)).strip()
    return body[:cap]


def course_from_text(text: str) -> str:
    """Only the declared Course field or title paren. Never the Never-list."""
    hit = COURSE_FIELD_RE.search(text or "")
    if hit:
        return f"{hit.group(1).upper()}{hit.group(2)}"
    hit = COURSE_TITLE_RE.search(text or "")
    if hit:
        return f"{hit.group(1).upper()}{hit.group(2)}"
    return ""


def frontmatter_name(text: str) -> str:
    hit = NAME_RE.search(text or "")
    return (hit.group(1) or "").strip().lower() if hit else ""


def is_school_text(slug: str, text: str) -> bool:
    """Course field or title paren only. Mentions of Saylor in a router table do not count."""
    name = (slug or "").strip().lower()
    if not name or name in ROUTERS:
        return False
    return bool(course_from_text(text))


def is_school_slug(
    slug: str,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> bool:
    name = (slug or "").strip().lower()
    if not name or name in ROUTERS:
        return False
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    path = grok / f"{name}.md"
    if path.is_file():
        try:
            return is_school_text(name, path.read_text(encoding="utf-8")[:FILE_CAP])
        except OSError:
            return False
    pointer = cursor / name / "SKILL.md"
    if pointer.is_file():
        try:
            return is_school_text(name, pointer.read_text(encoding="utf-8")[:FILE_CAP])
        except OSError:
            return False
    return False


def aliases_for(slug: str, course: str, name: str, when: str) -> list[str]:
    out: list[str] = []

    def add(item: str) -> None:
        word = (item or "").strip()
        if word and word.lower() not in {x.lower() for x in out}:
            out.append(word)

    if course:
        add(course)
        split = re.match(r"([A-Z]+)(\d{3})", course)
        if split:
            add(f"{split.group(1)} {split.group(2)}")
    if name and name != slug:
        add(name)
    for part in slug.split("-"):
        if part not in STOP and len(part) >= 3:
            add(part)
    for word in tokens(when)[:8]:
        add(word)
    return out


def topics_for(slug: str, when: str) -> list[str]:
    bits = tokens(slug.replace("-", " ") + " " + (when or ""))
    return bits[:TOPIC_CAP]


def enrolled_catalog_claim(path: Path | None = None) -> int:
    src = path if path is not None else CATALOG_COMPLETE
    if not src.is_file():
        return ENROLLED_CLAIM
    try:
        text = src.read_text(encoding="utf-8")
    except OSError:
        return ENROLLED_CLAIM
    hit = re.search(r"Unique courses\s+\*\*(\d+)\*\*", text)
    if hit:
        return int(hit.group(1))
    hit = re.search(r"\b(\d{3})\b unique COURSE-SKILL", text, re.I)
    if hit:
        return int(hit.group(1))
    return ENROLLED_CLAIM


def trigger_slugs(path: Path | None = None) -> set[str]:
    src = path if path is not None else TRIGGERS
    if not src.is_file():
        return set()
    try:
        text = src.read_text(encoding="utf-8")
    except OSError:
        return set()
    return {m.group(1) for m in re.finditer(r"`([a-z0-9][a-z0-9-]{3,})`", text)}


def skill_path(slug: str, grok_dir: Path, cursor_dir: Path) -> Path | None:
    name = (slug or "").strip().lower()
    if not name:
        return None
    grok = grok_dir / f"{name}.md"
    if grok.is_file():
        return grok
    cursor = cursor_dir / name / "SKILL.md"
    if cursor.is_file():
        return cursor
    return None


def _row_from_file(slug: str, path: Path) -> dict | None:
    try:
        text = path.read_text(encoding="utf-8")[:FILE_CAP]
    except OSError:
        return None
    if not is_school_text(slug, text):
        return None
    course = course_from_text(text)
    when = section(text, "When")
    name = frontmatter_name(text) or slug
    rel = str(path)
    try:
        rel = str(path.resolve().relative_to(ROOT))
    except ValueError:
        rel = str(path)
    return {
        "id": slug,
        "slug": slug,
        "path": rel,
        "abs_path": str(path),
        "course": course,
        "aliases": aliases_for(slug, course, name, when),
        "topics": topics_for(slug, when),
        "when": when,
        "text": text,
    }


def scan(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> list[dict]:
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    rows: list[dict] = []
    seen: set[str] = set()

    def add(slug: str, path: Path) -> None:
        if slug in seen:
            return
        row = _row_from_file(slug, path)
        if not row:
            return
        seen.add(slug)
        rows.append(row)

    if grok.is_dir():
        for path in sorted(grok.glob("*.md")):
            if path.name.upper() == "README.MD":
                continue
            add(path.stem.lower(), path)
    if cursor.is_dir():
        for path in sorted(cursor.glob("*/SKILL.md")):
            add(path.parent.name.lower(), path)
    return rows


def snapshot_row(row: dict) -> dict:
    return {
        "id": row.get("id") or row.get("slug"),
        "path": row.get("path"),
        "course": row.get("course") or "",
        "aliases": list(row.get("aliases") or []),
        "topics": list(row.get("topics") or []),
        "when": row.get("when") or "",
    }


def build_snapshot(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> dict:
    rows = scan(grok_dir, cursor_dir)
    return {
        "schema_version": 1,
        "enrolled_catalog_claim": enrolled_catalog_claim(),
        "enrolled_source": "docs/hive/outer-heaven/CONTENT/topics/saylor-catalog-complete.md",
        "on_disk": len(rows),
        "note": (
            "164 is the enrolled Saylor catalog claim. "
            "on_disk is Course-tagged COURSE-SKILLs in grok-skills / .cursor/skills. "
            "Do not invent slugs for the delta."
        ),
        "skills": [snapshot_row(r) for r in rows],
    }


def write_snapshot(path: Path | None = None) -> dict:
    dest = path if path is not None else INDEX_PATH
    data = build_snapshot()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return data


def load_snapshot(path: Path | None = None) -> dict:
    src = path if path is not None else INDEX_PATH
    if not src.is_file():
        return {}
    try:
        data = json.loads(src.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def main() -> int:
    import argparse

    ap = argparse.ArgumentParser(description="School-skill machine index")
    ap.add_argument("--write", action="store_true", help="Write school-index.json")
    ap.add_argument("--count", action="store_true", help="Print on_disk vs 164 claim")
    args = ap.parse_args()
    data = build_snapshot()
    if args.write:
        write_snapshot()
    if args.count or args.write:
        print(
            json.dumps(
                {
                    "on_disk": data["on_disk"],
                    "enrolled_catalog_claim": data["enrolled_catalog_claim"],
                    "delta": data["enrolled_catalog_claim"] - data["on_disk"],
                    "path": str(INDEX_PATH),
                },
                indent=2,
            )
        )
        return 0
    print(json.dumps({"on_disk": data["on_disk"], "claim": data["enrolled_catalog_claim"]}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
