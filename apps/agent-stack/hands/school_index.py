#!/usr/bin/env python3
"""Machine index of the Saylor / university school shelf.

164 is the enrolled catalog claim in saylor-catalog-complete.md.
The harvest table (saylor-skill-triggers.md) is the named on-disk extract.
Index every named course row: path if a skill file exists, else missing: true.
Do not invent slugs. Do not scrape Never-lists. Do not dump SKILL.md bodies.
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
REMAINING = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-remaining.md"
LIVE_BEATS = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-live-beats.md"
PARALLEL = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-parallel-harvest.md"
INDEX_PATH = HERE / "school-index.json"
ENROLLED_CLAIM = 164
ROUTERS = frozenset({"saylor-course-skill", "saylor-mentor-pass"})
COURSE_FIELD_RE = re.compile(
    r"(?im)^\*\*Course:\*\*\s*([A-Z]{2,6})\s*[- ]?(\d{3})\b"
)
COURSE_TITLE_RE = re.compile(
    r"(?im)^#\s+.+\(([A-Z]{2,6})\s*[- ]?(\d{3})\)"
)
COURSE_CELL_RE = re.compile(r"^([A-Z]{2,6})\s*[- ]?(\d{3})$")
NAME_RE = re.compile(r"(?im)^name:\s*([a-z0-9][a-z0-9-]{2,})\s*$")
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9-]{2,}", re.I)
SLUG_RE = re.compile(r"`([a-z0-9][a-z0-9-]{3,})`")
HARVEST_COUNT_RE = re.compile(r"Count:\s+\*\*(\d+)\*\*")
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
# Named extras in catalog-complete that are not harvest-table rows.
CATALOG_EXTRAS = ("COMM311", "ESLHub")


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


def normalize_course(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        return ""
    if re.sub(r"[\s-]+", "", text).upper() == "ESLHUB":
        return "ESLHub"
    compact = re.sub(r"[\s-]+", "", text.upper())
    hit = COURSE_CELL_RE.match(compact)
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
        elif course == "ESLHub":
            add("ESL Hub")
            add("ESL")
    if name and name != slug:
        add(name)
    for part in (slug or "").split("-"):
        if part not in STOP and len(part) >= 3:
            add(part)
    for word in tokens(when)[:8]:
        add(word)
    return out


def topics_for(slug: str, when: str) -> list[str]:
    bits = tokens((slug or "").replace("-", " ") + " " + (when or ""))
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


def harvest_table_count(path: Path | None = None) -> int:
    src = path if path is not None else TRIGGERS
    if not src.is_file():
        return 0
    try:
        text = src.read_text(encoding="utf-8")
    except OSError:
        return 0
    hit = HARVEST_COUNT_RE.search(text)
    return int(hit.group(1)) if hit else 0


def _read(path: Path) -> str:
    if not path.is_file():
        return ""
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def _table_rows(text: str) -> list[list[str]]:
    rows: list[list[str]] = []
    for line in (text or "").splitlines():
        if not line.startswith("| "):
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if not parts or parts[0].startswith("---") or parts[0].lower() in {
            "course", "desk", "you say (plain)", "you just did / said",
        }:
            continue
        rows.append(parts)
    return rows


def parse_trigger_table(path: Path | None = None) -> list[dict]:
    """Harvest table only. First column = course, second = slug. Never-list is ignored."""
    src = path if path is not None else TRIGGERS
    out: list[dict] = []
    for parts in _table_rows(_read(src)):
        if len(parts) < 2:
            continue
        course = normalize_course(parts[0])
        slugs = SLUG_RE.findall(parts[1])
        slug = (slugs[0] if slugs else "").strip().lower()
        when = parts[2] if len(parts) > 2 else ""
        if not course:
            continue
        out.append(
            {
                "course": course,
                "slug": slug,
                "when": re.sub(r"\s+", " ", when).strip()[:WHEN_CAP],
                "source": "saylor-skill-triggers.md",
            }
        )
    return out


def parse_remaining_table(path: Path | None = None) -> list[dict]:
    src = path if path is not None else REMAINING
    out: list[dict] = []
    for parts in _table_rows(_read(src)):
        course = normalize_course(parts[0] if parts else "")
        if not course:
            continue
        note = parts[3] if len(parts) > 3 else (parts[2] if len(parts) > 2 else "remaining")
        out.append(
            {
                "course": course,
                "slug": "",
                "when": "",
                "source": "saylor-remaining.md",
                "note": note,
            }
        )
    return out


def parse_live_beat_courses(path: Path | None = None) -> list[dict]:
    src = path if path is not None else LIVE_BEATS
    out: list[dict] = []
    for line in _read(src).splitlines():
        hit = re.match(r"^##\s+([A-Z]{2,6}\d{3}|ESLHub)\s*$", line)
        if not hit:
            continue
        course = normalize_course(hit.group(1)) or hit.group(1)
        out.append(
            {
                "course": course,
                "slug": "",
                "when": "",
                "source": "saylor-live-beats.md",
            }
        )
    return out


def parse_parallel_harvest(path: Path | None = None) -> list[dict]:
    src = path if path is not None else PARALLEL
    out: list[dict] = []
    for parts in _table_rows(_read(src)):
        if len(parts) < 2:
            continue
        course = normalize_course(parts[1])
        if not course:
            continue
        out.append(
            {
                "course": course,
                "slug": "",
                "when": "",
                "source": "saylor-parallel-harvest.md",
            }
        )
    return out


def parse_catalog_extras(path: Path | None = None) -> list[dict]:
    src = path if path is not None else CATALOG_COMPLETE
    text = _read(src)
    out: list[dict] = []
    for name in CATALOG_EXTRAS:
        if name == "ESLHub" and "ESLHub" in text:
            out.append(
                {
                    "course": "ESLHub",
                    "slug": "",
                    "when": "",
                    "source": "saylor-catalog-complete.md",
                }
            )
        elif name != "ESLHub" and name in text:
            out.append(
                {
                    "course": name,
                    "slug": "",
                    "when": "",
                    "source": "saylor-catalog-complete.md",
                }
            )
    return out


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
        "missing": False,
        "source": "disk",
    }


def _missing_row(course: str, *, slug: str = "", source: str = "", note: str = "") -> dict:
    ident = (slug or course or "").strip()
    return {
        "id": ident,
        "slug": slug,
        "path": None,
        "abs_path": None,
        "course": course,
        "aliases": aliases_for(slug, course, "", note),
        "topics": topics_for(slug, note),
        "when": "",
        "text": "",
        "missing": True,
        "source": source or "catalog",
        "note": note or "enrolled/remaining, not a minted SKILL.md",
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


def catalog_rows(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    *,
    triggers: Path | None = None,
    remaining: Path | None = None,
    beats: Path | None = None,
    parallel: Path | None = None,
    complete: Path | None = None,
) -> list[dict]:
    """Every named catalog row. Files first. Named remaining marked missing. No invented slugs."""
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    live = scan(grok, cursor)
    by_slug = {str(r.get("slug") or ""): r for r in live if r.get("slug")}
    by_course: dict[str, list[dict]] = {}
    for row in live:
        course = str(row.get("course") or "")
        if course:
            by_course.setdefault(course, []).append(row)

    extra: list[dict] = []

    def ensure_named(item: dict) -> None:
        course = str(item.get("course") or "")
        slug = str(item.get("slug") or "").strip().lower()
        if slug:
            if slug in by_slug:
                return
            path = skill_path(slug, grok, cursor)
            if path is not None:
                row = _row_from_file(slug, path)
                if row:
                    by_slug[slug] = row
                    live.append(row)
                    if row.get("course"):
                        by_course.setdefault(str(row["course"]), []).append(row)
                    return
            extra.append(
                _missing_row(
                    course,
                    slug=slug,
                    source=str(item.get("source") or ""),
                    note=str(item.get("note") or item.get("when") or ""),
                )
            )
            return
        if course and course in by_course:
            return
        if any(str(r.get("course") or "") == course for r in extra):
            return
        extra.append(
            _missing_row(
                course,
                source=str(item.get("source") or ""),
                note=str(item.get("note") or ""),
            )
        )

    for item in parse_trigger_table(triggers):
        ensure_named(item)
    for item in parse_remaining_table(remaining):
        ensure_named(item)
    for item in parse_live_beat_courses(beats):
        ensure_named(item)
    for item in parse_parallel_harvest(parallel):
        ensure_named(item)
    for item in parse_catalog_extras(complete):
        ensure_named(item)

    rows = list(live) + extra
    rows.sort(
        key=lambda r: (
            1 if r.get("missing") else 0,
            str(r.get("course") or ""),
            str(r.get("slug") or r.get("id") or ""),
        )
    )
    return rows


def snapshot_row(row: dict) -> dict:
    return {
        "id": row.get("id") or row.get("slug") or row.get("course"),
        "slug": row.get("slug") or "",
        "path": row.get("path"),
        "course": row.get("course") or "",
        "aliases": list(row.get("aliases") or []),
        "topics": list(row.get("topics") or []),
        "when": row.get("when") or "",
        "missing": bool(row.get("missing")),
        "source": row.get("source") or "",
    }


def build_snapshot(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> dict:
    rows = catalog_rows(grok_dir, cursor_dir)
    on_disk = [r for r in rows if not r.get("missing")]
    missing = [r for r in rows if r.get("missing")]
    courses = {str(r.get("course") or "") for r in rows if r.get("course")}
    claim = enrolled_catalog_claim()
    harvest = harvest_table_count()
    return {
        "schema_version": 2,
        "enrolled_catalog_claim": claim,
        "enrolled_source": "docs/hive/outer-heaven/CONTENT/topics/saylor-catalog-complete.md",
        "harvest_table_count": harvest,
        "harvest_source": "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md",
        "harvest_file_quote": f"Count: **{harvest}**." if harvest else "",
        "on_disk": len(on_disk),
        "named": len(rows),
        "missing": len(missing),
        "named_courses": len(courses),
        "unnamed_enrolled_delta": max(0, claim - len(courses)),
        "note": (
            "164 is the enrolled Saylor catalog claim in saylor-catalog-complete.md. "
            "saylor-skill-triggers.md harvest table is not 164 rows — quote that Count. "
            "saylor-desk-matrix.md is referenced but missing on disk. "
            "Named remaining rows are missing: true. Do not invent slugs for the unnamed delta."
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


def pack_lines(rows: list[dict] | None = None, *, claim: int | None = None) -> str:
    """Titles + codes for the pipeline pack. Not SKILL.md bodies."""
    items = rows if rows is not None else catalog_rows()
    n_claim = enrolled_catalog_claim() if claim is None else claim
    live = [r for r in items if not r.get("missing")]
    miss = [r for r in items if r.get("missing")]
    courses = {str(r.get("course") or "") for r in items if r.get("course")}
    unnamed = max(0, n_claim - len(courses))
    lines = [
        "School shelf (catalog is the school, not one course code):",
        (
            f"Claimed {n_claim} unique courses "
            f"({CATALOG_COMPLETE.relative_to(ROOT) if CATALOG_COMPLETE.is_file() else 'saylor-catalog-complete.md'}). "
            f"Harvest table Count: **{harvest_table_count()}** "
            f"({TRIGGERS.name}). "
            f"On disk {len(live)}. Named missing {len(miss)}. "
            f"Unnamed enrolled delta {unnamed}."
        ),
        "On disk (code slug):",
    ]
    for row in live:
        course = str(row.get("course") or "")
        slug = str(row.get("slug") or row.get("id") or "")
        lines.append(f"- {course} {slug}".strip())
    if miss:
        lines.append("Named missing (UNKNOWN for When/Steps; do not invent):")
        for row in miss:
            course = str(row.get("course") or "")
            src = str(row.get("source") or "catalog")
            lines.append(f"- {course} missing ({src})")
    lines.append("Retrieve When/Steps only when a file exists. Whole-shelf speech = grouped one-liners.")
    return "\n".join(lines)


def main() -> int:
    import argparse

    ap = argparse.ArgumentParser(description="School-skill machine index")
    ap.add_argument("--write", action="store_true", help="Write school-index.json")
    ap.add_argument("--count", action="store_true", help="Print on_disk vs 164 claim")
    ap.add_argument("--pack", action="store_true", help="Print pack titles+codes")
    args = ap.parse_args()
    data = build_snapshot()
    if args.write:
        write_snapshot()
    if args.pack:
        print(pack_lines())
        return 0
    if args.count or args.write:
        print(
            json.dumps(
                {
                    "on_disk": data["on_disk"],
                    "named": data["named"],
                    "missing": data["missing"],
                    "named_courses": data["named_courses"],
                    "enrolled_catalog_claim": data["enrolled_catalog_claim"],
                    "harvest_table_count": data["harvest_table_count"],
                    "unnamed_enrolled_delta": data["unnamed_enrolled_delta"],
                    "path": str(INDEX_PATH),
                },
                indent=2,
            )
        )
        return 0
    print(
        json.dumps(
            {
                "on_disk": data["on_disk"],
                "claim": data["enrolled_catalog_claim"],
                "harvest": data["harvest_table_count"],
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
