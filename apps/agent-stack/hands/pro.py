#!/usr/bin/env python3
"""Professional / Saylor skills as on-disk intelligence.

The brain indexes every school file. The mouth speaks one answer.
Named topic or course: rank from the full index, then cap 1–3.
Whole-shelf ask: synthesize from the complete index. Not three files.
Never invent a course number or a skill that is not on disk.
"""
from __future__ import annotations

import importlib.util
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
GROK_SKILLS = ROOT / "scripts/hive/grok-skills"
CURSOR_SKILLS = ROOT / ".cursor/skills"

_IDX_PATH = HERE / "school_index.py"
_spec = importlib.util.spec_from_file_location("agent_stack_school_index", _IDX_PATH)
if _spec is None or _spec.loader is None:
    raise RuntimeError(f"cannot load {_IDX_PATH}")
school_index = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(school_index)

COURSE_ASK_RE = re.compile(
    r"\b(BUS|ECON|COMM|PRDV|CS|ENGL|ARTH|PHIL|MA)\s*[- ]?(\d{3})\b",
    re.I,
)
TOKEN_RE = school_index.TOKEN_RE
STOP = school_index.STOP
TOPIC_HINTS = {
    "marketing": ("mktg", "strat-mktg", "grad-mktg"),
    "finance": ("corpfin", "grad-finmgmt"),
    "accounting": ("finacct", "mgracct"),
    "ethics": ("bizethics", "grad-ethics"),
    "law": ("bizlaw",),
    "legal": ("bizlaw",),
    "hr": ("hrm-", "grad-people"),
    "staffing": ("hrm-",),
    "sales": ("grad-sales",),
    "operations": ("ops-manager", "grad-oscm"),
    "ops": ("ops-manager", "grad-oscm"),
    "strategy": ("firm-strategy", "grad-ethics-strategy", "strat-lead"),
    "statistics": ("bizstat",),
    "stats": ("bizstat",),
    "inference": ("bizstat",),
    "regression": ("bizstat",),
    "negotiation": ("negotiations",),
    "entrepreneur": ("entrepreneurial",),
    "venture": ("entrepreneurial",),
    "bitcoin": ("bitcoin-literacy", "what-is-money", "hard-money"),
    "austrian": ("austrian",),
    "management": ("mgmt-polc",),
    "communication": ("bizcomm", "undergrad-human"),
    "comms": ("bizcomm",),
    "project": ("intro-pm", "grad-spm"),
    "pm": ("intro-pm", "grad-spm"),
    "intelligence": ("bi-sources", "grad-adv-bi", "grad-ddd"),
    "warehouse": ("bi-sources", "grad-data-mgmt", "grad-adv-bi"),
    "mis": ("mis-intro",),
    "business": ("intro-biz",),
}
SHELF_RE = re.compile(
    r"\b("
    r"(?:the\s+)?(?:whole|entire)\s+shelf|"
    r"all\s+(?:the\s+)?(?:professional|university|school|saylor)\s+skills?|"
    r"every\s+(?:professional|university|school|saylor)\s+skill"
    r")\b",
    re.I,
)
FAMILY_LABEL = {
    "BUS": "Business",
    "ECON": "Economics",
    "COMM": "Communication",
    "PRDV": "Professional development",
}
MAX_SKILLS = 3
BRIEF_CAP = 280
FILE_CAP = 80_000


