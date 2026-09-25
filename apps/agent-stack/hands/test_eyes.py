#!/usr/bin/env python3
"""Eyes stays on the see.py read path. No Safari. No camera. No Face."""
from __future__ import annotations

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

EYES = Path(__file__).resolve().parent / "eyes.py"
SEE = Path(__file__).resolve().parent / "see.py"
ACT_NAMES = ("safari_act", "safari_open", "safari_click", "safari_type", "safari_scroll")


def _load(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


MOD = _load(EYES, "agent_stack_eyes")


class _Spy:
    def __init__(self) -> None:
        self.calls: list[str] = []

    def safari_front(self) -> dict:
        self.calls.append("safari_front")
        return {
            "ok": True,
            "open": True,
            "wire": "safari",
            "title": "Board",
            "url": "http://127.0.0.1:4018/",
            "spoken": "The front tab is Board.",
        }

    def safari_tabs(self) -> dict:
        self.calls.append("safari_tabs")
        return {
            "ok": True,
            "wire": "safari",
            "tabs": ["Board | http://127.0.0.1:4018/"],
            "spoken": "Safari tabs: Board | http://127.0.0.1:4018/.",
        }

    def grab_screen(self, hive: Path) -> dict:
        self.calls.append("grab_screen")
        return {
            "ok": True,
            "wire": "see",
            "path": str(hive / "bus" / "see.jpg"),
            "bytes": 4,
            "spoken": "I grabbed the screen.",
        }

    def safari_act(self, *_args, **_kwargs) -> dict:
        self.calls.append("safari_act")
        raise AssertionError("Eyes called safari_act")

    def safari_open(self, *_args, **_kwargs) -> dict:
        self.calls.append("safari_open")
        raise AssertionError("Eyes called safari_open")

    def safari_click(self, *_args, **_kwargs) -> dict:
        self.calls.append("safari_click")
        raise AssertionError("Eyes called safari_click")

    def safari_type(self, *_args, **_kwargs) -> dict:
        self.calls.append("safari_type")
        raise AssertionError("Eyes called safari_type")

    def safari_scroll(self, *_args, **_kwargs) -> dict:
        self.calls.append("safari_scroll")
        raise AssertionError("Eyes called safari_scroll")


class EyesTest(unittest.TestCase):
    def test_observe_returns_ui_evidence_and_does_not_act(self) -> None:
        spy = _Spy()
        out = MOD.observe(spy, hive=Path("/tmp/eyes-unused"), screen=False)
        self.assertFalse(out["acted"])
        self.assertEqual(out["wire"], "eyes")
        self.assertEqual(out["role"], "perception")
        self.assertEqual(out["tool"], "see")
        self.assertTrue(out["ok"])
        self.assertEqual([row["source"] for row in out["evidence"]], ["safari_front", "safari_tabs"])
        self.assertEqual(out["evidence"][0]["title"], "Board")
        self.assertEqual(out["evidence"][0]["url"], "http://127.0.0.1:4018/")
        self.assertEqual(spy.calls, ["safari_front", "safari_tabs"])

    def test_screen_adds_grab_and_still_does_not_act(self) -> None:
        spy = _Spy()
        with tempfile.TemporaryDirectory(prefix="eyes-") as tmp:
            out = MOD.observe(spy, hive=Path(tmp), screen=True)
        self.assertFalse(out["acted"])
        self.assertEqual(out["verb"], "screen")
        self.assertEqual(spy.calls, ["safari_front", "safari_tabs", "grab_screen"])
        screen = out["evidence"][2]
        self.assertEqual(screen["kind"], "screen")
        self.assertEqual(screen["source"], "grab_screen")
        self.assertEqual(screen["bytes"], 4)

    def test_act_verbs_refuse_without_calling_see(self) -> None:
        for verb in ("open", "click", "type", "scroll", "act", "arm"):
            with self.subTest(verb=verb):
                out = MOD.refuse(verb)
                self.assertFalse(out["ok"])
                self.assertFalse(out["acted"])
                self.assertEqual(out["evidence"], [])
                self.assertEqual(out["verb"], verb)

    def test_cli_click_refuses(self) -> None:
        code = MOD.main(["click", "Pay"])
        self.assertEqual(code, 2)

    def test_cli_observe_uses_real_see_reads(self) -> None:
        see = _load(SEE, "agent_stack_see_eyes_test")
        front = mock.Mock(returncode=0, stdout="Board\nhttp://127.0.0.1:4018/\n", stderr="")
        tabs = mock.Mock(returncode=0, stdout="Board | http://127.0.0.1:4018/\n", stderr="")

        def fake_run(argv, timeout=12.0):
            script = argv[2] if len(argv) > 2 else ""
            if "current tab" in script:
                return front
            return tabs

        with mock.patch.object(see, "_run", side_effect=fake_run):
            with mock.patch.object(MOD, "load_see", return_value=see):
                with mock.patch("sys.stdout") as stdout:
                    code = MOD.main(["observe", "--hive", "/tmp/eyes-hive-unused"])
        self.assertEqual(code, 0)
        written = "".join(call.args[0] for call in stdout.write.call_args_list)
        payload = json.loads(written)
        self.assertFalse(payload["acted"])
        self.assertEqual(payload["evidence"][0]["title"], "Board")
        self.assertNotIn("safari_act", payload["spoken"])

    def test_source_does_not_name_act_or_camera(self) -> None:
        text = EYES.read_text(encoding="utf-8")
        for name in (*ACT_NAMES, "getUserMedia", "camera", "screencapture"):
            self.assertNotIn(name, text)

    def test_real_see_grab_is_the_screen_tool(self) -> None:
        see = _load(SEE, "agent_stack_see_eyes_grab")
        with tempfile.TemporaryDirectory(prefix="eyes-grab-") as tmp:
            hive = Path(tmp)

            def fake_run(argv, timeout=20.0):
                if argv and argv[0] == "screencapture":
                    Path(argv[-1]).write_bytes(b"jpg")
                    return subprocess.CompletedProcess(argv, 0, "", "")
                if "current tab" in (argv[2] if len(argv) > 2 else ""):
                    return subprocess.CompletedProcess(argv, 0, "Board\nhttp://127.0.0.1:4018/\n", "")
                return subprocess.CompletedProcess(
                    argv, 0, "Board | http://127.0.0.1:4018/\n", ""
                )

            with mock.patch.object(see, "_run", side_effect=fake_run):
                out = MOD.observe(see, hive=hive, screen=True)
        self.assertFalse(out["acted"])
        self.assertTrue(out["evidence"][2]["ok"])
        self.assertTrue(out["evidence"][2]["path"].endswith("see.jpg"))


if __name__ == "__main__":
    unittest.main()
