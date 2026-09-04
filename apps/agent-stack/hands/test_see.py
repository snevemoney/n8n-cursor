#!/usr/bin/env python3
"""Safari/see unit tests. No headed Safari. No Chrome."""
from __future__ import annotations

import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "see.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_see", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class SeeTest(unittest.TestCase):
    def test_safari_open_rejects_non_http(self) -> None:
        out = MOD.safari_open("file:///etc/passwd")
        self.assertFalse(out["ok"])
        self.assertIn("http", out["spoken"])

    def test_safari_front_parses_title_url(self) -> None:
        proc = mock.Mock(returncode=0, stdout="Example\nhttps://example.com\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.safari_front()
        self.assertTrue(out["ok"])
        self.assertEqual(out["title"], "Example")
        self.assertEqual(out["url"], "https://example.com")
        self.assertNotIn("Chrome", out["spoken"])

    def test_grab_screen_writes_path(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-see-") as tmp:
            hive = Path(tmp)
            dest = hive / "bus" / "see.jpg"
            dest.parent.mkdir()

            def fake_run(argv, timeout=20.0):
                Path(argv[-1]).write_bytes(b"jpg")
                return subprocess.CompletedProcess(argv, 0, "", "")

            with mock.patch.object(MOD, "_run", side_effect=fake_run):
                out = MOD.grab_screen(hive)
            self.assertTrue(out["ok"])
            self.assertTrue(Path(out["path"]).is_file())

    def test_see_block_names_image(self) -> None:
        block = MOD.see_block(
            {
                "safari": {"title": "Hive", "url": "https://evenslouis.ca"},
                "screen": {"path": "/tmp/see.jpg"},
            }
        )
        self.assertIn("Safari only", block)
        self.assertNotIn("Use Chrome", block)
        self.assertIn("https://evenslouis.ca", block)
        self.assertIn("/tmp/see.jpg", block)


if __name__ == "__main__":
    unittest.main()
