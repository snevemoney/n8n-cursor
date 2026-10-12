#!/usr/bin/env python3
"""craft is a real hand: the picker can name it and run_tool reaches hands/craft.py."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
import unittest.mock
from pathlib import Path

HERE = Path(__file__).resolve().parent


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


SERVE = _load("agent_stack_serve_craft_test", HERE.parent / "face" / "serve.py")
PIPE = _load("agent_stack_pipeline_craft_test", HERE / "pipeline.py")
ONLINE = _load("agent_stack_online_craft_test", HERE / "online.py")


class CraftWireTests(unittest.TestCase):
    def test_craft_is_a_hand_everywhere(self):
        self.assertIn("craft", PIPE.HANDS)
        self.assertIn("craft", ONLINE.openrouter_hand_names())
        self.assertTrue(callable(getattr(ONLINE, "call_openrouter_messages", None)))
        self.assertEqual(PIPE.extract_pick({"tool": "craft", "args": {"app": "gridcraft"}})["tool"], "craft")

    def test_face_wall_holds_for_open_craft(self):
        open_ev = {"partial": True, "done": False, "spoken": "", "verb": "craft"}
        self.assertTrue(SERVE.vault_read_inflight(open_ev))
        self.assertFalse(SERVE.vault_read_inflight({**open_ev, "done": True}))
        self.assertFalse(SERVE.vault_read_inflight({**open_ev, "verb": "cursor_ask"}))

    def test_run_tool_reaches_craft_hand(self):
        seen = {}

        def fake_run(args, utterance, *, model_fn):
            seen["args"] = args
            return {"ok": True, "spoken": "A1 shows 4.", "steps": [{"tool": "set_cell"}], "observed": "A1=4"}

        with tempfile.TemporaryDirectory() as tmp, unittest.mock.patch.object(PIPE.CRAFT, "run", fake_run):
            ran = PIPE.run_tool(
                {"tool": "craft", "args": {"app": "gridcraft", "task": "2+2 in A1"}, "speak": ""},
                "put 2 plus 2 in A1 in gridcraft",
                hive=Path(tmp),
                retrieve_roots=None,
                craft_model_fn=lambda messages, tools: {},
            )
        self.assertTrue(ran["ok"])
        self.assertEqual(ran["wires"], ["craft"])
        self.assertEqual(seen["args"]["app"], "gridcraft")
        self.assertEqual(ran["craft"]["observed"], "A1=4")

    def test_failed_craft_is_not_ok(self):
        with tempfile.TemporaryDirectory() as tmp, unittest.mock.patch.object(
            PIPE.CRAFT, "run", lambda args, utterance, *, model_fn: {"ok": False, "spoken": "gridcraft refused set_cell."}
        ):
            ran = PIPE.run_tool(
                {"tool": "craft", "args": {"app": "gridcraft", "task": "x"}, "speak": "Done!"},
                "x",
                hive=Path(tmp),
                retrieve_roots=None,
                craft_model_fn=lambda messages, tools: {},
            )
        self.assertFalse(ran["ok"])
        self.assertNotIn("Done", ran["spoken"])

    def test_hard_step_utterance_never_reaches_craft(self):
        called = []
        with tempfile.TemporaryDirectory() as tmp, unittest.mock.patch.object(
            PIPE.CRAFT, "run", lambda *a, **k: called.append(1) or {"ok": True, "spoken": ""}
        ):
            ran = PIPE.run_tool(
                {"tool": "craft", "args": {"app": "deckcraft", "task": "publish the deck"}, "speak": ""},
                "publish the deck",
                hive=Path(tmp),
                retrieve_roots=None,
                craft_model_fn=lambda messages, tools: {},
            )
        self.assertEqual(called, [])
        self.assertEqual(ran["tool"], "refuse_hard_step")


if __name__ == "__main__":
    unittest.main()
