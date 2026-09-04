#!/usr/bin/env python3
"""Vault retrieve allow-list. Hot files only. No dirty scoop."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "retrieve.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_retrieve", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class RetrieveAllowListTest(unittest.TestCase):
    def test_hits_hot_files_not_desk(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-retrieve-") as tmp:
            root = Path(tmp)
            (root / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n"
                "Evens is the operator of this vault.\n",
                encoding="utf-8",
            )
            (root / "NORTH_STAR.md").write_text(
                "The plan is one person, many agents.\n",
                encoding="utf-8",
            )
            steal = root / "CONTENT" / "watch-later"
            steal.mkdir(parents=True)
            (steal / "STEAL_SHEET.md").write_text(
                "Steal: talk to the visualizer, it answers from memory.\n",
                encoding="utf-8",
            )
            dirty = root / "hive" / "desk"
            dirty.mkdir(parents=True)
            (dirty / "SECRET.md").write_text("purple zebra protocol lives here\n", encoding="utf-8")
            chatgpt = root / ".data" / "chatgpt"
            chatgpt.mkdir(parents=True)
            (chatgpt / "chat.md").write_text("purple zebra protocol from ChatGPT\n", encoding="utf-8")
            files = [str(p) for p in MOD.candidate_files([root])]
            self.assertTrue(any(p.endswith("OPERATOR_MEMORY.md") for p in files))
            self.assertTrue(any(p.endswith("NORTH_STAR.md") for p in files))
            self.assertTrue(any("STEAL_SHEET.md" in p for p in files))
            self.assertFalse(any("hive/desk" in p.replace("\\", "/") for p in files))
            self.assertFalse(any(".data" in p for p in files))
            hit = MOD.search("what is the plan", [root])
            self.assertFalse(hit.get("unknown"))
            spoken = (hit.get("spoken") or "").lower()
            self.assertTrue("one person" in spoken or "north star" in spoken or "leverage" in spoken, spoken)
            who = MOD.search("who am I", [root])
            self.assertFalse(who.get("unknown"))
            stars = MOD.search("what are the north stars", [root])
            self.assertIn("OPERATOR_MEMORY.md", (stars.get("hits") or [{}])[0].get("path", ""))
            miss = MOD.search("what is the purple zebra protocol", [root])
            self.assertTrue(miss.get("unknown"))
            self.assertIn("UNKNOWN", miss.get("spoken") or "")


if __name__ == "__main__":
    unittest.main()
