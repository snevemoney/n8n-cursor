#!/usr/bin/env python3
"""Door tests. Pipeline is the thinker. No classify-as-brain."""
from __future__ import annotations

import importlib.util
import json
import os
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

    def test_watch_utterance_is_a_real_watch_and_chat_is_not(self) -> None:
        def fake_cursor(prompt: str, mode: str = "ask", **kwargs):
            _ = (prompt, mode, kwargs)
            return {"tool": "converse", "args": {}, "speak": "The hive is quiet today."}

        with tempfile.TemporaryDirectory(prefix="agent-stack-watch-door-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            events = hive / "bus" / "events.jsonl"
            chat = MOD.apply_turn("What can you do?", hive=hive, cursor_fn=fake_cursor)
            self.assertNotEqual(chat.get("verb"), "watch")
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            self.assertNotIn("watches", bus)
            made = MOD.apply_turn(
                "Watch the local test value and tell me when it changes.",
                hive=hive,
                cursor_fn=fake_cursor,
            )
            self.assertEqual(made.get("verb"), "watch")
            self.assertIn("Watching", made.get("spoken") or "")
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            watch = bus["watch"]
            self.assertTrue(watch["active"])
            self.assertEqual(watch["current_state"], "A")
            self.assertTrue((hive / "bus" / "receipts.jsonl").is_file())
            MOD.CONTROLS.set_local_test_value(hive, "B")
            noticed = MOD.CONTROLS.observe_once(hive, event_path=events)
            self.assertEqual(noticed["spoken"], "B")
            again = MOD.CONTROLS.observe_once(hive, event_path=events)
            self.assertFalse(again["notified"])
            status = MOD.apply_turn("What is the watch status?", hive=hive, cursor_fn=fake_cursor)
            self.assertEqual(status.get("verb"), "watch_status")
            self.assertIn("active", (status.get("spoken") or "").lower())
            stopped = MOD.apply_turn("stop", hive=hive, cursor_fn=fake_cursor)
            self.assertEqual(stopped.get("verb"), "stop")
            self.assertIn("Stopped", stopped.get("spoken") or "")
            self.assertFalse(MOD.CONTROLS.watch_status(hive)["active"])
            later = MOD.apply_turn("what's on my watch later", hive=hive, see_fn=lambda text: {
                "ok": True,
                "spoken": "Watch Later is open",
                "wire": "safari_see",
            })
            self.assertNotEqual(later.get("verb"), "watch")
            self.assertEqual(len(MOD.CONTROLS._watches(json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8")))), 1)

    def test_stop_and_empty_are_local(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-door-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            empty = MOD.apply_turn("", hive=hive)
            stop = MOD.apply_turn("stop", hive=hive)
        self.assertEqual(empty["verb"], "idle")
        self.assertEqual(stop["verb"], "stop")
        self.assertIn("Stopped", stop["spoken"])

    def test_no_ollama_runtime(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("import ollama", text)
        self.assertNotIn("11434", text)

    def test_no_truncated_prompt_slice(self) -> None:
        online = (SCRIPT.parent.parent / "brain" / "online.py").read_text(encoding="utf-8")
        pipe = (SCRIPT.parent.parent / "brain" / "pipeline.py").read_text(encoding="utf-8")
        self.assertNotIn("strip()[:4000]", online)
        self.assertNotIn("strip()[:4000]", pipe)
        self.assertIn("argv.append((prompt or \"\").strip())", online)


if __name__ == "__main__":
    unittest.main()
