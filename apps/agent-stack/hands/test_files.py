#!/usr/bin/env python3
"""Local file search tests. Never invent. Never scoop hive/desk."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "files.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_files", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class FilesTest(unittest.TestCase):
    def test_dry_never_invents(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_FILES_DRY": "1"}):
            out = MOD.search_files("search my computer for taxes")
        self.assertTrue(out["unknown"])
        self.assertIn("dry", out["spoken"])
        self.assertEqual(out["hits"], [])

    def test_walk_finds_name_and_skips_desk(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-files-") as tmp:
            root = Path(tmp)
            (root / "notes").mkdir()
            (root / "notes" / "invoice-ledger.md").write_text("studio retainers\n", encoding="utf-8")
            desk = root / "hive" / "desk"
            desk.mkdir(parents=True)
            (desk / "secret.md").write_text("do not scoop\n", encoding="utf-8")
            out = MOD.search_files("find invoice ledger", roots=[root])
        self.assertTrue(out["ok"])
        self.assertTrue(any("invoice-ledger.md" in h["path"] for h in out["hits"]))
        self.assertFalse(any("hive/desk" in h["path"] for h in out["hits"]))
        self.assertIn("invoice-ledger", out["spoken"])

    def test_miss_is_unknown(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-files-miss-") as tmp:
            root = Path(tmp)
            (root / "empty.txt").write_text("hello\n", encoding="utf-8")
            out = MOD.search_files("search my computer for zzznomatch999", roots=[root])
        self.assertTrue(out["unknown"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertNotIn("Mike Johnson", out["spoken"])

    def test_blocked_marks_include_desk(self) -> None:
        self.assertTrue(MOD._blocked(Path("/x/hive/desk/foo.md")))
        self.assertFalse(MOD._blocked(Path("/x/notes/foo.md")))


if __name__ == "__main__":
    unittest.main()
