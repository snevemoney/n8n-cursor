#!/usr/bin/env python3
"""Last-wire is for Jarvis heal. Not spoken. Not a vault dump."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "last_wire.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_last_wire", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class LastWireTest(unittest.TestCase):
    def test_write_read_keeps_path_not_as_spoken_file(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-last-wire-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            row = MOD.write(
                hive,
                verb="safari",
                ok=False,
                human_line="Safari could not scroll.",
                wire={"path": "cgevent", "error": "CGEvent page key dark", "url": None, "scar": None},
                utterance="scroll",
            )
            self.assertEqual(row["verb"], "safari")
            self.assertFalse(row["ok"])
            self.assertFalse(row["retried"])
            self.assertEqual(row["wire"]["path"], "cgevent")
            got = MOD.read(hive)
            self.assertEqual(got["wire"]["path"], "cgevent")
            self.assertEqual(got["utterance"], "scroll")
            self.assertIn("cgevent", (hive / "bus" / "last-wire.json").read_text(encoding="utf-8"))

    def test_inspect_line_names_path_when_asked(self) -> None:
        line = MOD.inspect_line(
            {
                "verb": "safari",
                "ok": False,
                "wire": {"path": "cgevent", "scar": None, "url": None, "error": "page key dark"},
            }
        )
        self.assertIn("path=cgevent", line)
        self.assertIn("Last hand: safari", line)

    def test_write_read_keeps_job_id(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-last-wire-job-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            row = MOD.write(
                hive,
                verb="cursor_browser",
                ok=True,
                human_line="I'll have Cursor watch that tab.",
                wire={"path": "cursor-browser-job", "job_id": "cb-dQw4w9WgXcQ-test", "url": None, "scar": None, "error": None},
                utterance="watch this youtube",
            )
            self.assertEqual(row["wire"]["job_id"], "cb-dQw4w9WgXcQ-test")
            got = MOD.read(hive)
            self.assertEqual(got["wire"]["job_id"], "cb-dQw4w9WgXcQ-test")
            self.assertIn("job=cb-dQw4w9WgXcQ-test", MOD.inspect_line(got))


if __name__ == "__main__":
    unittest.main()
