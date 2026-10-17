"""canvas repomap: files and their most-used functions/classes, ranked by use."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("rm_t", Path(__file__).with_name("repo_map.py"))
R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)


class RepoMap(unittest.TestCase):
    def test_ranks_by_use_and_skips_vendor(self):
        d = Path(tempfile.mkdtemp())
        (d / "core.py").write_text("def load_task(x):\n    return x\n\nclass Planner:\n    pass\n\ndef rarely():\n    pass\n")
        (d / "app.py").write_text("from core import load_task, Planner\nload_task(1)\nload_task(2)\nPlanner()\n")
        (d / "ui.js").write_text("export function paintCard(a) {}\npaintCard(1); paintCard(2); paintCard(3);\n")
        (d / "node_modules").mkdir(); (d / "node_modules" / "x.js").write_text("function vendorThing() {}\n")
        got = R.answer(str(d))
        self.assertTrue(got["ok"])
        self.assertIn("load_task (1)", got["text"]); self.assertIn("Planner (1)", got["text"])
        self.assertNotIn("vendorThing", got["text"])
        (d / "test_core.py").write_text("def test_helper_thing():\n    load_task(3)\n")
        got = R.answer(str(d)); self.assertNotIn("test_helper_thing", got["text"]); self.assertIn("load_task (2)", got["text"])
        self.assertFalse(R.answer(str(d / "nope"))["ok"])


if __name__ == "__main__":
    unittest.main()
