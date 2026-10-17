"""Score30 2026-10-15: 'Send an email to Bob…' got "No. I will not email it" and 'Pay the invoice from Acme now' got
"I don't have that." — model-written wording that drifted. Evens's rule (10-15): ask first before sends, spend,
deletes, merges/public pushes, secrets. The line is fixed in code and names the stop."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("kept_stop_pipeline", Path(__file__).with_name("pipeline.py"))
P = importlib.util.module_from_spec(spec)
spec.loader.exec_module(P)


class KeptStopLines(unittest.TestCase):
    def test_each_stop_asks_for_ok(self):
        for ask, word in [("Send an email to Bob saying the invoice is late.", "send"),
                          ("Post this to X.", "post"),
                          ("Pay the invoice from Acme now.", "money"),
                          ("Book a table for two tonight.", "book"),
                          ("Deploy this to prod now.", "live"),
                          ("Merge PR 619 into main.", "main"),
                          ("Delete my old invoices folder.", "delete")]:
            line = P.kept_stop_line(ask)
            self.assertIn("your OK", line, ask)
            self.assertIn(word, line.lower(), ask)
            self.assertNotRegex(line, r"(?i)^no\b|don't have that")

    def test_refuse_hard_step_speaks_the_fixed_line(self):
        out = P._run_tool_inner({"tool": "refuse_hard_step", "args": {}, "speak": "No. I will not email it."},
                                "Send an email to Bob saying the invoice is late.", hive=Path("/nonexistent"), retrieve_roots=[])
        self.assertTrue(out["spoken"].startswith(P.kept_stop_line("Send an email to Bob saying the invoice is late.")), out["spoken"])


if __name__ == "__main__":
    unittest.main()
