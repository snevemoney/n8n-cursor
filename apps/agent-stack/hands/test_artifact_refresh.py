import importlib.util, json, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("ar_t", Path(__file__).with_name("artifact_refresh.py"))
R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)


class Refresh(unittest.TestCase):  # Evens 10-16: trackers, scores, tokens/week stay current without anyone asking
    def test_changed_output_rotates_history_and_updates_index(self):
        root = Path(tempfile.mkdtemp()); f = root / "Jarvis" / "credits"; f.mkdir(parents=True)
        (f / "credits.html").write_text("<p>old</p>"); (f / "refresh.json").write_text(json.dumps({"command": "printf '<p>new</p>'"}))
        (root / "INDEX.md").write_text("# Jarvis artifacts\n\n- [Credits](Jarvis/credits/credits.html) — html, updated 2026-10-16 23:00\n")
        got = R.refresh_all(root)
        self.assertEqual(got["refreshed"], ["credits"]); self.assertEqual((f / "credits.html").read_text(), "<p>new</p>")
        self.assertEqual(len(list((f / "history").glob("*.html"))), 1)
        self.assertIn("refreshed", (root / "INDEX.md").read_text())
        self.assertEqual(R.refresh_all(root)["unchanged"], ["credits"])      # same output: nothing rotates

    def test_a_failing_command_is_reported_and_the_page_kept(self):
        root = Path(tempfile.mkdtemp()); f = root / "Jarvis" / "x"; f.mkdir(parents=True)
        (f / "x.md").write_text("keep"); (f / "refresh.json").write_text(json.dumps({"command": "exit 3"}))
        got = R.refresh_all(root)
        self.assertTrue(got["failed"] and "exit 3" in got["failed"][0]); self.assertEqual((f / "x.md").read_text(), "keep")


if __name__ == "__main__":
    unittest.main()
