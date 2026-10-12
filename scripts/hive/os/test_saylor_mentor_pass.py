#!/usr/bin/env python3
"""Mentor-pass: school is the 164 catalog, not BUS206."""
from __future__ import annotations

import importlib.util
import re
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "saylor-mentor-pass.py"


def _load():
    spec = importlib.util.spec_from_file_location("saylor_mentor_pass_test", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class MentorPassShelfTest(unittest.TestCase):
    def test_self_test(self) -> None:
        self.assertEqual(MOD.self_test(), [])

    def test_evens_phrasing_is_shelf_not_bus206(self) -> None:
        beat = MOD.live_beat(
            "hive-os",
            "Don't just focus on BUS206. Focus on all the school skills 164 as well.",
            [],
        )
        self.assertEqual(beat.get("course"), "SHELF")
        self.assertNotEqual(beat.get("course"), "BUS206")
        self.assertIn("164", beat.get("school") or "")
        md = MOD.format_live(beat)
        self.assertIsNone(re.search(r"^SCHOOL:\s*BUS206\s*$", md, re.M))
        school_line = next(ln for ln in md.splitlines() if ln.startswith("SCHOOL:"))
        self.assertIn("164", school_line)
        self.assertIn("on disk", school_line.lower())

    def test_hive_os_164_index_is_not_bus206(self) -> None:
        beat = MOD.live_beat(
            "hive-os",
            "hive-os confirm the 164 index is what pipeline uses",
            [],
        )
        self.assertNotEqual(beat.get("course"), "BUS206")
        self.assertEqual(beat.get("course"), "SHELF")

    def test_copy_sitting_school_is_still_the_catalog(self) -> None:
        beat = MOD.live_beat("hive-os", "who is this page for and what tone", [])
        self.assertEqual(beat.get("course"), "BUS210")
        self.assertIn("164", beat.get("school") or "")
        md = MOD.format_live(beat)
        school_line = next(ln for ln in md.splitlines() if ln.startswith("SCHOOL:"))
        self.assertNotEqual(school_line.strip(), "SCHOOL: BUS206")
        self.assertIn("164", school_line)


if __name__ == "__main__":
    unittest.main()
