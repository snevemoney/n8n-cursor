"""Acceptance test for the harmless repair-loop fixture."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


def _load_badge():
    path = Path(__file__).resolve().parents[1] / "os" / "repair_loop_fixture.py"
    spec = importlib.util.spec_from_file_location("repair_loop_fixture", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.badge


badge = _load_badge()


class TestRepairLoopFixture(unittest.TestCase):
    def test_badge_sign(self) -> None:
        self.assertEqual(badge(1), "ok")
        self.assertEqual(badge(-1), "bad")


if __name__ == "__main__":
    unittest.main()
