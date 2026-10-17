#!/usr/bin/env python3
"""Focus sessions: lock one app, count drift, speak the score. Jarvis V6 port."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_pipeline_focus", HERE / "pipeline.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load pipeline.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


PIPE = _load()


def _front(app: str, title: str = "", state: str = "live", ok: bool = True):
    def fn():
        return {"ok": ok, "state": state, "app": app, "title": title}

    return fn


class FocusRegexTest(unittest.TestCase):
    def test_wants_focus_minutes(self) -> None:
        self.assertEqual(PIPE.wants_focus("focus"), PIPE.FOCUS_DEFAULT_MIN)
        self.assertEqual(PIPE.wants_focus("Focus 25"), 25)
        self.assertEqual(PIPE.wants_focus("jarvis, focus for 45 minutes"), 45)
        self.assertEqual(PIPE.wants_focus("lock in"), PIPE.FOCUS_DEFAULT_MIN)
        self.assertIsNone(PIPE.wants_focus("focus on what matters in life"))
        self.assertIsNone(PIPE.wants_focus("what should we focus on next?"))

    def test_wants_stand_down(self) -> None:
        self.assertTrue(PIPE.wants_stand_down("stand down"))
        self.assertTrue(PIPE.wants_stand_down("Jarvis, end the focus session"))
        self.assertTrue(PIPE.wants_stand_down("focus off"))
        self.assertFalse(PIPE.wants_stand_down("stand down the army of agents please"))

    def test_wants_relief(self) -> None:
        self.assertTrue(PIPE.wants_relief("give me a minute"))
        self.assertTrue(PIPE.wants_relief("Jarvis I need to do something important"))
        self.assertTrue(PIPE.wants_relief("hold the nudges"))
        self.assertFalse(PIPE.wants_relief("what is a minute of arc?"))


class FocusSessionTest(unittest.TestCase):
    def _hive(self, tmp: str) -> Path:
        hive = Path(tmp)
        (hive / "bus").mkdir(parents=True)
        return hive

    def test_arm_locks_frontmost(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-arm-") as tmp:
            hive = self._hive(tmp)
            got = PIPE.focus_arm(hive, minutes=30, front_fn=_front("Cursor", "pipeline.py"))
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertTrue(got["ok"])
        self.assertIn("Locked on Cursor", got["spoken"])
        self.assertIn("30 minutes on the clock", got["spoken"])
        self.assertTrue(bus["focus"]["armed"])
        self.assertEqual(bus["focus"]["target_app"], "Cursor")

    def test_arm_refuses_when_screen_dark(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-dark-") as tmp:
            hive = self._hive(tmp)
            got = PIPE.focus_arm(hive, front_fn=_front("", state="denied", ok=False))
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8")) if (hive / "bus" / "state.json").is_file() else {}
        self.assertFalse(got["ok"])
        self.assertFalse((bus.get("focus") or {}).get("armed"))

    def test_tick_counts_drift_once_per_episode_and_scores_on_target(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-tick-") as tmp:
            hive = self._hive(tmp)
            PIPE.focus_arm(hive, minutes=30, front_fn=_front("Cursor"))
            on = PIPE.focus_tick(hive, front_fn=_front("Cursor"))
            drift1 = PIPE.focus_tick(hive, front_fn=_front("Safari"))
            drift_same = PIPE.focus_tick(hive, front_fn=_front("Safari"))
            back = PIPE.focus_tick(hive, front_fn=_front("Cursor"))
            drift2 = PIPE.focus_tick(hive, front_fn=_front("Slack"))
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertIsNone(on)
        self.assertIn("Drift 1", (drift1 or {}).get("callout") or "")
        self.assertIsNone(drift_same)
        self.assertIsNone(back)
        self.assertIn("Drift 2", (drift2 or {}).get("callout") or "")
        self.assertEqual(bus["focus"]["drifts"], 2)
        self.assertGreater(bus["focus"]["on_target_sec"], 0)

    def test_assist_offers_help_only_in_enabled_apps_when_the_window_shows_trouble(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-assist-") as tmp:
            hive = self._hive(tmp)
            PIPE.focus_arm(hive, minutes=30, front_fn=_front("Xcode"))
            PIPE.mutate_bus(hive, lambda b: {**b, "watch": {"allow": ["Xcode"]}})
            calm = PIPE.focus_tick(hive, front_fn=_front("Xcode", "Jarvis — main.swift"), now=None)
            offer = PIPE.focus_tick(hive, front_fn=_front("Xcode", "Build Failed — 3 errors"))
            again = PIPE.focus_tick(hive, front_fn=_front("Xcode", "Build Failed — 3 errors"))
            PIPE.focus_arm(hive, minutes=30, front_fn=_front("Terminal"))
            other = PIPE.focus_tick(hive, front_fn=_front("Terminal", "zsh — Traceback (most recent call last)"))
        self.assertIsNone(calm)
        self.assertIn("Build Failed", (offer or {}).get("callout") or "")
        self.assertIn("Want me to take a look", (offer or {}).get("callout") or "")
        self.assertIsNone(again)
        self.assertIsNone(other)  # Terminal was never enabled for watching

    def test_relief_holds_the_callout_but_counts_the_drift(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-relief-") as tmp:
            hive = self._hive(tmp)
            PIPE.focus_arm(hive, minutes=30, front_fn=_front("Cursor"))
            got = PIPE.focus_relief(hive)
            drift = PIPE.focus_tick(hive, front_fn=_front("Safari"))
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertIn("Nudges held", got["spoken"])
        self.assertIsNone(drift)
        self.assertEqual(bus["focus"]["drifts"], 1)

    def test_timer_end_speaks_the_score_and_disarms(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-end-") as tmp:
            hive = self._hive(tmp)
            PIPE.focus_arm(hive, minutes=1, front_fn=_front("Cursor"))
            bus0 = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            late = float(bus0["focus"]["started_ts"]) + 61
            done = PIPE.focus_tick(hive, front_fn=_front("Cursor"), now=late)
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertTrue((done or {}).get("done"))
        self.assertIn("Standing down, sir.", (done or {}).get("callout") or "")
        self.assertFalse(bus["focus"]["armed"])

    def test_stand_down_line_is_the_score(self) -> None:
        with tempfile.TemporaryDirectory(prefix="focus-score-") as tmp:
            hive = self._hive(tmp)
            PIPE.focus_arm(hive, minutes=30, front_fn=_front("Cursor"))
            PIPE.focus_tick(hive, front_fn=_front("Safari"))
            got = PIPE.focus_stand_down(hive)
            again = PIPE.focus_stand_down(hive)
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertIn("Standing down, sir.", got["spoken"])
        self.assertIn("of 30 minutes on target", got["spoken"])
        self.assertIn("1 drift", got["spoken"])
        self.assertEqual(again["spoken"], "No focus session running, sir.")
        self.assertFalse(bus["focus"]["armed"])

    def test_stillness_is_not_absence_no_drift_no_callout(self) -> None:
        """Codex repro: sitting still must never earn a 'You left' nudge."""
        with tempfile.TemporaryDirectory(prefix="focus-still-") as tmp:
            hive = self._hive(tmp)
            PIPE.focus_arm(hive, minutes=30, front_fn=_front("Cursor"))

            def eyes_still(bus: dict) -> dict:
                bus["eyes"] = {"active": True, "motion": False, "motion_ts": 1.0}
                return bus

            PIPE.mutate_bus(hive, eyes_still)
            got = PIPE.focus_tick(hive, front_fn=_front("Cursor"), now=100.0)
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertIsNone(got)
        self.assertEqual(bus["focus"]["drifts"], 0)
        source = (HERE / "pipeline.py").read_text(encoding="utf-8")
        self.assertNotIn("You left, sir", source)

    def test_orb_click_never_self_locks(self) -> None:
        """Codex repro: arming from the Orb waits for the first real app,
        and glancing back at the Orb is neither on-target nor a drift."""
        with tempfile.TemporaryDirectory(prefix="focus-self-") as tmp:
            hive = self._hive(tmp)
            armed = PIPE.focus_arm(hive, front_fn=_front("JarvisOrb", "Jarvis Orb"))
            lock = PIPE.focus_tick(hive, front_fn=_front("Cursor", "Actual work"))
            on = PIPE.focus_tick(hive, front_fn=_front("Cursor"))
            orb_glance = PIPE.focus_tick(hive, front_fn=_front("JarvisOrb"))
            drift = PIPE.focus_tick(hive, front_fn=_front("Safari"))
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertTrue(armed["ok"])
        self.assertIn("Go to your work", armed["spoken"])
        self.assertNotIn("JarvisOrb", armed["spoken"])
        self.assertIn("Locked on Cursor", (lock or {}).get("callout") or "")
        self.assertIsNone(on)
        self.assertIsNone(orb_glance)
        self.assertIn("Drift 1", (drift or {}).get("callout") or "")
        self.assertEqual(bus["focus"]["target_app"], "Cursor")
        self.assertEqual(bus["focus"]["drifts"], 1)

    def test_routing_controls_stay_deterministic(self) -> None:
        """The live general control moved to a neutral noun; the Grok Bot
        routing stays pinned here where model tool-choice cannot flap it."""
        self.assertEqual(PIPE.evidence_requirement("What is Grok Bot?"), PIPE.EVIDENCE_GENERAL)
        self.assertEqual(PIPE.evidence_requirement("What is a spreadsheet?"), PIPE.EVIDENCE_GENERAL)
        self.assertEqual(PIPE.evidence_requirement("What is a token?"), PIPE.EVIDENCE_GENERAL)
        self.assertEqual(PIPE.evidence_requirement("What is a musical note?"), PIPE.EVIDENCE_GENERAL)
        self.assertEqual(PIPE.evidence_requirement("What is a North Star?"), PIPE.EVIDENCE_GENERAL)
        self.assertFalse(PIPE.is_hard_step("How does an airline book a seat?"))
        self.assertFalse(PIPE.is_hard_step("Why do people publish this kind of story?"))
        self.assertTrue(PIPE.is_hard_step("book me a table for two"))
        self.assertTrue(PIPE.is_hard_step("publish this now"))

    def test_turn_doors_are_wired(self) -> None:
        text = (HERE.parent / "mouth" / "turn.py").read_text(encoding="utf-8")
        self.assertIn("wants_stand_down", text)
        self.assertIn("wants_relief", text)
        self.assertIn("wants_focus", text)
        self.assertIn("focus_arm", text)
        serve = (HERE.parent / "face" / "serve.py").read_text(encoding="utf-8")
        self.assertIn("/api/focus", serve)
        self.assertIn("_focus_pump", serve)
        self.assertIn("notes_indexed", serve)
        self.assertIn("_eyes_motion", serve)
        self.assertIn("cancel_turn_scoped", serve)


if __name__ == "__main__":
    unittest.main()
