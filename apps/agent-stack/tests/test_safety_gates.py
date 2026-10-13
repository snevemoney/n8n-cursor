#!/usr/bin/env python3
"""Verify-round safety: sandboxed code_run, confirm-before-act, screen file deleted, loop allowlist."""
from __future__ import annotations

import importlib.util
import os
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]
os.environ["JARVIS_MEMORY_FILE"] = os.path.join(tempfile.mkdtemp(prefix="jarvis-test-mem-"), "memory.json")


def _load(name: str, rel: str):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


CODE = _load("safety_code_run", "hands/code_run.py")
SCREEN = _load("safety_screen_see", "hands/screen_see.py")
LOOP = _load("safety_loop", "hands/loop.py")
HAS_SANDBOX = bool(shutil.which("sandbox-exec")) and sys.platform == "darwin"


class CodeRunSandboxTest(unittest.TestCase):
    def test_refuses_without_sandbox_exec(self) -> None:
        with mock.patch.object(CODE, "SANDBOX", None):
            got = CODE.run({"code": "print(1)"})
        self.assertFalse(got["ran"])
        self.assertIn("Nothing ran", got["spoken"])

    def test_profile_denies_home_reads_but_allows_scratch(self) -> None:
        prof = CODE._profile("/tmp/x-scratch")
        home = os.path.realpath(os.path.expanduser("~"))
        self.assertIn(f'(deny file-read* ', prof)
        self.assertIn(f'(subpath "{home}")', prof)
        self.assertIn('(allow file-read* (subpath "/tmp/x-scratch")', prof)

    @unittest.skipUnless(HAS_SANDBOX, "macOS sandbox-exec only")
    def test_code_cannot_read_home(self) -> None:
        home = os.path.realpath(os.path.expanduser("~"))
        got = CODE.run({"code": f"import os\nprint(os.listdir({home!r}))"})
        self.assertTrue(got["ran"])
        self.assertFalse(got["passed"])
        self.assertIn("Operation not permitted", got["stderr"])

    @unittest.skipUnless(HAS_SANDBOX, "macOS sandbox-exec only")
    def test_timeout_kills_the_whole_process_group(self) -> None:
        marker = f"jarvis-orphan-{os.getpid()}-{int(time.time())}"
        code = (f"import subprocess, time\nsubprocess.Popen(['/bin/sh', '-c', 'exec -a {marker} /bin/sleep 120'])\n"
                "time.sleep(60)\n")
        with mock.patch.object(CODE, "TIME_CAP", 2):
            got = CODE.run({"code": code})
        self.assertTrue(got["timed_out"])
        time.sleep(0.5)
        left = subprocess.run(["pgrep", "-f", marker], capture_output=True, text=True).stdout.strip()
        self.assertEqual(left, "")


