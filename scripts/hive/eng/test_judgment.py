#!/usr/bin/env python3
"""Exact state never calls Jev. A demo corpus never becomes a feature list."""
from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ENG = Path(__file__).resolve().parent
SIGNAL = ENG / "signal.py"


def load_judgment():
    spec = importlib.util.spec_from_file_location("hive_eng_judgment", ENG / "judgment.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("judgment.py missing")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


judgment = load_judgment()


class JudgmentBoundaryTest(unittest.TestCase):
    def test_pid_alive_count_increasing_is_deterministic_monitor(self) -> None:
        decision = judgment.evaluate(
            {"pid_alive": True, "count": 8, "previous_count": 7, "confidence": 0.99}
        )
        self.assertEqual(decision["lane"], "deterministic")
        self.assertEqual(decision["action"], "MONITOR")
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["jev_allowed"])
        self.assertIsNone(decision["provider"])
        self.assertFalse(decision["confidence_is_evidence"])
        self.assertEqual(decision["evidence"], [])

    def test_stall_past_the_line_starts_repair_without_jev(self) -> None:
        decision = judgment.evaluate(
            {
                "pid_alive": True,
                "count": 8,
                "previous_count": 8,
                "stall_line": 3,
                "unchanged_ticks": 4,
            }
        )
        self.assertEqual(decision["action"], "STALL")
        self.assertEqual(decision["repair"], "start")
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["jev_allowed"])

    def test_ten_similar_failures_may_be_ranked(self) -> None:
        failures = [{"signature": "disk-sentence"} for _ in range(10)]
        decision = judgment.evaluate({"failures": failures})
        self.assertEqual(decision["lane"], "jev")
        self.assertEqual(decision["verb"], "rank")
        self.assertTrue(decision["jev_allowed"])
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["provider_call"])

    def test_nine_similar_failures_do_not_call_jev(self) -> None:
        decision = judgment.evaluate({"failures": [{"signature": "disk-sentence"} for _ in range(9)]})
        self.assertFalse(decision["jev_allowed"])
        self.assertFalse(decision["jev_called"])
        self.assertNotEqual(decision["lane"], "jev")

    def test_catastrophic_gate_stops_without_jev(self) -> None:
        decision = judgment.evaluate(
            {
                "catastrophic": True,
                "failure_class": "authority",
                "pid_alive": True,
                "count": 9,
                "previous_count": 4,
                "confidence": 0.2,
            }
        )
        self.assertEqual(decision["lane"], "deterministic")
        self.assertEqual(decision["action"], "STOP")
        self.assertEqual(decision["stop"], "gate")
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["jev_allowed"])

    def test_safe_repair_clusters_without_a_winner_are_ranked(self) -> None:
        decision = judgment.evaluate(
            {
                "repair_clusters": [
                    {"id": "a", "safe": True},
                    {"id": "b", "safe": True},
                ],
                "clear_winner": False,
            }
        )
        self.assertEqual(decision["verb"], "rank")
        self.assertTrue(decision["jev_allowed"])
        self.assertFalse(decision["jev_called"])

    def test_exact_checks_never_reach_jev(self) -> None:
        for check, payload in (
            ("pid_alive", {"pid_alive": True}),
            ("count_increased", {"count_increased": True, "pid_alive": False}),
            ("output_stopped", {"output_stopped": True}),
            ("batch_finished", {"batch_finished": True}),
            ("artifact_appeared", {"artifact_appeared": True}),
            ("error_code", {"error_code": "E_DISK"}),
        ):
            decision = judgment.evaluate({**payload, "verb": "rank", "checks": [check]})
            self.assertFalse(decision["jev_called"], check)
            self.assertFalse(decision["jev_allowed"], check)
            self.assertEqual(decision["lane"], "deterministic", check)

    def test_demo_corpus_cannot_become_a_feature_list(self) -> None:
        demos = [{"id": f"demo-{i}"} for i in range(562)]
        decision = judgment.corpus_features(
            {
                "signal_class": "EXTERNAL_SIGNAL",
                "kind": "demo_corpus",
                "url": judgment.DEMO_CORPUS_URL,
                "demos": demos,
            }
        )
        self.assertTrue(decision["refused"])
        self.assertEqual(decision["features"], [])
        self.assertEqual(decision["jobs"], [])
        self.assertEqual(decision["count"], 562)
        self.assertNotEqual(len(decision["features"]), 562)
        routed = judgment.evaluate({"corpus": {"signal_class": "EXTERNAL_SIGNAL", "kind": "demo_corpus", "demos": demos}})
        self.assertEqual(routed["features"], [])
        self.assertEqual(routed["action"], "NO_ACTION")
        self.assertFalse(routed["jev_called"])

    def test_signal_store_refuses_demo_corpus_product(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            capture = subprocess.run(
                [
                    sys.executable,
                    str(SIGNAL),
                    "--root",
                    str(root),
                    "capture",
                    "--id",
                    "SIG-DEMOS",
                    "--platform",
                    "web",
                    "--url",
                    judgment.DEMO_CORPUS_URL,
                    "--title",
                    "Jev demos",
                    "--collection",
                    "jev-demos",
                ],
                capture_output=True,
                text=True,
                cwd=str(ROOT),
            )
            self.assertEqual(capture.returncode, 0, capture.stdout)
            filed = subprocess.run(
                [
                    sys.executable,
                    str(SIGNAL),
                    "--root",
                    str(root),
                    "candidate",
                    "--id",
                    "CAND-FEATURES",
                    "--signal",
                    "SIG-DEMOS",
                    "--kind",
                    "CANDIDATE_PRODUCT",
                    "--text",
                    "Build one feature per demo",
                ],
                capture_output=True,
                text=True,
                cwd=str(ROOT),
            )
            self.assertNotEqual(filed.returncode, 0, filed.stdout)
            body = json.loads(filed.stdout.split("FAIL")[0])
            self.assertEqual(body["features"], [])
            self.assertTrue(body["refused"])
            self.assertFalse((root / "candidates" / "CAND-FEATURES.json").exists())

    def test_question_library_is_not_asked_in_full(self) -> None:
        decision = judgment.evaluate({"ask_all": True, "library_size": 273, "questions": list(range(273))})
        self.assertEqual(decision["action"], "NO_ACTION")
        self.assertEqual(decision["questions_asked"], 0)
        self.assertFalse(decision["jev_called"])
        pack = judgment.evaluate({"questions": ["q1", "q2", "q3"]})
        self.assertEqual(pack["action"], "ASK")
        self.assertEqual(pack["questions_asked"], 3)

    def test_abstain_outputs_are_valid_and_confidence_is_not_evidence(self) -> None:
        for action in ("NO_ACTION", "WAIT", "ASK", "ESCALATE"):
            decision = judgment.evaluate({"action": action, "confidence": 1})
            self.assertEqual(decision["action"], action)
            self.assertFalse(decision["confidence_is_evidence"])
            self.assertEqual(decision["evidence"], [])
            self.assertFalse(decision["jev_called"])
        bare = judgment.evaluate({"confidence": 0.99})
        self.assertEqual(bare["action"], "NO_ACTION")
        self.assertEqual(bare["evidence"], [])

    def test_forbidden_roles_and_open_generation(self) -> None:
        for role in ("brain", "authority", "code_generator", "researcher"):
            decision = judgment.evaluate({"role": role, "verb": "rank"})
            self.assertEqual(decision["action"], "ESCALATE")
            self.assertEqual(decision["lane"], "human")
            self.assertFalse(decision["jev_allowed"])
        frontier = judgment.evaluate({"kind": "generation"})
        self.assertEqual(frontier["lane"], "frontier")
        self.assertFalse(frontier["jev_allowed"])

    def test_rising_count_and_live_pid_do_not_call_jev(self) -> None:
        decision = judgment.evaluate(
            {
                "pid_alive": True,
                "row_count": 12,
                "previous_row_count": 9,
                "verb": "select",
                "confidence": 0.99,
            }
        )
        self.assertEqual(decision["lane"], "deterministic")
        self.assertEqual(decision["action"], "MONITOR")
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["jev_allowed"])
        self.assertIsNone(decision["provider"])
        self.assertFalse(decision["provider_call"])
        self.assertTrue(decision["facts"]["row_count_changed"])

    def test_bounded_rank_of_safe_repairs_may_use_jev(self) -> None:
        decision = judgment.evaluate(
            {
                "verb": "rank",
                "repair_clusters": [
                    {"id": "restart", "safe": True},
                    {"id": "retry", "safe": True},
                ],
                "clear_winner": False,
            }
        )
        self.assertEqual(decision["lane"], "jev")
        self.assertEqual(decision["action"], "RANK")
        self.assertEqual(decision["verb"], "rank")
        self.assertTrue(decision["jev_allowed"])
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["provider_call"])
        self.assertIsNone(decision["provider"])

    def test_artifact_exists_and_process_finished_stay_deterministic(self) -> None:
        for payload in (
            {"artifact_exists": True, "verb": "select"},
            {"process_finished": True, "verb": "rank"},
            {"row_count_changed": True, "verb": "score"},
        ):
            decision = judgment.evaluate(payload)
            self.assertEqual(decision["lane"], "deterministic", payload)
            self.assertFalse(decision["jev_called"], payload)
            self.assertFalse(decision["jev_allowed"], payload)
            self.assertIsNone(decision["provider"], payload)

    def test_select_is_bounded_and_closed_work_is_not(self) -> None:
        allowed = judgment.evaluate({"verb": "select"})
        self.assertEqual(allowed["verb"], "select")
        self.assertEqual(allowed["action"], "SELECT")
        self.assertTrue(allowed["jev_allowed"])
        self.assertFalse(allowed["jev_called"])
        for role in ("conversation", "research", "architecture", "coding", "merge_authority", "jarvis_model"):
            decision = judgment.evaluate({"role": role, "verb": "select"})
            self.assertEqual(decision["action"], "ESCALATE", role)
            self.assertEqual(decision["lane"], "human", role)
            self.assertFalse(decision["jev_allowed"], role)
            self.assertFalse(decision["jev_called"], role)
        merge = judgment.evaluate({"merge_authority": True, "verb": "rank"})
        self.assertEqual(merge["action"], "ESCALATE")
        self.assertFalse(merge["jev_allowed"])
        brain = judgment.evaluate({"jarvis": True, "model": "jev", "verb": "route"})
        self.assertEqual(brain["action"], "ESCALATE")
        self.assertFalse(brain["jev_called"])

    def test_module_is_not_a_daemon_or_a_provider_client(self) -> None:
        text = (ENG / "judgment.py").read_text(encoding="utf-8")
        self.assertNotIn("threading", text)
        self.assertNotIn("while True", text)
        self.assertNotIn("typesafe", text.lower())
        self.assertNotIn("4018", text)
        self.assertNotIn("apps/scorpion", text)


if __name__ == "__main__":
    unittest.main()
