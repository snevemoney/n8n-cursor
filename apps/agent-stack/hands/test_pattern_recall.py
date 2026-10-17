import importlib.util, json, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("pattern_recall_t", Path(__file__).with_name("pattern_recall.py"))
R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)

class PatternRecall(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.f = Path(self.tmp.name) / "c.jsonl"
        rows = [("2026-09-01T10:00Z", "codex", "push it to main tonight"),
                ("2026-09-02T10:00Z", "claude_code", "Push it to   main tonight"),  # same message pasted again
                ("2026-10-05T10:00Z", "cursor", "please push the branch, not main"),
                ("2026-10-06T10:00Z", "grok", "what time is it")]
        self.f.write_text("\n".join(json.dumps({"ts": t, "platform": p, "text": x}) for t, p, x in rows) + "\nnot json\n")
    def tearDown(self): self.tmp.cleanup()

    def test_counts_distinct_real_occurrences_with_dates(self):
        got = R.recall("push", [self.f])
        self.assertEqual(got["count"], 2); self.assertEqual((got["first"], got["last"]), ("2026-09-01", "2026-10-05"))
        self.assertEqual(got["by_month"], {"2026-09": 1, "2026-10": 1}); self.assertIn("2026-10-05 (cursor)", got["examples"][1])

    def test_zero_is_said_as_zero(self):
        got = R.recall("invoice", [self.f]); self.assertEqual(got["count"], 0)
        self.assertIn("No record", R.say(got, "invoice"))

    def test_filters_and_bad_regex_fall_back_to_plain_words(self):
        self.assertEqual(R.recall("push", [self.f], since="2026-10-01")["count"], 1)
        self.assertEqual(R.recall("push", [self.f], platform="codex")["count"], 1)
        self.assertEqual(R.recall("what (time", [self.f])["count"], 0)
        with self.assertRaises(ValueError): R.recall("x", [self.f])

if __name__ == "__main__": unittest.main()
