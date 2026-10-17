#!/usr/bin/env python3
"""Door tests. Pipeline is the thinker. No classify-as-brain."""
from __future__ import annotations

import importlib.util
import os
import json
from unittest.mock import patch
import tempfile
import unittest
from pathlib import Path

os.environ["AGENT_STACK_DRY_TTS"] = "1"
SCRIPT = Path(__file__).resolve().parent / "turn.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_mouth", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class MouthDoorTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_no_classify_brain_or_canned(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("def classify(", text)
        self.assertNotIn("capabilities_spoken", text)
        self.assertNotIn("May I hand this to the", text)
        self.assertNotIn("prompt[:4000]", text)
        self.assertIn("PIPELINE.apply_pipeline_iter", text)

    def test_stop_and_empty_are_local(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-door-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            empty = MOD.apply_turn("", hive=hive)
            (hive / "bus" / "state.json").write_text(
                '{"schema_version":1,"watch":{"armed":true}}\n',
                encoding="utf-8",
            )
            empty = MOD.apply_turn("", hive=hive)
            stop = MOD.apply_turn("stop", hive=hive)
            bus = (hive / "bus" / "state.json").read_text(encoding="utf-8")
        self.assertEqual(empty["verb"], "idle")
        self.assertEqual(stop["verb"], "stop")
        self.assertIn("Stopped", stop["spoken"])
        self.assertIn('"armed": false', bus)
        self.assertIn("cancel_turn", SCRIPT.read_text(encoding="utf-8"))
        self.assertIn("cancel_tts", SCRIPT.read_text(encoding="utf-8"))

    def test_desktop_off_action_does_not_fall_through_to_conversation(self) -> None:
        for utterance in ("please type this into the window",):  # a named click goes to the Z02 confirm-gated hand (below)
            with self.subTest(utterance=utterance), tempfile.TemporaryDirectory(prefix="desktop-off-") as tmp:
                hive = Path(tmp)
                (hive / "bus").mkdir()
                (hive / "bus" / "state.json").write_text(json.dumps({"watch": {"armed": False}}))
                with patch.object(MOD.PIPELINE, "apply_pipeline_iter", side_effect=AssertionError("action fell through into conversation")):
                    out = MOD.apply_turn(utterance, hive=hive)
                self.assertFalse(out["ok"])
                self.assertEqual(out["execution"]["reason"], "desktop_not_armed")
                self.assertFalse(MOD.load_json(hive / "bus" / "state.json")["watch"]["armed"])

    def test_desktop_off_named_click_is_confirm_gated_pointer(self) -> None:
        with tempfile.TemporaryDirectory(prefix="desktop-off-click-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "bus" / "state.json").write_text(json.dumps({"watch": {"armed": False}}))
            with patch.object(MOD.PIPELINE, "apply_pipeline_iter", side_effect=AssertionError("action fell through into conversation")):
                out = MOD.apply_turn("click the Calculator button", hive=hive)
            self.assertNotIn("Clicked", out.get("spoken") or "")  # never clicks without a confirm (and never outside the live Face)

    def test_door_terminal_replaces_previous_response_evidence(self) -> None:
        with tempfile.TemporaryDirectory(prefix="door-evidence-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "bus" / "state.json").write_text(json.dumps({"response_ok": True, "response_ok_gen": 3, "response_see": {"ok": True}, "response_see_gen": 3}))
            gen = MOD.PIPELINE.begin_turn(hive)
            receipt = {"ok": False, "reason": "desktop_not_armed"}
            result = MOD._door_speak(hive, "click", "Desktop off.", "watch", gen=gen, execution=receipt)
            bus = MOD.load_json(hive / "bus" / "state.json")
            self.assertEqual(bus["response_ok_gen"], gen)
            self.assertEqual(bus["response_ok"], result["ok"])
            self.assertNotIn("response_see", bus)
            self.assertNotIn("response_see_gen", bus)

    def test_watch_failure_survives_terminal_delivery(self) -> None:
        receipt = {"ok": False, "spoken": "Postcondition failed.", "stroke": {"ok": False, "why": "verification_failed"}}
        with tempfile.TemporaryDirectory(prefix="watch-delivery-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "bus" / "state.json").write_text(json.dumps({"watch": {"armed": True}}))
            with patch.object(MOD.PIPELINE, "watch_owns_turn", return_value=True), patch.object(MOD.PIPELINE, "run_watch_loop", return_value=receipt):
                out = MOD.apply_turn("click next", hive=hive)
            self.assertFalse(out["ok"])
            self.assertEqual(out["execution"], receipt)
            bus = MOD.load_json(hive / "bus" / "state.json")
            self.assertEqual(bus["execution"], receipt)
            winner = MOD._door_speak(hive, "click next", "Late success", "watch", gen=out["gen"], execution={"ok": True})
            self.assertFalse(winner["ok"])
            self.assertEqual(winner["execution"], receipt)
            token = MOD.PIPELINE.begin_turn(hive)
            following = MOD._door_speak(hive, "hello", "Hello", "converse", gen=token)
            self.assertTrue(following["ok"])
            self.assertNotIn("execution", following)
            self.assertNotIn("execution", MOD.load_json(hive / "bus" / "state.json"))

    def test_transition_only_receipt_is_not_terminal_task_success(self) -> None:
        receipt = {"ok": True, "stroke": {"ok": True, "verification": {"scope": "observed_transition", "task_verified": False}}}
        with tempfile.TemporaryDirectory(prefix="watch-terminal-proof-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = MOD.PIPELINE.begin_turn(hive)
            result = MOD._door_speak(hive, "save file", "Task not verified.", "watch", gen=gen, execution=receipt)
            self.assertFalse(result["ok"])
            self.assertFalse(result["task_verified"])
            self.assertEqual(result["execution"], receipt)

    def test_legacy_or_malformed_action_proof_does_not_promote_success(self) -> None:
        for stroke in ({"ok": True}, {"ok": True, "verification": {}}, {"ok": True, "verification": {"task_verified": "true"}}, {"ok": True, "verification": {"task_verified": True}}, None):
            with self.subTest(stroke=stroke):
                receipt = {"ok": True, "stroke": stroke}
                result = MOD.apply_execution_receipt({}, receipt)
                self.assertFalse(result["ok"])
                self.assertFalse(result["task_verified"])
                self.assertEqual(result["execution"], receipt)

    def test_no_ollama_runtime(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("import ollama", text)
        self.assertNotIn("11434", text)

    def test_drop_door_is_identity_only(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertIn("what file", text)
        self.assertIn("which file", text)
        self.assertIn("what did i (?:just )?drop", text)
        self.assertNotIn("that file|the file|which file", text)

    def test_no_truncated_prompt_slice(self) -> None:
        online = (SCRIPT.parent.parent / "brain" / "online.py").read_text(encoding="utf-8")
        pipe = (SCRIPT.parent.parent / "brain" / "pipeline.py").read_text(encoding="utf-8")
        self.assertNotIn("strip()[:4000]", online)
        self.assertNotIn("strip()[:4000]", pipe)
        self.assertIn("argv.append((prompt or \"\").strip())", online)




class PipelineStatusDeliveryTest(unittest.TestCase):
    def test_pipeline_failure_status_is_preserved(self):
        for ok in (False, True):
            with self.subTest(ok=ok), tempfile.TemporaryDirectory() as tmp:
                hive = Path(tmp)
                (hive / 'bus').mkdir()
                source = {'ok': ok, 'spoken': 'Navigation not verified.' if not ok else 'URL verified.', 'tool': 'safari_see', 'done': True, 'see': {'ok': ok, 'verification': {'scope': 'navigation_url', 'passed': ok}}}
                with patch.object(MOD.PIPELINE, 'apply_pipeline_iter', return_value=iter([source])):
                    events = list(MOD.apply_turn_iter('open https://example.test in safari', hive=hive))
                self.assertEqual(events[-1]['ok'], ok)
                self.assertEqual(events[-1]['see'], source['see'])


if __name__ == "__main__":
    unittest.main()
