#!/usr/bin/env python3
"""Unit tests for catalog-demand-match (MATRIX movement holes)."""
from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "catalog-demand-match.py"
FIXTURE = HERE / "fixtures" / "demand-match-matrix.json"


def _load_mod():
    spec = importlib.util.spec_from_file_location("catalog_demand_match", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load_mod()


class DemandMatchMatrixTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.cases = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_matrix_fixtures(self) -> None:
        for case in self.cases:
            with self.subTest(case["name"]):
                got = MOD.match_need(case["need"])
                self.assertEqual(got["verdict"], case["verdict"], got)
                ids = " ".join(m.get("id") or "" for m in got.get("matches") or [])
                if case.get("sku_contains"):
                    self.assertIn(case["sku_contains"], ids, ids)
                if case.get("sku_excludes"):
                    self.assertNotIn(case["sku_excludes"], ids, ids)

    def test_refuse_has_next_and_text_ok(self) -> None:
        got = MOD.match_need("I do AI")
        self.assertEqual(got["verdict"], "REFUSE")
        self.assertIn("next", got)
        self.assertTrue(got["next"])
        text = MOD.format_text(got)
        self.assertIn("VERDICT: REFUSE", text)
        self.assertIn("NEXT:", text)
        self.assertNotIn("Traceback", text)

    def test_waitlist_not_list_anneal(self) -> None:
        got = MOD.match_need("waitlist page before Stripe")
        self.assertEqual(got["verdict"], "BUILD")
        ids = " ".join(m.get("id") or "" for m in got.get("matches") or [])
        self.assertIn("paid-slice", ids)
        self.assertNotIn("list-anneal", ids)

    def test_chatbot_plumber_stays_private_book(self) -> None:
        got = MOD.match_need("AI chatbot for a Montreal plumber")
        self.assertEqual(got["verdict"], "BUILD")
        ids = " ".join(m.get("id") or "" for m in got.get("matches") or [])
        self.assertIn("private-book-install__local-pro", ids)


if __name__ == "__main__":
    unittest.main()
