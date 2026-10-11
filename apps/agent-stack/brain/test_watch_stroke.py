#!/usr/bin/env python3
"""Bite 4: commit_watch_stroke. Dry only. No Watch click. Not a copy of test_watch_frame."""
from __future__ import annotations

import base64
import hashlib
import importlib.util
import json
import os
import tempfile
import threading
import unittest
from pathlib import Path

TURN = Path(__file__).resolve().parent.parent / "mouth" / "turn.py"
FRAME_SRC = Path(__file__).resolve().parent.parent / "hands" / "watch_frame.py"
PIPE_SRC = Path(__file__).resolve().parent / "pipeline.py"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOUTH = _load("agent_stack_mouth_watch_stroke", TURN)
PIPE = MOUTH.PIPELINE
SENSES = PIPE.SENSES
SEE = PIPE.SEE
FRAME = PIPE.FRAME if PIPE.FRAME is not None else _load("agent_stack_watch_stroke_frame", FRAME_SRC)


def _bus(hive: Path) -> dict:
    path = hive / "bus" / "state.json"
    if not path.is_file():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _arm(hive: Path) -> int:
    gen = PIPE.begin_turn(hive)
    out = SENSES.set_watch_arm(True, hive=hive, gen=gen, evens=True)
    if not out.get("armed"):
        raise AssertionError(f"Evens arm failed: {out}")
    if hasattr(SENSES, "set_watch_allow"):
        SENSES.set_watch_allow("*", always=True, hive=hive, gen=gen)
    return gen


