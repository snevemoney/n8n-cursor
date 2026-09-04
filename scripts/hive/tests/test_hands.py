#!/usr/bin/env python3
"""Hands driver tests. Never post live CGEvents."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "os" / "hands.py"


def _load():
    spec = importlib.util.spec_from_file_location("hive_hands", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class HandsDryRunTest(unittest.TestCase):
    def test_dry_click_records_pixels(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hands-") as tmp:
            hive = Path(tmp)
            out = MOD.execute(action="click", x=120, y=80, dry_run=True, hive=hive)
            self.assertTrue(out["ok"], out)
            self.assertTrue(out["dry_run"])
            self.assertEqual(out["driver"], "dry_run")
            self.assertEqual(out["x"], 120)
            self.assertEqual(out["y"], 80)
            self.assertTrue((hive / "bus" / "hands.jsonl").is_file())

    def test_norm_needs_size_without_display(self) -> None:
        with tempfile.TemporaryDirectory(prefix="hands-") as tmp:
            hive = Path(tmp)
            out = MOD.execute(
                action="move",
                nx=0.5,
                ny=0.25,
                screen_w=2000,
                screen_h=1000,
                dry_run=True,
                hive=hive,
            )
            self.assertTrue(out["ok"], out)
            self.assertIsInstance(out["x"], int)
            self.assertIsInstance(out["y"], int)
            if not out.get("display"):
                self.assertEqual(out["x"], 999)
                self.assertEqual(out["y"], 250)

    def test_rejects_unknown_action(self) -> None:
        out = MOD.execute(action="type", x=1, y=1, dry_run=True)
        self.assertFalse(out["ok"])


if __name__ == "__main__":
    unittest.main()
