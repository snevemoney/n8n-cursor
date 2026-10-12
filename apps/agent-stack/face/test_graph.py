#!/usr/bin/env python3
"""CEO force-graph from the on-disk index. No Prompt-Surfer. No graph.json write."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "graph.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_graph", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class GraphTest(unittest.TestCase):
    def test_ceo_accepts_prefix_and_bare_rooms(self) -> None:
        self.assertTrue(MOD.ceo_path("00_Outer_Heaven/PROJECTS/scorpion.md"))
        self.assertTrue(MOD.ceo_path("PROJECTS/scorpion.md"))
        self.assertTrue(MOD.ceo_path("CONTENT/VAULT_MAP.md"))
        self.assertFalse(MOD.ceo_path("CONTENT/job-cards/takes/forge.md"))
        self.assertFalse(MOD.ceo_path("CURSOR_CHATS/n8n-cursor/foo.md"))

    def test_force_graph_from_fixture(self) -> None:
        with tempfile.TemporaryDirectory(prefix="face-graph-") as tmp:
            idx = Path(tmp) / "graph-index.json"
            idx.write_text(
                json.dumps(
                    {
                        "nodes": {
                            "VAULT_MAP": {"path": "CONTENT/VAULT_MAP.md", "links": ["scorpion"]},
                            "scorpion": {"path": "PROJECTS/scorpion.md", "links": ["VAULT_MAP"]},
                            "noise": {"path": "CURSOR_CHATS/skip.md", "links": ["VAULT_MAP"]},
                        },
                        "edges": [
                            {"from": "VAULT_MAP", "to": "scorpion", "sourcePath": "CONTENT/VAULT_MAP.md"},
                            {"from": "noise", "to": "VAULT_MAP", "sourcePath": "CURSOR_CHATS/skip.md"},
                        ],
                    }
                ),
                encoding="utf-8",
            )
            out = MOD.force_graph(index_path=idx)
        ids = {n["id"] for n in out["nodes"]}
        self.assertTrue(out["ok"])
        self.assertIn("CONTENT/VAULT_MAP.md", ids)
        self.assertIn("PROJECTS/scorpion.md", ids)
        self.assertNotIn("CURSOR_CHATS/skip.md", ids)
        self.assertEqual(out["linkCount"], 1)
        self.assertEqual(out["nodes"][0]["color"].startswith("#"), True)

    def test_live_index_has_nodes(self) -> None:
        if not MOD.INDEX.is_file():
            self.skipTest("graph-index.json missing")
        out = MOD.force_graph()
        self.assertTrue(out["ok"])
        self.assertGreaterEqual(out["nodeCount"], 8)
        self.assertGreaterEqual(out["linkCount"], 1)

    def test_nodes_are_not_pinned_in_place(self) -> None:
        if not MOD.INDEX.is_file():
            self.skipTest("graph-index.json missing")
        out = MOD.force_graph()
        for node in out["nodes"]:
            self.assertNotIn("fx", node)
            self.assertNotIn("fy", node)
            self.assertNotIn("fz", node)


if __name__ == "__main__":
    unittest.main()
