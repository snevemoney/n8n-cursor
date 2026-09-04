#!/usr/bin/env python3
"""Professional-skill retrieve: real slugs only, multiple ok, no invent."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "pro.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_pro", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


STAT = """---
name: bizstat-describe-sample-infer-regress-checklists
---

# Business stats infer (BUS204)

**Course:** BUS204

## When

a task asks what a workplace number actually means, how to summarize a dataset without letting the mean lie

## Steps

1. Cap 1-3 skills this ask.
2. Bind one real fact. Blank stays blank.
"""

MKTG = """---
name: mktg-value-stp-mix-plan-checklists
---

# Marketing value / STP / mix (BUS203)

**Course:** BUS203

## When

a task asks what marketing is, who to segment and target, how to set price

## Steps

1. Name the segment.
2. Write the mix. Do not invent a KPI.
"""

FIN = """---
name: corpfin-tvm-value-capital-checklists
---

# Corporate finance TVM / capital (BUS202)

**Course:** BUS202

## When

a task asks how to compute PV/FV, whether to accept a project, how debt vs equity changes WACC

## Steps

1. Read statements as inputs.
2. Compute the rate. Do not invent a return.
"""


def _disk(tmp: Path) -> tuple[Path, Path]:
    grok = tmp / "grok-skills"
    cursor = tmp / "skills"
    grok.mkdir()
    cursor.mkdir()
    (grok / "bizstat-describe-sample-infer-regress-checklists.md").write_text(STAT, encoding="utf-8")
    (grok / "mktg-value-stp-mix-plan-checklists.md").write_text(MKTG, encoding="utf-8")
    (grok / "corpfin-tvm-value-capital-checklists.md").write_text(FIN, encoding="utf-8")
    (grok / "hive-funnels.md").write_text("# Hive funnels\n\nNot a professional course.\n", encoding="utf-8")
    skill = cursor / "mktg-value-stp-mix-plan-checklists"
    skill.mkdir()
    (skill / "SKILL.md").write_text(MKTG, encoding="utf-8")
    return grok, cursor


class ProRetrieveTest(unittest.TestCase):
    def test_bus204_uses_on_disk_slug_only(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-pro-204-") as tmp:
            grok, cursor = _disk(Path(tmp))
            got = MOD.brief("BUS 204 — what does this number mean", grok_dir=grok, cursor_dir=cursor)
        self.assertIn("bizstat-describe-sample-infer-regress-checklists", got["slugs"])
        self.assertEqual(got["courses"], ["BUS204"])
        self.assertIn("BUS204", got["spoken"])
        self.assertNotIn("BUS999", got["spoken"])
        self.assertNotIn("hive-funnels", got["slugs"])
        self.assertFalse(got["unknown"])

    def test_missing_course_is_unknown_no_invent(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-pro-miss-") as tmp:
            grok, cursor = _disk(Path(tmp))
            got = MOD.brief("brief me on BUS 999", grok_dir=grok, cursor_dir=cursor)
        self.assertTrue(got["unknown"])
        self.assertIn("UNKNOWN", got["spoken"])
        self.assertIn("BUS999", got["spoken"])
        self.assertNotIn("BUS999 is on disk", got["spoken"])
        self.assertNotIn("invented-skill", got["slugs"])
        for slug in got["slugs"]:
            self.assertTrue(MOD.is_professional_slug(slug))
            self.assertTrue((grok / f"{slug}.md").is_file() or (cursor / slug / "SKILL.md").is_file())

    def test_spans_marketing_and_finance(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-pro-span-") as tmp:
            grok, cursor = _disk(Path(tmp))
            got = MOD.brief(
                "checking your professional skills on marketing and finance",
                grok_dir=grok,
                cursor_dir=cursor,
            )
        self.assertIn("mktg-value-stp-mix-plan-checklists", got["slugs"])
        self.assertIn("corpfin-tvm-value-capital-checklists", got["slugs"])
        self.assertLessEqual(len(got["slugs"]), 3)
        self.assertNotIn("bizstat-describe-sample-infer-regress-checklists", got["slugs"])
        self.assertNotIn("hive-funnels", got["slugs"])
        self.assertIn("segment", got["spoken"].lower())
        self.assertFalse(got["unknown"])

    def test_never_returns_slug_absent_from_disk(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-pro-ghost-") as tmp:
            grok, cursor = _disk(Path(tmp))
            catalog = [
                {
                    "slug": "ghost-course-not-real",
                    "path": str(grok / "ghost-course-not-real.md"),
                    "course": "BUS777",
                    "when": "marketing finance",
                    "text": "**Course:** BUS777\n## When\nmarketing finance\n",
                }
            ]
            got = MOD.brief("marketing finance", grok_dir=grok, cursor_dir=cursor, catalog=catalog)
        self.assertNotIn("ghost-course-not-real", got["slugs"])
        self.assertNotIn("BUS777", got["spoken"])

    def test_no_match_does_not_dump_catalog(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-pro-empty-") as tmp:
            grok, cursor = _disk(Path(tmp))
            got = MOD.brief("checking your professional skills", grok_dir=grok, cursor_dir=cursor)
        self.assertTrue(got["unknown"])
        self.assertEqual(got["slugs"], [])
        self.assertNotIn("bizstat-describe-sample-infer-regress-checklists", got["spoken"])
        self.assertNotIn("mktg-value-stp-mix-plan-checklists", got["spoken"])
        self.assertIn("UNKNOWN", got["spoken"])
        self.assertNotIn("waiting for", got["spoken"].lower())


if __name__ == "__main__":
    unittest.main()
