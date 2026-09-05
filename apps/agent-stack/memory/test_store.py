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


class LifeCardTest(unittest.TestCase):
    def test_life_card_uses_lanes_and_never_invents_age(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_life", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-life-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            out = ret.life_card([vault])
        self.assertIn("Evens", out["spoken"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("Age", out["spoken"])
        self.assertNotRegex(out["spoken"], r"\b(2[0-9]|[3-8][0-9])\s+years old\b")

    def test_news_signals_unknown_never_invents_headline(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_news", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-news-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text("north stars only\n", encoding="utf-8")
            out = ret.news_signals("what's the news", [vault])
        self.assertTrue(out["unknown"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("will not invent headlines", out["spoken"].lower())
        self.assertNotIn("breaking", out["spoken"].lower())


class SpeakStoreTest(unittest.TestCase):
    def test_asks_and_timestamps_are_not_spoken(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_speak", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-speak-") as tmp:
            vault = Path(tmp)
            (vault / "CONTENT/os").mkdir(parents=True)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "North star: maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            (vault / "CONTENT/os/ASKS.md").write_text(
                "- 22:48 — If you don't know how to build your own agentic OS, "
                "then you are falling behind. Jarvis setup is not the value.\n",
                encoding="utf-8",
            )
            greet = ret.speak_store("He's Jarvis", [vault], greet=True)
            found = ret.search("He's Jarvis", [vault])
        self.assertNotIn("adopted path missing", greet.lower())
        self.assertNotIn("22:48", greet)
        self.assertNotIn("agentic OS", greet)
        self.assertIn("here", greet.lower())
        self.assertTrue(found.get("brief"))
        self.assertTrue(ret.is_speak_leak(str(found.get("brief") or "")) or "22:48" in str(found.get("brief") or ""))
        self.assertNotIn("22:48", found.get("spoken") or "")
        self.assertNotIn("agentic OS", found.get("spoken") or "")


if __name__ == "__main__":
    unittest.main()
