#!/usr/bin/env python3
"""Calendar reads events. Never the count stub."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "macos_read.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_macos_read", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class MacosReadTest(unittest.TestCase):
    def setUp(self) -> None:
        MOD.clear_calendar_cache()

    def test_day_scope(self) -> None:
        self.assertEqual(MOD.day_scope("")[0], "Today")
        self.assertEqual(MOD.day_scope("what's tomorrow")[0], "Tomorrow")
        self.assertEqual(MOD.day_scope("what's tomorrow")[1], 1)

    def test_events_spoken(self) -> None:
        proc = mock.Mock(returncode=0, stdout="OK:9:00:00 AM Standup||1:00:00 PM Dentist\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            got = MOD.calendar_today(utterance="can you see my calendar")
        self.assertIn("Standup", got["spoken"])
        self.assertIn("Dentist", got["spoken"])
        self.assertNotIn("Name a day", got["spoken"])
        self.assertNotIn("calendars on this Mac", got["spoken"])

    def test_empty_day(self) -> None:
        proc = mock.Mock(returncode=0, stdout="EMPTY\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            got = MOD.calendar_today()
        self.assertIn("Nothing on", got["spoken"])
        self.assertEqual(got.get("state"), "empty")

    def test_source_has_no_count_stub(self) -> None:
        text = SCRIPT.read_text(encoding="utf-8")
        self.assertNotIn("Name a day if you want events", text)
        self.assertNotIn("count of calendars", text)

    def test_frontmost_app_live(self) -> None:
        proc = mock.Mock(returncode=0, stdout="OK:Cursor||pipeline.py — n8n-cursor\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            got = MOD.frontmost_app()
        self.assertTrue(got["ok"])
        self.assertEqual(got["app"], "Cursor")
        self.assertIn("pipeline.py", got["title"])

    def test_frontmost_app_deny_is_named(self) -> None:
        proc = mock.Mock(returncode=1, stdout="DENY:not allowed assistive access\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            got = MOD.frontmost_app()
        self.assertFalse(got["ok"])
        self.assertEqual(got.get("state"), "denied")
        self.assertEqual(got.get("app"), "")

    def test_run_kills_grandchildren_holding_pipes(self) -> None:
        """A killed child whose helper keeps stderr open must not hang _run."""
        import subprocess as sp
        import time

        start = time.monotonic()
        with self.assertRaises(sp.TimeoutExpired):
            MOD._run(["/bin/bash", "-c", "sleep 30 & sleep 30"], timeout=1.0)
        self.assertLess(time.monotonic() - start, 6.0)

    def test_frontmost_slow_is_named_not_a_hang(self) -> None:
        import subprocess as sp

        with mock.patch.object(MOD, "_run", side_effect=sp.TimeoutExpired(["osascript"], 4.0)):
            got = MOD.frontmost_app()
        self.assertFalse(got["ok"])
        self.assertEqual(got.get("state"), "slow")

    def test_calendar_timeout_is_honest_not_empty(self) -> None:
        import subprocess as sp

        with mock.patch.object(MOD, "_run", side_effect=sp.TimeoutExpired(["osascript"], 12.0)):
            got = MOD.calendar_today(utterance="what's on my calendar today")
        self.assertEqual(got.get("state"), "slow")
        self.assertIn("still opening", got["spoken"].lower())
        self.assertIn("today", got["spoken"].lower())
        self.assertNotIn("Nothing further", got["spoken"])
        self.assertNotIn("Name a day", got["spoken"])

    def test_calendar_cache_reuses_one_walk(self) -> None:
        proc = mock.Mock(returncode=0, stdout="OK:9:00:00 AM Standup\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc) as run:
            first = MOD.calendar_today(utterance="can you see my calendar")
            second = MOD.calendar_today(utterance="what's on my calendar today")
        self.assertEqual(run.call_count, 1)
        self.assertEqual(first.get("spoken"), second.get("spoken"))
        self.assertIn("Standup", second["spoken"])


if __name__ == "__main__":
    unittest.main()
