#!/usr/bin/env python3
"""Fold one future COURSE-SKILL into catalog + speak-sheet + leverage stub + SKILL.md.

Does not invent when/never. Does not take exams. Works for courses not yet harvested.
"""
from __future__ import annotations

import argparse
import importlib.util
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/evenslouis/n8n-cursor")
CATALOG = ROOT / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
SPEAK = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-trigger-map.md"
LEVERAGE = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-leverage-map.md"
REMAINING = ROOT / "docs/hive/outer-heaven/CONTENT/topics/saylor-remaining.md"

_spec = importlib.util.spec_from_file_location(
    "saylor_promote", ROOT / "scripts/hive/os/saylor-course-skills-promote.py"
)
assert _spec and _spec.loader
promote = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(promote)

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)+$")
COURSE_RE = re.compile(r"^[A-Z]{2,6}\d{2,4}$")


def _has_slug(path: Path, slug: str) -> bool:
    return path.is_file() and f"`{slug}`" in path.read_text(encoding="utf-8")


def _append_catalog(course: str, slug: str, when: str, never: str) -> None:
    if _has_slug(CATALOG, slug):
        return
    text = CATALOG.read_text(encoding="utf-8") if CATALOG.is_file() else ""
    row = f"| {course} | `{slug}` | {when} | {never} |\n"
    if not text.endswith("\n"):
        text += "\n"
    CATALOG.write_text(text + row, encoding="utf-8")
    body = CATALOG.read_text(encoding="utf-8")
    n = sum(1 for ln in body.splitlines() if ln.startswith("| ") and "`" in ln and not ln.startswith("| course"))
    body = re.sub(r"Count: \*\*\d+\*\*", f"Count: **{n}**", body, count=1)
    CATALOG.write_text(body, encoding="utf-8")


def _append_speak(plain: str, slug: str, course: str, desk: str) -> None:
    if _has_slug(SPEAK, slug):
        return
    text = SPEAK.read_text(encoding="utf-8") if SPEAK.is_file() else ""
    row = f"| {plain} | `{slug}` {course} | {desk} | exam dump; sibling course as *the* course |\n"
    marker = "## Anti-triggers"
    if marker in text:
        text = text.replace(marker, row + "\n" + marker, 1)
    else:
        text = text.rstrip() + "\n" + row
    SPEAK.write_text(text if text.endswith("\n") else text + "\n", encoding="utf-8")


def _append_leverage(lane: str, plain: str, course: str, put: str, leverage: str) -> None:
    heading = "## Hive-os" if lane == "hive-os" else "## Agency"
    if not LEVERAGE.is_file():
        return
    text = LEVERAGE.read_text(encoding="utf-8")
    if course in text and plain in text:
        return
    row = f"| {plain} | {course} | {put} | {leverage} |\n"
    m = re.search(rf"^{re.escape(heading)}.*$", text, re.MULTILINE)
    if not m:
        text = text.rstrip() + f"\n\n{heading}\n\n" + row
        LEVERAGE.write_text(text + "\n", encoding="utf-8")
        return
    rest = text[m.end() :]
    nxt = re.search(r"^## ", rest, re.MULTILINE)
    insert_at = m.end() + (nxt.start() if nxt else len(rest))
    text = text[:insert_at] + row + text[insert_at:]
    LEVERAGE.write_text(text, encoding="utf-8")


def _mark_remaining(course: str, path: Path | None = None) -> bool:
    path = path or REMAINING
    if not path.is_file():
        return False
    text = path.read_text(encoding="utf-8")
    pat = re.compile(rf"^(\| {re.escape(course)} \|.*)open(\s*\|)", re.MULTILINE)
    text2, n = pat.subn(r"\1folded\2", text, count=1)
    if n:
        path.write_text(text2, encoding="utf-8")
    return n > 0


def fold(
    *,
    course: str,
    slug: str,
    when: str,
    never: str,
    desk: str,
    plain: str,
    lanes: list[str],
    put: str,
    leverage: str,
) -> dict:
    _append_catalog(course, slug, when, never)
    _append_speak(plain, slug, course, desk)
    for lane in lanes:
        _append_leverage(lane, plain, course, put, leverage)
    promote.write_one({"course": course, "slug": slug, "when": when, "never": never})
    _mark_remaining(course)
    return {
        "course": course,
        "slug": slug,
        "master": f"scripts/hive/grok-skills/{slug}.md",
        "lanes": lanes,
    }


