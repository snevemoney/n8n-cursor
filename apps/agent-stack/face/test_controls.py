#!/usr/bin/env python3
"""Scoped Mic/Stop/Hide. Stop does not cancel unrelated work."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import threading
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONTROLS_PATH = ROOT / "controls.py"
PANE = ROOT / "pane.html"
SERVE = ROOT / "serve.py"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


CONTROLS = _load("agent_stack_controls_test", CONTROLS_PATH)


def _slice(html: str, start: str, end: str) -> str:
    begin = html.index(start)
    return html[begin:html.index(end, begin)]


class ScopedStopTest(unittest.TestCase):
    def setUp(self) -> None:
        CONTROLS.reset_book()
        self.calls: list[str] = []
        CONTROLS.set_killer(lambda tool_id: self.calls.append(tool_id) or True)

    def tearDown(self) -> None:
        CONTROLS.set_killer(None)
        CONTROLS.reset_book()

    def _hive(self) -> Path:
        tmp = tempfile.TemporaryDirectory(prefix="face-controls-")
        self.addCleanup(tmp.cleanup)
        hive = Path(tmp.name)
        (hive / "bus").mkdir(parents=True)
        bus = {
            "job_status": "working",
            "phase": "think",
            "active_tool": "cursor",
            "tool_owner_job": "job-a",
            "jobs": {
                "job-a": {"mission": "m1", "status": "working"},
                "job-b": {"mission": "m2", "status": "working"},
            },
        }
        (hive / "bus" / "state.json").write_text(json.dumps(bus), encoding="utf-8")
        return hive

    def test_speak_leaves_jobs_and_tool(self) -> None:
        hive = self._hive()
        out = CONTROLS.cancel_once("speak", "", hive=hive)
        self.assertEqual(out["scope"], "speak")
        self.assertIn("Stopped", out["spoken"])
        self.assertFalse(out["killed"])
        self.assertEqual(self.calls, [])
        bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertEqual(bus["job_status"], "working")
        self.assertEqual(bus["jobs"]["job-a"]["status"], "working")
        self.assertEqual(bus["jobs"]["job-b"]["status"], "working")
        self.assertEqual(bus["speak"], "stopped")

    def test_tool_is_exactly_once_and_skips_jobs(self) -> None:
        hive = self._hive()
        first = CONTROLS.cancel_once("tool", "cursor", hive=hive)
        second = CONTROLS.cancel_once("tool", "cursor", hive=hive)
        self.assertTrue(first["killed"])
        self.assertEqual(first["cancel_id"], second["cancel_id"])
        self.assertTrue(second["already"])
        self.assertFalse(second["killed"])
        self.assertEqual(self.calls, ["cursor"])
        bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertEqual(bus["jobs"]["job-a"]["status"], "working")
        self.assertEqual(bus["jobs"]["job-b"]["status"], "working")

    def test_one_job_does_not_cancel_another(self) -> None:
        hive = self._hive()
        out = CONTROLS.cancel_once("job", "job-b", hive=hive)
        self.assertFalse(out["killed"])
        self.assertEqual(self.calls, [])
        self.assertEqual(out["jobs"]["job-b"], "cancelled")
        self.assertEqual(out["jobs"]["job-a"], "working")

    def test_mission_does_not_take_the_other_mission_tool(self) -> None:
        hive = self._hive()
        out = CONTROLS.cancel_once("mission", "m2", hive=hive)
        self.assertFalse(out["killed"])
        self.assertEqual(self.calls, [])
        self.assertEqual(out["jobs"]["job-b"], "cancelled")
        self.assertEqual(out["jobs"]["job-a"], "working")
        again = CONTROLS.cancel_once("mission", "m2", hive=hive)
        self.assertTrue(again["already"])
        self.assertEqual(again["cancel_id"], out["cancel_id"])

    def test_owning_job_kills_its_tool_once(self) -> None:
        hive = self._hive()
        first = CONTROLS.cancel_once("job", "job-a", hive=hive)
        second = CONTROLS.cancel_once("tool", "cursor", hive=hive)
        self.assertTrue(first["killed"])
        self.assertFalse(second["killed"])
        self.assertEqual(self.calls, ["cursor"])
        self.assertEqual(first["jobs"]["job-b"], "working")

    def test_overlapping_tool_cancels_share_one_receipt(self) -> None:
        hive = self._hive()

        def killer(tool_id: str) -> bool:
            self.calls.append(tool_id)
            time.sleep(0.02)
            return True

        CONTROLS.set_killer(killer)
        for _ in range(40):
            CONTROLS.reset_book()
            self.calls.clear()
            CONTROLS.set_killer(killer)
            results: list[dict] = []
            gate = threading.Lock()

            def run() -> None:
                out = CONTROLS.cancel_once("tool", "", hive=hive)
                with gate:
                    results.append(out)

            threads = [threading.Thread(target=run), threading.Thread(target=run)]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join()
            self.assertEqual(len(results), 2)
            self.assertEqual({row["cancel_id"] for row in results}, {results[0]["cancel_id"]})
            self.assertEqual(sorted(bool(row["already"]) for row in results), [False, True])
            self.assertEqual(self.calls, ["cursor"])
            self.assertEqual(sum(1 for row in results if row["killed"]), 1)


class FaceControlPresentationTest(unittest.TestCase):
    def test_mic_uses_existing_conversational_input(self) -> None:
        html = PANE.read_text(encoding="utf-8")
        mic = _slice(html, "function pressMic()", "function stopScope(")
        self.assertIn("armMic()", mic)
        self.assertIn('$("typed")', mic)
        self.assertNotIn("/api/stop", mic)
        self.assertNotIn("fetch(", mic)

    def test_stop_button_is_speak_only(self) -> None:
        html = PANE.read_text(encoding="utf-8")
        stop = _slice(html, "function pressStop()", "function hidePresentation()")
        self.assertIn("stopSpeakingOnly()", stop)
        self.assertIn('{ scope: "speak", target: "mouth" }', stop)
        self.assertNotIn("stopListen", stop)
        self.assertNotIn("turnAbort", stop)
        self.assertIn("speakHeld = true", html)
        self.assertIn("if (speakHeld || !text) return", html)

    def test_hide_is_presentation_only(self) -> None:
        html = PANE.read_text(encoding="utf-8")
        hide = _slice(html, "function hidePresentation()", "function pressMic()")
        self.assertIn("presentation-hidden", hide)
        self.assertNotIn("fetch", hide)
        self.assertNotIn("/api/", hide)
        self.assertNotIn("stopListen", hide)
        self.assertNotIn("armMic", hide)
        self.assertNotIn("clearInterval", hide)
        serve = SERVE.read_text(encoding="utf-8")
        self.assertNotIn("cancel_cursor", serve)
        self.assertEqual(serve.count("live_mouth.cancel_scoped"), 2)


if __name__ == "__main__":
    unittest.main()
