#!/usr/bin/env python3
"""Progress claims on the existing product-state lifecycle.

Utilization cannot be reported as progress. No business evidence is invented.
"""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPT = HERE.parent / "product-state.py"


def _load_mod():
    spec = importlib.util.spec_from_file_location("product_state", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load_mod()


class ProductStateProgressTest(unittest.TestCase):
    def test_utilization_cannot_be_reported_as_progress(self) -> None:
        claims = [
            {"kind": "utilization", "value": 0.92},
            {"kind": "activity", "events": 40},
            {"kind": "agents_busy", "count": 17},
            {"kind": "reports_written", "count": 6},
            {"kind": "busy"},
            {"kind": "outcome_movement", "utilization": 1},
            {"kind": "outcome_movement", "agents_busy": 5},
            {"kind": "outcome_movement", "reports_written": 3},
            {"kind": "working_feature", "wip": 8},
        ]
        for claim in claims:
            with self.subTest(claim=claim):
                got = MOD.report_progress(claim)
                self.assertFalse(got["reported_as_progress"], got)
                self.assertEqual(got["reason"], "utilization_is_not_progress")
                self.assertNotIn(got["status"], {"VERIFIED", "LIVE"})
                self.assertNotIn("value", got)
                self.assertNotIn("count", got)

    def test_working_feature_is_not_market_proof(self) -> None:
        got = MOD.report_progress({"kind": "working_feature"})
        self.assertFalse(got["reported_as_progress"])
        self.assertFalse(got["market_proof"])
        self.assertEqual(got["reason"], "working_feature_is_not_market_proof")
        self.assertEqual(got["department"], "engineering")

    def test_customers_or_revenue_are_not_invented(self) -> None:
        for kind in ("customers", "revenue", "buyer"):
            with self.subTest(kind=kind):
                got = MOD.report_progress({"kind": kind, "amount": 5000, "count": 12})
                self.assertFalse(got["reported_as_progress"])
                self.assertTrue(got["invented"])
                self.assertFalse(got["buyer"])
                self.assertEqual(got["reason"], "customers_or_revenue_invented")
                self.assertNotIn("amount", got)
                self.assertNotIn("count", got)

    def test_engineering_lifecycle_is_one_department(self) -> None:
        for stage in MOD.LIFECYCLE_ORDER:
            with self.subTest(stage=stage):
                got = MOD.report_progress({"kind": stage})
                self.assertFalse(got["reported_as_progress"])
                self.assertFalse(got["market_proof"])
                self.assertEqual(got["department"], "engineering")
                self.assertEqual(got["reason"], "engineering_is_one_department")

    def test_recommendation_is_not_action(self) -> None:
        got = MOD.report_progress({"kind": "recommendation", "action": "send"})
        self.assertFalse(got["executed"])
        self.assertFalse(got["reported_as_progress"])
        self.assertEqual(got["reason"], "recommendation_is_not_action")

    def test_idle_is_healthy(self) -> None:
        for claim in ({"kind": "idle"}, {"agent_state": "IDLE"}):
            with self.subTest(claim=claim):
                got = MOD.report_progress(claim)
                self.assertTrue(got["healthy_idle"])
                self.assertFalse(got["failure"])
                self.assertFalse(got["reported_as_progress"])
                self.assertEqual(got["reason"], "idle_is_healthy")

    def test_signal_is_not_demand(self) -> None:
        got = MOD.report_progress({"kind": "signal"})
        self.assertFalse(got["demand"])
        self.assertFalse(got["reported_as_progress"])
        self.assertEqual(got["reason"], "signal_is_not_demand")

    def test_broken_website_is_not_a_buyer(self) -> None:
        got = MOD.report_progress({"kind": "broken_website"})
        self.assertFalse(got["buyer"])
        self.assertFalse(got["reported_as_progress"])
        self.assertEqual(got["reason"], "broken_website_is_not_a_buyer")

    def test_outcome_movement_is_not_self_certified(self) -> None:
        got = MOD.report_progress(
            {"kind": "outcome_movement", "from": "lead", "to": "conversion"}
        )
        self.assertFalse(got["reported_as_progress"])
        self.assertEqual(got["reason"], "outcome_movement_not_certified")
        self.assertEqual(got["status"], "IMPLEMENTED_UNVERIFIED")
        self.assertNotEqual(got["status"], "VERIFIED")
        self.assertNotEqual(got["status"], "LIVE")


if __name__ == "__main__":
    unittest.main()