def _snap(seed: str, title: str, url: str) -> dict:
    row=FRAME.stamp_dry(seed=seed, safari={"title": title, "url": url}, app="Safari")
    row['state']['focus']={'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}
    row['state']['text_binding']={'value_sha256':hashlib.sha256(b'AB').hexdigest(),'selection':{'location':1,'length':0}}
    return row


def _queue(rows: list[dict]):
    n = {"i": 0}

    def perceive(**kw):
        _ = kw
        row = rows[min(n["i"], len(rows) - 1)]
        n["i"] += 1
        return row

    return perceive


class WatchStrokeTest(unittest.TestCase):
    def setUp(self) -> None:
        os.environ["AGENT_STACK_DRY_WATCH"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        os.environ["AGENT_STACK_DRY_MAC"] = "1"
        os.environ.pop("AGENT_STACK_DRY_FRAME", None)
        self.clicks: list = []
        self._real_act = SEE.mac_act

        def wrap_act(op, *args, **kw):
            out = self._real_act(op, *args, **kw)
            if out.get("ok") and str(op or "") == "click":
                self.clicks.append((kw.get("x"), kw.get("y")))
            return out

        SEE.mac_act = wrap_act
        SEE.BEFORE_HID = None
        SENSES.BEFORE_SAVE_EYES = None

    def tearDown(self) -> None:
        SEE.mac_act = self._real_act
        SEE.BEFORE_HID = None
        SENSES.BEFORE_SAVE_EYES = None
        os.environ.pop("AGENT_STACK_DRY_WATCH", None)
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        os.environ.pop("AGENT_STACK_DRY_MAC", None)
        os.environ.pop("AGENT_STACK_DRY_FRAME", None)

    def _healthy_ping(self, hive: Path) -> None:
        self.assertFalse(_bus(hive).get("watch", {}).get("armed"))
        gen = PIPE.begin_turn(hive)
        PIPE.write_bus(hive, phase="speak", job_status="done", utterance="ping", spoken="Pong.", gen=gen)
        self.assertEqual(_bus(hive).get("spoken"), "Pong.")
        self.assertEqual(_bus(hive).get("job_status"), "done")

    def _hid_ok(self, action, hive=None, gen=None):
        _ = (hive, gen)
        self.clicks.append((action.get("x"), action.get("y")))
        return {"ok": True, "spoken": "clicked", "op": "click", "wire": "mac_act"}

    def _hid_fail(self, action, hive=None, gen=None):
        _ = (hive, gen, action)
        return {"ok": False, "spoken": "UNKNOWN. Mouse click is dark.", "op": "fail", "wire": "mac_act"}

    def _real_hid(self, action, hive=None, gen=None):
        return SEE.mac_act(
            str(action.get("op") or "click"),
            x=action.get("x"),
            y=action.get("y"),
            hive=hive,
            gen=gen,
        )

    def _stroke(self, hive, gen, derived, action, perceive, hid_fn=None, utterance="click next"):
        return FRAME.commit_watch_stroke(
            hive,
            gen,
            derived,
            action,
            perceive=perceive,
            hid_fn=hid_fn if hid_fn is not None else self._hid_ok,
            utterance=utterance,
        )

    def _recover_same_coords_once(self, hive: Path, title: str, url: str) -> None:
        self.clicks.clear()
        gen = _arm(hive)
        derived = _snap("live", title, url)
        after = _snap("after", "Next", "https://next.example")
        got = self._stroke(
            hive,
            gen,
            derived,
            {"op": "click", "x": 0.2, "y": 0.8, "label": "next"},
            _queue([derived, after]),
        )
        self.assertTrue(got.get("hid"), got)
        self.assertEqual(self.clicks, [(0.2, 0.8)])
        again = self._stroke(
            hive,
            gen,
            derived,
            {"op": "click", "x": 0.2, "y": 0.8, "label": "next"},
            _queue([derived]),
        )
        self.assertTrue(again.get("ledger"), again)
        self.assertEqual(self.clicks, [(0.2, 0.8)])
        PIPE.cancel_turn(hive)
        self._healthy_ping(hive)

    def test_missing_frame_id_is_deny(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-miss-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = {"state": {"title": "Hive", "url": "https://a.example", "app": "Safari", "window": "Hive"}}
            got = self._stroke(
                hive,
                gen,
                derived,
                {"op": "click", "x": 0.2, "y": 0.8, "label": "next"},
                _queue([derived]),
            )
            self.assertTrue(got.get("denied"), got)
            self.assertFalse(got.get("hid"))
            self.assertEqual(self.clicks, [])
            self.assertIn("frame stamp", (got.get("spoken") or "").lower())
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)
            self._recover_same_coords_once(hive, "Inbox", "https://inbox.example")

    def test_hard_step_click_coords_refuse(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-hard-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = _snap("hard", "Mail", "https://mail.example")
            for utterance in ("click send", "click the blue button"):
                self.clicks.clear()
                got = self._stroke(
                    hive,
                    gen,
                    derived,
                    {"op": "click", "x": 0.2, "y": 0.8, "label": "next"},
                    _queue([derived]),
                    utterance=utterance,
                )
                self.assertTrue(got.get("denied"), (utterance, got))
                self.assertEqual(got.get("op"), "hard")
                self.assertFalse(got.get("hid"))
                self.assertEqual(self.clicks, [])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)
            self._recover_same_coords_once(hive, "Drafts", "https://drafts.example")

    def test_recovery_new_state_same_coords_then_refuse(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-recover-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = _snap("old", "Old", "https://old.example")
            got = self._stroke(
                hive,
                gen,
                {**derived, "frame_id": ""},
                {"op": "click", "x": 0.2, "y": 0.8, "label": "next"},
                _queue([derived]),
            )
            self.assertTrue(got.get("denied"), got)
            self.assertEqual(self.clicks, [])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)
            self._recover_same_coords_once(hive, "New", "https://new.example")

    def test_double_send_same_surroundings_new_pixels(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-pixels-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            first = _snap("jpeg-a", "Compose", "https://mail.example")
            after = _snap("after-a", "Sent", "https://mail.example/sent")
            second = _snap("jpeg-b", "Compose", "https://mail.example")
            action = {"op": "click", "x": 0.2, "y": 0.8, "label": "post"}
            one = self._stroke(hive, gen, first, action, _queue([first, after]))
            self.assertTrue(one.get("hid"), one)
            self.assertEqual(self.clicks, [(0.2, 0.8)])
            two = self._stroke(hive, gen, second, action, _queue([second]))
            self.assertTrue(two.get("ledger"), two)
            self.assertFalse(two.get("hid"))
            self.assertEqual(self.clicks, [(0.2, 0.8)])
            self.assertIn("double-send", (two.get("spoken") or "").lower())
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)
            self._recover_same_coords_once(hive, "Later", "https://later.example")

    def test_missing_post_observation_is_not_verified_or_reclicked(self) -> None:
        for missing in ({}, None, {"ok": False, "spoken": "Observation unavailable."},
                        {**_snap("after", "Next", "https://next.example"), "ok": False}):
            with self.subTest(missing=missing), tempfile.TemporaryDirectory(prefix="watch-post-") as tmp:
                hive = Path(tmp)
                gen = _arm(hive)
                bound = _snap("bound", "Current", "https://current.example")
                action = {"op": "click", "x": 0.2, "y": 0.8, "label": "Next"}
                self.clicks.clear()
                got = self._stroke(hive, gen, bound, action, _queue([bound, missing]))
                self.assertFalse(got["ok"], got)
                self.assertTrue(got["hid"], got)
                self.assertTrue(got["ledger"], got)
                self.assertEqual(got["op"], "verify")
                again = self._stroke(hive, gen, bound, action, _queue([bound]))
                self.assertFalse(again["ok"], again)
                self.assertEqual(len(self.clicks), 1)

    def test_hid_internal_type_error_does_not_repeat_action(self) -> None:
        calls = []
        def driver(action=None, **kw):
            calls.append(action)
            raise TypeError("driver failed after emission")
        with self.assertRaisesRegex(TypeError, "driver failed"):
            FRAME._call_hid(driver, {"op": "click"}, Path("unused"), 1)
        self.assertEqual(len(calls), 1)

    def test_concurrent_same_state_strokes_emit_once(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-concurrent-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("bound", "Current", "https://current.example")
            action = {"op": "click", "x": 0.2, "y": 0.8, "label": "Next"}
            entered, release = threading.Event(), threading.Event()
            calls, outcomes, errors = [], [], []
            def driver(action, **kw):
                calls.append(action)
                if len(calls) == 1:
                    entered.set()
                    if not release.wait(5):
                        raise RuntimeError("fixture synchronization timeout")
                return {"ok": True}
            def first():
                try:
                    outcomes.append(self._stroke(hive, gen, bound, action, _queue([bound]), hid_fn=driver))
                except Exception as exc:
                    errors.append(exc)
            thread = threading.Thread(target=first)
            thread.start()
            try:
                self.assertTrue(entered.wait(5))
                second = self._stroke(hive, gen, bound, action, _queue([bound]), hid_fn=driver)
            finally:
                release.set()
                thread.join(5)
            self.assertFalse(thread.is_alive())
            self.assertEqual(errors, [])
            self.assertFalse(second["ok"])
            self.assertTrue(second["ledger"])
            self.assertEqual(len(calls), 1)

    def test_driver_exception_is_unverified_and_not_replayed(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-driver-error-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("bound", "Current", "https://current.example")
            action = {"op": "click", "x": 0.2, "y": 0.8, "label": "Next"}
            calls = []
            def driver(action, **kw):
                calls.append(action)
                raise TypeError("possibly emitted")
            got = self._stroke(hive, gen, bound, action, _queue([bound]), hid_fn=driver)
            self.assertFalse(got["ok"])
            self.assertTrue(got["ledger"])
            self.assertEqual(got["op"], "verify")
            self.assertIn("unverified", got["spoken"].lower())
            led = next(iter(_bus(hive)["watch"]["ledger"].values()))
            self.assertEqual(led["hid_error_type"], "TypeError")
            again = self._stroke(hive, gen, bound, action, _queue([bound]), hid_fn=driver)
            self.assertFalse(again["ok"])
            self.assertEqual(len(calls), 1)

    def test_changed_pixels_in_same_window_reject_old_coordinates(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-popup-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("target-visible", "Current", "https://current.example")
            popup = _snap("popup-covered-target", "Current", "https://current.example")
            calls = []
            got = self._stroke(hive, gen, bound, {"op": "click", "x": .2, "y": .8},
                _queue([popup]), hid_fn=lambda *a, **kw: calls.append(a) or {"ok": True})
            self.assertFalse(got["ok"])
            self.assertTrue(got["stale"])
            self.assertEqual(calls, [])

    def test_uncertain_driver_result_is_not_replayed(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-driver-uncertain-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("bound", "Current", "https://current.example")
            action = {"op": "type", "text": "unique text"}
            calls = []
            def driver(action, **kw):
                calls.append(action)
                return {"ok": False, "execution_uncertain": True, "spoken": "Outcome unknown."}
            got = self._stroke(hive, gen, bound, action, _queue([bound]), hid_fn=driver)
            self.assertFalse(got["ok"])
            self.assertTrue(got["execution_uncertain"])
            self._stroke(hive, gen, bound, action, _queue([bound]), hid_fn=driver)
            self.assertEqual(len(calls), 1)

    def test_failed_bound_observation_cannot_authorize_action(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-failed-bound-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("bound", "Current", "https://current.example")
            calls = []
            got = self._stroke(hive, gen, {**bound, "ok": False},
                {"op": "click", "x": .2, "y": .8}, _queue([bound]),
                hid_fn=lambda *a, **kw: calls.append(a) or {"ok": True})
            self.assertFalse(got["ok"])
            self.assertEqual(calls, [])
            self.assertTrue(got["denied"])

    def test_failed_fresh_observation_with_matching_frame_cannot_act(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-failed-fresh-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("bound", "Current", "https://current.example")
            calls = []
            got = self._stroke(hive, gen, bound, {"op": "click", "x": .2, "y": .8},
                _queue([{**bound, "ok": False}]), hid_fn=lambda *a, **kw: calls.append(a) or {"ok": True})
            self.assertFalse(got["ok"])
            self.assertEqual(calls, [])
            self.assertFalse(got["hid"])

    def test_driver_geometry_comes_from_bound_observation(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-bound-geometry-") as tmp:
            hive = Path(tmp)
            gen = _arm(hive)
            bound = _snap("bound", "Current", "https://current.example")
            geometry = {"x": -1200, "y": 40, "w": 1200, "h": 900}
            bound["state"]["frame_bounds"] = geometry
            calls = []
            def driver(action, **kw):
                calls.append(action)
                return {"ok": True}
            self._stroke(hive, gen, bound, {"op": "click", "_bound_frame_bounds": {"x": 9999}},
                _queue([bound, _snap("after", "Next", "https://next.example")]), hid_fn=driver)
            self.assertEqual(calls[0]["_bound_frame_bounds"], geometry)
            self.assertIsNot(calls[0]["_bound_frame_bounds"], geometry)

    def test_observer_internal_type_error_is_not_retried(self) -> None:
        calls = []
        def observer(**kw):
            calls.append(kw)
            raise TypeError("capture failed internally")
        with self.assertRaisesRegex(TypeError, "capture failed internally"):
            FRAME._call_perceive(observer, Path("unused"), 1)
        self.assertEqual(len(calls), 1)

    def test_hid_compatibility_signatures_emit_once(self) -> None:
        calls = []
        def modern(action, *, hive, gen):
            calls.append((action, hive, gen))
            return {"ok": True}
        def legacy(action):
            calls.append(action)
            return {"ok": True}
        def empty():
            calls.append(None)
            return {"ok": True}
        for driver in (modern, legacy, empty):
            with self.subTest(driver=driver.__name__):
                calls.clear()
                self.assertTrue(FRAME._call_hid(driver, {"op": "click"}, Path("unused"), 1)["ok"])
                self.assertEqual(len(calls), 1)

    def test_post_exception_keeps_action_ledger(self) -> None:
        for failure in (RuntimeError("fixture"), OSError("fixture"), ValueError("fixture")):
            with self.subTest(kind=type(failure).__name__), tempfile.TemporaryDirectory(prefix="watch-post-error-") as tmp:
                hive = Path(tmp)
                gen = _arm(hive)
                bound = _snap("bound", "Current", "https://current.example")
                action = {"op": "click", "x": 0.2, "y": 0.8, "label": "Next"}
                calls = 0
                def perceive(**kw):
                    nonlocal calls
                    calls += 1
                    if calls == 1:
                        return bound
                    raise failure
                self.clicks.clear()
                got = self._stroke(hive, gen, bound, action, perceive)
                self.assertFalse(got["ok"], got)
                self.assertTrue(got["hid"], got)
                self.assertTrue(got["ledger"], got)
                self.assertEqual(got["op"], "verify")
                led = next(iter(_bus(hive)["watch"]["ledger"].values()))
                self.assertEqual(led["observation_error_type"], type(failure).__name__)
                again = self._stroke(hive, gen, bound, action, _queue([bound]))
                self.assertFalse(again["ok"])
                self.assertEqual(len(self.clicks), 1)

    def test_transition_does_not_certify_driver_task_claim(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-proof-scope-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            before = _snap("before", "Page A", "https://a.example")
            after = _snap("after", "Page B", "https://b.example")
            got = self._stroke(hive, gen, before, {"op": "click", "x": 0.4, "y": 0.5}, _queue([before, after]), hid_fn=lambda *a, **kw: {"ok": True, "op": "click", "spoken": "The file was saved."})
            self.assertNotIn("The file was saved", got["spoken"])
            self.assertFalse(got["verification"]["task_verified"])
            self.assertEqual(got["verification"]["scope"], "observed_transition")
            self.assertTrue(got["verification"]["before_frame_id"])
            self.assertTrue(got["verification"]["after_frame_id"])

    def test_post_transition_same_coords_allowed(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-trans-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            first = _snap("one", "Page A", "https://a.example")
            after = _snap("two", "Page B", "https://b.example")
            action = {"op": "click", "x": 0.4, "y": 0.5, "label": "next"}
            one = self._stroke(hive, gen, first, action, _queue([first, after]))
            self.assertTrue(one.get("ok"), one)
            self.assertTrue(one.get("hid"))
            two = self._stroke(hive, gen, after, action, _queue([after, _snap("three", "Page C", "https://c.example")]))
            self.assertTrue(two.get("hid"), two)
            self.assertEqual(self.clicks, [(0.4, 0.5), (0.4, 0.5)])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_failed_click_not_ledgered(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-fail-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = _snap("fail", "Form", "https://form.example")
            action = {"op": "click", "x": 0.3, "y": 0.3, "label": "next"}
            failed = self._stroke(hive, gen, derived, action, _queue([derived]), hid_fn=self._hid_fail)
            self.assertFalse(failed.get("ok"), failed)
            self.assertFalse(failed.get("hid"))
            self.assertFalse(failed.get("ledger"))
            led = ((_bus(hive).get("watch") or {}).get("ledger") or {})
            self.assertEqual(led, {})
            after = _snap("ok", "Done", "https://form.example/done")
            retry = self._stroke(hive, gen, derived, action, _queue([derived, after]))
            self.assertTrue(retry.get("hid"), retry)
            self.assertEqual(self.clicks, [(0.3, 0.3)])
            same = self._stroke(hive, gen, derived, action, _queue([derived]))
            self.assertTrue(same.get("ledger"), same)
            self.assertEqual(self.clicks, [(0.3, 0.3)])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_stop_between_prove_and_hid(self) -> None:
        n = 100
        stopped = 0
        leaked = 0
        for i in range(n):
            with self.subTest(i=i):
                released = threading.Event()
                resume = threading.Event()

                def hook():
                    released.set()
                    self.assertTrue(resume.wait(2), "stop never released mac_click")

                SEE.BEFORE_HID = hook
                posted: list = []
                real = SEE.mac_click

                def wrap(x, y, **kw):
                    out = real(x, y, **kw)
                    if out.get("ok"):
                        posted.append(out)
                    return out

                SEE.mac_click = wrap
                try:
                    with tempfile.TemporaryDirectory(prefix=f"watch-stroke-hid-{i}-") as tmp:
                        hive = Path(tmp)
                        (hive / "bus").mkdir(parents=True)
                        gen = _arm(hive)
                        derived = _snap(f"stop-{i}", "Pane", "https://pane.example")
                        box: dict = {}

                        def run():
                            box.update(
                                FRAME.commit_watch_stroke(
                                    hive,
                                    gen,
                                    derived,
                                    {"op": "click", "x": 0.5, "y": 0.5, "label": "next"},
                                    perceive=_queue([derived, derived]),
                                    hid_fn=self._real_hid,
                                    utterance="click next",
                                )
                            )

                        worker = threading.Thread(target=run)
                        worker.start()
                        self.assertTrue(released.wait(2), "mac_click never reached BEFORE_HID")
                        PIPE.cancel_turn(hive)
                        resume.set()
                        worker.join(3)
                        self.assertFalse(worker.is_alive())
                        self.assertEqual(posted, [])
                        self.assertFalse(box.get("hid"))
                        self.assertTrue(box.get("denied") or box.get("op") == "stop", box)
                        self.assertFalse(_bus(hive).get("watch", {}).get("armed"))
                        stopped += 1
                        self._healthy_ping(hive)
                        self._recover_same_coords_once(hive, f"After {i}", f"https://after-{i}.example")
                finally:
                    SEE.BEFORE_HID = None
                    SEE.mac_click = real
        self.assertEqual(stopped, n)
        self.assertEqual(leaked, 0)

    def test_eyes_off_vs_inflight_save(self) -> None:
        n = 100
        kept_off = 0
        blob = base64.b64encode(b"jpeg-bytes").decode("ascii")
        for i in range(n):
            with self.subTest(i=i):
                released = threading.Event()
                resume = threading.Event()

                def hook():
                    released.set()
                    self.assertTrue(resume.wait(2), "eyes-off never released save")

                SENSES.BEFORE_SAVE_EYES = hook
                try:
                    with tempfile.TemporaryDirectory(prefix=f"watch-stroke-eyes-{i}-") as tmp:
                        hive = Path(tmp)
                        (hive / "bus").mkdir(parents=True)
                        gen = PIPE.begin_turn(hive)
                        box: dict = {}

                        def run():
                            box.update(
                                SENSES.save_eyes(
                                    f"data:image/jpeg;base64,{blob}",
                                    hive=hive,
                                    gen=gen,
                                )
                            )

                        worker = threading.Thread(target=run)
                        worker.start()
                        self.assertTrue(released.wait(2), "save_eyes never reached hook")
                        off = SENSES.set_eyes_active(False, hive=hive, gen=gen)
                        self.assertFalse(off.get("active"))
                        resume.set()
                        worker.join(3)
                        self.assertFalse(worker.is_alive())
                        bus = _bus(hive)
                        self.assertFalse(bus.get("eyes", {}).get("active"), bus.get("eyes"))
                        self.assertFalse(box.get("active"))
                        kept_off += 1
                        PIPE.cancel_turn(hive)
                        self._healthy_ping(hive)
                finally:
                    SENSES.BEFORE_SAVE_EYES = None
        self.assertEqual(kept_off, n)

    def test_stale_after_think_discards_then_acts(self) -> None:
        n = {"i": 0}
        snaps = [
            _snap("think-a", "A", "https://a.example"),
            _snap("think-b", "B", "https://b.example"),
            _snap("think-b", "B", "https://b.example"),
            _snap("think-b", "B", "https://b.example"),
            _snap("think-c", "C", "https://c.example"),
        ]

        def see_fn(**kw):
            _ = kw
            row = snaps[min(n["i"], len(snaps) - 1)]
            n["i"] += 1
            return {**row, "spoken": "Watch dry."}

        def talk_fn(prompt, pack="", images=None, **kw):
            _ = (prompt, pack, images, kw)
            return {"tool": "mac_act", "args": {"op": "click", "x": 0.6, "y": 0.4, "label": "next"}, "speak": "click"}

        with tempfile.TemporaryDirectory(prefix="watch-stroke-stale-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            got = PIPE.run_watch_loop("click next", hive=hive, talk_fn=talk_fn, see_fn=see_fn, gen=gen)
            bus = _bus(hive)
            self.assertIn("Frame moved", got.get("spoken") or "")
            self.assertEqual(self.clicks, [(0.6, 0.4)])
            self.assertTrue(bus["watch"]["armed"])
            self.assertTrue(bus["watch"].get("held"))
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)
            self._recover_same_coords_once(hive, "Fresh", "https://fresh.example")

    def test_run_tool_missing_frame_id_denies_hid(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-run-tool-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = {"state": {"title": "Hive", "url": "https://a.example", "app": "Safari", "window": "Hive"}}
            got = PIPE.run_tool(
                {
                    "tool": "mac_act",
                    "args": {"op": "click", "x": 0.2, "y": 0.8, "label": "next"},
                    "speak": "click",
                },
                "click next",
                hive=hive,
                retrieve_roots=None,
                see_fn=lambda **kw: derived,
                gen=gen,
            )
            self.assertTrue(got.get("denied"), got)
            self.assertFalse(got.get("hid"))
            self.assertFalse(got.get("ok"))
            self.assertEqual(self.clicks, [])
            self.assertIn("frame stamp", (got.get("spoken") or "").lower())
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_moved_window_bounds_deny_before_hid(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-bounds-") as tmp:
            hive=Path(tmp); gen=_arm(hive)
            first=_snap("frame", "Lab", "https://lab.example")
            first["state"]["frame_bounds"]={"x":0,"y":0,"w":800,"h":600}
            moved={**first,"state":{**first["state"],"frame_bounds":{"x":300,"y":150,"w":800,"h":600}}}
            got=self._stroke(hive,gen,first,{"op":"click","x":0.2,"y":0.2,"label":"next"},_queue([moved]))
            self.assertTrue(got.get("stale"),got)
            self.assertFalse(got.get("hid"),got)
            self.assertEqual(self.clicks,[])

    def test_wrong_foreground_app_denies_before_hid(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-app-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            first = FRAME.stamp_dry(
                seed="safari",
                safari={"title": "Watch lab", "url": "http://127.0.0.1:4018/watch-lab"},
                app="Safari",
            )
            jitter = FRAME.stamp_dry(
                seed="cursor",
                safari={"title": "Watch lab", "url": "http://127.0.0.1:4018/watch-lab"},
                app="Cursor",
            )
            after = FRAME.stamp_dry(
                seed="next",
                safari={"title": "Watch lab · Next", "url": "http://127.0.0.1:4018/watch-lab/next"},
                app="Safari",
            )
            got = self._stroke(
                hive,
                gen,
                first,
                {"op": "click", "x": 0.2, "y": 0.2, "label": "next"},
                _queue([jitter, after]),
            )
            self.assertFalse(got.get("ok"), got)
            self.assertFalse(got.get("hid"))
            self.assertTrue(got.get("stale"))
            self.assertEqual(self.clicks, [])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_changed_pixels_require_reobservation_even_with_same_surroundings(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stroke-jitter-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            first = _snap("jpeg-a", "Watch lab", "http://127.0.0.1:4018/watch-lab")
            jitter = _snap("jpeg-b", "Watch lab", "http://127.0.0.1:4018/watch-lab")
            after = _snap("after", "Watch lab · Next", "http://127.0.0.1:4018/watch-lab/next")
            self.assertNotEqual(first.get("frame_id"), jitter.get("frame_id"))
            got = self._stroke(
                hive,
                gen,
                first,
                {"op": "click", "x": 0.2, "y": 0.2, "label": "next"},
                _queue([jitter, after]),
            )
            self.assertFalse(got.get("ok"), got)
            self.assertFalse(got.get("hid"))
            self.assertTrue(got.get("stale"))
            self.assertEqual(self.clicks, [])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_run_tool_uses_commit_watch_stroke(self) -> None:
        src = PIPE_SRC.read_text(encoding="utf-8")
        start = src.find("if tool == \"mac_act\":")
        end = src.find("def _watch_stopped", start)
        body = src[start:end]
        self.assertIn("commit_watch_stroke", body)
        self.assertNotIn("SEE.mac_act(\n            op,", body)

    def test_watch_loop_refuses_click_send_without_talk(self) -> None:
        def talk_fn(*args, **kw):
            raise AssertionError(f"hard send must not call talk {args} {kw}")

        with tempfile.TemporaryDirectory(prefix="watch-stroke-send-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = _snap("send", "Watch lab", "http://127.0.0.1:4018/watch-lab")
            got = PIPE.run_watch_loop(
                "click Send",
                hive=hive,
                talk_fn=talk_fn,
                see_fn=lambda **kw: {**derived, "spoken": "Watch dry."},
                gen=gen,
            )
            self.assertEqual(self.clicks, [])
            self.assertIn("proposal only", (got.get("spoken") or "").lower())
            self.assertEqual(got.get("op"), "hard")
            self.assertTrue(_bus(hive)["watch"]["armed"])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_new_app_asks_before_hid(self) -> None:
        def refuse_talk(*args, **kw):
            raise AssertionError(f"ask must not call talk {args} {kw}")

        def talk_fn(prompt, pack="", images=None, **kw):
            _ = (prompt, pack, images, kw)
            return {"tool": "mac_act", "args": {"op": "click", "x": 0.2, "y": 0.2, "label": "next"}, "speak": "click"}

        with tempfile.TemporaryDirectory(prefix="watch-stroke-allow-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = PIPE.begin_turn(hive)
            SENSES.set_watch_arm(True, hive=hive, gen=gen, evens=True)
            derived = _snap("mail", "Inbox", "https://mail.example")
            after = _snap("after", "Next", "https://mail.example/next")
            got = PIPE.run_watch_loop(
                "click next",
                hive=hive,
                talk_fn=refuse_talk,
                see_fn=lambda **kw: {**derived, "spoken": "Watch dry."},
                gen=gen,
            )
            self.assertEqual(self.clicks, [])
            self.assertIn("allow jarvis to use safari", (got.get("spoken") or "").lower())
            self.assertTrue(_bus(hive)["watch"]["armed"])
            allowed = PIPE.run_watch_loop(
                "always allow",
                hive=hive,
                talk_fn=talk_fn,
                see_fn=_queue([derived, derived, after]),
                gen=gen,
            )
            self.assertTrue(allowed.get("ok"), allowed)
            self.assertEqual(self.clicks, [(0.2, 0.2)])
            allow = _bus(hive).get("watch", {}).get("allow") or []
            self.assertTrue(any(str(item).lower() == "safari" for item in allow))
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_watch_loop_refuses_safari_see(self) -> None:
        def talk_fn(prompt, pack="", images=None, **kw):
            _ = (prompt, pack, images, kw)
            return {"tool": "safari_see", "args": {"op": "screenshot"}, "speak": "I grabbed Safari."}

        src = PIPE_SRC.read_text(encoding="utf-8")
        start = src.find("def run_watch_loop")
        end = src.find("\ndef cursor_fn_ask_fallback", start)
        body = src[start:end]
        self.assertIn("commit_watch_stroke", body)
        self.assertIn("safari_see", body)
        self.assertNotIn("run_tool(", body)
        with tempfile.TemporaryDirectory(prefix="watch-stroke-safari-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm(hive)
            derived = _snap("safari", "Tab", "https://tab.example")
            got = PIPE.run_watch_loop(
                "look",
                hive=hive,
                talk_fn=talk_fn,
                see_fn=lambda **kw: {**derived, "spoken": "Watch dry."},
                gen=gen,
            )
            self.assertEqual(self.clicks, [])
            self.assertIn("second hand", (got.get("spoken") or "").lower())
            self.assertTrue(_bus(hive)["watch"]["armed"])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)



class WatchPermissionBoundaryTest(unittest.TestCase):
    def test_pipeline_revocation_while_model_decides_does_not_execute(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp); (hive/'bus').mkdir(); gen = _arm(hive)
            derived = _snap('policy', 'Document', 'https://example.com')
            def talk(*args, **kwargs):
                PIPE.BUS_IO.mutate_bus(hive, lambda b: b | {'watch': b['watch'] | {'allow': [], 'session_allow': []}})
                return {'tool':'mac_act','args':{'op':'click','x':0.2,'y':0.3,'label':'next'},
                        'engine':'openrouter','wire':'openrouter'}
            with patch.dict(os.environ, {'AGENT_STACK_DRY_WATCH':'1','AGENT_STACK_DRY_MAC':'1'}), patch.object(SEE,'mac_act') as hid:
                result = PIPE.run_watch_loop('click next', hive=hive, gen=gen,
                    talk_fn=talk, see_fn=lambda **kwargs:derived)
            hid.assert_not_called()
            self.assertFalse(_bus(hive)['watch'].get('ledger'),result)

    def test_revoked_app_or_disarmed_watch_never_reaches_hid(self):
        from unittest.mock import patch
        for case in ('revoked_app', 'disarmed', 'self_app'):
            with self.subTest(case=case), tempfile.TemporaryDirectory() as tmp:
                hive = Path(tmp); (hive/'bus').mkdir()
                gen = _arm(hive)
                derived = _snap('policy', 'Document', 'https://example.com')
                if case == 'self_app':
                    derived['state']['app'] = 'Jarvis Orb'
                def perceive(**kwargs):
                    if case in ('revoked_app', 'disarmed'):
                        def revoke(bus):
                            if case == 'revoked_app':
                                bus['watch']['allow'] = []
                                bus['watch']['session_allow'] = []
                            else:
                                bus['watch']['armed'] = False
                            return bus
                        PIPE.BUS_IO.mutate_bus(hive, revoke)
                    return derived
                hid = []
                with patch.dict(os.environ, {'AGENT_STACK_DRY_WATCH':'1'}):
                    result = FRAME.commit_watch_stroke(hive, gen, derived,
                        {'op':'click','x':0.2,'y':0.3,'label':'next'}, perceive=perceive,
                        hid_fn=lambda *a,**k: hid.append(True) or {'ok':True,'op':'click'})
                self.assertFalse(hid, result)
                self.assertTrue(result.get('denied'), result)
                self.assertFalse(_bus(hive)['watch'].get('ledger'), _bus(hive))

    def test_revocation_after_early_policy_check_is_checked_at_reservation(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp); (hive/'bus').mkdir(); gen = _arm(hive)
            derived = _snap('policy', 'Document', 'https://example.com')
            original = FRAME._act; calls = []; hid = []
            def act(hive, gen, apply):
                # Revoke just before canonical reservation, after earlier reads.
                if apply.__name__ == 'claim_led':
                    PIPE.BUS_IO.mutate_bus(hive, lambda b: b | {'watch': b['watch'] | {'allow': [],'session_allow':[]}})
                return original(hive, gen, apply)
            with patch.dict(os.environ, {'AGENT_STACK_DRY_WATCH':'1'}), patch.object(FRAME,'_act',side_effect=act):
                result = FRAME.commit_watch_stroke(hive, gen, derived,
                    {'op':'click','x':0.2,'y':0.3,'label':'next'}, perceive=lambda **k:derived,
                    hid_fn=lambda *a,**k:hid.append(True) or {'ok':True,'op':'click'})
            self.assertFalse(hid,result)
            self.assertTrue(result.get('denied'),result)
            self.assertFalse(_bus(hive)['watch'].get('ledger'),_bus(hive))


class WatchDriverPermissionTest(unittest.TestCase):
    def test_revocation_after_reservation_blocks_all_input_types(self):
        from unittest.mock import patch
        for op in ('click', 'type', 'scroll'):
            for reason in ('revoked', 'disarmed'):
                with self.subTest(op=op, reason=reason), tempfile.TemporaryDirectory() as tmp:
                    hive = Path(tmp); (hive/'bus').mkdir(); gen = _arm(hive)
                    frame = _snap('driver-policy', 'Document', 'https://example.com')
                    def revoke():
                        def update(bus):
                            watch = bus['watch']
                            if reason == 'revoked':
                                watch['allow'] = []; watch['session_allow'] = []
                            else:
                                watch['armed'] = False
                            return bus
                        PIPE.BUS_IO.mutate_bus(hive, update)
                    observed = []
                    def hid(action, hive=None, gen=None):
                        result = SEE.mac_act(op, x=.2, y=.3, text='a bounded fixture', hive=hive, gen=gen)
                        observed.append(result)
                        return result
                    with patch.dict(os.environ, {'AGENT_STACK_DRY_WATCH':'1','AGENT_STACK_DRY_MAC':'1'}), patch.object(SEE,'BEFORE_HID',revoke):
                        result = FRAME.commit_watch_stroke(hive, gen, frame,
                            {'op':op,'x':.2,'y':.3,'text':'a bounded fixture','label':'fixture'},
                            perceive=lambda **k: frame, hid_fn=hid)
                    self.assertEqual(len(observed),1)
                    self.assertFalse(observed[0]['ok'],result)
                    self.assertFalse(result.get('hid'),result)
                    self.assertFalse(_bus(hive)['watch'].get('ledger'),result)

    def test_current_generation_alone_cannot_authorize_hid_without_reservation(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); (hive/'bus').mkdir(); gen=_arm(hive)
            with patch.dict(os.environ, {'AGENT_STACK_DRY_MAC':'1'}):
                result=SEE.mac_act('type',text='fixture',hive=hive,gen=gen)
            self.assertFalse(result['ok'],result)


class WatchActionReceiptTest(unittest.TestCase):
    def test_preupgrade_typing_receipt_still_blocks_uncertain_replay(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); (hive/'bus').mkdir(); gen=_arm(hive)
            frame=_snap('receipt','Document','https://example.com');text='legacy prefix '+('x'*100)
            old_key=FRAME.ledger_key(frame['state'],'type',text[:80])
            PIPE.BUS_IO.mutate_bus(hive,lambda b:b|{'watch':b['watch']|{'ledger':{old_key:{'transition':False}}}})
            calls=[]
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}):
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':text},perceive=lambda **k:frame,
                    hid_fn=lambda *a,**k:calls.append(True) or {'ok':True})
            self.assertFalse(calls,result);self.assertTrue(result['ledger']);self.assertFalse(result['hid'])

    def test_full_typing_payload_distinguishes_actions_and_exact_replay_is_blocked(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); (hive/'bus').mkdir(); gen=_arm(hive)
            frame=_snap('receipt','Document','https://example.com')
            calls=[]
            def hid(action,**kwargs):
                calls.append(action['text']);return {'ok':True,'op':'type'}
            texts=['shared prefix '+('x'*100)+' ALPHA','shared prefix '+('x'*100)+' BRAVO']
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}):
                results=[FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':text},perceive=lambda **k:frame,hid_fn=hid) for text in texts]
                replay=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':texts[1]},perceive=lambda **k:frame,hid_fn=hid)
            self.assertEqual(calls,texts,results)
            self.assertTrue(replay['ledger']);self.assertFalse(replay['hid'])
            self.assertNotEqual(results[0]['action']['ledger_key'],results[1]['action']['ledger_key'])

    def test_unverified_receipts_preserve_observation_and_use_requested_operation(self):
        from unittest.mock import patch
        import hashlib
        for operation in ('type','scroll'):
            for post_kind in ('same','moved','missing'):
                with self.subTest(operation=operation,post_kind=post_kind),tempfile.TemporaryDirectory() as tmp:
                    hive=Path(tmp); (hive/'bus').mkdir(); gen=_arm(hive)
                    frame=_snap('before','Document','https://example.com')
                    post=frame if post_kind=='same' else _snap('after','Next','https://next.example') if post_kind=='moved' else {'ok':False}
                    action={'op':operation,'text':'  exact fixture  ','direction':'down'}
                    with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}):
                        result=FRAME.commit_watch_stroke(hive,gen,frame,action,perceive=_queue([frame,post]),
                            hid_fn=lambda *a,**k:{'ok':True,'op':'click','task_verified':True,'spoken':'Done. The task is complete.'})
                    self.assertTrue(result['hid'],result)
                    self.assertFalse(result['task_verified'],result)
                    self.assertEqual(result['action']['operation'],operation)
                    verification=result['verification']
                    self.assertFalse(verification['task_verified'])
                    self.assertEqual(verification['post_observation_available'],post_kind!='missing')
                    self.assertEqual(verification['transition_observed'],post_kind=='moved')
                    self.assertEqual(verification['before_frame_id'],frame['frame_id'])
                    if operation=='type':
                        self.assertEqual(result['action']['expected_text_sha256'],hashlib.sha256(action['text'].encode()).hexdigest())
                    self.assertNotIn('click',result['spoken'].lower())
                    self.assertNotIn('Done. The task is complete.',result['spoken'])
                    stored=next(iter(_bus(hive)['watch']['ledger'].values()))
                    self.assertEqual(stored['action'],result['action'])
                    self.assertEqual(stored['verification'],verification)


class WatchCommandBindingTest(unittest.TestCase):
    def setUp(self):
        from unittest.mock import patch
        reader=patch.object(SEE,'read_focused_text',return_value={'value':'AB','selection':{'location':1,'length':0}})
        reader.start();self.addCleanup(reader.stop)

    def test_tampered_typing_command_cannot_borrow_a_reservation(self):
        from unittest.mock import patch
        import subprocess
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
            frame=_snap('command-binding','Document','https://example.com')
            def hid(action,hive=None,gen=None):
                return SEE.mac_act('type',text='different text',hive=hive,gen=gen)
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}),patch.object(SEE,'_type_into_focused_field',return_value={'ok':True,'task_verified':False}) as run:
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
            run.assert_not_called()
            self.assertFalse(result['hid'],result)

    def test_matching_command_still_runs_and_permission_revocation_blocks_it(self):
        from unittest.mock import patch
        import subprocess
        for revoke in (False,True):
            with self.subTest(revoke=revoke),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
                frame=_snap('command-binding','Document','https://example.com')
                def hid(action,hive=None,gen=None):
                    if revoke:PIPE.BUS_IO.mutate_bus(hive,lambda b:b|{'watch':b['watch']|{'allow':[],'session_allow':[]}})
                    return SEE.mac_act('type',text=action['text'],hive=hive,gen=gen)
                with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}),patch.object(SEE,'_type_into_focused_field',return_value={'ok':True,'task_verified':False}) as run:
                    result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
                self.assertEqual(run.call_count,0 if revoke else 1)
                self.assertEqual(result['hid'],not revoke)

    def test_same_generation_other_app_reservation_cannot_satisfy_foreground(self):
        from unittest.mock import patch
        import subprocess
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
            frame=_snap('command-binding','Document','https://example.com')
            def hid(action,hive=None,gen=None):
                PIPE.BUS_IO.mutate_bus(hive,lambda b:b|{'watch':b['watch']|{'allow':['Safari','Notes'],'ledger':b['watch']['ledger']|{'unrelated':{'phase':'reserved','gen':gen,'app':'Notes'}}}})
                return SEE.mac_act('type',text=action['text'],hive=hive,gen=gen)
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Notes'}),patch.object(SEE,'_type_into_focused_field',return_value={'ok':True,'task_verified':False}) as run:
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
            run.assert_not_called();self.assertFalse(result['hid'],result)


    def test_two_matching_reservations_are_ambiguous_and_do_not_emit(self):
        from unittest.mock import patch
        import subprocess
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
            frame=_snap('command-binding','Document','https://example.com')
            def hid(action,hive=None,gen=None):
                def duplicate(bus):
                    ledger=bus['watch']['ledger'];ledger['another-action']=dict(next(iter(ledger.values())))
                    return bus
                PIPE.BUS_IO.mutate_bus(hive,duplicate)
                return SEE.mac_act('type',text=action['text'],hive=hive,gen=gen)
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}),patch.object(SEE,'_type_into_focused_field',return_value={'ok':True,'task_verified':False}) as run:
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
            run.assert_not_called();self.assertFalse(result['hid'],result)


    def test_changed_coordinates_geometry_or_scroll_direction_do_not_emit(self):
        from unittest.mock import patch,Mock
        cases=[({'op':'click','x':.2,'y':.3},{'op':'click','x':.8,'y':.3},False),
               ({'op':'click','x':.2,'y':.3},{'op':'click','x':.2,'y':.3},True),
               ({'op':'scroll','direction':'down'},{'op':'scroll','direction':'up'},False),
               ({'op':'type','text':'reserved text'},{'op':'click','x':.2,'y':.3},False)]
        for requested,emitted,changed_geometry in cases:
            with self.subTest(requested=requested,emitted=emitted,changed_geometry=changed_geometry),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
                frame=_snap('command-binding','Document','https://example.com')
                frame['state']['frame_bounds']={'x':0,'y':0,'w':800,'h':600}
                lib=Mock()
                lib.CGEventCreateMouseEvent.side_effect=[11,12];lib.CGEventSourceCreate.return_value=10;lib.CGEventCreateKeyboardEvent.side_effect=[11,12]
                def hid(action,hive=None,gen=None):
                    bounds={**action['_bound_frame_bounds'],'w':1400} if changed_geometry else action['_bound_frame_bounds']
                    return SEE.mac_act(**emitted,frame_bounds=bounds,hive=hive,gen=gen)
                with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}),patch.object(SEE.ctypes,'CDLL',return_value=lib),patch.object(SEE,'_type_into_focused_field') as run:
                    result=FRAME.commit_watch_stroke(hive,gen,frame,requested,perceive=lambda **k:frame,hid_fn=hid)
                lib.CGEventPost.assert_not_called();run.assert_not_called();self.assertFalse(result['hid'],result)

    def test_matching_click_and_scroll_still_emit_through_existing_driver(self):
        from unittest.mock import patch,Mock
        for requested in ({'op':'click','x':.2,'y':.3},{'op':'scroll','direction':'down'}):
            with self.subTest(requested=requested),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
                frame=_snap('command-binding','Document','https://example.com');frame['state']['frame_bounds']={'x':0,'y':0,'w':800,'h':600}
                lib=Mock();lib.CGEventCreateMouseEvent.side_effect=[11,12];lib.CGEventSourceCreate.return_value=10;lib.CGEventCreateKeyboardEvent.side_effect=[11,12]
                def hid(action,hive=None,gen=None):return SEE.mac_act(**requested,frame_bounds=action['_bound_frame_bounds'],hive=hive,gen=gen)
                with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}),patch.object(SEE.ctypes,'CDLL',return_value=lib):
                    result=FRAME.commit_watch_stroke(hive,gen,frame,requested,perceive=lambda **k:frame,hid_fn=hid)
                self.assertEqual(lib.CGEventPost.call_count,2);self.assertTrue(result['hid'],result)

class WatchSingleUseTest(unittest.TestCase):
    def setUp(self):
        from unittest.mock import patch
        reader=patch.object(SEE,'read_focused_text',return_value={'value':'AB','selection':{'location':1,'length':0}})
        reader.start();self.addCleanup(reader.stop)

    def _attempt(self, behavior):
        from unittest.mock import patch
        import subprocess
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
            frame=_snap('single-use','Document','https://example.com')
            results=[]
            def call():
                result=SEE.mac_act('type',text='reserved text',hive=hive,gen=gen)
                results.append(result)
                return result
            def hid(action,hive=None,gen=None):
                return behavior(call,hive,gen,results)
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}),patch.object(SEE,'_type_into_focused_field',return_value={'ok':True,'task_verified':False}) as run:
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
            return result,results,run.call_count,_bus(hive)

    def test_pending_reservation_cannot_emit_twice(self):
        def behavior(call,*args):
            first=call();second=call()
            self.assertFalse(second['ok'])
            return first
        result,results,count,bus=self._attempt(behavior)
        self.assertEqual(count,1);self.assertFalse(results[1]['ok']);self.assertTrue(result['hid']);self.assertFalse(result['task_verified'])

    def test_concurrent_calls_only_one_dispatches(self):
        def behavior(call,hive,gen,results):
            barrier=threading.Barrier(2)
            def worker():barrier.wait(timeout=5);call()
            workers=[threading.Thread(target=worker) for _ in range(2)]
            for worker in workers:worker.start()
            for worker in workers:worker.join(timeout=10);self.assertFalse(worker.is_alive())
            self.assertEqual(sum(bool(r['ok']) for r in results),1)
            return next(r for r in results if r['ok'])
        result,results,count,bus=self._attempt(behavior)
        self.assertEqual(count,1);self.assertTrue(result['hid'])

    def test_reentrant_driver_hook_cannot_borrow_ownership(self):
        from unittest.mock import patch
        def behavior(call,hive,gen,results):
            def hook():
                with patch.object(SEE,'BEFORE_HID',None):
                    self.assertFalse(call()['ok'])
            with patch.object(SEE,'BEFORE_HID',hook):return call()
        result,results,count,bus=self._attempt(behavior)
        self.assertEqual(count,1);self.assertTrue(result['hid'])

    def test_known_no_input_failure_releases_for_safe_retry(self):
        from unittest.mock import patch
        import subprocess
        def behavior(call,hive,gen,results):
            with patch.object(SEE,'_type_into_focused_field',return_value={'ok':False,'action_issued':False}):
                self.assertFalse(call()['ok'])
            return call()
        result,results,count,bus=self._attempt(behavior)
        self.assertEqual(count,1);self.assertTrue(result['hid'])

    def test_known_no_input_failure_allows_stroke_cleanup(self):
        from unittest.mock import patch
        def behavior(call,hive,gen,results):
            with patch.object(SEE,'_type_into_focused_field',return_value={'ok':False,'action_issued':False}):return call()
        result,results,count,bus=self._attempt(behavior)
        self.assertEqual(count,0);self.assertFalse(result['hid']);self.assertEqual(bus['watch']['ledger'],{})

    def test_uncertain_typing_failure_never_authorizes_retry(self):
        from unittest.mock import patch
        import subprocess
        def behavior(call,hive,gen,results):
            with patch.object(SEE,'_type_into_focused_field',return_value={'ok':False,'execution_uncertain':True}) as run:
                first=call();second=call()
                second['fixture_transport_calls']=run.call_count
            return first
        result,results,count,bus=self._attempt(behavior)
        self.assertFalse(result['hid']);self.assertEqual(len(results),2);self.assertEqual(results[1]['fixture_transport_calls'],1);self.assertFalse(results[1]['ok']);self.assertTrue(next(iter(bus['watch']['ledger'].values()))['execution_uncertain'])

    def test_exception_during_dispatch_keeps_ownership_consumed(self):
        from unittest.mock import patch
        def behavior(call,hive,gen,results):
            with patch.object(SEE,'_type_into_focused_field',side_effect=RuntimeError('transport unknown')):
                with self.assertRaises(RuntimeError):call()
            self.assertFalse(call()['ok'])
            raise RuntimeError('transport unknown')
        result,results,count,bus=self._attempt(behavior)
        self.assertEqual(count,0);self.assertFalse(result['hid']);self.assertTrue(next(iter(bus['watch']['ledger'].values()))['execution_uncertain'])

