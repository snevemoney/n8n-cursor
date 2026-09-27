#!/usr/bin/env python3
"""Exact state never calls Jev. A demo corpus never becomes a feature list."""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import socket
import subprocess
import sys
import tempfile
import unittest
import urllib.request
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

    def test_select_builds_the_registry_chat_request_and_the_guard_stays_off(self) -> None:
        request = {"verb": "select"}
        os.environ.pop(judgment.OPENROUTER_CALL_GUARD, None)
        opened: list[object] = []
        real_socket = socket.socket
        real_create = socket.create_connection
        real_urlopen = urllib.request.urlopen

        def fail_socket(*args: object, **kwargs: object) -> object:
            opened.append(("socket", args))
            raise AssertionError("socket opened")

        def fail_connect(address: object, *args: object, **kwargs: object) -> object:
            opened.append(("connect", address))
            raise AssertionError("connect opened")

        def fail_urlopen(*args: object, **kwargs: object) -> object:
            opened.append("urlopen")
            raise AssertionError("urlopen")

        socket.socket = fail_socket  # type: ignore[assignment, misc]
        socket.create_connection = fail_connect  # type: ignore[assignment]
        urllib.request.urlopen = fail_urlopen  # type: ignore[assignment]
        try:
            decision = judgment.evaluate(request)
            guarded = judgment._post_openrouter_chat(decision["chat_request"])
        finally:
            socket.socket = real_socket  # type: ignore[assignment, misc]
            socket.create_connection = real_create
            urllib.request.urlopen = real_urlopen
        digest = hashlib.sha256(
            json.dumps(request, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
        ).hexdigest()
        questions = [
            "What user problem does this engineering change solve?",
            "What changes for the user when it works?",
            "Why does this matter now?",
            "What metric or observation proves product success?",
            "What guardrail metrics prevent optimizing the primary metric badly?",
            "What related improvements are explicitly not part of this slice?",
        ]
        self.assertEqual(opened, [])
        self.assertFalse(guarded["provider_call"])
        self.assertEqual(decision["action"], "SELECT")
        self.assertEqual(decision["verb"], "select")
        self.assertTrue(decision["jev_allowed"])
        self.assertFalse(decision["jev_called"])
        self.assertFalse(decision["provider_call"])
        self.assertEqual(decision["provider"], "openrouter")
        self.assertEqual(decision["model"], "anthropic/claude-haiku-4-5")
        self.assertEqual(decision["max_tokens"], 1024)
        self.assertEqual(decision["api"], "openai-completions")
        self.assertEqual(decision["guard"], "HIVE_OPENROUTER_CALL")
        self.assertEqual(decision["guard_default"], "off")
        self.assertEqual(decision["pack_id"], "engineering.product")
        self.assertEqual(decision["pack_status"], "READY_FOR_IMPLEMENTATION_NOT_LIVE")
        self.assertEqual(
            decision["question_ids"],
            [
                "user_problem",
                "user_visible_outcome",
                "business_value",
                "success_metric",
                "countermetrics",
                "not_now",
            ],
        )
        self.assertEqual(decision["input_hash"], digest)
        chat = decision["chat_request"]
        self.assertEqual(chat["provider"], "openrouter")
        self.assertEqual(chat["api"], "openai-completions")
        self.assertEqual(chat["method"], "POST")
        self.assertEqual(chat["url"], "https://openrouter.ai/api/v1/chat/completions")
        body = chat["body"]
        self.assertEqual(set(body), {"model", "max_tokens", "messages"})
        self.assertEqual(body["model"], "anthropic/claude-haiku-4-5")
        self.assertEqual(body["max_tokens"], 1024)
        self.assertEqual(
            body["messages"],
            [{"role": "user", "content": text} for text in questions],
        )
        self.assertFalse(decision["abstain"])
        self.assertEqual(decision["confidence_band"], "C0")
        self.assertEqual(decision["recommended_mode"], "SHADOW")
        receipt = json.dumps(decision)
        lowered = receipt.lower()
        self.assertNotIn("api_key", lowered)
        self.assertNotIn("authorization", lowered)
        self.assertNotIn("bearer", lowered)
        self.assertNotIn("sk-", lowered)
        abstained = judgment.evaluate({"verb": "select", "process_stage": "missing-stage"})
        self.assertEqual(abstained["action"], "NO_ACTION")
        self.assertTrue(abstained["abstain"])
        self.assertFalse(abstained["jev_called"])
        self.assertFalse(abstained["provider_call"])
        self.assertIsNone(abstained["provider"])
        self.assertEqual(abstained["question_ids"], [])

    def test_module_is_not_a_daemon_or_a_provider_client(self) -> None:
        text = (ENG / "judgment.py").read_text(encoding="utf-8")
        self.assertNotIn("threading", text)
        self.assertNotIn("while True", text)
        self.assertNotIn("typesafe", text.lower())
        self.assertNotIn("4018", text)
        self.assertNotIn("apps/scorpion", text)
        self.assertNotIn("runOpenAI", text)
        self.assertNotIn("api.openai.com", text)
        self.assertNotIn("openclaw", text.lower())


if __name__ == "__main__":
    unittest.main()
