#!/usr/bin/env python3
"""Face tests. Localhost only. No headed mic proof."""
from __future__ import annotations

import importlib.util
import os
import unittest
from pathlib import Path

os.environ.pop("VOICE_OS_BIND", None)
SCRIPT = Path(__file__).resolve().parent / "serve.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_face", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class FaceServeTest(unittest.TestCase):
    def test_bind_is_localhost(self) -> None:
        self.assertEqual(MOD.HOST, "127.0.0.1")

    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)
        self.assertEqual(out.get("bind"), "127.0.0.1")
        self.assertEqual(out.get("home"), 200)

    def test_pane_is_tape_visualizer(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("<canvas", html)
        self.assertIn("J.A.R.V.I.S.", html)
        self.assertIn("TAP SPACE", html)
        self.assertIn("LISTENING FOR", html)
        self.assertNotIn("Desk · Face", html)
        self.assertNotIn("<h2>Observe</h2>", html)
        self.assertNotIn("<h2>Mouth</h2>", html)
        self.assertNotIn("Hold Home", html)
        self.assertNotIn("Hold Talk", html)

    def test_pane_hears_without_ptt_or_observe(self) -> None:
        html = (Path(__file__).resolve().parent / "pane.html").read_text(encoding="utf-8")
        self.assertIn("getUserMedia", html)
        self.assertIn("holdMic", html)
        self.assertIn("streamLive", html)
        self.assertIn("RESTART_MIN", html)
        self.assertIn("scheduleRestart", html)
        self.assertIn("rec.onerror", html)
        self.assertIn("rec.onend", html)
        self.assertIn("LISTENING", html)
        self.assertIn("Use Chrome", html)
        self.assertIn("state.armed", html)
        self.assertNotIn("if (state.live && !state.turning)", html)
        self.assertNotIn("bootMic()", html)
        self.assertNotIn("Hold Home", html)
        self.assertNotIn("<h2>Mouth</h2>", html)
        self.assertNotIn("getTracks().forEach((t) => t.stop())", html)
        self.assertNotIn("scheduleRestart(180)", html)
        self.assertNotIn("scheduleRestart(120)", html)


if __name__ == "__main__":
    unittest.main()