class NativeFocusIdentityTest(unittest.TestCase):
    def setUp(self):
        from unittest.mock import patch
        reader=patch.object(SEE,'read_focused_text',return_value={'value':'AB','selection':{'location':1,'length':0}})
        reader.start();self.addCleanup(reader.stop)

    def test_same_app_changed_process_window_or_field_cannot_type(self):
        from unittest.mock import patch
        for focus in ({'pid':42,'window':'window-1','element':'field-1','role':'AXTextField'},
                      {'pid':41,'window':'window-2','element':'field-1','role':'AXTextField'},
                      {'pid':41,'window':'window-1','element':'field-2'}, {},
                      {'pid':41,'window':'window-1','element':''},
                      {'pid':41,'window':'window-1','element':'field-1'},
                      {'pid':41,'window':'window-1','element':'field-1','role':'AXButton'}):
            with self.subTest(focus=focus),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive);frame=_snap('focus','Same title','https://example.com')
                def hid(action,hive=None,gen=None):return SEE.mac_act('type',text=action['text'],hive=hive,gen=gen)
                with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value={'ok':True,'app':'Safari','focus':focus}),patch.object(SEE,'_type_into_focused_field') as run:
                    result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
                run.assert_not_called();self.assertFalse(result['hid'])

    def test_same_app_field_change_at_final_fence_denies_typing(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive);frame=_snap('focus','Same title','https://example.com')
            old={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}}
            new={'ok':True,'app':'Safari','focus':{'pid':41,'window':'window-1','element':'field-2'}}
            def hid(action,hive=None,gen=None):return SEE.mac_act('type',text=action['text'],hive=hive,gen=gen)
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',side_effect=[old,old,new]),patch.object(SEE,'_type_into_focused_field') as run:
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:frame,hid_fn=hid)
            run.assert_not_called();self.assertFalse(result['hid'])

    def test_same_pixels_with_changed_focus_require_reobservation(self):
        from unittest.mock import patch
        for field,value in (('pid',42),('window','window-2'),('element','field-2')):
            with self.subTest(field=field),patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive);frame=_snap('focus','Same title','https://example.com')
                fresh={**frame,'state':{**frame['state'],'focus':{**frame['state']['focus'],field:value}}}
                calls=[]
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'reserved text'},perceive=lambda **k:fresh,hid_fn=lambda *a,**k:calls.append(a))
                self.assertTrue(result['stale'],result);self.assertEqual(calls,[])