class ScreenSeeTest(unittest.TestCase):
    def test_screenshot_is_deleted_after_describe(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            shot = Path(tmp) / "bus" / "see.jpg"
            shot.parent.mkdir()
            shot.write_bytes(b"\xff\xd8fakejpeg")
            got = SCREEN.run({}, hive=Path(tmp), grab_fn=lambda h, bounds=None: {"ok": True, "path": str(shot)},
                             vision_fn=lambda p, images: "A code editor.")
            self.assertTrue(got["ok"])
            self.assertFalse(shot.exists())

    def test_screenshot_is_deleted_when_vision_is_dark(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            shot = Path(tmp) / "see.jpg"
            shot.write_bytes(b"\xff\xd8fakejpeg")
            SCREEN.run({}, hive=Path(tmp), grab_fn=lambda h, bounds=None: {"ok": True, "path": str(shot)}, vision_fn=None)
            self.assertFalse(shot.exists())


class LoopGuardTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.env = mock.patch.dict(os.environ, {"JARVIS_LOOPS_FILE": str(Path(self.tmp.name) / "loops.json")})
        self.env.start()

    def tearDown(self) -> None:
        self.env.stop()
        self.tmp.cleanup()

    def test_allowlist_refuses_unknown_subjects(self) -> None:
        self.assertFalse(LOOP.run({"op": "start", "what": "opens my mail and summarizes it"})["ok"])
        self.assertFalse(LOOP.run({"op": "start", "what": "checks disk space then deletes logs"})["ok"])
        self.assertTrue(LOOP.run({"op": "start", "what": "checks disk space"})["ok"])

    def test_bad_ints_and_max_runs_cap(self) -> None:
        got = LOOP.run({"op": "start", "what": "checks battery", "every_min": "soon", "max_runs": "1e9"})
        self.assertTrue(got["ok"])
        self.assertEqual(got["loop"]["every_min"], 15)
        self.assertEqual(got["loop"]["max_runs"], LOOP.MAX_RUNS_CAP)
        self.assertTrue(LOOP.run({"op": "start", "what": "checks uptime", "every_min": "inf"})["ok"])

    def test_cancel_needs_an_exact_match(self) -> None:
        LOOP.run({"op": "start", "what": "checks disk space"})
        self.assertFalse(LOOP.run({"op": "cancel", "id": "disk"})["ok"])
        self.assertTrue(LOOP.run(LOOP.args_from_utterance("Cancel the checks disk space loop."))["ok"])


class ConfirmGateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("AGENT_STACK_DRY_TTS", "1")
        cls.PIPE = _load("safety_pipeline", "brain/pipeline.py")

    def test_desk_dispatch_waits_for_confirm(self) -> None:
        P = self.PIPE
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            ask = "Ask Jev whether the tunnel is healthy."
            first = P.run_tool({"tool": "desk_dispatch", "args": {}}, ask, hive=hive, retrieve_roots=None)
            self.assertTrue(first.get("awaiting_confirm"))
            cards = hive / ".hive" / "bus" / "desk_cards"
            self.assertFalse(cards.exists() and any(cards.glob("*.json")))
            self.assertIsNone(P.confirm_take(hive, "what time is it"))  # any other turn drops it
            P.run_tool({"tool": "desk_dispatch", "args": {}}, ask, hive=hive, retrieve_roots=None)
            pick = P.confirm_take(hive, "confirm")
            self.assertEqual(pick["tool"], "desk_dispatch")
            done = P.run_tool(pick, "confirm", hive=hive, retrieve_roots=None)
            self.assertFalse(done.get("awaiting_confirm"))
            self.assertTrue(done["ok"], done)
            self.assertEqual(len(list(cards.glob("*.json"))), 1)
            self.assertIsNone(P.confirm_take(hive, "confirm"))  # one-shot

    def test_screen_see_waits_for_confirm(self) -> None:
        P = self.PIPE
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(P._screen_see_hand(), "run") as hand:
            got = P.run_tool({"tool": "screen_see", "args": {}}, "Describe my screen.", hive=Path(tmp), retrieve_roots=None)
            self.assertTrue(got.get("awaiting_confirm"))
            hand.assert_not_called()

    def test_model_chosen_code_waits_typed_code_runs(self) -> None:
        P = self.PIPE
        with tempfile.TemporaryDirectory() as tmp:
            got = P.run_tool({"tool": "code_run", "args": {"code": "print(2)"}}, "Write a python function and run it.",
                             hive=Path(tmp), retrieve_roots=None)
            self.assertTrue(got.get("awaiting_confirm"))
            self.assertIsNone(P._needs_confirm("code_run", {}, "run this python: print(3)"))

    def test_stale_confirm_is_dropped(self) -> None:
        P = self.PIPE
        with tempfile.TemporaryDirectory() as tmp:
            P.confirm_arm(Path(tmp), "screen_see", {}, "Describe my screen.")
            with mock.patch.object(P.time, "time", return_value=time.time() + P.CONFIRM_TTL_SEC + 5):
                self.assertIsNone(P.confirm_take(Path(tmp), "yes"))


if __name__ == "__main__":
    unittest.main()
