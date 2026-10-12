#!/usr/bin/env python3
"""School index: 164 is the catalog claim. Harvest table is not 164. Missing stays missing."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
INDEX = HERE / "school_index.py"
TRIGGERS = HERE.parents[2] / "docs/hive/outer-heaven/CONTENT/saylor-skill-triggers.md"
COMPLETE = HERE.parents[2] / "docs/hive/outer-heaven/CONTENT/topics/saylor-catalog-complete.md"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


IDX = _load("agent_stack_school_index_test", INDEX)


class SchoolIndexTest(unittest.TestCase):
    def test_claim_164_harvest_file_is_not_164(self) -> None:
        claim_text = COMPLETE.read_text(encoding="utf-8")
        harvest_text = TRIGGERS.read_text(encoding="utf-8")
        self.assertIn("Unique courses **164**", claim_text)
        self.assertIn("Count: **42**", harvest_text)
        snap = IDX.build_snapshot()
        self.assertEqual(snap["enrolled_catalog_claim"], 164)
        self.assertEqual(IDX.enrolled_catalog_claim(), 164)
        self.assertEqual(snap["harvest_table_count"], 42)
        self.assertEqual(IDX.harvest_table_count(), 42)
        self.assertNotEqual(snap["harvest_table_count"], 164)
        self.assertLess(snap["on_disk"], 164)
        self.assertEqual(
            snap["named_courses"] + snap["unnamed_enrolled_delta"],
            164,
        )

    def test_on_disk_matches_course_tagged_files(self) -> None:
        live = IDX.scan()
        self.assertGreaterEqual(len(live), 40)
        self.assertTrue(all(r.get("course") for r in live))
        self.assertTrue(all(not r.get("missing") for r in live))
        self.assertTrue(any(str(r.get("slug") or "").startswith("mktg") for r in live))
        snap = IDX.build_snapshot()
        self.assertEqual(snap["on_disk"], len(live))

    def test_missing_courses_marked_missing_not_fake_skill(self) -> None:
        rows = IDX.catalog_rows()
        missing = [r for r in rows if r.get("missing")]
        self.assertTrue(missing, "named remaining/extras should be in the index")
        for row in missing:
            self.assertTrue(row.get("missing"))
            self.assertFalse(row.get("path"))
            self.assertFalse(row.get("when"))
            self.assertFalse(row.get("text"))
            slug = str(row.get("slug") or "")
            if slug:
                path = IDX.GROK_SKILLS / f"{slug}.md"
                self.assertFalse(path.is_file(), slug)
        courses = {str(r.get("course") or "") for r in missing}
        self.assertTrue({"BUS612", "COMM311", "ESLHub"} & courses)

    def test_trigger_never_list_is_not_a_row(self) -> None:
        """CS406 / PRDV217 appear in Never columns. Do not enroll them."""
        rows = IDX.catalog_rows()
        courses = {str(r.get("course") or "") for r in rows}
        self.assertNotIn("CS406", courses)
        self.assertNotIn("PRDV217", courses)
        self.assertIn("BUS203", courses)

    def test_no_invented_slug_for_unnamed_delta(self) -> None:
        snap = IDX.build_snapshot()
        self.assertGreater(snap["unnamed_enrolled_delta"], 0)
        for row in snap["skills"]:
            slug = str(row.get("slug") or "")
            if row.get("missing"):
                self.assertFalse(slug.startswith("enrolled-"))
                self.assertNotIn("invented", slug)

    def test_pack_is_titles_not_manuals(self) -> None:
        blob = IDX.pack_lines()
        self.assertIn("164", blob)
        self.assertIn("Count: **42**", blob)
        self.assertNotIn("## When", blob)
        self.assertNotIn("## Steps", blob)
        self.assertLess(blob.count("\n"), 220)

    def test_isolated_disk_does_not_mint_missing(self) -> None:
        with tempfile.TemporaryDirectory(prefix="school-idx-") as tmp:
            grok = Path(tmp) / "grok"
            cursor = Path(tmp) / "cursor"
            grok.mkdir()
            cursor.mkdir()
            (grok / "mktg-value-stp-mix-plan-checklists.md").write_text(
                "---\nname: mktg-value-stp-mix-plan-checklists\n---\n"
                "# Marketing (BUS203)\n\n**Course:** BUS203\n\n## When\nmarketing\n",
                encoding="utf-8",
            )
            live = IDX.scan(grok, cursor)
        self.assertEqual([r["slug"] for r in live], ["mktg-value-stp-mix-plan-checklists"])
        self.assertFalse(live[0].get("missing"))


if __name__ == "__main__":
    unittest.main()