class IndependentTextPostconditionTest(unittest.TestCase):
    def _mission(self, after, *, moved=False, before=None):
        from unittest.mock import patch
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive)
            frame=_snap('text-value','Document','https://example.com')
            source=before or {'value':'A😀B','selection':{'location':1,'length':2}}
            frame['state']['text_binding']={'value_sha256':hashlib.sha256(source['value'].encode()).hexdigest(),'selection':dict(source['selection'])}
            post=_snap('post','Other title','https://example.com') if moved else frame
            calls=[];reads=iter([before or {'value':'A😀B','selection':{'location':1,'length':2}},after])
            hand=SimpleNamespace(safari_activate=lambda:{'ok':True},read_focused_text=lambda focus:next(reads))
            def hid(*a,**kw):calls.append(a);return {'ok':True,'submitted':False,'task_verified':True}
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'0'}),patch.object(FRAME,'_see',return_value=hand):
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'Ω\nliteral'},perceive=_queue([frame,post]),hid_fn=hid)
            return result,calls,_bus(hive)

    def test_exact_field_value_verifies_even_when_pixels_do_not_change(self):
        result,calls,bus=self._mission({'value':'AΩ\nliteralB','selection':{'location':10,'length':0}})
        self.assertTrue(result['ok']);self.assertEqual(len(calls),1)
        self.assertTrue(result['verification']['postcondition_verified']);self.assertFalse(result['task_verified'])
        self.assertEqual(result['verification']['scope'],'field_value')
        self.assertNotIn('AΩ',json.dumps(bus));self.assertEqual(next(iter(bus['watch']['ledger'].values()))['verification'],result['verification'])

    def test_screen_change_cannot_override_failed_field_value_proof(self):
        result,calls,bus=self._mission({'value':'wrong value'},moved=True)
        self.assertFalse(result['ok']);self.assertTrue(result['hid']);self.assertFalse(result['task_verified'])
        self.assertFalse(result['verification']['postcondition_verified']);self.assertEqual(len(calls),1)

    def test_missing_field_reread_retains_unverified_receipt(self):
        result,calls,bus=self._mission(None)
        self.assertFalse(result['ok']);self.assertTrue(result['ledger']);self.assertEqual(len(calls),1)
        self.assertFalse(result['verification']['postcondition_verified'])

    def test_invalid_utf16_selection_denies_before_any_input(self):
        result,calls,bus=self._mission(None,before={'value':'A😀B','selection':{'location':2,'length':1}})
        self.assertTrue(result['denied']);self.assertEqual(calls,[])


