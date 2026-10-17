"""X40 graph reasoning / Z70 focus over a small vault."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("vg_t", Path(__file__).with_name("vault_graph.py"))
V = importlib.util.module_from_spec(spec); spec.loader.exec_module(V)


class VaultGraph(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        (self.root / "Hub.md").write_text("See [[Alpha]] and [[Beta|the beta]] and [[Missing Note]]. #project")
        (self.root / "Alpha.md").write_text("Back to [link](Hub.md) #project #idea")
        (self.root / "Beta.md").write_text("no links")
        (self.root / "Lonely.md").write_text("alone")
        (self.root / ".obsidian").mkdir(); (self.root / ".obsidian" / "x.md").write_text("[[Hub]]")

    def test_links_backlinks_orphans_dead_ends_unresolved_tags(self):
        a = lambda op, n="": V.answer(op, n, root=self.root)
        self.assertEqual(a("backlinks", "hub")["items"], ["Alpha"])
        self.assertEqual(sorted(a("links", "Hub")["items"]), ["Alpha", "Beta"])
        self.assertIn("Lonely", a("orphans")["text"]); self.assertNotIn("Beta", a("orphans")["text"])
        self.assertIn("Beta", a("dead_ends")["text"])
        self.assertIn("Missing Note (1)", a("unresolved")["text"])
        self.assertIn("#project (2)", a("tags")["text"])
        self.assertEqual(a("backlinks", "Lonely")["text"], "Nothing links to Lonely.")
        self.assertEqual(a("focus", "alp")["note"], "Alpha")
        self.assertFalse(a("focus", "nope")["ok"])


if __name__ == "__main__":
    unittest.main()
