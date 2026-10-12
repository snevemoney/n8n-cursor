#!/usr/bin/env python3
"""Stop is one generation fence. Real dry Watch. Mocked mouse only. Temp hive only."""
from __future__ import annotations

import importlib.util
import json
import os
import random
import tempfile
import threading
import time
import unittest
import unittest.mock
from pathlib import Path

TURN = Path(__file__).resolve().parent.parent / "mouth" / "turn.py"
PIPE_SRC = Path(__file__).resolve().parent / "pipeline.py"
PANE = Path(__file__).resolve().parent.parent / "face" / "pane.html"


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOUTH = _load("agent_stack_mouth_watch_stop", TURN)
PIPE = MOUTH.PIPELINE
SENSES = PIPE.SENSES
VOICE = MOUTH.VOICE


def _bus(hive: Path) -> dict:
    path = hive / "bus" / "state.json"
    if not path.is_file():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _arm_evens(hive: Path) -> int:
    gen = PIPE.begin_turn(hive)
    out = SENSES.set_watch_arm(True, hive=hive, gen=gen, evens=True)
    if not out.get("armed"):
        raise AssertionError(f"Evens arm failed: {out}")
    if hasattr(SENSES, "set_watch_allow"):
        SENSES.set_watch_allow("*", always=True, hive=hive, gen=gen)
    return gen