class TextObservationBindingTest(unittest.TestCase):
    def test_same_pixels_with_changed_value_or_selection_are_stale(self):
        from unittest.mock import patch
        for binding in ({'value_sha256':hashlib.sha256(b'edited').hexdigest(),'selection':{'location':1,'length':0}},
                        {'value_sha256':hashlib.sha256(b'AB').hexdigest(),'selection':{'location':0,'length':0}},None):
            with self.subTest(binding=binding),tempfile.TemporaryDirectory() as tmp,patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}):
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive);frame=_snap('binding','Document','https://example.com')
                fresh={**frame,'state':{**frame['state'],'text_binding':binding}}
                calls=[]
                result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'literal'},perceive=lambda **kw:fresh,hid_fn=lambda *a,**kw:calls.append(a))
                self.assertTrue(result['stale'],result);self.assertEqual(calls,[])

    def test_selection_changed_after_capture_cannot_be_adopted_as_new_authority(self):
        from unittest.mock import patch
        from types import SimpleNamespace
        for selected in ({'location':0,'length':0},{'location':1,'length':1}):
            with self.subTest(selected=selected),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive);frame=_snap('binding','Document','https://example.com');calls=[]
                hand=SimpleNamespace(safari_activate=lambda:{'ok':True},read_focused_text=lambda focus:{'value':'AB','selection':selected})
                with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'0'}),patch.object(FRAME,'_see',return_value=hand):
                    result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'literal'},perceive=lambda **kw:frame,hid_fn=lambda *a,**kw:calls.append(a) or {'ok':True})
                self.assertTrue(result['stale'],result);self.assertEqual(calls,[])

    def test_value_or_selection_change_at_native_fence_blocks_transport(self):
        from unittest.mock import patch
        base={'value':'AB','selection':{'location':1,'length':0}}
        changed=[{'value':'edited','selection':{'location':1,'length':0}}, {'value':'AB','selection':{'location':0,'length':0}}]
        for field in changed:
            for late in (False,True):
                with self.subTest(field=field,late=late),tempfile.TemporaryDirectory() as tmp:
                    hive=Path(tmp);(hive/'bus').mkdir();gen=_arm(hive);frame=_snap('binding','Document','https://example.com')
                    def hid(action,hive=None,gen=None):return SEE.mac_act('type',text=action['text'],hive=hive,gen=gen)
                    values=[base,field] if late else [field]
                    app={'ok':True,'app':'Safari','focus':dict(frame['state']['focus'])}
                    with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'1'}),patch.object(SEE,'_dry_mac',return_value=False),patch.object(SEE,'frontmost_app',return_value=app),patch.object(SEE,'read_focused_text',side_effect=values),patch.object(SEE,'_type_into_focused_field',return_value={'ok':True}) as transport:
                        result=FRAME.commit_watch_stroke(hive,gen,frame,{'op':'type','text':'literal'},perceive=lambda **kw:frame,hid_fn=hid)
                    transport.assert_not_called();self.assertFalse(result['hid']);self.assertEqual(_bus(hive)['watch']['ledger'],{})


if __name__ == "__main__":
    unittest.main()
