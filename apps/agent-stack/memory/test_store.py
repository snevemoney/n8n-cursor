#!/usr/bin/env python3
"""Store pack is the brain. No dump. No Cursor-as-skull."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "store.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_store", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class StorePackTest(unittest.TestCase):
    def test_hive_block_names_the_four(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-store-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "agent-stack.json").write_text(
                '{"name":"hive","operator":"Evens","repo":"/repo","vault":{"path":"/vault"}}\n',
                encoding="utf-8",
            )
            text = MOD.hive_block(hive)
        self.assertIn("Store (this is the brain)", text)
        self.assertIn("/vault", text)
        self.assertIn("/repo", text)
        self.assertIn("Hive: hive", text)

    def test_sessions_block_off_when_not_live(self) -> None:
        self.assertEqual(MOD.sessions_block(live=False), "")


if __name__ == "__main__":
    unittest.main()
