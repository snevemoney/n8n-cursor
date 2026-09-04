#!/usr/bin/env python3
"""Voice OS conductor tests. No mic. No live browser. No live mouse."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

os.environ["VOICE_OS_DRY_HANDS"] = "1"

SCRIPT = Path(__file__).resolve().parents[1] / "os" / "voice-os.py"


def _load():
    spec = importlib.util.spec_from_file_location("voice_os", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class VoiceOsTest(unittest.TestCase):
    def test_self_test(self) -> None:
        out = MOD.self_test()
        self.assertTrue(out["ok"], out)

    def test_refuse_hard_step(self) -> None:
        plan = MOD.classify("please send this email and deploy live")
        self.assertEqual(plan["verb"], "refuse")

    def test_watch_and_browse_ask(self) -> None:
        self.assertEqual(MOD.classify("watch https://youtu.be/ud7wzdiM0gk")["verb"], "watch")
        self.assertTrue(MOD.classify("browse https://example.com")["needs_ask"])

    def test_file_sandbox(self) -> None:
        self.assertIsNone(MOD.resolve_allowed("/etc/passwd"))
        self.assertIsNone(MOD.resolve_allowed(".env"))
        allowed = MOD.resolve_allowed("docs/hive/outer-heaven/CONTENT/os/hot.md")
        self.assertIsNotNone(allowed)

    def test_approved_browse_queues_job(self) -> None:
        with tempfile.TemporaryDirectory(prefix="voice-os-job-") as tmp:
            hive = Path(tmp)
            vault = {
                "ok": True,
                "source": "local",
                "path": str(MOD.ROOT),
                "oh": str(MOD.OS_DIR),
                "kind": "test",
            }
            adopted = MOD.STACK.adopt(hive=hive, vault=vault)
            self.assertTrue(adopted.get("ok"), adopted)
            out = MOD.apply_turn(
                "browse https://example.com/docs",
                approved=True,
                hive=hive,
            )
            self.assertTrue(out.get("ok"), out)
            self.assertFalse(out.get("ask"))
            self.assertTrue((hive / "bus" / "jobs.jsonl").is_file())

    def test_mouse_is_hands_on_not_refuse(self) -> None:
        plan = MOD.classify("take over my mouse")
        self.assertEqual(plan["verb"], "hands_on")
        self.assertTrue(plan["needs_ask"])
        self.assertEqual(MOD.classify("please send this email")["verb"], "refuse")

    def test_hands_ask_then_dry_click(self) -> None:
        with tempfile.TemporaryDirectory(prefix="voice-os-hands-") as tmp:
            hive = Path(tmp)
            vault = {
                "ok": True,
                "source": "local",
                "path": str(MOD.ROOT),
                "oh": str(MOD.OS_DIR),
                "kind": "test",
            }
            adopted = MOD.STACK.adopt(hive=hive, vault=vault)
            self.assertTrue(adopted.get("ok"), adopted)
            cold = MOD.apply_turn("click at 100 200", hive=hive)
            self.assertIn("Hands are off", cold.get("spoken") or "")
            asked = MOD.apply_turn("take the mouse", hive=hive)
            self.assertTrue(asked.get("ask"), asked)
            armed = MOD.apply_turn("take the mouse", approved=True, hive=hive)
            self.assertTrue(armed.get("hands_armed"), armed)
            clicked = MOD.apply_turn("click at 100 200", hive=hive)
            self.assertEqual(clicked.get("verb"), "click")
            self.assertTrue((clicked.get("hands") or {}).get("dry_run"), clicked)
            nameless = MOD.apply_turn("click the red button", hive=hive)
            self.assertIn("Point on the shared screen", nameless.get("spoken") or "")
            off = MOD.apply_turn("hands off", hive=hive)
            self.assertFalse(off.get("hands_armed"))


if __name__ == "__main__":
    unittest.main()