def is_professional_slug(
    slug: str,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> bool:
    return school_index.is_school_slug(slug, grok_dir=grok_dir, cursor_dir=cursor_dir)


def tokens(text: str) -> list[str]:
    return school_index.tokens(text)


def asked_courses(utterance: str) -> list[str]:
    found: list[str] = []
    for prefix, num in COURSE_ASK_RE.findall(utterance or ""):
        code = f"{prefix.upper()}{num}"
        if code not in found:
            found.append(code)
    return found


def course_from_text(text: str) -> str:
    return school_index.course_from_text(text)


def section(text: str, heading: str) -> str:
    return school_index.section(text, heading, BRIEF_CAP)


def skill_path(slug: str, grok_dir: Path, cursor_dir: Path) -> Path | None:
    return school_index.skill_path(slug, grok_dir, cursor_dir)


def index_skills(
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
) -> list[dict]:
    return school_index.scan(grok_dir, cursor_dir)


def is_shelf_ask(utterance: str) -> bool:
    return bool(SHELF_RE.search(utterance or ""))


def _hint_score(slug: str, words: list[str]) -> int:
    score = 0
    for word in words:
        for prefix in TOPIC_HINTS.get(word, ()):
            if slug.startswith(prefix) or prefix.rstrip("-") in slug:
                score += 20
    return score


def _exists(row: dict, grok: Path, cursor: Path) -> bool:
    slug = str(row.get("slug") or row.get("id") or "")
    raw_path = str(row.get("abs_path") or row.get("path") or "")
    path = Path(raw_path) if raw_path else None
    if path is not None and path.is_file():
        return is_professional_slug(slug, grok, cursor)
    return skill_path(slug, grok, cursor) is not None and is_professional_slug(
        slug, grok, cursor
    )


def match_skills(
    utterance: str,
    catalog: list[dict] | None = None,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    limit: int | None = None,
) -> list[dict]:
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    rows = catalog if catalog is not None else index_skills(grok, cursor)
    live = [row for row in rows if _exists(row, grok, cursor)]
    if is_shelf_ask(utterance):
        return live

    cap = MAX_SKILLS if limit is None else max(1, min(limit, MAX_SKILLS))
    codes = asked_courses(utterance)
    if codes:
        exact = [row for row in live if str(row.get("course") or "") in codes]
        if not exact:
            return []
        live = exact
    words = tokens(utterance)
    scored: list[tuple[int, dict]] = []
    for row in live:
        slug = str(row.get("slug") or "")
        score = 0
        course = str(row.get("course") or "")
        if codes and course and course in codes:
            score += 100
        slug_bits = set(tokens(slug.replace("-", " ")))
        score += 10 * len(slug_bits.intersection(words))
        when_bits = set(tokens(str(row.get("when") or "")))
        score += 3 * len(when_bits.intersection(words))
        alias_bits = set()
        for alias in row.get("aliases") or []:
            alias_bits.update(tokens(str(alias).replace("-", " ")))
        score += 4 * len(alias_bits.intersection(words))
        topic_bits = set(str(t).lower() for t in (row.get("topics") or []))
        score += 4 * len(topic_bits.intersection(words))
        score += _hint_score(slug, words)
        if score:
            scored.append((score, row))
    scored.sort(key=lambda item: (-item[0], item[1].get("slug") or ""))
    picked: list[dict] = []
    seen: set[str] = set()
    for _score, row in scored:
        slug = str(row.get("slug") or "")
        if slug in seen:
            continue
        seen.add(slug)
        picked.append(row)
        if len(picked) >= cap:
            break
    if codes:
        exact = [row for row in picked if str(row.get("course") or "") in codes]
        if exact:
            return exact[:cap]
    return picked


def brief_from_row(row: dict) -> str:
    slug = str(row.get("slug") or "")
    course = str(row.get("course") or "")
    when = str(row.get("when") or "").strip()
    steps = section(str(row.get("text") or ""), "Steps")
    label = f"{slug} ({course})" if course else slug
    useful = when or steps
    if not useful:
        useful = "On disk. No When/Steps section to speak."
    return f"{label}: {useful[:BRIEF_CAP]}"


def _family(course: str) -> str:
    hit = re.match(r"([A-Z]+)", course or "")
    return hit.group(1) if hit else "OTHER"


def _group_topics(rows: list[dict]) -> list[str]:
    labels: list[str] = []
    for row in rows:
        slug = str(row.get("slug") or "")
        hit = ""
        for topic, prefixes in TOPIC_HINTS.items():
            if any(slug.startswith(prefix) or prefix.rstrip("-") in slug for prefix in prefixes):
                hit = topic
                break
        if not hit:
            when = str(row.get("when") or "").strip()
            hit = when.split(",")[0][:72] if when else slug
        if hit and hit not in labels:
            labels.append(hit)
    return labels


def shelf_spoken(rows: list[dict], claim: int) -> str:
    n = len(rows)
    lead = f"{n} school skills on disk."
    if n != claim:
        lead += f" Catalog claimed {claim}; delta {claim - n}."
    groups: dict[str, list[dict]] = {}
    for row in rows:
        groups.setdefault(_family(str(row.get("course") or "")), []).append(row)
    parts: list[str] = []
    for key in sorted(groups):
        label = FAMILY_LABEL.get(key, key.title())
        topics = _group_topics(groups[key])
        sample = ", ".join(topics[:8]) if topics else "on disk"
        parts.append(f"{label} ({len(groups[key])}): {sample}.")
    return f"{lead} " + " ".join(parts)


def _cites(rows: list[dict]) -> list[dict]:
    out: list[dict] = []
    for row in rows:
        out.append(
            {
                "slug": row.get("slug") or row.get("id"),
                "course": row.get("course") or None,
                "path": row.get("path"),
                "aliases": list(row.get("aliases") or []),
                "topics": list(row.get("topics") or []),
                "when": row.get("when") or "",
            }
        )
    return out


def brief(
    utterance: str,
    *,
    grok_dir: Path | None = None,
    cursor_dir: Path | None = None,
    catalog: list[dict] | None = None,
) -> dict:
    """Filter slugs from the full school index, then speak. UNKNOWN if invented."""
    grok = grok_dir if grok_dir is not None else GROK_SKILLS
    cursor = cursor_dir if cursor_dir is not None else CURSOR_SKILLS
    rows = catalog if catalog is not None else index_skills(grok, cursor)
    live = [row for row in rows if _exists(row, grok, cursor)]
    claim = school_index.enrolled_catalog_claim()
    if is_shelf_ask(utterance):
        slugs = [str(r.get("slug") or "") for r in live if r.get("slug")]
        return {
            "ok": bool(slugs),
            "unknown": not slugs,
            "shelf": True,
            "wire": "pro",
            "slugs": slugs,
            "courses": [str(r.get("course") or "") for r in live if r.get("course")],
            "cites": _cites(live),
            "on_disk": len(live),
            "enrolled_catalog_claim": claim,
            "spoken": (
                shelf_spoken(live, claim)
                if slugs
                else "UNKNOWN. No school skills on disk."
            ),
        }

    codes = asked_courses(utterance)
    missing = [
        code for code in codes if not any(str(r.get("course") or "") == code for r in live)
    ]
    matched = match_skills(
        utterance, live, grok_dir=grok, cursor_dir=cursor
    )
    slugs = [str(r.get("slug") or "") for r in matched if r.get("slug")]
    invented = [s for s in slugs if not any(str(r.get("slug") or "") == s for r in live)]
    if invented:
        slugs = [s for s in slugs if s not in invented]
        matched = [r for r in matched if str(r.get("slug") or "") not in invented]
    cites = _cites(matched)
    if missing and not matched:
        return {
            "ok": False,
            "unknown": True,
            "shelf": False,
            "wire": "pro",
            "slugs": [],
            "courses": missing,
            "cites": [],
            "spoken": (
                f"UNKNOWN. {missing[0]} is not on disk. "
                "I will not invent a course. Name a real professional skill."
            ),
        }
    if missing and matched:
        closest = "; ".join(brief_from_row(r) for r in matched)
        return {
            "ok": True,
            "unknown": True,
            "shelf": False,
            "wire": "pro",
            "slugs": slugs,
            "courses": [str(r.get("course") or "") for r in matched if r.get("course")],
            "cites": cites,
            "spoken": (
                f"UNKNOWN. {missing[0]} is not on disk. Closest on-disk: {closest}"
            ),
        }
    if not matched:
        return {
            "ok": False,
            "unknown": True,
            "shelf": False,
            "wire": "pro",
            "slugs": [],
            "courses": [],
            "cites": [],
            "spoken": (
                "UNKNOWN. No matching professional skill on disk. "
                "Name the school — marketing, finance, ops, ethics — and I will pull those files."
            ),
        }
    parts = [brief_from_row(r) for r in matched]
    lead = "From " + ", ".join(slugs) + "."
    return {
        "ok": True,
        "unknown": False,
        "shelf": False,
        "wire": "pro",
        "slugs": slugs,
        "courses": [str(r.get("course") or "") for r in matched if r.get("course")],
        "cites": cites,
        "spoken": f"{lead} " + " ".join(parts),
    }


def main() -> int:
    import argparse
    import json

    ap = argparse.ArgumentParser(description="School-skill retrieve")
    ap.add_argument("--write-index", action="store_true")
    ap.add_argument("--count", action="store_true")
    ap.add_argument("utterance", nargs="*", help="Optional ask to brief")
    args = ap.parse_args()
    if args.write_index or args.count:
        data = school_index.write_snapshot() if args.write_index else school_index.build_snapshot()
        print(
            json.dumps(
                {
                    "on_disk": data["on_disk"],
                    "enrolled_catalog_claim": data["enrolled_catalog_claim"],
                    "delta": data["enrolled_catalog_claim"] - data["on_disk"],
                },
                indent=2,
            )
        )
        if not args.utterance:
            return 0
    if args.utterance:
        got = brief(" ".join(args.utterance))
        print(got.get("spoken") or "UNKNOWN")
        return 0 if got.get("ok") else 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
