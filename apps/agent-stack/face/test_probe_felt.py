#!/usr/bin/env python3
"""Grade the gold harness without a live Face turn."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load():
    import importlib.util

    path = HERE / "probe_felt.py"
    spec = importlib.util.spec_from_file_location("agent_stack_face_probe", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load probe")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class ProbeFeltTest(unittest.TestCase):
    def test_gold_file_has_twelve_rows(self) -> None:
        spec = MOD.load_gold()
        items = spec.get("items") or []
        self.assertGreaterEqual(len(items), 12)
        expects = [str(x.get("expect")) for x in items]
        self.assertEqual(expects.count("gold"), 8)
        self.assertEqual(expects.count("honest_empty"), 2)
        self.assertEqual(expects.count("general"), 2)

    def test_stale_locator_is_not_a_jarvis_fail(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            row = {"expect": "gold", "locator": "MISSING.md", "must_contain": "nope"}
            self.assertEqual(MOD.validate_gold_row(row, [root]), "GOLD_STALE")
            self.assertEqual(MOD.grade_gold(row, {"spoken": "anything"}, [root]), "GOLD_STALE")

    def test_gold_pass_needs_needle_and_cite(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "OPERATOR_MEMORY.md").write_text("protecting attention forever\n", encoding="utf-8")
            row = {
                "expect": "gold",
                "locator": "OPERATOR_MEMORY.md",
                "must_contain": "protecting attention",
            }
            self.assertEqual(MOD.validate_gold_row(row, [root]), "ok")
            out = {
                "spoken": "Sir. The north stars start with protecting attention.",
                "cites": [{"path": "OPERATOR_MEMORY.md"}],
                "outcome": "STORE_DIRECT",
            }
            self.assertEqual(MOD.grade_gold(row, out, [root]), "PASS")
            miss = {**out, "spoken": "Sir. Something else."}
            self.assertEqual(MOD.grade_gold(row, miss, [root]), "FAIL")
            comma = {
                **out,
                "spoken": "Sir. The north stars start with protecting, attention.",
            }
            self.assertEqual(MOD.grade_gold(row, comma, [root]), "PASS")

    def test_honest_empty_rejects_invention(self) -> None:
        self.assertEqual(
            MOD.grade_honest({"spoken": f"Sir. {MOD.HONEST_EMPTY}"}),
            "PASS",
        )
        self.assertEqual(
            MOD.grade_honest({"spoken": "Sir. Your quantum-turtle-invoices note says pay Friday."}),
            "FAIL",
        )

    def test_general_rejects_vault_cites(self) -> None:
        self.assertEqual(
            MOD.grade_general({"spoken": "Air scatters blue light.", "outcome": "MODEL_TALK", "cites": []}),
            "PASS",
        )
        self.assertEqual(
            MOD.grade_general(
                {
                    "spoken": "Air scatters blue light.",
                    "outcome": "MODEL_TALK",
                    "cites": [{"path": "CONTENT/VAULT_MAP.md"}],
                }
            ),
            "FAIL",
        )

    def test_format_row_names_live_vault(self) -> None:
        text = MOD.format_row(
            "probe",
            [{"id": "sky", "outcome": "MODEL_TALK", "brain_ms": 800}],
            {"pass": 8, "fail": 0, "stale": 0, "skip": 4, "n": 12},
            [Path.home() / "Documents/My_Billion_Dollar_Vault/00_Outer_Heaven"],
        )
        self.assertIn("live_vault", text)
        self.assertIn("gold 8/", text)

    def test_gold_summary_reports_three_suites_not_one_number(self) -> None:
        rows = (
            [{"grade": "PASS", "expect": "gold"}] * 8
            + [{"grade": "PASS", "expect": "honest_empty"}] * 2
            + [{"grade": "PASS", "expect": "general"}] * 2
        )
        gold = MOD.gold_summary(rows)
        self.assertEqual(gold["gold"], {"pass": 8, "n": 8})
        self.assertEqual(gold["honest"], {"pass": 2, "n": 2})
        self.assertEqual(gold["general"], {"pass": 2, "n": 2})
        text = MOD.format_row("probe", [], gold, [])
        self.assertIn("gold 8/8", text)
        self.assertIn("neg-controls 2/2 honest", text)
        self.assertIn("general 2/2 clean", text)
        self.assertNotIn("12/12", text)

    def test_tts_failure_detail_is_kept_not_a_pass(self) -> None:
        text = MOD.format_row(
            "probe",
            [
                {"id": "sky", "outcome": "MODEL_TALK", "brain_ms": 800, "tts_ok": False, "tts_error": "status=204"},
                {"id": "ping", "outcome": "MODEL_TALK", "brain_ms": 100, "tts_ok": True, "tts_ms": 900, "tts_bytes": 30764},
            ],
            {"pass": 0, "fail": 0, "stale": 0, "skip": 0, "n": 0},
            [],
        )
        self.assertIn("tts=FAIL(status=204)", text)
        self.assertIn("tts=900ms/30764B", text)

    def test_eyes_off_line_is_not_vision_proof(self) -> None:
        source = (Path(__file__).resolve().parent / "probe_felt.py").read_text(encoding="utf-8")
        self.assertIn("EYES_OFF_LINE", source)
        self.assertIn("UNPROVEN", source)


if __name__ == "__main__":
    unittest.main()