def self_test() -> list[str]:
    errs: list[str] = []
    if not CATALOG.is_file():
        errs.append("catalog missing")
    rows = promote.parse_catalog(CATALOG)
    if len(rows) < 40:
        errs.append("catalog too thin")
    if promote.desk_for("zz-unknown-future-slug") != "Consultant":
        errs.append("unknown future slug must default to Consultant")
    slug = "zz-fold-self-test-not-a-course"
    path = None
    try:
        path = promote.write_one(
            {
                "course": "FOLD99",
                "slug": slug,
                "when": "a task asks how to fold a future course without inventing an exam",
                "never": "the job is reconstructing or taking a Saylor exam",
            }
        )
        if not path.is_file():
            errs.append("write_one failed")
        body = path.read_text(encoding="utf-8") if path and path.is_file() else ""
        if "exam" not in body.lower():
            errs.append("future skill missing exam never")
    finally:
        if path and path.is_file():
            path.unlink()
        cur = ROOT / ".cursor/skills" / slug / "SKILL.md"
        if cur.is_file():
            cur.unlink()
            try:
                cur.parent.rmdir()
            except OSError:
                pass
    tmp = Path("/tmp/saylor-remaining-self-test.md")
    tmp.write_text(
        "| course | desk | status | notes |\n|---|---|---|---|\n| BUS699 | Consultant | open | harvest |\n",
        encoding="utf-8",
    )
    try:
        if not _mark_remaining("BUS699", tmp):
            errs.append("remaining mark missed open row")
        marked = tmp.read_text(encoding="utf-8")
        if "| folded |" not in marked or "BUS699" not in marked:
            errs.append("remaining fold text wrong")
        if _mark_remaining("BUS650", tmp):
            errs.append("should not mark a course that is not open")
    finally:
        tmp.unlink(missing_ok=True)
    refuse = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts/hive/os/saylor-fold.py"),
            "--course",
            "BUS699",
            "--slug",
            "future-course-fold",
            "--when",
            "a sitting needs a future fold",
            "--never",
            "do not invent a KPI",
            "--plain",
            "future fold",
        ],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if refuse.returncode != 2 or "exam" not in (refuse.stderr or "").lower():
        errs.append("should refuse --never without exam")
    dry = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts/hive/os/saylor-fold.py"),
            "--course",
            "BUS699",
            "--slug",
            "future-course-fold",
            "--when",
            "a sitting needs a future fold",
            "--never",
            "do not reconstruct the exam",
            "--plain",
            "future fold",
            "--dry-run",
        ],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    if dry.returncode != 0 or "dry-run" not in (dry.stdout + dry.stderr):
        errs.append("dry-run should print and exit 0")
    if (MASTER := ROOT / "scripts/hive/grok-skills/future-course-fold.md").is_file():
        errs.append("dry-run wrote a skill")
        MASTER.unlink()
    return errs


def main() -> int:
    ap = argparse.ArgumentParser(description="Fold one COURSE-SKILL (future courses included)")
    ap.add_argument("--course", help="BUS612, CS101, ENGL101, …")
    ap.add_argument("--slug", help="kebab skill slug")
    ap.add_argument("--when", help="plain use-when (required; do not invent)")
    ap.add_argument("--never", help="plain do-not-use (required; include exam dump)")
    ap.add_argument("--desk", default="Consultant")
    ap.add_argument("--plain", help="speak-sheet 'you say' line")
    ap.add_argument("--lane", default="hive-os", help="hive-os, agency, or both")
    ap.add_argument("--put", default="name the file or blank on the lane facts card")
    ap.add_argument("--leverage", default="named desk executes; Evens HITL")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        errs = self_test()
        if errs:
            print("FAIL:", "; ".join(errs), file=sys.stderr)
            return 1
        print("OK: saylor-fold self-test")
        return 0
    missing = [k for k in ("course", "slug", "when", "never", "plain") if not getattr(args, k)]
    if missing:
        print("refuse: need --course --slug --when --never --plain (do not invent)", file=sys.stderr)
        return 2
    if not COURSE_RE.match(args.course):
        print("refuse: --course looks wrong", file=sys.stderr)
        return 2
    if not SLUG_RE.match(args.slug):
        print("refuse: --slug must be kebab-case", file=sys.stderr)
        return 2
    if "exam" not in args.never.lower():
        print("refuse: --never must forbid exam reconstruction", file=sys.stderr)
        return 2
    lanes = ["hive-os", "agency"] if args.lane == "both" else [args.lane]
    if any(x not in ("hive-os", "agency") for x in lanes):
        print("refuse: --lane hive-os|agency|both", file=sys.stderr)
        return 2
    if args.dry_run:
        print(f"dry-run: would fold {args.course} → scripts/hive/grok-skills/{args.slug}.md")
        return 0
    out = fold(
        course=args.course,
        slug=args.slug,
        when=args.when.strip(),
        never=args.never.strip(),
        desk=args.desk,
        plain=args.plain.strip(),
        lanes=lanes,
        put=args.put,
        leverage=args.leverage,
    )
    print(f"folded {out['course']} → {out['master']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