class WatchStopTest(unittest.TestCase):
    def setUp(self) -> None:
        os.environ["AGENT_STACK_DRY_WATCH"] = "1"
        os.environ["AGENT_STACK_DRY_TTS"] = "1"
        self._act = getattr(PIPE.SEE, "mac_act", None)
        self._snap = getattr(PIPE.SEE, "snapshot", None)
        self.clicks: list = []

        def fake_act(*args, **kwargs):
            hive = kwargs.get("hive")
            gen = kwargs.get("gen")
            gate = kwargs.get("gate")
            if gate is not None and not gate():
                return {"ok": False, "spoken": "Stopped. Standing by.", "op": "stop", "wire": "mac_act"}
            if hive is not None:
                if PIPE.act_if_current(hive, gen, lambda bus: bus) is None:
                    return {"ok": False, "spoken": "Stopped. Standing by.", "op": "stop", "wire": "mac_act"}
            self.clicks.append((args, kwargs))
            return {"ok": True, "spoken": "clicked", "op": "click", "wire": "mac_act"}

        def forbid_snap(*args, **kwargs):
            raise AssertionError("desktop snapshot is forbidden in dry watch-stop tests")

        PIPE.SEE.mac_act = fake_act
        PIPE.SEE.snapshot = forbid_snap

    def tearDown(self) -> None:
        if self._act is not None:
            PIPE.SEE.mac_act = self._act
        if self._snap is not None:
            PIPE.SEE.snapshot = self._snap
        os.environ.pop("AGENT_STACK_DRY_WATCH", None)
        os.environ.pop("AGENT_STACK_DRY_TTS", None)

    def _healthy_ping(self, hive: Path) -> None:
        self.assertFalse(_bus(hive).get("watch", {}).get("armed"))
        gen = PIPE.begin_turn(hive)
        PIPE.write_bus(
            hive,
            phase="speak",
            job_status="done",
            utterance="ping",
            spoken="Pong.",
            gen=gen,
        )
        recovered = _bus(hive)
        self.assertEqual(recovered.get("spoken"), "Pong.")
        self.assertEqual(recovered.get("job_status"), "done")

    def test_loop_source_never_rearms(self) -> None:
        text = PIPE_SRC.read_text(encoding="utf-8")
        start = text.find("def run_watch_loop")
        end = text.find("\ndef cursor_fn_ask_fallback", start)
        body = text[start:end]
        self.assertNotIn("arm=True", body)
        self.assertNotIn("set_watch_arm(True", body)
        self.assertIn("_disarm_watch(hive", body)
        self.assertIn("act_if_current", PIPE_SRC.read_text(encoding="utf-8"))

    def test_begin_turn_arm_watch_false_after_cancel(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stop-begin-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            _arm_evens(hive)
            self.assertTrue(_bus(hive)["watch"]["armed"])
            PIPE.cancel_turn(hive)
            self.assertFalse(_bus(hive)["watch"]["armed"])
            PIPE.begin_turn(hive, arm_watch=True)
            self.assertFalse(_bus(hive)["watch"]["armed"])
            spoken = MOUTH.apply_turn("Watch", hive=hive)
            self.assertIn("Tap Watch", spoken.get("spoken") or "")
            self.assertFalse(_bus(hive)["watch"]["armed"])
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_vision_dark_end_disarms(self) -> None:
        def talk_fn(prompt, pack="", images=None, **kw):
            _ = (prompt, pack, images, kw)
            return {"ok": False, "unknown": True, "spoken": "UNKNOWN. Vision model is dark."}

        with tempfile.TemporaryDirectory(prefix="watch-stop-dark-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm_evens(hive)
            self.assertTrue(_bus(hive)["watch"]["armed"])
            got = PIPE.run_watch_loop("Watch", hive=hive, talk_fn=talk_fn, gen=gen)
            bus = _bus(hive)
        self.assertFalse(got.get("cancelled"))
        self.assertIn("Vision model is dark", got.get("spoken") or "")
        self.assertTrue(bus["watch"]["armed"])
        self.assertTrue(bus["watch"].get("held"))
        self.assertEqual(self.clicks, [])

    def test_orb_front_still_never_becomes_a_vision_call(self) -> None:
        def talk_fn(prompt, pack="", images=None, **kw):
            raise AssertionError(f"Orb self-still must not call vision: {prompt!r} {images!r} {kw!r}")

        def see_fn(*, hive, gen=None):
            _ = (hive, gen)
            return {
                "ok": True,
                "app": "JarvisOrb",
                "title": "Orb",
                "bytes": 750000,
                "spoken": "I grabbed the screen.",
                "state": {"app": "JarvisOrb", "title": "Orb"},
                "screen": {"bytes": 750000, "state": {"app": "JarvisOrb", "title": "Orb"}},
            }

        with tempfile.TemporaryDirectory(prefix="watch-stop-orb-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm_evens(hive)
            got = PIPE.run_watch_loop("Watch", hive=hive, talk_fn=talk_fn, see_fn=see_fn, gen=gen)
            bus = _bus(hive)
        self.assertIn("Orb", got.get("spoken") or "")
        self.assertIn("work window", (got.get("spoken") or "").lower())
        self.assertNotIn("Vision model is dark", got.get("spoken") or "")
        self.assertTrue(bus["watch"]["armed"])
        self.assertEqual(self.clicks, [])

    def test_watch_loop_does_not_rearm_or_click_after_stop_during_talk(self) -> None:
        released = threading.Event()
        resume = threading.Event()
        got: dict = {}

        def talk_fn(prompt, pack="", images=None, **kw):
            _ = (prompt, pack, images, kw)
            released.set()
            self.assertTrue(resume.wait(2), "stop never released the model wait")
            return {
                "tool": "mac_act",
                "args": {"op": "click", "x": 12, "y": 40},
                "speak": "I clicked.",
            }

        with tempfile.TemporaryDirectory(prefix="watch-stop-loop-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm_evens(hive)

            def run():
                got.update(
                    PIPE.run_watch_loop("click the button", hive=hive, talk_fn=talk_fn, gen=gen)
                )

            worker = threading.Thread(target=run)
            worker.start()
            self.assertTrue(released.wait(2), "talk_fn never blocked")
            stop_gen = PIPE.cancel_turn(hive)
            stop = MOUTH._door_speak(
                hive, "stop", "Stopped. Standing by.", "stop", gen=stop_gen
            )
            resume.set()
            worker.join(3)
            self.assertFalse(worker.is_alive())
            bus = _bus(hive)
        self.assertTrue(got.get("cancelled"))
        self.assertEqual(stop["verb"], "stop")
        self.assertEqual(self.clicks, [])
        self.assertFalse(bus["watch"]["armed"])
        self.assertIn("Stopped", bus.get("spoken") or "")
        self.assertNotIn("I clicked.", bus.get("spoken") or "")
        self._healthy_ping(hive)

    def test_mac_act_cancelled_between_check_and_click(self) -> None:
        released = threading.Event()
        resume = threading.Event()

        def slow_act(*args, **kwargs):
            released.set()
            self.assertTrue(resume.wait(2), "stop never released mac_act wait")
            hive = kwargs.get("hive")
            gen = kwargs.get("gen")
            if PIPE.act_if_current(hive, gen, lambda bus: bus) is None:
                return {"ok": False, "spoken": "Stopped. Standing by.", "op": "stop", "wire": "mac_act"}
            self.clicks.append((args, kwargs))
            return {"ok": True, "spoken": "clicked", "op": "click", "wire": "mac_act"}

        PIPE.SEE.mac_act = slow_act
        with tempfile.TemporaryDirectory(prefix="watch-stop-toctou-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = _arm_evens(hive)
            pick = {"tool": "mac_act", "args": {"op": "click", "x": 4, "y": 4}, "speak": "click"}
            box: dict = {}

            def run():
                # This cancellation test reaches HID only with an identified,
                # authorized work app; an anonymous frame must fail earlier.
                snap = PIPE.FRAME.stamp_dry(seed="stop-race", app="Safari", safari={"title":"Document", "url":"https://example.com"})
                box.update(PIPE.run_tool(pick, "click", hive=hive, retrieve_roots=None, gen=gen,
                                         see_fn=lambda **kwargs: snap))

            worker = threading.Thread(target=run)
            worker.start()
            self.assertTrue(released.wait(2), "mac_act never blocked")
            PIPE.cancel_turn(hive)
            resume.set()
            worker.join(3)
            self.assertFalse(worker.is_alive())
            bus = _bus(hive)
            self.assertEqual(self.clicks, [])
            self.assertFalse(bus["watch"]["armed"])
            self.assertIn("Stopped", box.get("spoken") or bus.get("spoken") or "")
            self._healthy_ping(hive)

    def test_run_watch_in_flight_gen_none_after_cancel(self) -> None:
        for _ in range(100):
            with tempfile.TemporaryDirectory(prefix="watch-stop-inflight-") as tmp:
                hive = Path(tmp)
                (hive / "bus").mkdir(parents=True)
                start = _arm_evens(hive)
                PIPE.cancel_turn(hive)
                stale = SENSES.run_watch(hive=hive, grab=True, arm=True, gen=None)
                stale_evens = SENSES.run_watch(hive=hive, grab=True, arm=True, gen=None, evens=True)
                stale2 = SENSES.run_watch(hive=hive, grab=True, arm=True, gen=start, evens=True)
                self.assertFalse(stale.get("armed"))
                self.assertTrue(stale.get("cancelled"))
                self.assertFalse(stale_evens.get("armed"))
                self.assertTrue(stale_evens.get("cancelled"))
                self.assertFalse(stale2.get("armed"))
                fresh = PIPE.peek_gen(hive)
                evens = SENSES.run_watch(hive=hive, grab=True, arm=True, gen=fresh, evens=True)
                self.assertTrue(evens.get("armed"), evens)
                self.assertTrue(_bus(hive)["watch"]["armed"])
                PIPE.cancel_turn(hive)
                self._healthy_ping(hive)

    def test_stale_write_bus_after_stop_does_not_overwrite(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stop-stale-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            old = _arm_evens(hive)
            stop_gen = PIPE.cancel_turn(hive)
            MOUTH._door_speak(hive, "stop", "Stopped. Standing by.", "stop", gen=stop_gen)
            PIPE.write_bus(
                hive,
                phase="speak",
                job_status="done",
                utterance="click the button",
                spoken="I clicked.",
                turns=[{"user": "click the button", "jarvis": "I clicked."}],
                gen=old,
            )
            MOUTH.bus_write(
                hive,
                phase="speak",
                job_status="done",
                utterance="click the button",
                permission_ask=None,
                spoken="I clicked.",
                turns=[{"user": "click the button", "jarvis": "I clicked."}],
                gen=old,
            )
            src = Path(tmp) / "note.txt"
            src.write_text("drop", encoding="utf-8")
            SENSES.save_drop([str(src)], hive=hive, gen=old)
            SENSES.save_eyes("data:image/jpeg;base64,ZmFrZQ==", hive=hive, gen=old)
            bus = _bus(hive)
            self.assertFalse(bus["watch"]["armed"])
            self.assertIn("Stopped", bus.get("spoken") or "")
            self.assertNotIn("I clicked.", bus.get("spoken") or "")
            self.assertFalse(
                any("I clicked." in str(row.get("jarvis") or "") for row in (bus.get("turns") or []))
            )
            self.assertFalse(any("[dropped" in str(row.get("user") or "") for row in (bus.get("turns") or [])))
            self.assertNotIn("path", (bus.get("eyes") or {}))
            self._healthy_ping(hive)

    def test_stop_then_healthy_ping(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stop-ping-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            _arm_evens(hive)
            PIPE.cancel_turn(hive)
            self._healthy_ping(hive)

    def test_rmw_interleavings_cannot_restore_armed(self) -> None:
        pairs = [(0.0, 0.04), (0.04, 0.0), (0.0, 0.0), (0.02, 0.01), (0.01, 0.03)]
        orders = [random.choice(pairs) for _ in range(100)]
        random.shuffle(orders)
        for stale_delay, stop_delay in orders:
            with self.subTest(stale_delay=stale_delay, stop_delay=stop_delay):
                with tempfile.TemporaryDirectory(prefix="watch-stop-rmw-") as tmp:
                    hive = Path(tmp)
                    (hive / "bus").mkdir(parents=True)
                    src = Path(tmp) / "note.txt"
                    src.write_text("drop", encoding="utf-8")
                    old = _arm_evens(hive)
                    errors: list[BaseException] = []

                    def stale():
                        try:
                            time.sleep(stale_delay)
                            PIPE.write_bus(
                                hive,
                                phase="speak",
                                job_status="done",
                                utterance="click",
                                spoken="I clicked.",
                                turns=[{"user": "click", "jarvis": "I clicked."}],
                                gen=old,
                            )
                            MOUTH.set_listen(hive, True, gen=old)
                            PIPE.SENSES.save_drop([str(src)], hive=hive, gen=old)
                        except BaseException as exc:  # noqa: BLE001
                            errors.append(exc)

                    def stop():
                        try:
                            time.sleep(stop_delay)
                            stop_gen = PIPE.cancel_turn(hive)
                            MOUTH._door_speak(
                                hive, "stop", "Stopped. Standing by.", "stop", gen=stop_gen
                            )
                            PIPE.SENSES.set_watch_arm(False, hive=hive, gen=old)
                        except BaseException as exc:  # noqa: BLE001
                            errors.append(exc)

                    workers = [threading.Thread(target=stale), threading.Thread(target=stop)]
                    for worker in workers:
                        worker.start()
                    for worker in workers:
                        worker.join(3)
                        self.assertFalse(worker.is_alive())
                    self.assertEqual(errors, [])
                    bus = _bus(hive)
                    self.assertFalse(bus.get("watch", {}).get("armed"))
                    self.assertIn("Stopped", bus.get("spoken") or "")
                    self.assertNotIn("I clicked.", bus.get("spoken") or "")
                    self._healthy_ping(hive)

    def test_public_writers_do_not_write_back_pre_stop_snapshot(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stop-fresh-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            old = _arm_evens(hive)
            snap = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            self.assertTrue(snap["watch"]["armed"])
            stop_gen = PIPE.cancel_turn(hive)
            MOUTH._door_speak(hive, "stop", "Stopped. Standing by.", "stop", gen=stop_gen)
            PIPE.write_bus(
                hive,
                phase="speak",
                job_status="done",
                utterance="click",
                spoken="I clicked.",
                turns=[{"user": "click", "jarvis": "I clicked."}],
                gen=old,
            )
            MOUTH.bus_write(
                hive,
                phase="speak",
                job_status="done",
                utterance="click",
                permission_ask=None,
                spoken="I clicked.",
                gen=old,
            )
            MOUTH.set_listen(hive, False, gen=old)
            bus = _bus(hive)
            self.assertTrue(snap["watch"]["armed"])
            self.assertFalse(bus["watch"]["armed"])
            self.assertIn("Stopped", bus.get("spoken") or "")
            self.assertNotIn("I clicked.", bus.get("spoken") or "")
            self._healthy_ping(hive)

    def test_tts_hang_then_speak(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        hung = {"n": 0}

        def hang(text: str, **kw):
            _ = (text, kw)
            hung["n"] += 1
            if hung["n"] == 1:
                time.sleep(8)
                return b"RIFF", "audio/wav"
            return b"RIFF" + b"\x00" * 12, "audio/wav"

        old_req = VOICE.TTS_REQUEST_SEC
        VOICE.TTS_REQUEST_SEC = 0.2
        try:
            with unittest.mock.patch.object(VOICE, "tts_audio", side_effect=hang):
                first = VOICE.tts_audio_bounded("Ready.")
                second = VOICE.tts_audio_bounded("Again.")
        finally:
            VOICE.TTS_REQUEST_SEC = old_req
            os.environ["AGENT_STACK_DRY_TTS"] = "1"
        self.assertEqual(first, (b"", ""))
        self.assertTrue(second[0].startswith(b"RIFF"))

    def test_tts_inflight_cancel_returns_empty(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_TTS", None)
        with tempfile.TemporaryDirectory(prefix="watch-stop-tts-inflight-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            gen = PIPE.begin_turn(hive)
            started = threading.Event()
            box: dict = {}

            def hang(text: str, **kw):
                _ = (text, kw)
                started.set()
                time.sleep(8)
                return b"RIFF" + b"\x00" * 12, "audio/wav"

            old_req = VOICE.TTS_REQUEST_SEC
            VOICE.TTS_REQUEST_SEC = 12
            try:
                with unittest.mock.patch.object(VOICE, "tts_audio", side_effect=hang):

                    def run():
                        box["out"] = VOICE.tts_audio_bounded("Ready.", gen=gen, hive=hive)
                        box["elapsed"] = time.time() - box["t0"]

                    box["t0"] = time.time()
                    worker = threading.Thread(target=run)
                    worker.start()
                    self.assertTrue(started.wait(2))
                    PIPE.cancel_turn(hive)
                    VOICE.cancel_tts()
                    worker.join(3)
            finally:
                VOICE.TTS_REQUEST_SEC = old_req
                os.environ["AGENT_STACK_DRY_TTS"] = "1"
            self.assertFalse(worker.is_alive())
            self.assertEqual(box.get("out"), (b"", ""))
            self.assertLess(box.get("elapsed") or 99, 2.5)
            last = PIPE.LAST_WIRE.read(hive) if PIPE.LAST_WIRE is not None else {}
            self.assertEqual(last.get("verb"), "stop")
            self._healthy_ping(hive)

    def test_tts_stale_gen_does_not_synthesize(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stop-tts-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            old = PIPE.begin_turn(hive)
            PIPE.cancel_turn(hive)
            VOICE.cancel_tts()
            audio, mime = VOICE.tts_audio("Hello", gen=old, hive=hive)
        self.assertEqual(audio, b"")
        self.assertEqual(mime, "")

    def test_pane_enqueue_does_not_retag(self) -> None:
        html = PANE.read_text(encoding="utf-8")
        self.assertNotIn("row.gen !== undefined ? row.gen : ttsGen", html)
        self.assertNotIn("row.gen !== undefined ? row.gen : gen", html)
        self.assertIn("const gen = ttsGen;", html.split("function enqueueSpeak", 1)[1][:200])
        self.assertIn("if (!item || item.gen === undefined || item.gen !== ttsGen) continue", html)

    def test_pane_playcloud_refuses_after_gen_bump(self) -> None:
        html = PANE.read_text(encoding="utf-8")
        body = html.split("async function playCloudBuf", 1)[1].split("async function speakCloud", 1)[0]
        self.assertIn("if (gen !== undefined && gen !== ttsGen) return false", body)
        self.assertLess(body.find("if (gen !== undefined && gen !== ttsGen) return false"), body.find("audio.play()"))
        self.assertIn("revealSpoken(text, gen)", body)
        self.assertGreater(body.find("revealSpoken"), body.find("if (gen !== undefined && gen !== ttsGen) return false"))
        self.assertIn("if (gen !== undefined && gen !== ttsGen) return;", html.split("function revealSpoken", 1)[1][:240])

    def test_pane_reconcile_leaves_think_when_done(self) -> None:
        html = PANE.read_text(encoding="utf-8")
        body = html.split("function reconcilePhase(bus)", 1)[1].split("async function refresh()", 1)[0]
        self.assertNotIn("if (!bus || ttsSpeaking() || state.listening) return", body)
        self.assertIn("bus.job_status !== \"working\"", body)
        self.assertIn("state.turning = false", body)
        self.assertIn('state.phase === "think"', body)
        self.assertNotIn("staleTurn", html)
        self.assertIn("postStop", html)

    def test_act_if_current_none_is_deny(self) -> None:
        with tempfile.TemporaryDirectory(prefix="watch-stop-deny-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            PIPE.begin_turn(hive)
            self.assertIsNone(PIPE.act_if_current(hive, None, lambda bus: bus))
            armed = SENSES.set_watch_arm(True, hive=hive, gen=None, evens=True)
            self.assertFalse(armed.get("armed"))

    def test_armed_watch_does_not_own_talk(self) -> None:
        seen: list[str] = []
        looked: list[str] = []

        def talk_fn(prompt, pack="", images=None, **kw):
            _ = (pack, images, kw)
            seen.append(str(prompt or ""))
            if "Watch cycle" in str(prompt or ""):
                return {"ok": True, "tool": "stop", "speak": "Watch waited.", "spoken": "Watch waited."}
            return {
                "ok": True,
                "wire": "openrouter",
                "engine": "openrouter",
                "spoken": "Check today's calendar, then one Hive-os priority.",
            }

        def see_fn(*, hive, gen=None):
            _ = (hive, gen)
            looked.append("see")
            return {
                "ok": True,
                "app": "TextEdit",
                "title": "Notes",
                "spoken": "I grabbed the screen.",
                "state": {"app": "TextEdit", "title": "Notes"},
            }

        morning = "Good morning. In one sentence, what is a sensible first move for today?"
        with tempfile.TemporaryDirectory(prefix="watch-stop-talk-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir(parents=True)
            _arm_evens(hive)
            self.assertTrue(_bus(hive)["watch"]["armed"])
            talked = MOUTH.apply_turn(morning, hive=hive, talk_fn=talk_fn, see_fn=see_fn)
            clicked = MOUTH.apply_turn(
                "click the save button",
                hive=hive,
                talk_fn=talk_fn,
                see_fn=see_fn,
            )
            bus = _bus(hive)
        self.assertTrue(seen)
        self.assertNotIn("Watch cycle", seen[0])
        self.assertIn("calendar", talked.get("spoken") or "")
        self.assertNotEqual(talked.get("verb"), "watch")
        self.assertNotIn("Orb", talked.get("spoken") or "")
        self.assertEqual(looked, ["see"])
        self.assertEqual(clicked.get("verb"), "watch")
        self.assertTrue(bus["watch"]["armed"])


if __name__ == "__main__":
    unittest.main()
