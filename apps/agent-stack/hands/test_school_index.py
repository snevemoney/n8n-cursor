#!/usr/bin/env python3
"""School-index contract + classify: named hands first, school topics to pro."""
from __future__ import annotations

import importlib.util
import os
import unittest
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"

HERE = Path(__file__).resolve().parent
INDEX = HERE / "school_index.py"
TURN = HERE.parent / "mouth" / "turn.py"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


IDX = _load("agent_stack_school_index_test", INDEX)
MOUTH = _load("agent_stack_mouth_school", TURN)


class SchoolIndexTest(unittest.TestCase):
    def test_snapshot_matches_scan(self) -> None:
        live = IDX.scan()
        snap = IDX.load_snapshot()
        self.assertEqual(snap.get("on_disk"), len(live))
        self.assertEqual(snap.get("enrolled_catalog_claim"), 164)
        self.assertLess(len(live), 164)
        self.assertTrue(all(r.get("course") for r in live))

    def test_named_hands_keep_first_claim(self) -> None:
        self.assertEqual(MOUTH.classify("go to YouTube")["verb"], "safari")
        self.assertEqual(MOUTH.classify("search the web for bitcoin")["verb"], "search")
        self.assertEqual(MOUTH.classify("watch later")["verb"], "watch_later")
        self.assertEqual(MOUTH.classify("scroll")["verb"], "safari")
        self.assertEqual(MOUTH.classify("check my repo")["verb"], "cursor")
        self.assertEqual(MOUTH.classify("what's on my calendar")["verb"], "calendar")
        self.assertEqual(MOUTH.classify("any unread mail")["verb"], "mail")
        self.assertEqual(MOUTH.classify("make an image")["verb"], "make")
        self.assertEqual(MOUTH.classify("what should we do today")["verb"], "today")
        self.assertEqual(MOUTH.classify("heal yourself")["verb"], "heal")

    def test_school_topics_hit_pro(self) -> None:
        self.assertEqual(MOUTH.classify("what is marketing")["verb"], "pro")
        self.assertEqual(MOUTH.classify("what is bitcoin")["verb"], "pro")
        self.assertEqual(MOUTH.classify("bitcoin literacy")["verb"], "pro")
        self.assertEqual(MOUTH.classify("hr staffing")["verb"], "pro")
        self.assertEqual(MOUTH.classify("business statistics")["verb"], "pro")
        self.assertEqual(MOUTH.classify("austrian value")["verb"], "pro")
        self.assertEqual(MOUTH.classify("BUS 999")["verb"], "pro")
        self.assertEqual(MOUTH.classify("the whole shelf")["verb"], "pro")
        self.assertEqual(MOUTH.classify("all professional skills")["verb"], "pro")
        self.assertEqual(MOUTH.classify("all university skills")["verb"], "pro")
        self.assertEqual(MOUTH.classify("all school skills")["verb"], "pro")
        self.assertEqual(MOUTH.classify("tell me a joke about bitcoin")["verb"], "converse")

    def test_no_prefix_allow_list(self) -> None:
        src = (HERE / "pro.py").read_text(encoding="utf-8")
        idx_src = INDEX.read_text(encoding="utf-8")
        self.assertNotIn("SLUG_MARKS", src)
        self.assertNotIn("SLUG_MARKS", idx_src)
        live = IDX.scan()
        self.assertGreaterEqual(len(live), 40)
        self.assertTrue(any(r["slug"].startswith("mktg") for r in live))
        self.assertTrue(any(r["slug"].startswith("bitcoin") for r in live))
        self.assertTrue(any(r["slug"].startswith("hrm") for r in live))


if __name__ == "__main__":
    unittest.main()
