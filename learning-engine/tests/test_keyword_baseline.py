from __future__ import annotations

import json
import unittest

from tests.helpers import ROOT

from learning_engine.stage_c.harness import resolve_provider, run_eval
from learning_engine.stage_c.labelled import load_labelled
from learning_engine.stage_c.metrics import score_rows, split_done
from learning_engine.stage_c.providers.keyword import KeywordReplayProvider, KeywordRulesProvider


class KeywordBaselineTest(unittest.TestCase):
    def test_replay_matches_hand_computed_fixture(self) -> None:
        expected = json.loads((ROOT / "fixtures" / "keyword_replay" / "EXPECTED.json").read_text())
        rows = load_labelled(
            ROOT / "fixtures" / "keyword_replay" / "REVIEW.csv",
            ROOT / "fixtures" / "keyword_replay" / "STATE.jsonl",
        )
        provider = KeywordReplayProvider()
        result = run_eval(provider, [{**row, "packet": None} for row in rows])
        report = result["report"]
        all_exp = expected["hand_count"]["all"]
        done_exp = expected["hand_count"]["done_only"]
        self.assertEqual(report["all"]["n"], all_exp["n"])
        self.assertEqual(report["all"]["flagged"], all_exp["flagged_n"])
        self.assertEqual(report["all"]["useful"], all_exp["useful_n"])
        self.assertEqual(report["all"]["tp"], all_exp["tp_n"])
        self.assertAlmostEqual(report["all"]["recall"], all_exp["recall"])
        self.assertAlmostEqual(report["all"]["precision"], all_exp["precision"])
        self.assertAlmostEqual(report["all"]["high_recall"], all_exp["high_recall"])
        self.assertEqual(report["done_only"]["n"], done_exp["n"])
        self.assertEqual(report["done_only"]["flagged"], done_exp["flagged_n"])
        self.assertEqual(report["done_only"]["useful"], done_exp["useful_n"])
        self.assertEqual(report["done_only"]["tp"], done_exp["tp_n"])
        self.assertAlmostEqual(report["done_only"]["recall"], done_exp["recall"])
        self.assertAlmostEqual(report["done_only"]["precision"], done_exp["precision"])
        self.assertAlmostEqual(report["done_only"]["high_recall"], done_exp["high_recall"])
        self.assertEqual(report["all"]["cost_usd_sum"], 0.0)
        self.assertEqual(report["provider"], "keyword_replay")

    def test_metric_helpers_match_the_written_definition(self) -> None:
        rows = [
            {"flagged": True, "usefulness": "high", "status": "DONE"},
            {"flagged": False, "usefulness": "med", "status": "DONE"},
            {"flagged": True, "usefulness": "low", "status": "DONE"},
        ]
        scored = score_rows(rows)
        # TP = 1, useful = 2, flagged = 2 → recall 0.5, precision 0.5, high 1/1
        self.assertEqual(scored["tp"], 1)
        self.assertEqual(scored["useful"], 2)
        self.assertEqual(scored["flagged"], 2)
        self.assertAlmostEqual(scored["recall"], 0.5)
        self.assertAlmostEqual(scored["precision"], 0.5)
        self.assertAlmostEqual(scored["high_recall"], 1.0)

    def test_rules_mode_is_a_different_baseline(self) -> None:
        self.assertEqual(resolve_provider("keyword", mode="rules").name, "keyword_rules")
        self.assertEqual(KeywordRulesProvider().name, "keyword_rules")
        self.assertNotEqual(KeywordRulesProvider().name, KeywordReplayProvider().name)

    def test_split_done_drops_failed(self) -> None:
        rows = [
            {"status": "DONE", "flagged": True, "usefulness": "high"},
            {"status": "FAILED", "flagged": True, "usefulness": "high"},
        ]
        all_rows, done = split_done(rows)
        self.assertEqual(len(all_rows), 2)
        self.assertEqual(len(done), 1)
